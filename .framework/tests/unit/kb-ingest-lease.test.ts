// CIL[BEGIN stable_id="~/.framework/tests/unit/kb-ingest-lease.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Unit tests for kbIngest document-lease branches, supersede_keys supersession, and kbRevoke lease clearing"]
// CIL[DOC-RESPONSIBILITY responsibility="Exercise acquire_document_lease outcomes (acquired/reused/processing), token-fenced release, release-on-failure, functionality.kb.supersede_keys-driven archival, and kbRevoke's document_leases delete"]
// CIL[DOC-CONTEXT module="tests/unit/kb-ingest-lease" layer="test-unit" related_files=".framework/functions/_shared/kb.ts,.framework/migrations/054_kb_ingest_lease.sql"]
// CIL[DOC-CONTRACT inputs="none" outputs="vitest assertions" errors="none" side_effects="Mocks _shared/db.ts adminDb (from + rpc) and _shared/llm.ts callOpenAIEmbeddings"]
// CIL[DOC-MICRO logic_summary="Fluent thenable mock records each query's method ops; a resolver inspects the recorded ops to return per-table results (items load vs supersession select vs update, embeddings count/insert/delete, document_leases delete)" notable_decisions="ops are recorded rather than pre-programmed per call so assertions can inspect the .or() supersession filter and delete targets"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="test maintainers"]
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() }
}))

vi.mock('../../functions/_shared/llm.ts', () => ({
  callOpenAIEmbeddings: vi.fn(async (_ctx: any, texts: string[]) => ({
    data: texts.map(() => ({ embedding: [0.1, 0.2, 0.3] }))
  }))
}))

