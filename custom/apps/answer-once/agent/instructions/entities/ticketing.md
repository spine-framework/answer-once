---
title: "Answer Once ticketing types"
audience: developers, agents
kind: entity
verified_against: bc8b7a2
verified_on: 2026-11-15
source_files:
  - custom/apps/answer-once/seed/types.json
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
---

## What this is for

The ticket half of the loop — customer asks, support answers.

## Why it exists

**Why it exists (5-whys):**

1. Support work arrives as unstructured customer questions — each needs a
   durable record with status, ownership, and history.
2. `ao_support_ticket` carries the case state; the conversation lives in
   `ao_ticket_thread` + `ao_ticket_message` so each post (customer ask, AI
   answer with citation, human reply) is individually auditable.
3. One ticket, one thread, many messages mirrors how support actually flows —
   and lets the answer-harvest step point at a specific resolution.
4. The thread binds via the framework's shared
   `UNIQUE (target_type, target_id, visibility)` rule — the app reuses the
   generic collaboration model instead of inventing its own.
5. **Root:** "ask once" needs a place where a question lives until resolved —
   and a record of how it was resolved, so the answer can become knowledge.

## Fields and settings

`ao_support_ticket` (kind `item`) — the ticket. `ao_ticket_thread`
(kind `thread`) — the conversation bound to it. `ao_ticket_message`
(kind `message`) — individual posts (customer question, AI answer with
citation, human reply).

## Minimal configuration

Seeded by `seed/types.json` (`conflict: "kind,slug"`,
`inject_app_id: false` — types are global).

## Full configuration

`seed/roles.json` adds `support`/`support_admin`; pipelines/triggers wire
triage and the journey function.

## Example

Customer posts an `ao_ticket_message`; triage checks `ao_kb_article`s;
on miss, support answers in the same `ao_ticket_thread`; the resolution
feeds the KB review loop.

## Core files

- `custom/apps/answer-once/seed/types.json`
- `custom/apps/answer-once/functions/custom_answeronce-journey.ts`
- `custom/apps/answer-once/pages/{customer,company}/`

## Agent notes

- Thread binding follows `UNIQUE (target_type, target_id, visibility)` —
  find-or-create (see core `runtime-collaboration.md`).
