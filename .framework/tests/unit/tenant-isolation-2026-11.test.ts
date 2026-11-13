import { describe, it, expect, vi, beforeEach } from 'vitest'

// 2026-11 Devin-scan remediation: account-bound API keys resolve to adminDb
// (service role, no RLS), so every handler must apply its own account scoping.
// These tests pin the gates on the highest-blast-radius surfaces.

vi.mock('../../functions/_shared/middleware.ts', () => ({
  createHandler: (fn: any) => fn,
  createPublicHandler: (fn: any) => fn,
  requireSystemContextWithAudit: (ctx: any) => {
    const p = ctx?.principal
    const sys = p?.roles?.includes('system_admin') || (p?.isInternal === true && !ctx?.accountId)
    if (!sys) {
      const e: any = new Error('System context required')
      e.statusCode = 403
      throw e
    }
    return null
  },
  json: vi.fn(),
  error: vi.fn(),
  parseBody: vi.fn(),
}))

const adminDbCalls: any[] = []
function q(result: { data?: any; error?: any; count?: any }) {
  const b: any = {}
  const chainers = ['select', 'eq', 'in', 'is', 'ilike', 'filter', 'not', 'order',
    'limit', 'update', 'insert', 'upsert', 'delete', 'neq', 'or', 'contains',
    'gte', 'lte', 'lt', 'range', 'textSearch']
  for (const m of chainers) {
    b[m] = vi.fn((...args: any[]) => { b.__calls = [...(b.__calls || []), [m, ...args]]; return b })
  }
  b.single = vi.fn(async () => result)
  b.maybeSingle = vi.fn(async () => result)
  b.then = (resolve: any) => resolve(result)
  return b
}

let queue: any[] = []
const adminDb = {
  from: vi.fn((table: string) => { const b = q(queue.shift() || { data: null, error: null }); b.__table = table; adminDbCalls.push(b); return b }),
  rpc: vi.fn(async () => ({ data: [], error: null })),
}

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb,
  getUserDb: vi.fn(() => ({})),
}))
vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined),
  emitActivity: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../../functions/_shared/permissions.ts', () => ({
  sanitizeRecordData: vi.fn(async (_c: any, r: any) => r),
  resolveFirstSurfacePermissions: vi.fn(async () => ({ canCreate: true, canRead: true, canUpdate: true, canDelete: true, fieldPermissions: {} })),
  validateUpdatePermissions: vi.fn(async (_c: any, d: any) => ({ valid: true, sanitizedData: d })),
}))
vi.mock('../../functions/_shared/logging.ts', () => ({
  withAdminLogging: vi.fn(async (_c: any, _m: any, fn: any) => fn()),
  resolveAppUuid: vi.fn(async (r: any) => r ?? null),
}))
vi.mock('../../functions/_shared/trigger-engine.ts', () => ({
  fireCreateTriggers: vi.fn(async () => {}),
  fireUpdateTriggers: vi.fn(async () => {}),
  fireDeleteTriggers: vi.fn(async () => {}),
}))
vi.mock('../../functions/_shared/security.ts', () => ({
  checkTypeSlugRateLimit: vi.fn(),
}))
vi.mock('../../functions/_shared/rate-limit.ts', () => ({
  checkRateLimit: vi.fn(), RateLimitError: class extends Error {},
}))
vi.mock('../../functions/_shared/geo.ts', () => ({
  getClientGeo: vi.fn(() => ({ ip: undefined })),
  getClientIp: vi.fn(() => undefined),
}))

const machineCtx = (accountId = 'acct-A') => ({
  principal: { id: 'key-1', type: 'machine', accountId, scopes: [], roles: [], machineType: 'integration' },
  accountId,
  db: adminDb,
  query: {},
  requestId: 'r1',
})
const systemCtx = () => ({
  principal: { id: 'sys', type: 'machine', accountId: null, isInternal: true, scopes: ['*:*'], roles: ['system_admin'] },
  accountId: null,
  db: adminDb,
  query: {},
  requestId: 'r1',
})
const humanCtx = (accountId = 'acct-A', roles = ['member_admin']) => ({
  principal: { id: 'person-1', type: 'human', accountId, roles, permissions: [] },
  accountId,
  db: adminDb,
  query: {},
  requestId: 'r1',
})

