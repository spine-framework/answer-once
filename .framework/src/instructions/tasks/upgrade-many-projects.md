---
title: Upgrade many client projects
audience: developers, agents
kind: task
verified_against: e140eef
verified_on: 2026-11-24
source_files:
  - .framework/cli/commands/upgrade.ts
  - .framework/cli/commands/migrate.ts
  - .framework/cli/lib/update-app-guard.ts
  - .framework/src/instructions/operations/upgrade.md
  - .framework/src/instructions/tasks/declare-your-environments.md
asserted_by:
  - "Owner direction, developer-lifecycle plan (2026-11-16): agency multi-project upgrade is an Evolve-stage gap"
---

# Upgrade many client projects

## Goal

Roll a `spine-framework` (and app-package) release across N client
projects without drift, forgotten projects, or half-applied schemas.

## Prerequisites

- The release exists — `npm view spine-framework versions` shows the
  target version (and each app package's version).
- A list of the client projects — for agencies this is worth keeping in
  one file you can loop over.
- Each project's `## Environments` ladder — upgrades walk it like any
  other change.

## Steps

1. **Read the release notes first.** The GitHub release notes name the
   migrations, breaking changes, and required consumer steps — they
   decide *whether* a project can take this release unmodified (e.g. a
   peer-floor crossing changes `create-*` deps).

2. **Per project, in a loop — upgrade the code:**

   ```bash
   cd <client-project>
   npm i spine-framework@<version>
   npx spine-framework upgrade --dry-run   # what will change
   npx spine-framework upgrade             # apply — never --force on autopilot
   npm install
   npm run verify                          # frozen manifest clean
   ```

   `--dry-run` output worth reading: modified `.framework/` files mean
   the project patched core — stop and resolve per-project rather than
   forcing.

3. **Then the schema** (only if the release carries migrations — the
   notes say):

   ```bash
   npx spine-framework migrations status   # pending?
   npx spine-framework migrate             # apply — coordinate on shared DBs
   ```

   Schema-before-code matters if the project deploys continuously:
   migrate *before* the new deploy lands. On a shared Supabase, `migrate`
   is a team event (see `guide/06-join-an-existing-project.md`).

4. **App packages second, same pattern:**

   ```bash
   npx spine-framework update-app <pkg>    # verifies baseline from lockfile
   ```

   Only where the app's peer range covers the new framework — the
   release notes say when it doesn't (peer-floor crossing = bump the
   scaffolder deps, see the versioning page).

5. **Walk each project's own ladder.** The upgrade is a change like any
   other: each project's `## Environments` decides gate/promote/post-
   landing. `spine-ship` walks it; the hand-off rung still waits for the
   client's go-ahead.

6. **Track the wave.** For N projects, record per-project: version
   reached, migrations applied, ladder rung reached, anomalies. A simple
   checklist table beats a script — the failure modes are per-project
   and need per-project judgment.

## Verify

- Every project: `npm run verify` clean, `migrations status` shows
  nothing pending, its ladder walked to wherever the client allows.
- No project left between "framework upgraded" and "migrations applied."

## Common mistakes

- **`--force` by default** — a modified `.framework/` file is a forked
  core; forcing past it hides the fork forever. Resolve it once.
- **Upgrading code before schema** — new code against old schema is the
  classic production break (see `operations/recovery.md` for the reverse
  trap).
- **Treating projects identically** — custom `netlify.toml` `custom_*`
  blocks, local `.framework/` edits, and per-client `## Environments`
  ladders make every project genuinely different.
- **Forgetting `update-app`** — `upgrade` syncs the framework; installed
  app packages need their own `update-app` pass.

## Reference

- [Upgrade](../operations/upgrade.md) — the single-project mechanics.
- [Versioning and compatibility](../operations/versioning.md) — what a
  minor vs patch release may change.
- [Declare your environments](declare-your-environments.md) — the ladder
  each upgrade walk ends in.
