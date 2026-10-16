-- CIL[BEGIN stable_id="~/.framework/migrations/053_builtin_action_seeds.sql:builtin_action_seeds:file" type="file" identity="builtin_action_seeds" parent="~/.framework/migrations/053_builtin_action_seeds.sql"]
-- CIL[DOC-MACRO purpose="Idempotently seed the 11 built-in pipeline action rows that the pipeline-runner stageHandlers map requires."]
-- CIL[DOC-RESPONSIBILITY responsibility="Insert one public.actions row per built-in stage type (update_item, create_record, http_request, send_notification, run_pipeline, search_knowledge, query_items, agent_inference, generate_embeddings, revoke_embeddings, create_interaction) only when no row with that slug exists."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/018_runtime_tables.sql,.framework/functions/_shared/pipeline-runner.ts,custom/apps/cortex/seed/actions.json"]
-- CIL[DOC-CONTRACT inputs="none" outputs="11 global actions rows (account_id NULL, ownership platform, is_system true)" errors="none — INSERT ... SELECT ... WHERE NOT EXISTS is a no-op when a slug is already present" side_effects="Fresh installs gain the action rows runPipeline resolves via .eq('slug', stage_type).eq('is_active', true).single()"]
-- CIL[DOC-MICRO logic_summary="Each INSERT ... SELECT ... WHERE NOT EXISTS checks the slug alone (actions.slug is deliberately NOT UNIQUE — no constraint added, existing DBs may carry dupes). Names/descriptions mirror custom/apps/cortex/seed/actions.json wording, which no manifest seeds, so this migration is the only writer of built-in action rows." notable_decisions="Per-row NOT EXISTS keeps the file re-runnable and leaves pre-existing rows untouched; global rows carry account_id NULL"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Built-in pipeline action seeds. runPipeline resolves every stage's action by
-- slug + is_active via .single(); without these rows a fresh install cannot run
-- any pipeline stage. cortex/seed/actions.json documents the same shape but no
-- manifest references it, so the framework migration owns the built-ins.
-- Each row is guarded by NOT EXISTS on slug — idempotent across re-runs and
-- additive-only on databases that already carry equivalent rows.

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'update_item', 'Update Item', 'Core pipeline stage: update fields on a runtime record.', 'update_item', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'update_item');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'create_record', 'Create Record', 'Core pipeline stage: create a runtime record in a whitelisted entity table.', 'create_record', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'create_record');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'http_request', 'HTTP Request', 'Core pipeline stage: perform an outbound HTTP request.', 'http_request', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'http_request');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'send_notification', 'Send Notification', 'Core pipeline stage: send a notification to role- or person-scoped recipients.', 'send_notification', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'send_notification');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'run_pipeline', 'Run Pipeline', 'Core pipeline stage: invoke another pipeline by id or slug.', 'run_pipeline', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'run_pipeline');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'search_knowledge', 'Search Knowledge', 'Core pipeline stage: hybrid retrieval over the knowledge base.', 'search_knowledge', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'search_knowledge');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'query_items', 'Query Items', 'Core pipeline stage: query runtime items with filters.', 'query_items', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'query_items');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'agent_inference', 'Agent Inference', 'Core pipeline stage: run an agent inference step.', 'agent_inference', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'agent_inference');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'generate_embeddings', 'Generate Embeddings', 'Core pipeline stage: generate embeddings for a runtime item via the core embedding engine.', 'generate_embeddings', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'generate_embeddings');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'revoke_embeddings', 'Revoke Embeddings', 'Core pipeline stage: revoke embeddings for a runtime item via the core embedding engine.', 'revoke_embeddings', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'revoke_embeddings');

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'create_interaction', 'Create AI Interaction', 'Core pipeline stage: capture an AI interaction record via ai-interactions.createInteraction.', 'create_interaction', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'create_interaction');
-- CIL[DOC-VECTOR type="context" content="purpose='Idempotently seed the 11 built-in pipeline action rows the pipeline-runner stageHandlers map requires.'; No verified external callers; imports: none" status="ready"]
-- CIL[DOC-VECTOR type="blast_radius" content="Fresh installs can execute every built-in pipeline stage; existing databases keep their action rows untouched" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="Runs after 018 (actions table); supersedes the unreferenced custom/apps/cortex/seed/actions.json for built-ins" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="NOT EXISTS guard is on slug only; no unique constraint is added because existing DBs may already hold duplicate slugs" status="ready"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/053_builtin_action_seeds.sql:builtin_action_seeds:file"]
