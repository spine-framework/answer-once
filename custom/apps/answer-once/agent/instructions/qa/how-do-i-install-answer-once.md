---
title: "How do I install Answer Once"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: tutorial
source_files:
  - custom/apps/answer-once/docs/install.md
  - custom/apps/answer-once/installer/index.mjs
  - custom/apps/answer-once/manifest.json
---

## Q

How do I install Answer Once?

## A

Use the npm installer:

```bash
npm create @spine-framework/answer-once@latest my-support
cd my-support
cp .env.example .env    # fill in your Supabase credentials
npm install
npm run verify
npm run spine-framework -- migrate
npm run spine-framework -- seed-app answer-once
npm run verify:install
npm run dev:netlify
```

You need Node 22+, a fresh Supabase project, and Netlify CLI. The installer
scaffolds the framework plus the app; `seed-app` installs configuration only.
