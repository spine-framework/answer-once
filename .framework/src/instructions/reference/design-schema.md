---
title: Design Schema Reference
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/src/types/types.ts
  - .framework/functions/_shared/schema-utils.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/admin-data.ts
  - .framework/functions/types.ts
  - .framework/cli/commands/validate-schema.ts
  - .framework/src/components/shared/FieldRenderer.tsx
  - .framework/src/components/app-shell/GenericListPage.tsx
  - .framework/src/components/app-shell/GenericDetailPage.tsx
  - .framework/src/hooks/useForm.ts
---

# Design Schema Reference

Exhaustive field-level spec for `public.types.design_schema` — the JSON every
type carries and every runtime record is stamped with at creation. The mental
model is in [Design Schema](../concepts/design-schema.md); this page is the
lookup table. The TypeScript source of truth is `DesignSchema`,
`FieldDefinition`, `ViewFieldConfig`, `ListView`, `DetailView`, and
`FunctionalityBindings` in `.framework/src/types/types.ts`.

## Top-level shape

| Key | Type | Required | Purpose |
|---|---|---|---|
| `fields` | `Record<string, FieldDefinition>` | yes | Flat map of `snake_case` field names to definitions |
| `views` | `Record<string, View>` | yes for generic apps | `default_list` and `default_detail` drive the generic UI |
| `record_permissions` | `Record<string, string[]>` | yes | Base CRUD grant per role slug |
| `scope` | `"account" \| "platform"` | no (default `"account"`) | Which account owns records of this type at create |
| `functionality` | `FunctionalityBindings` or extensions | no | Automation bindings; `null` until a binding is confirmed live |
| `display_field` | `string` | no | Field used for record titles in detail pages |

`validate-schema` enforces: `fields` non-empty; every field has `data_type`,
`label`, `required`; `record_permissions` grants at least `system-admin` or
`system_admin`; `scope` is `account` or `platform`
(`.framework/cli/commands/validate-schema.ts`).

## `fields.<name>` — FieldDefinition

| Key | Type | Notes |
|---|---|---|
| `data_type` | enum, see below | required |
| `label` | string | required |
| `required` | boolean | required; enforced client-side by `useForm` (`.framework/src/hooks/useForm.ts`), propagated into `validation_schema` |
| `system` | boolean | `true` → top-level record column; absent/`false` → `record.data.<name>` |
| `placeholder` | string | input hint |
| `description` | string | help text |
| `name` | string | optional field alias |
| `rows` | number | textarea height hint |
| `min`, `max`, `step` | number | range input bounds |
| `readonly`, `disabled` | boolean | form-state hints |
| `validation` | object | constraint keys, see below |
| `options` | `(string \| {value, label})[]` | required for `select`, `multiselect`, `radio` |
| `permissions` | `Record<string, string[]>` | per-role field overrides, `read`/`write` only |

### `data_type` values

The authoritative dispatch is `sanitizeFieldData` in
`.framework/functions/_shared/schema-utils.ts`. Unknown types are **not
rejected** — the value passes through unsanitized and unvalidated.

**Where the sanitizer runs.** `sanitizeFieldData` executes only on the
`admin-data` **update** path, only for `data.*` (non-system) fields, and only
for **non-system-admin** principals. `create` performs no field sanitization —
the request body is inserted as-is — and system columns (`system: true`,
including `select` fields like `status`) are never option-validated
server-side. `required` is enforced client-side by `useForm` only. So
"sanitizer behavior throws" below means: on a `data.*` update by a non-admin
caller. The trust boundary is the client + field permissions, not
`validation_schema` — treat API writes as unvalidated input.

