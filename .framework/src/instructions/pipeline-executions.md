---
title: Pipeline Executions
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/pages/admin/PipelineExecutionsPage.tsx
  - .framework/functions/pipeline-executions.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/trigger-engine.ts
---

## What this is for

**Pipeline Executions** (`/spine-framework/admin/observability/executions`) is the run history for every pipeline — manual runs, trigger fires, timer runs, and webhook calls. Each row is a `pipeline_executions` record: who ran it, when, how long, and whether it finished. Use it to confirm a pipeline fired, find the run that failed, and measure cadence and duration.

## Fields and settings

- **Stats cards** — Completed, Failed, Running counts (`/api/pipeline-executions?action=stats`; the Pipelines list reuses `action=stats&date_from=` for "runs today").
- **Search** — matches pipeline id/name fragments and status text client-side.
- **Status filter** — `pending`, `running`, `completed`, `failed`, `cancelled`.
- **Sortable columns** — Pipeline (joined name + execution id prefix), Status, Started (`started_at`), Duration (`duration_ms`), Triggered By (`triggered_by_person` full name/email when known).
- **Row click** — navigates to `observability/executions/:id`. Note: the same list component renders at that URL — there is currently no separate detail view.
- The record itself carries `trigger_data` (the payload that fired it), `result.stages` (per-stage output/duration), and `error_message`.

**Downstream effects**

- The trigger engine inserts a `queued` row before dispatching to `pipeline-runner-background`; `runPipeline` claims it `running`, then writes `completed`/`failed` with per-stage results. A row stuck `running`/`queued` >10 min is swept to `failed` by the cron sweeper.
- `action=cleanup` (server-side) deletes rows older than `days_to_keep` (default 30) — this page is a window, not an archive.
- `trigger_count`/`last_triggered` on the Triggers page and "Last Run"/"runs today" on the Pipelines page all read from this table.

## Minimal configuration

Nothing to configure — executions are produced by running pipelines. To produce one: run a pipeline manually, fire its trigger, or let a timer come due, then filter Status = `failed` to check the result.

## Full configuration

The API supports more than the UI exposes:

- `GET /api/pipeline-executions?action=list|running|stats|get&id=` — reads
- `POST action=cleanup` — `days_to_keep` (default 30), optional `status_filter`
- `PATCH action=start|complete|cancel` — lifecycle writes used by the runner; `complete` marks the row `failed` when `error_message` is present

## Example

A ticket triage trigger fired at 09:12 but no assignment happened. Filter Status = `failed`, find the 09:12 row for the triage pipeline — `error_message` names the stage ("Action not found for stage type"), and `result.stages` shows stages 0–1 succeeded before stage 2 threw.

## Core files

- `.framework/src/pages/admin/PipelineExecutionsPage.tsx` — this page
- `.framework/functions/pipeline-executions.ts` — API (list/get/running/stats/cleanup + start/complete/cancel)
- `.framework/functions/_shared/pipeline-runner.ts` — writes execution rows, stage results, and the >10min stale sweeper
- `.framework/functions/_shared/trigger-engine.ts` — pre-creates the `queued` row before dispatch
- Table: `public.pipeline_executions`

## Agent notes

- "Stuck at running/queued" is the sweeper's job — a row still `running` an hour later means the background function died mid-run; it will be marked `failed` on the next sweep.
- `duration_ms` is wall time of the whole run; per-stage timings live in `result.stages[*].durationMs`.
- The page has no cancel/retry buttons — lifecycle actions exist on the API but the UI is read-only.
- `executions/:id` renders the same list — deep links to a single execution do not open a detail view today.
