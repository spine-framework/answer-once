// Authorization tests for privileged Answer Once journey actions.
// Company/support-only actions must reject customer-role principals —
// auto_resolve in particular sweeps EVERY account via adminDb, so a member
// caller reaching it is a cross-account privilege escalation.
vi.mock('../apps/answer-once/functions/_shared/middleware.ts', () => ({
  createHandler: (fn: any) => fn,
}))
vi.mock('../apps/answer-once/functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() },
}))
vi.mock('../apps/answer-once/functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../apps/answer-once/functions/_shared/kb.ts', () => ({
  kbIngest: vi.fn().mockResolvedValue({ ok: true, count: 0 }),
}))
vi.mock('../apps/answer-once/functions/_shared/rate-limit.ts', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../apps/answer-once/functions/_shared/security.ts', () => ({
  detectInjection: vi.fn(() => null),
  emitSecurityEvent: vi.fn().mockResolvedValue(undefined),
  getAppSecurityConfig: vi.fn().mockResolvedValue({ prompt_injection: 'block' }),
}))
vi.mock('../apps/answer-once/functions/_shared/agent-runner.ts', () => ({
  kickAgentEpisode: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../apps/answer-once/functions/_shared/resolve-ids.ts', () => ({
  resolveTypeId: vi.fn().mockResolvedValue('type-id'),
  resolveAgentId: vi.fn().mockResolvedValue('agent-id'),
  resolvePromptConfigId: vi.fn().mockResolvedValue('prompt-id'),
}))
vi.mock('../apps/answer-once/functions/admin-data.ts', () => ({
  create: vi.fn().mockResolvedValue({ id: 'created-id' }),
  update: vi.fn().mockResolvedValue({ id: 'updated-id' }),
  get: vi.fn(),
  list: vi.fn(),
  remove: vi.fn(),
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminDb } from '../apps/answer-once/functions/_shared/db.ts'
import { handler } from '../apps/answer-once/functions/custom_answeronce-journey.ts'

const ctxFor = (roles: string[], action?: string) => ({
  query: action ? { action } : {},
  accountId: 'acct-a',
  principal: { id: 'person-1', type: 'human', roles },
  db: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) })) })) })) },
  requestId: 'req-1',
  appId: 'app-1',
})

const COMPANY_ACTIONS = ['auto_resolve', 'analyze_ticket', 'finalize_analysis', 'publish_article', 'republish_article', 'reembed_article'] as const

describe('answer-once privileged action authorization', () => {
  beforeEach(() => vi.clearAllMocks())

  it('member cannot trigger the cross-account auto_resolve sweep', async () => {
    // autoResolvePending uses adminDb unscoped — if a member reaches it, the
    // sweep touches other accounts' tickets. This must be rejected at the
    // action boundary.
    await expect(handler(ctxFor(['member'], 'auto_resolve'), {}))
      .rejects.toThrow()
    expect(adminDb.from).not.toHaveBeenCalledWith('items')
  })

  it('member_admin cannot trigger the cross-account auto_resolve sweep', async () => {
    await expect(handler(ctxFor(['member_admin'], 'auto_resolve'), {}))
      .rejects.toThrow()
    expect(adminDb.from).not.toHaveBeenCalledWith('items')
  })

  it.each(COMPANY_ACTIONS)('member is rejected from %s', async (action) => {
    await expect(handler(ctxFor(['member'], action), {}))
      .rejects.toThrow()
  })

  it('support role can reach auto_resolve', async () => {
    ;(adminDb.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        }),
      }),
    })
    const res = await handler(ctxFor(['support'], 'auto_resolve'), {})
    expect(res).toEqual({ resolved: 0, ticketIds: [] })
  })
})
