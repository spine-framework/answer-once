---
title: "What record types does Answer Once define"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/seed/types.json
---

## Q

What record types does Answer Once define?

## A

Six `ao_*` types, all `item`/`thread`/`message` kinds: `ao_support_ticket`,
`ao_ticket_thread`, `ao_ticket_message`, `ao_kb_article` (account scope), plus
`ao_kb_shared` and `ao_change_marker` (platform scope). The `ao_source_ticket`
link type records provenance from an article back to its source ticket. Types
are seeded globally (`conflict: kind,slug`) — they're shared infrastructure,
not per-app copies.
