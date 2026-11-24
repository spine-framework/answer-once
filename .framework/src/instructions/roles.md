---
title: Roles
audience: both
kind: entity
verified_against: ba57738
verified_on: 2026-11-23
source_files:
  - .framework/functions/roles.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/auth.ts
  - .framework/functions/_shared/principal.ts
  - .framework/src/pages/admin/RolesPage.tsx
  - .framework/src/pages/admin/RoleDetailPage.tsx
  - .framework/migrations/003_core_system_data.sql
---

## What this is for

A **role** is a named principal category assigned to people (`people.role_id`). Its **slug** is what permission evaluation keys on: each type's `design_schema.record_permissions` maps role slugs to the record actions that role may perform. The role's own `permissions` column feeds `principal.permissions` for coarse gates.

## Why it exists

Multi-tenant SaaS needs per-account, per-app role definitions that RLS and the permission engine can enforce.

**Why it exists (5-whys):**

1. Permission vocabularies are domain-shaped — a support app's roles aren't a CRM's — and hardcoding them freezes domain into core.
2. `permissions` JSONB (a document per role) beats join tables here: role definitions are small, config-shaped, and read whole — the consumer needs "what can this role do?" in one row.
3. `UNIQUE(slug)` is global while `app_id`/`account_id` columns scope ownership — slugs resolve globally (`role_slug` lookups in `invites.ts`), but system roles are platform-wide while apps/accounts can define domain vocabularies.
4. `is_system` + `is_protected` keep framework roles (`system_admin`, `member`) intact — installs and seeds can't rewrite the vocabulary the platform depends on.
5. **Root:** permissions need a name before they need enforcement — `roles` is the shared vocabulary that `record_permissions`, `required_roles`, `min_role`, and RLS policies all dereference. *(confirmed 2026-11-13)*

## Fields and settings

- **Name** — string, required. Display label (e.g. "Support Manager"); `slug` and `name` are the API's required fields.
- **Slug** — string, required, unique per app. **Disabled after creation** because `record_permissions` keys and `people.role_id` references depend on it.
- **Description** — string, optional.
- **System Role** — checkbox, create-only. Reserved roles can't be deleted and are protected for core functions.
- **Active** — checkbox. Inactive roles can't be assigned to people.
- **Permissions (JSON)** — the form suggests an object mapping type slugs to action arrays (`{ "ticket": ["create","read"] }`), but the permission engine does **not** evaluate this column for record access — see Downstream effects. A **flat array** form (`["read","write","admin","system"]`) is what `auth.ts` copies into `principal.permissions`.

**Downstream effects**

- Record CRUD is governed by each type's `design_schema.record_permissions`, keyed by **role slug** — e.g. `"record_permissions": { "support-agent": ["read"] }`. Assigning a person a role takes effect immediately (the engine resolves `people.role_id → roles.slug` per request, short cache).
- `record_permissions` keys are matched **verbatim** against `roles.slug` — `system-admin` is a dead key that silently denies the real `system_admin` role. The `all` key is a wildcard granting every authenticated principal.
- `auth.ts` copies `role.permissions` into `principal.permissions` **only when it is a flat array** (`system_admin` is hardcoded to `["read","write","admin","system"]`). `principal.permissions` backs coarse checks like the invites `system` gate — not per-record access.
- Malformed permissions don't lock anyone out of records (the column isn't read for that) — a wrong `record_permissions` slug on the type does.
- Creating a role with slug `system_admin` is restricted to `system_admin` principals.

## Minimal configuration

```json
{
  "name": "Support Agent",
  "slug": "support-agent",
  "is_active": true,
  "permissions": { "ticket": ["create", "read", "update"] }
}
```

## Full configuration

```json
{
  "name": "Support Manager",
  "slug": "support-manager",
  "is_active": true,
  "is_system": false,
  "permissions": { "ticket": ["create", "read", "update", "delete"] },
  "metadata": { "department": "support" }
}
```

Both examples use the object form the UI suggests — it is stored as documentation/delegated-policy data. Record access still comes from each type's `record_permissions` under the same slug.

## Example

A support app ships three roles: `support-agent`, `support-manager`, and `support-viewer`. On the `ticket` type, `record_permissions` grants `support-agent` `["create","read","update"]`, `support-manager` all four actions, and `support-viewer` `["read"]`; assignment happens on `people` records via `role_id`.

## Core files

- `.framework/functions/roles.ts` — API (list/get/create/update/delete; `system_admin` slug creation gated)
- `.framework/functions/_shared/permissions.ts` — `record_permissions`/`fields.*.permissions` evaluation (role-slug keyed; `all` wildcard)
- `.framework/functions/auth.ts` / `.framework/functions/_shared/principal.ts` — `role.permissions` → `principal.permissions` (flat array only)
- `.framework/src/pages/admin/RolesPage.tsx` / `RoleDetailPage.tsx` — admin UI
- Table: `public.roles`; assignment on `public.people.role_id`

## Agent notes

- The Permissions textarea's own placeholder shows the object form — know that it is not what gates records. The gate is `record_permissions[role_slug]` on the type.
- Slug is immutable after create; rename = new role + reassignment. Never introduce a hyphenated `system-admin` slug — seeded slugs use underscores.
- The seeded `system_admin` role must stay assigned for admin functions; `auth.ts` hardcodes its principal permissions, it is not data-driven.
