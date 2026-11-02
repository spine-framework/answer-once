---
title: App Manifest Reference
audience: developers, agents
kind: reference
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/functions/_shared/app-manifest.ts
  - .framework/cli/commands/install-app.ts
  - .framework/cli/commands/validate-app.ts
---

# App Manifest Reference

`manifest.json` is the install-time and runtime descriptor every app carries
at `custom/apps/<slug>/manifest.json`. Two consumers read it:

- **CLI installers** (`install-app`, `update-app`, `update-db-app`, `seed-app`,
  `uninstall-app` in `.framework/cli/commands/install-app.ts`) — copy files,
  upsert the `public.apps` row, run the `seed` block, and sync the
  `registration` policy into `apps.config` and `spine.config.json`.
- **Runtime** (`loadManifest` / `mergeWithManifest` / `discoverManifests` in
  `.framework/functions/_shared/app-manifest.ts`) — when an `apps` row has
  `manifest_path` set and `config_source = 'manifest'`, the manifest file
  overrides DB columns for slug, name, roles, routes, and nav.

See [Seeds](seeds.md) for the seed mechanics and
[spine.config.json](spine-config.md) for the registration file the installer
writes.

## Required fields

| Field | Rule |
|---|---|
| `name` | non-empty string |
| `slug` | must match `/^[a-z][a-z0-9-]*$/`, equal the app directory name, and equal the `seed-app`/`update-db-app` argument |

`loadManifest` rejects manifests missing either, and `preflightAppInputs`
rejects a manifest whose `slug` does not match the app's directory slug —
before any database work happens.

## Runtime fields (`AppManifest`)

Read by `.framework/functions/_shared/app-manifest.ts` and mirrored onto the
`apps` row by `appRowPayload` in the installer:

