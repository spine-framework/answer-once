<!-- spine-framework:begin version={{SPINE_VERSION}} -->
<!--
  Framework-owned block. `spine-framework upgrade` replaces everything between
  the begin/end markers above and below. Keep your own notes outside the markers.
-->

# Spine Framework — agent rules

You are working in a Spine Framework project. Spine is a multi-tenant, modular
application platform: framework primitives live under `.framework/` (shipped by
the `spine-framework` npm package), and everything the project owns lives
outside it (`custom/`, app packages, project config).

## Core vs. custom boundary

- **Never edit `.framework/`.** It is sealed and overwritten verbatim by
  `spine-framework upgrade`. Local edits there break the integrity check and
  are lost on upgrade.
- Project code lives in `custom/` (`custom/apps/<slug>/`, `custom/functions/`,
  `custom/migrations/`, `custom/tests/`).
- Framework code never imports from `custom/`. From custom apps, import core
  through the `@core/*` alias; from custom functions (post-assembly), import
  `./_shared/*`.
- If a change could serve more than one app it may be a framework concern —
  flag it to the maintainer instead of patching `.framework/` locally.

## Runtime record CRUD — admin-data only

Use the generic `/api/admin-data` endpoint for all runtime record CRUD
(`items`, `threads`, `messages`, `links`, `attachments`, `watchers`, etc.).
Do **not** write custom Netlify function wrappers for creating, updating,
listing, or deleting runtime records — wrappers bypass shared permission,
type-resolution, audit, and trigger logic. Find-or-create flows call
`/api/admin-data` directly from the client or a hook. See
`.framework/src/instructions/reference/api/admin-data.md`.

- **Access:** runtime APIs authenticate with `x-api-key: $SPINE_API_KEY`;
  ask the user to create a scoped key in Admin → Configs → API Keys if unset.

## design_schema authoring checklist

Every new or changed type needs a valid `design_schema` on its `public.types`
row; `validation_schema` is generated from it. Spine stamps
`type.design_schema` into each runtime record at creation, so a missing or
stale schema breaks permissions, validation, and UI rendering.

**Absolute minimum `design_schema`:**

```json
{
  "scope": "account",
  "fields": {
    "title": { "data_type": "text", "label": "Title", "required": true, "system": true }
  },
  "views": {
    "default_list": {
      "type": "list",
      "display": "table",
      "label": "List",
      "fields": {
        "title": { "sortable": true, "display_type": "text" },
        "created_at": { "sortable": true, "display_type": "timestamp" }
      },
      "default_sort": { "field": "created_at", "direction": "desc" }
    },
    "default_detail": {
      "type": "detail",
      "label": "Detail",
      "sections": [
        { "title": "Details", "fields": { "title": { "display_type": "input" } } }
      ]
    }
  },
  "record_permissions": {
    "system-admin": ["create", "read", "update", "delete"]
  },
  "functionality": null
}
```

- `scope`: `"account"` (default) or `"platform"`. Omitted defaults to account.
- `fields`: required. Every field needs `data_type`, `label`, `required`.
- `views`: required for generic apps (`apps.renderer = "generic"`) — at least
  `default_list` and `default_detail`, referencing real fields with known
  `display_type` values. Custom apps may omit views if they render everything
  themselves, but keeping them preserves the generic admin/runtime fallback.
- `record_permissions`: required. The **base, most restrictive** grant per
  role; at minimum grant `system-admin`.
- `functionality`: `null` until automation bindings are confirmed active.

**Permission design rule:** `record_permissions` is the base grant — if a role
can `read`/`update` a record, every field defaults to read/write.
`fields.*.permissions` is for **overrides only**: loosen a specific field
beyond the record grant, or restrict a `system: true` field. Field-level
actions are `read` and `write` only; `create`/`delete` are record-level.

**Known `data_type` values:** `text`, `textarea`, `rich_text`, `email`,
`phone`, `url`, `number`, `currency`, `range`, `date`, `datetime`, `boolean`/
`checkbox`, `select`, `multiselect`, `radio`, `color`, `file`, `image`,
`json`, `reference`, `address`. `select`/`multiselect`/`radio` require
`options`; `reference` should set `validation.reference_kind` and
`validation.reference_type`.

