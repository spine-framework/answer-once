import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CoreContext } from '../../functions/_shared/middleware.ts'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined)
}))

import { checkAndFireTriggers, fireCreateTriggers, fireUpdateTriggers } from '../../functions/_shared/trigger-engine.ts'
import { emitAudit } from '../../functions/_shared/audit.ts'
import { adminDb } from '../../functions/_shared/db.ts'

// dispatchTriggerPipeline POSTs to /.netlify/functions/pipeline-runner-background.
// Stub fetch globally and the env vars it reads; the dispatch returns
// immediately (fire-and-forget) so a resolved ok:true is the happy path.
const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '' })
vi.stubGlobal('fetch', mockFetch)
vi.stubEnv('INTERNAL_INVOKE_SECRET', 'test-secret')
vi.stubEnv('SITE_URL', 'http://test.local')

function makeCtx(): CoreContext {
  return {
    principal: {
      id: 'system', type: 'machine', accountId: null, scopes: ['*:*'],
      provenance: { sourceType: 'manual', createdBy: null, invokedAt: new Date().toISOString() }
    },
    accountId: 'acct-1',
    db: {},
    requestId: 'req-test'
  }
}

function makeTrigger(overrides: Record<string, any> = {}) {
  return {
    id: 'trigger-1',
    name: 'Test Trigger',
    event_type: 'item_created',
    pipeline_id: 'pipeline-1',
    is_active: true,
    config: {},
    ...overrides
  }
}

function mockDbTriggers(triggers: any[]) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: triggers, error: null })
  }
  vi.mocked(adminDb.from).mockReturnValue(chain as any)
}

function mockDbTriggersWithUpdate(triggers: any[], execId = 'exec-mock-id') {
  const updateChain = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: null, error: null })
  }
  const insertChain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: execId }, error: null })
  }
  let callCount = 0
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    callCount++
    if (callCount === 1) {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: triggers, error: null })
      } as any
    }
    if (table === 'pipeline_executions') return insertChain as any
    return updateChain as any
  })
  vi.mocked(adminDb.rpc).mockResolvedValue({ data: 1, error: null } as any)
}

