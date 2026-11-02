---
title: "Answer Once functions"
audience: developers, agents
kind: reference
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
  - custom/apps/answer-once/functions/custom_answeronce-autoresolve-cron.ts
  - custom/apps/answer-once/installer/index.mjs
---

# Answer Once functions

| Function | Purpose |
|---|---|
| `custom_answeronce-journey` | Orchestrates the ask→triage→human→publish loop. |
| `custom_answeronce-autoresolve-cron` | Scheduled auto-resolve pass (registers a `custom_*` scheduled section in `netlify.toml` at install). |

`functions/admin-data.ts` — app-local copy alongside the generic CRUD
convention; ordinary record CRUD in app code still uses `/api/admin-data`.

`installer/index.mjs` — the app's npm-create installer (not a runtime
function): scaffolds files, migration, registration, scheduled section,
install record.

## Agent notes

- Triage needs `OPENAI_API_KEY` for live AI paths.
- Record CRUD stays on `/api/admin-data` — these functions orchestrate,
  they don't wrap records.
