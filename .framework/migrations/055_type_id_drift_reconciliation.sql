-- 055_type_id_drift_reconciliation.sql
-- CIL[BEGIN stable_id="~/.framework/migrations/055_type_id_drift_reconciliation.sql:type_id_drift_reconciliation:file" type="file" identity="type_id_drift_reconciliation" parent="~/.framework/migrations"]
-- CIL[DOC-MACRO purpose="Reconcile archive-era databases with the consolidated baseline's type_id columns/indexes on meta tables"]
-- CIL[DOC-RESPONSIBILITY responsibility="Add nullable type_id columns and matching indexes to triggers, timers, prompt_configs, integrations, test_runs, ai_agents, and api_keys where absent"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/migrations/001_core_schema.sql"]
-- CIL[DOC-CONTRACT inputs="tables predating consolidated 001" outputs="type_id columns + idx_*_type_id indexes present" errors="none" side_effects="ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT EXISTS only; nullable columns leave existing rows null — matches baseline where type_id is optional on these tables"]
-- CIL[DOC-MICRO logic_summary="The consolidated baseline declares type_id on meta config tables; archive-era databases never received it, which made replaying 001 fail at CREATE INDEX ... (type_id). Nothing in the runtime writes these columns today — they exist for baseline convergence" notable_decisions="columns added nullable rather than NOT NULL to avoid backfill semantics on tables the baseline leaves optional"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[END stable_id="~/.framework/migrations/055_type_id_drift_reconciliation.sql:type_id_drift_reconciliation:file"]
-- Reconciles pre-consolidation databases that were built from the archive-era
-- migration set (tracked in _spine_migrations under the old filenames) with the
-- consolidated baseline in 001_core_schema.sql. The baseline declares a nullable
-- type_id column plus an index on these tables; archive-era databases never
-- received them, which makes replaying 001 fail on
--   CREATE INDEX ... (type_id) -> "column type_id does not exist".
-- All statements are additive and idempotent: no-op on fresh installs where the
-- consolidated baseline already created the columns and indexes.

ALTER TABLE public.triggers            ADD COLUMN IF NOT EXISTS type_id uuid;
ALTER TABLE public.timers              ADD COLUMN IF NOT EXISTS type_id uuid;
ALTER TABLE public.prompt_configs      ADD COLUMN IF NOT EXISTS type_id uuid;
ALTER TABLE public.integrations        ADD COLUMN IF NOT EXISTS type_id uuid;
ALTER TABLE public.test_runs           ADD COLUMN IF NOT EXISTS type_id uuid;
ALTER TABLE public.ai_agents           ADD COLUMN IF NOT EXISTS type_id uuid;
ALTER TABLE public.api_keys            ADD COLUMN IF NOT EXISTS type_id uuid;

CREATE INDEX IF NOT EXISTS idx_triggers_type_id            ON public.triggers(type_id);
CREATE INDEX IF NOT EXISTS idx_timers_type_id              ON public.timers(type_id);
CREATE INDEX IF NOT EXISTS idx_prompt_configs_type_id      ON public.prompt_configs(type_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type_id        ON public.integrations(type_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_type_id           ON public.test_runs(type_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type_id           ON public.ai_agents(type_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_type_id            ON public.api_keys(type_id);
