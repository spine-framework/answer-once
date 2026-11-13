// E2E regression for the untracked-protected-file trap: a file committed
// after manifest regen fails EXTRA on fresh clones while passing locally.
// verify must flag untracked files in protected trees so the gate cannot
// pass with release content outside the git index. (Hit on deploy e9628d2,
// 2026-11-12 — debugging-notes.)
import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const REPO = resolve(__dirname, '../../..')
const TSX = join(REPO, 'node_modules', '.bin', 'tsx')
const VERIFY = 'scripts/verify-manifest.mts'

// A git repo with one tracked protected file and a manifest that lists it.
function makeFixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'verify-manifest-'))
  mkdirSync(join(root, '.framework'), { recursive: true })
  writeFileSync(join(root, '.framework/kept.ts'), 'export const x = 1\n')
  execFileSync('git', ['init', '-q'], { cwd: root })
  execFileSync('git', ['add', '.framework/kept.ts'], { cwd: root })
  // Minimal manifest — the verifier only needs files + frozen.
  const manifest = {
    format_version: 1,
    frozen: true,
    files: { '.framework/kept.ts': 'sha256:dummy' },
  }
  writeFileSync(join(root, '.spine-manifest.json'), JSON.stringify(manifest))
  return root
}

function run(root: string) {
  return spawnSync(TSX, [VERIFY, root], { cwd: REPO, encoding: 'utf8', timeout: 30000 })
}

describe('verify-manifest untracked-file gate (evidence: source)', () => {
  it('fails on an untracked file inside a protected tree', () => {
    const root = makeFixture()
    try {
      writeFileSync(join(root, '.framework/new.ts'), 'export const y = 2\n')
      const res = run(root)
      expect(res.status).toBe(1)
      expect(res.stdout + res.stderr).toContain('UNTRACKED')
      expect(res.stdout + res.stderr).toContain('.framework/new.ts')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('reports EXTRA — not UNTRACKED — once the file is tracked', () => {
    const root = makeFixture()
    try {
      writeFileSync(join(root, '.framework/new.ts'), 'export const y = 2\n')
      execFileSync('git', ['add', '.framework/new.ts'], { cwd: root })
      const res = run(root)
      expect(res.status).toBe(1)
      expect(res.stdout + res.stderr).toContain('EXTRA')
      expect(res.stdout + res.stderr).not.toContain('UNTRACKED')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('ignores gitignored untracked files — they cannot enter a clone', () => {
    const root = makeFixture()
    try {
      writeFileSync(join(root, '.gitignore'), 'scratch.ts\n')
      execFileSync('git', ['add', '.gitignore'], { cwd: root })
      writeFileSync(join(root, '.framework/scratch.ts'), 'export const z = 3\n')
      const res = run(root)
      expect(res.stdout + res.stderr).not.toContain('UNTRACKED')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})
