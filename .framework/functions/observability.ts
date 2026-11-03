// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/observability.ts"]
/**
 * @module   observability
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides observability functions for the application, facilitating monitoring and logging of system behavior. It serves as a middleware handler that integrates with the database and user permissions to ensure that only authorized users can access certain functionalities. INVARIANT: All requests must be authenticated as system administrators to proceed with observability actions.
 *
 * @seeAlso middleware.ts (provides the handler for observability functions).
 * @seeAlso db.ts (handles database interactions necessary for observability).
 * @seeAlso principal.ts (manages user permissions and roles).
 *
 * @cil-generated
 */

















import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { isSystemAdmin } from './_shared/principal'
import { resolveTypeId } from './_shared/resolve-ids'
// CIL[END stable_id="~/.framework/functions/observability.ts:module_header:module_header"]















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:floorBucket:function" type="function" identity="floorBucket" parent="~/.framework/functions/observability.ts"]
/**
 * The floorBucket function normalizes a given date to the start of a specified time bucket, such as an hour or day, facilitating data aggregation based on time intervals.
 *
 * @inputSpec
 *   - date: Date (required) — the date to be normalized.
 *   - bucket: string (required) — the time bucket to normalize to, can be 'hour' or 'day'.
 * @outputSpec  Date — the normalized date object.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function floorBucket(date: Date, bucket: string): Date {
  const d = new Date(date)
  d.setMilliseconds(0)
  d.setSeconds(0)
  if (bucket === 'hour' || bucket === 'day') d.setMinutes(0)
  if (bucket === 'day') d.setHours(0)
  return d
}
// CIL[END stable_id="~/.framework/functions/observability.ts:floorBucket:function"]
















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getEventVolume:constant" type="constant" identity="getEventVolume" parent="~/.framework/functions/observability.ts"]
/**
 * Retrieves the volume of events logged within a specified date range, grouped by time buckets. This function is essential for analyzing event frequency over time.
 *
 * @throws      Error — Account context required, Error — from and to dates are required.
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('logs'), db.from('logs'), floorBucket
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/observability.ts:getEventVolume:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getErrorRate:constant" type="constant" identity="getErrorRate" parent="~/.framework/functions/observability.ts"]
/**
 * Calculates the error rate of logs within a specified date range, returning the total number of logs, the number of errors, and the error rate. This function is essential for monitoring and observability purposes.
 *
 * @throws      Error — Account context required, or from and to dates are required.
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('logs'), adminDb.select, adminDb.gte, adminDb.lte, adminDb.eq
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/observability.ts:getErrorRate:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:percentile:function" type="function" identity="percentile" parent="~/.framework/functions/observability.ts"]
/**
 * Calculates the p-th percentile of a sorted array of numbers for statistical analysis and data observability. This function is essential for deriving insights from numerical datasets.
 *
 * @inputSpec
 *   - sorted: number[] (required) — a sorted array of numbers to calculate the percentile from.
 *   - p: number (required) — the desired percentile value (0-100).
 * @outputSpec  number — the calculated percentile value.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  const weight = idx - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}
// CIL[END stable_id="~/.framework/functions/observability.ts:percentile:function"]
















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getLatencyPercentiles:constant" type="constant" identity="getLatencyPercentiles" parent="~/.framework/functions/observability.ts"]
/**
 * Calculates latency percentiles for logs within a specified date range while ensuring that only authorized users can access the data. It also handles errors related to missing parameters.
 *
 * @throws      Error — Account context required, Error — from and to dates are required.
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('logs'), db.from('logs')
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/observability.ts:getLatencyPercentiles:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getPipelineStats:constant" type="constant" identity="getPipelineStats" parent="~/.framework/functions/observability.ts"]
/**
 * Fetches pipeline execution statistics based on a date range and account context, aggregating success and failure counts along with average execution duration for each pipeline.
 *
 * @throws      Error — Account context required, or from and to dates are required, or database query error.
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('pipeline_executions'), adminDb.select, adminDb.gte, adminDb.lte, adminDb.eq
 * @errorHandling none
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/observability.ts:getPipelineStats:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getTopActors:constant" type="constant" identity="getTopActors" parent="~/.framework/functions/observability.ts"]
/**
 * Retrieves the top actors based on event counts within a specified date range while ensuring the user has the necessary account context and permissions. This function is essential for monitoring user activity in the system.
 *
 * @throws      Error — Account context required, Error — from and to dates are required
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('logs'), adminDb.select, adminDb.gte, adminDb.lte, adminDb.eq
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/observability.ts:getTopActors:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:cleanupOldLogs:constant" type="constant" identity="cleanupOldLogs" parent="~/.framework/functions/observability.ts"]
/**
 * Cleans up old logs from the database based on a specified retention period. It ensures that only system administrators can perform this action.
 *
 * @throws      Error — System admin required, Error — if database RPC fails
 * @sideEffects Database RPC call to 'cleanup_old_logs'
 * @stability   internal
 * @calls       ctx.db.rpc('cleanup_old_logs')
 * @cil-generated
 */
export const cleanupOldLogs = createHandler(async (ctx, body) => {
  const { days = 30 } = ctx.query || {}

  if (!ctx.principal?.roles?.includes('system_admin')) {
    throw new Error('System admin required')
  }

  const { data, error: err } = await adminDb
    .rpc('cleanup_old_logs', {
      p_retention_days: parseInt(days.toString()) || 30,
    })

  if (err) throw err
  return { deleted_count: data?.[0]?.deleted_count || 0 }
})
// CIL[END stable_id="~/.framework/functions/observability.ts:cleanupOldLogs:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:getAiSupportMetrics:constant" type="constant" identity="getAiSupportMetrics" parent="~/.framework/functions/observability.ts"]
/**
 * Retrieves AI support metrics for a specific account over a defined time period, aggregating feedback and resolution data to provide insights into AI performance and user satisfaction.
 *
 * @throws      Error — Account context required
 * @sideEffects Database reads from 'items' table for metrics aggregation.
 * @stability   internal
 * @calls       adminDb.from('items'), resolveTypeId
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/observability.ts:getAiSupportMetrics:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/observability.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/observability.ts"]
/**
 * The handler processes incoming requests based on the specified action in the query parameters, executing the corresponding function for each action. It provides a centralized point for handling various observability metrics and actions.
 *
 * @throws      Error — Unknown action: if the action is not recognized.
 * @sideEffects none
 * @stability   internal
 * @calls       getEventVolume, getErrorRate, getLatencyPercentiles, getPipelineStats, getTopActors, getAiSupportMetrics, cleanupOldLogs
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/functions/observability.ts:handler:constant"]






