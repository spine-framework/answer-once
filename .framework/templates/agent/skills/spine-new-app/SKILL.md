---
name: spine-new-app
description: "Scaffold a new Spine app — types + design_schema, app package skeleton, manifest.json, seed files, and registration."
verified_against: 1929705
verified_on: 2026-11-23
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
depends_on:
  files:
    - .framework/src/instructions/apps.md
    - .framework/src/instructions/concepts/apps-and-renderers.md
    - .framework/src/instructions/guide/04-first-app.md
    - .framework/src/instructions/reference/app-manifest.md
    - .framework/src/instructions/tasks/document-your-app.md
    - custom/.devin/skills/<prefix>_*/
    - custom/apps/<slug>/
    - custom/apps/<slug>/src/instructions/
    - .framework/src/instructions/tasks/register-an-app.md
    - .framework/src/instructions/tasks/build-a-custom-page.md
    - .framework/src/instructions/tasks/add-a-role.md
  commands:
    - "npm run test"
    - "npm run typecheck"
    - "npx spine-framework install-app"
    - "npx spine-framework update-db-app"
    - "npx spine-framework validate-app"
---

You scaffold a new Spine app into `custom/apps/<slug>/` following the app
package contract.

## When to invoke

- The user wants a new application on top of Spine.
- An existing app needs a new section and the app contract must be honored.

## Prerequisites

- Read `.framework/src/instructions/apps.md` (the `apps` entity),
  `.framework/src/instructions/concepts/apps-and-renderers.md`, the app
  walkthrough `.framework/src/instructions/guide/04-first-app.md`, and the
  manifest contract `.framework/src/instructions/reference/app-manifest.md`.
- Decide `app_type`: `full` (UI + functions), `ui` (frontend only),
  `backend` (functions only), `data` (schema/seed only).
- Decide `renderer`: `generic` renders from `design_schema.views` with no
  custom pages; `custom` requires `index.tsx` + `pages/`.

## Steps

1. **Types first.** Each app-owned entity needs a row in `public.types` with a
   valid `design_schema` (use the `spine-new-type` / `spine-schema` skills).
   Slugs are global per `kind` — check existing types before naming.

2. **Scaffold the package** at `custom/apps/<slug>/`:
   - `package.json` — name `spine-framework-<slug>`, `"private": false`,
     `version` matching `manifest.json`, a `spine` block
     (`{ "type": "app", "slug", "manifestPath" }`), and `files` listing every
     directory that exists.
   - `manifest.json` — `name`, `slug`, `version`, `app_type`, `route_prefix`,
     `required_roles`, `entry_point`, `sidebar_component`, `seed`, and
     `registration` when the app supports self-registration.
   - `index.tsx` — default-exported root component (full/ui apps).
   - `pages/` — route-mapped page components (full/ui apps).
   - `functions/` — Netlify handlers (full/backend apps).
   - `seed/` — JSON arrays; no `id`/`app_id` fields (the framework injects
     them). Every file declared in the `seed` block with `file`, `table`,
     `conflict`.

3. **Nav paths depend on `renderer`.** `generic` renderers: absolute
   `nav_items[].path` must *include* `route_prefix` (`/my-app/tasks`);
   relative (`tasks`) is prefixed automatically. `custom`/`none`
   renderers: paths are root-relative and must NOT include the prefix.
   `routes` is declarative root-relative. Links inside the app use
   `useAppPath()`. `route_prefix` cannot claim framework-reserved routes
   (`/admin`, `/login`, `/register`, `/forgot-password`, `/auth/*`,
   `/api`, `/spine-framework/*`) — `validate-app` errors.

4. **Validate:** `npx spine-framework validate-app custom/apps/<slug>` —
   fix every error before publishing or installing.

5. **Install/dev:** `npx spine-framework install-app <pkg>` installs from npm;
   `npx spine-framework update-db-app <slug>` pushes manifest changes to the DB.

## Adding a custom page to an existing app

When the job is "this app needs a bespoke screen," not a new app — full
procedure: `.framework/src/instructions/tasks/build-a-custom-page.md`.

- Custom pages require `renderer: 'custom'` on the `apps` row —
  `GenericAppShell` only generates routes for nav items carrying
  `type_slug`. Generic CRUD apps should usually *stay* generic; go custom
  for dashboards, wizards, bespoke layouts.
- `CustomAppLoader` lazy-imports only `custom/apps/<slug>/index.tsx` —
  pages live under `pages/` and are imported by `index.tsx`, which wires
  its own `<Routes>` (or the app's router).
- Inside the app, import framework modules via `@core/*` and runtime
  record CRUD via `/api/admin-data` — never custom Netlify wrappers.
- Register the page in `manifest.json` nav/routes, then
  `npx spine-framework update-db-app <slug>` to push it.

## Rules

- Never hand-edit `.framework/`; the app contract is data + custom code only.
- Keep `package.json` and `manifest.json` versions in lockstep.
- Seed files must be idempotent — reruns must not duplicate rows.
- Verification: `validate-app` clean, `npm run typecheck`, `npm run test`.

## Docs — part of the change

An app change is incomplete until `custom/apps/<slug>/src/instructions/`
reflects it: new page/route → the app's tasks doc; new function →
`reference/functions`; new seeded type → entity page. Author skills at
`custom/.devin/skills/<prefix>_*/` (declare `agent.skill_prefix` in
manifest.json); stage into `agent/skills/` when packaging. See
`.framework/src/instructions/tasks/document-your-app.md`.
