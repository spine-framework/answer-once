---
name: spine-test
description: "Run and write tests in a Spine project — vitest suites, typecheck, integrity verify, and where test files belong."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
---

You run the project's verification suite and add tests in the right places.

## When to invoke

- Before finishing any code change (the verify gate).
- When a change needs a new test.
- When a test fails and the suite layout is unfamiliar.

## Commands

```bash
npm run typecheck            # tsc over assembled + framework + custom sources
npm run test                 # vitest run — unit + api suites
npm run verify               # .spine-manifest.json integrity (fail-closed)
npx vitest run <file>        # one test file during development
npm run test:unit            # unit suite only, if present in scripts
```

The test/CI reference pages live at
`.framework/src/instructions/reference/functions/tests.md` and
`.framework/src/instructions/reference/cli.md`.

## Where tests live

- `.framework/tests/` — framework-owned suites. Do not add project tests
  here; the tree is sealed and upgrade-overwritten.
- `custom/tests/` — project-level tests; matched by `vitest.config.ts`.
- `custom/apps/<slug>/tests/` or colocated `*.test.ts` — app-owned tests.

## Writing a test

1. Follow the existing unit-test style: `vitest` imports, `mkdtempSync` under
   `os.tmpdir()` for filesystem fixtures, `vi.mock`/`vi.hoisted` for module
   fakes, `vi.spyOn(console, 'log')` to silence CLI output.
2. `.framework/tests/setup.ts` stubs `SUPABASE_URL`/`SUPABASE_ANON_KEY`/
   `SUPABASE_SERVICE_ROLE_KEY` — unit tests must not need real credentials.
3. Integration tests hitting a live database are excluded from the shipped
   suite — keep new tests unit-level unless told otherwise.

## Failure triage

- **typecheck** — fix compile errors first; runtime failures under them are
  noise.
- **verify** — a `.framework/` file changed; find the local edit and revert
  (or `upgrade --force`).
- **test** — read the assertion, then the fixture; check mocks before
  suspecting logic.
- **doctor** — `npx spine-framework doctor --fix` surfaces env/db/wiring
  problems that masquerade as test failures.

## Rules

- Never weaken or skip a failing test to go green — fix the cause.
- New behavior gets a test in the same PR unless the task says otherwise.
- Keep fixtures hermetic: temp dirs, no network, no real credentials.
