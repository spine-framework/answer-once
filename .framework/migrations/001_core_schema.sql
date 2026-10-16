-- CIL[BEGIN stable_id="~/.framework/migrations/001_core_schema.sql:core_schema_migration:file" type="file" identity="core_schema_migration" parent="~/.framework/migrations/001_core_schema.sql"]
-- CIL[DOC-MACRO purpose="Spine v2 consolidated core schema migration"]
-- CIL[DOC-RESPONSIBILITY responsibility="Creates base tables, extensions, indexes, triggers, seed data, and enables RLS for the Spine v2 runtime"]
-- CIL[DOC-CONTEXT module="core_schema" layer="database" related_files=".framework/migrations/001_core_schema.sql"]
-- CIL[DOC-CONTRACT inputs="SQL execution context with public schema, uuid, pgvector, and gen_random_uuid support" outputs="Core tables, indexes, triggers, updated_at function, seed apps, and RLS enabled" errors="SQL errors if tables already exist with incompatible definitions or permissions are insufficient" side_effects="Creates or extends public schema objects and enables row level security on tenant tables"]
-- CIL[DOC-MICRO logic_summary="Defines runtime tables for accounts, people, types, apps, roles, items, threads, messages, links, attachments, watchers, link types, pipelines, executions, triggers, timers, configs, integrations, logs, observability, tests, embeddings, ai agents, invites, api keys, alerts, progress, account paths, and system settings. Adds indexes, updated_at triggers, seed app rows, and enables RLS." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Spine v2 consolidated core schema
-- Base tables, extensions, indexes, triggers, and RLS enablements.

COMMENT ON SCHEMA public IS 'Spine v2 consolidated schema - runtime entities foundation';

CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid, type_id uuid NOT NULL, slug text NOT NULL UNIQUE,
  display_name text NOT NULL, description text,
  data jsonb DEFAULT '{}', is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  app_id uuid, created_by uuid, updated_by uuid,
  logs_retention_days int DEFAULT 30,
  observability_retention_days int DEFAULT 90
);
CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid UNIQUE, email text UNIQUE NOT NULL, full_name text NOT NULL,
  avatar_url text, phone text, status text DEFAULT 'active',
  data jsonb DEFAULT '{}', is_active boolean DEFAULT true, account_id uuid NOT NULL,
  app_id uuid, role_id uuid, type_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  created_by uuid
);
CREATE TABLE IF NOT EXISTS public.types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, kind text NOT NULL, slug text NOT NULL, name text NOT NULL,
  description text, icon text, color text,
  design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  ownership text DEFAULT 'tenant', is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(app_id, kind, slug)
);
CREATE TABLE IF NOT EXISTS public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, name text NOT NULL, description text,
  icon text, color text, version text DEFAULT '1.0.0',
  app_type text DEFAULT 'system', source text DEFAULT 'builtin',
  config jsonb DEFAULT '{}', nav_items jsonb DEFAULT '[]',
  min_role text, integration_deps jsonb DEFAULT '[]', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  account_id uuid, owner_account_id uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  route_prefix text,
  preview_domain text,
  prod_domain text,
  renderer text NOT NULL DEFAULT 'generic',
  CONSTRAINT chk_apps_renderer CHECK (renderer IN ('generic', 'custom', 'none'))
);
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL, name text NOT NULL, description text,
  permissions jsonb DEFAULT '[]', is_system boolean DEFAULT false,
  is_active boolean DEFAULT true, is_protected boolean DEFAULT false,
  app_id uuid, account_id uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  type_id uuid,
  created_by uuid,
  UNIQUE(slug)
);
CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL, account_id uuid NOT NULL, app_id uuid,
  title text, description text, status text DEFAULT 'active',
  data jsonb DEFAULT '{}', is_active boolean DEFAULT true,
  design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  created_by uuid, updated_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL, account_id uuid NOT NULL, app_id uuid,
  title text, target_type text NOT NULL, target_id uuid NOT NULL,
  visibility text DEFAULT 'internal', status text DEFAULT 'open',
  data jsonb DEFAULT '{}', is_active boolean DEFAULT true,
  design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  created_by uuid, updated_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  CONSTRAINT threads_unique_target_visibility UNIQUE (target_type, target_id, visibility)
);
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL, thread_id uuid NOT NULL,
  account_id uuid REFERENCES public.accounts(id),
  content text NOT NULL, direction text DEFAULT 'outbound',
  sequence integer NOT NULL, visibility text DEFAULT 'internal',
  data jsonb DEFAULT '{}', is_active boolean DEFAULT true,
  design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  person_id uuid, created_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(thread_id, sequence)
);
CREATE TABLE IF NOT EXISTS public.links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL, account_id uuid NOT NULL, link_type_id uuid,
  source_type text NOT NULL, source_id uuid NOT NULL,
  target_type text NOT NULL, target_id uuid NOT NULL,
  link_type text, metadata jsonb DEFAULT '{}',
  data jsonb DEFAULT '{}', design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  created_by uuid, updated_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(source_type, source_id, target_type, target_id, link_type_id)
);
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL, account_id uuid NOT NULL,
  filename text NOT NULL, file_size integer, mime_type text,
  storage_path text, storage_provider text DEFAULT 'supabase',
  metadata jsonb DEFAULT '{}', data jsonb DEFAULT '{}',
  design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  uploaded_by uuid, created_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.watchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL, account_id uuid,
  target_type text NOT NULL, target_id uuid NOT NULL, person_id uuid NOT NULL,
  watch_type text DEFAULT 'all', notification_level text DEFAULT 'all',
  metadata jsonb DEFAULT '{}', data jsonb DEFAULT '{}',
  design_schema jsonb DEFAULT '{}', validation_schema jsonb DEFAULT '{}',
  created_by uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(target_type, target_id, person_id)
);
CREATE TABLE IF NOT EXISTS public.link_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, slug text NOT NULL, name text NOT NULL,
  description text, icon text, color text,
  config jsonb DEFAULT '{}', is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, slug text NOT NULL,
  name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  type_id uuid,
  created_by uuid,
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.pipeline_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL, app_id uuid, account_id uuid,
  status text DEFAULT 'pending', started_at timestamptz,
  completed_at timestamptz, error_message text,
  input_data jsonb DEFAULT '{}', output_data jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}', created_by uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_pipeline_executions_pipeline
    FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS public.triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.trigger_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id uuid NOT NULL, account_id uuid,
  status text DEFAULT 'pending', started_at timestamptz,
  completed_at timestamptz, error_message text,
  input_data jsonb DEFAULT '{}', output_data jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}', created_by uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_trigger_executions_trigger
    FOREIGN KEY (trigger_id) REFERENCES public.triggers(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS public.timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.prompt_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_by uuid, updated_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.integration_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  level text, message text, context jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}', created_by uuid,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.observability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  metric_name text, metric_value numeric, metric_unit text,
  context jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid, pipeline_execution_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  model_id text NOT NULL,
  document_id text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}',
  approved_at timestamptz,
  revoked_at timestamptz,
  content_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(model_id, document_id, chunk_index)
);
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(app_id, slug)
);
CREATE TABLE IF NOT EXISTS public.item_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid, account_id uuid, type_id uuid,
  slug text NOT NULL, name text NOT NULL, description text,
  config jsonb DEFAULT '{}', metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true, is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  item_id uuid NOT NULL,
  created_by uuid,
  UNIQUE(app_id, slug)
);

