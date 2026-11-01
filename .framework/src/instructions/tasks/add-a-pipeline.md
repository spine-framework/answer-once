---
title: Add a pipeline
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/pipelines.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/migrations/053_builtin_action_seeds.sql
  - .framework/functions/system-cron.ts
---

# Add a pipeline

## Goal

Create a `public.pipelines` row: an ordered `stages` array the runner
executes when something (a trigger, a timer, or a manual run) invokes it.

## Steps

1. **Choose the `trigger_type`.** `manual` (run by button/API), `event`
   (fired by a trigger), `scheduled` (fired by a timer), or `webhook`. This
   is metadata for callers — what actually runs a pipeline is whatever
   invokes `runPipeline`, so the type should match how you plan to wire it
   ([Automation](../concepts/automation.md)).

2. **Draft the `stages` array.** Each stage needs a `stage_type` matching an
   active slug in `public.actions` plus a `config`. Built-in stage types
   (seeded by `.framework/migrations/053_builtin_action_seeds.sql`):

   `update_item`, `create_record`, `http_request`, `send_notification`,
   `send_email`, `run_pipeline`, `search_knowledge`, `query_items`,
   `agent_inference`, `generate_embeddings`, `revoke_embeddings`,
   `kb_ingest`, `kb_revoke`, `create_interaction`
   (`.framework/functions/_shared/pipeline-runner.ts`).

   ```json
   [
     {
       "stage_type": "query_items",
       "config": { "entity": "items", "type_slug": "ticket",
                   "filters": { "status": "open" } }
     },
     {
       "stage_type": "http_request",
       "config": { "url": "https://example.com/hook", "method": "POST",
                   "body": { "title": "{{record.data.title}}" } }
     }
   ]
   ```

   - Stage config merges `action.config` (defaults on the actions row) under
     `stage.config`, plus injected `_pipelineId` / `_executionId` /
     `_stageIndex` / `_triggerData`
     (`.framework/functions/_shared/pipeline-runner.ts`).
   - `{{trigger.*}}` resolves into the trigger-data envelope; `{{record.*}}`
     resolves into `triggerData.entity.data` — the record that fired the
     run (`.framework/functions/_shared/pipeline-runner.ts`).
   - `continue_on_error: true` on a stage lets the run continue after a
     failure; otherwise a failed stage aborts the whole run
     (`.framework/functions/_shared/pipeline-runner.ts`).

3. **Create the pipeline.** Admin UI → **Configs → Pipelines → New**
   (`configs/pipelines/new`), or `POST /api/pipelines` with
   `{ name, trigger_type, stages }` — all three required
   (`.framework/functions/pipelines.ts`). Set `is_active: true`;
   `runPipeline` refuses inactive pipelines.

4. **Wire the entry point.** A pipeline with `trigger_type: "event"` needs a
   trigger ([Add a trigger](./add-a-trigger.md)); `scheduled` needs a timer
   ([Add a timer](./add-a-timer.md)); `manual` runs on demand. Changing
   `trigger_type` later does not rewire existing triggers or timers — relink
   them separately.

## Verify

- Run it directly: `npx spine-framework pipelines run <id> --data '{"x":1}'`
  — see [CLI reference](../reference/cli.md).
- Check **Observability → Executions** (`observability/executions`) or
  `pipelines executions <id>` for a `completed` row with per-stage results.
- A missing `stage_type` fails fast with
  `Action not found for stage type: <type>` — the runner looks the slug up
  in `public.actions` with `is_active = true` before executing
  (`.framework/functions/_shared/pipeline-runner.ts`).

## Common mistakes

- **Nonexistent stage_type.** Seed validation and the runner both reject
  unknown slugs; stick to the built-ins or seed your own `actions` row
  (see [Package and install an app](./package-and-install-an-app.md)).
- **Expecting stage outputs to chain into the next stage.** Each stage gets
  the merged `action.config` + `stage.config` + `_triggerData`; previous
  stage outputs are collected into the execution result, not injected into
  later configs. Templates only see `{{trigger.*}}` and `{{record.*}}`.
- **`scheduled` with no timer, or `event` with no trigger.** The pipeline
  is then unreachable — `get_due_timers` only returns timers with
  `pipeline_id` set, and triggers dispatch by `pipeline_id`.
- **Editing `stages` while runs are queued.** The runner reads the pipeline
  row at execution time; a queued execution picks up whatever `stages`
  exist when it starts, not when it was queued.

## Reference

- [pipelines entity page](../pipelines.md) ·
  [Automation](../concepts/automation.md)
- [pipeline-executions reference](../reference/functions/pipeline-executions.md) ·
  [pipeline-runner-background reference](../reference/functions/pipeline-runner-background.md)
- [Add a trigger](./add-a-trigger.md) · [Add a timer](./add-a-timer.md)