vi.mock('../../functions/_shared/permissions.ts', () => ({
  sanitizeRecordData: vi.fn(async (_ctx: any, record: any) => ({ ...record }))
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { callOpenAIEmbeddings } from '../../functions/_shared/llm.ts'
import { kbIngest, kbRevoke } from '../../functions/_shared/kb.ts'
// CIL[END stable_id="~/.framework/tests/unit/kb-ingest-lease.test.ts:module_header:module_header"]

type Op = [string, any[]]
interface QueryLog { table: string; ops: Op[] }

const ITEM_ID = '11111111-1111-4111-8111-111111111111'
const LEASE_ID = '22222222-2222-4222-8222-222222222222'

function makeRecord(overrides: any = {}): any {
  return {
    id: ITEM_ID,
    account_id: 'acct-1',
    type_id: 'type-1',
    app_id: 'app-1',
    status: 'published',
    title: 'Hello',
    data: { content: 'world content', source_ticket_id: 'ticket-9', slug: 'hello' },
    design_schema: {
      functionality: {
        kb: {
          vector_fields: ['title', 'content'],
          chunk_field: 'content',
          supersede_keys: ['source_ticket_id', 'slug'],
        },
      },
    },
    ...overrides,
  }
}

// Fluent thenable query mock: every method records its op and returns the
// same thenable; awaiting resolves a result chosen by inspecting the ops.
function setupDb(opts: {
  record?: any
  staleItems?: any[]
  embedCount?: number
}) {
  const queries: QueryLog[] = []
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    const q: QueryLog = { table, ops: [] }
    queries.push(q)
    const self: any = new Proxy({}, {
      get(_t, prop: string | symbol) {
        if (prop === 'then') {
          return (res: any, rej?: any) =>
            Promise.resolve(resolveQuery(q, opts)).then(res, rej)
        }
        if (prop === 'catch') {
          return (rej: any) =>
            Promise.resolve(resolveQuery(q, opts)).catch(rej)
        }
        return (...args: any[]) => {
          q.ops.push([prop as string, args])
          return self
        }
      },
    })
    return self
  })
  return queries
}

function resolveQuery(q: QueryLog, opts: any): any {
  const has = (m: string) => q.ops.some(([n]) => n === m)
  if (q.table === 'items') {
    if (has('update')) return { data: null, error: null }
    if (has('or')) return { data: opts.staleItems ?? [], error: null }
    // Per-id point reads: a superseded doc has already been archived by
    // the time kbRevoke's execution-time status fence re-reads it.
    const idEq = q.ops.find(([n, a]) => n === 'eq' && a?.[0] === 'id')?.[1]?.[1]
    if (idEq && idEq !== ITEM_ID) {
      const stale = (opts.staleItems ?? []).find((s: any) => s.id === idEq)
      if (stale) return { data: { ...stale, status: 'archived' }, error: null }
    }
    return { data: opts.record ?? null, error: null }
  }
  if (q.table === 'types') {
    return { data: { slug: 'demo_kb_article', app_id: 'app-1' }, error: null }
  }
  if (q.table === 'embeddings') {
    if (has('insert') || has('delete')) return { data: null, error: null }
    return { count: opts.embedCount ?? 0, data: null, error: null }
  }
  if (q.table === 'document_leases') return { data: null, error: null }
  return { data: null, error: null }
}

function setupRpc(opts: { lease?: any; release?: any }) {
  const calls: Array<[string, any]> = []
  vi.mocked(adminDb.rpc).mockImplementation(async (name: string, params: any) => {
    calls.push([name, params])
    if (name === 'acquire_document_lease') {
      return { data: opts.lease ?? { outcome: 'acquired', lease_id: LEASE_ID }, error: null }
    }
    if (name === 'release_document_lease') {
      return { data: opts.release ?? true, error: null }
    }
    if (name === 'revoke_embeddings_for_item') return { data: 3, error: null }
    return { data: null, error: null }
  })
  return calls
}

const ctx: any = { accountId: 'acct-1', requestId: 'req-t', principal: { id: 'sys' } }
const rpcNamed = (calls: Array<[string, any]>, name: string) =>
  calls.filter(([n]) => n === name).map(([, p]) => p)
const queriesWithOp = (queries: QueryLog[], table: string, op: string) =>
  queries.filter((q) => q.table === table && q.ops.some(([n]) => n === op))

describe('kbIngest — document lease branches', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('acquired: embeds declared vector fields and releases the lease completed', async () => {
    const queries = setupDb({ record: makeRecord() })
    const rpcCalls = setupRpc({})

    const res = await kbIngest(ctx, { id: ITEM_ID })

    expect(res.ok).toBe(true)
    expect(res.count).toBe(2) // title + content chunks
    expect(callOpenAIEmbeddings).toHaveBeenCalledTimes(1)

    const [acquire] = rpcNamed(rpcCalls, 'acquire_document_lease')
    expect(acquire.p_document_id).toBe(ITEM_ID)
    expect(acquire.p_account_id).toBe('acct-1')
    expect(acquire.p_content_hash).toMatch(/^[0-9a-f]{64}$/)

    const [release] = rpcNamed(rpcCalls, 'release_document_lease')
    expect(release).toEqual({
      p_document_id: ITEM_ID,
      p_lease_id: LEASE_ID,
      p_status: 'completed',
    })
    // Old embeddings were cleared inside the lease — via the embeddings
    // delete, not through a document_leases delete on our own row.
    expect(queriesWithOp(queries, 'embeddings', 'delete')).toHaveLength(1)
    expect(queriesWithOp(queries, 'document_leases', 'delete')).toHaveLength(0)
  })

  it('reused: returns the live embeddings count and never calls the embedder', async () => {
    setupDb({ record: makeRecord(), embedCount: 7 })
    const rpcCalls = setupRpc({ lease: { outcome: 'reused' } })

    const res = await kbIngest(ctx, { id: ITEM_ID })

    expect(res).toMatchObject({ ok: true, count: 7 })
    expect(res.message).toContain('reused')
    expect(callOpenAIEmbeddings).not.toHaveBeenCalled()
    expect(rpcNamed(rpcCalls, 'release_document_lease')).toHaveLength(0)
  })

  it('processing: reports in_progress, embeds nothing, releases nothing', async () => {
    setupDb({ record: makeRecord() })
    const rpcCalls = setupRpc({ lease: { outcome: 'processing', lease_id: null } })

    const res = await kbIngest(ctx, { id: ITEM_ID })

    expect(res).toMatchObject({ ok: true, in_progress: true })
    expect(res.message).toContain('in progress')
    expect(callOpenAIEmbeddings).not.toHaveBeenCalled()
    expect(rpcNamed(rpcCalls, 'release_document_lease')).toHaveLength(0)
  })

  it('fenced release: warns but still returns the ingest result', async () => {
    setupDb({ record: makeRecord() })
    setupRpc({ release: false })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const res = await kbIngest(ctx, { id: ITEM_ID })

    expect(res.ok).toBe(true)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('fenced'))
  })

  it('embed failure: propagates and releases the lease as failed', async () => {
    setupDb({ record: makeRecord() })
    const rpcCalls = setupRpc({})
    vi.mocked(callOpenAIEmbeddings).mockRejectedValueOnce(new Error('openai down'))

    await expect(kbIngest(ctx, { id: ITEM_ID })).rejects.toThrow('openai down')

    const [release] = rpcNamed(rpcCalls, 'release_document_lease')
    expect(release.p_status).toBe('failed')
    expect(release.p_lease_id).toBe(LEASE_ID)
  })
})

