-- CIL[BEGIN stable_id="~/.framework/migrations/035_rate_limits.sql:rate_limits:file" type="file" identity="rate_limits" parent="~/.framework/migrations/035_rate_limits.sql"]
-- CIL[DOC-MACRO purpose="DB-backed fixed-window rate limiting primitives"]
-- CIL[DOC-RESPONSIBILITY responsibility="Provide a rate_limits counter table and an atomic rate_limit_hit RPC used by _shared/rate-limit.ts"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/functions/_shared/rate-limit.ts"]
-- CIL[DOC-CONTRACT inputs="none" outputs="public.rate_limits table, public.rate_limit_hit function" errors="none" side_effects="Creates table, index, grants"]
-- CIL[DOC-MICRO logic_summary="Create rate_limits(key, window_start, count) with composite PK; rate_limit_hit upserts and increments the counter atomically inside one statement" notable_decisions="Atomic increment via INSERT ON CONFLICT so concurrent serverless invocations cannot double-spend a window"]
-- CIL[DOC-STABILITY stability="stable"]

-- Rate-limit counters are infrastructure state, not domain records — a plain
-- table, service-role only. Never readable by tenant principals.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          text        NOT NULL,
  window_start timestamptz NOT NULL,
  count        integer     NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (key, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies: tenant principals get no access. All access is via the
-- SECURITY DEFINER function below or the service role.

-- Atomic hit: inserts or increments the counter for (key, window_start) and
-- returns the new count. One round-trip, safe under concurrency.
CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key text, p_window_start timestamptz)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1,
                updated_at = now()
  RETURNING count INTO v_count;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rate_limit_hit(text, timestamptz) FROM anon;
REVOKE ALL ON FUNCTION public.rate_limit_hit(text, timestamptz) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(text, timestamptz) TO service_role;
-- CIL[DOC-VECTOR type="context" content="purpose='DB-backed fixed-window rate limiting primitives'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Table is RLS-enabled with no tenant policies; only the SECURITY DEFINER RPC or service role may touch it"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/035_rate_limits.sql:rate_limits:file"]
