---
title: "How does the AI triage actually decide to answer vs. escalate"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
  - custom/apps/answer-once/seed/ai-agents.json
  - custom/apps/answer-once/seed/prompt-configs.json
---

## Q

How does the AI triage actually decide to answer vs. escalate?

## A

On ticket creation the journey function binds an external thread to the
`ao_triage` agent, which searches the account's published `ao_kb_article`s plus
platform-shared knowledge via embeddings. A confident retrieval posts a cited
answer and parks the ticket in `pending_resolution`; a miss sets
`human_assigned`. Suspected prompt-injection content escalates straight to a
human — the app seeds `security.prompt_injection: block`.
