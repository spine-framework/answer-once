// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="Pipeline handler module imports shared dependencies and exports CRUD and dispatch handlers."]
// CIL[DOC-RESPONSIBILITY responsibility="Import createHandler, adminDb, emitLog, sanitizeRecordData, and isSystemAdmin for pipeline operation handlers."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="shared module imports" outputs="bound handler functions" errors="import failures" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module header imports shared middleware and helpers" notable_decisions="Uses shared helpers instead of inline logic"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { sanitizeRecordData } from './_shared/permissions'
import { isSystemAdmin } from './_shared/principal'
import { scopeFor, ifAccountScope } from './_shared/account-scope'
// CIL[DOC-VECTOR type="context" content="purpose='Pipeline handler module imports shared dependencies and exports CRUD and dispatch handlers.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:module_header:module_header"]










// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:listByTrigger:constant" type="constant" identity="listByTrigger" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="List pipelines filtered by trigger type, optional app and active state."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a filtered, sanitized list of pipelines for the account."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query: trigger_type, app_id, include_inactive" outputs="sanitized pipeline array" errors="Missing trigger_type or account; DB errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validate trigger_type and account, query pipelines with filters, sanitize each result" notable_decisions="System admins use adminDb; non-admins use ctx.db"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const listByTrigger = createHandler(async (ctx, _body) => {
  const { trigger_type, app_id, include_inactive } = ctx.query || {}

  if (!trigger_type) {
    throw new Error('trigger_type is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { db, accountIds } = await scopeFor(ctx)

  let query = db
    .from('pipelines')
    .select('*')
    .eq('trigger_type', trigger_type)

  query = ifAccountScope(query, accountIds)
  if (app_id) {
    query = query.eq('app_id', app_id)
  }
  if (include_inactive !== 'true') {
    query = query.eq('is_active', true)
  }

  const { data, error: err } = await query.order('name')

  if (err) throw err

  const sanitized = []
  for (const pipeline of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, pipeline, 'pipeline'))
  }

  return sanitized
})
// CIL[DOC-VECTOR type="context" content="purpose='List pipelines filtered by trigger type, optional app and active state.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:listByTrigger:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="List all pipelines for the account, optionally filtered by app and active state."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a sanitized list of all pipelines for the account."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query: app_id, include_inactive" outputs="sanitized pipeline array" errors="Missing account; DB errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validate account, query all pipelines with optional app/active filters, sanitize results" notable_decisions="System admins use adminDb"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const list = createHandler(async (ctx, body) => {
  const { app_id, include_inactive } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { db, accountIds } = await scopeFor(ctx)

  let query = db
    .from('pipelines')
    .select('*')

  query = ifAccountScope(query, accountIds)
  if (app_id) {
    query = query.eq('app_id', app_id)
  }

  const { data, error: err } = await query.order('name')

  if (err) throw err

  const sanitized = []
  for (const pipeline of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, pipeline, 'pipeline'))
  }

  return sanitized
})
// CIL[DOC-VECTOR type="context" content="purpose='List all pipelines for the account, optionally filtered by app and active state.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="Get a single pipeline by ID with sanitized output."]
// CIL[DOC-RESPONSIBILITY responsibility="Return one sanitized pipeline record matching the requested ID."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id" outputs="sanitized pipeline object" errors="Missing ID or account; not found; DB errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validate ID and account, fetch single pipeline, sanitize result" notable_decisions="Uses .single() and adminDb for system admins"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const get = createHandler(async (ctx, body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Pipeline ID is required')
  }

  const { db, accountIds } = await scopeFor(ctx)

  const { data, error: err } = await ifAccountScope(db
    .from('pipelines')
    .select('*')
    .eq('id', id), accountIds)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'pipeline')
})
// CIL[DOC-VECTOR type="context" content="purpose='Get a single pipeline by ID with sanitized output.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="Create a new pipeline record and emit an audit log."]
// CIL[DOC-RESPONSIBILITY responsibility="Insert a new pipeline and return the created record."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="body: name, trigger_type, stages; optional app_id, description, config, metadata" outputs="created pipeline record" errors="Missing required fields; unauthenticated; DB errors" side_effects="Inserts row and emits pipeline.created audit log"]
// CIL[DOC-MICRO logic_summary="Validate required fields and principal, insert pipeline with created_by, emit audit log" notable_decisions="Defaults empty optional fields to null or empty objects"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, trigger_type, config, stages, metadata } = body

  if (!name || !trigger_type || !stages) {
    throw new Error('name, trigger_type, and stages are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data, error: err } = await db
    .from('pipelines')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      name,
      description: description || null,
      trigger_type,
      config: config || {},
      stages,
      metadata: metadata || {},
      created_by: ctx.principal.type === 'human' ? ctx.principal.id : null
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline.created', 
    { type: 'pipeline', id: data.id }, 
    { after: { name, trigger_type } }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a new pipeline record and emit an audit log.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="Update an existing pipeline by ID and emit an audit log."]
// CIL[DOC-RESPONSIBILITY responsibility="Partially update a pipeline record and return the updated row."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="body or query: id; optional name, description, config, stages, metadata, trigger_type, is_active, app_id" outputs="updated pipeline record" errors="Missing ID or principal; not found; DB errors" side_effects="Updates row and emits pipeline.updated audit log"]
// CIL[DOC-MICRO logic_summary="Fetch current record, build sparse update set, apply update, emit audit log" notable_decisions="Uses undefined check to allow null values; updates updated_at"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, name, description, config, stages, metadata, trigger_type, is_active, app_id } = body || {}

  if (!id) {
    throw new Error('Pipeline ID is required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data: current } = await ifAccountScope(db
    .from('pipelines')
    .select('*')
    .eq('id', id), accountIds)
    .single()

  if (!current) {
    throw new Error('Pipeline not found')
  }

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  if (name !== undefined) updateData.name = name
  if (description !== undefined) updateData.description = description
  if (config !== undefined) updateData.config = config
  if (stages !== undefined) updateData.stages = stages
  if (metadata !== undefined) updateData.metadata = metadata
  if (trigger_type !== undefined) updateData.trigger_type = trigger_type
  if (is_active !== undefined) updateData.is_active = is_active
  if (app_id !== undefined) updateData.app_id = app_id

  const { data, error: err } = await ifAccountScope(db
    .from('pipelines')
    .update(updateData)
    .eq('id', id), accountIds)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline.updated', 
    { type: 'pipeline', id }, 
    { before: current, after: updateData }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing pipeline by ID and emit an audit log.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:update:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:toggle:constant" type="constant" identity="toggle" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="Toggle the active state of a pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Set is_active on a pipeline and return the updated record."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="body: id, is_active" outputs="updated pipeline record" errors="Missing fields or principal; not found; DB errors" side_effects="Updates is_active and emits pipeline.toggled audit log"]
// CIL[DOC-MICRO logic_summary="Validate id and is_active, verify pipeline exists, update active flag, emit audit log" notable_decisions="Switches active state independently from full update"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const toggle = createHandler(async (ctx, body) => {
  const { id, is_active } = body

  if (!id || is_active === undefined) {
    throw new Error('Pipeline ID and is_active are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data: current } = await ifAccountScope(db
    .from('pipelines')
    .select('*')
    .eq('id', id), accountIds)
    .single()

  if (!current) {
    throw new Error('Pipeline not found')
  }

  const { data, error: err } = await ifAccountScope(db
    .from('pipelines')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id), accountIds)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline.toggled', 
    { type: 'pipeline', id }, 
    { before: { is_active: current.is_active }, after: { is_active } }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Toggle the active state of a pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:toggle:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:getExecutions:constant" type="constant" identity="getExecutions" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="List execution records for a pipeline with pagination."]
// CIL[DOC-RESPONSIBILITY responsibility="Return paginated pipeline execution history."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query: pipeline_id, limit, offset" outputs="array of pipeline execution records" errors="Missing pipeline_id; DB errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validate pipeline_id, query executions with range, return data" notable_decisions="Default limit 50 and offset 0; uses ctx.db"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getExecutions = createHandler(async (ctx, _body) => {
  const { pipeline_id, limit = 50, offset = 0 } = ctx.query || {}

  if (!pipeline_id) {
    throw new Error('Pipeline ID is required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data, error: err } = await ifAccountScope(db
    .from('pipeline_executions')
    .select('*')
    .eq('pipeline_id', pipeline_id), accountIds)
    .order('created_at', { ascending: false })
    .range(
      parseInt(offset.toString()),
      parseInt(offset.toString()) + parseInt(limit.toString()) - 1
    )

  if (err) throw err

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='List execution records for a pipeline with pagination.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:getExecutions:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="Delete a pipeline by ID and emit an audit log."]
// CIL[DOC-RESPONSIBILITY responsibility="Remove a pipeline record and return success."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id" outputs="{ success: true }" errors="Missing ID; not found; DB errors" side_effects="Deletes row and emits pipeline.deleted audit log"]
// CIL[DOC-MICRO logic_summary="Validate ID, fetch existing pipeline, delete, emit audit log" notable_decisions="Fetches minimal id and name before delete for audit"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const remove = createHandler(async (ctx, _body) => {
  const id = ctx.query?.id

  if (!id) {
    throw new Error('Pipeline ID is required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data: current } = await ifAccountScope(db
    .from('pipelines')
    .select('id, name')
    .eq('id', id), accountIds)
    .single()

  if (!current) throw new Error('Pipeline not found')

  const { error: err } = await ifAccountScope(db
    .from('pipelines')
    .delete()
    .eq('id', id), accountIds)

  if (err) throw err

  await emitLog(ctx, 'pipeline.deleted', 
    { type: 'pipeline', id }, 
    { before: current }
  )

  return { success: true }
})
// CIL[DOC-VECTOR type="context" content="purpose='Delete a pipeline by ID and emit an audit log.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:remove:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/pipelines.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/pipelines.ts"]
// CIL[DOC-MACRO purpose="Dispatch pipeline requests to the correct handler based on action and method."]
// CIL[DOC-RESPONSIBILITY responsibility="Route incoming pipeline API calls to the appropriate handler."]
// CIL[DOC-CONTEXT module="pipelines" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/pipelines.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.action, ctx.query.method, body" outputs="handler result" errors="Invalid action or method" side_effects="Calls delegated handlers"]
// CIL[DOC-MICRO logic_summary="Switch on action and method to route to listByTrigger, getExecutions, toggle, get, list, create, update, or remove" notable_decisions="Default GET routes to list or get by presence of id"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'by-trigger':
      if (method === 'GET') {
        return await listByTrigger(ctx, body)
      }
      break
    case 'executions':
      if (method === 'GET') {
        return await getExecutions(ctx, body)
      }
      break
    case 'toggle':
      if (method === 'POST') {
        return await toggle(ctx, body)
      }
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
        return await update(ctx, body)
      } else if (method === 'DELETE') {
        return await remove(ctx, body)
      }
  }

  throw new Error('Invalid action or method')
})
// CIL[DOC-VECTOR type="context" content="purpose='Dispatch pipeline requests to the correct handler based on action and method.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/pipelines.ts:handler:constant"]
