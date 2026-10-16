// CIL[BEGIN stable_id="~/.framework/tests/unit/retrieval-golden.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Golden retrieval contract — pins retrieveKnowledge's observable result set (order, ids, similarity, lexical flags, scope filtering) so latency optimizations can never silently alter ranking or eligibility"]
// CIL[DOC-RESPONSIBILITY responsibility="Snapshot the exact doc lists, mean similarity computation, RRF fusion ordering, security/item-type/source filtering, and denied paths for a fixed mock corpus"]
// CIL[DOC-CONTEXT module="tests/unit/retrieval-golden" layer="test-unit" related_files=".framework/functions/_shared/agent-runner.ts,.framework/functions/_shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="assertions on retrieveKnowledge return shape" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Synchronous mock harness (no deferreds) — apps/envelope, embeddings lexical rows, match_embeddings per vector type, items hydration; asserts exact document_id ordering and similarity/meanSimilarity values so perf refactors must produce byte-equivalent result sets"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework maintainers"]
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CoreContext } from '../../functions/_shared/middleware.ts'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() }
}))
vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined)
}))
vi.mock('../../functions/_shared/outcomes.ts', () => ({
  emitOutcome: vi.fn().mockResolvedValue(undefined)
}))
vi.mock('../../functions/_shared/llm.ts', () => ({
  callOpenAIChat: vi.fn(),
  callOpenAIEmbeddings: vi.fn().mockResolvedValue({ data: [{ embedding: [0.1, 0.2, 0.3] }] })
}))
vi.mock('../../functions/admin-data.ts', () => ({ create: vi.fn() }))
vi.mock('../../functions/integration-outbound.ts', () => ({ execute: vi.fn() }))
vi.mock('../../functions/_shared/pipeline-runner.ts', () => ({ runPipeline: vi.fn() }))
vi.mock('../../functions/_shared/funnel.ts', () => ({
  emitSignal: vi.fn().mockResolvedValue(undefined),
  accountDataFlag: vi.fn().mockResolvedValue(false)
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { retrieveKnowledge, executeToolAction, computeEvidenceState, hasInRangeCitationMarker, ensureInlineCitations } from '../../functions/_shared/agent-runner.ts'
import { callOpenAIEmbeddings } from '../../functions/_shared/llm.ts'

function makeCtx(overrides: Partial<CoreContext> = {}): CoreContext {
  return {
    principal: { id: 'person-1', type: 'human', accountId: 'acct-1', roles: ['member'] },
    accountId: 'acct-1',
    requestId: 'req-test',
    ...overrides
  } as CoreContext
}

// ─── Fixture corpus ──────────────────────────────────────────────────────────
// IDs are real-shaped UUIDs so hydration goes through the uuid branch.
const DOC = {
  strong: '11111111-1111-4111-8111-111111111111',
  mid:    '22222222-2222-4222-8222-222222222222',
  weak:   '33333333-3333-4333-8333-333333333333',
  restricted: '44444444-4444-4444-8444-444444444444',
  otherAcct:  '55555555-5555-4555-8555-555555555555',
  lexicalOnly: '66666666-6666-4666-8666-666666666666',
}

const ITEM_ROWS = [
  { id: DOC.strong, title: 'Strong Article', data: { content: 'Full body of the strong article' } },
  { id: DOC.mid, title: 'Mid Article', data: {} },
  { id: DOC.weak, title: 'Weak Article', data: {} },
  { id: DOC.restricted, title: 'Restricted Doc', data: {} },
  { id: DOC.otherAcct, title: 'Other Acct Doc', data: {} },
  { id: DOC.lexicalOnly, title: 'Lexical Only', data: {} },
]

function vectorRow(id: string, similarity: number, opts: {
  vectorType?: string, itemType?: string, security?: string, accountId?: string, content?: string
} = {}) {
  return {
    document_id: id,
    content: opts.content ?? `content for ${id}`,
    metadata: {
      item_type: opts.itemType ?? 'kb_article',
      vector_type: opts.vectorType ?? 'semantic',
      ...(opts.security ? { security_level: opts.security } : {}),
    },
    similarity,
    account_id: opts.accountId ?? 'acct-1',
  }
}

// Mock wiring: apps returns the envelope; embeddings returns lexical rows via
// textSearch; match_embeddings returns rows keyed on filter_vector_type;
// items hydrates document ids.
function setupRetrieval(opts: {
  envelope?: any
  appsError?: any
  vectorRows?: Record<string, any[]> // keyed by vector_type
  lexicalRows?: any[]
  lexicalError?: any
  items?: any[]
} = {}) {
  // envelope: undefined → default {account:true}; null → config.knowledge absent; {} → empty envelope
  const envelope = opts.envelope === undefined ? { account: true } : opts.envelope
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    if (table === 'apps') {
      const q: any = {
        select: vi.fn(() => q), eq: vi.fn(() => q),
        maybeSingle: vi.fn(() => Promise.resolve(
          opts.appsError
            ? { data: null, error: opts.appsError }
            : { data: { id: 'app-1', slug: 'test-app', required_roles: [], config: envelope === null ? {} : { knowledge: envelope } }, error: null }
        )),
      }
      return q
    }
    if (table === 'accounts') {
      const q: any = {
        select: vi.fn(() => q), eq: vi.fn(() => q),
        maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'sys-acct' }, error: null })),
      }
      return q
    }
    if (table === 'embeddings') {
      const q: any = {
        select: vi.fn(() => q), in: vi.fn(() => q), is: vi.fn(() => q),
        not: vi.fn(() => q), or: vi.fn(() => q), textSearch: vi.fn(() => q),
        limit: vi.fn(() => q),
        then: (onF: any, onR: any) => Promise.resolve(
          opts.lexicalError ? { data: null, error: opts.lexicalError } : { data: opts.lexicalRows ?? [], error: null }
        ).then(onF, onR),
      }
      return q
    }
    if (table === 'items') {
      const q: any = {
        select: vi.fn(() => q),
        in: vi.fn((_field: string, ids: any[]) =>
          Promise.resolve({ data: (opts.items ?? ITEM_ROWS).filter((i) => ids.includes(i.id)), error: null })),
      }
      return q
    }
    return {} as any
  })
  vi.mocked(adminDb.rpc).mockImplementation((name: string, args: any) => {
    if (name !== 'match_embeddings') return Promise.resolve({ data: null, error: null }) as any
    const rows = opts.vectorRows?.[args?.filter_vector_type] ?? []
    return Promise.resolve({ data: rows, error: null }) as any
  })
}

