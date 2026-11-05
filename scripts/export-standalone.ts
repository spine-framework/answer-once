#!/usr/bin/env tsx
// CIL[BEGIN stable_id="~/scripts/export-standalone.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/scripts/export-standalone.ts"]
// CIL[DOC-MACRO purpose="Export a self-contained standalone repository for one custom app — frozen framework snapshot, app-owned copy allowlist, generated configs, and per-file digests"]
// CIL[DOC-RESPONSIBILITY responsibility="Read the app's manifest + standalone.config.json profile, copy the declared allowlist with permissions and safe symlinks, generate standalone package.json/package-lock.json/spine.config.json/netlify.toml, write .spine-export-manifest.json, and regenerate a frozen .spine-manifest.json over the output tree"]
// CIL[DOC-CONTEXT module="export" layer="tooling" related_files="scripts/checksum-manifest.mts,scripts/verify-manifest.mts,custom/apps/demo/standalone.config.json,netlify.toml,package.json"]
// CIL[DOC-CONTRACT inputs="--app <slug> --output <dir>; source monorepo tree" outputs="populated standalone directory + export manifest on stdout summary" errors="exit 1 on missing profile/manifest, unsafe symlink, non-empty destination, missing declared file" side_effects="writes <output> tree only; no network, npm, or DB access"]
// CIL[DOC-MICRO logic_summary="Nothing is hardcoded to demo: every path decision comes from the app's standalone.config.json copy allowlist. Symlinks are preserved only when their resolved target lands inside the output tree — anything escaping fails the export rather than silently dereferencing into monorepo code. Generated spine.config.json never maps system_admin to the app" notable_decisions="package-lock is copied verbatim with only the root name rewritten — dependency pruning by guesswork is prohibited; netlify.toml strips custom_* scheduled-function blocks then appends the exported app's profile-declared schedules; export manifest records git HEAD plus dirty state so a dirty tree is never labeled identical to HEAD"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  collectProtectedFiles,
  hashEntry,
  computeTreeDigest,
} from './checksum-manifest.mts'
// CIL[END stable_id="~/scripts/export-standalone.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/scripts/export-standalone.ts:types:block" type="block" identity="types" parent="~/scripts/export-standalone.ts"]
// CIL[DOC-MACRO purpose="Profile and collected-file shapes"]
interface CopyProfile {
  framework_dirs: string[]
  framework_files: string[]
  app_dirs: string[]
  custom_migrations: string[]
  custom_tests: string[]
  config_files: string[]
  root_scripts: string[]
  bin: string[]
  /** dest rel path (e.g. "README.md") → source rel path in the monorepo. For files that must land somewhere other than their source location. */
  file_map?: Record<string, string>
}

interface ScheduledFunctionDecl {
  name: string
  schedule: string
}

interface StandaloneProfile {
  app_slug: string
  app_name: string
  copy: CopyProfile
  exclude_globs: string[]
  netlify?: {
    scheduled_functions?: ScheduledFunctionDecl[]
  }
  spine_config: {
    default_app: string
    default_role: string
    allow_url_override: boolean
    app_roles: string[]
    route_prefix: string
    account_strategy: string
    parent_account?: string
    allow_domain_join?: boolean
    branding?: {
      app_name?: string
      title?: string
      logo_url?: string
      favicon_url?: string
    }
    brands?: Record<string, unknown>
  }
  package: {
    name: string
    version?: string
    description?: string
    scripts: Record<string, string>
  }
}

interface CopiedFile {
  rel: string
  sha256: string
  symlink: boolean
}
// CIL[END stable_id="~/scripts/export-standalone.ts:types:block"]

// CIL[BEGIN stable_id="~/scripts/export-standalone.ts:helpers:block" type="block" identity="helpers" parent="~/scripts/export-standalone.ts"]
// CIL[DOC-MACRO purpose="Small pure helpers — fail, JSON loading, glob matching, hashing"]
function fail(msg: string): never {
  console.error(`\n❌ export-standalone: ${msg}`)
  process.exit(1)
}

