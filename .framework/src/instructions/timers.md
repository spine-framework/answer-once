---
title: Timers
audience: both
kind: entity
verified_against: 6c7c604
verified_on: 2026-11-22
source_files:
  - .framework/functions/timers.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/trigger-scheduler.ts
  - .framework/src/pages/admin/TimersPage.tsx
  - .framework/src/pages/admin/TimerDetailPage.tsx
  - .framework/migrations/068_cron_schedule_timer_rpcs.sql
  - .framework/migrations/071_timer_interval_keys.sql
  - .framework/migrations/020_schema_reconciliation.sql
---

## What this is for

A **timer** is a scheduled job that invokes a pipeline when it comes due — Spine's recurring/one-off background task primitive. `system-cron` (invoked every minute by the `trigger-scheduler` Netlify scheduled function) asks the `get_due_timers` RPC for due timers and runs each one's pipeline.

## Why it exists

### schedules

You need recurring execution of a specific action with its own credentials and config.

**Why it exists (5-whys):**

1. Different granularity than `timers`: timers are app-declared jobs; schedules bind a registered *action* to a cron expression with explicit ownership — the 018-generation machinery for "run this operation on this calendar."
2. `action_id` binding means the schedule inherits the action's schemas, scopes, machine principal, and retry policy — it reuses the contract instead of re-declaring it.
3. `machine_principal_id` (resolved by `resolve_machine_principal` in `principal.ts`, falling back to `actions.default_machine_principal_id`) gives cron runs a declared identity — no human actor exists, but the writes still need scope and auditability.
4. `next_run_at`/`last_run_at` on the row + `schedule_executions` per run = the same durable-state pattern as timers/executions — a crashed run is visible, a duplicate is a constraint violation.
5. **Root:** recurring platform work must carry its own identity — `schedules` binds the action registry to calendar time under a machine principal, closing the loop "autonomous execution is always attributable." *(confirmed 2026-11-13)*

### timers

You need recurring work such as score decay, cleanup, or report generation without an external scheduler.

**Why it exists (5-whys):**

1. Work like "follow up in 48h" or "decay score weekly" is bound to *this* app's data and account context — an external scheduler has to reach back in and loses both.
2. Each row is an armed instance: `config.interval_minutes`/`interval_seconds`/`run_at` declares the cadence; `next_execution` (reconciled in `020`) is the state; `update_timer_after_run` (`071`) advances or stops it atomically — missed/duplicate runs are a data problem, not a clock problem.
3. Typed rows (`type_id`, `UNIQUE(app_id, slug)`) make timers domain vocabulary — "SLA reminder" vs "score decay" are app-declared kinds.
4. Interval and one-shot share the table because both are "fire at time T" — the config distinguishes recurring from armed one-shots; one mechanism, two shapes.
5. **Root:** time is a trigger like any other event — `timers` makes "later" a governed, auditable, account-scoped primitive instead of an external dependency. *(confirmed 2026-11-13)*

### schedule-executions

Scheduled actions run outside of user sessions; you need a record of success/failure, input/output, and duration for debugging when a schedule misbehaves.

Companion of `schedules` — its full reasoning is level 4 of the chain in schedules `## Problem it solves` and the schedules article.

## Fields and settings

