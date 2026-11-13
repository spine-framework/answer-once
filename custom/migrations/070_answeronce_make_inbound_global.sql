-- Migration 070: register 'make-inbound' as a global webhook handler.
-- 066 registered it app-scoped (app_id=answer-once, account_id NULL), but
-- webhook-registry.lookupHandler only resolves a handler for the integration's
-- exact (app_id, account_id) pair or a fully-global row — a tenant-scoped
-- 'make' integration can never reach the app-scoped row. Matches the 004
-- precedent: 'generic-webhook' and 'portal-signals' are global (NULL, NULL).
-- Idempotent; the 066 app-scoped row stays and is harmless.
INSERT INTO public.webhook_handlers
  (app_id, account_id, name, function_name, description, events, is_active)
SELECT
  NULL,
  NULL,
  'make-inbound',
  'custom/apps/answer-once/functions/custom_make-inbound',
  'Transforms a Make.com scenario payload into an ao_support_ticket with an inbound thread message so triage can pick it up.',
  '{"ticket.create"}',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.webhook_handlers
  WHERE name = 'make-inbound' AND app_id IS NULL AND account_id IS NULL
);