**Known `display_type` values:** `text`, `input`, `textarea`, `rich_text`,
`select`, `multiselect`, `radio`, `checkbox`/`switch`, `date_picker`,
`datetime_picker`, `color_picker`, `file_upload`, `image_upload`,
`range_slider`, `badge`, `timestamp`, `currency`, `number`.

**Before finishing a type change:**

- `slug` is unique per `kind` — duplicates break `resolveTypeId`/`.single()`
  lookups. Type seeds use `conflict: "kind,slug"` with `inject_app_id: false`.
- `kind` matches the runtime table (`item`, `thread`, `message`, `link`,
  `attachment`, `watcher`, `person`, `account`).
- `system: true` fields live at `record.<field>`; non-system fields at
  `record.data.<field>`. `system: true` fields restrict `write` to
  `system-admin` when the record-level grant would allow writes.
- `ownership`, `is_active`, `icon`, `color` are set on the `types` row.
- Validate the JSON before saving: `npx spine-framework validate-schema <file>`.

## Where to look — the instruction book

The package ships a markdown instruction book at
`.framework/src/instructions/`:

- `README.md` — structure, reading order, entity doc template.
- `guide/` — walkthroughs (`00-orientation.md` → `05-glossary.md`;
  `03-domain-model.md` covers types/records/apps).
- `concepts/` — `spine-way.md` (the rules), `core-vs-custom.md`,
  `design-schema.md`, `permissions.md`, `runtime-records.md`.
- `reference/` — `design-schema.md`, `cli.md`, `api/admin-data.md`,
  `env-vars.md`, `app-manifest.md`, `functions/`.
- `tasks/` — single-goal procedures. `operations/` — admin-UI runbooks.
- Entity pages: `types.md`, `apps.md`, `roles.md`, `pipelines.md`,
  `triggers.md`, `timers.md`, `ai-agents.md`, `prompts.md`,
  `integrations.md`, `api-keys.md`, `deliveries.md`.

Project-level skills for common jobs live in `.devin/skills/spine-*/`.

Installed apps may carry their own instruction book at
`custom/apps/<slug>/src/instructions/` and ship skills to
`custom/.devin/skills/<prefix>_*` — read them before working inside that
app.

## Verify before finishing

- `npm run typecheck` — compile the frontend + assembled sources.
- `npm run test` — vitest unit/API suite.
- `npm run verify` — integrity check against `.spine-manifest.json`.
- `npx spine-framework validate-schema <file>` — check a `design_schema` JSON.
- `npx spine-framework validate-app <dir>` — check an app package.
- `npx spine-framework doctor` — health + wiring checks.

## Decision records

The repo keeps versioned decision records (the *why* behind non-obvious
choices) in git:

- `.framework/decisions/` — framework-owned.
- `custom/apps/<slug>/decisions/` — package-owned for DAHL-shipped apps
  (overwritten by upgrades).
- `custom/decisions/` — yours; upgrades never touch it.

**Before editing** related code, read the records whose `applies_to` covers
the files you're touching — especially records with `status: accepted` or
`superseded` (a superseded record names the replacement to follow instead).
A `status: proposed` record is an unreviewed proposal — read it as context
and never as the reason a design is correct. Only `accepted` records (and
`superseded` ones, as history) carry authority.

**When you make a consequential choice** — pick between alternatives,
reject a design, discover an invariant, add a workaround — record it with
the `spine-decision-capture` skill. Your records go in `custom/decisions/`
(`owner: customer`); never write into package-owned `decisions/` dirs.

## Docs are part of the change

- Editing a file listed in a book page's `source_files` frontmatter
  requires re-verifying that page in the same change — bump
  `verified_against`/`verified_on`.
- Editing an app requires updating its `src/instructions/` in the same
  change (new page → tasks doc; new function → reference; new seeded
  type → entity page).
- Non-obvious decisions/cautions discovered while working go in the
  relevant page's `## Agent notes`.
- A code change without its doc update is incomplete.
<!-- spine-framework:end -->

<!-- Your project rules below this line are never overwritten by spine-framework upgrade -->
