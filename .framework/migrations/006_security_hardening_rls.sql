-- CIL[BEGIN stable_id="~/.framework/migrations/006_security_hardening_rls.sql:security_hardening_rls:file" type="file" identity="security_hardening_rls" parent="~/.framework/migrations/006_security_hardening_rls.sql"]
-- CIL[DOC-MACRO purpose="Apply migration 006 to close RLS bypasses for unauthenticated PostgREST requests and replace over-permissive types/watchers policies."]
-- CIL[DOC-RESPONSIBILITY responsibility="Update Row Level Security policies on integrations, api_keys, api_key_usage_logs, webhook_handlers, webhook_deliveries, items, types, and watchers to require authenticated or service-role access."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/006_security_hardening_rls.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="Recreated RLS policies for integrations, api_keys, api_key_usage_logs, webhook_handlers, webhook_deliveries, items, types, and watchers" errors="SQL errors if referenced helper functions or tables are missing" side_effects="Drops and recreates RLS policies on public tables, affecting PostgREST access control."]
-- CIL[DOC-MICRO logic_summary="Removes OR auth.uid() IS NULL / OR public.current_actor_id() IS NULL / OR true clauses from existing policies, then creates account-scoped policies using public.get_accessible_accounts and public.person_is_system_admin; types is split into a public read policy and admin-only write policies, while watchers is scoped to accessible accounts." notable_decisions="types: split SELECT for everyone from INSERT/UPDATE/DELETE for system-admins; watchers: remove always-true OR clause and scope to accessible accounts"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Security hardening: close RLS bypasses that allowed unauthenticated
-- (no-JWT / anon-key-only) requests to read and write sensitive tables
-- directly via PostgREST, and remove `OR true` policies that made
-- `types`/`watchers` writable by anyone.
--
-- Context: service_role (adminDb) already has explicit, dedicated
-- `*_service_role` bypass policies (see 004_core_rpc_and_broker.sql), so
-- none of the clauses removed here were needed for legitimate backend
-- access. They only ever widened access for requests made with the
-- public anon key and no Supabase Auth JWT (auth.uid() IS NULL /
-- public.current_actor_id() IS NULL), which is exactly the case for an
-- unauthenticated browser calling PostgREST directly.

-- ============================================
-- integrations / api_keys / api_key_usage_logs / webhook_handlers /
-- webhook_deliveries: remove the "OR auth.uid() IS NULL" bypass
-- introduced in 004_core_rpc_and_broker.sql.
-- ============================================

DROP POLICY IF EXISTS integrations_access ON public.integrations;
CREATE POLICY integrations_access ON public.integrations FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid())));

DROP POLICY IF EXISTS api_keys_access ON public.api_keys;
CREATE POLICY api_keys_access ON public.api_keys FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid())));

DROP POLICY IF EXISTS akul_access ON public.api_key_usage_logs;
CREATE POLICY akul_access ON public.api_key_usage_logs FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid())));

DROP POLICY IF EXISTS webhook_handlers_access ON public.webhook_handlers;
CREATE POLICY webhook_handlers_access ON public.webhook_handlers FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid())));

DROP POLICY IF EXISTS webhook_deliveries_access ON public.webhook_deliveries;
CREATE POLICY webhook_deliveries_access ON public.webhook_deliveries FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid())));

-- ============================================
-- items: remove the "OR public.current_actor_id() IS NULL" bypass
-- introduced in 005_core_observability.sql. Keep the platform-scope
-- clause for authenticated users.
-- ============================================

DROP POLICY IF EXISTS items_access ON public.items;
CREATE POLICY items_access ON public.items FOR ALL
  USING (
    account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))
    OR (design_schema->>'scope' = 'platform' AND public.current_actor_id() IS NOT NULL)
  );

-- ============================================
-- types: was `USING (public.current_actor_id() IS NOT NULL OR true)`,
-- i.e. always true regardless of the left-hand side, so ANY caller
-- (including unauthenticated anon-key requests) could INSERT/UPDATE/
-- DELETE type/design-schema definitions directly, bypassing the
-- system-admin check that `types.ts` enforces at the application layer.
-- Split into a public read policy (matches existing `roles_read`
-- pattern; type/schema metadata is not sensitive) and a system-admin
-- write policy.
-- ============================================

DROP POLICY IF EXISTS types_access ON public.types;

CREATE POLICY types_read ON public.types FOR SELECT USING (true);

CREATE POLICY types_insert ON public.types FOR INSERT
  WITH CHECK (public.person_is_system_admin(public.current_actor_id()));

CREATE POLICY types_update ON public.types FOR UPDATE
  USING (public.person_is_system_admin(public.current_actor_id()));

CREATE POLICY types_delete ON public.types FOR DELETE
  USING (public.person_is_system_admin(public.current_actor_id()));

-- Service role (adminDb) always bypasses RLS regardless of policy, but
-- keep an explicit policy for parity with other tables and future-proofing
-- against BYPASSRLS being revoked from service_role.
DROP POLICY IF EXISTS types_service_role ON public.types;
CREATE POLICY types_service_role ON public.types FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- watchers: was `USING (auth.uid() IS NOT NULL OR true)`, same always-true
-- bug as types. Scope to the caller's accessible accounts like other
-- account-scoped runtime tables.
-- ============================================

DROP POLICY IF EXISTS watchers_access ON public.watchers;
CREATE POLICY watchers_access ON public.watchers FOR ALL
  USING (
    account_id IS NULL
    OR account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
  );

DROP POLICY IF EXISTS watchers_service_role ON public.watchers;
CREATE POLICY watchers_service_role ON public.watchers FOR ALL TO service_role USING (true) WITH CHECK (true);
-- CIL[DOC-VECTOR type="context" content="purpose='Apply migration 006 to close RLS bypasses for unauthenticated PostgREST requests and replace over-permissive types/watchers policies.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/006_security_hardening_rls.sql:security_hardening_rls:file"]