describe('checkAndFireTriggers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing when no triggers match the event type', async () => {
    mockDbTriggers([])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('does nothing when DB query errors', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    }
    vi.mocked(adminDb.from).mockReturnValue(chain as any)
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('dispatches pipeline for a matching trigger with no conditions', async () => {
    mockDbTriggersWithUpdate([makeTrigger()])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('http://test.local/.netlify/functions/pipeline-runner-background')
    const body = JSON.parse(init.body as string)
    expect(body.pipeline_id).toBe('pipeline-1')
    expect(body.trigger_data.event).toBe('item_created')
    expect(body.trigger_data.entity.id).toBe('item-1')
    expect(init.headers['X-Internal-Secret']).toBe('test-secret')
  })

  it('pre-creates a queued pipeline_executions row before dispatch', async () => {
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'exec-queued-1' }, error: null })
    }
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'triggers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [makeTrigger()], error: null })
        } as any
      }
      if (table === 'pipeline_executions') return insertChain as any
      return { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: null, error: null }) } as any
    })
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'queued', pipeline_id: 'pipeline-1' })
    )
    // The execution_id from the queued row is forwarded in the dispatch body.
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.execution_id).toBe('exec-queued-1')
  })

  it('passes trigger metadata in the trigger data', async () => {
    mockDbTriggersWithUpdate([makeTrigger({ id: 'trig-xyz', name: 'My Trigger' })])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.trigger_data.trigger).toEqual({ id: 'trig-xyz', name: 'My Trigger' })
    expect(body.trigger_id).toBe('trig-xyz')
  })

  it('emits audit on successful trigger fire with queued status', async () => {
    mockDbTriggersWithUpdate([makeTrigger()])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'trigger.fired',
      expect.objectContaining({ type: 'trigger', id: 'trigger-1' }),
      expect.objectContaining({ execution_status: 'queued' })
    )
  })

  it('emits audit.failed and continues when the execution insert throws', async () => {
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'triggers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [makeTrigger({ id: 'bad-trigger' })], error: null })
        } as any
      }
      if (table === 'pipeline_executions') {
        throw new Error('pipeline_executions insert exploded')
      }
      return { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: null, error: null }) } as any
    })
    vi.mocked(adminDb.rpc).mockResolvedValue({ data: 1, error: null } as any)
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'trigger.failed',
      expect.objectContaining({ id: 'bad-trigger' }),
      expect.objectContaining({ error: 'pipeline_executions insert exploded' })
    )
  })

  it('still emits trigger.fired with queued status when dispatch fetch fails', async () => {
    mockDbTriggersWithUpdate([makeTrigger()])
    mockFetch.mockRejectedValueOnce(new Error('network unreachable'))
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    // dispatchTriggerPipeline catches the fetch error internally — the
    // trigger.fired audit still fires with execution_status='queued'.
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'trigger.fired',
      expect.objectContaining({ id: 'trigger-1' }),
      expect.objectContaining({ execution_status: 'queued' })
    )
  })

  it('dispatches all matching triggers, not just the first', async () => {
    const t1 = makeTrigger({ id: 'trig-1', pipeline_id: 'pipe-1' })
    const t2 = makeTrigger({ id: 'trig-2', pipeline_id: 'pipe-2' })
    mockDbTriggersWithUpdate([t1, t2])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(mockFetch).toHaveBeenCalledTimes(2)
    const bodies = mockFetch.mock.calls.map(([, init]) => JSON.parse(init.body as string))
    expect(bodies[0].pipeline_id).toBe('pipe-1')
    expect(bodies[1].pipeline_id).toBe('pipe-2')
  })

  it('continues to dispatch remaining triggers after a DB error on one', async () => {
    const t1 = makeTrigger({ id: 'trig-fail', pipeline_id: 'pipe-1' })
    const t2 = makeTrigger({ id: 'trig-ok', pipeline_id: 'pipe-2' })
    let insertCount = 0
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'triggers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [t1, t2], error: null })
        } as any
      }
      if (table === 'pipeline_executions') {
        insertCount++
        if (insertCount === 1) throw new Error('insert failed for trig-fail')
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'exec-2' }, error: null })
        } as any
      }
      return { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: null, error: null }) } as any
    })
    vi.mocked(adminDb.rpc).mockResolvedValue({ data: 1, error: null } as any)
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    // trig-fail errored during insert; trig-ok still dispatched.
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'trigger.failed',
      expect.objectContaining({ id: 'trig-fail' }),
      expect.objectContaining({ error: 'insert failed for trig-fail' })
    )
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'trigger.fired',
      expect.objectContaining({ id: 'trig-ok' }),
      expect.objectContaining({ execution_status: 'queued' })
    )
  })

  it('bounds the dispatch fetch with a 5s abort signal', async () => {
    mockDbTriggersWithUpdate([makeTrigger()])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    const init = mockFetch.mock.calls[0][1]
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(init.signal.aborted).toBe(false)
  })
})

