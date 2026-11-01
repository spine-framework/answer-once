---
title: tests
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/tests.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/public/_redirects
---

# tests

## What it does

Read-only reporting over the `test_runs` and `test_results` tables —
the suites a Spine deployment records about itself. Lists recent runs,
returns one run with its results, or summarizes the last 30 days per
suite.

## Route and methods

`/.netlify/functions/tests`, reachable as `/api/tests` (`/api/*` →
`/.netlify/functions/:splat`). No method check — the action comes from
query parameters:

| Call | Result |
|---|---|
| `GET /api/tests` or `?action=list` | recent `test_runs` (default limit 20, max 100; `?suite=` filters) |
| `GET /api/tests?action=get&id=<uuid>` or any `?id=`/`?run_id=` | one run + its `test_results` |
| `GET /api/tests?action=stats` | per-suite rollup for `unit`, `integration`, `api`, `ui` over the last 30 days |

Note that `?id=` (or `?run_id=`) forces the `get` path regardless of
`action`.

## Authentication

Standard `createHandler` plus `requireSystemContextWithAudit` — the
caller must resolve to a `system_admin` principal (human with the
`system_admin` role, a `*:*` machine key, or the internal secret).
Anonymous is rejected with 401 by the middleware.

All queries use `adminDb` (service role).

## Request contract

Query params only: `action` (`list` default), `id`/`run_id`, `suite`,
`limit` (capped at 100).

## Response contract

This handler returns raw `{ data, error }` objects as its result, so the
middleware wraps them again: the body is
`{ "data": { "data": <payload>, "error": null }, "error": null, "meta": {...} }`.

- `list` → `data.data` = array of run summaries (`id, suite, status,
  started_at, finished_at, duration_ms, total, passed, failed, skipped,
  triggered_by`).
- `get` → `data.data` = the run row plus `results` (`test_results` ordered
  by `status`, `file`, `name`).
- `stats` → `data.data` = one object per suite: `{ suite, total_runs,
  last_status, last_run_at, last_passed, last_failed, last_total }`.

**Errors are also embedded in the payload**: failures return
`{ error: "<msg>", status: <code> }` inside `data` — the outer HTTP status
is still 200.

## Side effects

None — read-only.

## Errors

Embedded under `data` (HTTP 200):

| Payload | Meaning |
|---|---|
| `{ error: "id is required for action=get", status: 400 }` | `action=get` without `id`/`run_id` |
| `{ error: "Test run not found: …", status: 404 }` | unknown run id |
| `{ error: "<postgrest msg>", status: 500 }` | query failure |

Non-system-admin callers get the `requireSystemContextWithAudit` denial,
which — like the other responses — is returned as the handler result and
lands inside `data` (a `{ statusCode, headers, body }` response object)
with HTTP 200, not as a real 403.

## Agent notes

- Always unwrap twice: `body.data.data` is the payload, `body.data.error`
  is where this endpoint reports failures. Do not rely on HTTP status
  codes here.
- `stats` only covers the four hard-coded suites (`unit`, `integration`,
  `api`, `ui`); other suite names appear in `list` but never in `stats`.
- To record runs, write `test_runs`/`test_results` through
  `/api/admin-data` (raw entity path) or service-role code — this endpoint
  does not create them.
