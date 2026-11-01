---
title: roles
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/roles.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/migrations/009_roles_slug_unique.sql
  - .framework/public/_redirects
---

# roles

## What it does

CRUD over `public.roles` — role definitions (slug, `permissions` JSON,
`is_system`, `is_protected`) that principals carry and the permission
engine matches against `design_schema.record_permissions`.

## Route and methods

`/.netlify/functions/roles`, reachable as `/api/roles` (`/api/*` →
`/.netlify/functions/:splat`, `.framework/public/_redirects`). Dispatch
is by HTTP method only (`?action=` is ignored):

| Call | Handler |
|---|---|
| `GET /api/roles` | `list` |
| `GET /api/roles?id=<uuid>` | `get` |
| `POST /api/roles` | `create` |
| `PATCH /api/roles` (`id` in **body**) | `update` |
| `DELETE /api/roles` (`id` in **body**) | `remove` |

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `create` requires `system_admin`, or a `canCreate` grant from
  `resolveFirstSurfacePermissions(..., 'role', 'create')`. Creating the
  `system_admin` slug itself always requires `system_admin`.
- `update`/`remove` have no explicit role gate — writes go through
  `adminDb` for system admins and `ctx.db` (JWT-scoped, RLS) for other
  humans, so a non-admin's update fails at the database as
  `Role not found or access denied`.
- `list`/`get` are readable by any authenticated principal.

## Request contract

**list** (query): `app_id` (`'null'` filters to global roles),
`is_system` (`'true'`/`'false'`), `limit` (default 50), `offset`
(default 0). Active rows only, ordered `is_system` desc then `name`,
joining `app:apps(id, slug, name)`.

**get** (query): `id` — active rows only.

**create** (body): `slug`, `name` required. Optional: `app_id`,
`description`, `permissions` (default `{}`), `is_system` (default
`false`). `is_active: true` is forced.

**update** (body): `id` plus any subset of role columns — **no field
allowlist**; every key except `id` is written plus `updated_at`, after
`validateUpdatePermissions(ctx, updates, current, 'role')` passes.

**remove** (body): `id` — soft delete (`is_active = false`).

## Response contract

Standard `{ data, error, meta }` envelope.

- `list` → array of role rows; `get`/`create`/`update`/`remove` → single
  row.
- System admins get raw rows. Other principals get `sanitizeRecordData`
  output — role records carry no `design_schema`, so non-admin reads
  collapse to `{ id }` (and `list` returns an array of `{ id }`
  objects). Row-level access for humans is additionally bounded by RLS
  on `ctx.db`.

## Side effects

- `create` inserts into `public.roles` after a duplicate-slug pre-check
  scoped to `slug` + `app_id` (or `app_id IS NULL` for global roles).
- `remove` is a soft delete; `update`/`remove` stamp `updated_at`.
- `emitLog` writes `role.created` / `role.updated` / `role.deleted`
  audit rows to `public.logs` with before/after payloads.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Missing create fields | 500 | `slug and name are required` |
| Non-admin creating `system_admin` | 500 | `system_admin role can only be created by system administrators` |
| Non-admin without create grant | 500 | `Insufficient permissions to create roles` |
| Duplicate slug for app scope | 500 | `Role slug already exists for this app` |
| Missing/inaccessible row | 500 | `Role not found or access denied` |
| Missing `id` | 500 | `Role ID is required` |
| Unknown method | 500 | `Unsupported method: <METHOD>` |

Validation failures surface as HTTP 500 — thrown `Error`s without a
`statusCode` map to 500 in the shared error path.

## Agent notes

- `update` and `remove` read `id` from the **body** only — a
  `?id=` query param is not consulted (unlike most sibling functions).
- The pre-check scopes slug uniqueness to `app_id`, but the database
  enforces a **global** unique index on `roles(slug)`
  (`roles_slug_key`, `.framework/migrations/009_roles_slug_unique.sql`)
  — a slug already used by another app passes the pre-check then fails
  the insert. The pre-check also ignores `is_active`, so soft-deleted
  slugs still conflict.
- `update` accepts arbitrary columns (no allowlist): `slug`,
  `is_system`, `is_protected`, `permissions` can all be rewritten by a
  caller that passes `validateUpdatePermissions`.
- Role `permissions` is a free-form JSON column — the grant semantics
  live in `design_schema.record_permissions` matching on role **slug**,
  not in this table.
