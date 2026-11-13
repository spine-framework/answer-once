---
name: spine-decision-capture
description: "Record a consequential engineering decision in custom/decisions/ — alternatives rejected, invariants discovered, workarounds added."
allowed-tools:
  - read
  - write
  - exec
  - grep
  - find_file_by_name
---

You capture **why** a change was made so later work can check proposals
against intent. Records are Markdown + YAML frontmatter, version-scoped, and
kept in git.

## When to write one

- Choosing between real alternatives (and why the loser lost).
- Rejecting a design explicitly.
- Discovering or enforcing an invariant.
- Adding a workaround whose reason isn't obvious from the code.

Not for routine changes or bug fixes with an obvious cause.

## Where your records live

**Your records go in `custom/decisions/` only** — `owner: customer`, ids
prefixed `customer:`. Package upgrades never touch this directory.

Package-owned records live in `.framework/decisions/` and in
`custom/apps/<slug>/decisions/` for DAHL-shipped apps. **Read** the ones that
apply before editing related code — but never create or edit them yourself;
upgrades overwrite them. If you want to diverge from a package record, write
your own record that `links:` to it.

## Format — `custom/decisions/NNNN-<slug>.md`

NNNN is the next free 4-digit number.

```yaml
---
id: customer:<NNNN>-<slug>
title: …
status: proposed          # proposed | accepted | rejected | superseded | invalidated
kind: decision            # decision | invariant | lesson | workaround | rejected-alternative
owner: customer
since: <version>
until: null
supersedes: null          # same-owner records only — never a package id
superseded_by: null
links: []                 # may point at package records
applies_to: [path#SYMBOL, path]
enforced_by: [path, …]    # tests/scripts; [] = explicitly unenforced
evidence:
  - { kind: commit|test|doc|pr, ref: …, label: source|fixture|observed }
provenance: captured
---
Context · Decision · Alternatives rejected · Consequences
```

## Rules

- Write `status: proposed` the moment the decision is made; put unverified
  claims on explicit `Unverified:` lines.
- `supersedes` never targets a package-owned record.
- Never append correction notes — supersede the record instead.
- A `proposed` record is context, not authority — never cite it as the
  reason a design is correct.
- A `proposed` record fails the release gate unless the same dir's
  `exceptions.yaml` approves it for exactly that release. Exceptions are
  human-approved only and expire on version bump.

## Challenging a record

Evidence may disprove an accepted record's *rationale* while the decision
itself still stands — keep the two apart.

- **Rationale wrong, decision still right:** keep `status: accepted`, set
  `rationale_status: invalidated`, add the disproving evidence, and correct
  the rationale text — do not rewrite history to make it look better.
- **Decision itself wrong:** write a *new* record as `status: proposed`
  (never edit the old one to `superseded` yourself). An agent proposes;
  a human accepts. Leave `supersedes`/`superseded_by` unset until
  acceptance — acceptance sets both sides atomically.
- `status: invalidated` is for a whole record whose claim was never true
  (vs `superseded` = it was true, then replaced).
