// Tests for F-056: timers created/activated via the API must be armed
// (next_execution set) or they can never fire — get_due_timers requires
// next_execution IS NOT NULL and system-cron is the only consumer.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: fromMock, rpc: vi.fn() },
  joins: {}
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../functions/_shared/permissions.ts', () => ({
  sanitizeRecordData: vi.fn((_ctx: any, record: any) => Promise.resolve(record))
}))

import { create, update, toggle } from '../../functions/timers.ts'

// Chainable stand-in for the supabase-js query builder. Every call on a
// table gets its own builder via a results queue on `db.from`, and all
// insert/update payloads are recorded in `captured`.
function makeBuilder(result: any, captured: Array<{ method: string; args: any[] }>) {
  const b: any = {}
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order']) {
    b[m] = vi.fn((...args: any[]) => { captured.push({ method: m, args }); return b })
  }
  b.single = vi.fn(() => Promise.resolve(result))
  b.maybeSingle = vi.fn(() => Promise.resolve(result))
  b.then = (onFulfilled: any, onRejected?: any) => Promise.resolve(result).then(onFulfilled, onRejected)
  return b
}

let captured: Array<{ method: string; args: any[] }>
let fromResults: any[]

function queueResult(result: any) {
  fromResults.push(result)
}

const ctx: any = {
  requestId: 'req-timer-test',
  principal: { id: 'person-1', type: 'person', accountId: 'acct-1', roles: [{ slug: 'system_admin' }] },
  accountId: 'acct-1',
  appId: null,
  db: {},
  query: {}
}

beforeEach(() => {
  captured = []
  fromResults = []
  fromMock.mockReset()
  fromMock.mockImplementation(() =>
    makeBuilder(fromResults.shift() ?? { data: { id: 'timer-1' }, error: null }, captured))
})

function insertPayload() {
  return captured.find(c => c.method === 'insert')?.args[0]
}
function updatePayload() {
  return captured.find(c => c.method === 'update')?.args[0]
}
const MIN = 60_000

describe('timers.create — F-056 arming', () => {
  it('arms next_execution from config.interval_minutes', async () => {
    const before = Date.now()
    await create(ctx, { name: 'n', timer_type: 'interval', config: { interval_minutes: 15 } })
    const ts = Date.parse(insertPayload().next_execution)
    expect(ts).toBeGreaterThanOrEqual(before + 15 * MIN)
    expect(ts).toBeLessThanOrEqual(Date.now() + 15 * MIN + 1000)
  })

  it('arms next_execution from legacy config.interval_seconds', async () => {
    const before = Date.now()
    await create(ctx, { name: 'n', timer_type: 'interval', config: { interval_seconds: 3600 } })
    const ts = Date.parse(insertPayload().next_execution)
    expect(ts).toBeGreaterThanOrEqual(before + 60 * MIN)
    expect(ts).toBeLessThanOrEqual(Date.now() + 60 * MIN + 1000)
  })

  it('lets an explicit next_execution win over the computed value', async () => {
    const explicit = '2030-01-01T00:00:00.000Z'
    await create(ctx, { name: 'n', timer_type: 'interval', config: { interval_minutes: 5 }, next_execution: explicit })
    expect(insertPayload().next_execution).toBe(explicit)
  })

  it('arms a once timer from config.run_at', async () => {
    const runAt = '2030-06-15T12:00:00.000Z'
    await create(ctx, { name: 'n', timer_type: 'once', config: { run_at: runAt } })
    expect(insertPayload().next_execution).toBe(runAt)
  })

  it('leaves next_execution null when the timer is created inactive', async () => {
    await create(ctx, { name: 'n', timer_type: 'interval', is_active: false, config: { interval_minutes: 15 } })
    expect(insertPayload().next_execution).toBeNull()
    expect(insertPayload().is_active).toBe(false)
  })

  it('leaves next_execution null when no schedule is computable', async () => {
    await create(ctx, { name: 'n', timer_type: 'cron', config: { schedule: '*/5 * * * *' } })
    expect(insertPayload().next_execution).toBeNull()
  })
})

describe('timers.update — F-056 arming', () => {
  it('re-arms next_execution when config changes', async () => {
    queueResult({ data: { config: { interval_minutes: 60 }, is_active: true }, error: null })
    const before = Date.now()
    await update(ctx, { id: 't1', config: { interval_minutes: 10 } })
    const ts = Date.parse(updatePayload().next_execution)
    expect(ts).toBeGreaterThanOrEqual(before + 10 * MIN)
    expect(ts).toBeLessThanOrEqual(Date.now() + 10 * MIN + 1000)
  })

  it('arms next_execution when an inactive timer is activated via update', async () => {
    queueResult({ data: { config: { interval_seconds: 600 }, is_active: false }, error: null })
    const before = Date.now()
    await update(ctx, { id: 't1', is_active: true })
    const ts = Date.parse(updatePayload().next_execution)
    expect(ts).toBeGreaterThanOrEqual(before + 10 * MIN)
    expect(ts).toBeLessThanOrEqual(Date.now() + 10 * MIN + 1000)
  })

  it('passes through an explicit next_execution', async () => {
    const explicit = '2031-03-03T03:03:03.000Z'
    await update(ctx, { id: 't1', next_execution: explicit })
    expect(updatePayload().next_execution).toBe(explicit)
  })

  it('does not touch next_execution for unrelated field updates', async () => {
    await update(ctx, { id: 't1', name: 'renamed' })
    expect(updatePayload().next_execution).toBeUndefined()
  })
})

describe('timers.toggle — F-056 arming', () => {
  it('arms next_execution when activating a never-scheduled timer', async () => {
    queueResult({ data: { is_active: false, name: 'n', config: { interval_minutes: 30 }, next_execution: null }, error: null })
    const before = Date.now()
    await toggle(ctx, { id: 't1' })
    const ts = Date.parse(updatePayload().next_execution)
    expect(ts).toBeGreaterThanOrEqual(before + 30 * MIN)
    expect(ts).toBeLessThanOrEqual(Date.now() + 30 * MIN + 1000)
  })

  it('does not clear next_execution when deactivating', async () => {
    queueResult({ data: { is_active: true, name: 'n', config: { interval_minutes: 30 }, next_execution: '2030-01-01T00:00:00.000Z' }, error: null })
    await toggle(ctx, { id: 't1' })
    expect(updatePayload().is_active).toBe(false)
    expect(updatePayload().next_execution).toBeUndefined()
  })
})
