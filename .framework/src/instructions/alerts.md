---
title: Threshold Alerts
audience: both
kind: entity
verified_against: 9f90999
verified_on: 2026-11-16
source_files:
  - .framework/src/pages/admin/AlertsConfigPage.tsx
  - .framework/functions/admin-data.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/observability.ts
---

## What this is for

**Threshold Alerts** (`/spine-framework/admin/observability/alerts`) is the admin UI for alert rules over platform metrics, stored as `items` records of type `threshold_alert` through the generic `admin-data` API. **Threshold alerting is not implemented end-to-end**: `system-cron`'s per-tick evaluator was removed (it read a `threshold_alerts` table no migration ever created — not the `items` records this page writes), no `threshold_alert` type is seeded, and nothing emits `threshold.breached` events. `logs.ts` still maps that event name into the alert display shape. This page documents the vestigial surface (decision `spine-framework:0016`).

## Why it exists

None today — this page exists so the table's status is documented rather than rediscovered.

**What exists instead:**

- `logs.ts` maps `logs` rows into alert-shaped responses (`metric`, `threshold_value`, `actual_value`) for the admin UI — alert display is synthesized, not stored.
- `system-cron.ts` *previously* read `threshold_alerts` — a table **no migration defines** (archive-lineage residue; the `adminDb` call silently failed every tick). That dead path has been removed; threshold alerting is unimplemented end-to-end.

**Why it would exist (the intent):** threshold alerting needs declared rules (metric + threshold + pipeline to fire) — presumably what `alerts`/`threshold_alerts` were meant to be.

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
- No `threshold_alert` type is seeded: the list returns empty (`Type not found` → `[]`) and create fails until someone creates the type (e.g. via the Types admin). The records then save — but nothing evaluates them.
- `system-cron` does not evaluate alerts. The removed evaluator queried `public.threshold_alerts` (a table that never existed), not these `items` rows — so even before removal, alerts saved here were never evaluated.
- Deleting an alert removes the record; there is no history table beyond `logs`.

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

A platform team wants `error_rate > 5% / 60min` to fire an on-call pipeline. Today they can only model the rule — the record saves, but no evaluator exists to breach it. To build real threshold alerting, the work is an evaluator (a `system-cron` stage or a dedicated function) that reads `threshold_alert` items, computes the metrics in `observability.ts`, and emits `threshold.breached` + invokes `data.pipeline_id`.

## Core files

- `.framework/src/pages/admin/AlertsConfigPage.tsx` — this page (modal create/edit, toggle, delete)
- `.framework/functions/admin-data.ts` — CRUD backend (`entity=items`, `type_id=threshold_alert`)
- `.framework/functions/system-cron.ts` — tick driver; the removed `evaluateThresholds` lived here (dead `threshold_alerts` query, removed in `3b5a7de`)
- `.framework/functions/observability.ts` — `error_rate`/`latency_percentiles`/`pipeline_stats` metrics an evaluator would compare against
- `.framework/functions/logs.ts` — maps `threshold.breached` log rows into the alert display shape (`listAccount`, `event=threshold.breached`)
- Table: `public.items` rows of type `threshold_alert` (the type itself is **not** seeded)

## Agent notes

- The type slug is `threshold_alert` and the config lives under `data.*` — do not confuse it with the `pipelines`/`triggers` config tables.
- `status` and `data.is_active` are written together by the toggle; editing the record elsewhere can desync them — and there is currently no reader of either field.
- Nothing emits `threshold.breached`; the Logs filter for it exists but always returns empty until an evaluator is built.
- Decision `spine-framework:0016` records `public.alerts` and `threshold_alerts` as vestigial — when a real implementation is commissioned, define the rule table properly rather than reusing `alerts`.
