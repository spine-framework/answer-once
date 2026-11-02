---
title: "What are the seeded agents, pipelines, and triggers"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/seed/ai-agents.json
  - custom/apps/answer-once/seed/pipelines.json
  - custom/apps/answer-once/seed/triggers.json
---

## Q

What are the seeded agents, pipelines, and triggers?

## A

Two AI agents — `ao_triage` (customer-facing, searches only published
KB) and `ao_case_analysis` (post-resolution analyst) — each with a prompt
config. Three pipelines: `ao_ticket_reply_notify` (staff external reply →
notify owner), `ao_auto_embed_on_publish`, and `ao_auto_revoke_on_unpublish`.
Seven triggers wire staff replies and the publish/unpublish embedding
lifecycle.
