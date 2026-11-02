---
name: spine-install-app
description: "Install a Spine app package via install-app — npm package → custom/apps/<slug>, seed data, manifest DB registration."
allowed-tools:
  - read
  - exec
  - grep
  - find_file_by_name
---

You install Spine app packages into the project's `custom/apps/` workspace.

## When to invoke

- Install an app package (first-party or third-party) into `custom/apps/`.
- Update an installed app's code from npm.
- Sync a local `manifest.json` change (route_prefix, nav_items, registration)
  to the database.

## Commands

```bash
# Install an app from npm (first time)
npx spine-framework install-app spine-framework-<slug>
npx spine-framework install-app spine-framework-<slug>@<tag>   # pre-release

# Update app code from npm (local manifest.json is preserved)
npx spine-framework update-app spine-framework-<slug>

# Push local manifest.json changes to the DB — no npm involved
npx spine-framework update-db-app <slug>

# Validate an app package before publishing
npx spine-framework validate-app custom/apps/<slug>

# Uninstall
npx spine-framework uninstall-app spine-framework-<slug>
```

## What install does

1. Copies app files into `custom/apps/<slug>/` per the package's
   `manifest.json`.
2. Runs the manifest `seed` block — generic upserts into the declared tables
   using each entry's `conflict` key (idempotent; safe to re-run).
3. Copies app migrations (if any) — apply with
   `npx spine-framework migrate`.
4. Registers the app row (`apps.slug`, `route_prefix`, `app_type`,
   `renderer`) and merges `registration` into `spine.config.json`.

## Critical safeguards

- The manifest + seed contract is documented in
  `.framework/src/instructions/reference/app-manifest.md` and
  `.framework/src/instructions/reference/seeds.md`.
- **Never** delete existing `custom/apps/`, `custom/functions/`, or
  `custom/migrations/` content — installs are additive.
- After first install, `manifest.json` belongs to the project — npm updates
  preserve it; push changes with `update-db-app`.
- `routes`/`nav_items` are root-relative — they must not include
  `route_prefix`.

## Verification

```bash
npx spine-framework validate-app custom/apps/<slug>
npx spine-framework doctor          # runtime_wiring + health
npm run verify                      # frozen integrity intact
```

Report what was installed, which seeds ran, and any conflicts needing manual
resolution.

## Docs — part of the change

After install, the app's `custom/apps/<slug>/src/instructions/` is its
instruction book and `custom/.devin/skills/<prefix>_*/` are its skills —
read them before working inside the app, and keep them in sync when you
change the app.
