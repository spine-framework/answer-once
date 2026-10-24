-- CIL[BEGIN stable_id="~/.framework/migrations/064_episode_leases.sql:episode_leases:file" type="file" identity="episode_leases" parent="~/.framework/migrations/064_episode_leases.sql"]
-- CIL[DOC-MACRO purpose="Atomic single-flight lease for agent episodes: episode_leases table plus service-role-only acquire/heartbeat/release RPCs. Replaces the check-then-write driver_id claim in agent-runner so concurrent kicks can never both drive a thread. Also adds record_trigger_fire, the atomic trigger bookkeeping RPC that replaces trigger-engine's rpc-Promise-in-UPDATE bug."]
-- CIL[DOC-RESPONSIBILITY responsibility="Create public.episode_leases (one row per in-flight episode keyed by thread_id), provide acquire_episode_lease/heartbeat_episode_lease/release_episode_lease as the single atomic writers, and fence writes by lease_token."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/_shared/agent-runner.ts,.framework/functions/ai-agents.ts,.framework/migrations/054_kb_ingest_lease.sql"]
-- CIL[DOC-CONTRACT inputs="acquire: p_thread_id/p_account_id/p_driver_id/p_ttl_seconds; heartbeat: p_thread_id/p_lease_token/p_ttl_seconds; release: p_thread_id/p_lease_token" outputs="acquire jsonb {outcome: claimed|held, lease_token?, holder_driver_id?}; heartbeat boolean; release boolean" errors="none — all branches return" side_effects="Upserts/updates/deletes episode_leases; agent-runner uses the lease to serialize drivers and fence takeover writes"]
-- CIL[DOC-MICRO logic_summary="acquire_episode_lease INSERTs ON CONFLICT DO NOTHING; on conflict it SELECTs FOR UPDATE and renews when the caller is the same driver or the lease expired (takeover, fresh token), else returns 'held' with the live holder's driver_id. heartbeat/release are token-gated — a displaced driver's heartbeat fails, which is what fences its pending writes." notable_decisions="Lease is keyed by thread (not episode) because a thread can only ever have one live episode; driver_id is text to carry client-generated session tokens; same-driver re-acquire renews so step-mode drivers persist across HTTP requests; RLS grants service_role FOR ALL and EXECUTE goes to service_role only, matching 049/052/054's service-only convention"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- ── episode_leases ─────────────────────────────────────────────────
-- One row per in-flight agent episode (threads.id). Entry paths
-- (ticket-creation kicks, episode-mode POSTs, step/complete POSTs)
-- acquire before running; the holder heartbeats per turn and releases
-- on terminal state. A live lease refuses competing drivers atomically —
-- this replaces the read-then-write research_state claim that allowed
-- two drivers to race within the same window.
CREATE TABLE IF NOT EXISTS public.episode_leases (
  thread_id    uuid        PRIMARY KEY,
  account_id   uuid        NOT NULL,
  driver_id    text        NOT NULL,
  lease_token  uuid        NOT NULL,
  expires_at   timestamptz NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.episode_leases ENABLE ROW LEVEL SECURITY;

-- Service-role only: all reads/writes flow through _shared/agent-runner.ts
-- (adminDb) and the three RPCs below.
DROP POLICY IF EXISTS episode_leases_service_role ON public.episode_leases;
CREATE POLICY episode_leases_service_role ON public.episode_leases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── acquire_episode_lease ──────────────────────────────────────────
-- Atomic claim. Returns {outcome, lease_token?, holder_driver_id?}:
--   claimed — caller owns the episode; must heartbeat/release with the token
--   held    — a live driver owns the thread; caller watches or retries later
-- The same driver re-acquiring renews (new token, fresh TTL) so a client
-- step loop can hold the lease across HTTP requests.
CREATE OR REPLACE FUNCTION public.acquire_episode_lease(
  p_thread_id uuid,
  p_account_id uuid,
  p_driver_id text,
  p_ttl_seconds integer DEFAULT 90
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
  -- Fast path: claim the empty slot. The thread_id PK serializes
  -- concurrent first-writers — the loser's INSERT is a no-op.
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

  -- Conflict path: lock the row so a concurrent release/takeover cannot
  -- interleave between our read and our verdict.
  SELECT * INTO v_lease
  FROM public.episode_leases
  WHERE thread_id = p_thread_id
  FOR UPDATE;

  -- A live different driver owns the episode — refuse, surfacing the
  -- holder so the caller can attribute the 'running' status.
  IF v_lease.driver_id <> p_driver_id AND v_lease.expires_at > now() THEN
    RETURN jsonb_build_object(
      'outcome', 'held',
      'holder_driver_id', v_lease.driver_id
    );
  END IF;

  -- Same driver (renew) or expired lease (takeover): fresh token + TTL.
  -- A displaced driver's later heartbeat/release fails the token check,
  -- which is what fences its pending writes.
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

REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer) TO service_role;

-- ── heartbeat_episode_lease ────────────────────────────────────────
-- Token-gated TTL extension. Returns false when the lease_token no
-- longer matches (an expired-lease takeover displaced this driver) —
-- the caller must treat that as a fence and stop writing, not as an
-- error to retry.
CREATE OR REPLACE FUNCTION public.heartbeat_episode_lease(
  p_thread_id uuid,
  p_lease_token uuid,
  p_ttl_seconds integer DEFAULT 90
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.episode_leases SET
    expires_at = now() + make_interval(secs => p_ttl_seconds),
    updated_at = now()
  WHERE thread_id = p_thread_id
    AND lease_token = p_lease_token;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.heartbeat_episode_lease(uuid, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.heartbeat_episode_lease(uuid, uuid, integer) FROM anon;
REVOKE ALL ON FUNCTION public.heartbeat_episode_lease(uuid, uuid, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat_episode_lease(uuid, uuid, integer) TO service_role;

-- ── release_episode_lease ──────────────────────────────────────────
-- Token-gated release on terminal state. Returns false when the token
-- no longer matches (a takeover superseded this driver) — warn-only,
-- never an error.
CREATE OR REPLACE FUNCTION public.release_episode_lease(
  p_thread_id uuid,
  p_lease_token uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.episode_leases
  WHERE thread_id = p_thread_id
    AND lease_token = p_lease_token;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.release_episode_lease(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_episode_lease(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.release_episode_lease(uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.release_episode_lease(uuid, uuid) TO service_role;

-- ── record_trigger_fire ────────────────────────────────────────────
-- Atomic trigger bookkeeping. trigger-engine previously passed an
-- adminDb.rpc() Promise as a column value inside an UPDATE payload —
-- the update failed silently, so trigger_count stayed 0 and
-- last_triggered stayed null on every fire.
CREATE OR REPLACE FUNCTION public.record_trigger_fire(
  p_trigger_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.triggers SET
    trigger_count  = COALESCE(trigger_count, 0) + 1,
    last_triggered = now()
  WHERE id = p_trigger_id;
$$;

REVOKE ALL ON FUNCTION public.record_trigger_fire(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_trigger_fire(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.record_trigger_fire(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_trigger_fire(uuid) TO service_role;

-- CIL[DOC-VECTOR type="context" content="purpose='Atomic single-flight lease for agent episodes keyed by thread_id, plus atomic record_trigger_fire bookkeeping.'; Callers: _shared/agent-runner.ts (kickAgentEpisode, runAgentStep heartbeat, runAgent release), functions/ai-agents.ts (run handler), _shared/trigger-engine.ts (record_trigger_fire); imports: none" status="ready"]
-- CIL[DOC-VECTOR type="blast_radius" content="Any agent episode entry path now serializes drivers atomically; callers that do not claim proceed unchanged when the RPCs are absent" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Runs after thread/message tables exist; consumed by _shared/agent-runner.ts via adminDb.rpc" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="episode_leases and all three RPCs are service-role only; heartbeat and release are fenced by lease_token; same-driver acquire renews; expired leases are taken over with a fresh token" status="ready"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/064_episode_leases.sql:episode_leases:file"]
