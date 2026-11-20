---
title: "What does `verify:install` check"
audience: developers, agents
kind: qa
verified_against: 6ef8265
verified_on: 2026-11-20
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/docs/install.md
  - custom/apps/answer-once/installer/index.mjs
  - custom/apps/answer-once/manifest.json
---

## Q

What does `verify:install` check?

## A

That every shipped migration applied, each seeded type has a generated
`validation_schema`, the app's `config.knowledge` envelope matches the
manifest, no `ao_*` runtime records exist (virgin product state), `answer-once`
is the only non-builtin app, the OpenAI integration references its key via env
var (never a materialized secret), and there are no orphaned `auth.users`. Run
it before the first signup.