function loadJson(file: string, what: string): any {
  let raw: string
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch {
    fail(`${what} not found: ${file}`)
  }
  try {
    return JSON.parse(raw)
  } catch (err: any) {
    fail(`${what} is not valid JSON (${file}): ${err.message}`)
  }
}

/** Minimal glob matcher supporting `**`, `*`, and literals — no deps. */
function globToRegex(glob: string): RegExp {
  // Tokenize on `**` first so single-star segments never see it.
  const parts = glob.split('**').map(seg =>
    seg
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]')
  )
  return new RegExp(`^${parts.join('.*')}$`)
}

function sha256File(abs: string): string {
  return `sha256:${createHash('sha256').update(fs.readFileSync(abs)).digest('hex')}`
}

function sha256Text(text: string): string {
  return `sha256:${createHash('sha256').update(text, 'utf8').digest('hex')}`
}
// CIL[END stable_id="~/scripts/export-standalone.ts:helpers:block"]

// CIL[BEGIN stable_id="~/scripts/export-standalone.ts:walk:function" type="function" identity="walkDir" parent="~/scripts/export-standalone.ts"]
// CIL[DOC-MACRO purpose="Recursively enumerate files under a directory, honoring exclude globs"]
// CIL[DOC-CONTRACT inputs="dirAbs, rootAbs (for rel computation), exclude regexes" outputs="array of {rel, abs, symlink}" errors="throws on unreadable dir" side_effects="reads filesystem"]
function walkDir(
  dirAbs: string,
  rootAbs: string,
  excludes: RegExp[],
  out: { rel: string; abs: string; symlink: boolean }[] = [],
): { rel: string; abs: string; symlink: boolean }[] {
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
// CIL[END stable_id="~/scripts/export-standalone.ts:walk:function"]

// CIL[BEGIN stable_id="~/scripts/export-standalone.ts:collect:function" type="function" identity="collectCopyList" parent="~/scripts/export-standalone.ts"]
// CIL[DOC-MACRO purpose="Resolve the profile copy allowlist into a concrete file list"]
// CIL[DOC-CONTRACT inputs="srcRoot, profile (incl. optional copy.file_map dest→source renames)" outputs="deduped sorted file list keyed by destination rel path" errors="fails on missing declared path, missing file_map source, or unsafe file_map destination" side_effects="reads filesystem"]
function collectCopyList(srcRoot: string, profile: StandaloneProfile) {
  const excludes = profile.exclude_globs.map(globToRegex)
  const seen = new Map<string, { rel: string; abs: string; symlink: boolean }>()

  const addFile = (rel: string) => {
    const abs = path.join(srcRoot, rel)
    if (!fs.existsSync(abs)) fail(`declared copy path does not exist: ${rel}`)
    const lst = fs.lstatSync(abs)
    seen.set(rel, { rel, abs, symlink: lst.isSymbolicLink() })
  }
  const addDir = (rel: string) => {
    const abs = path.join(srcRoot, rel)
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
      fail(`declared copy directory does not exist: ${rel}`)
    }
    for (const e of walkDir(abs, srcRoot, excludes)) seen.set(e.rel, e)
  }

  for (const d of profile.copy.framework_dirs) addDir(d)
  for (const f of profile.copy.framework_files) addFile(f)
  for (const d of profile.copy.app_dirs) addDir(d)
  for (const prefix of profile.copy.custom_migrations) {
    const dir = path.join(srcRoot, 'custom/migrations')
    const matches = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((n) => n.startsWith(`${prefix}_`) && n.endsWith('.sql'))
      : []
    if (matches.length === 0) fail(`custom migration prefix "${prefix}" matched no files in custom/migrations/`)
    for (const m of matches) addFile(`custom/migrations/${m}`)
  }
  for (const t of profile.copy.custom_tests) {
    const abs = path.join(srcRoot, t)
    if (!fs.existsSync(abs)) fail(`declared custom test path does not exist: ${t}`)
    if (fs.statSync(abs).isDirectory()) addDir(t)
    else addFile(t)
  }
  for (const f of profile.copy.config_files) {
    if (fs.existsSync(path.join(srcRoot, f))) addFile(f)
    else console.log(`  ○ optional config ${f} absent — skipped`)
  }
  for (const f of profile.copy.root_scripts) addFile(f)
  for (const f of profile.copy.bin) {
    if (fs.existsSync(path.join(srcRoot, f))) addFile(f)
    else console.log(`  ○ optional bin ${f} absent — skipped`)
  }
  for (const [dest, src] of Object.entries(profile.copy.file_map ?? {})) {
    if (path.isAbsolute(dest) || dest.split('/').includes('..')) {
      fail(`file_map destination must be a safe relative path inside the export: ${dest}`)
    }
    const abs = path.join(srcRoot, src)
    if (!fs.existsSync(abs)) fail(`file_map source does not exist: ${src}`)
    seen.set(dest, { rel: dest, abs, symlink: fs.lstatSync(abs).isSymbolicLink() })
  }

  return [...seen.values()].sort((a, b) => Buffer.compare(Buffer.from(a.rel), Buffer.from(b.rel)))
}
// CIL[END stable_id="~/scripts/export-standalone.ts:collect:function"]

