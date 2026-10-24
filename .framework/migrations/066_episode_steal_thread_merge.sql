-- CIL[BEGIN stable_id="~/.framework/migrations/066_episode_steal_thread_merge.sql:episode_steal_thread_merge:file" type="file" identity="episode_steal_thread_merge" parent="~/.framework/migrations/066_episode_steal_thread_merge.sql"]
-- CIL[DOC-MACRO purpose="Episode-lease steal + fenced thread-data merge: request-bound drivers can immediately take over a thread whose lease is held by a 'detached:'-prefixed background driver, and threads.data writers get an atomic shallow-merge RPC with an optional lease-token fence so terminal research_state checkpoints cannot be clobbered by stale read-modify-write blobs."]
-- CIL[DOC-RESPONSIBILITY responsibility="Extend acquire_episode_lease with p_steal_detached so live 'detached:' lease holders yield instantly to request-bound drivers, and add merge_thread_data as the single atomic writer for threads.data patches."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/_shared/agent-runner.ts,.framework/functions/ai-agents.ts,.framework/migrations/064_episode_leases.sql"]
-- CIL[DOC-CONTRACT inputs="acquire: +p_steal_detached boolean; merge_thread_data: p_thread_id/p_patch/p_lease_token" outputs="acquire jsonb {outcome: claimed|held, lease_token?, holder_driver_id?}; merge_thread_data boolean" errors="none — all branches return" side_effects="Updates episode_leases / threads"]
-- CIL[DOC-MICRO logic_summary="acquire_episode_lease keeps the 064 fast-path INSERT plus FOR UPDATE conflict path; the 'held' verdict is skipped when p_steal_detached and the holder is 'detached:%' — detached background drivers exist to yield. merge_thread_data does data = coalesce(data,'{}'::jsonb) || p_patch with WHERE-fencing: when p_lease_token is provided the write only lands if no differently-tokened lease holds the thread, so a displaced driver's stale checkpoint is dropped." notable_decisions="Detached steal is safer than client-side driver_id adoption: the server decides who yields, and live (non-detached) holders are still never preempted — only TTL expiry displaces them; jsonb || is a shallow merge so siblings written concurrently (escalation_status, research_state) no longer clobber each other; the lease-token fence makes a loser's terminal write a silent no-op rather than a resurrected mid-episode state"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- ── acquire_episode_lease: detached-holder steal ────────────────────
-- 'detached:' drivers are spawned background work (ticket-creation
-- kicks, trigger-fired episodes) — they exist so an episode survives a
-- dead client, not to block one. On serverless platforms detached work
-- is CPU-throttled after the response flush (observed ~37s dead window
-- before its first persisted message), so a request-bound driver must
-- be able to take over immediately instead of watching a stalled
-- driver or waiting out the TTL. Live non-detached holders are never
-- preempted — only TTL expiry displaces them, exactly as in 064.
DROP FUNCTION IF EXISTS public.acquire_episode_lease(uuid, uuid, text, integer);
CREATE FUNCTION public.acquire_episode_lease(
  p_thread_id uuid,
  p_account_id uuid,
  p_driver_id text,
  p_ttl_seconds integer DEFAULT 90,
  p_steal_detached boolean DEFAULT false
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

  -- A live different driver owns the episode — refuse, unless the holder
  -- is a detached background driver and the caller asked to steal it.
  -- Detached drivers are a liveness fallback, not a real owner: a live
  -- request driver always wins over one. The detached driver's next
  -- heartbeat fails the token check and it aborts cleanly, so the steal
  -- never produces duplicate side effects.
  IF v_lease.driver_id <> p_driver_id
     AND v_lease.expires_at > now()
     AND NOT (p_steal_detached AND v_lease.driver_id LIKE 'detached:%') THEN
    RETURN jsonb_build_object(
      'outcome', 'held',
      'holder_driver_id', v_lease.driver_id
    );
  END IF;

  -- Same driver (renew), expired lease (takeover), or detached steal:
  -- fresh token + TTL. A displaced driver's later heartbeat/release
  -- fails the token check, which is what fences its pending writes.
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

REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer, boolean) FROM anon;
REVOKE ALL ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer, boolean) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_episode_lease(uuid, uuid, text, integer, boolean) TO service_role;

-- ── merge_thread_data ──────────────────────────────────────────────
-- Atomic shallow merge into threads.data. The previous pattern —
-- read threads.data, merge in memory, write the whole blob back —
-- loses any key written between the read and the write; during the
-- guided demo a concurrent threads.data write resurrected a stale
-- research_state over the terminal 'complete' checkpoint, leaving the
-- thread showing planning/turn 0 after the final answer landed.
-- jsonb || merges keys atomically so sibling writes never clobber.
--
-- Lease fence: when p_lease_token is provided, the write only lands
-- while no differently-tokened episode_lease holds the thread — a
-- displaced driver's stale checkpoint becomes a no-op instead of
-- resurrecting mid-episode state over the takeover owner's terminal
-- write. Pass NULL (or omit) for writers with no lease identity; the
-- merge is still atomic, just unfenced.
--
-- Returns true when the row was written, false when fenced or the
-- thread does not exist.
CREATE OR REPLACE FUNCTION public.merge_thread_data(
  p_thread_id uuid,
  p_patch jsonb,
  p_lease_token uuid DEFAULT null
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.threads t SET
    data       = coalesce(t.data, '{}'::jsonb) || p_patch,
    updated_at = now()
  WHERE t.id = p_thread_id
    AND (p_lease_token IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.episode_leases l
      WHERE l.thread_id = p_thread_id
        AND l.lease_token IS DISTINCT FROM p_lease_token
    ));

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.merge_thread_data(uuid, jsonb, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.merge_thread_data(uuid, jsonb, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.merge_thread_data(uuid, jsonb, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.merge_thread_data(uuid, jsonb, uuid) TO service_role;

-- CIL[DOC-VECTOR type="context" content="purpose='Detached-driver lease steal plus atomic fenced threads.data merge.'; Callers: _shared/agent-runner.ts (acquireEpisodeLease, mergeThreadData, setResearchState, handleEscalation, claimAgentEpisode/kickAgentEpisode), functions/ai-agents.ts (run handler); imports: none" status="ready"]
-- CIL[DOC-VECTOR type="blast_radius" content="Episode entry paths can preempt detached fallback drivers instantly; all threads.data writers through merge_thread_data gain atomicity and optional lease fencing" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Runs after 064_episode_leases.sql; consumed by _shared/agent-runner.ts via adminDb.rpc" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="service-role only; 'detached:%' driver_id prefix is a contract with kickAgentEpisode; merge_thread_data is a shallow merge — nested objects in p_patch replace wholesale" status="ready"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/066_episode_steal_thread_merge.sql:episode_steal_thread_merge:file"]
