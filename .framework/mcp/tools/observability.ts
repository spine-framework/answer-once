
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../shared/db.js'
import { resolveTypeId } from '../shared/db.js'


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


function textResponse(obj: any) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(obj, null, 2),
    }],
  }
}


function throwDbError(error: any) {
  const msg = error && typeof error === 'object'
    ? (error.message || JSON.stringify(error))
    : String(error)
  throw new Error(msg)
}


function defaultRange() {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  return { from: yesterday, to: now.toISOString() }
}



const bucketToGranularity: Record<string, string> = {
  hour: '1 hour',
  day: '1 day',
  week: '1 week',
}




// ['latency_percentiles returns avg_handler_duration because percentile RPCs are not yet available']
export function register(server: McpServer) {
  server.registerTool(
    'spine_observability_event_volume',
    {
      description: 'Get request count over time, bucketed by hour/day/week.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        bucket: z.enum(['hour', 'day', 'week']).default('hour'),
      }),
    },
    async ({ account_id, from, to, bucket }) => {
      const range = defaultRange()
      const { data, error } = await adminDb.rpc('get_metric_series', {
        p_account_id: account_id,
        p_metric_name: 'request_count',
        p_granularity: bucketToGranularity[bucket] || '1 hour',
        p_date_from: from || range.from,
        p_date_to: to || range.to,
      })
      if (error) throwDbError(error)
      return textResponse({ action: 'event_volume', data: data || [] })
    }
  )

  server.registerTool(
    'spine_observability_error_rate',
    {
      description: 'Get error rate over time for an account and date range.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        bucket: z.enum(['hour', 'day', 'week']).default('hour'),
      }),
    },
    async ({ account_id, from, to, bucket }) => {
      const range = defaultRange()
      const { data, error } = await adminDb.rpc('get_metric_series', {
        p_account_id: account_id,
        p_metric_name: 'error_rate',
        p_granularity: bucketToGranularity[bucket] || '1 hour',
        p_date_from: from || range.from,
        p_date_to: to || range.to,
      })
      if (error) throwDbError(error)
      return textResponse({ action: 'error_rate', data: data || [] })
    }
  )

  server.registerTool(
    'spine_observability_latency_percentiles',
    {
      description: 'Get handler latency (average duration_ms) over time. Percentile RPCs are not yet available; this returns the avg_handler_duration metric series.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        bucket: z.enum(['hour', 'day', 'week']).default('hour'),
      }),
    },
    async ({ account_id, from, to, bucket }) => {
      const range = defaultRange()
      const { data, error } = await adminDb.rpc('get_metric_series', {
        p_account_id: account_id,
        p_metric_name: 'avg_handler_duration',
        p_granularity: bucketToGranularity[bucket] || '1 hour',
        p_date_from: from || range.from,
        p_date_to: to || range.to,
      })
      if (error) throwDbError(error)
      return textResponse({ action: 'latency_percentiles', data: data || [] })
    }
  )

  server.registerTool(
    'spine_observability_pipeline_stats',
    {
      description: 'Get pipeline failure rate over time.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        bucket: z.enum(['hour', 'day', 'week']).default('hour'),
      }),
    },
    async ({ account_id, from, to, bucket }) => {
      const range = defaultRange()
      const { data, error } = await adminDb.rpc('get_metric_series', {
        p_account_id: account_id,
        p_metric_name: 'pipeline_failure_rate',
        p_granularity: bucketToGranularity[bucket] || '1 hour',
        p_date_from: from || range.from,
        p_date_to: to || range.to,
      })
      if (error) throwDbError(error)
      return textResponse({ action: 'pipeline_stats', data: data || [] })
    }
  )

  server.registerTool(
    'spine_observability_top_actors',
    {
      description: 'Get the top business outcomes by span_name/outcome count.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      }),
    },
    async ({ account_id, from, to }) => {
      const range = defaultRange()
      const { data, error } = await adminDb.rpc('get_business_outcomes', {
        p_account_id: account_id,
        p_date_from: from || range.from,
        p_date_to: to || range.to,
      })
      if (error) throwDbError(error)
      return textResponse({ action: 'business_outcomes', data: data || [] })
    }
  )

  server.registerTool(
    'spine_observability_ai_support_metrics',
    {
      description: 'Get AI support metrics and knowledge gap analysis for an account.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      }),
    },
    async ({ account_id, from, to }) => {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const fromDate = from || thirtyDaysAgo
      const toDate = to || now.toISOString()

      const feedbackTypeId = await resolveTypeId('item', 'ai_feedback_record')

      const [feedbackResult, resolvedResult, escalatedResult] = await Promise.allSettled([
        adminDb
          .from('items')
          .select('data')
          .eq('account_id', account_id)
          .eq('type_id', feedbackTypeId)
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .limit(5000),
        adminDb
          .from('items')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', account_id)
          .eq('status', 'resolved')
          .eq('data->>aim_escalation_reason', 'none')
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
        adminDb
          .from('items')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', account_id)
          .eq('status', 'human_assigned')
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
      ])

      const feedbackRows = feedbackResult.status === 'fulfilled' ? (feedbackResult.value.data || []) : []
      const aiAttempted = feedbackRows.length
      const notHelpful = feedbackRows.filter((r: any) => r.data?.customer_feedback === 'not_helpful').length
      const kbCreated = feedbackRows.filter((r: any) => r.data?.kb_article_id).length
      const kbReuseCount = feedbackRows.reduce((sum: number, r: any) => sum + (Number(r.data?.reuse_count) || 0), 0)
      const knowledgeGaps = feedbackRows.filter(
        (r: any) => r.data?.kb_candidate === false && r.data?.customer_feedback === 'not_helpful'
      ).length
      const aiResolved = resolvedResult.status === 'fulfilled' ? (resolvedResult.value.count || 0) : 0
      const escalated = escalatedResult.status === 'fulfilled' ? (escalatedResult.value.count || 0) : 0
      const thumbsDownRate = aiAttempted > 0 ? notHelpful / aiAttempted : 0

      return textResponse({
        action: 'ai_support_metrics',
        period: { from: fromDate, to: toDate },
        ai_attempted: aiAttempted,
        ai_resolved: aiResolved,
        human_escalations: escalated,
        thumbs_down_rate: Math.round(thumbsDownRate * 1000) / 1000,
        kb_articles_created: kbCreated,
        kb_reuse_count: kbReuseCount,
        knowledge_gaps: knowledgeGaps,
      })
    }
  )

  server.registerTool(
    'spine_logs_search',
    {
      description: 'Full-text search over log messages for an account.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        query: z.string(),
        event_type: z.string().optional(),
        target_type: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    },
    async ({ account_id, query, event_type, target_type, limit, offset }) => {
      let q = adminDb
        .from('logs')
        .select('*')
        .eq('account_id', account_id)
        .ilike('message', `%${query}%`)
        .order('created_at', { ascending: false })

      if (event_type) q = q.eq('level', event_type)
      if (target_type) q = q.eq('source_type', target_type)

      const { data, error } = await q.range(offset, offset + limit - 1)
      if (error) throwDbError(error)
      return textResponse({ action: 'search', data: (data || []).map(mapLogRow) })
    }
  )

  server.registerTool(
    'spine_logs_for_account',
    {
      description: 'List log entries for an account with optional filtering and pagination.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        event_type: z.string().optional(),
        target_type: z.string().optional(),
        source: z.string().optional(),
        source_id: z.string().optional(),
        actor_id: z.string().uuid().optional(),
        date_from: z.string().datetime().optional(),
        date_to: z.string().datetime().optional(),
        trace_id: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0),
      }),
    },
    async ({ account_id, event_type, target_type, source, source_id, actor_id, date_from, date_to, trace_id, limit, offset }) => {
      let q = adminDb
        .from('logs')
        .select('*', { count: 'exact' })
        .eq('account_id', account_id)
        .order('created_at', { ascending: false })

      if (event_type) q = q.eq('level', event_type)
      if (target_type) q = q.eq('source_type', target_type)
      if (source) q = q.eq('source', source)
      if (source_id) q = q.eq('source_id', source_id)
      if (actor_id) q = q.eq('person_id', actor_id)
      if (date_from) q = q.gte('created_at', date_from)
      if (date_to) q = q.lte('created_at', date_to)
      if (trace_id) q = q.eq('trace_id', trace_id)

      const { data, error, count } = await q.range(offset, offset + limit - 1)
      if (error) throwDbError(error)
      return textResponse({
        action: 'account',
        data: (data || []).map(mapLogRow),
        total: count || 0,
      })
    }
  )

  server.registerTool(
    'spine_logs_for_target',
    {
      description: 'List log entries for a specific target entity.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        target_type: z.string(),
        target_id: z.string(),
        event_type: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0),
      }),
    },
    async ({ account_id, target_type, target_id, event_type, limit, offset }) => {
      let q = adminDb
        .from('logs')
        .select('*')
        .eq('account_id', account_id)
        .eq('source_type', target_type)
        .eq('source_id', target_id)
        .order('created_at', { ascending: false })

      if (event_type) q = q.eq('level', event_type)

      const { data, error } = await q.range(offset, offset + limit - 1)
      if (error) throwDbError(error)
      return textResponse({ action: 'target', data: (data || []).map(mapLogRow) })
    }
  )

  server.registerTool(
    'spine_logs_stats',
    {
      description: 'Aggregate log counts by type and source for an account and optional filters.',
      inputSchema: z.object({
        account_id: z.string().uuid(),
        event_type: z.string().optional(),
        target_type: z.string().optional(),
        source: z.string().optional(),
        source_id: z.string().optional(),
        actor_id: z.string().uuid().optional(),
        query: z.string().optional(),
        date_from: z.string().datetime().optional(),
        date_to: z.string().datetime().optional(),
      }),
    },
    async ({ account_id, event_type, target_type, source, source_id, actor_id, query, date_from, date_to }) => {
      const { data, error } = await adminDb.rpc('get_log_stats', {
        p_account_id: account_id,
        p_level: event_type || null,
        p_source: source || null,
        p_source_type: target_type || null,
        p_source_id: source_id || null,
        p_person_id: actor_id || null,
        p_query: query || null,
        p_date_from: date_from || null,
        p_date_to: date_to || null,
      })
      if (error) throwDbError(error)
      return textResponse({ action: 'stats', data: data?.[0] || {
        total: 0,
        error_count: 0,
        user_action_count: 0,
        event_type_count: 0,
        levels: [],
        sources: [],
        source_types: [],
      }})
    }
  )
}
