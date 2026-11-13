
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  PROTECTED_DIRS,
  collectProtectedFiles,
  computeTreeDigest,
  hashEntry,
  topLevelDir,
} from './checksum-manifest.mts'

interface Failure {
  kind:
    | 'MISSING'
    | 'MODIFIED'
    | 'EXTRA'
    | 'UNSAFE_SYMLINK'
    | 'TYPE_CHANGED'
    | 'MALFORMED_ENTRY'
    | 'MANIFEST_DIGEST_MISMATCH'
  rel: string
}

const HASH_RE = /^sha256:[0-9a-f]{64}$/

function isInsideRoot(rootAbs: string, resolved: string): boolean {
  const rel = path.relative(rootAbs, resolved)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function loadManifest(manifestPath: string): { manifest: Record<string, unknown>; files: Record<string, string> } {
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ manifest not found: ${manifestPath}`)
    console.error('   run npm run manifest to generate it')
    process.exit(1)
  }

  let raw: string
  try {
    raw = fs.readFileSync(manifestPath, 'utf8')
  } catch (err) {
    console.error(`❌ manifest unreadable: ${(err as Error).message}`)
    process.exit(1)
  }

  if (raw.trim() === '') {
    console.error(`❌ manifest is empty: ${manifestPath}`)
    process.exit(1)
  }

  let manifest: Record<string, unknown>
  try {
    manifest = JSON.parse(raw)
  } catch (err) {
    console.error(`❌ manifest is not valid JSON: ${(err as Error).message}`)
    process.exit(1)
  }

  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest)) {
    console.error('❌ manifest root is not an object')
    process.exit(1)
  }

  if (manifest.format_version !== 1) {
    console.error(`❌ unknown manifest format_version: ${JSON.stringify(manifest.format_version)} (expected 1)`)
    process.exit(1)
  }

  const files = manifest.files
  if (files === null || typeof files !== 'object' || Array.isArray(files) || Object.keys(files).length === 0) {
    console.error('❌ manifest declares no files — nothing to verify')
    process.exit(1)
  }

  return { manifest, files: files as Record<string, string> }
}

function verifyListedFiles(rootAbs: string, files: Record<string, string>): Failure[] {
  const failures: Failure[] = []
  const rels = Object.keys(files).sort((a, b) =>
    Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8')),
  )

  for (const rel of rels) {
    const expected = files[rel]
    const abs = path.join(rootAbs, rel)

    if (!HASH_RE.test(expected)) {
      failures.push({ kind: 'MALFORMED_ENTRY', rel })
      continue
    }

    let st: fs.Stats
    try {
      st = fs.lstatSync(abs)
    } catch {
      failures.push({ kind: 'MISSING', rel })
      continue
    }

    if (st.isSymbolicLink()) {
      let resolved: string
      try {
        resolved = fs.realpathSync(abs)
      } catch {
        failures.push({ kind: 'UNSAFE_SYMLINK', rel })
        continue
      }
      if (!isInsideRoot(rootAbs, resolved)) {
        failures.push({ kind: 'UNSAFE_SYMLINK', rel })
        continue
      }
      if (hashEntry({ rel, abs, symlink: true }) !== expected) {
        failures.push({ kind: 'MODIFIED', rel })
      }
      continue
    }

    if (!st.isFile()) {
      failures.push({ kind: 'TYPE_CHANGED', rel })
      continue
    }

    if (hashEntry({ rel, abs, symlink: false }) !== expected) {
      failures.push({ kind: 'MODIFIED', rel })
    }
  }

  return failures
}

function findExtraFiles(rootAbs: string, manifestRel: string, files: Record<string, string>): Failure[] {
  const trees = new Set<string>(PROTECTED_DIRS)
  for (const rel of Object.keys(files)) {
    const top = topLevelDir(rel)
    if (top) trees.add(top)
  }

  const extraDirs = [...trees].filter((d) => !PROTECTED_DIRS.includes(d))
  const present = collectProtectedFiles(rootAbs, extraDirs, new Set([manifestRel]))

  const failures: Failure[] = []
  for (const entry of present) {
    if (!(entry.rel in files)) failures.push({ kind: 'EXTRA', rel: entry.rel })
  }
  return failures
}

function main(): void {
  const args = process.argv.slice(2)
  const positional: string[] = []
  let warnRequested = false

  for (const arg of args) {
    if (arg === '--warn') {
      warnRequested = true
    } else if (arg.startsWith('--')) {
      console.error(`verify-manifest: unknown flag ${arg}`)
      process.exit(2)
    } else {
      positional.push(arg)
    }
  }

  if (positional.length !== 1) {
    console.error('usage: verify-manifest.mts <root> [--warn]')
    process.exit(2)
  }

  const root = path.resolve(positional[0])
  const manifestRel = '.spine-manifest.json'
  const { manifest, files } = loadManifest(path.join(root, manifestRel))
  const frozen = manifest.frozen === true
  const warnEffective = warnRequested && !frozen

  console.log(`🔒 Verifying spine integrity (frozen: ${frozen}, warn: ${warnEffective})`)

  const failures: Failure[] = []

  // Self-consistency: tree_digest must match a recompute over the files map.
  if (typeof manifest.tree_digest === 'string') {
    const pairs = Object.keys(files)
      .sort((a, b) => Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8')))
      .map((rel) => [rel, files[rel]] as const)
    if (computeTreeDigest(pairs) !== manifest.tree_digest) {
      failures.push({ kind: 'MANIFEST_DIGEST_MISMATCH', rel: manifestRel })
    }
  }

  const rootAbs = path.resolve(root)
  failures.push(...verifyListedFiles(rootAbs, files))
  failures.push(...findExtraFiles(rootAbs, manifestRel, files))

  if (failures.length === 0) {
    console.log(`✅ All ${Object.keys(files).length} protected files match manifest`)
    process.exit(0)
  }

  for (const f of failures) {
    const detail =
      f.kind === 'MISSING'
        ? 'listed in manifest but not on disk'
        : f.kind === 'MODIFIED'
          ? 'hash mismatch — file changed since manifest was generated'
          : f.kind === 'EXTRA'
            ? 'present in protected tree but not listed in manifest'
            : f.kind === 'UNSAFE_SYMLINK'
              ? 'symlink target escapes the project root'
              : f.kind === 'TYPE_CHANGED'
                ? 'path exists but is no longer a regular file'
                : f.kind === 'MALFORMED_ENTRY'
                  ? 'manifest hash value is not sha256:<64 hex>'
                  : 'tree_digest does not match the files map'
    console.error(`  ✗ ${f.kind}: ${f.rel} — ${detail}`)
  }

  console.error(`\n❌ ${failures.length} integrity failure(s)`)

  if (warnEffective) {
    console.error('⚠️  continuing with warnings (SPINE_INTEGRITY=warn, manifest not frozen)')
    process.exit(0)
  }
  if (warnRequested && frozen) {
    console.error('   (frozen manifest — --warn ignored)')
  }
  process.exit(1)
}

main()
