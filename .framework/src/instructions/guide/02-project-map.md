---
title: Anatomy of an installed project
audience: developers, agents
kind: guide
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/templates/project.json
  - .framework/cli/commands/init.ts
  - .framework/cli/commands/upgrade.ts
  - .framework/cli/lib/project-files.ts
  - scripts/checksum-manifest.mts
  - scripts/verify-integrity.sh
  - scripts/assemble.sh
  - scripts/assemble-frontend.sh
  - scripts/assemble-functions.sh
  - config/vite.config.ts
  - netlify.toml
  - .framework/cli/commands/create-app.ts
  - .framework/cli/commands/install-app.ts
  - .framework/src/components/CustomAppLoader.tsx
  - .framework/schemas/spine.config.schema.json
---

# Anatomy of an installed project

A Spine project is two concentric layers: a **sealed framework layer** the
package owns and overwrites on upgrade, and a **customer layer** the framework
never writes to.

```
my-project/
├─ .framework/            # SEALED — framework source, vendored by init/upgrade
│  ├─ cli/                #   the spine-framework CLI source
│  ├─ functions/          #   Netlify functions (the whole API surface)
│  ├─ migrations/         #   SQL migrations applied by `migrate`
│  ├─ public/             #   static assets + _redirects
│  ├─ schemas/            #   spine.config.schema.json
│  ├─ scripts/ seeds/ docs/ templates/
│  ├─ src/                #   React frontend + admin app + this book
│  └─ tests/
├─ config/                # SEALED — build config (vite, tsconfig, tailwind…)
├─ scripts/               # SEALED — assemble/verify/dev shell scripts
├─ bin/                   # SEALED — spine-framework bin shims
├─ custom/                # YOURS — apps, functions, components, migrations, tests
├─ .assembled/            # GENERATED — build output, never edit
├─ .spine-manifest.json   # GENERATED — frozen integrity manifest
├─ spine.config.json      # YOURS — branding + registration policy
├─ netlify.toml           # mixed — framework blocks + your custom_* sections
├─ package.json           # merged — framework scripts/deps + your own
└─ .env                   # YOURS — secrets; never written by the framework
```

## The sealed layer

The file set is declared in `.framework/templates/project.json`
(`framework_dirs`, `framework_files`, `config_files`, `root_scripts`, `bin`)
and every protected file's sha256 is recorded in `.spine-manifest.json` — the
protected trees are `.framework`, `config`, `scripts`, and `bin`
(`scripts/checksum-manifest.mts`, `PROTECTED_DIRS`).

- `npm run verify` (`scripts/verify-integrity.sh` → `scripts/verify-manifest.mts`)
  re-hashes the tree and fails on drift. `SPINE_INTEGRITY=warn` downgrades to
  warnings.
- `npx spine-framework upgrade` re-syncs the sealed layer to the
  `spine-framework` version installed in `node_modules`
  (`.framework/cli/commands/upgrade.ts`). It first verifies the tree against
  the manifest and **aborts on any locally modified or missing protected file**
  unless `--force` is passed — so do not edit `.framework/`, `config/`,
  `scripts/`, or `bin/`; changes there are destroyed on the next upgrade
  anyway.
- Deletions on upgrade are confined to `.framework/`; sealed files dropped
  upstream outside it are left in place with a warning.

## `custom/` — your code

`init` creates `custom/apps`, `custom/functions`, `custom/components`,
`custom/migrations`, and `custom/tests` (`.framework/cli/commands/init.ts`).
Everything in it is yours: not integrity-tracked, never touched by upgrade.

- **Custom apps** live at `custom/apps/<slug>/`.
  `npx spine-framework create-app <slug>` scaffolds `manifest.json`,
  `index.tsx`, and `components/`, then inserts the `apps` row with
  `renderer: 'custom'` (`.framework/cli/commands/create-app.ts`).
  `CustomAppLoader` resolves the UI via
  `import.meta.glob('../../../custom/apps/*/index.tsx')`
  (`.framework/src/components/CustomAppLoader.tsx`), and the Vite alias
  `@custom` points at `custom/apps` (`config/vite.config.ts`).
- **Custom functions** live at `custom/functions/` or inside an app at
  `custom/apps/<slug>/functions/`; assembly merges them into the flat
  functions directory and hard-fails on basename collisions with framework
  functions (`scripts/assemble-functions.sh`). Name yours `custom_*`.
- **Custom migrations** in `custom/migrations/` run with
  `npx spine-framework migrate` (skip them with `--framework-only`).
- **Packaged apps** installed via `npx spine-framework install-app <pkg>` also
  land under `custom/apps/<slug>/`; their `manifest.json` can seed types,
  roles, pipelines, and registration policy into the database
  (`.framework/cli/commands/install-app.ts`).

## `.assembled/` — build output

`npm run assemble` (`scripts/assemble.sh`) produces `.assembled/` fresh on
every dev start and build:

- `.assembled/src` — the framework frontend plus each `custom/apps/<slug>/`
  copied verbatim (never basename-flattened), plus the fixed-up `index.html`
  (`scripts/assemble-frontend.sh`). Vite builds and serves from here.
- `.assembled/netlify/functions` — framework + custom functions flattened into
  the single directory Netlify requires (`netlify.toml`
  `functions.directory`); duplicate basenames are a hard error, not a
  last-wins overwrite (`scripts/assemble-functions.sh`).

Never edit `.assembled/` — it is regenerated and deleted freely.

## `.spine-manifest.json` — the integrity contract

Written by `init` and regenerated by `upgrade`
(`.framework/cli/lib/project-files.ts` → `writeFrozenManifest`): the package
version (`framework_version`), the framework-owned dependency list, a tree
digest, and a sha256 per protected file. It is the input to `npm run verify`
and to upgrade's local-modification check.

## `spine.config.json` — project runtime config

Customer-owned; `init` seeds the neutral template
(`.framework/templates/spine.config.neutral.json`) and
`install-app`/`update-db-app` merge per-app registration policy into it
(`.framework/cli/commands/install-app.ts`). It carries `branding` and the
`registration` block that drives signup routing/role assignment — schema at
`.framework/schemas/spine.config.schema.json`. Upgrade never writes it.

## `netlify.toml` and `package.json` — mixed ownership

- `netlify.toml`: framework blocks are rewritten on upgrade, but
  `[functions."custom_*"]` sections are treated as app-owned and preserved
  verbatim (`.framework/cli/lib/project-files.ts` → `splitNetlifyToml` /
  `renderNetlifyToml`). Scheduled custom functions belong there.
- `package.json`: framework-owned scripts and dependencies are merged in and
  `spine-framework` pinned exactly; your own scripts and deps are preserved.
  Upgrade removes a dependency only if the previous framework version owned it
  and the new one does not.

## `.env` — yours, always

No framework command writes `.env`; it is gitignored and excluded from the
file set (`.framework/templates/project.json` `exclude_globs`). `.env.example`
ships as the documented baseline.
