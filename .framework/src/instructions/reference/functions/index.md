---
title: Functions index
audience: both
kind: index
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/
  - .framework/public/_redirects
---

# Functions index

All 47 Netlify functions in `.framework/functions/`, grouped by domain.
Every function is reachable publicly as `/api/<name>` (`/api/*` →
`/.netlify/functions/:splat`, `.framework/public/_redirects`), and all
JSON responses use the `{ data, error, meta }` envelope from
`.framework/functions/_shared/middleware.ts`.

Pages linked below are full references; everything else is a one-line
summary.

## Data & access

| Function | What it does |
|---|---|
| [admin-data](./admin-data.md) | Generic CRUD + stats over the entity allowlist, with record permissions, schema stamping, and trigger firing. |
| [account-nodes](./account-nodes.md) | One account plus its ancestors, children, and descendants for hierarchy views. |
| [api-keys](./api-keys.md) | Mint, validate, revoke, and list `sk_…` machine API keys plus usage logs. |
| [auth](./auth.md) | The caller's user context — person, role, permissions, accessible accounts — plus a health probe. |
| [invites](./invites.md) | Registration placement, invite lifecycle, join-request approval, and member management. |
| [item-progress](./item-progress.md) | Per-person pipeline progress on items with enforced status transitions. |

## Config CRUD

| Function | What it does |
|---|---|
| [apps](./apps.md) | App registry CRUD plus schema, availability, and version actions. |
| [prompt-configs](./prompt-configs.md) | Prompt configuration CRUD — model, context template, escalation, output fields. |
| [roles](./roles.md) | Role CRUD (`system_admin`-gated). |
| [types](./types.md) | Type CRUD plus `getBySlug`/`getSchema`; derives `validation_schema` from `design_schema`. |

## Automation

| Function | What it does |
|---|---|
| [pipelines](./pipelines.md) | Pipeline CRUD plus `toggle`, `by-trigger` lookup, and execution listing. |
| [pipeline-executions](./pipeline-executions.md) | Run bookkeeping — list/get, start/complete/cancel, `running`, `stats`, `cleanup`. |
| [pipeline-runner-background](./pipeline-runner-background.md) | Netlify background function that executes one dispatched pipeline run. |
| [system-cron](./system-cron.md) | Cron tick: sweeps stale executions, fires due schedules and timers, evaluates threshold alerts, retries deliveries, cleans logs. |
| [timers](./timers.md) | Timer CRUD + `toggle` for scheduled pipeline firing. |
| [trigger-scheduler](./trigger-scheduler.md) | Netlify scheduled function (`* * * * *`) that bridges Clockwork invocations to `system-cron`. |
| [triggers](./triggers.md) | Trigger CRUD plus `toggle`, `listByEvent`, and execution listing. |

## Integrations & AI

| Function | What it does |
|---|---|
| [ai-agents](./ai-agents.md) | Agent CRUD plus `action=run` multi-turn inference. |
| [ai-interactions](./ai-interactions.md) | Feedback and interaction capture (`submit_feedback`, `create_interaction`). |
| [deliveries](./deliveries.md) | `webhook_deliveries` list/get plus outbound `action=retry`. |
| [embeddings](./embeddings.md) | Embedding lifecycle — `generate`, `search-similar`/`search-semantic`, `revoke`, `approve`, `cleanup`. |
| [eval-harness](./eval-harness.md) | AI eval cases, runs, results, and coverage reporting. |
| [integration-outbound](./integration-outbound.md) | Executes outbound deliveries through integration adapters with retry bookkeeping. |
| [integration-routes](./integration-routes.md) | Public inbound webhook receiver — machine-principal auth, handler registry, record creation. |
| [integrations](./integrations.md) | Integration registry CRUD (providers, credentials, config). |
| [kb](./kb.md) | Knowledge-base `ingest`, `search`, `publish`, `reindex`, `revoke`. |

## Observability & system

| Function | What it does |
|---|---|
| [admin-funnel](./admin-funnel.md) | Visitor→user→install funnel metrics. Dormant: no `handler` export — nothing routes to it. |
| [admin-install-funnel](./admin-install-funnel.md) | Install-funnel metrics plus `exportData`. Dormant: no `handler` export. |
| [admin-signals](./admin-signals.md) | Product-signal metrics and audit listing. Dormant: no `handler` export. |
| [debug-auth](./debug-auth.md) | Auth diagnostics — resolved principal type and env flags. Debug endpoint; not gated beyond authentication. |
| [logs](./logs.md) | Log query API — `account`/`target`/`person`/`stats`/`search`/`cleanup` — plus log writes. |
| [observability](./observability.md) | Metrics API — event volume, error rate, latency percentiles, pipeline stats, top actors, AI support metrics, cleanup. |
| [security](./security.md) | Flagged accounts, ban/unban across blocklist + Supabase + edge firewall, blocklist management. |
| [system](./system.md) | Deployment `manifest`, `health`, and `openapi` descriptors. |
| [tests](./tests.md) | `test_runs`/`test_results` reporting — list, get, 30-day per-suite stats. |

