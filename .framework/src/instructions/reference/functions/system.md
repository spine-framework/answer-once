---
title: system
audience: developers, agents
kind: reference
verified_against: 799904c
verified_on: 2026-11-21
source_files:
  - .framework/functions/system.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/db.ts
---

# system

## What it does

Deployment introspection: a `manifest` action describing version,
migrations, and the function surface; a `health` action reporting
database/migration/integrity status; and an `openapi` action generating an
OpenAPI 3.1.0 document from discovered functions. Read-only — nothing here
mutates the database.

## Route and methods

`/.netlify/functions/system?action=<manifest|health|openapi>`.

`action` defaults to `manifest` when omitted. There is no method check —
any HTTP method dispatches the same way.

## Authentication

Wrapped in `createHandler`: any non-anonymous principal passes — human
Bearer JWT, machine `x-api-key`, or `x-internal-secret`. Anonymous → 401.
There is no role gate; every authenticated caller can read the manifest,
health, and OpenAPI output. All queries run on `adminDb`.

## Request contract

Query parameters only: `action` (optional, default `manifest`). No body is
read.

## Response contract

All responses arrive inside the middleware envelope
`{ data: { data: <payload> }, error: null, meta }` — the action functions
return `{ data: … }` objects which are wrapped again by `createHandler`.

- `manifest` → `{ version, schema: 'public', migrations: { applied,
  latest, pending }, functions: [{ name, methods, path, description }],
  integrity: { core_hash, verified } }`.
  - `version` comes from `.spine-manifest.json` in the process working
    directory (default `'2.0.0'` when missing or unparseable).
  - `integrity.core_hash` is `manifest.integrity.src`; `verified` is true
    only when the file exists and parses.
  - `functions` is built by scanning the assembly sources —
    `.framework/functions`, `custom/functions`, and
    `custom/apps/*/functions` — for `.ts` handler files (excluding
    `_`-prefixed shared helpers and `*.test.ts`/`*-test.ts`), and
    assigning methods from blocklists (see Agent notes).
- `health` → `{ status: 'healthy' | 'degraded' | 'unhealthy', checks:
  { database: { connected, latency_ms }, migrations: { current, pending,
  applied }, integrity: { verified }, test_runs? } }`.
  - `unhealthy` when the `accounts` probe query fails; `degraded` when
    migrations are pending or integrity is unverified; else `healthy`.
  - `test_runs` is the latest `test_runs` row (`suite`, `status`,
    `started_at`) when present.
- `openapi` → an OpenAPI `3.1.0` document (`info.title` = "Spine API",
  `info.version` = manifest version, `servers: ['/ .netlify/functions']`
  — see Agent notes) whose `paths` are generated from the discovered
  function list, each operation exposing an optional `action` query
  parameter and a placeholder object response schema.
- Unknown action → the handler returns `{ error: 'Unknown action: ….
  Valid actions: manifest, health, openapi', status: 400 }` **as data** —
  the HTTP response is still 200 because the value is returned, not
  thrown.

## Side effects

None on the database. The filesystem reads are: `.spine-manifest.json`,
`.framework/functions`, `custom/functions`, `custom/apps/*/functions`,
`.framework/migrations`, and `custom/migrations` under `process.cwd()`.
Database reads: `accounts` (health probe), `public._spine_migrations`,
`test_runs` — all via `adminDb`.

## Errors

The handler never throws for its own logic — database failures inside
`getManifest`/`getHealth` are swallowed into `applied: 0` / `pending`
counts and status flags. `createHandler` still surfaces middleware-level
errors (401 unauthenticated, 400 invalid JSON body).

## Agent notes

- **cwd-dependent filesystem data:** the function and migration lists
  and `.spine-manifest.json` are read from `process.cwd()`. Under
  `netlify dev` that is the project root and all lists populate; in a
  deployed Netlify function the project tree is not bundled (only
  `_shared/**` is included via `netlify.toml`), so `functions` returns
  `[]`, `version` falls back to `'2.0.0'`, `integrity.verified` is
  `false` (reporting `degraded`), and `migrations.pending` counts only
  DB truth — `applied`/`latest` still read correctly from
  `_spine_migrations` anywhere.
- `pending` compares local `.sql` filenames against
  `_spine_migrations.filename` — the ledger the CLI migrator writes.
  Method assignment is a blocklist heuristic (read-only-ish names like
  `logs`, `tests`, `system-cron`, `debug-auth`, `auth` get fewer
  methods); it approximates, it does not enforce.
- This endpoint answers "what is deployed" questions for agents: prefer
  `health` for a liveness signal and `manifest` for version/integrity;
  expect `functions`/`openapi` path lists to be complete only when the
  project tree is visible (local dev).
