---
title: "Automation: pipelines, triggers, and timers"
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/pipelines.ts
  - .framework/functions/pipeline-executions.ts
  - .framework/functions/pipeline-runner-background.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/timers.ts
  - .framework/functions/triggers.ts
  - .framework/functions/trigger-scheduler.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/admin-data.ts
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/018_runtime_tables.sql
  - .framework/migrations/020_schema_reconciliation.sql
  - .framework/migrations/068_cron_schedule_timer_rpcs.sql
  - netlify.toml
---

# Automation: pipelines, triggers, and timers

Spine automation is three primitives plus a ledger:

- A **pipeline** (`public.pipelines`) is an ordered JSON `stages` array — the
  definition of *what runs*.
- A **trigger** (`public.triggers`) maps a record event
  (`<kind>_created` / `<kind>_updated` / `<kind>_deleted`) to a pipeline — *when
  data changes*.
- A **timer** (`public.timers`) points at a pipeline and carries
  `next_execution` — *when the clock says so*.
- A **pipeline execution** (`public.pipeline_executions`) is the durable record
  of one run — *what actually happened*.

There is no separate "workflow engine" service. Everything runs inside the
Netlify functions, coordinated through Postgres rows.

## Pipelines and the runner

`runPipeline` in `.framework/functions/_shared/pipeline-runner.ts` is the single
executor. It loads the pipeline row (inactive or missing pipelines throw),
creates or claims a `pipeline_executions` row, then walks `pipeline.stages` in
array order.

Each stage names a `stage_type`. That value is **not** a function name — it is a
slug looked up in `public.actions` (`eq('slug', stage.stage_type)`,
`is_active = true`). The action row supplies `handler_module` and `handler`;
the stage's `config` is merged over `action.config` along with internal keys
`_pipelineId`, `_executionId`, `_stageIndex`, and `_triggerData`. The runner
then routes on `handler_module`:

- `functions` — dispatch to a named handler in the runner's `stageHandlers`
  map. Built-ins include `update_item`, `create_record`, `http_request`,
  `send_notification`, `send_email`, `run_pipeline`, `query_items`,
  `search_knowledge`, `agent_inference`, `generate_embeddings`,
  `revoke_embeddings`, `kb_ingest`, `kb_revoke`, and `create_interaction`.
- `integrations` — dispatch through `integration-outbound` (the same path
  outbound webhooks use).
- `webhook` — POST/GET to `action.config.url` via `integration-outbound`.

Stage config strings support `{{trigger.*}}` and `{{record.*}}` placeholders,
resolved recursively against the trigger envelope and the firing record's data
(`record` is `triggerData.entity.data`). Timer- and manual-fired runs have **no
record context** — `{{record.*}}` placeholders pass through unresolved and
appear literally in stage output (e.g. notification text). Author timer-driven
stages against `{{trigger.*}}` or fixed text.

A stage that throws is recorded as `failed` in the stage results; the run then
aborts **unless** the stage sets `continue_on_error: true`. Completed and
failed runs both write terminal status, stage results, and duration back to the
execution row — `pipeline-executions` is therefore the ground truth for "did it
work", and `status: 'cancelled'` is available for operator-initiated stops.

## Triggers: record events

Writes that go through `admin-data` call into
`.framework/functions/_shared/trigger-engine.ts`: creates fire
`fireCreateTriggers`, updates fire `fireUpdateTriggers` with the previous row
snapshot. (The delete path currently does not invoke `fireDeleteTriggers` —
`*_deleted` event types exist in the union, but nothing emits them from
`admin-data`.) Trigger fires are caught-and-logged, so a failing trigger never
rolls back the write that caused it.

`checkAndFireTriggers` loads active triggers for the event type and evaluates
each against `config`:

- `config.entity_type` must match the runtime table's kind (`items` → `item`,
  `people` → `person`, and so on).
- `config.type_slug` restricts to one `types.slug`; the engine resolves the
  slug from the record's `type_id` when needed.
- `config.filters` is a map of path → expected value. Paths support dot
  notation and Postgres-style `data->>'field'` accessors; expected values may
  be literals, arrays (membership), or operator objects using `$eq`, `$ne`,
  `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`.
- `config.fire_on_transition` makes an update trigger fire only when the record
  *moves into* the matching state — the previous snapshot must not already
  match. This is what prevents "every save to a published record re-fires the
  pipeline".

A matching trigger does **not** run the pipeline inline. It:

1. Inserts a `pipeline_executions` row with `status: 'queued'` (a stable
   execution id exists before any work starts).
