// Does NOT use createHandler — it would resolve the secret to anonymous and 401 before reaching the handler. Auth is checked inline and SYSTEM_PRINCIPAL provides the machine context directly.

import { createHash, timingSafeEqual } from 'node:crypto'
import { runPipeline, sweepStaleExecutions } from './_shared/pipeline-runner'
import { SYSTEM_PRINCIPAL } from './_shared/principal'
import { adminDb } from './_shared/db'


// duplicated here rather than imported because isInternalInvokeAuthorized is unexported from principal.ts
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
