---
title: admin-data
audience: both
kind: reference
verified_against: ab73809
verified_on: 2026-11-24
source_files:
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/access.ts
  - .framework/functions/_shared/security.ts
  - .framework/public/_redirects
---

# admin-data

## What it does

`admin-data` is the generic CRUD endpoint for Spine's runtime and config
tables. One function exposes list, get, stats, create, update, and remove
across a fixed allowlist of entities, with record-permission evaluation,
field-level sanitization, type-schema stamping, and trigger firing built in.
Custom apps are expected to use this endpoint for all runtime-record CRUD
rather than wrapping it.

The allowlist (`VALID_ENTITIES` in the function source) is `accounts`,
`people`, `items`, `threads`, `messages`, `links`, `attachments`,
`watchers`, `item_progress`, `logs`, `test_runs`, `observability`,
`test_cases`, `notifications`, `types`, `link_types`, `ai_agents`, and
`prompt_configs`. Tables not on it are deliberately elsewhere: `roles`
is managed by the dedicated `/api/roles` endpoint. `notifications`
is a **raw read/mark-read entity** — list/get scope to the caller's
accounts under RLS, and `update` accepts only `is_read`/`read_at` on the
caller's own rows; create is rejected (pipeline/agent-runner actions
write notifications).

## Route and methods

`/.netlify/functions/admin-data`, reachable publicly as `/api/admin-data`
(`/api/*` is redirected to `/.netlify/functions/:splat` in
`.framework/public/_redirects`).

Dispatch is by `?action=` plus HTTP method (`.framework/functions/admin-data.ts`
handler):

| Call | Action |
|---|---|
| `GET /api/admin-data?action=list&entity=…` | `list` |
| `GET /api/admin-data?action=get&entity=…&id=…` | `get` |
| `GET /api/admin-data?action=stats&entity=…` | `stats` |
| `POST /api/admin-data?action=create` | `create` |
| `POST /api/admin-data?action=insert_once` | `insert_once` |
| `PATCH /api/admin-data?action=update&entity=…&id=…` | `update` |
| `PATCH /api/admin-data?action=atomic&entity=…&id=…` | `atomic` |
| `DELETE /api/admin-data?action=remove&entity=…&id=…` | `remove` |

Without a recognized `action` (absent or unmatched), the HTTP method alone
dispatches: `GET` → `get` when `id` is present else `list`, `POST` →
`create`, `PATCH` → `update`, `DELETE` → `remove`. A `?method=` query
parameter overrides the HTTP method for dispatch (the middleware copies
`event.httpMethod` into `query.method` only when the query did not set
it). A matched action with the wrong method (e.g. `action=list` on `POST`)
falls through to `Invalid action or method`.

## Authentication

Standard `createHandler` authentication: `x-api-key` (machine), internal
invoke secret (system), or `Authorization: Bearer <jwt>` (human). Anonymous
requests are rejected with 401 before the handler runs.

- Humans query through a JWT-scoped client (`ctx.db`), so row-level security
  applies. Machines, anonymous, and system principals get the service-role
  client — endpoint-level checks carry the weight. Reads additionally apply
  an explicit `account_id` filter (`_shared/account-scope.ts`) — the sole
  tenancy guard on `adminDb` — which ORs in platform-scope `items` on
  spine-system to match the `items_access` RLS branch; writes stay confined
  to the caller's accounts.
- `list` switches to `adminDb` when `principal.isInternal` or the principal
  is a system admin; otherwise it uses `ctx.db`.
- `create` calls `resolveFirstSurfacePermissions(personId, accountId,
  typeSlug, 'create', designSchema)` — a machine whose scopes contain `*:*`
  bypasses (`isMachineGlobal`); a `*:*` machine also resolves as
  `system_admin`.
- `update` runs `validateUpdatePermissions` and lets system admins through
  regardless of the result.
- `remove` calls `resolveFirstSurfacePermissions(..., 'delete',
  existing.design_schema)` with a system-admin bypass.
- Non-internal audiences never see `visibility: 'internal'` threads, and
  internal messages on external threads are projected to label-only
  skeletons via `projectMessageForCustomer`.

## Request contract

`entity` is required on every call and must be one of `VALID_ENTITIES`:
`accounts`, `people`, `items`, `threads`, `messages`, `links`,
`attachments`, `watchers`, `item_progress`, `logs`, `test_runs`,
`observability`, `test_cases`, `types`, `link_types`, `ai_agents`,
`prompt_configs`.

