-- CIL[BEGIN stable_id="~/.framework/migrations/065_execution_tables_updated_at.sql:execution_tables_updated_at:file" type="file" identity="execution_tables_updated_at" parent="~/.framework/migrations/065_execution_tables_updated_at.sql"]
-- CIL[DOC-MACRO purpose="Add the missing updated_at column to tables that carry the set_*_updated_at trigger but were created without the column — every UPDATE on them fails with 'record NEW has no field updated_at', which is what wedged pipeline_executions rows in 'running' forever."]
-- CIL[DOC-RESPONSIBILITY responsibility="Backfill updated_at on pipeline_executions (required for terminal bookkeeping writes) and on logs/observability (defensive — same broken trigger, though those tables are append-only today)."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/001_core_schema.sql,.framework/functions/_shared/pipeline-runner.ts"]
-- CIL[DOC-CONTRACT inputs="none" outputs="three tables gain updated_at timestamptz DEFAULT now()" errors="none — idempotent ADD COLUMN IF NOT EXISTS" side_effects="Enables previously-failing UPDATEs on pipeline_executions; trigger set_*_updated_at now has a column to stamp"]
-- CIL[DOC-MICRO logic_summary="001_core_schema attached updated_at_column() triggers to tables whose CREATE TABLE omitted updated_at; the trigger raises on every UPDATE, so pipeline-runner's terminal status writes silently failed (unchecked .update()). Adding the column makes the trigger a no-op stamp instead of an error." notable_decisions="Column added to all three affected tables for uniformity rather than dropping the triggers on append-only logs/observability — keeps the bookkeeping convention consistent if either table ever becomes updateable."]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

ALTER TABLE public.pipeline_executions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.logs               ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.observability      ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- CIL[DOC-VECTOR type="context" content="purpose='Fix broken updated_at triggers on execution/log tables.'; Callers: _shared/pipeline-runner.ts terminal bookkeeping; imports: none" status="ready"]
-- CIL[DOC-VECTOR type="blast_radius" content="pipeline_executions UPDATEs begin succeeding immediately; rows stuck 'running' from the silent failure remain and must be repaired separately" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Applies to any deployment created from 001_core_schema before this fix" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="Idempotent; safe to re-run; does not repair historical stuck rows — that is a separate bookkeeping UPDATE" status="ready"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/065_execution_tables_updated_at.sql:execution_tables_updated_at:file"]
