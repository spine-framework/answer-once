---
title: Apps and Renderers
audience: developers, agents
kind: concept
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/013_get_account_apps_role_filter.sql
  - .framework/migrations/014_apps_required_roles.sql
  - .framework/src/App.tsx
  - .framework/src/components/AppWrapper.tsx
  - .framework/src/components/CustomAppLoader.tsx
  - .framework/src/components/app-shell/GenericAppShell.tsx
  - .framework/src/components/app-shell/GenericListPage.tsx
  - .framework/src/components/app-shell/GenericDetailPage.tsx
  - .framework/functions/_shared/app-manifest.ts
  - .framework/functions/apps.ts
  - .framework/cli/commands/create-app.ts
  - .framework/cli/commands/install-app.ts
---

# Apps and Renderers

An app in Spine is a **row in `public.apps`** plus — for apps that render their
own UI — a directory of code. The registry row decides where the app mounts,
who can open it, and *how* it renders. The `renderer` column is the fork in
the road.

## The registry row

`.framework/migrations/001_core_schema.sql` defines `public.apps`: unique
`slug`, `name`, `route_prefix`, `renderer` (CHECK constraint:
`'generic' | 'custom' | 'none'`), `min_role`, `required_roles` (added in
migration 014), `nav_items`, `config`, `integration_deps`, `metadata`,
`is_active`, `is_system`, `owner_account_id`, domains.

- `route_prefix` (defaults to `/<slug>`) is where the SPA mounts the app —
  `.framework/src/App.tsx` builds a `<Route>` per active app.
- `is_active: false` removes the app from navigation and routing.
- `is_system: true` protects the row from tenant-level deletion.

## Mounting: directory or root

`route_prefix` is the whole mount contract. Every routable app
(`route_prefix != null`, `renderer !== 'none'`) becomes a
`<Route path="<prefix>/*">` in `.framework/src/App.tsx`:

- **Directory mount** — `"/portal"` → the app owns `/portal/*`.
- **Root mount** — `"/"` → the app owns `/*` and renders directly at `/` for
  non-admin users.
- **Nested mount** — `"/crm/sales"` works mechanically (`/crm/sales/*`);
  prefixes sort longest-first, so `/crm/sales` wins over `/crm`. Supported
  but unusual.

### Host-keyed mount overrides

`prod_domain` + `prod_route_prefix` (and the `preview_` pair for
`VITE_ENVIRONMENT=preview`) let one row mount differently per hostname
(`.framework/src/lib/app-mount.ts`, resolved in `useApps`/`AppContext` before
records reach the router):

- Host matches `prod_domain` → app mounts at `prod_route_prefix` (or
  `route_prefix` when no override is set).
- Host doesn't match, override set → still routable at `route_prefix`.
- Host doesn't match, no override → filtered out (legacy domain-lock).

So `route_prefix: "/demo"` + `prod_domain: "demo.example.com"` +
`prod_route_prefix: "/"` serves the app at `/` on its own site while it
stays at `/demo` everywhere else. `manifest.json` carries all four fields;
`validate-app` requires the matching domain whenever an override prefix is
declared. The unique index `idx_apps_route_prefix_domain` allows `/` per
prod domain.

Rules that are easy to get wrong:

- **Exactly one app may own `/`.** Two root-mounted apps both compile to
  `/*` and resolution order silently decides which renders — the registry
  does not prevent this; don't create it.
- **A root-mounted app shadows the global not-found page.** Its `/*` route
  matches every path the more-specific routes don't, so the app must render
  its own not-found for unknown internal paths (a catch-all
  `<Route path="*">` inside its `index.tsx` routes).
- **`system_admin` always lands on `/spine-framework/admin`.**
  Root-mounting changes what *members* see at `/`, not admins. Non-admin
  landing at `/`: root-mounted app if one exists → else redirect to the
  first app's prefix → else `NoAppPage`.
