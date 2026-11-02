---
title: "Install Answer Once"
audience: developers, agents
kind: task
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - custom/apps/answer-once/installer/index.mjs
  - custom/apps/answer-once/docs/install.md
  - custom/apps/answer-once/package.json
---

## Goal

Install Answer Once into a fresh Spine project + virgin Supabase project.

## Steps

```bash
npm create @spine-framework/answer-once@latest <dir>
cd <dir> && cp .env.example .env   # new Supabase project's creds
npm install && npm run verify
npm run spine-framework -- migrate
npm run spine-framework -- seed-app answer-once
npm run verify:install
npm run dev:netlify
```

`installer/index.mjs` is the app's own installer (framework init → app
files → `custom/migrations/062_*` → registration → scheduled-function
section → `.spine/apps/answer-once.json` record). Maintainer path:
`npx tsx scripts/export-standalone.ts --app answer-once --output <dir>`.

## Verify

`verify:install` passes; login → `/answer-once` shows empty KB + working
ticket create.

## Common mistakes

- Reusing a non-empty Supabase project — needs virgin `public`/`auth.users`.
- Expecting seeded KB content — install creates configuration only.
- `OPENAI_API_KEY` missing → app installs but live triage/case-analysis
  won't run.
