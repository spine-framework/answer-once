import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  listDecisionDirs,
  validateDecisions,
  refToPath,
} from '../../cli/lib/decision-records.ts'
import { resolve } from 'node:path'

const REPO = resolve(__dirname, '../../..')

const VALID_FM = `---
id: spine-framework:0001-test
title: Test
status: accepted
kind: decision
owner: package
since: 0.5.4
until: null
supersedes: null
superseded_by: null
links: []
applies_to: []
enforced_by: []
evidence:
  - { kind: commit, ref: abc1234 }
provenance: reconstructed
---
Body
`

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'decisions-'))
  mkdirSync(join(root, '.framework/decisions'), { recursive: true })
  mkdirSync(join(root, 'custom/decisions'), { recursive: true })
  mkdirSync(join(root, 'custom/apps/my-app/decisions'), { recursive: true })
  writeFileSync(join(root, 'target.ts'), 'x')
  return root
}

function writeRecord(root: string, relDir: string, fm: string, name = '0001-a.md') {
  const path = join(root, relDir, name)
  writeFileSync(path, fm)
  return relDir + '/' + name
}

function fmWith(overrides: Record<string, string>): string {
  let fm = VALID_FM
  for (const [k, v] of Object.entries(overrides)) {
    fm = fm.replace(new RegExp(`^${k}:.*$`, 'm'), `${k}: ${v}`)
  }
  return fm
}

