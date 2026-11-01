-- Migration 070: bootstrap the RPCs the types/apps handlers expect
--
-- types.ts getSchema (?action=schema) and apps.ts getSchema /
-- checkAvailability / updateVersion (?action=schema|available|version)
-- call four Postgres functions that existed in the pre-consolidation v2
-- schema (v2-core/migrations/010_apps.sql, 004_types.sql +
-- 049_schema_driven_permissions.sql) but were never ported into
-- .framework/migrations — each action fails at runtime on a stock
-- install with "Could not find the function public.<name>(...) in the
-- schema cache". This migration recreates them against the public
-- schema.
--
-- Semantics are ported from the recovered v2 definitions:
--   * get_type_schema returns the matching active type's design_schema
--     ('{}' when none). An app_id argument prefers that app's row and
--     falls back to the global (app_id IS NULL) type — the documented
--     "app-specific fallback to system" behavior.
--   * get_app_schema returns a jsonb projection of the active app row
--     ('{}' when none), extended with the required_roles / route_prefix /
--     renderer columns added since v2.
--   * is_app_available returns true when an active app with the slug is
--     available to the account under the same ownership rule
--     get_account_apps uses (is_system OR owner_account_id IS NULL OR
--     owner_account_id = account_id).
--   * update_app_version bumps apps.version + updated_at and returns
--     void — the handler only checks for an error.
--
-- All four run as SECURITY INVOKER (the v2 default): callers go through
-- ctx.db, so human callers keep RLS scoping (types are world-readable via
-- types_read; apps via apps_access) and machine principals bypass RLS as
-- service_role. GRANTs match the sibling RPC convention in
-- 004_core_rpc_and_broker.sql.

-- CIL[BEGIN stable_id="~/.framework/migrations/070_app_type_schema_rpcs.sql:module:migration" type="migration" identity="app-type-schema-rpcs" parent="~/.framework/migrations/070_app_type_schema_rpcs.sql"]
-- CIL[DOC-MACRO purpose="Create the four Postgres RPCs the types and apps Netlify handlers invoke: get_type_schema, get_app_schema, is_app_available, update_app_version"]
-- CIL[DOC-RESPONSIBILITY responsibility="Provide schema lookup, app-schema projection, account-scoped app availability, and app version bump functions missing since the v2-to-public consolidation"]
-- CIL[DOC-CONTEXT module="functions" layer="schema" related_files=".framework/functions/types.ts,.framework/functions/apps.ts,.framework/migrations/013_get_account_apps_role_filter.sql"]
-- CIL[DOC-CONTRACT inputs="text/uuid params matching the .rpc named args in types.ts and apps.ts" outputs="jsonb scalars, boolean, void matching the shapes the handlers read" errors="none — SECURITY INVOKER relies on caller RLS" side_effects="update_app_version mutates public.apps version and updated_at"]
-- CIL[DOC-MICRO logic_summary="Ports the recovered v2-core function bodies to the public schema; get_type_schema reads design_schema with app-specific fallback to the global type; is_app_available reuses the get_account_apps ownership rule including NULL-owner apps" notable_decisions="SECURITY INVOKER rather than DEFINER so human callers keep RLS scoping and no caller-supplied privilege claims are trusted"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[DOC-AUDIENCE audience="framework_developers"]
-- CIL[END stable_id="~/.framework/migrations/070_app_type_schema_rpcs.sql:module:migration"]

-- ── types ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_type_schema(
  kind   text,
  slug   text,
  app_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  type_schema jsonb;
BEGIN
  SELECT t.design_schema INTO type_schema
  FROM public.types t
  WHERE t.kind = get_type_schema.kind
    AND t.slug = get_type_schema.slug
    AND t.is_active = true
    AND (t.app_id = get_type_schema.app_id OR t.app_id IS NULL)
  ORDER BY t.app_id NULLS LAST -- prefer app-specific types over global
  LIMIT 1;

  RETURN COALESCE(type_schema, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_type_schema(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_type_schema(text, text, uuid) TO service_role;

COMMENT ON FUNCTION public.get_type_schema(text, text, uuid) IS 'Get type design_schema by kind+slug, app-specific with fallback to global';

-- ── apps ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_app_schema(app_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  app_schema jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', a.id,
    'slug', a.slug,
    'name', a.name,
    'description', a.description,
    'icon', a.icon,
    'color', a.color,
    'version', a.version,
    'app_type', a.app_type,
    'source', a.source,
    'config', a.config,
    'nav_items', a.nav_items,
    'min_role', a.min_role,
    'required_roles', a.required_roles,
    'integration_deps', a.integration_deps,
    'metadata', a.metadata,
    'route_prefix', a.route_prefix,
    'renderer', a.renderer
  ) INTO app_schema
  FROM public.apps a
  WHERE a.slug = get_app_schema.app_slug
    AND a.is_active = true;

  RETURN COALESCE(app_schema, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_app_schema(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_schema(text) TO service_role;

COMMENT ON FUNCTION public.get_app_schema(text) IS 'Get full app schema by slug';

CREATE OR REPLACE FUNCTION public.is_app_available(
  app_slug   text,
  account_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.apps a
    WHERE a.slug = is_app_available.app_slug
      AND a.is_active = true
      AND (
        a.is_system = true
        OR a.owner_account_id IS NULL
        OR a.owner_account_id = is_app_available.account_id
      )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_app_available(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_app_available(text, uuid) TO service_role;

COMMENT ON FUNCTION public.is_app_available(text, uuid) IS 'Check if app is available to account';

CREATE OR REPLACE FUNCTION public.update_app_version(
  app_id      uuid,
  new_version text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.apps
  SET
    version = update_app_version.new_version,
    updated_at = now()
  WHERE id = update_app_version.app_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_app_version(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_app_version(uuid, text) TO service_role;

COMMENT ON FUNCTION public.update_app_version(uuid, text) IS 'Update app version';
