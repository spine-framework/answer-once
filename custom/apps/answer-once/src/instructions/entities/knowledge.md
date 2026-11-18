---
title: "Answer Once knowledge types"
audience: developers, agents
kind: entity
verified_against: bc8b7a2
verified_on: 2026-11-15
source_files:
  - custom/apps/answer-once/seed/types.json
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
---

## What this is for

The "answered once" half — knowledge earned from real support work.

## Why it exists

**Why it exists (5-whys):**

1. A support org answers the same questions repeatedly — each repeat costs a
   human reply, so an answer must be captured once and reused.
2. `ao_kb_article` stores the published answer apart from the ticket it came
   from — tickets are private conversations; articles are curated, citable
   knowledge.
3. `ao_change_marker` exists because an answer is not knowledge until a human
   reviews it — the marker tracks draft → review → publish so instant answers
   only cite vetted content.
4. `ao_kb_shared` separates cross-account knowledge from account-private rows —
   visibility is a data boundary, not a view filter.
5. **Root:** the app's promise is "no question answered twice" — that requires
   an owned knowledge surface fed by real resolutions, which is also why the
   KB ships empty: seeded filler would fake the very thing being proved.

## Fields and settings

`ao_kb_article` (kind `item`) — the published answer. `ao_kb_shared`
(kind `item`) — cross-account/shared knowledge surface. `ao_change_marker`
(kind `item`) — review/publication state markers so a solved ticket's
answer becomes reviewed, citable knowledge.

## Minimal configuration

Seeded via `seed/types.json`; the KB starts **empty** on install —
no seeded articles.

## Full configuration

Company-side review UI under `pages/company/kb*` drives
draft → review → publish.

## Example

Human resolution → `ao_change_marker` review → `ao_kb_article` published →
next customer's matching question answers instantly with citation.

## Core files

- `custom/apps/answer-once/seed/types.json`
- `custom/apps/answer-once/functions/custom_answeronce-journey.ts`
- `custom/apps/answer-once/pages/company/`

## Agent notes

- Respect the empty-KB contract — never seed filler articles; the app's
  value proposition depends on knowledge being earned.
