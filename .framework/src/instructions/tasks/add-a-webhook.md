---
title: Add a webhook
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/integration-routes.ts
  - .framework/functions/_shared/webhook-registry.ts
  - .framework/functions/_shared/webhook-registration.ts
  - .framework/functions/integration-outbound.ts
  - .framework/functions/adapters/generic-webhook-inbound.ts
  - .framework/migrations/004_core_rpc_and_broker.sql
---

# Add a webhook

Two directions, two different mechanisms: **inbound** webhooks arrive at the
`integration-routes` function and are normalized by a registry adapter into
`items` records; **outbound** webhooks leave through
`integration-outbound` (usually from a pipeline stage). See
[Integrations and webhooks](../concepts/integrations-and-webhooks.md).

## Goal — inbound

Receive an external POST and turn it into a record.

### Steps

1. **Create the integration** ([Add an integration](./add-an-integration.md))
   the webhook posts against. Set `config.event_path` if the event name
   lives inside the payload (`"type"` or `"data.event"`), and
   `config.handler_name` to force an adapter — otherwise the adapter name
   falls back to `integration.provider`, then `generic-webhook`
   (`.framework/functions/integration-routes.ts`).

2. **Mint an API key for the sender.** `integration-routes` requires a
   machine principal (`x-api-key`), and the key is authorized per
   `account_id` — optionally pinned to `integration_id` and `app_id`
   (`.framework/functions/integration-routes.ts`). See
   [Auth and API keys](../concepts/auth-and-api-keys.md).

3. **Register or reuse an adapter.** `webhook_handlers` rows map a handler
   name → `function_name`; lookup prefers the app/account-scoped row and
   falls back to a global one, then `loadHandler` dynamically imports the
   module and takes `adapt` → `handler` → `default`
   (`.framework/functions/_shared/webhook-registry.ts`). Migration
   004 seeds a global `generic-webhook` handler bound to
   `adapters/generic-webhook-inbound`, which stores the raw payload as a
   `webhook_event` item (`.framework/migrations/004_core_rpc_and_broker.sql`).

4. **Adapter contract.** The adapter receives `(payload, ctx)` where `ctx`
   carries `integration`, `apiKey`, `accountId`, `appId`, `event`,
   `headers`, and a `logger`; it returns
   `{ type_slug, data, title?, status?, thread?, links?, external_id?, error?, retryable? }`.
   A truthy `error` marks the delivery `failed` (or `pending` when
   `retryable`); a result with `type_slug` is created through `admin-data`
   as an `items` record (`.framework/functions/integration-routes.ts`).

5. **Post to it.** `POST /api/integration-routes?slug=<integration-slug>`
   with `x-api-key: <key>` and the payload body. The event name comes from
   the `x-event-type` header first, then `config.event_path`
   (`.framework/functions/integration-routes.ts`).

## Goal — outbound

Call an external URL from a pipeline.

### Steps

1. Add an `http_request` stage (arbitrary HTTP) or a webhook action whose
   `handler_module: 'webhook'` routes to `executeWebhookHandler` — the
   webhook URL comes from the action's config
   (`.framework/functions/_shared/pipeline-runner.ts`).
2. For credentialed or retried sends, go through `integration-outbound`
   instead — see [Add an integration](./add-an-integration.md). Deliveries
   are tracked in `webhook_deliveries` with exponential backoff.

## Verify

- Inbound: `webhook_deliveries` shows `direction: 'inbound'` rows moving
  `pending → delivered`; the created item appears via `/api/admin-data`.
- Outbound: `webhook_deliveries` shows `direction: 'outbound'` rows with
  `response_status`.

## Common mistakes

- **Human JWT instead of `x-api-key`** — the route requires a machine
  principal and returns `Machine principal required` (401).
- **API key pinned to a different integration/app** — `403 API key is not
  authorized`.
- **`x-event-type` vs `event_path` confusion** — the header wins; if the
  sender can't set headers, put the event inside the payload and set
  `config.event_path`.
- **Unregistered handler name** — `config.handler_name` (or `provider`)
  that has no `webhook_handlers` row and no global fallback returns
  `Handler not found` (404).
- **Registering handlers under the wrong scope** — an app- or
  account-scoped `webhook_handlers` row shadows the global fallback for
  that scope only.

## Reference

- [integration-routes reference](../reference/functions/integration-routes.md) ·
  [integration-outbound reference](../reference/functions/integration-outbound.md) ·
  [deliveries entity page](../deliveries.md)
- [Integrations and webhooks](../concepts/integrations-and-webhooks.md) ·
  [Add a pipeline](./add-a-pipeline.md)
