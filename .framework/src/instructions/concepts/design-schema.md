---
title: Design Schema
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/src/types/types.ts
  - .framework/functions/types.ts
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/schema-utils.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/resolve-ids.ts
  - .framework/src/components/app-shell/GenericListPage.tsx
  - .framework/src/components/app-shell/GenericDetailPage.tsx
  - .framework/src/hooks/useListSchema.ts
  - .framework/migrations/058_account_data_field_declarations.sql
  - .framework/migrations/060_account_person_record_permissions.sql
---

# Design Schema

`design_schema` is the JSON contract on a `public.types` row that declares
everything the platform needs to store, validate, permission, and render one
kind of runtime record — without code. It is the single most important
structure in Spine: get it right and permissions, validation, and the generic
UI all work for free; get it wrong or leave it out and records are created
unpermissionable and unrenderable.

The TypeScript shape is `DesignSchema` in `.framework/src/types/types.ts`:
`fields`, `views`, `record_permissions`, plus optional `scope` and
`functionality`.

## Where it lives and how it propagates

- The **type definition** holds the canonical copy in
  `public.types.design_schema` (created/updated only via
  `.framework/functions/types.ts`, which requires `system_admin`).
- **Every record created through `admin-data` is stamped** with the type's
  `design_schema` and `validation_schema` at insert time
  (`.framework/functions/admin-data.ts`, `create`). The stamped copy on the
  record — not the type row — is what the permission engine reads at request
  time (`.framework/functions/_shared/permissions.ts`,
  `sanitizeFirstSurfaceRecordData` / `validateFirstSurfaceUpdatePermissions`
  both refuse when the record carries no `record_permissions`).
- **Editing a type does not restamp existing records.** Migrations that change
  a type schema re-stamp rows explicitly — see
  `.framework/migrations/058_account_data_field_declarations.sql` and
  `.framework/migrations/060_account_person_record_permissions.sql` for the
  pattern.
- `validation_schema` is a derived artifact: `generateValidationSchema` in
  `.framework/functions/_shared/schema-utils.ts` extracts `data_type`,
  `required`, `validation`, `options`, and `reference_*` from `fields` and runs
  on every type create and on every update that touches `design_schema`
  (`.framework/functions/types.ts`). Never hand-edit it — change
  `design_schema` and let the API regenerate.

## The sections

### `scope`

`"account"` (default when omitted) or `"platform"`. At create time `admin-data`
reads `designSchema.scope ?? 'account'`; `platform` records are stamped with
the `spine-system` account's id instead of the caller's account. Child records
created against a parent (via `thread_id`, `target_id`, `parent_id`) also
inherit the parent's stamped scope. See
[Scope and Accounts](scope-and-accounts.md).

### `fields`

A flat map of `snake_case` field names to `FieldDefinition`
(`.framework/src/types/types.ts`): `data_type`, `label`, `required`, plus
optional `system`, `placeholder`, `validation` (pattern, min/max, lengths,
`reference_kind`/`reference_type`, `currency_code`), `options` (required for
`select`/`multiselect`/`radio`), and `permissions` (per-role `read`/`write`
overrides — see [Permissions](permissions.md)).

The `system` flag controls storage: `system: true` fields are top-level record
columns; all others live under `record.data.<field>` — see
[Runtime Records](runtime-records.md).

Known `data_type` values (the authoritative switch is `sanitizeFieldData` in
`.framework/functions/_shared/schema-utils.ts`): `text`, `textarea`,
`rich_text`, `email`, `phone`, `url`, `number`, `currency`, `range`, `date`,
`datetime`, `boolean`, `checkbox`, `select`, `multiselect`, `radio`, `color`,
`file`, `image`, `json`, `reference`, `address`. Unknown types pass through
unsanitized — they are not rejected, they are unvalidated.

### `views`

A map of view names to view configs. `default_list` and `default_detail` are
what the generic renderer consumes:

- `default_list` (`type: "list"`, `display: "table" | "card" | "board"`,
  `fields` map with `sortable`/`display_type`, `default_sort`, optional
  `filters`/`stats`) becomes columns in `GenericListPage`
  (`.framework/src/components/app-shell/GenericListPage.tsx`) — the schema
  itself resolves via `useListSchema`, which prefers a stamped record's
  `design_schema` and falls back to the types API.
- `default_detail` (`type: "detail"`, `sections[]` of `{title, fields}`) drives
  `GenericDetailPage`'s `SchemaDetailForm`; each section field resolves its
  `FieldDefinition` and reads `record[field]` or `record.data[field]` by
  `system` (`.framework/src/components/app-shell/GenericDetailPage.tsx`).

`display_type` values for view fields come from `ViewFieldConfig` in
`.framework/src/types/types.ts` (`input`, `text`, `badge`, `timestamp`,
`select`, `date_picker`, `file_upload`, …). An app with `renderer = "generic"`
is broken without these views; a `custom` app may omit them but loses the
generic admin/runtime fallback.

### `record_permissions`

`{ "<role_slug>": ["create" | "read" | "update" | "delete", ...] }` — the base
grant for the record, evaluated per request against the caller's role plus the
`'all'` wildcard role. This is the contract evaluated in
`.framework/functions/_shared/permissions.ts`; the full model is in
[Permissions](permissions.md).

If a type has no `record_permissions`, `admin-data` create merges a permissive
default (`{ all: ["create","read","update","delete"], fields: {} }`) before
stamping — an explicit empty object would instead deny everything downstream,
so always author them deliberately.

### `functionality`

Optional automation bindings the runtime interprets — e.g.
`functionality.lineage` (parent/child resolution for items, read in
`admin-data` list/get) and the integration/constraint bindings declared in
`FunctionalityBindings` (`field_map` sync, `unique`/`conditional_required`/
`immutable` constraints) in `.framework/src/types/types.ts`. Set it to `null`
until the automation binding you need is confirmed live.

## What each consumer reads

| Consumer | Reads |
|---|---|
| `admin-data` create | `fields`/`record_permissions`/`scope` for stamping, gating, and account resolution |
| `permissions.ts` | `record_permissions`, `fields.*.permissions` — on the **record's** stamped schema |
| `schema-utils.ts` | generated `validation_schema` for `sanitizeFieldData` / `formatFieldData` |
| `GenericListPage` | `views.default_list` (columns, sort, filters, stats) |
| `GenericDetailPage` | `views.default_detail`, `fields`, `display_field` |
| `useEntityRecord` | `fields.*.system` to split system vs `data` writes |

## Authoring minimum

Every type needs, at minimum: `fields` (each with `data_type`, `label`,
`required`), `record_permissions` (at least `system_admin`), and — for generic
apps — `default_list` + `default_detail`. `slug` must be unique per `kind`
(enforced by the `types_kind_slug_unique` index in
`.framework/migrations/015_types_kind_slug_unique.sql`), and `kind` must match
the runtime table the type governs. The entity page
[../types.md](../types.md) has minimal and full examples.