- **Name** — string. Display name; required (`name` and `timer_type` are the API's required fields).
- **Type** — select: `interval`, `cron`, `once`. **Stored but not read by the scheduler** — it labels intent only; see Downstream effects.
- **App ID** — select, optional. Owning app; blank = account-scoped.
- **Pipeline ID** — select. The pipeline invoked when the timer fires. `get_due_timers` skips rows where `pipeline_id IS NULL`, so a blank pipeline means the timer never runs.
- **Active** — checkbox. Inactive timers are skipped by `get_due_timers`.
- **Description** — string, optional.
- **Config (JSON)** — the schedule. The rescheduler reads `interval_minutes` (canonical, minutes between runs) with `interval_seconds` as fallback (seconds ÷ 60, same precedence in `timers.ts` and `update_timer_after_run`, migration 071). The form seeds `{ "schedule": "", "interval_seconds": 3600 }` — `interval_seconds` works via the fallback; `schedule` is not honored.
- **Metadata (JSON)** — optional metadata.

**Downstream effects**

- `get_due_timers` returns active timers with `pipeline_id IS NOT NULL` and `next_execution <= now()`. The timers API arms `next_execution` automatically on create/activate when `config.interval_minutes` (or `interval_seconds`) resolves to a positive interval — or pass `next_execution` explicitly.
- `update_timer_after_run` reschedules `next_execution = now() + interval` when `interval_minutes` (or `interval_seconds`/60) resolves positive; otherwise it sets `next_execution = NULL` and the timer becomes one-shot/dead. `timer_type`, `schedule`, and `run_at` are ignored by the RPC.
- Each firing also stamps `last_execution` and increments `execution_count` / `success_count` / `failure_count` — the source of the list page's Executions and Success Rate columns.
- True cron expressions live on the separate `public.schedules` table (read by `get_due_schedules`), not on `timers` — a `cron`-type timer is a label, not a working cron.

## Minimal configuration

```json
{
  "name": "Hourly sync",
  "timer_type": "interval",
  "pipeline_id": "<pipeline uuid>",
  "is_active": true,
  "config": { "interval_minutes": 60 }
}
```

## Full configuration

```json
{
  "name": "Nightly-ish rollup",
  "timer_type": "interval",
  "pipeline_id": "<pipeline uuid>",
  "is_active": true,
  "config": { "interval_minutes": 1440 },
  "metadata": { "owner": "platform", "notes": "fires ~daily once next_execution is seeded" }
}
```

## Example

A support app keeps an `interval` timer with `interval_minutes: 360` to re-check stale tickets every six hours, and a second timer whose `interval_minutes` was left blank to run a one-off backfill — after its first fire, `update_timer_after_run` writes `next_execution = NULL` so it never re-fires.

## Core files

- `.framework/functions/timers.ts` — API (list/get/create/update/delete; arms `next_execution` on create/update/toggle-on when the interval resolves, F-056)
- `.framework/functions/system-cron.ts` — per-tick driver: calls `get_due_timers`, runs `runPipeline` as a `timer:<id>` principal, then `update_timer_after_run`
- `.framework/functions/trigger-scheduler.ts` — Netlify scheduled entry point that delegates to `system-cron`
- `.framework/migrations/068_cron_schedule_timer_rpcs.sql` — the `get_due_timers` / `update_timer_after_run` RPCs
- `.framework/src/pages/admin/TimersPage.tsx` / `TimerDetailPage.tsx` — admin UI
- Table: `public.timers` (`timer_type`, `pipeline_id`, `next_execution`, `execution_count` added by migration 020)

## Agent notes

- The list's "Next Execution" column shows `Not scheduled` when `next_execution` is NULL — an active timer in that state cannot fire until it is re-armed (edit its interval or toggle it off/on).
- A timer with a blank `pipeline_id` saves fine but is filtered out by `get_due_timers` — always pick the pipeline.
- **Under `netlify dev`, timers arm but never fire.** Netlify scheduled functions only run on deployed sites — locally, `trigger-scheduler` is loaded but never invoked on schedule. Emulate a tick with `netlify functions:invoke trigger-scheduler` or `curl -X POST 'localhost:8888/.netlify/functions/trigger-scheduler?api_key=<SCHEDULER_API_KEY>'` (query param, not a header — the cron handler reads `?api_key=`/`?scheduler_key=`; `x-internal-secret` also works). A timer that schedules but never executes locally is an environment limitation, not a defect — unless manual invoke also fails.
- Trigger dispatch requires `INTERNAL_INVOKE_SECRET` set **and a dev-server restart** — a queued execution that never runs usually means the secret is missing (see [Add a trigger](tasks/add-a-trigger.md)).
- The API arms `next_execution` automatically when the interval resolves; for timers created before F-056 (or with unparseable config), set `next_execution` in the DB (e.g. `now() + interval`). After the first successful run, the interval keeps it rescheduling.
- "Success Rate" is `success_count / execution_count`; failures still reschedule — a broken pipeline does not stop the cadence.
