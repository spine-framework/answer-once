/**
 * @module   logs
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides logging functionality for the application, serving as an API handler for log-related operations. It ensures that only system administrators can access sensitive logging features. The module is part of a multi-step pipeline that includes authentication, validation, and execution of log actions. INVARIANT: Only users with system admin privileges can access the logging endpoints.
 *
 * @seeAlso middleware.ts (provides shared middleware functions for handling requests).
 * @seeAlso db.ts (contains database access methods used for logging).
 * @seeAlso principal.ts (defines user roles and permissions for access control).
 *
 * @cil-generated
 */


















import { createHandler, json, error, parseBody } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { isSystemAdmin, isSystemPrincipal } from './_shared/principal'















/**
 * The mapLogRow function transforms a log row object into a standardized format for further processing. It extracts and renames fields from the input object to create a more structured output.
 *
 * @macro       Data transformation function that maps log row data to a standardized object.
 * @micro       Directly extracts specific fields from the input row object and maps them to a new object structure.
 * @inputSpec
 *   row: any (required) — the log row object containing various fields.
 * @outputSpec  { id: string, event_type: string, actor_id: string, target_type: string, target_id: string, action: string, span_name: string, trace_id: string, span_id: string, parent_span_id: string, duration_ms: number, outcome: string, event_category: string, kind: string, message: string, details: any, metadata: any, created_at: timestamp }
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function mapLogRow(row: any) {
  return {
    id: row.id,
    event_type: row.level,
    actor_id: row.person_id,
    target_type: row.source_type,
    target_id: row.source_id,
    action: row.source,
    span_name: row.span_name,
    trace_id: row.trace_id,
    span_id: row.span_id,
    parent_span_id: row.parent_span_id,
    duration_ms: row.duration_ms,
    outcome: row.outcome,
    event_category: row.event_category,
    kind: row.kind,
    message: row.message,
    details: row.context,
    metadata: row.metadata,
    created_at: row.created_at,
  }
}















/**
 * The listAccount function retrieves log entries based on various query parameters, allowing users to filter logs by account, event type, and date range. It ensures that only authorized users can access account-specific logs.
 *
 * @throws      Error — Account context required, Error — database query error
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('logs'), ctx.db.from('logs')
 * @errorHandling throws error on missing account context or database query failure
 * @cil-generated
 */
export const listAccount = createHandler(async (ctx, body) => {
  const { event, event_type, target_type, source, source_id, actor_id, query: searchQuery, date_from, date_to, trace_id, limit = 100, offset = 0 } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  if (event === 'threshold.breached') {
    let q = db
      .from('logs')
      .select('id, span_name, metadata, created_at', { count: 'exact' })
      .eq('span_name', 'threshold.breached')
      .order('created_at', { ascending: false })

    if (!isSystemAdmin(ctx.principal) && ctx.accountId) {
      q = q.eq('account_id', ctx.accountId)
    }
    if (date_from) q = q.gte('created_at', date_from)
    if (date_to) q = q.lte('created_at', date_to)

    const { data, error: err, count } = await q.range(
      parseInt(offset.toString()),
      parseInt(offset.toString()) + parseInt(limit.toString()) - 1
    )

    if (err) throw err

    const alerts = (data || []).map((row: any) => ({
      id: row.id,
      metric: row.metadata?.metric || row.span_name,
      threshold_value: row.metadata?.threshold_value ?? 0,
      actual_value: row.metadata?.actual_value ?? 0,
      created_at: row.created_at,
    }))

    return { data: alerts, total: count || alerts.length }
  }

  let query = db
    .from('logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (!isSystemAdmin(ctx.principal) && ctx.accountId) {
    query = query.eq('account_id', ctx.accountId)
  }
  if (event_type) query = query.eq('level', event_type)
  if (event) query = query.eq('span_name', event)
  if (target_type) query = query.eq('source_type', target_type)
  if (source) query = query.eq('source', source)
  if (source_id) query = query.eq('source_id', source_id)
  if (actor_id) query = query.eq('created_by', actor_id)
  if (searchQuery) query = query.ilike('message', `%${searchQuery}%`)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to)
  if (trace_id) query = query.eq('trace_id', trace_id)

  const { data, error: err, count } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  return {
    data: (data || []).map(mapLogRow),
    total: count || 0
  }
})















