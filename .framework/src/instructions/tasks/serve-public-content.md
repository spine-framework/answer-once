---
title: Serve public content
audience: developers, agents
kind: task
verified_against: ba58de9
verified_on: 2026-11-23
source_files:
  - config/vite.config.ts
  - .framework/src/App.tsx
  - .framework/functions/_shared/middleware.ts
  - .framework/src/components/CustomAppLoader.tsx
  - .framework/cli/commands/validate-app.ts
---

# Serve public content

## Goal

Give anonymous visitors something to see — a marketing site, a community
homepage, a public feed — without a Spine account.

## The constraint

**Apps are always behind login.** The SPA router
(`.framework/src/App.tsx`) serves only the auth pages (`/login`,
`/register`, `/forgot-password`) to unauthenticated visitors; every app —
even a root-mounted one — requires a signed-in user. `is_public` on the
manifest/rows is not an anonymous-page mechanism (see
[Apps and renderers](../concepts/apps-and-renderers.md)). There is no
first-class "anonymous page" concept; the supported pattern below is what
ships today.

## The supported pattern

Two building blocks, used together:

1. **Static files in the project-root `public/` directory.** Vite's
   `publicDir` is `public/` at the project root (`config/vite.config.ts`)
   and its contents are served verbatim at the site root — a `welcome.html`
   dropped there answers `/welcome.html` without touching the SPA or auth
   at all. Put shared CSS/JS there too.
2. **`createPublicHandler` functions for anonymous reads.** Wrap a custom
   function in `createPublicHandler` (`_shared/middleware.ts`) to expose a
   read endpoint that anonymous callers can hit — it still resolves a
   principal (anonymous callers get the `adminDb` client), so filter to
   exactly what the public page should see (e.g. published + public-flagged
   records). Static pages fetch from it with plain `fetch('/api/…')`.

This is the complete public-site loop: static HTML shells + a public-read
function, with login/registration links handing visitors into the gated app.

## Gotchas

- **Exact file paths only in dev.** The dev catch-all that serves the SPA
  bypasses only real file paths — `/welcome.html` works, `/welcome/` falls
  through to the SPA (and its login redirect). Use flat `.html` filenames,
  or add a real `index.html` inside the subdirectory.
- **Restart the dev server after adding an app.** `CustomAppLoader`
  discovers apps through `import.meta.glob('../../custom/apps/*/index.tsx')`,
  which Vite snapshots at dev-server start — a newly created app won't
  appear ("App not found") until `npm run dev:netlify` restarts.
- **Static files are world-readable.** Anything in `public/` is served to
  everyone; it's for shells, logos, and assets — never records.
- **App-level `public/` is package content, not site content.** A
  `public/` dir inside `custom/apps/<slug>/` is copied as part of the
  package; it is *not* served by Vite. Site-served files belong in the
  project-root `public/`.

## Reserved routes

Route prefixes the framework claims before any app gets a turn —
`validate-app` rejects a `route_prefix` that claims one:

- `/admin` — the seeded core admin app
- `/login`, `/register`, `/forgot-password`, `/auth/*` — auth pages
- `/spine-framework/*` — sealed admin/API/CLI pages
- `/api` — the Netlify functions path

Plus the resolvable-root names Vite can hit before the SPA (`/app`, `/src`,
`/assets`, `/pages`, …) — see
[App manifest — route_prefix](../reference/app-manifest.md).

## Verify

- Anonymous `curl -s -o /dev/null -w '%{http_code}' http://localhost:8888/welcome.html` → `200`.
- `curl http://localhost:8888/api/<your-public-function>` unauthenticated →
  `200` with the public payload (not `401`).
- Signed-out browser hits a member page → redirected to `/login`.
