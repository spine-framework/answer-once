---
title: Triggers
audience: both
kind: entity
verified_against: 761dfb9
verified_on: 2026-11-17
source_files:
  - .framework/functions/triggers.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/trigger-scheduler.ts
  - .framework/src/pages/admin/TriggersPage.tsx
  - .framework/src/pages/admin/TriggerDetailPage.tsx
  - .framework/migrations/064_episode_leases.sql
  - .framework/migrations/081_second_surface_write_rls.sql
---

## What this is for

A **trigger** listens for a Spine event and, when active, hands the event payload to a pipeline for processing. It is the link between emitted platform events (e.g. `item_created`) and the workflows that react to them.

## Why it exists

Pipelines are reusable, but you need a separate mechanism to decide which pipeline runs for each event.

**Why it exists (5-whys):**

1. "What runs" (pipeline) and "when it runs" (trigger) change independently — rebinding shouldn't mean editing the workflow.
2. Event routing per app in code means platform edits per app — declared triggers make reactivity config. `admin-data` fires `fireCreate/UpdateTriggers` on the governed write path (the delete path fires nothing today), so every write is a potential event.
3. `event_type` + `pipeline_id` columns (reconciled in migration `020`) plus `config` conditions make the trigger a declarable rule: fire *this* pipeline when *this* event on *this* type matches.
4. `trigger_executions` records which rule matched — "why did that pipeline run?" is unanswerable without it.
5. **Root:** reactivity needs a seam between event and action — `triggers` is that seam as data, so apps get event-driven behavior without platform code changes. *(confirmed 2026-11-13)*

## Fields and settings

- **Name** — string. Display name; missing name prevents saving.
- **Event Type** — string. The event to listen to, e.g. `item_created`. Must match the emitted event name **exactly** — a typo means the trigger never fires.
- **App ID** — select, optional. Owning app; blank = account-scoped.
- **Pipeline ID** — select, required at create (`name`, `event_type`, `pipeline_id` are all required by the API). The pipeline invoked when the trigger fires; a stale ID means the queued execution fails instead of running.
- **Active** — checkbox. Inactive triggers are skipped at fire time — matching events produce no run.
- **Description** — string, optional.
- **Config (JSON)** — trigger-engine configuration, e.g. filters or payload mapping.
- **Metadata (JSON)** — optional metadata.
- **Trigger Type** — `trigger_type` column, NOT NULL since migration `020`; the API defaults it to `'event'` when omitted, so it is not a form field.

**Downstream effects**

- The trigger engine (`admin-data` writes → `_shared/trigger-engine`) matches emitted events to active triggers by `event_type`; real event names use underscores — `item_created`, `item_updated`, `thread_created`, `message_created`, etc. (see the `EventType` union in `_shared/trigger-engine.ts`). `*_deleted` names exist in the union but nothing emits them — `admin-data`'s remove path never calls `fireDeleteTriggers`.
- `config` filters narrow which matching events actually invoke the pipeline.
- A wrong or stale `pipeline_id` means the trigger fires, queues an execution row, and the run fails — check Pipeline Executions, not just the trigger, when "nothing happened".
- Mutations are permission-gated: `create` uses the first-surface grant path; `update`/`remove`/`toggle` call `canAccessConfigObject` — in practice every mutation resolves to `system_admin` only (decision `0026`), and migration `081` makes direct PostgREST agree.

## Minimal configuration

```json
{
  "name": "On item created",
  "event_type": "item_created",
  "pipeline_id": "<pipeline uuid>",
  "is_active": true
}
```

## Full configuration

Adds `config` with payload filters (e.g. match only `item_created` where `type_slug = "ticket"`), field mappings into the pipeline input, and `metadata` documenting the contract the event producer is expected to emit.

## Example

A support app fires `item_created` filtered to `type_slug = "ticket"`; the trigger invokes its triage pipeline, which assigns the ticket and posts a thread message. A second trigger on `item_updated` handles SLA warnings — both share the same pipeline pattern but different filters.

## Core files

- `.framework/functions/triggers.ts` — API
- `.framework/functions/_shared/trigger-engine.ts` — event matching and dispatch to `pipeline-runner-background`
- `.framework/functions/trigger-scheduler.ts` — Netlify scheduled entry point (delegates to `system-cron`)
- `.framework/src/pages/admin/TriggersPage.tsx` / `TriggerDetailPage.tsx` — admin UI
- Table: `public.triggers`

## Agent notes

- Event names are `<entity>_<past tense>` (`item_created`, `message_created`, ...) — the Event Type input's own placeholder still shows the stale `item.created` form; use underscores.
- `*_deleted` triggers never fire: `fireDeleteTriggers` exists in `trigger-engine.ts` but `admin-data`'s remove path imports it without calling it. Don't register delete-driven automations expecting them to run.
- `config` filters (`entity_type`, `type_slug`, `filters` with `$eq`/`$ne`/`$gt`/etc.) narrow which matching events actually invoke the pipeline.
- The list's "Total Fires" stat and "Fires"/"Last Fired" columns count trigger firings (the `record_trigger_fire` RPC), not successful pipeline runs — a trigger can fire while its pipeline fails.
- `config` must be a JSON **object**, not a string — the second most common save failure after event-type typos.
