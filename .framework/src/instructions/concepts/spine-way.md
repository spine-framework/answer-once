---
title: The Spine Way
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - scripts/boundary-check.sh
  - config/vite.config.ts
  - config/tsconfig.json
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/db.ts
  - .framework/cli/commands/migrate.ts
  - .framework/cli/commands/upgrade.ts
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/002_core_rls_and_functions.sql
  - .framework/migrations/011_spine_system_account.sql
  - .framework/src/hooks/useEntityRecord.ts
  - .framework/src/components/app-shell/GenericDetailPage.tsx
---

# The Spine Way

Ten rules every app, function, migration, and type must satisfy to stay aligned
with the framework. Each rule is stated as a quotable invariant, followed by
why it exists and what actually breaks when you violate it. Deeper treatment of
each topic lives in the sibling concept pages.

## 1. Core never imports from custom

`.framework/` must not import from `custom/`, `custom_*` modules, or hardcode
custom app slugs.

**Why:** `.framework/` is a sealed, upgradeable npm package — it must run
identically in every project.

**Breaks:** `scripts/boundary-check.sh` fails the build (checks 1–3), and the
next `upgrade` either aborts on locally modified framework files or silently
overwrites the coupling.

## 2. Custom code imports core through `@core/*`, never relative paths

Custom frontend code uses `@core/components/...`, `@core/hooks/...`; custom
functions import `./_shared/...` after assembly (`@shared/*` in
`config/tsconfig.functions.json`).

**Why:** `@core` maps to `.framework/src` in `config/tsconfig.json` and to the
assembled tree in `config/vite.config.ts` — the two roots custom code is
actually built against.

**Breaks:** `scripts/boundary-check.sh` check 2b flags relative `../.framework`
imports in `custom/`, and paths that resolve today break the moment the
assembly layout changes.

## 3. Apps are registered data, not static imports

An app is a `manifest.json` plus a row in `public.apps`; the shell mounts it at
runtime by `route_prefix` and `renderer`.

**Why:** registration is what makes an app discoverable, permissionable
(`min_role` / `required_roles`), and toggleable (`is_active`) without a core
redeploy.

**Breaks:** statically importing an app component into `.framework/src/`
violates rule 1 and bypasses the role gate in
`.framework/src/components/AppWrapper.tsx` — the app is always visible and
always mounted.

## 4. Runtime record CRUD goes through `/api/admin-data`

All creates, reads, updates, and deletes of `items`, `threads`, `messages`,
`links`, `attachments`, `watchers`, `people`, `accounts` go through the single
`admin-data` endpoint.

**Why:** that endpoint is where type resolution, `design_schema` stamping,
permission evaluation, audit logging, and trigger dispatch actually live — see
`.framework/functions/admin-data.ts`.

**Breaks:** a custom function wrapper skips record permissions, field-level
write gates, `validation_schema` sanitization, audit rows, and create/update
triggers — the record lands in the table but nothing that should have run ran.

## 5. Behavior lives in `design_schema`, not handler branches

Fields, views, record permissions, scope, and functionality bindings belong on
the type's `design_schema`; the runtime stamps a copy onto every record at
creation.

**Why:** the permission engine and generic renderers read the schema off the
record — `.framework/functions/_shared/permissions.ts` denies outright when a
record has no stamped `record_permissions`.

**Breaks:** hardcoded per-type branches can't be permissioned, can't render in
the generic UI, and drift from the stamped schema records already carry.

## 6. `record_permissions` is the base grant; field permissions are overrides

Start with the most restrictive `record_permissions` per role. A field without
a `fields.<name>.permissions` entry inherits `read` from `canRead` and `write`
from `canUpdate`; only add a field-level entry to change that default.

**Why:** the merge in `resolveFirstSurfacePermissions` applies the override
verbatim — `["read"]` on a field removes `write` for that role even when the
record grant allows it.

**Breaks:** re-stating record-level grants per field silently locks fields, and
leaving `system: true` fields un-overridden lets any record-writer modify
columns like `status` or `slug`.

## 7. RLS decides which rows you see; design_schema decides what you can do

Every tenant table has RLS enabled and policies scope rows through
`get_accessible_accounts(current_actor_id())`. Human requests query through
`ctx.db` (JWT-scoped); `adminDb` bypasses RLS and is reserved for service-role
work.

**Why:** this is the second, independent layer of authorization — RLS cannot
express per-type, per-role, per-field grants.

**Breaks:** a table without RLS leaks every tenant's rows to every caller; a
handler that uses `adminDb` "for convenience" turns your permission model into
decoration.

## 8. Migrations are idempotent and ordered

Filenames are `NNN_description.sql`; every statement must be safe to re-run
(`CREATE ... IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `ON CONFLICT DO NOTHING`,
guarded `DO $$` blocks). `migrate` applies `.framework/migrations` first, then
`custom/migrations`, each sorted by name.

**Why:** the same migration set runs against fresh and existing databases, and
later migrations legitimately depend on earlier objects.

**Breaks:** a non-idempotent migration fails on second run and wedges every
environment that already applied it; unordered migrations crash on missing
dependencies.

## 9. `system: true` fields live on the record; everything else lives in `data`

Fields declared `system: true` read and write top-level record columns
(`record.title`); all other fields live inside `record.data.<field>`.

**Why:** the split is how the platform separates framework-owned columns from
app-defined data — `.framework/src/hooks/useEntityRecord.ts` splits form data
by `fieldDef.system` on every save, and
`.framework/src/components/app-shell/GenericDetailPage.tsx` reads the same way.

**Breaks:** sending a non-system field as a top-level key writes it outside the
field-permission gate's `data` object (invisible to renderers); sending a
system field inside `data` never reaches its column.

## 10. Secrets and service keys stay on the backend

Browser code may use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only.
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`, and app secrets appear
only in `.framework/functions/`, `.framework/cli/`, and uncommitted env files.

**Why:** `adminDb` is a service-role client — whoever holds the service key
holds an RLS bypass for the entire database.

**Breaks:** a service key bundled into frontend code is a credential leak with
full read/write on every tenant's data; committed env files leak it to every
clone of the repo.

## Applying the rules

Before shipping a change, walk the list and check each rule that could apply.
When a rule genuinely must bend, prefer the weakest violation (data over code,
config over core) and document it — most "exceptions" turn out to be a missing
`design_schema` section or a missing app manifest entry.
