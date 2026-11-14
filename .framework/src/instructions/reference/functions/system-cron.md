---
title: system-cron
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/system-cron.ts
  - .framework/functions/trigger-scheduler.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/retry-deliveries.ts
  - .framework/functions/_shared/principal.ts
  - .framework/migrations/068_cron_schedule_timer_rpcs.sql
  - netlify.toml
---

# system-cron

## What it does

The worker behind every `trigger-scheduler` tick. Each authenticated run
performs, in order: a stale-execution sweep, due-schedule execution, due-
timer pipelines, webhook-delivery retries, and
— on the 00:00 UTC tick — log cleanup. It is also directly invocable over
HTTP for manual runs.

## Route and methods

`/.netlify/functions/system-cron`. Normally reached internally via
`trigger-scheduler` (Netlify Clockwork, `* * * * *` in `netlify.toml`),
which calls this handler either with a fabricated `SYSTEM_PRINCIPAL`
context (scheduled ticks) or through the normal middleware path (manual
calls). Any HTTP method reaches the handler — there is no method dispatch.

## Authentication

Inside the handler, after `createHandler` has resolved a non-anonymous
principal:

- `?api_key=` or `?scheduler_key=` equal to the `SCHEDULER_API_KEY`
  environment variable, **or**
- a machine principal with `machineType === 'internal'` — which is what a
  valid `x-internal-secret` header resolves to (`SYSTEM_PRINCIPAL`).

Anything else returns 403 and emits a `system_cron.unauthorized_access`
audit event. When `SCHEDULER_API_KEY` is unset the key comparison can
never match, so only internal machine principals pass — fail closed.

## Request contract

- Query: `api_key` or `scheduler_key` (scheduler key auth path only).
- Headers: `x-internal-secret` (internal machine principal path).
- No body is read.

## What runs per invocation

1. **Stale-execution sweep** — `sweepStaleExecutions()` marks
   `pipeline_executions` rows in `running`/`pending`/`queued` untouched
   for over 10 minutes as `failed` with a `stale execution` error message.
   Runs on every invocation, before anything else.
2. **Due schedules** — `get_due_schedules` RPC returns due
   `public.schedules` rows. For each: `validate_schedule_creator` RPC →
   load the `public.actions` row → load the schedule's machine principal
   from `api_keys` → verify scope (`action.required_scopes[0]` or
   `<handler>:execute`, satisfied also by `*:*`) → `executeAction` →
   insert a `schedule_executions` row → `update_schedule_after_run` RPC →
   `schedule.execute` audit.
3. **Due timers** — `get_due_timers` RPC; each due timer runs
   `runPipeline(timer.pipeline_id, …)` under a fabricated machine
   principal `timer:<timer_id>` with scope `pipelines:execute`, then
   `update_timer_after_run` reschedules it. Timers without `pipeline_id`
   fail that item only.
4. **Log cleanup** — only when the tick lands on UTC 00:00:
   `cleanup_old_logs` RPC with `p_retention_days: 30`.
5. **Delivery retries** — `retryPendingDeliveries(ctx)` sweeps due
   outbound webhook deliveries.

`executeAction` routes `action.handler_module`:

- `functions` — `send_email`, `generate_report`, `notify_watchers` are
  console-log stubs returning success-shaped objects; `run_pipeline`
  invokes `runPipeline` for real.
- `integrations` — stub returning `{ executed: true, handler }`.
- `custom` — throws `Custom handlers not yet implemented`.
- anything else — throws `Unknown handler module`.

## Response contract

- 200 — `{ message, schedules_due, executed, success, failed, skipped,
  logs_cleaned, deliveries_retried, results }` where `results[]` carries
  `{ scheduleId, actionId, status: success|failed|skipped, error?,
  durationMs }` per schedule/timer item. An empty `get_due_schedules`
  result does not short-circuit the tick — timers, retries, and cleanup
  still run.
- 403 — invalid scheduler authentication.
- 500 — top-level failure, with a `system_cron.error` audit event.

## Side effects

Writes `pipeline_executions` (via `runPipeline` and the sweep),
`schedule_executions`, schedule/timer bookkeeping via RPC, `logs` audit
events (`system_cron.unauthorized_access`, `system_cron.error`,
`schedule.execute`), deletes old `logs` rows at
00:00 UTC, and mutates `webhook_deliveries` through the retry sweep.

## Errors

Per-item failures are contained: a failing schedule/timer records a
`failed` result and a `schedule_executions`/`update_*_after_run` failure
record rather than aborting the tick. A failure in the outer block —
e.g. `get_due_schedules` itself erroring — short-circuits to 500 with a
`system_cron.error` audit. Timer-loop, cleanup, and sweep
failures are caught and logged without failing the response.

## Agent notes

- `send_email`, `generate_report`, `notify_watchers`, and the
  `integrations` module are stubs — a schedule pointing at them "succeeds"
  while doing nothing but a console log. Only `run_pipeline` performs real
  work today.
- `SCHEDULER_API_KEY` unset does not open the endpoint: the key path
  simply never matches and only internal machine principals pass.
