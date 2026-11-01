---
title: observability
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/observability.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/resolve-ids.ts
  - .framework/functions/_shared/middleware.ts
---

# observability

## What it does

Aggregation API over `public.logs` and `public.pipeline_executions` — the
metrics surface behind the observability dashboards: event volume, error
rate, latency percentiles, pipeline stats, top actors, AI-support metrics,
and a log-retention cleanup action.

## Route and methods

`/.netlify/functions/observability?action=<action>` — also `/api/…`
(`/api/*` → `/.netlify/functions/:splat` in
`.framework/public/_redirects`).

Dispatch is on `action` only — there are no HTTP-method checks. Valid
actions: `event_volume`, `error_rate`, `latency_percentiles`,
`pipeline_stats`, `top_actors`, `ai_support_metrics`, `cleanup`.

## Authentication

`createHandler` — non-anonymous principal required (401 otherwise).

`system_admin` principals query via `adminDb` across all accounts;
everyone else uses `ctx.db` and the handlers additionally filter
`account_id = ctx.accountId` — non-admins without account context get
`Account context required`. `cleanup` separately requires
`principal.roles` to include `system_admin`.

## Request contract

All inputs are query parameters:

| Action | Params | Returns |
|---|---|---|
| `event_volume` | `from`, `to` (required ISO dates); `bucket` = `hour`\|`day` (default `hour`) | `[{ bucket, count }]` sorted ascending — counts of `logs` rows bucketed by `created_at` |
| `error_rate` | `from`, `to` (required) | `{ total, errors, rate }` — rows with `outcome='failure'` or `level='error'` over total |
| `latency_percentiles` | `from`, `to` (required); `source` (default `request`, matched against `span_name`) | `{ p50, p90, p95, p99 }` over positive `duration_ms` values |
| `pipeline_stats` | `from`, `to` (required) | `[{ pipeline_id, success_count, failure_count, avg_duration_ms }]` over `pipeline_executions` (`completed`/`failed` statuses counted; avg over rows having both timestamps) |
| `top_actors` | `from`, `to` (required); `limit` (default 5) | `[{ principal_id, event_count }]` — counts of `logs.created_by`, `anonymous` for null |
| `ai_support_metrics` | `from`, `to` (optional; default last 30 days); requires account context | see below |
| `cleanup` | `days` (default 30) | `{ deleted_count }` via `cleanup_old_logs` RPC; system-admin only |

`ai_support_metrics` resolves the `ai_feedback_record` item type and
reads `items` for the context account: feedback rows (attempted count,
`customer_feedback='not_helpful'`, `kb_article_id`, `reuse_count`,
`kb_candidate`), resolved items (`status='resolved'` with
`data->>aim_escalation_reason='none'`), and escalations
(`status='human_assigned'`). Response: `{ period: {from,to},
ai_attempted, ai_resolved, human_escalations, thumbs_down_rate,
kb_articles_created, kb_reuse_count, knowledge_gaps }`. It uses `adminDb`
scoped to `ctx.accountId` and tolerates per-query failure via
`Promise.allSettled` — a failed sub-query contributes zero, not an error.

## Response contract

Standard envelope `{ data, error, meta }`. Payloads per action are listed
above; aggregation happens in memory inside the function (there are no
SQL rollups for the metrics endpoints — full matching rows are selected
then counted).

## Side effects

Read-only except `cleanup`, which deletes `logs` rows older than `days`
via the `cleanup_old_logs` RPC. (`system-cron` performs the same cleanup
automatically on the 00:00 UTC tick with a 30-day retention.)

## Errors

- `Account context required` — non-admin callers without `ctx.accountId`
  (all actions), and `ai_support_metrics` for any caller.
- `from and to dates are required` — all metric actions except
  `ai_support_metrics` and `cleanup`.
- `System admin required` — `cleanup` without the `system_admin` role.
- `Unknown action: <x>. Valid actions: …` — unmatched `action`.

## Agent notes

- These are in-memory aggregations, not RPC rollups: `event_volume`,
  `error_rate`, `latency_percentiles`, and `top_actors` pull every
  matching row's columns and count locally. Wide `from`/`to` windows over
  a busy `logs` table are proportional in cost — keep ranges tight.
- `latency_percentiles` filters `span_name = source` (default `request`)
  — the request spans emitted by `createHandler`. Passing `source=` for
  other span names (e.g. `db.select`, `pipeline.run`) yields percentiles
  for those operations.
- `top_actors` keys on `created_by`, which is null for machine-emitted
  spans — those collapse into `anonymous`.
- `ai_support_metrics` depends on `ai_feedback_record` items and
  `status='human_assigned'`/`'resolved'` conventions written by the AI
  support flows; it returns zeros on installations without them rather
  than erroring.
