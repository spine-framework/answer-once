-- CIL[BEGIN stable_id="~/.framework/migrations/013_get_account_apps_role_filter.sql:get_account_apps_role_filter:file" type="file" identity="get_account_apps_role_filter" parent="~/.framework/migrations/013_get_account_apps_role_filter.sql"]
-- CIL[DOC-MACRO purpose="Adds role-based filtering to the public.get_account_apps function so non-system-admin users only see apps allowed by their assigned role slugs."]
-- CIL[DOC-RESPONSIBILITY responsibility="Define the security-definer get_account_apps SQL function, including overload cleanup and role-aware access filtering."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/013_get_account_apps_role_filter.sql"]
-- CIL[DOC-CONTRACT inputs="uuid account_id, boolean include_system=true, boolean include_inactive=false, text[] user_role_slugs=null, boolean is_system_admin=false" outputs="TABLE of app columns filtered by ownership, active state, and role requirements" errors="none" side_effects="Drops and recreates get_account_apps function overloads in the public schema."]
-- CIL[DOC-MICRO logic_summary="Drops overloaded get_account_apps signatures, then creates a security-definer function returning app rows. Filters combine active/owner/system rules with optional role checks: when user_role_slugs is provided and the caller is not a system admin, only apps with matching required_roles or min_role are returned." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Update get_account_apps to support role-based filtering.
-- This signature matches the .rpc call in .framework/functions/apps.ts,
-- which passes user_role_slugs and is_system_admin.

DROP FUNCTION IF EXISTS public.get_account_apps(uuid, boolean, boolean);
DROP FUNCTION IF EXISTS public.get_account_apps(uuid, boolean, boolean, text[], boolean);

CREATE OR REPLACE FUNCTION public.get_account_apps(
  account_id        uuid,
  include_system    boolean  DEFAULT true,
  include_inactive  boolean  DEFAULT false,
  user_role_slugs   text[]   DEFAULT NULL,
  is_system_admin   boolean  DEFAULT false
)
RETURNS TABLE(
  id                uuid,
  slug              text,
  name              text,
  description       text,
  icon              text,
  color             text,
  version           text,
  app_type          text,
  source            text,
  owner_account_id  uuid,
  is_active         boolean,
  is_system         boolean,
  min_role          text,
  required_roles    jsonb,
  config            jsonb,
  nav_items         jsonb,
  route_prefix      text,
  renderer          text,
  metadata          jsonb,
  integration_deps  jsonb,
  created_at        timestamptz
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
-- CIL[DOC-VECTOR type="context" content="purpose='Adds role-based filtering to the public.get_account_apps function so non-system-admin users only see apps allowed by their assigned role slugs.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/013_get_account_apps_role_filter.sql:get_account_apps_role_filter:file"]
