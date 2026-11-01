---
title: Spine Instruction Book
audience: developers, agents
kind: index
verified_against: 4d9d52a
verified_on: 2026-10-29
source_files:
  - .framework/src/instructions/
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

`docs-lint` enforces the heading set verbatim.
