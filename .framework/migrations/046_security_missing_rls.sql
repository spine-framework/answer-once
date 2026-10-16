-- CIL[BEGIN stable_id="~/.framework/migrations/046_security_missing_rls.sql:security_missing_rls:file" type="file" identity="security_missing_rls" parent="~/.framework/migrations/046_security_missing_rls.sql"]
-- CIL[DOC-MACRO purpose="Enable RLS on the nine tables that currently expose all rows to any PostgREST caller"]
-- CIL[DOC-RESPONSIBILITY responsibility="Enable row level security on account_paths, invites, alerts, observability, integration_routes, test_runs, test_cases, test_results, and _spine_migrations with policies matching each table's intended consumer"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/006_security_hardening_rls.sql,.framework/migrations/045_security_critical_rls.sql,.framework/migrations/035_rate_limits.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="RLS enabled + policies created" errors="SQL errors if referenced objects are missing" side_effects="Blocks direct PostgREST reads/writes previously allowed by missing RLS"]
-- CIL[DOC-MICRO logic_summary="account_paths is system-admin read (get_accessible_accounts SECURITY DEFINER still serves all lookups); invites/alerts/observability get account-scoped access on account_id; integration_routes/test_*/_spine_migrations are service_role-only infrastructure with no tenant use case" notable_decisions="all existing consumers use adminDb which bypasses RLS entirely — these policies only gate direct PostgREST access via the anon/user keys; service_role policies are declared explicitly for documentation even though service_role holds BYPASSRLS"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- account_paths: the tenant-hierarchy closure table. Reading it directly
-- reveals every parent/child relationship without going through
-- get_accessible_accounts(). That SECURITY DEFINER function continues to serve
-- all legitimate lookups; direct reads are system-admin only.
ALTER TABLE public.account_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_paths_read ON public.account_paths FOR SELECT
  USING (public.person_is_system_admin(public.current_actor_id()));

CREATE POLICY account_paths_service_role ON public.account_paths FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- invites: invitation metadata is scoped to the issuing account. Invite tokens
-- themselves live on people.data (validated server-side via adminDb), so
-- account-scoped access covers admin list/revoke without exposing tokens.
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY invites_access ON public.invites FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())))
  WITH CHECK (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

CREATE POLICY invites_service_role ON public.invites FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- alerts: account-scoped operational alerts.
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_access ON public.alerts FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())))
  WITH CHECK (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

CREATE POLICY alerts_service_role ON public.alerts FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- observability: account-scoped telemetry (agent runs, traces). Written only
-- via adminDb; account members can read their own telemetry.
ALTER TABLE public.observability ENABLE ROW LEVEL SECURITY;

CREATE POLICY observability_access ON public.observability FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())))
  WITH CHECK (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

CREATE POLICY observability_service_role ON public.observability FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- test_runs / test_cases / test_results / _spine_migrations:
-- internal infrastructure consumed exclusively by adminDb in system-cron.ts,
-- tests.ts, system.ts, and cli. No tenant-facing use case — service_role only
-- (matching the rate_limits precedent in 035). integration_routes is not
-- covered — 004 drops it as dead schema.
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY test_runs_service_role ON public.test_runs FOR ALL
  TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY test_cases_service_role ON public.test_cases FOR ALL
  TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY test_results_service_role ON public.test_results FOR ALL
  TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public._spine_migrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY spine_migrations_service_role ON public._spine_migrations FOR ALL
  TO service_role USING (true) WITH CHECK (true);
-- CIL[DOC-VECTOR type="context" content="purpose='Enable RLS on nine tables that were fully exposed to PostgREST.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Direct PostgREST access to account_paths/invites/alerts/observability/integration_routes/test_*/_spine_migrations is now gated; adminDb consumers unaffected (service_role bypasses RLS)" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Depends on public.current_actor_id, public.person_is_system_admin, public.get_accessible_accounts; requires account_id column on invites/alerts/observability" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="Any client that read these tables via anon/user keys must move to a function path or accept denial" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/046_security_missing_rls.sql:security_missing_rls:file"]
