-- Migration 061: drop duplicate and non-canonical foreign keys
-- CIL[DOC-RESPONSIBILITY responsibility="Remove 26 auto-named *_fkey foreign key constraints that shadow identically-scoped fk_* named constraints (001's inline REFERENCES clauses created them; 002/004/018 re-added the same FKs under fk_* names with DROP CONSTRAINT IF EXISTS fk_* which never matched the auto names). Also drop both roles.created_by->people FKs so people<->roles has a single relationship path."]
-- CIL[DOC-MICRO logic_summary="PostgREST counts every FK between two tables as a candidate relationship for embeds — the duplicates made every unhinted select on these pairs ambiguous ('more than one relationship was found'). Named fk_* constraints are kept as canonical; roles loses BOTH created_by FKs (dev DB has neither; a roles->people path would keep people<->roles ambiguous for role embeds). Legitimate multi-column pairs (items.created_by/updated_by, apps.owner_account_id/account_id) are preserved — queries on those still require !fkey hints." notable_decisions="IF EXISTS everywhere makes this a no-op on schemas that lack any listed constraint; verified against a fresh migration replay on a standalone-export database"]
-- ============================================

ALTER TABLE public.accounts            DROP CONSTRAINT IF EXISTS accounts_app_id_fkey;
ALTER TABLE public.accounts            DROP CONSTRAINT IF EXISTS accounts_type_id_fkey;
ALTER TABLE public.ai_agents           DROP CONSTRAINT IF EXISTS ai_agents_created_by_fkey;
ALTER TABLE public.api_keys            DROP CONSTRAINT IF EXISTS api_keys_created_by_fkey;
ALTER TABLE public.apps                DROP CONSTRAINT IF EXISTS apps_account_id_fkey;
ALTER TABLE public.apps                DROP CONSTRAINT IF EXISTS apps_owner_account_id_fkey;
ALTER TABLE public.integrations        DROP CONSTRAINT IF EXISTS integrations_created_by_fkey;
ALTER TABLE public.invites             DROP CONSTRAINT IF EXISTS invites_created_by_fkey;
ALTER TABLE public.item_progress       DROP CONSTRAINT IF EXISTS item_progress_created_by_fkey;
ALTER TABLE public.items               DROP CONSTRAINT IF EXISTS items_created_by_fkey;
ALTER TABLE public.items               DROP CONSTRAINT IF EXISTS items_updated_by_fkey;
ALTER TABLE public.logs                DROP CONSTRAINT IF EXISTS logs_created_by_fkey;
ALTER TABLE public.messages            DROP CONSTRAINT IF EXISTS messages_account_id_fkey;
ALTER TABLE public.messages            DROP CONSTRAINT IF EXISTS messages_created_by_fkey;
ALTER TABLE public.observability       DROP CONSTRAINT IF EXISTS observability_created_by_fkey;
ALTER TABLE public.pipeline_executions DROP CONSTRAINT IF EXISTS pipeline_executions_created_by_fkey;
ALTER TABLE public.pipelines           DROP CONSTRAINT IF EXISTS pipelines_created_by_fkey;
ALTER TABLE public.prompt_configs      DROP CONSTRAINT IF EXISTS prompt_configs_created_by_fkey;
ALTER TABLE public.prompt_configs      DROP CONSTRAINT IF EXISTS prompt_configs_updated_by_fkey;
ALTER TABLE public.roles               DROP CONSTRAINT IF EXISTS roles_created_by_fkey;
ALTER TABLE public.roles               DROP CONSTRAINT IF EXISTS fk_roles_created_by;
ALTER TABLE public.test_runs           DROP CONSTRAINT IF EXISTS test_runs_created_by_fkey;
ALTER TABLE public.threads             DROP CONSTRAINT IF EXISTS threads_created_by_fkey;
ALTER TABLE public.threads             DROP CONSTRAINT IF EXISTS threads_updated_by_fkey;
ALTER TABLE public.timers              DROP CONSTRAINT IF EXISTS timers_created_by_fkey;
ALTER TABLE public.triggers            DROP CONSTRAINT IF EXISTS triggers_created_by_fkey;
ALTER TABLE public.types               DROP CONSTRAINT IF EXISTS types_app_id_fkey;
