// CIL[BEGIN stable_id="~/.framework/mcp/tools/observability.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/observability.ts"]
// CIL[DOC-MACRO purpose="MCP tool registration module for observability logs and metrics"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports dependencies and exports the register function that wires observability MCP tools to an McpServer"]
// CIL[DOC-CONTEXT module="observability" layer="mcp-tools" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance via register" outputs="MCP tool handlers for volume, error rate, latency, pipeline, top actors, AI support, and logs" errors="Throws from adminDb RPC or query errors via throwDbError" side_effects="None at module load"]
// CIL[DOC-MICRO logic_summary="Sets up zod schemas and adminDb RPC calls for observability data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework-maintainers"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../shared/db.js'
import { resolveTypeId } from '../shared/db.js'
// CIL[DOC-VECTOR type="context" content="purpose='MCP tool registration module for observability logs and metrics'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/observability.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/observability.ts:mapLogRow:function" type="function" identity="mapLogRow" parent="~/.framework/mcp/tools/observability.ts"]
// CIL[DOC-MACRO purpose="Map a raw log database row to a normalized client-facing log object"]
// CIL[DOC-RESPONSIBILITY responsibility="Transform database column names to the expected client log field names"]
// CIL[DOC-CONTEXT module="observability" layer="mcp-tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="row: any database log row" outputs="normalized log object" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns an object mapping row columns to the names expected by consumers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Map a raw log database row to a normalized client-facing log object'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/observability.ts:mapLogRow:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/observability.ts:textResponse:function" type="function" identity="textResponse" parent="~/.framework/mcp/tools/observability.ts"]
// CIL[DOC-MACRO purpose="Wrap any value in an MCP text content response"]
// CIL[DOC-RESPONSIBILITY responsibility="Format JSON-serialized payloads for MCP text tool responses"]
// CIL[DOC-CONTEXT module="observability" layer="mcp-tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="obj: any" outputs="MCP content array with type text" errors="May throw if JSON.stringify receives circular input" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Stringify object and return an MCP text content wrapper" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function textResponse(obj: any) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(obj, null, 2),
    }],
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Wrap any value in an MCP text content response'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/observability.ts:textResponse:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/observability.ts:throwDbError:function" type="function" identity="throwDbError" parent="~/.framework/mcp/tools/observability.ts"]
// CIL[DOC-MACRO purpose="Convert an unknown error into a JavaScript Error with a readable message"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide uniform database error handling for tool handlers"]
// CIL[DOC-CONTEXT module="observability" layer="mcp-tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="error: any" outputs="Throws Error" errors="Throws Error for any error input" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Coerce error to string and throw" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function throwDbError(error: any) {
  const msg = error && typeof error === 'object'
    ? (error.message || JSON.stringify(error))
    : String(error)
  throw new Error(msg)
}
// CIL[DOC-VECTOR type="context" content="purpose='Convert an unknown error into a JavaScript Error with a readable message'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/observability.ts:throwDbError:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/observability.ts:defaultRange:function" type="function" identity="defaultRange" parent="~/.framework/mcp/tools/observability.ts"]
// CIL[DOC-MACRO purpose="Return a default 24-hour ISO date range ending at now"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide fallback from/to timestamps for time-bucketed metric queries"]
// CIL[DOC-CONTEXT module="observability" layer="mcp-tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="{ from: ISO string, to: ISO string }" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Compute yesterday by subtracting 24 hours from now" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function defaultRange() {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  return { from: yesterday, to: now.toISOString() }
}
// CIL[DOC-VECTOR type="context" content="purpose='Return a default 24-hour ISO date range ending at now'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/observability.ts:defaultRange:function"]



// CIL[BEGIN stable_id="~/.framework/mcp/tools/observability.ts:bucketToGranularity:constant" type="constant" identity="bucketToGranularity" parent="~/.framework/mcp/tools/observability.ts"]
// CIL[DOC-MACRO purpose="Map friendly bucket names to SQL interval strings"]
// CIL[DOC-RESPONSIBILITY responsibility="Translate hour/day/week inputs to PostgreSQL granularity literals"]
// CIL[DOC-CONTEXT module="observability" layer="mcp-tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="bucket string key" outputs="PostgreSQL interval string" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Lookup Record<string,string> with default 1 hour" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const bucketToGranularity: Record<string, string> = {
  hour: '1 hour',
  day: '1 day',
  week: '1 week',
}
// CIL[DOC-VECTOR type="context" content="purpose='Map friendly bucket names to SQL interval strings'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/observability.ts:bucketToGranularity:constant"]




// CIL[BEGIN stable_id="~/.framework/mcp/tools/observability.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/observability.ts"]
// CIL[DOC-MACRO purpose="Register all observability MCP tools on a server instance"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose metrics, logs, and AI support query tools to MCP clients"]
// CIL[DOC-CONTEXT module="observability" layer="mcp-tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="Registered tool handlers with zod input schemas" errors="Throws on database RPC or query errors" side_effects="Adds ten tool handlers to the McpServer"]
// CIL[DOC-MICRO logic_summary="Defines ten tools using zod and adminDb RPC or queries: event volume, error rate, latency percentiles, pipeline stats, top actors, AI support metrics, log search, log list, log for target, log stats" notable_decisions="['latency_percentiles returns avg_handler_duration because percentile RPCs are not yet available']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Register all observability MCP tools on a server instance'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/observability.ts:register:function"]
