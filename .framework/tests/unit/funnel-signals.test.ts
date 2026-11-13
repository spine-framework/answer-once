import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() },
}))
vi.mock('../../functions/_shared/trigger-engine.ts', () => ({
  fireCreateTriggers: vi.fn().mockResolvedValue(undefined),
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { emitSignal } from '../../functions/_shared/funnel.ts'

function ctx(): any {
  return { accountId: 'acct-1', principal: { id: 'p-1', type: 'human' } }
}

/**
 * Recording query builder — captures every chain call so tests can assert
 * which filters were applied. `terminal` is the value single/maybeSingle/
 * then resolve with.
 */
function chain(calls: any[][], terminal: any): any {
  const b: any = {}
  const rec = (name: string) => (...args: any[]) => {
    calls.push([name, ...args])
    return b
  }
  for (const m of [
    'select', 'eq', 'in', 'or', 'is', 'not', 'order', 'insert', 'update',
    'delete', 'upsert', 'lt', 'gt', 'lte', 'gte', 'neq', 'contains', 'limit',
  ]) b[m] = rec(m)
  b.single = () => Promise.resolve(terminal)
  b.maybeSingle = () => Promise.resolve(terminal)
  b.then = (res: any, rej?: any) => Promise.resolve(terminal).then(res, rej)
  return b
}

/**
 * Wire adminDb so `types` resolves the signal type and `items` answers the
 * dedupe lookup (first call) and the insert (second call). Returns the
 * recorded call lists.
 */
function mockDb(opts: { dedupeRows?: any[] } = {}) {
  const itemsCalls: any[][] = []
  let itemsCallIdx = 0
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    if (table === 'types') {
      return chain([], { data: { id: 'type-demo-signal' }, error: null })
    }
    if (table === 'items') {
      itemsCallIdx++
      return chain(
        itemsCalls,
        itemsCallIdx === 1
          ? { data: opts.dedupeRows ?? [], error: null }
          : { data: { id: 'sig-1', type_id: 'type-demo-signal' }, error: null }
      )
    }
    return chain([], { data: null, error: null })
  })
  return { itemsCalls }
}

describe('emitSignal — dedupe_scope', () => {
  beforeEach(() => vi.clearAllMocks())

  it('narrows the dedupe lookup by data.dedupe_scope and stamps it on the row', async () => {
    const { itemsCalls } = mockDb()
    const created = await emitSignal(ctx(), {
      type_slug: 'demo_signal',
      action: 'workflow_completed',
      dedupe_scope: 'run-1',
      data: { source: 'demo' },
    })
    expect(created?.id).toBe('sig-1')
    // The dedupe query filters on the scope marker.
    expect(itemsCalls).toContainEqual(['eq', 'data->>dedupe_scope', 'run-1'])
    // The inserted row carries the scope so later lookups match.
    const insert = itemsCalls.find((c) => c[0] === 'insert')
    expect(insert?.[1]?.data?.dedupe_scope).toBe('run-1')
    expect(insert?.[1]?.data?.action_type).toBe('workflow_completed')
  })

  it('omits the scope filter entirely when dedupe_scope is not set', async () => {
    const { itemsCalls } = mockDb()
    const created = await emitSignal(ctx(), {
      type_slug: 'demo_signal',
      action: 'demo_started',
      data: { source: 'demo' },
    })
    expect(created?.id).toBe('sig-1')
    expect(itemsCalls.some((c) => c[0] === 'eq' && c[1] === 'data->>dedupe_scope')).toBe(false)
    const insert = itemsCalls.find((c) => c[0] === 'insert')
    expect(insert?.[1]?.data).not.toHaveProperty('dedupe_scope')
  })

  it('skips the insert when a scoped signal already exists for the run', async () => {
    const { itemsCalls } = mockDb({ dedupeRows: [{ id: 'existing' }] })
    const created = await emitSignal(ctx(), {
      type_slug: 'demo_signal',
      action: 'workflow_completed',
      dedupe_scope: 'run-1',
    })
    expect(created).toBeNull()
    expect(itemsCalls.some((c) => c[0] === 'insert')).toBe(false)
  })

  it('skips the dedupe lookup entirely when dedupe is false', async () => {
    const { itemsCalls } = mockDb()
    await emitSignal(ctx(), {
      type_slug: 'demo_signal',
      action: 'demo_started',
      dedupe: false,
    })
    expect(itemsCalls.some((c) => c[0] === 'eq' && c[1] === 'data->>action_type')).toBe(false)
    expect(itemsCalls.some((c) => c[0] === 'insert')).toBe(true)
  })

  it('returns null when the signal type is not installed', async () => {
    vi.mocked(adminDb.from).mockImplementation((table: string) =>
      chain([], table === 'types' ? { data: null, error: null } : { data: [], error: null })
    )
    const created = await emitSignal(ctx(), {
      type_slug: 'demo_signal',
      action: 'demo_started',
    })
    expect(created).toBeNull()
  })
})
