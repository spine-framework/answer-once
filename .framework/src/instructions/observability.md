---
title: Observability Dashboard
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/pages/admin/ObservabilityDashboard.tsx
  - .framework/functions/observability.ts
  - .framework/functions/logs.ts
  - .framework/functions/_shared/logging.ts
---

## What this is for

The **Observability Dashboard** (`/spine-framework/admin/observability`, also `/observability/dashboard`) is the account's health console: event volume, error rate, latency percentiles, per-pipeline run stats, top actors, and recent threshold-alert breaches — all computed from the `logs` table and refreshed on an interval.

## Fields and settings

- **Time range** — Last Hour / Last 24 Hours / Last 7 Days (`from`/`to` sent to every query; the volume chart buckets by minute/hour/day respectively).
- **Refresh interval** — auto-refetch every 10s / 30s / 1m, plus a manual Refresh Now button.
- **Stats cards** — Total Events, Error Rate (%), P95 Latency (ms, red above 2000ms), Pipelines with runs.
- **Charts** — Event Volume line chart (bucketed counts), error rate, latency percentiles (p50/p95/p99), per-pipeline success/failure/avg-duration, Top Actors (limit 5).
- **Recent alerts** — last 5 `threshold.breached` log events in the window (metric, threshold, actual value, time).

**Downstream effects**

- Everything derives from `public.logs` rows written by `emitLog`/`emitAudit`/`emitSpan` — if log levels drop a category (`system_settings.logging.levels`), it disappears from these charts too.
- Queries are account-scoped for normal users; `system_admin` principals get cross-account reads (`adminDb`).
- The metrics here are exactly what threshold alerts compare against (`error_rate`, `latency_percentiles`, `pipeline_stats` actions).
- This page is read-only — it writes nothing.

## Minimal configuration

Open the page — defaults (24h range, 30s refresh) are sane for monitoring. There is nothing to configure.

## Full configuration

The backing API exposes more than the charts use:

- `GET /api/observability?action=event_volume&from=&to=&bucket=minute|hour|day`
- `action=error_rate` · `action=latency_percentiles` · `action=pipeline_stats` · `action=top_actors&limit=` · `action=ai_support_metrics` · `action=cleanup` (POST)

## Example

After deploying a new pipeline, set the range to Last Hour and refresh to 10s: Event Volume climbs with each run, the pipeline stats panel shows success vs failure counts and average duration, and a spike in the error-rate card correlates to the `error`-level rows you can drill into under Logs.

## Core files

- `.framework/src/pages/admin/ObservabilityDashboard.tsx` — this page (recharts)
- `.framework/functions/observability.ts` — metrics API (all `action=` queries above)
- `.framework/functions/logs.ts` — the `threshold.breached` alert feed (`action=account&event=`)
- `.framework/functions/_shared/logging.ts` — the emit path and level gating that decides what reaches `logs`
- Table: `public.logs` (source of all charts)

## Agent notes

- Flat charts with healthy traffic = log-level filtering, not broken metrics — the dashboard can only chart what `system_settings.logging.levels` allowed to be written.
- `system_admin` sees cross-account aggregates here; account members see only their own account.
- The 10s refresh is client-side polling — each tick re-runs all five metric queries; don't leave it open on a metered connection.
- Breach alerts shown here are read from `logs`, not from the alert records — see Threshold Alerts for the rules themselves.
