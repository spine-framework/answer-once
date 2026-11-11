// CIL[BEGIN stable_id="~/.framework/tests/unit/migration-refs.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import {
  extractRefs,
  extractInserts,
  extractAnnotations,
  collectSeedFiles,
  buildSeedIndex,
  lintRefs,
} from '../../cli/lib/migration-refs.ts'
// CIL[END stable_id="~/.framework/tests/unit/migration-refs.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migration-refs.test.ts:repo:constant" type="constant" identity="REPO" parent="none"]
const REPO = resolve(__dirname, '../../..')
// CIL[BEGIN stable_id="~/.framework/tests/unit/migration-refs.test.ts:framework_migrations:constant" type="constant" identity="FRAMEWORK_MIGRATIONS" parent="none"]
// CIL[END stable_id="~/.framework/tests/unit/migration-refs.test.ts:repo:constant"]
const FRAMEWORK_MIGRATIONS = join(REPO, '.framework/migrations')
// CIL[END stable_id="~/.framework/tests/unit/migration-refs.test.ts:framework_migrations:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migration-refs.test.ts:migrationfiles:function" type="function" identity="migrationFiles" parent="none"]
function migrationFiles(dir: string): { name: string; path: string; sql: string }[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => f.endsWith('.sql') && !f.startsWith('.'))
    .sort()
    .map(f => ({ name: f, path: join(dir, f), sql: readFileSync(join(dir, f), 'utf8') }))
}
// CIL[END stable_id="~/.framework/tests/unit/migration-refs.test.ts:migrationfiles:function"]

describe('migration-refs extraction', () => {
  it('extracts WHERE slug = refs on tracked tables', () => {
    const refs = extractRefs(
      `UPDATE public.ai_agents SET system_prompt = 'x' WHERE slug = 'ao_triage_agent';`,
      'test.sql'
    )
    expect(refs).toHaveLength(1)
    expect(refs[0]).toMatchObject({ table: 'ai_agents', column: 'slug', value: 'ao_triage_agent' })
  })

  it('extracts IN-list refs and name refs', () => {
    const refs = extractRefs(
      `UPDATE public.prompt_configs SET a = 1
       WHERE name = 'Config A' AND slug IN ('one', 'two');`,
      'test.sql'
    )
    expect(refs.map(r => r.value).sort()).toEqual(['Config A', 'one', 'two'])
  })

  it('ignores refs on untracked tables', () => {
    expect(extractRefs(`UPDATE public.items SET x = 1 WHERE slug = 'a';`, 't.sql')).toHaveLength(0)
  })

  it('does not attribute subquery slugs to the outer table', () => {
    const refs = extractRefs(
      `UPDATE public.ai_agents SET a = 1
       WHERE slug = 'real_agent'
         AND app_id = (SELECT id FROM public.apps WHERE slug = 'the-app');`,
      't.sql'
    )
    expect(refs).toHaveLength(1)
    expect(refs[0].value).toBe('real_agent')
  })

  it('ignores slug mentions inside string literals and comments', () => {
    const refs = extractRefs(
      `UPDATE public.ai_agents SET system_prompt = 'always WHERE slug = ''fake'''
       -- WHERE slug = 'commented'
       WHERE slug = 'real';`,
      't.sql'
    )
    expect(refs).toHaveLength(1)
    expect(refs[0].value).toBe('real')
  })

  it('extracts slug/name values provided by INSERT … VALUES', () => {
    const provided = extractInserts(
      `INSERT INTO public.types (kind, slug, name) VALUES
        ('item', 'ao_thing', 'AO Thing'),
        ('item', 'ao_other', 'AO Other')
       ON CONFLICT (kind, slug) DO NOTHING;`,
      't.sql'
    )
    const flat = provided.map(({ table, column, value }) => ({ table, column, value }))
    expect(flat).toContainEqual({ table: 'types', column: 'slug', value: 'ao_thing' })
    expect(flat).toContainEqual({ table: 'types', column: 'slug', value: 'ao_other' })
    expect(flat).toContainEqual({ table: 'types', column: 'name', value: 'AO Thing' })
  })

  it('skips INSERT … SELECT and column-list-free inserts', () => {
    expect(extractInserts(
      `INSERT INTO public.types SELECT * FROM other;`, 't.sql'
    )).toHaveLength(0)
    expect(extractInserts(
      `INSERT INTO public.types VALUES ('x', 'y');`, 't.sql'
    )).toHaveLength(0)
  })

  it('reads ref-ok / ref-optional annotations', () => {
    const anns = extractAnnotations(
      `-- ref-optional: cleanup of a row that may not exist\nUPDATE x; -- ref-ok: defensive\n`
    )
    expect(anns).toHaveLength(2)
    expect(anns[0]).toMatchObject({ kind: 'optional', standalone: true })
    expect(anns[1]).toMatchObject({ kind: 'ok', standalone: false })
  })
})