2. POSTs to `/.netlify/functions/pipeline-runner-background` with an
   `X-Internal-Secret` header, awaiting only the dispatch ack (bounded by a 5s
   timeout) — the caller's request never waits for the pipeline to finish.
3. Records `record_trigger_fire` bookkeeping and emits a `trigger.fired` audit
   event (or `trigger.failed` on error).

The background function verifies `INTERNAL_INVOKE_SECRET`, reconstructs a
machine context, and calls `runPipeline` with the pre-created `execution_id`,
which claims the row `queued → running` instead of inserting a duplicate.

## Timers and the scheduler

A timer row carries `timer_type`, `pipeline_id`, `config`, and
`next_execution`. The `get_due_timers` RPC returns active timers whose
`pipeline_id` is set and `next_execution <= now()`; `update_timer_after_run`
stamps `last_execution`, increments `execution_count`/`success_count`/
`failure_count`, and reschedules `next_execution` from
`config.interval_minutes` — a timer with no positive `interval_minutes` gets
`next_execution = NULL` and never runs again.

The clock is `trigger-scheduler`, a Netlify scheduled function configured for
`* * * * *` (every minute) in `netlify.toml`. It accepts genuine Netlify
Clockwork invocations (schedule header or `Netlify Clockwork` user-agent *plus*
a `{"next_run": ...}` body) and fabricates a system-principal context;
non-Clockwork calls fall through to the cron handler's own auth, which accepts
either `?api_key=$SCHEDULER_API_KEY` or an internal machine principal — anything
else gets 403 and an audit event.

Each tick, `system-cron` does all of the following:

- **Sweeps stale executions** — `sweepStaleExecutions` marks
  `running`/`pending`/`queued` rows untouched for over 10 minutes as `failed`.
  This is the safety net for a runner that died mid-flight or a dispatch that
  never arrived.
- **Runs due schedules** — `get_due_schedules` → validate the creator → load
  the `public.actions` row → execute as the schedule's delegated machine
  principal (`schedules`/`actions`/`schedule_executions` are the runtime
  scheduling tables).
- **Runs due timers** — each due timer runs its pipeline as machine principal
  `timer:<timer_id>` with scope `pipelines:execute`, then
  `update_timer_after_run` reschedules it.
- **Evaluates threshold alerts** — `threshold_alerts` rows compare
  `error_rate`, `latency_p95`, or `pipeline_failure_rate` metrics against a
  value and fire the alert's `pipeline_id` on breach.
- **Retries webhook deliveries** — `retryPendingDeliveries` runs every tick.
- **Cleans logs** — `cleanup_old_logs` runs on the 00:00 UTC tick.

## Observing executions

- `pipeline-executions` (`.framework/functions/pipeline-executions.ts`):
  `GET` list/get, `action=running`, `action=stats`, `action=cleanup`
  (`days_to_keep` defaults to 30), plus `start`/`complete`/`cancel`.
- `pipelines` (`.framework/functions/pipelines.ts`): CRUD plus
  `action=by-trigger`, `action=executions`, `action=toggle`.
- `triggers` and `timers` (`.framework/functions/triggers.ts`,
  `.framework/functions/timers.ts`): CRUD plus `toggle`; triggers also expose
  `listByEvent` and `getExecutions`.
- CLI: `spine-framework pipelines run <id>` executes a pipeline;
  `spine-framework pipelines executions <id>` lists recent runs
  (`.framework/cli/commands/pipelines.ts`).

An execution stuck in `queued` means dispatch failed before the background
function claimed it — the sweeper fails it after 10 minutes. An execution stuck
in `running` means the runner died — same sweeper, same outcome.

## How the pieces connect

1. A client writes a record through `admin-data`; `fireCreateTriggers` /
   `fireUpdateTriggers` run in-process after the write.
2. The trigger engine matches the event to active `triggers` rows, inserts a
   `queued` execution, and dispatches to `pipeline-runner-background`.
3. Independently, Netlify Clockwork invokes `trigger-scheduler` every minute;
   `system-cron` runs due timers and schedules through the same `runPipeline`,
   sweeps dead executions, retries deliveries, and evaluates alert thresholds.
4. `runPipeline` resolves each `stage_type` through `public.actions` and runs
   the stage handlers — which is also where outbound integrations, AI agent
   calls, and embedding jobs enter the system.
5. Every step lands in `pipeline_executions`, `logs`, and the audit trail,
   which is what the admin UI and `pipeline-executions` API read.
