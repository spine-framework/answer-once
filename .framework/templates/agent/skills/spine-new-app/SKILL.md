---
name: spine-new-app
description: "Scaffold a new Spine app — types + design_schema, app package skeleton, manifest.json, seed files, and registration."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
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

3. **Routes are root-relative.** `routes` and `nav_items` must NOT include
   `route_prefix`; links inside the app use `useAppPath()`.

4. **Validate:** `npx spine-framework validate-app custom/apps/<slug>` —
   fix every error before publishing or installing.

5. **Install/dev:** `npx spine-framework install-app <pkg>` installs from npm;
   `npx spine-framework update-db-app <slug>` pushes manifest changes to the DB.

## Rules

- Never hand-edit `.framework/`; the app contract is data + custom code only.
- Keep `package.json` and `manifest.json` versions in lockstep.
- Seed files must be idempotent — reruns must not duplicate rows.
- Verification: `validate-app` clean, `npm run typecheck`, `npm run test`.