function lexicalRow(id: string, opts: { itemType?: string; accountId?: string } = {}) {
  return {
    document_id: id,
    content: `lexical content for ${id}`,
    metadata: { item_type: opts.itemType ?? 'kb_article' },
    account_id: opts.accountId ?? 'acct-1',
  }
}

const POLICY = { vector_types: ['semantic'] }
const APP = 'test-app'

describe('retrieveKnowledge — golden result sets', () => {
  beforeEach(() => vi.clearAllMocks())

  it('orders by RRF-fused rank: vector+lexical hit beats single-source hits', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9), vectorRow(DOC.mid, 0.6)] },
      lexicalRows: [lexicalRow(DOC.strong), lexicalRow(DOC.lexicalOnly)],
    })
    const { docs } = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    const ids = docs.map((d: any) => d.document_id)
    // strong: vector#0 + lexical#0 → 2/(61). mid: vector#1 → 1/62.
    // lexicalOnly: lexical#1 → 1/62. mid vs lexicalOnly tie on score — order
    // by insertion (mid inserted first via vector list).
    expect(ids).toEqual([DOC.strong, DOC.mid, DOC.lexicalOnly])
    expect(docs.find((d: any) => d.document_id === DOC.strong).matched_lexically).toBe(true)
    expect(docs.find((d: any) => d.document_id === DOC.mid).matched_lexically).toBe(false)
    expect(docs.find((d: any) => d.document_id === DOC.lexicalOnly).matched_lexically).toBe(true)
  })

  it('computes meanSimilarity over top-3 RRF docs that have similarity > 0 (lexical-only excluded)', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9), vectorRow(DOC.mid, 0.6)] },
      lexicalRows: [lexicalRow(DOC.strong), lexicalRow(DOC.lexicalOnly)],
    })
    const { meanSimilarity } = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(meanSimilarity).toBeCloseTo((0.9 + 0.6) / 2, 6)
  })

  it('drops rows below the 0.15 similarity floor and restricted rows from other accounts', async () => {
    setupRetrieval({
      vectorRows: {
        semantic: [
          vectorRow(DOC.strong, 0.9),
          vectorRow(DOC.weak, 0.10),                                    // below floor
          vectorRow(DOC.restricted, 0.95, { security: 'restricted', accountId: 'acct-other' }),
        ],
      },
      lexicalRows: [],
    })
    const { docs } = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(docs.map((d: any) => d.document_id)).toEqual([DOC.strong])
  })

  it('honors max_security_level — absent security_level defaults to internal, so external-only excludes it', async () => {
    setupRetrieval({
      vectorRows: {
        semantic: [
          vectorRow(DOC.strong, 0.9),                                                    // internal — excluded at 'external'
          vectorRow(DOC.lexicalOnly, 0.8, { security: 'external' }),                     // allowed
          vectorRow(DOC.mid, 0.95, { security: 'restricted', accountId: 'acct-1' }),     // own restricted — still excluded
        ],
      },
      lexicalRows: [],
    })
    const { docs } = await retrieveKnowledge(
      'query', [], 'acct-1', { ...POLICY, max_security_level: 'external' }, makeCtx(), APP)
    expect(docs.map((d: any) => d.document_id)).toEqual([DOC.lexicalOnly])
  })

  it('max_security_level internal admits internal + external but not restricted', async () => {
    setupRetrieval({
      vectorRows: {
        semantic: [
          vectorRow(DOC.strong, 0.9),                                                    // default internal — allowed
          vectorRow(DOC.mid, 0.95, { security: 'restricted', accountId: 'acct-1' }),     // own restricted — excluded
        ],
      },
      lexicalRows: [],
    })
    const { docs } = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(docs.map((d: any) => d.document_id)).toEqual([DOC.strong])
  })

  it('scopes to knowledge_sources pick when provided', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9), vectorRow(DOC.mid, 0.8)] },
      lexicalRows: [],
    })
    const { docs } = await retrieveKnowledge('query', [DOC.strong], 'acct-1', POLICY, makeCtx(), APP)
    expect(docs.map((d: any) => d.document_id)).toEqual([DOC.strong])
  })

  it('returns empty + zero mean when nothing matches (no-result query)', async () => {
    setupRetrieval({ vectorRows: { semantic: [] }, lexicalRows: [] })
    const res = await retrieveKnowledge('zzzz no matches', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(res.docs).toEqual([])
    expect(res.meanSimilarity).toBe(0)
  })

  it('survives lexical failure — vector results still return', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9)] },
      lexicalError: { message: 'fts error' },
    })
    const { docs } = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(docs.map((d: any) => d.document_id)).toEqual([DOC.strong])
  })

  it('survives vector/embedding failure — lexical results still return', async () => {
    const { callOpenAIEmbeddings } = await import('../../functions/_shared/llm.ts')
    vi.mocked(callOpenAIEmbeddings).mockRejectedValueOnce(new Error('embed fail'))
    setupRetrieval({ lexicalRows: [lexicalRow(DOC.lexicalOnly)] })
    const { docs } = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(docs.map((d: any) => d.document_id)).toEqual([DOC.lexicalOnly])
    expect(docs[0].matched_lexically).toBe(true)
  })

  it('denies when the app has a knowledge key permitting no corpora (empty envelope)', async () => {
    setupRetrieval({ envelope: {} })
    const res = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(res.docs).toEqual([])
    expect(res.denied).toBe(true)
    expect(res.deniedReason).toContain('empty_scope')
  })

  it('denies when the app declares no knowledge envelope at all', async () => {
    // config.knowledge absent entirely — stronger deny reason
    setupRetrieval({ envelope: null })
    const res = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(res.docs).toEqual([])
    expect(res.denied).toBe(true)
    expect(res.deniedReason).toContain('no_knowledge_envelope')
  })

  it('multi-vector-type: merges channels, dedupes by document_id keeping max similarity', async () => {
    setupRetrieval({
      vectorRows: {
        semantic: [
          vectorRow(DOC.strong, 0.7, { vectorType: 'semantic', content: 'SEMANTIC body for strong' }),
          vectorRow(DOC.mid, 0.6, { vectorType: 'semantic' }),
        ],
        title:    [
          vectorRow(DOC.strong, 0.95, { vectorType: 'title', content: 'TITLE string only' }),
          vectorRow(DOC.weak, 0.5, { vectorType: 'title' }),
        ],
      },
      lexicalRows: [],
      // Items without data.content so the title→non-title content swap is
      // observable (full-document expansion would otherwise overwrite it).
      items: [
        { id: DOC.strong, title: 'Strong Article', data: {} },
        { id: DOC.mid, title: 'Mid Article', data: {} },
        { id: DOC.weak, title: 'Weak Article', data: {} },
      ],
    })
    const { docs } = await retrieveKnowledge('query', [], 'acct-1', { vector_types: ['semantic', 'title'] }, makeCtx(), APP)
    const strong = docs.find((d: any) => d.document_id === DOC.strong)
    expect(strong.similarity).toBe(0.95)            // max across channels
    // Title match swaps in the semantic channel's body content
    expect(strong.content).toContain('SEMANTIC body for strong')
    expect(docs.map((d: any) => d.document_id)).toEqual([DOC.strong, DOC.mid, DOC.weak])
  })

  it('envelope item_types restrict results even when the RPC returns them', async () => {
    setupRetrieval({
      envelope: { account: { item_types: ['kb_article'] } },
      vectorRows: {
        semantic: [
          vectorRow(DOC.strong, 0.9, { itemType: 'kb_article' }),
          vectorRow(DOC.mid, 0.95, { itemType: 'secret_doc' }),  // outside envelope types
        ],
      },
      lexicalRows: [],
    })
    const { docs } = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(docs.map((d: any) => d.document_id)).toEqual([DOC.strong])
  })

  it('hydrates titles and expands full document body for small articles', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9)] },
      lexicalRows: [],
    })
    const { docs } = await retrieveKnowledge('query', [], 'acct-1', POLICY, makeCtx(), APP)
    expect(docs[0].title).toBe('Strong Article')
    expect(docs[0].content).toBe('Full body of the strong article')
    expect(docs[0].full_document).toBe(true)
  })
})


