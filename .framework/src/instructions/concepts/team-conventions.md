---
title: Team conventions
audience: developers, agents
kind: concept
verified_against: 59afa86
verified_on: 2026-11-23
source_files:
  - .framework/cli/lib/project-files.ts
  - .framework/templates/agent/AGENTS.md
  - .framework/src/instructions/concepts/decision-records.md
  - .framework/src/instructions/tasks/declare-your-environments.md
asserted_by:
  - "Owner direction, developer-lifecycle plan (2026-11-16): team conventions — decision ownership, review expectations, branch→ladder flow — are part of the Orient stage"
---

# Team conventions

How a team works *on* a Spine project, as distinct from how Spine works.
The framework is deliberately silent about most of this — these are the
project's own answers, and this page says where each one lives.

## The division of ownership

| What | Who owns it | Where it lives |
|---|---|---|
| Framework rules (boundary, admin-data only, design_schema contract) | the framework | `AGENTS.md` above `spine-framework:end` — overwritten by `upgrade` |
| **Your team's rules** | the project | `AGENTS.md` **below** the end marker — `mergeAgentsFile` preserves it verbatim across upgrades |
| Environment ladder (what "ship it" means) | the project | `## Environments` in that same region — see `tasks/declare-your-environments.md` |
| Why-decisions that outlive the code comment | whoever made the call | `custom/decisions/` — never touched by upgrades |
| App-owned decisions for a packaged app | the app's maintainers | `custom/apps/<slug>/decisions/` — overwritten when the app package upgrades, so don't hand-write there |

Two consequences worth internalizing:

- **The `AGENTS.md` customer region is the project's constitution.** Team
  rules, the environment ladder, conventions like "we always seed before
  staging" — they all live below `spine-framework:end`, where upgrades
  can't reach them and every agent reads them first.
- **`custom/decisions/` is yours; `custom/apps/<slug>/decisions/` is the
  package's.** A decision record you write under an app package is lost
  on its next update — same rule as `.framework/` files.

## Branch → ladder flow

The convention the shipped machinery assumes:

1. Work happens on branches/the checkout; the local rung's gate
   (`typecheck`, `test`, `verify` — or stricter, as your `## Environments`
   says) defines "green."
2. Merge/push to `main` promotes to the next rung — typically a staging
   deploy via git push.
3. Each rung's `Gate`/`Post-landing` defines done-ness; the
   `**Hand-off: stop**` rung is where automation halts and a human decides
   on release.

If your team's flow differs (release trains, review gates, no staging),
the ladder is where you say so — not tribal knowledge.

## Review expectations the tooling encodes

- **Docs are part of the change.** Editing a file in a page's
  `source_files` without re-verifying that page makes the commit
  incomplete — `docs:release-check --affected` catches it at release.
- **Decision records are `proposed` until a human accepts them.** An
  agent captures; the owner decides. `verify:decisions` enforces the
  shape, not the judgment.
- **`migrate` on a shared database is a team event.** Apply locally
  freely; on a shared dev project, coordinate first (see
  `guide/06-join-an-existing-project.md`).

## What the framework won't decide for you

Review etiquette, branch naming, who may release, support rota — all
yours. Write them once, below the end marker, and every agent on the
project inherits them.
