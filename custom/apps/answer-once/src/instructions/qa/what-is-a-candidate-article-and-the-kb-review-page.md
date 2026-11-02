---
title: "What is a "candidate" article and the KB review page"
audience: developers, agents
kind: qa
verified_against: b3b3ae0
verified_on: 2026-11-01
suggested_kb_tag: faq
source_files:
  - custom/apps/answer-once/seed/types.json
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
---

## Q

What is a "candidate" article and the KB review page?

## A

After a ticket resolves, case analysis drafts an `ao_kb_article` in
`candidate` status with provenance back to the source ticket. The company-side
**KB Review** page is where staff inspect those candidates — validation
warnings (e.g., source resolved? generalizable? has a resolution message?) are
shown, the reviewer edits and acknowledges, then publishes with a flavor.
`ao_change_marker` records track the review/publication state along the way.
