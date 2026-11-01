CREATE OR REPLACE FUNCTION public.get_log_stats(
  p_account_id uuid,
  p_level text DEFAULT NULL::text,
  p_source text DEFAULT NULL::text,
  p_source_type text DEFAULT NULL::text,
  p_source_id text DEFAULT NULL::text,
  p_person_id text DEFAULT NULL::text,
  p_query text DEFAULT NULL::text,
  p_date_from timestamp with time zone DEFAULT NULL::timestamp with time zone,
  p_date_to timestamp with time zone DEFAULT NULL::timestamp with time zone
)
RETURNS TABLE(total bigint, error_count bigint, user_action_count bigint, event_type_count bigint, levels text[], sources text[], source_types text[])
LANGUAGE plpgsql
AS $function$
DECLARE
  v_from timestamptz := COALESCE(p_date_from, now() - interval '7 days');
  v_total bigint;
  v_error_count bigint;
  v_user_action_count bigint;
  v_event_type_count bigint;
  v_levels text[];
  v_sources text[];
  v_source_types text[];
BEGIN
  SELECT
    count(*),
    count(*) FILTER (WHERE level ILIKE '%error%'),
    count(*) FILTER (WHERE person_id IS NOT NULL),
    count(DISTINCT level)
  INTO v_total, v_error_count, v_user_action_count, v_event_type_count
  FROM public.logs
  WHERE account_id = p_account_id
    AND created_at >= v_from
    AND (p_level IS NULL OR level = p_level)
    AND (p_source IS NULL OR source = p_source)
    AND (p_source_type IS NULL OR source_type = p_source_type)
    AND (p_source_id IS NULL OR source_id = p_source_id::uuid)
    AND (p_person_id IS NULL OR person_id = p_person_id::uuid)
    AND (p_query IS NULL OR message ILIKE '%' || p_query || '%')
    AND (p_date_to IS NULL OR created_at <= p_date_to);

  SELECT
    coalesce(array_agg(DISTINCT level ORDER BY level) FILTER (WHERE level IS NOT NULL), ARRAY[]::text[]),
    coalesce(array_agg(DISTINCT source ORDER BY source) FILTER (WHERE source IS NOT NULL), ARRAY[]::text[]),
    coalesce(array_agg(DISTINCT source_type ORDER BY source_type) FILTER (WHERE source_type IS NOT NULL), ARRAY[]::text[])
  INTO v_levels, v_sources, v_source_types
  FROM public.logs
  WHERE account_id = p_account_id
    AND created_at >= v_from
    AND (p_date_to IS NULL OR created_at <= p_date_to);

  RETURN QUERY SELECT v_total, v_error_count, v_user_action_count, v_event_type_count, v_levels, v_sources, v_source_types;
END;
$function$;
