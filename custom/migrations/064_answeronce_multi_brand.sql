-- Migration 064: multi-brand support for Answer Once transactional email
--
-- Adds config.brands (the function-side brand registry: by_host map +
-- definitions) to the global transactional-email integration and rewrites
-- the seeded templates to render per-brand via {{brand.*}} placeholders
-- (ticket_reply, resolved by the send_email stage's brand root) and the flat
-- {{brand_name}}/{{brand_logo_url}} placeholders (invite, rendered by
-- invites.ts). Idempotent jsonb merge — config keys are owned by this
-- migration; runtime edits to other config keys are preserved.

UPDATE public.integrations
SET config = config || '{
  "brands": {
    "default": "answer-once",
    "by_host": {
      "support.answer-once.com": "answer-once",
      "support.spine-framework.com": "spine"
    },
    "definitions": {
      "answer-once": {
        "name": "Answer Once",
        "site_url": "https://support.answer-once.com",
        "email_from": "Answer Once Support <noreply@notifications.answer-once.com>",
        "email_logo_url": "https://support.answer-once.com/answer-once-logo-wht.png"
      },
      "spine": {
        "name": "Spine",
        "site_url": "https://support.spine-framework.com",
        "email_from": "Spine Framework Support <noreply@notifications.answer-once.com>",
        "email_logo_url": "https://support.spine-framework.com/spine-logo.jpg"
      }
    }
  },
  "templates": {
    "invite": {
      "subject": "You are invited to join {{account_name}}",
      "html": "<p>Hi {{to_name}},</p><p>You have been invited to join <strong>{{account_name}}</strong> on {{brand_name}}.</p><p><a href=\"{{invite_url}}\">Accept your invitation</a></p><p>This link expires {{expires_at}}. If the button does not work, paste this into your browser:<br>{{invite_url}}</p>"
    },
    "ticket_reply": {
      "subject": "New reply on your support ticket",
      "html": "<p>{{record.data.author_name}} from support replied to your ticket:</p><blockquote style=\"border-left:3px solid #ccc;padding-left:12px;color:#444\">{{record.content}}</blockquote><p>Sign in to {{brand.name}} to read the full thread and reply.</p>",
      "text": "{{record.data.author_name}} from support replied to your ticket:\n\n{{record.content}}\n\nSign in to {{brand.name}} to read the full thread and reply."
    }
  }
}'::jsonb
WHERE slug = 'transactional-email'
  AND account_id IS NULL
  AND app_id IS NULL;
