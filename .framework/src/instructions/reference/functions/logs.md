---
title: logs
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/logs.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/principal.ts
  - .framework/migrations/069_log_stats_window.sql
---

# logs

## What it does

Read/write API over the `public.logs` table — the shared audit, span, and
event log every function writes into. Read actions cover account feeds,
per-target and per-person histories, aggregate stats, and message search;
the write path appends a single log row; `cleanup` prunes old rows.

## Route and methods

`/.netlify/functions/logs` — also `/api/logs` (`/api/*` →
`/.netlify/functions/:splat` in `.framework/public/_redirects`; same
rewrite in the dev proxy, `config/vite.config.ts`).

Dispatch by `?action=` + HTTP method:

| Call | Handler |
|---|---|
| `GET?action=account` | `listAccount` — account-scoped feed |
| `GET?action=target` | `listTarget` — rows for one record |
| `GET?action=person` | `listPerson` — rows for one person |
| `GET?action=stats` | `getStats` — `get_log_stats` RPC |
| `GET?action=search` | `search` — `message ILIKE` match |
| `POST?action=cleanup` | `cleanup` — delete old rows |
| `POST` (no action) | `log` — insert one row |

Anything else throws `Invalid action or method`.

## Authentication

`createHandler` — any non-anonymous principal; anonymous → 401.

Scope varies per action:

- `listAccount` — `system_admin` principals read via `adminDb`
  (cross-account); everyone else reads via `ctx.db` filtered to
  `account_id`, and needs an account context.
- `listTarget`, `listPerson`, `search`, `getStats` — always `ctx.db`
  pinned to `ctx.accountId`; all throw `Account context required` without
  one. Note `ctx.db` is `adminDb` for machine principals, so the
  `account_id` filter is the only scope guard there.
- `log`, `cleanup` — `ctx.db`, no role check inside the function.

## Request contract

Query parameters:

- `account`: `event` (exact `span_name`), `event_type` (exact `level`),
  `target_type` (`source_type`), `source`, `source_id`, `actor_id`
  (`created_by`), `query` (`message ILIKE %…%`), `date_from`, `date_to`,
  `trace_id`, `limit` (100), `offset` (0).
  - Special case: `event=threshold.breached` returns alert-shaped rows
    `{ id, metric, threshold_value, actual_value, created_at }` taken from
    `metadata`, plus `total` — not the standard row mapping.
- `target`: `target_type` + `target_id` (both required), `event_type`,
  `limit` (100), `offset` (0).
- `person`: `person_id` (defaults to the caller's principal id),
  `include_system` (`'true'` to include `level='system'` rows, excluded by
  default), `limit` (50), `offset` (0).
- `stats`: `event_type`, `target_type`, `source`, `source_id`, `actor_id`,
  `query`, `date_from`, `date_to` — all optional, mapped to the
  `get_log_stats` RPC parameters.
- `search`: `query` (required), `event_type`, `target_type`, `limit` (50),
  `offset` (0).

Body (`log` action only): `event_type` (required — written to `level`),
`target_type`, `target_id`, `action` (written to `source`), `message`,
`details` (written to `context`), `metadata`.

Body (`cleanup`): `days_to_keep` (default 30).

## Response contract

Standard envelope `{ data, error, meta }`.

- `account` → `{ data: [mapped rows], total }`.
- `target` / `person` / `search` → array of mapped rows.
- Rows are remapped by `mapLogRow`: `level → event_type`,
  `person_id → actor_id`, `source_type → target_type`,
  `source_id → target_id`, `source → action`, `context → details`, plus
  `span_name`, `trace_id`, `span_id`, `parent_span_id`, `duration_ms`,
  `outcome`, `event_category`, `kind`, `message`, `metadata`,
  `created_at`.
- `stats` → first `get_log_stats` row `{ total, error_count,
  user_action_count, event_type_count, levels, sources, source_types }`,
  or a zeroed object when the RPC returns nothing.
- `log` → `{ log_id }`. `cleanup` → `{ deleted_count }`.

## Side effects

- `log` inserts one `logs` row stamped with `person_id` (caller),
  `account_id`, and the mapped fields.
- `cleanup` deletes `logs` rows with `created_at` older than
  `days_to_keep` — permanently.
- Read actions are pure queries. (The `get_log_stats` RPC is a read.)

## Errors

- `target_type and target_id are required`, `Person ID is required`,
  `Search query is required`, `event_type is required` — validation.
- `Account context required` — non-admin callers without `ctx.accountId`.
- `Invalid action or method` — unmatched dispatch.
- `person`/`target` use caller-scoped `ctx.db` — a `person_id` outside the
  caller's account simply returns an empty page, not an error.

## Agent notes

- **`get_log_stats` defaults to a 7-day window.** When `date_from` is not
  supplied the RPC uses `now() - interval '7 days'`
  (`.framework/migrations/069_log_stats_window.sql`) — "all-time" stats
  are really trailing-week stats. Pass `date_from` explicitly for longer
  windows. (Audit finding F-037.)
- `cleanup` has no admin check: it runs on `ctx.db`. Human JWTs get an
  RLS-scoped client, but machine principals resolve to `adminDb` — a
  machine call to `POST ?action=cleanup` deletes matching rows
  **platform-wide**. Treat this action as operator-only.
- The same `account_id`-vs-`adminDb` asymmetry applies to `listTarget`,
  `listPerson`, `search`, and `getStats`: the `account_id` filter is a
  query predicate, not RLS, for machine callers — but it is always
  applied, so cross-account reads still require omitting account context,
  which those handlers forbid.
- `listAccount`'s `event=threshold.breached` branch returns a different
  row shape — clients parsing log rows should branch on it.
- Field names in the response are the *mapped* names (`event_type`,
  `actor_id`, `target_type`), not the column names (`level`, `person_id`,
  `source_type`) — a common source of confusion when correlating with the
  table directly.
