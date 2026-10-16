-- CIL[BEGIN stable_id="~/.framework/migrations/019_agent_prompt_columns.sql:agent_prompt_columns:file" type="file" identity="agent_prompt_columns" parent="~/.framework/migrations/019_agent_prompt_columns.sql"]
-- CIL[DOC-MACRO purpose="Reconcile ai_agents/prompt_configs column divergence between archive-era and live-chain table shapes"]
-- CIL[DOC-RESPONSIBILITY responsibility="Add the rich agent/prompt columns the archive schema carried that the live generic registry shape lacks, plus the slug column and uniqueness index dev databases are missing"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/_shared/agent-runner.ts,.framework/functions/ai-agents.ts,.framework/migrations/archive/002e_system_tables.sql,.framework/migrations/001_core_schema.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="Both tables carry the union of archive and live columns" errors="none — ADD COLUMN IF NOT EXISTS is idempotent" side_effects="Unique indexes enable seedApp upserts on (app_id,slug)"]
-- CIL[DOC-MICRO logic_summary="agent-runner.ts reads agent.system_prompt/model_config/agent_type and promptConfig.context_template/confidence_threshold/knowledge_sources/etc directly — columns the live 001 generic shape never created but dev databases carry via archive. Adds every archive column additively plus slug/unique-index on ai_agents (dev's table predates the slug convention; fresh installs get NOT NULL from 001 and skip this)" notable_decisions="columns added nullable because existing dev rows cannot retroactively satisfy NOT NULL; the (app_id,slug) unique index tolerates existing NULL slugs so it can be created on dev lineage"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- ai_agents: archive columns the live generic shape lacks.
-- slug is added nullable for dev lineage (existing rows have no slug);
-- fresh installs already have it NOT NULL from 001.
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS type_id uuid;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS agent_type text;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS model_config jsonb DEFAULT '{}';
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS system_prompt text;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS tools jsonb DEFAULT '[]';
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS capabilities jsonb DEFAULT '[]';
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS constraints jsonb DEFAULT '{}';
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS ownership text DEFAULT 'tenant';
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS updated_by uuid;

-- prompt_configs: archive columns the live generic shape lacks.
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS type_id uuid;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS system_prompt text;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS context_template text;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS temperature numeric;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS max_tokens integer;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS is_multi_turn boolean DEFAULT false;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS max_history_messages integer;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS confidence_threshold numeric;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS escalation_action text;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS escalation_target text;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS output_mode text;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS output_field text;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS requires_review boolean DEFAULT false;
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS knowledge_sources jsonb DEFAULT '[]';
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS available_tools jsonb DEFAULT '[]';
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS tool_constraints jsonb DEFAULT '{}';
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS ownership text DEFAULT 'tenant';
ALTER TABLE public.prompt_configs ADD COLUMN IF NOT EXISTS updated_by uuid;

-- Uniqueness indexes so seedApp upserts on (app_id,slug) work on both lineages.
-- NULL slugs on dev lineage are allowed (NULLs are distinct) and get backfilled
-- by future seed writes.
CREATE UNIQUE INDEX IF NOT EXISTS ux_ai_agents_app_slug
  ON public.ai_agents (app_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS ux_prompt_configs_app_slug
  ON public.prompt_configs (app_id, slug);
-- CIL[DOC-VECTOR type="context" content="purpose='Add missing archive-shape columns to ai_agents and prompt_configs so agent-runner and seed upserts work on fresh installs.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Fresh installs gain the columns agent-runner.ts reads; dev databases gain slug/unique-index so the same seed files work on both" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="slug added nullable rather than NOT NULL because existing dev rows cannot satisfy the constraint retroactively" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/019_agent_prompt_columns.sql:agent_prompt_columns:file"]
