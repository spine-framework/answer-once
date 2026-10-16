-- CIL[BEGIN stable_id="~/.framework/migrations/020_schema_reconciliation.sql:schema_reconciliation:file" type="file" identity="schema_reconciliation" parent="~/.framework/migrations/020_schema_reconciliation.sql"]
-- CIL[DOC-MACRO purpose="Reconcile archive-era columns the live generic registry shape dropped from nine runtime tables"]
-- CIL[DOC-RESPONSIBILITY responsibility="Add dev-lineage columns to triggers, timers, pipelines, trigger_executions, pipeline_executions, api_keys, item_progress, logs, and messages so runtime functions work on live-chain schemas"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/_shared/trigger-engine.ts,.framework/functions/trigger-scheduler.ts,.framework/functions/system-cron.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/migrations/018_runtime_tables.sql,.framework/migrations/019_agent_prompt_columns.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="Nine tables carry the union of both lineage shapes" errors="none — ADD COLUMN IF NOT EXISTS is idempotent" side_effects="Trigger engine, pipeline runner, system cron, API-key auth, and admin-data PATCH can read/write the columns they expect"]
-- CIL[DOC-MICRO logic_summary="Dev databases were built by archive migrations whose rich table shapes (event_type/pipeline_id on triggers, timer_type/next_execution on timers, stages on pipelines, key_value on api_keys, etc.) were dropped when 001 re-created tables in the generic registry shape. Runtime code reads these columns directly, so fresh installs could not fire triggers, run pipelines, or auth machine principals. Column types are copied verbatim from a live dev information_schema dump" notable_decisions="integration_routes deliberately excluded — 004 drops it as dead schema; NOT NULL clauses preserved from dev types, safe because these tables are empty on fresh installs"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- triggers: columns the trigger engine reads/writes
ALTER TABLE public.triggers ADD COLUMN IF NOT EXISTS trigger_type text NOT NULL;
ALTER TABLE public.triggers ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.triggers ADD COLUMN IF NOT EXISTS pipeline_id uuid;
ALTER TABLE public.triggers ADD COLUMN IF NOT EXISTS ownership text DEFAULT 'tenant';
ALTER TABLE public.triggers ADD COLUMN IF NOT EXISTS trigger_count integer DEFAULT 0;
ALTER TABLE public.triggers ADD COLUMN IF NOT EXISTS last_triggered timestamp with time zone;

-- timers: columns the scheduler/cron path reads/writes
ALTER TABLE public.timers ADD COLUMN IF NOT EXISTS timer_type text NOT NULL;
ALTER TABLE public.timers ADD COLUMN IF NOT EXISTS pipeline_id uuid;
ALTER TABLE public.timers ADD COLUMN IF NOT EXISTS ownership text DEFAULT 'tenant';
ALTER TABLE public.timers ADD COLUMN IF NOT EXISTS last_execution timestamp with time zone;
ALTER TABLE public.timers ADD COLUMN IF NOT EXISTS next_execution timestamp with time zone;
ALTER TABLE public.timers ADD COLUMN IF NOT EXISTS execution_count integer DEFAULT 0;
ALTER TABLE public.timers ADD COLUMN IF NOT EXISTS success_count integer DEFAULT 0;
ALTER TABLE public.timers ADD COLUMN IF NOT EXISTS failure_count integer DEFAULT 0;

-- pipelines: columns the pipeline runner reads
ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS trigger_type text;
ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS stages jsonb DEFAULT '[]';
ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS ownership text DEFAULT 'tenant';

-- trigger_executions / pipeline_executions: execution record fields
ALTER TABLE public.trigger_executions ADD COLUMN IF NOT EXISTS triggered_at timestamp with time zone DEFAULT now();
ALTER TABLE public.trigger_executions ADD COLUMN IF NOT EXISTS trigger_data jsonb DEFAULT '{}';
ALTER TABLE public.trigger_executions ADD COLUMN IF NOT EXISTS result jsonb DEFAULT '{}';
ALTER TABLE public.trigger_executions ADD COLUMN IF NOT EXISTS duration_ms integer;

ALTER TABLE public.pipeline_executions ADD COLUMN IF NOT EXISTS trigger_data jsonb DEFAULT '{}';
ALTER TABLE public.pipeline_executions ADD COLUMN IF NOT EXISTS result jsonb DEFAULT '{}';
ALTER TABLE public.pipeline_executions ADD COLUMN IF NOT EXISTS duration_ms integer;

-- api_keys: machine-principal credential
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS key_value text;

-- item_progress: runtime record columns
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS person_id uuid NOT NULL;
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS status text DEFAULT 'not_started' NOT NULL;
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS score integer;
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}' NOT NULL;
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS design_schema jsonb DEFAULT '{}' NOT NULL;
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS validation_schema jsonb DEFAULT '{}' NOT NULL;
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS updated_by uuid;

-- logs: source attribution
ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS source_type text;
ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS source_id uuid;
ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS person_id uuid;

-- messages: same updated_by gap 047 fixed for people/watchers/attachments
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS updated_by uuid;
-- CIL[DOC-VECTOR type="context" content="purpose='Add archive-era columns missing from the live generic registry shape across nine runtime tables.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Trigger engine, pipeline runner, scheduler, API-key auth, item progress, logging, and message updates work on fresh installs; dev lineage is a no-op" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="Column types copied verbatim from dev information_schema — dev lineage keeps its NOT NULL constraints, fresh installs add identical definitions" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/020_schema_reconciliation.sql:schema_reconciliation:file"]