// CIL[BEGIN stable_id="~/scripts/export-standalone.ts:netlify:function" type="function" identity="generateNetlifyToml" parent="~/scripts/export-standalone.ts"]
// CIL[DOC-MACRO purpose="Generate standalone netlify.toml — framework blocks plus the selected app's declared schedules, no sibling-app cron"]
// CIL[DOC-CONTRACT inputs="root netlify.toml text, profile-declared scheduled functions" outputs="toml text" errors="none — names/schedules are pre-validated by validateScheduledFunctions" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Drops [functions.\"custom_*\"] sections (app-scheduled functions) and their immediately preceding comment block; keeps framework timeouts, dev block, redirects; appends the exported app's declared [functions.\"<name>\"] schedule sections" notable_decisions="text-level section stripping — no TOML dep; schedules come from the app profile, not inferred from the monorepo config, so sibling apps' schedules never leak"]
export function generateNetlifyToml(srcToml: string, scheduled: ScheduledFunctionDecl[] = []): string {
  const lines = srcToml.split('\n')
  const out: string[] = []
  let skipping = false
  let pendingComments: string[] = []

  const flushComments = () => { out.push(...pendingComments); pendingComments = [] }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('#') || trimmed === '') {
      if (!skipping) pendingComments.push(line)
      continue
    }
    const isSection = trimmed.startsWith('[')
    if (isSection) {
      skipping = /^\[functions\."custom_/.test(trimmed)
      if (skipping) { pendingComments = []; continue }
    }
    if (skipping) continue
    flushComments()
    out.push(line)
  }
  let toml = out.join('\n').replace(/\n{3,}/g, '\n\n')
  if (scheduled.length > 0) {
    const sections = scheduled
      .map((s) => `# Scheduled function declared by the app profile\n[functions."${s.name}"]\n  schedule = "${s.schedule}"`)
      .join('\n\n')
    toml = `${toml.replace(/\s+$/, '')}\n\n${sections}\n`
  }
  return toml
}

// CIL[DOC-MACRO purpose="Validate profile-declared scheduled functions against the export allowlist and generated TOML"]
// CIL[DOC-CONTRACT inputs="srcRoot, profile, generated toml text" outputs="deduped schedule list" errors="fails on duplicate names, unsafe section names, names that shadow framework function sections, or names with no exported app function file" side_effects="reads filesystem"]
// CIL[DOC-MICRO logic_summary="A schedule is only valid when <name>.ts exists inside an exported app_dir's functions/ directory — the flat Netlify function name equals the file basename" notable_decisions="charset is restricted to [a-zA-Z0-9_-] so a name can never break out of the quoted TOML key or forge a section"]
const SCHEDULE_NAME_RE = /^[a-zA-Z0-9_-]+$/