describe('kbIngest — supersede_keys-driven supersession', () => {
  beforeEach(() => vi.clearAllMocks())

  it('builds the stale match from all declared keys present in record.data', async () => {
    const stale = { id: 'old-1', status: 'published', data: { source_ticket_id: 'ticket-9' } }
    const queries = setupDb({ record: makeRecord(), staleItems: [stale] })
    setupRpc({})

    await kbIngest(ctx, { id: ITEM_ID })

    const [orQuery] = queriesWithOp(queries, 'items', 'or')
    expect(orQuery.ops.find(([n]) => n === 'or')?.[1][0])
      .toBe('data->>source_ticket_id.eq.ticket-9,data->>slug.eq.hello')

    // The stale doc was archived…
    const [update] = queriesWithOp(queries, 'items', 'update')
    const updatePayload = update.ops.find(([n]) => n === 'update')?.[1][0]
    expect(updatePayload.status).toBe('archived')
    expect(updatePayload.data.superseded_by).toBe(ITEM_ID)
    // …and revoked through kbRevoke, which also clears its lease row.
    const leaseDeletes = queriesWithOp(queries, 'document_leases', 'delete')
    expect(leaseDeletes).toHaveLength(1)
    expect(leaseDeletes[0].ops.find(([n]) => n === 'eq')?.[1][1]).toBe('old-1')
  })

  it('skips supersession entirely when supersede_keys is undeclared', async () => {
    const record = makeRecord()
    record.design_schema.functionality.kb.supersede_keys = undefined
    const queries = setupDb({ record })
    setupRpc({})

    await kbIngest(ctx, { id: ITEM_ID })

    expect(queriesWithOp(queries, 'items', 'or')).toHaveLength(0)
    expect(queriesWithOp(queries, 'items', 'update')).toHaveLength(0)
  })

  it('skips keys declared but absent from record.data', async () => {
    const record = makeRecord({ data: { content: 'world content' } }) // no slug/source_ticket_id
    const queries = setupDb({ record })
    setupRpc({})

    await kbIngest(ctx, { id: ITEM_ID })

    expect(queriesWithOp(queries, 'items', 'or')).toHaveLength(0)
  })
})

describe('kbRevoke — lease clearing', () => {
  beforeEach(() => vi.clearAllMocks())

  it('clears embeddings and deletes the document_leases row', async () => {
    const queries = setupDb({})
    const rpcCalls = setupRpc({})

    const res = await kbRevoke(ctx, { id: ITEM_ID })

    expect(res).toMatchObject({ ok: true, count: 3 })
    expect(rpcNamed(rpcCalls, 'revoke_embeddings_for_item')[0])
      .toEqual({ p_item_id: ITEM_ID })
    const [embDelete] = queriesWithOp(queries, 'embeddings', 'delete')
    expect(embDelete.ops.find(([n]) => n === 'eq')?.[1]).toEqual(['document_id', ITEM_ID])
    const [leaseDelete] = queriesWithOp(queries, 'document_leases', 'delete')
    expect(leaseDelete.ops.find(([n]) => n === 'eq')?.[1]).toEqual(['document_id', ITEM_ID])
  })

  it('skips revocation when the document is currently published — stale queued work fence', async () => {
    const queries = setupDb({ record: makeRecord({ status: 'published' }) })
    const rpcCalls = setupRpc({})

    const res = await kbRevoke(ctx, { id: ITEM_ID })

    expect(res).toMatchObject({ ok: true, skipped: true, count: 0 })
    expect(rpcNamed(rpcCalls, 'revoke_embeddings_for_item')).toHaveLength(0)
    expect(queriesWithOp(queries, 'embeddings', 'delete')).toHaveLength(0)
    expect(queriesWithOp(queries, 'document_leases', 'delete')).toHaveLength(0)
  })

  it('non-published ingest routes through kbRevoke and clears the lease', async () => {
    const queries = setupDb({ record: makeRecord({ status: 'draft' }) })
    setupRpc({})

    const res = await kbIngest(ctx, { id: ITEM_ID })

    expect(res.message).toContain('not published')
    expect(queriesWithOp(queries, 'document_leases', 'delete')).toHaveLength(1)
    const rpcCalls = vi.mocked(adminDb.rpc).mock.calls.map(([n]) => n)
    expect(rpcCalls).not.toContain('acquire_document_lease')
  })
})
