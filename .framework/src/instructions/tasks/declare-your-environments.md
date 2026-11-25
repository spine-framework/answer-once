---
title: Declare your environments
audience: developers, agents
kind: task
skills:
  - spine-ship
verified_against: 90c7e6d
verified_on: 2026-11-24
source_files:
  - .framework/cli/lib/project-files.ts
  - .framework/templates/agent/AGENTS.md
  - .framework/templates/agent/skills/spine-ship/SKILL.md
---

# Declare your environments

## Goal

Write the project's promotion ladder — the ordered list of environments a
change walks from local to release — into `AGENTS.md`, so both the team and
an agent can see exactly what "ship it" means here.

## Prerequisites

- You know which environments the project actually has (local, staging,
  production, a package registry, downstream repos — whatever applies).
- You know how a change lands on each one (push, `netlify deploy`, an npm
  publish procedure).

## Steps

1. **Open `AGENTS.md`.** The `<!-- spine-framework:end -->` marker splits
   the file: everything above it is framework-owned and rewritten by
   `npx spine-framework upgrade`; everything below it — including the
   "Your project rules" comment — is project-owned and preserved verbatim
   (`mergeAgentsFile` in `.framework/cli/lib/project-files.ts`, covered by
   `agent-files.test.ts`). The ladder goes **below** the marker.

2. **Add an `## Environments` section** with one `### <n>. <name>` heading
   per rung, in promotion order. Each rung carries these fields:

   ```markdown
   ## Environments

   The promotion ladder for this project — ordered rungs from local to
   release. An agent walks them top to bottom; it never promotes past a
   rung marked `**Hand-off: stop**` without an explicit instruction.

   ### 1. Local
   - **Target:** this checkout — `npm run dev:netlify` against local
     Docker Supabase (or a shared dev project)
   - **Gate:** `npm run typecheck`, `npm run test`, `npm run verify` pass
   - **Promote by:** commit to `main`
   - **Post-landing:** —

   ### 2. Staging
   - **Target:** https://staging.example.com — Supabase project `<ref>`
   - **Gate:** previous rung GREEN
   - **Promote by:** push to `main` (Netlify auto-deploys), then
     `npx spine-framework migrate` with the staging DB credentials;
     seed apps as needed (`npx spine-framework seed-app <slug>`)
   - **Post-landing:** `npx spine-framework system health` → ok;
     `npx spine-framework system manifest` → expected version and all
     migrations applied; smoke: <what the team checks by hand>
   - **Hand-off: stop** — the agent reports GREEN or RED and waits here.

   ### 3. Release
   - **Target:** production / registry / wherever the release goes
   - **Gate:** staging GREEN **and** an explicit developer instruction
   - **Promote by:** <the project's release procedure>
   - **Post-landing:** <how the release is verified>
   ```

   Field meanings:

   | Field | Meaning |
   |---|---|
   | **Target** | Where the rung lands — site URL and, for remote rungs, the Supabase project ref |
   | **Gate** | What must be true before this rung may be promoted to |
   | **Promote by** | The action that lands the change on the rung |
   | **Post-landing** | Checks that prove the rung landed — include `system health`/`system manifest` for every remote rung plus a human-meaningful smoke |
   | **Hand-off: stop** | Marks the last rung an agent may reach on its own. Everything past it needs an explicit instruction |

3. **Mark the hand-off.** Put `**Hand-off: stop**` on the last rung before
   release. This is the contract: an agent may walk local → staging by
   itself, but it waits for you to say "release it" before crossing.

4. **Write your own rungs.** The example is a shape, not a prescription —
   a project with no staging writes two rungs; an agency project might end
   at "client approves the preview." Remote Supabase is touched only
   through `migrate` and declared seed commands, so say the seed steps in
   **Promote by** rather than leaving them implicit.

## Verify

- `npx spine-framework upgrade --dry-run` leaves your `## Environments`
  section untouched (it is below the end marker).
- `npm run docs:lint` passes if `AGENTS.md` is linted in your setup.
- Ask the `spine-ship` skill to walk the ladder on the next green commit —
  it should find the section without asking you anything.

## Common mistakes

- **Writing the ladder inside the framework markers** — `upgrade` replaces
  everything between `begin`/`end`; the ladder must live below
  `spine-framework:end`.
- **No hand-off marker** — without `**Hand-off: stop**` the agent has no
  defined stopping point; the convention is meaningless.
- **Promotion steps that touch remote Supabase directly** — seeds and
  one-off SQL belong in migrations and declared seed commands, so the rung
  stays reproducible and auditable.
- **Forgetting env scoping** — `migrate` targets whatever
  `SUPABASE_URL`/`SUPABASE_DB_PASSWORD` point at. Say which credentials a
  remote rung expects; see [Environment Variables](../reference/env-vars.md).

## Reference

- [CLI Reference](../reference/cli.md) — `migrate`, `migrations status`,
  `system health`, `system manifest`, `seed-app`, `bootstrap`.
- [Netlify deployment](../operations/deployment.md) — what a deploy lands
  and the env vars a remote rung needs.
- [Migrations](../operations/migrations.md) — ledger, dry-run, ordering.
- Decision `spine-framework:0023-environment-ladder` — why the ladder
  lives in `AGENTS.md` rather than config.
