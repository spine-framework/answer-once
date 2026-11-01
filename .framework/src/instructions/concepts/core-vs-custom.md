---
title: Core vs Custom Boundary
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/templates/project.json
  - .framework/cli/commands/upgrade.ts
  - .framework/cli/lib/project-files.ts
  - .framework/cli/commands/migrate.ts
  - scripts/boundary-check.sh
  - scripts/assemble-frontend.sh
  - scripts/assemble-functions.sh
  - config/vite.config.ts
  - config/tsconfig.json
  - config/tsconfig.functions.json
  - netlify.toml
---

# Core vs Custom Boundary

Spine projects are two trees with different owners: `.framework/` is the
sealed, upgradeable package; `custom/` is project-owned code and data the
package never writes. Everything about the boundary — the alias config, the
assembly, the upgrade command, the lint script — exists to keep one promise:
**upgrading the framework can never destroy your work.**

## What lives where

**`.framework/` (core, framework-owned)** — the React app shell and admin UI
(`.framework/src/`), Netlify functions and shared middleware
(`.framework/functions/`), ordered SQL migrations (`.framework/migrations/`),
the CLI (`.framework/cli/`), this instruction book
(`.framework/src/instructions/`), schemas, seeds, tests, and templates
(`.framework/templates/`). The shipped file set is declared in
`.framework/templates/project.json` under `framework_dirs`, `framework_files`,
`config_files`, `root_scripts`, and `bin`.

**`custom/` (project-owned)** — apps under `custom/apps/<slug>/` (each with a
`manifest.json` and `index.tsx`), migrations under `custom/migrations/`,
function handlers under `custom/functions/` and `custom/apps/<slug>/functions`,
plus tests and vendored packages. This tree is created by `init` / `create-app`
/ `install-app`; it is not part of the npm package and `upgrade` never writes
into it.

**Shared but owned:** `config/` (Vite + tsconfig), `netlify.toml`, and the
`scripts/` assembly-and-integrity scripts ship with the framework and are
synced on upgrade, with one carve-out — `netlify.toml`
`[functions."custom_*"]` sections belong to apps and are re-appended verbatim
by `renderNetlifyToml` in `.framework/cli/lib/project-files.ts`.

## Why the boundary exists: upgrade safety

`npx spine-framework upgrade` is a file sync, not a git operation:

1. It reads `.spine-manifest.json` — frozen per-file hashes written at install
   — and **aborts if any framework file was locally modified or deleted**
   unless `--force` is passed (`.framework/cli/commands/upgrade.ts`,
   `runUpgrade`).
2. It copies the new package's framework files over yours and deletes only
   `.framework/` entries that disappeared upstream. Files outside
   `.framework/` that upstream dropped are warned about, never removed.
3. It re-merges `package.json` (framework scripts + dependency pin), re-renders
   `netlify.toml` preserving `custom_*` sections, and regenerates the manifest.
   New migrations are reported, never run — `npx spine-framework migrate`
   applies them.

Because overwrite-on-upgrade is guaranteed, the only way a local change inside
`.framework/` survives is `verify`/`upgrade` treating the tree as sealed. The
frozen manifest is the integrity contract: `scripts/verify-integrity.sh`
re-hashes the tree and compares.

## How the boundary is enforced

- **`scripts/boundary-check.sh`** — fails the build if `.framework/` code
  imports `custom/` or `custom_*` modules, if core source references
  known app slugs, or if `custom/` code reaches `.framework/` via relative
  imports instead of the `@core` alias.
- **Aliases** — `config/tsconfig.json` maps `@core/*` → `.framework/src/*` and
  `@custom/*` → `custom/*`; `config/vite.config.ts` maps `@core` to the
  assembled `src` tree. `config/tsconfig.functions.json` maps `@shared/*` to
  the assembled `_shared/` directory — custom functions import `./_shared/...`
  at runtime.
- **Assembly** — `scripts/assemble-frontend.sh` copies `.framework/src` as the
  base layer and each `custom/apps/<slug>` verbatim into `.assembled/src/<slug>/`;
  `scripts/assemble-functions.sh` flattens framework + custom handlers into
  `.assembled/netlify/functions/` and treats duplicate function basenames as a
  hard error, while letting `custom/` overlay `_shared/` helpers.
- **Manifest** — `.spine-manifest.json` + `scripts/verify-integrity.sh` seal
  the `.framework/` tree between upgrades.

## How to extend core without crossing the boundary

Custom code reaches core through three sanctioned channels, in order of
preference:

1. **Data** — `public.apps` rows, `public.types` `design_schema`, roles,
   link types, triggers, pipelines. Most "customization" is data.
2. **Custom apps** — `custom/apps/<slug>/` with a `manifest.json`, mounted by
   `route_prefix`/`renderer` and loaded dynamically by
   `.framework/src/components/CustomAppLoader.tsx`.
3. **Custom functions** — new handler files alongside the assembled
   `_shared/` layer, for behavior admin-data can't express. Never wrappers
   for runtime CRUD — that is `/api/admin-data`'s job.

## What breaks if you cross it

- **Core → custom import:** `boundary-check.sh` fails; even if merged, the next
  `upgrade` overwrites or refuses, and the core now fails in projects lacking
  that app.
- **Custom → `.framework/` relative import:** `boundary-check.sh` check 2b
  fails; the path also breaks under the assembled layout Vite actually builds.
- **Edit inside `.framework/`:** `verify` reports drift and `upgrade` aborts —
  or `--force` silently reverts your change. Either way the change was never
  yours to keep.
- **Custom runtime-CRUD function:** compiles fine and quietly bypasses
  permissions, validation, audit, and triggers — the worst kind of violation
  because nothing fails.

## See also

- [The Spine Way](spine-way.md) — the ten rules this boundary is part of
- [Apps and Renderers](apps-and-renderers.md) — how `custom/` apps register and mount
