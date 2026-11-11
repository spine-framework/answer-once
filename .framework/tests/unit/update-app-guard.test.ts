// CIL[BEGIN stable_id="~/.framework/tests/unit/update-app-guard.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync,
  cpSync, copyFileSync, existsSync, rmSync, readdirSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { guardUpdateApp, diffTrees } from '../../cli/lib/update-app-guard.ts'
// CIL[END stable_id="~/.framework/tests/unit/update-app-guard.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/update-app-guard.test.ts:copy_entries:constant" type="constant" identity="COPY_ENTRIES" parent="none"]
const COPY_ENTRIES = ['index.tsx', 'manifest.json', 'pages', 'docs', 'decisions', 'LICENSE.md'] as const
// CIL[END stable_id="~/.framework/tests/unit/update-app-guard.test.ts:copy_entries:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/update-app-guard.test.ts:root:constant" type="constant" identity="root" parent="none"]
let root: string
// CIL[BEGIN stable_id="~/.framework/tests/unit/update-app-guard.test.ts:tarballpath:constant" type="constant" identity="tarballPath" parent="none"]
// CIL[END stable_id="~/.framework/tests/unit/update-app-guard.test.ts:root:constant"]
let tarballPath: string
// CIL[BEGIN stable_id="~/.framework/tests/unit/update-app-guard.test.ts:logs:constant" type="constant" identity="logs" parent="none"]
// CIL[END stable_id="~/.framework/tests/unit/update-app-guard.test.ts:tarballpath:constant"]
let logs: string[]
// CIL[END stable_id="~/.framework/tests/unit/update-app-guard.test.ts:logs:constant"]

/** Build a temp project root containing a pristine package tarball whose
 *  contents mirror custom/apps/test-app, plus a package-lock.json entry. */
// CIL[BEGIN stable_id="~/.framework/tests/unit/update-app-guard.test.ts:setupproject:function" type="function" identity="setupProject" parent="none"]
function setupProject(opts: {
  lockEntry?: Record<string, unknown> | null
  modifyFile?: string
  localOnly?: string[]
} = {}) {
  root = mkdtempSync(join(tmpdir(), 'update-guard-'))

  // Pristine package fixture → tarball with a package/ root, like npm pack.
  const fixture = join(root, 'fixture', 'package')
  mkdirSync(join(fixture, 'pages'), { recursive: true })
  mkdirSync(join(fixture, 'docs'), { recursive: true })
  writeFileSync(join(fixture, 'pages', 'index.tsx'), 'export default function P() { return null }\n')
  writeFileSync(join(fixture, 'docs', 'readme.md'), '# test app\n')
  writeFileSync(join(fixture, 'index.tsx'), 'export default function App() { return null }\n')
  writeFileSync(join(fixture, 'manifest.json'), JSON.stringify({ slug: 'test-app' }))
  tarballPath = join(root, 'test-app-0.1.0.tgz')
  execSync(`tar -czf "${tarballPath}" -C "${join(root, 'fixture')}" package`)
  const integrity = 'sha512-' + createHash('sha512').update(readFileSync(tarballPath)).digest('base64')

  // Local app tree — an exact copy, possibly with local edits.
  const appDest = join(root, 'custom', 'apps', 'test-app')
  mkdirSync(appDest, { recursive: true })
  cpSync(fixture, appDest, { recursive: true })
  if (opts.modifyFile) {
    writeFileSync(join(appDest, opts.modifyFile), 'local edit\n')
  }
  for (const p of opts.localOnly ?? []) {
    mkdirSync(join(appDest, p.split('/').slice(0, -1).join('/')), { recursive: true })
    writeFileSync(join(appDest, p), 'customer-owned\n')
  }

  // package-lock.json — the ONLY trusted source of the exact baseline.
  if (opts.lockEntry !== null) {
    const entry = opts.lockEntry ?? { version: '0.1.0', integrity }
    writeFileSync(join(root, 'package-lock.json'), JSON.stringify({
      lockfileVersion: 3,
      packages: { 'node_modules/test-app': entry },
    }))
  }
  // A caret range in package.json must NOT be used — the lockfile wins.
  writeFileSync(join(root, 'package.json'), JSON.stringify({
    dependencies: { 'test-app': '^0.1.0' },
  }))
  return appDest
}
// CIL[END stable_id="~/.framework/tests/unit/update-app-guard.test.ts:setupproject:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/update-app-guard.test.ts:makedeps:function" type="function" identity="makeDeps" parent="none"]
function makeDeps(captured: string[]) {
  return {
    exec: (cmd: string, o: { cwd: string }) => {
      captured.push(cmd)
      if (cmd.startsWith('npm pack ')) {
        // Simulate npm pack: copy the prebuilt fixture tarball into the
        // --pack-destination directory with the name npm would produce.
        const dest = /--pack-destination "([^"]+)"/.exec(cmd)![1]
        copyFileSync(tarballPath, join(dest, 'test-app-0.1.0.tgz'))
        return
      }
      execSync(cmd, { cwd: o.cwd, stdio: 'pipe' })
    },
    log: (m: string) => { logs.push(m) },
    now: () => new Date('2026-01-01T00:00:00Z'),
  }
}
// CIL[END stable_id="~/.framework/tests/unit/update-app-guard.test.ts:makedeps:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/update-app-guard.test.ts:run:function" type="function" identity="run" parent="none"]
function run(opts: { force?: boolean; captured: string[]; appDest: string }) {
  return guardUpdateApp({
    projectRoot: root,
    pkgDirName: 'test-app',
    appSlug: 'test-app',
    appDest: opts.appDest,
    copyEntries: COPY_ENTRIES,
    force: opts.force === true,
    deps: makeDeps(opts.captured),
  })
}
// CIL[END stable_id="~/.framework/tests/unit/update-app-guard.test.ts:run:function"]