CREATE TABLE IF NOT EXISTS public.account_paths (
  ancestor_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  descendant_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  depth integer NOT NULL,
  PRIMARY KEY (ancestor_id, descendant_id),
  CONSTRAINT chk_account_paths_no_self CHECK (ancestor_id != descendant_id)
);
CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON public.accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type_id ON public.accounts(type_id);
CREATE INDEX IF NOT EXISTS idx_accounts_slug ON public.accounts(slug);
CREATE INDEX IF NOT EXISTS idx_accounts_app_id ON public.accounts(app_id);
CREATE INDEX IF NOT EXISTS idx_people_account_id ON public.people(account_id);
CREATE INDEX IF NOT EXISTS idx_people_auth_uid ON public.people(auth_uid);
CREATE INDEX IF NOT EXISTS idx_people_email ON public.people(email);
CREATE INDEX IF NOT EXISTS idx_people_app_id ON public.people(app_id);
CREATE INDEX IF NOT EXISTS idx_people_role_id ON public.people(role_id);
CREATE INDEX IF NOT EXISTS idx_people_type_id ON public.people(type_id);
CREATE INDEX IF NOT EXISTS idx_types_app_id ON public.types(app_id);
CREATE INDEX IF NOT EXISTS idx_types_kind ON public.types(kind);
CREATE INDEX IF NOT EXISTS idx_types_slug ON public.types(slug);
CREATE INDEX IF NOT EXISTS idx_apps_account_id ON public.apps(account_id);
CREATE INDEX IF NOT EXISTS idx_apps_slug ON public.apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_app_type ON public.apps(app_type);
CREATE INDEX IF NOT EXISTS idx_roles_app_id ON public.roles(app_id);
CREATE INDEX IF NOT EXISTS idx_roles_account_id ON public.roles(account_id);
CREATE INDEX IF NOT EXISTS idx_roles_slug ON public.roles(slug);
CREATE INDEX IF NOT EXISTS idx_items_type_id ON public.items(type_id);
CREATE INDEX IF NOT EXISTS idx_items_account_id ON public.items(account_id);
CREATE INDEX IF NOT EXISTS idx_items_app_id ON public.items(app_id);
CREATE INDEX IF NOT EXISTS idx_items_created_by ON public.items(created_by);
CREATE INDEX IF NOT EXISTS idx_items_updated_by ON public.items(updated_by);
CREATE INDEX IF NOT EXISTS idx_threads_type_id ON public.threads(type_id);
CREATE INDEX IF NOT EXISTS idx_threads_account_id ON public.threads(account_id);
CREATE INDEX IF NOT EXISTS idx_threads_app_id ON public.threads(app_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_by ON public.threads(created_by);
CREATE INDEX IF NOT EXISTS idx_threads_updated_by ON public.threads(updated_by);
CREATE INDEX IF NOT EXISTS idx_messages_type_id ON public.messages(type_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_account_id ON public.messages(account_id);
CREATE INDEX IF NOT EXISTS idx_messages_person_id ON public.messages(person_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_by ON public.messages(created_by);
CREATE INDEX IF NOT EXISTS idx_links_type_id ON public.links(type_id);
CREATE INDEX IF NOT EXISTS idx_links_account_id ON public.links(account_id);
CREATE INDEX IF NOT EXISTS idx_links_source ON public.links(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_links_target ON public.links(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_links_link_type_id ON public.links(link_type_id);
CREATE INDEX IF NOT EXISTS idx_links_created_by ON public.links(created_by);
CREATE INDEX IF NOT EXISTS idx_links_updated_by ON public.links(updated_by);
CREATE INDEX IF NOT EXISTS idx_attachments_type_id ON public.attachments(type_id);
CREATE INDEX IF NOT EXISTS idx_attachments_account_id ON public.attachments(account_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON public.attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_created_by ON public.attachments(created_by);
CREATE INDEX IF NOT EXISTS idx_watchers_type_id ON public.watchers(type_id);
CREATE INDEX IF NOT EXISTS idx_watchers_account_id ON public.watchers(account_id);
CREATE INDEX IF NOT EXISTS idx_watchers_target ON public.watchers(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_watchers_person_id ON public.watchers(person_id);
CREATE INDEX IF NOT EXISTS idx_watchers_created_by ON public.watchers(created_by);
CREATE INDEX IF NOT EXISTS idx_link_types_app_id ON public.link_types(app_id);
CREATE INDEX IF NOT EXISTS idx_link_types_slug ON public.link_types(slug);
CREATE INDEX IF NOT EXISTS idx_pipelines_app_id ON public.pipelines(app_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_account_id ON public.pipelines(account_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_slug ON public.pipelines(slug);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_pipeline_id ON public.pipeline_executions(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_account_id ON public.pipeline_executions(account_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_status ON public.pipeline_executions(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_created_by ON public.pipeline_executions(created_by);
CREATE INDEX IF NOT EXISTS idx_triggers_app_id ON public.triggers(app_id);
CREATE INDEX IF NOT EXISTS idx_triggers_account_id ON public.triggers(account_id);
CREATE INDEX IF NOT EXISTS idx_triggers_type_id ON public.triggers(type_id);
CREATE INDEX IF NOT EXISTS idx_triggers_slug ON public.triggers(slug);
CREATE INDEX IF NOT EXISTS idx_timers_app_id ON public.timers(app_id);
CREATE INDEX IF NOT EXISTS idx_timers_account_id ON public.timers(account_id);
CREATE INDEX IF NOT EXISTS idx_timers_type_id ON public.timers(type_id);
CREATE INDEX IF NOT EXISTS idx_timers_slug ON public.timers(slug);
CREATE INDEX IF NOT EXISTS idx_prompt_configs_app_id ON public.prompt_configs(app_id);
CREATE INDEX IF NOT EXISTS idx_prompt_configs_account_id ON public.prompt_configs(account_id);
CREATE INDEX IF NOT EXISTS idx_prompt_configs_type_id ON public.prompt_configs(type_id);
CREATE INDEX IF NOT EXISTS idx_prompt_configs_slug ON public.prompt_configs(slug);
CREATE INDEX IF NOT EXISTS idx_integrations_app_id ON public.integrations(app_id);
CREATE INDEX IF NOT EXISTS idx_integrations_account_id ON public.integrations(account_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type_id ON public.integrations(type_id);
CREATE INDEX IF NOT EXISTS idx_integrations_slug ON public.integrations(slug);
CREATE INDEX IF NOT EXISTS idx_integration_routes_app_id ON public.integration_routes(app_id);
CREATE INDEX IF NOT EXISTS idx_integration_routes_account_id ON public.integration_routes(account_id);
CREATE INDEX IF NOT EXISTS idx_integration_routes_type_id ON public.integration_routes(type_id);
CREATE INDEX IF NOT EXISTS idx_integration_routes_slug ON public.integration_routes(slug);
CREATE INDEX IF NOT EXISTS idx_logs_app_id ON public.logs(app_id);
CREATE INDEX IF NOT EXISTS idx_logs_account_id ON public.logs(account_id);
CREATE INDEX IF NOT EXISTS idx_logs_type_id ON public.logs(type_id);
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_by ON public.logs(created_by);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at);
CREATE INDEX IF NOT EXISTS idx_observability_app_id ON public.observability(app_id);
CREATE INDEX IF NOT EXISTS idx_observability_account_id ON public.observability(account_id);
CREATE INDEX IF NOT EXISTS idx_observability_type_id ON public.observability(type_id);
CREATE INDEX IF NOT EXISTS idx_observability_metric_name ON public.observability(metric_name);
CREATE INDEX IF NOT EXISTS idx_observability_created_at ON public.observability(created_at);
CREATE INDEX IF NOT EXISTS idx_test_runs_app_id ON public.test_runs(app_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_account_id ON public.test_runs(account_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_type_id ON public.test_runs(type_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_slug ON public.test_runs(slug);
CREATE INDEX IF NOT EXISTS idx_test_cases_app_id ON public.test_cases(app_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_account_id ON public.test_cases(account_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_type_id ON public.test_cases(type_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_slug ON public.test_cases(slug);
CREATE INDEX IF NOT EXISTS idx_ai_agents_app_id ON public.ai_agents(app_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_account_id ON public.ai_agents(account_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type_id ON public.ai_agents(type_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_slug ON public.ai_agents(slug);
CREATE INDEX IF NOT EXISTS idx_invites_app_id ON public.invites(app_id);
CREATE INDEX IF NOT EXISTS idx_invites_account_id ON public.invites(account_id);
CREATE INDEX IF NOT EXISTS idx_invites_type_id ON public.invites(type_id);
CREATE INDEX IF NOT EXISTS idx_invites_slug ON public.invites(slug);
CREATE INDEX IF NOT EXISTS idx_api_keys_app_id ON public.api_keys(app_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_account_id ON public.api_keys(account_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_type_id ON public.api_keys(type_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_slug ON public.api_keys(slug);
CREATE INDEX IF NOT EXISTS idx_alerts_app_id ON public.alerts(app_id);
CREATE INDEX IF NOT EXISTS idx_alerts_account_id ON public.alerts(account_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type_id ON public.alerts(type_id);
CREATE INDEX IF NOT EXISTS idx_alerts_slug ON public.alerts(slug);
CREATE INDEX IF NOT EXISTS idx_item_progress_app_id ON public.item_progress(app_id);
CREATE INDEX IF NOT EXISTS idx_item_progress_account_id ON public.item_progress(account_id);
CREATE INDEX IF NOT EXISTS idx_item_progress_type_id ON public.item_progress(type_id);
CREATE INDEX IF NOT EXISTS idx_item_progress_slug ON public.item_progress(slug);

CREATE INDEX IF NOT EXISTS idx_account_paths_ancestor ON public.account_paths(ancestor_id);
CREATE INDEX IF NOT EXISTS idx_account_paths_descendant ON public.account_paths(descendant_id);
CREATE OR REPLACE FUNCTION public.updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_types_updated_at
  BEFORE UPDATE ON public.types
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_threads_updated_at
  BEFORE UPDATE ON public.threads
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_attachments_updated_at
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_watchers_updated_at
  BEFORE UPDATE ON public.watchers
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_link_types_updated_at
  BEFORE UPDATE ON public.link_types
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_pipelines_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_pipeline_executions_updated_at
  BEFORE UPDATE ON public.pipeline_executions
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_triggers_updated_at
  BEFORE UPDATE ON public.triggers
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_timers_updated_at
  BEFORE UPDATE ON public.timers
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_prompt_configs_updated_at
  BEFORE UPDATE ON public.prompt_configs
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_integration_routes_updated_at
  BEFORE UPDATE ON public.integration_routes
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_logs_updated_at
  BEFORE UPDATE ON public.logs
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_observability_updated_at
  BEFORE UPDATE ON public.observability
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_test_runs_updated_at
  BEFORE UPDATE ON public.test_runs
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_test_cases_updated_at
  BEFORE UPDATE ON public.test_cases
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_embeddings_updated_at
  BEFORE UPDATE ON public.embeddings
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_invites_updated_at
  BEFORE UPDATE ON public.invites
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

CREATE TRIGGER set_item_progress_updated_at
  BEFORE UPDATE ON public.item_progress
  FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();

INSERT INTO public.apps (id, slug, name, description, version, app_type, source, is_active, is_system, renderer, route_prefix)
VALUES (
  gen_random_uuid(),
  'spine-core',
  'Spine Core',
  'Core Spine runtime - provides accounts, people, items, threads, messages, links, attachments, watchers',
  '1.0.0',
  'system',
  'builtin',
  true,
  true,
  'none',
  NULL
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.apps (
  id, slug, name, description, icon, color, version,
  app_type, source, config, nav_items, min_role,
  is_active, is_system, route_prefix, renderer
)
VALUES (
  gen_random_uuid(),
  'admin',
  'Admin',
  'Spine system administration interface',
  'settings',
  'slate',
  '1.0.0',
  'system',
  'builtin',
  '{}'::jsonb,
  '[]'::jsonb,
  'system_admin',
  true,
  true,
  '/admin',
  'custom'
)
ON CONFLICT (slug) DO UPDATE SET
  route_prefix = EXCLUDED.route_prefix,
  renderer = EXCLUDED.renderer,
  min_role = EXCLUDED.min_role,
  is_system = EXCLUDED.is_system,
  app_type = EXCLUDED.app_type;
CREATE INDEX IF NOT EXISTS idx_embeddings_account_id ON public.embeddings(account_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_document_id ON public.embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_model_doc ON public.embeddings(model_id, document_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_active ON public.embeddings(account_id, document_id) WHERE approved_at IS NOT NULL AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_embeddings_embedding_hnsw_idx ON public.embeddings USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL DEFAULT 'global',
  scope_id text,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_scope
  ON public.system_settings (key, scope, scope_id)
  WHERE scope_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_global
  ON public.system_settings (key, scope)
  WHERE scope_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings (key);

-- Enable Row Level Security on all tenant tables

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
-- CIL[DOC-VECTOR type="context" content="purpose='Spine v2 consolidated core schema migration'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/001_core_schema.sql:core_schema_migration:file"]
