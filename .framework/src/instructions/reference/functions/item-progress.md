---
title: item-progress
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/item-progress.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/audit.ts
  - .framework/public/_redirects
---

# item-progress

## What it does

Tracks a person's progress through a pipeline on a specific item —
one `item_progress` row per `(person_id, item_id)` pair. Enforces
forward-only status transitions defined by the row's type
(`design_schema.pipeline`, default `['not_started', 'in_progress',
'completed']`), stamps `started_at`/`completed_at`, and counts attempts.

## Route and methods

`/.netlify/functions/item-progress`, reachable as `/api/item-progress`
(`/api/*` → `/.netlify/functions/:splat`). Dispatch is by method
(`ctx.query.method`; `?method=` can override):

| Call | Action |
|---|---|
| `GET /api/item-progress` | `list` |
| `GET /api/item-progress?id=<uuid>` | `get` |
| `POST /api/item-progress` | `upsert` |
| `PATCH /api/item-progress?id=<uuid>` | `update` |

Any other method → `Method <method> not supported`.

## Authentication

Standard `createHandler`: `x-api-key`, internal secret, or
`Bearer <jwt>`; anonymous is rejected with 401. All table access goes
through `ctx.db` (RLS-scoped for humans); type lookups and the
item/person title fetches use the service role. There are no additional
role checks.

## Request contract

**list** (query): `person_id`, `item_id`, `item_ids` (comma-separated),
`status`, `limit` (default `100`), `offset` (default `0`). Only
`is_active = true` rows, ordered `updated_at` desc.

**get** (query): `id`.

**upsert** (body): `person_id`, `item_id`, `account_id`, and `type_id`
*or* `type_slug` are required. Optional: `status`, `score`, `data`
(merged into `record.data`), `title`, `description`, `app_id`, `force`.

**update** (body `id` or query `id`): partial row fields plus `force`.

Transition rules: `status` may only move to the same or a later stage of
the type's pipeline (`toIdx >= fromIdx`). Statuses not present in the
pipeline pass unchecked. `force: true` bypasses the check. Backward moves
without `force` throw.

## Response contract

Standard `{ data, error, meta }` envelope.

- `list` → array of `item_progress` rows.
- `get` → one row.
- `upsert` → the upserted row (Postgres `ON CONFLICT (person_id, item_id)`
  — repeat calls update the same row). Auto-fills `title`
  (`"<item title> — <person name>"`) and `description`
  (`"In Progress · score 90 · 2 attempts"`) when not given.
- `update` → the updated row.

## Side effects

- Writes `item_progress` rows; `data.attempts` increments on each status
  change, `data.started_at`/`data.completed_at` stamp on first entry to
  `in_progress`/`completed`. `created_by`/`updated_by` track the principal.
- Emits `item_progress.upserted` / `item_progress.updated` log entries via
  `emitLog` with before/after payloads.
- Reads `items`, `people`, `types` for title composition and pipeline
  resolution.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Missing `id` | 500 | `Progress record ID is required` |
| Missing required upsert fields | 500 | `person_id, item_id, type_id (or type_slug), and account_id are required` |
| Backward/invalid transition | 500 | `Invalid status transition: <from> → <to>. Use force: true to override.` |
| Row not found | 500 | `Progress record not found` |
| Unsupported method | 500 | `Method <method> not supported` |

## Agent notes

- There is no delete action; to retire a progress row, `PATCH`
  `{ "is_active": false }` (list filters it out).
- `type_slug` is resolved with kind `item_progress` — use the progress
  type's slug, not the item's type slug.
- Because `data` is merged (not replaced) on both upsert and update,
  remove a key by writing an explicit `null`, not by omitting it.
- The unique key is `(person_id, item_id)` — one progress row per person
  per item; concurrent upserts conflict-resolve onto the same row.
