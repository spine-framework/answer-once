---
title: Write a smoke test
audience: developers, agents
kind: task
skills:
  - spine-ship
verified_against: f9ea935
verified_on: 2026-11-20
source_files:
  - .framework/functions/system.ts
  - .framework/src/instructions/tasks/declare-your-environments.md
  - .framework/src/instructions/operations/deployment.md
  - .framework/templates/agent/workflows/spine-ci.yml
---

# Write a smoke test

## Goal

A short, repeatable check that proves a deploy *landed and works* — the
thing each `## Environments` rung names in its **Post-landing** field and
CI runs after deploys.

## What a smoke test is (and isn't)

- **Is:** 2–5 checks, seconds to run, proves reachability + core behavior
  on a live URL.
- **Isn't:** the test suite, a load test, or a correctness audit. Smoke
  answers "is this deploy alive and sane?", never "is everything right?"

## The baseline set — every rung

```bash
# 1. Site serves the SPA (200 + HTML, not an error page)
curl -sf "$BASE_URL/" -o /dev/null

# 2. Functions are up — health needs *some* authenticated principal,
#    anonymous gets 401. A dedicated monitor key is the right caller.
curl -sf -H "x-api-key: $SMOKE_KEY" "$BASE_URL/api/system?action=health"
#    → expect status "healthy"

# 3. The expected build landed — manifest reports version + migrations
curl -sf -H "x-api-key: $SMOKE_KEY" "$BASE_URL/api/system?action=manifest"
#    → compare version against what you just shipped
```

A `401` on health means auth plumbing broke (or the key is wrong); a `404`
means the deploy didn't land or the `/api/*` rewrite is broken — remember
the SPA fallback returns 200+HTML for *unmatched* paths, so a probe that
gets HTML instead of JSON hit the fallback, not a function.

## The change-specific check — the real point

Every rung's smoke adds **one non-admin path** exercising whatever the
change touched — this is the historically skipped check:

- Changed the ticket flow? Submit a real ticket through the API and read
  it back via `/api/admin-data`.
- Changed a pipeline? Write the triggering record, then check
  `/api/logs?action=search` (or `pipeline_executions`) for the run.
- Changed a page? `curl` its route — but remember SPA fallback means any
  route returns 200; a *real* check reads the data the page needs.

Rules for writing one:

- **Non-admin path always.** Admin surfaces get exercised less; user
  flows are where breakage hides.
- **Write-then-read.** A read-only smoke can pass against cached/empty
  state; create something, then prove it exists (soft-delete it after if
  the environment is shared).
- **Scoped key, not your admin key.** The monitor's `sk_` should carry
  only the scopes the smoke needs — a leaked smoke credential is then
  worth little.

## Where it runs

- **Ladder post-landing** — name it in the rung's `Post-landing` field;
  `spine-ship` executes it and reports GREEN/RED.
- **CI post-deploy** — the same checks as a GitHub Actions job gated on
  `deployment_status` (see the shipped `spine-ci.yml` for the gate job —
  add a `smoke` job behind `SPINE_SMOKE_URL`/`SPINE_SMOKE_KEY` secrets
  when you want post-deploy smoke in CI).
- **By hand** — the three baseline curls are worth memorizing; they
  answer "is it up?" in one command each.

## Verify

- Point at a dead URL → every check fails loudly (that's the test working).
- Against the real deploy: site 200, health `healthy`, manifest version
  matches the commit you shipped.
- The change-specific check exercises the *non-admin* path, not the admin
  UI equivalent.

## Common mistakes

- **Smoke that only checks 200s** — SPA fallback returns 200 for
  everything; assert on *content* (JSON shape, `status` field, a created
  row's presence).
- **Using `system_admin` credentials for the monitor** — scope it down;
  see [Rotate an API key](rotate-an-api-key.md) for the scoping model.
- **Skipping the change-specific check** — baseline proves "deployed,"
  not "works." Both halves are required.
- **Smoke in the build** — smoke needs a live URL; it runs post-deploy,
  not in the gate job.

## Reference

- [Declare your environments](declare-your-environments.md) — where smoke
  lives in the ladder.
- [Netlify deployment](../operations/deployment.md) — the `/api/*` space,
  env vars a remote rung needs.
- [system function](../reference/functions/system.md) — health/manifest
  shapes.
