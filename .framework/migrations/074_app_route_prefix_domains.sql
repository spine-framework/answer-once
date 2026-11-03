-- CIL[BEGIN stable_id="~/.framework/migrations/074_app_route_prefix_domains.sql:app_route_prefix_domains:file" type="file" identity="app_route_prefix_domains" parent="~/.framework/migrations/074_app_route_prefix_domains.sql"]
-- CIL[DOC-MACRO purpose="Add host-keyed mount overrides to public.apps and surface domain/prefix columns through get_account_apps."]
-- CIL[DOC-RESPONSIBILITY responsibility="Add prod_route_prefix/preview_route_prefix columns, restore the domain-scoped route_prefix unique index on the effective prod mount, and redefine get_account_apps to return preview_domain, prod_domain, preview_route_prefix, and prod_route_prefix."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/013_get_account_apps_role_filter.sql,.framework/functions/apps.ts,.framework/src/lib/app-mount.ts"]
-- CIL[DOC-CONTRACT inputs="none" outputs="apps table with route-prefix override columns; get_account_apps returns domain fields; partial unique index on (effective prod mount, prod_domain)" errors="duplicate effective mount on same prod domain" side_effects="schema_alter; drops and recreates get_account_apps"]
-- CIL[DOC-MICRO logic_summary="Adds two nullable text columns, recreates the (route_prefix, prod_domain)-style unique index but keyed on COALESCE(prod_route_prefix, route_prefix) so multiple apps may own '/' on different prod domains, then redefines get_account_apps with the four domain/prefix columns appended to its return set" notable_decisions="prod_route_prefix converts prod_domain from a hard visibility filter into a mount selector — the client falls back to route_prefix on non-matching hosts; preview_route_prefix mirrors it for VITE_ENVIRONMENT=preview"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="experimental"]

ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS prod_route_prefix text,
  ADD COLUMN IF NOT EXISTS preview_route_prefix text;

-- One app may own a given mount per prod domain. Using the effective prod
-- mount (COALESCE) means two apps can both declare '/' as long as their
-- prod_domain values differ — the intended multi-site topology.
CREATE UNIQUE INDEX IF NOT EXISTS idx_apps_route_prefix_domain
  ON public.apps(COALESCE(prod_route_prefix, route_prefix), COALESCE(prod_domain, ''))
  WHERE is_active = true AND route_prefix IS NOT NULL;

-- Return the domain + override columns so the client can resolve the
-- effective mount per hostname. Signature unchanged; return type extended,
-- so the prior overload must be dropped first.
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
  created_at            timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Keep get_app_schema's jsonb field list in step with the new columns so
-- schema-driven consumers (admin UI, admin-data) see the mount fields.
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
    'preview_domain', a.preview_domain,
    'prod_domain', a.prod_domain,
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
-- CIL[END stable_id="~/.framework/migrations/074_app_route_prefix_domains.sql:app_route_prefix_domains:file"]