| Field | Type | Default on the apps row |
|---|---|---|
| `description` | string | `''` |
| `version` | string | `'1.0.0'` |
| `required_roles` | string[] | `[]`; `min_role` column becomes `required_roles[0]` (or legacy `min_role`) |
| `route_prefix` | string | `'/' + slug` — the SPA mount point. `"/"` mounts at the site root (**one app only**; its `/*` shadows the global not-found, so root apps must render their own not-found); nested prefixes (`/crm/sales`) sort longest-first; `/spine-framework/*` is reserved. Change post-install via `update-db-app` or admin — see [Mounting](../concepts/apps-and-renderers.md#mounting-directory-or-root) |
| `renderer` | `'generic' \| 'custom' \| 'none'` | `'custom'` — matches the `apps.renderer` CHECK constraint |
| `routes` | string[] | app route paths; `:param` segments supported |
| `nav_items` | `NavItem[]` | `[]` — `{title, path, icon?, order?, type_slug?, view?, children?}`. **`path` must include the `route_prefix`** (e.g. `/taskboard/tasks`, not `/tasks`) — the app index navigates to `path` verbatim, so a bare path escapes the app and 404s. `view` is **one slug consumed by both the list and the detail page** — naming `default_list` makes the detail page resolve a list view (which has `fields`, not `sections`) and render empty. Omit `view` to get `default_list` + `default_detail`; a nav item cannot pick list and detail views independently |
| `features` | string[] | `[]` |
| `dependencies` | string[] | `[]` |
| `entry_point` | string | e.g. `"./index.tsx"` |
| `is_public` | boolean | `false` — reachable without auth when true |
| `auth_required` | boolean | `true` |
| `preview_domain` | string | `null` |
| `prod_domain` | string | `null` |

`mergeWithManifest` always keeps DB-owned values for `id`, `is_active`,
`is_system`, `account_id`, `pack_id`, and `ownership`; the manifest wins for
`slug`, `name`, `required_roles`, `routes`, `nav_items`, `features`,
`dependencies`, `version`, `is_public`, `auth_required`.

## Installer-only fields

Consumed by `.framework/cli/commands/install-app.ts`; ignored by the runtime
loader:

| Field | Type | Purpose |
|---|---|---|
| `app_type` | string | informational; the installer always writes `app_type: 'custom'` on the apps row |
| `sidebar_component` | string | app-relative path to a sidebar component |
| `seed` | `SeedEntry[]` | seed declarations — see below and [Seeds](seeds.md) |
| `owned_types` | string[] | type slugs this app may reconcile when `--reconcile-owned-types` is passed; every slug must exist in a types seed |
| `registration` | object | registration policy synced to `apps.config.registration` and `spine.config.json` |
| `agent` | object | app-shipped agent assets — `{ "skill_prefix": "ao" }`. Required when the package ships `agent/skills/`; must match `^[a-z][a-z0-9]{0,7}$` and be unique across installed apps |
| `config` | object | merged (shallow) into `apps.config`; existing keys the manifest does not declare survive |
| `metadata` | object | written to `apps.metadata` |

### `seed[]` entries

```json
"seed": [
  { "file": "seed/roles.json",      "table": "roles",      "conflict": "slug" },
  { "file": "seed/types.json",       "table": "types",      "conflict": "kind,slug", "inject_app_id": false },
  { "file": "seed/link-types.json",  "table": "link_types", "conflict": "app_id,slug" },
  { "file": "seed/type_permissions.json", "table": "types", "conflict": "kind,slug",
    "inject_app_id": false, "permissions_patch": true },
  { "file": "seed/pipelines.json",   "table": "pipelines",  "conflict": "app_id,slug" },
  { "file": "seed/triggers.json",    "table": "triggers",   "conflict": "app_id,slug" }
]
```

| Key | Rule |
|---|---|
| `file` | path relative to the app root; must resolve inside the app directory (canonicalization rejects `..` and symlink escapes). **Declared files must exist** — a missing declared file fails the install |
| `table` | target `public.*` table |
| `conflict` | PostgREST `onConflict` columns, e.g. `slug`, `kind,slug`, `app_id,slug` |
| `inject_app_id` | default `true` — stamps `app_id` on every row. Set `false` for global rows (types are global per `kind,slug`) |
| `ignore_duplicates` | upsert skips existing rows instead of updating (always forced for `types`) |
| `permissions_patch` | row shape `{kind, slug, record_permissions}`; patches `design_schema.record_permissions` on an existing type |

If `manifest.seed` is absent, the installer falls back to the conventional set:
`seed/roles.json`, `seed/types.json` (`inject_app_id: false`),
`seed/link-types.json`. A `seed/type_permissions.json` file is auto-declared
as a `permissions_patch` entry even when `seed` is explicit, unless a patch
entry already exists. Every row of a `types` seed gets a fresh
`validation_schema` generated from its `design_schema` at apply time.

### `agent` — app-shipped docs and skills

```json
"agent": { "skill_prefix": "ao" }
```

A package may stage agent assets under `agent/`; the installer maps them to
their live locations:

| Package path | Installed to |
|---|---|
| `agent/skills/<prefix>_<name>/SKILL.md` | `custom/.devin/skills/<prefix>_<name>/` |
| `agent/instructions/**` | `custom/apps/<slug>/src/instructions/` |

Rules enforced at install (fail-closed, before any DB writes):

- `agent/skills/` present → `agent.skill_prefix` is required and must match
  `^[a-z][a-z0-9]{0,7}$`.
- Every staged skill dir must start with `<prefix>_` and contain a
  `SKILL.md` whose frontmatter `name:` equals the directory name.
- `skill_prefix` must be unique across installed apps — `install-app`
  scans every `custom/apps/*/manifest.json`.
- `agent/instructions/` may contain only `.md` files.
- `uninstall-app` removes `custom/.devin/skills/<prefix>_*` — nothing else
  outside the app dir.

In-project development authors skills directly at
`custom/.devin/skills/<prefix>_*/` (the discovered location — skills inside
`custom/apps/<slug>/.devin/` are **not** picked up by agent tooling) and
instructions at `custom/apps/<slug>/src/instructions/`; stage them under
`agent/` when packaging. See
[Document your app](../tasks/document-your-app.md).

### `registration`

```json
"registration": {
  "enabled": true,
  "default_role": "member_admin",
  "redirect_path": "/my-app",
  "account_strategy": "new",
  "parent_account": "spine-system",
  "target_account": "<account-id>",
  "allow_domain_join": false,
  "default_workspace_name": "Team"
}
```

Validated at preflight: `registration` must be an object; `enabled` must be a
boolean; when `enabled: true`, `default_role` and `redirect_path` are required
non-empty strings. The resolved entry is written to both
`apps.config.registration` (server-side source of truth) and
`spine.config.json` `registration.apps.<slug>` — see
[spine.config.json](spine-config.md). `account_strategy` is `new` or
`existing`; `parent_account`/`target_account` select where new accounts/users
land.

## App-row mapping

`appRowPayload` upserts `public.apps` on `slug` with `app_type: 'custom'`,
`source: 'npm'`, `is_active: true`, and the manifest-derived columns above.
`manifest.config` is shallow-merged over the existing `apps.config` (manifest
wins shared keys; unrelated keys are preserved).

## Related files

- `.framework/functions/_shared/app-manifest.ts` — runtime loader, cache, discovery, manifest-over-DB merge
- `.framework/cli/commands/install-app.ts` — preflight, `appRowPayload`, `seedApp`, `syncAppRegistration`
- `.framework/cli/commands/validate-app.ts` — `spine-framework validate-app` structural checks
- [Apps](../apps.md) · [Seeds](seeds.md) · [spine.config.json](spine-config.md) · [Apps and Renderers](../concepts/apps-and-renderers.md)
