---
title: "How do I upgrade the framework vs. the app"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: how-to
source_files:
  - custom/apps/answer-once/docs/install.md
  - custom/apps/answer-once/installer/index.mjs
---

## Q

How do I upgrade the framework vs. the app?

## A

They're two npm packages that upgrade independently:

```bash
npm i spine-framework@latest && npx spine-framework upgrade
npm i @spine-framework/answer-once@latest && npx answer-once upgrade
```

Both refuse to overwrite files you've modified locally — preview with
`--dry-run`, accept with `--force`. After upgrading, re-run `migrate` and
`seed-app answer-once --reconcile-owned-types`.
