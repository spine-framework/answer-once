-- CIL[BEGIN stable_id="~/custom/migrations/066_answeronce_make_integration.sql:answeronce_make_integration:file" type="file" identity="answeronce_make_integration" parent="~/custom/migrations"]
-- Migration 066: Answer Once Make.com integration + sales-handoff pipeline
-- Seeds the 'make' integration (system template — per-account webhook URLs and
-- x-make-apikey keys go in account-scoped config/credentials), the
-- 'make_scenario' built-in action, the 'make-inbound' webhook handler for
-- Make→Spine ticket intake, and the reference ao_sales_handoff pipeline.
-- Idempotent; mirrors seed/*.json for existing installs.

-- 1) make integration (system template — inert until configured per account)
INSERT INTO public.integrations
  (app_id, account_id, type_id, slug, name, description, provider,
   integration_type, version, config, credentials, metadata,
   is_active, is_system, is_configured, ownership)
SELECT
  NULL, NULL, NULL,
  'make',
  'Make.com',
  'Outbound webhooks to Make.com scenarios. Account-scoped rows set config.webhook_url or config.scenarios.<key>.url plus an api_token credential sent as the x-make-apikey header.',
  'make',
  'api',
  'v1',
  '{
    "outbound_adapter": "adapters/make-outbound",
    "retry_policy": { "max_attempts": 3 },
    "scenarios": {}
  }'::jsonb,
  '{ "api_token": { "source": "value", "value": "" } }'::jsonb,
  '{}'::jsonb,
  true, false, false, 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM public.integrations
  WHERE slug = 'make' AND account_id IS NULL AND app_id IS NULL
);

-- 2) make_scenario pipeline stage action
INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'make_scenario', 'Make Scenario', 'Pipeline stage: trigger a Make.com scenario through the make integration (envelope payload + x-make-apikey auth).', 'make_scenario', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'make_scenario');

-- 3) make-inbound webhook handler (Make -> Spine ticket intake)
INSERT INTO public.webhook_handlers
  (app_id, account_id, name, function_name, description, events, is_active)
SELECT
  (SELECT id FROM public.apps WHERE slug = 'answer-once'),
  NULL,
  'make-inbound',
  'custom/apps/answer-once/functions/custom_make-inbound',
  'Transforms a Make.com scenario payload into an ao_support_ticket with an inbound thread message so triage can pick it up.',
  '{"ticket.create"}',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.webhook_handlers WHERE name = 'make-inbound'
    AND app_id = (SELECT id FROM public.apps WHERE slug = 'answer-once')
);

-- 4) ao_sales_handoff reference pipeline (invoked via directive run_pipelines)
INSERT INTO public.pipelines
  (app_id, slug, name, description, config, metadata, stages, is_active, is_system, ownership)
SELECT
  (SELECT id FROM public.apps WHERE slug = 'answer-once'),
  'ao_sales_handoff', 'ao_sales_handoff', 'Directive-dispatched sales handoff: notifies the sales role in-app and fires the Make.com ''sales_handoff'' scenario when the make integration is configured. Invoked by apply_directive run_pipelines.',
  '{"scope": "account"}'::jsonb, '{"note": "make_scenario no-ops until the ''make'' integration is configured with scenarios.sales_handoff.url and an x-make-apikey credential. recipients ''role:support_admin'' resolves account people with that role."}'::jsonb, '[{"stage_type": "send_notification", "continue_on_error": true, "config": {"message": "Sales directive matched on ticket {{entity.data.title}} — a rep should call the customer.", "entity_type": "items", "entity_id": "target", "recipients": ["role:support_admin"]}}, {"stage_type": "make_scenario", "continue_on_error": true, "config": {"integration_slug": "make", "scenario_key": "sales_handoff", "event": "sales_handoff"}}]'::jsonb,
  true, true, 'platform'
WHERE NOT EXISTS (
  SELECT 1 FROM public.pipelines WHERE slug = 'ao_sales_handoff'
    AND app_id = (SELECT id FROM public.apps WHERE slug = 'answer-once')
);
-- CIL[END stable_id="~/custom/migrations/066_answeronce_make_integration.sql:answeronce_make_integration:file"]
