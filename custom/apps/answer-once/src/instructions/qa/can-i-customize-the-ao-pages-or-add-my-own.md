---
title: "Can I customize the AO pages or add my own"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: how-to
source_files:
  - custom/apps/answer-once/index.tsx
  - custom/apps/answer-once/manifest.json
---

## Q

Can I customize the AO pages or add my own?

## A

Yes — it's a custom-renderer app, so its pages/components live in
`custom/apps/answer-once/` and you own them. Follow the normal custom-app
rules: runtime record CRUD goes through `/api/admin-data` (the bundled app-local
`admin-data.ts` follows the same convention), secrets stay server-side, and app
upgrades will refuse to clobber your modifications unless you pass `--force`.
