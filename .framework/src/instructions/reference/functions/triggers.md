---
title: triggers
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/triggers.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/migrations/020_schema_reconciliation.sql
  - .framework/public/_redirects
---

# triggers

## What it does

CRUD plus `toggle`, `listByEvent`, and `getExecutions` over
`public.triggers` — the config rows that bind an `event_type` to a
`pipeline_id`. **This function never fires anything**: matching and
dispatch happen in `.framework/functions/_shared/trigger-engine.ts`
(`checkAndFireTriggers`/`fireCreateTriggers`/`fireUpdateTriggers`,
invoked by `admin-data` on record writes), which reserves a
`trigger_executions` row and POSTs the run to the
`pipeline-runner-background` function. See
[Automation](../../concepts/automation.md).

## Route and methods

`/.netlify/functions/triggers`, reachable as `/api/triggers` (`/api/*` →
`/.netlify/functions/:splat`, `.framework/public/_redirects`). `?action=`
takes precedence; without it the dispatcher falls back to the HTTP method —
`GET` → `get` (with `id`) else `list`, `POST` → `create`, `PATCH` →
`update`, `DELETE` → `remove`:

| Call | Handler |
|---|---|
| `/api/triggers?action=list` | `list` |
| `/api/triggers?action=listByEvent&event_type=<e>` | `listByEvent` |
| `/api/triggers?action=get&id=<uuid>` | `get` |
| `/api/triggers?action=getExecutions&trigger_id=<uuid>` | `getExecutions` |
| `/api/triggers?action=create` | `create` |
| `/api/triggers?action=update` (`id` in body or query) | `update` |
| `/api/triggers?action=remove` (`id` in body or query) | `remove` |
| `/api/triggers?action=toggle` (`id` in body or query) | `toggle` |

A bare `GET /api/triggers` returns the active trigger list.

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list`/`listByEvent`/`getExecutions`/`create` require `ctx.accountId`.
- `create` requires `system_admin` or a `canCreate` grant from
  `resolveFirstSurfacePermissions(..., 'trigger', 'create')`.
- `update`/`remove`/`toggle` have no explicit gate — humans are bounded
  by RLS on `ctx.db`; machines run service-role.
- Reads are sanitized: non-admins get `{ id }` per row (trigger rows
  carry no `design_schema`).

## Request contract

**list** (query): `app_id`, `event_type`, `include_inactive` (`'true'`
to include; default active only). Ordered by `name`.

**listByEvent** (query): `event_type` required; `app_id`,
`include_inactive` optional.

**get** (query): `id`. **getExecutions** (query): `trigger_id`
required; `limit` (default 50), `offset` — reads
`public.trigger_executions` ordered `executed_at` desc.

**create** (body): `name`, `event_type`, `pipeline_id` required.
Optional: `app_id`, `description`, `trigger_type` (defaults `'event'`),
`config` `{}`, `metadata` `{}`. `account_id`/`created_by` stamped —
`created_by` is `null` for machine principals. (`event_type`,
`trigger_type`, `pipeline_id` columns were added by
`.framework/migrations/020_schema_reconciliation.sql`.)

**update** (`id` in body or query + body): allowlist — `name`,
`description`, `config`, `pipeline_id`, `metadata`, `is_active`,
`event_type`, `trigger_type`, `app_id`.

**remove** (`id` in body or query): soft delete (`is_active = false`).

**toggle** (`id` in body or query): flips `is_active` — no target-state
argument.

## Response contract

Standard `{ data, error, meta }` envelope.

- `list`/`listByEvent`/`get`/`create`/`update`/`toggle` → sanitized
  row(s); `remove` → `{ success: true }`; `getExecutions` → raw
  `trigger_executions` array (unsanitized).
- The file also exports `AGENT_EVENT_TYPES` — the `agent.*` event names
  (`agent.inference.completed`, `agent.tool.called`,
  `agent.message.received`, …) usable as `event_type` values — but
  `event_type` is free-form text; any string is accepted.

## Side effects

- `toggle`/`update`/`remove` stamp `updated_at`; `is_active` is what the
  trigger engine filters on when matching events.
- `emitLog` writes `trigger.created` / `.updated` / `.deleted` /
  `.toggled` audit rows to `public.logs`.
- Writing a trigger has no immediate run effect — the row is only read
  the next time `admin-data` (or another caller of the trigger engine)
  emits a matching event.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| No account context | 500 | `Account context required` |
| `listByEvent` without `event_type` | 500 | `event_type is required` |
| `getExecutions` without `trigger_id` | 500 | `trigger_id is required` |
| Missing create fields | 500 | `name, event_type, and pipeline_id are required` |
| Non-admin without create grant | 500 | `Insufficient permissions to create triggers` |
| Missing `id` | 500 | `Trigger ID is required` |
| Missing row | 500 | `Trigger not found` |
| Missing/unknown action | 500 | `Unsupported action: <action>` |

## Agent notes

- Trigger→pipeline wiring is `pipeline_id` on the row; the engine reads
  `config.entity_type`, `config.type_slug`, `config.filters`, and
  `config.fire_on_transition` at match time — none of that is validated
  by this endpoint, so a malformed `config` fails silently at match time
  (the trigger simply never fires or always fires).
- `getExecutions` is read-only bookkeeping written by the trigger
  engine's `record_trigger_fire` path — execution lifecycle (queued →
  running → complete/failed) is covered by `pipeline-executions` and
  `pipeline-runner-background`, not this function.
- `remove` is a soft delete; a deleted trigger stops matching on the
  next event (the engine queries `is_active = true`).
- `toggle` flips blindly — read first if you need a target state.
