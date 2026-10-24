// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Test setup and imports for pipeline runner tests"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure test environment and mock dependencies"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="configured test mocks" errors="none" side_effects="Mocks database and audit modules"]
// CIL[DOC-MICRO logic_summary="Imports vitest, mocks db and audit, imports pipeline runner" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="test maintainers"]
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CoreContext } from '../../functions/_shared/middleware.ts'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() }
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../functions/embeddings.ts', () => ({
  revoke: vi.fn().mockResolvedValue({ document_id: 'item-9', revoked_count: 2 })
}))

vi.mock('../../functions/ai-interactions.ts', () => ({
  createInteraction: vi.fn().mockResolvedValue({ id: 'ir-1' })
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { emitAudit } from '../../functions/_shared/audit.ts'
import { runPipeline, sweepStaleExecutions } from '../../functions/_shared/pipeline-runner.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Test setup and imports for pipeline runner tests'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:makeCtx:function" type="function" identity="makeCtx" parent="none"]
// CIL[DOC-MACRO purpose="Create test context with system principal"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate test context objects"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="overrides: Partial<CoreContext>" outputs="CoreContext object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates context with system machine principal and test data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function makeCtx(overrides: Partial<CoreContext> = {}): CoreContext {
  return {
    principal: {
      id: 'system', type: 'machine', accountId: null, scopes: ['*:*'],
      provenance: { sourceType: 'manual', createdBy: null, invokedAt: new Date().toISOString() }
    },
    accountId: 'acct-test',
    db: {},
    requestId: 'req-test',
    ...overrides
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create test context with system principal'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:makeCtx:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:EXEC_ID:block" type="block" identity="EXEC_ID" parent="none"]
// CIL[DOC-MACRO purpose="Define test execution ID constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide consistent test execution identifier"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines execution ID used across tests" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const EXEC_ID = 'exec-abc'
// CIL[DOC-VECTOR type="context" content="purpose='Define test execution ID constant'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:EXEC_ID:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:mockPipeline:function" type="function" identity="mockPipeline" parent="none"]
// CIL[DOC-MACRO purpose="Mock database to return pipeline and execution records"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure database mock for pipeline operations"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="stages: any[]" outputs="mocked adminDb.from" errors="none" side_effects="Mocks adminDb.from"]
// CIL[DOC-MICRO logic_summary="Sets up adminDb.from mock to return pipeline and execution data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mockPipeline(stages: any[]) {
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    if (table === 'pipelines') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'pipe-1', stages, is_active: true },
          error: null
        })
      } as any
    }
    if (table === 'pipeline_executions') {
      return {
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null })
      } as any
    }
    return {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    } as any
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Mock database to return pipeline and execution records'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:mockPipeline:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:mockAction:function" type="function" identity="mockAction" parent="none"]
// CIL[DOC-MACRO purpose="Create test action with default values"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate test action objects"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="handlerName: string, extras: Record<string, any>" outputs="action object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns default action with handler and config" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mockAction(handlerName: string, extras: Record<string, any> = {}) {
  return {
    id: 'action-1',
    slug: handlerName,
    handler: handlerName,
    handler_module: 'functions',
    config: {},
    is_active: true,
    ...extras
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create test action with default values'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:mockAction:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:mockPipelineWithAction:function" type="function" identity="mockPipelineWithAction" parent="none"]
// CIL[DOC-MACRO purpose="Mock database with pipeline and action records"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure database mock for pipeline with actions"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="stages: any[], action: any" outputs="mocked adminDb.from" errors="none" side_effects="Mocks adminDb.from"]
// CIL[DOC-MICRO logic_summary="Sets up mocks for pipeline, execution, and action table queries" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mockPipelineWithAction(stages: any[], action: any) {
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    if (table === 'pipelines') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages, is_active: true }, error: null })
      } as any
    }
    if (table === 'pipeline_executions') {
      return {
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null })
      } as any
    }
    if (table === 'actions') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: action, error: null })
      } as any
    }
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'r-1' }, error: null })
    } as any
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Mock database with pipeline and action records'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:mockPipelineWithAction:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_runPipeline_lifecycle:block" type="block" identity="describe_runPipeline_lifecycle" parent="none"]
// CIL[DOC-MACRO purpose="Test runPipeline lifecycle and error handling"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify pipeline execution flow and error cases"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests pipeline-runner.ts module"]
// CIL[DOC-MICRO logic_summary="Tests pipeline lookup, execution creation, and audit emission" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('runPipeline — lifecycle', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws when pipeline is not found', async () => {
    vi.mocked(adminDb.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'No rows' } })
    } as any)
    await expect(runPipeline('bad-id', {}, makeCtx())).rejects.toThrow('Pipeline not found or inactive')
  })

  it('throws when pipeline exists but is_active is null', async () => {
    vi.mocked(adminDb.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    } as any)
    await expect(runPipeline('inactive-id', {}, makeCtx())).rejects.toThrow('Pipeline not found or inactive')
  })

  it('throws when execution record cannot be created', async () => {
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages: [], is_active: true }, error: null })
        } as any
      }
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      } as any
    })
    await expect(runPipeline('pipe-1', {}, makeCtx())).rejects.toThrow('Failed to create execution')
  })

  it('returns completed with zero stages and correct shape', async () => {
    mockPipeline([])
    const result = await runPipeline('pipe-1', { x: 1 }, makeCtx())
    expect(result.status).toBe('completed')
    expect(result.executionId).toBe(EXEC_ID)
    expect(result.pipelineId).toBe('pipe-1')
    expect(result.stages).toHaveLength(0)
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    expect(result.error).toBeUndefined()
  })

  it('emits pipeline.completed audit on success', async () => {
    mockPipeline([])
    await runPipeline('pipe-1', {}, makeCtx())
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'pipeline.completed',
      expect.objectContaining({ type: 'pipeline_execution', id: EXEC_ID }),
      expect.objectContaining({ pipeline_id: 'pipe-1' })
    )
  })

  it('claims a pre-created queued execution row when opts.executionId is supplied', async () => {
    mockPipeline([])
    const PRE_CREATED_ID = 'exec-pre-created-1'
    const updateSpy = vi.fn().mockReturnThis()
    const eqSpy = vi.fn().mockReturnThis()
    const claimSelectSpy = vi.fn().mockResolvedValue({ data: [{ id: PRE_CREATED_ID }], error: null })
    const claimChain = { update: updateSpy, eq: eqSpy, select: claimSelectSpy, insert: vi.fn().mockReturnThis() }
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages: [], is_active: true }, error: null })
        } as any
      }
      if (table === 'pipeline_executions') return claimChain as any
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      } as any
    })

    const result = await runPipeline('pipe-1', { x: 1 }, makeCtx(), { executionId: PRE_CREATED_ID })
    expect(result.executionId).toBe(PRE_CREATED_ID)
    expect(result.status).toBe('completed')
    // The claim path must call update, not insert.
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'running' })
    )
    expect(eqSpy).toHaveBeenCalledWith('id', PRE_CREATED_ID)
    expect(eqSpy).toHaveBeenCalledWith('status', 'queued')
    // and it must NOT have inserted a fresh row
    expect(claimChain.insert).not.toHaveBeenCalled()
  })

  it('inserts with the same id when the queued row is absent (fallback path)', async () => {
    const PRE_CREATED_ID = 'exec-missing-1'
    const insertSpy = vi.fn().mockReturnThis()
    const singleSpy = vi.fn().mockResolvedValue({ data: { id: PRE_CREATED_ID }, error: null })
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages: [], is_active: true }, error: null })
        } as any
      }
      if (table === 'pipeline_executions') {
        const chain: any = {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockResolvedValue({ data: [], error: null }),   // claim finds no rows
          insert: insertSpy,
          single: singleSpy
        }
        // insert().select().single() — select must chain to an object with single
        insertSpy.mockImplementation(() => ({
          select: vi.fn().mockImplementation(() => ({ single: singleSpy }))
        }))
        return chain
      }
      return {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      } as any
    })

    const result = await runPipeline('pipe-1', {}, makeCtx(), { executionId: PRE_CREATED_ID })
    expect(result.executionId).toBe(PRE_CREATED_ID)
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: PRE_CREATED_ID, status: 'running' })
    )
  })

  it('throws when claiming a queued execution row fails', async () => {
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages: [], is_active: true }, error: null })
        } as any
      }
      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: null, error: { message: 'row not found' } })
      } as any
    })
    await expect(
      runPipeline('pipe-1', {}, makeCtx(), { executionId: 'missing-exec' })
    ).rejects.toThrow('Failed to claim queued execution missing-exec')
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Test runPipeline lifecycle and error handling'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_runPipeline_lifecycle:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_runPipeline_stageExecution:block" type="block" identity="describe_runPipeline_stageExecution" parent="none"]
// CIL[DOC-MACRO purpose="Test runPipeline stage execution and failure handling"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify stage execution and error recovery"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests pipeline-runner.ts module"]
// CIL[DOC-MICRO logic_summary="Tests action lookup, stage failure, and continue_on_error" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('runPipeline — stage execution', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns failed status and error when action not found', async () => {
    const stages = [{ stage_type: 'ghost_action' }]
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages, is_active: true }, error: null })
        } as any
      }
      if (table === 'pipeline_executions') {
        return {
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null })
        } as any
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      } as any
    })

    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.status).toBe('failed')
    expect(result.stages[0].status).toBe('failed')
    expect(result.stages[0].error).toMatch(/Action not found/)
    expect(result.error).toMatch(/Stage 0.*failed/)
  })

  it('returns failed status and emits pipeline.failed audit on stage failure', async () => {
    const stages = [{ stage_type: 'bad_action' }]
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages, is_active: true }, error: null })
        } as any
      }
      if (table === 'pipeline_executions') {
        return {
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null })
        } as any
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'nope' } })
      } as any
    })

    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.status).toBe('failed')
    expect(emitAudit).toHaveBeenCalledWith(
      expect.any(Object),
      'pipeline.failed',
      expect.objectContaining({ id: EXEC_ID }),
      expect.any(Object)
    )
  })

  it('continues past a failed stage when continue_on_error is true', async () => {
    const stages = [
      { stage_type: 'bad_one', continue_on_error: true },
      { stage_type: 'good_one' }
    ]
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages, is_active: true }, error: null })
        } as any
      }
      if (table === 'pipeline_executions') {
        return {
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null })
        } as any
      }
      if (table === 'actions') {
        let actionCall = 0
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation(() => {
            actionCall++
            return {
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue(
                actionCall === 1
                  ? { data: null, error: { message: 'bad action' } }
                  : { data: mockAction('good_one'), error: null }
              )
            }
          })
        } as any
      }
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'r-1' }, error: null })
      } as any
    })

    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages).toHaveLength(2)
    expect(result.stages[0].status).toBe('failed')
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Test runPipeline stage execution and failure handling'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_runPipeline_stageExecution:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_builtInStageHandlers:block" type="block" identity="describe_builtInStageHandlers" parent="none"]
// CIL[DOC-MACRO purpose="Test built-in stage handler implementations"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify built-in handler behavior and validation"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests pipeline-runner.ts module"]
// CIL[DOC-MICRO logic_summary="Tests update_item, create_record, send_notification, run_pipeline handlers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('built-in stage handlers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('update_item: throws when entity or record_id missing', async () => {
    const stages = [{ stage_type: 'update_item', config: {} }]
    mockPipelineWithAction(stages, mockAction('update_item'))
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('failed')
    expect(result.stages[0].error).toMatch(/entity is required/)

    vi.clearAllMocks()
    const stages2 = [{ stage_type: 'update_item', config: { entity: 'items' } }]
    mockPipelineWithAction(stages2, mockAction('update_item'))
    const result2 = await runPipeline('pipe-1', {}, makeCtx())
    expect(result2.stages[0].status).toBe('failed')
    expect(result2.stages[0].error).toMatch(/record_id missing/)
  })

  it('update_item: succeeds when entity + record_id + data provided', async () => {
    const stages = [{ stage_type: 'update_item', config: { entity: 'items', record_id: 'item-1', data: { status: 'done' } } }]
    mockPipelineWithAction(stages, mockAction('update_item'))
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output).toMatchObject({ success: true })
  })

  it('create_record: throws when entity or data missing', async () => {
    const stages = [{ stage_type: 'create_record', config: { entity: 'items' } }]
    mockPipelineWithAction(stages, mockAction('create_record'))
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('failed')
    expect(result.stages[0].error).toMatch(/entity and data are required/)
  })

  it('send_notification: succeeds with empty recipients (no-op)', async () => {
    const stages = [{ stage_type: 'send_notification', config: { message: 'Hello', recipients: [] } }]
    mockPipelineWithAction(stages, mockAction('send_notification'))
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output).toMatchObject({ success: true, notified_count: 0 })
  })

  it('run_pipeline: throws when pipeline_id missing', async () => {
    const stages = [{ stage_type: 'run_pipeline', config: {} }]
    mockPipelineWithAction(stages, mockAction('run_pipeline'))
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('failed')
    expect(result.stages[0].error).toMatch(/pipeline_id is required/)
  })

  it('run_pipeline: prevents self-recursion', async () => {
    const stages = [{ stage_type: 'run_pipeline', config: { pipeline_id: 'pipe-1' } }]
    mockPipelineWithAction(stages, mockAction('run_pipeline'))
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('failed')
    expect(result.stages[0].error).toMatch(/Recursive pipeline execution prevented/)
  })

  it('revoke_embeddings: throws when document_id missing', async () => {
    const stages = [{ stage_type: 'revoke_embeddings', config: {} }]
    mockPipelineWithAction(stages, mockAction('revoke_embeddings'))
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('failed')
    expect(result.stages[0].error).toMatch(/document_id is required/)
  })

  it('revoke_embeddings: resolves {{trigger.entity_id}} and calls embeddings.revoke', async () => {
    const stages = [{ stage_type: 'revoke_embeddings', config: { document_id: '{{trigger.entity_id}}' } }]
    mockPipelineWithAction(stages, mockAction('revoke_embeddings'))
    const result = await runPipeline('pipe-1', { entity_id: 'item-9' }, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output).toMatchObject({ document_id: 'item-9', revoked_count: 2 })
  })

  it('create_interaction: resolves entity_id and entity thread_id from trigger data', async () => {
    const stages = [{ stage_type: 'create_interaction', config: { ai_message_id: '{{trigger.entity_id}}', thread_id: '{{trigger.thread_id}}' } }]
    mockPipelineWithAction(stages, mockAction('create_interaction'))
    const triggerData = { entity_id: 'msg-1', entity: { data: { thread_id: 'thr-7' } } }
    const result = await runPipeline('pipe-1', triggerData, makeCtx())
    expect(result.stages[0].status).toBe('success')
    const { createInteraction } = await import('../../functions/ai-interactions.ts')
    expect(createInteraction).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ ai_message_id: 'msg-1', thread_id: 'thr-7' }))
  })

  it('create_interaction: throws when no ids resolve', async () => {
    const stages = [{ stage_type: 'create_interaction', config: {} }]
    mockPipelineWithAction(stages, mockAction('create_interaction'))
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('failed')
    expect(result.stages[0].error).toMatch(/could not resolve ai_message_id or thread_id/)
  })

  it('throws for unknown handler module', async () => {
    const stages = [{ stage_type: 'mystery_stage' }]
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'pipe-1', stages, is_active: true }, error: null })
        } as any
      }
      if (table === 'pipeline_executions') {
        return {
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null })
        } as any
      }
      if (table === 'actions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'a-1', handler: 'mystery', handler_module: 'alien', config: {} },
            error: null
          })
        } as any
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) } as any
    })

    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('failed')
    expect(result.stages[0].error).toMatch(/Unknown handler module/)
  })
})

