---
title: Threshold Alerts
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/pages/admin/AlertsConfigPage.tsx
  - .framework/functions/admin-data.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/observability.ts
---

## What this is for

**Threshold Alerts** (`/spine-framework/admin/observability/alerts`) manages alert rules over platform metrics. Each alert is a runtime `items` record of type `threshold_alert`, edited through the generic `admin-data` API. `system-cron` evaluates them every tick; a breach emits a `threshold.breached` log event (visible under Logs and on the Observability dashboard) and can invoke a linked pipeline.

## Fields and settings

- **Title / Description** — record `title` and `description` shown in the list.
- **Status** — `active` or `inactive`; toggled per-row (writes both `status` and `data.is_active`).
- **Metric** (`data.metric`) — `error_rate` (%), `latency_p95` (ms), or `pipeline_failure_rate` (%).
- **Operator** (`data.operator`) — `gt` (>) or `lt` (<).
- **Value** (`data.value`) — the threshold number, in the metric's unit.
- **Window** (`data.window_minutes`) — lookback window the metric is computed over.
- **Pipeline** (`data.pipeline_id`) — optional pipeline invoked when the threshold is breached; populated from `/api/pipelines?action=list`.
- Stats cards — Total, Active, Inactive, With Pipeline.

**Downstream effects**

- Alerts are plain `items` records — create/edit/delete goes through `/api/admin-data?entity=items` with `type_id: "threshold_alert"`, so they inherit the type's `record_permissions` and validation.
- `system-cron` evaluates each active alert every tick against the observability metrics; breaching emits `threshold.breached` log events.
- An alert without a `pipeline_id` still logs breach events — the pipeline link is what turns a breach into an action.
- Deleting an alert hard-removes the record; there is no history table beyond `logs`.

## Minimal configuration

```
Title: High error rate
data.metric: error_rate · data.operator: gt · data.value: 5
data.window_minutes: 60 · is_active: true
```

## Full configuration

```json
{
  "type_id": "threshold_alert",
  "title": "P95 latency above 2s",
  "description": "Page on sustained slow requests",
  "status": "active",
  "data": {
    "metric": "latency_p95",
    "operator": "gt",
    "value": 2000,
    "window_minutes": 30,
    "pipeline_id": "<pipeline uuid>",
    "is_active": true
  }
}
```

## Example

A platform team keeps three alerts: `error_rate > 5% / 60min` paging the on-call pipeline, `latency_p95 > 2000ms / 30min` opening an incident thread, and `pipeline_failure_rate > 10% / 15min` running a diagnostics pipeline that snapshots recent executions.

## Core files

- `.framework/src/pages/admin/AlertsConfigPage.tsx` — this page (modal create/edit, toggle, delete)
- `.framework/functions/admin-data.ts` — CRUD backend (`entity=items`, `type_id=threshold_alert`)
- `.framework/functions/system-cron.ts` — per-tick threshold evaluation, emits `threshold.breached`
- `.framework/functions/observability.ts` — `error_rate`/`latency_percentiles`/`pipeline_stats` metrics the alerts compare against
- Table: `public.items` rows of type `threshold_alert`

## Agent notes

- The type slug is `threshold_alert` and the config lives under `data.*` — do not confuse it with the `pipelines`/`triggers` config tables.
- `status` and `data.is_active` are written together by the toggle; editing the record elsewhere can desync them — the evaluator reads `data.is_active`.
- Breach events are the audit trail: filter Logs by `threshold.breached` to see when and how often an alert fired.
- There is no dedupe/cooldown field — a breached metric re-fires each tick; build any cooldown into the linked pipeline.
