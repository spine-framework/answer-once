-- CIL[BEGIN stable_id="~/.framework/migrations/052_registration_security.sql:registration_security:file" type="file" identity="registration_security" parent="~/.framework/migrations/052_registration_security.sql"]
-- CIL[DOC-MACRO purpose="Registration and invite hardening: advisory-locked, token-gated stub claiming in handle_new_auth_user and an atomic, service-role-only complete_registration_placement RPC."]
-- CIL[DOC-RESPONSIBILITY responsibility="Serialize signup processing and invite-stub claims, fail clearly on missing seed dependencies, and move account placement/role assignment out of the request path into a locked SECURITY DEFINER RPC."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/010_auth_user_trigger.sql,.framework/migrations/042_registration_hierarchy.sql,.framework/functions/invites.ts"]
-- CIL[DOC-CONTRACT inputs="NEW auth.users row; p_person_id/p_app_slug/p_path/p_account_name" outputs="people rows inserted/updated; jsonb {status,account_slug,role_slug}" errors="RAISE EXCEPTION on missing person type, unclaimed invite stub, missing first-user seeds, invalid app/path/role/account" side_effects="Replaces handle_new_auth_user; creates complete_registration_placement; revokes EXECUTE from PUBLIC/anon/authenticated and grants to service_role"]
-- CIL[DOC-MICRO logic_summary="handle_new_auth_user takes pg_advisory_xact_lock('spine.registration') before any reads, claims invited/pending stubs only when raw_user_meta_data.invite_token matches the stub's stored token and the invite is unblocked/unexpired, raises when an unbound stub exists but the token is absent/invalid, and raises on missing seed dependencies for the first user. complete_registration_placement locks per person, is idempotent, resolves apps.config->'registration' server-side, and assigns account_id/role_id/status atomically for new_account, existing_account, and join_request paths." notable_decisions="Advisory xact locks serialize first-user detection and stub claims; the RPC is the only placement writer so client-supplied role/target values are never trusted"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Registration/invitation server-side hardening (Phase D).
--
--   * handle_new_auth_user() previously bound ANY unbound invited/pending
--     stub by email alone — anyone who registered with the invitee's email
--     claimed the invite without the token. Claims now require the invite
--     token carried in raw_user_meta_data.invite_token (set by the invite
--     link signup flow).
--   * The first-user check (NOT EXISTS people) raced under concurrent
--     signups; an advisory lock now serializes it.
--   * complete_registration_placement() is the single atomic writer for
--     registration placement. The invites endpoint calls it with the
--     server-resolved person id — role, account strategy, and join target
--     all come from the app's installed config, never the request body.

-- ============================================
-- 1. handle_new_auth_user() v3
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_account_id         uuid;
  v_type_id            uuid;
  v_role_id            uuid;
  v_is_first           boolean;
  v_design_schema      jsonb;
  v_validation_schema  jsonb;
  v_stub_id            uuid;
  v_stub_status        text;
  v_token              text;
BEGIN
  -- Serialize first-user detection AND invite-stub claims. Without this,
  -- two concurrent signups could both pass the NOT EXISTS people check or
  -- race to claim the same stub.
  PERFORM pg_advisory_xact_lock(hashtext('spine.registration'));

  SELECT id, design_schema, validation_schema
    INTO v_type_id, v_design_schema, v_validation_schema
  FROM public.types WHERE kind = 'person' AND slug = 'person' LIMIT 1;

  -- Fail clearly: an auth user with no resolvable person type can never be
  -- placed — better to error than silently create an unresolvable account.
  IF v_type_id IS NULL THEN
    RAISE EXCEPTION 'handle_new_auth_user: person type (kind=person, slug=person) not found — run framework type seeds before registering';
  END IF;

  -- Invite-stub claims REQUIRE the token. The stub's token lives in
  -- people.data->>'invite_token' (written by createInvite); the client
  -- echoes it back via raw_user_meta_data.invite_token at signup.
  v_token := NEW.raw_user_meta_data->>'invite_token';

  SELECT id, status
    INTO v_stub_id, v_stub_status
  FROM public.people
  WHERE email = NEW.email
    AND auth_uid IS NULL
    AND status IN ('invited', 'pending')
    AND data->>'invite_token' = v_token
    AND data->>'invite_blocked_at' IS NULL
    AND (data->>'invite_expires_at' IS NULL
         OR (data->>'invite_expires_at')::timestamptz > now())
  ORDER BY created_at
  LIMIT 1;

  IF v_stub_id IS NOT NULL THEN
    UPDATE public.people SET
      auth_uid   = NEW.id,
      full_name  = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name, split_part(NEW.email, '@', 1)),
      status     = CASE WHEN v_stub_status = 'invited' THEN 'active' ELSE 'pending' END,
      data       = (COALESCE(data, '{}'::jsonb) - 'invite_token')
                   || jsonb_build_object('invite_claimed_at', now()),
      updated_at = now()
    WHERE id = v_stub_id;

    RETURN NEW;
  END IF;

  -- The email matches an unbound invited/pending stub but the token was
  -- absent, wrong, blocked, or expired. people.email is UNIQUE so no second
  -- row can be created — fail loudly instead of silently orphaning the auth
  -- user or letting them bypass the invite gate.
  IF EXISTS (
    SELECT 1 FROM public.people
    WHERE email = NEW.email
      AND auth_uid IS NULL
      AND status IN ('invited', 'pending')
  ) THEN
    RAISE EXCEPTION 'A pending invitation exists for this email; register via your invite link';
  END IF;

  -- First-user detection stays inside the advisory lock so concurrent
  -- signups cannot both claim system_admin.
  SELECT NOT EXISTS (SELECT 1 FROM public.people LIMIT 1) INTO v_is_first;
  IF v_is_first THEN
    SELECT id INTO v_role_id FROM public.roles WHERE slug = 'system_admin' LIMIT 1;
    SELECT id INTO v_account_id FROM public.accounts WHERE slug = 'spine-system' LIMIT 1;

    -- Missing seeds are unrecoverable here — fail clearly and name the
    -- dependency instead of creating a rootless first user.
    IF v_account_id IS NULL AND v_role_id IS NULL THEN
      RAISE EXCEPTION 'handle_new_auth_user: first-user bootstrap requires the ''spine-system'' account and ''system_admin'' role seeds — run framework seeds before registering';
    ELSIF v_account_id IS NULL THEN
      RAISE EXCEPTION 'handle_new_auth_user: first-user bootstrap requires the ''spine-system'' account seed — run framework seeds before registering';
    ELSIF v_role_id IS NULL THEN
      RAISE EXCEPTION 'handle_new_auth_user: first-user bootstrap requires the ''system_admin'' role seed — run framework seeds before registering';
    END IF;
  END IF;

  -- Non-first, non-invited users get no account and no role here.
  -- complete_registration_placement assigns both from the app's installed
  -- config via the invites endpoint.
  INSERT INTO public.people (
    id,
    auth_uid,
    email,
    full_name,
    account_id,
    type_id,
    role_id,
    status,
    is_active,
    design_schema,
    validation_schema
  ) VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_account_id,
    v_type_id,
    v_role_id,
    'active',
    true,
    v_design_schema,
    COALESCE(v_validation_schema, '{}'::jsonb)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================
-- 2. complete_registration_placement()
--    Atomic, idempotent placement writer. Service-role only — the invites
--    endpoint calls it as adminDb; PUBLIC/anon/authenticated get nothing.
-- ============================================
CREATE OR REPLACE FUNCTION public.complete_registration_placement(
  p_person_id uuid,
  p_app_slug text,
  p_path text,
  p_account_name text
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

    INSERT INTO public.accounts (slug, display_name, type_id, parent_id, is_active)
    VALUES (v_account_slug, btrim(p_account_name), v_account_type_id, v_parent_id, true)
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

REVOKE ALL ON FUNCTION public.complete_registration_placement(uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_registration_placement(uuid, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.complete_registration_placement(uuid, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_registration_placement(uuid, text, text, text) TO service_role;
-- CIL[DOC-VECTOR type="context" content="purpose='Registration and invite hardening: advisory-locked, token-gated stub claiming in handle_new_auth_user and an atomic, service-role-only complete_registration_placement RPC.'; No verified external callers; imports: none" status="ready"]
-- CIL[DOC-VECTOR type="blast_radius" content="All new signups; invites.completeRegistration delegates placement to the RPC; invited stubs can only be claimed with a valid token" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Requires people.data invite_* keys written by createInvite; apps.config->'registration' installed per app (042); optional allow_domain_join flag for join_request" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="complete_registration_placement is service-role only; role must be declared in appReg.roles, non-system_admin, and is_system=false" status="ready"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/052_registration_security.sql:registration_security:file"]
