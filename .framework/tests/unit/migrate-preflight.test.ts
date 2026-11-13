import { describe, it, expect } from 'vitest'
import { runPreflight, type DbProbe } from '../../cli/lib/migrate-preflight.ts'

function probe(rows: Record<string, string[]> = {}): DbProbe & { calls: string[] } {
  const calls: string[] = []
  return {
    calls,
    hasRow: async (table: string, column: string, value: string) => {
      calls.push(`${table}.${column}=${value}`)
      return (rows[`${table}.${column}`] ?? []).includes(value)
    },
  }
}

describe('runPreflight', () => {
  it('satisfies a reference from an earlier pending migration', async () => {
    const p = probe()
    const { checks, blocked } = await runPreflight({
      migrations: [
        { name: '001_seed.sql', sql: `INSERT INTO public.ai_agents (slug, name) VALUES ('bot_a', 'Bot');` },
        { name: '002_use.sql', sql: `UPDATE public.ai_agents SET description = 'x' WHERE slug = 'bot_a';` },
      ],
      probe: p,
    })
    const c = checks.find(c => c.value === 'bot_a')
    expect(c?.status).toBe('pending')
    expect(c?.pendingFrom).toBe('001_seed.sql')
    expect(blocked).toHaveLength(0)
    expect(p.calls).toHaveLength(0) // never hit the DB for pending-provided refs
  })

  it('satisfies a reference from an earlier statement in the same file', async () => {
    const p = probe()
    const { checks } = await runPreflight({
      migrations: [
        { name: '001.sql', sql: `
          INSERT INTO public.ai_agents (slug, name) VALUES ('bot_a', 'Bot');
          UPDATE public.ai_agents SET description = 'x' WHERE slug = 'bot_a';`,
        },
      ],
      probe: p,
    })
    expect(checks[0].status).toBe('pending')
    expect(checks[0].pendingFrom).toBe('001.sql')
  })

  it('labels refs found in the DB as observed', async () => {
    const p = probe({ 'types.slug': ['existing_type'] })
    const { checks, blocked } = await runPreflight({
      migrations: [
        { name: '001.sql', sql: `UPDATE public.types SET label = 'x' WHERE slug = 'existing_type';` },
      ],
      probe: p,
    })
    expect(checks[0].status).toBe('observed')
    expect(blocked).toHaveLength(0)
    expect(p.calls).toEqual(['types.slug=existing_type'])
  })

  it('blocks on missing mandatory references without touching writes', async () => {
    const p = probe()
    const { checks, blocked } = await runPreflight({
      migrations: [
        { name: '001.sql', sql: `UPDATE public.types SET label = 'x' WHERE slug = 'ghost_type';` },
      ],
      probe: p,
    })
    expect(checks[0].status).toBe('missing')
    expect(blocked).toHaveLength(1)
    expect(blocked[0].file).toBe('001.sql')
  })

  it('warns instead of blocking on ref-optional missing references', async () => {
    const p = probe()
    const { checks, blocked, warnings } = await runPreflight({
      migrations: [
        { name: '001.sql', sql: `UPDATE public.types SET label = 'x' WHERE slug = 'maybe_gone'; -- ref-optional` },
      ],
      probe: p,
    })
    expect(checks[0].status).toBe('optional-missing')
    expect(blocked).toHaveLength(0)
    expect(warnings).toHaveLength(1)
  })

  it('skips ref-ok references entirely', async () => {
    const p = probe()
    const { checks } = await runPreflight({
      migrations: [
        { name: '001.sql', sql: `UPDATE public.types SET label = 'x' WHERE slug = 'external'; -- ref-ok` },
      ],
      probe: p,
    })
    expect(checks[0].status).toBe('ok')
    expect(p.calls).toHaveLength(0)
  })

  it('caches repeated DB lookups for the same value', async () => {
    const p = probe({ 'types.slug': ['dup'] })
    const { checks } = await runPreflight({
      migrations: [
        { name: '001.sql', sql: `
          UPDATE public.types SET a = 1 WHERE slug = 'dup';
          UPDATE public.types SET b = 2 WHERE slug = 'dup';`,
        },
      ],
      probe: p,
    })
    expect(checks.map(c => c.status)).toEqual(['observed', 'observed'])
    expect(p.calls).toEqual(['types.slug=dup'])
  })

  it('DB errors degrade to missing rather than throwing', async () => {
    const failing: DbProbe = { hasRow: async () => { throw new Error('connection lost') } }
    const { blocked } = await runPreflight({
      migrations: [
        { name: '001.sql', sql: `UPDATE public.types SET a = 1 WHERE slug = 'x';` },
      ],
      probe: failing,
    })
    expect(blocked).toHaveLength(1)
  })
})
