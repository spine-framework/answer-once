---
title: Add a role
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/roles.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/003_core_system_data.sql
  - .framework/migrations/009_roles_slug_unique.sql
---

# Add a role

## Goal

Create a `public.roles` row whose slug you can reference from
`record_permissions` in type design schemas, `min_role`/`required_roles` on
apps, and `role:<slug>` notification recipients.

## Prerequisites

- A `system_admin` login — role create/update/remove requires it
  (`.framework/functions/roles.ts`).

## Steps

1. **Pick the slug.** Lowercase snake_case (`support_agent`). It is matched
   verbatim as a key inside every type's `record_permissions` and is
   effectively immutable — the admin UI disables slug editing after creation.
   Uniqueness is enforced at both the API layer (duplicate-slug check before
   insert) and the database (`UNIQUE(slug)`,
   `.framework/migrations/009_roles_slug_unique.sql`).

2. **Decide the permissions payload.** `roles.permissions` is a JSON
   document on the role row (`permissions jsonb` on the table,
   `.framework/migrations/001_core_schema.sql`). Seeded roles carry
   `'["*"]'` — a wildcard grant. Per-type grants are expressed on the
   **type** side (`design_schema.record_permissions` keys are role slugs),
   which is what `admin-data` evaluates per request — see
   [Permission model](../concepts/permissions.md).

3. **Create the role.** Admin UI → **Configs → Roles → New**
   (`configs/roles/new`), or `POST /api/roles` with
   `{ slug, name, permissions, is_system }` — `slug` and `name` are required
   (`.framework/functions/roles.ts`). The `system_admin` slug itself
   is protected: only a system admin may create it
   (`.framework/functions/roles.ts`).

4. **Reference the role.** Add its slug to each type's
   `design_schema.record_permissions`, to `apps.min_role` /
   `apps.required_roles`, and to `send_notification` stage recipients as
   `role:<slug>` (resolved via `people.role_id → roles.slug` — see
   [Automation](../concepts/automation.md)).

5. **Assign it to people.** A person's `role_id` joins to `roles`; the
   permission engine resolves `people.role:role_id(slug)` and evaluates
   `record_permissions` against that slug
   (`.framework/functions/_shared/permissions.ts`).

## Verify

- `GET /api/roles?action=list` returns the row; `slug` is unique and active.
- Create or update a type whose `record_permissions` includes the new slug,
  then perform an `admin-data` call as a person holding the role — the
  action is permitted.
- `system_admin` users see all roles regardless of `is_active` filters.

## Common mistakes

- **`system-admin` vs `system_admin`.** All seeded slugs are snake_case:
  `system_admin`, `member`, `member_admin`, `engineering`,
  `engineering_admin`, `product`, `docs`, `qa`, `devops`, `management`,
  `sales`, `csm`, `tam`, `support`, `support_admin`
  (`.framework/migrations/003_core_system_data.sql`,
  `.framework/migrations/073_seed_member_roles.sql`).
  Using hyphens in `record_permissions` grants nothing.
- **Expecting `roles.permissions` to gate `admin-data`.** Record-level
  grants live on the type's `record_permissions`; the role row's
  `permissions` JSON is not consulted per-request for record CRUD.
- **Renaming a slug later.** Every type's `record_permissions` and every
  app's `min_role`/`required_roles` reference the slug verbatim — a rename
  orphans the grants. Create a new role and migrate people instead.
- **Creating `system_admin` via API as a non-admin** — explicitly blocked.
- **Deactivating a role with live assignees** — the slug stops resolving to
  a grant for those people; check `people.role_id` usage first.

## Reference

- [roles entity page](../roles.md) ·
  [roles function reference](../reference/functions/roles.md)
- [Permission model](../concepts/permissions.md) ·
  [Add a type](./add-a-type.md)
- [Database reference](../reference/database.md) for the `roles` columns
