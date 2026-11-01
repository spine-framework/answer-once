---
title: Runtime Records
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/resolve-ids.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/migrations/001_core_schema.sql
  - .framework/src/hooks/useEntityRecord.ts
  - .framework/src/components/app-shell/GenericDetailPage.tsx
---

# Runtime Records

Runtime records are the rows your users and apps actually create — as opposed
to config entities (`types`, `apps`, `roles`, `pipelines`, …) that describe
the system itself. They share one storage contract: a type, an account, a
stamped schema, and a split between framework-owned columns and app-owned
`data`.

## The record kinds

`admin-data` maps entity names to type `kind`s via `ENTITY_TO_KIND`
(`.framework/functions/admin-data.ts`):

| Entity (table) | `kind` | What it is |
|---|---|---|
| `items` | `item` | The workhorse — tickets, tasks, articles, any typed business object |
| `threads` | `thread` | A conversation bound to a target (`target_type` + `target_id`); unique per `(target_type, target_id, visibility)` |
| `messages` | `message` | An entry in a thread (`thread_id` + `sequence`, unique together) |
| `links` | `link` | A polymorphic edge between two records (`source_type`/`source_id` → `target_type`/`target_id`, optional `link_type`) |
| `attachments` | `attachment` | A stored file reference (filename, size, mime, `storage_path`) |
| `watchers` | `watcher` | A person subscribed to a target (unique per target+person) |
| `people` | `person` | Users/contacts — also carry `auth_uid`, `role_id`, `email` |
| `accounts` | `account` | Tenants — the only table without `account_id` (it *is* the account) |
| `item_progress` | `item_progress` | Progress/status snapshots for items |

`VALID_ENTITIES` also accepts `logs`, `test_runs`, `observability`, and
`test_cases` — the `RAW_ENTITIES` path: whitelisted raw-column inserts with no
type requirement and no `design_schema`. `types` and `link_types` are accepted
too but are config, not runtime records.

## The shared row shape

Every runtime table in `.framework/migrations/001_core_schema.sql` carries the
same spine:

- `id`, `created_at`, `updated_at`, `created_by` (+ `updated_by` on most)
- `type_id uuid NOT NULL` — every record must reference a type
- `account_id` — the owning tenant (all except `accounts`)
- `app_id` — optional attribution to the app that created it
- `data jsonb` — app-defined field values
- `design_schema jsonb`, `validation_schema jsonb` — **stamped at creation**
  from the type; the runtime source of truth for permissions and validation
  (see [Design Schema](design-schema.md))
- `is_active` — soft-delete flag; `remove` flips it rather than deleting

`admin-data` create requires `type_id` *or* `type_slug` — `resolveTypeRecord`
in `.framework/functions/_shared/resolve-ids.ts` resolves `(kind, slug)` to
the type row, and the record is stamped before permission evaluation and
insert.

## `system: true` columns vs `record.data`

The field declaration's `system` flag decides where a value lives:

- **`system: true`** → a top-level record column (`record.title`,
  `record.status`, `record.email`). These are framework-owned or
  schema-critical fields.
- **`system: false` / omitted** → inside `record.data.<field>`.

Consumers split on the flag — this is the authoritative convention:

- `useEntityRecord.save` partitions form data into `systemData` (top-level
  keys) and `customData` (packed into `data`) by `fieldDef.system`
  (`.framework/src/hooks/useEntityRecord.ts`).
- `GenericDetailPage` initializes each field from `record[field]` when
  `fieldDef.system` and `record.data[field]` otherwise
  (`.framework/src/components/app-shell/GenericDetailPage.tsx`).
- The permission engine's write gate evaluates every key inside `data`
  against `fieldPermissions[name].write` and sanitizes through
  `validation_schema` (`.framework/functions/_shared/permissions.ts`).

**Fact:** send system fields as top-level keys and non-system fields inside a
`data` object. A non-system field sent top-level is stored but invisible to
schema-driven readers; a system field sent inside `data` never reaches its
column.

## Reading records back

Reads pass through `sanitizeRecordData`: fields the caller can't read are
dropped from `data`, the legacy `metadata` key is stripped from responses, and
remaining values are formatted through `validation_schema`
(`formatFieldData` — e.g. currency, multiselect, dates). A record the caller
can't read at all collapses to `{id, created_at, updated_at}` — so "record
exists but looks empty" is a permission answer, not missing data.

## Writing rules of thumb

- `type_slug` + `entity` on create; `id` on update/delete.
- Never write `design_schema`, `validation_schema`, `type_id`, `account_id`,
  or `id` in the body — create strips them before insert (`account_id` in the
  body is honored as a *targeting* hint, see
  [Scope and Accounts](scope-and-accounts.md)).
- Deletes are soft (`is_active = false`) for the standard entities; only a few
  entities hard-delete.
- Creates fire triggers (`fireCreateTriggers`) and per-type rate limits after
  permission checks — a custom insert path loses both.
