---
title: "How do tickets, threads, and messages relate"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/seed/types.json
---

## Q

How do tickets, threads, and messages relate?

## A

A ticket is an `ao_support_ticket` item. Conversation lives in an
`ao_ticket_thread` bound to it (find-or-create on
`(target_type, target_id, visibility)` — external for customer-visible, plus
internal threads for triage/analysis), and each post is an `ao_ticket_message`.
Your question, the AI's cited answer, and staff replies are all messages on the
ticket's external thread.
