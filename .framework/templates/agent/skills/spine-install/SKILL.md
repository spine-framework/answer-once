---
name: spine-install
description: "Install Spine into a fresh project — the deterministic init → env → install → verify → migrate → bootstrap → doctor sequence an agent can run without a browser. For app-package installs use spine-install-app."
allowed-tools:
  - read
  - exec
  - write
  - edit
depends_on:
  files:
    - .framework/src/instructions/guide/01-install-and-first-run.md
    - .framework/src/instructions/reference/cli.md
    - .framework/src/instructions/reference/env-vars.md
    - .env.example
  commands:
    - "npm install"
    - "npm run dev:netlify"
    - "npm run verify"
    - "npx spine-framework bootstrap"
    - "npx spine-framework doctor"
    - "npx spine-framework init"
    - "npx spine-framework migrate"
---

You install Spine into an empty directory and bring it to a working,
bootstrapped project — the scriptable path. The full guide with options
and explanations is
`.framework/src/instructions/guide/01-install-and-first-run.md`; this
skill is the no-browser sequence.

> **`spine-install` vs `spine-install-app`:** this skill sets up a whole
> *project*; `spine-install-app` adds an app *package* to a project that
> already exists.

## When to invoke

- "Set up a new Spine project" / "install the framework here."
- CI/agent provisioning where no browser flow is available.

## The one decision

**Which Supabase?** Ask once, then proceed:

- **Hosted project** — the default. Needs the project's API URL, anon +
  service-role keys, and DB password (Dashboard → Settings → API Keys /
  Database).
- **Local Docker stack** — `supabase init && supabase start` inside the
  project; needs Docker running and the Supabase CLI installed. The
  guide lists the printed values to use and the three local-only
  adjustments (CSP, optional services, port rules) — including the fix
  when `supabase start` fails on an unhealthy optional container.
  Choose this only when the developer wants throwaway local data.

## Sequence

```bash
npm install spine-framework          # or: npm i ./spine-framework-<ver>.tgz
npx spine-framework init             # refuses if .framework/ already exists
```

`npm create spine-framework@latest <dir>` is the same sequence wrapped —
it scaffolds the directory and runs `init` inside it. If the project
arrived that way, start at step 1 below.

1. **Write `.env`.** `cp .env.example .env`, then fill the required vars
   (`.framework/src/instructions/reference/env-vars.md`):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`
   (hosted) or `SUPABASE_DB_URL` (local stack — required there),
   `APP_BASE_URL` (`http://localhost:8888` in dev). Add
   `INTERNAL_INVOKE_SECRET` (`openssl rand -hex 32`) when triggers are in
   scope — unset means queued executions that never run.

2. **Install + verify:**

   ```bash
   npm install
   npm run verify        # tree vs .spine-manifest.json — must be clean
   ```

   `npm audit` findings on the pinned set are expected — never
   `npm audit fix`.

3. **Migrate:**

   ```bash
   npx spine-framework migrate   # --dry-run first if you're unsure
   ```

4. **Bootstrap** (no browser — this is the agent path):

   ```bash
   npx spine-framework bootstrap --email <you@example.com> --password '<pick-one>'
   ```

   Creates the first `system_admin` + confirmed auth user and prints one
   `sk_` API key — **copy it now**, it's shown once. Omit email/password
   for a DB-only person (the key still works). For your own access,
   store the key as `SPINE_API_KEY` and send it as `x-api-key:` on
   `/api/*`.

5. **Doctor:**

   ```bash
   npx spine-framework doctor
   ```

   "Clean" means exit 0 — 0 healthy, 2 degraded (warnings only), 1
   unhealthy. On a brand-new project the `test_runs` check warns until a
   suite has run once: `npm run test` writes the first row, then rerun
   doctor.

6. **Run** (optional, needs the Netlify CLI — already a devDependency):

   ```bash
   npm run dev:netlify   # site on :8888; wait for the ready banner
   ```

   Ports 8888/3001 are fixed; check they're free first.

## Report

Project dir → Supabase target → migrate count applied → whether
bootstrap minted a key (never the key itself) → doctor verdict → dev URL.

## Rules

- Never `init` over an existing `.framework/` — that's `upgrade`'s job;
  stop and ask instead.
- `.env` is never committed and never printed — write it, don't echo it.
- If `migrate` fails on a hosted project, check `SUPABASE_DB_PASSWORD`
  (not the API keys) first — it's a direct Postgres connection.
- Email confirmation must be off in Supabase Auth for the browser
  register path; `bootstrap` doesn't care (it uses the service role).
