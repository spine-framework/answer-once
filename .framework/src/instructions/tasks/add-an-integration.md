---
title: Add an integration
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/integrations.ts
  - .framework/functions/integration-outbound.ts
  - .framework/functions/_shared/resolve-credentials.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/migrations/004_core_rpc_and_broker.sql
---

# Add an integration

## Goal

Create a `public.integrations` row — the config + credentials handle for
outbound HTTP calls (`integration-outbound`) and inbound webhook routing
(`integration-routes`). See
[Integrations and webhooks](../concepts/integrations-and-webhooks.md) for
the full model.

## Prerequisites

- A `system_admin` login — the integrations function enforces it
  (`.framework/functions/integrations.ts`, `isSystemAdmin` signal).

## Steps

1. **Choose the integration shape.**

   - `integration_type`: semantic category — `webhook`, `oauth`, `api`,
     `scheduled_sync` (column comment,
     `.framework/migrations/004_core_rpc_and_broker.sql`).
   - `provider`: the vendor name — `stripe`, `openai`, `generic`, …
     (used as the fallback inbound adapter name).
   - `slug`: unique per `(app_id, account_id)` —
     `integrations_app_account_slug_key`
     (`.framework/migrations/004_core_rpc_and_broker.sql`).

2. **Configure `config` and `credentials`.**

   - `config.outbound_adapter` selects the adapter module for outbound
     calls — built-ins: `adapters/openai-outbound`,
     `adapters/generic-webhook-outbound`, `adapters/resend-outbound`
     (`.framework/functions/integration-outbound.ts`). `action_config.adapter`
     can override it per call.
   - `credentials` is a map `{ field: { source, value } }`:
     `source: "value"` stores a literal secret; `source: "env_var"` resolves
     `value` as a `process.env` name server-side at call time
     (`.framework/functions/_shared/resolve-credentials.ts`).

   ```json
   {
     "slug": "acme-api", "name": "Acme API",
     "integration_type": "api", "provider": "acme",
     "config": {
       "base_url": "https://api.acme.test",
       "outbound_adapter": "adapters/generic-webhook-outbound"
     },
     "credentials": {
       "api_token": { "source": "env_var", "value": "ACME_API_TOKEN" }
     }
   }
   ```

   `is_configured` is recomputed on every save — `true` only when every
   credential entry is present and non-empty
   (`.framework/functions/integrations.ts`).

3. **Create the integration.** Admin UI → **Configs → Integrations → New**,
   or `POST /api/integrations` — `name`, `integration_type`, and `provider`
   required (`.framework/functions/integrations.ts`).

4. **Call it outbound.** `POST /api/integration-outbound` (or a pipeline
   `http_request`/webhook stage) with `{ integration_slug, action_config }`.
   `action_config` carries `endpoint`/`url`, `body`, `credential_field`
   (default `api_token`), `action_slug`, `max_attempts`, and optional
   `adapter` (`.framework/functions/integration-outbound.ts`).
   Deliveries land in `webhook_deliveries` with retry bookkeeping — see
   [integration-outbound reference](../reference/functions/integration-outbound.md).

5. **For inbound**, point senders at `integration-routes` and pick an
   adapter — see [Add a webhook](./add-a-webhook.md).

## Verify

- `GET /api/integrations?action=list` — `is_configured: true` once every
  credential resolves.
- A `webhook_deliveries` row is written per outbound call with
  `response_status` and retry fields.

## Common mistakes

- **An empty or absent credential means "no auth", not an error.**
  `execute` skips resolution for an absent entry or an empty
  `source: "value"` literal and the call goes out without a credential —
  the stock `generic-http` seed (`{"api_token":{"source":"value","value":""}}`,
  `.framework/migrations/004_core_rpc_and_broker.sql`) therefore works
  unauthenticated out of the box. Whether a credential is required is the
  *adapter's* call: `generic-webhook-outbound` only attaches
  `Authorization: Bearer` when a credential resolved, while
  `openai-outbound`/`resend-outbound` throw in `buildRequest`. What still
  fails hard: an `env_var` entry naming an unset variable
  (`credential_env_missing`).
- **Expecting credentials in reads.** Integrations are a protected
  second-surface table — non-system-admin/machine reads are sanitized to
  minimal fields; secrets are only resolved server-side
  (`.framework/functions/_shared/permissions.ts`).
- **`env_var` pointing at a missing env** — `resolveCredential` throws
  before the request is sent and emits `integration.credential_*` audit
  rows.
- **Slug not unique within `(app_id, account_id)`** — the DB unique
  constraint rejects it; account-scoped and global rows share the key.

## Reference

- [integrations entity page](../integrations.md) ·
  [integrations function reference](../reference/functions/integrations.md) ·
  [integration-outbound reference](../reference/functions/integration-outbound.md) ·
  [integration-routes reference](../reference/functions/integration-routes.md)
- [Integrations and webhooks](../concepts/integrations-and-webhooks.md)
