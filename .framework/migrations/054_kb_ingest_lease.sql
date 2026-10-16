-- CIL[BEGIN stable_id="~/.framework/migrations/054_kb_ingest_lease.sql:kb_ingest_lease:file" type="file" identity="kb_ingest_lease" parent="~/.framework/migrations/054_kb_ingest_lease.sql"]
-- CIL[DOC-MACRO purpose="Content-hash document lease for kbIngest: document_leases table, atomic service-role-only acquire/release RPCs, and kb_ingest/kb_revoke pipeline action seeds."]
-- CIL[DOC-RESPONSIBILITY responsibility="Create public.document_leases (one row per embedded document), provide acquire_document_lease/release_document_lease as the single atomic writers, and seed the generic kb_ingest/kb_revoke pipeline action rows."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/_shared/kb.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/migrations/053_builtin_action_seeds.sql,.framework/migrations/049_security_blocklist.sql"]
-- CIL[DOC-CONTRACT inputs="acquire: p_document_id/p_account_id/p_content_hash/p_ttl_seconds; release: p_document_id/p_lease_id/p_status" outputs="acquire jsonb {outcome: acquired|reused|processing, lease_id?}; release boolean" errors="none — all branches return" side_effects="Upserts/updates document_leases; kbIngest callers use the lease to skip unchanged re-embeds and fence concurrent workers"]
-- CIL[DOC-MICRO logic_summary="acquire_document_lease INSERTs ON CONFLICT DO NOTHING; on conflict it SELECTs FOR UPDATE and returns 'reused' for a completed same-hash row, 'processing' for a live same-hash in-flight row, and takes over (new lease_id, new hash, fresh TTL) for expired/failed/different-hash rows. release_document_lease updates only on (document_id, lease_id) match so a superseded worker's release is fenced by the token." notable_decisions="Same-hash completed work is reused without extending the lease; a new content_hash supersedes an in-flight worker whose later release then fails the token check; RLS grants service_role FOR ALL and EXECUTE goes to service_role only, matching 049/052's service-only convention"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- ── document_leases ────────────────────────────────────────────────
-- One row per embedded document (items.id). kbIngest acquires before
-- embedding: 'reused' skips unchanged content, 'processing' fences a
-- second worker, 'acquired' grants a lease_id token the holder must
-- present to release.
CREATE TABLE IF NOT EXISTS public.document_leases (
  document_id  uuid        PRIMARY KEY,
  account_id   uuid        NOT NULL,
  content_hash text        NOT NULL,
  lease_id     uuid        NOT NULL,
  status       text        NOT NULL DEFAULT 'processing',
  expires_at   timestamptz NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.document_leases ENABLE ROW LEVEL SECURITY;

-- Service-role only: all reads/writes flow through _shared/kb.ts
-- (adminDb) and the two RPCs below.
DROP POLICY IF EXISTS document_leases_service_role ON public.document_leases;
CREATE POLICY document_leases_service_role ON public.document_leases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── acquire_document_lease ─────────────────────────────────────────
-- Atomic claim. Returns {outcome, lease_id?}:
--   acquired   — caller owns the work; must release with the token
--   reused     — same-hash completed embeddings exist; skip re-embed
--   processing — a live worker holds the same hash; do not stamp success
CREATE OR REPLACE FUNCTION public.acquire_document_lease(
  p_document_id uuid,
  p_account_id uuid,
  p_content_hash text,
  p_ttl_seconds integer DEFAULT 300
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lease        public.document_leases%ROWTYPE;
  v_new_lease_id uuid := gen_random_uuid();
BEGIN
  -- Fast path: claim the empty slot. The document_id PK serializes
  -- concurrent first-writers — the loser's INSERT is a no-op.
  INSERT INTO public.document_leases (document_id, account_id, content_hash, lease_id, status, expires_at)
  VALUES (
    p_document_id,
    p_account_id,
    p_content_hash,
    v_new_lease_id,
    'processing',
    now() + make_interval(secs => p_ttl_seconds)
  )
  ON CONFLICT (document_id) DO NOTHING;

  IF FOUND THEN
    RETURN jsonb_build_object('outcome', 'acquired', 'lease_id', v_new_lease_id);
  END IF;

  -- Conflict path: lock the row so a concurrent release/takeover cannot
  -- interleave between our read and our verdict.
  SELECT * INTO v_lease
  FROM public.document_leases
  WHERE document_id = p_document_id
  FOR UPDATE;

  -- Same-hash completed work is reused — do NOT extend the lease.
  IF v_lease.status = 'completed' AND v_lease.content_hash = p_content_hash THEN
    RETURN jsonb_build_object('outcome', 'reused');
  END IF;

  -- A live worker owns the same hash — the caller must not stamp success.
  IF v_lease.status = 'processing'
     AND v_lease.expires_at > now()
     AND v_lease.content_hash = p_content_hash THEN
    RETURN jsonb_build_object('outcome', 'processing', 'lease_id', null);
  END IF;

  -- Expired, failed, or a different content hash: take over. A new hash
  -- supersedes — the displaced worker's release will fail the token check.
  UPDATE public.document_leases SET
    lease_id     = v_new_lease_id,
    status       = 'processing',
    content_hash = p_content_hash,
    account_id   = p_account_id,
    expires_at   = now() + make_interval(secs => p_ttl_seconds),
    updated_at   = now()
  WHERE document_id = p_document_id;

  RETURN jsonb_build_object('outcome', 'acquired', 'lease_id', v_new_lease_id);
END;
$$;

REVOKE ALL ON FUNCTION public.acquire_document_lease(uuid, uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.acquire_document_lease(uuid, uuid, text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.acquire_document_lease(uuid, uuid, text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_document_lease(uuid, uuid, text, integer) TO service_role;

-- ── release_document_lease ─────────────────────────────────────────
-- Token-gated completion. Returns false when the lease_id no longer
-- matches (a superseding acquire took over) — the caller must treat
-- that as "do not stamp success", not as an error.
CREATE OR REPLACE FUNCTION public.release_document_lease(
  p_document_id uuid,
  p_lease_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.document_leases SET
    status     = p_status,
    expires_at = now(),
    updated_at = now()
  WHERE document_id = p_document_id
    AND lease_id = p_lease_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.release_document_lease(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_document_lease(uuid, uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.release_document_lease(uuid, uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.release_document_lease(uuid, uuid, text) TO service_role;

-- ── kb_ingest / kb_revoke action seeds ─────────────────────────────
-- Generic typed-path stages (wrap _shared/kb.ts kbIngest/kbRevoke) —
-- same WHERE-NOT-EXISTS idempotency as 053's built-in seeds.
INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'kb_ingest', 'KB Ingest', 'Core pipeline stage: ingest a runtime item into the knowledge base via the canonical typed path (content-hash lease + declared vector fields).', 'kb_ingest', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'kb_ingest');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'kb_revoke', 'KB Revoke', 'Core pipeline stage: revoke a runtime item from the knowledge base via the canonical typed path (embeddings + document lease).', 'kb_revoke', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'kb_revoke');
-- CIL[DOC-VECTOR type="context" content="purpose='Content-hash document lease for kbIngest plus generic kb_ingest/kb_revoke action seeds.'; No verified external callers; imports: none" status="ready"]
-- CIL[DOC-VECTOR type="blast_radius" content="kbIngest skips unchanged re-embeds and fences concurrent workers; pipelines gain generic kb_ingest/kb_revoke stages on fresh installs" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Runs after 018 (actions) and 020 (embeddings); consumed by _shared/kb.ts via adminDb.rpc" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="document_leases and both RPCs are service-role only; release is fenced by lease_id token; same-hash completed rows return reused without TTL extension" status="ready"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/054_kb_ingest_lease.sql:kb_ingest_lease:file"]
