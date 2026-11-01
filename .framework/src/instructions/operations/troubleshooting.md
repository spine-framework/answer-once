---
title: Troubleshooting Playbook
audience: both
kind: guide
verified_against: d0c49d4
verified_on: 2026-10-30
source_files:
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/resolve-credentials.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/logs.ts
  - .framework/functions/pipeline-executions.ts
  - .framework/functions/deliveries.ts
  - .framework/functions/api-keys.ts
  - .framework/cli/commands/migrate.ts
  - .framework/cli/commands/migrations.ts
  - .framework/migrations/003_core_system_data.sql
  - scripts/assemble-functions.sh
---

# Troubleshooting Playbook

## Where to look first

Everything operational lands in three places (see
[Observability](../concepts/observability.md) for the model):

1. **`pipeline_executions`** — did the run exist, and where did it stop?
   Admin: **Observability → Executions**; API: `/api/pipeline-executions`.
2. **`logs`** — search by `trace_id`/`span_name`, or `action=search` on the
   error text (**Observability → Logs** / `/api/logs`). `trigger.fired` /
   `pipeline.failed` audit rows bracket the run. Netlify function logs
   carry what never reached the DB (missing env vars, dispatch failures).
3. **`webhook_deliveries`** — outbound HTTP stages and integrations
   (**Configs → Deliveries** / `/api/deliveries`): `last_error`,
   `response_status`, `next_attempt_at`; `POST /api/deliveries?action=retry`
   re-fires an outbound delivery.

## Common failure signatures

### Trigger-dispatched pipeline never runs

Symptom: `pipeline_executions` row sits at `queued`, no spans — until the
sweeper marks it `failed` (~10 min) with `stale execution: runner died
before terminal write (swept)`
(`.framework/functions/_shared/pipeline-runner.ts`). Causes, in order of
likelihood:

1. **`INTERNAL_INVOKE_SECRET` unset.** `dispatchTriggerPipeline` logs
   `INTERNAL_INVOKE_SECRET not set — cannot dispatch trigger pipeline` and
   returns — the queued row is the only artifact
   (`.framework/functions/_shared/trigger-engine.ts`). Fix: set it
   (`openssl rand -hex 32`), redeploy.
2. Wrong `SITE_URL`/`URL` — dispatch POSTs to
   `{SITE_URL}/.netlify/functions/pipeline-runner-background`; a mis-pointed
   base URL sends the run elsewhere (or times out after 5s).

### `integration.credential_*` on `generic-http`

These stages run through `executeOutbound` with
`integration_slug: 'generic-http'`
(`.framework/functions/_shared/pipeline-runner.ts`). Read the audit event
first — only one of them is fatal:

- `integration.credential_env_missing` **fails the call** — an `env_var`
  entry names a variable that isn't set in the function env
  (`.framework/functions/_shared/resolve-credentials.ts`). Fix the
  integration row (Configs → Integrations) or deploy the env var.
- `integration.credential_missing` / `credential_empty` with
  `skipped: true` are **informational** — no credential is configured, so
  the request went out with no `Authorization` header
  (`.framework/functions/integration-outbound.ts`). If the *target* then
  401s, the endpoint actually needs auth: set a real `api_token`
  (`source: "env_var"` preferred) or pass `action_config.headers`.

### `403` for a system admin: the `system-admin` dead role key

`record_permissions` keys match `roles.slug` **verbatim** — nothing
normalizes hyphens. A design schema granting `"system-admin"` silently
denies the real `system_admin` role
(`.framework/functions/_shared/permissions.ts`, the `DOC-LEARNING` note on
`resolveFirstSurfacePermissions`). Valid keys are real slugs
(`system_admin`, `member`, `support`, …) or the `all` wildcard. Same class
of bug: a `people.role_id` that resolves to no role gets the default-deny
result — check the `people` → `roles` join, not the UI.

### `member` grants do nothing

