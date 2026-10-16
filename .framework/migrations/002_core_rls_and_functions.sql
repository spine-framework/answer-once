-- CIL[BEGIN stable_id="~/.framework/migrations/002_core_rls_and_functions.sql:core_rls_and_functions:file" type="file" identity="core_rls_and_functions" parent="~/.framework/migrations/002_core_rls_and_functions.sql"]
-- CIL[DOC-MACRO purpose="Consolidated Spine v2 RLS policies, auth helper functions, foreign key constraints, and updated_at triggers for tenant-isolated database access."]
-- CIL[DOC-RESPONSIBILITY responsibility="Defines the core database security and integrity layer: accessibility functions, automatic account-path maintenance, referential integrity, row-level security policies, and updated_at trigger wiring."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/002_core_rls_and_functions.sql"]
-- CIL[DOC-CONTRACT inputs="N/A (migration script)" outputs="Functions, triggers, foreign keys, and RLS policies in the public schema" errors="Migration execution errors; RLS or FK violations if schema/data invariants are broken" side_effects="Creates or replaces database objects, enables RLS on referenced tables, modifies the constraint set"]
-- CIL[DOC-MICRO logic_summary="Implements get_accessible_accounts recursively, current_actor_id resolution, person_is_system_admin check, update_account_paths trigger, set_updated_at trigger, foreign key constraints across core tables, and per-table RLS policies using the helper functions." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Spine v2 consolidated RLS and functions
-- Auth/RLS helper functions, foreign keys, and tenant-isolation policies.

CREATE OR REPLACE FUNCTION public.get_accessible_accounts(actor_id uuid)
RETURNS TABLE (account_id uuid) AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.people p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = actor_id AND r.slug = 'system_admin'
  ) THEN
    RETURN QUERY SELECT a.id FROM public.accounts a;
    RETURN;
  END IF;
  RETURN QUERY
  WITH RECURSIVE account_tree AS (
    SELECT p.account_id as id FROM public.people p WHERE p.id = actor_id
    UNION ALL
    SELECT ap.descendant_id
    FROM public.account_paths ap
    JOIN account_tree at ON ap.ancestor_id = at.id
  )
  SELECT id FROM account_tree;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.current_actor_id()
RETURNS uuid AS $$
DECLARE
  v_auth_id UUID;
  v_person_id UUID;
BEGIN
  v_auth_id := auth.uid();
  
  SELECT p.id INTO v_person_id
  FROM public.people p
  WHERE p.auth_uid = v_auth_id AND p.is_active = true
  LIMIT 1;
  
  RETURN v_person_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
CREATE OR REPLACE FUNCTION public.person_is_system_admin(person_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.people p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = person_uuid AND r.slug = 'system_admin'
  );
END;
$$ LANGUAGE plpgsql STABLE;
CREATE OR REPLACE FUNCTION public.update_account_paths()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_id IS NOT NULL THEN
      INSERT INTO public.account_paths (ancestor_id, descendant_id, depth)
      SELECT ancestor_id, NEW.id, depth + 1 FROM public.account_paths WHERE descendant_id = NEW.parent_id;
      INSERT INTO public.account_paths (ancestor_id, descendant_id, depth) VALUES (NEW.parent_id, NEW.id, 1);
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.parent_id IS DISTINCT FROM NEW.parent_id THEN
    DELETE FROM public.account_paths WHERE descendant_id = NEW.id;
    IF NEW.parent_id IS NOT NULL THEN
      INSERT INTO public.account_paths (ancestor_id, descendant_id, depth)
      SELECT ancestor_id, NEW.id, depth + 1 FROM public.account_paths WHERE descendant_id = NEW.parent_id;
      INSERT INTO public.account_paths (ancestor_id, descendant_id, depth) VALUES (NEW.parent_id, NEW.id, 1);
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.account_paths WHERE descendant_id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS account_paths_trigger ON public.accounts;
CREATE TRIGGER account_paths_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_account_paths();
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS fk_accounts_parent;
ALTER TABLE public.accounts ADD CONSTRAINT fk_accounts_parent 
  FOREIGN KEY (parent_id) REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS fk_accounts_type;
ALTER TABLE public.accounts ADD CONSTRAINT fk_accounts_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS fk_accounts_app;
ALTER TABLE public.accounts ADD CONSTRAINT fk_accounts_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS fk_accounts_created_by;
ALTER TABLE public.accounts ADD CONSTRAINT fk_accounts_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS fk_accounts_updated_by;
ALTER TABLE public.accounts ADD CONSTRAINT fk_accounts_updated_by 
  FOREIGN KEY (updated_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.people DROP CONSTRAINT IF EXISTS people_account_id_fkey;
ALTER TABLE public.people ADD CONSTRAINT people_account_id_fkey 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.people DROP CONSTRAINT IF EXISTS people_app_id_fkey;
ALTER TABLE public.people ADD CONSTRAINT people_app_id_fkey 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.people DROP CONSTRAINT IF EXISTS people_role_id_fkey;
ALTER TABLE public.people ADD CONSTRAINT people_role_id_fkey 
  FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;
ALTER TABLE public.people DROP CONSTRAINT IF EXISTS people_type_id_fkey;
ALTER TABLE public.people ADD CONSTRAINT people_type_id_fkey 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.people DROP CONSTRAINT IF EXISTS people_created_by_fkey;
ALTER TABLE public.people ADD CONSTRAINT people_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.types DROP CONSTRAINT IF EXISTS fk_types_app;
ALTER TABLE public.types ADD CONSTRAINT fk_types_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.apps DROP CONSTRAINT IF EXISTS fk_apps_account;
ALTER TABLE public.apps ADD CONSTRAINT fk_apps_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.apps DROP CONSTRAINT IF EXISTS fk_apps_owner_account;
ALTER TABLE public.apps ADD CONSTRAINT fk_apps_owner_account 
  FOREIGN KEY (owner_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS fk_roles_app;
ALTER TABLE public.roles ADD CONSTRAINT fk_roles_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS fk_roles_account;
ALTER TABLE public.roles ADD CONSTRAINT fk_roles_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS fk_items_type;
ALTER TABLE public.items ADD CONSTRAINT fk_items_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS fk_items_account;
ALTER TABLE public.items ADD CONSTRAINT fk_items_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS fk_items_app;
ALTER TABLE public.items ADD CONSTRAINT fk_items_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS fk_items_created_by;
ALTER TABLE public.items ADD CONSTRAINT fk_items_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS fk_items_updated_by;
ALTER TABLE public.items ADD CONSTRAINT fk_items_updated_by 
  FOREIGN KEY (updated_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.threads DROP CONSTRAINT IF EXISTS fk_threads_type;
ALTER TABLE public.threads ADD CONSTRAINT fk_threads_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.threads DROP CONSTRAINT IF EXISTS fk_threads_account;
ALTER TABLE public.threads ADD CONSTRAINT fk_threads_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.threads DROP CONSTRAINT IF EXISTS fk_threads_created_by;
ALTER TABLE public.threads ADD CONSTRAINT fk_threads_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.threads DROP CONSTRAINT IF EXISTS fk_threads_updated_by;
ALTER TABLE public.threads ADD CONSTRAINT fk_threads_updated_by 
  FOREIGN KEY (updated_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_type;
ALTER TABLE public.messages ADD CONSTRAINT fk_messages_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_account;
ALTER TABLE public.messages ADD CONSTRAINT fk_messages_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_thread;
ALTER TABLE public.messages ADD CONSTRAINT fk_messages_thread 
  FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE CASCADE;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_created_by;
ALTER TABLE public.messages ADD CONSTRAINT fk_messages_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.prompt_configs DROP CONSTRAINT IF EXISTS fk_prompt_configs_type;
ALTER TABLE public.prompt_configs ADD CONSTRAINT fk_prompt_configs_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.prompt_configs DROP CONSTRAINT IF EXISTS fk_prompt_configs_account;
ALTER TABLE public.prompt_configs ADD CONSTRAINT fk_prompt_configs_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.prompt_configs DROP CONSTRAINT IF EXISTS fk_prompt_configs_app;
ALTER TABLE public.prompt_configs ADD CONSTRAINT fk_prompt_configs_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.prompt_configs DROP CONSTRAINT IF EXISTS fk_prompt_configs_created_by;
ALTER TABLE public.prompt_configs ADD CONSTRAINT fk_prompt_configs_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.prompt_configs DROP CONSTRAINT IF EXISTS fk_prompt_configs_updated_by;
ALTER TABLE public.prompt_configs ADD CONSTRAINT fk_prompt_configs_updated_by 
  FOREIGN KEY (updated_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.pipeline_executions DROP CONSTRAINT IF EXISTS fk_pipeline_executions_pipeline;
ALTER TABLE public.pipeline_executions ADD CONSTRAINT fk_pipeline_executions_pipeline 
  FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id) ON DELETE CASCADE;
ALTER TABLE public.pipeline_executions DROP CONSTRAINT IF EXISTS fk_pipeline_executions_account;
ALTER TABLE public.pipeline_executions ADD CONSTRAINT fk_pipeline_executions_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.pipeline_executions DROP CONSTRAINT IF EXISTS fk_pipeline_executions_app;
ALTER TABLE public.pipeline_executions ADD CONSTRAINT fk_pipeline_executions_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.pipeline_executions DROP CONSTRAINT IF EXISTS fk_pipeline_executions_created_by;
ALTER TABLE public.pipeline_executions ADD CONSTRAINT fk_pipeline_executions_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.test_runs DROP CONSTRAINT IF EXISTS fk_test_runs_pipeline_execution;
ALTER TABLE public.test_runs ADD CONSTRAINT fk_test_runs_pipeline_execution 
  FOREIGN KEY (pipeline_execution_id) REFERENCES public.pipeline_executions(id) ON DELETE CASCADE;
ALTER TABLE public.test_runs DROP CONSTRAINT IF EXISTS fk_test_runs_account;
ALTER TABLE public.test_runs ADD CONSTRAINT fk_test_runs_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.test_runs DROP CONSTRAINT IF EXISTS fk_test_runs_app;
ALTER TABLE public.test_runs ADD CONSTRAINT fk_test_runs_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.test_runs DROP CONSTRAINT IF EXISTS fk_test_runs_created_by;
ALTER TABLE public.test_runs ADD CONSTRAINT fk_test_runs_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS fk_invites_type;
ALTER TABLE public.invites ADD CONSTRAINT fk_invites_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS fk_invites_account;
ALTER TABLE public.invites ADD CONSTRAINT fk_invites_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS fk_invites_app;
ALTER TABLE public.invites ADD CONSTRAINT fk_invites_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS fk_invites_created_by;
ALTER TABLE public.invites ADD CONSTRAINT fk_invites_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS fk_api_keys_type;
ALTER TABLE public.api_keys ADD CONSTRAINT fk_api_keys_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS fk_api_keys_account;
ALTER TABLE public.api_keys ADD CONSTRAINT fk_api_keys_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS fk_api_keys_app;
ALTER TABLE public.api_keys ADD CONSTRAINT fk_api_keys_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS fk_api_keys_created_by;
ALTER TABLE public.api_keys ADD CONSTRAINT fk_api_keys_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS fk_integrations_type;
ALTER TABLE public.integrations ADD CONSTRAINT fk_integrations_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS fk_integrations_account;
ALTER TABLE public.integrations ADD CONSTRAINT fk_integrations_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS fk_integrations_app;
ALTER TABLE public.integrations ADD CONSTRAINT fk_integrations_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS fk_integrations_created_by;
ALTER TABLE public.integrations ADD CONSTRAINT fk_integrations_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.ai_agents DROP CONSTRAINT IF EXISTS fk_ai_agents_type;
ALTER TABLE public.ai_agents ADD CONSTRAINT fk_ai_agents_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.ai_agents DROP CONSTRAINT IF EXISTS fk_ai_agents_account;
ALTER TABLE public.ai_agents ADD CONSTRAINT fk_ai_agents_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.ai_agents DROP CONSTRAINT IF EXISTS fk_ai_agents_app;
ALTER TABLE public.ai_agents ADD CONSTRAINT fk_ai_agents_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.ai_agents DROP CONSTRAINT IF EXISTS fk_ai_agents_created_by;
ALTER TABLE public.ai_agents ADD CONSTRAINT fk_ai_agents_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.item_progress DROP CONSTRAINT IF EXISTS fk_item_progress_item;
ALTER TABLE public.item_progress ADD CONSTRAINT fk_item_progress_item 
  FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
ALTER TABLE public.item_progress DROP CONSTRAINT IF EXISTS fk_item_progress_account;
ALTER TABLE public.item_progress ADD CONSTRAINT fk_item_progress_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.item_progress DROP CONSTRAINT IF EXISTS fk_item_progress_app;
ALTER TABLE public.item_progress ADD CONSTRAINT fk_item_progress_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.item_progress DROP CONSTRAINT IF EXISTS fk_item_progress_created_by;
ALTER TABLE public.item_progress ADD CONSTRAINT fk_item_progress_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS fk_logs_type;
ALTER TABLE public.logs ADD CONSTRAINT fk_logs_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS fk_logs_account;
ALTER TABLE public.logs ADD CONSTRAINT fk_logs_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS fk_logs_app;
ALTER TABLE public.logs ADD CONSTRAINT fk_logs_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS fk_logs_created_by;
ALTER TABLE public.logs ADD CONSTRAINT fk_logs_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.observability DROP CONSTRAINT IF EXISTS fk_observability_type;
ALTER TABLE public.observability ADD CONSTRAINT fk_observability_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.observability DROP CONSTRAINT IF EXISTS fk_observability_account;
ALTER TABLE public.observability ADD CONSTRAINT fk_observability_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.observability DROP CONSTRAINT IF EXISTS fk_observability_app;
ALTER TABLE public.observability ADD CONSTRAINT fk_observability_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.observability DROP CONSTRAINT IF EXISTS fk_observability_created_by;
ALTER TABLE public.observability ADD CONSTRAINT fk_observability_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.timers DROP CONSTRAINT IF EXISTS fk_timers_type;
ALTER TABLE public.timers ADD CONSTRAINT fk_timers_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.timers DROP CONSTRAINT IF EXISTS fk_timers_account;
ALTER TABLE public.timers ADD CONSTRAINT fk_timers_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.timers DROP CONSTRAINT IF EXISTS fk_timers_app;
ALTER TABLE public.timers ADD CONSTRAINT fk_timers_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.timers DROP CONSTRAINT IF EXISTS fk_timers_created_by;
ALTER TABLE public.timers ADD CONSTRAINT fk_timers_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.triggers DROP CONSTRAINT IF EXISTS fk_triggers_type;
ALTER TABLE public.triggers ADD CONSTRAINT fk_triggers_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.triggers DROP CONSTRAINT IF EXISTS fk_triggers_account;
ALTER TABLE public.triggers ADD CONSTRAINT fk_triggers_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.triggers DROP CONSTRAINT IF EXISTS fk_triggers_app;
ALTER TABLE public.triggers ADD CONSTRAINT fk_triggers_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.triggers DROP CONSTRAINT IF EXISTS fk_triggers_created_by;
ALTER TABLE public.triggers ADD CONSTRAINT fk_triggers_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS fk_roles_type;
ALTER TABLE public.roles ADD CONSTRAINT fk_roles_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS fk_roles_created_by;
ALTER TABLE public.roles ADD CONSTRAINT fk_roles_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.pipelines DROP CONSTRAINT IF EXISTS fk_pipelines_type;
ALTER TABLE public.pipelines ADD CONSTRAINT fk_pipelines_type 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE RESTRICT;
ALTER TABLE public.pipelines DROP CONSTRAINT IF EXISTS fk_pipelines_account;
ALTER TABLE public.pipelines ADD CONSTRAINT fk_pipelines_account 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.pipelines DROP CONSTRAINT IF EXISTS fk_pipelines_app;
ALTER TABLE public.pipelines ADD CONSTRAINT fk_pipelines_app 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.pipelines DROP CONSTRAINT IF EXISTS fk_pipelines_created_by;
ALTER TABLE public.pipelines ADD CONSTRAINT fk_pipelines_created_by 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.people DROP CONSTRAINT IF EXISTS people_role_id_fkey;
ALTER TABLE public.people ADD CONSTRAINT people_role_id_fkey 
  FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_app_id_fkey;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_app_id_fkey 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_type_id_fkey;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_type_id_fkey 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE SET NULL;
ALTER TABLE public.people DROP CONSTRAINT IF EXISTS people_app_id_fkey;
ALTER TABLE public.people ADD CONSTRAINT people_app_id_fkey 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.people DROP CONSTRAINT IF EXISTS people_type_id_fkey;
ALTER TABLE public.people ADD CONSTRAINT people_type_id_fkey 
  FOREIGN KEY (type_id) REFERENCES public.types(id) ON DELETE SET NULL;
ALTER TABLE public.types DROP CONSTRAINT IF EXISTS types_app_id_fkey;
ALTER TABLE public.types ADD CONSTRAINT types_app_id_fkey 
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.apps DROP CONSTRAINT IF EXISTS apps_account_id_fkey;
ALTER TABLE public.apps ADD CONSTRAINT apps_account_id_fkey 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.apps DROP CONSTRAINT IF EXISTS apps_owner_account_id_fkey;
ALTER TABLE public.apps ADD CONSTRAINT apps_owner_account_id_fkey 
  FOREIGN KEY (owner_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_created_by_fkey;
ALTER TABLE public.items ADD CONSTRAINT items_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_updated_by_fkey;
ALTER TABLE public.items ADD CONSTRAINT items_updated_by_fkey 
  FOREIGN KEY (updated_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.threads DROP CONSTRAINT IF EXISTS threads_created_by_fkey;
ALTER TABLE public.threads ADD CONSTRAINT threads_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.threads DROP CONSTRAINT IF EXISTS threads_updated_by_fkey;
ALTER TABLE public.threads ADD CONSTRAINT threads_updated_by_fkey 
  FOREIGN KEY (updated_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_created_by_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.prompt_configs DROP CONSTRAINT IF EXISTS prompt_configs_created_by_fkey;
ALTER TABLE public.prompt_configs ADD CONSTRAINT prompt_configs_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.prompt_configs DROP CONSTRAINT IF EXISTS prompt_configs_updated_by_fkey;
ALTER TABLE public.prompt_configs ADD CONSTRAINT prompt_configs_updated_by_fkey 
  FOREIGN KEY (updated_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.pipeline_executions DROP CONSTRAINT IF EXISTS pipeline_executions_created_by_fkey;
ALTER TABLE public.pipeline_executions ADD CONSTRAINT pipeline_executions_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.test_runs DROP CONSTRAINT IF EXISTS test_runs_created_by_fkey;
ALTER TABLE public.test_runs ADD CONSTRAINT test_runs_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_created_by_fkey;
ALTER TABLE public.invites ADD CONSTRAINT invites_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_created_by_fkey;
ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_created_by_fkey;
ALTER TABLE public.integrations ADD CONSTRAINT integrations_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.ai_agents DROP CONSTRAINT IF EXISTS ai_agents_created_by_fkey;
ALTER TABLE public.ai_agents ADD CONSTRAINT ai_agents_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.item_progress DROP CONSTRAINT IF EXISTS item_progress_created_by_fkey;
ALTER TABLE public.item_progress ADD CONSTRAINT item_progress_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_created_by_fkey;
ALTER TABLE public.logs ADD CONSTRAINT logs_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.observability DROP CONSTRAINT IF EXISTS observability_created_by_fkey;
ALTER TABLE public.observability ADD CONSTRAINT observability_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.timers DROP CONSTRAINT IF EXISTS timers_created_by_fkey;
ALTER TABLE public.timers ADD CONSTRAINT timers_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.triggers DROP CONSTRAINT IF EXISTS triggers_created_by_fkey;
ALTER TABLE public.triggers ADD CONSTRAINT triggers_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_created_by_fkey;
ALTER TABLE public.roles ADD CONSTRAINT roles_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.pipelines DROP CONSTRAINT IF EXISTS pipelines_created_by_fkey;
ALTER TABLE public.pipelines ADD CONSTRAINT pipelines_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
DROP TRIGGER IF EXISTS set_updated_at_accounts ON public.accounts;
CREATE TRIGGER set_updated_at_accounts
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_people ON public.people;
CREATE TRIGGER set_updated_at_people
BEFORE UPDATE ON public.people
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_types ON public.types;
CREATE TRIGGER set_updated_at_types
BEFORE UPDATE ON public.types
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_apps ON public.apps;
CREATE TRIGGER set_updated_at_apps
BEFORE UPDATE ON public.apps
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_items ON public.items;
CREATE TRIGGER set_updated_at_items
BEFORE UPDATE ON public.items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_threads ON public.threads;
CREATE TRIGGER set_updated_at_threads
BEFORE UPDATE ON public.threads
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_messages ON public.messages;
CREATE TRIGGER set_updated_at_messages
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_prompt_configs ON public.prompt_configs;
CREATE TRIGGER set_updated_at_prompt_configs
BEFORE UPDATE ON public.prompt_configs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_pipeline_executions ON public.pipeline_executions;
CREATE TRIGGER set_updated_at_pipeline_executions
BEFORE UPDATE ON public.pipeline_executions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_test_runs ON public.test_runs;
CREATE TRIGGER set_updated_at_test_runs
BEFORE UPDATE ON public.test_runs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_invites ON public.invites;
CREATE TRIGGER set_updated_at_invites
BEFORE UPDATE ON public.invites
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_api_keys ON public.api_keys;
CREATE TRIGGER set_updated_at_api_keys
BEFORE UPDATE ON public.api_keys
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_integrations ON public.integrations;
CREATE TRIGGER set_updated_at_integrations
BEFORE UPDATE ON public.integrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_ai_agents ON public.ai_agents;
CREATE TRIGGER set_updated_at_ai_agents
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_item_progress ON public.item_progress;
CREATE TRIGGER set_updated_at_item_progress
BEFORE UPDATE ON public.item_progress
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_logs ON public.logs;
CREATE TRIGGER set_updated_at_logs
BEFORE UPDATE ON public.logs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_observability ON public.observability;
CREATE TRIGGER set_updated_at_observability
BEFORE UPDATE ON public.observability
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_timers ON public.timers;
CREATE TRIGGER set_updated_at_timers
BEFORE UPDATE ON public.timers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_triggers ON public.triggers;
CREATE TRIGGER set_updated_at_triggers
BEFORE UPDATE ON public.triggers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_roles ON public.roles;
CREATE TRIGGER set_updated_at_roles
BEFORE UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_pipelines ON public.pipelines;
CREATE TRIGGER set_updated_at_pipelines
BEFORE UPDATE ON public.pipelines
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_account_paths ON public.account_paths;
CREATE TRIGGER set_updated_at_account_paths
BEFORE UPDATE ON public.account_paths
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- RLS policies

CREATE POLICY accounts_access ON public.accounts FOR ALL
  USING (id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))
         );

CREATE POLICY people_access ON public.people FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))
         );

CREATE POLICY types_access ON public.types FOR ALL
  USING (public.current_actor_id() IS NOT NULL OR true);

CREATE POLICY apps_access ON public.apps FOR ALL
  USING (is_system = true OR owner_account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY roles_read ON public.roles FOR SELECT USING (true);

CREATE POLICY roles_modify ON public.roles FOR ALL
  USING ((is_system = true AND public.person_is_system_admin(public.current_actor_id()))
         OR is_system = false );

CREATE POLICY items_access ON public.items FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id()))
         );

CREATE POLICY threads_access ON public.threads FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY messages_access ON public.messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.threads t
                 WHERE t.id = messages.thread_id
                 AND t.account_id IN (SELECT public.get_accessible_accounts(auth.uid())))
         );

