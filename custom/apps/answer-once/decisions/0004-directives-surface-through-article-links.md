---
id: answer-once:0004-directives-surface-through-article-links
title: Directives surface through article→directive links; semantic recall is bootstrap scaffolding
status: accepted
kind: decision
owner: package
since: 0.7.0-rc.1
until: null
supersedes: null
superseded_by: null
links:
  - answer-once:0001-directives-are-not-knowledge
applies_to:
  - .framework/functions/_shared/agent-runner.ts
  - custom/apps/answer-once/pages/company/DirectivesPage.tsx
  - custom/apps/answer-once/seed/link-types.json
  - custom/apps/answer-once/seed/prompt-configs.json
  - docs/plans/answer-once-directive-links.md
enforced_by:
  - .framework/tests/unit/linked-directives.test.ts
evidence:
  - { kind: doc, ref: docs/plans/answer-once-directive-links.md, label: source }
  - { kind: commit, ref: a812c8e, label: source }
  - { kind: audit, ref: "2026-11-20 AO prod (civwbyzxmnxxtaokxzxq): 0 ao_article_directive links; all directive matches provenance 'recall'; link type itself absent (install predates seed/link-types.json)", label: observed }
provenance: captured
---

## Context

`buildContext` matched directives two ways: a dedicated semantic
`retrieveKnowledge` pass over `ao_triage_directive` rows (embedding the
user message a second time, ~1.5–2.4s per step) and the
`resolveLinkedDirectives` path that surfaces directives linked from
retrieved KB articles. In production the second path had never run — zero
`ao_article_directive` links — so every directive match carried
provenance `recall` and the whole sales-handoff feature depended on the
embedding pass.

The owner's stated model is the linked one: retrieve a relevant KB
article first; if that valid article has a linked directive, execute the
directive. Directives are admin-authored action records (invariant
`answer-once:0001`), not search results — embedding and vector-matching
them is scaffolding, not the steady state.

## Decision

Directive matching becomes **article-linked** as the steady state:

- **Carrier articles** cover the no-article action class ("have sales
  contact me"): KB articles authored to match an intent class, linked to
  the directive via `ao_article_directive`. When the article retrieves,
  the directive enters context with provenance `linked`, inheriting the
  article's similarity.
- `apply_directive` stamps `directive_provenance`
  (`recall` | `linked` | `both`) on the ticket so coverage is measurable
  per match without log dives.
- `directive_recall.enabled=false` retires the second `retrieveKnowledge`
  pass once `linked`/`both` covers ~90% of directive matches. The flag
  stays as the documented escape hatch — recall is what exists for the
  scale case where carriers can't cover hundreds of directives.
- The learning loop keeps auto-linking: `finalizeAnalysis` already links
  resolutions that produce both a KB candidate and a directive candidate,
  so coverage compounds without manual work.

## Alternatives rejected

- **Keep dual pass, share the query embedding** (~1–1.5s/step saved):
  optimizes the scaffolding instead of building the intended model; the
  second pass still runs forever.
- **Small-set listing** (inject all in-scope directives when count ≤ N):
  works at 2 directives but re-introduces directives as a separately
  surfaced config blob — the model sees actions with no article evidence
  and the semantic intent-matching is replaced by a prompt-level guess.
  Retained only as a possible leak fallback if Phase 4 data demands it.
- **Delete recall outright now**: strands every action request that has
  no carrier article yet — the sales handoff is exactly that case.

## Consequences

- Retrieval cost drops ~1.5–2.4s per agent step after the flip.
- Coverage is no longer automatic — a carrier that isn't retrieved for a
  user's phrasing loses the directive (falls to generic
  `escalate_to_human`, still correct but loses the pipeline). Phase 4
  quantifies this before the flip; residual-leak policy is decided then,
  not now.
- Ops requirement: an `ao_article_directive` link type row must exist —
  `resolveLinkedDirectives` fails closed (`[]`) without it. Installs
  predating `seed/link-types.json` need it inserted by hand.
- Unverified: the ~90% coverage gate is the plan's heuristic, not a
  measured threshold; revisit with Phase 4 data.
