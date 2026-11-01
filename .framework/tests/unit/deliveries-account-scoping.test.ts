import { describe, it, expect, vi, beforeEach } from 'vitest'

// S-007: deliveries get/retry ran service-role queries (machine principals
// resolve ctx.db to adminDb) with no account filter. get is now scoped to
// ctx.accountId for non-system principals; retry verifies the caller's
// account matches the delivery's before re-executing under SYSTEM_PRINCIPAL.

vi.mock('../../functions/_shared/middleware.ts', () => ({
  createHandler: (fn: any) => fn,
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn(),
  },
  getUserDb: vi.fn(() => ({})),
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined),
  emitActivity: vi.fn().mockResolvedValue(undefined),
}))

const mocks = vi.hoisted(() => ({
  executeOutbound: vi.fn(),
}))

vi.mock('../../functions/integration-outbound.ts', () => ({
  execute: mocks.executeOutbound,
  default: vi.fn(),
}))

const executeOutbound = mocks.executeOutbound

import { get, retry } from '../../functions/deliveries.ts'

function q(result: { data?: any; error?: any }) {
  const b: any = {}
  const chainers = ['select', 'eq', 'in', 'is', 'ilike', 'filter', 'not', 'order',
    'limit', 'update', 'insert', 'upsert', 'delete', 'neq', 'or', 'contains', 'gte', 'lte', 'range']
  for (const m of chainers) b[m] = vi.fn(() => b)
  b.single = vi.fn(async () => result)
  b.maybeSingle = vi.fn(async () => result)
  b.then = (onF: any, onR: any) => Promise.resolve(result).then(onF, onR)
  return b
}

let queue: any[] = []
let dbBuilt: any[] = []

function stubDb() {
  return {
    from: vi.fn(() => {
      const b = queue.length ? queue.shift() : q({ data: null, error: null })
      dbBuilt.push(b)
      return b
    }),
  }
}

beforeEach(() => {
  queue = []
  dbBuilt = []
  vi.clearAllMocks()
  executeOutbound.mockResolvedValue({ success: true, is_retry: true })
})

const scopedMachine = (accountId: string | null = 'acct-1') => ({
  id: 'key-1',
  type: 'machine',
  accountId,
  roles: [],
  scopes: ['deliveries:read'],
  isInternal: false,
  machineType: 'integration',
  provenance: { sourceType: 'api_key' },
})

const systemAdmin = () => ({
  id: 'user-1',
  type: 'human',
  accountId: 'acct-1',
  roles: ['system_admin'],
  provenance: { sourceType: 'jwt' },
})

const systemPrincipal = () => ({
  id: 'system',
  type: 'machine',
  accountId: null,
  roles: [],
  scopes: ['*:*'],
  isInternal: true,
  machineType: 'internal',
  provenance: { sourceType: 'cron' },
})

function makeCtx(principal: any, overrides: any = {}) {
  return {
    requestId: 'req-1',
    principal,
    accountId: principal?.accountId ?? null,
    db: stubDb(),
    query: {},
    headers: {},
    ...overrides,
  }
}

const delivery = (accountId: string | null) => ({
  id: 'del-1',
  account_id: accountId,
  direction: 'outbound',
  status: 'failed',
})

describe('deliveries get account scoping (S-007)', () => {
  it('scopes the lookup to ctx.accountId for a machine principal', async () => {
    queue.push(q({ data: delivery('acct-1'), error: null }))
    const ctx = makeCtx(scopedMachine())
    await get({ ...ctx, query: { id: 'del-1' } }, {})
    const b = dbBuilt[0]
    expect(b.eq).toHaveBeenCalledWith('id', 'del-1')
    expect(b.eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })

  it('does not scope for system_admin', async () => {
    queue.push(q({ data: delivery('acct-2'), error: null }))
    const ctx = makeCtx(systemAdmin())
    const res = await get({ ...ctx, query: { id: 'del-1' } }, {})
    expect(res.id).toBe('del-1')
    const accountEq = dbBuilt[0].eq.mock.calls.filter((c: any[]) => c[0] === 'account_id')
    expect(accountEq).toHaveLength(0)
  })

  it('requires account context for a non-system principal without one', async () => {
    const ctx = makeCtx(scopedMachine(null))
    await expect(get({ ...ctx, query: { id: 'del-1' } }, {})).rejects.toThrow('Account context required')
  })
})

describe('deliveries retry account check (S-007)', () => {
  it('rejects a scoped machine principal retrying another account\u2019s delivery with 403', async () => {
    queue.push(q({ data: delivery('acct-2'), error: null }))
    const ctx = makeCtx(scopedMachine())
    await expect(retry(ctx, { id: 'del-1' })).rejects.toMatchObject({ statusCode: 403 })
    expect(executeOutbound).not.toHaveBeenCalled()
  })

  it('rejects a non-system principal with no account context', async () => {
    queue.push(q({ data: delivery('acct-2'), error: null }))
    const ctx = makeCtx(scopedMachine(null))
    await expect(retry(ctx, { id: 'del-1' })).rejects.toMatchObject({ statusCode: 403 })
    expect(executeOutbound).not.toHaveBeenCalled()
  })

  it('allows a scoped caller to retry its own account\u2019s delivery', async () => {
    queue.push(q({ data: delivery('acct-1'), error: null }))
    const ctx = makeCtx(scopedMachine())
    const res = await retry(ctx, { id: 'del-1' })
    expect(res.success).toBe(true)
    expect(executeOutbound).toHaveBeenCalledOnce()
    const retryCtx = executeOutbound.mock.calls[0][0]
    expect(retryCtx.accountId).toBe('acct-1')
    expect(retryCtx.principal.id).toBe('system')
  })

  it('allows system_admin to retry any account\u2019s delivery', async () => {
    queue.push(q({ data: delivery('acct-2'), error: null }))
    const ctx = makeCtx(systemAdmin())
    const res = await retry(ctx, { id: 'del-1' })
    expect(res.success).toBe(true)
    expect(executeOutbound).toHaveBeenCalledOnce()
  })

  it('allows the internal SYSTEM_PRINCIPAL (scheduled/manual cron path)', async () => {
    queue.push(q({ data: delivery('acct-2'), error: null }))
    const ctx = makeCtx(systemPrincipal())
    const res = await retry(ctx, { id: 'del-1' })
    expect(res.success).toBe(true)
    expect(executeOutbound).toHaveBeenCalledOnce()
  })
})
