---
title: "What is "pending resolution" and why did my ticket resolve itself"
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

What is "pending resolution" and why did my ticket resolve itself?

## A

When the AI posts a confident answer, the ticket enters a
pending-resolution window rather than closing immediately. If there's no
follow-up within 72 hours, a scheduled pass resolves it automatically with a
courtesy message. If you reply before then, the timer resets and the ticket
goes back to a human or to triage as needed.
