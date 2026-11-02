---
title: "Ticket lifecycle & KB loop"
audience: developers, agents
kind: task
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
  - custom/apps/answer-once/functions/custom_answeronce-autoresolve-cron.ts
---

## Goal

Exercise the loop the app exists for: ask → answer-once → publish.

## Steps

1. **Ask** — customer portal posts an `ao_ticket_message` on an
   `ao_support_ticket` (`/api/admin-data`).
2. **Triage** — `custom_answeronce-journey` checks `ao_kb_article`s;
   hit → instant answer with citation; miss → ticket opens for support.
3. **Resolve** — company console replies in `ao_ticket_thread`.
4. **Publish** — resolution flows through KB review (`ao_change_marker`)
   into a published `ao_kb_article`.
5. **Verify the loop** — re-ask the same question: it now answers from
   the article, not a human. `custom_answeronce-autoresolve-cron` is the
   scheduled auto-resolve pass.

## Verify

A second identical question produces a cited answer without opening a
human ticket.

## Common mistakes

- Seeding KB articles to "test" — violates the earned-knowledge contract;
  drive a real ticket through instead.
- Threads created twice — find-or-create on
  `(target_type, target_id, visibility)`.
