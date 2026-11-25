---
title: Serve public content
audience: developers, agents
kind: task
verified_against: f0b7b0b
verified_on: 2026-11-24
source_files:
  - config/vite.config.ts
  - .framework/src/App.tsx
  - .framework/functions/apps.ts
  - .framework/src/components/AppWrapper.tsx
  - .framework/functions/_shared/middleware.ts
  - .framework/src/components/CustomAppLoader.tsx
  - .framework/cli/commands/validate-app.ts
---

# Serve public content

## Goal

Give anonymous visitors something to see — a marketing site, a public
marketplace, a catalog — without a Spine account.

## Two mechanisms

Spine ships two public-surface patterns; pick by what you need:

- **`is_public` app mount** — an app-scale surface: real routes with path
  params (`/campaign/:slug`), shared components, per-page document head.
  The app renders inside the SPA for anonymous principals.
- **Static `public/` + `createPublicHandler`** — document-scale pages:
  marketing HTML, simple feeds, anything one flat file can carry.

| Need | Mechanism |
|---|---|
| Path params, app components, per-page `<title>`/meta | `is_public` app |
| One-off pages, no framework code | Static `public/` file |
| Anonymous *data* in either | `createPublicHandler` function |

## The `is_public` app mount

Set `"is_public": true` in the app's `manifest.json`; install stamps it onto
`apps.is_public`. The anonymous SPA router (`App.tsx` → `PublicRouter`)
mounts the app at its `route_prefix` — including `/` — alongside the auth
pages; the app's routes, components, and path params work exactly as they
do for members. `validate-app` checks the flag against the renderer.

What it does and doesn't do:

- **`is_public` governs *rendering*, never *access*.** Anonymous data
  still comes only through `createPublicHandler` functions — member APIs
  (`admin-data`, `apps?action=list`, …) 401 for anonymous and the app must
  not call them on public pages.
- **Anonymous ≠ logged-out-error.** The app's components decide what an
  anonymous principal sees — render public pages with a sign-in link,
  don't wait for a redirect wall (there isn't one for public apps).
- **Custom renderers only.** `renderer: 'custom'` apps mount anonymously;
  generic shells call member APIs and `validate-app` warns on the combo.
- **`auth_required` is advisory.** `is_public: true` + `auth_required:
  true` is the common shape — public landing, member areas inside the app
  that render sign-in prompts. `auth_required: false` alone changes
  nothing (the mount keys on `is_public`).
- **Public projection is server-fixed.** `/api/apps?action=public`
  returns only mount fields (slug, route_prefix, renderer, domains,
  required_roles, nav_items) — `config`, `metadata`, and tenancy columns
  never leave the service-role boundary.

## The static pattern

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

### Parameterized static pages

Static shells can't take path params — `/campaign/<slug>` isn't a file
path. The working pattern is **one page + a query param**:

- Ship `campaign.html` and link `campaign.html?slug=<slug>`; the page
  reads `new URLSearchParams(location.search)` and fetches the record
  through your `createPublicHandler` endpoint.
- Pretty URLs are possible at the edge: a `_redirects` rule
  (`/campaign/* /campaign.html 200`) rewrites clean paths to the shell
  while `location.pathname` still carries the slug. `_redirects` lives in
  `.framework/public/` or your app `public/` and is copied to the served
  root on assemble — mind the collision rule (same path, different
  content → hard error).
- **SEO/OG expectations:** a static shell can emit only *one* set of
  `<title>`/OG tags — no per-slug meta, no prerendering. An `is_public`
  app gets per-page document head the way any SPA page does
  (`document.title`, meta tags from components) — still no SSR, so
  link-unfurlers see whatever the shell emits.

**Projection discipline:** the public endpoint must return only
public-safe fields — never pass raw records through. Decide the published
subset explicitly (e.g. published state + allowlisted fields) and filter
in the function; the anonymous principal runs on `adminDb`, so RLS will
not rescue an over-share.

## Gotchas

- **Exact file paths only in dev.** The dev catch-all that serves the SPA
  bypasses only real file paths — `/welcome.html` works, `/welcome/` falls
  through to the SPA. Directory URLs do **not** resolve `index.html` in
  dev — `/site/` falls through even when `/site/index.html` exists, so
  always link exact file paths (`/site/index.html`).
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
- **A root-mounted public app shadows member landing.** With
  `route_prefix: "/"`, anonymous visitors land on the public app; members
  still get the authenticated router and their own landing. Framework
  paths (`/spine-framework/*`) redirect anonymous to `/login`.

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

- `is_public` app: anonymous `curl -s http://localhost:8888/api/apps?action=public`
  lists it; a signed-out browser at its `route_prefix` renders the app
  (not a `/login` redirect).
- Static page: anonymous `curl -s -o /dev/null -w '%{http_code}' http://localhost:8888/welcome.html` → `200`.
- `curl http://localhost:8888/api/<your-public-function>` unauthenticated →
  `200` with the public payload (not `401`).
- Signed-out browser hits a non-public app prefix → redirected to `/login`.
