---
title: Choosing a tenancy model
audience: developers, agents
kind: concept
verified_against: 1929705
verified_on: 2026-11-23
source_files:
  - .framework/src/instructions/concepts/scope-and-accounts.md
  - .framework/src/instructions/accounts.md
  - .framework/functions/_shared/principal.ts
  - .framework/migrations/011_spine_system_account.sql
asserted_by:
  - "Owner direction, developer-lifecycle plan (2026-11-16): agency tenancy choice — project per client vs accounts as tenants — is a Build-stage gap"
---

# Choosing a tenancy model

An agency building on Spine faces one structural question early: is each
client **a separate Spine project**, or **an `accounts` row inside one
project**? Both are real patterns; they solve different problems.

## The two models

**Project per client.** Each client gets its own repo + Supabase project
+ deployment (the `init` → `migrate` → `bootstrap` path, or an app package
like `answer-once` installed per client).

- Isolation is total — separate databases, separate deploys, separate
  `system_admin`s. A mistake in one client's project cannot touch
  another's.
- Per-client customization is unconstrained — their `custom/` tree is
  theirs alone.
- Upgrades are N projects to maintain (one `spine-framework upgrade` per
  client, though the same app package can ship to all of them).
- Client staff live in *their* project's `people`/`roles` — there's no
  cross-client account to leak.

**Accounts as tenants.** One project; each client is an `accounts` row;
their people are bound to that account; `account_id` is the isolation
boundary.

- One codebase, one deploy, one upgrade — operational cost is fixed.
- Isolation is enforced per-query by RLS and account scoping — every
  runtime record carries `account_id`, machine principals resolve to
  `adminDb` so endpoint-level scoping is what keeps tenants apart
  (`scope-and-accounts.md`). It's enforced, but it's a discipline, not
  physics.
- Account hierarchies (`parent_id`, `account_paths`) model client →
  sub-org structures for free.
- Customization is per-app/per-config, not per-code-tree — all tenants
  run the same functions and pages.

## The deciding questions

1. **Can one client's bug or traffic hurt another's?** Shared project
   shares function timeouts, rate limits, and the blast radius of a bad
   migration. If that's unacceptable → separate projects.
2. **Does each client need code-level customization?** Custom functions
   and pages are per-project. If clients diverge → separate projects
   (possibly all installing the same base app package).
3. **How many clients, and who upgrades?** Ten clients × separate
   projects = ten `upgrade` runs, ten pipelines of env vars. Accounts-as-
   tenants amortizes that into zero.
4. **Who sees what?** A client admin who should never see other tenants'
   data is safer in their own project; account-scoping is correct but
   your team must keep it correct in every custom function they add.
5. **Billing/data boundaries?** Exporting or deleting "one client" is a
   project teardown vs. surgical `account_id` deletion across tables.

## The hybrid

Common agency shape: **one internal project** (accounts-as-tenants for
your own staff and shared tooling) plus **project-per-client** for
deliverables. The client's project can still install the same app
packages you publish — `install-app` exists precisely so a packaged app
propagates to many projects.

## Where the model shows up later

- `tasks/onboard-client-staff.md` — the invite flow is the same either
  way; what differs is *which account* invites bind to.
- `tasks/declare-your-environments.md` — project-per-client means each
  client's ladder is its own `AGENTS.md`.
- API keys are account-bound — in shared tenancy a client's `cli` key can
  only see its own account's keys/data (`api-keys.md`).

## If you're unsure

Default to **project per client** for deliverables. It is the
lower-regret option: merging two projects later is hard, but splitting a
shared tenancy is harder — the data is already interleaved by
`account_id` and every custom function has to be audited for leaks
retroactively.
