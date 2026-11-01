---
title: Add a trigger
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/triggers.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/admin-data.ts
  - .framework/functions/pipeline-runner-background.ts
  - .framework/src/pages/admin/TriggerDetailPage.tsx
---

# Add a trigger

## Goal

Create a `public.triggers` row so a record event (`item_created`,
`item_updated`, …) dispatches a pipeline execution.

## Prerequisites

- The pipeline the trigger will point at ([Add a pipeline](./add-a-pipeline.md)).
- `INTERNAL_INVOKE_SECRET` set on the deployed functions — dispatch POSTs to
  `pipeline-runner-background` with an `X-Internal-Secret` header and logs
  `cannot dispatch trigger pipeline` (then silently no-ops) when it is
  unset (`.framework/functions/_shared/trigger-engine.ts`). See
  [Environment variables](../reference/env-vars.md).

## Steps

1. **Pick the `event_type`.** Snake_case `<entity>_<verb>` — the engine's
   `EventType` union covers `item`, `account`, `person`, `thread`,
   `message`, `attachment`, and `link` × `created`/`updated`/`deleted`
   (`.framework/functions/_shared/trigger-engine.ts`). Use
   `item_created`, not `item.created` — the admin UI's own placeholder text
   (`e.g., item.created`) is misleading
   (`.framework/src/pages/admin/TriggerDetailPage.tsx`).

   Scheduled and webhook entry points are **not** trigger event types —
   use a [timer](./add-a-timer.md) or an
   [inbound webhook](./add-a-webhook.md) for those.

2. **Add filter config (optional).** `config.entity_type` scopes the row to
   one table; `config.type_slug` scopes it to one type (resolved from
   `type_id` when the record carries only that);
   `config.filters` supports `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`,
   `$in`, `$nin`, `$exists` on `data->>'field'` paths; and
   `config.fire_on_transition` fires only when the record moves *into* a
   matching state (`.framework/functions/_shared/trigger-engine.ts`).

   ```json
   {
     "name": "New ticket",
     "event_type": "item_created",
     "pipeline_id": "<pipeline-uuid>",
     "config": { "entity_type": "items", "type_slug": "ticket" }
   }
   ```

3. **Create the trigger.** Admin UI → **Configs → Triggers → New**, or
   `POST /api/triggers` — `name`, `event_type`, and `pipeline_id` required
   (`.framework/functions/triggers.ts`).

4. **Keep it enabled.** `is_active: true` (default). Only active triggers
   are matched on an event; `?action=toggle` flips it
   (`.framework/functions/triggers.ts`). Deleting a trigger is a soft
   delete (`is_active = false`) — execution history survives.

## Verify

- Create or update a matching record via `/api/admin-data` — creates and
  updates call `fireCreateTriggers` / `fireUpdateTriggers` after the write
  (`.framework/functions/admin-data.ts`).
- A `pipeline_executions` row appears in `queued`, then `running` /
  `completed` as `pipeline-runner-background` picks it up — watch
  **Observability → Executions**.
- The `record_trigger_fire` RPC bumps `triggers.trigger_count` /
  `last_triggered`, and `trigger.fired` / `trigger.failed` audit rows land
  in `public.logs`.

## Common mistakes

- **Dotted event names.** `item.created` matches nothing — event names are
  `item_created` etc.
- **Expecting `item_deleted`.** The enum includes it, but the `admin-data`
  delete path never invokes `fireDeleteTriggers` — only create and update
  fire (`.framework/functions/admin-data.ts`;
  `.framework/functions/_shared/trigger-engine.ts`). Use an update
  (`is_active = false`) if you need delete-like notification.
- **Missing `INTERNAL_INVOKE_SECRET`.** The trigger inserts the queued
  execution row, but the dispatch to `pipeline-runner-background` cannot be
  authenticated, so nothing runs — check function logs for the
  `INTERNAL_INVOKE_SECRET not set` error.
- **Filtering on `type_slug` without realizing the resolution.** Records
  carry `type_id`, not the slug; the engine resolves the slug once per
  event when any trigger filters on `config.type_slug`
  (`.framework/functions/_shared/trigger-engine.ts`).

## Reference

- [triggers entity page](../triggers.md) · [Automation](../concepts/automation.md)
- [trigger-scheduler reference](../reference/functions/trigger-scheduler.md) ·
  [pipeline-runner-background reference](../reference/functions/pipeline-runner-background.md)
- [Add a pipeline](./add-a-pipeline.md) · [Add a timer](./add-a-timer.md)
