// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:module_header:module_header" type="module_header" identity="module_header" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Deterministic generator for .spine-manifest.json — sha256 manifest over protected source trees"]
// CIL[DOC-RESPONSIBILITY responsibility="Enumerate protected trees, hash every listed file, emit a frozen format_version:1 manifest with sorted paths and a tree digest"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts,scripts/build-manifest.sh,scripts/verify-integrity.sh,scripts/check-core-integrity.sh"]
// CIL[DOC-CONTRACT inputs="argv: <root> <output> [--include-dir <d>...]" outputs="manifest JSON file at <output>" errors="exit 2 usage, exit 1 unreadable root" side_effects="writes <output>, prints summary"]
// CIL[DOC-MICRO logic_summary="Walk .framework/, config/, scripts/ (plus --include-dir extras) with exclusion rules; sha256 file bytes (symlinks hash their link target); sort paths by UTF-8 bytes; write JSON with LF endings" notable_decisions="no timestamp field so repeated runs are byte-identical; no git dependency for enumeration so exported standalones work"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system-admin"]
// CIL[DOC-NOTE type="design" content="Protected-tree enumeration is deliberately git-independent: standalone exports may not be a git worktree. source_commit is null whenever the worktree is dirty or git is unavailable."]
// CIL[DOC-VECTOR type="context" content="Generated .spine-manifest.json is consumed by scripts/verify-manifest.mts via npm run verify and CI integrity gates"]
// CIL[DOC-VECTOR type="implementation_pattern" content="Sibling of scripts/verify-manifest.mts — both share PROTECTED_DIRS, isExcludedName and collectProtectedFiles from this module" status="ready"]
// CIL[END stable_id="~/scripts/checksum-manifest.mts:module_header:module_header"]

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:PROTECTED_DIRS:constant" type="constant" identity="PROTECTED_DIRS" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Default protected source trees hashed into the manifest"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare which root-level directories are covered by integrity hashing"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="none" outputs="readonly string[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Covers .framework (all extensions), config/, and scripts/; extra trees can be appended with --include-dir" notable_decisions="custom/ is intentionally excluded — app code is not framework-frozen"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const PROTECTED_DIRS: readonly string[] = ['.framework', 'config', 'scripts']
// CIL[END stable_id="~/scripts/checksum-manifest.mts:PROTECTED_DIRS:constant"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:EXCLUDED_DIR_NAMES:constant" type="constant" identity="EXCLUDED_DIR_NAMES" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Directory basenames skipped during protected-tree enumeration"]
// CIL[DOC-RESPONSIBILITY responsibility="Keep caches, dependency dirs and build output out of the manifest"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ReadonlySet<string>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exact-match directory names; matched at every level below a protected root" notable_decisions="the protected roots themselves are never excluded even though .framework is dot-prefixed"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const EXCLUDED_DIR_NAMES: ReadonlySet<string> = new Set([
  'node_modules',
  'dist',
  '.assembled',
  '.netlify',
  '.functions-assemble-tmp',
  '.frontend-assemble-tmp',
  '.vite',
  '.turbo',
  '.cache',
  'coverage',
  '__pycache__',
])
// CIL[END stable_id="~/scripts/checksum-manifest.mts:EXCLUDED_DIR_NAMES:constant"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:LOCKFILE_NAMES:constant" type="constant" identity="LOCKFILE_NAMES" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Lockfile basenames excluded as generated output artifacts"]
// CIL[DOC-RESPONSIBILITY responsibility="Prevent package-manager lockfiles inside protected trees (e.g. config/package-lock.json) from being treated as frozen source"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="config/package-lock.json,config/deno.lock"]
// CIL[DOC-CONTRACT inputs="none" outputs="ReadonlySet<string>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exact basenames for npm/yarn/pnpm/bun/deno lockfiles" notable_decisions="lockfiles are installer output, not authored source; hashing them would break manifests whenever deps re-resolve"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const LOCKFILE_NAMES: ReadonlySet<string> = new Set([
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lock',
  'bun.lockb',
  'deno.lock',
])
// CIL[END stable_id="~/scripts/checksum-manifest.mts:LOCKFILE_NAMES:constant"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:isExcludedName:function" type="function" identity="isExcludedName" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Decide whether a file basename is excluded from the manifest"]
// CIL[DOC-RESPONSIBILITY responsibility="Filter secret env files, editor/cache droppings, and lockfiles out of protected enumeration"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="name: file basename" outputs="boolean — true when excluded" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary=".env*/.xenv secret files are never hashed so local credentials cannot leak or differ across machines; .DS_Store and *.tsbuildinfo are churn-prone caches" notable_decisions=".xenv.example stays included — it is a tracked template, not a secret"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function isExcludedName(name: string): boolean {
  if (name === '.env' || name.startsWith('.env.')) return true
  if (name === '.xenv' || name === '.xenv.test') return true
  if (name === '.DS_Store' || name === 'Thumbs.db') return true
  if (name.endsWith('.tsbuildinfo')) return true
  // Generated by `tsc -b` (tsconfig.node.json composite emit) — output, not source
  if (name === 'vite.config.d.ts') return true
  if (LOCKFILE_NAMES.has(name)) return true
  return false
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:isExcludedName:function"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:ManifestEntry:interface" type="interface" identity="ManifestEntry" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="One enumerated protected file/symlink awaiting hashing"]
// CIL[DOC-RESPONSIBILITY responsibility="Carry the POSIX-relative path, absolute path and symlink flag through enumeration to hashing"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="rel is always POSIX-style so manifests are platform-stable" notable_decisions="symlinked directories are leaves, never traversed — prevents escaping the protected root"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ManifestEntry {
  /** POSIX-style path relative to root, e.g. ".framework/functions/kb.ts" */
  rel: string
  /** Absolute filesystem path */
  abs: string
  /** True when the entry itself is a symlink (hashed by link target, not content) */
  symlink: boolean
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:ManifestEntry:interface"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:collectProtectedFiles:function" type="function" identity="collectProtectedFiles" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Enumerate all hashable entries under the protected trees"]
// CIL[DOC-RESPONSIBILITY responsibility="Recursively walk each protected dir, apply exclusion rules, and return entries sorted by UTF-8 byte order"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="root: absolute project root; includeDirs: extra protected dirs (root-relative POSIX); excludeRels: rel paths to skip (e.g. the manifest itself)" outputs="ManifestEntry[] sorted by rel" errors="throws on unreadable directory" side_effects="reads filesystem"]
// CIL[DOC-MICRO logic_summary="Iterative DFS over lstat'd entries; symlinks recorded as leaves; sort uses Buffer.compare on UTF-8 so ordering is locale-independent" notable_decisions="missing protected dirs are skipped silently so the same code runs against partial exports"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function collectProtectedFiles(
  root: string,
  includeDirs: readonly string[] = [],
  excludeRels: ReadonlySet<string> = new Set(),
): ManifestEntry[] {
  const rootAbs = path.resolve(root)
  const dirs = [...PROTECTED_DIRS, ...includeDirs]
  const out: ManifestEntry[] = []

  for (const dir of dirs) {
    const dirAbs = path.join(rootAbs, dir)
    if (!fs.existsSync(dirAbs)) continue
    const stack: string[] = [dirAbs]

    while (stack.length > 0) {
      const current = stack.pop() as string
      for (const dent of fs.readdirSync(current, { withFileTypes: true })) {
        const abs = path.join(current, dent.name)
        const rel = path.relative(rootAbs, abs).split(path.sep).join('/')
        if (excludeRels.has(rel)) continue

        if (dent.isDirectory()) {
          if (EXCLUDED_DIR_NAMES.has(dent.name)) continue
          stack.push(abs)
        } else if (dent.isSymbolicLink()) {
          if (!isExcludedName(dent.name)) out.push({ rel, abs, symlink: true })
        } else if (dent.isFile()) {
          if (!isExcludedName(dent.name)) out.push({ rel, abs, symlink: false })
        }
        // sockets/fifos/etc are not hashable — skipped
      }
    }
  }

  out.sort((a, b) => Buffer.compare(Buffer.from(a.rel, 'utf8'), Buffer.from(b.rel, 'utf8')))
  return out
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:collectProtectedFiles:function"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:hashEntry:function" type="function" identity="hashEntry" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Compute the sha256 integrity hash for one manifest entry"]
// CIL[DOC-RESPONSIBILITY responsibility="Hash regular file bytes, or the symlink target text for links, returning a 'sha256:<hex>' value"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="entry: ManifestEntry" outputs="'sha256:<hex>' string" errors="throws on unreadable file" side_effects="reads file content"]
// CIL[DOC-MICRO logic_summary="Symlinks hash 'symlink:<raw readlink>' — the integrity of a link is its target, and this never reads outside the root" notable_decisions="the 'symlink:' domain prefix prevents a file whose bytes equal a link string from colliding"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function hashEntry(entry: ManifestEntry): string {
  const hash = createHash('sha256')
  if (entry.symlink) {
    hash.update('symlink:')
    hash.update(fs.readlinkSync(entry.abs))
  } else {
    hash.update(fs.readFileSync(entry.abs))
  }
  return `sha256:${hash.digest('hex')}`
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:hashEntry:function"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:topLevelDir:function" type="function" identity="topLevelDir" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Extract the first path segment of a manifest-relative path"]
// CIL[DOC-RESPONSIBILITY responsibility="Let the verifier union manifest-listed trees with the default protected dirs"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="rel: POSIX-relative path" outputs="first segment, or null for root-level files" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Split on '/' and return the head" notable_decisions="root-level listed files contribute no extra tree"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function topLevelDir(rel: string): string | null {
  const idx = rel.indexOf('/')
  return idx === -1 ? null : rel.slice(0, idx)
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:topLevelDir:function"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:getSourceCommit:function" type="function" identity="getSourceCommit" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Resolve source_commit: HEAD only when the worktree is clean"]
// CIL[DOC-RESPONSIBILITY responsibility="Run git rev-parse HEAD plus git status --porcelain; return the commit hash only if nothing (tracked or untracked) deviates, else null"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/checksum-manifest.mts"]
// CIL[DOC-CONTRACT inputs="root: project root; manifestRel: POSIX rel path of the manifest being written (excluded from the dirty check)" outputs="commit sha or null" errors="returns null when git is unavailable or not a repo" side_effects="spawns git subprocesses"]
// CIL[DOC-MICRO logic_summary="The manifest output path is filtered out of porcelain lines so consecutive manifest regenerations stay deterministic" notable_decisions="without the filter, a clean tree would emit HEAD on run 1 and null on run 2 once the manifest exists untracked"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getSourceCommit(root: string, manifestRel: string): string | null {
  try {
    const head = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const porcelain = execFileSync('git', ['status', '--porcelain'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const dirty = porcelain
      .split('\n')
      .map((line) => line.slice(3).trim().replace(/^"|"$/g, ''))
      .filter((p) => p.length > 0 && p !== manifestRel)
    return dirty.length === 0 ? head : null
  } catch {
    return null
  }
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:getSourceCommit:function"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:gitTrackedFiles:function" type="function" identity="gitTrackedFiles" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Resolve the set of git-index file paths for manifest filtering"]
// CIL[DOC-RESPONSIBILITY responsibility="Run git ls-files -z at root and return its paths as a Set; null when git/index is unavailable or empty"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/checksum-manifest.mts,scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="root: project root" outputs="Set of POSIX rel paths or null" errors="returns null when git is missing, root is not a repo, or the index is empty" side_effects="spawns a git subprocess"]
// CIL[DOC-MICRO logic_summary="The index (not the worktree) defines what a fresh clone will contain — ignored and unstaged-new files are absent" notable_decisions="empty index returns null so a bootstrap repo with no commits still produces a manifest"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function gitTrackedFiles(root: string): Set<string> | null {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--cached'], {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const rels = out.toString('utf8').split('\0').filter(Boolean)
    return rels.length > 0 ? new Set(rels) : null
  } catch {
    return null
  }
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:gitTrackedFiles:function"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:getFrameworkVersion:function" type="function" identity="getFrameworkVersion" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Resolve framework_version from package.json"]
// CIL[DOC-RESPONSIBILITY responsibility="Read <root>/package.json and return its version field; null when unreadable"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="package.json"]
// CIL[DOC-CONTRACT inputs="root: project root" outputs="version string or null" errors="returns null on missing/malformed package.json" side_effects="reads package.json"]
// CIL[DOC-MICRO logic_summary="Single JSON read; no .framework version file exists in this repo" notable_decisions="no version file check — package.json (name: spine-framework) is authoritative"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getFrameworkVersion(root: string): string | null {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
    return typeof pkg.version === 'string' ? pkg.version : null
  } catch {
    return null
  }
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:getFrameworkVersion:function"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:computeTreeDigest:function" type="function" identity="computeTreeDigest" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="Compute the tree_digest over the sorted path:hash list"]
// CIL[DOC-RESPONSIBILITY responsibility="sha256 over 'rel:hash' lines joined with LF and a trailing LF — order matches the sorted files map"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="files: sorted [rel, hash] pairs" outputs="'sha256:<hex>'" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Pure function — the verifier recomputes the same digest to detect manifest tampering" notable_decisions="trailing newline keeps the digest unambiguous for empty lists"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function computeTreeDigest(files: ReadonlyArray<readonly [string, string]>): string {
  const hash = createHash('sha256')
  for (const [rel, fileHash] of files) {
    hash.update(`${rel}:${fileHash}\n`)
  }
  return `sha256:${hash.digest('hex')}`
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:computeTreeDigest:function"]

