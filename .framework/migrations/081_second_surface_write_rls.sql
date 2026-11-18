-- 081_second_surface_write_rls.sql
-- Tighten RLS writes on the second-surface config tables `timers` and
-- `triggers` to system_admin, matching the permission engine's documented
-- policy (concepts/permissions.md: "system_admin full access; everyone
-- else denied") and the API gates added in the same change.
--
-- Before: migration 042 created `timers_access`/`triggers_access` as
-- FOR ALL + account-scoped — any account *member* could insert, update,
-- and delete config rows through direct PostgREST (and the ungated API
-- handlers). The functions now deny non-admins up front; this migration
-- makes the database agree, so the PostgREST path matches the API path.
-- (Decision spine-framework:0026-config-write-enforcement, accepted.)
--
-- Pattern mirrors the 045 roles fix: split FOR ALL into an account-scoped
-- SELECT policy (members keep read — endpoint sanitization still shapes
-- what they see) plus a FOR ALL write policy gated on
-- person_is_system_admin(current_actor_id()). Permissive policies OR, so
-- admins read/write everything (incl. account_id NULL rows) while members
-- keep read-only access to their account's rows.
-- Idempotent — every statement is safe to re-run.

-- timers -----------------------------------------------------------------
DROP POLICY IF EXISTS timers_access ON public.timers;

CREATE POLICY timers_read ON public.timers FOR SELECT
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

CREATE POLICY timers_write ON public.timers FOR ALL
  USING (public.person_is_system_admin(public.current_actor_id()))
  WITH CHECK (public.person_is_system_admin(public.current_actor_id()));

-- triggers ---------------------------------------------------------------
DROP POLICY IF EXISTS triggers_access ON public.triggers;

CREATE POLICY triggers_read ON public.triggers FOR SELECT
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

CREATE POLICY triggers_write ON public.triggers FOR ALL
  USING (public.person_is_system_admin(public.current_actor_id()))
  WITH CHECK (public.person_is_system_admin(public.current_actor_id()));