CREATE POLICY links_access ON public.links FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY attachments_access ON public.attachments FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY watchers_access ON public.watchers FOR ALL
  USING (auth.uid() IS NOT NULL OR true);

CREATE POLICY link_types_access ON public.link_types FOR ALL
  USING (app_id IS NULL
         OR EXISTS (SELECT 1 FROM public.apps a WHERE a.id = link_types.app_id
                    AND a.owner_account_id IN (SELECT public.get_accessible_accounts(auth.uid())))
         );

CREATE POLICY pipelines_access ON public.pipelines FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY pe_access ON public.pipeline_executions FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY triggers_access ON public.triggers FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY te_access ON public.trigger_executions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.triggers t
                 WHERE t.id = trigger_executions.trigger_id
                 AND t.account_id IN (SELECT public.get_accessible_accounts(auth.uid())))
         );

CREATE POLICY timers_access ON public.timers FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY ai_agents_access ON public.ai_agents FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY embeddings_access ON public.embeddings FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY integrations_access ON public.integrations FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );

CREATE POLICY prompt_configs_access ON public.prompt_configs FOR ALL
  USING ((app_id IS NULL OR EXISTS (SELECT 1 FROM public.apps a
          WHERE a.id = prompt_configs.app_id
          AND (a.is_system = true
               OR a.owner_account_id IN (SELECT public.get_accessible_accounts(auth.uid())))))
         );

CREATE POLICY api_keys_access ON public.api_keys FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         OR id = auth.uid() );

CREATE POLICY logs_access ON public.logs FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         );
-- CIL[DOC-VECTOR type="context" content="purpose='Consolidated Spine v2 RLS policies, auth helper functions, foreign key constraints, and updated_at triggers for tenant-isolated database access.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/002_core_rls_and_functions.sql:core_rls_and_functions:file"]
