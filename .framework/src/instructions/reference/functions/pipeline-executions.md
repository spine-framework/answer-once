---
title: pipeline-executions
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/pipeline-executions.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/pipeline-runner.ts
---

# pipeline-executions

## What it does

CRUD and lifecycle surface for `public.pipeline_executions` — the durable
ledger of pipeline runs. One row per run carries `pipeline_id`, `status`,
`trigger_data`, `result`, `error_message`, `started_at`, `completed_at`, and
`duration_ms`. The pipeline runner writes most transitions itself; this
endpoint is how operators and the admin UI read run history and how scripts
create, start, complete, cancel, or prune rows.

## Route and methods

`/.netlify/functions/pipeline-executions` — also reachable as
`/api/pipeline-executions` (`/api/*` → `/.netlify/functions/:splat` in
`.framework/public/_redirects`; same rewrite in the dev proxy,
`config/vite.config.ts`).

Dispatch is by `?action=` query parameter plus HTTP method (the middleware
copies `event.httpMethod` into `ctx.query.method`):

| Call | Handler |
|---|---|
| `GET` (no action, no `id`) | `list` |
| `GET&id=` | `get` — single row by id |
| `GET?action=list` | `list` |
| `GET?action=running` | `getRunning` — `status = 'running'` rows |
| `GET?action=stats` | `getStats` — status counts |
| `POST` (no action) | `create` — insert a `pending` execution |
| `POST?action=cleanup` | `cleanup` — delete old rows |
| `PATCH?action=start` | `start` — set `running` + `started_at` |
| `PATCH?action=complete` | `complete` — set terminal status |
| `PATCH?action=cancel` | `cancel` — set `cancelled` |

Any other action/method combination throws `Invalid action or method`.

## Authentication

Wrapped in `createHandler`, so the request must resolve to a non-anonymous
principal — Bearer JWT (human), `x-api-key` (machine), or
`x-internal-secret` (internal) per `resolvePrincipal`. Anonymous requests
get 401 before the handler runs.

System admins (`roles` contains `system_admin`) read through `adminDb`
across all accounts. Everyone else reads through their scoped `ctx.db` and
must have an account context — `list`, `running`, and `stats` throw
`Account context required` without one.

## Request contract

Query parameters:

- `id` — execution UUID. `get` requires it; the middleware also copies it
  into `body.id` for write actions.
- `pipeline_id` — filter for `list`, `running`, `stats`.
- `status` — filter for `list`.
- `date_from`, `date_to` — `created_at` bounds for `stats`.
- `limit` (default 100), `offset` (default 0) — `list` pagination.

Body fields:

- `create`: `pipeline_id` (required), `trigger_data` (optional object).
- `start` / `cancel`: `id` (required).
- `complete`: `id` (required), `output_data`, `error_message`. A non-empty
  `error_message` makes the final status `failed`; otherwise `completed`.
- `cleanup`: `days_to_keep` (default 30), `status_filter` (optional) —
  deletes rows with `created_at` older than the cutoff.

## Response contract

All successful returns are wrapped by the middleware in
`{ data, error: null, meta: { requestId, duration } }`.

- `list` / `running` — array of `pipeline_executions` rows, newest first
  (`list` by `created_at`, `running` by `started_at`).
- `get` — one row.
- `stats` — `{ total, completed, failed, running }` counted in memory over
  the filtered set.
- `create` — `{ execution_id }`.
- `start` / `complete` / `cancel` — `{ success: true }`.
- `cleanup` — `{ deleted_count }`.

## Side effects

- `create` inserts a row with `status: 'pending'`, stamped with
  `created_by` and `account_id`.
- `start` / `complete` / `cancel` update status and timestamps; `complete`
  also writes `result`, `error_message`, and `duration_ms` computed from
  `started_at`.
- `cleanup` deletes rows permanently.
- Each write emits an audit log: `pipeline_execution.created`,
  `pipeline_execution.started`, `pipeline_execution.completed`,
  `pipeline_execution.cancelled`, `pipeline_executions.cleaned`.

## Errors

- `Execution ID is required` — `get`, `start`, `complete`, `cancel`
  without `id`.
- `Pipeline ID is required` / `Account context required` — `create`
  validation; account check on `list`, `running`, `stats` for non-admins.
- `Invalid action or method` — unmatched action/method pair.
- `get` uses `.single()` — a missing id surfaces as a database error,
  not a clean 404.
- All thrown errors become structured 500 responses unless they carry a
  `statusCode`.

## Agent notes

- `create` here stamps `status: 'pending'` — a different value from the
  `queued` rows the trigger engine creates before dispatching to
  `pipeline-runner-background`. Both are non-terminal.
- Rows stuck in `queued` or `running` mean dispatch or the runner died;
  `sweepStaleExecutions` in `.framework/functions/_shared/pipeline-runner.ts`
  marks `running`/`pending`/`queued` rows untouched for over 10 minutes as
  `failed`.
- `cancel` only updates the row — nothing in this function interrupts an
  in-flight run.
- `stats` loads all matching `id, status` rows and counts in memory; it
  has no `limit` guard, so very large histories are expensive.
