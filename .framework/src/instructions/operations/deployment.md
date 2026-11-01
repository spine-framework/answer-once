---
title: Netlify Deployment
audience: both
kind: reference
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - netlify.toml
  - .framework/public/_redirects
  - scripts/assemble.sh
  - scripts/assemble-frontend.sh
  - scripts/assemble-functions.sh
  - config/vite.config.ts
  - .env.example
  - .framework/functions/system.ts
---

# Netlify Deployment

Spine deploys as a single Netlify site: a Vite-built SPA in `dist/` plus a
flat directory of functions in `.assembled/netlify/functions`, backed by a
Supabase (Postgres) project. Both halves are produced by the same build
command — there is no separate function deploy step.

## `netlify.toml` anatomy

The root `netlify.toml` is partly framework-owned (regenerated on
`npx spine-framework upgrade`, preserving `[functions."custom_*"]` sections):

| Block | Contents |
|---|---|
| `[build]` | `command = "npm run assemble && npm run build"`, `publish = "dist"`, `functions = ".assembled/netlify/functions"` |
| `[build.environment]` | `SECRETS_SCAN_OMIT_KEYS` whitelists the intentionally-public vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `APP_BASE_URL`, `SITE_URL`, …) so Netlify's secrets scanner does not flag them; `SECRETS_SCAN_OMIT_PATHS` covers `.framework/.xenv*` |
| `[functions]` | `directory = ".assembled/netlify/functions"`, `included_files` for `_shared/**`, `node_bundler = "esbuild"`, `external_node_modules = ["typescript"]` (the esbuild printer panic workaround — typescript.js ships unbundled) |
| `[dev]` | `netlify dev` runs `scripts/netlify-dev-wrapper.sh`, site on `8888`, Vite `targetPort` `3001`, `startTimeout 300` |
| `[functions."<name>"]` | per-function config: `trigger-scheduler` gets `schedule = "* * * * *"`; `cil-ingest`, `cil-embeddings`, `cil-callmap`, `cil-agent`, `ai-agents`, `kb` get `timeout` overrides |
| `[[redirects]]` | `/* → /index.html` with status `200` (SPA fallback) |
| `[[headers]]` | `X-Frame-Options DENY`, `nosniff`, HSTS, `Referrer-Policy`, `Permissions-Policy`, and a CSP that allows `*.supabase.co` (https+wss) and `challenges.cloudflare.com` (Turnstile) |

Dispatched trigger pipelines run as Netlify **background functions**
(`pipeline-runner-background`): the dispatcher gets a `202` immediately and
each run gets the fixed 15-minute background budget — which is why no
`timeout` entry exists for it.

## How `.assembled/` is produced

`npm run assemble` (`scripts/assemble.sh`) runs before every dev start
(`predev:netlify`) and every build (`prebuild`). It wipes stale `dist/`,
then:

1. `scripts/assemble-functions.sh` flattens `.framework/functions` plus
   `custom/functions` and `custom/apps/*/functions` into
   `.assembled/netlify/functions`. Basename collisions are a **hard error**
   naming both sources — Netlify needs one flat dir, so last-wins overwrite
   is forbidden. `_quarantine` and `*-test.ts`/`*.test.ts` are excluded.
2. `scripts/assemble-frontend.sh` copies `.framework/src` as the base layer,
   each `custom/apps/<slug>` verbatim to `.assembled/src/<slug>/`, fixes up
   `index.html`, merges `.framework/public` + app `public/` dirs into the
   project `public/` (same-path collisions are a hard error), copies
   `_redirects` into `.assembled/src/` for `netlify dev`, and stages the
   project `spine.config.json` into `public/`.

`config/vite.config.ts` then builds with `root: .assembled/src`,
`publicDir: public/`, `build.outDir: dist/` — matching `publish = "dist"`.
Never edit `.assembled/`; it is regenerated freely.

## The `/api/*` URL space

Requests to `/api/*` are rewritten to `/.netlify/functions/:splat`:

- **Production:** the published `_redirects` file — sourced from
  `.framework/public/_redirects`, merged into `public/` at assemble time —
  carries `/api/* → /.netlify/functions/:splat 200`, plus
  `/spine.config.json` passthrough and the `/* → /index.html` fallback.
- **Dev:** the Vite proxy in `config/vite.config.ts` maps `/api/*` to
  `localhost:8888` with the same rewrite.

Because the SPA fallback is `/* → /index.html 200`, **any unmatched URL
returns HTTP 200 with HTML** — including typos under `/api/`. A probe that
gets HTML instead of JSON is hitting the SPA fallback, not a function.

## Environment variables in production

Set these in the Netlify site environment (not in `netlify.toml`).
The full annotated list is [Environment Variables](../reference/env-vars.md);

| Variable | Needed for |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | browser bundle (public by design) |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | all functions — service-role key is server-only, never `VITE_`-prefixed |
| `INTERNAL_INVOKE_SECRET` | trigger-dispatched pipelines — unset means `queued` rows that never run |
| `APP_BASE_URL` | invite links, auth redirects, `base_url` allowlist |
| `SCHEDULER_API_KEY` | key-gated `system-cron`/`trigger-scheduler` invocation |
| `SITE_URL` | CORS `Access-Control-Allow-Origin`; falls back to Netlify's auto-set `URL` |
| `RESEND_API_KEY`, `EMAIL_FROM` | outbound email (invites, notification stages) |
| `OPENAI_API_KEY` | AI stage types, agents, embeddings |
| `NETLIFY_ACCESS_TOKEN`, `NETLIFY_SITE_ID` | optional — push banned IPs to the edge firewall (security function skips silently without them) |

`SUPABASE_DB_PASSWORD` is **not** a function env var — it is used locally by
`npx spine-framework migrate` to connect to Postgres directly.

## Deploy checklist

- [ ] Supabase project exists; `SUPABASE_*` + `VITE_SUPABASE_*` vars set in Netlify.
- [ ] `INTERNAL_INVOKE_SECRET` generated (`openssl rand -hex 32`) if triggers are used; `APP_BASE_URL`/`SITE_URL` set to the production origin.
- [ ] Migrations applied: `npx spine-framework migrate` against the production DB (see [Migrations](migrations.md)).
- [ ] Deploy via git push or `netlify deploy --prod` — the build command runs `assemble` then `vite build` automatically.
- [ ] Post-deploy smoke: `/api/system?action=health` and `?action=manifest` answer; first registration grants `system_admin` (see [Install and first run](../guide/01-install-and-first-run.md)).
- [ ] If timers/triggers are used: `trigger-scheduler` ticks appear in function logs within a minute; a test record write produces a `trigger.fired` log row.

## Related

- [Migrations](migrations.md) · [Upgrade](upgrade.md) · [Troubleshooting](troubleshooting.md)
- [Environment Variables](../reference/env-vars.md) · [CLI Reference](../reference/cli.md)
- [Anatomy of an installed project](../guide/02-project-map.md) — sealed vs customer trees
