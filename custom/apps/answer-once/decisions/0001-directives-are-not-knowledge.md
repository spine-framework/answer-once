---
id: answer-once:0001-directives-are-not-knowledge
title: Directives are admin-authored action records, not retrievable knowledge
status: accepted
kind: invariant
owner: package
since: 0.5.4
until: null
supersedes: null
superseded_by: null
links: []
applies_to:
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
  - custom/apps/answer-once/pages/company/DirectivesPage.tsx
enforced_by:
  - .framework/tests/unit/apply-directive.test.ts
  - .framework/tests/unit/linked-directives.test.ts
evidence:
  - { kind: doc, ref: AGENTS.md, label: source }
provenance: reconstructed
---

## Context

Answer Once has two platform-authored surfaces that look similar but are
governed differently: `ao_kb_article` items (retrievable knowledge) and
`ao_triage_directive` items (admin-authored action records).

## Decision

Directives are never merged into the knowledge base and never produced by
customer input. The model may only apply a `directive_id` surfaced for the
current message (episode-scoped `matched_directive_ids` rejects invented
ids), and `executeApplyDirective` runs the record's structured `actions`
verbatim.

## Alternatives rejected

- Storing directives as KB articles with a `kind` column — collapses the
  trust boundary: anything retrievable becomes behaviour-authoring, and
  customer-suggested KB edits could smuggle in actions.
- Letting the model propose directive ids from free text — prompt injection
  becomes remote control.

## Consequences

- `config.knowledge.platform.sources` (what agents may read) and
  `platform.actions` (what may execute) are separate gates; a type is never
  added to `actions` just to make it readable.
- Tenant opt-in via `ao_directive_subscription` gates shared directives
  above the `annotate` tier.