| `data_type` | Stored as | Sanitizer behavior |
|---|---|---|
| `text` | string | trim, strip control chars; `minLength` throws, `maxLength` truncates, `pattern` throws |
| `textarea` | string | trim, strip control chars; `minLength`/`maxLength` |
| `rich_text` | HTML string | tag allowlist (`p br strong em u ol ul li a h1–h6`), strips `<script>` and `on*=` handlers; `minLength`/`maxLength` |
| `email` | string | lowercase + trim; must match `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| `phone` | string | strips non-`0-9+` chars; optional `pattern` |
| `url` | string | parses URL; `http:`/`https:` only; normalized via `URL.toString()` |
| `number` | number | `Number()` coercion; `min`/`max` throw; `step` snaps down to step |
| `currency` | number | `Number()` coercion rounded to 2 decimals; `min`/`max` throw |
| `range` | number | same as `number` |
| `date` | `"YYYY-MM-DD"` | parses any `Date()` input, stores ISO date; `min`/`max` bounds |
| `datetime` | ISO string | parses any `Date()` input, stores `toISOString()`; `min`/`max` bounds |
| `boolean` | boolean | `true`/`false` pass through; strings `"true" "1" "yes" "on"` → `true`, `"false" "0" "no" "off"` → `false`; anything else throws |
| `checkbox` | boolean | alias of `boolean` |
| `select` | string | trim; when `options` are declared the value must match an option (`value` for `{label,value}` entries) or it throws |
| `multiselect` | string[] | accepts an array or comma-separated string; dedupes; each element must match an option; `validation.max` truncates the list |
| `radio` | string | same sanitizer as `select` |
| `color` | string | must match `#rgb`/`#rrggbb`; normalized to 6-digit uppercase hex |
| `file` | object | must be an object with `.name`; `maxSize` and `allowedTypes` (MIME) enforced; filename sanitized to `[a-zA-Z0-9.-]` |
| `image` | object | same sanitizer as `file` (`maxWidth`/`maxHeight` are declared but not enforced) |
| `json` | any JSON value | string input is `JSON.parse`d; rejects script tags, `javascript:`, `eval(`/`function(`, `on*=` handlers, and `__proto__` keys; arbitrary nesting allowed under `data.<name>` |
| `reference` | string (uuid) | must match the UUID regex; `validation.reference_kind`/`reference_type` describe the target |
| `address` | object | must be an object; string values are text-sanitized |

`formatFieldData` (display formatting) covers only `json`, `date`, `datetime`,
`currency`, `phone`, `url`, `reference`, `address`, `multiselect`, `boolean` —
all other types render raw.

### `validation.*` keys

Declared on `FieldDefinition.validation`; copied verbatim into the generated
`validation_schema` by `generateValidationSchema`
(`.framework/functions/_shared/schema-utils.ts`).

| Key | Applies to | Effect |
|---|---|---|
| `pattern` | `text`, `phone` | regex must match or the write throws |
| `minLength`, `maxLength` | `text`, `textarea`, `rich_text` | min throws; max truncates |
| `min`, `max` | `number`, `currency`, `range`, `date`, `datetime` | bounds; out-of-range throws |
| `step` | `number`, `range` | value snapped down to step multiple |
| `integer` | `number` | declared; not enforced by the server sanitizer |
| `precision` | `number` | declared decimal precision; not enforced server-side |
| `maxSize` | `file`, `image` | byte-size limit, enforced server-side |
| `allowedTypes` | `file`, `image` | MIME allowlist, enforced server-side |
| `maxWidth`, `maxHeight` | `image` | declared; not enforced server-side |
| `max` | `multiselect` | truncates the list to `max` entries |
| `currency_code` | `currency` | display currency (e.g. `USD`) |
| `reference_kind` | `reference` | runtime table of the target (`item`, `person`, `account`, …) |
| `reference_type` | `reference` | type slug of the target record |

### `options` formats

Required for `select`/`multiselect`/`radio`; validated non-empty by
`validate-schema`. Both forms accepted:

```json
"options": ["todo", "done"]
"options": [{ "label": "Bug", "value": "bug" }]
```

### `permissions` (field-level overrides)

`record_permissions` is the **base, most restrictive** grant: when a role can
`read`/`update` a record, every field defaults to `read`/`write` unless the
field declares a `permissions` entry for that role. Field-level actions are
`read` and `write` only; `create`/`delete` are record-level
(`.framework/functions/_shared/permissions.ts`, `resolveFirstSurfacePermissions`
step 5–6). Use field permissions to **loosen** one field beyond the record
grant or to re-restrict a `system: true` field.

```json
"fields": {
  "cost": {
    "data_type": "currency", "label": "Cost", "required": false,
    "permissions": { "member": ["read"], "finance": ["read", "write"] }
  }
}
```

### `system` flag semantics

`system: true` fields are stored as top-level record columns (`record.title`),
all others under `record.data.<name>` — see
[Runtime Records](../concepts/runtime-records.md). Writers split payloads the
same way (`useEntityRecord` / the update path). Conventionally `title` is
system; flag `system: true` fields that humans must not edit with a
`permissions` override restricting `write` to `system_admin`.

## `views`

`views` is a map of view names to `ListView | DetailView`. Generic apps
(`apps.renderer = "generic"`) need `default_list` and `default_detail`; a
custom app may omit views but loses the generic admin/runtime fallback.

### `default_list` — ListView

