---
title: "Answer Once knowledge types"
audience: developers, agents
kind: entity
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - custom/apps/answer-once/seed/types.json
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
---

## What this is for

The "answered once" half — knowledge earned from real support work.

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
