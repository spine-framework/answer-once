---
title: Add a type
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/types.ts
  - .framework/functions/_shared/schema-utils.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/src/pages/admin/TypeDetailPage.tsx
  - .framework/migrations/015_types_kind_slug_unique.sql
---

# Add a type

## Goal

Create a `public.types` row whose `design_schema` drives validation,
permissions, and the generic list/detail UI for a new record shape. Records
created through `/api/admin-data` stamp this schema onto themselves at write
time, so a broken schema propagates into every record.

## Prerequisites

- A `system_admin` login or an API key with `*:*` scope — `POST /api/types`
  throws `System admin required` for anyone else
  (`.framework/functions/types.ts`).
- The target `kind` decided up front (`item`, `thread`, `message`, `link`,
  `attachment`, `watcher`, `person`, `account`). The kind chooses the runtime
  table and cannot be implied later — see
  [Runtime records](../concepts/runtime-records.md).

## Steps

1. **Draft the `design_schema`.** Work through the checklist in
   [Design schema](../concepts/design-schema.md); the field/display enums are
   in [Design schema reference](../reference/design-schema.md). The schema
   below is the minimum for the generic renderer:

   ```json
   {
     "scope": "account",
     "fields": {
       "title":  { "data_type": "text",   "label": "Title",  "required": true, "system": true },
       "status": { "data_type": "select", "label": "Status", "required": true, "system": true,
                   "options": ["open", "closed"] }
     },
     "views": {
       "default_list": {
         "type": "list", "display": "table", "label": "Tickets",
         "fields": {
           "title":      { "sortable": true, "display_type": "text" },
           "status":     { "sortable": true, "display_type": "badge" },
           "created_at": { "sortable": true, "display_type": "timestamp" }
         },
         "default_sort": { "field": "created_at", "direction": "desc" }
       },
       "default_detail": {
         "type": "detail", "label": "Ticket",
         "sections": [
           { "title": "Core",
             "fields": { "title": { "display_type": "input" },
                         "status": { "display_type": "select" } } }
         ]
       }
     },
     "record_permissions": {
       "system_admin": ["create", "read", "update", "delete"],
       "support":      ["create", "read", "update"]
     },
     "functionality": null
   }
   ```

   - `fields`: every entry needs `data_type`, `label`, `required`. `select`,
     `multiselect`, and `radio` need `options` — `generateValidationSchema`
     derives allowed values from them (`.framework/functions/_shared/schema-utils.ts`).
   - `record_permissions` keys are `roles.slug` values matched **verbatim** —
     `system_admin`, not `system-admin`. A misspelled or nonexistent slug
     silently grants nothing (`.framework/functions/_shared/permissions.ts`).
   - **Reserved column names.** `items` has real columns `title`,
     `description`, and `status` — a field with one of those names and
     `system: true` maps onto the column; the same name with `system: false`
     lands in `record.data` and list/detail views show the column's value
     (e.g. lifecycle `active`) instead of yours. Pick `system: true` for
     these names or rename the field.
   - `record_permissions` is the **base, most restrictive** grant; add
     `fields.*.permissions` only to loosen one field or to restrict a
     `system: true` field — see [Permission model](../concepts/permissions.md).
   - Generic apps (`renderer: "generic"`) need `views.default_list` and
     `views.default_detail` referencing real fields with known
     `display_type` values; custom apps can omit views but still need
     `fields` + `record_permissions` so `admin-data` can stamp and validate.

2. **Create the type.** Either:

   - Admin UI → **Configs → Types → New** (`configs/types/new`), fill in
     name, slug, kind, and paste the schema into the Design Schema JSON
     field — the page POSTs to `/api/types?action=create`
     (`.framework/src/pages/admin/TypeDetailPage.tsx`).
   - API: `POST /api/types` with a body containing `name`, `slug`, `kind`,
     and `design_schema` — all three fields are required
     (`.framework/functions/types.ts`).

3. **Let the API generate `validation_schema`.** Do not send it yourself —
   the create handler replaces a missing `validation_schema` with
   `generateValidationSchema(design_schema)` before insert, and update
   regenerates it whenever `design_schema` changes
   (`.framework/functions/types.ts`).

4. **Set the row-level fields.** `ownership` (`system`/`app`/`tenant`),
   `is_active`, `icon`, `color`, and optional `app_id` are columns on the
   `types` row, not inside `design_schema`.

## Verify

- `GET /api/types?action=get&slug=<slug>&include_schema=true` returns the row
  with a non-null `validation_schema`.
- Create a record: `POST /api/admin-data?action=create` with
  `{ "entity": "items", "type_slug": "<slug>", "title": "…", "data": {…} }`
  — the stored record carries the stamped `design_schema`.
- If the app uses the generic renderer, open its list page — an unknown
  `display_type` or missing `default_list` view shows up immediately as a
  broken page.

## Common mistakes

- **Slug collisions.** Slugs must be unique per `kind`
  (`.framework/migrations/015_types_kind_slug_unique.sql`); create throws
  `Type with slug '<slug>' already exists for kind '<kind>'`. App-install
  seeds go further — `conflict: "kind,slug"` makes type slugs effectively
  global, so prefix app types (`support_ticket`, not `ticket`) — see
  [Seeds](../reference/seeds.md).
- **`system-admin` vs `system_admin`.** Seeded role slugs use underscores;
  `system-admin` grants nothing.
- **Editing `data_type` on a live field.** Existing records keep their old
  stored values; the schema change does not migrate data.
- **Using `generate` to scaffold types.** `npx spine-framework generate`
  emits a stale legacy schema shape — author via the admin UI or `/api/types`
  (see [Build your first app — Gaps](../guide/04-first-app.md)).

## Reference

- [Design schema (concept)](../concepts/design-schema.md) ·
  [Design schema reference](../reference/design-schema.md)
- [Permission model](../concepts/permissions.md) ·
  [Runtime records](../concepts/runtime-records.md)
- [types entity page](../types.md) ·
  [types function reference](../reference/functions/types.md) ·
  [admin-data function reference](../reference/functions/admin-data.md)
