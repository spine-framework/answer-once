---
title: integration-routes
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/integration-routes.ts
  - .framework/functions/_shared/webhook-registry.ts
  - .framework/functions/_shared/webhook-registration.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/retry-deliveries.ts
  - .framework/functions/deliveries.ts
  - .framework/migrations/004_core_rpc_and_broker.sql
  - public/_redirects
---

# integration-routes

## What it does

`integration-routes` (`.framework/functions/integration-routes.ts`) is the
inbound webhook surface. An external caller POSTs a provider payload to a
named integration; the function authenticates the caller's API key, resolves
the integration's registered handler through the `webhook_handlers` registry,
lets the adapter normalize the payload into an item shape, creates the record
through admin-data (full permission/type/audit pipeline), and records the
whole attempt as a `webhook_deliveries` row (`direction: 'inbound'`).

The `execute` sequence:

1. Read `slug` from `?slug=` or `body.slug`; require a machine principal —
   `ctx.principal.id` must match an `api_keys` row.
2. Load the `integrations` row matching `slug` **and** `apiKey.account_id`
   (inbound integrations are always account-scoped here), `is_active`.
3. Enforce key pinning: `apiKey.integration_id` must equal the integration id
   when set; `apiKey.app_id` must equal `integration.app_id` when both set.
4. Extract the event name — `x-event-type` header first, else
   `integration.config.event_path` (a dot-path into the payload).
5. Resolve the handler name `config.handler_name || provider ||
   'generic-webhook'` through `resolveHandler` (`.framework/functions/_shared/
   webhook-registry.ts`): a `webhook_handlers` row maps `name → function_name`,
   scoped by `(app_id, account_id)` with a global `NULL/NULL` fallback; the
   module is dynamically imported (`custom/…` paths resolve into the custom
   tree) and must export `adapt`, `handler`, or a default function.
6. Insert the inbound `webhook_deliveries` row (`payload`, `api_key_id`,
   `handler_name`, `external_id: body.id`), emit
   `integration.inbound.started`, invoke the adapter, create the `items`
   record via admin-data `create`, and mark the delivery `delivered`.

## Route and methods

- `/api/integration-routes?slug=<integration-slug>` — `public/_redirects`
  maps `/api/*` to `/.netlify/functions/:splat`; the default export is
  `createPublicHandler(execute)`.
- `execute` performs no method check — any HTTP method with a JSON body
  works; in practice providers POST.

## Authentication

`createPublicHandler` resolves a principal but does not reject anonymous
requests — `execute` itself enforces:

- `ctx.principal.id` must exist — `401 Machine principal required` otherwise
  (JWT-only human callers have a person id, not an api-key id, so they fail
  at the next check).
- The id must match an `api_keys` row — `401 Invalid API key` otherwise.
- The key's `account_id` scopes the integration lookup; a key pinned to
  `integration_id` or `app_id` gets `403` for anything else.

There is **no HMAC/signature verification** — the API key sent as
`x-api-key` is the entire credential. Prefer keys pinned to
`integration_id`/`app_id` and rotate them like any secret. See
[auth and API keys](../../concepts/auth-and-api-keys.md).

## Request contract

| Input | Where | Notes |
|---|---|---|
| `slug` | query `?slug=` or `body.slug` | Integration slug, required. |
| `x-api-key` | header | Machine credential; resolved by `resolvePrincipal`. |
| `x-event-type` | header | Optional event name; overrides `config.event_path` extraction. |
| payload | JSON body | Passed verbatim to the adapter; `body.id` is stored as the delivery's `external_id`. |

The adapter returns:

```ts
{ type_slug: string, data: Record<string, any>, title?: string,
  status?: string, thread?: any, links?: any[], external_id?: string,
  error?: string, retryable?: boolean }
```

`type_slug` is required for record creation. `thread` and `links` are
declared in the contract but currently no-ops (TODO in source).

## Response contract

Success returns the admin-data `create` result — the created `items` record —
inside the standard `{ data, error, meta }` envelope, and the delivery is
marked `delivered` with `response_status: 200`.

Adapter-reported errors (`adapterResult.error`) throw with the adapter's
message; `retryable: true` marks the delivery `pending` (with a backoff
`next_attempt_at`) before the throw — though see Agent notes: the outer catch
re-marks *every* post-insert error `pending`, and nothing re-delivers inbound
rows anyway.

## Side effects

- `webhook_deliveries` insert (`direction: 'inbound'`, `api_key_id`,
  `handler_name`, `payload`, `external_id`) then status updates.
- One `items` row created via `admin-data` `create` under a synthesized
  context (`adminDb`, `accountId: integration.account_id`,
  `principal.id: null`) — type resolution, validation, triggers, and audit
  all run.
- Audit events: `integration.inbound.started`, `.delivered`,
  `.adapter_retryable`, `.adapter_failed`, `.error`.

## Errors

| Status | Condition |
|---|---|
| 400 | `Integration slug is required` |
| 401 | `Machine principal required` · `Invalid API key` |
| 403 | `API key is not authorized for this integration` · `… for this app` |
| 404 | `Integration not found: <slug>` · `Handler not found: <name>` |
| 500 | `Failed to create inbound delivery record` · `Adapter result is missing type_slug` · adapter/admin-data errors propagate |

## Agent notes

- **Inbound retry is not implemented.** `retryPendingDeliveries`
  (`.framework/functions/_shared/retry-deliveries.ts`) counts inbound rows as
  `inbound_failed` and `deliveries?action=retry` rejects non-outbound
  deliveries outright. Worse, the `catch` in `execute` re-marks *any* error
  after the delivery insert as `pending` with `next_attempt_at` — including
  non-retryable adapter errors and admin-data create failures — so failed
  inbound deliveries sit `pending` forever. When debugging "stuck" inbound
  rows, check `last_error`, not just `status`.
- `registerWebhookHandler`/`deregisterWebhookHandler`
  (`.framework/functions/_shared/webhook-registration.ts`) manage the
  `webhook_handlers` table — upsert on `(app_id, account_id, name)`;
  deregister soft-deletes. Migration `004` seeds the `generic-webhook`
  handler (`adapters/generic-webhook-inbound`), which stores the raw payload
  as a `webhook_event` item.
- The lookup is cached per `(appId, accountId, handlerName)` in-process —
  newly registered handlers may not resolve until a cold start.
- Adapters run inside the function with a console `logger` and receive the
  raw headers — they can do their own signature checks if the provider
  requires it, but nothing enforces that.
- See [integrations and webhooks](../../concepts/integrations-and-webhooks.md)
  for the full mental model.