beforeEach(() => { logs = [] })
afterEach(() => { rmSync(root, { recursive: true, force: true }) })

describe('diffTrees', () => {
  it('reports modified, added, and deleted files', () => {
    root = mkdtempSync(join(tmpdir(), 'difftree-'))
    const a = join(root, 'a'); const b = join(root, 'b')
    mkdirSync(a, { recursive: true }); mkdirSync(b, { recursive: true })
    writeFileSync(join(a, 'same.txt'), 'x'); writeFileSync(join(b, 'same.txt'), 'x')
    writeFileSync(join(a, 'local.txt'), 'x')
    writeFileSync(join(b, 'base.txt'), 'x')
    writeFileSync(join(a, 'mod.txt'), 'local'); writeFileSync(join(b, 'mod.txt'), 'base')
    const diffs = diffTrees(a, b)
    expect(diffs).toContainEqual({ path: 'local.txt', kind: 'added' })
    expect(diffs).toContainEqual({ path: 'base.txt', kind: 'deleted' })
    expect(diffs).toContainEqual({ path: 'mod.txt', kind: 'modified' })
    expect(diffs).toHaveLength(3)
  })
})

describe('guardUpdateApp', () => {
  it('proceeds on a clean tree, packs the exact lockfile version, and backs up', () => {
    const appDest = setupProject()
    const captured: string[] = []
    const out = run({ captured, appDest })
    expect(out.proceed).toBe(true)
    expect(out.baseline).toBe('test-app@0.1.0 (integrity verified)')
    expect(out.diffs).toHaveLength(0)
    // The lockfile version — not the caret range in package.json — is packed.
    const packCmd = captured.find(c => c.startsWith('npm pack '))
    expect(packCmd).toContain('npm pack "test-app@0.1.0"')
    expect(out.backupPath).toBeTruthy()
    expect(existsSync(out.backupPath!)).toBe(true)
    expect(out.backupPath!).toContain('test-app-0.1.0-')
  })

  it('aborts on modified files, naming the verified baseline', () => {
    const appDest = setupProject({ modifyFile: 'pages/index.tsx' })
    const out = run({ captured: [], appDest })
    expect(out.proceed).toBe(false)
    expect(out.baseline).toBe('test-app@0.1.0 (integrity verified)')
    expect(out.diffs).toContainEqual({ path: 'pages/index.tsx', kind: 'modified' })
    expect(out.backupPath).toBeUndefined()
    expect(logs.join('\n')).toContain('--force')
  })

  it('aborts on a modified file-level copy entry (e.g. index.tsx)', () => {
    const appDest = setupProject({ modifyFile: 'index.tsx' })
    const out = run({ captured: [], appDest })
    expect(out.proceed).toBe(false)
    expect(out.diffs).toContainEqual({ path: 'index.tsx', kind: 'modified' })
  })

  it('reports file-level entries added locally or deleted locally', () => {
    const appDest = setupProject({ localOnly: ['LICENSE.md'] })
    rmSync(join(appDest, 'index.tsx'))
    const out = run({ captured: [], appDest })
    expect(out.proceed).toBe(false)
    expect(out.diffs).toContainEqual({ path: 'LICENSE.md', kind: 'added' })
    expect(out.diffs).toContainEqual({ path: 'index.tsx', kind: 'deleted' })
  })

  it('reports local-only files and files missing locally', () => {
    const appDest = setupProject({ localOnly: ['pages/local-page.tsx'] })
    rmSync(join(appDest, 'docs', 'readme.md'))
    const out = run({ captured: [], appDest })
    expect(out.proceed).toBe(false)
    expect(out.diffs).toContainEqual({ path: 'pages/local-page.tsx', kind: 'added' })
    expect(out.diffs).toContainEqual({ path: 'docs/readme.md', kind: 'deleted' })
  })

  it('aborts as baseline unverifiable when package-lock.json is missing', () => {
    const appDest = setupProject({ lockEntry: null })
    const out = run({ captured: [], appDest })
    expect(out.proceed).toBe(false)
    expect(out.baseline).toMatch(/^baseline unverifiable: package-lock\.json/)
  })

  it('aborts as baseline unverifiable when the entry lacks integrity', () => {
    const appDest = setupProject({ lockEntry: { version: '0.1.0' } })
    const out = run({ captured: [], appDest })
    expect(out.proceed).toBe(false)
    expect(out.baseline).toMatch(/^baseline unverifiable:.*integrity/)
  })

  it('aborts when the fetched tarball does not match lockfile integrity', () => {
    const appDest = setupProject({ lockEntry: { version: '0.1.0', integrity: 'sha512-bogusbogusbogus==' } })
    const out = run({ captured: [], appDest })
    expect(out.proceed).toBe(false)
    expect(out.baseline).toMatch(/^baseline unverifiable:.*sha512/)
  })

  it('--force backs up and proceeds over local modifications', () => {
    const appDest = setupProject({ modifyFile: 'pages/index.tsx' })
    const out = run({ captured: [], appDest, force: true })
    expect(out.proceed).toBe(true)
    expect(out.diffs).toContainEqual({ path: 'pages/index.tsx', kind: 'modified' })
    expect(out.backupPath).toBeTruthy()
    // The backup actually contains the app tree.
    const listing = execSync(`tar -tzf "${out.backupPath}"`, { encoding: 'utf8' })
    expect(listing).toContain('test-app/pages/index.tsx')
  })

  it('--force proceeds with a backup even when the baseline is unverifiable', () => {
    const appDest = setupProject({ lockEntry: null })
    const out = run({ captured: [], appDest, force: true })
    expect(out.proceed).toBe(true)
    expect(out.baseline).toMatch(/^baseline unverifiable/)
    expect(existsSync(out.backupPath!)).toBe(true)
  })

  it('reports local-only decisions/ content as orphaned rather than blocking', () => {
    const appDest = setupProject({ localOnly: ['decisions/D1-local-choice.md'] })
    const out = run({ captured: [], appDest })
    expect(out.orphanedDecisions).toEqual(['decisions/D1-local-choice.md'])
    expect(out.diffs).toHaveLength(0)
    expect(out.proceed).toBe(true)
    expect(logs.join('\n')).toContain('custom/decisions/')
  })

  it('uses the lockfile resolved path for file:-installed packages', () => {
    // A file:-installed tarball records resolved + integrity in the lockfile.
    const appDest = setupProject()
    const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
    lock.packages['node_modules/test-app'].resolved = `file:${tarballPath}`
    writeFileSync(join(root, 'package-lock.json'), JSON.stringify(lock))
    const captured: string[] = []
    const out = run({ captured, appDest })
    expect(out.proceed).toBe(true)
    const packCmd = captured.find(c => c.startsWith('npm pack '))!
    expect(packCmd).toContain(`npm pack "${tarballPath}"`)
  })
})
