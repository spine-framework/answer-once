import { describe, it, expect, afterAll } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const REPO = resolve(__dirname, '../../..')
const LINT = join(REPO, 'scripts/docs-lint.mts')

const GOOD_DOC = `---
title: Test page
kind: reference
verified_against: abc1234
verified_on: 2026-11-14
source_files:
  - target.ts
---
Body with a real link to \`target.ts\`.
`

const GOOD_SKILL = `---
name: test-skill
description: test
depends_on:
  files:
    - target.ts
  commands:
    - "npm run verify"
---
Body.
`

/** Minimal allowlist-satisfying repo: git init + tracked files. */
function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'docslint-'))
  const w = (rel: string, content: string) => {
    mkdirSync(join(root, rel, '..'), { recursive: true })
    writeFileSync(join(root, rel), content)
  }
  w('package.json', JSON.stringify({ scripts: { verify: 'true' } }))
  w('target.ts', 'export const x = 1\n')
  w('README.md', GOOD_DOC)
  w('AGENTS.md', GOOD_DOC)
  w('docs/agents/notes.md', GOOD_DOC)
  spawnSync('git', ['init', '-q'], { cwd: root })
  spawnSync('git', ['add', '-A'], { cwd: root })
  return root
}

function lint(root: string, extra: string[] = []) {
  const r = spawnSync('npx', ['tsx', LINT, '--root', root, ...extra], {
    cwd: REPO,
    encoding: 'utf8',
  })
  return { code: r.status, out: `${r.stdout}${r.stderr}` }
}

const roots: string[] = []
function root() { const r = makeRoot(); roots.push(r); return r }
function write(root: string, rel: string, content: string) {
  mkdirSync(join(root, rel, '..'), { recursive: true })
  writeFileSync(join(root, rel), content)
  spawnSync('git', ['add', '-A'], { cwd: root })
}
afterAll(() => roots.forEach((r) => rmSync(r, { recursive: true, force: true })))

describe('docs-lint', () => {
  it('passes a clean fixture', () => {
    const r = lint(root())
    expect(r.code).toBe(0)
    expect(r.out).toMatch(/0 uncovered violation/)
  })

  it('flags a .md outside allowlisted locations', () => {
    const r = root()
    write(r, 'random/notes.md', GOOD_DOC)
    const res = lint(r)
    expect(res.code).toBe(1)
    expect(res.out).toContain('[location]')
  })

  it('flags a living doc with no provenance', () => {
    const r = root()
    write(r, 'docs/agents/bad.md', GOOD_DOC.replace('source_files:\n  - target.ts\n', ''))
    const res = lint(r)
    expect(res.code).toBe(1)
    expect(res.out).toContain('[provenance]')
  })

  it('flags a dead backticked repo path', () => {
    const r = root()
    write(r, 'docs/agents/bad.md', GOOD_DOC.replace('`target.ts`', '`.framework/missing.ts`'))
    const res = lint(r)
    expect(res.code).toBe(1)
    expect(res.out).toContain('[paths]')
  })

  it('flags a skill missing depends_on', () => {
    const r = root()
    write(r, '.devin/skills/x/SKILL.md', '---\nname: x\ndescription: d\n---\nbody\n')
    const res = lint(r)
    expect(res.code).toBe(1)
    expect(res.out).toContain('[depends_on]')
  })

  it('flags a skill depending on an unknown npm script', () => {
    const r = root()
    write(r, '.devin/skills/x/SKILL.md', GOOD_SKILL.replace('npm run verify', 'npm run nonexistent'))
    const res = lint(r)
    expect(res.code).toBe(1)
    expect(res.out).toContain('[commands]')
  })

  it('flags an entity page missing ## Why it exists', () => {
    const r = root()
    write(r, 'docs/agents/ent.md', GOOD_DOC.replace('kind: reference', 'kind: entity'))
    const res = lint(r)
    expect(res.code).toBe(1)
    expect(res.out).toContain('[entity-why]')
  })

  it('flags a retired-tool reference in a living doc', () => {
    const r = root()
    write(r, 'docs/agents/bad.md', GOOD_DOC + 'use cil_chunk to search\n')
    const res = lint(r)
    expect(res.code).toBe(1)
    expect(res.out).toContain('[denylist]')
  })

  it('covers known debt via docs-debt.json and warns on stale entries', () => {
    const r = root()
    write(r, 'docs/agents/bad.md', GOOD_DOC.replace('kind: reference', 'kind: entity'))
    write(r, 'docs-debt.json', JSON.stringify({
      lint: [
        { file: 'docs/agents/bad.md', rule: 'entity-why' },
        { file: 'docs/agents/gone.md', rule: 'frontmatter' },
      ],
      stale: [],
    }))
    const res = lint(r)
    expect(res.code).toBe(0)
    expect(res.out).toContain('1 covered by docs-debt.json')
    expect(res.out).toMatch(/stale debt entry/)
  })
})
