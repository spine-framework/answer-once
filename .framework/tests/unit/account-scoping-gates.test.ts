import { describe, it, expect, vi, beforeEach } from 'vitest'

// S-007: machine principals resolve to the service-role adminDb via
// getPrincipalDb, so HTTP handlers that query on ctx.db or adminDb without an
// account filter were reachable cross-account by any API key. These tests pin
// the gates: non-system principals are scoped to ctx.accountId (or denied
// outright for platform-wide actions); system_admin and the internal
// SYSTEM_PRINCIPAL keep working.

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

vi.mock('../../functions/_shared/llm.ts', () => ({
  callOpenAIEmbeddings: vi.fn(async (_ctx: any, inputs: string[]) => ({
    data: inputs.map((_t, i) => ({ index: i, embedding: [0.1, 0.2, 0.3] })),
  })),
  callOpenAIChat: vi.fn(async () => ({ choices: [{ message: { content: 'summary' } }] })),
  callOpenAI: vi.fn(async () => ({})),
  callEmbeddingApi: vi.fn(async (inputs: string[]) => inputs.map(() => '[0.1,0.2]')),
}))

vi.mock('../../functions/_shared/logging.ts', () => ({
  resolveAppUuid: vi.fn(async (ref: any) => ref ?? null),
}))

