---
title: "Does Answer Once come with a pre-loaded knowledge base"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/docs/install.md
  - custom/apps/answer-once/seed/types.json
---

## Q

Does Answer Once come with a pre-loaded knowledge base?

## A

No — deliberately. The install creates **zero** KB articles, tickets, or
embeddings. Knowledge is earned through real support work: tickets resolve,
resolutions are reviewed, and articles publish. An install that ships "sample"
knowledge would be auto-answering customers with unearned content, which is
exactly the failure mode the product exists to prevent.
