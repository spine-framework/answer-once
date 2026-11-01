---
title: apps
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/apps.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/migrations/013_get_account_apps_role_filter.sql
  - .framework/public/_redirects
---

# apps

## What it does

CRUD over `public.apps` — the app registry that controls routing
(`route_prefix`, `renderer`), visibility (`min_role`, `required_roles`),
and install metadata (`version`, `app_type`, `source`,
`integration_deps`). Also exposes schema, availability, and version-bump
RPC pass-throughs.

## Route and methods

`/.netlify/functions/apps`, reachable as `/api/apps` (`/api/*` →
`/.netlify/functions/:splat`, `.framework/public/_redirects`). Dispatch
is by method plus `?action=`/`?id`/`?slug`:

| Call | Handler |
|---|---|
| `GET /api/apps` | `list` (also `?action=list`) |
| `GET /api/apps?id=<uuid>` or `?slug=<s>` or `?action=get` | `get` |
| `GET /api/apps?action=schema&slug=<s>` | `getSchema` → RPC `get_app_schema` |
| `GET /api/apps?action=available&slug=<s>` | `checkAvailability` → RPC `is_app_available` |
| `POST /api/apps` | `create` |
| `POST /api/apps?action=version` | `updateVersion` → RPC `update_app_version` |
| `PATCH /api/apps?id=<uuid>` (or `id` in body) | `update` |
| `DELETE /api/apps?id=<uuid>` (or `id` in body) | `remove` |

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list` requires an account context (`ctx.accountId` or an explicit
  `account_id` query param).
- `create` allows non-system-admins only when
  `resolveFirstSurfacePermissions(principal.id, accountId, 'app',
  'create')` grants `canCreate`.
- `update`/`remove` have no role gate in this file — field-level control
  comes from `validateUpdatePermissions` (update only) and RLS on
  `ctx.db` for human callers. Machine principals run `ctx.db` as the
  service role.

## Request contract

**list** (query): `account_id` (defaults to `ctx.accountId`),
`include_system` (default true; `'false'` excludes), `include_inactive`
(`'true'` to include). Backed by the `get_account_apps` RPC, which
filters by ownership, active state, `required_roles`/`min_role` against
the caller's role slugs unless the caller is a system admin
(`.framework/migrations/013_get_account_apps_role_filter.sql`).

**get** (query): `id` or `slug` (active rows only).

**getSchema** / **checkAvailability** (query): `slug`.

**create** (body): `slug`, `name` required. Optional with defaults:
`version` `'1.0.0'`, `app_type` `'custom'`, `source` `'custom'`,
`owner_account_id` → caller's account, `config` `{}`, `nav_items` `[]`,
`min_role` `'member'`, `required_roles` `[]`, `integration_deps` `[]`, `metadata` `{}`,
`route_prefix` `'/' + slug`, `renderer` `'generic'`; `is_active: true`,
`is_system: false` are forced.

**update** (`id` in body or query + body): **no field allowlist** —
every body key except `id` is written verbatim plus `updated_at`, after
`validateUpdatePermissions(ctx, updates, current, 'apps')` passes.

**remove** (`id` in body or query): sets `is_active = false`.

**updateVersion** (body): `id`, `version` required.

## Response contract

Standard `{ data, error, meta }` envelope.

- `list` → rows from `get_account_apps`, each passed through
  `sanitizeRecordData`. Non-system-admins receive only the routing
  whitelist (`id, slug, name, description, route_prefix, min_role,
  required_roles, preview_domain, prod_domain, is_active, is_system,
  renderer, created_at, updated_at`); admins get the full row.
- `get` → sanitized row. `getSchema` → raw RPC result.
  `checkAvailability` → `{ available: boolean }`. `updateVersion` →
  `{ success: true }`.

## Side effects

- `create` inserts into `public.apps`; a duplicate `slug` is rejected by
  a pre-check before insert (slug has a global `UNIQUE` constraint in
  `.framework/migrations/001_core_schema.sql`).
- `update`/`remove` write `updated_at`; remove is a soft delete.
- `emitLog` writes `app.created`, `app.updated`, `app.deleted`, and
  `app.version_updated` audit rows to `public.logs`.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| No account context (list, available) | 500 | `Account context required` |
| Missing slug/id | 500 | `App ID or slug is required` / `App slug is required` / `App ID is required` |
| Missing create fields | 500 | `slug and name are required` |
| Non-admin without create grant | 500 | `Insufficient permissions to create apps` |
| Duplicate slug | 500 | `App slug already exists` |
| Missing row (update/remove) | 500 | `App not found` |
| Missing version args | 500 | `App ID and version are required` |
| Unknown method | 500 | `Unsupported method: <METHOD>` |

Validation failures surface as HTTP 500 — thrown `Error`s without a
`statusCode` map to 500 in the shared error path.

## Agent notes

- The four RPCs called here — `get_app_schema`, `is_app_available`,
  `update_app_version` (plus `get_type_schema` for types) — are provided
  by `.framework/migrations/070_app_type_schema_rpcs.sql`;
  `get_account_apps` exists via
  `.framework/migrations/013_get_account_apps_role_filter.sql`. Installs
  missing migration 070 will see `function does not exist` errors.
- `update` will write **any** column present in the body (including
  `slug`, `is_system`, `owner_account_id`) — the only guard is
  `validateUpdatePermissions`, which is config-object (second-surface)
  logic. Treat it as an admin-trusted endpoint.
- `remove` does not check `is_system` or permissions at all beyond
  authentication + RLS for human callers.
- `renderer` defaults to `'generic'` on create — custom-renderer apps
  must pass `renderer: 'custom'` explicitly (see
  [Apps and renderers](../../concepts/apps-and-renderers.md)).
