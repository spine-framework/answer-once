---
title: "How do embeddings stay fresh when articles change"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/seed/triggers.json
  - custom/apps/answer-once/seed/pipelines.json
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
---

## Q

How do embeddings stay fresh when articles change?

## A

Articles carry an `embedded_content_hash` stamped at publish; a mismatch
means the stored embeddings are stale. Publish triggers
(`ao_*_published_auto_embed*`) call the embed pipeline automatically, and the
matching revoke triggers pull embeddings when an article leaves `published`.
`reembed_article` exists for manual re-embedding after an edit.
