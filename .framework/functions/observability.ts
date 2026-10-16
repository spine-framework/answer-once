// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Observability and analytics function entry point"]
// CIL[DOC-RESPONSIBILITY responsibility="Exports handler-driven analytics endpoints for event volume, error rate, latency, pipeline stats, top actors, AI support metrics, and log cleanup"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware, database, auth, and id resolution utilities" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]








import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { isSystemAdmin } from './_shared/principal'
import { resolveTypeId } from './_shared/resolve-ids'
// CIL[DOC-VECTOR type="context" content="purpose='Observability and analytics function entry point'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:floorBucket:function" type="function" identity="floorBucket" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Bucket a date to a chosen granularity"]
// CIL[DOC-RESPONSIBILITY responsibility="Normalize a Date to the start of the requested hour or day bucket"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="date: Date, bucket: string" outputs="Date" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Zeroes seconds and milliseconds; zeroes minutes for hour/day and hours for day" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function floorBucket(date: Date, bucket: string): Date {
  const d = new Date(date)
  d.setMilliseconds(0)
  d.setSeconds(0)
  if (bucket === 'hour' || bucket === 'day') d.setMinutes(0)
  if (bucket === 'day') d.setHours(0)
  return d
}
// CIL[DOC-VECTOR type="context" content="purpose='Bucket a date to a chosen granularity'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:floorBucket:function"]

// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getEventVolume:constant" type="constant" identity="getEventVolume" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Return event counts grouped by time bucket"]
// CIL[DOC-RESPONSIBILITY responsibility="Query logs for a date range and aggregate counts by ISO bucket"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.from, ctx.query.to, ctx.query.bucket" outputs="array of { bucket, count }" errors="Account context required; from/to required; database error" side_effects="reads logs table"]
// CIL[DOC-MICRO logic_summary="Selects adminDb or ctx.db based on role; filters by account_id; groups with floorBucket; sorts ascending" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getEventVolume = createHandler(async (ctx, body) => {
  const { from, to, bucket = 'hour' } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  if (!from || !to) {
    throw new Error('from and to dates are required')
  }

  let query = db
    .from('logs')
    .select('created_at')
    .gte('created_at', from)
    .lte('created_at', to)

  if (!isSystemAdmin(ctx.principal) && ctx.accountId) {
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query.order('created_at', { ascending: true })

  if (err) throw err

  const counts: Record<string, number> = {}
  for (const row of data || []) {
    const key = floorBucket(new Date(row.created_at), bucket).toISOString()
    counts[key] = (counts[key] || 0) + 1
  }

  return Object.entries(counts)
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => new Date(a.bucket).getTime() - new Date(b.bucket).getTime())
})
// CIL[DOC-VECTOR type="context" content="purpose='Return event counts grouped by time bucket'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:getEventVolume:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getErrorRate:constant" type="constant" identity="getErrorRate" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Compute error rate over a date range"]
// CIL[DOC-RESPONSIBILITY responsibility="Count total log rows and failures to derive an error rate"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.from, ctx.query.to" outputs="{ total, errors, rate }" errors="Account context required; from/to required; database error" side_effects="reads logs table"]
// CIL[DOC-MICRO logic_summary="Queries logs for outcome/level; counts rows where outcome is failure or level is error" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getErrorRate = createHandler(async (ctx, body) => {
  const { from, to } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  if (!from || !to) {
    throw new Error('from and to dates are required')
  }

  let query = db
    .from('logs')
    .select('outcome, level')
    .gte('created_at', from)
    .lte('created_at', to)

  if (!isSystemAdmin(ctx.principal) && ctx.accountId) {
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query

  if (err) throw err

  const rows = data || []
  const total = rows.length
  const errors = rows.filter((r: any) => r.outcome === 'failure' || r.level === 'error').length
  return {
    total,
    errors,
    rate: total > 0 ? errors / total : 0,
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Compute error rate over a date range'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:getErrorRate:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:percentile:function" type="function" identity="percentile" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Compute a percentile of a sorted numeric array"]
// CIL[DOC-RESPONSIBILITY responsibility="Return weighted percentile value using linear interpolation"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="sorted: number[], p: number" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calculates index from p and length-1; blends lower and upper sorted values" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  const weight = idx - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}
// CIL[DOC-VECTOR type="context" content="purpose='Compute a percentile of a sorted numeric array'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:percentile:function"]

// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getLatencyPercentiles:constant" type="constant" identity="getLatencyPercentiles" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Return duration latency percentiles"]
// CIL[DOC-RESPONSIBILITY responsibility="Query positive non-null duration_ms values and compute p50/p90/p95/p99"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.from, ctx.query.to, ctx.query.source" outputs="{ p50, p90, p95, p99 }" errors="Account context required; from/to required; database error" side_effects="reads logs table"]
// CIL[DOC-MICRO logic_summary="Filters by span_name when source provided; converts and filters duration values; sorts and delegates to percentile" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getLatencyPercentiles = createHandler(async (ctx, body) => {
  const { from, to, source = 'request' } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  if (!from || !to) {
    throw new Error('from and to dates are required')
  }

  let query = db
    .from('logs')
    .select('duration_ms')
    .not('duration_ms', 'is', null)
    .gte('created_at', from)
    .lte('created_at', to)

  if (source) query = query.eq('span_name', source)
  if (!isSystemAdmin(ctx.principal) && ctx.accountId) {
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query

  if (err) throw err

  const values = (data || [])
    .map((r: any) => Number(r.duration_ms))
    .filter((v: number) => !isNaN(v) && v > 0)
    .sort((a: number, b: number) => a - b)

  return {
    p50: percentile(values, 50),
    p90: percentile(values, 90),
    p95: percentile(values, 95),
    p99: percentile(values, 99),
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Return duration latency percentiles'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:getLatencyPercentiles:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getPipelineStats:constant" type="constant" identity="getPipelineStats" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Aggregate pipeline execution statistics"]
// CIL[DOC-RESPONSIBILITY responsibility="Group pipeline_executions by pipeline_id and count successes/failures/durations"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.from, ctx.query.to" outputs="array of { pipeline_id, success_count, failure_count, avg_duration_ms }" errors="Account context required; from/to required; database error" side_effects="reads pipeline_executions table"]
// CIL[DOC-MICRO logic_summary="Iterates rows to update per-pipeline counters and compute average duration where both timestamps exist" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getPipelineStats = createHandler(async (ctx, body) => {
  const { from, to } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  if (!from || !to) {
    throw new Error('from and to dates are required')
  }

  let query = db
    .from('pipeline_executions')
    .select('pipeline_id, status, started_at, completed_at')
    .gte('created_at', from)
    .lte('created_at', to)

  if (!isSystemAdmin(ctx.principal) && ctx.accountId) {
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query

  if (err) throw err

  const stats: Record<string, any> = {}
  for (const row of data || []) {
    const s = stats[row.pipeline_id] || { pipeline_id: row.pipeline_id, success_count: 0, failure_count: 0, total_duration_ms: 0, duration_count: 0 }
    if (row.status === 'completed') s.success_count++
    if (row.status === 'failed') s.failure_count++
    if (row.started_at && row.completed_at) {
      const duration = new Date(row.completed_at).getTime() - new Date(row.started_at).getTime()
      if (duration > 0) {
        s.total_duration_ms += duration
        s.duration_count++
      }
    }
    stats[row.pipeline_id] = s
  }

  return Object.values(stats).map((s: any) => ({
    pipeline_id: s.pipeline_id,
    success_count: s.success_count,
    failure_count: s.failure_count,
    avg_duration_ms: s.duration_count > 0 ? Math.round(s.total_duration_ms / s.duration_count) : 0,
  }))
})
// CIL[DOC-VECTOR type="context" content="purpose='Aggregate pipeline execution statistics'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:getPipelineStats:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getTopActors:constant" type="constant" identity="getTopActors" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Rank principals by event volume"]
// CIL[DOC-RESPONSIBILITY responsibility="Count log rows per created_by and return the top N"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.from, ctx.query.to, ctx.query.limit" outputs="array of { principal_id, event_count }" errors="Account context required; from/to required; database error" side_effects="reads logs table"]
// CIL[DOC-MICRO logic_summary="Tallies created_by occurrences; sorts descending and limits to parsed limit defaulting to 5" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getTopActors = createHandler(async (ctx, body) => {
  const { from, to, limit = 5 } = ctx.query || {}
  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  if (!from || !to) {
    throw new Error('from and to dates are required')
  }

  let query = db
    .from('logs')
    .select('created_by')
    .gte('created_at', from)
    .lte('created_at', to)

  if (!isSystemAdmin(ctx.principal) && ctx.accountId) {
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query

  if (err) throw err

  const counts: Record<string, number> = {}
  for (const row of data || []) {
    const key = row.created_by || 'anonymous'
    counts[key] = (counts[key] || 0) + 1
  }

  return Object.entries(counts)
    .map(([principal_id, event_count]) => ({ principal_id, event_count }))
    .sort((a, b) => b.event_count - a.event_count)
    .slice(0, parseInt(limit.toString()) || 5)
})
// CIL[DOC-VECTOR type="context" content="purpose='Rank principals by event volume'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:getTopActors:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:cleanupOldLogs:constant" type="constant" identity="cleanupOldLogs" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Delete old logs via retention policy"]
// CIL[DOC-RESPONSIBILITY responsibility="Invoke a stored function to purge logs older than the requested retention"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.days" outputs="{ deleted_count }" errors="System admin required; database error" side_effects="calls cleanup_old_logs RPC; deletes records"]
// CIL[DOC-MICRO logic_summary="Restricts to system_admin; parses days defaulting to 90; runs cleanup_old_logs RPC" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const cleanupOldLogs = createHandler(async (ctx, body) => {
  const { days = 90 } = ctx.query || {}

  if (!ctx.principal?.roles?.includes('system_admin')) {
    throw new Error('System admin required')
  }

  const { data, error: err } = await ctx.db
    .rpc('cleanup_old_logs', {
      p_retention_days: parseInt(days.toString()) || 90,
    })

  if (err) throw err
  return { deleted_count: data?.[0]?.deleted_count || 0 }
})
// CIL[DOC-VECTOR type="context" content="purpose='Delete old logs via retention policy'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:cleanupOldLogs:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getAiSupportMetrics:constant" type="constant" identity="getAiSupportMetrics" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Compute AI support KPIs for the account"]
// CIL[DOC-RESPONSIBILITY responsibility="Aggregate AI feedback, resolved items, and escalated items over a period"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.from, ctx.query.to" outputs="{ period, ai_attempted, ai_resolved, human_escalations, thumbs_down_rate, kb_articles_created, kb_reuse_count, knowledge_gaps }" errors="Account context required; database error" side_effects="reads items table via adminDb"]
// CIL[DOC-MICRO logic_summary="Resolves ai_feedback_record type id; runs three parallel queries; computes rates and counts from feedback data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getAiSupportMetrics = createHandler(async (ctx, _body) => {
  if (!ctx.accountId) throw new Error('Account context required')

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const from = ctx.query?.from || thirtyDaysAgo
  const to   = ctx.query?.to   || now.toISOString()

  const feedbackTypeId = await resolveTypeId('item', 'ai_feedback_record')

  const [
    feedbackResult,
    resolvedResult,
    escalatedResult,
  ] = await Promise.allSettled([
    adminDb
      .from('items')
      .select('data')
      .eq('account_id', ctx.accountId)
      .eq('type_id', feedbackTypeId)
      .gte('created_at', from)
      .lte('created_at', to)
      .limit(5000),

    adminDb
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', ctx.accountId)
      .eq('status', 'resolved')
      .eq('data->>aim_escalation_reason', 'none')
      .gte('created_at', from)
      .lte('created_at', to),

    adminDb
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', ctx.accountId)
      .eq('status', 'human_assigned')
      .gte('created_at', from)
      .lte('created_at', to),
  ])

  const feedbackRows = feedbackResult.status === 'fulfilled'
    ? (feedbackResult.value.data || [])
    : []

  const aiAttempted = feedbackRows.length
  const notHelpful  = feedbackRows.filter((r: any) => r.data?.customer_feedback === 'not_helpful').length
  const kbCreated   = feedbackRows.filter((r: any) => r.data?.kb_article_id).length
  const kbReuseCount = feedbackRows.reduce((sum: number, r: any) => sum + (Number(r.data?.reuse_count) || 0), 0)
  const knowledgeGaps = feedbackRows.filter((r: any) =>
    r.data?.kb_candidate === false && r.data?.customer_feedback === 'not_helpful'
  ).length

  const aiResolved = resolvedResult.status === 'fulfilled' ? (resolvedResult.value.count || 0) : 0
  const escalated  = escalatedResult.status === 'fulfilled' ? (escalatedResult.value.count || 0) : 0

  const thumbsDownRate = aiAttempted > 0 ? notHelpful / aiAttempted : 0

  return {
    period: { from, to },
    ai_attempted:       aiAttempted,
    ai_resolved:        aiResolved,
    human_escalations:  escalated,
    thumbs_down_rate:   Math.round(thumbsDownRate * 1000) / 1000,
    kb_articles_created: kbCreated,
    kb_reuse_count:     kbReuseCount,
    knowledge_gaps:     knowledgeGaps,
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Compute AI support KPIs for the account'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:getAiSupportMetrics:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/observability.ts"]
// CIL[DOC-MACRO purpose="Route observability action requests"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch the requested analytics action to the appropriate function"]
// CIL[DOC-CONTEXT module="observability" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/observability.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.action" outputs="action-specific result" errors="Unknown action" side_effects="delegates to analytics functions"]
// CIL[DOC-MICRO logic_summary="Switch on action and awaits the matching handler; returns default error for unknown actions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}

  switch (action) {
    case 'event_volume':
      return await getEventVolume(ctx, body)
    case 'error_rate':
      return await getErrorRate(ctx, body)
    case 'latency_percentiles':
      return await getLatencyPercentiles(ctx, body)
    case 'pipeline_stats':
      return await getPipelineStats(ctx, body)
    case 'top_actors':
      return await getTopActors(ctx, body)
    case 'ai_support_metrics':
      return await getAiSupportMetrics(ctx, body)
    case 'cleanup':
      return await cleanupOldLogs(ctx, body)
    default:
      throw new Error(`Unknown action: ${action}. Valid actions: event_volume, error_rate, latency_percentiles, pipeline_stats, top_actors, ai_support_metrics, cleanup`)
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Route observability action requests'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/observability.ts:handler:constant"]