// ─── Episode-scoped retrieval cache (P1) ─────────────────────────────────────
// search_knowledge tool calls keyed by normalized query + policy + scope reuse
// the hydrated docs already fetched for this episode — identical identity hits,
// reformulated queries miss by design.
describe('episode retrieval cache — search_knowledge', () => {
  beforeEach(() => vi.clearAllMocks())

  const toolAction = { handler: 'search_knowledge' }

  it('second identical query returns cached docs without a new embed/search', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9), vectorRow(DOC.mid, 0.7)] },
      lexicalRows: [],
    })
    const cache: Record<string, any> = {}
    const ctx = makeCtx({ appId: APP } as any)
    const runCtx = { retrievalCache: cache }

    const r1 = await executeToolAction(toolAction, { query: 'what is cil', limit: 5 }, ctx, runCtx)
    const embedsAfterFirst = vi.mocked(callOpenAIEmbeddings).mock.calls.length
    const rpcAfterFirst = vi.mocked(adminDb.rpc).mock.calls.length
    expect(r1.results.map((d: any) => d.document_id)).toEqual([DOC.strong, DOC.mid])
    expect(r1.cached).toBeUndefined()

    const r2 = await executeToolAction(toolAction, { query: 'what is cil', limit: 5 }, ctx, runCtx)
    expect(r2.results.map((d: any) => d.document_id)).toEqual([DOC.strong, DOC.mid])
    expect(r2.cached).toBe(true)
    expect(vi.mocked(callOpenAIEmbeddings).mock.calls.length).toBe(embedsAfterFirst)
    expect(vi.mocked(adminDb.rpc).mock.calls.length).toBe(rpcAfterFirst)
  })

  it('normalization: case/whitespace variants of the same query hit', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9)] },
      lexicalRows: [],
    })
    const cache: Record<string, any> = {}
    const ctx = makeCtx({ appId: APP } as any)
    const runCtx = { retrievalCache: cache }

    await executeToolAction(toolAction, { query: 'what is cil' }, ctx, runCtx)
    const embeds = vi.mocked(callOpenAIEmbeddings).mock.calls.length

    const r = await executeToolAction(toolAction, { query: '  What  Is   CIL ' }, ctx, runCtx)
    expect(r.cached).toBe(true)
    expect(vi.mocked(callOpenAIEmbeddings).mock.calls.length).toBe(embeds)
  })

  it('a reformulated query is a deliberate miss — real retrieval runs', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9)] },
      lexicalRows: [],
    })
    const cache: Record<string, any> = {}
    const ctx = makeCtx({ appId: APP } as any)
    const runCtx = { retrievalCache: cache }

    await executeToolAction(toolAction, { query: 'what is cil' }, ctx, runCtx)
    const embeds = vi.mocked(callOpenAIEmbeddings).mock.calls.length

    const r = await executeToolAction(toolAction, { query: 'code intelligence layer markers' }, ctx, runCtx)
    expect(r.cached).toBeUndefined()
    expect(vi.mocked(callOpenAIEmbeddings).mock.calls.length).toBeGreaterThan(embeds)
    // …and that second query is now cached too
    const r2 = await executeToolAction(toolAction, { query: 'code intelligence layer markers' }, ctx, runCtx)
    expect(r2.cached).toBe(true)
  })

  it('policy difference (vector_types) produces a different key → miss', async () => {
    setupRetrieval({
      vectorRows: {
        semantic: [vectorRow(DOC.strong, 0.9)],
        title: [vectorRow(DOC.mid, 0.8, { vectorType: 'title' })],
      },
      lexicalRows: [],
    })
    const cache: Record<string, any> = {}
    const ctx = makeCtx({ appId: APP } as any)
    const semanticCtx = {
      retrievalCache: cache,
      config: { promptConfig: { metadata: { retrieval_policy: { vector_types: ['semantic'] } } }, agent: {} },
    }
    const titleCtx = {
      retrievalCache: cache,
      config: { promptConfig: { metadata: { retrieval_policy: { vector_types: ['title'] } } }, agent: {} },
    }
    await executeToolAction(toolAction, { query: 'q' }, ctx, semanticCtx as any)
    const embeds = vi.mocked(callOpenAIEmbeddings).mock.calls.length
    const r = await executeToolAction(toolAction, { query: 'q' }, ctx, titleCtx as any)
    expect(r.cached).toBeUndefined()
    expect(vi.mocked(callOpenAIEmbeddings).mock.calls.length).toBeGreaterThan(embeds)
    expect(r.results.map((d: any) => d.document_id)).toEqual([DOC.mid])
  })

  it('denied results are cached and replay the denial, not an empty success', async () => {
    setupRetrieval({ envelope: null }) // no knowledge envelope → denied
    const cache: Record<string, any> = {}
    const ctx = makeCtx({ appId: APP } as any)
    const runCtx = { retrievalCache: cache }

    const r1 = await executeToolAction(toolAction, { query: 'q' }, ctx, runCtx)
    expect(r1.error).toContain('knowledge_denied')
    const embeds = vi.mocked(callOpenAIEmbeddings).mock.calls.length

    const r2 = await executeToolAction(toolAction, { query: 'q' }, ctx, runCtx)
    expect(r2.error).toContain('knowledge_denied')
    expect(r2.cached).toBe(true)
    expect(vi.mocked(callOpenAIEmbeddings).mock.calls.length).toBe(embeds)
  })

  it('limit slices post-cache — different limits share one entry', async () => {
    setupRetrieval({
      vectorRows: { semantic: [vectorRow(DOC.strong, 0.9), vectorRow(DOC.mid, 0.7)] },
      lexicalRows: [],
    })
    const cache: Record<string, any> = {}
    const ctx = makeCtx({ appId: APP } as any)
    const runCtx = { retrievalCache: cache }

    const r1 = await executeToolAction(toolAction, { query: 'q', limit: 1 }, ctx, runCtx)
    expect(r1.results).toHaveLength(1)
    const r2 = await executeToolAction(toolAction, { query: 'q', limit: 5 }, ctx, runCtx)
    expect(r2.cached).toBe(true)
    expect(r2.results).toHaveLength(2)
  })
})


