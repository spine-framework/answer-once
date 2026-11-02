---
name: ao_ticket-lifecycle
description: "Exercise the Answer Once loop — customer ticket → triage → human resolve → KB publish → instant answer on re-ask."
allowed-tools:
  - exec
  - read
  - grep
---

You drive the **answer-once** ticket loop. Read
`custom/apps/answer-once/src/instructions/tasks/ticket-lifecycle.md`.

## Steps

1. Create `ao_support_ticket` + first `ao_ticket_message` via
   `/api/admin-data` (thread is find-or-create on
   target_type/target_id/visibility).
2. Triage via `custom_answeronce-journey`; on miss, reply as support.
3. Push resolution through KB review (`ao_change_marker` →
   `ao_kb_article` published).
4. Re-ask the same question — confirm a cited answer, no human ticket.

## Rules

- Record CRUD via `/api/admin-data` only.
- Never seed KB content — the loop must be earned.
