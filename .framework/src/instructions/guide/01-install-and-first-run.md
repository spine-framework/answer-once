---
title: Install and first run
audience: developers, agents
kind: guide
verified_against: d0c49d4
verified_on: 2026-10-30
source_files:
  - .framework/cli/commands/init.ts
  - .framework/cli/lib/project-files.ts
  - .framework/templates/project.json
  - .framework/templates/spine.config.neutral.json
  - .framework/cli/commands/migrate.ts
  - .framework/cli/commands/bootstrap.ts
  - .env.example
  - netlify.toml
  - scripts/dev-netlify.sh
  - scripts/netlify-dev-wrapper.sh
  - config/vite.config.ts
  - .framework/public/_redirects
  - .framework/src/App.tsx
  - .framework/src/pages/SetupPage.tsx
  - .framework/src/pages/auth/RegisterPage.tsx
  - .framework/functions/invites.ts
  - .framework/migrations/052_registration_security.sql
---

# Install and first run

Prerequisites: Node ≥ 22.13 and npm ≥ 10 (recorded in `.spine-manifest.json`
by init), a Supabase project, and (for local dev) the Netlify CLI — pinned as a
devDependency, so `npm install` puts it in `node_modules`.

## Step 1 — scaffold

```bash
npm install spine-framework
npx spine-framework init          # or: init <dir>
```

Tarball/pre-release installs work the same way: `npm i
./spine-framework-<ver>.tgz` — `init` keeps the `file:` spec in
`package.json` rather than overwriting it with a registry version.

`init` (`.framework/cli/commands/init.ts`) copies the framework-owned file set
declared by `.framework/templates/project.json` into the target directory:

- **`.framework/`** — `cli`, `functions`, `migrations`, `public`, `schemas`,
  `scripts`, `seeds`, `src`, `tests`, `docs`, `templates`, plus `index.html`
  and `README.md`.
- **`config/`** — `vite.config.ts`, the tsconfig family, `tailwind.config.cjs`,
  `postcss.config.cjs`, `components.json`.
- **Root files** — the shipped `scripts/*.sh` / `*.mts` / `verify-install.ts`
  set, `bin/`, `vitest.config.ts`, `.env.example`, `LICENSE.md`.
- **`custom/`** — the empty workspace `init` creates for your code:
  `custom/apps`, `custom/functions`, `custom/components`,
  `custom/migrations`, `custom/tests`.
