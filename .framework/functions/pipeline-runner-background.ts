// CIL[BEGIN stable_id="~/.framework/functions/pipeline-runner-background.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/pipeline-runner-background.ts"]
// CIL[DOC-MACRO purpose="Background entry point for event-triggered pipeline executions — receives dispatched payloads from checkAndFireTriggers and runs the pipeline in an isolated process with its own connection budget"]
// CIL[DOC-RESPONSIBILITY responsibility="Authenticate internal dispatch calls via INTERNAL_INVOKE_SECRET, reconstruct a machine RequestContext, and invoke runPipeline with the pre-created execution_id so the queued row transitions to running/completed rather than being duplicated"]
// CIL[DOC-CONTEXT module="pipeline-runner-background" layer="functions" related_files=".framework/functions/_shared/trigger-engine.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="POST body { pipeline_id, trigger_data, account_id, execution_id, trigger_id } with X-Internal-Secret header" outputs="{ ok: true, execution_id } | { error }" errors="403 on missing/wrong secret, 400 on missing pipeline_id, 500 on pipeline failure" side_effects="Runs the named pipeline; updates pipeline_executions row from queued→running→terminal"]
// CIL[DOC-MICRO logic_summary="Validates the shared internal secret (timing-safe, same as principal.isInternalInvokeAuthorized), builds a SYSTEM_PRINCIPAL RequestContext carrying the original account scope, then calls runPipeline with the caller's pre-created execution_id. Status 'queued' → 'running' is handled inside runPipeline via the new opts.executionId parameter." notable_decisions="Does NOT use createHandler — it would resolve the secret to anonymous and 401 before reaching the handler. Auth is checked inline and SYSTEM_PRINCIPAL provides the machine context directly."]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]

import { createHash, timingSafeEqual } from 'node:crypto'
import { runPipeline, sweepStaleExecutions } from './_shared/pipeline-runner'
import { SYSTEM_PRINCIPAL } from './_shared/principal'
import { adminDb } from './_shared/db'
// CIL[END stable_id="~/.framework/functions/pipeline-runner-background.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/pipeline-runner-background.ts:isdispatchauthorized:function" type="function" identity="isDispatchAuthorized" parent="~/.framework/functions/pipeline-runner-background.ts"]
// CIL[DOC-MACRO purpose="Verify the X-Internal-Secret header using timing-safe comparison (mirrors principal.isInternalInvokeAuthorized)"]
// CIL[DOC-RESPONSIBILITY responsibility="Return true only when the request carries a valid INTERNAL_INVOKE_SECRET"]
// CIL[DOC-CONTEXT module="pipeline-runner-background" layer="functions" related_files=".framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="event headers" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="SHA-256 both sides before timingSafeEqual so early-exit on length mismatch cannot leak the expected secret length via response timing — identical pattern to principal.isInternalInvokeAuthorized" notable_decisions="duplicated here rather than imported because isInternalInvokeAuthorized is unexported from principal.ts"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function isDispatchAuthorized(event: any): boolean {
  const expected = (globalThis as any).process?.env?.INTERNAL_INVOKE_SECRET
  if (!expected) return false

  const provided = event.headers?.['x-internal-secret'] || event.headers?.['X-Internal-Secret']
  if (!provided || typeof provided !== 'string') return false

  const expectedHash = createHash('sha256').update(expected).digest()
  const providedHash = createHash('sha256').update(provided).digest()

  try {
    return timingSafeEqual(expectedHash, providedHash)
  } catch {
    return false
  }
}
// CIL[END stable_id="~/.framework/functions/pipeline-runner-background.ts:isdispatchauthorized:function"]


// CIL[BEGIN stable_id="~/.framework/functions/pipeline-runner-background.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/pipeline-runner-background.ts"]
// CIL[DOC-MACRO purpose="Netlify function handler for dispatched pipeline executions"]
// CIL[DOC-RESPONSIBILITY responsibility="Authenticate, sweep stale executions, then runPipeline with the caller's pre-created execution_id"]
// CIL[DOC-CONTEXT module="pipeline-runner-background" layer="functions" related_files=".framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-CONTRACT inputs="POST body { pipeline_id, trigger_data, account_id, execution_id, trigger_id }" outputs="{ ok, execution_id, status } | { error }" errors="403 unauthorized, 400 missing pipeline_id" side_effects="Pipeline runs; pipeline_executions transitions queued→running→terminal"]
// CIL[DOC-MICRO logic_summary="Reject without INTERNAL_INVOKE_SECRET; build SYSTEM_PRINCIPAL ctx scoped to the dispatching account; runPipeline with opts.executionId so the pre-created row is claimed rather than duplicated; return the final ExecutionResult" notable_decisions="sweepStaleExecutions is called opportunistically on entry — same fire-and-forget pattern as runPipeline itself, but on a fresh process it costs nothing"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = async (event: any, _context: any) => {
  const requestId = crypto.randomUUID()

  if (!isDispatchAuthorized(event)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden — invalid internal secret' }),
    }
  }

  let body: any = {}
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {})
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { pipeline_id, trigger_data, account_id, execution_id, trigger_id } = body

  if (!pipeline_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'pipeline_id is required' }) }
  }

  // Opportunistic sweep — picks up any executions orphaned by a prior dead
  // invocation before this one starts its own work.
  void sweepStaleExecutions().catch(() => {})

  const ctx = {
    requestId,
    principal: {
      ...SYSTEM_PRINCIPAL,
      provenance: {
        ...SYSTEM_PRINCIPAL.provenance,
        sourceType: 'trigger' as const,
        invokedAt: new Date().toISOString(),
        triggerId: trigger_id || null,
      },
    },
    db: adminDb,
    accountId: account_id || null,
    appId: null,
    query: {},
    requestPath: '/.netlify/functions/pipeline-runner-background',
    headers: event.headers || {},
  }

  try {
    const result = await runPipeline(pipeline_id, trigger_data || {}, ctx as any, {
      executionId: execution_id,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: result.status === 'completed',
        execution_id: result.executionId,
        status: result.status,
      }),
    }
  } catch (err: any) {
    console.error(`[${requestId}] pipeline-runner-background failed for pipeline ${pipeline_id}:`, err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Pipeline execution failed', execution_id }),
    }
  }
}
// CIL[END stable_id="~/.framework/functions/pipeline-runner-background.ts:handler:constant"]
