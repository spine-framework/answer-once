-- CIL[BEGIN stable_id="~/.framework/migrations/045_security_critical_rls.sql:security_critical_rls:file" type="file" identity="security_critical_rls" parent="~/.framework/migrations/045_security_critical_rls.sql"]
-- CIL[DOC-MACRO purpose="Close the remaining anonymous-access bypasses and the member self-write path on security-critical tables"]
-- CIL[DOC-RESPONSIBILITY responsibility="Drop OR current_actor_id() IS NULL from system_settings/accounts/roles, require authentication for system_settings reads, restrict all role writes to system admins, and split people_access so members can read themselves but cannot self-write role_id/account_id via PostgREST"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/006_security_hardening_rls.sql,.framework/migrations/043_policy_actor_cleanup.sql,.framework/migrations/042_registration_hierarchy.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="Recreated RLS policies" errors="SQL errors if referenced objects are missing" side_effects="Drops and recreates six RLS policies"]
-- CIL[DOC-MICRO logic_summary="system_settings gets system-admin write + authenticated read; accounts loses its anonymous read branch; roles_modify becomes system-admin-only for both system and non-system roles; people_access splits into people_read (accessible accounts OR self) and people_write (accessible accounts only — no self-write bypass)" notable_decisions="roles_modify no longer allows any authenticated user to write non-system roles — role metadata is a trust anchor; people write policy has no self branch because admin-data performs record writes via adminDb after field-level permission checks, so no legitimate flow needs direct PostgREST self-update"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- system_settings: anonymous write (OR current_actor_id() IS NULL) allowed any
-- anon-key PostgREST caller to INSERT/UPDATE/DELETE global config. The read
-- policy is also USING (true); settings are only consumed server-side via
-- adminDb (logging.ts), so reads now require an authenticated actor.
DROP POLICY IF EXISTS system_settings_modify ON public.system_settings;
CREATE POLICY system_settings_modify ON public.system_settings FOR ALL
  USING (public.person_is_system_admin(public.current_actor_id()))
  WITH CHECK (public.person_is_system_admin(public.current_actor_id()));

DROP POLICY IF EXISTS system_settings_read ON public.system_settings;
CREATE POLICY system_settings_read ON public.system_settings FOR SELECT
  USING (public.current_actor_id() IS NOT NULL);

-- accounts: anonymous read exposed the full customer list via the anon key.
-- All public/invite flows resolve records through adminDb (service role
-- bypasses RLS), so removing the bypass changes nothing legitimate.
DROP POLICY IF EXISTS accounts_access ON public.accounts;
CREATE POLICY accounts_access ON public.accounts FOR ALL
  USING (id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

-- roles: the previous policy let unauthenticated callers write everything and
-- let any authenticated user create or modify non-system roles. Role metadata
-- feeds the permission engine — all writes are now system-admin only.
-- roles_read (USING (true)) is untouched: slug lookup stays public.
DROP POLICY IF EXISTS roles_modify ON public.roles;
CREATE POLICY roles_modify ON public.roles FOR ALL
  USING (public.person_is_system_admin(public.current_actor_id()))
  WITH CHECK (public.person_is_system_admin(public.current_actor_id()));

-- people: the single FOR ALL policy's OR (id = current_actor_id()) branch let a
-- member PATCH their own role_id and account_id directly through PostgREST,
-- bypassing admin-data's field-level permission checks. Split the policy:
-- reads keep self-access, writes require the row to sit in an accessible
-- account. No production flow writes people through the user-scoped client —
-- admin-data reads via ctx.db but writes via adminDb.
DROP POLICY IF EXISTS people_access ON public.people;

CREATE POLICY people_read ON public.people FOR SELECT
  USING (
    account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))
    OR id = public.current_actor_id()
  );

CREATE POLICY people_insert ON public.people FOR INSERT
  WITH CHECK (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

CREATE POLICY people_update ON public.people FOR UPDATE
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())))
  WITH CHECK (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

CREATE POLICY people_delete ON public.people FOR DELETE
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

-- RLS is row-level only — it cannot stop a member from writing privileged
-- columns (role_id, account_id, is_active, schema stamps, identity anchors)
-- on their own row or a teammate's row inside the same accessible account.
-- This trigger supplies the missing column-level enforcement:
--   * service_role/adminDb writes have no actor → skipped
--   * system_admin → allowed
--   * self-update of privileged columns → denied
--   * privileged changes on other rows → admin-capable roles only
-- Profile fields (names, avatar, phone, status, data) remain self-editable.
CREATE OR REPLACE FUNCTION public.people_guard_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actor uuid := public.current_actor_id();
  privileged_changed boolean;
  actor_is_admin boolean;
BEGIN
  IF actor IS NULL THEN
    RETURN NEW;
  END IF;

  privileged_changed :=
       NEW.role_id           IS DISTINCT FROM OLD.role_id
    OR NEW.account_id        IS DISTINCT FROM OLD.account_id
    OR NEW.is_active         IS DISTINCT FROM OLD.is_active
    OR NEW.auth_uid          IS DISTINCT FROM OLD.auth_uid
    OR NEW.app_id            IS DISTINCT FROM OLD.app_id
    OR NEW.type_id           IS DISTINCT FROM OLD.type_id
    OR NEW.design_schema     IS DISTINCT FROM OLD.design_schema
    OR NEW.validation_schema IS DISTINCT FROM OLD.validation_schema
    OR NEW.created_by        IS DISTINCT FROM OLD.created_by;

  IF NOT privileged_changed THEN
    RETURN NEW;
  END IF;

  IF public.person_is_system_admin(actor) THEN
    RETURN NEW;
  END IF;

  IF NEW.id = actor THEN
    RAISE EXCEPTION 'Cannot modify privileged fields on your own record';
  END IF;

  -- Only system admins may assign system roles (system_admin, csm, ...) —
  -- otherwise a member_admin could mint a system admin by setting role_id.
  IF NEW.role_id IS DISTINCT FROM OLD.role_id
     AND EXISTS (SELECT 1 FROM public.roles r WHERE r.id = NEW.role_id AND r.is_system) THEN
    RAISE EXCEPTION 'Only system admins may assign system roles';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.people p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = actor
      AND r.slug IN ('support_admin', 'member_admin')
  ) INTO actor_is_admin;

  IF NOT actor_is_admin THEN
    RAISE EXCEPTION 'Insufficient role to modify privileged people fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS people_privileged_fields_guard ON public.people;
CREATE TRIGGER people_privileged_fields_guard
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.people_guard_privileged_fields();
-- CIL[DOC-VECTOR type="context" content="purpose='Close anonymous-access bypasses on system_settings/accounts/roles and the member self-write path on people.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Anonymous PostgREST access to system_settings/accounts/roles is revoked; non-system role writes restricted to system_admin; members can no longer PATCH their own people row directly — admin-data flows unaffected because writes go through adminDb" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Depends on public.current_actor_id, public.person_is_system_admin, and public.get_accessible_accounts" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="Any flow relying on unauthenticated or direct-PostgREST self-writes must authenticate via a privileged path; service_role is unaffected" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/045_security_critical_rls.sql:security_critical_rls:file"]
