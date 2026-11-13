// framework never writes custom/, spine.config.json, .env, or netlify.toml custom_* sections — those belong to apps and the customer
// Kept dependency-free of export-standalone.ts on purpose: the packager profile lives in .framework/templates/project.json so the framework never learns app specifics

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import {
  collectProtectedFiles,
  hashEntry,
  computeTreeDigest,
} from '../../../scripts/checksum-manifest.mts'

export interface ProjectProfile {
  framework_dirs: string[]
  framework_files: string[]
  config_files: string[]
  root_scripts: string[]
  bin: string[]
  /**
   * Agent-facing assets init copies into the customer repo. Unlike the
   * categories above, these are NOT copied verbatim into a matching path —
   * each entry names a package `source`, a project `dest`, and a `merge`
   * mode handled by syncAgentFiles:
   *   framework-block — render the template, substitute {{SPINE_VERSION}},
   *     and merge only the marked framework block into dest (init writes the
   *     whole file; upgrade replaces the block between the markers and
   *     preserves everything else).
   *   dir-replace — copy the source directory tree to dest; on every run,
   *     `spine-*` subdirectories under dest are removed first, so framework
   *     skills are replaced wholesale while customer-owned sibling dirs
   *     (any name not starting with `spine-`) are left alone.
   */
  agent_files?: AgentFileEntry[]
  exclude_globs: string[]
  package_scripts: Record<string, string>
}

export interface AgentFileEntry {
  source: string
  dest: string
  merge: 'framework-block' | 'dir-replace'
}

export interface CollectedFile {
  rel: string
  abs: string
  symlink: boolean
}

// no external glob dep — the exclude vocabulary is deliberately small

/** Minimal glob matcher supporting `**`, `*`, and `?` — same semantics as export-standalone. */
export function globToRegex(glob: string): RegExp {
  const parts = glob.split('**').map(seg =>
    seg
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]')
  )
  return new RegExp(`^${parts.join('.*')}$`)
}

export function sha256File(abs: string): string {
  return `sha256:${createHash('sha256').update(fs.readFileSync(abs)).digest('hex')}`
}

export function sha256Text(text: string): string {
  return `sha256:${createHash('sha256').update(text, 'utf8').digest('hex')}`
}

// walked entries honor excludes; explicitly listed files bypass them — export-standalone parity
function walkDir(
  dirAbs: string,
  rootAbs: string,
  excludes: RegExp[],
  out: CollectedFile[] = [],
): CollectedFile[] {
  for (const dent of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    const abs = path.join(dirAbs, dent.name)
    const rel = path.relative(rootAbs, abs).split(path.sep).join('/')
    if (excludes.some((re) => re.test(rel))) continue
    if (dent.isDirectory()) walkDir(abs, rootAbs, excludes, out)
    else if (dent.isSymbolicLink()) out.push({ rel, abs, symlink: true })
    else if (dent.isFile()) out.push({ rel, abs, symlink: false })
  }
  return out
}

/** Load the framework's own project profile shipped at .framework/templates/project.json. */
export function loadProjectProfile(pkgRoot: string): ProjectProfile {
  const file = path.join(pkgRoot, '.framework/templates/project.json')
  return JSON.parse(fs.readFileSync(file, 'utf8')) as ProjectProfile
}

/**
 * Collect the framework-owned file set declared by the project profile.
 * Directories are walked with excludes; individually listed files bypass
 * excludes (so `.env.example` survives env-glob exclusions).
 * Missing `framework_dirs`/`framework_files`/`root_scripts` entries are fatal;
 * `config_files` and `bin` are optional (warn + skip).
 */
export function collectFrameworkFiles(pkgRoot: string, profile: ProjectProfile): CollectedFile[] {
  const excludes = profile.exclude_globs.map(globToRegex)
  const seen = new Map<string, CollectedFile>()
  const missing: string[] = []

  const addFile = (rel: string, required: boolean) => {
    const abs = path.join(pkgRoot, rel)
    if (!fs.existsSync(abs)) {
      if (required) missing.push(rel)
      else console.log(`  ○ optional ${rel} absent — skipped`)
      return
    }
    const lst = fs.lstatSync(abs)
    seen.set(rel, { rel, abs, symlink: lst.isSymbolicLink() })
  }
  const addDir = (rel: string) => {
    const abs = path.join(pkgRoot, rel)
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
      missing.push(rel)
      return
    }
    for (const e of walkDir(abs, pkgRoot, excludes)) seen.set(e.rel, e)
  }

  for (const d of profile.framework_dirs) addDir(d)
  for (const f of profile.framework_files) addFile(f, true)
  for (const f of profile.config_files) addFile(f, false)
  for (const f of profile.root_scripts) addFile(f, true)
  for (const f of profile.bin) addFile(f, false)

  if (missing.length > 0) {
    throw new Error(`framework package is missing declared files:\n  ${missing.join('\n  ')}`)
  }
  return [...seen.values()].sort((a, b) => Buffer.compare(Buffer.from(a.rel), Buffer.from(b.rel)))
}

