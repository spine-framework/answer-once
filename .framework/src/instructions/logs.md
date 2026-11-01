---
title: Logs
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/pages/admin/LogsPage.tsx
  - .framework/functions/logs.ts
  - .framework/functions/_shared/logging.ts
  - .framework/functions/system-cron.ts
  - .framework/migrations/069_log_stats_window.sql
---

## What this is for

**Logs** (`/spine-framework/admin/observability/logs`) is the account's audit-trail and event-history viewer — every `emitLog`/`emitAudit`/`emitSpan`/`emitActivity` write lands in the `logs` table and shows up here. Use it to trace a request end-to-end (via `trace_id`), answer "who did what when", and debug trigger/pipeline/delivery failures.

## Fields and settings

- **Stats cards** — Total Events, Event Types, Errors, User Actions over the current filter window (`/api/logs?action=stats`).
- **Search** — free text over message/actor fields; debounced 300ms.
- **Level** — `event_type` of the log row (error/audit/span/activity categories surface as selectable values from the stats payload).
- **Source / Source Type** — `action` and `target_type` of the row (e.g. `type.updated`, `item`).
- **Source ID / Actor ID / Trace ID** — UUID/prefix filters: `target_id`, `actor_id`, `trace_id`.
- **From / To dates** — `date_from`/`date_to`; defaults to the last 24h. Stats default to a 7-day window when no `date_from` is given.
- **Row click** — expands the row to show `details`, `metadata`, span info (`span_name`, `span_id`, `parent_span_id`, `duration_ms`, `outcome`).
- **Trace button** — clicking a `trace_id` filters the whole grid to that trace (all spans of one request).
- Paged at 100 rows per page; sortable columns (Time, Trace, Level, Source, Source Type, Source ID, Person, Message).

**Downstream effects**

- What gets written is gated by `system_settings` key `logging`: levels `off | timing | warnings | errors | all` (default `['timing','errors']`). Rows at unconfigured levels are dropped at write time — they never reach this page.
- Retention is `cleanup` with `days_to_keep` (default 30); `system-cron` runs `cleanup_old_logs` at 00:00 UTC. Debugging a week-old issue? Check before it ages out.
- `logs` is also a queryable `admin-data` entity, so pipelines and agents can read the same rows.
- The Observability dashboard and Security page both read this table (`threshold.breached` events, security signals).

## Minimal configuration

Nothing to configure on the page itself. To see useful data, ensure the account's `system_settings.logging.levels` includes the level you need (e.g. `errors`), then filter:

```
Level = error · From = <incident date> · Trace ID = <trace from a failed request>
```

## Full configuration

Combine all filters for a forensic query — e.g. every log row for one record by one person in a window:

```
query = "ticket"
target_type = "items" · source_id = "<record uuid>"
actor_id = "<person uuid>" · trace_id = "<trace uuid>"
date_from = 2026-10-01 · date_to = 2026-10-30
```

API equivalents: `/api/logs?action=account` (paged rows), `action=stats`, plus `target`, `person`, `search`, `cleanup` actions server-side.

## Example

A user reports a failed save at 14:03. Open Logs, set From to that day, paste the `trace_id` from the error toast into Trace ID — the grid now shows the request's full span tree (`api.request` → `db.update` → `trigger.fired`), and the red `error` row's expanded `details` names the failing stage.

## Core files

- `.framework/src/pages/admin/LogsPage.tsx` — this page
- `.framework/functions/logs.ts` — API (`account`, `target`, `person`, `stats`, `search`, `cleanup` actions)
- `.framework/functions/_shared/logging.ts` — `emitLog`, level resolution from `system_settings`
- `.framework/functions/_shared/audit.ts` / `.framework/functions/_shared/tracing.ts` — `emitAudit`/`emitSpan` writers, W3C trace context
- `.framework/functions/system-cron.ts` — daily `cleanup_old_logs` at 00:00 UTC
- Table: `public.logs`

## Agent notes

- Empty page with active traffic almost always means log **levels** filter writes, not that nothing happened — check `system_settings.logging` first.
- `trace_id` is the fastest debugging primitive: every function request shares one, so one click reconstructs the whole call including trigger dispatch.
- System admins query across accounts via `adminDb`; everyone else sees only their account's rows.
- Cleanup is destructive and daily — export anything worth keeping before the 30-day default window closes.
