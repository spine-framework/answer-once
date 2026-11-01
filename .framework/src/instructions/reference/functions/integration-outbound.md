---
title: integration-outbound
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/integration-outbound.ts
  - .framework/functions/_shared/resolve-credentials.ts
  - .framework/functions/_shared/retry-deliveries.ts
  - .framework/functions/_shared/llm.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/adapters/generic-webhook-outbound.ts
  - .framework/functions/adapters/openai-outbound.ts
  - .framework/functions/adapters/resend-outbound.ts
  - .framework/functions/deliveries.ts
  - .framework/migrations/004_core_rpc_and_broker.sql
  - public/_redirects
---

# integration-outbound

## What it does

`integration-outbound` (`.framework/functions/integration-outbound.ts`) is the
single egress path for outbound calls. Every attempt is recorded as a
`webhook_deliveries` row (`direction: 'outbound'`), so there is no
fire-and-forget — the delivery row exists before, during, and after the wire
call.

`execute` runs this sequence:

1. Resolve the integration row by `integration_slug`: the caller-account row
   first, then a system row (`account_id IS NULL`); both must be `is_active`.
2. Open (or reuse, on `delivery_id`) the `webhook_deliveries` row — `status:
   'pending'`, `attempt_count: 0`, `max_attempts` from
   `action_config.max_attempts` → `integration.config.retry_policy.max_attempts`
   → `3`.
3. Resolve the credential field (`action_config.credential_field`, default
   `api_token`) via `resolveCredential` (`.framework/functions/_shared/
   resolve-credentials.ts`) — server-side only: `source: 'env_var'` reads
   `process.env[value]`, `source: 'value'` returns the literal. An absent or
   explicitly-empty (`source: 'value'`, `value: ''`) entry means "call
   without auth": `execute` skips resolution, passes no credential to the
   adapter, and audits `integration.credential_missing` /
   `integration.credential_empty` with `skipped: true` — the adapter decides
   whether a key is required. A named-but-unset `env_var` still throws. Every
   resolution or failure emits an `integration.credential_*` audit event.
4. Pick the adapter: `action_config.adapter ||
   integration.config.outbound_adapter`. Built-ins live in
   `builtInOutboundAdapters` (`adapters/openai-outbound`,
   `adapters/generic-webhook-outbound`, `adapters/resend-outbound`); any other
   name is dynamically imported as `./<name>` and must export `buildRequest`.
5. `fetch` the request the adapter built, then update the delivery to
   `delivered` (with `response_status`, `response_body`, `duration_ms`) or back
   to `pending`/`failed` with `next_attempt_at`.

Known callers: `_shared/llm.ts` (`callOpenAI`, `callOpenAIEmbeddings`,
`callOpenAIChat` — all `integration_slug: 'openai'`), the pipeline stage
handlers `http_request`, `agent_inference`, `send_email`, and
`handler_module: 'webhook'` (all `integration_slug: 'generic-http'`), the
`retryPendingDeliveries` sweep (`.framework/functions/_shared/
retry-deliveries.ts`), and manual retry in `deliveries.ts`.

## Route and methods

- `POST /api/integration-outbound` — `public/_redirects` maps `/api/*` to
  `/.netlify/functions/:splat`; the default export is `createHandler(execute)`.
- There is no `action` dispatch — the request body *is* the contract.

## Authentication

`createHandler` resolves a principal and rejects anonymous requests with 401,
so any authenticated caller works (human JWT or `x-api-key` machine principal).
Internal callers import `execute` directly and pass their own `CoreContext`.

The `delivery_id` (retry) path additionally requires
`ctx.principal.isInternal` — true for the internal-invoke secret,
`is_internal` API keys, and `SYSTEM_PRINCIPAL`. A non-internal caller passing
`delivery_id` is *not* rejected: the stored-payload retry branch is skipped,
but the row id is still reused for status bookkeeping instead of inserting a
new delivery. See Agent notes.

## Request contract

Top-level body fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `integration_slug` | string | yes | `integrations.slug`; account-scoped row wins over the system row. |
| `record_id` | uuid | no | Fetched via admin-data `get` and passed to the adapter as `record`. |
| `action_config` | object | no | See below. |
| `delivery_id` | uuid | no | Reuse an existing delivery row (retry path). |

`action_config` keys consumed by `execute` itself:

| Key | Notes |
|---|---|
| `adapter` | Adapter name; falls back to `integration.config.outbound_adapter`. |
| `credential_field` | `integrations.credentials` field to resolve; default `api_token`. |
| `max_attempts` | Overrides `config.retry_policy.max_attempts` and the default 3. |
| `action_slug` | Stored on the delivery row for traceability. |
| `update_record` / `update_fields` | On success, stamps `last_outbound_status`, `last_outbound_at`, plus `update_fields` onto `record_id` via admin-data `update`. |

Adapter-specific `action_config` keys:

- `adapters/generic-webhook-outbound` — `url` (required), `method` (default
  `POST`), `headers`, `body`. Adds `Authorization: Bearer <credential>` when a
  credential resolved.
