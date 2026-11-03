-- CIL[BEGIN stable_id="~/.framework/migrations/075_security_definer_grants.sql:security_definer_grants:file" type="file" identity="security_definer_grants" parent="~/.framework/migrations/075_security_definer_grants.sql"]
-- CIL[DOC-MACRO purpose="Lock down anon/authenticated-executable SECURITY DEFINER functions, pin get_accessible_accounts to the caller, and self-check that no privileged RPC stays exposed"]
-- CIL[DOC-RESPONSIBILITY responsibility="Revoke PUBLIC/anon/authenticated EXECUTE from server-only definer RPCs, drop dead search_similar_embeddings, pin get_accessible_accounts actor for PostgREST roles, set search_path where missing, and assert no definer function remains callable by non-service roles"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/044_match_embeddings_filtered_knn.sql,.framework/migrations/004_core_rpc_and_broker.sql,.framework/migrations/068_cron_schedule_timer_rpcs.sql,.framework/migrations/002_core_rls_and_functions.sql,.framework/functions/embeddings.ts,.framework/functions/apps.ts,.framework/functions/observability.ts"]
-- CIL[DOC-CONTRACT inputs="existing public functions from earlier migrations" outputs="revoked EXECUTE for PUBLIC/anon/authenticated on 16 server-only functions; get_accessible_accounts actor pinned for PostgREST roles; search_path set on definer functions missing it" errors="migration raises EXCEPTION if any non-allowlisted definer function remains anon/authenticated-executable" side_effects="direct PostgREST RPC calls with anon or user keys are denied; service_role access unchanged"]
-- CIL[DOC-MICRO logic_summary="Postgres grants EXECUTE to PUBLIC by default, so every SECURITY DEFINER function shipped reachable at /rest/v1/rpc/* with the anon key. Existence-guarded revokes (to_regprocedure) make the file safe across drifted projects. get_accessible_accounts and current_actor_id cannot be revoked (every tenant RLS policy calls them as the querying role), so the leak is closed by pinning actor_id to current_actor_id() when auth.role() is anon/authenticated. A final DO block re-derives the exposure from pg_proc and fails the migration if any definer function outside the allowlist stays callable" notable_decisions="revoke-over-pin chosen for server-only RPCs because every legit caller already uses adminDb or a wrapper that enforces scoping; drop over revoke for search_similar_embeddings because it is dead code"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[DOC-LEARNING topic="security_definer_grants" content="Every SECURITY DEFINER function must revoke EXECUTE from PUBLIC/anon/authenticated in its defining migration (or be an allowlisted RLS helper) — PUBLIC EXECUTE is the Postgres default and Supabase exposes it via PostgREST. CREATE OR REPLACE preserves grants, so a revoke in any later migration stays effective across recreations"]
-- CIL[DOC-VECTOR type="context" content="purpose='Lock down privileged RPCs executable by the anon key'; callers: none — migration; related: embeddings.ts searchSimilar, apps.ts list, observability.ts cleanupOldLogs (all now use adminDb)"]
-- CIL[DOC-VECTOR type="blast_radius" content="Anon/authenticated direct RPC calls to 16 definer functions are denied; RLS policies unaffected; /api/apps and /api/embeddings?action=search-similar keep working via adminDb"]
-- CIL[DOC-VECTOR type="constraint" content="current_actor_id and get_accessible_accounts must keep anon/authenticated EXECUTE — RLS policies evaluate them as the querying role"]

-- ============================================================================
-- A) Revoke EXECUTE from PUBLIC/anon/authenticated on server-only definer RPCs.
--    Existence-guarded: the three live projects have drifted (e.g.
--    apply_demo_flag and search_similar_embeddings are not present everywhere,
--    and spine-dev still carries the archived-027 leftovers
--    approve_embeddings_for_item / sync_item_embeddings).
-- ============================================================================
DO $$
DECLARE
  v_sig text;
  revokes text[] := ARRAY[
    'match_embeddings(vector,integer,uuid[],text,double precision,text[],text[])',
    'rebuild_kb_cache(uuid,text)',
    'trg_rebuild_kb_article_list()',
    'handle_new_auth_user()',
    'apply_demo_flag()',
    'approve_embeddings_for_item(uuid)',
    'sync_item_embeddings()',
    'revoke_embeddings_for_item(uuid)',
    'validate_schedule_creator(uuid)',
    'get_due_schedules(timestamp with time zone)',
    'get_due_timers(timestamp with time zone)',
    'update_schedule_after_run(uuid,boolean,text)',
    'update_timer_after_run(uuid,boolean,text)',
    'get_error_rate(integer)',
    'get_latency_percentiles(integer)',
    'get_pipeline_stats(integer)',
    'cleanup_old_logs(integer)',
    'get_account_apps(uuid,boolean,boolean,text[],boolean)'
  ];
BEGIN
  FOREACH v_sig IN ARRAY revokes LOOP
    IF to_regprocedure('public.' || v_sig) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC', v_sig);
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM anon', v_sig);
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM authenticated', v_sig);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', v_sig);
    ELSE
      RAISE NOTICE 'skipping % — not present on this project', v_sig;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- B) Drop the dead RPC. Zero callers in the repo; it filtered by a
