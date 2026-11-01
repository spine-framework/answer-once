---
title: integrations
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/integrations.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/migrations/004_core_rpc_and_broker.sql
  - .framework/public/_redirects
---

# integrations

## What it does

CRUD over `public.integrations` — the registry of external providers
(`integration_type`: webhook/oauth/api/scheduled_sync, `provider`,
`version`, `config`) including their `credentials` secrets map.
Runtime delivery happens elsewhere — `integration-outbound` executes
deliveries and `deliveries` lists them (see
[Integrations and webhooks](../../concepts/integrations-and-webhooks.md)).

## Route and methods

`/.netlify/functions/integrations`, reachable as `/api/integrations`
(`/api/*` → `/.netlify/functions/:splat`,
`.framework/public/_redirects`). Dispatch is by HTTP method only:

| Call | Handler |
|---|---|
| `GET /api/integrations` | `list` |
| `GET /api/integrations?id=<uuid>` | `get` |
| `POST /api/integrations` | `create` |
| `PATCH /api/integrations` (`id` in body or query) | `update` |
| `DELETE /api/integrations?id=<uuid>` | `remove` |

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list`/`create` require `ctx.accountId` (`Account context required` /
  `User context (person and account) required`).
- There is **no role check** anywhere in this file. System admins use
  `adminDb`; others use `ctx.db` (JWT-scoped for humans, service role
  for machines).
- Credential exposure is controlled on the **read** path by
  `sanitizeRecordData`: system admins get the full row including
  `credentials`; every other principal gets `{ id }` — the integration
  collapses to an opaque handle
  (`.framework/functions/_shared/permissions.ts`,
  `sanitizeFirstSurfaceRecordData`: no `design_schema` on the row →
  minimal response). `credentials` never leave the function for
  non-admins.

## Request contract

**list** (query): `integration_type`, `provider`, `is_active`,
`is_configured` (`'true'`/`'false'`), `limit` (default 100), `offset`
(default 0). Ordered by `name`; joins `app` and `created_by` person.

**get** (query): `id`.

**create** (body): `name`, `integration_type`, `provider` required.
Optional: `slug` (defaults to a slugified `name`), `app_id`,
`description`, `version` (default `'1.0.0'`), `config` (default `{}`),
`credentials`, `metadata`. `account_id` and `created_by` are stamped
from context. `is_configured` is **computed**, not accepted: every
`credentials` entry must be `{ source, value }` with a non-empty string
`value` for the flag to be `true`.

**update** (`id` in body or query + body): allowlist — `name`, `slug`,
`description`, `integration_type`, `provider`, `version`, `config`,
`credentials`, `metadata`, `is_active`. Passing `credentials`
recomputes `is_configured`.

**remove** (query): `id` — soft delete (`is_active = false`).

## Response contract

Standard `{ data, error, meta }` envelope. `list`/`get`/`create`/
`update`/`remove` return sanitized row(s): full row for system admins,
`{ id }` for non-admin humans. `remove` returns the deactivated row.

## Side effects

- `create`/`update` store `credentials` verbatim — the column is a
  secrets map `{ field: { source: 'value'|'env_var', value } }`
  (`.framework/migrations/004_core_rpc_and_broker.sql`), not encrypted at
  rest by this function.
- `update` recomputes `is_configured` whenever `credentials` is in the
  body; it is never recomputed for `config`-only edits.
- `emitLog` writes `integration.created` / `.updated` / `.deleted` audit
  rows to `public.logs`. The update audit payload includes the full
  `updateData` — **including credentials** — in `after`.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| No account context | 500 | `Account context required` |
| Missing create fields | 500 | `name, integration_type, and provider are required` |
| No person+account context (create) | 500 | `User context (person and account) required` |
| Missing `id` | 500 | `Integration ID is required` |
| Row missing on delete | 500 | `Integration not found` |
| Unknown method | 500 | `Unsupported method: <METHOD>` |

Validation failures surface as HTTP 500 — thrown `Error`s without a
`statusCode` map to 500 in the shared error path.

## Agent notes

- Writes are guarded only by authentication + RLS (for humans).
  `create`/`update`/`remove` do not call any `canCreate`/`canUpdate`
  permission check — a machine principal's service-role `ctx.db` writes
  unconditionally.
- `update`'s audit log records `credentials` in the `after` payload —
  secrets land in `public.logs`. Rotate rather than patch in place if
  log exposure matters.
- Slug uniqueness is `UNIQUE(app_id, account_id, slug)`
  (`.framework/migrations/004_core_rpc_and_broker.sql`); there is no
  pre-check, so duplicates surface as PostgREST constraint errors.
- Inbound webhook execution and credential resolution live in
  `integration-routes`/`integration-outbound` and
  `.framework/functions/_shared/resolve-credentials.ts` — this function
  only manages the registry rows.
