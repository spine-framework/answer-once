-- Migration 063: Answer Once transactional-email integration (Resend)
-- Seeds a global (account_id NULL, app_id NULL) integrations row so every
-- account resolves it via the null-account fallback in executeOutbound —
-- the same shape as the built-in openai / generic-http system integrations.
-- The row is active but inert until RESEND_API_KEY exists in the environment:
-- send_email skips on credential errors and invites.ts catches outbound
-- failures, so installs without a key see zero behavioral change.
-- Unique key (app_id, account_id, slug) cannot dedupe NULL rows, so
-- idempotency is enforced by the explicit WHERE NOT EXISTS guard.

INSERT INTO public.integrations
  (app_id, account_id, type_id, slug, name, description, provider,
   integration_type, version, config, credentials, metadata,
   is_active, is_system, is_configured, ownership)
SELECT
  NULL, NULL, NULL,
  'transactional-email',
  'Transactional Email (Resend)',
  'Outbound transactional email for invitations and notifications via Resend. Set RESEND_API_KEY (and optionally EMAIL_FROM) to activate.',
  'resend',
  'api',
  'v1',
  '{
    "outbound_adapter": "adapters/resend-outbound",
    "api_url": "https://api.resend.com/emails",
    "retry_policy": { "max_attempts": 3 },
    "templates": {
      "invite": {
        "subject": "You are invited to join {{account_name}}",
        "html": "<p>Hi {{to_name}},</p><p>You have been invited to join <strong>{{account_name}}</strong>.</p><p><a href=\"{{invite_url}}\">Accept your invitation</a></p><p>This link expires {{expires_at}}. If the button does not work, paste this into your browser:<br>{{invite_url}}</p>"
      },
      "ticket_reply": {
        "subject": "New reply on your support ticket",
        "html": "<p>{{record.data.author_name}} from support replied to your ticket:</p><blockquote style=\"border-left:3px solid #ccc;padding-left:12px;color:#444\">{{record.content}}</blockquote><p>Sign in to Answer Once to read the full thread and reply.</p>",
        "text": "{{record.data.author_name}} from support replied to your ticket:\n\n{{record.content}}\n\nSign in to Answer Once to read the full thread and reply."
      }
    }
  }'::jsonb,
  '{ "api_token": { "source": "env_var", "value": "RESEND_API_KEY" } }'::jsonb,
  '{}'::jsonb,
  true, false, true, 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM public.integrations
  WHERE slug = 'transactional-email' AND account_id IS NULL AND app_id IS NULL
);
