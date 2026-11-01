-- Migration 071: F-056 — make timers created via the API/admin UI fire.
--
-- Two halves of the fix:
--   1. timers.ts now writes next_execution server-side on
--      create/update/activate (068's get_due_timers gates on
--      next_execution IS NOT NULL and nothing else ever set it).
--   2. This file: update_timer_after_run previously rescheduled only
--      from config->>'interval_minutes', but TimerDetailPage seeded
--      config.interval_seconds — UI-created timers would fire once (if
--      armed) and never reschedule. The RPC now accepts both keys with
--      the same precedence the TS handler uses: interval_minutes
--      (minutes) first, then interval_seconds (seconds / 60).
--      Existing rows keep working under either key.
--
-- A backfill at the bottom arms existing active timers that have a
-- computable interval but next_execution IS NULL — rows created before
-- the API could write the column could never fire.

-- CIL[BEGIN stable_id="~/.framework/migrations/071_timer_interval_keys.sql:module:migration" type="migration" identity="timer-interval-keys" parent="~/.framework/migrations/071_timer_interval_keys.sql"]
-- CIL[DOC-MACRO purpose="Teach update_timer_after_run the interval_seconds config key and backfill next_execution for dormant armed-by-interval timers"]
-- CIL[DOC-RESPONSIBILITY responsibility="Replace update_timer_after_run with a dual-key interval resolver; arm existing active timers whose next_execution is NULL"]
-- CIL[DOC-CONTEXT module="system-cron" layer="schema" related_files=".framework/functions/system-cron.ts, .framework/functions/timers.ts, .framework/migrations/068_cron_schedule_timer_rpcs.sql"]
-- CIL[DOC-CONTRACT inputs="p_timer_id uuid, p_success boolean, p_error_message text" outputs="void" errors="none — SECURITY DEFINER" side_effects="mutates timers bookkeeping columns; backfill sets next_execution on dormant interval timers"]
-- CIL[DOC-MICRO logic_summary="Interval precedence: config->>'interval_minutes' (minutes) then config->>'interval_seconds' (seconds/60); non-positive or absent => next_execution NULL one-shot stop. Backfill UPDATE arms is_active + next_execution IS NULL + positive-interval rows to now()+interval" notable_decisions="Both keys kept forever so rows seeded with the old UI default (interval_seconds) and the canonical key (interval_minutes) both reschedule; 'once'/cron timers still dead-end to NULL since no cron evaluator exists in the DB"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[DOC-AUDIENCE audience="system-admin"]
-- CIL[END stable_id="~/.framework/migrations/071_timer_interval_keys.sql:module:migration"]

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
  v_config jsonb;
  v_interval numeric; -- resolved interval in MINUTES
BEGIN
  SELECT config INTO v_config FROM public.timers WHERE id = p_timer_id;

  -- interval_minutes (canonical) wins; interval_seconds is the legacy UI
  -- default and is converted seconds -> minutes.
  v_interval := CASE
    WHEN v_config->>'interval_minutes' ~ '^\d+(\.\d+)?$'
      THEN (v_config->>'interval_minutes')::numeric
    WHEN v_config->>'interval_seconds' ~ '^\d+(\.\d+)?$'
      THEN (v_config->>'interval_seconds')::numeric / 60
    ELSE NULL
  END;

  UPDATE public.timers
  SET
    last_execution = now(),
    execution_count = COALESCE(execution_count, 0) + 1,
    success_count = COALESCE(success_count, 0) + CASE WHEN p_success THEN 1 ELSE 0 END,
    failure_count = COALESCE(failure_count, 0) + CASE WHEN p_success THEN 0 ELSE 1 END,
    next_execution = CASE
      WHEN v_interval IS NOT NULL AND v_interval > 0
        THEN now() + (v_interval * interval '1 minute')
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = p_timer_id;
END;
$$;

-- Arm timers that are active and have a resolvable interval but were
-- created while next_execution was unwritable (pre-F-056 API). One-shot
-- and unparseable configs stay NULL — a NULL next_execution is a safe
-- never-fire state, matching update_timer_after_run's stop semantics.
UPDATE public.timers t
SET
  next_execution = now() + (v.mins * interval '1 minute'),
  updated_at = now()
FROM (
  SELECT
    id,
    CASE
      WHEN config->>'interval_minutes' ~ '^\d+(\.\d+)?$'
        THEN (config->>'interval_minutes')::numeric
      WHEN config->>'interval_seconds' ~ '^\d+(\.\d+)?$'
        THEN (config->>'interval_seconds')::numeric / 60
      ELSE NULL
    END AS mins
  FROM public.timers
) v
WHERE t.id = v.id
  AND t.is_active
  AND t.next_execution IS NULL
  AND v.mins IS NOT NULL
  AND v.mins > 0;
