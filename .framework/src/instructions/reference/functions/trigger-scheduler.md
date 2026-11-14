---
title: trigger-scheduler
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/trigger-scheduler.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/_shared/principal.ts
  - netlify.toml
---

# trigger-scheduler

## What it does

The clock for Spine automation. `netlify.toml` declares it a Netlify
scheduled function at `* * * * *` — Netlify Clockwork invokes it every
minute. The file itself is a thin shim: it detects whether the invocation
is a genuine scheduled tick (which arrives with no credentials) and runs
the shared `system-cron` handler under a fabricated system context, or
falls through to `system-cron`'s normal middleware auth for everything
else. All actual work — due schedules, due timers, threshold alerts,
delivery retries, log cleanup — lives in `system-cron`.

## Route and methods

Two invocation shapes:

1. **Netlify scheduled invocation** — the platform calls
   `/.netlify/functions/trigger-scheduler` once per minute with a schedule
   indicator header and a `{"next_run": "<ISO timestamp>"}` body.
2. **Manual HTTP call** — any authenticated request to the same path
   (useful for forcing a tick in dev). This falls through to
   `system-cron`'s `createHandler` auth path.

## Authentication

Clockwork detection (`isNetlifyScheduledInvocation`) requires **both**:

- a schedule indicator — `x-netlify-event: schedule` (production canonical
  header), `x-nf-event: schedule` (Netlify CLI emulation), or a
  `Netlify Clockwork` user-agent when neither header is present — **and**
- a JSON body whose `next_run` field is a string.

Requiring the body shape means a bare spoofed header or UA alone cannot
authenticate. A detected tick fabricates a `RequestContext` carrying
`SYSTEM_PRINCIPAL` (`machine`, `machineType: 'internal'`, `*:*` scope) and
`adminDb`, then calls the cron handler directly — `createHandler`
short-circuits when `requestId` + `principal` are already present, so no
second auth resolution happens.

Anything that fails detection goes through `system-cron`'s own checks:

- `x-internal-secret` header → resolves to `SYSTEM_PRINCIPAL` via
  `resolvePrincipal`, which passes the internal-machine gate.
- `?api_key=` or `?scheduler_key=` query param equal to
  `SCHEDULER_API_KEY`.
- any other internal machine principal.
- anonymous requests → 401 from `createHandler`; authenticated but
  unauthorized → 403 plus a `system_cron.unauthorized_access` audit event.

## Request contract

- Scheduled tick: schedule indicator header + body
  `{"next_run": "<ISO timestamp>"}`.
- Manual call: `?api_key=$SCHEDULER_API_KEY` (or `?scheduler_key=`), or an
  `x-internal-secret` header. No request body is read.

## Response contract

Whatever `system-cron`'s handler returns — a JSON summary of the tick
(`schedules_due`, `executed`, `success`, `failed`, `skipped`,
`logs_cleaned`, `deliveries_retried`, `results[]`), or an auth/500 error.
See the `system-cron` reference page for the full shape.

## Side effects

None of its own — every effect belongs to `system-cron`. The only
local decision is which auth path the invocation takes.

## Errors

- 401 — unauthenticated non-scheduled request (from `createHandler`).
- 403 — authenticated but not an internal machine principal and no valid
  scheduler key (from `system-cron`, with audit event).
- 500 — bubbled from `system-cron` failures (`system_cron.error` audit).

## Agent notes

- The function is deliberately a shim: scheduled-invocation plumbing has
  changed across Netlify environments before (CLI vs production header
  names), so detection is centralized here rather than inside the worker.
  If a future Netlify rename breaks ticks, this file is the fix point —
  the Clockwork user-agent check is already the third fallback indicator.
- A "401 every minute" symptom in production usually means the scheduler
  hit the non-Clockwork path — check that the invocation carries a
  recognized schedule header **and** the `next_run` body.
- There is no per-tick idempotency key: two overlapping ticks would both
  run `system-cron`. Due-item claiming relies on the RPCs and row state,
  not on tick uniqueness.
