---
title: Notifications
audience: both
kind: entity
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/migrations/050_notifications.sql
  - .framework/functions/_shared/notify.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/agent-runner.ts
---

# Notifications

## What this is for

A **notification** is an in-app message to a specific person — "a pipeline
wants your attention on this record." `public.notifications` (migration 050)
is written by pipeline `send_notification` stages and the agent-runner's
notification action, and read by the signed-in recipient. It is the
*inbound* counterpart to [Deliveries](deliveries.md), which tracks outbound
webhook/integration sends.

## Fields and settings

| Column | Notes |
|---|---|
| `person_id` | required — the recipient (`people.id`). RLS scopes reads to `person_id = current_actor_id()`; users see only their own. |
| `account_id` | required — tenant scope; service role writes across accounts. |
| `source_type` / `source_id` | what produced it — default `'pipeline_execution'`; `source_id` is a text request/execution id (not always a uuid). |
| `target_type` / `target_id` | the record the notification concerns — the deep link. |
| `message` | required text body. |
| `data` | jsonb — arbitrary payload (e.g. rendered title, action hints). |
| `is_read`, `read_at` | read state; indexed `(account_id, person_id, is_read, created_at DESC)` for the unread inbox query. |

**Recipient resolution**

Pipeline/agent stages accept recipients as person UUIDs or `role:<slug>`
entries. `resolveNotificationRecipients`
(`.framework/functions/_shared/notify.ts`) expands `role:slug` → all
`people.id` in the account holding that role; unknown entries warn and are
skipped. A role matching zero people produces a valid empty insert — not an
error.

## Minimal configuration

Written by the platform — a valid row needs `account_id`, `person_id`,
`message` (from the stage's recipients + message config).

## Full configuration

Adds `source_type`/`source_id` attribution, `target_type`/`target_id`
deep-linking, and a `data` payload.

## Example

A pipeline `send_notification` stage with `recipients: ["role:support_admin"]`
inserts one row per support_admin in the account; each sees it in their
inbox, scoped to their `person_id` by RLS.

## Core files

- `.framework/migrations/050_notifications.sql` — table, indexes, RLS
- `.framework/functions/_shared/notify.ts` — `role:` → `person_id` resolver
- `.framework/functions/_shared/pipeline-runner.ts` — `send_notification` stage
- `.framework/functions/_shared/agent-runner.ts` — agent notification action

## Agent notes

- Never write literal `role:*` strings into `person_id` — it's a uuid
  column; only resolved `people.id` values may be inserted. Both writers
  share the resolver — use it.
- `notifications` ≠ `deliveries`: notifications are in-app inbox rows;
  deliveries are outbound webhook/integration attempts.
- RLS allows `UPDATE` where `person_id = current_actor_id()` — recipients
  can mark their own rows read; they cannot read each other's.
