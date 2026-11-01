---
title: Runtime Records (list)
audience: both
kind: ui
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/components/runtime/DataListPage.tsx
  - .framework/src/hooks/useListSchema.ts
  - .framework/src/hooks/useEntityList.ts
  - .framework/functions/admin-data.ts
---

## What this is for

**Runtime list** (`/spine-framework/admin/runtime/:entity`) is the generic, schema-driven list page for any runtime entity table — `items`, `threads`, `messages`, `links`, `attachments`, `watchers`, `people`, `accounts`, `item_progress`. It renders whatever the entity's type `design_schema.views.default_list` declares, so every type gets a working admin list for free.

## Fields and settings

- **Header** — entity name, description, and a New button → `runtime/:entity/new`.
- **Stats cards** — driven by `views.default_list.stats` (empty when undeclared).
- **Filters** — driven by `views.default_list.filters`; values go into the `admin-data` list query.
- **Columns** — `views.default_list.fields`: label from `design_schema.fields[key].label`, sortable unless `sortable: false`, rendered per `display_type` (`text`, `badge`, `timestamp`, `currency`, ...).
- **Sort** — defaults to `views.default_list.default_sort` (fallback `created_at` desc); sent as `sort_field`/`sort_direction`.
- **Rows** — `record.data.<field>` values for non-system fields, `record.<field>` for `system: true` fields.

**How the schema is resolved** (`useListSchema`, in order)

1. Fetch one sample record (`admin-data?action=list&entity=<entity>&limit=1`) and use its **stamped** `design_schema.views.default_list`.
2. No stamped schema → look up `/api/types?action=list&kind=<mapped>`; used only when **exactly one** type matches the entity's kind.
3. Otherwise a fallback view (just `id` + `created_at` columns).

**Downstream effects**

- All data flows through `/api/admin-data` — the same permission, validation, and trigger path as any other client.
- Multi-type entities (e.g. `items` with `ticket`, `threshold_alert`, `kb-article`) resolve schema from the *sample record* — the columns shown are whichever type the most recent matching record carries, and `type_slug` filtering is available via the route's `typeSlug` param.
- A type with no `default_list` view (or a fresh table with no records and >1 candidate type) renders the fallback two-column view — fix the type's `design_schema`, not this page.

## Minimal configuration

Define `views.default_list` on the type:

```json
"default_list": {
  "type": "list", "display": "table", "label": "Tickets",
  "fields": {
    "title": { "sortable": true, "display_type": "text" },
    "status": { "sortable": true, "display_type": "badge" },
    "created_at": { "sortable": true, "display_type": "timestamp" }
  },
  "default_sort": { "field": "created_at", "direction": "desc" }
}
```

## Full configuration

Add `stats` and `filters` arrays to the view for stat cards and filter controls, choose `display_type` per column to control rendering, and set a different `default_sort` (e.g. `priority asc`). Valid `entity` path segments are the `admin-data` whitelist: `accounts`, `people`, `items`, `threads`, `messages`, `links`, `attachments`, `watchers`, `item_progress`, plus config entities (`types`, `link_types`, `ai_agents`, `prompt_configs`, ...).

## Example

`/spine-framework/admin/runtime/items` shows the ticket list: columns Title/Status/Priority/Created from `default_list.fields`, status rendered as a badge, sorted by `created_at` desc; the New button lands on `runtime/items/new`.

## Core files

- `.framework/src/components/runtime/DataListPage.tsx` — this page
- `.framework/src/components/runtime/DataTable.tsx` / `DataFilters.tsx` / `DataStats.tsx` / `DataHeader.tsx` — subcomponents
- `.framework/src/hooks/useListSchema.ts` — stamped-schema → type → fallback resolution
- `.framework/src/hooks/useEntityList.ts` — the `admin-data` list query (filters, sort)
- `.framework/functions/admin-data.ts` — list/get backend (`VALID_ENTITIES` whitelist)
- `.framework/src/apps/admin/index.tsx` — `instructionKeyFor`: `runtime/:entity` → `runtime-list`

## Agent notes

- The schema comes from a **record's stamped** `design_schema` first — old records stamped before a schema change keep old views; the list can flip shape depending on which record it samples.
- If the page shows only `id`/`created_at`, the type's `default_list` view is missing or ambiguous — check the type, then check that the entity has records.
- Non-system fields live under `record.data` — a column for a `system: true` field reads `record.<field>`; mixing these up shows blank cells.
- Filter/sort state is client-side over the fetched page — this is a browsing surface, not a reporting tool.
