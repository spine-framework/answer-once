---
title: "Observability: logs, deliveries, executions"
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/logs.ts
  - .framework/functions/observability.ts
  - .framework/functions/deliveries.ts
  - .framework/functions/pipeline-executions.ts
  - .framework/functions/item-progress.ts
  - .framework/functions/_shared/logging.ts
  - .framework/functions/_shared/tracing.ts
  - .framework/functions/_shared/audit.ts
  - .framework/migrations/069_log_stats_window.sql
---

# Observability: logs, deliveries, executions

Everything an operator needs lands in a small set of queryable tables. There is
no external telemetry service: `public.logs` is the unified sink, and the
`logs`, `observability`, `deliveries`, and `pipeline-executions` functions are
the read APIs over it.

## What gets written, and where

`public.logs` holds three overlapping kinds of rows:

- **Audit/log events** — `emitLog`, `emitAudit`, and `emitActivity` in
  `_shared/audit.ts` insert business events (`trigger.fired`,
  `pipeline.completed`, `integration.outbound.failed_http`,
  `api_key.created`, `registration.completed`, …) with actor, target, and
  details.
- **Spans** — `emitSpan` writes trace spans (`span_name`, `trace_id`,
  `span_id`, `parent_span_id`, `duration_ms`, `outcome`). `_shared/tracing.ts`
  implements W3C `traceparent` parsing/formatting, and `traceDb` wraps the
  request's DB client so every query emits a `db.<operation>` span — a single
  `trace_id` stitches the request, its queries, and the pipeline stages it
  caused.
- **Operation logs** — `logAdminDataOperation` in `_shared/logging.ts` writes
  admin-data CRUD records, gated by resolved log levels.

Log **levels** are `'off' | 'timing' | 'warnings' | 'errors' | 'all'`, resolved
per request from `system_settings` rows (`key='logging'`, global plus scoped
overrides); the default is `['timing', 'errors']`. Under the default, errors
and timing rows are written; `warnings`-level and `all`-level verbosity require
opt-in settings. A request's `x-log-level` header can raise verbosity for that
call.

## Reading logs

`logs` (`.framework/functions/logs.ts`) is system-admin oriented (system
admins query with the service client across accounts; account members get
their RLS-scoped view):

- `action=account` / `action=target` / `action=person` — filtered lists.
- `action=search` — `ILIKE` message search.
- `action=stats` — calls the `get_log_stats` RPC (totals, error count,
  distinct levels/sources). **Note:** since migration `069`, when no
  `p_date_from` is passed the window defaults to the **last 7 days** — a call
  that omits the date range returns 7-day stats, not all-time stats.
- `action=cleanup` — deletes rows older than `days_to_keep` (default 30).
  `system-cron` also runs `cleanup_old_logs` on the 00:00 UTC tick, so
  retention is enforced continuously.

`observability` (`.framework/functions/observability.ts`) aggregates the same
rows into dashboard metrics — actions `event_volume`, `error_rate`,
`latency_percentiles`, `pipeline_stats`, `top_actors`, `ai_support_metrics`,
`cleanup` — scoped to the caller's account unless the principal is
system-admin.

## Executions and deliveries

Two sibling tables answer "did it run / did it arrive":

- `public.pipeline_executions` — one row per pipeline run with `status`
  (`queued` → `running` → `completed`/`failed`/`cancelled`), per-stage results,
  `error_message`, `duration_ms`, and the `trigger_data` that caused it
  (`.framework/functions/pipeline-executions.ts`; `action=running`,
  `action=stats`, `action=cleanup`). Rows that never reach a terminal state
  are swept to `failed` after 10 minutes.
- `public.webhook_deliveries` — one row per inbound/outbound webhook attempt
  with `direction`, `status` (`pending`/`processing`/`delivered`/`failed`),
  `attempt_count`, `next_attempt_at`, `last_error`, `response_status`, and
  `response_body` (`.framework/functions/deliveries.ts`; `action=retry`).

`item-progress` (`.framework/functions/item-progress.ts`) is a different lens:
per-person, per-item progress rows (`status`, `score`, `attempts`) that follow
the type's `design_schema.pipeline` stage list (default
`not_started → in_progress → completed`). Transitions must move forward
unless `force: true` is passed; `started_at`/`completed_at` are stamped on
first entry. Use it when you need per-user completion state rather than
execution forensics.

## Debugging a failed automation

Work backwards through the tables:

1. **`pipeline_executions`** — find the run. `status: 'failed'` +
   `error_message` and per-stage results name the failing stage.
   `status: 'queued'` past 10 minutes = dispatch never arrived (sweeper will
   mark it failed); `status: 'running'` stuck = the runner died (same
   sweeper).
2. **`logs`** — search by `trace_id` (from the request) or `span_name`
   (`pipeline.run`, `pipeline.stage.<handler>`, `db.<operation>`); audit rows
   `trigger.fired` / `trigger.failed` / `pipeline.completed` /
   `pipeline.failed` bracket the run. Check log levels if expected `timing`
   rows are absent.
3. **`webhook_deliveries`** — for outbound stages/integrations, the delivery
   row carries `response_status`, `response_body`, `last_error`, and
   `next_attempt_at`; retry with `action=retry`.
4. **`api_key_usage_logs`** (`api-keys?action=usage-logs`) — whether the
   machine caller ever arrived, and from where.
5. **`observability` actions** — confirm the blast radius (`error_rate`,
   `pipeline_stats`, `top_actors`) rather than chasing a single event.
