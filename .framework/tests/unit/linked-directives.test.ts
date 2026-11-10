import { describe, it, expect, vi, beforeEach } from 'vitest'

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
  callOpenAIEmbeddings: vi.fn().mockResolvedValue({ data: [{ embedding: [0.1] }] })
}))
vi.mock('../../functions/admin-data.ts', () => ({
  create: vi.fn().mockResolvedValue({ id: 'msg-1', content: 'stub' })
}))
vi.mock('../../functions/integration-outbound.ts', () => ({
  execute: vi.fn()
}))
vi.mock('../../functions/_shared/pipeline-runner.ts', () => ({
  runPipeline: vi.fn().mockResolvedValue({ status: 'completed' })
}))
vi.mock('../../functions/_shared/funnel.ts', () => ({
  emitSignal: vi.fn().mockResolvedValue(undefined),
  accountDataFlag: vi.fn().mockResolvedValue(true)
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { resolveLinkedDirectives } from '../../functions/_shared/agent-runner.ts'

const PROMPT_CONFIG = {
  metadata: {
    directive_type_slug: 'ao_triage_directive',
    directive_link_type_slug: 'ao_article_directive',
    directive_recall: { link_limit: 5 },
  },
}

const ARTICLE = {
  document_id: 'art-1',
  title: 'Talk to sales',
  item_type: 'ao_kb_shared',
  similarity: 0.82,
}

const LINKED_DIRECTIVE = {
  id: 'dir-7',
  title: 'Sales handoff',
  data: { status: 'active', match_description: 'customer wants sales to contact them' },
  type: { slug: 'ao_triage_directive' },
}

// link_types resolves via an .in('slug') thenable; links via .in('source_id')
// thenable; items via .in('id') thenable.
function mockDb(opts: {
  links?: any[]
  targets?: any[]
  linkTypes?: any[]
}) {
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    const q: any = {
      select: vi.fn(() => q),
      eq: vi.fn(() => q),
      in: vi.fn(() => q),
      limit: vi.fn(() => q),
      then: (res: any) => {
        const data =
          table === 'link_types' ? (opts.linkTypes ?? [{ id: 'lt-1', slug: 'ao_article_directive' }])
          : table === 'links' ? (opts.links ?? [])
          : table === 'items' ? (opts.targets ?? [])
          : []
        return Promise.resolve({ data, error: null }).then(res)
      },
    }
    return q
  })
}

describe('resolveLinkedDirectives', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns an active directive linked from a retrieved article', async () => {
    mockDb({
      links: [{ source_id: 'art-1', target_id: 'dir-7' }],
      targets: [LINKED_DIRECTIVE],
    })
    const linked = await resolveLinkedDirectives([ARTICLE], 'ao_triage_directive', PROMPT_CONFIG)
    expect(linked).toHaveLength(1)
    expect(linked[0].document_id).toBe('dir-7')
    expect(linked[0].title).toContain('via article "Talk to sales"')
    expect(linked[0].similarity).toBe(0.82)
    expect(linked[0].content).toContain('sales')
  })

  it('returns nothing when no article carries a link', async () => {
    mockDb({ links: [] })
    const linked = await resolveLinkedDirectives([ARTICLE], 'ao_triage_directive', PROMPT_CONFIG)
    expect(linked).toEqual([])
  })

  it('returns nothing when no link type slug is configured', async () => {
    mockDb({ links: [{ source_id: 'art-1', target_id: 'dir-7' }] })
    const linked = await resolveLinkedDirectives([ARTICLE], 'ao_triage_directive', { metadata: {} })
    expect(linked).toEqual([])
  })

  it('ignores link targets that are not the declared directive type', async () => {
    mockDb({
      links: [{ source_id: 'art-1', target_id: 'dir-7' }],
      targets: [{ ...LINKED_DIRECTIVE, type: { slug: 'ao_kb_article' } }],
    })
    const linked = await resolveLinkedDirectives([ARTICLE], 'ao_triage_directive', PROMPT_CONFIG)
    expect(linked).toEqual([])
  })

  it('ignores directives that are not active', async () => {
    mockDb({
      links: [{ source_id: 'art-1', target_id: 'dir-7' }],
      targets: [{ ...LINKED_DIRECTIVE, data: { ...LINKED_DIRECTIVE.data, status: 'suggested' } }],
    })
    const linked = await resolveLinkedDirectives([ARTICLE], 'ao_triage_directive', PROMPT_CONFIG)
    expect(linked).toEqual([])
  })

  it('skips cil_chunk sources (stable_id document ids are not link sources)', async () => {
    mockDb({ links: [{ source_id: 'art-1', target_id: 'dir-7' }], targets: [LINKED_DIRECTIVE] })
    const cilDoc = { document_id: '~/x.ts:f:function', item_type: 'cil_chunk', similarity: 0.9 }
    const linked = await resolveLinkedDirectives([cilDoc], 'ao_triage_directive', PROMPT_CONFIG)
    expect(linked).toEqual([])
  })

  it('honours the link_limit cap', async () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      ...LINKED_DIRECTIVE,
      id: `dir-${i}`,
    }))
    mockDb({
      links: many.map((d) => ({ source_id: 'art-1', target_id: d.id })),
      targets: many,
    })
    const linked = await resolveLinkedDirectives(
      [ARTICLE],
      'ao_triage_directive',
      { metadata: { ...PROMPT_CONFIG.metadata, directive_recall: { link_limit: 3 } } }
    )
    expect(linked).toHaveLength(3)
  })
})
