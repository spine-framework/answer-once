---
title: "Docs contract — how the instruction book is written, tested, and kept true"
audience: developers, agents
kind: reference
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - scripts/docs-lint.mts
  - .framework/src/instructions/README.md
  - docs/audit/clean-room-walkthrough.md
  - .framework/cli/commands/install-app.ts
  - .framework/cli/commands/validate-app.ts
---

# Docs contract

This file is the editorial contract for the Spine instruction book and for
the instruction books that installed apps carry at
`custom/apps/<slug>/src/instructions/`. It lives under `internal/` because it
governs the book itself rather than describing the framework.

## The test rule

Every miss is a documentation bug — fix the book, not the test.

The book must carry a cold agent — one with zero memory of this codebase —
through installation, orientation, and building on Spine without touching
monorepo-only material. If an agent has to grep `.framework/functions/` to
answer a customer-facing question, or has to ask the user something that
isn't a real-world checkpoint (credentials, first-admin choice), the book is
missing a page, a section, or a line. Write it. Do not explain around the
gap in the moment and move on.

Corollaries:

- Retrieval beats derivation. A fact an agent can *find* is safe; a fact it
  has to *derive* from source is a latent bug.
- Code is truth; docs are interpretation. When they disagree, the doc is
  wrong — fix the doc and bump `verified_against`/`verified_on`.
- "It figured it out eventually" is a fail. Time-to-answer is the metric.

## The capture contract

A code change is **incomplete until the docs covering it are re-synced**.
Docs are part of the change, not a follow-up chore. One rule, two layers:

**Core.** Every book page lists `source_files` in its frontmatter — the code
files whose behavior the page interprets. Editing any file in that set
requires re-verifying every page that lists it, in the same change, and
bumping `verified_against` (commit short hash) and `verified_on` (date).
`npm run docs:lint` is the gate.

**Custom.** Editing anything under `custom/apps/<slug>/` requires updating
that app's `src/instructions/` in the same change:

- New or changed page/route → the app's tasks doc and README route map.
- New or changed function → the app's `reference/functions` page.
- New or changed seeded type → the app's entity page for that type.
- New skill → the app's README skills list.

**Capture, not just sync.** Non-obvious decisions, cautions, and traps
discovered while doing the work are appended to the relevant page's
`## Agent notes` section — the next cold agent reads what the last one
learned. Positive-only corrections: update the source; never append
"correction notes" that contradict an untouched stale claim.

### Relationship to the retired CIL

The legacy Code Intelligence Layer (`cil_*` functions, markers, chunk
embeddings) was retired in migration 079 — it produced confident but
unverified claims at scale. The book is now the sole curated-comprehension
layer: code and tests remain the source of truth for *what*; decision
records (`decisions/`) hold *why*; deterministic checks (`npm run gate`,
`db:fixtures`) establish *what is true*.

The definition of done for `.framework/` edits is book re-verify plus the
unit/integrity gates — there is no secondary doc pipeline to re-sync.

## Layer taxonomy — which layer answers which question

| Layer | Kind | Answers | Mandatory shape |
|---|---|---|---|
| `guide/` | guide | "Walk me through it end to end" | Numbered sequence (`00` → `05`); each step verifiable |
| `concepts/` | concept | "Why is it like this? What's the mental model?" | Model first, mechanics second; links to tasks |
| `tasks/` | task | "How do I do X?" | `## Goal` → `## Steps` → `## Verify` → `## Common mistakes` → `## Reference` |
| `reference/` | reference | "What's the exact spelling/shape?" | Tables over prose; every row verifiable against `source_files` |
| Entity pages (root) | entity | "What is this thing and how do I configure it?" | The 7-section template (enforced by docs:lint) |
| `operations/` | ui | "How do I run/diagnose it in the admin UI?" | Runbook steps anchored to real pages/endpoints |
| `internal/` | * | "How is the book itself maintained?" | Repo-only; exempt from archived-docs and cil_* reference rules |

Frontmatter on every page: `title`, `audience`, `kind`,
`verified_against`, `verified_on`, `source_files` (list). Exemption:
`status: LEGACY_UNVERIFIED` — still checked for links and paths.

## Skills

