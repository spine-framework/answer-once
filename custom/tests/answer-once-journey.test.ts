// Unit tests for the Answer Once journey function's handler dispatch and
// input validation. Mocks resolve through the functions/_shared symlink —
// the same framework modules the flat function assembly provides.
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
import { handler } from '../apps/answer-once/functions/custom_answeronce-journey.ts'

const memberCtx = {
  query: {},
  accountId: 'acct-a',
  principal: { id: 'person-1', type: 'human', roles: ['member'] },
  db: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) })) })) })) },
  requestId: 'req-1',
  appId: 'app-1',
}

describe('answer-once journey handler dispatch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects unknown actions', async () => {
    await expect(handler({ ...memberCtx, query: { action: 'nope' } }, {}))
      .rejects.toThrow('Unknown action')
  })

  it('rejects a missing action', async () => {
    await expect(handler(memberCtx, {})).rejects.toThrow('Unknown action')
  })

  it('create_ticket requires a message', async () => {
    await expect(handler({ ...memberCtx, query: { action: 'create_ticket' } }, {}))
      .rejects.toThrow('message is required')
  })

  it('finalize requires ticket_id and thread_id', async () => {
    await expect(handler({ ...memberCtx, query: { action: 'finalize' } }, {}))
      .rejects.toThrow('ticket_id is required')
    await expect(handler({ ...memberCtx, query: { action: 'finalize' } }, { ticket_id: 't1' }))
      .rejects.toThrow('thread_id is required')
  })
})
