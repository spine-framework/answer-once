// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/timers.ts"]
/**
 * @module   timers
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides timer-related functionalities within the application, leveraging shared middleware and database utilities. It is designed to handle various timer operations, ensuring proper logging and permission checks. INVARIANT: All timer operations must be executed by authenticated users with appropriate permissions.
 *
 * @seeAlso middleware.ts (provides request handling capabilities).
 * @seeAlso db.ts (contains database access utilities).
 * @seeAlso auditing.ts (handles logging of operations).
 * @seeAlso permissions.ts (ensures proper access control).
 *
 * @cil-generated
 */














import { createHandler } from './_shared/middleware'
import { joins, adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { sanitizeRecordData } from './_shared/permissions'
import { isSystemAdmin } from './_shared/principal'
// CIL[END stable_id="~/.framework/functions/timers.ts:module_header:module_header"]

// Interval resolution mirrors public.update_timer_after_run (migration
// 071_timer_interval_keys.sql): config.interval_minutes (minutes) wins,
// then config.interval_seconds (seconds → minutes). A parseable
// config.run_at / config.schedule datetime is the fallback so 'once'
// timers can be armed too.
// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:intervalMinutesFromConfig:function" type="function" identity="intervalMinutesFromConfig" parent="~/.framework/functions/timers.ts"]
function intervalMinutesFromConfig(config: any): number | null {
  const minutes = Number(config?.interval_minutes)
  if (Number.isFinite(minutes) && minutes > 0) return minutes
  const seconds = Number(config?.interval_seconds)
  if (Number.isFinite(seconds) && seconds > 0) return seconds / 60
  return null
}
// CIL[END stable_id="~/.framework/functions/timers.ts:intervalMinutesFromConfig:function"]

// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:computeNextExecution:function" type="function" identity="computeNextExecution" parent="~/.framework/functions/timers.ts"]
function computeNextExecution(config: any): string | null {
  const minutes = intervalMinutesFromConfig(config)
  if (minutes !== null) {
    return new Date(Date.now() + minutes * 60_000).toISOString()
  }
  // Date.parse is too lenient (it parses cron text like '*/5 * * * *'
  // into a date), so only ISO-shaped values are accepted as a one-shot
  // fire time.
  const raw = config?.run_at ?? config?.schedule
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(raw)) return null
  const runAt = Date.parse(raw)
  return Number.isFinite(runAt) ? new Date(runAt).toISOString() : null
}
// CIL[END stable_id="~/.framework/functions/timers.ts:computeNextExecution:function"]















// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/timers.ts"]
/**
 * The 'list' constant retrieves a list of timers based on query parameters and the user's account context. It ensures that only authorized users can access the timer data.
 *
 * @throws      Error — Account context required
 * @sideEffects none
 * @stability   internal
 * @calls       isSystemAdmin, adminDb.from, sanitizeRecordData
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/timers.ts:list:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/timers.ts"]
/**
 * Retrieves a timer record from the database based on a provided ID while ensuring that only authorized users can access the timer data.
 *
 * @throws      Error — Timer ID is required, Error — database query error.
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('timers'), ctx.db.from('timers'), sanitizeRecordData
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/timers.ts:get:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/timers.ts"]
/**
 * Creates a new timer entry in the database based on the provided parameters, ensuring required fields are present and user context is valid. This function is essential for managing timer data within the application.
 *
 * @throws      Error — name and timer_type are required, Error — User context (person and account) required, Error — database insert error
 * @sideEffects DB write to 'timers' table, emits a log event for timer creation
 * @stability   internal
 * @calls       ctx.db.from('timers'), emitLog
 * @cil-generated
 */
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, timer_type, config, pipeline_id, metadata, is_active, next_execution } = body

  if (!name || !timer_type) {
    throw new Error('name and timer_type are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const effectiveConfig = config || {}
  // Omitted is_active falls through to the column DEFAULT (true); the
  // arming computation mirrors that assumption.
  const willBeActive = is_active !== false

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data, error: err } = await db
    .from('timers')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      name,
      description: description || null,
      timer_type,
      config: effectiveConfig,
      pipeline_id: pipeline_id || null,
      metadata: metadata || {},
      is_active,
      // Arm the timer server-side: get_due_timers requires next_execution
      // IS NOT NULL and nothing else writes it, so a timer created without
      // it could never fire. An explicit caller-supplied value wins.
      next_execution: next_execution ?? (willBeActive ? computeNextExecution(effectiveConfig) : null),
      created_by: ctx.principal.type === 'human' ? ctx.principal.id : null
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
// CIL[END stable_id="~/.framework/functions/timers.ts:create:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/timers.ts"]
/**
 * The 'update' constant defines a handler for updating timer records in the database. It ensures that a valid timer ID is provided and updates the specified fields accordingly.
 *
 * @throws      Error — Timer ID is required, Error — database update error
 * @sideEffects Database update to 'timers' table, logging of the update event.
 * @stability   internal
 * @calls       ctx.db.from('timers'), emitLog
 * @cil-generated
 */
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, ...updates } = body || {}

  if (!id) {
    throw new Error('Timer ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const allowed = ['name', 'description', 'config', 'pipeline_id', 'metadata', 'is_active', 'timer_type', 'app_id', 'next_execution']
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (updates[key] !== undefined) updateData[key] = updates[key]
  }

  // Re-arm when schedule-relevant inputs change and the caller did not set
  // next_execution explicitly — mirrors update_timer_after_run's interval
  // resolution so API/UI-edited timers actually fire. Only ever writes a
  // computed value; it never clears a next_execution it cannot recompute
  // (e.g. one manually armed out-of-band for a cron timer).
  if (updateData.next_execution === undefined && (updates.config !== undefined || updates.is_active !== undefined)) {
    const { data: existing } = await db
      .from('timers')
      .select('config, is_active')
      .eq('id', id)
      .single()
    const effectiveActive = updates.is_active ?? existing?.is_active ?? false
    const effectiveConfig = updates.config ?? existing?.config ?? {}
    if (effectiveActive) {
      const computed = computeNextExecution(effectiveConfig)
      if (computed) updateData.next_execution = computed
    }
  }

  const { data, error: err } = await db
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
// CIL[END stable_id="~/.framework/functions/timers.ts:update:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/timers.ts"]
/**
 * The 'remove' constant defines a handler for deleting a timer from the database. It ensures that a valid timer ID is provided and logs the deletion event.
 *
 * @throws      Error — Timer ID is required, Error — Timer not found
 * @sideEffects Database write to delete the timer, logging the deletion event.
 * @stability   internal
 * @calls       ctx.db.from('timers'), emitLog
 * @cil-generated
 */
export const remove = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('Timer ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data: existing } = await db
    .from('timers')
    .select('name, timer_type')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Timer not found')
  }

  const { error: err } = await db
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
// CIL[END stable_id="~/.framework/functions/timers.ts:remove:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:toggle:constant" type="constant" identity="toggle" parent="~/.framework/functions/timers.ts"]
/**
 * The toggle function updates the active status of a timer based on its ID, ensuring the timer exists before making changes and logging the event. This function is essential for managing timer states in the application.
 *
 * @throws      Error — Timer ID is required, Error — Timer not found
 * @sideEffects Database update to the timers table, logging of the toggle event.
 * @stability   internal
 * @calls       ctx.db.from('timers'), emitLog
 * @cil-generated
 */
export const toggle = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('Timer ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data: existing } = await db
    .from('timers')
    .select('is_active, name, config, next_execution')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Timer not found')
  }

  const newStatus = !existing.is_active

  const updateFields: Record<string, any> = {
    is_active: newStatus,
    updated_at: new Date().toISOString()
  }
  // Re-arm on activation when the timer was never scheduled (e.g. created
  // before next_execution became writable).
  if (newStatus && !existing.next_execution) {
    const armed = computeNextExecution(existing.config)
    if (armed) updateFields.next_execution = armed
  }

  const { data, error: err } = await db
    .from('timers')
    .update(updateFields)
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
// CIL[END stable_id="~/.framework/functions/timers.ts:toggle:constant"]
















// CIL[BEGIN stable_id="~/.framework/functions/timers.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/timers.ts"]
/**
 * The handler processes various actions based on the query parameters from the context, providing a centralized entry point for handling different operations related to the resource. It delegates to specific functions for each action.
 *
 * @throws      Error — Unsupported action: {action}
 * @sideEffects none
 * @stability   internal
 * @calls       list, get, create, update, remove, toggle
 * @cil-generated
 */
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}

  switch (action) {
    case 'list':
      return await list(ctx, body)
    case 'get':
      return await get(ctx, body)
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
// CIL[END stable_id="~/.framework/functions/timers.ts:handler:constant"]







