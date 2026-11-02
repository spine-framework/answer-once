---
title: Apps
audience: both
kind: entity
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/functions/apps.ts
  - .framework/src/pages/admin/AppsPage.tsx
  - .framework/src/pages/admin/AppDetailPage.tsx
  - .framework/migrations/003_core_system_data.sql
  - .framework/migrations/013_get_account_apps_role_filter.sql
---

## What this is for

An **app** is a registered application in Spine. The registry controls navigation visibility, who can open the app (min role), how it renders (generic vs custom), and the JSON configuration the app or its types consume at runtime.

## Fields and settings

- **Name** — string. Display name in the app switcher and registry.
- **Slug** — string. Unique identifier; set at creation, rarely changed. Routes and API scoping depend on it.
- **Description** — string, optional. Short text shown in the app list.
- **App Type** — select: `system`, `custom`, `marketplace`. Drives how the platform treats the app.
- **Source** — select: `system`, `custom`, `marketplace`. Tracks where the package came from.
- **Min Role** — select: `member`, `admin`, `owner`. Lowest role that can see/open the app.
- **Version** — string. Current version shown in the registry.
- **Active** — boolean. Inactive apps are hidden and cannot be opened.
- **System** — boolean. Protects the app from tenant-level deletion.
- **Icon / Color** — UI presentation for the app tile.
- **Route Prefix** — string, optional. URL prefix where the app mounts (defaults to `/slug`). `"/"` mounts the app at the site root (exactly one app may own it; the app must render its own not-found); nested prefixes like `/crm/sales` work longest-first. `/spine-framework/*` is reserved. See [Apps and Renderers → Mounting](concepts/apps-and-renderers.md#mounting-directory-or-root).
- **Renderer** — select: `generic` (renders list/detail from type `design_schema.views`), `custom` (app renders its own pages), `none`.
- **Config (JSON)** — `config` column; runtime config for the app or its generic renderer.
- **Nav Items (JSON)** — array of navigation items for the app shell.
- **Integration Deps (JSON)** — array of integration slugs the app depends on.
- **Metadata (JSON)** — free-form metadata.

**Downstream effects**

- The app shell reads `slug`, `route_prefix`, `min_role`, `is_active`, `icon`, `color`, `nav_items` to build navigation and gate access.
- `renderer = generic` requires every served type to have complete `views` in its `design_schema`.
- `min_role` raises the floor for the whole app — setting `admin` hides it from members even if record permissions would allow reads.

## Minimal configuration

```json
{
  "slug": "my-app",
  "name": "My App",
  "app_type": "custom",
  "source": "custom",
  "renderer": "custom",
  "is_active": true,
  "min_role": "member"
}
```

## Full configuration

Adds `version`, `icon`, `color`, `route_prefix`, `config` (feature flags, default views), `nav_items` (grouped sidebar entries), `integration_deps` (e.g. `["openai", "sendgrid"]`), and `metadata` (author, homepage, tags).

## Example

A support app registers with `renderer: "custom"`, `route_prefix: "/answer-once"`, `min_role: "member"`, and `integration_deps: ["openai"]` — the admin renders its own pages but still uses `/api/admin-data` for record CRUD and `types` for its ticket/thread types.

## Core files

- `.framework/functions/apps.ts` — API (list/get/create/update/delete)
- `.framework/src/pages/admin/AppsPage.tsx` / `AppDetailPage.tsx` — admin UI
- `.framework/src/components/app-shell/` — shell, generic renderer, app registry
- Table: `public.apps` (+ `get_account_apps` RPC for counts)

## Agent notes

- `renderer = "custom"` still needs `fields` + `record_permissions` on its types so `admin-data` can stamp and validate records.
- Slug appears in API envelopes and `x-app-id` headers — renaming an in-use slug breaks logging attribution and callers.
- `marketplace` as a type/source value is under review (F-031) — prefer `custom` for new apps.
