---
name: spine-add-automation
description: "Add Spine automation — a pipeline with stages, wired to a trigger (event), timer (schedule), or webhook."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
---

You add automation to a Spine project: pipelines (the workflow), triggers
(the event listener), and timers (the schedule).

## When to invoke

- React to a platform event (`item.created`, `message.sent`, ...).
- Run a job on an interval, cron schedule, or one-off.
- Wire an existing pipeline to a new event source.

## Model

- **Pipeline** — multi-step workflow; `stages` is a JSON array the runner
  executes in order. Each stage's `stage_type` names an `actions` slug.
- **Trigger** — listens for an event and hands the payload to a pipeline.
  Config references `type_slug`, `pipeline_slug`/`pipeline_id`, and optionally
  a `kind`/`entity` scope.
- **Timer** — invokes a pipeline on `interval`, `cron`, or `once`.

Read the entity docs first: `.framework/src/instructions/pipelines.md`,
`.framework/src/instructions/triggers.md`, and
`.framework/src/instructions/timers.md`. The automation model is
`.framework/src/instructions/concepts/automation.md`; procedures live under
`.framework/src/instructions/tasks/`.

## Steps

1. **Design the stages.** Each stage = `{ stage_type, config }` where
   `stage_type` is an existing, active `actions` slug. Check the actions
   registry before inventing one — a stage referencing a missing action fails
   the `runtime_wiring` doctor check.
2. **Create the pipeline row** via `/api/admin-data` or app seed
   (`seed/pipelines.json`). Keep `is_active` false until stages are verified.
3. **Wire the source:**
   - Event → `triggers` row (`event_type`, `pipeline_slug` or `pipeline_id`,
     `config.filters.type_slug` to scope to a type).
   - Schedule → `timers` row (`pipeline_id`, interval/cron/once config).
   - Webhook → the `spine-add-integration` skill.
4. **Verify wiring:** `npx spine-framework doctor` — the `runtime_wiring`
   check reports dangling `type_slug`, `pipeline_slug`/`pipeline_id`, and
   `stage_type` references, plus active pipelines with no stages.
5. **Watch the run:** deliveries and executions are observable — see the
   `spine-troubleshoot` skill and `.framework/src/instructions/deliveries.md`.

## Rules

- An active pipeline with no stages completes successfully while doing
  nothing — always verify `stages` is non-empty.
- Trigger `config` names entities by table name (`items`); types by slug.
- Prefer `pipeline_slug` in config so the binding survives ID regeneration.
- Verification: doctor `runtime_wiring` pass + one real event run observed.
