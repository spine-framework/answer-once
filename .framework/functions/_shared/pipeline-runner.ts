/**
 * @module   pipeline-runner
 * @audience internal
 * @layer    shared-core
 * @stability stable
 *
 * This module serves as a pipeline runner that orchestrates the execution of various tasks within the system. It integrates with middleware, database operations, and auditing mechanisms to ensure a cohesive flow of operations. The module is designed to handle multi-step processes, ensuring that each step is executed in the correct order and context.
 * 
 * INVARIANT: The CoreContext must always be provided to maintain the integrity of the operations.
 *
 * @seeAlso middleware (provides context for operations).
 * @seeAlso db (handles database interactions).
 * @seeAlso audit (manages auditing of operations).
 * @seeAlso integration-outbound (executes outbound integrations).
 *
 * @cil-generated
 */









import { CoreContext } from './middleware'
import { adminDb } from './db'
import { emitAudit, emitSpan } from './audit'
import { emitOutcome } from './outcomes'
import { withSpan } from './tracing'
import { resolveKnowledgeScope, knowledgeRowAllowed } from './kb'
import { resolveNotificationRecipients } from './notify'
import {
  getBrandsConfig,
  resolveBrand,
  accountBrandSlugs,
  brandForAccount,
  type SiteBrand,
} from './site-brand'
// integration-outbound is imported lazily — a static edge closes the cycle
// middleware → security → rate-limit → funnel → trigger-engine →
// pipeline-runner → integration-outbound → middleware, leaving createHandler
// undefined during module evaluation.
const executeOutbound = async (ctx: CoreContext, args: any) =>
  (await import('../integration-outbound')).execute(ctx, args)
/**
 * UUID_RE is a regular expression that validates the format of UUIDs. It exists to ensure that any UUIDs processed in this module conform to the standard UUID format.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/**
 * Validates whether a given string is a properly formatted UUID. This function is essential for ensuring that UUIDs are correctly identified in the pipeline processing.
 *
 * @inputSpec
 *   - v: string (optional|nullable) — the value to be checked for UUID format.
 * @outputSpec  v is string — returns true if v is a valid UUID, otherwise false.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function isUuid(v: string | undefined | null): v is string { return !!v && UUID_RE.test(v) }
/**
 * The StageResult interface defines the structure of the result produced by a stage in a pipeline execution. It captures essential information about the stage's execution status, output, and duration.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export interface StageResult {
  stageIndex: number
  stageType: string
  status: 'success' | 'failed' | 'skipped'
  output?: any
  error?: string
  durationMs: number
}
/**
 * The ExecutionResult interface defines the structure of the result returned after executing a pipeline, including its status and duration. It is essential for tracking the outcome of pipeline executions in the system.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export interface ExecutionResult {
  executionId: string
  pipelineId: string
  status: 'completed' | 'failed' | 'cancelled'
  stages: StageResult[]
  durationMs: number
  error?: string
}
/**
 * The PipelineStage interface defines the structure for a stage in a data processing pipeline, specifying the type of stage and its configuration options. It allows for flexible error handling and configuration management within the pipeline execution.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface PipelineStage {
  stage_type: string
  config?: Record<string, any>
  continue_on_error?: boolean
}
/**
 * Runs a specified pipeline by executing its stages in sequence, tracking their results and handling errors. This function manages the lifecycle of a pipeline execution, including logging and database updates.
 *
 * @macro       Pipeline execution orchestrator that manages stage processing and error handling.
 * @micro       Iterates through pipeline stages, executing each stage while capturing results and handling potential errors based on stage configuration.
 * @inputSpec
 *   pipelineId: string (required) — The unique identifier of the pipeline to run.
 *   triggerData: any (optional) — Data to trigger the pipeline execution.
 *   ctx: CoreContext (required) — The context containing execution metadata and user information.
 * @outputSpec  Promise<ExecutionResult> — Returns the result of the pipeline execution, including stage results.
 * @throws      Error — Pipeline not found or inactive: {pipelineId}, Error — Failed to create execution: {execError?.message}, Error — Action not found for stage type: {stage.stage_type}, Error — Stage {i} ({stage.stage_type}) failed: {errorMessage}
 * @sideEffects Writes to 'pipeline_executions' table, emits audit events.
 * @stability   stable
 * @calls       adminDb.from('pipelines'), adminDb.from('pipeline_executions'), adminDb.from('actions'), executeStage, emitAudit
 * @errorHandling Handles errors at each stage and decides whether to continue based on stage configuration.
 * @cil-generated
 */
// throws nothing — persistence failure must not mask the pipeline's own result
/** The update result
 * is checked and retried once — an unchecked failure is what previously
 * left rows stuck 'running' forever while the audit span still claimed
 * 'pipeline.completed'. A retry failure is logged loudly so the row can
 * be found and reconciled.
 *
 * @inputSpec
 *   ctx: CoreContext (required) — context for request-id logging.
 *   executionId: string (required) — the pipeline_executions row to update.
 *   patch: Record<string, any> (required) — terminal status payload.
 * @outputSpec  Promise<void>
 * @sideEffects Updates public.pipeline_executions; logs on failure.
 * @stability   stable
 * @calls       adminDb.from('pipeline_executions').update
 * @cil-generated
 */
