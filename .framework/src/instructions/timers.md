---
title: Timers
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/timers.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/trigger-scheduler.ts
  - .framework/src/pages/admin/TimersPage.tsx
  - .framework/src/pages/admin/TimerDetailPage.tsx
  - .framework/migrations/068_cron_schedule_timer_rpcs.sql
  - .framework/migrations/020_schema_reconciliation.sql
---

## What this is for

A **timer** is a scheduled job that invokes a pipeline when it comes due — Spine's recurring/one-off background task primitive. `system-cron` (invoked every minute by the `trigger-scheduler` Netlify scheduled function) asks the `get_due_timers` RPC for due timers and runs each one's pipeline.

## Fields and settings

- **Name** — string. Display name; required (`name` and `timer_type` are the API's required fields).
- **Type** — select: `interval`, `cron`, `once`. **Stored but not read by the scheduler** — it labels intent only; see Downstream effects.
- **App ID** — select, optional. Owning app; blank = account-scoped.
- **Pipeline ID** — select. The pipeline invoked when the timer fires. `get_due_timers` skips rows where `pipeline_id IS NULL`, so a blank pipeline means the timer never runs.
- **Active** — checkbox. Inactive timers are skipped by `get_due_timers`.
- **Description** — string, optional.
- **Config (JSON)** — the schedule. The only key the rescheduler reads today is `interval_minutes` (minutes between runs). The form seeds `{ "schedule": "", "interval_seconds": 3600 }` — neither key is honored by the current RPCs.
- **Metadata (JSON)** — optional metadata.

**Downstream effects**

- `get_due_timers` returns active timers with `pipeline_id IS NOT NULL` and `next_execution <= now()`. The timers API arms `next_execution` automatically on create/activate when `config.interval_minutes` (or `interval_seconds`) resolves to a positive interval — or pass `next_execution` explicitly.
- `update_timer_after_run` reschedules `next_execution = now() + interval` only when `config.interval_minutes` is a positive number; otherwise it sets `next_execution = NULL` and the timer becomes one-shot/dead. `timer_type`, `interval_seconds`, `schedule`, and `run_at` are ignored by the RPC.
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

- `.framework/functions/timers.ts` — API (list/get/create/update/delete; does not set `next_execution`)
- `.framework/functions/system-cron.ts` — per-tick driver: calls `get_due_timers`, runs `runPipeline` as a `timer:<id>` principal, then `update_timer_after_run`
- `.framework/functions/trigger-scheduler.ts` — Netlify scheduled entry point that delegates to `system-cron`
- `.framework/migrations/068_cron_schedule_timer_rpcs.sql` — the `get_due_timers` / `update_timer_after_run` RPCs
- `.framework/src/pages/admin/TimersPage.tsx` / `TimerDetailPage.tsx` — admin UI
- Table: `public.timers` (`timer_type`, `pipeline_id`, `next_execution`, `execution_count` added by migration 020)

## Agent notes

- The list's "Next Execution" column shows `Not scheduled` when `next_execution` is NULL — an active timer in that state cannot fire until it is re-armed (edit its interval or toggle it off/on).
- A timer with a blank `pipeline_id` saves fine but is filtered out by `get_due_timers` — always pick the pipeline.
- To arm a new timer, set `next_execution` in the DB (e.g. `now() + interval`); after the first successful run, `interval_minutes` keeps it rescheduling.
- "Success Rate" is `success_count / execution_count`; failures still reschedule — a broken pipeline does not stop the cadence.
