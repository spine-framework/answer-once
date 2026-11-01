---
title: Runtime Record (detail)
audience: both
kind: ui
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/components/runtime/DataDetailPage.tsx
  - .framework/src/hooks/useEntityRecord.ts
  - .framework/src/components/runtime/SchemaDetailForm.tsx
  - .framework/functions/admin-data.ts
---

## What this is for

**Runtime detail** (`/spine-framework/admin/runtime/:entity/new` and `/runtime/:entity/:id`) is the generic create/view/edit form for one runtime record. It renders sections and fields from the record's stamped `design_schema.views.default_detail` — so any type with a detail view gets a working record page without a custom UI.

## Fields and settings

- **Header** — record title (`design_schema.display_field`, falling back through `full_name` → `display_name` → `name` → `title` → `slug` → `email` → "Untitled"), plus Edit / Save / Cancel / Delete buttons. `?edit=true` toggles edit mode; `new` starts in edit mode.
- **Sections** — `views.default_detail.sections[*]`: each section's `fields` render as form controls per `display_type` (`input`, `textarea`, `select`, `checkbox`, `date_picker`, `json`-as-textarea, ...).
- **Field values** — `system: true` fields read `record.<field>`; everything else reads `record.data.<field>` and is written back under `data`.
- **Field permissions** — `fieldPermissions` from the record response gate which inputs are editable (field-level `read`/`write` from `fields.*.permissions` over the record grant).
- **Delete** — confirm → `admin-data` remove → back to the entity list.

**Downstream effects**

- All writes go through `/api/admin-data` (`create`/`update`/`remove`): type stamping, `validation_schema` checks, `record_permissions`, and create/update triggers all apply — the same path custom apps must use.
- Creating a record stamps the type's current `design_schema` onto it — the detail page then renders from that stamped copy (`record.design_schema || record.type.design_schema`).
- Default `type_slug` per entity on create: `accounts→account`, `people→person`, `items→item`, `threads→thread`, `messages→message`, `links→link`, `attachments→attachment`, `watchers→watcher`, `item_progress→item_progress` — a `typeSlug` route param overrides it.

## Minimal configuration

Define `views.default_detail` on the type:

```json
"default_detail": {
  "type": "detail", "label": "Ticket",
  "sections": [
    { "title": "Core", "fields": {
      "title": { "display_type": "input" },
      "status": { "display_type": "select" }
    } }
  ]
}
```

## Full configuration

Split fields across multiple named sections, choose richer `display_type` controls (`textarea`, `select`, `multiselect`, `date_picker`, `checkbox`, `color_picker`, `file_upload`, `range_slider`), and set `display_field` on the schema so the header shows a meaningful title. Field-level `permissions` on `design_schema.fields` restrict which roles can write a field even when the record grant allows updates.

## Example

`/spine-framework/admin/runtime/items/<id>?edit=true` renders the ticket: a "Core" section with Title (input), Status (select), Priority (select), and a "Notes" section with a `json` field shown as a monospaced textarea. Save → `admin-data` validates against `validation_schema` and fires `item_updated` triggers.

## Core files

- `.framework/src/components/runtime/DataDetailPage.tsx` — this page
- `.framework/src/components/runtime/SchemaDetailForm.tsx` — renders sections/fields from the schema
- `.framework/src/components/runtime/DataDetailHeader.tsx` — title + action buttons
- `.framework/src/hooks/useEntityRecord.ts` — record fetch (`design_schema` fallback), save/delete via `admin-data`
- `.framework/functions/admin-data.ts` — get/create/update/remove backend
- `.framework/src/apps/admin/index.tsx` — `instructionKeyFor`: `runtime/:entity/...` (≥4 segments) → `runtime-detail`

## Agent notes

- Error card "Failed to load record or schema" = the record has no stamped `design_schema` or the type's `default_detail` view is missing — fix the type's schema, not this page.
- `system: true` fields (e.g. `title`) are top-level record columns; a field defined in `design_schema.fields` but absent from a section won't render — the form only shows what `default_detail` declares.
- A record stamped under an old schema renders the old view — re-save it to re-stamp the current schema.
- `new` with no `typeSlug` uses the default type slug map above; creating a different type's record needs the `typeSlug` route param or a different entry point.