// CIL[BEGIN stable_id="~/scripts/checksum-manifest.mts:main:function" type="function" identity="main" parent="~/scripts/checksum-manifest.mts"]
// CIL[DOC-MACRO purpose="CLI entry — parse args, hash protected trees, write .spine-manifest.json"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate argv, build the manifest object, serialize with sorted keys and LF endings, print a summary"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/build-manifest.sh,package.json"]
// CIL[DOC-CONTRACT inputs="argv: <root> <output> [--include-dir <d>...]" outputs="exit 0 with manifest written" errors="exit 2 usage error; exit 1 on fs/git failures" side_effects="writes <output>, stdout summary"]
// CIL[DOC-MICRO logic_summary="frozen is always true on generated manifests; node/npm baselines are stamped from the plan G baseline (node >=22.13.0, npm >=10.0.0); collected entries are filtered to git-index files so ignored/untracked scratch files can never produce MISSING failures on fresh clones" notable_decisions="no timestamp — determinism is verified by running the generator twice and diffing; filtering happens in main only because export-standalone shares collectProtectedFiles on a pre-commit output tree"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function main(): void {
  const args = process.argv.slice(2)
  const positional: string[] = []
  const includeDirs: string[] = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--include-dir') {
      const dir = args[++i]
      if (!dir) {
        console.error('checksum-manifest: --include-dir requires a value')
        process.exit(2)
      }
      includeDirs.push(dir)
    } else if (arg.startsWith('--')) {
      console.error(`checksum-manifest: unknown flag ${arg}`)
      process.exit(2)
    } else {
      positional.push(arg)
    }
  }

  if (positional.length !== 2) {
    console.error('usage: checksum-manifest.mts <root> <output> [--include-dir <d>...]')
    process.exit(2)
  }

  const root = path.resolve(positional[0])
  const output = path.resolve(positional[1])

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`checksum-manifest: root is not a directory: ${root}`)
    process.exit(1)
  }

  const extraDirs: string[] = []
  for (const dir of includeDirs) {
    const rel = path.relative(root, path.resolve(root, dir)).split(path.sep).join('/')
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      console.error(`checksum-manifest: --include-dir escapes root: ${dir}`)
      process.exit(2)
    }
    extraDirs.push(rel)
  }

  const manifestRel = path.relative(root, output).split(path.sep).join('/')
  const excludeRels = new Set<string>([manifestRel])

  const tracked = gitTrackedFiles(root)
  const collected = collectProtectedFiles(root, extraDirs, excludeRels)
  const entries = tracked === null
    ? collected
    : collected.filter((entry) => tracked.has(entry.rel))
  const pairs: Array<readonly [string, string]> = entries.map(
    (entry) => [entry.rel, hashEntry(entry)] as const,
  )

  const files: Record<string, string> = {}
  for (const [rel, hash] of pairs) files[rel] = hash

  const manifest = {
    format_version: 1,
    frozen: true,
    framework_version: getFrameworkVersion(root),
    source_commit: getSourceCommit(root, manifestRel),
    tree_digest: computeTreeDigest(pairs),
    node: '>=22.13.0',
    npm: '>=10.0.0',
    files,
  }

  fs.writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  if (tracked !== null && collected.length !== entries.length) {
    console.log(`  untracked files skipped: ${collected.length - entries.length}`)
  }
  console.log(`  manifest: ${manifestRel}`)
  console.log(`  files hashed: ${pairs.length}`)
  console.log(`  tree_digest: ${manifest.tree_digest}`)
  console.log(`  source_commit: ${manifest.source_commit ?? 'null (dirty worktree or no git)'}`)
}
// CIL[END stable_id="~/scripts/checksum-manifest.mts:main:function"]

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