describe('lintRefs resolution', () => {
  const mk = (name: string, sql: string) => ({ name, path: `/t/${name}`, sql })

  it('flags unresolvable references as missing', () => {
    const { problems } = lintRefs({
      migrations: [mk('002_x.sql', `UPDATE public.ai_agents SET a = 1 WHERE slug = 'ghost';`)],
      seedIndex: {},
    })
    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatchObject({ kind: 'missing', value: 'ghost' })
  })

  it('resolves against seed index', () => {
    const { problems } = lintRefs({
      migrations: [mk('002_x.sql', `UPDATE public.ai_agents SET a = 1 WHERE slug = 'a1';`)],
      seedIndex: { ai_agents: { slugs: new Set(['a1']), names: new Set() } },
    })
    expect(problems).toHaveLength(0)
  })

  it('resolves against inserts from earlier migrations', () => {
    const { problems } = lintRefs({
      migrations: [
        mk('001_a.sql', `INSERT INTO public.types (kind, slug) VALUES ('item', 't1');`),
        mk('002_b.sql', `UPDATE public.types SET x = 1 WHERE slug = 't1';`),
      ],
      seedIndex: {},
    })
    expect(problems).toHaveLength(0)
  })

  it('does not resolve against same-or-later migrations', () => {
    const { problems } = lintRefs({
      migrations: [
        mk('002_b.sql', `UPDATE public.types SET x = 1 WHERE slug = 't1';`),
        mk('003_c.sql', `INSERT INTO public.types (kind, slug) VALUES ('item', 't1');`),
      ],
      seedIndex: {},
    })
    expect(problems).toHaveLength(1)
  })

  it('ref-ok exempts, ref-optional downgrades to a warning', () => {
    const { problems } = lintRefs({
      migrations: [mk('002_x.sql', `
-- ref-ok: defensive IN list covering pre-rename slugs
UPDATE public.ai_agents SET a = 1 WHERE slug IN ('gone', 'also_gone');
-- ref-optional: row may never have existed; no-op intended
UPDATE public.types SET a = 1 WHERE slug = 'maybe_gone';`)],
      seedIndex: {},
    })
    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatchObject({ kind: 'optional', value: 'maybe_gone' })
  })

  it('a trailing annotation governs only its own line', () => {
    const { problems } = lintRefs({
      migrations: [mk('002_x.sql',
        `UPDATE public.ai_agents SET a = 1 WHERE slug = 'gone' -- ref-ok: intentional no-op
         AND name = 'unresolved_name';`)],
      seedIndex: {},
    })
    expect(problems).toHaveLength(1)
    expect(problems[0].value).toBe('unresolved_name')
  })
})

describe('framework migrations (evidence: source)', () => {
  it('every UPDATE slug/name reference resolves to a seed or earlier migration', () => {
    const migrations = migrationFiles(FRAMEWORK_MIGRATIONS)
    const seedIndex = buildSeedIndex(collectSeedFiles(REPO, { includeCustom: false }))
    const { problems } = lintRefs({ migrations, seedIndex })

    const missing = problems.filter(p => p.kind === 'missing')
    const optional = problems.filter(p => p.kind === 'optional')
    for (const p of optional) {
      console.warn(`  ref-optional: ${p.file}:${p.line} ${p.table}.${p.column} = '${p.value}' (unresolved)`)
    }

    expect(
      missing.map(p => `${p.file}:${p.line} ${p.table}.${p.column} = '${p.value}'`),
      'unresolvable UPDATE references — every slug/name a migration assumes must exist in seed JSON or be inserted by an earlier migration; annotate -- ref-optional/-- ref-ok when a no-op is intended'
    ).toEqual([])
  })
})
