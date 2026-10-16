-- CIL[BEGIN stable_id="~/.framework/migrations/043_policy_actor_cleanup.sql:policy_actor_cleanup:file" type="file" identity="policy_actor_cleanup" parent="~/.framework/migrations/043_policy_actor_cleanup.sql"]
-- CIL[DOC-MACRO purpose="Finish actor-resolution normalization: fix the auth.uid() policies missed by 042 and close remaining anonymous-access bypasses."]
-- CIL[DOC-RESPONSIBILITY responsibility="Replace auth.uid() with public.current_actor_id() in actions/item_progress/schedules/schedule_executions policies, drop their OR auth.uid() IS NULL bypasses, and replace the webhook_handlers system-admin check that trusted user-editable raw_user_meta_data."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/042_registration_hierarchy.sql,.framework/migrations/006_security_hardening_rls.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="Recreated RLS policies" errors="SQL errors if referenced objects are missing" side_effects="Drops and recreates five RLS policies"]
-- CIL[DOC-MICRO logic_summary="actions, item_progress, schedules, and schedule_executions get the standard accessible-accounts predicate via current_actor_id(); webhook_handlers_system_admin switches from auth.users.raw_user_meta_data->>'role' (client-controllable at signup) to person_is_system_admin(current_actor_id())." notable_decisions="OR auth.uid() IS NULL removed for parity with the 006 hardening pattern"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Follow-up to 042: these four account-scoped tables still resolved the actor
-- via auth.uid() AND retained the `OR auth.uid() IS NULL` anonymous bypass
-- that 006 removed everywhere else. webhook_handlers_system_admin trusted
-- raw_user_meta_data.role, which a user can set at signup — replace it with
-- the people/roles-backed person_is_system_admin() check.

DROP POLICY IF EXISTS actions_access ON public.actions;
CREATE POLICY actions_access ON public.actions FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS item_progress_access ON public.item_progress;
CREATE POLICY item_progress_access ON public.item_progress FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS schedules_access ON public.schedules;
CREATE POLICY schedules_access ON public.schedules FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS se_access ON public.schedule_executions;
CREATE POLICY se_access ON public.schedule_executions FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS webhook_handlers_system_admin ON public.webhook_handlers;
CREATE POLICY webhook_handlers_system_admin ON public.webhook_handlers FOR ALL
  USING (public.person_is_system_admin(public.current_actor_id()))
  WITH CHECK (public.person_is_system_admin(public.current_actor_id()));
-- CIL[DOC-VECTOR type="context" content="purpose='Finish actor-resolution normalization and close anonymous/user-metadata access bypasses.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Anonymous PostgREST access to actions/item_progress/schedules/schedule_executions is revoked; webhook_handlers admin check now uses role table" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Depends on public.current_actor_id and public.person_is_system_admin from 002" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="Any flow relying on unauthenticated access to these tables must authenticate; service_role is unaffected" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/043_policy_actor_cleanup.sql:policy_actor_cleanup:file"]