// admin-data pulls in permissions/trigger-engine — integration-outbound only
// calls get/update when record_id / update_record are set.
vi.mock('../../functions/admin-data.ts', () => ({
  get: vi.fn(),
  update: vi.fn(),
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { cleanup as logsCleanup } from '../../functions/logs.ts'
import {
  list as apiKeysList,
  get as apiKeysGet,
  validate as apiKeysValidate,
  revoke as apiKeysRevoke,
  listUsageLogs,
} from '../../functions/api-keys.ts'
import {
  generate as embeddingsGenerate,
  revoke as embeddingsRevoke,
  approve as embeddingsApprove,
  list as embeddingsList,
  searchSimilar,
} from '../../functions/embeddings.ts'
import { execute as executeOutbound } from '../../functions/integration-outbound.ts'

// Chainable query-builder stub — every filter/terminal method returns the
// builder except single/maybeSingle/await, which resolve to the result.
function q(result: { data?: any; error?: any; count?: any }) {
  const b: any = {}
  const chainers = ['select', 'eq', 'in', 'is', 'ilike', 'filter', 'not', 'order',
    'limit', 'update', 'insert', 'upsert', 'delete', 'neq', 'or', 'contains',
    'gte', 'lte', 'lt', 'range', 'textSearch', 'or']
  for (const m of chainers) b[m] = vi.fn(() => b)
  b.single = vi.fn(async () => result)
  b.maybeSingle = vi.fn(async () => result)
  b.then = (onF: any, onR: any) => Promise.resolve(result).then(onF, onR)
  return b
}

let queue: any[] = []
let built: any[] = []
let dbBuilt: any[] = []

beforeEach(() => {
  queue = []
  built = []
  dbBuilt = []
  vi.clearAllMocks()
  vi.mocked(adminDb.from).mockImplementation(() => {
    const b = queue.length ? queue.shift() : q({ data: null, error: null })
    built.push(b)
    return b
  })
})

// ctx.db for non-system callers. In production a machine principal's ctx.db IS
// adminDb — the tests assert the .eq('account_id', ...) filter lands on it.
function stubDb() {
  return {
    from: vi.fn((table: string) => {
      const b = queue.length ? queue.shift() : q({ data: null, error: null })
      ;(b as any).__table = table
      dbBuilt.push(b)
      return b
    }),
    rpc: vi.fn(async () => ({ data: [], error: null })),
  }
}

const scopedMachine = (accountId: string | null = 'acct-1', extra: any = {}) => ({
  id: 'key-1',
  type: 'machine',
  accountId,
  roles: [],
  scopes: ['logs:read'],
  isInternal: false,
  machineType: 'integration',
  provenance: { sourceType: 'api_key' },
  ...extra,
})

const internalScopedMachine = (accountId: string | null = 'acct-1') => ({
  ...scopedMachine(accountId),
  isInternal: true,
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

describe('logs cleanup gate (S-007)', () => {
  it('denies a scoped machine principal with statusCode 403', async () => {
    const ctx = makeCtx(scopedMachine())
    await expect(logsCleanup(ctx, { days_to_keep: 30 })).rejects.toMatchObject({ statusCode: 403 })
    expect(ctx.db.from).not.toHaveBeenCalled()
  })

  it('allows a system_admin principal', async () => {
    queue.push(q({ data: [{ id: 'l1' }], error: null }))
    const ctx = makeCtx(systemAdmin())
    const res = await logsCleanup(ctx, { days_to_keep: 30 })
    expect(res.deleted_count).toBe(1)
  })

  it('allows the internal SYSTEM_PRINCIPAL (no account binding)', async () => {
    queue.push(q({ data: [{ id: 'l1' }], error: null }))
    const ctx = makeCtx(systemPrincipal())
    const res = await logsCleanup(ctx, {})
    expect(res.deleted_count).toBe(1)
  })
})

describe('api-keys account scoping (S-007)', () => {
  it('get scopes the lookup to ctx.accountId for a machine principal', async () => {
    const ctx = makeCtx(scopedMachine())
    await expect(apiKeysGet({ ...ctx, query: { id: 'key-9' } }, {})).resolves.toBeDefined()
    const b = dbBuilt[0]
    expect(b.eq).toHaveBeenCalledWith('id', 'key-9')
    expect(b.eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })

  it('get does not scope for system_admin', async () => {
    queue.push(q({ data: { id: 'key-9', name: 'k' }, error: null }))
    await apiKeysGet({ ...makeCtx(systemAdmin()), query: { id: 'key-9' } }, {})
    const b = built[0]
    const accountEq = b.eq.mock.calls.filter((c: any[]) => c[0] === 'account_id')
    expect(accountEq).toHaveLength(0)
  })

  it('get rejects a non-system principal without account context', async () => {
    const ctx = makeCtx(scopedMachine(null))
    await expect(apiKeysGet({ ...ctx, query: { id: 'key-9' } }, {})).rejects.toThrow('Account context required')
  })

  it('validate scopes the key lookup to ctx.accountId', async () => {
    const ctx = makeCtx(scopedMachine())
    const res = await apiKeysValidate(ctx, { key_value: 'sk_abcdef123456' })
    expect(res.is_valid).toBe(false)
    const b = dbBuilt[0]
    expect(b.eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })

  it('validate requires account context for non-system principals', async () => {
    const ctx = makeCtx(scopedMachine(null))
    await expect(apiKeysValidate(ctx, { key_value: 'sk_abcdef123456' })).rejects.toThrow('Account context required')
  })

  it('revoke scopes the update to ctx.accountId', async () => {
    queue.push(q({ data: { id: 'key-9' }, error: null }))
    const ctx = makeCtx(scopedMachine())
    await apiKeysRevoke(ctx, { id: 'key-9' })
    const b = dbBuilt[0]
    expect(b.eq).toHaveBeenCalledWith('id', 'key-9')
    expect(b.eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })

  it('usage-logs scopes the query to ctx.accountId', async () => {
    const ctx = makeCtx(scopedMachine())
    await listUsageLogs(ctx, {})
    const b = dbBuilt[0]
    expect(b.eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })

  it('list scopes the query to ctx.accountId for machine principals', async () => {
    const ctx = makeCtx(scopedMachine())
    await apiKeysList(ctx, {})
    const b = dbBuilt[0]
    expect(b.eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })
})

describe('embeddings account scoping (S-007)', () => {
  const item = (accountId: string | null) => ({
    id: 'item-1',
    title: 'Doc',
    description: 'body',
    account_id: accountId,
    data: {},
    type: { slug: 'kb_article', design_schema: {} },
  })

  it('generate rejects a scoped caller on another account\u2019s item with 403', async () => {
    queue.push(q({ data: item('acct-2'), error: null }))
    const ctx = makeCtx(scopedMachine())
    await expect(embeddingsGenerate(ctx, { item_id: 'item-1' })).rejects.toMatchObject({ statusCode: 403 })
  })

  it('generate writes vectors under ctx.accountId and ignores account_id_override for scoped callers', async () => {
    queue.push(q({ data: item('acct-1'), error: null })) // items fetch
    queue.push(q({ data: [], error: null }))             // existing embeddings
    const ctx = makeCtx(scopedMachine())
    const res = await embeddingsGenerate(ctx, { item_id: 'item-1', account_id_override: 'acct-9' })
    expect(res.embeddings_created).toBeGreaterThan(0)
    const insertCalls = built.flatMap(b => b.insert?.mock.calls ?? [])
    expect(insertCalls.length).toBeGreaterThan(0)
    for (const [row] of insertCalls) {
      expect(row.account_id).toBe('acct-1')
    }
  })

  it('generate honors account_id_override for system_admin', async () => {
    queue.push(q({ data: item('acct-1'), error: null }))
    queue.push(q({ data: [], error: null }))
    const ctx = makeCtx(systemAdmin())
    await embeddingsGenerate(ctx, { item_id: 'item-1', account_id_override: 'acct-9' })
    const insertCalls = built.flatMap(b => b.insert?.mock.calls ?? [])
    expect(insertCalls.length).toBeGreaterThan(0)
    for (const [row] of insertCalls) {
      expect(row.account_id).toBe('acct-9')
    }
  })

  it('revoke scopes the update to ctx.accountId', async () => {
    queue.push(q({ data: [{ id: 'e1' }], error: null }))
    const ctx = makeCtx(scopedMachine())
    const res = await embeddingsRevoke(ctx, { document_id: 'doc-1' })
    expect(res.revoked_count).toBe(1)
    const b = built[0]
    expect(b.eq).toHaveBeenCalledWith('document_id', 'doc-1')
    expect(b.eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })

  it('revoke does not scope for system_admin', async () => {
    queue.push(q({ data: [{ id: 'e1' }], error: null }))
    const ctx = makeCtx(systemAdmin())
    await embeddingsRevoke(ctx, { document_id: 'doc-1' })
    const accountEq = built[0].eq.mock.calls.filter((c: any[]) => c[0] === 'account_id')
    expect(accountEq).toHaveLength(0)
  })

  it('approve scopes the update to ctx.accountId', async () => {
    queue.push(q({ data: [{ id: 'e1' }], error: null }))
    const ctx = makeCtx(scopedMachine())
    const res = await embeddingsApprove(ctx, { document_id: 'doc-1' })
    expect(res.approved_count).toBe(1)
    expect(built[0].eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })

  it('list scopes embeddings to ctx.accountId for machine principals', async () => {
    const ctx = makeCtx(scopedMachine())
    await embeddingsList(ctx, {})
    expect(dbBuilt[0].eq).toHaveBeenCalledWith('account_id', 'acct-1')
  })

  it('searchSimilar forces filter_account_ids to ctx.accountId for scoped callers', async () => {
    const ctx = makeCtx(scopedMachine())
    await searchSimilar(ctx, {
      query_embedding: [0.1],
      filter_account_ids: ['acct-2'],
    })
    const rpcArgs = vi.mocked(ctx.db.rpc).mock.calls[0][1] as any
    expect(rpcArgs.filter_account_ids).toEqual(['acct-1'])
  })
})

describe('integration-outbound delivery_id account check (S-007)', () => {
  const delivery = (accountId: string | null) => ({
    id: 'del-1',
    account_id: accountId,
    direction: 'outbound',
    status: 'pending',
    attempt_count: 0,
    max_attempts: 3,
    payload: {
      integration_slug: 'generic-http',
      action_config: { url: 'https://hooks.example.com/in' },
    },
  })

  it('rejects a scoped internal key replaying another account\u2019s delivery with 403', async () => {
    queue.push(q({ data: delivery('acct-2'), error: null }))
    const ctx = makeCtx(internalScopedMachine())
    await expect(executeOutbound(ctx, { delivery_id: 'del-1' })).rejects.toMatchObject({ statusCode: 403 })
    // Nothing beyond the delivery lookup should have run.
    expect(vi.mocked(adminDb.from)).toHaveBeenCalledTimes(1)
  })

  it('rejects a non-internal scoped principal touching another account\u2019s delivery with 403', async () => {
    queue.push(q({ data: delivery('acct-2'), error: null }))
    const ctx = makeCtx(scopedMachine())
    await expect(
      executeOutbound(ctx, { delivery_id: 'del-1', integration_slug: 'generic-http', action_config: {} })
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('lets a scoped internal key replay a delivery in its own account', async () => {
    queue.push(q({ data: delivery('acct-1'), error: null }))   // delivery select
    queue.push(q({ data: null, error: null }))                // processing update
    queue.push(q({ data: { id: 'int-1', slug: 'generic-http', credentials: {}, config: { outbound_adapter: 'adapters/generic-webhook-outbound' }, is_active: true }, error: null })) // tenant integration
    queue.push(q({ data: null, error: null }))                // result update

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '{}' })
    vi.stubGlobal('fetch', fetchMock)

    const ctx = makeCtx(internalScopedMachine())
    const res = await executeOutbound(ctx, { delivery_id: 'del-1' })
    expect(res.success).toBe(true)
    expect(res.is_retry).toBe(true)
    vi.unstubAllGlobals()
  })

  it('lets the SYSTEM_PRINCIPAL replay any account\u2019s delivery (cron retry path)', async () => {
    queue.push(q({ data: delivery('acct-2'), error: null }))   // delivery select
    queue.push(q({ data: null, error: null }))                // processing update
    queue.push(q({ data: { id: 'int-1', slug: 'generic-http', credentials: {}, config: { outbound_adapter: 'adapters/generic-webhook-outbound' }, is_active: true }, error: null })) // system integration
    queue.push(q({ data: null, error: null }))                // result update

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '{}' })
    vi.stubGlobal('fetch', fetchMock)

    const ctx = makeCtx(systemPrincipal(), { accountId: null })
    const res = await executeOutbound(ctx, { delivery_id: 'del-1' })
    expect(res.success).toBe(true)
    expect(res.is_retry).toBe(true)
    vi.unstubAllGlobals()
  })
})
