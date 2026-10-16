// CIL[DOC-MACRO purpose="Unit tests for createInteraction's optional type_slug override in ai-interactions.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Assert body.type_slug selects the resolved item type (default ai_feedback_record), that a missing type reports the resolved slug in the skip reason, and required-field validation is unchanged"]
// CIL[DOC-CONTEXT module="ai-interactions.test" layer="test-unit" related_files=".framework/functions/ai-interactions.ts"]
// CIL[DOC-CONTRACT inputs="mocked middleware/db/resolve-ids/admin-data/audit/funnel" outputs="expect assertions on resolveTypeId args, create payloads, and skip reasons" errors="none" side_effects="registers vi.mock factories"]
// CIL[DOC-AUDIENCE audience="test"]
// CIL[DOC-STABILITY stability="stable"]
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/middleware.ts', () => ({
  createHandler: (fn: any) => fn,
}))
vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() },
}))
vi.mock('../../functions/_shared/resolve-ids.ts', () => ({
  resolveTypeId: vi.fn().mockImplementation((_k: string, slug: string) => Promise.resolve(`t-${slug}`)),
}))
vi.mock('../../functions/admin-data.ts', () => ({
  create: vi.fn().mockResolvedValue({ id: 'created' }),
  update: vi.fn().mockResolvedValue({ id: 'updated' }),
}))
vi.mock('../../functions/_shared/audit.ts', () => ({
  emitLog: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../../functions/_shared/funnel.ts', () => ({
  emitSignal: vi.fn().mockResolvedValue(undefined),
}))

import { resolveTypeId } from '../../functions/_shared/resolve-ids.ts'
import { create } from '../../functions/admin-data.ts'
import { createInteraction } from '../../functions/ai-interactions.ts'

function ctx(): any {
  return {
    accountId: 'acct-1',
    principal: { id: 'person-1', type: 'human', roles: ['member'] },
    requestId: 'req-1',
  }
}

describe('createInteraction — optional type_slug', () => {
  beforeEach(() => vi.clearAllMocks())

  it('defaults to the ai_feedback_record item type', async () => {
    await createInteraction(ctx(), { thread_id: 'thr-1', kb_candidate: true })
    expect(resolveTypeId).toHaveBeenCalledWith('item', 'ai_feedback_record')
    expect(create).toHaveBeenCalledWith(
      ctx(),
      expect.objectContaining({ entity: 'items', type_id: 't-ai_feedback_record' })
    )
  })

  it('resolves an app-namespaced type when type_slug is provided', async () => {
    await createInteraction(ctx(), {
      type_slug: 'demo_feedback_record',
      thread_id: 'thr-1',
      ai_message_id: 'm-1',
      kb_candidate: true,
    })
    expect(resolveTypeId).toHaveBeenCalledWith('item', 'demo_feedback_record')
    const [, payload] = vi.mocked(create).mock.calls[0] as any[]
    expect(payload.type_id).toBe('t-demo_feedback_record')
    expect(payload.data.ai_message_id).toBe('m-1')
    expect(payload.data.kb_candidate).toBe(true)
  })

  it('reports the resolved slug in the skip reason when the type is missing', async () => {
    vi.mocked(resolveTypeId).mockRejectedValueOnce(new Error('Type not found: item/demo_feedback_record'))
    const res = await createInteraction(ctx(), {
      type_slug: 'demo_feedback_record',
      thread_id: 'thr-1',
    })
    expect(res).toEqual({ skipped: true, reason: 'demo_feedback_record type not found' })
    expect(create).not.toHaveBeenCalled()
  })

  it('still requires thread_id or ai_message_id', async () => {
    await expect(createInteraction(ctx(), { type_slug: 'demo_feedback_record' }))
      .rejects.toThrow('thread_id or ai_message_id is required')
  })
})
