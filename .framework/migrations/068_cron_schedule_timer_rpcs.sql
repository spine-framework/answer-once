-- Migration 068: bootstrap the RPCs system-cron expects
--
-- system-cron calls nine Postgres functions that were documented as
-- "bootstrapped by framework migrations" but never created — every tick
-- hard-failed on get_due_schedules with
--   "Could not find the function public.get_due_schedules(p_now) in the
--    schema cache"
-- This migration creates the missing RPCs against the existing
-- schedules / timers / schedule_executions / pipeline_executions / logs
-- tables.
--
-- Honest limits (the tables are half-designed — schedules has no
-- config/delegated_scopes columns and there is no cron-expression
-- evaluator in the DB):
--   * get_due_schedules returns delegated_scopes=NULL and config='{}'
--     (the cron handler already tolerates both).
--   * update_schedule_after_run reschedules only the every-N-minutes
--     cron form ('*/N * * * *'); anything else gets next_run_at=NULL so
--     a schedule can never re-fire every tick forever.
--   * update_timer_after_run reschedules when
--     config->>'interval_minutes' is a positive number, else NULL.

-- CIL[BEGIN stable_id="~/.framework/migrations/068_cron_schedule_timer_rpcs.sql:module:migration" type="migration" identity="cron-schedule-timer-rpcs" parent="~/.framework/migrations/068_cron_schedule_timer_rpcs.sql"]
-- CIL[DOC-MACRO purpose="Create the nine Postgres RPCs system-cron invokes for schedules, timers, threshold metrics and log cleanup"]
-- CIL[DOC-RESPONSIBILITY responsibility="Provide get_due_schedules, validate_schedule_creator, update_schedule_after_run, get_due_timers, update_timer_after_run, get_error_rate, get_latency_percentiles, get_pipeline_stats, cleanup_old_logs"]
-- CIL[DOC-CONTEXT module="system-cron" layer="schema" related_files=".framework/functions/system-cron.ts"]
-- CIL[DOC-CONTRACT inputs="timestamptz/uuid/bool/int params per function" outputs="setof rows or scalars matching the shapes system-cron reads" errors="none — SECURITY DEFINER, stable where read-only" side_effects="update_schedule_after_run/update_timer_after_run mutate schedule/timer rows; cleanup_old_logs deletes old logs"]
-- CIL[DOC-MICRO logic_summary="Simple SELECT/UPDATE/DELETE implementations; cron reschedule limited to '*/N * * * *', timers honor config->>'interval_minutes', everything else next_*=NULL to prevent infinite re-fire" notable_decisions="No speculative cron parser — a NULL next_run_at is a safe one-shot stop until the feature gets a real scheduler model"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[DOC-AUDIENCE audience="system-admin"]
-- CIL[END stable_id="~/.framework/migrations/068_cron_schedule_timer_rpcs.sql:module:migration"]

-- ── schedules ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_due_schedules(p_now timestamptz)
RETURNS TABLE (
  schedule_id uuid,
  action_id uuid,
  account_id uuid,
  machine_principal_id uuid,
  delegated_scopes jsonb,
  config jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.action_id,
    s.account_id,
    s.machine_principal_id,
    NULL::jsonb,
    '{}'::jsonb
  FROM public.schedules s
  WHERE s.is_active
    AND s.next_run_at IS NOT NULL
    AND s.next_run_at <= p_now
$$;

CREATE OR REPLACE FUNCTION public.validate_schedule_creator(p_schedule_id uuid)
RETURNS TABLE (is_valid boolean, error_message text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.schedules s
      WHERE s.id = p_schedule_id AND s.is_active
    ),
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM public.schedules s WHERE s.id = p_schedule_id)
        THEN 'schedule not found'
      WHEN NOT EXISTS (SELECT 1 FROM public.schedules s WHERE s.id = p_schedule_id AND s.is_active)
        THEN 'schedule is not active'
      ELSE NULL
    END
$$;

CREATE OR REPLACE FUNCTION public.update_schedule_after_run(
  p_schedule_id uuid,
  p_success boolean,
  p_error_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cron text;
  v_minutes integer;
BEGIN
  SELECT cron_expression INTO v_cron FROM public.schedules WHERE id = p_schedule_id;

  -- Only the every-N-minutes form is reschedulable here; a full cron
  -- evaluator does not exist in the DB. Anything else becomes a
  -- one-shot (NULL next_run_at) rather than re-firing every tick.
  v_minutes := NULL;
  IF v_cron ~ '^\*/(\d+) \* \* \* \*$' THEN
    v_minutes := substring(v_cron FROM '^\*/(\d+)')::integer;
  END IF;

  UPDATE public.schedules
  SET
    last_run_at = now(),
    next_run_at = CASE
      WHEN v_minutes IS NOT NULL THEN now() + make_interval(mins => v_minutes)
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = p_schedule_id;
END;
$$;

-- ── timers ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_due_timers(p_now timestamptz)
RETURNS TABLE (
  timer_id uuid,
  pipeline_id uuid,
  account_id uuid,
  app_id uuid,
  name text,
  execution_count integer,
  created_by uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.pipeline_id,
    t.account_id,
    t.app_id,
    t.name,
    COALESCE(t.execution_count, 0),
    t.created_by
  FROM public.timers t
  WHERE t.is_active
    AND t.pipeline_id IS NOT NULL
    AND t.next_execution IS NOT NULL
    AND t.next_execution <= p_now
$$;

CREATE OR REPLACE FUNCTION public.update_timer_after_run(
  p_timer_id uuid,
  p_success boolean,
  p_error_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_interval numeric;
BEGIN
  SELECT CASE
    WHEN config->>'interval_minutes' ~ '^\d+(\.\d+)?$'
      THEN (config->>'interval_minutes')::numeric
    ELSE NULL
  END INTO v_interval
  FROM public.timers WHERE id = p_timer_id;

  UPDATE public.timers
  SET
    last_execution = now(),
    execution_count = COALESCE(execution_count, 0) + 1,
    success_count = COALESCE(success_count, 0) + CASE WHEN p_success THEN 1 ELSE 0 END,
    failure_count = COALESCE(failure_count, 0) + CASE WHEN p_success THEN 0 ELSE 1 END,
    next_execution = CASE
      WHEN v_interval IS NOT NULL AND v_interval > 0
        THEN now() + make_interval(mins => v_interval::double precision)
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = p_timer_id;
END;
$$;

-- ── threshold metrics ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_error_rate(p_window_minutes integer)
RETURNS TABLE (error_rate numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN count(*) = 0 THEN 0
    ELSE round(count(*) FILTER (WHERE outcome = 'failure' OR level = 'error')::numeric * 100 / count(*), 2)
  END
  FROM public.logs
  WHERE created_at >= now() - make_interval(mins => p_window_minutes)
$$;

CREATE OR REPLACE FUNCTION public.get_latency_percentiles(p_window_minutes integer)
RETURNS TABLE (p50 numeric, p95 numeric, p99 numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    percentile_cont(0.50) WITHIN GROUP (ORDER BY duration_ms)::numeric,
    percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms)::numeric,
    percentile_cont(0.99) WITHIN GROUP (ORDER BY duration_ms)::numeric
  FROM public.logs
  WHERE created_at >= now() - make_interval(mins => p_window_minutes)
    AND duration_ms IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.get_pipeline_stats(p_window_minutes integer)
RETURNS TABLE (total_success bigint, total_failure bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*) FILTER (WHERE status = 'completed'),
    count(*) FILTER (WHERE status = 'failed')
  FROM public.pipeline_executions
  WHERE created_at >= now() - make_interval(mins => p_window_minutes)
$$;

-- ── log retention ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.cleanup_old_logs(p_retention_days integer DEFAULT 90)
RETURNS TABLE (deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.logs
    WHERE created_at < now() - make_interval(days => p_retention_days)
    RETURNING 1
  )
  SELECT count(*) FROM deleted;
END;
$$;
