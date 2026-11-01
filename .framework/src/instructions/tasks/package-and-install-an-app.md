---
title: Package and install an app
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/cli/commands/install-app.ts
  - .framework/cli/commands/validate-app.ts
  - .framework/functions/_shared/app-manifest.ts
  - .framework/cli/commands/migrate.ts
---

# Package and install an app

## Goal

Package a `custom/apps/<slug>/` directory as an npm package and install it
into a Spine project — files copied, `apps` row upserted, migrations run,
seeds applied. Field-level manifest semantics are in
[App manifest reference](../reference/app-manifest.md) and
[Seeds reference](../reference/seeds.md).

## Steps

1. **Author `manifest.json`.** Required fields the installer validates:
   `slug` (must equal the directory name and match
   `^[a-z][a-z0-9-]*$`), plus `name`, `route_prefix`, `renderer`,
   `min_role` / `required_roles`, `nav_items`, `config`, `registration`.
   See [App manifest reference](../reference/app-manifest.md) for every
   field.

2. **Author seed files.** The `seed` block is a list of
   `{ file, table, conflict, inject_app_id?, ignore_duplicates?, permissions_patch? }`
   entries, each pointing at a JSON file of rows
   (`.framework/cli/commands/install-app.ts`):

   - `conflict` — the `onConflict` column list for the upsert. Types use
     `conflict: "kind,slug"` with `inject_app_id: false` — types are
     **global**, not duplicated per install.
   - `inject_app_id` — stamps `app_id` on each seeded row (default `true`);
     set `false` for global tables like `types`.
   - `ignore_duplicates` — `ignoreDuplicates` on the upsert; `types` rows
     always get it (`.framework/cli/commands/install-app.ts`).
   - `permissions_patch` — a types-table entry that merges
     `record_permissions` into existing design schemas instead of
     overwriting; ranks just after `types` in apply order.
   - If no `seed` array is declared, the conventional files
     `seed/roles.json`, `seed/types.json`, `seed/link-types.json` are used
     (`.framework/cli/commands/install-app.ts`).

   Seeds apply in dependency order — `roles`, `types`, `link_types`,
   `actions`, `ai_agents`, `prompt_configs`, `pipelines`, `triggers` —
   regardless of declaration order
   (`.framework/cli/commands/install-app.ts`). Pipeline seeds are
   validated against `public.actions` stage slugs, and trigger seeds
   resolve `pipeline_slug` → `pipeline_id`.

3. **Package it.** Ship the app directory as an npm package whose files
   include `index.tsx`, `manifest.json`, and optionally `pages/`,
   `components/`, `hooks/`, `utils/`, `functions/`, `seed/`, `public/` —
   the installer copies exactly that allowlist
   (`.framework/cli/commands/install-app.ts`). Validate locally
   with `npx spine-framework validate-app`.

4. **Install.**

   ```bash
   npx spine-framework install-app <package>
   ```

   Flow: `npm install <package>` → resolve slug → copy files to
   `custom/apps/<slug>/` (a reinstall preserves the local `manifest.json`)
   → `runMigrations` → `seedApp` → sync the `registration` block into
   `apps.config` and `spine.config.json`
   (`.framework/cli/commands/install-app.ts`). Requires
   `SUPABASE_URL` + `SUPABASE_DB_PASSWORD` + `SUPABASE_SERVICE_ROLE_KEY`;
   `--no-seed` skips all DB work.

5. **Update paths.**

   - `update-app <package>` — `npm install @latest` + copy files + sync
     registration. **It does not re-run migrations or seeds.**
   - `update-db-app <slug>` — upserts the `apps` row from the local
     `manifest.json` and syncs registration; no npm, no file changes.
   - `seed-app <slug>` — re-runs just the seed block for a local app;
     `--reconcile-owned-types` interactively updates `manifest.owned_types`
     slugs whose DB `design_schema` drifted from the seed.

6. **Uninstall.** `uninstall-app <package>` removes
   `custom/apps/<slug>/` and runs `npm uninstall` — and nothing else. The
   `--keep-data` flag is parsed but never read: seeded rows are **not**
   deleted either way (`.framework/cli/commands/install-app.ts`).

## Verify

- `npx spine-framework status` lists the installed app and version.
- `GET /api/apps?action=get&slug=<slug>` shows the upserted row;
  `migrations status` shows migration state.
- Seeded rows exist: `GET /api/types?action=list` (or the seeded table's
  endpoint) includes the app's types/roles.

## Common mistakes

- **Types not global.** Forgetting `inject_app_id: false` on a types seed
  injects `app_id` into global type rows — and `conflict: "kind,slug"`
  means a second app with the same slug silently skips or errors on
  schema drift. Prefix slugs.
- **Expecting `uninstall --keep-data` to matter** — it is a no-op; seeded
  rows always survive uninstall.
- **`update-app` doesn't re-seed** — new seed rows in the package never
  reach the DB; run `seed-app <slug>` or `update-db-app` after.
- **Seed rows referencing unseeded slugs** — `owned_types`,
  `pipeline_slug`, and `send_notification` recipients are validated
  fail-closed before any DB writes; fix the manifest, don't retry.
- **`SUPABASE_URL` must be a hosted `https://<ref>.supabase.co` URL** —
  the migrator rejects anything else before connecting
  (`.framework/cli/commands/migrate.ts`).

## Reference

- [App manifest reference](../reference/app-manifest.md) ·
  [Seeds reference](../reference/seeds.md) ·
  [CLI reference](../reference/cli.md) ·
  [spine.config.json reference](../reference/spine-config.md)
- [Apps and renderers](../concepts/apps-and-renderers.md) ·
  [Write a migration](./write-a-migration.md)