async function persistExecutionResult(
  ctx: CoreContext,
  executionId: string,
  patch: Record<string, any>
): Promise<void> {
  let { error } = await adminDb
    .from('pipeline_executions')
    .update(patch)
    .eq('id', executionId)
  if (error) {
    console.error(`[${ctx.requestId}] pipeline_executions final update failed for ${executionId}: ${error.message} — retrying`)
    const retry = await adminDb
      .from('pipeline_executions')
      .update(patch)
      .eq('id', executionId)
    error = retry.error
    if (error) {
      console.error(`[${ctx.requestId}] pipeline_executions final update retry failed for ${executionId}: ${error.message}`)
    }
  }
}

// An execution row whose runner died mid-flight (detached process killed,
// function timeout) can never write its own terminal status — it wedges
// 'running' forever. Sweep rows that have not been touched within the
// staleness window whenever a new pipeline run starts. Fire-and-forget:
// the sweep is bookkeeping, never on the critical path, and a failed
// sweep retries on the next run.
const STALE_EXECUTION_MS = 10 * 60 * 1000

export async function sweepStaleExecutions(): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_EXECUTION_MS).toISOString()
  const { error } = await adminDb
    .from('pipeline_executions')
    .update({
      status: 'failed',
      error_message: 'stale execution: runner died before terminal write (swept)',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .in('status', ['running', 'pending', 'queued'])
    .lt('updated_at', cutoff)
  if (error) console.warn('pipeline_executions stale sweep failed:', error.message)
}

export async function runPipeline(
  pipelineId: string,
  triggerData: any,
  ctx: CoreContext,
  opts?: { executionId?: string }
): Promise<ExecutionResult> {
  return withSpan(ctx, 'pipeline.run', async (ctx) => {
  const startTime = Date.now()

  void sweepStaleExecutions().catch(() => {})

  const { data: pipeline, error: pipelineError } = await adminDb
    .from('pipelines')
    .select('*')
    .eq('id', pipelineId)
    .eq('is_active', true)
    .single()

  if (pipelineError || !pipeline) {
    throw new Error(`Pipeline not found or inactive: ${pipelineId}`)
  }

  // When a pre-created execution ID is supplied (dispatched trigger
  // pipelines), claim that row — transitioning queued → running — rather
  // than inserting a duplicate. The row was created by checkAndFireTriggers
  // with status='queued' immediately before dispatch.
  let executionId: string
  if (opts?.executionId) {
    const { data: claimed, error: claimError } = await adminDb
      .from('pipeline_executions')
      .update({
        status: 'running',
        trigger_data: triggerData || {},
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', opts.executionId)
      .eq('status', 'queued')
      .select('id')

    if (claimError) {
      throw new Error(`Failed to claim queued execution ${opts.executionId}: ${claimError.message}`)
    }
    if (claimed && claimed.length > 0) {
      executionId = opts.executionId
    } else {
      // Claimed nothing — either the queued insert never landed (caller's
      // fallback UUID) or a duplicate/swept dispatch arrived. Try inserting
      // the row ourselves with the same ID: succeeds only when the row is
      // genuinely absent, so duplicate deliveries die on the PK conflict
      // instead of running the pipeline twice.
      const { data: execution, error: execError } = await adminDb
        .from('pipeline_executions')
        .insert({
          id: opts.executionId,
          pipeline_id: pipelineId,
          status: 'running',
          trigger_data: triggerData || {},
          account_id: ctx.accountId,
          created_by: isUuid(ctx.principal?.id) ? ctx.principal?.id : null,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      if (execError || !execution) {
        throw new Error(`Failed to create execution: ${execError?.message}`)
      }
      executionId = execution.id
    }
  } else {
    const { data: execution, error: execError } = await adminDb
      .from('pipeline_executions')
      .insert({
        pipeline_id: pipelineId,
        status: 'running',
        trigger_data: triggerData || {},
        account_id: ctx.accountId,
        created_by: isUuid(ctx.principal?.id) ? ctx.principal?.id : null,
        started_at: new Date().toISOString(),
        // Seed updated_at so the stale-execution sweep has a baseline from
        // t=0 — the row is 'running' the moment it exists.
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (execError || !execution) {
      throw new Error(`Failed to create execution: ${execError?.message}`)
    }
    executionId = execution.id
  }
  const stageResults: StageResult[] = []
  const stages: PipelineStage[] = pipeline.stages || []

  try {
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      const stageStartTime = Date.now()

      try {
        const { data: action, error: actionError } = await adminDb
          .from('actions')
          .select('*')
          .eq('slug', stage.stage_type)
          .eq('is_active', true)
          .single()

        if (actionError || !action) {
          throw new Error(`Action not found for stage type: ${stage.stage_type}`)
        }

        const mergedConfig = {
          ...action.config,
          ...stage.config,
          _pipelineId: pipelineId,
          _executionId: executionId,
          _stageIndex: i,
          _triggerData: triggerData
        }

        const output = await executeStage(ctx, action, mergedConfig)

        stageResults.push({
          stageIndex: i,
          stageType: stage.stage_type,
          status: 'success',
          output,
          durationMs: Date.now() - stageStartTime
        })

      } catch (stageError: any) {
        const errorMessage = stageError.message || 'Stage execution failed'
        
        stageResults.push({
          stageIndex: i,
          stageType: stage.stage_type,
          status: 'failed',
          error: errorMessage,
          durationMs: Date.now() - stageStartTime
        })

        if (!stage.continue_on_error) {
          throw new Error(`Stage ${i} (${stage.stage_type}) failed: ${errorMessage}`)
        }
      }
    }

    const durationMs = Date.now() - startTime
    
    await persistExecutionResult(ctx, executionId, {
      status: 'completed',
      result: { stages: stageResults },
      completed_at: new Date().toISOString(),
      duration_ms: durationMs
    })

    await emitAudit(ctx, 'pipeline.completed', {
      type: 'pipeline_execution',
      id: executionId,
      account_id: ctx.accountId ?? undefined
    }, {
      pipeline_id: pipelineId,
      duration_ms: durationMs,
      stages_completed: stageResults.length
    })
    await emitOutcome(ctx, 'pipeline.outcome', 'success', {
      pipeline_id: pipelineId,
      execution_id: executionId,
      stages_completed: stageResults.length,
      duration_ms: durationMs
    })

    return {
      executionId,
      pipelineId,
      status: 'completed',
      stages: stageResults,
      durationMs
    }

  } catch (error: any) {
    const durationMs = Date.now() - startTime
    
    await persistExecutionResult(ctx, executionId, {
      status: 'failed',
      result: { stages: stageResults },
      error_message: error.message,
      completed_at: new Date().toISOString(),
      duration_ms: durationMs
    })

    await emitAudit(ctx, 'pipeline.failed', {
      type: 'pipeline_execution',
      id: executionId,
      account_id: ctx.accountId ?? undefined
    }, {
      pipeline_id: pipelineId,
      error: error.message,
      stages_completed: stageResults.length
    })
    await emitOutcome(ctx, 'pipeline.outcome', 'failure', {
      pipeline_id: pipelineId,
      execution_id: executionId,
      error: error.message,
      stages_completed: stageResults.length
    })

    return {
      executionId,
      pipelineId,
      status: 'failed',
      stages: stageResults,
      durationMs,
      error: error.message
    }
  }
}, { onEnd: emitSpan })
}
/**
 * Executes a specific stage of a pipeline based on the provided action and configuration. It dynamically routes the execution to the appropriate handler based on the action's module type.
 *
 * @macro       Async function orchestrating the execution of various pipeline handlers.
 * @micro       Utilizes a switch statement to determine the handler type and delegates execution to the corresponding handler function.
 * @inputSpec
 *   - ctx: CoreContext (required) — the context for the execution.
 *   - action: any (required) — the action object containing handler information.
 *   - config: any (required) — the configuration object for the handler.
 * @outputSpec  Promise<any> — resolves to the result of the executed handler.
 * @throws      Error — unknown handler module.
 * @sideEffects none
 * @stability   stable
 * @calls       withSpan, executeFunctionHandler, executeIntegrationHandler, executeWebhookHandler, emitSpan
 * @cil-generated
 */
async function executeStage(
  ctx: CoreContext,
  action: any,
  config: any
): Promise<any> {
  return withSpan(ctx, `pipeline.stage.${action.handler || action.stage_type || 'unknown'}`, async (ctx) => {
    const handlerModule = action.handler_module || 'functions'
    const handlerName = action.handler

    switch (handlerModule) {
      case 'functions':
        return await executeFunctionHandler(ctx, handlerName, config)
      
      case 'integrations':
        return await executeIntegrationHandler(ctx, handlerName, config)
      
      case 'webhook':
        return await executeWebhookHandler(ctx, action, config)
      
      default:
        throw new Error(`Unknown handler module: ${handlerModule}`)
    }
  }, { onEnd: emitSpan })
}
// Resolves {{trigger.*}} and {{record.*}} placeholders in stage config values.
// `trigger` is the triggerData envelope; `record` is the entity row that fired
// it (triggerData.entity.data), so {{record.data.action_type}} reaches into the
// record's jsonb and {{record.account_id}} gives the emitting account.
/**
 * Resolves template strings by replacing placeholders with corresponding values from the provided trigger data. This function is used to dynamically generate content based on the context of the trigger data.
 *
 * @macro       Template resolver for dynamic content generation.
 * @micro       Utilizes a recursive approach to handle strings, arrays, and objects for template resolution.
 * @inputSpec
 *   - value: any (required) — the input value which may contain template strings, arrays, or objects.
 *   - triggerData: any (required) — the data context used for resolving template placeholders.
 * @outputSpec  any — the resolved value with templates replaced or the original value if no templates were found.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function resolveTemplates(value: any, triggerData: any, brand?: SiteBrand | null): any {
  const roots: Record<string, any> = {
    trigger: triggerData,
    record: triggerData?.entity?.data,
  }
  // {{brand.*}} — template-facing shape: {{brand.name}}, {{brand.url}},
  // {{brand.from}}, {{brand.logo_url}}, {{brand.email_logo_url}}, {{brand.slug}}
  if (brand) {
    roots.brand = {
      slug: brand.slug,
      name: brand.name,
      url: brand.site_url,
      from: brand.email_from,
      logo_url: brand.logo_url,
      email_logo_url: brand.email_logo_url,
    }
  }
  if (typeof value === 'string') {
    if (!value.includes('{{')) return value
    return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, rawPath) => {
      const parts = String(rawPath).trim().split('.')
      let cur: any = roots[parts[0]]
      if (cur === undefined) return match
      for (const part of parts.slice(1)) {
        if (cur == null) return match
        cur = cur[part]
      }
      return cur == null ? '' : String(cur)
    })
  }
  if (Array.isArray(value)) return value.map(v => resolveTemplates(v, triggerData))
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) out[k] = resolveTemplates(v, triggerData)
    return out
  }
  return value
}

/**
 * Resolves an account ID based on a provided slug. This function exists to facilitate the retrieval of account identifiers in a structured manner.
 *
 * @macro       Async function that retrieves account IDs from a database using a slug.
 * @micro       Queries the database for an account ID matching the provided slug and throws an error if not found.
 * @inputSpec
 *   ctx: CoreContext (required) — the context object containing necessary execution context.
 *   slug: string (required) — the slug used to identify the account.
 * @outputSpec  Promise<string> — resolves to the account ID as a string.
 * @throws      Error — if the slug does not resolve to an account.
 * @sideEffects none
 * @stability   stable
 * @calls       adminDb.from('accounts')
 * @cil-generated
 */
async function resolveAccountId(ctx: CoreContext, slug: string): Promise<string> {
  const { data } = await adminDb
    .from('accounts').select('id').eq('slug', slug).maybeSingle()
  if (!data?.id) throw new Error(`account_slug '${slug}' did not resolve to an account`)
  return data.id
}


/**
 * The stageHandlers constant defines a set of asynchronous functions for handling various stages of a pipeline, specifically for updating and creating records in a database. It ensures that necessary parameters are provided and manages database interactions based on the provided configuration.
 *
 * @throws      Error — entity is required for update_item; Error — record_id missing and match found no record; Error — entity and data are required for create_record; Error — Update failed: {error.message}
 * @sideEffects Database writes for updating or creating records.
 * @stability   stable
 * @calls       adminDb.from, resolveTemplates, resolveAccountId
 * @cil-generated
 */
// Entity-scoped recipient handles understood by send_notification/send_email.
// 'owner' = created_by of the record the trigger fired on (for a message, the
// record its thread points at); 'watchers' = watchers rows on that record;
// 'self' = the person who created the triggering record.
const ENTITY_RECIPIENTS = new Set(['owner', 'watchers', 'self'])

// Walks message -> thread -> target so entity handles resolve against the
// owning record (e.g. the ticket item behind a reply), not just the event row.
async function resolveEntityTarget(entity: any): Promise<{ targetTable: string | null, targetId: string | null }> {
  if (!entity?.type || !entity?.id) return { targetTable: null, targetId: null }
  if (entity.type === 'messages' && entity?.data?.thread_id) {
    const { data: th } = await adminDb
      .from('threads')
      .select('target_type, target_id')
      .eq('id', entity.data.thread_id)
      .maybeSingle()
    if (th?.target_id) {
      return { targetTable: th.target_type || 'items', targetId: th.target_id }
    }
    return { targetTable: 'threads', targetId: entity.data.thread_id }
  }
  return { targetTable: entity.type, targetId: entity.id }
}

async function resolveEntityRecipients(recipients: any[], entity: any): Promise<string[]> {
  const wanted = (recipients || []).filter((r: any) => ENTITY_RECIPIENTS.has(r))
  if (!wanted.length) return []

  const ids: string[] = []
  if (wanted.includes('self') && entity?.data?.created_by) {
    ids.push(entity.data.created_by)
  }

  if (wanted.includes('owner') || wanted.includes('watchers')) {
    const { targetTable, targetId } = await resolveEntityTarget(entity)
    if (targetTable && targetId) {
      if (wanted.includes('owner')) {
        const { data: rec } = await adminDb
          .from(targetTable)
          .select('created_by')
          .eq('id', targetId)
          .maybeSingle()
        if (rec?.created_by) ids.push(rec.created_by)
      }
      if (wanted.includes('watchers')) {
        const { data: ws } = await adminDb
          .from('watchers')
          .select('person_id')
          .eq('target_id', targetId)
        for (const w of ws || []) {
          if (w?.person_id) ids.push(w.person_id)
        }
      }
    }
  }
  return [...new Set(ids)]
}


const stageHandlers: Record<string, Function> = {
  'update_item': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    const { entity } = config
    let recordId = config.record_id ? resolveTemplates(config.record_id, triggerData) : null

    if (!entity) {
      throw new Error('entity is required for update_item')
    }

    // Optional record lookup: match finds the target row when the pipeline
    // doesn't know its id (e.g. the deal linked to a prospect account).
    let existing: any = null
    if (!recordId && config.match) {
      const m = resolveTemplates(config.match, triggerData)
      let q = adminDb.from(entity).select('*').limit(1)
      if (m.account_slug) {
        q = q.eq('account_id', await resolveAccountId(ctx, m.account_slug))
      } else if (m.account_id) {
        q = q.eq('account_id', m.account_id)
      } else {
        q = q.eq('account_id', ctx.accountId)
      }
      for (const [key, value] of Object.entries(m.filters || {})) {
        q = q.eq(key, value as any)
      }
      const { data: found } = await q
      existing = found?.[0] || null
      recordId = existing?.id
    }
    if (!recordId) {
      throw new Error('update_item: record_id missing and match found no record')
    }

    let updateData = resolveTemplates(config.data, triggerData)
    // Merge nested data jsonb — stage configs carry only the keys they change.
    if (updateData?.data) {
      if (!existing) {
        const { data: cur } = await adminDb.from(entity).select('data').eq('id', recordId).single()
        existing = cur
      }
      updateData = { ...updateData, data: { ...(existing?.data || {}), ...updateData.data } }
    }

    const { data: result, error } = await adminDb
      .from(entity)
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: ctx.principal?.id
      })
      .eq('id', recordId)
      .select()
      .single()

    if (error) throw new Error(`Update failed: ${error.message}`)
    return { success: true, record: result }
  },

  'create_record': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    const { entity } = config
    const data = resolveTemplates(config.data, triggerData)

    if (!entity || !data) {
      throw new Error('entity and data are required for create_record')
    }

    // Optional cross-account target (e.g. a record lives in the platform
    // account while the trigger fires in a customer account).
    let accountId = ctx.accountId
    if (config.account_slug) {
      accountId = await resolveAccountId(ctx, resolveTemplates(config.account_slug, triggerData))
    }

    // Optional idempotency — skip the insert when a matching record exists.
    if (config.dedupe?.field) {
      const value = resolveTemplates(config.dedupe.value, triggerData)
      let q = adminDb.from(entity).select('*').eq(config.dedupe.field, value)
      if (config.dedupe.account_scoped !== false) q = q.eq('account_id', accountId)
      const { data: found } = await q.limit(1)
      if (found?.length) return { success: true, record: found[0], deduped: true }
    }

    const { data: result, error } = await adminDb
      .from(entity)
      .insert({
        ...data,
        account_id: accountId,
        created_by: isUuid(ctx.principal?.id) ? ctx.principal?.id : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(`Create failed: ${error.message}`)
    return { success: true, record: result }
  },

  'http_request': async (ctx: CoreContext, config: any) => {
    const { method = 'GET', url, headers = {}, body } = config
    
    if (!url) {
      throw new Error('url is required for http_request')
    }

    const result = await executeOutbound(ctx, {
      integration_slug: 'generic-http',
      action_config: { url, method, headers, body: ['POST', 'PUT', 'PATCH'].includes(method) ? body : undefined }
    })

    return {
      success: true,
      status: result.response_status,
      body: result.response_body
    }
  },

  // Make.com scenario trigger — routes through the 'make' integration so the
  // scenario webhook URL lives in integration config (bearer-capability URL)
  // rather than pipeline stage config. action_config.scenario_key picks an
  // entry from integration.config.scenarios; the adapter wraps the payload in
  // a stable envelope and adds x-make-apikey auth.
  // record_id defaults to the trigger entity so the envelope carries the
  // actual record (e.g. the matched ticket on directive_matched) — without it
  // Make scenarios receive record:null. config.body supports {{entity.*}} /
  // {{trigger.*}} templates like the record stages.
  'make_scenario': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    const result = await executeOutbound(ctx, {
      integration_slug: config.integration_slug || 'make',
      record_id: config.record_id
        ? resolveTemplates(config.record_id, triggerData)
        : (triggerData?.entity_id || null),
      action_config: {
        scenario_key: config.scenario_key,
        event: config.event || 'directive_matched',
        method: config.method,
        headers: config.headers,
        body: config.body ? resolveTemplates(config.body, triggerData) : undefined,
      }
    })
    return {
      success: true,
      status: result.response_status,
      body: result.response_body
    }
  },

  'send_notification': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData
    const recipients = resolveTemplates(config.recipients ?? [], triggerData)
    const entity = triggerData?.entity

    // Entity-scoped handles ('owner', 'watchers', 'self') resolve through the
    // record the trigger fired on; role:/UUID entries go through notify.ts.
    const entityPersonIds = await resolveEntityRecipients(recipients, entity)
    const personIds = [
      ...entityPersonIds,
      ...(await resolveNotificationRecipients(ctx, recipients.filter((r: any) => typeof r === 'string' && !ENTITY_RECIPIENTS.has(r))))
    ]
    // In-app notifications are branded by the entity's account brand so
    // {{brand.*}} placeholders resolve the recipient's brand, not the actor's.
    const notifBrand = await brandForAccount(await getBrandsConfig(), entity?.data?.account_id)
    const message = resolveTemplates(config.message, triggerData, notifBrand)
    const entity_type = config.entity_type
    // entity_id 'target' resolves the record behind the event (e.g. the ticket
    // a reply was posted on) so notifications deep-link to it.
    let entity_id = resolveTemplates(config.entity_id, triggerData)
    if (entity_id === 'target') {
      entity_id = (await resolveEntityTarget(entity)).targetId || null
    }

    // watchers is the subscription table (who follows what) — deliveries go to
    // the notifications table, one row per recipient. Migration 050 adds it.
    // Recipient account scoping: entity handles (owner/watchers/self) can point
    // at people outside ctx.accountId — e.g. a staff reply in the support
    // account notifying a customer — so each row is stamped with the
    // recipient's own account_id, falling back to ctx.accountId.
    // Recipients may be person UUIDs, 'role:<slug>' handles, or entity handles 'owner'/'watchers'/'self' — resolveNotificationRecipients maps role slugs to this account's active people ids; a role matching nobody is a valid 0-notification result, not an error.
    const uniquePersonIds = [...new Set(personIds)]
    const personAccounts = new Map<string, string>()
    if (uniquePersonIds.length) {
      const { data: peopleRows } = await adminDb
        .from('people')
        .select('id, account_id')
        .in('id', uniquePersonIds)
      for (const p of peopleRows || []) {
        if (p?.id && p?.account_id) personAccounts.set(p.id, p.account_id)
      }
    }
    const notifications = uniquePersonIds.map((recipientId: string) => ({
      account_id: personAccounts.get(recipientId) || ctx.accountId,
      person_id: recipientId,
      message,
      source_type: 'pipeline_execution',
      source_id: entity_id || ctx.requestId,
      target_type: entity_type || null,
      target_id: entity_id && /^[0-9a-f-]{36}$/i.test(entity_id) ? entity_id : null,
      is_read: false,
    }))

    if (notifications.length > 0) {
      const { error } = await adminDb
        .from('notifications')
        .insert(notifications)

      if (error) throw new Error(`Notification failed: ${error.message}`)
    }

    return { success: true, notified_count: notifications.length }
  },

  // Sends email through an outbound integration (e.g. Resend) to resolved
  // recipients. Recipients accept literal emails plus the same handles as
  // send_notification (role:<slug>, person UUID, 'owner', 'watchers', 'self').
  // 'exclude_actor' (default true) drops the person who wrote the triggering
  // record so a support rep never emails themselves. A missing/inactive
  // integration is reported as success with emailed_count 0 — pipelines stay
  // green until the customer configures a provider.
  'send_email': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData
    const entity = triggerData?.entity
    const integrationSlug = config.integration_slug || 'transactional-email'

    const { data: integration } = await adminDb
      .from('integrations')
      .select('id, config')
      .eq('slug', integrationSlug)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    // No configured provider → no-op so seeded pipelines stay green on installs
    // that never set up email.
    if (!integration) {
      return { success: true, emailed_count: 0, skipped: 'integration not configured' }
    }

    // Named templates live on the integration (integration.config.templates.<key>
    // = {subject, html, text}); inline stage config supplies them otherwise.
    // A '<key>:<brand>' template overrides per brand group below.
    const baseTpl = { subject: config.subject, html: config.html, text: config.text }
    const named = config.template && integration?.config?.templates?.[config.template]
    if (named) {
      baseTpl.subject = named.subject ?? baseTpl.subject
      baseTpl.html = named.html ?? baseTpl.html
      baseTpl.text = named.text ?? baseTpl.text
    }

    if (!baseTpl.subject || (!baseTpl.html && !baseTpl.text)) {
      throw new Error('send_email: subject and html or text are required (inline or via integration template)')
    }

    const recipients = resolveTemplates(config.recipients ?? [], triggerData)
    const personIds = new Set([
      ...(await resolveEntityRecipients(recipients, entity)),
      ...(await resolveNotificationRecipients(ctx, recipients.filter((r: any) => typeof r === 'string' && !ENTITY_RECIPIENTS.has(r) && !r.includes('@')))),
    ])
    if (config.exclude_actor !== false && entity?.data?.created_by) {
      personIds.delete(entity.data.created_by)
    }

    const literalEmails = new Set<string>(recipients.filter((r: any) => typeof r === 'string' && r.includes('@')))
    const { data: people } = personIds.size
      ? await adminDb
          .from('people')
          .select('id, email, account_id')
          .in('id', [...personIds])
      : { data: [] as any[] }

    // Group recipients by their account's brand — one branded Resend call per
    // group. Literal addresses and brand-less accounts land on the default.
    const brandsCfg = await getBrandsConfig(integrationSlug)
    const acctBrands = await accountBrandSlugs((people || []).map((p: any) => p.account_id))
    const byBrand = new Map<string | null, Set<string>>()
    const addTo = (slug: string | null, addr: string) => {
      if (!byBrand.has(slug)) byBrand.set(slug, new Set())
      byBrand.get(slug)!.add(addr)
    }
    for (const p of people || []) {
      if (p?.email) addTo(acctBrands.get(p.account_id) ?? null, p.email)
    }
    for (const addr of literalEmails) addTo(null, addr)

    const total = [...byBrand.values()].reduce((n, g) => n + g.size, 0)
    if (!total) return { success: true, emailed_count: 0 }

    try {
      let sent = 0
      for (const [slug, emails] of byBrand) {
        const brand = resolveBrand(brandsCfg, slug)
        const variant = config.template
          ? integration?.config?.templates?.[`${config.template}:${brand.slug}`]
          : null
        let { subject, html, text } = baseTpl
        if (variant) {
          subject = variant.subject ?? subject
          html = variant.html ?? html
          text = variant.text ?? text
        }
        subject = resolveTemplates(subject, triggerData, brand)
        html = resolveTemplates(html, triggerData, brand)
        text = resolveTemplates(text, triggerData, brand)

        const result = await executeOutbound(ctx, {
          integration_slug: integrationSlug,
          action_config: {
            action_slug: 'send_email',
            to: [...emails],
            subject,
            html,
            text,
            ...(config.from || brand.email_from ? { from: config.from || brand.email_from } : {}),
            ...(config.reply_to ? { reply_to: config.reply_to } : {}),
          },
        })
        if (result?.success) sent += emails.size
      }
      return { success: sent > 0, emailed_count: sent }
    } catch (err: any) {
      // Credential/env problems mean the provider was never configured — treat
      // like "not configured" rather than failing the pipeline.
      if (/credential|Environment variable|api_token/i.test(err?.message || '')) {
        console.warn(`[send_email] skipped — ${err.message}`)
        return { success: true, emailed_count: 0, skipped: err.message }
      }
      throw err
    }
  },

  'run_pipeline': async (ctx: CoreContext, config: any) => {
    const { pipeline_id, trigger_data = {} } = config
    
    if (!pipeline_id) {
      throw new Error('pipeline_id is required for run_pipeline')
    }

    if (config._pipelineId === pipeline_id) {
      throw new Error('Recursive pipeline execution prevented')
    }

    const result = await runPipeline(pipeline_id, trigger_data, ctx)
    return { 
      success: result.status === 'completed',
      execution_id: result.executionId,
      nested_result: result 
    }
  },

  'search_knowledge': async (ctx: CoreContext, config: any) => {
    const { query, knowledge_sources, model_id, limit = 5, threshold = 0.7 } = config

    if (!query) {
      throw new Error('query is required for search_knowledge')
    }

    // Enforce the app knowledge envelope — the pipeline's owning app is the
    // server-side authority (a client-supplied app hint is only a fallback).
    let appRef: string | null = (ctx as any).appId || null
    if (config._pipelineId) {
      const { data: p } = await adminDb
        .from('pipelines')
        .select('app_id')
        .eq('id', config._pipelineId)
        .maybeSingle()
      if (p?.app_id) appRef = p.app_id
    }
    const scope = await resolveKnowledgeScope(ctx, appRef, {})
    if (!scope.allowed) {
      return {
        results: [],
        count: 0,
        method: 'denied',
        error: `knowledge_denied: ${scope.deniedReason}`,
        query
      }
    }

    let dbQuery = adminDb
      .from('embeddings')
      .select('*')
      .in('account_id', scope.accountIds)
      .limit(limit)

    if (knowledge_sources && knowledge_sources.length > 0) {
      dbQuery = dbQuery.in('document_id', knowledge_sources)
    }

    if (model_id) {
      dbQuery = dbQuery.eq('model_id', model_id)
    }

    const { data: textResults, error: textError } = await dbQuery
      .textSearch('content', query, { type: 'websearch', config: 'english' })

    const inScope = (rows: any[]) => (rows || []).filter((r: any) => knowledgeRowAllowed(scope, r))

    if (!textError && textResults && inScope(textResults).length > 0) {
      const rows = inScope(textResults)
      return {
        results: rows,
        count: rows.length,
        method: 'text_search',
        query
      }
    }

    const { data: fallbackResults, error: fallbackError } = await dbQuery
      .ilike('content', `%${query}%`)

    if (fallbackError) {
      throw new Error(`Knowledge search failed: ${fallbackError.message}`)
    }

    const scopedResults = inScope(fallbackResults || [])
    return {
      results: scopedResults,
      count: scopedResults.length,
      method: 'fallback_ilike',
      query
    }
  },

  'query_items': async (ctx: CoreContext, config: any) => {
    const { entity, filters = {}, query, limit = 10 } = config
    
    if (!entity) {
      throw new Error('entity is required for query_items')
    }

    let dbQuery = adminDb
      .from(entity)
      .select('*')
      .eq('account_id', ctx.accountId)
      .limit(parseInt(limit.toString()))

    Object.entries(filters).forEach(([key, value]) => {
      dbQuery = dbQuery.eq(key, value)
    })

    if (query) {
      dbQuery = dbQuery.textSearch('data', query, { type: 'websearch', config: 'english' })
    }

    const { data, error } = await dbQuery

    if (error) throw new Error(`Query failed: ${error.message}`)
    return { items: data || [], count: data?.length || 0 }
  },

  'agent_inference': async (ctx: CoreContext, config: any) => {
    const { context, model, temperature, max_tokens, webhook_url, headers = {} } = config
    
    if (!context) {
      throw new Error('context is required for agent_inference')
    }

    if (webhook_url) {
      const result = await executeOutbound(ctx, {
        integration_slug: 'generic-http',
        action_config: {
          url: webhook_url,
          method: 'POST',
          headers,
          body: {
            context,
            model: model || 'gpt-4o',
            temperature: temperature ?? 0.7,
            max_tokens: max_tokens ?? 4000
          }
        }
      })

      if (!result.success) {
        throw new Error(`Inference failed: ${result.response_status} ${result.response_body}`)
      }

      const response: any = result.response_body
      return {
        content: response.content || response.message || '',
        confidence: response.confidence || 0.8,
        tool_calls: response.tool_calls,
        metadata: response.metadata,
        model: model || 'gpt-4o'
      }
    }

    return {
      content: `[Mock Response] Received ${context.length} chars of context. In production, configure webhook_url in action config.`,
      confidence: 0.9,
      tool_calls: null,
      metadata: { mock: true },
      model: model || 'gpt-4o'
    }
  },

  'generate_embeddings': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    let itemId = config.item_id
    if (!itemId) throw new Error('item_id is required for generate_embeddings')

    if (typeof itemId === 'string' && itemId.includes('{{')) {
      itemId = itemId
        .replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
        .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
    }

    if (!itemId) throw new Error('generate_embeddings: could not resolve item_id from trigger data')

    const { generate } = await import('../embeddings')
    const genCtx = { ...ctx, query: { ...((ctx as any).query || {}), action: 'generate' } } as any
    return await generate(genCtx, {
      item_id: itemId,
      force_regenerate: config.force_regenerate ?? false,
    })
  },

  'revoke_embeddings': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    let documentId = config.document_id ?? config.item_id
    if (!documentId) throw new Error('document_id is required for revoke_embeddings')

    if (typeof documentId === 'string' && documentId.includes('{{')) {
      documentId = documentId
        .replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
        .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
    }

    if (!documentId) throw new Error('revoke_embeddings: could not resolve document_id from trigger data')

    const { revoke } = await import('../embeddings')
    const genCtx = { ...ctx, query: { ...((ctx as any).query || {}), action: 'revoke' } } as any
    return await revoke(genCtx, { document_id: documentId })
  },

  // kb_ingest/kb_revoke wrap the canonical typed path in _shared/kb.ts (content-hash lease, declared vector fields, supersede_keys supersession) — unlike generate_embeddings/revoke_embeddings which hit the legacy embeddings engine. Both stage types remain registered; new pipelines should prefer kb_ingest/kb_revoke.
  'kb_ingest': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    let itemId = config.item_id ?? config.document_id
    if (!itemId) throw new Error('item_id is required for kb_ingest')

    if (typeof itemId === 'string' && itemId.includes('{{')) {
      itemId = itemId
        .replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
        .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
    }

    if (!itemId) throw new Error('kb_ingest: could not resolve item_id from trigger data')

    const { kbIngest } = await import('./kb')
    return await kbIngest(ctx, { id: itemId, account_id: triggerData?.entity?.data?.account_id })
  },

  'kb_revoke': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    let itemId = config.document_id ?? config.item_id
    if (!itemId) throw new Error('document_id is required for kb_revoke')

    if (typeof itemId === 'string' && itemId.includes('{{')) {
      itemId = itemId
        .replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
        .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
    }

    if (!itemId) throw new Error('kb_revoke: could not resolve document_id from trigger data')

    const { kbRevoke } = await import('./kb')
    return await kbRevoke(ctx, { id: itemId })
  },

  'create_interaction': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    const entityData = triggerData?.entity?.data || {}
    const resolveField = (v: any) => typeof v === 'string'
      ? v.replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
          .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
          .replace(/\{\{trigger\.thread_id\}\}/g, entityData?.thread_id || '')
      : v

    const aiMessageId = resolveField(config.ai_message_id) || triggerData?.entity_id
    const threadId = resolveField(config.thread_id) || entityData?.thread_id
    if (!aiMessageId && !threadId) throw new Error('create_interaction: could not resolve ai_message_id or thread_id from trigger data')

    const { createInteraction } = await import('../ai-interactions')
    const genCtx = { ...ctx, query: { ...((ctx as any).query || {}), action: 'create_interaction' } } as any
    // config.type_slug passes through to createInteraction (default ai_feedback_record when unset) so apps can record interactions under their own item type, e.g. demo_feedback_record.
    return await createInteraction(genCtx, {
      ai_message_id: aiMessageId,
      thread_id: threadId,
      retrieved_sources: config.retrieved_sources ?? entityData?.data?.retrieved_sources,
      ai_confidence: config.ai_confidence ?? entityData?.data?.confidence,
      retrieval_confidence: config.retrieval_confidence ?? entityData?.data?.mean_similarity,
      type_slug: config.type_slug,
    })
  },
}