describe('send_notification — writes to notifications, not watchers', () => {
  beforeEach(() => vi.clearAllMocks())

  function mockNotifyPipeline(insertCapture: { rows?: any[]; error?: any }) {
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'pipe-1', stages: [{ stage_type: 'send_notification', config: { message: 'Ticket escalated', recipients: ['aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'], entity_type: 'items', entity_id: '11111111-1111-4111-8111-111111111111' } }], is_active: true },
            error: null
          })
        } as any
      }
      if (table === 'pipeline_executions') {
        return {
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null })
        } as any
      }
      if (table === 'actions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'a-1', handler: 'send_notification', handler_module: 'functions', config: {} },
            error: null
          })
        } as any
      }
      if (table === 'notifications') {
        return {
          insert: vi.fn((rows: any[]) => {
            insertCapture.rows = rows
            return Promise.resolve({ data: null, error: insertCapture.error || null })
          })
        } as any
      }
      if (table === 'watchers') {
        return {
          insert: vi.fn(() => Promise.resolve({ data: null, error: { message: 'watchers must not receive notification payloads' } }))
        } as any
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(), not: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }), insert: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) } as any
    })
  }

  it('inserts one notifications row per recipient with correct fields', async () => {
    const cap: { rows?: any[] } = {}
    mockNotifyPipeline(cap)
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output.notified_count).toBe(2)
    expect(cap.rows).toHaveLength(2)
    for (const row of cap.rows!) {
      expect(row.account_id).toBe('acct-test')
      expect(row.message).toBe('Ticket escalated')
      expect(row.is_read).toBe(false)
      expect(row.source_type).toBe('pipeline_execution')
      expect(row.target_type).toBe('items')
      expect(row.target_id).toBe('11111111-1111-4111-8111-111111111111')
    }
    expect(cap.rows!.map((r: any) => r.person_id)).toEqual(['aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'])
  })

  it('notification insert failure fails the stage', async () => {
    const cap: { rows?: any[]; error?: any } = { error: { message: 'relation notifications does not exist' } }
    mockNotifyPipeline(cap)
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.status).toBe('failed')
    expect(result.stages[0].error).toMatch(/Notification failed/)
  })
})

