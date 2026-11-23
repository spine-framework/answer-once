---
title: "How do notifications and email work"
audience: developers, agents
kind: qa
verified_against: 4c2f472
verified_on: 2026-11-22
suggested_kb_tag: tutorial
source_files:
  - custom/apps/answer-once/seed/pipelines.json
  - custom/apps/answer-once/seed/triggers.json
  - custom/apps/answer-once/docs/install.md
---

## Q

How do notifications and email work?

## A

The seed wires a `transactional-email` integration (Resend) and a
`ao_ticket_reply_notify` pipeline: when staff post an external reply, the
ticket owner gets an in-app notification plus an email. Sender credentials come
from `RESEND_API_KEY` and `EMAIL_FROM`; email bodies live in the integration
row's `config.templates`, so you can restyle them without code changes.
Recipients are configurable per stage — `owner`, `watchers`, `role:<slug>`, or
literal addresses.
