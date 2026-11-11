---
title: "Answer Once — instruction book"
audience: developers, agents
kind: index
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - custom/apps/answer-once/manifest.json
  - custom/apps/answer-once/index.tsx
  - custom/apps/answer-once/installer/index.mjs
---

# Answer Once

> A person should not have to answer the same organizational question twice.

Two-sided customer-support app closing the loop: customer asks → KB hit?
answer instantly with citation → miss → human solves → answer is reviewed
and published as knowledge → next customer gets it automatically.

- **Mount:** `route_prefix: /answer-once` — custom renderer.
- **Surfaces:** `pages/customer/` (portal) + `pages/company/` (console).
- **Roles:** member, member_admin, support, support_admin, system_admin.
- **Install:** `npm create @spine-framework/answer-once` →
  `installer/index.mjs` (scaffold + migration + registration +
  scheduled-function section). Installs with an **empty KB** — knowledge
  is earned, not seeded.
- **Skills:** `ao_*` in `custom/.devin/skills/`.

## Doc map

| Area | File |
|---|---|
| Install | `tasks/install.md` |
| Ticket lifecycle | `tasks/ticket-lifecycle.md` |
| Ticketing types | `entities/ticketing.md` |
| Knowledge types | `entities/knowledge.md` |
| Custom functions | `reference/functions.md` |
| Q&A corpus | `qa/README.md` (42 files) |
| Decision records | `../../decisions/` — read before touching directive/KB/agent code |

## The capture rule

Editing this app requires updating these pages in the same change —
new function → `reference/functions.md`; new seeded type → entity page;
new route → doc map. Consequential choices (alternatives rejected,
invariants, workarounds) also get a record in `../../decisions/` —
`status: proposed`, `owner: package`; see the `decision-capture` skill.
