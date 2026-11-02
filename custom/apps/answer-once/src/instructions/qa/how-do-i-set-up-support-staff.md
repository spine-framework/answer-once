---
title: "How do I set up support staff"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: tutorial
source_files:
  - custom/apps/answer-once/seed/roles.json
  - custom/apps/answer-once/docs/install.md
---

## Q

How do I set up support staff?

## A

Staff are people on the `spine-system` account with the `support` or
`support_admin` role — created or invited through framework administration,
never via public signup. The first user to sign up on a fresh install becomes
`system_admin` automatically; they bootstrap everyone else. Customers self-
register at `/register`, which creates their account and makes them its
`member_admin`.