--    caller-supplied account id, i.e. an unauthenticated read of any tenant's
--    approved embeddings while it existed.
-- ============================================================================
DROP FUNCTION IF EXISTS public.search_similar_embeddings(uuid, text, vector, integer, double precision);

-- ============================================================================
-- C) Pin get_accessible_accounts to the caller for PostgREST roles.
--    The function cannot be revoked — tenant RLS policies evaluate it as the
--    querying role — but the caller-supplied actor_id let anyone enumerate
--    another person's account set (all accounts, for a system_admin target).
--    Policies already pass current_actor_id(); auth.ts passes the caller's own
--    person id; service callers (adminDb/cron) keep the argument honored.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_accessible_accounts(actor_id uuid)
RETURNS TABLE (account_id uuid) AS $$
BEGIN
  -- PostgREST roles may only inspect their own access set; the actor_id
  -- argument is honored only for service_role and internal/cron contexts.
  IF auth.role() IN ('anon', 'authenticated') THEN
    actor_id := public.current_actor_id();
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.people p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = actor_id AND r.slug = 'system_admin'
  ) THEN
    RETURN QUERY SELECT a.id FROM public.accounts a;
    RETURN;
  END IF;
  RETURN QUERY
  WITH RECURSIVE account_tree AS (
    SELECT p.account_id as id FROM public.people p WHERE p.id = actor_id
    UNION ALL
    SELECT ap.descendant_id
    FROM public.account_paths ap
    JOIN account_tree at ON ap.ancestor_id = at.id
  )
  SELECT id FROM account_tree;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- D) SET search_path on definer functions that were missing it. Mutable
--    search_path on a privileged function is a schema-shadowing risk.
--    (get_accessible_accounts picked it up in the CREATE OR REPLACE above;
--    021/034/044/068/071 functions already set it.)
-- ============================================================================
DO $$
DECLARE
  v_sig text;
  needs_path text[] := ARRAY[
    'current_actor_id()',
    'rebuild_kb_cache(uuid,text)',
    'trg_rebuild_kb_article_list()',
    'get_account_apps(uuid,boolean,boolean,text[],boolean)'
  ];
BEGIN
  FOREACH v_sig IN ARRAY needs_path LOOP
    IF to_regprocedure('public.' || v_sig) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION public.%s SET search_path = public', v_sig);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- E) Self-check: derive remaining exposure from pg_proc and fail loudly.
--    RLS helpers (evaluated as the querying role inside policies) are the only
--    sanctioned anon/authenticated-executable definer functions.
-- ============================================================================
DO $$
DECLARE
  bad record;
  exposed int := 0;
BEGIN
  FOR bad IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.oid::regprocedure::text NOT IN (
        'current_actor_id()',
        'get_accessible_accounts(uuid)'
      )
      AND (
        has_function_privilege('anon', p.oid, 'EXECUTE')
        OR has_function_privilege('authenticated', p.oid, 'EXECUTE')
      )
  LOOP
    exposed := exposed + 1;
    RAISE WARNING 'SECURITY DEFINER still executable by anon/authenticated: %', bad.sig;
  END LOOP;

  IF exposed > 0 THEN
    RAISE EXCEPTION '% definer function(s) still exposed to anon/authenticated — refusing to finish migration', exposed;
  END IF;
END $$;
-- CIL[END stable_id="~/.framework/migrations/075_security_definer_grants.sql:security_definer_grants:file"]
