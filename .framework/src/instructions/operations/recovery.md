---
title: Backup and recovery
audience: both
kind: reference
verified_against: 4196635
verified_on: 2026-11-22
source_files:
  - .framework/cli/commands/migrate.ts
  - .framework/cli/commands/migrations.ts
  - .framework/cli/commands/doctor.ts
  - .framework/cli/commands/system.ts
  - .framework/cli/commands/install-app.ts
asserted_by:
  - "Owner decision S2 (developer-lifecycle plan, 2026-11-16): backups/recovery are delegated to Supabase; Spine provides a recovery runbook, not backup machinery"
---

# Backup and recovery

Spine does not ship backup machinery — backups are Supabase's job. This
page is what to do *around* a restore.

## What Supabase backs up

Depends on the plan the project's Supabase org is on:

- **Pro and above** — daily automated backups (retained ~7 days) in the
  dashboard under Database → Backups; Point-in-Time Recovery (PITR) is an
  add-on for finer granularity. Large databases may be on physical backups.
- **Free tier** — no managed backups. If the project must be recoverable,
  schedule your own `pg_dump` exports or move the project to a paid plan.
- Check the project's actual plan/features in the Supabase dashboard —
  tiers change, and this runbook deliberately doesn't re-spec Supabase's
  current offerings.

## How to restore

- **Dashboard restore** — pick the backup or PITR timestamp; Supabase
  restores the whole database into place.
- **Own dump** — `pg_restore` / `psql` the export into the project.
- **A restore rolls back everything DB-side at once**: schema *and* data.
  It does not touch your git checkout, deployed functions, or env vars.

## What git restores vs. what backups restore

| Lost thing | Restored by |
|---|---|
| Code, functions, seeds, `spine.config.json`, app packages | git — redeploy, `migrate`, `seed-app` |
| Migration *definitions* | git — `.framework/migrations/`, `custom/migrations/` |
| Runtime data: records, people, types rows, invites, keys, logs, executions | **only** the DB backup |
| Applied-migration ledger (`_spine_migrations`) | the backup — it rolls back with the data |

The ledger rollback is the trap: after a restore, the DB "forgets" it ran
migrations that the deployed code expects. That's what the next section
reconciles.

## After a restore — reconcile in this order

1. **See where the ledger landed:**

   ```bash
   npx spine-framework migrations status
   ```

   With `SUPABASE_URL`/`SUPABASE_DB_PASSWORD` pointed at the restored
   project. Expect pending entries for every migration applied *after*
   the backup was taken.

2. **Re-apply what's missing:**

   ```bash
   npx spine-framework migrate --dry-run   # review what will run
   npx spine-framework migrate
   ```

   Migrations are written to be idempotent (`IF NOT EXISTS`, guard
   clauses), so re-applying over a partially-restored schema is the
   designed path — but **read the dry-run output**: if a migration's
   objects were partially restored, the guard clauses decide whether it
   no-ops or partially applies. A guard that can't see half-restored
   objects is a real failure mode — repair the drift by hand rather than
   editing the applied migration file.

3. **Re-seed** apps whose seed data lived after the backup point:

   ```bash
   npx spine-framework seed-app <slug>
   ```

   Seeds are idempotent by design (`conflict:` keys); this tops up what
   the restore lost rather than duplicating.

4. **Health-check the wiring:**

   ```bash
   npx spine-framework doctor
   npx spine-framework system health
   npx spine-framework system manifest
   ```

   `doctor` validates env/files/DB reachability; `system manifest` tells
   you the deployed code version — compare it against the migration
   ledger: **code ahead of schema is the dangerous combination** (new
   code calling objects the restored DB doesn't have). If code is ahead,
   either finish step 2's migrations or redeploy the older code until the
   schema catches up.

5. **Re-check the runtime surface.** `system health` → `healthy`;
   non-admin path smoke (submit/read something real); check `deliveries`
   and `pipeline_executions` for backlog accumulated during the gap —
   triggers and timers don't retro-fire for the missing window.

## Common failure shapes

- **Code ahead of restored schema** — functions error on missing
  columns/tables. Fix: `migrate` (step 2) or pin back the deploy.
- **Partially-restored objects** — a table exists but its trigger/index
  doesn't. Fix: repair the specific objects, don't force the migration.
- **Secrets, not data** — API keys' *hashes* restore fine, but env-side
  secrets (Supabase keys, `INTERNAL_INVOKE_SECRET`, `OPENAI_API_KEY`) live
  outside the DB. Verify env vars after any project-level recovery.
- **Timers/schedules after restore** — `next_execution` values in the
  restored data may be in the past; timers arm on next tick normally, but
  check any timer-driven automations actually resumed.

## Related

- [Migrations](migrations.md) — ledger semantics, dry-run, ordering.
- [Troubleshooting](troubleshooting.md) — diagnosis when restore reveals
  something else broken.
- [Environment variables](../reference/env-vars.md) — the non-DB state you
  must re-verify.