// custom_* ownership boundary is the core of app-independence — identical rendered output must not create a .bak upstream
// splitNetlifyToml must stay idempotent — extracted sections attach preceding comments but never leading blank lines, or every upgrade writes a phantom diff
const CUSTOM_SECTION_RE = /^\[functions\."custom_/

/**
 * Split a netlify.toml into base content and app-owned [functions."custom_*"]
 * sections (each including its contiguous preceding comment block).
 */
export function splitNetlifyToml(toml: string): { base: string; customSections: string[] } {
  const lines = toml.split('\n')
  const base: string[] = []
  const customSections: string[] = []
  let skipping = false
  let pendingComments: string[] = []
  let current: string[] | null = null

  const flushSection = () => {
    if (current) customSections.push(current.join('\n').replace(/\s+$/, ''))
    current = null
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '' ) {
      if (!skipping && current === null) pendingComments.push(line)
      else current?.push(line)
      continue
    }
    if (trimmed.startsWith('#')) {
      if (!skipping && current === null) pendingComments.push(line)
      else current?.push(line)
      continue
    }
    if (trimmed.startsWith('[')) {
      if (current !== null) flushSection()
      skipping = CUSTOM_SECTION_RE.test(trimmed)
      if (skipping) {
        // Attach the immediately preceding comment block, but not blank lines —
        // rendering already separates sections, and blanks here would drift
        // on every round-trip.
        const comments = [...pendingComments]
        while (comments.length > 0 && comments[0].trim() === '') comments.shift()
        current = [...comments, line]
      } else {
        base.push(...pendingComments, line)
      }
      pendingComments = []
      continue
    }
    if (skipping) { current?.push(line); continue }
    base.push(...pendingComments, line)
    pendingComments = []
  }
  flushSection()
  return {
    base: base.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, ''),
    customSections,
  }
}

/**
 * Render a project netlify.toml: framework-owned blocks from the package,
 * app-owned [functions."custom_*"] sections preserved from the existing file.
 */
export function renderNetlifyToml(frameworkToml: string, existingToml?: string): string {
  const { base } = splitNetlifyToml(frameworkToml)
  const { customSections } = existingToml ? splitNetlifyToml(existingToml) : { customSections: [] }
  return customSections.length > 0
    ? `${base}\n\n${customSections.join('\n\n')}\n`
    : `${base}\n`
}

/** Render the project .gitignore from the packed template (templates/project/gitignore). */
export function renderGitignore(template: string): string {
  return template
    .split('\n')
    .filter((l) => l.trim() !== '.env.example')
    .join('\n')
}

// dep removal is scoped to previously framework-owned deps — customer-added deps/scripts always survive
export interface MergedPackageJson {
  text: string
  frameworkDeps: string[]
}

/**
 * Merge framework-owned content into a project package.json.
 * - scripts listed in the profile are written (framework-owned keys)
 * - deps listed in newFrameworkDeps are written verbatim
 * - a dep is removed only when the previous version owned it (present in
 *   prevFrameworkDeps) and the new version dropped it
 * - customer-added keys everywhere else are preserved
 */
