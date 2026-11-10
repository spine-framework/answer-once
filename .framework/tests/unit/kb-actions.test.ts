import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() }
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { resolveKnowledgeScope } from '../../functions/_shared/kb.ts'

function makeCtx(): any {
  return { accountId: 'acct-1', db: null, appId: 'test-app' }
}

function appsQuery(knowledge: any) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: { id: 'app-1', slug: 'test-app', required_roles: [], config: { knowledge } },
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

function mockDb(knowledge: any) {
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    if (table === 'apps') return appsQuery(knowledge)
    if (table === 'accounts') return accountsQuery()
    return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() } as any
  })
}

describe('resolveKnowledgeScope — platform action allowlist', () => {
  beforeEach(() => vi.clearAllMocks())

  it('surfaces platformActionItemTypes when the envelope declares platform.actions', async () => {
    mockDb({
      account: { item_types: ['ao_*'] },
      platform: { sources: ['ao_kb_shared'], actions: ['ao_triage_directive'] },
    })
    const scope = await resolveKnowledgeScope(makeCtx(), 'test-app', {})
    expect(scope.platformActionItemTypes).toEqual(['ao_triage_directive'])
  })

  it('defaults platformActionItemTypes to empty when actions is absent', async () => {
    mockDb({
      account: { item_types: ['ao_*'] },
      platform: { sources: ['ao_kb_shared'] },
    })
    const scope = await resolveKnowledgeScope(makeCtx(), 'test-app', {})
    expect(scope.platformActionItemTypes).toEqual([])
  })

  it('keeps platformActionItemTypes empty when the platform corpus is disabled', async () => {
    mockDb({ account: { item_types: ['ao_*'] } })
    const scope = await resolveKnowledgeScope(makeCtx(), 'test-app', {})
    expect(scope.platformActionItemTypes).toEqual([])
  })

  it('retrieval pick does not narrow the action allowlist (executor gate, not a search filter)', async () => {
    mockDb({
      account: { item_types: ['ao_*'] },
      platform: { sources: ['ao_kb_shared'], actions: ['ao_triage_directive'] },
    })
    const scope = await resolveKnowledgeScope(makeCtx(), 'test-app', { item_types: ['ao_kb_article'] })
    expect(scope.platformItemTypes).toEqual([])
    expect(scope.platformActionItemTypes).toEqual(['ao_triage_directive'])
  })
})
