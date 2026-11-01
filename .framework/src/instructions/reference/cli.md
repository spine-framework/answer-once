---
title: CLI Reference
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/cli/index.ts
  - .framework/cli/context.ts
  - .framework/cli/commands/agents.ts
  - .framework/cli/commands/auth.ts
  - .framework/cli/commands/bootstrap.ts
  - .framework/cli/commands/create-app.ts
  - .framework/cli/commands/doctor.ts
  - .framework/cli/commands/init.ts
  - .framework/cli/commands/install-app.ts
  - .framework/cli/commands/items.ts
  - .framework/cli/commands/migrate.ts
  - .framework/cli/commands/migrations.ts
  - .framework/cli/commands/pipelines.ts
  - .framework/cli/commands/status.ts
  - .framework/cli/commands/system.ts
  - .framework/cli/commands/test.ts
  - .framework/cli/commands/upgrade.ts
  - .framework/cli/commands/validate-app.ts
  - .framework/cli/commands/validate-schema.ts
  - .framework/cli/commands/dev.ts
  - .framework/cli/commands/generate.ts
---

# CLI Reference

`spine-framework` is the project CLI (bin entry `.framework/cli/bin.mjs` →
`.framework/cli/index.ts`, Commander.js). Run it as `npx spine-framework …`
or via the project script `npm run spine-framework -- …`.

Global behaviors:

