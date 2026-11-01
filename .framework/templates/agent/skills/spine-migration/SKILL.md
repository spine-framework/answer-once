---
name: spine-migration
description: "Write a Spine database migration — ordered naming, idempotent SQL, ledger-aware, and safe for upgrade."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
---

You write database migrations that run safely across fresh installs and
existing deployments.

## When to invoke

- A schema change is needed (table, column, index, RLS policy, function).
- An app needs seed-time or post-install data changes.

## Placement

- Framework migrations live in `.framework/migrations/` — **never edit them**;
  they are framework-owned and upgrade-overwritten.
- Project/app migrations live in `custom/migrations/` (or the app's own
  `migrations/` dir). Apply with `npx spine-framework migrate`.

## Naming and ordering

- Files are `NNN_description.sql` with unique zero-padded numeric prefixes —
  they apply in lexical order.
- Check the highest existing prefix before numbering yours.

## Idempotency checklist

Every migration must be safe to run twice:

- `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`,
  `DROP ... IF EXISTS`.
- `ON CONFLICT DO NOTHING` (or an explicit upsert) for seed/lookup rows.
- `DROP POLICY IF EXISTS` before `CREATE POLICY` (policies have no
  `IF NOT EXISTS`).
- Conditional `DO $$ ... $$` blocks for column adds and other
  existence-dependent DDL.
- Never depend on IDs or timestamps generated at author time — use slugs or
  stable keys to locate rows.

## RLS rules

- Every tenant/account-scoped table must have RLS enabled with policies using
  the platform's actor/account helper functions.
- Read `.framework/src/instructions/roles.md`,
  `.framework/src/instructions/concepts/permissions.md`, and
  `.framework/src/instructions/reference/database.md` before writing policies.
- `adminDb` bypasses RLS — use it only where bypass is intended.
- Idempotency model: `.framework/src/instructions/concepts/concurrency-and-idempotency.md`.

## Steps

1. Confirm the change cannot be expressed as `design_schema` or seed data —
   migrations are for physical schema and structural data only.
2. Pick the next `NNN` prefix in `custom/migrations/`.
3. Write idempotent SQL per the checklist; wrap data backfills in
   `DO $$ ... $$` so reruns are no-ops.
4. Apply: `npx spine-framework migrate`. The migration ledger records applied
   versions — a migration that fails halfway must be re-runnable.
5. Verify: rerun `migrate` (must be a no-op), then
   `npx spine-framework doctor` for the migrations check.

## Rules

- Migrations are additive — do not rewrite already-applied files.
- No `.framework/migrations/` edits; upstream changes arrive via upgrade.
- Destructive changes (drops, renames) get a written migration plan and
  confirmation before running.
