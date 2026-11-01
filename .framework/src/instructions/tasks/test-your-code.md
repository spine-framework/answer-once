---
title: Test your code
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - vitest.config.ts
  - .framework/tests/setup.ts
  - .framework/tests/reporter.ts
  - package.json
  - config/tsconfig.json
  - config/tsconfig.functions.json
---

# Test your code

## Goal

Run the Vitest suite and the TypeScript checks, and place new tests where
the runner picks them up.

## Steps

1. **Know the runners** (`package.json` scripts):

   - `npm run test` → `vitest run` — everything matching the `include`
     globs in `vitest.config.ts`: `.framework/tests/unit/**/*.test.ts`,
     `.framework/tests/api/**/*.test.ts`, `.framework/tests/integration/**/*.test.ts`,
     and `custom/tests/**/*.test.ts`.
   - `npm run test:unit` — the unit suite only.
   - `npm run test:integration` — the integration suite (needs real env,
     see below).
   - `npm run test:core` — the core-isolation suite.
   - `npm run typecheck` → `tsc -b config/tsconfig.json` — frontend +
     CLI. Functions are **not** covered here: check them separately with
     `npx tsc --noEmit -p config/tsconfig.functions.json` after
     `npm run assemble` (it typechecks the assembled layout).
   - `npx spine-framework test [suite]` — the CLI wrapper
     (`--watch`, `--reporter`, `--json`; see [CLI reference](../reference/cli.md)).

2. **Put tests where the globs look.** New project tests belong in
   `custom/tests/**/*.test.ts` — picked up automatically, and they keep
   `.framework/` untouched. Framework-level additions go under
   `.framework/tests/unit/`. Test files inside `custom/functions/` are
   excluded from function assembly (`*-test.ts`, `*.test.ts` are skipped
   by `scripts/assemble-functions.sh`), but naming convention is still
   `*.test.ts`.

3. **Understand the env layering.** `vitest.config.ts` loads a root
   `.env.test` file (if present) into `process.env` **before** any module
   graph runs — that is how integration/API tests get real Supabase
   credentials before `db.ts`/`principal.ts` call `createClient` at import
   time. `.framework/tests/setup.ts` then stubs `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` so unit tests never
   crash on missing env. Integration helpers additionally require
   `SPINE_TEST_ACCOUNT_ID`; API-surface tests use `SPINE_DEV_URL`,
   `SPINE_DEV_JWT`, `SPINE_TEST_API_KEY` (see
   [Environment variables](../reference/env-vars.md)).

4. **Mock at module boundaries.** The config sets `isolate: true` — every
   test file gets a fresh module registry, so `vi.mock` on
   `./_shared/db`-style imports works per file. Existing unit suites mock
   the Supabase client, principal resolution, and the LLM/embedding calls
   rather than hitting the network (browse `.framework/tests/unit/` for
   patterns — `pipeline-runner.test.ts`, `permissions.test.ts`,
   `principal-cache.test.ts`).

5. **Integration tests need a real project.** They exercise admin-data,
   triggers, pipelines, and schema validation against a live Supabase
   project using a service-role client and a seeded test account —
   `custom/tests` and the unit suite run with no credentials, the
   integration suite does not. `passWithNoTests: true` means a missing
   env never fails the suite outright, so check that tests actually ran.

## Verify

- `npm run test` exits 0; `vitest` prints per-file pass counts. A custom
  reporter that persists runs to `public.test_runs` exists at
  `.framework/tests/reporter.ts` but is **not** registered — the config
  uses `reporters: ['default']`, so opt in with `--reporter` if you want
  persisted runs.
- `npm run typecheck` and
  `npx tsc --noEmit -p config/tsconfig.functions.json` are both clean.
- `npx spine-framework doctor` sanity-checks the environment when tests
  behave oddly ([CLI reference](../reference/cli.md)).

## Common mistakes

- **`typecheck` doesn't cover functions.** `config/tsconfig.json` excludes
  the functions project by design — always run the
  `tsconfig.functions.json` check too, and only after `npm run assemble`.
- **Assuming integration tests ran.** With no `.env.test`, integration
  files that can't build a client may skip silently — grep the output for
  your file's pass count.
- **Importing `createClient` at module top-level in a unit test.** Setup
  stubs the env, but a module that builds a client at import time before
  `setupFiles` runs still fails — mock the module or import lazily.
- **Writing repo-only paths into `custom/tests`** — tests there must run
  in an installed project too; import from `custom/` and assembled
  aliases, not from repo internals.

## Reference

- [CLI reference](../reference/cli.md) — `test`, `doctor`
- [Environment variables](../reference/env-vars.md) — `SPINE_TEST_*`,
  `SPINE_DEV_*`, `SUPABASE_*`
- [Write a function](./write-a-function.md) — assembled-layout imports
