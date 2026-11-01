import { describe, it, expect, vi, beforeEach } from 'vitest'

// S-011: api-keys create accepted `scopes` and `is_internal` verbatim, so any
// scoped machine caller (service-role ctx.db) could mint a `*:*` or
// `is_internal` key and escalate itself. These tests pin the gate: wildcard
// scopes and internal keys are system-principal-only (403 otherwise), other
// requested scopes are clipped to the caller's own, and an omitted scopes
// list inherits the caller's scopes.

vi.mock('../../functions/_shared/middleware.ts', () => ({
  createHandler: (fn: any) => fn,
  json: vi.fn(),
  error: vi.fn(),
  parseBody: vi.fn(),
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
  getUserDb: vi.fn(() => ({})),
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined),
  emitActivity: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../functions/_shared/permissions.ts', () => ({
  sanitizeRecordData: vi.fn(async (_ctx: any, record: any) => record),
}))

vi.mock('../../functions/_shared/logging.ts', () => ({
  resolveAppUuid: vi.fn(async (ref: any) => ref ?? null),
}))

import { create } from '../../functions/api-keys.ts'

// Chainable query-builder stub — filter/chain methods return the builder;
// single/maybeSingle/await resolve to the queued result.
function q(result: { data?: any; error?: any }) {
  const b: any = {}
  const chainers = ['select', 'eq', 'in', 'is', 'order', 'limit', 'update',
    'insert', 'upsert', 'delete', 'or', 'gte', 'lte', 'range']
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
    rpc: vi.fn(async () => ({ data: [], error: null })),
  }
}

beforeEach(() => {
  queue = []
  dbBuilt = []
  vi.clearAllMocks()
})

const scopedMachine = (scopes: string[] = ['logs:read'], accountId: string | null = 'acct-1') => ({
  id: 'key-1',
  type: 'machine',
  accountId,
  roles: [],
  scopes,
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

// Queue a successful insert for create() and return the builder's insert spy.
function queueInsert() {
  const b = q({ data: { id: 'key-9', name: 'k', key_type: 'inbound' }, error: null })
  queue.push(b)
  return b
}

describe('api-keys create privilege gate (S-011)', () => {
  it('denies a scoped machine caller minting a *:* key with statusCode 403', async () => {
    const ctx = makeCtx(scopedMachine())
    await expect(
      create(ctx, { name: 'escalated', scopes: ['*:*'] })
    ).rejects.toMatchObject({ statusCode: 403 })
    expect(ctx.db.from).not.toHaveBeenCalled()
  })

  it('denies a scoped machine caller minting an is_internal key with statusCode 403', async () => {
    const ctx = makeCtx(scopedMachine())
    await expect(
      create(ctx, { name: 'internal', is_internal: true })
    ).rejects.toMatchObject({ statusCode: 403 })
    expect(ctx.db.from).not.toHaveBeenCalled()
  })

  it('clips requested scopes to the scopes the caller already holds', async () => {
    const b = queueInsert()
    const ctx = makeCtx(scopedMachine(['logs:read', 'items:read']))
    await create(ctx, { name: 'clipped', scopes: ['logs:read', 'admin:write', '*'] })
    expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({
      scopes: ['logs:read'],
      is_internal: false,
    }))
  })

  it('inherits the caller\u2019s own scopes when scopes is omitted', async () => {
    const b = queueInsert()
    const ctx = makeCtx(scopedMachine(['logs:read', 'items:write']))
    await create(ctx, { name: 'inherits' })
    expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({
      scopes: ['logs:read', 'items:write'],
      is_internal: false,
    }))
  })

  it('lets a system_admin mint a wildcard-scoped internal key', async () => {
    const b = queueInsert()
    const ctx = makeCtx(systemAdmin())
    const res = await create(ctx, { name: 'root', scopes: ['*:*'], is_internal: true })
    expect(res.raw_key).toMatch(/^sk_/)
    expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({
      scopes: ['*:*'],
      is_internal: true,
    }))
  })
})
