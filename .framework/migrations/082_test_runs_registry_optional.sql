-- Every writer of public.test_runs uses the runner shape — reporter.ts,
-- the admin-data RAW_ENTITIES path (suite required, name/slug never sent),
-- tests.ts, system.ts, doctor, and external harnesses per testing.md.
-- 001 created the table with registry boilerplate (slug/name NOT NULL,
-- UNIQUE(app_id, slug)); 018 added the runner columns additively but left
-- the registry constraints, so every run insert failed on
-- `null value in column "name"`.
--
-- Registry columns stay for VALID_ENTITIES/admin-data reads but become
-- optional — the runner columns are the write contract.
--
-- ADD COLUMN IF NOT EXISTS first so archive-era databases (whose
-- test_runs has no slug/name at all) converge before the NOT NULL drops;
-- both drops then no-op harmlessly on already-nullable columns.
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.test_runs ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.test_runs ALTER COLUMN slug DROP NOT NULL;
ALTER TABLE public.test_runs ALTER COLUMN name DROP NOT NULL;
ALTER TABLE public.test_runs DROP CONSTRAINT IF EXISTS test_runs_app_id_slug_key;

-- A run row that omits started_at should still sort correctly for
-- checkTestRuns/tests.ts ordering and the /api/system last_at field.
ALTER TABLE public.test_runs ALTER COLUMN started_at SET DEFAULT now();
