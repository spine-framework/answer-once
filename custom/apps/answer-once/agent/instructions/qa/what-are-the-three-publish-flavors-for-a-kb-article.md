---
title: "What are the three publish "flavors" for a KB article"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
  - custom/apps/answer-once/seed/types.json
---

## Q

What are the three publish "flavors" for a KB article?

## A

Chosen once at publish time, and immutable afterward:

- **Private** — publishes in place inside the customer account that earned it.
- **Internal** — publishes and re-homes the article to the `spine-system`
  account: a support-only corpus, invisible to customers.
- **Shared** — mints a separate platform-scope `ao_kb_shared` record so every
  account's triage and KB page can retrieve it.

There's no private-to-public promotion after publish, by design — re-scope
means a new review.
