// CIL[BEGIN stable_id="~/.framework/cli/lib/project-files.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/lib/project-files.ts"]
// CIL[DOC-MACRO purpose="Framework-owned project fileset — collect files to vend, render netlify.toml/.gitignore, merge package.json, and write the frozen .spine-manifest.json"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the shared primitives for `init` (scaffold a new project) and `upgrade` (sync an installed project to a newer spine-framework) — always app-agnostic, driven by .framework/templates/project.json"]
// CIL[DOC-CONTEXT module="cli" layer="lib" related_files=".framework/templates/project.json,.framework/cli/commands/init.ts,.framework/cli/commands/upgrade.ts,scripts/checksum-manifest.mts"]
// CIL[DOC-CONTRACT inputs="pkgRoot (spine-framework package/monorepo root), projectRoot" outputs="file lists, rendered config text, frozen manifest" errors="throws on missing declared framework files" side_effects="writeFrozenManifest writes .spine-manifest.json; all other exports are pure"]
// CIL[DOC-MICRO logic_summary="collectFrameworkFiles mirrors export-standalone's collectCopyList semantics: excludes apply to walked dirs only, explicitly listed files bypass them. renderNetlifyToml treats [functions.\"custom_*\"] sections as app-owned: strip them from the framework source, re-append the project's existing custom_* sections verbatim" notable_decisions="framework never writes custom/, spine.config.json, .env, or netlify.toml custom_* sections — those belong to apps and the customer"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-NOTE type="design" content="Kept dependency-free of export-standalone.ts on purpose: the packager profile lives in .framework/templates/project.json so the framework never learns app specifics"]
// CIL[DOC-AUDIENCE audience="developer"]

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import {
  collectProtectedFiles,
  hashEntry,
  computeTreeDigest,
} from '../../../scripts/checksum-manifest.mts'
// CIL[END stable_id="~/.framework/cli/lib/project-files.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/project-files.ts:types:block" type="block" identity="types" parent="~/.framework/cli/lib/project-files.ts"]
// CIL[DOC-MACRO purpose="Project profile + collected-file shapes shared by init and upgrade"]
// CIL[DOC-CONTEXT module="cli" layer="lib" related_files=".framework/templates/project.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="ProjectProfile, CollectedFile interfaces" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="ProjectProfile mirrors templates/project.json keys; CollectedFile is the {rel, abs} copy unit" notable_decisions="one profile shape drives both scaffold and upgrade"]
// CIL[DOC-CONFIDENCE pass="first" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
export interface ProjectProfile {
  framework_dirs: string[]
  framework_files: string[]
  config_files: string[]
  root_scripts: string[]
  bin: string[]
  exclude_globs: string[]
  package_scripts: Record<string, string>
}

