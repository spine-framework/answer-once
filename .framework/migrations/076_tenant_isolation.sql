-- CIL[BEGIN stable_id="~/.framework/migrations/076_tenant_isolation.sql:tenant_isolation:file" type="file" identity="tenant_isolation" parent="~/.framework/migrations/076_tenant_isolation.sql"]
-- CIL[DOC-MACRO purpose="Close the remaining cross-tenant escape hatches: people INSERT guard, platform-scope confinement for items, kb-article-list scope fix"]
-- CIL[DOC-RESPONSIBILITY responsibility="Extend people_privileged_fields_guard to INSERT, restrict the items_access platform branch to the spine-system account, and re-stamp kb-article-list type+rows to scope=account"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/045_security_critical_rls.sql,.framework/migrations/006_security_hardening_rls.sql,.framework/migrations/075_security_definer_grants.sql,.framework/functions/admin-data.ts,.framework/functions/_shared/kb.ts"]
-- CIL[DOC-CONTRACT inputs="existing people/items/types rows" outputs="INSERT+UPDATE people guard, narrowed items_access policy, kb-article-list restamped scope=account" errors="trigger raises EXCEPTION on privileged people writes by non-admin actors" side_effects="platform-scope items outside spine-system become unreadable/unwritable via RLS — intended"]
-- CIL[DOC-MICRO logic_summary="The guard treats actor NULL (service_role / SECURITY DEFINER) as trusted and keeps working for admin-data/handle_new_auth_user/registration RPCs; authenticated INSERTs must keep role_id non-system, auth_uid = auth.uid(), account_id inside get_accessible_accounts(actor), and require an *_admin actor. items_access FOR ALL so the platform clause constrains writes too. kb-article-list was mislabeled scope='platform', which made every tenant's KB tree readable by any signed-in user" notable_decisions="actor-NULL bypass is deliberate — old code paths write people via service role and stay compatible"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- 076_tenant_isolation.sql — close the remaining cross-tenant escape hatches:
--   1. people_privileged_fields_guard was UPDATE-only: a direct PostgREST
--      INSERT INTO people could plant a row with a system role_id, foreign
--      auth_uid, or a self-chosen invite_token and then claim it at signup.
--      The guard is extended to INSERT with the same actor model — service
--      role / SECURITY DEFINER writes (actor NULL) stay allowed because they
--      are trusted code paths; authenticated direct writes are gated.
--   2. items_access let any authenticated actor read/write rows whose
--      stamped design_schema says scope='platform' in ANY account. The
--      platform branch is now restricted to rows that actually live in the
--      platform (spine-system) account.
--   3. kb-article-list cache rows were stamped scope='platform' inside each
--      tenant account, which made every tenant's KB article tree readable
--      by any signed-in user. The type and existing rows are re-stamped
--      scope='account'.

-- ============================================
-- 1. people privileged-fields guard → INSERT + UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION public.people_guard_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actor uuid := public.current_actor_id();
  privileged_changed boolean;
  actor_is_admin boolean;
BEGIN
  -- service_role / SECURITY DEFINER callers have no actor — trusted code
  -- paths (admin-data, handle_new_auth_user, registration RPCs) keep working.
  IF actor IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    privileged_changed :=
         NEW.role_id IS NOT NULL
      OR NEW.account_id IS NOT NULL
      OR NEW.auth_uid IS NOT NULL
      OR NEW.app_id IS NOT NULL
      OR NEW.type_id IS NOT NULL
      OR NEW.design_schema IS NOT NULL AND NEW.design_schema <> '{}'::jsonb
      OR NEW.validation_schema IS NOT NULL AND NEW.validation_schema <> '{}'::jsonb
      OR NEW.created_by IS NOT NULL
      OR (NEW.data ? 'invite_token');
  ELSE
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
  END IF;

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
  IF (TG_OP = 'INSERT' AND EXISTS (SELECT 1 FROM public.roles r WHERE r.id = NEW.role_id AND r.is_system))
     OR (TG_OP = 'UPDATE' AND NEW.role_id IS DISTINCT FROM OLD.role_id
         AND EXISTS (SELECT 1 FROM public.roles r WHERE r.id = NEW.role_id AND r.is_system)) THEN
    RAISE EXCEPTION 'Only system admins may assign system roles';
  END IF;

  -- auth_uid may only ever point at the acting user — you cannot plant or
  -- move an identity anchor onto somebody else's login.
  IF NEW.auth_uid IS NOT NULL AND NEW.auth_uid <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot set auth_uid to another user';
  END IF;

  -- account_id must stay inside the actor's accessible accounts.
  IF NEW.account_id IS NOT NULL
     AND NOT (NEW.account_id IN (SELECT public.get_accessible_accounts(actor))) THEN
    RAISE EXCEPTION 'Cannot assign a person to an account you cannot access';
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
$$
SET search_path = public;

REVOKE ALL ON FUNCTION public.people_guard_privileged_fields() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.people_guard_privileged_fields() TO service_role;

DROP TRIGGER IF EXISTS people_privileged_fields_guard ON public.people;
CREATE TRIGGER people_privileged_fields_guard
  BEFORE INSERT OR UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.people_guard_privileged_fields();

-- ============================================
-- 2. items_access — platform scope only inside the platform account
-- ============================================
DROP POLICY IF EXISTS items_access ON public.items;
CREATE POLICY items_access ON public.items FOR ALL
  USING (
    account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))
    OR (
      design_schema->>'scope' = 'platform'
      AND account_id = (SELECT id FROM public.accounts WHERE slug = 'spine-system')
      AND public.current_actor_id() IS NOT NULL
    )
  );

-- ============================================
-- 3. kb-article-list is account-scoped, not platform
-- ============================================
UPDATE public.types
SET design_schema = jsonb_set(design_schema, '{scope}', '"account"'::jsonb)
WHERE slug = 'kb-article-list';

UPDATE public.items
SET design_schema = jsonb_set(design_schema, '{scope}', '"account"'::jsonb)
WHERE type_id = (SELECT id FROM public.types WHERE slug = 'kb-article-list')
  AND design_schema->>'scope' = 'platform';
-- CIL[END stable_id="~/.framework/migrations/076_tenant_isolation.sql:tenant_isolation:file"]