export function mergePackageJson(opts: {
  existing?: Record<string, any>
  name: string
  version?: string
  description?: string
  scripts: Record<string, string>
  newDependencies: Record<string, string>
  newDevDependencies: Record<string, string>
  prevFrameworkDeps?: string[]
  spineVersion: string
}): MergedPackageJson {
  const prevOwned = new Set(opts.prevFrameworkDeps ?? [])
  const dependencies: Record<string, string> = { ...(opts.existing?.dependencies ?? {}) }
  const devDependencies: Record<string, string> = { ...(opts.existing?.devDependencies ?? {}) }

  for (const dep of prevOwned) {
    if (!opts.newDependencies[dep] && !opts.newDevDependencies[dep]) {
      delete dependencies[dep]
      delete devDependencies[dep]
    }
  }
  for (const [k, v] of Object.entries(opts.newDependencies)) dependencies[k] = v
  for (const [k, v] of Object.entries(opts.newDevDependencies)) devDependencies[k] = v
  const existingSpec = dependencies['spine-framework']
  dependencies['spine-framework'] =
    existingSpec && /^(file:|link:|workspace:|portal:)/.test(existingSpec)
      ? existingSpec
      : opts.spineVersion

  const frameworkDeps = [
    ...Object.keys(opts.newDependencies),
    ...Object.keys(opts.newDevDependencies),
    'spine-framework',
  ].sort()

  const pkg = {
    name: opts.existing?.name ?? opts.name,
    version: opts.existing?.version ?? opts.version ?? '0.1.0',
    private: true,
    type: 'module',
    ...(opts.existing?.description ?? opts.description
      ? { description: opts.existing?.description ?? opts.description }
      : {}),
    ...(opts.existing ?? {}),
    scripts: { ...(opts.existing?.scripts ?? {}), ...opts.scripts },
    dependencies,
    devDependencies,
  }
  // Re-assert generated fields over any copied `existing` keys above.
  pkg.private = true
  pkg.type = 'module'

  return { text: JSON.stringify(pkg, null, 2) + '\n', frameworkDeps }
}

