---
title: Write a migration
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/cli/commands/migrate.ts
  - .framework/migrations/068_cron_schedule_timer_rpcs.sql
  - .framework/migrations/053_builtin_action_seeds.sql
---

# Write a migration

## Goal

Add a `.sql` file that the `migrate` command applies exactly once, in order,
tracked in the `_spine_migrations` ledger table. See
[Database reference](../reference/database.md) for the table map.

## Steps

1. **Pick the directory.**

   - `custom/migrations/` — project/app migrations (**default choice**).
     `collectMigrations` reads `.framework/migrations/*.sql` first, then
     `custom/migrations/*.sql`, each sorted lexically — custom migrations
     always run after every framework migration
     (`.framework/cli/commands/migrate.ts`).
   - `.framework/migrations/` — only for framework-owned changes (you are
     editing the framework itself).

2. **Pick the number.** Framework files use `NNN_name.sql` with zero-padded
   sequence numbers. Occupied ranges today: `001`–`021`, `032`–`038`,
   `042`–`062`, `064`–`069`; gaps `22`–`31`, `39`–`41`, `63` are reserved/
   consolidated — **do not reuse gap numbers** (see
   [Database reference](../reference/database.md)). Custom migrations get
   their own files in `custom/migrations/`; filenames are tracked verbatim
   in `_spine_migrations`, so keep them globally unique.

3. **Write idempotent SQL.** Migrations run once per filename — but
   installs re-run them against databases in unknown drifted states, so
   guard everything:

   ```sql
   ALTER TABLE public.my_table
     ADD COLUMN IF NOT EXISTS my_col text;

   CREATE INDEX IF NOT EXISTS idx_my_table_col
     ON public.my_table (my_col);

   INSERT INTO public.roles (slug, name, is_active)
   SELECT 'my_role', 'My Role', true
   WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE slug = 'my_role');
   ```

   `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`,
   `DROP … IF EXISTS`, `ON CONFLICT … DO NOTHING`, and
   `INSERT … SELECT … WHERE NOT EXISTS` are the house patterns (see
   `.framework/migrations/053_builtin_action_seeds.sql`).

4. **Apply it.**

   ```bash
   npx spine-framework migrate              # framework + custom
   npx spine-framework migrate --dry-run    # list pending only
   npx spine-framework migrate --framework-only
   ```

   Requires `SUPABASE_URL` (a hosted `https://<ref>.supabase.co` URL — the
   CLI rejects anything else before connecting) and
   `SUPABASE_DB_PASSWORD` or `--db-password`
   (`.framework/cli/commands/migrate.ts`).

5. **Check state.** `npx spine-framework migrations list` reads the
   `_spine_migrations` ledger; `migrations status` diffs local files vs
   applied — see [CLI reference](../reference/cli.md).

## Verify

- `_spine_migrations` contains the filename: each file runs in a
  transaction, records `INSERT INTO _spine_migrations (filename)`, and the
  runner **stops at the first failure** — fix and re-run
  (`.framework/cli/commands/migrate.ts`).
- Re-running `migrate` reports the file as skipped.

## Common mistakes

- **Renaming a file after it ran.** Tracking is by filename — a rename
  makes it a new migration and re-applies the SQL.
- **Non-idempotent DDL.** `ALTER TABLE … ADD COLUMN` without
  `IF NOT EXISTS` fails on the second run (e.g. a fresh install that
  already got the column from a later reconciliation migration).
- **Gap numbers.** `022`–`031`, `039`–`041`, `063` are reserved — using
  them collides with framework history.
- **Depending on framework ordering.** Custom files all sort *after* every
  framework file; you cannot interleave a custom migration between
  framework ones — express dependencies inside the SQL (e.g.
  `CREATE OR REPLACE`, existence checks).
- **`SUPABASE_URL` with a port, path, or credentials** — rejected by the
  CLI before it ever connects.

## Reference

- [Database reference](../reference/database.md) — table map, numbering
  gaps
- [CLI reference](../reference/cli.md) — `migrate`, `migrations list`,
  `migrations status`
- [Package and install an app](./package-and-install-an-app.md) — app
  installers run `migrate` automatically before seeding
