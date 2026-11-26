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
verified_against: eb8a2fe
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
  adjustments (CSP, optional services, port rules) — including what to
  do when `supabase start` fails on an unhealthy container (optional
  services can be disabled; a required service like `storage` just
  needs `supabase stop && supabase start` again — healthcheck flakes
  are a known Supabase CLI quirk, more common on 2.x). If a *different*
  container fails on every retry while its own logs read healthy, the
  CLI healthcheck is the flaky part — `supabase start
  --ignore-health-check` and probe Kong directly instead.
  Choose this only when the developer wants throwaway local data.

## Sequence

```bash
npm install spine-framework          # or: npm i ./spine-framework-<ver>.tgz
npx spine-framework init             # refuses if .framework/ already exists
```

`npm create spine-framework@latest <dir>` is the same sequence wrapped —
it scaffolds the directory and runs `init` inside it. If the project
arrived that way, start at step 1 below.

**Order matters on a local stack:** `supabase start` produces the keys —
write `.env` *from its output*, never before it runs. Local sequence:
`supabase init` → `supabase start` → then step 1. On macOS, the default
ports (54321–54329) sit inside the OS ephemeral range — if start fails on
port availability or unhealthy containers, move the published ports below
49152 in `supabase/config.toml`, mirror them in `.env`, and retry with
`--debug` (the guide covers both; failed containers' logs are reaped on
teardown, so debug first, not second).

1. **Write `.env`.** `cp .env.example .env`, then fill the required vars
   (`.framework/src/instructions/reference/env-vars.md`):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_BASE_URL`
   (`http://localhost:8888` in dev). On a hosted project set
   `SUPABASE_DB_PASSWORD`; on a local stack set `SUPABASE_DB_URL`
   (required — `migrate` refuses to derive a hosted host from a
   `127.0.0.1` URL) **and** `SUPABASE_DB_PASSWORD=postgres` — the
   password is what other direct-DB paths prefer. Always set
   `INTERNAL_INVOKE_SECRET` (`openssl rand -hex 32`) — required for
   trigger-dispatched pipelines and harmless otherwise; unset means
   queued executions that never run.

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
   npx spine-framework bootstrap --email <you@example.com> --password '<pick-one>' --write-env
   ```

   Creates the first `system_admin` + confirmed auth user and mints one
   `sk_` API key. Add `--write-env` to write it straight into `.env` as
   `SPINE_API_KEY` without printing it — the right move for agents,
   since the raw key is shown exactly once otherwise. Without the flag,
   copy it from the output immediately. Omit email/password for a
   DB-only person (the key still works). Send the key as `x-api-key:` on
   `/api/*`.

5. **Doctor:**

   ```bash
   npm run test                  # seeds the first test_runs row doctor checks
   npx spine-framework doctor
   ```

   Exit codes: **0 = healthy**, **2 = degraded** (warnings only — usable),
   **1 = unhealthy**. "Clean" is exit 0. On a brand-new project the
   `test_runs` check warns until a suite has run once — hence the
   `npm run test` first; rerun doctor after it.

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