describe('trigger condition filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips trigger when entity_type filter does not match', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'people' } })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fires trigger when entity_type filter matches', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'items' } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('skips trigger when type_slug filter does not match', async () => {
    const trigger = makeTrigger({ config: { type_slug: 'invoice' } })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { type_slug: 'support_ticket' }, makeCtx())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fires trigger when type_slug filter matches', async () => {
    const trigger = makeTrigger({ config: { type_slug: 'support_ticket' } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { type_slug: 'support_ticket' }, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('skips trigger when simple filter value does not match', async () => {
    const trigger = makeTrigger({ config: { filters: { status: 'open' } } })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { status: 'closed' }, makeCtx())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fires trigger when simple filter value matches', async () => {
    const trigger = makeTrigger({ config: { filters: { status: 'open' } } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { status: 'open' }, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('fires trigger when array filter includes the value', async () => {
    const trigger = makeTrigger({ config: { filters: { priority: ['high', 'critical'] } } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { priority: 'high' }, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('skips trigger when value not in array filter', async () => {
    const trigger = makeTrigger({ config: { filters: { priority: ['high', 'critical'] } } })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { priority: 'low' }, makeCtx())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('resolves nested dot-notation filter paths', async () => {
    const trigger = makeTrigger({ config: { filters: { 'data.region': 'us-west' } } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { data: { region: 'us-west' } }, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('resolves Postgres-style ->> filter paths against the data column', async () => {
    const trigger = makeTrigger({ config: { filters: { "data->>'sender_type'": { $eq: 'agent' } } } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('message_created', 'messages', 'msg-1', { data: { sender_type: 'agent' } }, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('maps plural table names to singular event types (fireCreateTriggers)', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'items' } })
    mockDbTriggersWithUpdate([trigger])
    // admin-data passes the table name 'items'; the seeded event is 'item_created'
    await fireCreateTriggers('items', 'item-1', {}, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.pipeline_id).toBe('pipeline-1')
    expect(body.trigger_data.event).toBe('item_created')
  })

  it('maps plural table names to singular event types (fireUpdateTriggers)', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'items' } })
    mockDbTriggersWithUpdate([trigger])
    await fireUpdateTriggers('items', 'item-1', {}, makeCtx())
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.pipeline_id).toBe('pipeline-1')
    expect(body.trigger_data.event).toBe('item_updated')
  })

  it('maps people → person for event types', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'people' } })
    mockDbTriggersWithUpdate([trigger])
    await fireCreateTriggers('people', 'person-1', {}, makeCtx())
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.pipeline_id).toBe('pipeline-1')
    expect(body.trigger_data.event).toBe('person_created')
  })

  it('resolves type_slug from entityData.type_id when the slug is not inline', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'items', type_slug: 'kb_article' } })
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'exec-1' }, error: null })
    }
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'types') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { slug: 'kb_article' }, error: null })
        } as any
      }
      if (table === 'pipeline_executions') return insertChain as any
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [trigger], error: null }),
        update: vi.fn().mockReturnThis()
      } as any
    })
    await checkAndFireTriggers('item_created', 'items', 'item-1', { type_id: 'type-uuid-1', status: 'published' }, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  // The demo seed filter { data->>'ca_kb_candidate': { $eq: true } } relies on strict boolean equality — the jsonb value is a real boolean, so a string 'true' operand would never fire.
  it('matches a boolean $eq against a Postgres-style data->> filter path', async () => {
    const trigger = makeTrigger({
      config: {
        type_slug: 'demo_support_ticket',
        filters: { "data->>'ca_kb_candidate'": { $eq: true } }
      }
    })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_updated', 'items', 'item-1', { type_slug: 'demo_support_ticket', data: { ca_kb_candidate: true } }, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('does not fire a boolean data->> field when $eq uses the string "true"', async () => {
    const trigger = makeTrigger({
      config: { filters: { "data->>'ca_kb_candidate'": { $eq: 'true' } } }
    })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_updated', 'items', 'item-1', { data: { ca_kb_candidate: true } }, makeCtx())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('skips a boolean $eq filter when the data flag is false', async () => {
    const trigger = makeTrigger({
      config: { filters: { "data->>'ca_kb_candidate'": { $eq: true } } }
    })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_updated', 'items', 'item-1', { data: { ca_kb_candidate: false } }, makeCtx())
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

describe('filter operators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function testOp(operator: Record<string, any>, entityData: any, shouldFire: boolean) {
    const trigger = makeTrigger({ config: { filters: { score: operator } } })
    if (shouldFire) {
      mockDbTriggersWithUpdate([trigger])
    } else {
      mockDbTriggers([trigger])
    }
    await checkAndFireTriggers('item_created', 'items', 'item-1', entityData, makeCtx())
    if (shouldFire) {
      expect(mockFetch).toHaveBeenCalledOnce()
    } else {
      expect(mockFetch).not.toHaveBeenCalled()
    }
    vi.clearAllMocks()
  }

  it('$eq — fires when equal', () => testOp({ $eq: 10 }, { score: 10 }, true))
  it('$eq — skips when not equal', () => testOp({ $eq: 10 }, { score: 5 }, false))

  it('$ne — fires when not equal', () => testOp({ $ne: 10 }, { score: 5 }, true))
  it('$ne — skips when equal', () => testOp({ $ne: 10 }, { score: 10 }, false))

  it('$gt — fires when greater', () => testOp({ $gt: 5 }, { score: 10 }, true))
  it('$gt — skips when equal', () => testOp({ $gt: 5 }, { score: 5 }, false))
  it('$gt — skips when less', () => testOp({ $gt: 5 }, { score: 3 }, false))

  it('$gte — fires when equal', () => testOp({ $gte: 5 }, { score: 5 }, true))
  it('$gte — fires when greater', () => testOp({ $gte: 5 }, { score: 6 }, true))
  it('$gte — skips when less', () => testOp({ $gte: 5 }, { score: 4 }, false))

  it('$lt — fires when less', () => testOp({ $lt: 10 }, { score: 5 }, true))
  it('$lt — skips when equal', () => testOp({ $lt: 10 }, { score: 10 }, false))

  it('$lte — fires when equal', () => testOp({ $lte: 10 }, { score: 10 }, true))
  it('$lte — fires when less', () => testOp({ $lte: 10 }, { score: 9 }, true))
  it('$lte — skips when greater', () => testOp({ $lte: 10 }, { score: 11 }, false))

  it('$in — fires when value in array', () => testOp({ $in: ['a', 'b', 'c'] }, { score: 'b' }, true))
  it('$in — skips when value not in array', () => testOp({ $in: ['a', 'b'] }, { score: 'z' }, false))

  it('$nin — fires when value not in array', () => testOp({ $nin: ['a', 'b'] }, { score: 'z' }, true))
  it('$nin — skips when value in array', () => testOp({ $nin: ['a', 'b'] }, { score: 'a' }, false))

  it('$exists:true — fires when field exists', () => testOp({ $exists: true }, { score: 0 }, true))
  it('$exists:true — skips when field is null', () => testOp({ $exists: true }, { score: null }, false))
  it('$exists:false — fires when field is null', () => testOp({ $exists: false }, { score: null }, true))
  it('$exists:false — skips when field has value', () => testOp({ $exists: false }, { score: 1 }, false))
})
describe('fire_on_transition triggers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const publishTrigger = () => makeTrigger({
    event_type: 'item_updated',
    config: {
      entity_type: 'items',
      type_slug: 'demo_kb_article',
      fire_on_transition: true,
      filters: { status: { $eq: 'published' } }
    }
  })

  it('fires when the record transitions into the matching state', async () => {
    mockDbTriggersWithUpdate([publishTrigger()])
    const entityData = { status: 'published', type_slug: 'demo_kb_article' }
    const previous = { status: 'draft', type_slug: 'demo_kb_article' }
    await checkAndFireTriggers('item_updated', 'items', 'item-1', entityData, makeCtx(), previous)
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('skips when the record already matched before the update', async () => {
    mockDbTriggersWithUpdate([publishTrigger()])
    const entityData = { status: 'published', type_slug: 'demo_kb_article' }
    const previous = { status: 'published', type_slug: 'demo_kb_article' }
    await checkAndFireTriggers('item_updated', 'items', 'item-1', entityData, makeCtx(), previous)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(adminDb.rpc).not.toHaveBeenCalled()
  })

  it('fires when no previous snapshot is provided (conservative)', async () => {
    mockDbTriggersWithUpdate([publishTrigger()])
    const entityData = { status: 'published', type_slug: 'demo_kb_article' }
    await checkAndFireTriggers('item_updated', 'items', 'item-1', entityData, makeCtx())
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('still fires on repeat matches when the flag is absent', async () => {
    const trigger = makeTrigger({
      event_type: 'item_updated',
      config: {
        entity_type: 'items',
        type_slug: 'demo_kb_article',
        filters: { status: { $eq: 'published' } }
      }
    })
    mockDbTriggersWithUpdate([trigger])
    const entityData = { status: 'published', type_slug: 'demo_kb_article' }
    const previous = { status: 'published', type_slug: 'demo_kb_article' }
    await checkAndFireTriggers('item_updated', 'items', 'item-1', entityData, makeCtx(), previous)
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('revoke-style trigger fires only when leaving the published state', async () => {
    const trigger = makeTrigger({
      event_type: 'item_updated',
      config: {
        entity_type: 'items',
        type_slug: 'demo_kb_article',
        fire_on_transition: true,
        filters: { status: { $ne: 'published' } }
      }
    })
    mockDbTriggersWithUpdate([trigger])

    // published → draft: previous fails the $ne filter, new matches → fires
    await checkAndFireTriggers('item_updated', 'items', 'item-1',
      { status: 'draft', type_slug: 'demo_kb_article' }, makeCtx(),
      { status: 'published', type_slug: 'demo_kb_article' })
    expect(mockFetch).toHaveBeenCalledOnce()

    // draft → draft (already non-published): previous also matches → skip
    vi.clearAllMocks()
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_updated', 'items', 'item-1',
      { status: 'draft', type_slug: 'demo_kb_article' }, makeCtx(),
      { status: 'draft', type_slug: 'demo_kb_article' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fireUpdateTriggers forwards the previous snapshot', async () => {
    mockDbTriggersWithUpdate([publishTrigger()])
    await fireUpdateTriggers('items', 'item-1',
      { status: 'published', type_slug: 'demo_kb_article' }, makeCtx(),
      { status: 'published', type_slug: 'demo_kb_article' })
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
