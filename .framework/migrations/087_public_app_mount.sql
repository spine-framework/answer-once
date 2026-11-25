-- ============================================================================
-- Migration 087: public app mount flags on public.apps
--
-- apps.is_public / auth_required existed on the manifest as documented-but-
-- unwired config (decision 0034). They become real columns stamped at install
-- time from the app manifest; the anonymous SPA router mounts is_public
-- custom apps without an auth wall. auth_required is recorded for the app's
-- own component-level gating — the record layer never uses it.
-- ============================================================================

ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auth_required boolean NOT NULL DEFAULT true;

-- Recreate get_account_apps with the two flags appended to the return set.
-- Signature unchanged; return type extended, so drop the prior overload first.
DROP FUNCTION IF EXISTS public.get_account_apps(uuid, boolean, boolean, text[], boolean);

CREATE OR REPLACE FUNCTION public.get_account_apps(
  account_id        uuid,
  include_system    boolean  DEFAULT true,
  include_inactive  boolean  DEFAULT false,
  user_role_slugs   text[]   DEFAULT NULL,
  is_system_admin   boolean  DEFAULT false
)
RETURNS TABLE(
  id                    uuid,
  slug                  text,
  name                  text,
  description           text,
  icon                  text,
  color                 text,
  version               text,
  app_type              text,
  source                text,
  owner_account_id      uuid,
  is_active             boolean,
  is_system             boolean,
  is_public             boolean,
  auth_required         boolean,
  min_role              text,
  required_roles        jsonb,
  config                jsonb,
  nav_items             jsonb,
  route_prefix          text,
  renderer              text,
  metadata              jsonb,
  integration_deps      jsonb,
  preview_domain        text,
  prod_domain           text,
  preview_route_prefix  text,
  prod_route_prefix     text,
  prod_domains          text[],
  created_at            timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.name,
    a.description,
    a.icon,
    a.color,
    a.version,
    a.app_type,
    a.source,
    a.owner_account_id,
    a.is_active,
    a.is_system,
    a.is_public,
    a.auth_required,
    a.min_role,
    a.required_roles,
    a.config,
    a.nav_items,
    a.route_prefix,
    a.renderer,
    a.metadata,
    a.integration_deps,
    a.preview_domain,
    a.prod_domain,
    a.preview_route_prefix,
    a.prod_route_prefix,
    a.prod_domains,
    a.created_at
  FROM public.apps a
  WHERE
    (include_inactive OR a.is_active = true)
    AND (
      a.is_system = true
      OR a.owner_account_id = get_account_apps.account_id
      OR a.owner_account_id IS NULL
    )
    AND (
      user_role_slugs IS NULL
      OR is_system_admin
      OR (
        (a.required_roles IS NULL OR a.required_roles = '[]'::jsonb)
        AND a.min_role IS NULL
      )
      OR (
        a.required_roles IS NOT NULL
        AND a.required_roles != '[]'::jsonb
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(a.required_roles) AS rr(role_slug)
          WHERE rr.role_slug = ANY(user_role_slugs)
        )
      )
      OR (
        (a.required_roles IS NULL OR a.required_roles = '[]'::jsonb)
        AND a.min_role IS NOT NULL
        AND a.min_role = ANY(user_role_slugs)
      )
    )
  ORDER BY
    a.is_system DESC,
    a.app_type,
    a.name;
END;
$$;

-- SECURITY DEFINER functions must not be executable by PostgREST roles —
-- PUBLIC EXECUTE is the Postgres default and would expose it at /rest/v1/rpc.
REVOKE ALL ON FUNCTION public.get_account_apps(uuid, boolean, boolean, text[], boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_account_apps(uuid, boolean, boolean, text[], boolean) FROM anon;
REVOKE ALL ON FUNCTION public.get_account_apps(uuid, boolean, boolean, text[], boolean) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_apps(uuid, boolean, boolean, text[], boolean) TO service_role;

-- Surface the flags through get_app_schema so schema-driven consumers
-- (admin UI, admin-data) see them.
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
    'is_public', a.is_public,
    'auth_required', a.auth_required,
    'integration_deps', a.integration_deps,
    'metadata', a.metadata,
    'route_prefix', a.route_prefix,
    'preview_domain', a.preview_domain,
    'prod_domain', a.prod_domain,
    'prod_domains', a.prod_domains,
    'preview_route_prefix', a.preview_route_prefix,
    'prod_route_prefix', a.prod_route_prefix,
    'renderer', a.renderer
  ) INTO app_schema
  FROM public.apps a
  WHERE a.slug = get_app_schema.app_slug
    AND a.is_active = true;

  RETURN COALESCE(app_schema, '{}'::jsonb);
END;
$$;
