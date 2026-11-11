// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// update-app guard — verifies the pristine baseline of an installed app
// package before `update-app` overwrites custom/apps/<slug>/.
//
// The baseline is the EXACT installed version from package-lock.json —
// never the caret range in package.json and never node_modules contents
// (neither can be proven pristine). The tarball for that exact version is
// fetched with `npm pack` into .spine/cache/pkgs/ and its sha512 compared to
// the lockfile `integrity`. When any step of that chain is unavailable the
// run aborts "baseline unverifiable" rather than guessing — `--force`
// overrides but still writes a backup first.
//
// Every proceeding run (pristine or --force) writes
// .spine/backups/<slug>-<from>-<ts>.tar.gz and prints the restore command
// before anything is copied.

import { createHash } from 'node:crypto'
import {
  existsSync, mkdirSync, readFileSync, readdirSync,
  lstatSync, readlinkSync,
} from 'node:fs'
import { join, basename, resolve as resolvePath, isAbsolute } from 'node:path'
import { execSync } from 'node:child_process'
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:guarddeps:interface" type="interface" identity="GuardDeps" parent="none"]
export interface GuardDeps {
  /** Run a shell command — injectable for tests. Defaults to execSync. */
  exec?: (cmd: string, opts: { cwd: string }) => void
  log?: (msg: string) => void
  now?: () => Date
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:guarddeps:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:treediff:interface" type="interface" identity="TreeDiff" parent="none"]
export interface TreeDiff {
  path: string
  kind: 'modified' | 'added' | 'deleted'
  note?: string
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:treediff:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:guardoutcome:interface" type="interface" identity="GuardOutcome" parent="none"]
export interface GuardOutcome {
  proceed: boolean
  /** `<pkg>@<ver> (integrity verified)` when verifiable, else the reason */
  baseline: string
  diffs: TreeDiff[]
  /** paths under decisions/ that are local-only — should move to custom/decisions/ */
  orphanedDecisions: string[]
  backupPath?: string
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:guardoutcome:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:sha512integrity:function" type="function" identity="sha512Integrity" parent="none"]
function sha512Integrity(file: string): string {
  return 'sha512-' + createHash('sha512').update(readFileSync(file)).digest('base64')
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:sha512integrity:function"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:sha256:function" type="function" identity="sha256" parent="none"]
function sha256(file: string): string {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:sha256:function"]

/** Recursively list files (and symlinks) under dir, relative paths. */
// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:listtree:function" type="function" identity="listTree" parent="none"]
function listTree(dir: string, rel = ''): { rel: string; symlink: boolean }[] {
  const out: { rel: string; symlink: boolean }[] = []
  const abs = rel ? join(dir, rel) : dir
  let entries: string[]
  try { entries = readdirSync(abs) } catch { return out }
  for (const name of entries) {
    const r = rel ? `${rel}/${name}` : name
    const p = join(dir, r)
    const st = lstatSync(p)
    if (st.isSymbolicLink()) out.push({ rel: r, symlink: true })
    else if (st.isDirectory()) out.push(...listTree(dir, r))
    else if (st.isFile()) out.push({ rel: r, symlink: false })
  }
  return out
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:listtree:function"]

/** Compare local vs baseline trees. Local paths present but absent from the
 *  baseline are 'added'; baseline paths missing locally are 'deleted';
 *  differing contents or symlinks are 'modified'. */
// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:difftrees:function" type="function" identity="diffTrees" parent="none"]
export function diffTrees(localDir: string, baseDir: string, prefix = ''): TreeDiff[] {
  const diffs: TreeDiff[] = []
  const localFiles = new Map(listTree(localDir).map(f => [f.rel, f]))
  const baseFiles = new Map(listTree(baseDir).map(f => [f.rel, f]))

  for (const [rel, lf] of localFiles) {
    const bf = baseFiles.get(rel)
    const p = prefix ? `${prefix}/${rel}` : rel
    if (!bf) { diffs.push({ path: p, kind: 'added' }); continue }
    if (lf.symlink || bf.symlink) {
      const same = lf.symlink && bf.symlink &&
        readlinkSync(join(localDir, rel)) === readlinkSync(join(baseDir, rel))
      if (!same) diffs.push({ path: p, kind: 'modified', note: 'symlink differs' })
      continue
    }
    if (sha256(join(localDir, rel)) !== sha256(join(baseDir, rel))) {
      diffs.push({ path: p, kind: 'modified' })
    }
  }
  for (const rel of baseFiles.keys()) {
    if (!localFiles.has(rel)) diffs.push({ path: prefix ? `${prefix}/${rel}` : rel, kind: 'deleted' })
  }
  return diffs
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:difftrees:function"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:lockentry:interface" type="interface" identity="LockEntry" parent="none"]
interface LockEntry {
  version?: string
  integrity?: string
  resolved?: string
  link?: boolean
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:lockentry:interface"]

/**
 * Run the update guard. `pkgDirName` is the node_modules directory name
 * (e.g. `@spine-framework/answer-once`), resolved by the caller.
 */
// CIL[BEGIN stable_id="~/.framework/cli/lib/update-app-guard.ts:guardupdateapp:function" type="function" identity="guardUpdateApp" parent="none"]
export function guardUpdateApp(opts: {
  projectRoot: string
  pkgDirName: string
  appSlug: string
  appDest: string
  copyEntries: readonly string[]
  force: boolean
  deps?: GuardDeps
}): GuardOutcome {
  const { projectRoot, pkgDirName, appSlug, appDest, copyEntries, force } = opts
  const exec = opts.deps?.exec ?? ((cmd: string, o: { cwd: string }) => { execSync(cmd, { cwd: o.cwd, stdio: 'pipe' }) })
  const log = opts.deps?.log ?? ((m: string) => console.log(m))
  const now = opts.deps?.now ?? (() => new Date())

  const fail = (reason: string): GuardOutcome => ({
    proceed: false, baseline: `baseline unverifiable: ${reason}`,
    diffs: [], orphanedDecisions: [],
  })

  const backup = (fromVersion: string): string => {
    const ts = now().toISOString().replace(/[:.]/g, '-')
    const dir = join(projectRoot, '.spine', 'backups')
    mkdirSync(dir, { recursive: true })
    const backupPath = join(dir, `${appSlug}-${fromVersion}-${ts}.tar.gz`)
    exec(`tar -czf "${backupPath}" -C "${join(projectRoot, 'custom', 'apps')}" "${appSlug}"`, { cwd: projectRoot })
    log(`  ✓ Backup: ${backupPath}`)
    log(`    restore: tar -xzf "${backupPath}" -C custom/apps/`)
    return backupPath
  }

  // 1. Resolve the exact baseline from package-lock.json.
  const lockPath = join(projectRoot, 'package-lock.json')
  if (!existsSync(lockPath)) {
    if (!force) return fail('package-lock.json not found — the exact installed version cannot be proven')
    log('  ⚠ baseline unverifiable: package-lock.json not found — proceeding under --force with a backup')
    return { proceed: true, baseline: 'baseline unverifiable: package-lock.json not found', diffs: [], orphanedDecisions: [], backupPath: backup('unknown') }
  }

  let lock: { packages?: Record<string, LockEntry> }
  try { lock = JSON.parse(readFileSync(lockPath, 'utf8')) }
  catch (e: any) {
    if (!force) return fail(`package-lock.json unreadable: ${e.message}`)
    return { proceed: true, baseline: `baseline unverifiable: ${e.message}`, diffs: [], orphanedDecisions: [], backupPath: backup('unknown') }
  }

  const entry = lock.packages?.[`node_modules/${pkgDirName}`]
  if (!entry?.version || !entry?.integrity) {
    const reason = !entry
      ? `no lockfile entry for node_modules/${pkgDirName}`
      : `lockfile entry lacks ${!entry.version ? 'version' : 'integrity'} — exact baseline cannot be proven`
    if (!force) return fail(reason)
    log(`  ⚠ baseline unverifiable: ${reason} — proceeding under --force with a backup`)
    return { proceed: true, baseline: `baseline unverifiable: ${reason}`, diffs: [], orphanedDecisions: [], backupPath: backup('unknown') }
  }

  const { version, integrity } = entry

  // 2. Obtain pristine content: npm pack the exact version into the cache.
  //    For file:-installed packages the lockfile `resolved` path is the
  //    source — npm pack on it reproduces the same bytes.
  const cacheDir = join(projectRoot, '.spine', 'cache', 'pkgs')
  mkdirSync(cacheDir, { recursive: true })
  const before = new Set(readdirSync(cacheDir))
  const spec = entry.resolved?.startsWith('file:')
    ? (isAbsolute(entry.resolved.slice(5)) ? entry.resolved.slice(5) : resolvePath(projectRoot, entry.resolved.slice(5)))
    : `${pkgDirName}@${version}`
  try {
    exec(`npm pack "${spec}" --pack-destination "${cacheDir}"`, { cwd: projectRoot })
  } catch (e: any) {
    if (!force) return fail(`npm pack ${spec} failed: ${String(e.message ?? e).split('\n')[0]}`)
    log(`  ⚠ baseline unverifiable: npm pack failed — proceeding under --force with a backup`)
    return { proceed: true, baseline: `baseline unverifiable: npm pack failed`, diffs: [], orphanedDecisions: [], backupPath: backup(version) }
  }

  const created = readdirSync(cacheDir).filter(f => f.endsWith('.tgz') && !before.has(f))
  const cached = readdirSync(cacheDir).filter(f => f.endsWith('.tgz'))
  const tgzName = created[0] ?? cached.find(f => f.includes(`-${version}.tgz`))
  if (!tgzName) {
    if (!force) return fail(`npm pack produced no tarball in ${cacheDir}`)
    return { proceed: true, baseline: 'baseline unverifiable: npm pack produced no tarball', diffs: [], orphanedDecisions: [], backupPath: backup(version) }
  }
  const tgz = join(cacheDir, tgzName)

  const actual = sha512Integrity(tgz)
  if (actual !== integrity) {
    const reason = `tarball sha512 does not match lockfile integrity for ${pkgDirName}@${version}`
    if (!force) return fail(reason)
    log(`  ⚠ baseline unverifiable: ${reason} — proceeding under --force with a backup`)
    return { proceed: true, baseline: `baseline unverifiable: ${reason}`, diffs: [], orphanedDecisions: [], backupPath: backup(version) }
  }

  // 3. Extract and compare.
  const extractDir = join(cacheDir, `${basename(tgzName, '.tgz')}.extract`)
  mkdirSync(extractDir, { recursive: true })
  try {
    exec(`tar -xzf "${tgz}" -C "${extractDir}"`, { cwd: projectRoot })
  } catch {
    return fail(`could not extract ${tgzName}`)
  }
  const basePkg = join(extractDir, 'package')
  if (!existsSync(basePkg)) return fail(`tarball ${tgzName} has no package/ root`)

  const baseline = `${pkgDirName}@${version} (integrity verified)`
  const diffs: TreeDiff[] = []
  const orphanedDecisions: string[] = []

  // Copy entries may be files OR directories — expand a side to the list of
  // entry-relative paths it contributes ('' for a bare file).
  const sidePaths = (p: string): string[] => {
    try {
      const st = lstatSync(p)
      if (st.isDirectory()) return listTree(p).map(f => f.rel)
      return ['']
    } catch { return [] }
  }
  const pathsEqual = (l: string, b: string): boolean => {
    const lst = lstatSync(l), bst = lstatSync(b)
    if (lst.isSymbolicLink() || bst.isSymbolicLink()) {
      return lst.isSymbolicLink() && bst.isSymbolicLink() &&
        readlinkSync(l) === readlinkSync(b)
    }
    return sha256(l) === sha256(b)
  }

  for (const ent of copyEntries) {
    if (ent === 'manifest.json') continue // preserved by update-app — not a customisation
    const local = join(appDest, ent)
    const base = join(basePkg, ent)
    const localExists = existsSync(local)
    const baseExists = existsSync(base)
    if (!localExists && !baseExists) continue
    if (localExists && !baseExists) {
      for (const rel of sidePaths(local)) {
        const p = rel ? `${ent}/${rel}` : ent
        if (ent === 'decisions') { orphanedDecisions.push(p); continue }
        diffs.push({ path: p, kind: 'added' })
      }
      continue
    }
    if (!localExists && baseExists) {
      for (const rel of sidePaths(base)) diffs.push({ path: rel ? `${ent}/${rel}` : ent, kind: 'deleted' })
      continue
    }
    if (lstatSync(local).isDirectory() && lstatSync(base).isDirectory()) {
      for (const d of diffTrees(local, base, ent)) {
        if (ent === 'decisions' && d.kind === 'added') { orphanedDecisions.push(d.path); continue }
        diffs.push(d)
      }
      continue
    }
    if (!pathsEqual(local, base)) diffs.push({ path: ent, kind: 'modified' })
  }

  if (diffs.length === 0 && orphanedDecisions.length === 0) {
    log(`  ✓ Local tree matches baseline ${baseline}`)
    return { proceed: true, baseline, diffs, orphanedDecisions, backupPath: backup(version) }
  }

  if (orphanedDecisions.length > 0) {
    for (const p of orphanedDecisions) {
      log(`  ⚠ decisions/${p.slice('decisions/'.length)} is local content in a package-owned directory — move it to custom/decisions/ (upgrades never touch custom/decisions/)`)
    }
  }

  if (diffs.length > 0) {
    log(`\n  Local modifications vs ${baseline}:`)
    for (const d of diffs.slice(0, 50)) {
      log(`    ${d.kind === 'modified' ? '~' : d.kind === 'added' ? '+' : '-'} ${d.path}${d.note ? ` (${d.note})` : ''}`)
    }
    if (diffs.length > 50) log(`    … and ${diffs.length - 50} more`)
    if (!force) {
      log('\n  update-app refuses to overwrite local modifications.')
      log('  Commit or revert them, or rerun with --force (writes a backup first).\n')
      return { proceed: false, baseline, diffs, orphanedDecisions }
    }
    log('  --force: proceeding after backup\n')
  } else {
    // decisions-only diffs still proceed — reported, not blocking
    return { proceed: true, baseline, diffs, orphanedDecisions, backupPath: backup(version) }
  }

  return { proceed: true, baseline, diffs, orphanedDecisions, backupPath: backup(version) }
}
// CIL[END stable_id="~/.framework/cli/lib/update-app-guard.ts:guardupdateapp:function"]
