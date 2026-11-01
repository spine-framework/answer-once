---
title: admin-signals
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/admin-signals.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/funnel.ts
---

# admin-signals

## What it does

Two read surfaces over `funnel_signal` items for the platform operator:
`metrics` aggregates signal totals (all-time, today, this week), a
conversion rate from high-value signals, top sources, and the 20 most
recent signals; `audit` lists individual signal records with filters,
pagination, attribution fields (UTM/referrer/anonymous identity), and an
unpaginated export mode.

Signals record product-journey events (`action_type`, `stage`, `source`,
`rating`) — framework-internal telemetry for the platform, not customer
app analytics.

## Route and methods

**None — this file exports no `handler`.** It exports `metrics` and
`audit`, both `createHandler`-wrapped, which nothing imports or
dispatches. As shipped there is no HTTP entrypoint; treat it as a dormant
module pending a dispatch handler, not a live endpoint.

## Authentication

If wired: `createHandler` requires any non-anonymous principal — no role
check in either export. All queries run on `adminDb` across **all
accounts** (see Agent notes).

## Request contract

`metrics` — no parameters; windows are hardcoded (today, trailing 7
days).

`audit` — query parameters:

| Param | Effect |
|---|---|
| `page` (default 1), `limit` (default 50) | Pagination (ignored in export mode) |
| `date_from`, `date_to` | `created_at` bounds |
| `source`, `stage`, `action_type` | Exact match on `data->>` fields |
| `min_rating` | `data->>rating >= value` |
| `account_id` | Caller-supplied account filter |
| `search` | OR-match on `accounts.name`, `people.email`, `data->attribution->>first_touch_referrer_domain` (ILIKE) |
| `export` (any value) | Returns the full formatted array with no range limit |

## Response contract

`metrics` → `{ total_signals, signals_today, signals_this_week,
conversion_rate, top_sources: [{source, count}], recent_signals: [{id,
action_type, source, stage, created_at, account_name, rating}] }`.
`conversion_rate` is the share of this week's signals with
`data->>rating >= '4'` — a "high-value signal" rate, not a funnel
conversion.

`audit` → `{ signals, total, page, limit }`, or in export mode the bare
formatted array. Each signal row: `{ id, action_type, action_value,
stage, source, created_at, account_name, person_email, anonymous_id,
session_id, rating, raw_score, referrer_domain, utm_source, utm_medium,
utm_campaign }` — joined to `people(email)` and `accounts(name)`, with
identity fields from `data->identity` and attribution from
`data->attribution`.

## Side effects

None — read-only.

## Errors

- `Failed to fetch signals: <message>` — the one thrown error, on query
  failure inside `audit`.
- Missing `funnel_signal` type (app-seeded; absent on clean installs)
  degrades gracefully: `metrics` returns zeroed metrics, `audit` returns
  an empty page or `[]` in export mode.

## Agent notes

- **Verify before use** — no `handler` export means no routed endpoint.
- **Cross-account PII, caller-steered.** `audit` accepts an arbitrary
  `account_id` filter and returns `people.email`, `accounts.name`,
  anonymous IDs, session IDs, and UTM attribution across all accounts via
  `adminDb`. If a dispatch handler is ever added, it needs a
  `system_admin` gate before this surface is exposed.
- `export` mode drops the range limit — it returns the entire filtered
  set, so combined with the joins it is the heaviest call in the file.
- Rating comparisons are string comparisons on `data->>rating`
  (`gte '4'`) — works for single digits, but `"10" >= "4"` is false
  lexicographically; values above 9 would misclassify.
- Signals are produced by `emitSignal` in
  `.framework/functions/_shared/funnel.ts` (deduped once per account +
  `action_type` by default) — this module only reads them.
