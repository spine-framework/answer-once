-- CIL[BEGIN stable_id="~/.framework/migrations/042_registration_hierarchy.sql:registration_hierarchy:file" type="file" identity="registration_hierarchy" parent="~/.framework/migrations/042_registration_hierarchy.sql"]
-- CIL[DOC-MACRO purpose="Make spine-system a staff-only root: null-account signups, people self-read, and uniform actor resolution across all account-scoped RLS policies."]
-- CIL[DOC-RESPONSIBILITY responsibility="Stop routing generic signups into spine-system, let people read their own row pre-assignment, replace auth.uid() with public.current_actor_id() in every account-scoped policy, parent existing root accounts under spine-system, and retire demo account expiry markers."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/002_core_rls_and_functions.sql,.framework/migrations/010_auth_user_trigger.sql,.framework/migrations/006_security_hardening_rls.sql,.framework/functions/invites.ts"]
-- CIL[DOC-CONTRACT inputs="none" outputs="Updated trigger, RLS policies, and account rows" errors="SQL errors if referenced objects are missing" side_effects="Alters people.account_id nullability; replaces handle_new_auth_user; drops and recreates RLS policies; updates accounts.parent_id and accounts.data; updates apps.config.registration for known slugs"]
-- CIL[DOC-MICRO logic_summary="people.account_id becomes nullable so non-invited signups carry no account until completeRegistration assigns one; people_access gains self-read; all policies that resolved the actor through auth.uid() now use current_actor_id() so invited users (people.id != auth.users.id) see threads/messages/links/attachments/embeddings consistently; non-system root accounts are re-parented to spine-system and expires_at/demo_expired markers are cleared." notable_decisions="spine-system is reserved for the first user (system_admin) and invited staff; hierarchy visibility flows parent->child via get_accessible_accounts"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Registration + account hierarchy hardening.
--
-- Background:
--   * handle_new_auth_user() (010) placed EVERY signup in spine-system, which
--     becomes unsafe once customer accounts are children of spine-system —
--     any stray member would gain descendant visibility.
--   * Policies created in 002/004/006 resolved the actor via auth.uid(),
--     which only equals people.id for self-signups. Invited users have a
--     stub-generated people.id, so they could not read threads/messages/etc.
--   * Customer accounts were created as roots (no parent_id), so
--     get_accessible_accounts() never reached them for staff users.
--   * accounts.data.expires_at drove the demo expiry sweep; demo signups are
--     real support-portal customers now, so expiry markers are removed.

-- ============================================
-- 1. people.account_id becomes nullable.
--    Non-invited signups start unassigned; completeRegistration assigns them.
-- ============================================
ALTER TABLE public.people ALTER COLUMN account_id DROP NOT NULL;

-- ============================================
-- 2. Signup trigger: only the first user (system_admin) and invited/pending
--    stubs are attached to an account. Everyone else starts with
--    account_id = NULL until they complete registration.
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
BEGIN
  SELECT id, design_schema, validation_schema
    INTO v_type_id, v_design_schema, v_validation_schema
  FROM public.types WHERE kind = 'person' AND slug = 'person' LIMIT 1;

  IF v_type_id IS NULL THEN
    RAISE WARNING 'handle_new_auth_user: person type not found — skipping';
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
    SELECT id INTO v_account_id FROM public.accounts WHERE slug = 'spine-system' LIMIT 1;
  END IF;

  -- Non-first, non-invited users get no account and no role here.
  -- completeRegistration assigns both from the app's installed config.
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
-- 3. people: a person can always read their own row, even before they have
--    an account. Without this, null-account users cannot resolve their
--    principal or /api/auth context to finish registration.
-- ============================================
DROP POLICY IF EXISTS people_access ON public.people;
CREATE POLICY people_access ON public.people FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))
         OR id = public.current_actor_id());

-- ============================================
-- 4. Normalize actor resolution: auth.uid() -> public.current_actor_id().
--    get_accessible_accounts expects a people.id; auth.uid() only coincides
--    with it for self-signups, so invited members were invisible to these
--    policies. This is what makes account access cover tickets AND their
--    threads/messages/links/attachments/watchers/embeddings uniformly.
-- ============================================

DROP POLICY IF EXISTS threads_access ON public.threads;
CREATE POLICY threads_access ON public.threads FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS messages_access ON public.messages;
CREATE POLICY messages_access ON public.messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.threads t
                 WHERE t.id = messages.thread_id
                 AND t.account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))));

DROP POLICY IF EXISTS links_access ON public.links;
CREATE POLICY links_access ON public.links FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS attachments_access ON public.attachments;
CREATE POLICY attachments_access ON public.attachments FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS watchers_access ON public.watchers;
CREATE POLICY watchers_access ON public.watchers FOR ALL
  USING (account_id IS NULL
         OR account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS link_types_access ON public.link_types;
CREATE POLICY link_types_access ON public.link_types FOR ALL
  USING (app_id IS NULL
         OR EXISTS (SELECT 1 FROM public.apps a WHERE a.id = link_types.app_id
                    AND a.owner_account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))));

