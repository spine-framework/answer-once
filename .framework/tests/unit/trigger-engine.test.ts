// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-engine.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Test setup and imports for trigger engine tests"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure test environment and mock dependencies"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-engine" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="configured test mocks" errors="none" side_effects="Mocks database, audit, and pipeline runner"]
// CIL[DOC-MICRO logic_summary="Imports vitest, mocks db/audit/pipeline, imports trigger engine" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="test"]
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

vi.mock('../../functions/_shared/pipeline-runner.ts', () => ({
  runPipeline: vi.fn().mockResolvedValue({
    executionId: 'mock-exec-id',
    pipelineId: 'mock-pipeline-id',
    status: 'completed',
    stages: [],
    durationMs: 10
  })
}))

import { checkAndFireTriggers, fireCreateTriggers, fireUpdateTriggers } from '../../functions/_shared/trigger-engine.ts'
import { runPipeline } from '../../functions/_shared/pipeline-runner.ts'
import { emitAudit } from '../../functions/_shared/audit.ts'
import { adminDb } from '../../functions/_shared/db.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Test setup and imports for trigger engine tests'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/trigger-engine.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-engine.test.ts:makeCtx:function" type="function" identity="makeCtx" parent="none"]
// CIL[DOC-MACRO purpose="Create test context with system principal"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate test context objects"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-engine" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/trigger-engine.ts,.framework/tests/unit/trigger-engine.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CoreContext object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates context with system machine principal and test data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Create test context with system principal'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/trigger-engine.test.ts:makeCtx:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-engine.test.ts:makeTrigger:function" type="function" identity="makeTrigger" parent="none"]
// CIL[DOC-MACRO purpose="Create test trigger with default values"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate test trigger objects"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-engine" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/trigger-engine.ts,.framework/tests/unit/trigger-engine.test.ts"]
// CIL[DOC-CONTRACT inputs="overrides: Record<string, any>" outputs="trigger object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns default trigger with overrides applied" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Create test trigger with default values'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/trigger-engine.test.ts:makeTrigger:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-engine.test.ts:mockDbTriggers:function" type="function" identity="mockDbTriggers" parent="none"]
// CIL[DOC-MACRO purpose="Mock database to return trigger list"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure database mock for trigger queries"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-engine" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/trigger-engine.ts,.framework/tests/unit/trigger-engine.test.ts"]
// CIL[DOC-CONTRACT inputs="triggers: any[]" outputs="mocked adminDb.from" errors="none" side_effects="Mocks adminDb.from"]
// CIL[DOC-MICRO logic_summary="Sets up adminDb.from mock to return provided triggers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mockDbTriggers(triggers: any[]) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: triggers, error: null })
  }
  vi.mocked(adminDb.from).mockReturnValue(chain as any)
}
// CIL[DOC-VECTOR type="context" content="purpose='Mock database to return trigger list'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/trigger-engine.test.ts:mockDbTriggers:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-engine.test.ts:mockDbTriggersWithUpdate:function" type="function" identity="mockDbTriggersWithUpdate" parent="none"]
// CIL[DOC-MACRO purpose="Mock database with trigger query and stat updates"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure database mock for trigger operations"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-engine" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/trigger-engine.ts,.framework/tests/unit/trigger-engine.test.ts"]
// CIL[DOC-CONTRACT inputs="triggers: any[]" outputs="mocked adminDb.from and adminDb.rpc" errors="none" side_effects="Mocks adminDb.from and adminDb.rpc"]
// CIL[DOC-MICRO logic_summary="Sets up mocks for trigger query and stat update operations" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mockDbTriggersWithUpdate(triggers: any[]) {
  const updateChain = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: null, error: null })
  }
  let callCount = 0
  vi.mocked(adminDb.from).mockImplementation(() => {
    callCount++
    if (callCount === 1) {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: triggers, error: null })
      } as any
    }
    return updateChain as any
  })
  vi.mocked(adminDb.rpc).mockResolvedValue({ data: 1, error: null } as any)
}
// CIL[DOC-VECTOR type="context" content="purpose='Mock database with trigger query and stat updates'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/trigger-engine.test.ts:mockDbTriggersWithUpdate:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-engine.test.ts:describe_checkAndFireTriggers:block" type="block" identity="describe_checkAndFireTriggers" parent="none"]
// CIL[DOC-MACRO purpose="Test checkAndFireTriggers core functionality"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify trigger execution and error handling"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-engine" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/trigger-engine.ts,.framework/tests/unit/trigger-engine.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests trigger-engine.ts module"]
// CIL[DOC-MICRO logic_summary="Tests trigger matching, pipeline execution, audit emission, and error recovery" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('checkAndFireTriggers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing when no triggers match the event type', async () => {
    mockDbTriggers([])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('does nothing when DB query errors', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    }
    vi.mocked(adminDb.from).mockReturnValue(chain as any)
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('fires pipeline for a matching trigger with no conditions', async () => {
    mockDbTriggersWithUpdate([makeTrigger()])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
    expect(runPipeline).toHaveBeenCalledWith(
      'pipeline-1',
      expect.objectContaining({
        event: 'item_created',
        entity: expect.objectContaining({ type: 'items', id: 'item-1' })
      }),
      expect.any(Object)
    )
  })

  it('passes trigger metadata in the trigger data', async () => {
    mockDbTriggersWithUpdate([makeTrigger({ id: 'trig-xyz', name: 'My Trigger' })])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(runPipeline).toHaveBeenCalledWith(
      'pipeline-1',
      expect.objectContaining({
        trigger: { id: 'trig-xyz', name: 'My Trigger' }
      }),
      expect.any(Object)
    )
  })

  it('emits audit on successful trigger fire', async () => {
    mockDbTriggersWithUpdate([makeTrigger()])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'trigger.fired',
      expect.objectContaining({ type: 'trigger', id: 'trigger-1' }),
      expect.objectContaining({ execution_status: 'completed' })
    )
  })

  it('emits audit.failed and continues when runPipeline throws', async () => {
    mockDbTriggers([makeTrigger({ id: 'bad-trigger' })])
    vi.mocked(runPipeline).mockRejectedValueOnce(new Error('Pipeline exploded'))
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'trigger.failed',
      expect.objectContaining({ id: 'bad-trigger' }),
      expect.objectContaining({ error: 'Pipeline exploded' })
    )
  })

  it('fires all matching triggers, not just the first', async () => {
    const t1 = makeTrigger({ id: 'trig-1', pipeline_id: 'pipe-1' })
    const t2 = makeTrigger({ id: 'trig-2', pipeline_id: 'pipe-2' })
    mockDbTriggersWithUpdate([t1, t2])
    vi.mocked(runPipeline)
      .mockResolvedValueOnce({ executionId: 'exec-1', pipelineId: 'pipe-1', status: 'completed', stages: [], durationMs: 5 })
      .mockResolvedValueOnce({ executionId: 'exec-2', pipelineId: 'pipe-2', status: 'completed', stages: [], durationMs: 5 })

    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(runPipeline).toHaveBeenCalledTimes(2)
    expect(runPipeline).toHaveBeenCalledWith('pipe-1', expect.any(Object), expect.any(Object))
    expect(runPipeline).toHaveBeenCalledWith('pipe-2', expect.any(Object), expect.any(Object))
  })

  it('continues to fire remaining triggers after one fails', async () => {
    const t1 = makeTrigger({ id: 'trig-fail', pipeline_id: 'pipe-1' })
    const t2 = makeTrigger({ id: 'trig-ok', pipeline_id: 'pipe-2' })
    mockDbTriggers([t1, t2])
    vi.mocked(runPipeline)
      .mockRejectedValueOnce(new Error('pipe-1 failed'))
      .mockResolvedValueOnce({ executionId: 'exec-2', pipelineId: 'pipe-2', status: 'completed', stages: [], durationMs: 5 })

    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(runPipeline).toHaveBeenCalledTimes(2)
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Test checkAndFireTriggers core functionality'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/trigger-engine.test.ts:describe_checkAndFireTriggers:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-engine.test.ts:describe_triggerConditionFiltering:block" type="block" identity="describe_triggerConditionFiltering" parent="none"]
// CIL[DOC-MACRO purpose="Test trigger condition filtering logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify trigger condition evaluation"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-engine" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/trigger-engine.ts,.framework/tests/unit/trigger-engine.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests trigger-engine.ts module"]
// CIL[DOC-MICRO logic_summary="Tests entity_type, type_slug, and filter condition matching" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('trigger condition filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips trigger when entity_type filter does not match', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'people' } })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('fires trigger when entity_type filter matches', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'items' } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', {}, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
  })

  it('skips trigger when type_slug filter does not match', async () => {
    const trigger = makeTrigger({ config: { type_slug: 'invoice' } })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { type_slug: 'support_ticket' }, makeCtx())
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('fires trigger when type_slug filter matches', async () => {
    const trigger = makeTrigger({ config: { type_slug: 'support_ticket' } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { type_slug: 'support_ticket' }, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
  })

  it('skips trigger when simple filter value does not match', async () => {
    const trigger = makeTrigger({ config: { filters: { status: 'open' } } })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { status: 'closed' }, makeCtx())
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('fires trigger when simple filter value matches', async () => {
    const trigger = makeTrigger({ config: { filters: { status: 'open' } } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { status: 'open' }, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
  })

  it('fires trigger when array filter includes the value', async () => {
    const trigger = makeTrigger({ config: { filters: { priority: ['high', 'critical'] } } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { priority: 'high' }, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
  })

  it('skips trigger when value not in array filter', async () => {
    const trigger = makeTrigger({ config: { filters: { priority: ['high', 'critical'] } } })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { priority: 'low' }, makeCtx())
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('resolves nested dot-notation filter paths', async () => {
    const trigger = makeTrigger({ config: { filters: { 'data.region': 'us-west' } } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_created', 'items', 'item-1', { data: { region: 'us-west' } }, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
  })

  it('resolves Postgres-style ->> filter paths against the data column', async () => {
    const trigger = makeTrigger({ config: { filters: { "data->>'sender_type'": { $eq: 'agent' } } } })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('message_created', 'messages', 'msg-1', { data: { sender_type: 'agent' } }, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
  })

  it('maps plural table names to singular event types (fireCreateTriggers)', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'items' } })
    mockDbTriggersWithUpdate([trigger])
    // admin-data passes the table name 'items'; the seeded event is 'item_created'
    await fireCreateTriggers('items', 'item-1', {}, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
    expect(runPipeline).toHaveBeenCalledWith(
      'pipeline-1',
      expect.objectContaining({ event: 'item_created' }),
      expect.any(Object)
    )
  })

  it('maps plural table names to singular event types (fireUpdateTriggers)', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'items' } })
    mockDbTriggersWithUpdate([trigger])
    await fireUpdateTriggers('items', 'item-1', {}, makeCtx())
    expect(runPipeline).toHaveBeenCalledWith(
      'pipeline-1',
      expect.objectContaining({ event: 'item_updated' }),
      expect.any(Object)
    )
  })

  it('maps people → person for event types', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'people' } })
    mockDbTriggersWithUpdate([trigger])
    await fireCreateTriggers('people', 'person-1', {}, makeCtx())
    expect(runPipeline).toHaveBeenCalledWith(
      'pipeline-1',
      expect.objectContaining({ event: 'person_created' }),
      expect.any(Object)
    )
  })

  it('resolves type_slug from entityData.type_id when the slug is not inline', async () => {
    const trigger = makeTrigger({ config: { entity_type: 'items', type_slug: 'kb_article' } })
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [trigger], error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: { slug: 'kb_article' }, error: null }),
      update: vi.fn().mockReturnThis()
    }
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'types') return chain as any
      return chain as any
    })
    await checkAndFireTriggers('item_created', 'items', 'item-1', { type_id: 'type-uuid-1', status: 'published' }, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
  })

  // CIL[DOC-NOTE type="behavior" content="The demo seed filter { data->>'ca_kb_candidate': { $eq: true } } relies on strict boolean equality — the jsonb value is a real boolean, so a string 'true' operand would never fire."]
  it('matches a boolean $eq against a Postgres-style data->> filter path', async () => {
    const trigger = makeTrigger({
      config: {
        type_slug: 'demo_support_ticket',
        filters: { "data->>'ca_kb_candidate'": { $eq: true } }
      }
    })
    mockDbTriggersWithUpdate([trigger])
    await checkAndFireTriggers('item_updated', 'items', 'item-1', { type_slug: 'demo_support_ticket', data: { ca_kb_candidate: true } }, makeCtx())
    expect(runPipeline).toHaveBeenCalledOnce()
  })

  it('does not fire a boolean data->> field when $eq uses the string "true"', async () => {
    const trigger = makeTrigger({
      config: { filters: { "data->>'ca_kb_candidate'": { $eq: 'true' } } }
    })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_updated', 'items', 'item-1', { data: { ca_kb_candidate: true } }, makeCtx())
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('skips a boolean $eq filter when the data flag is false', async () => {
    const trigger = makeTrigger({
      config: { filters: { "data->>'ca_kb_candidate'": { $eq: true } } }
    })
    mockDbTriggers([trigger])
    await checkAndFireTriggers('item_updated', 'items', 'item-1', { data: { ca_kb_candidate: false } }, makeCtx())
    expect(runPipeline).not.toHaveBeenCalled()
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Test trigger condition filtering logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/trigger-engine.test.ts:describe_triggerConditionFiltering:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-engine.test.ts:describe_filterOperators:block" type="block" identity="describe_filterOperators" parent="none"]
// CIL[DOC-MACRO purpose="Test filter operator evaluation logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify filter operator implementations"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-engine" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/trigger-engine.ts,.framework/tests/unit/trigger-engine.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests trigger-engine.ts module"]
// CIL[DOC-MICRO logic_summary="Tests all filter operators: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
      expect(runPipeline).toHaveBeenCalledOnce()
    } else {
      expect(runPipeline).not.toHaveBeenCalled()
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
// CIL[DOC-VECTOR type="context" content="purpose='Test filter operator evaluation logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/trigger-engine.test.ts:describe_filterOperators:block"]