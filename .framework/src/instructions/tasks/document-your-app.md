---
title: Document your app
audience: developers, agents
kind: task
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/cli/commands/install-app.ts
  - .framework/cli/commands/validate-app.ts
  - .framework/src/instructions/internal/docs-contract.md
  - .framework/templates/agent/AGENTS.md
---

# Document your app

## Goal

Give your app the same agent-legible documentation the framework ships —
so a cold agent (or a future teammate) can install it, understand it, and
work in it without reading every file. The contract: a small instruction
book inside the app plus namespaced Devin skills, kept in sync by the same
capture rule as the core book.

## Steps

1. **Create the app's instruction book** at
   `custom/apps/<slug>/src/instructions/` — "book-lite": the same layer
   structure, shrunk to app scale:

   ```
   src/instructions/
   ├── README.md              # what the app is + the doc map (kind: index)
   ├── entities/              # one page per seeded type (or per type family)
   │   └── ticketing.md
   ├── tasks/                 # the jobs someone does in/with this app
   │   └── install.md
   └── reference/
       └── functions.md       # the app's custom_* functions
   ```

   Every page carries the same frontmatter as the core book — `title`,
   `audience`, `kind`, `verified_against`, `verified_on`, and
   `source_files` pointing at **the app's own** functions/seeds/pages. That
   frontmatter is what makes your docs drift-checkable later.

2. **Author skills where they live.** App skills go in
   `custom/.devin/skills/<prefix>_<kebab-name>/SKILL.md` — the discovered,
   invocable location. Directory name = SKILL.md `name:` field = the skill's
   identity. The `<prefix>_` namespace keeps your skills separate from
   framework `spine-*` skills and makes uninstall deterministic.

3. **Declare the prefix in `manifest.json`:**

   ```json
   "agent": { "skill_prefix": "ao" }
   ```

   `^[a-z][a-z0-9]{0,7}$`, unique across installed apps (the installer
   checks). Convention: initials of the slug — `answer-once` → `ao`,
   `demo` → `d`.

4. **Stage assets for packaging** under `agent/` in the app directory —
   the installer maps them to their destinations:

   | Package path | Installed to |
   |---|---|
   | `agent/skills/<prefix>_*/` | `custom/.devin/skills/<prefix>_*/` |
   | `agent/instructions/**` | `custom/apps/<slug>/src/instructions/` |

   The package's `files` array in `package.json` must list `agent/`
   (npm only packs declared entries) — plus everything else the installer
   copies (`seed/`, `standalone.config.json`, `docs/`, …).

   For in-project development you edit the live copies directly
   (`custom/.devin/skills/`, `custom/apps/<slug>/src/instructions/`); copy
   them into `agent/` when packaging. `validate-app` warns if the staged
   and live copies drift.

5. **Validate** with `npx spine-framework validate-app <dir>` — checks the
   `agent` block, prefix rules, and SKILL.md name/dir equality.

## Verify

- `custom/.devin/skills/<prefix>_*/SKILL.md` files are invocable in a fresh
  agent session.
- `custom/apps/<slug>/src/instructions/README.md` exists and links the
  rest.
- A fresh agent session asked "work in this app" finds the book via the
  AGENTS.md pointer line without being told the path.

## Common mistakes

- **Skills inside the app dir** — `custom/apps/<slug>/.devin/` is *not*
  discovered by agent tooling; `custom/.devin/skills/` is. Authored in the
  app dir they become docs, not skills.
- **Missing `agent.skill_prefix`** — the installer fails closed when
  `agent/skills/` exists without it; declare it even with one skill.
- **Prefix collisions** — two installed apps sharing a prefix fails at
  install. Keep prefixes short and slug-derived.
- **`agent/` missing from `files`** — the tarball silently drops your
  staged assets and the installer has nothing to sync. List `agent/` (and
  `seed/`, `standalone.config.json`, …) in `package.json`'s `files`.
- **`src/` for code** — `src/` inside an app is *instructions-only*; the
  loader only globs `custom/apps/*/index.tsx`. App code stays in
  `pages/`, `components/`, `hooks/`, `utils/`, `lib/`.
- **Docs written once and abandoned** — the capture contract applies to
  your app too: every change to the app updates its `src/instructions/`
  in the same commit.

## Reference

- [Docs contract](../internal/docs-contract.md) — the doctrine and the
  capture rule this recipe implements
- [App manifest reference](../reference/app-manifest.md) — the `agent`
  block
- [Package and install an app](package-and-install-an-app.md) — the
  install/update/uninstall mechanics