DROP POLICY IF EXISTS pipelines_access ON public.pipelines;
CREATE POLICY pipelines_access ON public.pipelines FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS pe_access ON public.pipeline_executions;
CREATE POLICY pe_access ON public.pipeline_executions FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS triggers_access ON public.triggers;
CREATE POLICY triggers_access ON public.triggers FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS te_access ON public.trigger_executions;
CREATE POLICY te_access ON public.trigger_executions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.triggers t
                 WHERE t.id = trigger_executions.trigger_id
                 AND t.account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))));

DROP POLICY IF EXISTS timers_access ON public.timers;
CREATE POLICY timers_access ON public.timers FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS ai_agents_access ON public.ai_agents;
CREATE POLICY ai_agents_access ON public.ai_agents FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS embeddings_access ON public.embeddings;
CREATE POLICY embeddings_access ON public.embeddings FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS integrations_access ON public.integrations;
CREATE POLICY integrations_access ON public.integrations FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS api_keys_access ON public.api_keys;
CREATE POLICY api_keys_access ON public.api_keys FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS akul_access ON public.api_key_usage_logs;
CREATE POLICY akul_access ON public.api_key_usage_logs FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS webhook_handlers_access ON public.webhook_handlers;
CREATE POLICY webhook_handlers_access ON public.webhook_handlers FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS webhook_deliveries_access ON public.webhook_deliveries;
CREATE POLICY webhook_deliveries_access ON public.webhook_deliveries FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS logs_access ON public.logs;
CREATE POLICY logs_access ON public.logs FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS apps_access ON public.apps;
CREATE POLICY apps_access ON public.apps FOR ALL
  USING (is_system = true OR owner_account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS prompt_configs_access ON public.prompt_configs;
CREATE POLICY prompt_configs_access ON public.prompt_configs FOR ALL
  USING ((app_id IS NULL OR EXISTS (SELECT 1 FROM public.apps a
          WHERE a.id = prompt_configs.app_id
          AND (a.is_system = true
               OR a.owner_account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))))));

-- ============================================
-- 5. Backfill: existing customer/demo root accounts become children of
--    spine-system so staff get hierarchical read access. The
--    update_account_paths trigger maintains the closure table on UPDATE.
-- ============================================
UPDATE public.accounts a
SET parent_id = s.id, updated_at = now()
FROM public.accounts s
WHERE s.slug = 'spine-system'
  AND a.parent_id IS NULL
  AND a.id <> s.id;

-- ============================================
-- 6. Demo accounts are real support-portal customers — no expiry sweep.
--    Clear legacy lifecycle markers (is_demo itself stays for funnel
--    tagging and the demo rate-limit policy).
-- ============================================
UPDATE public.accounts
SET data = data - 'expires_at' - 'demo_expired' - 'expired_at',
    updated_at = now()
WHERE data ?| ARRAY['expires_at', 'demo_expired', 'expired_at'];

-- ============================================
-- 7. Mirror each installed app's resolved registration policy onto
--    apps.config.registration so completeRegistration can resolve
--    strategy/role/target/parent server-side without trusting the client.
--    Values match spine.config.json registration.apps.
-- ============================================
UPDATE public.apps SET config = COALESCE(config, '{}'::jsonb) || '{
  "registration": {
    "roles": ["member", "member_admin", "support", "support_admin", "sales", "csm", "tam", "engineering", "engineering_admin", "product", "docs", "qa", "devops", "management"],
    "default_role": "member_admin",
    "path": "/portal",
    "enabled": true,
    "account_strategy": "new",
    "parent_account": "spine-system"
  }
}'::jsonb
WHERE slug = 'portal';

UPDATE public.apps SET config = COALESCE(config, '{}'::jsonb) || '{
  "registration": {
    "roles": ["member", "member_admin"],
    "default_role": "member_admin",
    "path": "/demo",
    "enabled": true,
    "account_strategy": "new",
    "parent_account": "spine-system"
  }
}'::jsonb
WHERE slug = 'demo';

UPDATE public.apps SET config = COALESCE(config, '{}'::jsonb) || '{
  "registration": {
    "roles": ["support", "support_admin", "sales", "csm", "tam", "engineering", "engineering_admin", "product", "docs", "qa", "devops", "management"],
    "default_role": "support",
    "path": "/cortex",
    "enabled": true,
    "account_strategy": "existing",
    "target_account": "spine-system"
  }
}'::jsonb
WHERE slug = 'cortex';

UPDATE public.apps SET config = COALESCE(config, '{}'::jsonb) || '{
  "registration": {
    "roles": ["engineering", "engineering_admin", "product", "docs", "qa", "devops", "management", "support", "support_admin", "sales", "csm", "tam"],
    "default_role": "engineering",
    "path": "/workbench",
    "enabled": true,
    "account_strategy": "existing",
    "target_account": "spine-system"
  }
}'::jsonb
WHERE slug = 'workbench';
-- CIL[DOC-VECTOR type="context" content="purpose='Make spine-system a staff-only root: null-account signups, people self-read, and uniform actor resolution across all account-scoped RLS policies.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Affects every account-scoped RLS policy; invited users gain correct access; anonymous signups lose spine-system placement" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Depends on public.get_accessible_accounts, public.current_actor_id, account_paths trigger from 002" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="current_actor_id() requires is_active=true; deactivated people lose self-read" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/042_registration_hierarchy.sql:registration_hierarchy:file"]
