---
name: spine-schema
description: "Author and validate a Spine type's design_schema — fields, views, record_permissions — before saving it to public.types."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
---

You author and validate `design_schema` JSON for Spine types. The schema drives
permissions, validation, and generic UI rendering — mistakes surface as empty
or unwriteable records.

## When to invoke

- A new type needs a `design_schema`.
- An existing type or runtime record is not behaving as expected.
- A schema needs validation before it is saved to `public.types`.

## Inputs to gather

- `kind` — the runtime table the type governs (`item`, `thread`, `message`,
  `link`, `attachment`, `watcher`, `person`, `account`).
- `slug` — unique per `kind`; duplicates break `resolveTypeId`/`.single()`.
- `scope` — `account` (default) or `platform`.
- Whether the app is generic (`apps.renderer = "generic"`) or custom —
  generic apps require complete `views`.

## Authoring procedure

1. Read `.framework/src/instructions/types.md` for the entity contract,
   `.framework/src/instructions/concepts/design-schema.md` for the model, and
   `.framework/src/instructions/reference/design-schema.md` for the field
   reference.
2. Draft `design_schema` with the minimum shape:
   - `fields` — each field needs `data_type`, `label`, `required`.
   - `views.default_list` — `type: "list"`, `fields`, `default_sort`.
   - `views.default_detail` — `type: "detail"`, `sections[].fields`.
   - `record_permissions` — base grant per role; at least `system-admin`.
   - `functionality` — `null` until automation bindings are confirmed.
3. Apply the permission rule: `record_permissions` is the most restrictive
   grant. Use `fields.<name>.permissions` **only** to loosen a field beyond the
   base grant or to restrict a `system: true` field's `write`.
4. Mark `system: true` only for fields stored as top-level record columns;
   everything else lives in `record.data.<field>`.

## Valid values

- `data_type`: `text`, `textarea`, `rich_text`, `email`, `phone`, `url`,
  `number`, `currency`, `range`, `date`, `datetime`, `boolean`, `checkbox`,
  `select`, `multiselect`, `radio`, `color`, `file`, `image`, `json`,
  `reference`, `address`.
- `display_type`: `text`, `input`, `textarea`, `rich_text`, `select`,
  `multiselect`, `radio`, `checkbox`, `switch`, `date_picker`,
  `datetime_picker`, `color_picker`, `file_upload`, `image_upload`,
  `range_slider`, `badge`, `timestamp`, `currency`, `number`.
- `select`/`multiselect`/`radio` fields require non-empty `options`.

## Validate

```bash
npx spine-framework validate-schema path/to/design_schema.json
```

Exit code 0 = ok; errors are printed with their `fields.*`/`views.*` path.
Run `npx spine-framework validate-app <dir>` instead when checking a whole app
package (manifest, seeds, structure).

## Rules

- Never guess `data_type`/`display_type` values — use only the lists above.
- Never widen `record_permissions` to fix a field-level problem; add a field
  override instead.
- Report the schema diff and any records that need restamping before saving.