// ─── Evidence-state recalibration + citation proof (P6) ──────────────────────
// evidence_found requires aggregate mean >= 0.35 OR a decisive top hit >= 0.5 —
// a paraphrased query that puts the right article at rank 1 with a noisy tail
// must not read 'incomplete'. And any evidence_found answer must carry a
// resolvable [n] marker; citation repair runs before the gate.
describe('computeEvidenceState — top-hit path', () => {
  const doc = (similarity: number) => ({ document_id: 'x', similarity })

  it('strong top hit + weak tail → evidence_found (the paraphrase case)', () => {
    const docs = [doc(0.62), doc(0.22), doc(0.18), doc(0.15)]
    const mean = 0.29 // (0.62+0.22+0.18+0.15)/4 — below 0.35
    expect(computeEvidenceState(docs, mean)).toBe('evidence_found')
  })

  it('strong mean still passes without a top hit', () => {
    const docs = [doc(0.4), doc(0.38), doc(0.3)]
    expect(computeEvidenceState(docs, 0.36)).toBe('evidence_found')
  })

  it('all-weak results stay incomplete', () => {
    const docs = [doc(0.3), doc(0.25), doc(0.2)]
    expect(computeEvidenceState(docs, 0.25)).toBe('incomplete')
  })

  it('a lone top hit below the decisive bar is still incomplete', () => {
    const docs = [doc(0.45), doc(0.2), doc(0.18)]
    expect(computeEvidenceState(docs, 0.27)).toBe('incomplete')
  })

  it('no docs → not_established', () => {
    expect(computeEvidenceState([], 0)).toBe('not_established')
    expect(computeEvidenceState(undefined, 0)).toBe('not_established')
  })
})

describe('citation proof — hasInRangeCitationMarker + ensureInlineCitations', () => {
  const sources = [{ document_id: 'a' }, { document_id: 'b' }]

  it('an in-range marker is proof', () => {
    expect(hasInRangeCitationMarker('The answer is X [1].', 2)).toBe(true)
  })

  it('out-of-range markers are not proof', () => {
    expect(hasInRangeCitationMarker('See [9] for details.', 2)).toBe(false)
  })

  it('no markers is not proof (unlike extractCitedSources fallback)', () => {
    expect(hasInRangeCitationMarker('A plain answer with no citations.', 2)).toBe(false)
  })

  it('ensureInlineCitations repair produces a provable marker', () => {
    const repaired = ensureInlineCitations('A grounded answer with no markers.', sources)
    expect(hasInRangeCitationMarker(repaired, sources.length)).toBe(true)
  })
})
