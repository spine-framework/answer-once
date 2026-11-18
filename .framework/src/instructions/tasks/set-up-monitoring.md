---
title: Set up monitoring
audience: developers, agents
kind: task
skills:
  - spine-operate
verified_against: de75df4
verified_on: 2026-11-17
source_files:
  - .framework/functions/system.ts
  - .framework/functions/logs.ts
  - .framework/functions/deliveries.ts
  - .framework/src/instructions/observability.md
  - .framework/src/instructions/alerts.md
---

# Set up monitoring

## Goal

Know the deployed system is alive and behaving — and get told when it
isn't — using the primitives Spine already ships.

## Prerequisites

- A deployed environment (see
  [Declare your environments](declare-your-environments.md)).
- A scoped API key for the monitor identity — monitoring needs *an*
  authenticated principal (anonymous requests get 401), so mint a
  dedicated read-only key rather than reusing a human's.

## What Spine gives you — and what it doesn't

| Signal | Surface |
|---|---|
| Liveness + config | `GET /api/system?action=health` → `healthy`/`degraded`/`unhealthy` (DB connectivity only — see caveat below); `?action=manifest` → integrity/version fields (partially stale — see caveat) |
| Event trail | `logs` — `/api/logs?action=search|stats|account` and the admin Logs page |
| Automation health | `pipeline_executions` (status `failed`), `deliveries` (`failed`/retrying webhook deliveries) |
| In-app alerts | `notifications` — pipeline stages can notify people/roles inside the app |

**Not shipped:** threshold alerting. The `alerts` entity page documents
the intended `threshold_alert` type, but nothing evaluates it — the old
evaluator was a dead path and has been removed (see `alerts.md`). Don't
build a monitor that expects `threshold.breached` events; the mechanisms
below are the real ones.

## Steps

1. **External liveness probe.** Point an uptime check at the health
   endpoint:

   ```bash
   curl -H "x-api-key: $SPINE_MONITOR_KEY" "$BASE_URL/api/system?action=health"
   ```

   Anything that can poll an HTTPS endpoint works — an uptime service, a
   cron + curl, or a scheduled check in your own infra. Treat non-200,
   `degraded`, or `unhealthy` as alert-worthy.

   **Reliability caveat** (`reference/functions/system.md`): `health`
   effectively proves database connectivity — its `migrations` and
   `functions` data come from stale `v2-core/` paths that don't exist,
   so `migrations.pending` is always `0`/`current` always `true`, and
   `integrity.verified` only means `.spine-manifest.json` was readable,
   not that hashes were checked. `?action=manifest`'s `version` falls
   back to `'2.0.0'` and its migration counts read
   `schema_migrations`, not `_spine_migrations`. **Do not use the
   manifest endpoint as a "did the deploy land" check or a release
   gate** — use your deploy system or `npx spine-framework migrations
   status` for that.

2. **Failure review on a schedule.** The runtime surfaces answer "is
   anything quietly failing":

   - `GET /api/logs?action=search` (or `action=stats`) for error-volume
     spikes — `emitLog` writes every auth event, trigger fire, and audit
     entry here.
   - `GET /api/deliveries` filtered to failed/retrying rows — outbound
     webhooks that aren't landing.
   - `pipeline_executions` with `status: failed` — automation that ran
     and lost. Via API or `npx spine-framework pipelines executions <id>`.

   Roll this into a periodic `spine-operate` health pass (it automates
   this loop) or a small scheduled script writing to your own alerting.

3. **In-app notifications for business events.** Where a person should
   *see* that something happened, use the `notifications` entity from a
   pipeline stage — that's in-app signaling, wired the same way as any
   other automation (see `notifications.md` and `add-a-pipeline.md`).

4. **Write it into the ladder.** Add the probe URL, the monitor key's
   scope, and the review cadence to the project's runbook/`AGENTS.md`
   notes so the next operator finds them.

## Verify

- Kill the key or break the URL → the external probe reports down.
- `system health` on a healthy deploy returns `healthy` —
  `integrity.verified: true` only means the manifest file was readable,
  per the caveat above.
- A deliberately failed pipeline execution shows up in the failure review.

## Common mistakes

- **Monitoring anonymously** — `/api/*` requires a resolved principal;
  a probe without credentials sees 401s, not health.
- **Expecting `threshold_alert` to fire** — unimplemented; use external
  thresholding on the probe output instead.
- **Over-monitoring logs** — `logs` retention is finite: system-cron
  deletes rows older than a fixed 30 days in its UTC-midnight tick
  (`cleanup_old_logs` with `p_retention_days: 30` — there is no
  `settings.log_retention_days`; `accounts.logs_retention_days`/
  `observability_retention_days` exist but nothing invokes
  `prune_logs`/`prune_observability`). It's an audit trail, not a
  metrics store. Export if you need history.
- **Alerting on everything** — `deliveries` retries are normal; alert on
  terminal `failed` states and sustained error rates, not single retries.

## Reference

- [Observability](../observability.md) — the three runtime surfaces in
  depth.
- [Alerts](../alerts.md) — what the (unimplemented) threshold model was
  meant to be.
- [Logs](../logs.md) · [Deliveries](../deliveries.md) ·
  [Pipeline executions](../pipeline-executions.md) — the queryable
  entities.
