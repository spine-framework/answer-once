-- CIL[BEGIN stable_id="~/.framework/migrations/018_runtime_tables.sql:runtime_tables:file" type="file" identity="runtime_tables" parent="~/.framework/migrations/018_runtime_tables.sql"]
-- CIL[DOC-MACRO purpose="Create the runtime action/schedule/test-result tables that the live chain references but never created"]
-- CIL[DOC-RESPONSIBILITY responsibility="Create actions, schedules, schedule_executions, and test_results with foreign keys, indexes, and RLS enabled"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/system-cron.ts,.framework/functions/trigger-scheduler.ts,.framework/functions/tests.ts,.framework/migrations/043_policy_actor_cleanup.sql,.framework/migrations/046_security_missing_rls.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="Four tables matching archive-era schema" errors="none — CREATE TABLE IF NOT EXISTS and guarded constraints are idempotent" side_effects="Enables RLS; 043/046 then attach policies"]
-- CIL[DOC-MICRO logic_summary="These tables existed only in archive migrations, so dev databases carry them but fresh installs did not — 043/046 failed on missing relations. Definitions are pulled verbatim from archive/002e_system_tables.sql, archive/003_foreign_keys.sql, and archive/008_test_runs.sql; FK constraints are guarded by pg_constraint checks so the file is a no-op where tables already exist" notable_decisions="numbered 018 to run before 043/046 which attach the RLS policies; test_results keeps its run_id FK to test_runs"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Runtime tables that archive migrations created but the live chain only
-- referenced (043 policies, 046 RLS, system-cron/trigger-scheduler/agent-runner/
-- tests.ts consumers). IF NOT EXISTS makes this a no-op on databases that
-- already carry them.

CREATE TABLE IF NOT EXISTS public.actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid, name text NOT NULL, slug text NOT NULL,
  description text, handler text NOT NULL, handler_module text DEFAULT 'functions',
  config jsonb DEFAULT '{}', input_schema jsonb DEFAULT '{}', output_schema jsonb DEFAULT '{}',
  ownership text DEFAULT 'tenant', is_system boolean DEFAULT false,
  default_machine_principal_id uuid, required_scopes text[] DEFAULT '{}',
  is_active boolean DEFAULT true, timeout_seconds integer DEFAULT 300,
  retry_count integer DEFAULT 3, created_by uuid, created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid, action_id uuid NOT NULL, name text NOT NULL,
  schedule_type text NOT NULL, cron_expression text,
  next_run_at timestamptz, last_run_at timestamptz,
  ownership text DEFAULT 'tenant', is_system boolean DEFAULT false,
  is_active boolean DEFAULT true, machine_principal_id uuid,
  created_by uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL, account_id uuid NOT NULL, machine_principal_id uuid,
  status text DEFAULT 'pending', input_params jsonb DEFAULT '{}',
  output_result jsonb DEFAULT '{}', error_message text, duration_ms integer,
  created_at timestamptz DEFAULT now()
);

-- test_runs carries two historical shapes: the archive runner shape
-- (suite/status/counts, consumed by tests.ts) and the generic registry shape
-- created in 001. Add the runner columns additively so both consumers work
-- regardless of which lineage built the database.
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS suite text;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS finished_at timestamptz;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS duration_ms integer;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS total integer;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS passed integer;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS failed integer;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS skipped integer;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS triggered_by text DEFAULT 'agent';

CREATE TABLE IF NOT EXISTS public.test_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id      uuid NOT NULL REFERENCES public.test_runs(id) ON DELETE CASCADE,
  suite       text NOT NULL,
  file        text,
  describe    text,
  name        text NOT NULL,
  status      text NOT NULL,
  duration_ms integer,
  error       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON public.test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_suite ON public.test_runs(suite);
CREATE INDEX IF NOT EXISTS idx_test_runs_started_at ON public.test_runs(started_at DESC);

-- Foreign keys from archive/003_foreign_keys.sql, guarded for idempotency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_actions_account') THEN
    ALTER TABLE public.actions ADD CONSTRAINT fk_actions_account
      FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_actions_machine_principal') THEN
    ALTER TABLE public.actions ADD CONSTRAINT fk_actions_machine_principal
      FOREIGN KEY (default_machine_principal_id) REFERENCES public.api_keys(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_actions_created_by') THEN
    ALTER TABLE public.actions ADD CONSTRAINT fk_actions_created_by
      FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_account') THEN
    ALTER TABLE public.schedules ADD CONSTRAINT fk_schedules_account
      FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_action') THEN
    ALTER TABLE public.schedules ADD CONSTRAINT fk_schedules_action
      FOREIGN KEY (action_id) REFERENCES public.actions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_machine') THEN
    ALTER TABLE public.schedules ADD CONSTRAINT fk_schedules_machine
      FOREIGN KEY (machine_principal_id) REFERENCES public.api_keys(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_created_by') THEN
    ALTER TABLE public.schedules ADD CONSTRAINT fk_schedules_created_by
      FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_se_schedule') THEN
    ALTER TABLE public.schedule_executions ADD CONSTRAINT fk_se_schedule
      FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_se_account') THEN
    ALTER TABLE public.schedule_executions ADD CONSTRAINT fk_se_account
      FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_se_machine') THEN
    ALTER TABLE public.schedule_executions ADD CONSTRAINT fk_se_machine
      FOREIGN KEY (machine_principal_id) REFERENCES public.api_keys(id) ON DELETE SET NULL;
  END IF;
END $$;

-- RLS enabled here; 043/046 attach the actual policies
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
-- CIL[DOC-VECTOR type="context" content="purpose='Create runtime tables (actions/schedules/schedule_executions/test_results) that archive migrations owned but the live chain never created.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Fresh installs gain the tables that system-cron, trigger-scheduler, agent-runner, pipeline-runner, and tests.ts query; existing databases are untouched via IF NOT EXISTS" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="None — runs position 018 so 043/046 policy migrations apply cleanly after it" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/018_runtime_tables.sql:runtime_tables:file"]
