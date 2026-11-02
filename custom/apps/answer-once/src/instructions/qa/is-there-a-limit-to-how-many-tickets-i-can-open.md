---
title: "Is there a limit to how many tickets I can open"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/manifest.json
  - custom/apps/answer-once/index.tsx
---

## Q

Is there a limit to how many tickets I can open?

## A

There are rate limits to keep the service healthy — on the order of 20
new tickets and 120 thread messages per hour per account. Normal support usage
won't come close to them. If you hit a limit, wait a bit and retry; the limit
resets on a rolling window.
