---
title: Scope and Accounts
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/002_core_rls_and_functions.sql
  - .framework/migrations/011_spine_system_account.sql
  - .framework/migrations/013_get_account_apps_role_filter.sql
  - .framework/migrations/015_types_kind_slug_unique.sql
  - .framework/functions/admin-data.ts
  - .framework/functions/apps.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/db.ts
---

# Scope and Accounts

Accounts are Spine's tenancy primitive: every runtime record belongs to
exactly one `account_id`, and that column is what both RLS and the app layer
use to partition tenants. `design_schema.scope` is the small lever that decides
*which* account a record belongs to.

## The tenancy model

- **`public.accounts`** — the tenant (organization, workspace, customer).
  Accounts form a hierarchy through `parent_id`; the `account_paths` closure
  table stores every ancestor→descendant pair so subtree lookups are one join.
  Accounts have no `account_id` of their own — the table is the source of
  truth.
- **`public.people`** — a person belongs to exactly one account
  (`people.account_id NOT NULL`) and holds one `role_id`. A person is *also* a
  runtime record: `type_id`, `data`, and a stamped `design_schema`.
- **Everything else** — `items`, `threads`, `messages`, `links`,
  `attachments`, `watchers`, `item_progress` — carries
  `account_id NOT NULL` (or via its parent thread for `messages`).

## How scope decides `account_id`

`admin-data` create resolves the record's account in order
(`.framework/functions/admin-data.ts`, `create`):

1. An explicit `account_id` in the request body, else the caller's
   `ctx.accountId`.
2. If the record references a parent (`thread_id`, `target_id`, `parent_id`),
   the **parent's** `account_id` wins — and the parent's stamped `scope` is
   inherited into the new record's `design_schema`. A child can never drift
   into a different tenant than its parent.
3. `design_schema.scope` then applies: `'account'` (the default) keeps the
   resolved account; `'platform'` replaces it with the **spine-system**
   account's id.

So `scope` on a type is really "which tenant owns these records": your
account's rows, or the platform's shared rows.

## The `spine-system` account

Seeded by `.framework/migrations/011_spine_system_account.sql`:
`accounts.slug = 'spine-system'` — "Master system account for internal Spine
operations." It is the landing account for `scope: 'platform'` records. The
`accounts` table itself is the exception to the scoping rule: it has no
`account_id` column for scope to land on, so for `accounts` records
`admin-data` instead sets `parent_id` to the creator's account when none is
given — new accounts are born as *children* of the account that created them.

## How scope affects queries

- **Human callers** query through `ctx.db` — a Supabase client created with the
  caller's JWT (`.framework/functions/_shared/principal.ts`,
  `getPrincipalDb`). RLS policies on the tenant tables filter rows to
  `account_id IN (SELECT get_accessible_accounts(current_actor_id()))`
  (`.framework/migrations/002_core_rls_and_functions.sql`).
  `current_actor_id()` maps `auth.uid()` to the `people` row;
  `get_accessible_accounts` returns that person's account **plus every
  descendant** via `account_paths` — a parent-account user sees the whole
  subtree. If the person holds `system_admin`, the function short-circuits and
  returns *all* accounts.
- **Machine callers** (API keys) use `adminDb`, which bypasses RLS; tenancy is
  enforced only by the key's `account_id` and `scopes` — see
  [Permissions](permissions.md). A `*:*` key reads every tenant.
- **Platform-scoped rows** carry the `spine-system` `account_id`, so under
  account-based RLS they are visible to the spine-system account subtree and
  to `system_admin` (who sees all accounts) — not to ordinary tenant users
  querying through `ctx.db`. Machine principals on `adminDb` reach them
  regardless, subject to key scopes.

## What is *not* scoped by account

- **Types are global.** `public.types` uniqueness is `(kind, slug)`
  (`.framework/migrations/015_types_kind_slug_unique.sql`) — deliberately not
  per-app or per-account, so `resolveTypeRecord(kind, slug)` `.single()`
  lookups stay deterministic and every account shares the same type registry.
- **Apps are global** rows in `public.apps`, linked to accounts only through
  `owner_account_id` and the `get_account_apps` RPC, which filters by the
  caller's role slugs (`.framework/functions/apps.ts`;
  `.framework/migrations/013_get_account_apps_role_filter.sql`).
- **Roles** are global slugs matched verbatim by the permission engine.

## Practical consequences

- Put `scope: 'platform'` only on types whose records should exist once for the
  whole installation (system config, shared registries) — never on tenant
  data.
- Child records inherit the parent's account and scope; you cannot re-tenant a
  record by pointing it at a parent in another account — the parent's account
  wins, silently.
- Because types are global, pick type slugs as if they were API names:
  `kind + slug` must be unique across every app installed in the deployment.
- Account-scoped tests and seeds must set `account_id` on every record or RLS
  will make them invisible to human-scoped queries.