| Key | Type | Purpose |
|---|---|---|
| `type` | `"list"` | required discriminator |
| `display` | `"table" \| "card" \| "board"` | layout in `GenericListPage` |
| `label` | string | view title |
| `fields` | `Record<string, ViewFieldConfig>` | column map, keyed by field name (may include `created_at`/`updated_at`). Non-system fields resolve automatically — key `priority` reads `record.data.priority`; the explicit `data.priority` form also works and filters on `data.<field>` are translated server-side |
| `default_sort` | `{field, direction: "asc"\|"desc"}` | initial ordering |
| `filters` | `(string \| EntityFilter)[]` | filter affordances — a bare field-name string is normalized from the field def (`select` → enum with its option values, `boolean` → boolean, else search); or pass full `{key, label, type: "search"\|"enum"\|"boolean", options?: string[]}` objects |
| `stats` | `{title, type: "count"\|"filter_count", icon?, color?, filter?}[]` | stat cards above the list; `filter` is a `{<field>: <value>}` map matched per row (e.g. `{"status": "todo"}`) |
| `group_by` | string | field to group rows by (board display) |

### `default_detail` — DetailView

| Key | Type | Purpose |
|---|---|---|
| `type` | `"detail"` | required discriminator |
| `label` | string | page title |
| `sections` | `DetailViewSection[]` | ordered sections of `{title, fields: Record<string, ViewFieldConfig>}` |

### `ViewFieldConfig` — `display_type`

Each view field is `{display_type, sortable?, searchable?}`. Implemented
`display_type` values — enforced by `validate-schema` and rendered by
`.framework/src/components/shared/FieldRenderer.tsx`:

| `display_type` | Context |
|---|---|
| `text` | read-only text (list/detail) |
| `badge` | status pill (list) |
| `timestamp` | formatted date/time (list/detail) |
| `currency` | formatted amount |
| `number` | formatted number |
| `input` | single-line edit input (detail) |
| `textarea` | multi-line edit |
| `rich_text` | rich-text editor |
| `select`, `multiselect`, `radio` | option pickers |
| `checkbox`, `switch` | boolean toggles |
| `date_picker`, `datetime_picker` | date/time pickers |
| `color_picker` | color input |
| `file_upload`, `image_upload` | upload widgets |
| `range_slider` | numeric slider |

Reserved in `ViewFieldConfig` but not yet implemented by `FieldRenderer`:
`rating`, `autocomplete`, `address_form`, `reference_picker` (the type union
admits them in `.framework/src/types/types.ts`; treat as forward-compatible
placeholders).

## `record_permissions`

```json
"record_permissions": {
  "system_admin": ["create", "read", "update", "delete"],
  "admin":        ["create", "read", "update"],
  "member":       ["read"]
}
```

- Actions are `create`, `read`, `update`, `delete` — evaluated per request
  against the caller's role slug.
- `"all"` is a wildcard role granted to every authenticated principal that
  passed RLS; always evaluated when present
  (`.framework/functions/_shared/permissions.ts`).
- Evaluation happens against the schema **stamped on the record**, not the
  type row — records created before a schema edit keep the old grant.
- If a type's `design_schema` omits `record_permissions`, `admin-data` create
  merges a permissive default `{all: [create,read,update,delete]}` before
  stamping (`.framework/functions/admin-data.ts`, `PERMISSIONS_ALL`). An
  explicit empty object denies everything downstream — always author
  deliberately.

## `scope`

Read at create time as `designSchema.scope ?? 'account'`
(`.framework/functions/admin-data.ts`). `"platform"` stamps new records with
the `spine-system` account id; records created against a parent
(`thread_id`, `target_id`, `parent_id`) inherit the parent's stamped scope.
See [Scope and Accounts](../concepts/scope-and-accounts.md).

## `functionality`

`FunctionalityBindings` (`.framework/src/types/types.ts`) declares optional
automation:

| Binding | Shape |
|---|---|
| `pipelines[]` | `{pipeline_id, trigger: manual\|on_create\|on_update\|on_field_change\|on_delete\|scheduled, field?, condition?, roles[]}` |
| `ai_agents[]` | `{agent_id, capabilities: (read\|summarize\|suggest\|update)[], trigger, roles[]}` |
| `embeddings[]` | `{slug, fields[], model, vector_column, trigger}` |
| `integrations[]` | `{integration_id, sync: bidirectional\|inbound\|outbound, field_map, trigger}` |
| `constraints[]` | `{type: unique\|conditional_required\|immutable, fields?/field?, condition?, message, after?: create\|update}` |

`admin-data` also reads `functionality.lineage`
(`{parent_fields: string[], link_type: string, children: {[slug]: field}}`)
on `items` get/list to attach `parents`/`children` — declared per type in the
seed, interpreted by `attachLineage` in `.framework/functions/admin-data.ts`.
Set `functionality` to `null` until the binding you need is confirmed live.

## `validation_schema` (generated, never authored)

`generateValidationSchema` derives `{fields: {name: {data_type, required,
...validation, options, reference_kind?, reference_type?}}}` from
`design_schema.fields` on every type create and on every update that touches
`design_schema` (`.framework/functions/types.ts`,
`.framework/cli/commands/install-app.ts` seed path). Never hand-edit — change
`design_schema` and let the writer regenerate it.
