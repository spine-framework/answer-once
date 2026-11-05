-- ============================================================================
-- Migration 077: multi-brand host support
--
-- 1) apps.prod_domains — multi-host extension of prod_domain. A hostname match
--    on prod_domain OR any array entry triggers the prod_route_prefix override
--    mount (app-mount.ts). Lets one app serve '/' on N branded domains while
--    keeping its route_prefix fallback on other hosts.
-- 2) accounts.brand — brand slug stamped at registration from the request
--    Host. Send paths (pipelines, invites, cron) have no request context, so
--    brand persists on the account and every email to that account's people
--    resolves it. NULL = instance default brand.
-- ============================================================================

ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS prod_domains text[];

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS brand text;

-- Recreate get_account_apps with prod_domains appended to the return set.
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

-- ============================================================================
-- complete_registration_placement gains p_host: brand resolution happens
-- INSIDE the placement RPC so all registration writes stay in the
-- service-role-only boundary — the handler never touches accounts directly.
-- The brands registry lives in transactional-email's config.brands
-- (by_host -> slug, default fallback). NULL host / missing registry → NULL
-- brand → instance default everywhere.
-- ============================================================================
DROP FUNCTION IF EXISTS public.complete_registration_placement(uuid, text, text, text);

CREATE OR REPLACE FUNCTION public.complete_registration_placement(
  p_person_id uuid,
  p_app_slug text,
  p_path text,
  p_account_name text,
  p_host text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person           public.people%ROWTYPE;
  v_app_reg          jsonb;
  v_role_slug        text;
  v_role             public.roles%ROWTYPE;
  v_account_id       uuid;
  v_account_slug     text;
  v_account_type_id  uuid;
  v_parent_id        uuid;
  v_type_id          uuid;
  v_design_schema    jsonb;
  v_validation_schema jsonb;
  v_base             text;
  v_domain           text;
  v_status           text;
  v_target           record;
  v_brands           jsonb;
  v_brand            text;
  v_personal_domains text[] := ARRAY[
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'protonmail.com', 'me.com', 'mac.com', 'live.com',
    'msn.com', 'ymail.com', 'googlemail.com', 'fastmail.com'
  ];
BEGIN
  IF p_person_id IS NULL OR p_app_slug IS NULL OR p_path IS NULL THEN
    RAISE EXCEPTION 'person, app, and path are required';
  END IF;

  -- Per-person lock serializes concurrent/duplicate placement calls.
  PERFORM pg_advisory_xact_lock(hashtext('spine.placement.' || p_person_id::text));

  SELECT * INTO v_person FROM public.people WHERE id = p_person_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Person not found';
  END IF;

  -- Idempotent: a retry after a lost response returns the placement that
  -- already committed instead of creating a second account or failing.
  IF v_person.account_id IS NOT NULL AND v_person.role_id IS NOT NULL THEN
    RETURN (
      SELECT jsonb_build_object(
        'status', v_person.status,
        'account_slug', a.slug,
        'role_slug', r.slug
      )
      FROM public.accounts a, public.roles r
      WHERE a.id = v_person.account_id AND r.id = v_person.role_id
    );
  END IF;

  -- Resolve the installed registration policy server-side.
  SELECT config->'registration' INTO v_app_reg
  FROM public.apps
  WHERE slug = p_app_slug AND is_active = true
  LIMIT 1;

  IF v_app_reg IS NULL THEN
    RAISE EXCEPTION 'Unknown or uninstalled app ''%'' or no registration policy configured', p_app_slug;
  END IF;
  IF COALESCE((v_app_reg->>'enabled')::boolean, false) = false THEN
    RAISE EXCEPTION 'Registration is not enabled for app ''%''', p_app_slug;
  END IF;

  -- Role comes from the app's installed config — NEVER the request.
  -- join_request defaults to 'member' when the app permits it.
  v_role_slug := CASE
    WHEN p_path = 'join_request' AND (v_app_reg->'roles' ? 'member') THEN 'member'
    ELSE v_app_reg->>'default_role'
  END;

  IF v_role_slug IS NULL THEN
    RAISE EXCEPTION 'App ''%'' registration has no default_role configured', p_app_slug;
  END IF;
  IF v_app_reg->'roles' IS NOT NULL AND NOT (v_app_reg->'roles' ? v_role_slug) THEN
    RAISE EXCEPTION 'Role ''%'' is not permitted in this context', v_role_slug;
  END IF;
  IF v_role_slug = 'system_admin' THEN
    RAISE EXCEPTION 'Role ''system_admin'' cannot be assigned through registration';
  END IF;

  SELECT * INTO v_role FROM public.roles WHERE slug = v_role_slug LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role ''%'' not found', v_role_slug;
  END IF;
  IF v_role.is_system = true THEN
    RAISE EXCEPTION 'Role ''%'' is not permitted in this context', v_role_slug;
  END IF;

  -- Post-lock precondition: another writer already assigned a role. Return
  -- the existing placement rather than overwrite (lost-response resume).
  IF v_person.role_id IS NOT NULL THEN
    RETURN (
      SELECT jsonb_build_object(
        'status', v_person.status,
        'account_slug', a.slug,
        'role_slug', r.slug
      )
      FROM public.roles r
      LEFT JOIN public.accounts a ON a.id = v_person.account_id
      WHERE r.id = v_person.role_id
    );
  END IF;

  SELECT id, design_schema, validation_schema
    INTO v_type_id, v_design_schema, v_validation_schema
  FROM public.types WHERE kind = 'person' AND slug = 'person' LIMIT 1;
  IF v_type_id IS NULL THEN
    RAISE EXCEPTION 'Person type (kind=person, slug=person) not found — run framework type seeds';
  END IF;

  IF p_path = 'new_account' THEN
    IF p_account_name IS NULL OR btrim(p_account_name) = '' THEN
      RAISE EXCEPTION 'account_name is required for new_account path';
    END IF;

    v_parent_id := NULL;
    IF v_app_reg->>'parent_account' IS NOT NULL THEN
      SELECT id INTO v_parent_id FROM public.accounts
      WHERE slug = v_app_reg->>'parent_account' LIMIT 1;
      IF v_parent_id IS NULL THEN
        RAISE EXCEPTION 'Parent account ''%'' not found', v_app_reg->>'parent_account';
      END IF;
    END IF;

    SELECT id INTO v_account_type_id FROM public.types
    WHERE kind = 'account' AND slug = 'account' LIMIT 1;
    IF v_account_type_id IS NULL THEN
      RAISE EXCEPTION 'Account type (kind=account, slug=account) not found — run framework type seeds';
    END IF;

    -- Slug pattern matches generateAccountSlug: lower, non-alphanumeric runs
    -- -> '-', trimmed, 40-char base, '-xxxxxx' random suffix, retried on
    -- collision until unique.
    v_base := left(btrim(lower(regexp_replace(p_account_name, '[^a-z0-9]+', '-', 'g')), '-'), 40);
    IF v_base = '' THEN v_base := 'account'; END IF;
    LOOP
      v_account_slug := v_base || '-' || substr(md5(random()::text), 1, 6);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts WHERE slug = v_account_slug);
    END LOOP;

    -- Brand from the registration host: brands.by_host[host] ?? brands.default.
    -- Missing registry or host leaves brand NULL — the instance default.
    v_brand := NULL;
    IF p_host IS NOT NULL THEN
      SELECT config->'brands' INTO v_brands
      FROM public.integrations
      WHERE slug = 'transactional-email' AND account_id IS NULL AND app_id IS NULL
      LIMIT 1;
      v_brand := COALESCE(
        v_brands->'by_host'->>lower(split_part(p_host, ':', 1)),
        v_brands->>'default'
      );
    END IF;

    INSERT INTO public.accounts (slug, display_name, type_id, parent_id, is_active, brand)
    VALUES (v_account_slug, btrim(p_account_name), v_account_type_id, v_parent_id, true, v_brand)
    RETURNING id INTO v_account_id;

    v_status := 'active';

    UPDATE public.people SET
      account_id        = v_account_id,
      role_id           = v_role.id,
      status            = 'active',
      type_id           = v_type_id,
      design_schema     = v_design_schema,
      validation_schema = COALESCE(v_validation_schema, '{}'::jsonb),
      updated_at        = now()
    WHERE id = v_person.id
      AND role_id IS NULL;

  ELSIF p_path = 'existing_account' THEN
    IF COALESCE(v_app_reg->>'account_strategy', '') <> 'existing' THEN
      RAISE EXCEPTION 'App ''%'' does not support joining an existing account', p_app_slug;
    END IF;
    IF v_app_reg->>'target_account' IS NULL THEN
      RAISE EXCEPTION 'No target_account configured for this app registration';
    END IF;

    SELECT id, slug INTO v_target FROM public.accounts
    WHERE slug = v_app_reg->>'target_account' LIMIT 1;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Target account ''%'' not found', v_app_reg->>'target_account';
    END IF;
    v_account_id   := v_target.id;
    v_account_slug := v_target.slug;
    v_status       := 'active';

    UPDATE public.people SET
      account_id        = v_account_id,
      role_id           = v_role.id,
      status            = 'active',
      type_id           = v_type_id,
      design_schema     = v_design_schema,
      validation_schema = COALESCE(v_validation_schema, '{}'::jsonb),
      data              = '{}'::jsonb,
      updated_at        = now()
    WHERE id = v_person.id
      AND role_id IS NULL;

  ELSIF p_path = 'join_request' THEN
    -- Opt-in only: apps must declare allow_domain_join. The target account
    -- is derived server-side from the person's email domain — the client
    -- never supplies target_account_id.
    IF COALESCE((v_app_reg->>'allow_domain_join')::boolean, false) = false THEN
      RAISE EXCEPTION 'App ''%'' does not allow domain-based join requests', p_app_slug;
    END IF;

    v_domain := lower(split_part(v_person.email, '@', 2));
    IF v_domain IS NULL OR v_domain = '' OR v_domain = ANY(v_personal_domains) THEN
      RAISE EXCEPTION 'No account found for this email domain';
    END IF;

    SELECT p2.account_id INTO v_account_id
    FROM public.people p2
    WHERE lower(split_part(p2.email, '@', 2)) = v_domain
      AND p2.status = 'active'
      AND p2.account_id IS NOT NULL
    ORDER BY p2.created_at
    LIMIT 1;

    IF v_account_id IS NULL THEN
      RAISE EXCEPTION 'No account found for this email domain';
    END IF;
    SELECT slug INTO v_account_slug FROM public.accounts WHERE id = v_account_id;

    v_status := 'pending';

    UPDATE public.people SET
      account_id        = v_account_id,
      role_id           = v_role.id,
      status            = 'pending',
      type_id           = v_type_id,
      design_schema     = v_design_schema,
      validation_schema = COALESCE(v_validation_schema, '{}'::jsonb),
      data              = COALESCE(data, '{}'::jsonb) || jsonb_build_object(
                            'invite_kind', 'access_request',
                            'invite_invited_by', null,
                            'invite_token', null),
      updated_at        = now()
    WHERE id = v_person.id
      AND role_id IS NULL;

  ELSE
    RAISE EXCEPTION 'Unknown registration path: %', p_path;
  END IF;

  RETURN jsonb_build_object(
    'status', v_status,
    'account_slug', v_account_slug,
    'role_slug', v_role.slug
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_registration_placement(uuid, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_registration_placement(uuid, text, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.complete_registration_placement(uuid, text, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_registration_placement(uuid, text, text, text, text) TO service_role;

-- Surface prod_domains through get_app_schema so schema-driven consumers
-- (admin UI, admin-data) see the field.
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
