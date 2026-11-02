---
title: Register an app
audience: developers, agents
kind: task
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/cli/commands/create-app.ts
  - .framework/cli/commands/install-app.ts
  - .framework/functions/apps.ts
  - .framework/functions/_shared/app-manifest.ts
  - .framework/src/App.tsx
  - .framework/src/components/app-shell/GenericAppShell.tsx
---

# Register an app

## Goal

Put an app in the `public.apps` registry so it appears in navigation, mounts
at a route, and renders — either by the generic renderer (schema-driven) or
by your own code (`custom/apps/<slug>/`).

Two decisions up front:

1. **Renderer** — `generic` (platform draws list/detail pages from each
   type's `design_schema.views`) or `custom` (your `index.tsx` draws
   everything). `none` registers data/types with no UI.
2. **Mount point (`route_prefix`)** — where the app lives in the URL space:
   `/my-app` (default), `/` (site root), or a nested prefix. See
   [Mounting](../concepts/apps-and-renderers.md#mounting-directory-or-root)
   for the full rules — the short version:

   | Mount | Effect |
   |---|---|
   | `/my-app` (default) | App owns `/my-app/*`. Safe default. |
   | `/` | App owns `/*`; renders at `/` for non-admins. **One app only** — must render its own not-found for unknown paths. |
   | `/crm/sales` | Nested; longest-prefix-first. Works, rarely needed. |

## Steps

### Option A — scaffold a custom app

```bash
npx spine-framework create-app <slug>
```

Creates `custom/apps/<slug>/` (`manifest.json` + `index.tsx` +
`components/`) and inserts the `apps` row with `renderer: 'custom'` and
`route_prefix: /<slug>` (`.framework/cli/commands/create-app.ts`).

Then edit `custom/apps/<slug>/manifest.json` — set `route_prefix`,
`required_roles`, `nav_items`, and `routes`. Sync to the DB:

```bash
npx spine-framework update-db-app <slug>
```

### Option B — register a generic app

Generic apps are registry rows plus nav items — no app directory is needed
(the shell renders from type schemas):

1. Ensure every type the app will serve has complete `design_schema` —
   `fields`, `views.default_list`, `views.default_detail` (see
   [Design schema](../concepts/design-schema.md)).
2. Create the `apps` row — via the admin UI (Admin → Apps → New) or the API:

   ```ts
   await apiFetch('/api/apps?action=create', {
     method: 'POST',
     body: JSON.stringify({
       slug: 'taskboard', name: 'Taskboard',
       renderer: 'generic',
       route_prefix: '/taskboard',
       min_role: 'member',
       is_active: true,
       nav_items: [
         { title: 'Tasks', path: '/taskboard/tasks', type_slug: 'task', order: 1 }
       ]
     })
   })
   ```

   `nav_items` entries carrying `type_slug` (and optional `view`) get
   generated list/detail/new routes. Omit `view` to use `default_list` +
   `default_detail` — a nav item cannot pick list and detail views
   independently ([manifest reference](../reference/app-manifest.md)).
3. Log out/in (or refresh) so the registry reloads.

### Option C — install a packaged app

```bash
npx spine-framework install-app <package>
```

The package's `manifest.json` declares `route_prefix` and everything else —
see [Package and install an app](package-and-install-an-app.md).

## Verify

- `GET /api/apps?action=get&slug=<slug>` returns the row with your
  `route_prefix`, `renderer`, `nav_items`.
- Navigating to `<route_prefix>` renders the app (generic: list page;
  custom: your `index.tsx`). For `/`, members land on it directly;
  `system_admin` still lands on `/spine-framework/admin`.
- `useAppPath`-built links inside the app resolve correctly at the chosen
  mount point.

## Common mistakes

- **Two apps mounted at `/`** — both compile to `/*`; ordering silently
  decides which renders. The registry won't stop you; don't do it.
- **Root app with no internal not-found** — a `/`-mounted `/*` shadows the
  global `*` route; unmatched paths inside the app show blank/error instead
  of your 404. Add `<Route path="*" element={...}>` in the app's routes.
- **Hardcoded paths** — `navigate('/tasks')` or `to="/tasks"` escapes a
  directory-mounted app. Use `useAppPath()` from `@core/hooks/useAppPath`
  or relative routes.
- **`nav_items` absolute paths missing the prefix** — `/tasks` navigates
  outside the app and 404s. Use either `/taskboard/tasks` (absolute
  incl. prefix) or `tasks` (relative — the shell prefixes it).
- **Expecting public access** — `is_public`/`auth_required` exist on the
  manifest but are not wired into the unauthenticated router; every app is
  behind login.
- **Generic app, thin schema** — `renderer: 'generic'` with types lacking
  `views.default_list`/`default_detail` renders "No schema available."

## Reference

- [Apps and renderers](../concepts/apps-and-renderers.md) — mounting model,
  role gating, renderer semantics
- [Apps](../apps.md) — the registry entity page
- [App manifest reference](../reference/app-manifest.md) — every manifest
  field incl. `route_prefix`, `nav_items`, `registration`
- [Build a custom page](build-a-custom-page.md) ·
  [Frontend SDK](../reference/frontend-sdk.md) — `useAppPath`, `apiFetch`
