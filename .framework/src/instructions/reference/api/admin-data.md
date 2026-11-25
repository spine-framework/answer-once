---
title: admin-data API
audience: developers, agents
kind: reference
verified_against: 5f7c326
verified_on: 2026-11-24
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
| `list` | GET | `entity` (required), `search`, `type_slug`, `type_slugs` (csv), `sort_field` (default `created_at` — passed verbatim to PostgREST `order`, so it must be a real column; `data.*` jsonb paths are rejected — sort on a column and order client-side), `sort_direction` (`asc`/`desc`, default `desc`), `limit` (default 50), `offset`, `view`, `flag_only`, `exclude_flag`, plus any other `key=value` as `eq` filters (`is_active`/`is_verified`/`is_primary` coerce `'true'` → boolean) |
| `get` | GET | `entity`, `id`, `view`, `lineage=0` (items only — skips lineage attach) |
| `stats` | GET | `entity` → `{entity, count}` |
| `create` | POST | `entity` (query or body), `type_slug` **or** `type_id` (required for non-raw entities), record fields; `tmp_path` required for `entity=attachments` |
| `update` | PATCH | `entity`, `id`, record fields (partial) |
| `remove` | DELETE | `entity`, `id`, `soft` (default `'true'`) |
| `atomic` | PATCH | `entity`, `id`; body `conditions`/`patch`/`delta` or claim shorthand `{from, to}` — see [Atomic updates](#atomic-updates) |
| `insert_once` | POST | `entity=items`, `type_slug`/`type_id`, `dedupe_key` + normal create fields — see [Idempotent create](#idempotent-create) |

Valid entities: `accounts`, `people`, `items`, `threads`, `messages`,
`links`, `attachments`, `watchers`, `item_progress`, `logs`, `test_runs`,
`observability`, `test_cases`, `notifications`, `types`, `link_types`,
`ai_agents`, `prompt_configs`.

`logs`, `test_runs`, `observability`, `test_cases` are **raw entities**:
create takes a per-entity field allowlist, requires specific fields
(`logs`: `level`+`message`; `test_runs`: `suite`; `observability`:
`metric_name`+`metric_value`; `test_cases`: `slug`+`name`), and needs no
`type_id`.

`notifications` is a raw entity with a narrower surface: **read and
mark-read only**. `list`/`get` work through the normal account scope plus
RLS (recipients see their own deliveries; `system_admin` sees the account
inbox). `update` accepts only `is_read`/`read_at` and only on the caller's
own rows (`is_read: true` stamps `read_at` when omitted). `create` is
rejected — deliveries are written by pipeline `send_notification` stages
and agents, never client-side.

**Attachments:** `entity=attachments` create is the commit step of the
upload flow — `tmp_path` must name a quarantined `attachments-tmp` object
minted by `POST /api/attachments?action=upload-url`; the server verifies
the actual bytes against the type's `file_policy`, strips GPS metadata,
and stamps all storage columns (client-supplied values are ignored).
Remove always hard-deletes and removes the stored object best-effort.

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
principal cannot read are stripped before the row is returned. Values pass
through canonical — `data.<field>` is the stored value (boolean `true`, ISO
datetime, parsed json), never a display-formatted string; renderers own
formatting.

## Permission evaluation order

1. `createHandler` resolves the principal (401 if anonymous).
2. `create` → `resolveFirstSurfacePermissions(personId, accountId,
   typeSlug, 'create', designSchema)`; machine principals with `*:*` scope
   bypass. Denied → 403.
3. `update` → `validateFirstSurfaceUpdatePermissions` on the **existing
   record's** stamped `design_schema` (no `record_permissions` → deny); each
   `data.<field>` written requires field `write`; sanitizes values through
   `validation_schema`. `system_admin` bypasses.
   **Protected system columns:** `status` and `is_active` are *not* implied
   by a record-level `update` grant — they drive record state machines, so
   a bare `update` grant can never bypass transition rules. Writing them
   requires a system principal or an explicit field grant on the type's
   `design_schema`: `fields.<col>.permissions.<role>: ["write"]` or
   `system_fields.<col>.<role>: ["write"]`. The same rule applies to
   body-supplied `status`/`is_active` on `create`. `title` is exempt — it
   is a required system field on nearly every type and member creates
   legitimately set it. (Decision `spine-framework:0032`.)
4. `remove` → `resolveFirstSurfacePermissions(..., 'delete',
   existing.design_schema)`; `system_admin` bypasses.
5. `list`/`get` run under `ctx.db` (RLS-scoped for humans, `adminDb` for
   internal/system-admin), then per-record sanitization. An explicit
   `account_id IN <accessible>` filter is applied on top — it is the sole
   tenancy guard for machines on `adminDb` — and for `items` it mirrors the
   `items_access` platform branch so `scope: 'platform'` rows on spine-system
   stay readable by every actor (reads only; writes stay account-confined).

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
  parent's account and scope (missing parent → 403). `target_type` accepts
  either spelling — the table name (`items`, `attachments`) or the kind
  (`item`, `attachment`) — and resolves to the parent table for
  links/watchers/threads; an `attachments` target resolves the
  `has_attachment` record→file association.
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

## Atomic updates

`PATCH /api/admin-data?action=atomic&entity=items&id=<uuid>` executes a
conditional UPDATE in a single statement — the database decides the race.
Covers the shapes every app otherwise re-derives in bespoke SQL: inventory
counters, allocation, claim-if-status. (Decision
`spine-framework:0033`; `entities`: `items`, `threads`, `messages`,
`watchers`, `item_progress`.)

Body:

- `conditions`: `[{path, op, value}]` — `path` is a system column
  (`status`, `title`, `is_active`, `metadata`) or `data.<field>`; `op` is
  `eq|neq|lt|lte|gt|gte` (ordered ops compare numerically)
- `patch`: `{status, title, is_active, metadata, data:{...}}` — same
  columns `update` may write, same permission check (a denied `status`
  write denies the atomic call too)
- `delta`: `{field: n}` — numeric increment applied inside the same
  UPDATE; each field needs field `write` like a `data` write
- `{from, to}` — claim shorthand: condition `status = <from>`, patch
  `status = <to>` (+ optional `patch`/`delta`)

```bash
# Reserve 2 seats only if capacity remains — no oversell under concurrency
PATCH /api/admin-data?action=atomic&entity=items&id=<event>
{"conditions": [{"path": "data.reserved_qty", "op": "lte", "value": 8}],
 "delta": {"reserved_qty": 2}}

# Claim a task only if still unclaimed (lost race → 409)
PATCH /api/admin-data?action=atomic&entity=items&id=<task>
{"from": "open", "to": "claimed",
 "patch": {"data": {"claimed_by": "<person>"}}}
```

`409` means the conditions didn't match — the row changed underneath you
or the race was lost; re-read and decide. `conditions` never write; only
`patch`/`delta` do, and each is permission-checked against the record's
`design_schema` exactly like `update`.

## Idempotent create

`POST /api/admin-data?action=insert_once&entity=items` takes a normal
create body plus `dedupe_key` (string ≤200 chars). The key is stamped into
`data.dedupe_key` and a per-type unique index
(`items (type_id, data->>'dedupe_key')`) makes check+insert atomic. On a
collision the call returns the **existing** row with
`deduplicated: true` instead of a 500 — safe to retry job submissions,
checkout intents, webhook handlers.

Any other `create` that supplies `data.dedupe_key` is also protected by
the index — it just gets the unique-violation error rather than the
existing row.

## Triggers

`create`/`update` await `fireCreateTriggers` / `fireUpdateTriggers`
(errors logged, never fail the request). **`remove` fires nothing** —
`fireDeleteTriggers` is imported but never called, so `*_deleted`
triggers do not run on this path. Update triggers receive the previous
row for field-change evaluation.

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

# Partial update — data fields each need field 'write'; 'status' is a
# protected system column (needs a system principal or an explicit
# fields.status.permissions / system_fields.status grant on the type)
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
| 405 | `create` on `entity=notifications` — deliveries are pipeline-written only |
| 409 | `atomic` conditions unmet — record changed or race lost; `insert_once` never 409s, it returns the existing row |
