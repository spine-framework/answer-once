---
title: Build a custom page
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/components/CustomAppLoader.tsx
  - .framework/src/components/AppWrapper.tsx
  - .framework/src/components/app-shell/GenericAppShell.tsx
  - .framework/src/lib/api.ts
  - .framework/cli/commands/create-app.ts
  - scripts/assemble.sh
---

# Build a custom page

## Goal

Ship a React page inside a custom app (`renderer: 'custom'`) instead of the
generic list/detail renderer. See
[Apps and renderers](../concepts/apps-and-renderers.md) for the model.

## When to go custom

Stay on `renderer: 'generic'` when the app is CRUD over typed records — the
generic renderer gives you list/detail/create/sort/permission-aware editing
for free from `views.default_list` / `views.default_detail`. Go custom for
dashboards, wizards, bespoke layouts, or anything not expressible as
schema-driven list/detail — `GenericAppShell` only generates routes for
nav items carrying `type_slug`
(`.framework/src/components/app-shell/GenericAppShell.tsx`).

## Steps

1. **Scaffold the app** (or reuse one):

   ```bash
   npx spine-framework create-app <slug> --role <role-slug>
   ```

   Writes `custom/apps/<slug>/` with `manifest.json`, `index.tsx`, and
   `components/`, and inserts the `apps` row with `renderer: 'custom'`
   (`.framework/cli/commands/create-app.ts`). Pass `--role` a slug
   that exists in `roles` — the default `member` is seeded by
   `073_seed_member_roles.sql`.

2. **Add pages under `custom/apps/<slug>/pages/`.** `CustomAppLoader`
   lazy-imports only `custom/apps/<slug>/index.tsx`
   (`import.meta.glob('../../../custom/apps/*/index.tsx')`,
   `.framework/src/components/CustomAppLoader.tsx`) — `index.tsx`
   default-exports the component (usually its own `<Routes>`) and imports
   the page components itself.

   ```tsx
   // custom/apps/<slug>/pages/DashboardPage.tsx
   export default function DashboardPage() { /* ... */ }
   ```

3. **Set the app row.** `renderer: 'custom'`, `route_prefix: '/<slug>'`,
   `min_role` / `required_roles`, `nav_items` for the sidebar. `AppWrapper`
   enforces auth + role before mounting your app
   (`.framework/src/components/AppWrapper.tsx`).

4. **Fetch data through `/api/admin-data`** — never write a bespoke CRUD
   function:

   ```ts
   import { apiFetch } from '@core/lib/api'

   const res = await apiFetch(
     '/api/admin-data?action=list&entity=items&type_slug=ticket&limit=50')
   const { data } = await res.json()
   ```

   `apiFetch` attaches the Supabase Bearer token and the `X-Account-Id`
   header (`.framework/src/lib/api.ts`). Find-or-create related records
   (e.g. a thread for a work item) through the same endpoint — see
   [Build your first app — Step 4](../guide/04-first-app.md) for the full
   call shapes.

5. **Rebuild and run.** `npm run assemble` (or `npm run dev` / `dev:netlify`,
   which run assembly automatically). Custom functions go in
   `custom/functions/` prefixed `custom_` — assembly hard-fails on a
   basename collision with a framework function
   (`scripts/assemble-functions.sh`).

## Verify

- Navigate to `/<slug>` — `CustomAppLoader` resolves your `index.tsx`
  (a missing entry shows the `App "<slug>" not found` error naming the
  expected path).
- `GET /api/apps?action=get&slug=<slug>` shows `renderer: 'custom'` and the
  right `route_prefix`.
- `npm run typecheck` compiles the page.

## Common mistakes

- **A bespoke CRUD endpoint.** Custom Netlify functions that
  create/update/list runtime records bypass `admin-data`'s permission,
  type-resolution, audit, and trigger logic — call `/api/admin-data` from
  the client instead (see [Write a function](./write-a-function.md) for the
  cases where a custom function *is* allowed).
- **Forgetting `index.tsx` is the only entry.** New pages in `pages/` are
  invisible until `index.tsx` routes to them.
- **`type_slug` nav items on a custom app** — they only do something under
  the generic renderer; use plain `path` nav items and route them yourself.
- **Editing before re-assembling** — `CustomAppLoader`'s glob is evaluated
  at build time; new files need an assemble/dev restart.

## Reference

- [Apps and renderers](../concepts/apps-and-renderers.md) ·
  [Runtime records](../concepts/runtime-records.md)
- [App manifest reference](../reference/app-manifest.md) ·
  [admin-data function reference](../reference/functions/admin-data.md)
- [Build your first app](../guide/04-first-app.md) ·
  [Anatomy of an installed project](../guide/02-project-map.md)
