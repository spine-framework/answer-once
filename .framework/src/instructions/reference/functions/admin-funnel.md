---
title: admin-funnel
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/admin-funnel.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/funnel.ts
---

# admin-funnel

## What it does

Computes anonymous-visitor → identified-user → installed-instance
conversion metrics for the platform funnel. It reads `items` rows under
three app-seeded item types — `funnel_signal`, `anonymous_session`, and
`spine_instance` — and returns counts, conversion rates, and a
stage distribution over the last 30 days.

This is framework-internal telemetry for the platform operator (growth
and install funnel for Spine itself), not per-customer app analytics.

## Route and methods

**None — this file exports no `handler`.** It exports a single
`createHandler`-wrapped const, `metrics`, which nothing else imports or
dispatches. As shipped there is no HTTP entrypoint: the file is deployed
to the functions directory by the assembly script like every other
`.framework/functions` file, but Netlify has no `handler` export to
invoke. Treat it as a dormant module pending a dispatch handler (or a
wiring bug); do not cite it as a live endpoint.

## Authentication

If `metrics` were wired: `createHandler` requires any non-anonymous
principal — no role check inside the function. All queries run on
`adminDb` across **all accounts** (see Agent notes).

## Request contract

`metrics(ctx, body)` takes no parameters — the 30-day window is hardcoded.

## Response contract

`{ anonymous_visitors, identified_users, installed_instances,
conversion_rates: { anonymous_to_identified, identified_to_installed },
stage_distribution: [{ stage, count, percentage }] }`

- `anonymous_visitors` — `anonymous_session` items in the last 30 days
  whose `data->lifecycle->>stitched_to_account_id` is null.
- `identified_users` — distinct `account_id`s on `funnel_signal` items in
  the last 30 days.
- `installed_instances` — `spine_instance` items with a non-null
  `data->>claimed_by_person_id` (all time).
- `stage_distribution` — counts of `funnel_signal.data->>stage` over the
  last 30 days, only counting rows that have an `account_id`.

## Side effects

None — read-only aggregation.

## Errors

No explicit error paths. Missing signal types are expected on a clean
install (the types are seeded by installed apps): when none of the three
type slugs resolves, `metrics` returns a zeroed payload instead of
failing. Database errors would surface as thrown errors through
`createHandler`'s 500 path.

## Agent notes

- **Verify before use.** The missing `handler` export means there is no
  routed endpoint; check the current tree before assuming
  `GET /api/admin-funnel` does anything.
- **Unscoped platform-wide reads.** If wired as-is, every query runs on
  `adminDb` with no `account_id` filter and no `isSystemAdmin` gate — any
  authenticated principal would see cross-account funnel data. A
  `system_admin` check belongs in any dispatch handler that exposes it.
- Signal data is written elsewhere — `emitSignal` in
  `.framework/functions/_shared/funnel.ts` inserts typed signal items
  (`funnel_signal` among them) and fires `item_created` triggers; these
  admin modules only read the results.
- The `funnel_signal_use` type seed exists in the framework
  (`.framework/seeds/types/funnel_signal_use.json`); the
  `funnel_signal`/`anonymous_session`/`spine_instance` slugs the queries
  look for are seeded by installed apps, hence the degrade-to-zeros
  behavior.
