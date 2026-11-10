---
title: "Integrations and webhooks"
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/integrations.ts
  - .framework/functions/integration-outbound.ts
  - .framework/functions/integration-routes.ts
  - .framework/functions/deliveries.ts
  - .framework/functions/_shared/webhook-registration.ts
  - .framework/functions/_shared/webhook-registry.ts
  - .framework/functions/_shared/resolve-credentials.ts
  - .framework/functions/_shared/retry-deliveries.ts
  - .framework/functions/_shared/notify.ts
  - .framework/functions/adapters/generic-webhook-outbound.ts
  - .framework/migrations/004_core_rpc_and_broker.sql
---

# Integrations and webhooks

An **integration** (`public.integrations`) is a named bundle of `config` +
`credentials` that outbound calls and inbound webhooks share. Spine routes both
directions through `public.webhook_deliveries`, so every attempt is a durable
row you can list, inspect, and retry — there is no fire-and-forget.

## The integration row

`integrations` (`.framework/functions/integrations.ts`) requires `name`,
`integration_type`, and `provider` on create; it also carries `app_id`,
`version`, `config`, `credentials`, `metadata`, and a computed
`is_configured` flag.

Credentials live in a dedicated `credentials` jsonb column (added by migration
`004`) shaped `{ <field>: { source: "value" | "env_var", value: string } }`.
`resolve-credentials` resolves them **server-side only**, inside the functions
runtime: `source: "env_var"` reads `process.env[value]`; `source: "value"`
returns the literal string. Every resolution (or failure) emits an
`integration.credential_*` audit event. Non-system-admin, non-machine API reads
of an integration row are sanitized to minimal fields — credential values are
never returned to ordinary users, though they are stored in the database (use
`env_var` sources for the tightest posture).

## Outbound calls

`integration-outbound` (`.framework/functions/integration-outbound.ts`) is the
single egress path — `callOpenAI` in `_shared/llm.ts`, the `http_request`,
`webhook`, `send_email`, and `agent_inference` pipeline stages, and manual
calls all go through its `execute`:

1. **Resolve the integration**: account-scoped row matching
   `integration_slug` first, then a system integration (`account_id IS NULL`).
   Both must be `is_active`.
2. **Open a delivery row**: inserts `webhook_deliveries` with
   `direction: 'outbound'`, `status: 'pending'`, `attempt_count: 0`, and
   `max_attempts` from `action_config.max_attempts` →
   `integration.config.retry_policy.max_attempts` → default 3.
3. **Resolve the credential** (`action_config.credential_field`, default
   `api_token`) — skipped when the entry is absent or an empty
   `source: 'value'` literal, which means "call without auth"; the adapter
   then decides whether a key is required — and **pick an adapter**:
   `action_config.adapter || integration.config.outbound_adapter`. Built-ins
   are a static map (`builtInOutboundAdapters`): `adapters/openai-outbound`,
   `adapters/generic-webhook-outbound`, `adapters/resend-outbound`,
   `adapters/make-outbound`. Dynamic module loading was removed —
   caller-chosen module names are an arbitrary-code-execution surface — so
   custom adapters must be registered in the map, and an `Outbound adapter
   not found` error for a registered name means the executing bundle predates
   the registration (stale build or another deployment sharing the DB), not a
   misspelled name.
4. **Send**: the adapter builds `{ url, method, headers, body }`; the function
   fetches it, then updates the delivery to `delivered` (with
   `response_status`, `response_body`, `duration_ms`) or `pending`/`failed`.
5. Optionally, `action_config.update_record` stamps
   `last_outbound_status` / `last_outbound_at` back onto the source item.

Resolution is tenant-first, then the system row (`account_id IS NULL`) — a
missing tenant row silently resolves the system integration, so adapters
needing per-account config fail downstream rather than at lookup.
`adapters/make-outbound` is the example: the global `make` seed ships
`config.scenarios = {}`, and every account that sends to Make needs its own
`make` integration row with `config.scenarios.<key>.url` and
`credentials.api_token` (sent as `x-make-apikey`). When triaging a failed
outbound, read `webhook_deliveries` (`status`, `last_error`,
`integration_id`, `account_id`) plus the `logs` events
`integration.outbound.*` keyed by `delivery_id` — `integration_id` tells you
which row was resolved.

## Delivery and retry semantics

Both directions share the same retry math: `computeNextAttempt` is exponential
backoff — `30s * 2^attempt`, capped at 1 hour, with up to 20% jitter. A failed
attempt stays `pending` with `next_attempt_at` set until `attempt_count`
reaches `max_attempts`, when it becomes `failed`.

Retries are driven by `retryPendingDeliveries`
(`.framework/functions/_shared/retry-deliveries.ts`), which `system-cron` runs
every tick (see [automation](./automation.md)). It sweeps `webhook_deliveries`
rows that are `pending`, `attempt_count < 10`, and `next_attempt_at` due (or
null), up to 100 per pass, and re-invokes `integration-outbound` with
`delivery_id` under the system principal — the `delivery_id` path reuses the
existing row instead of inserting a duplicate. Because the filter also
matches brand-new deliveries (`pending` with `next_attempt_at` null), any
second deployment sharing the database — e.g. a stale Netlify site whose
`trigger-scheduler` still fires `system-cron` — can consume and poison a
delivery with outdated code before the originating pipeline's wire call
settles. You can also retry one delivery
manually via `POST /api/deliveries?action=retry { id }`
(`.framework/functions/deliveries.ts`); manual retry is outbound-only. Inbound
retry is not implemented — inbound failures are counted and logged.

`deliveries` list/get are account-scoped reads over the same table, filterable
by `direction`, `status`, `integration_id`, `api_key_id`.

## Inbound webhooks

`integration-routes` (`.framework/functions/integration-routes.ts`) is a
`createPublicHandler` endpoint — it resolves the caller as an **API-key
machine principal** (see [auth](./auth-and-api-keys.md)):

1. `?slug=` names the integration; the caller's API key must belong to the
   same account, and keys pinned to `integration_id` or `app_id` can only hit
   those integrations.
2. The event name comes from the `x-event-type` header or
   `integration.config.event_path` (a dot-path into the payload).
3. `config.handler_name || provider || 'generic-webhook'` is resolved through
   the **webhook registry** (`_shared/webhook-registry.ts`): the
   `webhook_handlers` table maps a handler name to a `function_name`, scoped
   app → account → global fallback. The named module is dynamically imported
   (`custom/…` paths resolve into `custom/`) and must export `adapt`,
   `handler`, or a default function.
4. The adapter returns `{ type_slug, data, title?, status? }` — the route then
   creates an `items` record through `admin-data` (full permission/type/audit
   pipeline) and marks the inbound delivery `delivered`. Adapter errors marked
   `retryable` leave it `pending`.

Handlers are registered with `registerWebhookHandler`
(`_shared/webhook-registration.ts`), an upsert on `(app_id, account_id,
name)`; `deregisterWebhookHandler` soft-deletes (`is_active=false`,
`is_deleted=true`).

## Notifications

`_shared/notify.ts` resolves pipeline `send_notification` recipients: each
entry is either a person UUID or `role:<slug>`, resolved to active `people`
rows in the caller's account via the `role_id → roles.slug` join. Anything
else is skipped with a warning. The resulting ids feed the `notifications`
insert in the pipeline runner.
