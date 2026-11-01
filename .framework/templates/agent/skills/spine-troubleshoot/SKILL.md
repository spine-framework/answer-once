---
name: spine-troubleshoot
description: "Debug a Spine issue — use deliveries, executions, logs, doctor, and the integrity manifest to isolate framework vs app faults."
allowed-tools:
  - read
  - exec
  - grep
  - find_file_by_name
---

You debug Spine projects: form a hypothesis, check the observability surfaces,
and isolate whether the fault is in framework, app, config, or data.

## When to invoke

- A pipeline, trigger, timer, delivery, or agent is not behaving.
- Records render empty/unwriteable or permissions deny expected access.
- `npm run verify`, `npm run typecheck`, `npm run test`, or doctor report problems.

## First move — doctor

```bash
npx spine-framework doctor --fix
```

Doctor checks environment, database, migrations, test runs, `runtime_wiring`
(dangling trigger/pipeline/action references), manifest integrity, and agent
assets. Warnings name the broken reference — start there.

## Observability surfaces

- `.framework/src/instructions/deliveries.md` — outbound delivery attempts:
  status, retries, response bodies. First stop for webhook/integration issues.
- `.framework/src/instructions/concepts/observability.md` — the logging and
  execution model; `.framework/src/instructions/operations/` — admin-UI
  runbooks for logs and executions.
- `.framework/src/instructions/reference/functions/logs.md`,
  `.framework/src/instructions/reference/functions/pipeline-executions.md`,
  `.framework/src/instructions/reference/cli.md` — endpoint/CLI spelling.
- `.framework/src/instructions/triggers.md` / `timers.md` / `pipelines.md` —
  field-level config reference when a record's wiring looks wrong.

## Common failure patterns

- **Active pipeline does nothing** — `stages` array empty or every
  `stage_type` points at an inactive/missing action (doctor `runtime_wiring`
  flags this).
- **Record renders empty** — `design_schema.views` missing `default_list`/
  `default_detail`, unknown `display_type`, or fields stored under
  `record.data` but read as top-level (`system: true` mismatch).
- **Permission denied unexpectedly** — `record_permissions` is the base
  grant; check the role's record-level grant before field overrides. See
  `.framework/src/instructions/concepts/permissions.md` and
  `.framework/src/instructions/roles.md`.
- **Trigger never fires** — `is_active` false, `event_type` mismatch, or
  `type_slug`/`pipeline_slug` not resolving (doctor flags all of these).
- **Upgrade verify fails** — `.framework/` was edited locally; the tree is
  sealed. Revert or `npx spine-framework upgrade --force` to resync.
- **Env issues** — missing `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`; copy
  `.env.example` → `.env` and fill in credentials.

## Isolation procedure

1. Reproduce with the smallest path (one record, one event, one call).
2. Check deliveries/executions for the failing run's error text.
3. Compare config against the entity doc's field reference.
4. If the fault is inside `.framework/`, report it — do not patch core.
5. Verify the fix: rerun the failing path + `npm run test` / doctor.

## Rules

- Trust code over docs when they conflict; note the inconsistency.
- Never "fix" a symptom by widening permissions or disabling RLS — find the
  wiring bug instead.