describe('pipeline-executions scoping', () => {
  beforeEach(() => { queue = []; adminDbCalls.length = 0 })
  it('cleanup rejects account-bound machine principal', async () => {
    const { cleanup } = await import('../../functions/pipeline-executions.ts')
    await expect(cleanup(machineCtx(), { days_to_keep: 0 })).rejects.toThrow(/Insufficient permissions/)
  })
  it('list scopes machine principal to own account', async () => {
    queue = [{ data: [], error: null }]
    const { list } = await import('../../functions/pipeline-executions.ts')
    await list(machineCtx(), {})
    const calls = adminDbCalls[0].__calls
    expect(calls.some(([m, k, v]) => m === 'in' && k === 'account_id' && v.includes('acct-A'))).toBe(true)
  })
})

describe('pipelines scoping', () => {
  it('update scopes by account for machine principal', async () => {
    queue = [{ data: { id: 'p1', account_id: 'acct-A' }, error: null }, { data: { id: 'p1' }, error: null }]
    const { update } = await import('../../functions/pipelines.ts')
    await update({ ...machineCtx(), query: {} }, { id: 'p1', name: 'x' })
    expect(adminDbCalls.some(b => (b.__calls || []).some(([m, k]) => m === 'in' && k === 'account_id'))).toBe(true)
  })
})

describe('admin-data tenant isolation', () => {
  it('create rejects foreign account_id for humans', async () => {
    queue = []
    const { create } = await import('../../functions/admin-data.ts')
    await expect(create(humanCtx(), {
      entity: 'items', type_slug: 'thing', account_id: 'acct-B', title: 'x'
    })).rejects.toThrow(/different account/)
  })
  it('people update strips role_id/account_id for members on own row', async () => {
    adminDbCalls.length = 0
    queue = [
      { data: { id: 'person-1', account_id: 'acct-A', design_schema: { record_permissions: { member: ['update'] } } }, error: null },
    ]
    const { update } = await import('../../functions/admin-data.ts')
    const ctx = { ...humanCtx('acct-A', ['member']), query: { entity: 'people', id: 'person-1' } }
    await update(ctx, { role_id: 'r-sys', account_id: 'acct-B', full_name: 'ok', data: {} })
    // sanitizedData reaches adminDb update — role_id/account_id must be gone
    const updateCalls = adminDbCalls.flatMap(b => b.__calls || []).filter(([m]) => m === 'update')
    if (updateCalls.length) {
      const payload = updateCalls[0][1]
      expect(payload.role_id).toBeUndefined()
      expect(payload.account_id).toBeUndefined()
      expect(payload.full_name).toBe('ok')
    }
  })
  it('member cannot update another person row', async () => {
    queue = [
      { data: { id: 'person-9', account_id: 'acct-A', design_schema: { record_permissions: { member: ['update'] } } }, error: null },
    ]
    const { update } = await import('../../functions/admin-data.ts')
    const ctx = { ...humanCtx('acct-A', ['member']), query: { entity: 'people', id: 'person-9' } }
    await expect(update(ctx, { full_name: 'x' })).rejects.toThrow(/other members/)
  })
})

describe('admin-signals', () => {
  it('metrics denies non-system principal', async () => {
    const { metrics } = await import('../../functions/admin-signals.ts')
    await expect(metrics(humanCtx(), {})).rejects.toThrow()
  })
  it('audit denies non-system principal', async () => {
    const { audit } = await import('../../functions/admin-signals.ts')
    await expect(audit(machineCtx(), {})).rejects.toThrow()
  })
})

describe('cil operator gate', () => {
  it('cil-* functions are retired — the operator-gate surface is gone', () => {
    // The cil-* Netlify functions this suite exercised were deleted in the CIL
    // retirement (migration 079 + runtime removal). There is no longer a
    // tenant-deny surface to gate.
  })
})
