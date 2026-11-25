---
title: Notifications
audience: both
kind: entity
verified_against: 85b2802
verified_on: 2026-11-25
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

## Why it exists

Automation needs a way to reach humans that survives the request — a send receipt isn't an inbox.

**Why it exists (5-whys):**

1. A notification is user-facing state — unread/read, badge counts, a list — not just a send receipt. `webhook_deliveries` is transport; `notifications` is the user's inbox.
2. `person_id` recipient + polymorphic `target_type`/`target_id` tie the message to a person *and* a thing — "your ticket changed" links to the record it concerns.
3. `source_type`/`source_id` record provenance — which pipeline execution or request produced it. The default (`pipeline_execution`) shows automation, not humans, is the primary producer.
4. `is_read`/`read_at` keep read state on the row — the badge count is a query, not a counter to keep in sync.
5. **Root:** automation needs a way to reach humans — `notifications` is where pipelines and agents deposit durable, person-scoped messages so "tell someone" is a governed write, not an email bolted on. *(confirmed 2026-11-13)*

## Fields and settings

| Column | Notes |
|---|---|
| `person_id` | required — the recipient (`people.id`). RLS: `notifications_recipient_read` scopes SELECT to `person_id = current_actor_id()`; `notifications_admin_read` (migration 085) adds a system-admin-only account view for admin/audit surfaces — members no longer see each other's rows. |
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
error. Recipients are **literal** — `{{record.data.field}}` templates are
not evaluated (seed validation rejects them); to notify a record-derived
person, register them as a `watchers` row and use `watchers`, or resolve
the id in function code and emit the notification directly.

## Minimal configuration

Written by the platform — a valid row needs `account_id`, `person_id`,
`message` (from the stage's recipients + message config).

## Full configuration

Adds `source_type`/`source_id` attribution, `target_type`/`target_id`
deep-linking, and a `data` payload.

## Example

A pipeline `send_notification` stage with `recipients: ["role:support_admin"]`
inserts one row per support_admin in the account; each sees it in their
inbox when the app filters on `person_id`.

Two behaviors to design around:

- **The actor is not excluded.** Recipients resolve purely from the stage's
  `recipients` list — if the person who triggered the pipeline matches a
  handle (`owner`, `self`, a role they hold, `watchers` they belong to),
  they receive a notification for their own action. There is no
  `exclude_actor` option on this stage (`send_email` handles this
  separately); filter in the stage config or accept the self-notification.

**Read API.** `notifications` is an `admin-data` raw entity — inbox reads
and mark-read go through `/api/admin-data`, no custom function needed:

```bash
GET   /api/admin-data?action=list&entity=notifications&person_id=<caller>&is_read=false&sort_field=created_at
GET   /api/admin-data?action=get&entity=notifications&id=<uuid>
PATCH /api/admin-data?action=update&entity=notifications&id=<uuid>
      {"is_read": true}            # stamps read_at when omitted
```

The recipient-scope rules: `update` accepts only `is_read`/`read_at` and
only on the caller's own rows (403 otherwise); `create` is rejected —
deliveries are written by `send_notification` stages and agents.

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
