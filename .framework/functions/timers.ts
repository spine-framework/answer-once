// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/timers.ts"]
// CIL[DOC-MACRO purpose="Import shared utilities used by timer Netlify function handlers."]
// CIL[DOC-RESPONSIBILITY responsibility="Set up module-level imports for middleware, database access, audit logging, and permission helpers."]
// CIL[DOC-CONTEXT module="timers" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="None" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Imports createHandler, joins, adminDb, emitLog, sanitizeRecordData, and isSystemAdmin." notable_decisions="Uses shared handlers for both admin and account-scoped queries."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="Spine framework internal Netlify function handlers that manage scheduled timers."]





import { createHandler } from './_shared/middleware'
import { joins, adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { sanitizeRecordData } from './_shared/permissions'
import { isSystemAdmin } from './_shared/principal'
// CIL[DOC-VECTOR type="context" content="purpose='Import shared utilities used by timer Netlify function handlers.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/timers.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/timers.ts"]
// CIL[DOC-MACRO purpose="List timers for the current account with optional filters."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a filtered, sanitized list of timer records scoped to the calling account."]
// CIL[DOC-CONTEXT module="timers" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/timers.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query may include app_id, timer_type, and is_active." outputs="Array of sanitized timer records." errors="Account context required; database query errors." side_effects="None"]
// CIL[DOC-MICRO logic_summary="Builds a timers query, applies optional equality filters, and sanitizes each returned record." notable_decisions="Falls back to ctx.db unless the caller is a system admin."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const list = createHandler(async (ctx, _body) => {
  const { app_id, timer_type, is_active } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('timers')
    .select('*')
    .order('name')

  if (app_id) {
    query = query.eq('app_id', app_id)
  }
  if (timer_type) {
    query = query.eq('timer_type', timer_type)
  }
  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true')
  }

  const { data, error: err } = await query

  if (err) throw err

  const sanitized = []
  for (const timer of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, timer, 'timer'))
  }

  return sanitized
})
// CIL[DOC-VECTOR type="context" content="purpose='List timers for the current account with optional filters.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/timers.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/timers.ts"]
// CIL[DOC-MACRO purpose="Fetch a single timer by ID."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a sanitized timer record matching the requested ID."]
// CIL[DOC-CONTEXT module="timers" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/timers.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id" outputs="Sanitized timer record." errors="Timer ID is required; not-found or database errors." side_effects="None"]
// CIL[DOC-MICRO logic_summary="Queries the timers table by id and returns the sanitized record." notable_decisions="Uses system admin override to select the database connection."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Timer ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
    .from('timers')
    .select('*')
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'timer')
})
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single timer by ID.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/timers.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/timers.ts"]
// CIL[DOC-MACRO purpose="Create a new timer record for the current account."]
// CIL[DOC-RESPONSIBILITY responsibility="Insert a timer with the supplied fields and return the created record."]
// CIL[DOC-CONTEXT module="timers" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/timers.ts"]
// CIL[DOC-CONTRACT inputs="body: app_id, name, description, timer_type, config, pipeline_id, metadata." outputs="Newly created timer record." errors="name and timer_type are required; User context required; database errors." side_effects="Inserts a row into timers; writes an audit log."]
// CIL[DOC-MICRO logic_summary="Validates required fields, inserts a timer row with defaults, emits a creation audit log, and returns the row." notable_decisions="Stores undefined optional fields as null or empty objects."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, timer_type, config, pipeline_id, metadata } = body

  if (!name || !timer_type) {
    throw new Error('name and timer_type are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { data, error: err } = await ctx.db
    .from('timers')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      name,
      description: description || null,
      timer_type,
      config: config || {},
      pipeline_id: pipeline_id || null,
      metadata: metadata || {},
      created_by: ctx.principal.id
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'timer.created', 
    { type: 'timer', id: data.id }, 
    { after: { name, timer_type } }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a new timer record for the current account.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/timers.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/timers.ts"]
// CIL[DOC-MACRO purpose="Update an existing timer's allowed fields."]
// CIL[DOC-RESPONSIBILITY responsibility="Apply whitelisted field updates to a timer row and return the updated record."]
// CIL[DOC-CONTEXT module="timers" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/timers.ts"]
// CIL[DOC-CONTRACT inputs="body or ctx.query with id; optional fields from allowed list." outputs="Updated timer record." errors="Timer ID is required; database errors." side_effects="Updates a timers row; writes an audit log."]
// CIL[DOC-MICRO logic_summary="Extracts the id, builds an update payload from an allow-list, sets updated_at, and emits an update audit log." notable_decisions="Ignores id inside the body and does not re-validate allowed values beyond presence."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, ...updates } = body || {}

  if (!id) {
    throw new Error('Timer ID is required')
  }

  const allowed = ['name', 'description', 'config', 'pipeline_id', 'metadata', 'is_active', 'timer_type', 'app_id']
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (updates[key] !== undefined) updateData[key] = updates[key]
  }

  const { data, error: err } = await ctx.db
    .from('timers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'timer.updated', 
    { type: 'timer', id }, 
    { after: updateData }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing timer's allowed fields.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/timers.ts:update:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/timers.ts"]
// CIL[DOC-MACRO purpose="Delete a timer by ID."]
// CIL[DOC-RESPONSIBILITY responsibility="Remove a timer record from the database and confirm success."]
// CIL[DOC-CONTEXT module="timers" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/timers.ts"]
// CIL[DOC-CONTRACT inputs="body or ctx.query with id." outputs="{ success: true }." errors="Timer ID is required; Timer not found; database errors." side_effects="Deletes a timers row; writes an audit log."]
// CIL[DOC-MICRO logic_summary="Fetches the existing timer, deletes the row by id, and emits a deletion audit log." notable_decisions="Reads only name and timer_type before deletion for the audit payload."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const remove = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('Timer ID is required')
  }

  const { data: existing } = await ctx.db
    .from('timers')
    .select('name, timer_type')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Timer not found')
  }

  const { error: err } = await ctx.db
    .from('timers')
    .delete()
    .eq('id', id)

  if (err) throw err

  await emitLog(ctx, 'timer.deleted', 
    { type: 'timer', id }, 
    { before: { name: existing.name, timer_type: existing.timer_type } }
  )

  return { success: true }
})
// CIL[DOC-VECTOR type="context" content="purpose='Delete a timer by ID.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/timers.ts:remove:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:toggle:constant" type="constant" identity="toggle" parent="~/.framework/functions/timers.ts"]
// CIL[DOC-MACRO purpose="Toggle the active state of a timer."]
// CIL[DOC-RESPONSIBILITY responsibility="Flip a timer's is_active flag and return the updated record."]
// CIL[DOC-CONTEXT module="timers" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/timers.ts"]
// CIL[DOC-CONTRACT inputs="body or ctx.query with id." outputs="Updated timer record with toggled is_active." errors="Timer ID is required; Timer not found; database errors." side_effects="Updates is_active on a timers row; writes an audit log."]
// CIL[DOC-MICRO logic_summary="Fetches the existing timer, inverts is_active, writes the new status, and emits a toggle audit log." notable_decisions="Also updates updated_at when toggling status."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const toggle = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('Timer ID is required')
  }

  const { data: existing } = await ctx.db
    .from('timers')
    .select('is_active, name')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Timer not found')
  }

  const newStatus = !existing.is_active

  const { data, error: err } = await ctx.db
    .from('timers')
    .update({ 
      is_active: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'timer.toggled', 
    { type: 'timer', id }, 
    { 
      before: { is_active: existing.is_active },
      after: { is_active: newStatus }
    }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Toggle the active state of a timer.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/timers.ts:toggle:constant"]