function validateScheduledFunctions(
  srcRoot: string,
  profile: StandaloneProfile,
  toml: string,
): ScheduledFunctionDecl[] {
  const declared = profile.netlify?.scheduled_functions ?? []
  const seen = new Set<string>()
  const appFunctionNames = new Set<string>()
  for (const dir of profile.copy.app_dirs) {
    const fnDir = path.join(srcRoot, dir, 'functions')
    if (!fs.existsSync(fnDir)) continue
    for (const n of fs.readdirSync(fnDir)) {
      if (n.endsWith('.ts') && !n.endsWith('.test.ts') && !n.endsWith('-test.ts')) {
        appFunctionNames.add(n.slice(0, -3))
      }
    }
  }
  for (const s of declared) {
    if (!s || typeof s.name !== 'string' || typeof s.schedule !== 'string' || !s.schedule.trim()) {
      fail(`netlify.scheduled_functions entries require { name, schedule }`)
    }
    if (!SCHEDULE_NAME_RE.test(s.name)) {
      fail(`netlify.scheduled_functions name "${s.name}" is not a safe function name (allowed: a-zA-Z0-9_-)`)
    }
    if (seen.has(s.name)) {
      fail(`netlify.scheduled_functions declares "${s.name}" twice`)
    }
    seen.add(s.name)
    if (!appFunctionNames.has(s.name)) {
      fail(`netlify.scheduled_functions "${s.name}" has no exported function file — expected ${s.name}.ts under an app functions/ directory`)
    }
    if (new RegExp(`\\[functions\\."${s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\]`).test(toml)) {
      fail(`netlify.scheduled_functions "${s.name}" shadows a function section already present in netlify.toml`)
    }
  }
  return declared
}
// CIL[END stable_id="~/scripts/export-standalone.ts:netlify:function"]