/** Write the frozen .spine-manifest.json for a project at the given framework version. */
export function writeFrozenManifest(opts: {
  projectRoot: string
  frameworkVersion: string
  frameworkDeps: string[]
  agentFiles?: Record<string, string>
}): { fileCount: number; treeDigest: string } {
  const { projectRoot } = opts
  const entries = collectProtectedFiles(projectRoot, ['bin'], new Set(['.spine-manifest.json']))
  const pairs = entries.map((e) => [e.rel, hashEntry(e)] as const)
  const files: Record<string, string> = {}
  for (const [rel, hash] of pairs) files[rel] = hash
  const manifest = {
    format_version: 1,
    frozen: true,
    framework_version: opts.frameworkVersion,
    framework_dependencies: opts.frameworkDeps,
    source_commit: null,
    tree_digest: computeTreeDigest(pairs),
    node: '>=22.13.0',
    npm: '>=10.0.0',
    files,
    // Agent assets live outside `files` — see the agent-files block comment
    // above for why sealing them would break verify and upgrade.
    ...(opts.agentFiles ? { agent_files: opts.agentFiles } : {}),
  }
  fs.writeFileSync(
    path.join(projectRoot, '.spine-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  )
  return { fileCount: pairs.length, treeDigest: manifest.tree_digest }
}

/*
 * Agent asset sync — AGENTS.md framework block + .devin/skills/spine-*.
 *
 * Marker contract (upgrade.ts, doctor.ts, and tests depend on this format):
 *
 *   <!-- spine-framework:begin version=X.Y.Z -->
 *   ...framework-owned lines...
 *   <!-- spine-framework:end -->
 *
 * - The markers are HTML comments so they are inert in rendered markdown.
 * - `version=` on the begin marker lets doctor/doctor-style checks read the
 *   block's framework version without hashing.
 * - {{SPINE_VERSION}} anywhere in the template (including inside the begin
 *   marker) is substituted at copy time by renderAgentTemplate.
 * - Everything outside the markers is customer-owned and never rewritten.
 *
 * Manifest semantics: agent files are hashed into the manifest's
 * `agent_files` map — NOT `files`. Keeping them out of `files` matters:
 * verify-manifest treats `files` entries as sealed and unions their top-level
 * dirs into the protected trees, which would flag every customer file under
 * .devin/ as EXTRA and every edit to AGENTS.md's user section as MODIFIED.
 * `agent_files` records, per dest rel:
 *   - framework-block dests: sha256 of the extracted block (LF-normalized),
 *     so edits outside the markers do not count as drift.
 *   - dir-replace dests: sha256 of each file under `spine-*` subdirs.
 */

/** Begin marker: `<!-- spine-framework:begin version=X.Y.Z -->` (version optional on read). */
export const AGENTS_BEGIN_RE = /<!--\s*spine-framework:begin(?:\s+version=([^\s>]*))?\s*-->/
/** End marker: `<!-- spine-framework:end -->`. */
export const AGENTS_END_RE = /<!--\s*spine-framework:end\s*-->/

/** Substitute {{SPINE_VERSION}} placeholders in an agent template. */
export function renderAgentTemplate(template: string, version: string): string {
  return template.replace(/\{\{SPINE_VERSION\}\}/g, version)
}

/**
 * Locate the framework block inside newline-split lines.
 * Returns inclusive line indices, or null when no begin marker exists.
 * An unterminated begin marker spans only its own line — the orphan marker is
 * consumed on merge while the stale body below degrades into user content
 * (safe: user content is never deleted, only the framework block is managed).
 */
export function findAgentsBlock(lines: string[]): { begin: number; end: number } | null {
  let begin = -1
  for (let i = 0; i < lines.length; i++) {
    if (AGENTS_BEGIN_RE.test(lines[i])) { begin = i; break }
  }
  if (begin === -1) return null
  for (let i = begin + 1; i < lines.length; i++) {
    if (AGENTS_END_RE.test(lines[i])) return { begin, end: i }
  }
  return { begin, end: begin }
}

/** The framework block's declared version, or null when absent. */
export function agentsBlockVersion(text: string): string | null {
  const m = text.match(AGENTS_BEGIN_RE)
  return m ? (m[1] ?? null) : null
}

export interface AgentsMergeResult {
  text: string
  status: 'replaced' | 'prepended'
}

/**
 * Merge the rendered template's framework block into existing AGENTS.md text.
 * Replaces the marker-delimited span when markers exist (EOL preserved),
 * otherwise prepends the block ahead of the user's content.
 */
export function mergeAgentsFile(existing: string, renderedTemplate: string): AgentsMergeResult {
  const eol = existing.includes('\r\n') ? '\r\n' : '\n'
  const tplLines = renderedTemplate.split(/\r?\n/)
  const tplRange = findAgentsBlock(tplLines)
  if (!tplRange) {
    throw new Error('agent template is missing spine-framework begin/end markers')
  }
  const blockLines = tplLines.slice(tplRange.begin, tplRange.end + 1)

  const lines = existing.split(/\r?\n/)
  const range = findAgentsBlock(lines)
  if (!range) {
    const body = existing.replace(/^\s+/, '')
    return { text: `${blockLines.join(eol)}${eol}${eol}${body}`, status: 'prepended' }
  }
  const next = [...lines.slice(0, range.begin), ...blockLines, ...lines.slice(range.end + 1)]
  return { text: next.join(eol), status: 'replaced' }
}

export interface AgentSyncAction {
  rel: string
  action: 'written' | 'replaced' | 'prepended' | 'synced' | 'unchanged' | 'skipped'
  detail?: string
}

function copyDirRecursive(srcAbs: string, destAbs: string): void {
  fs.mkdirSync(destAbs, { recursive: true })
  for (const dent of fs.readdirSync(srcAbs, { withFileTypes: true })) {
    const src = path.join(srcAbs, dent.name)
    const dest = path.join(destAbs, dent.name)
    if (dent.isDirectory()) copyDirRecursive(src, dest)
    else if (dent.isFile()) {
      fs.copyFileSync(src, dest)
      fs.chmodSync(dest, fs.statSync(src).mode)
    }
  }
}

/**
 * Apply the profile's agent_files entries to a project tree.
 * `framework-block` renders + merges the template; `dir-replace` removes
 * `spine-*` subdirs under dest then copies the source tree in.
 * dryRun reports the same actions without writing.
 */
export function syncAgentFiles(opts: {
  pkgRoot: string
  projectRoot: string
  entries: AgentFileEntry[]
  version: string
  dryRun?: boolean
}): AgentSyncAction[] {
  const out: AgentSyncAction[] = []
  for (const entry of opts.entries ?? []) {
    const srcAbs = path.join(opts.pkgRoot, entry.source)
    const destAbs = path.join(opts.projectRoot, entry.dest)

    if (entry.merge === 'framework-block') {
      if (!fs.existsSync(srcAbs)) {
        out.push({ rel: entry.dest, action: 'skipped', detail: 'template absent from package' })
        continue
      }
      const rendered = renderAgentTemplate(fs.readFileSync(srcAbs, 'utf8'), opts.version)
      if (!fs.existsSync(destAbs)) {
        if (!opts.dryRun) {
          fs.mkdirSync(path.dirname(destAbs), { recursive: true })
          fs.writeFileSync(destAbs, rendered)
        }
        out.push({ rel: entry.dest, action: 'written' })
      } else {
        const existing = fs.readFileSync(destAbs, 'utf8')
        const merged = mergeAgentsFile(existing, rendered)
        if (merged.text === existing) {
          out.push({ rel: entry.dest, action: 'unchanged' })
        } else {
          if (!opts.dryRun) fs.writeFileSync(destAbs, merged.text)
          out.push({ rel: entry.dest, action: merged.status })
        }
      }
    } else if (entry.merge === 'dir-replace') {
      if (!fs.existsSync(srcAbs) || !fs.statSync(srcAbs).isDirectory()) {
        out.push({ rel: entry.dest, action: 'skipped', detail: 'source dir absent from package' })
        continue
      }
      // Framework owns only the spine-* subdirs of dest — remove them, then
      // copy the source tree in. Sibling dirs with any other name are
      // customer-owned and untouched.
      const removed = fs.existsSync(destAbs)
        ? fs.readdirSync(destAbs, { withFileTypes: true })
            .filter((d) => d.isDirectory() && d.name.startsWith('spine-'))
            .map((d) => d.name)
        : []
      if (!opts.dryRun) {
        for (const name of removed) {
          fs.rmSync(path.join(destAbs, name), { recursive: true, force: true })
        }
        copyDirRecursive(srcAbs, destAbs)
      }
      const detail = removed.length ? `removed spine-* dirs: ${removed.join(', ')}` : undefined
      out.push({ rel: entry.dest, action: 'synced', detail })
    } else {
      out.push({ rel: entry.dest, action: 'skipped', detail: `unknown merge mode '${entry.merge}'` })
    }
  }
  return out
}

/**
 * Hash the project's installed agent files for the manifest `agent_files` map.
 * framework-block → hash of the extracted block (LF-normalized, so EOL style
 * does not matter); dir-replace → one entry per file under `spine-*` subdirs.
 */
export function collectAgentFileHashes(
  projectRoot: string,
  entries: AgentFileEntry[],
): Record<string, string> {
  const hashes: Record<string, string> = {}
  for (const entry of entries ?? []) {
    const destAbs = path.join(projectRoot, entry.dest)
    if (entry.merge === 'framework-block') {
      if (!fs.existsSync(destAbs)) continue
      const lines = fs.readFileSync(destAbs, 'utf8').split(/\r?\n/)
      const range = findAgentsBlock(lines)
      if (!range) continue
      hashes[entry.dest] = sha256Text(lines.slice(range.begin, range.end + 1).join('\n') + '\n')
    } else if (entry.merge === 'dir-replace') {
      if (!fs.existsSync(destAbs)) continue
      const managed = fs.readdirSync(destAbs, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.startsWith('spine-'))
      for (const dir of managed) {
        const dirAbs = path.join(destAbs, dir.name)
        for (const f of walkDir(dirAbs, projectRoot, [])) {
          hashes[f.rel] = sha256File(f.abs)
        }
      }
    }
  }
  return hashes
}

/** Copy a collected file list into the project, preserving modes and safe symlinks. */
export function copyCollectedFiles(files: CollectedFile[], projectRoot: string): void {
  for (const f of files) {
    const dest = path.join(projectRoot, f.rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    if (f.symlink) {
      const target = fs.readlinkSync(f.abs)
      const outResolved = path.resolve(path.dirname(dest), target)
      if (!outResolved.startsWith(projectRoot + path.sep) && outResolved !== projectRoot) {
        throw new Error(`unsafe symlink: ${f.rel} → ${target} resolves outside the project tree`)
      }
      try { fs.rmSync(dest, { force: true }) } catch { /* absent */ }
      fs.symlinkSync(target, dest)
    } else {
      fs.copyFileSync(f.abs, dest)
      fs.chmodSync(dest, fs.statSync(f.abs).mode)
    }
  }
}

/** Sanitize a directory basename into a valid npm package name. */
export function sanitizePackageName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._~+-]+/g, '-')
    .replace(/^[._-]+/, '')
    .replace(/[._-]+$/, '')
  return cleaned || 'spine-project'
}

/** Compare two semver strings (numeric core + prerelease); returns -1/0/1. */
export function cmpSemver(a: string, b: string): number {
  const parse = (v: string) => {
    const [core, pre] = v.split('-', 2)
    const nums = core.split('.').map((n) => parseInt(n, 10) || 0)
    return { nums, pre: pre ?? null }
  }
  const pa = parse(a); const pb = parse(b)
  for (let i = 0; i < 3; i++) {
    if (pa.nums[i] !== pb.nums[i]) return pa.nums[i] < pb.nums[i] ? -1 : 1
  }
  if (pa.pre === pb.pre) return 0
  if (pa.pre === null) return 1
  if (pb.pre === null) return -1
  return pa.pre < pb.pre ? -1 : 1
}
