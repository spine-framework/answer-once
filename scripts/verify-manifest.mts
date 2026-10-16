// CIL[BEGIN stable_id="~/scripts/verify-manifest.mts:module_header:module_header" type="module_header" identity="module_header" parent="~/scripts/verify-manifest.mts"]
// CIL[DOC-MACRO purpose="Fail-closed verifier for .spine-manifest.json — detects missing, modified, and extra files in protected trees"]
// CIL[DOC-RESPONSIBILITY responsibility="Parse the manifest, re-hash every listed path, confine symlinks to the root, and flag unlisted additions; exit 1 with an itemized failure list"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/checksum-manifest.mts,scripts/verify-integrity.sh,scripts/check-core-integrity.sh"]
// CIL[DOC-CONTRACT inputs="argv: <root> [--warn]" outputs="exit 0 pass / exit 1 with itemized failures (or 0 when --warn and manifest is not frozen)" errors="exit 1 on missing/malformed/empty manifest" side_effects="stdout/stderr report"]
// CIL[DOC-MICRO logic_summary="Shares enumeration and hashing with checksum-manifest.mts so generated and verified views can never drift" notable_decisions="frozen manifests ignore --warn entirely — warn mode is for dev regeneration only, never for frozen exports"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system-admin"]
// CIL[DOC-NOTE type="design" content="Extra-file check unions PROTECTED_DIRS with the top-level dirs actually present in the manifest so manifests generated with --include-dir still verify correctly"]
// CIL[DOC-VECTOR type="context" content="Invoked by npm run verify (scripts/verify-integrity.sh) and the retired scripts/check-core-integrity.sh shim"]
// CIL[DOC-VECTOR type="implementation_pattern" content="Imports collectProtectedFiles/hashEntry/topLevelDir from ./checksum-manifest.mts" status="ready"]
// CIL[END stable_id="~/scripts/verify-manifest.mts:module_header:module_header"]

import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  PROTECTED_DIRS,
  collectProtectedFiles,
  computeTreeDigest,
  hashEntry,
  topLevelDir,
} from './checksum-manifest.mts'

// CIL[BEGIN stable_id="~/scripts/verify-manifest.mts:Failure:interface" type="interface" identity="Failure" parent="~/scripts/verify-manifest.mts"]
// CIL[DOC-MACRO purpose="One itemized integrity failure"]
// CIL[DOC-RESPONSIBILITY responsibility="Carry a failure kind plus the manifest-relative path it concerns"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="kind is one of MISSING, MODIFIED, EXTRA, UNSAFE_SYMLINK, TYPE_CHANGED, MALFORMED_ENTRY, MANIFEST_DIGEST_MISMATCH" notable_decisions="kept as a tagged union string so printing stays trivially itemizable"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/scripts/verify-manifest.mts:Failure:interface"]

// CIL[BEGIN stable_id="~/scripts/verify-manifest.mts:HASH_RE:constant" type="constant" identity="HASH_RE" parent="~/scripts/verify-manifest.mts"]
// CIL[DOC-MACRO purpose="Strict shape for manifest hash values"]
// CIL[DOC-RESPONSIBILITY responsibility="Reject malformed 'sha256:<64 hex>' entries before comparing"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/checksum-manifest.mts"]
// CIL[DOC-CONTRACT inputs="none" outputs="RegExp" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lowercase hex only — matches what node:crypto sha256 digest produces" notable_decisions="manifest is machine-generated; strictness catches hand edits"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const HASH_RE = /^sha256:[0-9a-f]{64}$/
// CIL[END stable_id="~/scripts/verify-manifest.mts:HASH_RE:constant"]

// CIL[BEGIN stable_id="~/scripts/verify-manifest.mts:isInsideRoot:function" type="function" identity="isInsideRoot" parent="~/scripts/verify-manifest.mts"]
// CIL[DOC-MACRO purpose="Confinement check — is a resolved path still inside the root?"]
// CIL[DOC-RESPONSIBILITY responsibility="Return true when the resolved real path equals the root or sits beneath it"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts"]
// CIL[DOC-CONTRACT inputs="rootAbs, resolved absolute path" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="path.relative trick: outside paths yield '..' prefixes or absolute results" notable_decisions="boundary-safe — a sibling dir sharing a prefix like /root-evil does not pass"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function isInsideRoot(rootAbs: string, resolved: string): boolean {
  const rel = path.relative(rootAbs, resolved)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}
