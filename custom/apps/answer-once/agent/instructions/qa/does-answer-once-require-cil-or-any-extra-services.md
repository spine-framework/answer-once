---
title: "Does Answer Once require CIL or any extra services"
audience: developers, agents
kind: qa
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/docs/install.md
---

## Q

Does Answer Once require CIL or any extra services?

## A

No. The standalone install needs only Supabase, Netlify, and (for live
AI) OpenAI. CIL was the framework maintainer's internal code-intelligence
tooling — it was never a product dependency and has since been retired
(migration 079), so nothing CIL-related exists at runtime.