// CIL[DOC-VECTOR type="context" content="purpose='Test built-in stage handler implementations'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_builtInStageHandlers:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_sendNotification_roleRecipients:block" type="block" identity="describe_sendNotification_roleRecipients" parent="none"]
// CIL[DOC-MACRO purpose="Test send_notification role:<slug> recipient resolution in the pipeline stage"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify role: recipients resolve to account-scoped people ids before the notifications insert, UUIDs pass through, and empty role matches yield a valid 0-notification result"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/notify.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/tests/unit/pipeline-runner.test.ts"]
// CIL[DOC-CONTRACT inputs="stage configs with role:/UUID recipients; mocked people join" outputs="notifications insert assertions and notified_count" errors="none" side_effects="console.warn on unresolvable recipients"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('send_notification — role:<slug> recipient resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  function mockRoleNotifyPipeline(recipients: any[], peopleRows: any[] | null, insertCapture: { rows?: any[] }, peopleError?: any) {
    const peopleQ: any = {
      select: vi.fn(() => peopleQ),
      eq: vi.fn(() => peopleQ),
      in: vi.fn(() => peopleQ),
      is: vi.fn(() => peopleQ),
      limit: vi.fn(() => peopleQ),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      then: (onF: any, onR: any) =>
        Promise.resolve({ data: peopleRows, error: peopleError ?? null }).then(onF, onR)
    }
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'pipe-1', stages: [{ stage_type: 'send_notification', config: { message: 'Ticket escalated', recipients, entity_type: 'threads' } }], is_active: true },
            error: null
          })
        } as any
      }
      if (table === 'pipeline_executions') {
        return {
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null })
        } as any
      }
      if (table === 'actions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'a-1', handler: 'send_notification', handler_module: 'functions', config: {} },
            error: null
          })
        } as any
      }
      if (table === 'people') return peopleQ
      if (table === 'notifications') {
        return {
          insert: vi.fn((rows: any[]) => {
            insertCapture.rows = rows
            return Promise.resolve({ data: null, error: null })
          })
        } as any
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(), not: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }), insert: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) } as any
    })
  }

  it('resolves role:member_admin to the account’s people ids', async () => {
    const cap: { rows?: any[] } = {}
    mockRoleNotifyPipeline(['role:member_admin'], [{ id: 'admin-1' }, { id: 'admin-2' }], cap)
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output.notified_count).toBe(2)
    expect(cap.rows!.map((r: any) => r.person_id)).toEqual(['admin-1', 'admin-2'])
    expect(cap.rows![0].account_id).toBe('acct-test')
    expect(cap.rows![0].source_type).toBe('pipeline_execution')
  })

  it('mixes role: handles and UUID recipients in one stage', async () => {
    const cap: { rows?: any[] } = {}
    const uuid = '22222222-2222-4222-8222-222222222222'
    mockRoleNotifyPipeline(['role:member_admin', uuid], [{ id: 'admin-1' }], cap)
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output.notified_count).toBe(2)
    expect(cap.rows!.map((r: any) => r.person_id)).toEqual(['admin-1', uuid])
  })

  it('an unknown role is a valid zero-notification result, not an error', async () => {
    const cap: { rows?: any[] } = {}
    mockRoleNotifyPipeline(['role:no_such_role'], [], cap)
    const result = await runPipeline('pipe-1', {}, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output.notified_count).toBe(0)
    expect(cap.rows).toBeUndefined()
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('role:no_such_role'))
  })

  it('never writes a literal role: string into person_id', async () => {
    const cap: { rows?: any[] } = {}
    mockRoleNotifyPipeline(['role:member_admin'], [{ id: 'admin-1' }], cap)
    await runPipeline('pipe-1', {}, makeCtx())
    for (const row of cap.rows!) {
      expect(row.person_id).not.toMatch(/^role:/)
    }
  })
})
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_sendNotification_roleRecipients:block"]
// send_email — resolves entity recipients through message->thread->target,
// composes from integration templates or inline config, and skips cleanly when
// no provider is configured.
describe('send_email — recipient resolution + outbound send', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  const OWNER_ID = '33333333-3333-4333-8333-333333333333'
  const ACTOR_ID = '44444444-4444-4444-8444-444444444444'
  const triggerData = {
    entity: {
      type: 'messages',
      id: 'm-1',
      data: { thread_id: 'th-1', created_by: ACTOR_ID, content: 'reply body', direction: 'outbound', visibility: 'external' },
    },
  }

  function mockEmailPipeline(stageConfig: any, integrationRow: any) {
    const chain: any = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      in: vi.fn(() => chain),
      is: vi.fn(() => chain),
      not: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      order: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      then: (onF: any, onR: any) => Promise.resolve({ data: null, error: null }).then(onF, onR),
    }
    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      if (table === 'pipelines') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'pipe-1', stages: [{ stage_type: 'send_email', config: stageConfig }], is_active: true },
            error: null,
          }),
        } as any
      }
      if (table === 'pipeline_executions') {
        return {
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: { id: EXEC_ID }, error: null }),
        } as any
      }
      if (table === 'actions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'a-2', handler: 'send_email', handler_module: 'functions', config: {} },
            error: null,
          }),
        } as any
      }
      if (table === 'integrations') {
        const q: any = {
          select: vi.fn(() => q), eq: vi.fn(() => q), in: vi.fn(() => q), is: vi.fn(() => q),
          limit: vi.fn(() => q),
          single: vi.fn(() => Promise.resolve({ data: integrationRow, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: integrationRow, error: null })),
        }
        return q
      }
      if (table === 'threads') {
        const q: any = {
          select: vi.fn(() => q), eq: vi.fn(() => q),
          maybeSingle: vi.fn(() => Promise.resolve({ data: { target_type: 'items', target_id: 'item-1' }, error: null })),
        }
        return q
      }
      if (table === 'items') {
        const q: any = {
          select: vi.fn(() => q), eq: vi.fn(() => q),
          maybeSingle: vi.fn(() => Promise.resolve({ data: { created_by: OWNER_ID }, error: null })),
        }
        return q
      }
      if (table === 'people') {
        const ALL_PEOPLE = [
          { id: OWNER_ID, email: 'owner@x.test', account_id: 'acct-cust' },
          { id: ACTOR_ID, email: 'staff@x.test', account_id: 'acct-staff' },
        ]
        let idsFilter: string[] | null = null
        const q: any = {
          select: vi.fn(() => q), eq: vi.fn(() => q),
          in: vi.fn((_col: string, ids: string[]) => { idsFilter = ids; return q }),
          then: (onF: any, onR: any) =>
            Promise.resolve({ data: ALL_PEOPLE.filter(p => !idsFilter || idsFilter.includes(p.id)), error: null }).then(onF, onR),
        }
        return q
      }
      if (table === 'webhook_deliveries') {
        const q: any = {
          select: vi.fn(() => q), eq: vi.fn(() => q), in: vi.fn(() => q),
          insert: vi.fn(() => q), update: vi.fn(() => q),
          single: vi.fn(() => Promise.resolve({ data: { id: 'del-1' }, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          then: (onF: any, onR: any) => Promise.resolve({ data: null, error: null }).then(onF, onR),
        }
        return q
      }
      return chain
    })
  }

  const resendIntegration = {
    id: 'int-1',
    slug: 'transactional-email',
    config: {
      outbound_adapter: 'adapters/resend-outbound',
      api_url: 'https://api.resend.com/emails',
      from: 'Support <noreply@x.test>',
      templates: { ticket_reply: { subject: 'Re: ticket', text: 'staff said: {{record.content}}' } },
    },
    credentials: { api_token: { source: 'value', value: 're_test' } },
  }

  it("emails the ticket owner via Resend and excludes the actor", async () => {
    mockEmailPipeline(
      { integration_slug: 'transactional-email', template: 'ticket_reply', recipients: ['owner'], exclude_actor: true },
      resendIntegration
    )
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{"id":"em_1"}', { status: 200 }))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await runPipeline('pipe-1', triggerData, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output.emailed_count).toBe(1)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    const body = JSON.parse(init.body)
    expect(body.to).toEqual(['owner@x.test'])           // owner resolved through message->thread->item
    expect(body.to).not.toContain('staff@x.test')       // actor excluded
    expect(body.from).toBe('Support <noreply@x.test>')
    expect(body.subject).toBe('Re: ticket')
    expect(init.headers.Authorization).toBe('Bearer re_test')
    vi.unstubAllGlobals()
  })

  it('no-ops with emailed_count 0 when the integration is not configured', async () => {
    mockEmailPipeline(
      { integration_slug: 'transactional-email', subject: 'x', text: 'y', recipients: ['owner'] },
      null
    )
    const result = await runPipeline('pipe-1', triggerData, makeCtx())
    expect(result.stages[0].status).toBe('success')
    expect(result.stages[0].output.emailed_count).toBe(0)
    expect(result.stages[0].output.skipped).toMatch(/not configured/)
  })
})

// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_sweepStaleExecutions:block" type="block" identity="describe_sweepStaleExecutions" parent="none"]
// CIL[DOC-MACRO purpose="Test stale execution sweeper"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify sweepStaleExecutions marks stale rows failed and leaves fresh rows alone"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner" layer="test-unit" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests sweepStaleExecutions"]
// CIL[DOC-MICRO logic_summary="Mocks adminDb.from('pipeline_executions').update chain and verifies the correct statuses and cutoff are targeted" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('sweepStaleExecutions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('marks running/pending/queued rows older than the stale window as failed', async () => {
    const updateSpy = vi.fn().mockReturnThis()
    const inSpy = vi.fn().mockReturnThis()
    const ltSpy = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(adminDb.from).mockReturnValue({
      update: updateSpy,
      in: inSpy,
      lt: ltSpy
    } as any)

    await sweepStaleExecutions()

    expect(adminDb.from).toHaveBeenCalledWith('pipeline_executions')
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed' })
    )
    expect(inSpy).toHaveBeenCalledWith('status', ['running', 'pending', 'queued'])
    // lt cutoff must be ~10 minutes ago
    const cutoffArg = ltSpy.mock.calls[0][1] as string
    const cutoffMs = new Date(cutoffArg).getTime()
    const expectedMs = Date.now() - 10 * 60 * 1000
    expect(Math.abs(cutoffMs - expectedMs)).toBeLessThan(5000)
  })

  it('logs a warning but does not throw when the sweep update fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.mocked(adminDb.from).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({ error: { message: 'DB gone' } })
    } as any)

    await expect(sweepStaleExecutions()).resolves.toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('pipeline_executions stale sweep failed'),
      'DB gone'
    )
    warnSpy.mockRestore()
  })
})
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner.test.ts:describe_sweepStaleExecutions:block"]