// CIL[END stable_id="~/scripts/verify-manifest.mts:isInsideRoot:function"]

// CIL[BEGIN stable_id="~/scripts/verify-manifest.mts:loadManifest:function" type="function" identity="loadManifest" parent="~/scripts/verify-manifest.mts"]
// CIL[DOC-MACRO purpose="Read and structurally validate .spine-manifest.json"]
// CIL[DOC-RESPONSIBILITY responsibility="Fail closed on missing, unreadable, non-JSON, empty, or wrong-format manifest; return the parsed files map"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/checksum-manifest.mts"]
// CIL[DOC-CONTRACT inputs="manifestPath: absolute path" outputs="{ manifest, files } — parsed manifest plus its files record" errors="prints reason and exits 1 on any defect" side_effects="reads manifest file"]
// CIL[DOC-MICRO logic_summary="Structural checks: object root, format_version === 1, files is a non-empty object" notable_decisions="an empty files map is treated as malformed — a manifest that protects nothing is not a manifest"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/scripts/verify-manifest.mts:loadManifest:function"]

// CIL[BEGIN stable_id="~/scripts/verify-manifest.mts:verifyListedFiles:function" type="function" identity="verifyListedFiles" parent="~/scripts/verify-manifest.mts"]
// CIL[DOC-MACRO purpose="Re-hash every manifest-listed path and classify failures"]
// CIL[DOC-RESPONSIBILITY responsibility="Check each listed path exists, is confined to the root when a symlink, and still matches its stored sha256"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/checksum-manifest.mts"]
// CIL[DOC-CONTRACT inputs="rootAbs, files map" outputs="Failure[]" errors="none — failures collected, not thrown" side_effects="reads every listed file"]
// CIL[DOC-MICRO logic_summary="lstat distinguishes symlink/file/dir; symlink targets are realpath'd and confined; type changes count as failures" notable_decisions="hash order follows byte-sorted keys for a stable, greppable report"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/scripts/verify-manifest.mts:verifyListedFiles:function"]

// CIL[BEGIN stable_id="~/scripts/verify-manifest.mts:findExtraFiles:function" type="function" identity="findExtraFiles" parent="~/scripts/verify-manifest.mts"]
// CIL[DOC-MACRO purpose="Reject unlisted additions inside protected trees"]
// CIL[DOC-RESPONSIBILITY responsibility="Enumerate the same trees the generator covered (defaults plus any top-level dirs present in the manifest) and flag anything not in the files map"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/checksum-manifest.mts"]
// CIL[DOC-CONTRACT inputs="rootAbs, manifestRel, files map" outputs="Failure[]" errors="none" side_effects="reads filesystem"]
// CIL[DOC-MICRO logic_summary="Shared collectProtectedFiles keeps exclusion rules identical between generate and verify; the manifest's own path is excluded" notable_decisions="manifest top-level dirs are unioned in so --include-dir manifests verify without extra flags"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/scripts/verify-manifest.mts:findExtraFiles:function"]

// CIL[BEGIN stable_id="~/scripts/verify-manifest.mts:main:function" type="function" identity="main" parent="~/scripts/verify-manifest.mts"]
// CIL[DOC-MACRO purpose="CLI entry — load manifest, run all checks, print itemized report"]
// CIL[DOC-RESPONSIBILITY responsibility="Wire parsing, digest consistency, listed-file verification, and extra-file detection; map --warn vs frozen to exit codes"]
// CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-integrity.sh,package.json"]
// CIL[DOC-CONTRACT inputs="argv: <root> [--warn]" outputs="exit 0 pass; exit 1 on failures (exit 0 with warnings only when --warn AND frozen !== true)" errors="exit 1 hard on manifest defects" side_effects="stdout report"]
// CIL[DOC-MICRO logic_summary="frozen:true ignores --warn entirely per plan G15 — frozen exports may never downgrade a failure to a warning" notable_decisions="tree_digest is recomputed for self-consistency; mismatch means the files map was edited after generation"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/scripts/verify-manifest.mts:main:function"]

main()