/**
 * Executes a specified function handler with the provided context and configuration. This function ensures that the handler exists before attempting to invoke it.
 *
 * @macro       Handler executor that dynamically invokes function handlers based on their names.
 * @micro       Retrieves the handler from a collection and invokes it with the provided context and configuration.
 * @inputSpec
 *   ctx: CoreContext (required) — the context in which the handler is executed.
 *   handlerName: string (required) — the name of the handler to execute.
 *   config: any (required) — configuration parameters for the handler.
 * @outputSpec  Promise<any> — the result of the handler execution.
 * @throws      Error — if the handler name is unknown.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
async function executeFunctionHandler(
  ctx: CoreContext,
  handlerName: string,
  config: any
): Promise<any> {
  const handler = stageHandlers[handlerName]
  
  if (!handler) {
    throw new Error(`Unknown function handler: ${handlerName}`)
  }

  return await handler(ctx, config)
}
/**
 * Executes an integration handler by importing the execute function from the integration-outbound module and passing the necessary parameters. This function facilitates the integration process by providing a structured way to handle integration actions.
 *
 * @macro       Async function that triggers integration actions based on provided configuration.
 * @micro       Imports the execute function dynamically and invokes it with a context and action configuration.
 * @inputSpec
 *   ctx: CoreContext (required) — the core context for the integration execution.
 *   handlerName: string (required) — the name of the integration handler to execute.
 *   config: any (required) — configuration object containing integration parameters.
 * @outputSpec  Promise<any> — resolves with the result of the integration execution.
 * @sideEffects calls external integration service to execute the handler.
 * @stability   stable
 * @calls       execute
 * @cil-generated
 */
