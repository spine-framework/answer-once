import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() }
}))

vi.mock('../../functions/_shared/llm.ts', () => ({
  callOpenAIEmbeddings: vi.fn().mockResolvedValue({ data: [{ embedding: [0.1, 0.2] }] })
}))

vi.mock('../../functions/_shared/permissions.ts', () => ({
  sanitizeRecordData: vi.fn(async (_ctx: any, record: any) => ({ ...record }))
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { kbSearch } from '../../functions/_shared/kb.ts'

const UUID1 = '123e4567-e89b-42d3-a456-426614174000'
const SID = '~/.framework/src/types/types.ts:DesignSchema:interface'

function makeCtx(): any {
  return { accountId: 'acct-1', db: null, appId: 'test-app' }
}

function appsQuery() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: {
        id: 'app-1',
        slug: 'test-app',
        required_roles: [],
        config: { knowledge: { account: true, platform: true, cil: { project_ids: ['proj-x'] } } }
      },
      error: null
    })
  } as any
}

function accountsQuery() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'sys-acct' }, error: null })
  } as any
}

function itemsQuery(result: any[], inCalls: [string, any][]) {
  const q: any = {
    select: vi.fn(() => q),
    in: vi.fn((field: string, values: any[]) => { inCalls.push([field, values]); return q }),
    then: (resolve: any) => resolve({ data: result, error: null })
  }
  return q
}

describe('kbSearch — sources filter and stable_id lookup', () => {
  beforeEach(() => vi.clearAllMocks())

  it('excludes cil_chunk matches for sources:["kb"] and never queries items by a non-UUID id', async () => {
    vi.mocked(adminDb.rpc).mockResolvedValue({
      data: [
        { document_id: UUID1, similarity: 0.6, content: 'kb body', metadata: { item_type: 'kb_article', vector_type: 'semantic' }, account_id: 'acct-1' },
        { document_id: SID, similarity: 0.9, content: 'code chunk', metadata: { item_type: 'cil_chunk', vector_type: 'semantic', project_id: 'proj-x' }, account_id: 'sys-acct' },
      ],
      error: null
    } as any)

    const inCalls: [string, any][] = []
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'apps') return appsQuery()
      if (table === 'accounts') return accountsQuery()
      return itemsQuery([
        { id: UUID1, title: 'KB article', status: 'published', data: { content: 'kb body' }, types: { slug: 'kb_article' } }
      ], inCalls)
    })

    const res = await kbSearch(makeCtx(), { query: 'design schema', sources: ['kb'] })

    expect(res.results).toHaveLength(1)
    expect(res.results[0].document_id).toBe(UUID1)
    expect(res.results[0].source).toBe('kb')
    const idCalls = inCalls.filter(([f]) => f === 'id')
    for (const [, vals] of idCalls) {
      expect(vals).not.toContain(SID)
    }
    expect(inCalls.find(([f]) => f === 'data->>stable_id')).toBeUndefined()
  })

  it('keeps retired cil_chunk vectors invisible when sources includes code', async () => {
    // CIL retirement (migration 079) preserves cil_chunk rows non-destructively,
    // but no app can declare a `knowledge.cil` envelope anymore — so no scope
    // grants them and they must not surface through the search API.
    vi.mocked(adminDb.rpc).mockResolvedValue({
      data: [
        { document_id: SID, similarity: 0.9, content: 'code chunk', metadata: { item_type: 'cil_chunk', vector_type: 'semantic', project_id: 'proj-x' }, account_id: 'sys-acct' },
      ],
      error: null
    } as any)

    const inCalls: [string, any][] = []
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'apps') return appsQuery()
      if (table === 'accounts') return accountsQuery()
      return itemsQuery([
        { id: 'chunk-item-1', title: 'DesignSchema', status: 'published', data: { stable_id: SID, kb_type: 'cil_chunk' }, types: { slug: 'cil_chunk' } }
      ], inCalls)
    })

    const res = await kbSearch(makeCtx(), { query: 'design schema', sources: ['code'] })

    expect(res.results).toHaveLength(0)
    expect(inCalls.find(([f]) => f === 'data->>stable_id')).toBeUndefined()
  })
})
