---
title: Database Migrations
audience: both
kind: reference
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/cli/commands/migrate.ts
  - .framework/cli/commands/migrations.ts
  - .framework/cli/commands/install-app.ts
  - .framework/cli/commands/upgrade.ts
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/003_core_system_data.sql
  - .framework/migrations/069_log_stats_window.sql
---

# Database Migrations

Spine's migration system is deliberately simple: numbered `.sql` files applied
once, in filename order, each inside its own transaction, recorded in a
`_spine_migrations` ledger table. Everything runs through
`npx spine-framework migrate` (`.framework/cli/commands/migrate.ts`).

## File layout and numbering

- **Framework migrations** live in `.framework/migrations/` — sealed,
  upgrade-synced. Naming is `NNN_snake_case_description.sql` with a
  three-digit prefix; plain lexicographic sort is the apply order.
- **Custom migrations** live in `custom/migrations/` — project-owned, applied
  **after** all framework files in the same run (skip them with
  `--framework-only`).
- Files are filtered to `*.sql` not starting with `.`
  (`collectMigrations` in `.framework/cli/commands/migrate.ts`).
- **Numbering gaps are expected.** `22–31`, `39–41`, and `63` are reserved or
  consolidated numbers — a gap is not a missing migration (see
  [Database Reference](../reference/database.md)). The same number can also
  appear twice across the framework and custom dirs: the ledger key is the
  **filename**, not the numeric prefix, so `062_send_email_action.sql` and a
  custom `062_*.sql` do not collide.

## The `_spine_migrations` ledger

`migrate` creates and reads `public._spine_migrations`
(`id SERIAL`, `filename TEXT UNIQUE NOT NULL`, `applied_at TIMESTAMPTZ`).

Per file, inside one transaction: split the SQL into statements, run each,
insert the ledger row, `COMMIT`. On the **first** statement error the file
rolls back, the error is printed, and the run stops — later files are never
attempted. Files already in the ledger are skipped, so reruns are safe.

Note there is a **second, unrelated ledger**: `migrations list` /
`migrations status` read `supabase_migrations.schema_migrations` — the table
Supabase's own tooling maintains, which `spine-framework migrate` never
writes. `migrations status` therefore reports local files as `pending` even
when `_spine_migrations` shows them applied. Use the `_spine_migrations`
table itself as the authoritative "what ran" record.

## Running migrations

```bash
npx spine-framework migrate                # apply pending framework + custom
npx spine-framework migrate --framework-only
npx spine-framework migrate --dry-run
```

- Connects **directly to Postgres** — `db.<project-ref>.supabase.co:5432`,
  user `postgres`, database `postgres`. `SUPABASE_URL` must be a hosted
  `https://<ref>.supabase.co` URL and `SUPABASE_DB_PASSWORD` must be set
  (`--db-password` overrides; `.env` is preloaded).
- `--dry-run` prints **every collected file**, not just pending ones — the
  pending filter lives inside `runMigrations`, which dry-run never reaches.
  To see real pending state, query `_spine_migrations` or run it for real
  (applied files skip cleanly).
- `npx spine-framework install-app` also calls `runMigrations` before
  seeding; a migration failure aborts the install (`--no-seed` installs
  files only and tolerates missing DB credentials).

## Custom migration rules

1. One file per change, `NNN_name.sql`, in `custom/migrations/`.
2. **Idempotent by convention.** The ledger makes files apply-once, but
   drift happens (rows applied by hand, shared dev DBs, ledger restores).
   Write `IF NOT EXISTS`, `ON CONFLICT DO NOTHING` / `DO UPDATE`, and
   `CREATE OR REPLACE` so a re-run is survivable — framework files follow
   the same convention.
3. Never edit a file after it has been applied anywhere — the ledger keys on
   filename and will not re-run it. Add a new file instead.
4. Never put runtime-record seed data (types, roles, pipelines) in a
   migration when an app manifest `seed` block can express it — seeds get
   conflict handling, validation, and reconciliation that raw SQL does not.

## Rolling out schema changes with app updates

Two different channels, don't confuse them:

- **Framework schema changes** ship inside `.framework/migrations/` in the
  npm package. `npx spine-framework upgrade` syncs the files and *reports*
  new migrations — it never runs them. `npx spine-framework migrate` applies
  them (see [Upgrade](upgrade.md)).
- **App-level schema** is data, not DDL: `public.types` `design_schema`
  rows, roles, pipelines ship in the app package's `manifest.json` `seed`
  block, applied by `install-app`/`seed-app`. `install-app` copies only
  `index.tsx`, `manifest.json`, `package.json`, `pages`, `components`,
  `hooks`, `utils`, `functions`, `seed`, `public` into `custom/apps/<slug>/`
  — there is no per-app migrations directory. If an app truly needs DDL,
  ship it as a `custom/migrations/` file in the project repo.

Production rollout order: deploy code first or migrate first — both work
because migrations are additive-by-convention, but the safe default is
**migrate, then deploy**, so new code never meets a schema older than it
expects.

## Checklist

- [ ] `SUPABASE_URL` + `SUPABASE_DB_PASSWORD` set (`.env` or `--db-password`).
- [ ] `SELECT filename FROM _spine_migrations ORDER BY filename` reviewed for drift before major upgrades.
- [ ] New custom migration is idempotent and numbered after the highest local prefix.
- [ ] After `spine-framework upgrade`: `npx spine-framework migrate` run — upgrade only syncs files.
- [ ] `migrations status` not trusted as the source of truth (it reads `supabase_migrations`).

## Related

- [Database Reference](../reference/database.md) — table catalog and numbering gaps
- [Upgrade](upgrade.md) · [Deployment](deployment.md) · [Troubleshooting](troubleshooting.md)
- [CLI Reference](../reference/cli.md) — `migrate`, `migrations`, `install-app` flags
