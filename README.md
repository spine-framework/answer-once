# Answer Once

> A person should not have to answer the same organizational question twice.

Customer-support and knowledge-loop app built on
[Spine Framework](https://github.com/spine-framework/spine). Customer asks →
do we know? → yes: answer instantly with citation → no: human solves → the
answer becomes reviewed, published knowledge → the next customer gets it
automatically.

This repository is a **standalone deployable snapshot**: the Answer Once app
plus a frozen copy of the Spine Framework core. It deploys to Netlify with
Supabase (Postgres + Auth) as the database.

## Layout

| Path | Contents |
|---|---|
| `.framework/` | Spine Framework core — a managed snapshot; **do not edit** (integrity-checked by `.spine-manifest.json`) |
| `custom/apps/answer-once/` | The Answer Once app (pages, components, functions, seeds) |
| `custom/migrations/` | App database migrations (`062_*`, `063_*`) |
| `custom/tests/` | App test suite |
| `config/` | Vite/TypeScript/Tailwind config |
| `bin/`, `scripts/` | CLI (`spine-framework`) and build/verify scripts |
| `spine.config.json` | App registration, default role, branding |
| `netlify.toml` | Build + scheduled-function config |

## Run locally

```bash
cp .env.example .env   # Supabase project URL, anon key, service role key, DB password
npm install
npm run verify
npm run spine-framework -- migrate
npm run spine-framework -- seed-app answer-once
npm run verify:install
npm run dev:netlify    # http://localhost:8888
```

First visit: register at `/register` — the first registrant becomes
`system_admin`.

## Documentation

- `.framework/src/instructions/` — the Spine instruction book (install,
  concepts, tasks, CLI/API/env-var reference); also readable inside the admin
  UI via each page's **Instructions** button.
- `custom/apps/answer-once/docs/install.md` — full install procedure
  including Supabase project setup.

## Requirements

- Node.js 22+, npm 10+
- A [Supabase](https://supabase.com) project (URL + anon key + service role
  key + DB password)
- Netlify CLI for `npm run dev:netlify` (devDependency — `npm install`
  provides it; a Netlify account is only needed to deploy)

## Provenance

This repo is generated from the Spine monorepo by `export-standalone` — see
`.spine-export-manifest.json` for the exact source commit and per-file
digests. Changes flow from the source repo; do not hand-edit exported files.

To build your own Answer Once deployment instead of running this snapshot:

```bash
npm create @spine-framework/answer-once@latest my-support
```

## License

See [LICENSE.md](LICENSE.md) — Spine Framework / Answer Once Internal Use
License. Free for internal business use; commercial redistribution requires a
separate license (see spine-framework.com).
