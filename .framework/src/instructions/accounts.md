---
title: Accounts
audience: both
kind: entity
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/functions/account-nodes.ts
  - .framework/src/lib/api.ts
  - .framework/src/lib/registration.ts
  - .framework/cli/commands/install-app.ts
---

# Accounts

## What this is for

An **account** is the tenant boundary — nearly every scoped row in the
database hangs off one `account_id`. Accounts form hierarchies (a parent
account plus descendants), and a person may access several accounts and
switch between them. Record `scope: "account"` in a type's `design_schema`
means "rows belong to the active account"; `scope: "platform"` means the
spine-system account.

## Fields and settings

| Column | Notes |
|---|---|
| `slug` | UNIQUE — stable identifier (`spine-system` is the platform account). |
| `display_name` | Human name shown in the account switcher. |
| `parent_id` | FK → `accounts` — places this account in the hierarchy. |
| `type_id` | Accounts are typed records; the type's `design_schema` governs `data`. |
| `data` | jsonb — type-defined fields. |
| `logs_retention_days`, `observability_retention_days` | Per-account retention knobs. |

**Hierarchy mechanics**

- `account_paths` is the closure table (`ancestor_id`, `descendant_id`,
  `depth`) — ancestors/descendants resolve via
  `get_account_ancestors`/`get_accessible_accounts` RPCs, not recursive
  queries you write.
- `GET /api/account-nodes?node_id=<id>` returns a node with its
  `type:types(...)` join, ancestors, and children — the admin tree view's
  data source.

**The active account**

- The client sends `X-Account-Id` on every `apiFetch` (set by AuthContext
  via `setAccountId`). Server-side `ctx.accountId` scopes reads/writes and
  `current_actor_id()`-based RLS.
- `user.accessible_accounts` lists the accounts a person may switch
  between; switching is a client-side `setAccountId` change, not a
  re-login.

**App-driven placement**

- A manifest `registration` block decides where new accounts/people land:
  `account_strategy: 'new' | 'existing'`, `parent_account`,
  `target_account`, `default_workspace_name`. The installer syncs it to
  `apps.config.registration` + `spine.config.json` (see
  [App manifest reference](reference/app-manifest.md)).

## Minimal configuration

`slug`, `display_name`, `type_id`, plus `parent_id` when it isn't a root
account.

## Full configuration

Adds `data` fields from the account type's `design_schema`, retention
settings, and hierarchy position via `parent_id`/`account_paths`.

## Example

A white-label app registers with `account_strategy: 'new'` +
`parent_account: 'spine-system'`: each new customer signup provisions a
child account under the platform account; support staff in the parent see
all children through the account switcher while customers stay scoped.

## Core files

- `.framework/migrations/001_core_schema.sql` — `accounts` +
  `account_paths` closure table
- `.framework/functions/account-nodes.ts` — node + ancestors + children API
- `.framework/src/lib/api.ts` — `X-Account-Id` on every request
- `.framework/src/lib/registration.ts` — signup → placement
- `.framework/cli/commands/install-app.ts` — `registration` → config sync

## Agent notes

- Scope confusion is the #1 tenancy bug: a record created under the wrong
  `account_id` is invisible to the right users — always confirm which
  account is active before writing.
- `spine-system` is the platform account; `scope: "platform"` types and
  system roles live there. Do not put tenant data in it.
- Never hand-maintain `account_paths` — it is derived from `parent_id`.
