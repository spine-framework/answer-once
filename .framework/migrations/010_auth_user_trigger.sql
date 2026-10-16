-- CIL[BEGIN stable_id="~/.framework/migrations/010_auth_user_trigger.sql:auth_user_trigger:file" type="file" identity="auth_user_trigger" parent="~/.framework/migrations/010_auth_user_trigger.sql"]
-- CIL[DOC-MACRO purpose="PostgreSQL trigger function and trigger that synchronizes newly created auth.users records into public.people, linking existing stubs and promoting the first user to system admin."]
-- CIL[DOC-RESPONSIBILITY responsibility="Keep the public.people table in sync with auth.users on insert, resolve pending or invited person stubs, and assign the first registered user the system_admin role."]
-- CIL[DOC-CONTEXT module="auth" layer="migrations" related_files=".framework/migrations/010_auth_user_trigger.sql"]
-- CIL[DOC-CONTRACT inputs="NEW auth.users row with id, email, raw_user_meta_data" outputs="Unchanged NEW row; public.people row inserted or updated" errors="No raised errors; warnings emitted if spine-system account or person type is missing" side_effects="Inserts or updates public.people and installs an AFTER INSERT trigger on auth.users"]
-- CIL[DOC-MICRO logic_summary="Resolve the spine-system account and person type, then either link an existing pending/invited people stub by email or insert a new people record, assigning the system_admin role to the first registered user. Finally, drop and recreate the trigger." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Create trigger function to sync new auth users to people records
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
BEGIN
  SELECT id INTO v_account_id FROM public.accounts WHERE slug = 'spine-system' LIMIT 1;
  SELECT id, design_schema, validation_schema
    INTO v_type_id, v_design_schema, v_validation_schema
  FROM public.types WHERE kind = 'person' AND slug = 'person' LIMIT 1;

  IF v_account_id IS NULL OR v_type_id IS NULL THEN
    RAISE WARNING 'handle_new_auth_user: spine-system account or person type not found — skipping';
    RETURN NEW;
  END IF;

  SELECT id, status
    INTO v_stub_id, v_stub_status
  FROM public.people
  WHERE email = NEW.email
    AND status IN ('invited', 'pending')
    AND auth_uid IS NULL
  LIMIT 1;

  IF v_stub_id IS NOT NULL THEN
    UPDATE public.people SET
      auth_uid   = NEW.id,
      full_name  = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name, split_part(NEW.email, '@', 1)),
      status     = CASE WHEN v_stub_status = 'invited' THEN 'active' ELSE 'pending' END,
      updated_at = now()
    WHERE id = v_stub_id;

    RETURN NEW;
  END IF;

  SELECT NOT EXISTS (SELECT 1 FROM public.people LIMIT 1) INTO v_is_first;
  IF v_is_first THEN
    SELECT id INTO v_role_id FROM public.roles WHERE slug = 'system_admin' LIMIT 1;
  END IF;

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
-- CIL[DOC-VECTOR type="context" content="purpose='PostgreSQL trigger function and trigger that synchronizes newly created auth.users records into public.people, linking existing stubs and promoting the first user to system admin.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/010_auth_user_trigger.sql:auth_user_trigger:file"]
