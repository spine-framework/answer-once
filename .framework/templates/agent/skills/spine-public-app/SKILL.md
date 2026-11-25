---
name: spine-public-app
description: "Build an anonymous/public surface — is_public SPA apps for app-scale surfaces, static public/ shells + createPublicHandler for document-scale pages, and the projection discipline both share."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
verified_against: f0b7b0b
verified_on: 2026-11-24
depends_on:
  files:
    - .framework/src/instructions/tasks/serve-public-content.md
    - .framework/src/App.tsx
    - .framework/functions/apps.ts
    - .framework/functions/_shared/middleware.ts
---

You build a surface anonymous visitors can use — marketing pages, public
listings, marketplaces, shared detail pages — without a Spine account.

## The contract

Two mechanisms, picked by what you need:

1. **`is_public` app mount** — `"is_public": true` in `manifest.json`
   mounts a `custom` app for anonymous visitors inside the SPA: real
   routes with path params, shared components, per-page document head.
   `is_public` governs *rendering*, never *access*.
2. **Static shells + public reads** — `public/` files served verbatim +
   `createPublicHandler` functions for the data. Document-scale pages.

In **both** cases anonymous data comes only through `createPublicHandler`
functions — the handler runs on `adminDb`, so **you** are the read policy.

## Steps

1. Read `.framework/src/instructions/tasks/serve-public-content.md` — the
   full pattern: mechanism table, gotchas, reserved routes.
2. **Choose the mechanism:** path params / components / per-page meta →
   `is_public` app. One-off flat pages → static `public/` shell.
3. **Public endpoint** — `custom/functions/custom_<name>.ts` using
   `createPublicHandler`. Filter to published/public-flagged rows and
   **project an explicit field allowlist** — never return raw records; the
   anonymous principal bypasses RLS.
4. **`is_public` app (if chosen):** set `is_public: true` in
   `manifest.json`, keep `renderer: 'custom'` (the only anonymous-mountable
   renderer — `validate-app` warns otherwise), install/`update-db-app` to
   stamp `apps.is_public`. The app must not call member APIs on public
   pages — components decide what anonymous sees (sign-in links inside
   pages, not a redirect wall).
5. **Static shell (if chosen):** HTML + assets in project-root `public/`;
   link exact paths (`/site/index.html`, not `/site/`); parameterized
   pages use `page.html?slug=…` + optional `_redirects` rewrite.
6. **Verify anonymous:** `curl /api/apps?action=public` (app listed);
   signed-out browser at the prefix renders the app — or the static page
   returns 200; the endpoint returns only the public projection.

## Hard limits — do not approximate these

- **No member APIs on public pages** — `admin-data`, `apps?action=list`,
  and every `createHandler` endpoint 401 for anonymous. Data flows only
  through `createPublicHandler`.
- **Never put records or config in `public/`** — it is world-readable
  shells and assets only (no `spine.config.json` copies).
- **No SSR/prerendering** — an `is_public` app sets `<title>`/meta like
  any SPA page; link-unfurlers still see whatever the document head emits
  at crawl time.
- **Static shells: one meta set, no path params** without the
  `_redirects` rewrite — that's what `is_public` apps are for.

## When to escalate

If the requirement needs authenticated-but-mixed access on *member APIs*,
per-entity SSR, or anonymous access to non-public records, that is a
framework-level feature — note it in the project's gap register and the
app's instruction book.
