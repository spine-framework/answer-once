---
title: Pipelines
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/pipelines.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/pipeline-executions.ts
  - .framework/src/pages/admin/PipelinesPage.tsx
  - .framework/src/pages/admin/PipelineDetailPage.tsx
  - .framework/migrations/053_builtin_action_seeds.sql
---

## What this is for

A **pipeline** is a multi-step workflow run by the pipeline runner. It can be triggered manually, on a schedule (via a timer), by a webhook, or by an event (via a trigger). This page controls pipeline metadata, trigger type, and the JSON `stages` the runner executes.

## Fields and settings

- **Name** — string. Display name; missing name prevents saving.
- **Trigger Type** — select: `manual` (run by button), `scheduled` (invoked by a timer), `webhook` (HTTP call), `event` (Spine trigger event). Determines what causes a run.
- **Active** — checkbox. Inactive pipelines never run, regardless of trigger.
- **App ID** — select, optional. Owning app; blank = account-scoped.
- **Description** — string, optional.
- **Config (JSON)** — free-form runtime configuration passed to the runner.
- **Stages (JSON)** — required **array** of step definitions executed in order by the runner. Each stage is `{ "stage_type": "<action slug>", "config": {...}, "continue_on_error": false }` — `stage_type` is looked up in `public.actions` (`is_active`) at run time; an unknown slug fails the run with "Action not found for stage type".
- **Metadata (JSON)** — optional metadata.

**Downstream effects**

- The runner executes `stages` in array order; the JSON is the source of truth — there is no visual step editor. Stage config can embed `{{trigger.*}}` and `{{record.*}}` placeholders, resolved recursively at run time (`record` = the entity row that fired the event).
- A failed stage aborts the run unless the stage sets `continue_on_error: true`.
- Triggers and timers reference pipelines by ID. Changing `trigger_type` does not rewire existing triggers/timers — relink them separately.
- `scheduled` without a linked timer, or `event` without a matching trigger, means the pipeline never fires.

## Minimal configuration

```json
{
  "name": "Notify on create",
  "trigger_type": "event",
  "is_active": true,
  "stages": [
    {
      "stage_type": "send_notification",
      "config": {
        "recipients": ["role:admin"],
        "message": "Record {{record.id}} created"
      }
    }
  ]
}
```

## Full configuration

Multi-stage pipelines compose the seeded built-in action slugs — `update_item`, `create_record`, `http_request`, `send_notification`, `run_pipeline`, `search_knowledge`, `query_items`, `agent_inference`, `generate_embeddings`, `revoke_embeddings`, `create_interaction` — with `config` carrying shared settings (batch sizes, model names, endpoints) and `metadata` carrying ownership/version notes. Each stage's own `config` is merged over the action row's defaults.

## Example

A support app ships an `auto_embed_on_publish` pipeline (`trigger_type: "event"`): stage 1 fetches the published record via `admin-data`, stage 2 calls an AI agent to generate the embedding, stage 3 writes it back. Two apps can each own a same-named pipeline — the **App** column disambiguates them in the list.

## Core files

- `.framework/functions/pipelines.ts` — API
- `.framework/functions/pipeline-runner-background.ts` — background executor
- `.framework/functions/pipeline-executions.ts` — run history (`observability/executions`)
- `.framework/src/pages/admin/PipelinesPage.tsx` / `PipelineDetailPage.tsx` — admin UI
- Tables: `public.pipelines`, `public.pipeline_executions`

## Agent notes

- "Runs today" and "last run" come from `pipeline_executions` — a pipeline with no executions shows `Never`.
- Stages must be a JSON **array**; a pasted object or string is the most common save-time mistake.
- The runner also implements `send_email`, `kb_ingest`, and `kb_revoke` handlers, but no `actions` rows are seeded for them — a stage using those slugs throws "Action not found" until you insert a matching `public.actions` row yourself.
- Activating/pausing is `is_active` — a paused pipeline keeps its triggers but they no-op.
