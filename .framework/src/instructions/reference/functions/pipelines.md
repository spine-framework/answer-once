---
title: pipelines
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/pipelines.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/migrations/020_schema_reconciliation.sql
  - .framework/public/_redirects
---

# pipelines

## What it does

CRUD plus `toggle`, `by-trigger` lookup, and `executions` listing over
`public.pipelines` — the config rows that define a `trigger_type` and an
ordered `stages` array. **This function manages config only**: pipeline
execution is done by `.framework/functions/_shared/pipeline-runner.ts`
(`runPipeline`), invoked by `system-cron` (due timers), by
`pipeline-runner-background` (trigger dispatches), or by the
`generate_embeddings`/kb stage handlers — and run bookkeeping lives in
`public.pipeline_executions` via the sibling `pipeline-executions`
function. See [Automation](../../concepts/automation.md).

## Route and methods

`/.netlify/functions/pipelines`, reachable as `/api/pipelines` (`/api/*`
→ `/.netlify/functions/:splat`, `.framework/public/_redirects`).
Dispatch is by `?action=` + method:

| Call | Handler |
|---|---|
| `GET /api/pipelines` | `list` |
| `GET /api/pipelines?id=<uuid>` | `get` |
| `GET /api/pipelines?action=by-trigger&trigger_type=<t>` | `listByTrigger` |
| `GET /api/pipelines?action=executions&pipeline_id=<uuid>` | `getExecutions` |
| `POST /api/pipelines` | `create` |
| `POST /api/pipelines?action=toggle` | `toggle` |
| `PATCH /api/pipelines` (`id` in body or query) | `update` |
| `DELETE /api/pipelines?id=<uuid>` | `remove` |

A matched action with the wrong method falls through to
`Invalid action or method` — e.g. `POST ?action=executions`.

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list`/`listByTrigger`/`create`/`update`/`toggle` require
  `ctx.accountId` (or person+account context).
- No role gate — system admins use `adminDb`, other humans use
  JWT-scoped `ctx.db` (RLS); machines run service-role.
- Reads are sanitized: non-admins get `{ id }` per row (pipeline rows
  carry no `design_schema`). `getExecutions` rows are returned
  **unsanitized**.

## Request contract

**list** (query): `app_id`. `include_inactive` is destructured but
**never applied** — `list` always returns all pipelines including
inactive ones (only `listByTrigger` honors it). Ordered by `name`.

**listByTrigger** (query): `trigger_type` required; `app_id`,
`include_inactive` (`'true'`) optional.

**get** (query): `id`.

**getExecutions** (query): `pipeline_id` required; `limit` (default 50),
`offset` — reads `public.pipeline_executions` ordered `created_at` desc.

**create** (body): `name`, `trigger_type`, `stages` required. Optional:
`app_id`, `description`, `config` `{}`, `metadata` `{}`.
`account_id`/`created_by` stamped. (`trigger_type` and `stages` were
added by `.framework/migrations/020_schema_reconciliation.sql`.)

**update** (`id` in body or query + body): named fields only — `name`,
`description`, `config`, `stages`, `metadata`, `trigger_type`,
`is_active`, `app_id`.

**toggle** (body): `id` and `is_active` **both required** — unlike the
`timers`/`triggers` toggles, this sets an explicit target state.

**remove** (query): `id` — **hard delete**.

## Response contract

Standard `{ data, error, meta }` envelope. `list`/`listByTrigger`/
`get`/`create`/`update`/`toggle` → sanitized row(s); `getExecutions` →
raw `pipeline_executions` array; `remove` → `{ success: true }`.

## Side effects

- `emitLog` writes `pipeline.created` / `.updated` / `.toggled` /
  `.deleted` audit rows to `public.logs`.
- `is_active = false` stops the pipeline at dispatch time —
  `runPipeline` throws when the pipeline is missing or inactive, so
  queued dispatches fail rather than queue silently.
- No execution side effects: creating/updating a pipeline does not
  enqueue anything. Enqueue paths are triggers (event → dispatch),
  timers (cron → `runPipeline`), and other pipelines' `run_pipeline`
  stages.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| `by-trigger` without `trigger_type` | 500 | `trigger_type is required` |
| No account context | 500 | `Account context required` |
| Missing create fields | 500 | `name, trigger_type, and stages are required` |
| Missing toggle fields | 500 | `Pipeline ID and is_active are required` |
| Missing `id` | 500 | `Pipeline ID is required` |
| Missing row | 500 | `Pipeline not found` |
| `executions` without `pipeline_id` | 500 | `Pipeline ID is required` |
| Bad action/method | 500 | `Invalid action or method` |

## Agent notes

- `stages` is a free-form JSON array — nothing here validates stage
  `stage_type`/`config`; unknown stage types fail at run time inside
  `runPipeline`, not at write time. Author against the stage handler set
  in `.framework/functions/_shared/pipeline-runner.ts`.
- `trigger_type` is a coarse grouping used by `listByTrigger`; actual
  event→pipeline matching is on `triggers.event_type`, a different
  column on a different table.
- `remove` hard-deletes the pipeline row — `pipeline_executions`
  history is not cascaded or checked, so deleting a pipeline orphans its
  run records.
- `toggle` differs from siblings: `timers.toggle`/`triggers.toggle`
  flip the current value; `pipelines.toggle` requires the target
  `is_active` in the body.