// CIL[BEGIN stable_id="~/scripts/export-standalone.ts:main:function" type="function" identity="main" parent="~/scripts/export-standalone.ts"]
// CIL[DOC-MACRO purpose="CLI entry — orchestrate copy, config generation, and manifest writing"]
// CIL[DOC-CONTRACT inputs="argv --app <slug> --output <dir>" outputs="exit 0 standalone tree written" errors="exit 1 usage/missing/unsafe" side_effects="writes output dir"]
function main(): void {
  const args = process.argv.slice(2)
  const appIdx = args.indexOf('--app')
  const outIdx = args.indexOf('--output')
  const appSlug = appIdx >= 0 ? args[appIdx + 1] : undefined
  const output = outIdx >= 0 ? args[outIdx + 1] : undefined
  if (!appSlug || !output) {
    console.error('usage: tsx scripts/export-standalone.ts --app <slug> --output <dir>')
    process.exit(2)
  }

  const srcRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const outRoot = path.resolve(output)
  if (outRoot === srcRoot || outRoot.startsWith(srcRoot + path.sep)) {
    fail('output directory must not be inside the source monorepo')
  }
  if (fs.existsSync(outRoot) && fs.readdirSync(outRoot).length > 0) {
    fail(`output directory exists and is not empty: ${outRoot} — refusing to merge into unknown content`)
  }
  fs.mkdirSync(outRoot, { recursive: true })

  const appDir = path.join(srcRoot, 'custom/apps', appSlug)
  const manifest = loadJson(path.join(appDir, 'manifest.json'), 'app manifest')
  const profile = loadJson(path.join(appDir, 'standalone.config.json'), 'standalone profile') as StandaloneProfile
  if (profile.app_slug !== appSlug) {
    fail(`standalone.config.json app_slug "${profile.app_slug}" does not match --app "${appSlug}"`)
  }

  console.log(`\n📦 Exporting standalone: ${appSlug} → ${outRoot}\n`)

  // 1. Copy the allowlist
  const files = collectCopyList(srcRoot, profile)
  const copied: CopiedFile[] = []
  const safeSymlinks: { path: string; target: string }[] = []

  for (const f of files) {
    const dest = path.join(outRoot, f.rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    if (f.symlink) {
      const target = fs.readlinkSync(f.abs)
      const resolved = path.resolve(path.dirname(f.abs), target)
      const outResolved = path.resolve(path.dirname(dest), target)
      if (!outResolved.startsWith(outRoot + path.sep) && outResolved !== outRoot) {
        fail(`unsafe symlink: ${f.rel} → ${target} resolves outside the exported tree`)
      }
      fs.symlinkSync(target, dest)
      safeSymlinks.push({ path: f.rel, target })
      copied.push({ rel: f.rel, sha256: `sha256:${createHash('sha256').update(`symlink:${target}`).digest('hex')}`, symlink: true })
    } else {
      fs.copyFileSync(f.abs, dest)
      fs.chmodSync(dest, fs.statSync(f.abs).mode)
      copied.push({ rel: f.rel, sha256: sha256File(f.abs), symlink: false })
    }
  }
  console.log(`  ✓ copied ${copied.length} files (${safeSymlinks.length} symlinks preserved)`)

  // 2. Generated package.json — exact dep set from the monorepo (no pruning)
  const srcPkg = loadJson(path.join(srcRoot, 'package.json'), 'source package.json')
  const outPkg = {
    name: profile.package.name,
    version: profile.package.version ?? '0.1.0',
    private: true,
    type: 'module',
    description: profile.package.description ?? `${appSlug} standalone`,
    scripts: profile.package.scripts,
    dependencies: srcPkg.dependencies ?? {},
    devDependencies: srcPkg.devDependencies ?? {},
  }
  const outPkgText = JSON.stringify(outPkg, null, 2) + '\n'
  fs.writeFileSync(path.join(outRoot, 'package.json'), outPkgText)

  // 3. package-lock.json — verbatim lock tree, root name rewritten
  const lock = loadJson(path.join(srcRoot, 'package-lock.json'), 'package-lock.json')
  lock.name = profile.package.name
  if (lock.packages?.['']) lock.packages[''].name = profile.package.name
  fs.writeFileSync(path.join(outRoot, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n')

  // 4. spine.config.json — app-only instance config (never maps system_admin)
  const sc = profile.spine_config
  const appEntry: Record<string, any> = {
    roles: sc.app_roles,
    default_role: sc.default_role,
    path: sc.route_prefix,
    enabled: true,
    account_strategy: sc.account_strategy,
  }
  if (sc.parent_account) appEntry.parent_account = sc.parent_account
  if (sc.allow_domain_join !== undefined) appEntry.allow_domain_join = sc.allow_domain_join
  const byRole: Record<string, string> = {}
  for (const role of sc.app_roles) byRole[role] = sc.default_app
  const spineConfig = {
    ...(sc.branding ? { branding: sc.branding } : {}),
    ...(sc.brands ? { brands: sc.brands } : {}),
    registration: {
      default_app: sc.default_app,
      default_role: sc.default_role,
      allow_url_override: sc.allow_url_override,
      default_app_by_role: byRole,
      apps: { [sc.default_app]: appEntry },
    },
  }
  const spineConfigText = JSON.stringify(spineConfig, null, 2) + '\n'
  fs.writeFileSync(path.join(outRoot, 'spine.config.json'), spineConfigText)

  // 5. netlify.toml — framework blocks, sibling-app schedules stripped,
  //    this app's declared schedules appended
  const srcToml = fs.readFileSync(path.join(srcRoot, 'netlify.toml'), 'utf8')
  const strippedToml = generateNetlifyToml(srcToml)
  const scheduled = validateScheduledFunctions(srcRoot, profile, strippedToml)
  const netlifyText = generateNetlifyToml(srcToml, scheduled)
  fs.writeFileSync(path.join(outRoot, 'netlify.toml'), netlifyText)
  if (scheduled.length > 0) {
    console.log(`  ✓ scheduled functions: ${scheduled.map((s) => `${s.name} (${s.schedule})`).join(', ')}`)
  }

  // 6. Frozen .spine-manifest.json over the OUTPUT tree
  const protectedEntries = collectProtectedFiles(outRoot, ['bin'])
  const pairs = protectedEntries.map((e) => {
    const abs = e.symlink ? e.abs : e.abs
    return [e.rel, hashEntry(e)] as const
  })
  const filesMap: Record<string, string> = {}
  for (const [rel, hash] of pairs) filesMap[rel] = hash
  const spineManifest = {
    format_version: 1,
    frozen: true,
    framework_version: srcPkg.version ?? null,
    source_commit: null,
    tree_digest: computeTreeDigest(pairs),
    node: '>=22.13.0',
    npm: '>=10.0.0',
    files: filesMap,
  }
  fs.writeFileSync(path.join(outRoot, '.spine-manifest.json'), JSON.stringify(spineManifest, null, 2) + '\n')

  // 7. .spine-export-manifest.json — provenance + complete inventory
  const generatedFiles = {
    'package.json': sha256Text(outPkgText),
    'package-lock.json': sha256File(path.join(outRoot, 'package-lock.json')),
    'spine.config.json': sha256Text(spineConfigText),
    'netlify.toml': sha256Text(netlifyText),
    '.spine-manifest.json': sha256File(path.join(outRoot, '.spine-manifest.json')),
  }
  const frameworkMigrations = fs.existsSync(path.join(outRoot, '.framework/migrations'))
    ? fs.readdirSync(path.join(outRoot, '.framework/migrations')).filter((n) => n.endsWith('.sql')).sort()
    : []
  const customMigrations = fs.existsSync(path.join(outRoot, 'custom/migrations'))
    ? fs.readdirSync(path.join(outRoot, 'custom/migrations')).filter((n) => n.endsWith('.sql')).sort()
    : []
  // Provenance — a dirty working tree must never be presented as identical
  // to HEAD: record both so an install can be traced back to real source.
  const git = (cmd: string[]): string | null => {
    try {
      return execFileSync('git', cmd, { cwd: srcRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    } catch {
      return null
    }
  }
  const sourceHead = git(['rev-parse', 'HEAD'])
  const statusText = git(['status', '--porcelain'])
  const dirtyFiles = statusText === null || statusText === ''
    ? []
    : statusText.split('\n').filter((l) => l.trim().length > 0)
  const sourceFilesDigest = computeTreeDigest(copied.map((c) => [c.rel, c.sha256] as const))

  const exportManifest = {
    format_version: 1,
    app_slug: appSlug,
    app_name: profile.app_name,
    exported_at: new Date().toISOString(),
    source_root: srcRoot,
    source_tree_digest: spineManifest.tree_digest,
    source: {
      head: sourceHead,
      dirty: dirtyFiles.length > 0,
      dirty_file_count: dirtyFiles.length,
      status_digest: statusText === null ? null : sha256Text(statusText),
      exported_files_digest: sourceFilesDigest,
    },
    scheduled_functions: scheduled,
    node: process.version,
    npm_baseline: '>=10.0.0',
    file_count: copied.length,
    files: Object.fromEntries(copied.map((c) => [c.rel, c.sha256])),
    safe_symlinks: safeSymlinks,
    generated: generatedFiles,
    migrations: { framework: frameworkMigrations, custom: customMigrations },
    seed_inventory: Array.isArray(manifest.seed) ? manifest.seed.map((s: any) => s.file) : [],
  }
  fs.writeFileSync(path.join(outRoot, '.spine-export-manifest.json'), JSON.stringify(exportManifest, null, 2) + '\n')

  const totalBytes = copied.filter((c) => !c.symlink)
    .reduce((sum, c) => sum + fs.statSync(path.join(outRoot, c.rel)).size, 0)
  console.log(`  ✓ generated package.json, package-lock.json, spine.config.json, netlify.toml`)
  console.log(`  ✓ .spine-manifest.json (${pairs.length} protected files, frozen)`)
  console.log(`  ✓ .spine-export-manifest.json`)
  console.log(`\n✅ Export complete: ${copied.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MB → ${outRoot}`)
}
// CIL[END stable_id="~/scripts/export-standalone.ts:main:function"]

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
