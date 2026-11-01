---
title: Types
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/types.ts
  - .framework/src/pages/admin/TypesPage.tsx
  - .framework/src/pages/admin/TypeDetailPage.tsx
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/resolve-ids.ts
  - .framework/functions/_shared/schema-utils.ts
  - .framework/cli/commands/install-app.ts
  - .framework/migrations/015_types_kind_slug_unique.sql
---

## What this is for

A **type** is the design schema for a runtime record kind. It defines the fields, default list/detail views, record permissions, icon, and color that the generic admin and runtime UIs use to create, validate, and display records. Every `items`/`threads`/`messages`/etc. record is stamped with its type's `design_schema` at creation.

## Fields and settings

- **Name** — string. Display label for the type. Empty name blocks save.
- **Slug** — string. URL-friendly identifier, unique per `kind`. Callers resolve types by slug; duplicates break `resolveTypeId`/`.single()` lookups. Rarely change after records exist.
- **Description** — string, optional. Human-readable context.
- **Kind** — select: `item`, `account`, `person`, `thread`, `message`, `link`, `attachment`, `watcher`. Determines which runtime table the type governs.
- **Ownership** — select: `system` (platform types, protected from deletion), `app` (owned by an app), `tenant` (account-specific).
- **Is Active** — checkbox. Inactive types are hidden from lists and cannot have records created.
- **App ID** — select. Required whenever ownership is not `system` — the form rejects save otherwise.
- **Icon / Color** — UI presentation stored on the `types` row.
- **Design Schema (JSON)** — the full schema: `fields`, `views` (`default_list`, `default_detail`), `record_permissions`, `scope`, `functionality`.
- **Validation Schema** — read-only, regenerated from `design_schema` on every save by the API.

**Downstream effects**

- Generic list/detail pages render directly from `views`. A missing `default_list`/`default_detail` or unknown `display_type` breaks those pages.
- `record_permissions` is the **base, most restrictive grant**: if a role can read/update a record, all fields default to read/write. `fields.*.permissions` only *loosen* access per field or restrict `system: true` fields.
- `system: true` fields are read from `record.<field>`; non-system fields from `record.data.<field>`.
- Changing `data_type` on a field with existing records does not migrate data — old values remain until rewritten.
- Type seeds use `conflict: "kind,slug"` with `inject_app_id: false` — types are global, not duplicated per app install.

## Minimal configuration

```json
{
  "scope": "account",
  "fields": {
    "title": { "data_type": "text", "label": "Title", "required": true, "system": true }
  },
  "views": {
    "default_list": {
      "type": "list", "display": "table", "label": "List",
      "fields": {
        "title": { "sortable": true, "display_type": "text" },
        "created_at": { "sortable": true, "display_type": "timestamp" }
      },
      "default_sort": { "field": "created_at", "direction": "desc" }
    },
    "default_detail": {
      "type": "detail", "label": "Detail",
      "sections": [{ "title": "Details", "fields": { "title": { "display_type": "input" } } }]
    }
  },
  "record_permissions": { "system_admin": ["create", "read", "update", "delete"] },
  "functionality": null
}
```

## Full configuration

Adds typed fields, select `options`, per-field `permissions` overrides, multiple views with sorting/badges, and per-role record grants (`admin`, `member`). See the [design schema reference](reference/design-schema.md) for the full `data_type` list (`text`, `number`, `select`, `multiselect`, `reference`, `json`, `date`, `boolean`, ...) and `display_type` list (`badge`, `timestamp`, `select`, `currency`, ...).

## Example

A support app defines a `ticket` type (kind `item`, ownership `app`): `title` (system text), `status` (select: open/pending/closed), `priority` (select), `assignee_id` (reference). `record_permissions` grants `system_admin` all actions, `admin` create/read/update, `member` read. `fields.assignee_id.permissions` loosens `write` to `member` so agents can self-assign.

## Core files

- `.framework/functions/types.ts` — API (list/get/create/update/delete; regenerates `validation_schema`)
- `.framework/src/pages/admin/TypesPage.tsx` / `TypeDetailPage.tsx` — admin UI
- `.framework/src/components/app-shell/GenericListPage.tsx` / `GenericDetailPage.tsx` — generic renderer
- `.framework/functions/_shared/permissions.ts` — record/field permission evaluation
- [Design schema reference](reference/design-schema.md) — full field/view schema reference in this book
- Table: `public.types`

## Agent notes

- Never hand-edit `validation_schema`; change `design_schema` and the API regenerates it.
- Slug uniqueness is per `(kind, slug)` — reuse across kinds is fine, reuse within a kind breaks lookups.
- Every field needs `data_type`, `label`, `required`; `select`/`multiselect`/`radio` also need `options`.
- Don't add `fields.*.permissions` unless overriding the base grant — the common mistake is re-stating record-level permissions per field.
- Custom apps CRUD runtime records through `/api/admin-data` — never custom wrappers.
