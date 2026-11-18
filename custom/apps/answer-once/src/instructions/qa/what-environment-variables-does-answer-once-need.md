---
title: "What environment variables does Answer Once need"
audience: developers, agents
kind: qa
verified_against: 4dea482
verified_on: 2026-11-17
suggested_kb_tag: tutorial
source_files:
  - custom/apps/answer-once/docs/install.md
---

## Q

What environment variables does Answer Once need?

## A

Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD` (migrations), plus the
`VITE_` variants for the frontend. `OPENAI_API_KEY` is required for live AI
triage and case analysis — the app installs without it, but the learning loop
won't run. `RESEND_API_KEY` and `EMAIL_FROM` are optional for invite and
reply-notification emails; without them invites fall back to copyable links and
email stages skip silently.
