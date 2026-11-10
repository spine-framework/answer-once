---
name: ao_install
description: "Install Answer Once into a fresh Spine project — run its npm-create installer, configure env, migrate, seed, verify."
allowed-tools:
  - exec
  - read
  - grep
---

You install the **answer-once** app. Read
`custom/apps/answer-once/src/instructions/tasks/install.md` first.

## Steps

1. `npm create @spine-framework/answer-once@latest <dir>` — or maintainer
   path `npx tsx scripts/export-standalone.ts --app answer-once --output <dir>`.
2. `.env` for a **virgin** Supabase project (empty public + auth.users).
3. `npm install && npm run verify` → `migrate` →
   `seed-app answer-once` → `verify:install -- --app answer-once` → `dev:netlify`.

## Rules

- Never reuse a non-empty Supabase project.
- The KB starts empty — do not seed articles.
- `OPENAI_API_KEY` required for live triage.
