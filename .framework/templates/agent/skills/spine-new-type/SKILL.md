---
name: spine-new-type
description: "Create a new Spine type — pick kind/slug, author design_schema, seed the types row, and verify generic rendering."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
---

You create a new Spine type: a `public.types` row whose `design_schema`
governs how runtime records validate, render, and authorize.

## When to invoke

- A new domain entity is needed (work item, ticket, course, ...).
- An existing type needs its schema extended (use `spine-schema` for the JSON).

## Steps

1. **Read the contract.** `.framework/src/instructions/types.md` describes the
   fields (`slug`, `kind`, `ownership`, `is_active`, `icon`, `color`,
   `design_schema`, `validation_schema`) and their downstream effects. The full
   field reference is `.framework/src/instructions/reference/design-schema.md`;
   `.framework/src/instructions/concepts/runtime-records.md` covers how types
   stamp records.

2. **Pick `kind` and `slug`.**
   - `kind` = the runtime table the records live in: `item` (default for
     domain records), `thread`, `message`, `link`, `attachment`, `watcher`,
     `person`, `account`.
   - `slug` is unique **globally per kind** — type seeds use
     `conflict: "kind,slug"` with `inject_app_id: false`. Check existing slugs
     before choosing; duplicates break `resolveTypeId` lookups.

3. **Author `design_schema`.** Minimum required shape:
   - `scope`: `account` (default) or `platform`.
   - `fields`: every field gets `data_type`, `label`, `required`.
   - `views`: `default_list` (table fields + `default_sort`) and
     `default_detail` (sections → fields) — required for generic apps.
   - `record_permissions`: base grant per role; at least `system-admin`.
   - `functionality`: `null` until automation bindings are confirmed.
   See the `spine-schema` skill for the full checklist and valid values.

4. **Validate the JSON:** `npx spine-framework validate-schema <file>`.

5. **Deliver the row.** Types ship as app seed data (`seed/types.json`,
   `conflict: "kind,slug"`, `inject_app_id: false`) or are created through the
   admin UI / `admin-data`. Never write migration `INSERT`s that bypass the
   seed/type-creation path unless the task is explicitly a migration.

6. **Verify rendering.** Records store `system: true` fields at
   `record.<field>` and the rest at `record.data.<field>` — check the generic
   list/detail views render from `views` and the permission grants behave.

## Rules

- `validation_schema` is generated — never author it by hand.
- Changing `data_type` on a field with existing records does not migrate data.
- `system: true` fields restrict `write` to `system-admin` when the
  record-level grant would otherwise allow it.
- Verification: `validate-schema` clean + a created record reads back with
  the expected `data` shape.

## Docs — part of the change

A type change is incomplete until the owning app's
`src/instructions/` entity page for that type reflects it (fields, views,
permissions) — bump `verified_against`/`verified_on`. For framework-side
type work, re-verify book pages listing edited files in `source_files`.
