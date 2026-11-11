---
title: Decision Records
audience: developers, agents
kind: concept
verified_against: main
verified_on: 2026-11-06
source_files:
  - .framework/decisions/
  - .framework/cli/lib/decision-records.ts
  - .framework/templates/agent/skills/spine-decision-capture/SKILL.md
---

# Decision Records

Decision records preserve **why** code exists — the alternatives rejected,
invariants discovered, and workarounds accepted — as versioned, git-native
Markdown files with YAML frontmatter. They complement this book: the book is
*how things work*; records are *why this choice won*.

## Where records live

| Directory | Owner | Overwritten by upgrades? |
|---|---|---|
| `.framework/decisions/` | framework | yes — package-owned |
| `custom/apps/<slug>/decisions/` | the app's publisher | yes for DAHL-shipped apps |
| `custom/decisions/` | your project | **never** |

## How to use them

- **Before editing**, read the records whose `applies_to` covers your
  files — in `.framework/decisions/` and each app's `decisions/`.
  A `superseded` record names its replacement in `superseded_by`.
- **After a consequential choice**, write a `status: proposed` record via
  the `spine-decision-capture` skill — into `custom/decisions/` only
  (`owner: customer`, ids `customer:NNNN-slug`).
- **Never write into package-owned `decisions/` dirs** — upgrades replace
  them. To diverge from a package record, link to it from your own record.

## Agent notes

- `supersedes` never crosses owners; `links` may.
- The validator (`.framework/tests/unit/decision-records.test.ts`) checks
  schema, ownership placement, `supersedes`/`superseded_by` reciprocity,
  and that `accepted`/`proposed` records' `applies_to`/`enforced_by` paths
  still resolve in the tree.
- `enforced_by: []` is an explicit "this rule is review-enforced only" flag,
  not an omission.
