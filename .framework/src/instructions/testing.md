---
title: Testing
audience: both
kind: entity
verified_against: 9f90999
verified_on: 2026-11-16
source_files:
  - .framework/src/pages/admin/TestingDashboard.tsx
  - .framework/src/pages/admin/TestRunDetailPage.tsx
  - .framework/functions/tests.ts
  - .framework/migrations/001_core_schema.sql
---

## What this is for

The **Testing** page (`/spine-framework/admin/testing`) is a dashboard over `test_runs`/`test_results` — rows written by external test harnesses (e.g. suite runs triggered from the IDE). It summarizes per-suite health and lists recent runs so you can spot a red suite without opening the CI output.

## Why it exists

### test-cases

You need stored ground-truth questions with expected answers, tiers, and source IDs so that evaluation harnesses can score embedding, search, and agent pipelines.

**Why it exists (5-whys):**

1. Evaluating search, embeddings, and agents needs stored ground truth — questions, expected answers, tiers — seeded and versioned like other config, not hardcoded in test files.
2. Typed (`type_id`) + `UNIQUE(app_id, slug)` make test suites domain vocabulary — each app's evals travel with its seeds.
3. `test_runs` and `test_results` are separate because a run is an event (suite, counts, duration) while results are per-case detail — the summary exists without a thousand rows; the detail exists only when needed.
4. Results live in-database rather than CI artifacts because "is this agent improving" is a trend query — CI logs expire; rows don't.
5. **Root:** quality is data too — test definitions and outcomes live in the governed schema so evaluation is seedable, auditable, and trendable per app/account. *(confirmed 2026-11-13)*

### test-results

A test run summary is not enough to debug a failure; you need per-test status, duration, and the failure message for each individual test case.

Companion of `test_cases` — its full reasoning is level 3 of the chain in test-cases `## Problem it solves` and the test-cases article.

### test-runs

You need historical visibility into whether the test suite passed, when it ran, how long it took, and who/what triggered it — without digging through CI logs.

Companion of `test_cases` — its full reasoning is level 3 of the chain in test-cases `## Problem it solves` and the test-cases article.

## Fields and settings

- **Suite cards** — one per suite (`unit`, `integration`, `api`, `ui`): last status, last run time, last pass/fail/total counts, and total runs (last 30 days).
- **Recent runs table** — last 20 runs: suite, status (`passed`/`failed`/`running`/etc.), started time, passed, failed, total, duration.
- **Row click** — navigates to `testing/:run_id` for the individual test-case results (`name`, `status`, `message`, `duration_ms` per case).
- No actions on this page — runs are produced by harnesses, not created here.

**Downstream effects**

- Backed by `/api/tests` (function `tests`): `action=stats` aggregates the last 30 days by suite; `action=list` returns recent runs; `action=get&id=` returns one run plus its ordered `test_results`. All require system context.
- `system` health checks (`/api/system`) and `spine-framework doctor` also read `test_runs` — a stale suite shows up in deploy health.
- Rows are append-only; there is no cleanup action on this API today.

## Minimal configuration

Nothing on the page — have your harness insert `test_runs` (+ `test_results` per case) and the dashboard populates itself.

## Full configuration

```
GET /.netlify/functions/tests?action=stats        # per-suite 30-day rollup
GET /.netlify/functions/tests?action=list&limit=20
GET /.netlify/functions/tests?action=get&id=<run uuid>   # run + ordered test_results
```

## Example

A nightly job runs the `integration` suite and writes a `test_runs` row with `failed: 2`. The dashboard's Integration card flips red with last-run counts; click the row to see which two `test_results` failed and their messages.

## Core files

- `.framework/src/pages/admin/TestingDashboard.tsx` — this page
- `.framework/src/pages/admin/TestRunDetailPage.tsx` — run detail route (`testing/:run_id`)
- `.framework/functions/tests.ts` — API (`stats`, `list`, `get`)
- Tables: `public.test_runs`, `public.test_results`

## Agent notes

- Known mismatch: `TestRunDetailPage` fetches `/api/test-runs?action=...`, but the shipped function is `tests` — the detail route currently fails to load. Use `tests?action=get&id=` until the page is repointed.
- The suites list is hardcoded (`unit`, `integration`, `api`, `ui`) — a run with a different `suite` value won't get a card, though it still appears in Recent runs.
- `stats` is a fixed 30-day window capped at 200 rows — high-volume suites need direct table queries for longer trends.
- Nothing here triggers runs; the "no runs yet" empty state points at running suites from your IDE/CI.
