---
title: timers
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/timers.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/system-cron.ts
  - .framework/migrations/020_schema_reconciliation.sql
  - .framework/migrations/068_cron_schedule_timer_rpcs.sql
  - .framework/public/_redirects
---

# timers

## What it does

CRUD plus `toggle` over `public.timers` — the config rows that bind a
`pipeline_id` to a schedule (`timer_type` + `config`, with
`next_execution`/`execution_count` bookkeeping columns). **This function
never executes anything**: firing is done by `system-cron`, which polls
the `get_due_timers` RPC each tick and calls `runPipeline` as a
`timer:<id>` machine principal, then reschedules via
`update_timer_after_run` (`.framework/migrations/068_cron_schedule_timer_rpcs.sql`).

## Route and methods

`/.netlify/functions/timers`, reachable as `/api/timers` (`/api/*` →
`/.netlify/functions/:splat`, `.framework/public/_redirects`). Dispatch
is by **`?action=` only** — the HTTP method is ignored:

| Call | Handler |
|---|---|
| `/api/timers?action=list` | `list` |
| `/api/timers?action=get&id=<uuid>` | `get` |
| `/api/timers?action=create` | `create` |
| `/api/timers?action=update` (`id` in body or query) | `update` |
| `/api/timers?action=remove` (`id` in body or query) | `remove` |
| `/api/timers?action=toggle` (`id` in body or query) | `toggle` |

A bare `GET /api/timers` with no action throws
`Unsupported action: undefined`. Conversely `GET ?action=create` reaches
`create` (with a null body → required-field error).

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list`/`create` require `ctx.accountId`; `create`/`update`/`remove`/
  `toggle` additionally require a person+account context.
- No role gate — system admins use `adminDb`, other humans use
  JWT-scoped `ctx.db` (RLS); machines run service-role.
- Reads are sanitized: non-admins get `{ id }` per row (timer rows carry
  no `design_schema`).

## Request contract

**list** (query): `app_id`, `timer_type`, `is_active`
(`'true'`/`'false'`). Ordered by `name`; no pagination parameters.

**get** (query): `id`.

**create** (body): `name`, `timer_type` required. Optional: `app_id`,
`description`, `config` `{}`, `pipeline_id`, `metadata` `{}`.
`account_id` and `created_by` stamped from context. (Columns
`timer_type`, `pipeline_id`, `next_execution`, `execution_count` were
added by `.framework/migrations/020_schema_reconciliation.sql`.)

**update** (`id` in body or query + body): allowlist — `name`,
`description`, `config`, `pipeline_id`, `metadata`, `is_active`,
`timer_type`, `app_id`.

**remove** (`id` in body or query): **hard delete**.

**toggle** (`id` in body or query): flips `is_active` to its negation —
no target-state argument.

## Response contract

Standard `{ data, error, meta }` envelope. `list`/`get`/`create`/
`update`/`toggle` → sanitized row(s); `remove` → `{ success: true }`.

## Side effects

- `toggle` and `update` stamp `updated_at`; `is_active` is what
  `get_due_timers` gates on (plus `next_execution <= now`).
- `emitLog` writes `timer.created` / `.updated` / `.deleted` /
  `.toggled` audit rows to `public.logs`.
- No schedule recomputation happens here — `next_execution` is only
  advanced by `update_timer_after_run` during `system-cron` ticks.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| No account context (list, create) | 500 | `Account context required` |
| Missing create fields | 500 | `name and timer_type are required` |
| No person+account context | 500 | `User context (person and account) required` |
| Missing `id` | 500 | `Timer ID is required` |
| Missing row (remove/toggle) | 500 | `Timer not found` |
| Missing/unknown action | 500 | `Unsupported action: <action>` |

## Agent notes

- `next_execution` is a real column (migration 020) but is not in the
  create/update allowlists — it is only read by `get_due_timers` and
  advanced by `update_timer_after_run` on `system-cron` ticks.
- `toggle` flips blindly — read the row first if you need a target
  state; concurrent toggles can cancel each other.
- `remove` is a hard delete (unlike `triggers`, which soft-deletes).
- Distinct roles: `timers` = config CRUD; `system-cron` = firing;
  `pipelines` = what runs; `pipeline-executions` = run records. See
  [Automation](../../concepts/automation.md).
