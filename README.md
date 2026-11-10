# Answer Once

> A person should not have to answer the same organizational question twice.

Customer-support and knowledge-loop app built on
[Spine Framework](https://github.com/spine-framework/spine). Customer asks →
do we know? → yes: answer instantly with citation → no: human solves → the
answer becomes reviewed, published knowledge → the next customer gets it
automatically.

The stack: React + Vite frontend, Netlify Functions API layer, Supabase
(Postgres + Auth) database.

## Install

### New deployment (recommended)

```bash
npm create @spine-framework/answer-once@latest my-support
cd my-support
```

This scaffolds a fresh project — the framework file set plus the Answer Once
app in `custom/apps/answer-once/` — equivalent to this repository's tree. It
does not run `npm install` or touch a database; finish setup yourself:

```bash
cp .env.example .env     # fill in your Supabase project credentials (see below)
npm install
npm run verify
npm run spine-framework -- migrate
npm run spine-framework -- seed-app answer-once
npm run verify:install -- --app answer-once
npm run dev:netlify      # http://localhost:8888
```

Required `.env` values for a working install:

| Variable | Used by |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | the browser app |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | functions + CLI |
| `SUPABASE_DB_PASSWORD` | `migrate` (direct Postgres) |
| `APP_BASE_URL` | invite links and auth redirects (`http://localhost:8888` in dev) |
| `OPENAI_API_KEY` | AI triage/case-analysis (optional — the app installs without it) |
| `RESEND_API_KEY`, `EMAIL_FROM` | optional — invite + ticket-reply emails via Resend |

The install starts with an **empty knowledge base** — no seeded articles.
Knowledge is earned through real support work (escalate → resolve → analyze →
publish → reuse). Full procedure including Supabase dashboard setup:
[`custom/apps/answer-once/docs/install.md`](custom/apps/answer-once/docs/install.md).

### Install into an existing Spine project

```bash
npm i @spine-framework/answer-once
npx answer-once install
npm run spine-framework -- migrate
npm run spine-framework -- seed-app answer-once
```

Requires `spine-framework` `>=0.4.0 <0.6.0`.

### First signups and roles

- **First user to sign up** at `/register` → `system_admin` on `spine-system`
  automatically.
- **Company staff** (`support_admin`, `support`) is invited through framework
  administration — never self-selected via public registration.
- **Customers** register via `/register` → new child account + `member_admin`;
  further customer users are invited through the app's Team page (`member`).

### Upgrading

Framework and app upgrade independently:

```bash
npm i spine-framework@latest && npx spine-framework upgrade
npm i @spine-framework/answer-once@latest && npx answer-once upgrade
```

Both commands refuse to overwrite locally modified files (`--dry-run` to
preview, `--force` to accept). Run `migrate` (and `seed-app answer-once
--reconcile-owned-types` for the app) afterwards.

## About this repository

This repo is a **standalone deployable snapshot** — the Answer Once app plus a
frozen copy of the Spine Framework core, generated from the Spine monorepo by
`export-standalone`. See `.spine-export-manifest.json` for the exact source
commit and per-file digests. Changes flow from the source repo; do not
hand-edit exported files.

| Path | Contents |
|---|---|
| `.framework/` | Spine Framework core — managed snapshot; **do not edit** (integrity-checked by `.spine-manifest.json`) |
| `custom/apps/answer-once/` | The Answer Once app (pages, components, functions, seeds) |
| `custom/migrations/` | App database migrations (`062_*`, `063_*`) |
| `custom/tests/` | App test suite |
| `config/` | Vite/TypeScript/Tailwind config |
| `bin/`, `scripts/` | CLI (`spine-framework`) and build/verify scripts |
| `spine.config.json` | App registration, default role, branding |
| `netlify.toml` | Build + scheduled-function config |

To run **this repo** directly: same steps as above minus `npm create` —
`.env`, `npm install`, `verify`, `migrate`, `seed-app answer-once`,
`verify:install`, `dev:netlify`.

## Documentation

- `.framework/src/instructions/` — the Spine instruction book (install,
  concepts, tasks, CLI/API/env-var reference); also readable inside the admin
  UI via each page's **Instructions** button.
- `custom/apps/answer-once/docs/install.md` — full install procedure
  including Supabase project setup, email, roles, and the acceptance smoke test.

## Requirements

- Node.js 22+, npm 10+
- A [Supabase](https://supabase.com) project (URL + anon key + service role
  key + DB password)
- Netlify CLI for `npm run dev:netlify` (devDependency — `npm install`
  provides it; a Netlify account is only needed to deploy)

## License

See [LICENSE.md](LICENSE.md) — Answer Once Perpetual License. Unpaid installs
are licensed for evaluation, testing, and due diligence only; production use
requires a purchased license (see answer-once.com/license.html).
