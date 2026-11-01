---
title: types
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/types.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/schema-utils.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/migrations/015_types_kind_slug_unique.sql
  - .framework/public/_redirects
---

# types

## What it does

CRUD over `public.types` — the type-definition registry whose
`design_schema`/`validation_schema` columns drive record validation,
permissions, and the generic UI (see
[Design Schema](../../concepts/design-schema.md)). Also resolves single
types by `slug` and exposes a schema-lookup RPC pass-through.

## Route and methods

`/.netlify/functions/types`, reachable as `/api/types` (`/api/*` →
`/.netlify/functions/:splat`, `.framework/public/_redirects`). Dispatch is
by `?action=` plus the HTTP method (`?method=` can override the method):

| Call | Handler |
|---|---|
| `GET /api/types?action=schema&kind=<k>&slug=<s>[&app_id=<uuid>]` | `getSchema` → RPC `get_type_schema` |
| `GET /api/types?action=list` (or bare `GET` with no `id`/`slug`/`kind`) | `list` |
| `GET /api/types?slug=<s>` | `getBySlug` (active rows only, joins `apps`) |
| `GET /api/types?id=<uuid>` | `get` |
| `POST /api/types` | `create` |
| `PATCH /api/types?id=<uuid>` | `update` |
| `DELETE /api/types?id=<uuid>` | `remove` |

Quirk: a bare `GET` carrying `kind` (without `action=list` or
`action=schema`) routes to `get`, which then fails with
`Type ID is required` — kind-filtered listing requires `action=list`.

## Authentication

Standard `createHandler` auth (`resolvePrincipal` in
`.framework/functions/_shared/principal.ts`): `x-api-key` → machine
principal, `x-internal-secret` → internal principal,
`Authorization: Bearer <jwt>` → human. Anonymous → 401.

- `create`, `update`, `remove` require a `system_admin` role
  (`PermissionEngine.isSystemAdmin(ctx)`) — no fallback permission path.
- `list`/`get`/`getBySlug`/`getSchema` only require authentication.
  System admins read via `adminDb` (all accounts); other principals use
  `ctx.db` — JWT-scoped (RLS) for humans, service role for machines.

## Request contract

**list** (query): `kind`, `app_id` (`'null'` filters to global types),
`ownership`, `active` (`'false'` → inactive only, `'all'` → everything,
default → active only), `limit` (default 50), `offset` (default 0),
`include_schema` (`'true'` also returns `validation_schema`).

**getBySlug** (query): `slug` — active rows only.

**getSchema** (query): `kind`, `slug` required; `app_id` optional
(passed to the RPC as `null` when absent).

**create** (body): `name`, `slug`, `kind` required. Optional:
`ownership` (default `'system'`), `app_id` (default `null`),
`design_schema` (default `{}`), `validation_schema` (default `null` →
generated), `description`, `icon`, `color`.

**update** (query `id` + body): `name`, `slug`, `description`, `icon`,
`color`, `is_active`, `kind`, `app_id`, `ownership`, `design_schema` —
only keys present in the body are written. An empty update returns the
existing row unchanged.

**remove** (query): `id`.

## Response contract

Standard `{ data, error, meta }` envelope.

- `list` → array of sanitized type rows. `get`/`getBySlug`/`create`/
  `update` → single row. `remove` → `{ success: true }`. `getSchema` →
  `{ design_schema }`.
- Sanitization (`sanitizeRecordData`): system admins get the full row.
  Other principals go through first-surface logic — the row's own
  `design_schema.record_permissions` decides visibility; rows without
  them collapse to `{ id }`. `list` re-attaches `design_schema` to the
  sanitized row when it was stripped, and attaches `validation_schema`
  when `include_schema=true`.

## Side effects

- `create` inserts into `public.types` with `is_active: true`; when the
  body omits `validation_schema` it is generated from `design_schema` by
  `generateValidationSchema` (`.framework/functions/_shared/schema-utils.ts`).
- `update` regenerates `validation_schema` **every time `design_schema`
  is present in the body** — the derived schema is never hand-editable.
- `remove` is a soft delete (`is_active = false`); `ownership: 'system'`
  rows cannot be deleted, and their `ownership` cannot be changed away
  from `'system'`.
- `emitLog` writes `type.created` / `type.updated` / `type.deleted`
  audit rows to `public.logs`.
- Updating a type does **not** restamp `design_schema` onto existing
  records — records keep the schema stamped at their own creation.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Not system admin (create/update/remove) | 500 | `System admin required` |
| Missing create fields | 500 | `name, slug, and kind are required` |
| Duplicate active slug/kind/app_id | 500 | `Type with slug '<s>' already exists for kind '<k>'` |
| Missing `id` / `slug` / `kind`+`slug` | 500 | `Type ID is required` / `Type slug is required` / `kind and slug are required` |
| Update/delete of missing row | 500 | `Type not found` |
| Ownership change on system type | 500 | `Cannot change ownership of system types` |
| Delete system type | 500 | `Cannot delete system types` |
| Bad action/method | 500 | `Invalid action or method` |

Validation failures surface as HTTP 500 — the shared error path maps
thrown `Error`s without a `statusCode` to 500.

## Agent notes

- Slug uniqueness is global per `kind`: the `types_kind_slug_unique`
  index on `types(kind, slug)`
  (`.framework/migrations/015_types_kind_slug_unique.sql`) is stricter
  than `create`'s pre-check (which scopes to `app_id` + `is_active`), so
  a same-kind/same-slug insert under a different `app_id` passes the
  pre-check and then fails at the database. Pick globally unique slugs.
- `kind` must match the runtime table the type governs (`item`,
  `thread`, `message`, …); `admin-data` resolves types by kind+slug.
- `getSchema` delegates to the Postgres RPC
  `get_type_schema(kind, slug, app_id)`, provided by migration
  `070_app_type_schema_rpcs.sql` (along with `get_app_schema`,
  `is_app_available`, `update_app_version`). Installs missing that
  migration will see `function does not exist` errors.
- `update` accepts `kind` and `app_id` changes — there is no guard
  keeping `kind` aligned with already-stamped records.
- The unauthenticated "minimal row" branch in `list` is unreachable via
  HTTP: `createHandler` rejects anonymous callers with 401 first.
