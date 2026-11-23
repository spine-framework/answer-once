---
title: Add a timer
audience: developers, agents
kind: task
skills:
  - spine-add-automation
verified_against: 6c7c604
verified_on: 2026-11-22
source_files:
  - .framework/functions/timers.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/trigger-scheduler.ts
  - .framework/migrations/020_schema_reconciliation.sql
  - .framework/migrations/068_cron_schedule_timer_rpcs.sql
  - .framework/migrations/071_timer_interval_keys.sql
  - .framework/migrations/081_second_surface_write_rls.sql
  - .framework/src/pages/admin/TimerDetailPage.tsx
---

# Add a timer

## Goal

Create a `public.timers` row that runs a pipeline every
`config.interval_minutes` via the system cron sweep.

## Prerequisites

- The `system_admin` role — timer mutations are second-surface gated
  (decision `0026`, migration `081`); account members read but cannot
  write.
- A pipeline to point at ([Add a pipeline](./add-a-pipeline.md)) —
  `get_due_timers` ignores timers with `pipeline_id` NULL.

## Steps

1. **Create the timer.** Admin UI → **Configs → Timers → New**
   (`configs/timers/new`), or `POST /api/timers?action=create` — `name` and `timer_type`
   required (`.framework/functions/timers.ts`). Set
   `pipeline_id` and `config.interval_minutes`:

   ```json
   {
     "name": "Hourly sync",
     "timer_type": "interval",
     "pipeline_id": "<pipeline-uuid>",
     "config": { "interval_minutes": 60 }
   }
   ```

   `timer_type` is a label (`interval` | `cron` | `once` in the admin
   detail page, `.framework/src/pages/admin/TimerDetailPage.tsx`) —
   rescheduling resolves `config.interval_minutes` first, then
   `config.interval_seconds` (seconds ÷ 60) (see below).

2. **`next_execution` is armed for you.** On create or toggle-on, the API
   computes `next_execution` from `config.interval_minutes` (or
   `config.interval_seconds`, seconds ÷ 60); `once` timers arm from an
   ISO `config.run_at`/`config.schedule`. You may also pass
   `next_execution` explicitly. If `next_execution` ever ends up NULL on
   an active timer it cannot fire — `get_due_timers` requires
   `next_execution IS NOT NULL` — so check it first when a timer never
   runs.

3. **Understand the clock.** `trigger-scheduler` is the Netlify scheduled
   function (`* * * * *` in `netlify.toml`); each minute it invokes the
   `system-cron` handler under the system principal, which calls
   `get_due_timers(now())`, then `runPipeline(timer.pipeline_id, …)` with a
   `timer:<id>` machine principal, then `update_timer_after_run`
   (`.framework/functions/system-cron.ts`).

   **`netlify dev` does not run scheduled functions.** Clockwork only exists
   on deployed Netlify — locally, `trigger-scheduler` is loaded but never
   invoked on schedule. To emulate a tick, invoke it manually:

   ```bash
   curl -X POST http://localhost:8888/.netlify/functions/trigger-scheduler \
     -H 'x-nf-event: schedule' \
     -d "{\"next_run\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"}"
   # or: npx netlify functions:invoke trigger-scheduler
   ```

4. **Rescheduling is automatic — or never.** `update_timer_after_run`
   stamps `last_execution`, increments `execution_count` /
   `success_count` / `failure_count`, and sets
   `next_execution = now() + <resolved interval>` where the interval is
   `config.interval_minutes` (canonical, minutes) or
   `config.interval_seconds` (fallback, seconds ÷ 60) — otherwise `NULL`,
   so the timer fires once and stops
   (`.framework/migrations/071_timer_interval_keys.sql` — the dual-key
   resolver; the RPCs themselves are from `068`).

## Verify

- `SELECT id, next_execution, last_execution, execution_count FROM timers`
  shows `next_execution` in the future, then advancing each tick.
- **Observability → Executions** shows pipeline runs with a
  `timer:<id>` principal.
- `timer.execution_count` increments; `success_count` / `failure_count`
  reflect outcomes.

## Common mistakes

- **`interval_seconds` vs `interval_minutes`.** `interval_minutes`
  (minutes) is canonical; `interval_seconds` is a fallback (seconds ÷ 60).
  A timer saved with only `interval_seconds` still reschedules — but set
  `interval_minutes` for clarity since the admin page may seed either.
- **`next_execution` is armed but can go NULL.** The API sets it on
  create and re-arms on activation — a timer stuck dormant has usually
  lost `next_execution` to a one-shot completion or a NULL reschedule;
  check the column first.
- **`toggle` is blind.** `?action=toggle` flips `is_active` to its negation
  with no target-state argument — read the row first.
- **Cron expressions do nothing.** There is no cron-expression evaluator;
  `timer_type: "cron"` is only a label — scheduling is interval arithmetic
  on `next_execution`.
- **Timer with no `pipeline_id`** — filtered out of `get_due_timers`.

## Reference

- [timers entity page](../timers.md) ·
  [timers function reference](../reference/functions/timers.md) ·
  [system-cron reference](../reference/functions/system-cron.md) ·
  [trigger-scheduler reference](../reference/functions/trigger-scheduler.md)
- [Automation](../concepts/automation.md) — *Timers and the scheduler*
