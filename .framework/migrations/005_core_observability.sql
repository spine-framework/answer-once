-- CIL[BEGIN stable_id="~/.framework/migrations/005_core_observability.sql:core_observability:file" type="file" identity="core_observability" parent="~/.framework/migrations/005_core_observability.sql"]
-- CIL[DOC-MACRO purpose="Consolidated observability, trace context, and knowledge search SQL migration"]
-- CIL[DOC-RESPONSIBILITY responsibility="Define logs trace columns, observability metric functions, RLS policy, match_embeddings filters, and data retention"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/migrations/005_core_observability.sql"]
-- CIL[DOC-CONTRACT inputs="SQL migration runner" outputs="Updated public.logs schema, SQL functions, policy, indexes" errors="SQL execution errors, constraint violations" side_effects="Alters public.logs, recreates functions and indexes, grants permissions"]
-- CIL[DOC-MICRO logic_summary="Adds W3C trace columns and constraints to public.logs, creates trace/metric/outcome/prune functions and grants, updates RLS and match_embeddings with filters, adds retention functions" notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Spine v2 consolidated observability and knowledge search
-- Logs trace columns, observability metric RPCs, KB item RLS, and updated match_embeddings.

-- Migration: extend public.logs to store W3C Trace Context and span records.
-- Logs become the unified runtime evidence table: events, audit records, and spans.

ALTER TABLE public.logs
  ADD COLUMN IF NOT EXISTS trace_id text,
  ADD COLUMN IF NOT EXISTS span_id text,
  ADD COLUMN IF NOT EXISTS parent_span_id text,
  ADD COLUMN IF NOT EXISTS trace_flags smallint,
  ADD COLUMN IF NOT EXISTS tracestate text,
  ADD COLUMN IF NOT EXISTS span_name text,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS ended_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration_ms numeric,
  ADD COLUMN IF NOT EXISTS sampled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS kind text,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS event_category text;

CREATE INDEX IF NOT EXISTS idx_logs_trace_id ON public.logs (trace_id);
CREATE INDEX IF NOT EXISTS idx_logs_span_id ON public.logs (span_id);
CREATE INDEX IF NOT EXISTS idx_logs_parent_span_id ON public.logs (parent_span_id);
CREATE INDEX IF NOT EXISTS idx_logs_started_at ON public.logs (started_at);
CREATE INDEX IF NOT EXISTS idx_logs_account_started_at ON public.logs (account_id, started_at);
CREATE INDEX IF NOT EXISTS idx_logs_account_trace ON public.logs (account_id, trace_id);

-- Add a lightweight check to keep trace IDs valid hex length where present.
ALTER TABLE public.logs
  ADD CONSTRAINT chk_trace_id_hex CHECK (trace_id IS NULL OR trace_id ~ '^[0-9a-f]{32}$'),
  ADD CONSTRAINT chk_span_id_hex CHECK (span_id IS NULL OR span_id ~ '^[0-9a-f]{16}$'),
  ADD CONSTRAINT chk_parent_span_id_hex CHECK (parent_span_id IS NULL OR parent_span_id ~ '^[0-9a-f]{16}$');

-- Migration: add SQL aggregation functions for traces and derived metrics.

CREATE OR REPLACE FUNCTION public.get_trace_tree(
  p_account_id uuid,
  p_trace_id text
)
RETURNS TABLE (
  span_id text,
  parent_span_id text,
  span_name text,
  kind text,
  level text,
  source text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_ms numeric,
  status text,
  outcome text,
  message text,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.span_id,
    l.parent_span_id,
    l.span_name,
    l.kind,
    l.level,
    l.source,
    l.started_at,
    l.ended_at,
    l.duration_ms,
    CASE
      WHEN l.level ILIKE '%error%' OR l.outcome = 'failure' THEN 'error'
      ELSE 'ok'
    END AS status,
    l.outcome,
    l.message,
    COALESCE(to_jsonb(l.metadata), '{}'::jsonb) AS metadata
  FROM public.logs l
  WHERE l.account_id = p_account_id
    AND l.trace_id = p_trace_id
  ORDER BY l.started_at ASC, l.span_name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_trace_stats(
  p_account_id uuid,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  trace_id text,
  root_span_name text,
  started_at timestamptz,
  duration_ms numeric,
  span_count bigint,
  error_count bigint,
  outcome text
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.trace_id,
    MAX(l.span_name) FILTER (WHERE l.parent_span_id IS NULL) AS root_span_name,
    MIN(l.started_at) AS started_at,
    MAX(l.duration_ms) FILTER (WHERE l.parent_span_id IS NULL) AS duration_ms,
    COUNT(*) AS span_count,
    COUNT(*) FILTER (WHERE l.level ILIKE '%error%' OR l.outcome = 'failure') AS error_count,
    MAX(l.outcome) AS outcome
  FROM public.logs l
  WHERE l.account_id = p_account_id
    AND l.trace_id IS NOT NULL
    AND (p_date_from IS NULL OR l.started_at >= p_date_from)
    AND (p_date_to IS NULL OR l.started_at <= p_date_to)
  GROUP BY l.trace_id
  ORDER BY started_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_metric_series(
  p_account_id uuid,
  p_metric_name text,
  p_granularity text DEFAULT '1 hour',
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  bucket timestamptz,
  value numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  IF p_metric_name = 'request_count' THEN
    RETURN QUERY
    SELECT
      date_trunc(p_granularity, l.started_at) AS bucket,
      COUNT(*)::numeric AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.span_name = 'request'
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSIF p_metric_name = 'error_rate' THEN
    RETURN QUERY
    SELECT
      date_trunc(p_granularity, l.started_at) AS bucket,
      CASE WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE l.level ILIKE '%error%' OR l.outcome = 'failure')::numeric / COUNT(*)::numeric)
      ELSE 0 END AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.trace_id IS NOT NULL
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSIF p_metric_name = 'avg_handler_duration' THEN
    RETURN QUERY
    SELECT
      date_trunc(p_granularity, l.started_at) AS bucket,
      AVG(l.duration_ms) AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.span_name = 'request'
      AND l.duration_ms IS NOT NULL
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSIF p_metric_name = 'agent_tool_count' THEN
    RETURN QUERY
    SELECT
      date_trunc(p_granularity, l.started_at) AS bucket,
      COUNT(*)::numeric AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.span_name = 'agent.tool'
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSIF p_metric_name = 'pipeline_failure_rate' THEN
    RETURN QUERY
    SELECT
      date_trunc(p_granularity, l.started_at) AS bucket,
      CASE WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE l.span_name LIKE 'pipeline%' AND (l.level ILIKE '%error%' OR l.outcome = 'failure'))::numeric / NULLIF(COUNT(*) FILTER (WHERE l.span_name LIKE 'pipeline%'), 0))
      ELSE 0 END AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSE
    RETURN QUERY
    SELECT
      date_trunc(p_granularity, l.started_at) AS bucket,
      COUNT(*)::numeric AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.span_name = p_metric_name
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_business_outcomes(
  p_account_id uuid,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  intent text,
  outcome text,
  count bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.span_name AS intent,
    l.outcome,
    COUNT(*) AS count
  FROM public.logs l
  WHERE l.account_id = p_account_id
    AND l.event_category = 'business_outcome'
    AND (p_date_from IS NULL OR l.started_at >= p_date_from)
    AND (p_date_to IS NULL OR l.started_at <= p_date_to)
  GROUP BY l.span_name, l.outcome
  ORDER BY count DESC;
END;
$$;

-- Ensure functions are callable from the authenticated role used by supabase-js.
GRANT EXECUTE ON FUNCTION public.get_trace_tree(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trace_stats(uuid, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_metric_series(uuid, text, text, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_business_outcomes(uuid, timestamptz, timestamptz) TO authenticated;



-- Fix get_metric_series to accept human-readable granularities such as '1 hour', '1 day', '7 days', '30 days'.
-- date_trunc does not accept interval-style strings, so use date_bin with a fixed UTC origin instead.

CREATE OR REPLACE FUNCTION public.get_metric_series(
  p_account_id uuid,
  p_metric_name text,
  p_granularity text DEFAULT '1 hour',
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  bucket timestamptz,
  value numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_stride interval;
  v_origin timestamptz := '2000-01-01 00:00:00+00'::timestamptz;
BEGIN
  v_stride := p_granularity::interval;

  IF p_metric_name = 'request_count' THEN
    RETURN QUERY
    SELECT
      date_bin(v_stride, l.started_at, v_origin) AS bucket,
      COUNT(*)::numeric AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.span_name = 'request'
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSIF p_metric_name = 'error_rate' THEN
    RETURN QUERY
    SELECT
      date_bin(v_stride, l.started_at, v_origin) AS bucket,
      CASE WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE l.level ILIKE '%error%' OR l.outcome = 'failure')::numeric / COUNT(*)::numeric)
      ELSE 0 END AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.trace_id IS NOT NULL
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSIF p_metric_name = 'avg_handler_duration' THEN
    RETURN QUERY
    SELECT
      date_bin(v_stride, l.started_at, v_origin) AS bucket,
      AVG(l.duration_ms) AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.span_name = 'request'
      AND l.duration_ms IS NOT NULL
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSIF p_metric_name = 'agent_tool_count' THEN
    RETURN QUERY
    SELECT
      date_bin(v_stride, l.started_at, v_origin) AS bucket,
      COUNT(*)::numeric AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.span_name = 'agent.tool'
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSIF p_metric_name = 'pipeline_failure_rate' THEN
    RETURN QUERY
    SELECT
      date_bin(v_stride, l.started_at, v_origin) AS bucket,
      CASE WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE l.span_name LIKE 'pipeline%' AND (l.level ILIKE '%error%' OR l.outcome = 'failure'))::numeric / NULLIF(COUNT(*) FILTER (WHERE l.span_name LIKE 'pipeline%'), 0))
      ELSE 0 END AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;

  ELSE
    RETURN QUERY
    SELECT
      date_bin(v_stride, l.started_at, v_origin) AS bucket,
      COUNT(*)::numeric AS value
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.span_name = p_metric_name
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY bucket
    ORDER BY bucket;
  END IF;
END;
$$;

-- Re-apply grants in case they were not preserved by CREATE OR REPLACE FUNCTION in older Postgres versions.
GRANT EXECUTE ON FUNCTION public.get_metric_series(uuid, text, text, timestamptz, timestamptz) TO authenticated;


-- Add optional limit/offset/total support to get_trace_stats so the UI can paginate trace lists.
CREATE OR REPLACE FUNCTION public.get_trace_stats(
  p_account_id uuid,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_limit bigint DEFAULT NULL,
  p_offset bigint DEFAULT NULL,
  p_sort text DEFAULT 'started'
)
RETURNS TABLE (
  trace_id text,
  root_span_name text,
  started_at timestamptz,
  duration_ms numeric,
  span_count bigint,
  error_count bigint,
  outcome text,
  total bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  WITH grouped AS (
    SELECT
      l.trace_id,
      MAX(l.span_name) FILTER (WHERE l.parent_span_id IS NULL) AS root_span_name,
      MIN(l.started_at) AS started_at,
      MAX(l.duration_ms) FILTER (WHERE l.parent_span_id IS NULL) AS duration_ms,
      COUNT(*) AS span_count,
      COUNT(*) FILTER (WHERE l.level ILIKE '%error%' OR l.outcome = 'failure') AS error_count,
      MAX(l.outcome) AS outcome
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.trace_id IS NOT NULL
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY l.trace_id
  )
  SELECT
    g.*,
    COUNT(*) OVER() AS total
  FROM grouped g
  ORDER BY
    CASE WHEN p_sort = 'duration' THEN g.duration_ms END DESC NULLS LAST,
    g.started_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Add optional limit/offset/total support to get_business_outcomes.
CREATE OR REPLACE FUNCTION public.get_business_outcomes(
  p_account_id uuid,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_limit bigint DEFAULT NULL,
  p_offset bigint DEFAULT NULL
)
RETURNS TABLE (
  intent text,
  outcome text,
  count bigint,
  total bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  WITH grouped AS (
    SELECT
      l.span_name AS intent,
      l.outcome,
      COUNT(*) AS count
    FROM public.logs l
    WHERE l.account_id = p_account_id
      AND l.event_category = 'business_outcome'
      AND (p_date_from IS NULL OR l.started_at >= p_date_from)
      AND (p_date_to IS NULL OR l.started_at <= p_date_to)
    GROUP BY l.span_name, l.outcome
  )
  SELECT
    g.*,
    COUNT(*) OVER() AS total
  FROM grouped g
  ORDER BY g.count DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Re-apply grants for the new signatures.
GRANT EXECUTE ON FUNCTION public.get_trace_stats(uuid, timestamptz, timestamptz, bigint, bigint, text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_business_outcomes(uuid, timestamptz, timestamptz, bigint, bigint) TO authenticated;


-- Postgres created overloaded variants because CREATE OR REPLACE FUNCTION cannot change signatures.
-- Drop the old 3-argument versions so callers using three arguments resolve to the new paginated variants.
DROP FUNCTION IF EXISTS public.get_trace_stats(uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.get_business_outcomes(uuid, timestamptz, timestamptz);

DROP POLICY IF EXISTS items_access ON public.items;

CREATE POLICY items_access ON public.items FOR ALL
  USING (
    account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))
    OR (design_schema->>'scope' = 'platform' AND public.current_actor_id() IS NOT NULL)
    OR public.current_actor_id() IS NULL
  );

CREATE INDEX IF NOT EXISTS items_status_idx ON public.items (status);

-- Update match_embeddings to support item-type/document filtering and to
-- exclude revoked or unapproved embeddings.

CREATE OR REPLACE FUNCTION public.match_embeddings(
  query_embedding     vector(1536),
  match_count         int            DEFAULT 10,
  filter_account_ids  uuid[]         DEFAULT NULL,
  filter_vector_type  text           DEFAULT NULL,
  similarity_threshold float         DEFAULT 0.15,
  filter_item_types   text[]         DEFAULT NULL,
  filter_document_ids text[]         DEFAULT NULL
)
RETURNS TABLE (
  id              uuid,
  document_id     text,
  content         text,
  metadata        jsonb,
  account_id      uuid,
  similarity      float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.document_id,
    e.content,
    e.metadata,
    e.account_id,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.embeddings e
  WHERE
    (filter_account_ids IS NULL OR e.account_id = ANY(filter_account_ids))
    AND (filter_vector_type IS NULL OR e.metadata->>'vector_type' = filter_vector_type)
    AND (filter_item_types IS NULL OR e.metadata->>'item_type' = ANY(filter_item_types))
    AND (filter_document_ids IS NULL OR e.document_id = ANY(filter_document_ids))
    AND e.approved_at IS NOT NULL
    AND e.revoked_at IS NULL
    AND (1 - (e.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END
$$;

GRANT EXECUTE ON FUNCTION public.match_embeddings(
  vector(1536), int, uuid[], text, float, text[], text[]
) TO authenticated, service_role;

-- =====================================================
-- DATA RETENTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.prune_logs(
  p_account_id uuid
)
RETURNS TABLE (deleted_count bigint)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_retention_days int;
  v_cutoff timestamptz;
  v_count bigint;
BEGIN
  SELECT COALESCE(a.logs_retention_days, 30) INTO v_retention_days
  FROM public.accounts a
  WHERE a.id = p_account_id;

  v_cutoff := now() - (v_retention_days || ' days')::interval;

  DELETE FROM public.logs l
  WHERE l.account_id = p_account_id
    AND l.started_at < v_cutoff;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END
$$;

CREATE OR REPLACE FUNCTION public.prune_observability(
  p_account_id uuid
)
RETURNS TABLE (deleted_count bigint)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_retention_days int;
  v_cutoff timestamptz;
  v_count bigint;
BEGIN
  SELECT COALESCE(a.observability_retention_days, 90) INTO v_retention_days
  FROM public.accounts a
  WHERE a.id = p_account_id;

  v_cutoff := now() - (v_retention_days || ' days')::interval;

  DELETE FROM public.observability o
  WHERE o.account_id = p_account_id
    AND o.created_at < v_cutoff;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END
$$;

GRANT EXECUTE ON FUNCTION public.prune_logs(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.prune_logs(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.prune_observability(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.prune_observability(uuid) TO service_role;
-- CIL[DOC-VECTOR type="context" content="purpose='Consolidated observability, trace context, and knowledge search SQL migration'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/005_core_observability.sql:core_observability:file"]
