// CIL[BEGIN stable_id="~/.framework/tests/unit/pipeline-runner-background.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Unit tests for the pipeline-runner-background dispatch function"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify auth gating, payload validation, and correct runPipeline invocation"]
// CIL[DOC-CONTEXT module="tests/unit/pipeline-runner-background" layer="test-unit" related_files=".framework/functions/pipeline-runner-background.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Mocks pipeline-runner and db modules"]
// CIL[DOC-MICRO logic_summary="Stubs INTERNAL_INVOKE_SECRET, mocks runPipeline and sweepStaleExecutions, exercises the raw handler function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() }
}))

vi.mock('../../functions/_shared/pipeline-runner.ts', () => ({
  runPipeline: vi.fn(),
  sweepStaleExecutions: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined)
}))

import { handler } from '../../functions/pipeline-runner-background.ts'
import { runPipeline } from '../../functions/_shared/pipeline-runner.ts'
// CIL[END stable_id="~/.framework/tests/unit/pipeline-runner-background.test.ts:module_header:module_header"]

function makeEvent(body: any, secret = 'test-secret'): any {
  return {
    httpMethod: 'POST',
    path: '/.netlify/functions/pipeline-runner-background',
    headers: { 'x-internal-secret': secret },
    body: JSON.stringify(body),
    queryStringParameters: {}
  }
}

describe('pipeline-runner-background handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('INTERNAL_INVOKE_SECRET', 'test-secret')
    vi.mocked(runPipeline).mockResolvedValue({
      executionId: 'exec-1',
      pipelineId: 'pipe-1',
      status: 'completed',
      stages: [],
      durationMs: 5
    })
  })

  it('returns 403 when the internal secret is wrong', async () => {
    const res = await handler(makeEvent({ pipeline_id: 'pipe-1' }, 'wrong-secret'), {})
    expect(res.statusCode).toBe(403)
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('returns 403 when the internal secret is absent', async () => {
    const event = makeEvent({ pipeline_id: 'pipe-1' })
    delete event.headers['x-internal-secret']
    const res = await handler(event, {})
    expect(res.statusCode).toBe(403)
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('returns 400 when pipeline_id is missing from the body', async () => {
    const res = await handler(makeEvent({ trigger_data: {}, account_id: 'acct-1' }), {})
    expect(res.statusCode).toBe(400)
    expect(runPipeline).not.toHaveBeenCalled()
  })

  it('calls runPipeline with the dispatched pipeline_id and execution_id', async () => {
    const payload = {
      pipeline_id: 'pipe-42',
      trigger_data: { event: 'item_created', entity_id: 'item-9' },
      account_id: 'acct-7',
      execution_id: 'exec-queued-99',
      trigger_id: 'trig-3'
    }
    const res = await handler(makeEvent(payload), {})

    expect(runPipeline).toHaveBeenCalledOnce()
    const [calledPipelineId, calledTriggerData, calledCtx, calledOpts] =
      vi.mocked(runPipeline).mock.calls[0]
    expect(calledPipelineId).toBe('pipe-42')
    expect(calledTriggerData).toMatchObject({ event: 'item_created', entity_id: 'item-9' })
    expect(calledOpts?.executionId).toBe('exec-queued-99')
    expect(calledCtx.accountId).toBe('acct-7')

    const body = JSON.parse(res.body)
    expect(body.ok).toBe(true)
    expect(body.execution_id).toBe('exec-1')
    expect(body.status).toBe('completed')
  })

  it('returns ok:false when the pipeline itself reports failure', async () => {
    vi.mocked(runPipeline).mockResolvedValue({
      executionId: 'exec-1',
      pipelineId: 'pipe-1',
      status: 'failed',
      stages: [],
      durationMs: 5,
      error: 'stage exploded'
    })
    const res = await handler(makeEvent({ pipeline_id: 'pipe-1', execution_id: 'exec-1' }), {})
    const body = JSON.parse(res.body)
    expect(body.ok).toBe(false)
    expect(body.status).toBe('failed')
  })

  it('returns 500 when runPipeline throws', async () => {
    vi.mocked(runPipeline).mockRejectedValue(new Error('Pipeline not found'))
    const res = await handler(makeEvent({ pipeline_id: 'pipe-1', execution_id: 'exec-1' }), {})
    expect(res.statusCode).toBe(500)
    const body = JSON.parse(res.body)
    expect(body.error).toBe('Pipeline not found')
    expect(body.execution_id).toBe('exec-1')
  })
})