- `--account <id>` on the root program overrides the account scope.
- Most read commands accept `--json` for machine output.
- Credential resolution lives in `.framework/cli/context.ts`: DB-backed
  commands need `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; remote commands
  authenticate with `SPINE_CLI_API_KEY` or `SPINE_CLI_JWT`; see
  [Environment Variables](env-vars.md).
- `.env` in the project root is preloaded by the bin wrapper before any
  command module evaluates.

## Project lifecycle

| Command | What it does |
|---|---|
| `init [dir]` | Scaffolds a Spine project: copies framework files, creates `custom/` workspace dirs (`apps`, `functions`, `components`, `migrations`, `tests`), writes `package.json`/`package-lock.json`, agent files. Refuses to run over an existing `.framework/` |
| `bootstrap` | Provisions the first `system_admin` (person bound to `spine-system`, same columns the `handle_new_auth_user` trigger writes) and mints the first `sk_` API key — fully scriptable, no browser. `--email`/`--password` also creates a confirmed auth user via `auth.admin.createUser` (UI-login capable); without them the person row is DB-only. `--scope <scope>` is repeatable (default `*:*` = system_admin), `--name`, `--full-name`, `--json`. Idempotent: an existing `system_admin` skips person creation; each run mints one new key (hash stored, raw key printed once) |
| `upgrade` | Syncs project files to the `spine-framework` version in `node_modules`. `--dry-run` reports without writing; `--force` overwrites locally modified framework files |
| `status` | Shows installed apps and framework version (`--json`) |
| `doctor` | Validates installation health (env, files, DB reachability). `--fix` prints repair instructions; `--ticket <id>` attaches a sanitized diagnostic report to a support ticket |
| `test [suite]` | Runs Vitest suites. `--watch` for unit/integration; `--reporter <name>`; `--json` |
| `dev` | Runs `scripts/assemble.sh`, verifies integrity (`--no-verify` skips), then starts Vite via `config/vite.config.ts` on `--port` (default 3001; `--host` exposes to network) — equivalent to `npm run dev`. `--netlify` runs `scripts/dev-netlify.sh` instead (functions + UI on :8888, equivalent to `npm run dev:netlify`; `--port`/`--host` are ignored). Watches `custom/` and re-assembles on change; `--no-watch`, `--watch-delay <ms>` |

## Database

| Command | What it does |
|---|---|
| `migrate` | Applies pending `.framework/migrations/` then `custom/migrations/` SQL files in filename order, tracked in the `_spine_migrations` ledger table, one transaction per file. `--db-password` (default `SUPABASE_DB_PASSWORD`), `--dry-run`, `--framework-only` (skip `custom/`) |
| `migrations list` | Lists applied migrations from `supabase_migrations.schema_migrations` (`--json`) |
| `migrations status` | Diffs local migration files against applied ones (`--json`) |

## App management

| Command | What it does |
|---|---|
| `install-app <package>` | `npm install`s the package, copies `index.tsx`, `manifest.json`, `package.json`, `pages`, `components`, `hooks`, `utils`, `functions`, `seed`, `public` into `custom/apps/<slug>/` (on reinstall `manifest.json` is preserved — use `update-db-app` to sync it), runs migrations, then seeds and syncs registration. `--no-seed` installs files only; `--reconcile-owned-types` prompts to update manifest-owned types whose DB `design_schema` drifted |
| `uninstall-app <package>` | Removes `custom/apps/<slug>/` and `npm uninstall`s the package. **`--keep-data` is currently a no-op — the command never deletes seeded DB rows** |
| `update-app <package>` | `npm install <pkg>@latest`, re-copies app files into `custom/apps/<slug>/`, re-syncs registration config |
| `update-db-app <slug>` | Upserts the `apps` row and registration from local `manifest.json` — no npm, no file copies |
| `seed-app <slug>` | Runs only the manifest `seed` block (plus registration sync). `--reconcile-owned-types` as above |
| `validate-app [path]` | Validates app structure and `manifest.json`. `--fix` is declared but **not implemented** |
| `create-app <slug>` | Scaffolds a new custom app in `custom/apps/<slug>/` (index, manifest, starter pages). `--name`, `--role`, `--force` |
| `validate-schema <file>` | Validates a `design_schema` JSON file against the field/view/permission rules. `--no-views` skips `default_list`/`default_detail` requirements (for custom apps); `--json` |

## Runtime data

These commands talk to a running instance via the API
(`SPINE_CLI_API_KEY`/`SPINE_CLI_JWT` + `SUPABASE_URL`).

| Command | What it does |
|---|---|
| `auth whoami` | Prints the resolved principal for the current env config (`--json`) |
| `auth check` | Exits 0 when credentials resolve, 1 otherwise — CI gate |
| `items list` | Lists items. `--type <slug>`, `--account`, `--limit`, `--json` |
| `items get <id>` | Fetches one item (`--json`) |
| `items create` | `--type <slug>`, `--data <json>`, `--title`, `--account` |
| `items update <id>` | `--data <json>` partial update, `--title` |
| `items delete <id>` | Soft-deletes (`is_active = false`); `--hard` permanently removes |
| `pipelines list` | Lists active pipelines. `--all` includes inactive; `--account`, `--json` |
| `pipelines get <id>` | Pipeline detail (`--json`) |
| `pipelines run <id>` | Executes a pipeline. `--data <json>` trigger payload, `--account` |
| `pipelines executions <id>` | Recent executions. `--limit`, `--json` |
| `agents run <threadId>` | Sends a message to an agent thread and returns the response. `--message` required, `--account`, `--json` |
| `agents threads list` | Lists agent threads. `--account`, `--limit`, `--json` |
| `agents threads get <id>` | Thread detail + recent messages. `--limit`, `--json` |

## System

| Command | What it does |
|---|---|
| `system manifest` | Fetches the instance manifest (version, functions, migrations) from the `system` function (`--json`) |
| `system health` | Fetches health-check status (`--json`) |
| `system openapi` | Fetches the OpenAPI specification |

## Removed commands

These commands remain registered so callers get a clear message instead of
silent failure — do not build workflows on them.

| Command | Status |
|---|---|
| `generate [slug]` | **Removed.** Previously wrote type/handler/page stubs to a `v2-custom/` tree and emitted a legacy `design_schema` shape — both dead. Now prints migration guidance (`create-app` for apps; admin UI or `POST /api/types` + `validate-schema` for types) and exits 1 |

## Related

- `.framework/cli/index.ts` — command registration
- `.framework/cli/context.ts` — credential and account resolution
- [Seeds](seeds.md) · [App Manifest](app-manifest.md) · [Environment Variables](env-vars.md)
