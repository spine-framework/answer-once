---
title: Seeds Reference
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/cli/commands/install-app.ts
  - .framework/cli/commands/migrate.ts
  - .framework/functions/_shared/app-manifest.ts
  - .framework/seeds/types/spine_instance.json
  - .framework/seeds/link_types/account_cli_instances.json
  - .framework/migrations/003_core_system_data.sql
  - .framework/migrations/053_builtin_action_seeds.sql
---

# Seeds Reference

Seeds are JSON row files that materialize an app's database contract — types,
roles, link types, agents, prompt configs, pipelines, triggers — at install
time. They are distinct from migrations: **migrations are SQL and change
schema; seeds are data and are applied by the app installer.**

## Where seeds live

| Location | Contents | Format |
|---|---|---|
| `custom/apps/<slug>/seed/*.json` | app-owned rows, declared in `manifest.json` `seed[]` | JSON **array** of row objects |
| `.framework/seeds/` | framework-owned seed payloads (e.g. `.framework/seeds/types/spine_instance.json`, `.framework/seeds/link_types/account_cli_instances.json`) | single JSON object per file |
| `.framework/migrations/` | system rows written by SQL (`003_core_system_data.sql` seeds roles/types/apps; `053_builtin_action_seeds.sql` seeds `public.actions`) | SQL `INSERT … ON CONFLICT DO NOTHING` |

## When seeds run

Seeds are applied by `seedApp` in `.framework/cli/commands/install-app.ts`:

| Command | Runs seeds? |
|---|---|
| `install-app <pkg>` | yes — after `runMigrations` succeeds, unless `--no-seed`. Migration failure aborts before seeding; without `SUPABASE_URL`/`SUPABASE_DB_PASSWORD` only `--no-seed` installs may proceed |
| `seed-app <slug>` | yes — seed block only, no npm, no file changes |
| `update-db-app <slug>` | no — upserts the `apps` row and syncs `registration` only |
| `update-app <pkg>` | no — refreshes files from npm only |
| `migrate` | no — migrations apply SQL only; system seeds inside migrations run as SQL |
| `uninstall-app <pkg>` | no — removes files and the npm dependency; it does not delete seeded rows |

Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; seeding uses the
service-role client and bypasses RLS.

## Apply order

Entries are stable-sorted by `SEED_TABLE_ORDER`
(`.framework/cli/commands/install-app.ts`), regardless of declaration order:

1. `roles`
2. `types`
3. `permissions_patch` entries (rank 1.5 — always after types)
4. `link_types`
5. `actions`
6. `ai_agents`
7. `prompt_configs`
8. `pipelines`
9. `triggers`
10. unknown tables — last, in declared order

Ordering exists so dependents resolve: a `triggers` row's `pipeline_slug` is
looked up in `public.pipelines` (scoped to this app's `app_id`) and rewritten
to `pipeline_id`, and a `pipelines` row's `stages[].stage_type` is validated
against `public.actions` — so a bad stage type fails at install, not at first
trigger fire.

## Per-entry behavior

Each record is upserted into `entry.table` with `onConflict: entry.conflict`.

- **`inject_app_id`** (default `true`): stamps `app_id` on every row. Set
  `false` for global rows — `types` seeds use `conflict: "kind,slug"` with
  `inject_app_id: false` because type slugs are global, not per-app.
- **`ignore_duplicates`**: rows that conflict are skipped, not updated.
  Always forced on for `types` (the read-then-compare below decides the real
  outcome) and opt-in per entry via `ignore_duplicates: true`.
- **`types` rows are never silently overwritten.** Before each types upsert
  the existing row is read: an identical `design_schema` skips cleanly; a
  differing one throws — unless the slug is declared in
  `manifest.owned_types` and `--reconcile-owned-types` was passed, which
  prompts `[U]pdate / [K]eep` and merges (`seed` wins shared fields,
  DB-only fields are preserved) with a regenerated `validation_schema`.
- **`permissions_patch` rows** (`{kind, slug, record_permissions}`) replace
  `design_schema.record_permissions` on an existing type after a
  `[R]eplace / [K]eep` prompt; grant lists may only contain
  `create`/`read`/`update`/`delete`. A `seed/type_permissions.json` file is
  auto-declared when no patch entry exists.
- **`types` seeds get a fresh `validation_schema`** generated from
  `design_schema` at apply time — author `design_schema` only.
- **`pipelines` seeds** are validated before upsert: every `stages[].stage_type`
  must exist in `public.actions`; `send_notification`/`send_email`
  `config.recipients` must be `role:<slug>`, `self`, `owner`, `watchers`, a
  person UUID, or (email only) an email address.
- **`triggers` seeds** may use `pipeline_slug`; it is resolved to
  `pipeline_id` within the app's pipelines and removed before upsert.

## Failure model

Seeding is fail-closed: a malformed manifest, a missing declared seed file,
an unparseable file, a non-array file, a missing referenced
type/pipeline/role, or any row-write error throws and aborts the run. Files
not declared in `manifest.seed` are skipped silently (except the auto-added
`type_permissions.json`). All validation runs **before** the database client
is created, so bad input produces zero writes.

After all entries apply, `syncAppRegistration` writes the resolved
`registration` policy to `apps.config.registration` and `spine.config.json`.

## Authoring checklist

- [ ] Every `seed[]` entry's `file` exists inside the app dir and parses as a JSON array of objects
- [ ] `conflict` names real unique columns (`slug` for roles; `kind,slug` for types; `app_id,slug` for app-scoped config tables)
- [ ] `types` rows have a complete `design_schema` — see [Design Schema](design-schema.md); `validation_schema` is generated
- [ ] `inject_app_id: false` on `types` entries
- [ ] `pipeline_slug` used in trigger seeds; pipelines seeded (they always apply first)
- [ ] `owned_types` declared in the manifest for any type the app must reconcile
- [ ] `manifest.seed` omitted only when the conventional trio (`seed/roles.json`, `seed/types.json`, `seed/link-types.json`) covers everything

## Related files

- `.framework/cli/commands/install-app.ts` — `seedApp`, `SEED_TABLE_ORDER`, `reconcileOwnedType`, `validatePipelineSeedStages`
- `.framework/cli/commands/migrate.ts` — migration runner (SQL only)
- [App Manifest](app-manifest.md) · [CLI](cli.md) · [Design Schema](design-schema.md)