- **Generated files** — `package.json` (your name, framework scripts, the
  framework's dependency set inlined, plus an exact `spine-framework` pin),
  `package-lock.json` (when the package ships the verified lock template),
  `.gitignore`, `netlify.toml`, a neutral `spine.config.json`, and the frozen
  `.spine-manifest.json` integrity manifest.
- **Agent assets** — `AGENTS.md` (the framework-owned rules block between the
  `spine-framework:begin/end` markers — refreshed on upgrade; keep your own
  notes outside the markers) and `.devin/skills/spine-*/` task skills, synced
  from `.framework/templates/agent/`. These are hashed into the manifest's
  `agent_files` map rather than `files`.

`init` is deliberately file-only: it does **not** run `npm install`, write
`.env`, or touch any database or network resource. It refuses to run into a
directory that already has `.framework/` — that is what
`npx spine-framework upgrade` is for.

## Step 2 — `.env`

```bash
cp .env.example .env
```

Required for a working install (`.env.example` has the full list):

| Variable | Used by |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | the browser app (`.framework/src/lib/supabase.ts`) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` | Netlify functions (service-role + user-scoped clients) |
| `SUPABASE_DB_PASSWORD` | `npx spine-framework migrate` — connects directly to `db.<project-ref>.supabase.co:5432` as `postgres` (`.framework/cli/commands/migrate.ts`) |
| `APP_BASE_URL` | invite links and auth redirects (`http://localhost:8888` in dev) |

Where to find them: the URL and both keys are on one page — **Supabase
Dashboard → Project Settings → API Keys** (older dashboards: Settings →
API / Data API); `SUPABASE_DB_PASSWORD` is under **Project Settings →
Database**. Current dashboards issue new-style keys: the **Publishable
key** (`sb_publishable_…`) is the anon key and a **Secret key**
(`sb_secret_…`) is the service-role key — set `*_ANON_KEY` /
`SUPABASE_SERVICE_ROLE_KEY` to them directly. Legacy `anon`/`service_role`
JWTs work identically (verified end-to-end on a hosted project:
`signInWithPassword`, `auth.admin.createUser`, and PostgREST all accept the
new formats).

Optional but worth knowing early: `RESEND_API_KEY` (invite/notification
email), `OPENAI_API_KEY` (AI stage types), `VITE_TURNSTILE_SITE_KEY` (bot
protection on auth pages), `SCHEDULER_API_KEY` (system-cron HTTP guard), and
`INTERNAL_INVOKE_SECRET` — **required for trigger-dispatched pipelines**: if it
is unset, triggers write a `queued` execution row but the pipeline runner is
never invoked (`.framework/functions/_shared/trigger-engine.ts`).

## Step 3 — install deps and verify

```bash
npm install
npm run verify     # scripts/verify-integrity.sh — checks the tree against .spine-manifest.json
```

Expect `npm audit` findings — the pinned dependency set (mostly the
`netlify-cli` devDependency tree) carries known advisories, and the count
jumps between the tarball-only install and the full post-init install. The
shipped `package-lock.json` template is the verified set: do **not** run
`npm audit fix`, which moves pinned versions the manifest was generated
against. Findings are tracked upstream, not per-project.

## Step 4 — migrate the database

```bash
npx spine-framework migrate
```

This applies every `.framework/migrations/*.sql` file (and anything in
`custom/migrations/`, unless `--framework-only`) in order, recording each in a
`_spine_migrations` table so reruns are idempotent (`--dry-run` shows pending
files without applying them). File numbering is non-contiguous — retired
migrations are removed from the package rather than renumbered, so gaps are
expected and only lexical order matters. The core migration seeds the `system_admin`
role, the `spine-core` and `admin` apps, the `spine-system` account, and the
core runtime types (`.framework/migrations/003_core_system_data.sql`,
`.framework/migrations/011_spine_system_account.sql`).

## Step 5 — run it

```bash
npm run dev:netlify
```

`dev:netlify` runs `npm run assemble` first (via `predev:netlify`) and then
`scripts/dev-netlify.sh`, which cleans stale processes and launches the pinned
`netlify dev`. Netlify serves the site on **http://localhost:8888** and starts
the Vite dev server on 3001 via `scripts/netlify-dev-wrapper.sh`.
**Wait for the "Local dev server ready" banner** — the first `dev:netlify`
run bundles ~80 functions and can take a couple of minutes before the banner
appears; this is normal, not a hang. Early requests during function bundling
can crash the dev server (noted in `scripts/dev-netlify.sh`).

Ports are **fixed**: `netlify dev` must bind 8888 and Vite 3001 — both are
set in manifest-protected files (`netlify.toml` `[dev]` port/targetPort,
`config/vite.config.ts`), and there is no supported alternate-port
configuration. Moving only one side breaks the `/api` proxy and can
silently cross-connect two Spine projects on the same machine. Check the
ports are free first (`lsof -i :8888 -i :3001`): `dev-netlify.sh` cleans up
stale processes it owns but will not kill an unrelated server holding the
port — a second Spine project's dev stack is the usual culprit; stop that
one yourself.

Ignore `Failed to fetch AI Gateway token … Unauthorized` in `netlify dev`
output — that is the Netlify CLI's own AI feature probing your Netlify
account, unrelated to Spine.

Two URL spaces matter:

- `/api/*` → `/.netlify/functions/:splat`. In dev this is the Vite proxy to
  `localhost:8888` (`config/vite.config.ts`); in production it is the
  `_redirects` rule in `.framework/public/_redirects`.
- Everything else → the React SPA.

`npm run dev` alone starts *only* Vite on 3001 — fine for frontend work, but
`/api/*` calls still proxy to 8888, so functions need `netlify dev` running.

## First admin — browser-free bootstrap (recommended for automation)

```bash
npx spine-framework bootstrap --email you@example.com --password '<pick-one>'
```

This is the scriptable path (`S-002`): it creates the first `system_admin`
person bound to the `spine-system` account — the same row shape the
`handle_new_auth_user` trigger writes on registration — creates a confirmed
auth user through `auth.admin.createUser(email_confirm: true)`, and mints a
`sk_` API key, all without a browser. The raw key is printed **once**; only
its PBKDF2 hash is stored. `--scope <scope>` (repeatable) narrows the key —
the default `*:*` resolves to the `system_admin` role on the machine
principal. Omit `--email`/`--password` and the person record is created
DB-only (no UI login; the minted key still works for `x-api-key` callers).
The command is idempotent: when a `system_admin` already exists in
`spine-system` it skips person creation and just mints another key
(`.framework/cli/commands/bootstrap.ts`).

## First login — what actually happens

Alternatively, register in the browser. The real flow, as the code
implements it:

1. An unauthenticated visitor is redirected to `/login`
   (`.framework/src/App.tsx`). If `VITE_SETUP_MODE=true` is set, the `/` route
   instead shows a static `SetupPage` listing the same steps as this page
   (`.framework/src/pages/SetupPage.tsx`).
2. Go to `/register` and create an account. **The first user to register gets
   `system_admin`**: the `handle_new_auth_user` database trigger detects an
   empty `people` table and binds the new person to the `spine-system` account
   with the `system_admin` role
   (`.framework/migrations/052_registration_security.sql`). If the seeds are
   missing, registration raises instead of creating a rootless user.
3. Non-first, non-invited signups get **no account and no role** — placement
   happens when `complete-registration` runs the server-side RPC
   (`.framework/functions/invites.ts`). An authenticated user without an
   account is routed to `/register?resume=1` until placement finishes, never
   to a 404 (`.framework/src/App.tsx`).
4. After login, a `system_admin` lands on `/spine-framework/admin` — the
   schema-driven admin app from `.framework/src/apps/admin/index.tsx`. Other
   users land on the first app their role can see, or `NoAppPage` when nothing
   is routable.

## Giving your agent access

The verified path for letting an agent (or any machine caller) reach the
runtime API:

1. **Bootstrap an admin + key** — one step, no browser: `npx
   spine-framework bootstrap` (see "First admin" above) both creates the
   `system_admin` and prints a `sk_` key. The browser alternative: register
   at `/register` (first user becomes `system_admin`), then create a scoped
   key under **Admin → Configs → API Keys**. Either way the raw key is shown
   **once** — copy it immediately (`.framework/functions/api-keys.ts`).
2. **Give the key to the agent** as the environment variable `SPINE_API_KEY`.
   Agents send `x-api-key: sk_…` on `/api/*` requests; the header resolves to
   a machine principal carrying the key's scopes and account binding
   (`.framework/functions/_shared/principal.ts`). Turnstile is not in this
   path — bot protection only guards the human auth pages.

**Caveat:** for the browser path, Supabase **email confirmation must be
off** in the project (Auth → Providers), or the first registrant cannot sign
in without access to a real inbox. `bootstrap` is unaffected — it creates
the auth user with `email_confirm: true` through the service role.

## Gaps

- **`npx spine-framework dev` runs the same flow as the package scripts** —
  `scripts/assemble.sh`, then Vite via `config/vite.config.ts` (`--netlify`
  for the full `netlify dev` stack on :8888). `npm run dev` /
  `npm run dev:netlify` remain the canonical entry points.
- **`bootstrap` covers first-run provisioning only.** Subsequent admins are
  added through the invite flow in the admin app (or another `bootstrap`
  run, which skips person creation and only mints a new key).
- **Timers only tick under the Netlify scheduler.** `trigger-scheduler` is a
  scheduled function (`* * * * *` in `netlify.toml`); pipelines triggered by
  timers do not run without it, and trigger dispatch additionally needs
  `INTERNAL_INVOKE_SECRET` (see Step 2).
