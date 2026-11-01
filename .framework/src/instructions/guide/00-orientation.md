---
title: Orientation — what Spine Framework is
audience: developers, agents
kind: guide
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - package.json
  - netlify.toml
  - .env.example
  - .framework/cli/commands/init.ts
  - .framework/templates/project.json
  - .framework/src/components/admin/PageInstructions.tsx
  - .framework/src/instructions/README.md
---

# Orientation

Spine Framework is a multi-tenant application platform you install into an npm
project. It gives you the "boring 80%" of a SaaS product — the infrastructure
every app needs and nobody wants to rebuild — so your code can be the
interesting 20%.

## What you get out of the box

- **A typed runtime data layer.** Accounts, people, and typed records (items,
  threads, messages, links, attachments, watchers) stored in Supabase Postgres,
  all reachable through one CRUD/permissions API (`.framework/functions/admin-data.ts`).
- **Auth and tenancy.** Supabase Auth for sign-in, an invite/registration
  pipeline (`.framework/functions/invites.ts`), hierarchical accounts, and a
  first-user bootstrap that seeds a system administrator.
- **RBAC.** Roles plus per-type `record_permissions` evaluated on every request
  (`.framework/functions/_shared/permissions.ts`).
- **Automation.** Declarative pipelines, event triggers, timers, integrations,
  and AI agents — all database rows, all driven by the same runtime
  (`.framework/functions/_shared/pipeline-runner.ts`,
  `.framework/functions/_shared/trigger-engine.ts`).
- **An admin UI.** A schema-driven admin surface at `/spine-framework/admin`
  built from `.framework/src/apps/admin/index.tsx`, plus generic list/detail
  pages that render directly from each type's views.
- **Operations.** API keys for machine principals, delivery tracking, logs,
  metrics, and pipeline execution history.

The stack is deliberately conventional: a React + Vite frontend, Netlify
Functions as the API layer, and Supabase (Postgres + Auth) as the database.
`netlify.toml` points functions at `.assembled/netlify/functions` and publishes
`dist`; `.env.example` lists the Supabase keys the app needs.

## What `npm install spine-framework` + `npx spine-framework init` gave you

`init` copies a framework-owned file set — declared in
`.framework/templates/project.json` — into your project: the `.framework/`
tree (frontend source, Netlify functions, migrations, CLI, seeds, schemas),
`config/` build files, root `scripts/`, `bin/`, a neutral `spine.config.json`,
a merged `package.json`, `netlify.toml`, `.gitignore`, and a frozen
`.spine-manifest.json` recording the hash of every protected file. It also
creates an empty `custom/` workspace — the one place your code lives.

Two consequences follow:

1. **`.framework/` (plus `config/` and `scripts/`) is sealed.** Every file is
   hashed into `.spine-manifest.json`; `npx spine-framework upgrade` refuses to
   overwrite a locally modified tree unless you pass `--force`.
2. **`custom/` is yours.** Apps, functions, components, and migrations you
   write go there; the framework never touches it.

See [02-project-map.md](./02-project-map.md) for the full anatomy.

## How this instruction book is organized

This book ships inside the package at `.framework/src/instructions/` and is
also rendered inside the admin UI — admin pages mount a
`PageInstructions` sheet that loads these files as raw markdown and renders
them with `react-markdown` + `remark-gfm`
(`.framework/src/components/admin/PageInstructions.tsx`). Diagrams are plain
ASCII; the renderer does not load mermaid.

| Section | Kind | Contents |
|---|---|---|
| `guide/` | guide | End-to-end walkthroughs — you are here. |
| `concepts/` | concept | Mental models (tenancy, permissions, schema). |
| `tasks/` | task | Single-goal procedures with verification steps. |
| `reference/` | reference | Exhaustive lookups (env vars, CLI, endpoints). |
| `operations/` | ui | Admin-UI surfaces and operational runbooks. |
| `internal/` | mixed | Repo-only notes; exempt from shipped-doc rules. |
| book root | entity | One file per Spine entity — [types](../types.md), [apps](../apps.md), [roles](../roles.md), [pipelines](../pipelines.md), [triggers](../triggers.md), [timers](../timers.md), [integrations](../integrations.md), [ai-agents](../ai-agents.md), [prompts](../prompts.md), [api-keys](../api-keys.md), [deliveries](../deliveries.md). |

Entity files all use the same seven sections — *What this is for → Fields and
settings → Minimal configuration → Full configuration → Example → Core files →
Agent notes* — so once you have read one, you know the shape of all of them.

## How to read it

- **Developers:** read this guide section in order
  ([install](./01-install-and-first-run.md) →
  [project map](./02-project-map.md) →
  [domain model](./03-domain-model.md) →
  [first app](./04-first-app.md)), then the entity file for whatever you are
  building, then `reference/` for exact spellings.
- **Agents:** [03-domain-model.md](./03-domain-model.md) gives you the
  primitives and how they compose; each entity file's *Agent notes* section
  lists the mistakes that actually break things; [05-glossary.md](./05-glossary.md)
  pins down terminology.
- Every page is verified against the code at the `verified_against` commit in
  its frontmatter. Where the docs disagree with code, code wins — treat that as
  a bug and check `Core files` on the relevant entity page.
