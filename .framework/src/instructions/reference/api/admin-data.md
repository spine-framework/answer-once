---
title: admin-data API
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/resolve-ids.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/src/lib/api.ts
  - .framework/src/hooks/useEntityRecord.ts
---

# `admin-data` API

`POST|GET|PATCH|DELETE /api/admin-data` is the single generic CRUD endpoint
custom apps use for all runtime records. It resolves types, evaluates the
record's stamped `design_schema` permissions, stamps schemas on write,
soft-deletes, and fires triggers. Custom apps must route record CRUD through
it rather than shipping their own record functions — the shared permission,
type-resolution, audit, and trigger logic lives here.

Handler: `.framework/functions/admin-data.ts` via `createHandler`, so every
request is authenticated and wrapped in the standard envelope — see
[Authentication](auth.md) and [Errors and Envelopes](errors-and-envelopes.md).

## Request model

Action and entity come from the **query string**; record fields come from the
JSON body (writes) or additional query params (reads). With no `action`, the
HTTP method picks the verb (`GET`+`id` → get, `GET` → list, `POST` → create,
`PATCH` → update, `DELETE` → remove).

| Action | Method | Params |
|---|---|---|
| `list` | GET | `entity` (required), `search`, `type_slug`, `type_slugs` (csv), `sort_field` (default `created_at`), `sort_direction` (`asc`/`desc`, default `desc`), `limit` (default 50), `offset`, `view`, `flag_only`, `exclude_flag`, plus any other `key=value` as `eq` filters (`is_active`/`is_verified`/`is_primary` coerce `'true'` → boolean) |
| `get` | GET | `entity`, `id`, `view`, `lineage=0` (items only — skips lineage attach) |
| `stats` | GET | `entity` → `{entity, count}` |
| `create` | POST | `entity` (query or body), `type_slug` **or** `type_id` (required for non-raw entities), record fields |
| `update` | PATCH | `entity`, `id`, record fields (partial) |
| `remove` | DELETE | `entity`, `id`, `soft` (default `'true'`) |

Valid entities: `accounts`, `people`, `items`, `threads`, `messages`,
`links`, `attachments`, `watchers`, `item_progress`, `logs`, `test_runs`,
`observability`, `test_cases`, `types`, `link_types`, `ai_agents`,
`prompt_configs`.

`logs`, `test_runs`, `observability`, `test_cases` are **raw entities**:
create takes a per-entity field allowlist, requires specific fields
(`logs`: `level`+`message`; `test_runs`: `suite`; `observability`:
`metric_name`+`metric_value`; `test_cases`: `slug`+`name`), and needs no
`type_id`.

## Response shapes

All responses use the standard envelope `{data, error, meta:{requestId,
duration}}`. `data` is:

- `list` → array of sanitized records, or `{data, schema, view}` when
  `view`+`type_slug` are passed and the type's `design_schema` resolves
- `get` → the sanitized record (+`parents`/`children`/`type_slug` lineage on
  `items` unless `lineage=0`), or `{data, schema, view}` when `view` is
  passed and the record carries `design_schema`
- `create`/`update` → the sanitized record
- `remove` → `{deleted: true, soft: true, data: <record>}` on soft delete;
  `{deleted: true, soft: false}` on hard delete
- `stats` → `{entity, count}`

Sanitization applies `design_schema.fields.*.permissions`: fields the
principal cannot read are stripped before the row is returned.

## Permission evaluation order

1. `createHandler` resolves the principal (401 if anonymous).
2. `create` → `resolveFirstSurfacePermissions(personId, accountId,
   typeSlug, 'create', designSchema)`; machine principals with `*:*` scope
   bypass. Denied → 403.
3. `update` → `validateFirstSurfaceUpdatePermissions` on the **existing
   record's** stamped `design_schema` (no `record_permissions` → deny); each
   `data.<field>` written requires field `write`; sanitizes values through
   `validation_schema`. `system_admin` bypasses.
4. `remove` → `resolveFirstSurfacePermissions(..., 'delete',
   existing.design_schema)`; `system_admin` bypasses.
5. `list`/`get` run under `ctx.db` (RLS-scoped for humans, `adminDb` for
   internal/system-admin), then per-record sanitization.

## Stamping & account resolution on create

- `type_slug` resolves via `resolveTypeRecord(kind, slug)` (kind from
  `ENTITY_TO_KIND`); `type_id` fetches the row and requires `is_active`.
  One of the two is mandatory — "every runtime record must reference a type".
- The record is stamped with the type's `design_schema` and
  `validation_schema` at insert; a missing `record_permissions` merges
  `{all: [create,read,update,delete]}`.
- `account_id` in the body is a **request hint**, not a field — it sets the
  target account when permitted; otherwise `ctx.accountId`.
- `scope: 'platform'` types are stamped with the `spine-system` account;
  children created via `thread_id`/`target_id`/`parent_id` inherit the
  parent's account and scope (missing parent → 403).
- `created_by`/`updated_by` stamp `people.id` for human principals;
  `types`/`link_types` have no audit columns and skip the stamp.
- `checkTypeSlugRateLimit` enforces per-type create policies from
  `apps.config.rate_limits['<type_slug>_create']`.

## Soft delete

`remove` with `soft=true` (default) sets `is_active=false` + `updated_by`/
`updated_at` on `accounts`, `people`, `items`, `threads`, `messages`,
`watchers`, `item_progress`, `test_cases`. Any other entity — or
`soft=false` — performs a hard `DELETE`.

## Visibility projection

Principals without internal-audience roles never see `visibility:
'internal'` threads (filtered or 404), and internal `messages` are projected
to safe step summaries via `projectMessageForCustomer` — unless the parent
thread is `external`/`public`.

## Triggers

`create`/`update`/`remove` await `fireCreateTriggers` / `fireUpdateTriggers`
/ `fireDeleteTriggers` (errors logged, never fail the request). Update
triggers receive the previous row for field-change evaluation.

## Examples

```bash
# List open items of a type
GET /api/admin-data?action=list&entity=items&type_slug=ticket&status=open&limit=25

# Get one item without lineage
GET /api/admin-data?action=get&entity=items&id=<uuid>&lineage=0

# Create a ticket (type by slug)
POST /api/admin-data?action=create
{"entity": "items", "type_slug": "ticket", "title": "Login broken",
 "data": {"priority": "high"}}

# Partial update — only listed data fields are written, each needs field 'write'
PATCH /api/admin-data?action=update&entity=items&id=<uuid>
{"data": {"priority": "low"}, "status": "resolved"}

# Soft then hard delete
DELETE /api/admin-data?action=remove&entity=items&id=<uuid>
DELETE /api/admin-data?action=remove&entity=items&id=<uuid>&soft=false
```

Client-side, `.framework/src/hooks/useEntityRecord.ts` shows the canonical
call pattern through `apiFetch` (`.framework/src/lib/api.ts`), which attaches
`Authorization`, `X-Account-Id`, `traceparent`, and `x-app-id`.

## Common failures

| Status | Cause |
|---|---|
| 400 | missing/invalid `entity`, missing `id`, missing `type_id`/`type_slug` on create, missing required raw-entity fields |
| 401 | no valid credential — see [Authentication](auth.md) |
| 403 | record/field permission denied; parent record not found or not accessible |
| 404-style | `get`/`update`/`remove` on an inaccessible row errors "Record not found or access denied" (RLS hides it) |
