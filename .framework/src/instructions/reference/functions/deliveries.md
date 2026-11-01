---
title: deliveries
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/deliveries.ts
  - .framework/functions/integration-outbound.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/migrations/004_core_rpc_and_broker.sql
  - .framework/public/_redirects
---

# deliveries

## What it does

Read access to `public.webhook_deliveries` — the delivery log for
inbound and outbound webhook traffic — plus `action=retry`, which
re-executes a failed **outbound** delivery through
`integration-outbound` (see
[Integrations and webhooks](../../concepts/integrations-and-webhooks.md)).

The table is `webhook_deliveries` — there is no `deliveries` table.

## Route and methods

`/.netlify/functions/deliveries`, reachable as `/api/deliveries`
(`/api/*` → `/.netlify/functions/:splat`,
`.framework/public/_redirects`). Dispatch is by `?action=` then method:

| Call | Handler |
|---|---|
| `GET /api/deliveries` | `list` |
| `GET /api/deliveries?id=<uuid>` | `get` |
| `POST /api/deliveries?action=retry` | `retry` |

Anything else (including `PATCH`/`DELETE`) → `Invalid action or method`.

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list` requires `ctx.accountId` and always filters
  `.eq('account_id', ctx.accountId)`.
- `get`/`retry` have no explicit account check — for human callers RLS
  on `ctx.db` bounds what the row lookup can see; machine principals run
  `ctx.db` as the service role and can fetch any delivery by id.
- No `sanitizeRecordData` is applied — rows are returned raw.

## Request contract

**list** (query): `direction`, `status`, `integration_id`,
`api_key_id`, `limit` (default 100), `offset` (default 0). Ordered
`created_at` desc; always account-scoped.

**get** (query): `id`.

**retry** (body): `id` — the delivery must exist and have
`direction === 'outbound'` (inbound retries throw).

## Response contract

Standard `{ data, error, meta }` envelope.

- `list`/`get` → raw `webhook_deliveries` row(s).
- `retry` → the return value of `integration-outbound`'s `execute` for
  `{ delivery_id }` — the delivery attempt result, not a new delivery
  row.

## Side effects

- `retry` re-executes the delivery by calling
  `.framework/functions/integration-outbound.ts` `execute` in-process
  with `principal: SYSTEM_PRINCIPAL` and `accountId` taken from **the
  delivery's** `account_id` (not the caller's). Outbound execution
  writes its own attempt/status bookkeeping onto `webhook_deliveries`.
- `emitLog` writes a `delivery.manual_retry` audit row to `public.logs`
  with the delivery's `direction` and `integration_id`.
- `list`/`get` are pure reads.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| No account context (list) | 500 | `Account context required` |
| Missing `id` | 500 | `Delivery ID is required` |
| Missing row | 500 | `Delivery not found` / PostgREST message |
| Retrying an inbound delivery | 500 | `Manual retry is only supported for outbound deliveries in this release` |
| Bad action/method | 500 | `Invalid action or method` |

Validation failures surface as HTTP 500 — thrown `Error`s without a
`statusCode` map to 500 in the shared error path.

## Agent notes

- Retry runs the delivery under `SYSTEM_PRINCIPAL` — the caller's
  identity is not propagated into the outbound execution, and the
  delivery's own `account_id` decides the execution account. A caller
  who can `get` a delivery id can retry it.
- There is no redelivery of inbound payloads — inbound rows are
  observability only; outbound retries go through the integration
  adapter again and may produce real external HTTP calls.
- `webhook_deliveries` is created by
  `.framework/migrations/004_core_rpc_and_broker.sql`; automatic retry
  sweeps happen in `system-cron` via
  `.framework/functions/_shared/retry-deliveries.ts`, not here.
