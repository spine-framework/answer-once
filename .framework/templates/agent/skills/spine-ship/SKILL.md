---
name: spine-ship
description: "Ship a green commit up the project's ## Environments ladder in AGENTS.md — pre-flight checks, per-rung gate/migrate/promote/post-landing — stopping GREEN or RED at the hand-off rung."
verified_against: 9d16176
verified_on: 2026-11-22
allowed-tools:
  - read
  - exec
  - grep
  - find_file_by_name
  - edit
  - write
depends_on:
  files:
    - AGENTS.md
    - .framework/src/instructions/tasks/declare-your-environments.md
    - .framework/src/instructions/tasks/write-a-smoke-test.md
    - .framework/src/instructions/operations/deployment.md
    - .framework/src/instructions/operations/migrations.md
    - .framework/src/instructions/reference/cli.md
    - .framework/src/instructions/reference/env-vars.md
  commands:
    - "npm run test"
    - "npm run typecheck"
    - "npm run verify"
    - "npx spine-framework auth check"
    - "npx spine-framework bootstrap"
    - "npx spine-framework doctor"
    - "npx spine-framework migrate"
    - "npx spine-framework migrations status"
    - "npx spine-framework seed-app"
    - "npx spine-framework system health"
    - "npx spine-framework system manifest"
---

You ship a Spine project up its environment ladder — the `## Environments`
section the project declares in `AGENTS.md` below the
`<!-- spine-framework:end -->` marker.

## When to invoke

- The developer says ship / deploy / promote / take this to staging.
- A commit is green locally and needs to reach the next environment.

This skill is the walk, not the release. It ends at the ladder's hand-off
rung; what happens after the developer says "release it" is the project's
own release procedure, which lives outside this skill.

## The ladder

Read `## Environments` in `AGENTS.md`. Rungs are `### <n>. <name>`
headings in promotion order, each with fixed fields:

- **Target:** — where the rung lands (site URL; Supabase ref for remote
  rungs)
- **Gate:** — what must be true before promoting to this rung
- **Promote by:** — the action that lands the change
- **Post-landing:** — checks that prove the rung landed
- **Hand-off: stop** — on the last rung you may reach unaided

If `## Environments` is absent, **ask the developer once** what their
environments are, write the section below the `spine-framework:end`
marker in the format above (full format and field meanings:
`.framework/src/instructions/tasks/declare-your-environments.md`), then
proceed. Never invent targets — the developer names them. Never write
above the end marker; `npx spine-framework upgrade` replaces that region.

## Pre-flight

Run before the first rung; report and stop on failure:

```bash
npm run typecheck
npm run test
npm run verify
npx spine-framework migrations status   # nothing pending you didn't expect
npx spine-framework auth check          # remote CLI credentials resolve
```

## Per rung, in order

For each rung below the hand-off:

1. **Gate** — satisfy what the rung declares.
2. `npx spine-framework migrate --dry-run` against the rung's Supabase —
   show what will apply; unexpected pending migrations → stop and report.
3. `npx spine-framework migrate`, then the seeds the rung declares
   (e.g. `npx spine-framework seed-app <slug>`).
4. **Promote by** — run the declared action (push, deploy command).
5. **Post-landing** — wait for the deploy, run the declared checks.
   Baseline every remote rung should declare: `npx spine-framework
   system health` answers ok, `npx spine-framework system manifest`
   shows the expected version and all migrations applied, plus the
   rung's own smoke (pattern:
   `.framework/src/instructions/tasks/write-a-smoke-test.md` — baseline
   curls + one non-admin write-then-read). A remote rung missing these
   → report it as a ladder gap, don't silently skip the checks.
6. GREEN → next rung. RED → **stop**: report which rung, which check,
   and what you observed. Do not fix forward on your own initiative.

**First-ever production deploy only:** after `migrate`, run
`npx spine-framework bootstrap` once — it provisions the first
`system_admin` and mints the first API key. Skip it if the project has
already bootstrapped (an existing `system_admin`; check with
`npx spine-framework doctor`).

## Hand-off

At a rung marked `**Hand-off: stop**`, or when the next rung is the
release rung: report GREEN or RED per rung walked and **wait**. Never
cross the hand-off without an explicit instruction. "Release it" after
staging GREEN is that instruction; anything vaguer ("looks good")
isn't — ask.

## Rules

- Remote Supabase is touched only through `migrate` and declared seed
  commands. Never run ad-hoc SQL, mutations, or dashboard changes.
- One RED rung stops the walk — never skip a failed gate.
- Schema before code: apply `migrate` before the deploy lands new code
  whenever the rung lets you order them.
- `migrate` targets whatever `SUPABASE_URL`/`SUPABASE_DB_PASSWORD`
  resolve to — point the env at the rung you're landing on, never at a
  different project. See
  `.framework/src/instructions/reference/env-vars.md`.
- Migrations are immutable once applied; a bad one is fixed forward,
  not edited — see `.framework/src/instructions/operations/migrations.md`.
