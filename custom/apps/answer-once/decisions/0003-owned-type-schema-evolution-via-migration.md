---
id: answer-once:0003-owned-type-schema-evolution-via-migration
title: Owned-type schema evolution ships via migration, not seed-reconcile
status: accepted
kind: decision
owner: package
since: null
until: null
supersedes: null
superseded_by: null
links: []
applies_to:
  - custom/migrations/072_answeronce_ticket_requester_fields.sql
  - custom/apps/answer-once/seed/types.json
  - custom/apps/answer-once/standalone.config.json
enforced_by:
  - scripts/db-fixtures.ts
evidence:
  - { kind: fixture, ref: "db:fixtures RC-upgrade/P-recover — plain recovery seed refuses owned-type design_schema drift, aborting mid-seed (triggers left unseeded)", label: fixture }
  - { kind: commit, ref: "custom/migrations/068_answeronce_directive_publish_status.sql", label: source }
provenance: captured
---

## Context

`createTicket` gained requester/origin fields (`requester_name`,
`requester_email`, `account_name`, `referring_site`) stamped at creation so
pipeline bodies (e.g. `ao_sales_handoff`'s `make_scenario` stage) read
`{{record.*}}` without joining people/accounts. The fields are declared in
the seed's `design_schema.fields` + detail view, which makes the seed's
`design_schema` differ from every existing install's `ao_support_ticket` row.

The types seed treats rows as global on `(kind,slug)` and refuses to
overwrite drifted `design_schema` unless the caller passes
`--reconcile-owned-types` (the slug is manifest-owned). The upgrade
fixtures proved the consequence: `RC-upgrade`/`P-recover` model a customer
installing the new AO tarball and re-seeding without the flag — the seed
aborts at `types`, leaving `triggers` at 3/10 coverage. Every upgrader
would hit an instructive-but-manual stop, and automated/CI re-seeds that
don't pass the flag abort halfway.

## Decision

Evolving a manifest-owned type's schema on existing installs ships as a
numbered custom migration that restamps the row to the seed shape
(`072_answeronce_ticket_requester_fields.sql`), following the 068
precedent. The migration uses additive `||` merge (idempotent — seed-first
installs re-apply identical values harmlessly; canonicalJson comparison is
key-order-insensitive) and also updates the `validation_schema` column and
the schema copies carried by already-created `items` rows. The migration is
declared in `standalone.config.json`'s `copy.custom_migrations` so the
published tarball's `installer/migrations` carries it.

## Alternatives rejected

- **Seed-only + `--reconcile-owned-types`**: pushes a manual flag onto every
  existing install's upgrade path; a plain re-seed aborts mid-way, leaving
  later seed tables unseeded. Reconcile remains the path for *drifted* rows
  (the migration's views-path update is shape-guarded and skips them — the
  seeder's drift guard then flags them for human review).
- **Re-running reconcile in the fixture to green it out**: papers over the
  customer-facing stop instead of removing it.

## Consequences

- Plain `install-app`/re-seed on upgrade stays automatic — the DB row
  matches the seed ("already seeded — identical").
- Owned-type schema changes now require two artifacts kept in sync: the
  seed declaration and a restamp migration. A seed-only owned-type change
  will fail `RC-upgrade`/`P-recover`, which is the intended tripwire.
- New AO migrations must be added to `standalone.config.json`
  `copy.custom_migrations` or the tarball omits them — `prepack-app.mjs`
  stage fails loudly when a prefix matches zero files, but an undeclared
  prefix is silent.
