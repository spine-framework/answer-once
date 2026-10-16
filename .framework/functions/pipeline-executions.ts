// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Import shared helpers and expose the pipeline-executions handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the module imports and top-level exported handler for pipeline execution operations"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports middleware, audit, database, and principal helpers used by the pipeline execution handlers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework developers"]
import { createHandler, json, error, parseBody } from './_shared/middleware'
import { emitLog } from './_shared/audit'
import { adminDb } from './_shared/db'
import { isSystemAdmin } from './_shared/principal'
// CIL[DOC-VECTOR type="context" content="purpose='Import shared helpers and expose the pipeline-executions handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:module_header:module_header"]










// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="List pipeline executions with optional filters and pagination"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a paginated list of pipeline executions, optionally filtered by pipeline_id and status"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query with optional pipeline_id, status, limit, offset" outputs="Array of pipeline execution records" errors="Account context required for non-admins; database query errors" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Choose admin or account DB, build a base query, apply optional equality filters, set a range for pagination, and return data or an empty array" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const list = createHandler(async (ctx, body) => {
  const { pipeline_id, status, limit = 100, offset = 0 } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = db
    .from('pipeline_executions')
    .select('*')
    .order('created_at', { ascending: false })

  if (pipeline_id) query = query.eq('pipeline_id', pipeline_id)
  if (status) query = query.eq('status', status)

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  return data || []
})
// CIL[DOC-VECTOR type="context" content="purpose='List pipeline executions with optional filters and pagination'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Retrieve a single pipeline execution by ID"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the pipeline execution record matching the provided id"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id" outputs="Single pipeline execution record" errors="Missing execution ID; database query errors" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Validate the id, query the database for a single row, throw on error, and return the record" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const get = createHandler(async (ctx, body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Execution ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
    .from('pipeline_executions')
    .select('*')
    .eq('id', id)
    .single()

  if (err) throw err

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Retrieve a single pipeline execution by ID'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Create a new pending pipeline execution"]
// CIL[DOC-RESPONSIBILITY responsibility="Insert a pipeline execution record and emit an audit log"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="body with pipeline_id and optional trigger_data" outputs="{ execution_id }" errors="Missing pipeline ID; account context required; database insert errors" side_effects="Inserts a row into pipeline_executions; emits a pipeline_execution.created audit log"]
// CIL[DOC-MICRO logic_summary="Validate inputs and account context, insert a pending record with creator and account, select the id, emit an audit log, and return the execution_id" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const create = createHandler(async (ctx, body) => {
  const { pipeline_id, trigger_data } = body

  if (!pipeline_id) {
    throw new Error('Pipeline ID is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { data, error: err } = await ctx.db
    .from('pipeline_executions')
    .insert({
      pipeline_id,
      status: 'pending',
      trigger_data: trigger_data || {},
      created_by: ctx.principal?.id || null,
      account_id: ctx.accountId,
    })
    .select('id')
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline_execution.created',
    { type: 'pipeline_execution', id: data?.id },
    { after: { pipeline_id } }
  )

  return { execution_id: data?.id }
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a new pending pipeline execution'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:start:constant" type="constant" identity="start" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Mark a pipeline execution as running"]
// CIL[DOC-RESPONSIBILITY responsibility="Update the execution status to running and record its start time"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="body.id" outputs="{ success: true }" errors="Missing execution ID; database update errors" side_effects="Updates status and started_at; emits a pipeline_execution.started audit log"]
// CIL[DOC-MICRO logic_summary="Validate the id, update the row to running status with the current ISO timestamp, emit an audit log, and return success" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const start = createHandler(async (ctx, body) => {
  const { id } = body

  if (!id) {
    throw new Error('Execution ID is required')
  }

  const { data, error: err } = await ctx.db
    .from('pipeline_executions')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline_execution.started',
    { type: 'pipeline_execution', id },
    { after: { status: 'running' } }
  )

  return { success: true }
})
// CIL[DOC-VECTOR type="context" content="purpose='Mark a pipeline execution as running'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:start:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:complete:constant" type="constant" identity="complete" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Complete or fail a pipeline execution"]
// CIL[DOC-RESPONSIBILITY responsibility="Finalize the execution status, store the result or error, and record the duration"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="body with id, optional output_data, optional error_message" outputs="{ success: true }" errors="Missing execution ID; database update errors" side_effects="Updates status, result, error_message, completed_at, and duration_ms; emits a pipeline_execution.completed audit log"]
// CIL[DOC-MICRO logic_summary="Validate the id, determine final status from error_message, compute duration from started_at, update the row, emit an audit log, and return success" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const complete = createHandler(async (ctx, body) => {
  const { id, output_data, error_message } = body

  if (!id) {
    throw new Error('Execution ID is required')
  }

  const now = new Date().toISOString()
  const finalStatus = error_message ? 'failed' : 'completed'

  const { data: existing } = await ctx.db
    .from('pipeline_executions')
    .select('started_at')
    .eq('id', id)
    .single()

  const duration_ms = existing?.started_at
    ? Math.round(Date.now() - new Date(existing.started_at).getTime())
    : null

  const { data, error: err } = await ctx.db
    .from('pipeline_executions')
    .update({
      status: finalStatus,
      result: output_data || {},
      error_message: error_message || null,
      completed_at: now,
      duration_ms,
    })
    .eq('id', id)
    .select('id')
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline_execution.completed',
    { type: 'pipeline_execution', id },
    { after: { status: finalStatus, error_message } }
  )

  return { success: true }
})
// CIL[DOC-VECTOR type="context" content="purpose='Complete or fail a pipeline execution'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:complete:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:cancel:constant" type="constant" identity="cancel" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Cancel a pipeline execution"]
// CIL[DOC-RESPONSIBILITY responsibility="Mark an execution as cancelled and record the completion time"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="body.id" outputs="{ success: true }" errors="Missing execution ID; database update errors" side_effects="Updates status to cancelled and completed_at; emits a pipeline_execution.cancelled audit log"]
// CIL[DOC-MICRO logic_summary="Validate the id, update the row with cancelled status and current timestamp, emit an audit log, and return success" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const cancel = createHandler(async (ctx, body) => {
  const { id } = body

  if (!id) {
    throw new Error('Execution ID is required')
  }

  const { data, error: err } = await ctx.db
    .from('pipeline_executions')
    .update({ status: 'cancelled', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline_execution.cancelled',
    { type: 'pipeline_execution', id },
    { after: { status: 'cancelled' } }
  )

  return { success: true }
})
// CIL[DOC-VECTOR type="context" content="purpose='Cancel a pipeline execution'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:cancel:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:getRunning:constant" type="constant" identity="getRunning" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="List currently running pipeline executions"]
// CIL[DOC-RESPONSIBILITY responsibility="Return running executions, optionally filtered by pipeline_id"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query with optional pipeline_id" outputs="Array of running execution records" errors="Account context required for non-admins; database query errors" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Choose admin or account DB, query executions with running status, apply an optional pipeline_id filter, order by started_at, and return data or an empty array" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getRunning = createHandler(async (ctx, body) => {
  const { pipeline_id } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = db
    .from('pipeline_executions')
    .select('*')
    .eq('status', 'running')
    .order('started_at', { ascending: false })

  if (pipeline_id) query = query.eq('pipeline_id', pipeline_id)

  const { data, error: err } = await query

  if (err) throw err

  return data || []
})
// CIL[DOC-VECTOR type="context" content="purpose='List currently running pipeline executions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:getRunning:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:getStats:constant" type="constant" identity="getStats" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Aggregate pipeline execution status counts"]
// CIL[DOC-RESPONSIBILITY responsibility="Return total, completed, failed, and running execution counts"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query with optional pipeline_id, date_from, date_to" outputs="{ total, completed, failed, running }" errors="Account context required for non-admins; database query errors" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Select id and status, apply optional filters, count statuses client-side, and return the totals" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getStats = createHandler(async (ctx, body) => {
  const { pipeline_id, date_from, date_to } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = db
    .from('pipeline_executions')
    .select('id, status')

  if (pipeline_id) query = query.eq('pipeline_id', pipeline_id)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to)

  const { data, error: err } = await query

  if (err) throw err

  const rows = data || []
  return {
    total: rows.length,
    completed: rows.filter((r: any) => r.status === 'completed').length,
    failed: rows.filter((r: any) => r.status === 'failed').length,
    running: rows.filter((r: any) => r.status === 'running').length,
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Aggregate pipeline execution status counts'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:getStats:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:cleanup:constant" type="constant" identity="cleanup" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Delete old pipeline execution records"]
// CIL[DOC-RESPONSIBILITY responsibility="Remove executions older than a retention window, optionally filtered by status"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="body with days_to_keep and optional status_filter" outputs="{ deleted_count }" errors="Database delete errors" side_effects="Deletes rows from pipeline_executions; emits a pipeline_executions.cleaned audit log"]
// CIL[DOC-MICRO logic_summary="Compute a cutoff date, delete records older than the cutoff, optionally filter by status, and return the number of deleted records" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const cleanup = createHandler(async (ctx, body) => {
  const { days_to_keep = 30, status_filter } = body

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - parseInt(days_to_keep.toString()))

  let query = ctx.db
    .from('pipeline_executions')
    .delete()
    .lt('created_at', cutoff.toISOString())

  if (status_filter) query = query.eq('status', status_filter)

  const { data, error: err } = await query.select('id')

  if (err) throw err

  await emitLog(ctx, 'pipeline_executions.cleaned',
    { type: 'system', id: 'cleanup' },
    { after: { deleted_count: (data || []).length } }
  )

  return { deleted_count: (data || []).length }
})
// CIL[DOC-VECTOR type="context" content="purpose='Delete old pipeline execution records'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:cleanup:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipeline-executions.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/pipeline-executions.ts"]
// CIL[DOC-MACRO purpose="Route pipeline execution actions based on HTTP method and query"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch list, get, create, start, complete, cancel, running, stats, and cleanup actions"]
// CIL[DOC-CONTEXT module="pipeline-executions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipeline-executions.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.action, HTTP method, query id, and request body" outputs="Result of the dispatched action" errors="Invalid action or method" side_effects="May invoke other pipeline execution handlers and their audit logs"]
// CIL[DOC-MICRO logic_summary="Switch on action and HTTP method, delegate to the appropriate named handler, and throw for unsupported combinations" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'list':
      if (method === 'GET') return await list(ctx, body)
      break
    case 'running':
      if (method === 'GET') return await getRunning(ctx, body)
      break
    case 'stats':
      if (method === 'GET') return await getStats(ctx, body)
      break
    case 'cleanup':
      if (method === 'POST') return await cleanup(ctx, body)
      break
    default:
      if (method === 'GET') {
        if (ctx.query?.id) {
          return await get(ctx, body)
        } else {
          return await list(ctx, body)
        }
      } else if (method === 'POST') {
        return await create(ctx, body)
      } else if (method === 'PATCH') {
        if (ctx.query?.action === 'start') return await start(ctx, body)
        else if (ctx.query?.action === 'complete') return await complete(ctx, body)
        else if (ctx.query?.action === 'cancel') return await cancel(ctx, body)
      }
  }

  throw new Error('Invalid action or method')
})
// CIL[DOC-VECTOR type="context" content="purpose='Route pipeline execution actions based on HTTP method and query'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipeline-executions.ts:handler:constant"]