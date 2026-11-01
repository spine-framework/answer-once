---
title: system
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
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
  - `functions` is built by scanning a `v2-core/functions` directory for
    `.ts` files and assigning methods from blocklists (see Agent notes).
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
and the `v2-core/functions` + `v2-core/migrations_dayzero` directories
under `process.cwd()`. Database reads: `accounts` (health probe),
`public.schema_migrations`, `test_runs` — all via `adminDb`.

## Errors

The handler never throws for its own logic — database failures inside
`getManifest`/`getHealth` are swallowed into `applied: 0` / `pending`
counts and status flags. `createHandler` still surfaces middleware-level
errors (401 unauthenticated, 400 invalid JSON body).

## Agent notes

- **Stale paths:** `discoverFunctions` scans `v2-core/functions` and the
  migration checks scan `v2-core/migrations_dayzero` — `v2-core` is the
  pre-monorepo layout name; the live code lives under
  `.framework/functions` and `.framework/migrations`. In the current
  layout those directories do not exist, so `functions` returns `[]` and
  `migrations.pending` is always `0` (making `migrations.current` always
  true and `health` never degraded on migrations). Treat the manifest's
  `functions` list and pending count as unpopulated until this is fixed.
- The migration table queried is `schema_migrations`; the CLI migrator
  records to `_spine_migrations`, so `applied`/`latest` may also read
  empty — the query failure is swallowed silently.
- Because `verified` requires a readable `.spine-manifest.json` at the
  function's working directory, `health` reports `degraded` on deploys
  where the file is absent from the bundle.
- This endpoint answers "what is deployed" questions for agents: prefer
  `health` for a liveness signal and `manifest` for version/integrity; do
  not rely on `functions` or `openapi` path lists being complete.