describe('listDecisionDirs', () => {
  it('classifies package and customer dirs', () => {
    const root = makeRoot()
    try {
      const dirs = listDecisionDirs(root)
      expect(dirs.find(d => d.rel === '.framework/decisions')).toMatchObject({ owner: 'package', idPrefix: 'spine-framework' })
      expect(dirs.find(d => d.rel === 'custom/decisions')).toMatchObject({ owner: 'customer', idPrefix: 'customer' })
      // my-app has no package.json → customer-authored
      expect(dirs.find(d => d.rel === 'custom/apps/my-app/decisions')).toMatchObject({ owner: 'customer' })
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('detects DAHL-shipped apps via package.json name', () => {
    const root = makeRoot()
    try {
      writeFileSync(join(root, 'custom/apps/my-app/package.json'),
        JSON.stringify({ name: '@spine-framework/answer-once' }))
      const dir = listDecisionDirs(root).find(d => d.rel === 'custom/apps/my-app/decisions')
      expect(dir).toMatchObject({ owner: 'package', idPrefix: 'answer-once' })
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})

describe('validateDecisions — unit rules', () => {
  it('passes a well-formed record', () => {
    const root = makeRoot()
    try {
      writeRecord(root, '.framework/decisions', fmWith({ applies_to: '[target.ts]' }))
      const { problems } = validateDecisions(root)
      expect(problems.filter(p => p.level === 'error')).toHaveLength(0)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('rejects missing fields, bad enums, and wrong id prefixes', () => {
    const root = makeRoot()
    try {
      writeRecord(root, '.framework/decisions', VALID_FM.replace('status: accepted', 'status: bogus')
        .replace('id: spine-framework:0001-test', 'id: customer:0001-test'))
      const { problems } = validateDecisions(root)
      const msgs = problems.map(p => p.message).join('\n')
      expect(msgs).toContain('must start with "spine-framework:"')
      expect(msgs).toContain('status "bogus"')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('flags customer records in package dirs and vice versa', () => {
    const root = makeRoot()
    try {
      writeRecord(root, '.framework/decisions', VALID_FM.replace('owner: package', 'owner: customer')
        .replace('id: spine-framework:0001-test', 'id: customer:0001-test'))
      writeRecord(root, 'custom/decisions', VALID_FM)
      const { problems } = validateDecisions(root)
      const msgs = problems.map(p => p.message).join('\n')
      expect(msgs).toContain('directory ownership')
      expect(msgs).toContain('must start with "customer:"')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('checks applies_to/enforced_by paths only for accepted/proposed', () => {
    const root = makeRoot()
    try {
      writeRecord(root, '.framework/decisions', fmWith({ applies_to: '[target.ts]', enforced_by: '[missing.ts]' }))
      writeRecord(root, '.framework/decisions', fmWith({
        status: 'superseded', until: '0.5.4', superseded_by: 'spine-framework:0001-test',
        applies_to: '[missing-old.ts]',
      }).replace('id: spine-framework:0001-test', 'id: spine-framework:0002-old'), '0002-old.md')
      const { problems } = validateDecisions(root)
      const msgs = problems.map(p => `${p.file}: ${p.message}`).join('\n')
      expect(msgs).toContain('enforced_by path does not exist: missing.ts')
      // superseded record's stale applies_to is NOT checked against today's tree
      expect(msgs).not.toContain('missing-old.ts')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('enforces supersedes/superseded_by reciprocity and same-owner', () => {
    const root = makeRoot()
    try {
      writeRecord(root, '.framework/decisions', fmWith({ supersedes: 'spine-framework:0002-old' }))
      writeRecord(root, '.framework/decisions', fmWith({
        status: 'superseded', until: '0.5.4', superseded_by: 'spine-framework:0003-other',
      }).replace('id: spine-framework:0001-test', 'id: spine-framework:0002-old'), '0002-old.md')
      const { problems } = validateDecisions(root)
      const msgs = problems.map(p => p.message).join('\n')
      expect(msgs).toContain("superseded_by")
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('rejects a customer record superseding a package record', () => {
    const root = makeRoot()
    try {
      writeRecord(root, '.framework/decisions', VALID_FM)
      writeRecord(root, 'custom/decisions', fmWith({
        supersedes: 'spine-framework:0001-test',
      }).replace('id: spine-framework:0001-test', 'id: customer:0001-fork')
        .replace('owner: package', 'owner: customer'))
      const { problems } = validateDecisions(root)
      const msgs = problems.map(p => p.message).join('\n')
      expect(msgs).toContain('may not cross owners')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('warns on proposed and unenforced records', () => {
    const root = makeRoot()
    try {
      writeRecord(root, '.framework/decisions', fmWith({ status: 'proposed' }))
      const { problems } = validateDecisions(root)
      expect(problems.some(p => p.level === 'warning' && p.message.includes('proposed'))).toBe(true)
      expect(problems.some(p => p.level === 'warning' && p.message.includes('unenforced'))).toBe(true)
      expect(problems.some(p => p.level === 'error')).toBe(false)
      // strict mode (release gate) fails proposed
      const strict = validateDecisions(root, { strictProposed: true })
      expect(strict.problems.some(p => p.level === 'error')).toBe(true)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})

describe('release exceptions', () => {
  const PROPOSED_FM = VALID_FM.replace('status: accepted', 'status: proposed')
  const EXCEPTIONS_YAML = (release: string, record = 'spine-framework:0001-test') => `exceptions:
  - record: ${record}
    release: "${release}"
    approved_by: tester
    reason: test fixture
`

  function makeVersionedRoot(): string {
    const root = makeRoot()
    writeFileSync(join(root, 'package.json'),
      JSON.stringify({ name: 'spine-framework', version: '0.5.5' }))
    return root
  }

  it('a valid exception downgrades strict proposed to a warning', () => {
    const root = makeVersionedRoot()
    try {
      writeRecord(root, '.framework/decisions', PROPOSED_FM)
      writeFileSync(join(root, '.framework/decisions/exceptions.yaml'), EXCEPTIONS_YAML('0.5.5'))
      const { problems } = validateDecisions(root, { strictProposed: true })
      expect(problems.filter(p => p.level === 'error')).toHaveLength(0)
      expect(problems.some(p => p.level === 'warning' && p.message.includes('exception'))).toBe(true)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('a stale exception fails validation — approved release != current version', () => {
    const root = makeVersionedRoot()
    try {
      writeRecord(root, '.framework/decisions', PROPOSED_FM)
      writeFileSync(join(root, '.framework/decisions/exceptions.yaml'), EXCEPTIONS_YAML('0.5.4'))
      const { problems } = validateDecisions(root)
      const errs = problems.filter(p => p.level === 'error').map(p => p.message).join('\n')
      expect(errs).toContain('stale')
      expect(errs).toContain('0.5.4')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('an exception for a non-proposed or missing record is obsolete', () => {
    const root = makeVersionedRoot()
    try {
      writeRecord(root, '.framework/decisions', VALID_FM)
      writeFileSync(join(root, '.framework/decisions/exceptions.yaml'), EXCEPTIONS_YAML('0.5.5'))
      let { problems } = validateDecisions(root)
      expect(problems.some(p => p.level === 'error' && p.message.includes('obsolete'))).toBe(true)

      writeFileSync(join(root, '.framework/decisions/exceptions.yaml'),
        EXCEPTIONS_YAML('0.5.5', 'spine-framework:9999-nope'))
      ;({ problems } = validateDecisions(root))
      expect(problems.some(p => p.level === 'error' && p.message.includes('unknown record'))).toBe(true)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('an unexceptioned proposed record still fails strict mode', () => {
    const root = makeVersionedRoot()
    try {
      writeRecord(root, '.framework/decisions', PROPOSED_FM)
      const { problems } = validateDecisions(root, { strictProposed: true })
      expect(problems.some(p => p.level === 'error' && p.message.includes('proposed'))).toBe(true)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})

describe('release gate wiring (evidence: source)', () => {
  // Testing strictProposed alone is not enforcement — the gate must invoke it.
  it('npm run gate includes verify:decisions', () => {
    const pkg = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'))
    expect(pkg.scripts.gate).toContain('verify:decisions')
  })

  it('the gate script rejects an unapproved proposed record end to end', () => {
    const root = makeRoot()
    try {
      writeFileSync(join(root, 'package.json'),
        JSON.stringify({ name: 'spine-framework', version: '0.5.5' }))
      writeRecord(root, '.framework/decisions',
        VALID_FM.replace('status: accepted', 'status: proposed'))
      const tsx = join(REPO, 'node_modules', '.bin', 'tsx')
      const res = spawnSync(tsx, ['scripts/check-decisions.ts', '--strict', '--root', root],
        { cwd: REPO, encoding: 'utf8', timeout: 30000 })
      expect(res.status).toBe(1)
      expect(res.stdout + res.stderr).toContain('proposed')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})

describe('refToPath', () => {
  it('strips #symbol suffixes', () => {
    expect(refToPath('a/b.ts#SYM')).toBe('a/b.ts')
    expect(refToPath('a/b.ts')).toBe('a/b.ts')
  })
})

describe('framework decision corpus (evidence: source)', () => {
  it('all .framework/decisions records validate against the current tree', () => {
    const { problems } = validateDecisions(REPO)
    const errors = problems.filter(p => p.level === 'error')
    expect(errors.map(e => `${e.file}: ${e.message}`)).toEqual([])
  })
})