- **App-internal navigation must be mount-agnostic.** Use
  `useAppPath()` from `@core/hooks/useAppPath` (or relative paths inside the
  app's `<Routes>`) for every link and `navigate()` call — it returns the
  prefix (`''` when mounted at `/`). A hardcoded `navigate('/dashboard')`
  escapes a directory-mounted app. See [Frontend SDK](../reference/frontend-sdk.md).
- **`nav_items[].path` accepts two forms** (`GenericAppShell` navigates
  absolute paths verbatim and prefixes relative ones): absolute
  *including* the prefix (`/taskboard/tasks`) or relative (`tasks` →
  resolved to `/taskboard/tasks`). The broken form is absolute *without*
  the prefix (`/tasks` escapes the app). For a root-mounted app the
  absolute form is simply `/…`.
- **`/spine-framework/*` is reserved** (admin, API docs, CLI pages mount
  there ahead of app routes). Never pick a colliding prefix.
- **Apps are always behind login.** `is_public`/`auth_required` exist on
  the manifest, but the unauthenticated router only serves auth pages —
  a root-mounted app is not a public site mechanism.

Change the mount point via `manifest.route_prefix` + `update-db-app <slug>`
(or the admin app detail page). On package reinstall the local
`manifest.json` is preserved, so the file is the durable source.

## Role gating

Two layers decide who sees an app:

- Server side, `get_account_apps` filters the app list by the caller's role
  slugs (`.framework/functions/apps.ts`;
  `.framework/migrations/013_get_account_apps_role_filter.sql`).
- Client side, `AppWrapper` computes `required_roles` (falling back to
  `[min_role]`) and renders an access-denied screen unless the user holds
  `system_admin` or one of those roles (`.framework/src/components/AppWrapper.tsx`).

This gates *opening the app*; it does not replace record-level
`record_permissions` on the data underneath.

## `renderer = 'generic'`

The platform renders the app's list and detail pages for you, straight from
each type's `design_schema.views`:

- `App.tsx` mounts `GenericAppShell` for `renderer === 'generic'` apps.
- `GenericAppShell` builds the sidebar from the app's `nav_items` and, for
  every nav item carrying `type_slug` (and optional `view`), generates
  list/detail/new routes backed by `GenericListPage` and
  `GenericDetailPage`.
- `GenericListPage` turns `views.default_list` (or the nav item's named view)
  into sortable columns; `GenericDetailPage` renders `views.default_detail`
  sections with per-field read/write awareness.

**What you get for free:** a working list page, detail page, create/edit form,
sorting, filters, field-type rendering, and permission-aware editing — with
zero app code. **What it costs:** every type the app serves must have complete
`fields`, `views.default_list`, and `views.default_detail`, or the pages fail
with "No schema available" / schema-load errors. See
[Design Schema](design-schema.md).

## `renderer = 'custom'`

The app ships its own React code under `custom/apps/<slug>/` (a
project-owned directory, not part of the framework package). `App.tsx` mounts
`CustomAppLoader`, which resolves the app through an
`import.meta.glob('custom/apps/*/index.tsx')` — the app's `index.tsx` is its
entry point and default-exports the routed component (the `create-app`
scaffold generates exactly this shape).

A custom app renders its own pages but still uses the platform for data:
`/api/admin-data` for runtime CRUD, `/api/types` for schemas. Custom apps
must never write their own CRUD wrappers — that bypasses permissions,
validation, audit, and triggers (see [Runtime Records](runtime-records.md)).

`renderer = 'none'` registers the app (data, types, integrations) with no UI
surface.

## The manifest

`custom/apps/<slug>/manifest.json` is the app's declarative half, validated by
`loadManifest` in `.framework/functions/_shared/app-manifest.ts` (the
`AppManifest` interface is the contract):

```json
{
  "name": "My App",
  "slug": "my-app",
  "description": "…",
  "version": "1.0.0",
  "required_roles": ["member"],
  "route_prefix": "/my-app",
  "renderer": "custom",
  "routes": ["/my-app", "/my-app/dashboard"],
  "nav_items": [{ "title": "Dashboard", "path": "/my-app/dashboard", "icon": "LayoutDashboard", "order": 1 }],
  "features": [],
  "dependencies": [],
  "entry_point": "./index.tsx",
  "is_public": false,
  "auth_required": true
}
```

Validated requirements: non-empty `name`, `slug` matching
`^[a-z][a-z0-9-]*$` (and equal to the directory name for discovery), and
`required_roles` as an array of strings. Optional keys the install flow also
honors: `config` (merged onto the apps row), `seed` (declared seed entries),
`owned_types`, `registration`, `metadata`, `min_role`,
`preview_domain`/`prod_domain`.

## Install and seed flow

Two paths put an app on disk and in the registry:

- **`npx spine-framework create-app <slug>`** — scaffolds
  `custom/apps/<slug>/` (`manifest.json` + `index.tsx` + `components/`) and
  inserts a `public.apps` row with `renderer: 'custom'` and
  `route_prefix: /<slug>` (`.framework/cli/commands/create-app.ts`).
- **`npx spine-framework install-app <package>`** — copies a packaged app into
  `custom/apps/<slug>/`, runs migrations, then `seedApp`:
  - upserts the `apps` row from the manifest (`appRowPayload`: name,
    description, version, nav_items, route_prefix, renderer, required_roles,
    min_role, config merge, metadata);
  - applies seed files in dependency order — conventional
    `seed/roles.json` → `roles` (conflict `slug`), `seed/types.json` →
    `types` (conflict `kind,slug`, **no** `app_id` injection,
    `ignoreDuplicates`) — plus any `manifest.seed` entries;
  - refuses to overwrite a `types` row whose `design_schema` differs from the
    seed unless the slug is declared in `manifest.owned_types` and
    `--reconcile-owned-types` was passed (types are global — see
    [Scope and Accounts](scope-and-accounts.md));
  - syncs the `registration` block into `spine.config.json` (the project-owned
    config file at the project root).
- **`update-db-app <slug>`** re-syncs a local `manifest.json` to the DB without
  touching files; **`seed-app <slug>`** re-runs seeds;
  **`uninstall-app`** removes the app (`--keep-data` preserves seeded rows).
  All in `.framework/cli/commands/install-app.ts`.

## The practical split

Use `generic` when the app is "records in, records out" — lists, detail forms,
admin-style editing — and keep views accurate. Use `custom` when the UX is a
product surface (dashboards, wizards, bespoke layouts) and treat the manifest
as your app's contract: registration, roles, seeds, nav. Either way, types and
`design_schema` do the data modeling — the renderer only decides who draws the
pixels.
