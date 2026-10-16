# Answer Once — Standalone Install

How to install the Spine Framework + Answer Once app into a virgin project directory and Supabase database. The install creates **configuration only** — no tickets, no KB articles, no CIL data. Knowledge is earned through real support work.

## Prerequisites

- Node 22+, npm 10+
- A **brand-new Supabase project** (virgin `public` schema AND empty `auth.users`). A new project needs no purge — do not reuse the spine-ia dev project or the demo project.
- `OPENAI_API_KEY` for live AI triage/case-analysis (the app installs without it, but the learning journey will not)
- Netlify CLI for local dev (`netlify dev` via `npm run dev:netlify`)

## 1. Export the standalone

From the monorepo:

```bash
cd ~/CascadeProjects/spine-ia
npx tsx scripts/export-standalone.ts --app answer-once --output ~/CascadeProjects/answer-once
```

The destination must be empty or nonexistent. Answer Once is vendored into `custom/apps/answer-once` — do not run `install-app` for it (that command is for npm-published apps). The export writes `.spine-export-manifest.json` recording the source commit, dirty state, file hashes, and migration inventory.

## 2. Configure `.env`

Copy `.env.example` and fill in for the **new** project — do not copy an existing `.env`:

```bash
SUPABASE_URL=https://<new-project-ref>.supabase.co
SUPABASE_DB_PASSWORD=            # direct postgres password — migrate aborts without it
SUPABASE_SERVICE_ROLE_KEY=       # verify-install + admin functions
SUPABASE_ANON_KEY=               # backend principal/auth paths
VITE_SUPABASE_URL=https://<new-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=          # frontend
DB_SCHEMA=public
APP_BASE_URL=http://localhost:8888
SITE_URL=http://localhost:8888
VITE_ENVIRONMENT=development
OPENAI_API_KEY=sk-...            # required for the AI journey
```

Also configure in Supabase Dashboard → Authentication → URL Configuration: Site URL `http://localhost:8888` and redirect URLs covering `/auth/**`. Decide the email-confirmation policy before registering test users.

## 3. Install + migrate + seed

```bash
cd ~/CascadeProjects/answer-once
npm install
npm run verify                                # frozen framework integrity
npm run spine-framework -- migrate            # every shipped migration, 0 skipped on virgin DB
npm run spine-framework -- seed-app answer-once
```

`seed-app` materializes **configuration**: the app registration, roles (`member`, `member_admin`, `support`, `support_admin` — `system_admin` comes from the framework), the five `ao_*` types + generated validation schemas, the `ao_source_ticket` link type, the two AI agents, and the two prompt configs. It creates no tickets, threads, messages, KB articles, or CIL data.

Sanity check: if `migrate` reports `0 applied, N skipped`, `.env` points at a database that already has `_spine_migrations` — check `SUPABASE_URL`.

## 4. Verify

```bash
npm run verify:install -- --app answer-once \
  --expect-empty-people --expect-empty-runtime \
  --expected-project-ref <new-project-ref>
```

Run this **before the first signup**. Beyond the generic contract it asserts:

- Every migration filename in `.spine-export-manifest.json` was applied
- Each seeded type has a generated `validation_schema`
- `apps.config.knowledge` matches the manifest envelope (account `ao_*`, platform `ao_kb_shared`)
- No runtime records exist for any `ao_*` type (virgin product state)
- `answer-once` is the only non-builtin app installed
- The `openai` integration references `OPENAI_API_KEY` via env-var (never a materialized secret)
- No orphaned `auth.users` (stale auth users with no `people` row cause the post-purge `Loading…` failure)

(`--expect-empty-accounts` is never valid: `spine-system` is seeded by migration.)

## 5. Assemble + run

```bash
npm run typecheck
npm run typecheck:functions   # needs a prior assemble
npm run build
npm run dev:netlify           # http://localhost:8888 — predev:netlify reassembles
```

`npm run dev` starts Vite only — Netlify functions will not run. If port 8888/3001 is taken by another running project, coordinate ports before starting.

## First signups and roles

- **First user to sign up** → `system_admin` on `spine-system` automatically (framework bootstrap).
- **Company staff** (`support_admin`, `support`) is created/invited through framework administration on `spine-system` — never self-selected via public registration.
- **Customer signups** via `/register` → new child account + `member_admin`. Invite further customer users through the app's Team page (`member`).

Personas: `system_admin`, `support_admin`, `support` (company, on spine-system); `member_admin`, `member` (per-customer accounts).

## Scheduled autoresolve

The export's `netlify.toml` declares `custom_answeronce-autoresolve-cron` on a daily UTC schedule (`0 0 * * *`). It sweeps `pending_resolution` tickets older than 72h across accounts and resolves them with a courtesy message. Netlify blocks public HTTP on scheduled functions in production; locally it runs via `netlify dev`. No auth headers are needed — the function builds an internal system principal.

## What this install deliberately does NOT do

- No KB articles, embeddings, tickets, or CIL data are seeded — ever. The knowledge base starts empty.
- No CIL service, project, or credentials are required at runtime.
- No sibling apps (demo, portal, cortex, workbench) are shipped or installed.
- No manual SQL is part of the procedure — a repair step means an upstream defect, not a workaround to document.

## Purging an existing project for a re-test

Only needed if reusing a project. Wiping `public` is **not sufficient**: `auth.users` survives and orphaned auth users produce `Person lookup error: Cannot coerce the result to a single JSON object` → HTTP 500 on every request. Also clear browser sessions (localStorage JWTs for deleted users fail the same way). To fully reset: wipe `public` AND delete all `auth.users`, then clear browser storage.

## Known transient behaviors

- ~~**"Account context required" 500s right after registration.**~~ Fixed — `resolveHumanPrincipal` no longer caches principals whose `people` row is missing both `account_id` and `role_id`, so mid-registration requests re-resolve and pick up placement as soon as `complete-registration` commits.
- **Missing bootstrap rows at signup** raises an explicit exception (migration 052 behavior) — do not sign up between `migrate` and `seed-app` completing.

## Acceptance smoke test

1. `/register` → first user → `system_admin` on `spine-system`.
2. Invite `support_admin` + `support` staff via framework admin.
3. Isolated browser → `/register` → customer A → `member_admin` on a new child account; invite a `member`.
4. Register customer B — A's tickets/private KB must be invisible to B.
5. Customer asks an unanswered question → AI escalates (empty KB must never invent an answer).
6. Support resolves it → run case analysis → review + publish the knowledge candidate.
7. A repeat/paraphrased question is answered citing the learned article.
8. Another unsupported question still escalates.