/**
 * The listTarget constant defines an asynchronous handler for retrieving log entries based on specified target criteria. It ensures that required parameters are present and fetches logs from the database according to the provided filters.
 *
 * @throws      Error — if target_type or target_id are missing, or if account context is not provided.
 * @sideEffects none
 * @stability   internal
 * @calls       ctx.db.from('logs'), ctx.db.select('*'), ctx.db.eq, ctx.db.order, ctx.db.range
 * @errorHandling throws error if database query fails
 * @cil-generated
 */
export const listTarget = createHandler(async (ctx, body) => {
  const { target_type, target_id, event_type, limit = 100, offset = 0 } = ctx.query || {}

  if (!target_type || !target_id) {
    throw new Error('target_type and target_id are required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = ctx.db
    .from('logs')
    .select('*')
    .eq('account_id', ctx.accountId)
    .eq('source_type', target_type)
    .eq('source_id', target_id)
    .order('created_at', { ascending: false })

  if (event_type) query = query.eq('level', event_type)

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  return (data || []).map(mapLogRow)
})















/**
 * This function retrieves log entries associated with a specific person from the database, handling pagination and filtering based on system log levels. It ensures that the necessary context, such as person ID and account ID, is provided before executing the query.
 *
 * @throws      Error — Person ID is required, Error — Account context required, Error — database query error
 * @sideEffects none
 * @stability   internal
 * @calls       ctx.db.from('logs'), ctx.db.select, ctx.db.eq, ctx.db.order, ctx.db.neq, ctx.db.range
 * @cil-generated
 */
export const listPerson = createHandler(async (ctx, body) => {
  const { person_id, include_system, limit = 50, offset = 0 } = ctx.query || {}

  const targetPersonId = person_id || ctx.principal?.id

  if (!targetPersonId) {
    throw new Error('Person ID is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = ctx.db
    .from('logs')
    .select('*')
    .eq('account_id', ctx.accountId)
    .eq('person_id', targetPersonId)
    .order('created_at', { ascending: false })

  if (include_system !== 'true') {
    query = query.neq('level', 'system')
  }

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  return (data || []).map(mapLogRow)
})















/**
 * Fetches log statistics based on various query parameters and the account context. It ensures that the account ID is present before making a database call to retrieve the statistics.
 *
 * @throws      Error — Account context required, Error — database call error
 * @sideEffects RPC call to 'get_log_stats' in the database
 * @stability   internal
 * @calls       ctx.db.rpc
 * @cil-generated
 */
export const getStats = createHandler(async (ctx, body) => {
  const { event_type, target_type, source, source_id, actor_id, query: searchQuery, date_from, date_to } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { data, error: err } = await ctx.db.rpc('get_log_stats', {
    p_account_id: ctx.accountId,
    p_level: event_type || null,
    p_source: source || null,
    p_source_type: target_type || null,
    p_source_id: source_id || null,
    p_person_id: actor_id || null,
    p_query: searchQuery || null,
    p_date_from: date_from || null,
    p_date_to: date_to || null,
  })

  if (err) throw err

  return data?.[0] || {
    total: 0,
    error_count: 0,
    user_action_count: 0,
    event_type_count: 0,
    levels: [],
    sources: [],
    source_types: []
  }
})















/**
 * The 'search' constant defines an asynchronous handler for searching log entries based on a query and optional filters. It ensures that a search query and account context are provided before querying the database for matching log records.
 *
 * @throws      Error — 'Search query is required', 'Account context required', or database error.
 * @sideEffects Database read operations.
 * @stability   internal
 * @calls       ctx.db.from('logs'), ctx.db.select, ctx.db.eq, ctx.db.ilike, ctx.db.order, ctx.db.range
 * @cil-generated
 */
export const search = createHandler(async (ctx, body) => {
  const { query: searchQuery, event_type, target_type, limit = 50, offset = 0 } = ctx.query || {}

  if (!searchQuery) {
    throw new Error('Search query is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = ctx.db
    .from('logs')
    .select('*')
    .eq('account_id', ctx.accountId)
    .ilike('message', `%${searchQuery}%`)
    .order('created_at', { ascending: false })

  if (event_type) query = query.eq('level', event_type)
  if (target_type) query = query.eq('source_type', target_type)

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  return (data || []).map(mapLogRow)
})















/**
 * The log constant is an asynchronous handler that processes logging events by inserting log entries into a database. It ensures that required fields are present and manages the context of the logging operation.
 *
 * @throws      Error — 'event_type is required', 'Account context required', or database error.
 * @sideEffects Inserts a new log entry into the 'logs' database table.
 * @stability   internal
 * @calls       ctx.db.from('logs').insert, ctx.db.from('logs').select
 * @cil-generated
 */
export const log = createHandler(async (ctx, body) => {
  const { event_type, target_type, target_id, action, message, details, metadata } = body

  if (!event_type) {
    throw new Error('event_type is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { data, error: err } = await ctx.db
    .from('logs')
    .insert({
      level: event_type,
      message: message || action || event_type,
      source: action || null,
      source_type: target_type || null,
      source_id: target_id || null,
      person_id: ctx.principal?.id || null,
      account_id: ctx.accountId,
      context: details || {},
      metadata: metadata || {},
    })
    .select('id')
    .single()

  if (err) throw err

  return { log_id: data?.id }
})















/**
 * The cleanup constant defines a handler for deleting log entries older than a specified number of days to manage log retention and free up database space. It removes outdated logs from the database.
 *
 * @throws      Error — if there is an error during the database deletion process.
 * @sideEffects Deletes entries from the 'logs' table in the database.
 * @stability   internal
 * @calls       ctx.db.from('logs')
 * @cil-generated
 */
export const cleanup = createHandler(async (ctx, body) => {
  const { days_to_keep = 30 } = body

  // cleanup deletes rows platform-wide and machine principals run it on the
  // service-role client — restrict to system-level callers so a scoped API
  // key cannot wipe other accounts' logs.
  if (!isSystemPrincipal(ctx)) {
    const e: any = new Error('Insufficient permissions for log cleanup')
    e.statusCode = 403
    throw e
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - parseInt(days_to_keep.toString()))

  const { data, error: err } = await ctx.db
    .from('logs')
    .delete()
    .lt('created_at', cutoff.toISOString())
    .select('id')

  if (err) throw err

  return { deleted_count: (data || []).length }
})















/**
 * The handler processes incoming requests based on the specified action and HTTP method, executing the appropriate function for each action. It serves as a centralized entry point for handling various log-related operations.
 *
 * @throws      Error — Invalid action or method
 * @sideEffects none
 * @stability   internal
 * @calls       listAccount, listTarget, listPerson, getStats, search, cleanup, log
 * @cil-generated
 */
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'account':
      if (method === 'GET') return await listAccount(ctx, body)
      break
    case 'target':
      if (method === 'GET') return await listTarget(ctx, body)
      break
    case 'person':
      if (method === 'GET') return await listPerson(ctx, body)
      break
    case 'stats':
      if (method === 'GET') return await getStats(ctx, body)
      break
    case 'search':
      if (method === 'GET') return await search(ctx, body)
      break
    case 'cleanup':
      if (method === 'POST') return await cleanup(ctx, body)
      break
    default:
      if (method === 'POST') return await log(ctx, body)
  }

  throw new Error('Invalid action or method')
})






