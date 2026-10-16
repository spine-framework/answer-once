// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-AUDIENCE audience="runtime,developers,operators"]
// CIL[DOC-MACRO purpose="Module imports and shared setup for the logs Netlify function"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and establish module context for log query and write handlers"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports createHandler, json, error, parseBody, adminDb, and isSystemAdmin for use by route handlers" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]









import { createHandler, json, error, parseBody } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { isSystemAdmin } from './_shared/principal'
// CIL[DOC-VECTOR type="context" content="purpose='Module imports and shared setup for the logs Netlify function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:mapLogRow:function" type="function" identity="mapLogRow" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="Map a raw database log row into a normalized log event object"]
// CIL[DOC-RESPONSIBILITY responsibility="Transform Supabase logs table fields into the external log event schema"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="row: any (raw log record)" outputs="normalized log event object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Rename and expose log fields such as level to event_type, source to action, and context to details" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Map a raw database log row into a normalized log event object'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:mapLogRow:function"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:listAccount:constant" type="constant" identity="listAccount" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="List or filter account-wide log events and threshold breach alerts"]
// CIL[DOC-RESPONSIBILITY responsibility="Return paginated log rows for the current account, applying filters and a special threshold breach view"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query fields: event, event_type, target_type, source, source_id, actor_id, query, date_from, date_to, trace_id, limit, offset" outputs="{ data, total }" errors="Account context required, database query errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a Supabase query against logs, apply account scoping, filters, pagination, and map results through mapLogRow" notable_decisions="Uses isSystemAdmin to allow admin cross-account access and supports threshold.breached span"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='List or filter account-wide log events and threshold breach alerts'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:listAccount:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:listTarget:constant" type="constant" identity="listTarget" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="List log events for a specific target entity"]
// CIL[DOC-RESPONSIBILITY responsibility="Return paginated logs scoped to a target_type and target_id within an account"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query: target_type, target_id, event_type, limit, offset" outputs="log event array" errors="target_type and target_id required, Account context required" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Query logs filtered by account_id, source_type, source_id and optional event_type, paginate and map results" notable_decisions="Requires both target_type and target_id"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='List log events for a specific target entity'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:listTarget:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:listPerson:constant" type="constant" identity="listPerson" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="List log events for a person or the current principal"]
// CIL[DOC-RESPONSIBILITY responsibility="Return paginated logs where actor matches a person_id, optionally including system logs"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query: person_id, include_system, limit, offset" outputs="log event array" errors="Person ID is required, Account context required" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use ctx.principal.id as fallback, filter by account and person, optionally exclude level='system'" notable_decisions="Defaults principal to current user and hides system events unless requested"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='List log events for a person or the current principal'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:listPerson:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:getStats:constant" type="constant" identity="getStats" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="Return aggregated log statistics for an account"]
// CIL[DOC-RESPONSIBILITY responsibility="Call the get_log_stats RPC to return summary counts and breakdowns"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query: event_type, target_type, source, source_id, actor_id, query, date_from, date_to" outputs="stats object with totals and arrays" errors="Account context required, RPC errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Invoke Supabase RPC get_log_stats with account-scoped parameters and return first result or a default zeroed object" notable_decisions="Requires account context and uses ctx.db"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Return aggregated log statistics for an account'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:getStats:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:search:constant" type="constant" identity="search" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="Search log messages by text within an account"]
// CIL[DOC-RESPONSIBILITY responsibility="Return paginated log events matching a case-insensitive message substring"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query: query, event_type, target_type, limit, offset" outputs="log event array" errors="Search query is required, Account context required" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Filter logs by account and message ilike pattern, optionally by level and source_type, then paginate and map" notable_decisions="Performs substring match with SQL ILIKE"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Search log messages by text within an account'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:search:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:log:constant" type="constant" identity="log" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="Create a new log entry from an incoming event"]
// CIL[DOC-RESPONSIBILITY responsibility="Insert a log record into the logs table using the request body fields"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="body: event_type, target_type, target_id, action, message, details, metadata" outputs="{ log_id }" errors="event_type is required, Account context required, database insert errors" side_effects="Writes a row to the logs table"]
// CIL[DOC-MICRO logic_summary="Build an insert from body and principal, default missing fields, and return the created id" notable_decisions="message falls back to action or event_type"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Create a new log entry from an incoming event'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:log:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:cleanup:constant" type="constant" identity="cleanup" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="Delete log records older than a retention period"]
// CIL[DOC-RESPONSIBILITY responsibility="Remove logs created before the configured days-to-keep cutoff"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="body: days_to_keep" outputs="{ deleted_count }" errors="Database delete errors" side_effects="Deletes rows from the logs table"]
// CIL[DOC-MICRO logic_summary="Calculate a cutoff date from days_to_keep and delete logs with created_at before it" notable_decisions="Defaults retention to 90 days"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const cleanup = createHandler(async (ctx, body) => {
  const { days_to_keep = 90 } = body

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
// CIL[DOC-VECTOR type="context" content="purpose='Delete log records older than a retention period'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:cleanup:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/logs.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/logs.ts"]
// CIL[DOC-MACRO purpose="Route incoming log function requests to the correct action handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch GET/POST requests based on action query parameter to list, search, stats, cleanup or write operations"]
// CIL[DOC-CONTEXT module="logs" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/logs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query: action, method" outputs="result from selected handler" errors="Invalid action or method" side_effects="Delegates to other handlers, may write or delete logs"]
// CIL[DOC-MICRO logic_summary="Switch on action and method, calling listAccount, listTarget, listPerson, getStats, search, cleanup, or log; reject unsupported combinations" notable_decisions="Default POST falls through to the log writer; unsupported method/action throws"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Route incoming log function requests to the correct action handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/logs.ts:handler:constant"]