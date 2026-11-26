---
title: Join an existing project
audience: developers, agents
kind: guide
verified_against: eb8a2fe
verified_on: 2026-11-26
source_files:
  - .framework/cli/commands/doctor.ts
  - .framework/cli/commands/migrate.ts
  - .framework/cli/commands/upgrade.ts
  - .framework/src/instructions/guide/01-install-and-first-run.md
  - .framework/src/instructions/reference/env-vars.md
---

# Join an existing project

You're joining a Spine project that already exists — the repo is on your
machine and someone else set it up. This is the short version of
[Install and first run](01-install-and-first-run.md) for that case.

## 1. Clone and install

```bash
git clone <repo> && cd <repo>
npm install
npm run verify     # tree vs .spine-manifest.json — a clean clone matches
```

If `verify` fails on a fresh clone, the repo shipped a stale
`.spine-manifest.json` — flag it; don't regenerate it yourself (the fix
belongs upstream, in the committer's `npm run manifest`).

## 2. `.env` — which Supabase?

`cp .env.example .env`, then the one real decision — **which database
you're developing against**:

- **Shared dev project** (the common case) — get `SUPABASE_URL`, both
  `*_ANON_KEY`s, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD` from
  the team's secret store. Your changes share schema and data with the
  team — migrations you apply affect everyone.
- **Local Docker stack** — `supabase init && supabase start`; fill the
  printed values per guide/01's local table (`SUPABASE_DB_URL` required).
  Fully isolated; the project's migrations recreate the schema on
  `migrate`. Pick this for risky schema work or offline dev.

`.env` is never committed — if the repo has a `.env.example` entry you
don't have a value for, ask; don't guess. `INTERNAL_INVOKE_SECRET`
matters when triggers are in scope (unset = queued executions that never
run); match the team's value for the shared dev project.

## 3. Reconcile the schema

```bash
npx spine-framework migrations status   # local files vs the project's ledger
npx spine-framework migrate --dry-run   # what would apply
npx spine-framework migrate             # apply if pending (shared dev: coordinate first)
```

On a **shared dev project** pending migrations usually mean your checkout
is ahead of the DB (someone hasn't pushed their migrate) — coordinate
before applying: you might be applying a teammate's unfinished work. On a
**local stack**, always just migrate — it's yours.

## 4. Prove it works

```bash
npx spine-framework doctor   # env, files, DB reachability — must be clean
npm run dev:netlify          # site on :8888; wait for the ready banner
```

Then access: **humans** get an invite from an existing admin (Admin →
Access → Invites — see `tasks/onboard-client-staff.md`); **your agent**
gets a scoped `sk_` key from an admin (Admin → Configs → API Keys) as
`SPINE_API_KEY`. `npx spine-framework bootstrap` is *not* for joining —
it provisions the first admin on an empty install; on an existing project
it only mints another `*:*` key, which is more power than joining needs.

## 5. Orient before you build

- `AGENTS.md` — the framework block is the rules; the `## Environments`
  section below the end marker (if present) is *this project's* promotion
  ladder — read it before shipping anything.
- `custom/` — the project's code; `.framework/` is sealed.
- `custom/decisions/` — the project's decision records; read the ones
  that `applies_to` files you'll touch.

## Common wrong turns

- **Running `init`** — refuses on an existing `.framework/` anyway, but
  the mistake is thinking setup is needed: joining is env + migrate, not
  scaffold.
- **`npm audit fix`** — the pinned lock is the verified set; audit noise
  is tracked upstream.
- **Applying migrations to shared dev without asking** — schema is
  shared; `migrate` is a team event.
- **Editing `.env` while `dev:netlify` runs** — env is injected at
  function spawn; restart the dev server after env changes.