export interface CollectedFile {
  rel: string
  abs: string
  symlink: boolean
}
// CIL[END stable_id="~/.framework/cli/lib/project-files.ts:types:block"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/project-files.ts:globs_and_hashes:block" type="block" identity="globs_and_hashes" parent="~/.framework/cli/lib/project-files.ts"]
// CIL[DOC-MACRO purpose="Minimal `**`/`*`/`?` glob→regex matcher (export-standalone semantics) and sha256 file/text helpers"]
// CIL[DOC-CONTEXT module="cli" layer="lib" related_files=".framework/templates/project.json,scripts/checksum-manifest.mts"]
// CIL[DOC-CONTRACT inputs="glob: string; abs: string; text: string" outputs="RegExp; sha256 hex" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="globToRegex escapes literals then expands `**`→.* `*`→[^/]* `?`→[^/]; sha256 helpers feed both the frozen manifest and upgrade integrity checks" notable_decisions="no external glob dep — the exclude vocabulary is deliberately small"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]

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
// CIL[END stable_id="~/.framework/cli/lib/project-files.ts:globs_and_hashes:block"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/project-files.ts:collect:block" type="block" identity="collect" parent="~/.framework/cli/lib/project-files.ts"]
// CIL[DOC-MACRO purpose="Profile load + framework file collection — walked dirs honor excludes, listed files bypass them"]
// CIL[DOC-CONTRACT inputs="dirAbs: string, rootAbs: string, excludes: RegExp[], out: CollectedFile[], pkgRoot: string, profile: ProjectProfile" outputs="sorted CollectedFile[]" errors="throws listing missing required framework_dirs/framework_files/root_scripts" side_effects="none (read-only)"]
// CIL[DOC-CONTEXT module="cli" layer="lib" related_files=".framework/templates/project.json"]
// CIL[DOC-MICRO logic_summary="loadProjectProfile reads templates/project.json; collectFrameworkFiles walks declared dirs (honoring excludes) and appends declared files/locks verbatim, deduping by rel" notable_decisions="walked entries honor excludes; explicitly listed files bypass them — export-standalone parity"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
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
// CIL[END stable_id="~/.framework/cli/lib/project-files.ts:collect:block"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/project-files.ts:toml:block" type="block" identity="toml" parent="~/.framework/cli/lib/project-files.ts"]
// CIL[DOC-MACRO purpose="netlify.toml split/render — framework blocks owned upstream, [functions.\"custom_*\"] sections app-owned and preserved verbatim; .gitignore render"]
// CIL[DOC-CONTEXT module="cli" layer="lib" related_files="netlify.toml,.gitignore"]
// CIL[DOC-CONTRACT inputs="toml: string; frameworkToml: string; existingToml?: string; template: string" outputs="{ base, customSections } | rendered TOML | rendered gitignore" errors="none" side_effects="none (pure)"]
// CIL[DOC-MICRO logic_summary="splitNetlifyToml removes app-owned custom_* scheduled sections, comments attached, from framework source and returns them verbatim; renderNetlifyToml re-appends the project's own sections; renderGitignore ensures .env ignore lines" notable_decisions="custom_* ownership boundary is the core of app-independence — identical rendered output must not create a .bak upstream"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="invariant" content="splitNetlifyToml must stay idempotent — extracted sections attach preceding comments but never leading blank lines, or every upgrade writes a phantom diff"]
// CIL[DOC-AUDIENCE audience="developer"]
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
// CIL[END stable_id="~/.framework/cli/lib/project-files.ts:toml:block"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/project-files.ts:package_merge:block" type="block" identity="package_merge" parent="~/.framework/cli/lib/project-files.ts"]
// CIL[DOC-MACRO purpose="Merge framework-owned scripts/deps/pin into a project package.json — removes only deps the previous framework version owned"]
// CIL[DOC-CONTEXT module="cli" layer="lib" related_files="package.json,.spine-manifest.json"]
// CIL[DOC-CONTRACT inputs="opts: { existing, name, description, scripts, newDependencies, newDevDependencies, spineVersion, oldFrameworkDeps }" outputs="{ text, frameworkDeps }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Removes deps recorded in the old manifest's framework_dependencies, installs the new set, applies profile scripts, pins spine-framework exactly" notable_decisions="dep removal is scoped to previously framework-owned deps — customer-added deps/scripts always survive"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
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
  dependencies['spine-framework'] = opts.spineVersion

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
// CIL[END stable_id="~/.framework/cli/lib/project-files.ts:package_merge:block"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/project-files.ts:manifest:block" type="block" identity="manifest" parent="~/.framework/cli/lib/project-files.ts"]
// CIL[DOC-MACRO purpose="Write the frozen .spine-manifest.json — per-file hashes over the protected trees plus framework_version + framework_dependencies"]
// CIL[DOC-CONTEXT module="cli" layer="lib" related_files=".spine-manifest.json,scripts/checksum-manifest.mts"]
// CIL[DOC-CONTRACT inputs="opts: { projectRoot, frameworkVersion, frameworkDeps }" outputs=".spine-manifest.json written; {fileCount, treeDigest}" errors="none" side_effects="writes projectRoot/.spine-manifest.json"]
// CIL[DOC-MICRO logic_summary="Hashes every protected file and records framework_version + framework_dependencies so upgrade can detect local mods and owned deps" notable_decisions="manifest is the integrity contract — same hash inputs as scripts/checksum-manifest.mts verify"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
/** Write the frozen .spine-manifest.json for a project at the given framework version. */
export function writeFrozenManifest(opts: {
  projectRoot: string
  frameworkVersion: string
  frameworkDeps: string[]
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
  }
  fs.writeFileSync(
    path.join(projectRoot, '.spine-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  )
  return { fileCount: pairs.length, treeDigest: manifest.tree_digest }
}
// CIL[END stable_id="~/.framework/cli/lib/project-files.ts:manifest:block"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/project-files.ts:file_io:block" type="block" identity="file_io" parent="~/.framework/cli/lib/project-files.ts"]
// CIL[DOC-MACRO purpose="Copy collected files (mode-preserving, symlink safety-checked), sanitize dir names to npm package names, compare semvers"]
// CIL[DOC-CONTEXT module="cli" layer="lib" related_files=""]
// CIL[DOC-CONTRACT inputs="files: CollectedFile[], projectRoot: string, name: string, a: string, b: string" outputs="copied tree; sanitized name; -1|0|1" errors="throws when a source symlink resolves outside pkgRoot" side_effects="copyCollectedFiles writes + chmods files under projectRoot"]
// CIL[DOC-MICRO logic_summary="copyCollectedFiles resolves symlinks (rejecting escapes), preserves executable bits, creates parent dirs; sanitizePackageName lowercases and strips invalid chars; cmpSemver compares numeric triples" notable_decisions="symlink escape guard keeps packaged payload inside the project"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
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
// CIL[END stable_id="~/.framework/cli/lib/project-files.ts:file_io:block"]
