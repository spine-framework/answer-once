---
title: admin-install-funnel
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/admin-install-funnel.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/funnel.ts
---

# admin-install-funnel

## What it does

Install-funnel analytics for the platform operator: download/install/
first-use/claimed counts, per-day install trends over 30 days, recent
install records with contact and account joins, a version breakdown, and
a full export of install-instance records. All data comes from `items`
rows under the `funnel_signal` type where `data->>source = 'inst'`, plus
`spine_instance` rows for the version split.

Framework-internal telemetry about Spine installations (serials, app
versions, environments), not customer app data.

## Route and methods

**None — this file exports no `handler`.** It exports two
`createHandler`-wrapped consts, `metrics` and `exportData`, which nothing
imports or dispatches. As shipped there is no HTTP entrypoint; treat it
as a dormant module pending a dispatch handler (or a wiring bug), not a
live endpoint.

## Authentication

If wired: `createHandler` requires any non-anonymous principal — no role
check inside either export. All queries run on `adminDb` across **all
accounts** (see Agent notes).

## Request contract

Neither export reads parameters — `metrics` uses fixed windows and
`exportData` returns the full matching set.

## Response contract

`metrics` →

```json
{
  "total_downloads": 0,
  "unique_installers": 0,
  "active_instances": 0,
  "conversion_funnel": { "downloads": 0, "installations": 0, "first_use": 0, "claimed": 0 },
  "install_trends": [{ "date": "YYYY-MM-DD", "downloads": 0, "installations": 0 }],
  "recent_installs": [{ "id": "…", "serial": "…", "app_version": "…", "environment": "…",
                        "first_seen_at": "…", "last_signal_at": "…",
                        "claimed_by": "…", "claimed_at": "…",
                        "account_name": "…", "person_email": "…" }],
  "top_versions": [{ "version": "…", "count": 0, "percentage": 0 }]
}
```

Field semantics:

- `total_downloads` / `installations` / `first_use` — `funnel_signal`
  rows with `action_type` `download` / `install` / `first_command`.
- `unique_installers` — distinct `data->>serial` values.
- `active_instances` — serialized signals seen in the last 7 days.
- `claimed` — signals with non-null `data->>claimed_by_person_id`.
- `install_trends` — 30 daily buckets of download + install counts.
- `recent_installs` — latest 20 serialized signals joined to
  `people(email)` and `accounts(name)`.
- `top_versions` — up to 10 versions by `spine_instance` count share.

`exportData` → `{ instances, exported_at, total_count }` — every
`funnel_signal` row with `source='inst'` and a serial, full `data` bag,
`account_id`, and the same people/accounts joins, newest first.

## Side effects

None — read-only.

## Errors

No explicit error paths. When the `funnel_signal` type is absent
(app-seeded; missing on a clean install) `metrics` returns a zeroed
payload and `exportData` returns `{ instances: [], …, total_count: 0 }`.
The 30-day trend loop issues two count queries per day (60 sequential
queries) — slow but not an error.

## Agent notes

- **Verify before use** — no `handler` export means no routed endpoint;
  `?action=export`-style dispatch does not exist in the file.
- **Platform-wide PII.** `exportData` and the `recent_installs` join
  return `people.email` and `accounts.name` across all accounts via
  `adminDb`, gated only by authentication if this is ever wired. Any
  dispatch handler added later must gate on `system_admin` (or narrower)
  before exposing these exports.
- The daily-trend loop is 60 round trips per call — do not put it on a
  hot path; if the endpoint is wired for real use, fold the loop into a
  single grouped query or RPC.
- `serial` is the installer-instance identity; `claimed_by_person_id`
  links an install to a registered person — that join is what makes the
  export PII-bearing.
