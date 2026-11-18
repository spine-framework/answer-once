---
name: spine-operate
description: "Operate a deployed Spine project — health checks (doctor, system health, executions, deliveries, logs), access-hygiene audit (roles, invites, API-key scopes), key rotation, and escalation to spine-troubleshoot / doctor --ticket."
allowed-tools:
  - read
  - exec
  - grep
  - find_file_by_name
depends_on:
  files:
    - .framework/src/instructions/operations/recovery.md
    - .framework/src/instructions/operations/troubleshooting.md
    - .framework/src/instructions/tasks/rotate-an-api-key.md
    - .framework/src/instructions/tasks/set-up-monitoring.md
    - .framework/src/instructions/tasks/onboard-client-staff.md
    - .framework/src/instructions/observability.md
    - .framework/src/instructions/api-keys.md
    - .framework/src/instructions/deliveries.md
    - .framework/src/instructions/logs.md
    - .framework/src/instructions/pipeline-executions.md
    - .framework/src/instructions/invites.md
    - .framework/src/instructions/roles.md
    - .framework/src/instructions/reference/cli.md
    - .framework/src/instructions/reference/env-vars.md
  commands:
    - "npx spine-framework auth whoami"
    - "npx spine-framework doctor"
    - "npx spine-framework migrate"
    - "npx spine-framework migrations status"
    - "npx spine-framework pipelines executions"
    - "npx spine-framework pipelines list"
    - "npx spine-framework seed-app"
    - "npx spine-framework system health"
    - "npx spine-framework system manifest"
---

You operate a deployed Spine project — routine health passes, access
hygiene, key rotation, and knowing when to escalate. This skill is
**read-mostly**: the only writes it performs are the declared ones (key
create/revoke, invite revoke, migration/seed during recovery).

## When to invoke

- "Is it healthy?" / routine ops pass / "check the system."
- Access review: who has access, which keys exist, which invites hang.
- "Rotate this key" / "someone left" / suspected credential leak.
- Recovery after a Supabase restore (runbook:
  `.framework/src/instructions/operations/recovery.md`).

## Which environment

Point the env at the rung you're operating — `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `SPINE_CLI_API_KEY`/`SPINE_CLI_JWT` decide
what the commands hit (see
`.framework/src/instructions/reference/env-vars.md`). Say which
environment you're checking in every report; never assume the dev env.

## Health pass

In order (the `system`/`pipelines`/`deliveries`/`logs` commands query the
live `/api/*` — locally they need `npm run dev:netlify` running on :8888,
otherwise point at the deployed site):

```bash
npx spine-framework doctor            # local wiring: env, files, DB reachable
npx spine-framework auth whoami       # what principal you're acting as
npx spine-framework system health     # deployed: healthy/degraded/unhealthy
npx spine-framework system manifest   # deployed version + migration set
npx spine-framework pipelines list    # what's active
npx spine-framework pipelines executions <id>  # recent failures per pipeline
```

Then the runtime surfaces with no CLI (API or admin UI):

- `GET /api/deliveries` — failed/retrying webhook deliveries.
- `GET /api/logs?action=stats` / `?action=search` — error spikes;
  `logs` retention is bounded (system-cron cleans nightly), so export
  before deep history dives.
- `pipeline_executions` `failed` rows — automation that ran and lost.

Report: environment → each check → GREEN/RED → anomalies with the rows
that show them. A RED is stated, not fixed — diagnosis belongs to
`spine-troubleshoot`.

## Access-hygiene audit

Three lists, reviewed together:

1. **API keys** — `GET /api/api-keys`: flag `*:*` scopes that aren't
   deliberate, keys with no `last_used_at` in months, keys that should
   have rotated. Authority is account-scoped self-service (any
   account-bound principal manages keys in its own account; only
   `system_admin`/unbound machines mint wildcard/internal keys) — see
   `.framework/src/instructions/tasks/rotate-an-api-key.md`.
2. **Invites** — Admin → Access → Invites (or `list-invites`): stale
   `pending` invites past 7 days, invites for roles nobody should hold.
3. **People + roles** — who holds `*_admin` roles; people rows tied to
   departed staff → deactivate via the access UI.

## Key rotation

Follow `.framework/src/instructions/tasks/rotate-an-api-key.md`:
create replacement → switch callers → verify `usage-logs` → revoke.
Revocation is soft (`is_active = false`) and audited
(`api_key.revoked` log entry). Never paste a raw `sk_…` into chat,
tickets, or committed files — it's shown once at creation.

## Recovery

Post-restore reconciliation is scripted in
`.framework/src/instructions/operations/recovery.md`:
`migrations status` → `migrate --dry-run` → `migrate` → `seed-app` →
`doctor` → `system health`. The failure modes (code ahead of schema,
partially-restored objects, env secrets outside the DB) are listed there.

## Escalation

- Diagnosis → hand off to `spine-troubleshoot`.
- Support ticket → `npx spine-framework doctor --ticket <id>` attaches a
  sanitized diagnostic report; the project's support channel is the one
  named in `AGENTS.md`/`operations/troubleshooting.md`.
- Don't improvise fixes on a live environment. Report what you see;
  mutating beyond the declared writes needs the developer's go-ahead.