`member` and `member_admin` are seeded by
`.framework/migrations/073_seed_member_roles.sql`. On a database that
predates that migration the slugs exist only when an app seeds them
(`install-app` applies `seed/roles.json`) or someone creates them via
`/api/roles`. With no `member` row in `public.roles`,
`record_permissions.member` grants nobody anything — a guaranteed-deny
that looks like a permissions bug.

### Trigger never fires at all

- Event names are **singular-kind + `_created|_updated|_deleted`** —
  `item_created`, `message_updated`, `person_created`. `ENTITY_EVENT_NAME`
  maps `items`→`item`, `people`→`person`, etc.
  (`.framework/functions/_shared/trigger-engine.ts`), so a trigger
  configured for `items_created` or `record_created` matches nothing.
- `triggers.is_active` must be true; `config.entity_type`, `config.type_slug`,
  and `config.filters` further narrow matches — check `trigger_executions`
  and `trigger.fired`/`trigger.failed` audit rows.
- The admin-data delete path does not fire `item_deleted` triggers.

### HTTP 200 that is actually a denial

The envelope is always `{data, error, meta}`; a handler that *returns* (not
throws) a refusal produces HTTP 200 with the denial inside `data`
([Errors and Envelopes](../reference/api/errors-and-envelopes.md)) —
e.g. `POST /api/api-keys?action=validate` returns
`{is_valid: false, error: 'Insufficient permissions'}` at 200
(`.framework/functions/api-keys.ts`). Inspect `data`/`error`, not just the
status. Conversely, a thrown `Error` without `statusCode` maps to **500**,
so many 500s are intentional refusals (`Invalid action or method`,
`Record not found or access denied`), not crashes — read the `error` text.

### Edits to functions "do nothing"

`netlify dev` serves the assembled snapshot in
`.assembled/netlify/functions`, not `.framework/functions`. Re-run
`npm run assemble` (or restart `dev:netlify`) after editing function code —
see [Deployment](deployment.md).

### `dev:netlify` fails with "Could not acquire required port"

Ports 8888 (`netlify dev`) and 3001 (Vite) are fixed in manifest-protected
files — there is no supported alternate-port path, and moving only one
side cross-connects the `/api` proxy to whatever still listens on 8888
(often a second Spine project's dev stack). `scripts/dev-netlify.sh` only
kills processes it owns; find the holder (`lsof -i :8888 -i :3001`) and
stop it yourself. `Failed to fetch AI Gateway token … Unauthorized` in the
same output is unrelated Netlify CLI noise, not a Spine fault.

### Migration state looks wrong

`migrations list`/`status` read the `_spine_migrations` ledger (`filename`,
`applied_at`) that `migrate` writes and compare it against the collected
files (`.framework/cli/commands/migrations.ts`). `migrate --dry-run` lists
every collected file, not only pending ones, and file numbering is
non-contiguous — retired migrations are removed rather than renumbered, so
gaps are expected (see [Migrations](migrations.md)).

## Reading `pipeline_executions`

| Status | Meaning |
|---|---|
| `pending` | created via `/api/pipeline-executions` POST, not yet claimed |
| `queued` | trigger reserved the row; dispatch may or may not have landed |
| `running` | `pipeline-runner-background` claimed it |
| `completed` / `failed` | terminal; `error_message` + per-stage results name the failure |
| `cancelled` | manually cancelled via PATCH |

Any of `pending`/`queued`/`running` untouched for >10 minutes is swept to
`failed` by `sweepStaleExecutions` — a wedged row is evidence, not the bug;
find why it never reached its terminal write. Useful queries:
`/api/pipeline-executions?status=failed&pipeline_id=…`,
`?action=running`, `?action=stats`.

## Related

- [Observability](../concepts/observability.md) — logs/executions/deliveries model
- [Errors and Envelopes](../reference/api/errors-and-envelopes.md) — the 200-wrapped-denial contract
- [Security Checklist](security-checklist.md) · [Migrations](migrations.md) · [Deployment](deployment.md)
