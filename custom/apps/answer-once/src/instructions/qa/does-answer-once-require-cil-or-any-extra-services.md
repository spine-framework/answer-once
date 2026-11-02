---
title: "Does Answer Once require CIL or any extra services"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/docs/install.md
---

## Q

Does Answer Once require CIL or any extra services?

## A

No. The standalone install needs only Supabase, Netlify, and (for live
AI) OpenAI. No CIL service, project, or credentials are involved at runtime —
CIL is the development-side code intelligence layer in the framework
maintainer's monorepo, not a product dependency.
