// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Triggers function module — exports agent event types and CRUD + dispatch handlers for the triggers table"]
// CIL[DOC-RESPONSIBILITY responsibility="Define agent event constants and expose Edge-function-style handlers for listing, creating, updating, toggling and dispatching trigger records and executions"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="module imports" outputs="AGENT_EVENT_TYPES, getAgentEventTypes, listByEvent, list, get, getExecutions, create, update, remove, toggle, handler" errors="none" side_effects="none at module load"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware, database, audit and permission helpers, then defines the public API surface of the triggers feature" notable_decisions="Exports named constants and createHandler wrappers; dispatch is routed by action query parameter"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]










import { createHandler } from './_shared/middleware'
import { joins, adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'
import { isSystemAdmin } from './_shared/principal'
// CIL[DOC-VECTOR type="context" content="purpose='Triggers function module — exports agent event types and CRUD + dispatch handlers for the triggers table'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:permissions:constant" type="constant" identity="permissions" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="PermissionEngine alias used for admin and permission checks in trigger handlers"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the permission engine reference used by the create handler"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="imported PermissionEngine" outputs="permissions constant alias" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Casts PermissionEngine to any and assigns it to a local constant" notable_decisions="Used as any to avoid strict typing issues; deprecated usage pattern noted in create chunk"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="deprecated"]
const permissions = PermissionEngine as any
// CIL[DOC-VECTOR type="context" content="purpose='PermissionEngine alias used for admin and permission checks in trigger handlers'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:permissions:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:AGENT_EVENT_TYPES:constant" type="constant" identity="AGENT_EVENT_TYPES" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Catalog of string event types emitted by and consumed in agent workflows"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide strongly-typed, readonly event type strings for trigger conditions"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AGENT_EVENT_TYPES object with string constants" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declare a const object of agent inference/tool/message/escalation/human-handoff event strings and cast to const" notable_decisions="Values are namespaced under agent.*"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const AGENT_EVENT_TYPES = {
  INFERENCE_COMPLETED: 'agent.inference.completed',
  INFERENCE_FAILED: 'agent.inference.failed',
  LOW_CONFIDENCE: 'agent.inference.low_confidence',
  TOOL_CALLED: 'agent.tool.called',
  TOOL_COMPLETED: 'agent.tool.completed',
  TOOL_FAILED: 'agent.tool.failed',
  MESSAGE_RECEIVED: 'agent.message.received',
  MESSAGE_SENT: 'agent.message.sent',
  THREAD_CREATED: 'agent.thread.created',
  ESCALATION_TRIGGERED: 'agent.escalation.triggered',
  ESCALATION_RESOLVED: 'agent.escalation.resolved',
  HUMAN_HANDOFF: 'agent.human.handoff'
} as const
// CIL[DOC-VECTOR type="context" content="purpose='Catalog of string event types emitted by and consumed in agent workflows'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:AGENT_EVENT_TYPES:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:getAgentEventTypes:function" type="function" identity="getAgentEventTypes" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Return all agent event type strings as an array"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose a typed array getter for event types"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string[] of event type values" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Call Object.values on AGENT_EVENT_TYPES and return the string array" notable_decisions="No dependencies or side effects"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function getAgentEventTypes(): string[] {
  return Object.values(AGENT_EVENT_TYPES)
}
// CIL[DOC-VECTOR type="context" content="purpose='Return all agent event type strings as an array'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:getAgentEventTypes:function"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:listByEvent:constant" type="constant" identity="listByEvent" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="List triggers filtered by event type, optional app and active status"]
// CIL[DOC-RESPONSIBILITY responsibility="Query trigger records for an account, filter by event_type and optional params, and sanitize results"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query {event_type, app_id?, include_inactive?}" outputs="sanitized trigger records" errors="missing event_type, account context, database error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validate event_type and account, choose admin or account db, build a filtered ordered query, then sanitize each returned row through permissions" notable_decisions="Defaults include_inactive to false unless 'true'; system admins can query across accounts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const listByEvent = createHandler(async (ctx, body) => {
  const { event_type, app_id, include_inactive } = ctx.query || {}

  if (!event_type) {
    throw new Error('event_type is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('triggers')
    .select('*')
    .eq('event_type', event_type)
    .order('name')

  if (app_id) {
    query = query.eq('app_id', app_id)
  }
  if (include_inactive !== 'true') {
    query = query.eq('is_active', true)
  }

  const { data, error: err } = await query

  if (err) throw err

  const sanitized = []
  for (const trigger of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, trigger, 'trigger'))
  }

  return sanitized
})
// CIL[DOC-VECTOR type="context" content="purpose='List triggers filtered by event type, optional app and active status'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:listByEvent:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="List triggers with optional app, event and active filters"]
// CIL[DOC-RESPONSIBILITY responsibility="List trigger records for the caller, applying optional app_id, event_type and active-status filters"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query {app_id?, event_type?, include_inactive?}" outputs="sanitized trigger records" errors="account context required; database error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validate account, select account or admin db, build query with optional filters and order, then sanitize each row" notable_decisions="Same default active filter and admin bypass as listByEvent, but event_type is optional"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const list = createHandler(async (ctx, body) => {
  const { app_id, event_type, include_inactive } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('triggers')
    .select('*')
    .order('name')

  if (app_id) {
    query = query.eq('app_id', app_id)
  }
  if (event_type) {
    query = query.eq('event_type', event_type)
  }
  if (include_inactive !== 'true') {
    query = query.eq('is_active', true)
  }

  const { data, error: err } = await query

  if (err) throw err

  const sanitized = []
  for (const trigger of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, trigger, 'trigger'))
  }

  return sanitized
})
// CIL[DOC-VECTOR type="context" content="purpose='List triggers with optional app, event and active filters'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Fetch a single trigger by ID"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a sanitized trigger record for the given id"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query {id}" outputs="sanitized trigger object" errors="missing id, database error, not found" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validate id, choose db by admin status, query a single trigger, sanitize and return" notable_decisions="System admins can read across accounts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const get = createHandler(async (ctx, body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Trigger ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
    .from('triggers')
    .select('*')
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'trigger')
})
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single trigger by ID'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:getExecutions:constant" type="constant" identity="getExecutions" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="List recent executions for a trigger"]
// CIL[DOC-RESPONSIBILITY responsibility="Return paginated trigger execution history ordered by executed_at descending"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query {trigger_id, limit?, offset?}" outputs="trigger_executions records" errors="missing trigger_id or account; database error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validate trigger_id and account, query trigger_executions with a range and descending order, and return rows" notable_decisions="Uses ctx.db directly; no admin cross-account bypass"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getExecutions = createHandler(async (ctx, body) => {
  const { trigger_id, limit = '50', offset = '0' } = ctx.query || {}

  if (!trigger_id) {
    throw new Error('trigger_id is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { data, error: err } = await ctx.db
    .from('trigger_executions')
    .select('*')
    .eq('trigger_id', trigger_id)
    .order('executed_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

  if (err) throw err

  return data || []
})
// CIL[DOC-VECTOR type="context" content="purpose='List recent executions for a trigger'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:getExecutions:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Create a new trigger record after permission check"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate required fields, enforce permission rules, insert a trigger and emit an audit log"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="body {name, event_type, pipeline_id, app_id?, description?, config?, metadata?}" outputs="created trigger record" errors="missing required fields, anonymous user, insufficient permissions, database error" side_effects="inserts triggers row, emits trigger.created audit log"]
// CIL[DOC-MICRO logic_summary="Validate required fields and user context, bypass permission for system admins, resolve create permission, insert row with timestamps and created_by, then emit audit log" notable_decisions="Replicates isSystemAdmin(ctx)-then-resolveFirstSurfacePermissions pattern from apps/roles/types; previously had a bug by passing principal instead of ctx"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, event_type, pipeline_id, config, metadata } = body

  if (!name || !event_type || !pipeline_id) {
    throw new Error('name, event_type, and pipeline_id are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  // NOTE: previously called `permissions.isSystemAdmin(ctx.principal)` (wrong
  // argument shape — that method reads `ctx.principal.roles`, so passing the
  // Principal itself made it always resolve false) followed by a
  // `permissions.hasPermission(...)` call that doesn't exist on PermissionEngine,
  // so this handler always threw at runtime. Use the same
  // isSystemAdmin(ctx)-then-resolveFirstSurfacePermissions pattern as
  // apps.ts/roles.ts/types.ts.
  if (!permissions.isSystemAdmin(ctx)) {
    const perms = await permissions.resolveFirstSurfacePermissions(
      ctx.principal.id,
      ctx.accountId!,
      'trigger',
      'create'
    )

    if (!perms.canCreate) {
      throw new Error('Insufficient permissions to create triggers')
    }
  }

  const { data, error: err } = await ctx.db
    .from('triggers')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      name,
      description: description || null,
      event_type,
      pipeline_id,
      config: config || {},
      metadata: metadata || {},
      created_by: ctx.principal.id
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'trigger.created', 
    { type: 'trigger', id: data.id }, 
    { after: { name, event_type } }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a new trigger record after permission check'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Update an existing trigger's allowed fields"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply partial updates to a trigger record, set updated_at and emit an audit log"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="body or query {id}, updates {name, description, config, pipeline_id, metadata, is_active, event_type, app_id}" outputs="updated trigger record" errors="missing id, database error" side_effects="updates triggers row, emits trigger.updated audit log"]
// CIL[DOC-MICRO logic_summary="Resolve id, build updateData from allowed keys plus updated_at, perform the update, then log" notable_decisions="No explicit permission call; relies on caller middleware"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, ...updates } = body || {}

  if (!id) {
    throw new Error('Trigger ID is required')
  }

  const allowed = ['name', 'description', 'config', 'pipeline_id', 'metadata', 'is_active', 'event_type', 'app_id']
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (updates[key] !== undefined) updateData[key] = updates[key]
  }

  const { data, error: err } = await ctx.db
    .from('triggers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'trigger.updated', 
    { type: 'trigger', id }, 
    { after: updateData }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing trigger's allowed fields'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:update:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Soft-delete a trigger by marking it inactive"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify the trigger exists, deactivate it, and log deletion"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="body/query {id}" outputs="{success: true}" errors="missing id, trigger not found, database error" side_effects="sets is_active=false and updated_at, emits trigger.deleted audit log"]
// CIL[DOC-MICRO logic_summary="Look up the id, fetch name and event_type, perform a soft-delete and emit a log with the before state" notable_decisions="Soft delete via is_active=false to preserve execution history"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const remove = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('Trigger ID is required')
  }

  const { data: existing } = await ctx.db
    .from('triggers')
    .select('name, event_type')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Trigger not found')
  }

  const { error: err } = await ctx.db
    .from('triggers')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (err) throw err

  await emitLog(ctx, 'trigger.deleted', 
    { type: 'trigger', id }, 
    { before: { name: existing.name, event_type: existing.event_type } }
  )

  return { success: true }
})
// CIL[DOC-VECTOR type="context" content="purpose='Soft-delete a trigger by marking it inactive'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:remove:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:toggle:constant" type="constant" identity="toggle" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Toggle the active state of a trigger"]
// CIL[DOC-RESPONSIBILITY responsibility="Flip is_active for a trigger and emit an audit log"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="body/query {id}" outputs="updated trigger record" errors="missing id, trigger not found, database error" side_effects="toggles is_active and updated_at, emits trigger.toggled audit log"]
// CIL[DOC-MICRO logic_summary="Fetch the current is_active and name, compute the new status, update the row and emit a before/after log" notable_decisions="Uses a single-row select and update and returns the updated record"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const toggle = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('Trigger ID is required')
  }

  const { data: existing } = await ctx.db
    .from('triggers')
    .select('is_active, name')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Trigger not found')
  }

  const newStatus = !existing.is_active

  const { data, error: err } = await ctx.db
    .from('triggers')
    .update({ 
      is_active: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'trigger.toggled', 
    { type: 'trigger', id }, 
    { 
      before: { is_active: existing.is_active },
      after: { is_active: newStatus }
    }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Toggle the active state of a trigger'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:toggle:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/triggers.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/triggers.ts"]
// CIL[DOC-MACRO purpose="Central action dispatcher for the triggers function"]
// CIL[DOC-RESPONSIBILITY responsibility="Route incoming action query to the appropriate trigger sub-handler"]
// CIL[DOC-CONTEXT module="triggers" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/triggers.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query {action}, body" outputs="result from the chosen sub-handler" errors="unknown action or sub-handler error" side_effects="delegates to the listed sub-handlers"]
// CIL[DOC-MICRO logic_summary="Read the action from the query, switch to the matching named handler, await and return its result, and throw for unsupported actions" notable_decisions="All sub-handlers are closed over in the same module; the default action throws an error"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}

  switch (action) {
    case 'list':
      return await list(ctx, body)
    case 'listByEvent':
      return await listByEvent(ctx, body)
    case 'get':
      return await get(ctx, body)
    case 'getExecutions':
      return await getExecutions(ctx, body)
    case 'create':
      return await create(ctx, body)
    case 'update':
      return await update(ctx, body)
    case 'remove':
      return await remove(ctx, body)
    case 'toggle':
      return await toggle(ctx, body)
    default:
      throw new Error(`Unsupported action: ${action}`)
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Central action dispatcher for the triggers function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/triggers.ts:handler:constant"]