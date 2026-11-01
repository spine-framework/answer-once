---
title: Permission Model
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/db.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/admin-data.ts
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/002_core_rls_and_functions.sql
  - .framework/migrations/003_core_system_data.sql
---

# Permission Model

Spine authorization is two independent layers, and the code says so verbatim:
**"RLS controls row access; design_schema controls what the principal can do.
No permissions granted = none given."** (`.framework/functions/_shared/permissions.ts`)

- **Row visibility (RLS):** Postgres policies scope every tenant table to the
  accounts the caller can reach — see [Scope and Accounts](scope-and-accounts.md).
- **Action authorization (`record_permissions`):** per request, the permission
  engine evaluates the caller's role against the schema **stamped on the
  record** to decide create/read/update/delete and per-field read/write.

## Principals

`.framework/functions/_shared/principal.ts` resolves two principal types:

- **Human** — Supabase JWT → `people` row → `role_id` join to `roles`; the
  principal carries `roles: [slug]` and gets a JWT-scoped DB client (`ctx.db`),
  so RLS applies.
- **Machine** — `x-api-key` header → `api_keys` row → `scopes` array and the
  key's `account_id`. Machine principals get `adminDb` (service role), which
  **bypasses RLS entirely**; their only authorization is the scope check.

## The three surfaces

`detectSurface` in `.framework/functions/_shared/permissions.ts` buckets the
target by table name:

| Surface | Covers | Rule |
|---|---|---|
| First (default) | runtime records — items, threads, messages, people, accounts, … | `record_permissions` on the record's stamped `design_schema` |
| Second | config objects — `apps`, `pipelines`, `triggers`, `ai_agents`, `embeddings`, `timers`, `integrations`, `roles`, `types`, `prompt_configs` | `system_admin` full access; machine principals read-only; everyone else denied |
| Third | system metadata — `logs`, `pipeline_executions`, `trigger_executions`, `link_types`, `links` | `system_admin`/machine full; humans read only their own/account rows |

## First-surface evaluation

`resolveFirstSurfacePermissions` runs on every runtime-record access:

1. **Schema source is the record.** The stamped `design_schema` on the record
   is authoritative; there is deliberately no fallback to the type row — a
   record with no schema or no `record_permissions` is denied.
2. **Role resolution.** The caller's role slug comes from
   `people.role_id → roles.slug` (one role per person, cached ~60s). No role,
   no permissions.
3. **Record grant.** `record_permissions[roleSlug]` is an array of actions
   (`create`, `read`, `update`, `delete`). The special key `'all'` is a
   wildcard evaluated for every authenticated principal — grants to `all`
   apply to anyone who passed RLS.
4. **Field merge.** For each declared field, `fields.<name>.permissions[role]`
   — an array drawn from `read`/`write` only — replaces the default. Fields
   **without** an entry default to `{ read: canRead, write: canUpdate }` from
   the record grant. That is why `record_permissions` is the base, most
   restrictive grant and field entries are *overrides*: an explicit `["read"]`
   on a field removes write access that `update` would otherwise give.

> **Role keys are matched verbatim.** `record_permissions` keys must be real
> `roles.slug` values — nothing normalizes them. The seeded admin slug is
> `system_admin` (underscore, `.framework/migrations/003_core_system_data.sql`);
> a `system-admin` key silently matches nobody and denies the admin.

## Enforcement points

- **Read** (`sanitizeFirstSurfaceRecordData`): `canRead` gates the record;
  `data` is filtered per field by `fieldPermissions[name].read`; values are
  formatted through `validation_schema` (`formatFieldData`); legacy `metadata`
  is stripped from responses. Records with an empty `fields` map pass through
  whole at the record grant.
- **Update** (`validateFirstSurfaceUpdatePermissions`): `canUpdate` gates the
  record, then **every key inside `data` must have `write`** — one denied field
  fails the whole update with a per-field error. Values are sanitized through
  `sanitizeFieldData` (type coercion + constraint checks; violations are
  errors, not silent drops). Top-level non-`data` keys pass through the gate.
  Writes therefore require both the record action *and* field-level write —
  undeclared fields have no `fieldPermissions` entry and 403.
- **Create** (`admin-data` `create`): permission is checked against the type's
  `design_schema` (which becomes the record's stamp) before insert;
  `type_id`/`type_slug` is required. A machine principal with `*:*` scope
  bypasses the create check.

## `system_admin` bypass

`isSystemAdmin` (`roles` contains `system_admin`) short-circuits record
access, sanitization, and update validation in `permissions.ts`, and gates the
`types.ts`/`roles.ts`/`apps.ts` write APIs entirely. The same slug drives the
RLS bypass inside `get_accessible_accounts` — system admins see all accounts.

## Machine (API key) scopes

`checkMachineScope` grants an action when the key's `scopes` contain
`resource:action` exactly, `resource:*`, or `*:*` (e.g. `items:read`,
`items:*`, `*:*`). Scopes are the *only* thing standing between a leaked API
key and `adminDb`, so issue the narrowest scope that works — `*:*` also
bypasses the create permission check in `admin-data`.

## Canonical example

The seeded pattern from the framework migrations — base grant first, field
override only where needed:

```json
{
  "record_permissions": {
    "system_admin": ["create", "read", "update", "delete"],
    "member_admin": ["create", "read", "update"],
    "member":       ["create", "read", "update"]
  },
  "fields": {
    "title":    { "data_type": "text",   "label": "Title",    "required": true,  "system": true },
    "status":   { "data_type": "select", "label": "Status",   "required": true,
                  "options": ["open", "closed"],
                  "permissions": { "member": ["read"] } },
    "internal_notes": { "data_type": "textarea", "label": "Internal Notes",
                  "required": false,
                  "permissions": { "member": [] } }
  }
}
```

Reading it: `member` can create and update records, so every declared field
defaults to read+write — except `status`, whose `["read"]` override strips
`member`'s write, and `internal_notes`, whose empty override hides it from
`member` entirely. `member_admin` touches neither override, so it inherits
record-level read+write on both. That is the whole discipline: **add a
`fields.*.permissions` entry only where the base grant is wrong for that
field** — usually to restrict a sensitive or `system: true` field, occasionally
to loosen one the base grant closes.

## See also

- [Design Schema](design-schema.md) — where `record_permissions` lives
- [Scope and Accounts](scope-and-accounts.md) — the RLS layer beneath this one
- [../roles.md](../roles.md) — the role entity (`permissions` on roles bound
  the *subject* side at the app/UI level)