- `adapters/openai-outbound` — `endpoint` (required, e.g. `/chat/completions`,
  `/embeddings`), `body`. Base URL from `integration.config.base_url` (default
  `https://api.openai.com/v1`).
- `adapters/resend-outbound` — `to` and `subject` required; `html` or `text`;
  `from` resolves `actionConfig.from` → `config.from` → `EMAIL_FROM` env →
  `onboarding@resend.dev`; optional `reply_to`; `config.api_url` overrides the
  Resend endpoint.
- Custom adapters — dynamically imported `./<name>` module exporting
  `buildRequest(record, ctx)` → `{ url, method, headers?, body?,
  external_id? }`.

## Response contract

Success returns, inside the standard `{ data, error, meta }` envelope:

```json
{ "success": true, "delivery_id": "<uuid>", "response_status": 200,
  "response_body": { }, "is_retry": false }
```

`response_body` is the parsed JSON response, or the raw text when it isn't
JSON. A non-2xx target response throws — the delivery row is still updated
first (see Side effects), so the attempt is durable even though the HTTP
response is an error envelope.

## Side effects

- `webhook_deliveries` insert (`pending`) or update (`processing` →
  `delivered`/`pending`/`failed` with `attempt_count`, `next_attempt_at`,
  `response_status`, `response_body`, `duration_ms`, `last_error`).
- Audit events: `integration.outbound.started`, `.succeeded`,
  `.failed_http`, `.error`, plus `integration.credential_*` events from
  `resolveCredential`.
- One external `fetch` per attempt. The tracking INSERT is intentionally
  overlapped with the wire call (`insertPromise`), so logging does not
  serialize ahead of latency.
- Optional admin-data `update` on `record_id` when
  `action_config.update_record` is set — runs the full permission/audit
  pipeline, not a raw write.

## Errors

| Condition | Error |
|---|---|
| No slug | `integration_slug is required` |
| Slug matches no active account or system integration | `Integration not found: <slug>` |
| Retry of unknown delivery | `Delivery not found: <id>` |
| `env_var` credential names an unset variable | `Environment variable <var> … is not set` (audits `integration.credential_env_missing`). Absent/empty credential entries do **not** throw — the call proceeds unauthenticated and the adapter enforces its own requirement (e.g. `OpenAI adapter requires api_token credential`) |
| No adapter name resolved | `No outbound adapter configured for integration <slug>` |
| Adapter import failed or lacks `buildRequest` | `Outbound adapter not found: <name>` |
| Adapter returned no url/method | `Outbound adapter must return url and method` |
| Delivery insert failed | `Failed to create outbound delivery record` |
| Non-2xx target | `Outbound HTTP <method> to <url> failed with status <status>` |
| Delivery-row insert races and fails | `Failed to create outbound delivery record` (surfaced where `insertPromise` is awaited) |

Thrown errors map to HTTP 500 unless they carry `statusCode`; the delivery
row keeps the attempt either way.

## Agent notes

- **Retry semantics.** `computeNextAttempt` is `30s * 2^attempt` capped at 1
  hour plus up to 20% jitter. A failed attempt stays `pending` with
  `next_attempt_at` until `attempt_count >= max_attempts`, then `failed`.
  `retryPendingDeliveries` (run by `system-cron` each tick) sweeps `pending`
  rows with `attempt_count < 10` whose `next_attempt_at` is due or null — up
  to 100 per pass — and re-invokes `execute({ delivery_id })` under
  `SYSTEM_PRINCIPAL`. Manual retry: `POST /api/deliveries?action=retry { id }`
  — outbound only. Inbound retry is unimplemented.
- **Non-internal `delivery_id`.** The `isInternal` check gates only the
  *payload-replay* branch; the row id itself is still honored. An ordinary
  caller can pass `delivery_id` and have their request's outcome stamped onto
  that row (`status: 'processing'` → result). There is no per-account check on
  the row — treat `delivery_id` as an internal field.
- **`generic-http` is unauthenticated by default — and that works.**
  Migration `004` seeds it with `api_token: { source: 'value', value: '' }`;
  `execute` treats an absent or empty-literal credential as "no auth", so
  `http_request`/`webhook`/`agent_inference` stages send the request with no
  `Authorization` header on a stock install (the generic adapter only adds
  Bearer when a credential resolved). To authenticate, set a real token or
  point the field at an `env_var`; to authenticate differently, pass
  `action_config.headers`. The skip is still audited as
  `integration.credential_empty`/`credential_missing` with `skipped: true`.
- **`openai` seed** uses `env_var: OPENAI_API_KEY`; `callOpenAIChat` defaults
  to `gpt-4o-mini`/0.7/4000, overridable via `config.models.chat` /
  `.embedding` on the integration row.
- **Mock responses live in callers, not here.** `callInference` in
  `.framework/functions/_shared/agent-runner.ts` catches "not found"/
  "credential" errors and returns a marked mock; this function always throws.
- Do not call outbound adapters or `fetch` external URLs directly — delivery
  tracking, credential audit, and retry all depend on going through
  `execute`. See [integrations and webhooks](../../concepts/integrations-and-webhooks.md).
