---
title: Spine Instruction Book
audience: developers, agents
kind: index
verified_against: f14a202
verified_on: 2026-11-22
source_files:
  - .framework/src/instructions/accounts.md
  - .framework/src/instructions/ai-agents.md
  - .framework/src/instructions/alerts.md
  - .framework/src/instructions/api-keys.md
  - .framework/src/instructions/apps.md
  - .framework/src/instructions/deliveries.md
  - .framework/src/instructions/integrations.md
  - .framework/src/instructions/invites.md
  - .framework/src/instructions/kb.md
  - .framework/src/instructions/logs.md
  - .framework/src/instructions/notifications.md
  - .framework/src/instructions/observability.md
  - .framework/src/instructions/people.md
  - .framework/src/instructions/pipeline-executions.md
  - .framework/src/instructions/pipelines.md
  - .framework/src/instructions/prompts.md
  - .framework/src/instructions/roles.md
  - .framework/src/instructions/runtime-collaboration.md
  - .framework/src/instructions/runtime-detail.md
  - .framework/src/instructions/runtime-list.md
  - .framework/src/instructions/security.md
  - .framework/src/instructions/testing.md
  - .framework/src/instructions/timers.md
  - .framework/src/instructions/triggers.md
  - .framework/src/instructions/types.md
---

# Spine Instruction Book

This directory is the instruction book shipped with the `spine-framework` npm
package. It is written for two readers: **developers** building on Spine, and
**agents** (human or AI) operating a Spine deployment. Every file must pass
`npm run docs:lint` — see `docs/audit/docs-spec.md` in the repo for the
authoring spec.

## Structure

| Section | Kind | Contents |
|---|---|---|
| `guide/` | guide | End-to-end walkthroughs (install, first app, deploy). |
| `concepts/` | concept | Mental models — tenancy, permissions, types, runtime vs config. |
| `tasks/` | task | Single-goal procedures with prerequisites and verification steps. |
| `reference/` | reference | Exhaustive lookups — env vars, CLI commands, API endpoints, schema enums. |
| `operations/` | ui | Admin-UI pages and operational runbooks. |
| `internal/` | * | Repo-only/internal docs; exempt from the archived-docs and CIL-tooling reference rules. |
| *(root)* | entity | One file per Spine entity (`types`, `apps`, `roles`, …). |

## Reading order — developers

1. `guide/` getting-started, then `concepts/` tenancy & permissions.
2. The `entity` files for the types you will create (`types.md` first).
3. `tasks/` for the specific job at hand; `reference/` for exact spellings.

## Reading order — agents

1. `concepts/` — know what a Spine account, type, and record are.
2. `entity` files — the 7-section template below tells you what each entity is
   for, its fields, minimal/full configuration, a worked example, the core
   files, and agent-specific cautions.
3. `operations/` — how to drive the admin UI; `internal/` — repo-only notes.

## The 7-section entity template

Every `entity` or `ui` doc uses the same seven `##` sections, in order:

1. `## What this is for`
2. `## Fields and settings`
3. `## Minimal configuration`
4. `## Full configuration`
5. `## Example`
6. `## Core files`
7. `## Agent notes`

`docs-lint` enforces the heading set verbatim. `entity` pages also carry
`## Why it exists` — the primitive's 5-whys rationale, migrated from the
archived reference tree at 0.6.1 (long-form narrative: `docs/articles/`).

## Key pages

- Building frontend: [Frontend SDK (`@core`)](reference/frontend-sdk.md) —
  every importable module, contract-ordered by real usage.
- Registering/mounting apps:
  [tasks/register-an-app](tasks/register-an-app.md) +
  [Mounting](concepts/apps-and-renderers.md#mounting-directory-or-root).
- App-shipped docs/skills: [tasks/document-your-app](tasks/document-your-app.md).
- Shipping/promoting: [tasks/declare-your-environments](tasks/declare-your-environments.md)
  (the `## Environments` ladder) + the `spine-ship` skill.
- Operating a deployment: `spine-operate` skill +
  [tasks/set-up-monitoring](tasks/set-up-monitoring.md),
  [tasks/rotate-an-api-key](tasks/rotate-an-api-key.md),
  [operations/recovery](operations/recovery.md).
- Upgrading across many projects: [tasks/upgrade-many-projects](tasks/upgrade-many-projects.md)
  + [operations/versioning](operations/versioning.md). Support:
  support.spine-framework.com (+ `doctor --ticket` for diagnostics).

## `internal/` — the doctrine

`internal/docs-contract.md` is the editorial contract for this book — the
test rule (every miss is a doc bug), the capture contract (docs are part of
every code change, core and custom), the layer taxonomy, and the cold-agent
acceptance matrix that regression-tests the book. Read it before adding or
restructuring pages.
