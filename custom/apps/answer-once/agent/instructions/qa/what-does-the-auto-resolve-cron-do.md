---
title: "What does the auto-resolve cron do"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/functions/custom_answeronce-autoresolve-cron.ts
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
---

## Q

What does the auto-resolve cron do?

## A

`custom_answeronce-autoresolve-cron` runs daily (UTC) and sweeps tickets
that have sat in `pending_resolution` for over 72 hours — i.e., the AI answered
confidently and nobody objected. It resolves them with a courtesy message. In
production Netlify runs it on schedule; locally it runs under `netlify dev`.