**list** (query params): `entity`, `search` (ILIKE against a per-entity
field — e.g. `title` for items, `full_name` for people, `message` for
logs), `sort_field` (default `created_at`), `sort_direction` (`desc`
default), `limit` (default 50), `offset` (default 0), `type_slug`,
`type_slugs` (comma-separated, resolved through `ENTITY_TO_KIND` to
`type_id` filters), `view`, `flag_only` / `exclude_flag` (filter on
`data->><flag>` for `items`, `threads`, `messages`, `links`, `attachments`,
`watchers`). Every other query parameter becomes an `.eq(key, value)`
filter, with boolean coercion for `is_active`, `is_verified`, `is_primary`.
Soft-deleted rows are hidden by default — pass `is_active=false` or
`include_inactive=true` to include them. The default `is_active` filter
only applies to tables that have the column; `links`, `attachments`,
`watchers`, `logs`, and `observability` skip it.

**get** (query params): `entity`, `id`, `view`, `lineage` — for `items`,
parent/child lineage is attached unless `lineage=0`.

**stats** (query params): `entity` only.

**create** (body): `entity` (or `?entity=`), `type_slug` or `type_id` —
required for every non-raw entity; `account_id` (optional override);
arbitrary record fields. Field placement follows the type's `system` flag:
`system: true` fields are sent as top-level keys (`title`, `status`),
everything else goes inside a `data` object — a non-system field sent
top-level is stored but invisible to schema-driven readers, and a system
field sent inside `data` never reaches its column (the split is documented
in `concepts/runtime-records.md`). `design_schema`, `validation_schema`,
and `id` in
the body are stripped. `thread_id`, `target_id`, or `parent_id` in the body
pull account and `scope` from the parent record. For `entity=attachments`,
create is the commit step of the upload flow: tenant callers must supply
`tmp_path` (an `attachments-tmp` quarantine object minted by `attachments`
`upload-url`); the handler downloads it, verifies the actual size and
magic-byte mime against the type's `file_policy`, strips GPS metadata,
writes the final object, and stamps `storage_path`, `storage_provider`,
`file_size`, `mime_type`, `uploaded_by` plus `sha256`/`public_url`
metadata. Client-supplied storage columns and reserved metadata keys are
ignored.

**update** (query `entity` + `id`; body): record fields; `design_schema`,
`validation_schema`, `type_id`, `type_slug`, `id`, `entity` are stripped.
`account_id` is honored only for `entity=people`. For `attachments`,
non-system callers additionally lose `storage_path`, `storage_provider`,
`file_size`, `mime_type`, `uploaded_by`, and `visibility`, and submitted
`metadata` merges over the existing map with commit-stamped keys
preserved.

**System-column write guard** — `status` and `is_active` are never
implied by a record-level grant: writing them needs a system principal
(internal/machine/`system_admin`) or an explicit
`fields.<col>.permissions.<role>: ["write"]` /
`system_fields.<col>.<role>: ["write"]` on the record's `design_schema`.
Denied on both create and update (`Insufficient permissions` → 403).
`title` is exempt — it stays a normal `system: true` field members write
on create (decision `0032`).

**atomic** (`PATCH action=atomic`, query `entity` + `id`): a conditional
update the database decides inside one statement (migration
`086_atomic_record_ops` → `record_atomic_update` RPC). Entities: `items`,
`threads`, `messages`, `watchers`, `item_progress`. Body:

- `conditions` — `[{path, op, value}]` where `op` ∈ `eq|neq|lt|lte|gt|gte`
  and `path` ∈ `status|title|is_active|metadata` or `data.<field>`
- `patch` — column set (`status`, `title`, `is_active`, `metadata`,
  `data`) — permission-checked exactly like `update`
- `delta` — `{data.<field>: ±n}` counter moves; data-write permission applies
- `from`/`to` — claim shorthand: appends `{path:'status', op:'eq', value:from}`
  plus `patch.status = to`

Non-matching conditions → **409** `Atomic update conditions not met`.
Atomicity narrows races, not grants (decision `0033`).

**insert_once** (`POST action=insert_once`): idempotent create on
`entity=items`. Body carries `dedupe_key` (string ≤200) plus normal create
fields (`type_id`/`type_slug` required); the key is stored at
`data.dedupe_key` where a per-type partial unique index makes
check+insert atomic. A collision returns the winning row with
`deduplicated: true` instead of an error.

**remove** (query params): `entity`, `id`, `soft` (default `'true'`).
`attachments` always hard-deletes and also removes the stored object
(best-effort — a storage failure does not fail the row delete).

## Response contract

All responses use the middleware envelope:
`{ "data": <result>, "error": null, "meta": { "requestId", "duration" } }`
with HTTP 200. Errors return `{ "data": null, "error": "<message>" }` with
HTTP `err.statusCode || 500`.

