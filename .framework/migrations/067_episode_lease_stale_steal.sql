-- Migration 067: stale-gated detached-driver steal
--
-- 066 let a request-bound driver steal any live 'detached:' lease
-- unconditionally. That guaranteed a mid-turn displacement on every
-- guided run (triage kick claims first, the client's episode POST steals
-- seconds later), fencing a healthy driver and leaving research_state
-- mid-flight — the residual duplicate-narration class. Steal is a
-- recovery path for STALLED background work, so it now requires the
-- holder's heartbeat (updated_at, renewed by heartbeat_episode_lease)
-- to be older than p_stale_seconds. Healthy detached drivers are
-- refused 'held' like any other live driver.

-- CIL[BEGIN stable_id="~/.framework/migrations/067_episode_lease_stale_steal.sql:module:migration" type="migration" identity="episode-lease-stale-steal" parent="~/.framework/migrations/067_episode_lease_stale_steal.sql"]
-- CIL[DOC-MACRO purpose="Gate p_steal_detached on the holder's heartbeat age so request drivers only displace stalled background work"]
-- CIL[DOC-RESPONSIBILITY responsibility="Redefine acquire_episode_lease with a p_stale_seconds parameter; detach-prefix holders are stealable only when updated_at exceeds the staleness window"]
-- CIL[DOC-CONTEXT module="episode-concurrency" layer="schema" related_files=".framework/functions/_shared/agent-runner.ts,.framework/functions/ai-agents.ts"]
-- CIL[DOC-CONTRACT inputs="p_thread_id uuid, p_account_id uuid, p_driver_id text, p_ttl_seconds int default 90, p_steal_detached bool default false, p_stale_seconds int default 30" outputs="jsonb verdict {outcome: claimed|held, lease_token?, holder_driver_id?}" errors="none — fail-open verdict" side_effects="inserts or updates episode_leases"]
-- CIL[DOC-MICRO logic_summary="Identical to 066 except the steal branch additionally requires v_lease.updated_at to be older than p_stale_seconds; heartbeat renewals keep a healthy detached driver unstealable" notable_decisions="30s default bounds takeover latency well under the 90s TTL while tolerating slow single turns between heartbeats"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.92" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[DOC-AUDIENCE audience="system-admin"]
-- CIL[DOC-VECTOR type="context" content="Third lease RPC revision: 063 atomic claim, 066 detached steal, 067 stale-gated steal" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/067_episode_lease_stale_steal.sql:module:migration"]

DROP FUNCTION IF EXISTS public.acquire_episode_lease(uuid, uuid, text, integer, boolean);

CREATE FUNCTION public.acquire_episode_lease(
  p_thread_id uuid,
  p_account_id uuid,
  p_driver_id text,
  p_ttl_seconds integer DEFAULT 90,
  p_steal_detached boolean DEFAULT false,
  p_stale_seconds integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lease        public.episode_leases%ROWTYPE;
  v_new_token    uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.episode_leases (thread_id, account_id, driver_id, lease_token, expires_at)
  VALUES (
    p_thread_id,
    p_account_id,
    p_driver_id,
    v_new_token,
    now() + make_interval(secs => p_ttl_seconds)
  )
  ON CONFLICT (thread_id) DO NOTHING;

  IF FOUND THEN
    RETURN jsonb_build_object('outcome', 'claimed', 'lease_token', v_new_token);
  END IF;

  SELECT * INTO v_lease
  FROM public.episode_leases
  WHERE thread_id = p_thread_id
  FOR UPDATE;

  -- Held: a different live driver owns the episode. Steal is allowed
  -- only for a 'detached:'-prefixed holder whose heartbeat has gone
  -- stale — a healthy background driver is refused like anyone else so
  -- request claims stop displacing mid-turn work.
  IF v_lease.driver_id <> p_driver_id
     AND v_lease.expires_at > now()
     AND NOT (p_steal_detached
              AND v_lease.driver_id LIKE 'detached:%'
              AND v_lease.updated_at < now() - make_interval(secs => p_stale_seconds)) THEN
    RETURN jsonb_build_object(
      'outcome', 'held',
      'holder_driver_id', v_lease.driver_id
    );
  END IF;

  UPDATE public.episode_leases SET
    driver_id   = p_driver_id,
    lease_token = v_new_token,
    account_id  = p_account_id,
    expires_at  = now() + make_interval(secs => p_ttl_seconds),
    updated_at  = now()
  WHERE thread_id = p_thread_id;

  RETURN jsonb_build_object('outcome', 'claimed', 'lease_token', v_new_token);
END;
$$;

REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer, boolean, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer, boolean, integer) FROM anon;
REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer, boolean, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer, boolean, integer) TO service_role;