async function executeIntegrationHandler(
  ctx: CoreContext,
  handlerName: string,
  config: any
): Promise<any> {
  const { execute } = await import('../integration-outbound')
  return execute(ctx, {
    integration_slug: handlerName,
    record_id: config.record_id,
    action_config: config
  })
}
/**
 * Executes a webhook action by sending an HTTP request to a specified URL with the provided configuration. This function is designed to facilitate integration with external services via webhooks.
 *
 * @inputSpec
 *   ctx: CoreContext (required) — the context for the execution environment.
 *   action: any (required) — the action configuration containing the webhook details.
 *   config: any (required) — the body content to send with the webhook request.
 * @outputSpec  Promise<any> — resolves to an object containing success status, response status, and response body.
 * @throws      Error — Webhook URL not configured in action
 * @sideEffects Makes an external HTTP request to the specified webhook URL.
 * @stability   stable
 * @calls       execute
 * @cil-generated
 */
async function executeWebhookHandler(
  ctx: CoreContext,
  action: any,
  config: any
): Promise<any> {
  const { url, method = 'POST', headers = {} } = action.config || {}
  
  if (!url) {
    throw new Error('Webhook URL not configured in action')
  }

  const { execute } = await import('../integration-outbound')
  const result = await execute(ctx, {
    integration_slug: 'generic-http',
    action_config: {
      url,
      method,
      headers,
      body: config,
      credential_field: 'api_token'
    }
  })

  return {
    success: result.success,
    status: result.response_status,
    body: result.response_body
  }
}