- `list` → array of sanitized records; when both `view` and `type_slug`
  are given and the type resolves, `{ data, schema, view }` (schema = the
  type's `design_schema`, `view` = `schema.views[view]` or `null`). The
  exact-count probe runs but the count is not returned.
- `get` → one sanitized record; `items` records additionally carry
  `parents`, `children`, and `type_slug` fields from
  `design_schema.functionality.lineage`. With `view`, returns
  `{ data, schema, view }`.
- `stats` → `{ entity, count }`.
- `create` / `update` → the sanitized row.
- `remove` → `{ deleted: true, soft: true, data }` on soft delete, or
  `{ deleted: true, soft: false }` on hard delete.

## Side effects

- Writes to the target table. On create, `design_schema` and
  `validation_schema` are stamped onto the record from the resolved type
  (missing `record_permissions` defaults to `PERMISSIONS_ALL` — all
  actions for everyone), plus `created_by`, `created_at`, `updated_at`,
  and `account_id` (except `accounts`, which gets `parent_id` instead).
  `types` and `link_types` skip `created_by`/`updated_by` (`UNAUDITED_ENTITIES`).
- `scope: 'platform'` schemas force `account_id` to the `spine-system`
  account; a `thread_id`/`target_id`/`parent_id` parent overrides both
  account and scope.
- `fireCreateTriggers` runs after every create (including raw entities) and
  `fireUpdateTriggers` after every update; trigger errors are logged, not
  raised. **`fireDeleteTriggers` is imported but never called** — removing
  a record fires no triggers.
- `logs`, `test_runs`, `observability`, `test_cases`, `notifications`
  (`RAW_ENTITIES`) bypass type resolution entirely: create inserts a fixed
  column whitelist (e.g. `level`+`message` required for `logs`, `suite`
  for `test_runs`, `metric_name`+`metric_value` for `observability`,
  `slug`+`name` for `test_cases`) and update skips the
  `updated_by`/`updated_at` stamps. `notifications` further restricts
  update to `is_read`/`read_at` on the caller's own rows and rejects
  create outright.
- `checkTypeSlugRateLimit` enforces the app's `rate_limits.<type_slug>_create`
  policies on create.
- Every action is wrapped in `withAdminLogging`, which writes
  admin-operation log rows (entity, action, method, duration, row count).

## Errors

| Condition | HTTP | Message |
|---|---|---|
| No/invalid `entity` | 400 (create) / 500 (others) | `Valid entity parameter is required` |
| Missing `id` on get/update/remove | 500 | `ID parameter is required` / `ID is required for update|delete` |
| Missing type on create | 400 | `type_id or type_slug is required — every runtime record must reference a type` |
| Bad `type_id` / inactive type | 500 | `type_id not found: …` / `type_id references an inactive type: …` |
| `type_slug` on an unmappable entity | 400 | `type_slug is not supported for entity: …` |
| Missing parent | 403 | `Parent record not found or not accessible` |
| Permission denied | 403 | `Insufficient permissions to create|update|delete this record` |
| Record missing or RLS-hidden | 500 | `Record not found or access denied` |
| Bad flag name | 400 | `Invalid flag field name` |
| Unknown action/method | 500 | `Invalid action or method` |

## Agent notes

- Always pass `type_slug` (not `type_id`) when creating runtime records —
  the endpoint resolves it per `kind` via `ENTITY_TO_KIND`
  (`items`→`item`, `threads`→`thread`, `messages`→`message`, `links`→`link`,
  `attachments`→`attachment`, `watchers`→`watcher`, `accounts`→`account`,
  `people`→`person`, `item_progress`→`item_progress`).
- Soft delete is the default and only applies to `accounts`, `people`,
  `items`, `threads`, `messages`, `watchers`, `item_progress`,
  `test_cases` — it sets `is_active=false`. Everything else hard-deletes
  even without `soft=false`; pass `soft=false` explicitly when you mean it.
- Delete triggers do not exist in practice: `remove` never calls
  `fireDeleteTriggers`, so automations keyed on delete events will not run.
- `?id=` is mirrored into the JSON body by the middleware before the
  handler runs.
- Record reads are sanitized per principal: second/third-surface tables and
  field-level `permissions` in `design_schema` shape what comes back, and a
  principal with no account context gets only `id`/`created_at`/`updated_at`.
- A machine API key without `*:*` scope cannot create (the permission
  lookup is by `people.id`, which machine keys don't have) — use `*:*`
  keys for server-side writes, or a human JWT.
- `update` does not re-stamp `design_schema`; changing a record's type
  is not possible through this endpoint (`type_id` is stripped).