Invocable procedures live in `.devin/skills/spine-*` (framework-owned,
dir-replaced on upgrade) and `custom/.devin/skills/<prefix>_*`
(app-owned — see below). A task doc should name its companion skill where
one exists; a skill should link its task/reference doc.

**App-shipped skills.** An installed app may ship skills under
`agent/skills/<prefix>_*/` in its package; `install-app` copies them to
`custom/.devin/skills/` and `uninstall-app` removes `custom/.devin/skills/<prefix>_*`.
`manifest.agent.skill_prefix` is required when `agent/skills/` exists and
must match `^[a-z][a-z0-9]{0,7}$` and be unique across installed apps.
See [App manifest reference](../reference/app-manifest.md) and
[Document your app](../tasks/document-your-app.md).

## Acceptance matrix — the regression suite

The cold-agent test protocol lives in the repo at
`docs/audit/clean-room-walkthrough.md`. Each row is a verbatim prompt; the
pages listed must satisfy it **alone**. New pages earn a row; a failing row
means the book regressed, not that the agent did.

| # | Verbatim prompt (abridged) | Pages that must carry it |
|---|---|---|
| T1 | Explain this project: what's mine vs framework, how do primitives compose, where does my code go, what do I never touch | `guide/00-orientation.md`, `guide/02-project-map.md`, `concepts/core-vs-custom.md`, `concepts/spine-way.md` |
| T2 | Create a design_schema for a "task" type (fields, selects, permissions, list+detail views) and validate it | `tasks/add-a-type.md`, `reference/design-schema.md`, `concepts/design-schema.md`; skill `spine_schema_validate`/`spine-schema` |
| T3 | Create the type and register a generic app at /taskboard that lists it — visible in the UI | `tasks/register-an-app.md`, `apps.md`, `reference/app-manifest.md`, `concepts/apps-and-renderers.md` |
| T4 | Add a custom page that lists tasks with a working create form — no server-side code | `tasks/build-a-custom-page.md`, `reference/frontend-sdk.md`, `reference/api/admin-data.md` |
| T5 | Wire a pipeline on task create + a 2-minute timer; show a completed execution | `tasks/add-a-pipeline.md`, `tasks/add-a-trigger.md`, `tasks/add-a-timer.md`, `timers.md` |
| T6 | Add an AI agent with its own prompt config and send a test message | `tasks/add-an-ai-agent.md`, `ai-agents.md`, `prompts.md` |
| T7 | Package this app; install it into another Spine project; show create/list working | `tasks/package-and-install-an-app.md`, `reference/app-manifest.md`, `reference/seeds.md`; skill `spine-install-app` |
| T8 | Something broke — creating a task fails / the pipeline fails. Find and fix it | `operations/troubleshooting.md`, `pipeline-executions.md`, `logs.md`, `deliveries.md`; skill `spine-troubleshoot` |
| T9 | (cold) Create a type, register an app, wire a pipeline — from docs alone | The whole book end to end |
| M1 | Mount this app at the site root (served from `/`) | `tasks/register-an-app.md`, `apps.md`, `reference/app-manifest.md`, `concepts/apps-and-renderers.md` |
| M2 | What can I import in a custom app? Build a page using the framework's UI kit | `reference/frontend-sdk.md`, `tasks/build-a-custom-page.md` |
| M3 | Install this app, then use its shipped skill and its instruction book | `tasks/package-and-install-an-app.md`, `reference/app-manifest.md` (`agent` block), app `src/instructions/` |
| M4 | You changed file X — which docs did you update? | This contract (capture section), `AGENTS.md` verify rules |

## Authoring checklist for a new page

- [ ] Correct `kind` + full frontmatter; `source_files` lists the real files
      that produce the page's truth.
- [ ] Placed in the layer whose question it answers (taxonomy table above).
- [ ] Linked from `README.md`'s index and from at least one sibling page.
- [ ] A row in the acceptance matrix if it covers a cold-agent task.
- [ ] `npm run docs:lint` clean.

## The gate

`npm run docs:lint` (`scripts/docs-lint.mts`, repo-only) checks: required
frontmatter, kind taxonomy, the 7-section headings on `entity`/`ui` pages,
relative-link resolution, existence of every backticked `.framework/...`
path, and (outside `internal/`) no `docs/archive` references and no `cil_*`
tool references.
