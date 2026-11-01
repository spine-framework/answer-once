---
title: "Concurrency and idempotency"
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/_shared/message-sequence.ts
  - .framework/functions/_shared/agent-runner.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/_shared/retry-deliveries.ts
  - .framework/functions/integration-outbound.ts
  - .framework/functions/_shared/kb.ts
  - .framework/cli/commands/migrate.ts
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/035_rate_limits.sql
  - .framework/migrations/054_kb_ingest_lease.sql
  - .framework/migrations/064_episode_leases.sql
  - .framework/migrations/066_episode_steal_thread_merge.sql
  - .framework/migrations/067_episode_lease_stale_steal.sql
---

# Concurrency and idempotency

Spine runs on serverless functions: an invocation can die at the response
flush, a client can retry a request that already succeeded, and two instances
can race the same resource. Spine's answer is consistent: **the database
decides**. Ordering, single-flight, and deduplication are enforced by
constraints and atomic RPCs — never by reading state and deciding in memory.

## Ordered writes: message sequencing

`public.messages` has `UNIQUE(thread_id, sequence)`
(migration `001_core_schema.sql`) — the hard invariant for conversation order.
Two writers honor it differently:

- `_shared/message-sequence.ts` (`insertMessageSequenced`) is the simple path:
  read the max `sequence` for the thread, insert `max + 1`, retry up to 3
  times on a `23505` duplicate-key error. The retry exists because a racing
  writer may take the same number; the constraint makes the conflict visible.
- The agent runner keeps a per-instance counter (`threadSeqCounter`) seeded by
  one `COUNT(*)` per thread, then allocates locally — a batch of tool-result
  messages gets consecutive numbers up front so `Promise.all` inserts stay in
  order. A `23505` triggers a reseed + retry. The counter is an optimization;
  the unique constraint remains the backstop.

## Pipeline executions: claim, don't create-twice

Trigger dispatches reserve a `pipeline_executions` row with
`status: 'queued'` *before* calling the background runner. `runPipeline` then
**claims** that row (`queued → running` on `id = executionId AND status =
'queued'`) rather than inserting a second execution — a retried or duplicated
dispatch converges on the same row. If the claim finds nothing, the runner
falls back to inserting, so an execution record always exists. Rows stuck in
`queued`/`running`/`pending` for over 10 minutes are swept to `failed` — a
runner that died mid-flight can never write its own terminal status.

Individual stages can also be idempotent: `create_record` accepts
`config.dedupe { field, value, account_scoped? }` — when a record matching
`field = value` already exists, the stage returns the existing row
(`deduped: true`) instead of inserting a duplicate.

## Webhook deliveries: retry in place

An outbound delivery is one `webhook_deliveries` row for its whole life:
`pending → processing → delivered | pending | failed`. Retries — automatic
(`retryPendingDeliveries` each cron tick) or manual
(`deliveries?action=retry`) — call `integration-outbound` with the existing
`delivery_id`, which reloads the row, reuses its payload, and increments
`attempt_count` in place; they never create a second delivery. Backoff is
exponential (`30s × 2^attempt`, 1h cap, ±20% jitter) until `max_attempts`
turns the row `failed`; the sweep is bounded (`attempt_count < 10`, 100 rows
per pass) so one poisoned integration can't monopolize the tick. Inbound
deliveries get the same row lifecycle, but inbound retry is not implemented —
a failed inbound delivery stays visible for manual handling.

## Leases: single-flight with fencing

Long-running agent episodes coordinate through `public.episode_leases`
(migration `064`; service-role only). `acquire_episode_lease` is atomic: an
`INSERT … ON CONFLICT (thread_id) DO NOTHING` fast path, then a
`FOR UPDATE` conflict path returning `claimed` + a fresh `lease_token`, or
`held` + the live holder's `driver_id`. The same driver re-acquiring renews;
an expired lease is taken over with a new token.

The token is a **fence**, not just a lock:

- `heartbeat_episode_lease(thread_id, lease_token)` extends the TTL only when
  the token matches — `false` means "you were displaced; stop writing now."
- `release_episode_lease` is token-gated for the same reason.
- `merge_thread_data(thread_id, patch, lease_token)` (migration `066`) is the
  only way episode checkpoints are written: an atomic jsonb merge whose
  `WHERE` clause refuses the write when a different token holds the lease —
  so a fenced driver's late write is dropped instead of resurrecting stale
  state.

Migration `067` adds `p_steal_detached` / `p_stale_seconds`: request-bound
drivers may steal a lease from a `detached:`-prefixed holder **only** when its
heartbeat is older than `p_stale_seconds` (default 30). Detached drivers are a
liveness fallback, never an owner that blocks live work. The same lease shape
guards knowledge ingest: `document_leases` with
`acquire_document_lease`/`release_document_lease` (migration `054`), claimed
by content hash in `_shared/kb.ts`.

## Atomic counters and bookkeeping

- `rate_limit_hit` (migration `035`) upsert-increments the `rate_limits`
  window counter in one statement — concurrent invocations can't double-spend
  a window.
- `record_trigger_fire` (migration `064`) bumps trigger bookkeeping atomically
  on each fire.

## Migrations: ordered, transactional, ledgered

`spine-framework migrate` (`.framework/cli/commands/migrate.ts`) applies
`.framework/migrations/*.sql` (plus `custom/migrations/` unless
`--framework-only`) in **filename order** — the numeric prefix is the order.
Each file runs inside one transaction together with its ledger insert into
`_spine_migrations` (`filename UNIQUE`, `applied_at`): a file either lands
complete with its ledger row or rolls back, and the run stops at the first
failure. Re-runs skip anything already in the ledger (`--dry-run` lists
pending without touching the DB). The connection is derived from
`SUPABASE_URL` (a hosted `*.supabase.co` URL only — no credentials, ports, or
paths) plus `SUPABASE_DB_PASSWORD`.
