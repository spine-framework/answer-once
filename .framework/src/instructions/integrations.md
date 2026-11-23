---
title: Integrations
audience: both
kind: entity
verified_against: 3ff4b85
verified_on: 2026-11-16
source_files:
  - .framework/functions/integrations.ts
  - .framework/functions/integration-outbound.ts
  - .framework/functions/integration-routes.ts
  - .framework/functions/_shared/resolve-credentials.ts
  - .framework/src/pages/admin/IntegrationsPage.tsx
  - .framework/src/pages/admin/IntegrationDetailPage.tsx
---

## What this is for

An **integration** connects Spine to an external service (OpenAI, Resend, a generic HTTP endpoint, a database, ...). The record stores the provider, runtime `config` (including which adapter handles calls), and `credentials`. Pipelines and app code reference the integration by slug.

## Why it exists

### integrations

You need a central place to manage third-party connections and route incoming webhooks without hardcoding URLs in every function.

**Why it exists (5-whys):**

1. Connections (provider endpoints, tokens, feature flags) are per-app per-account — hardcoded means redeploys and secrets in code.
2. `config`/`metadata` JSONB absorbs provider variance — every service's shape differs; a document per integration beats a column per possible field.
3. `UNIQUE(app_id, slug)` + `type_id` make integrations domain vocabulary — apps declare which services they connect; accounts bind instances.
4. Typed integrations mean a "Slack" connection and a "webhook" connection carry different schemas — same types-as-data pattern.
5. **Root:** external connectivity is configuration the platform must govern — `integrations` makes third-party connections declarable, scoped, and swappable instead of code-bound. *(confirmed 2026-11-13)*

### webhook-handlers

Every new integration used to require a static import in `integration-routes.ts`. The registry lets apps register handlers at runtime.

**Why it exists (5-whys):**

1. A static route table means platform edits per app handler — `integration_routes` was exactly that, and `004` dropped it for this registry.
2. Self-registration (`function_name` + `events[]` via `_shared/webhook-registration.ts`) makes handlers discoverable at runtime — no central file, no import graph crossing the core/custom boundary.
3. `UNIQUE(app_id, account_id, name)` + a GIN index on `events` make dispatch a data lookup — `webhook-registry.ts` `resolveHandler` resolves by name/app/account, with caching.
4. `is_deleted` soft-delete keeps the audit of what was registered when deliveries arrived — unregistering shouldn't erase history.
5. **Root:** extensibility can't flow through core code — `webhook_handlers` makes inbound handlers discoverable data, so apps extend the integration surface without touching the framework. *(confirmed 2026-11-13)*

Companion ledger: webhook-deliveries.

## Fields and settings

- **Name** *(required)* — display name. The slug is **derived from it** server-side (`OpenAI` → `openai`); pass `slug` in the body only to override.
- **Type** *(required)* — select: `webhook`, `api`, `database`, `file`, `custom`. Categorizes the integration; the create form pre-fills sensible `config`/`credentials` templates per type.
- **Provider** *(required)* — free-text provider name (e.g. `openai`, `resend`, `postgres`).
- **Version** — string, default `1.0.0`.
- **Config (JSON)** — adapter and runtime settings. The adapter is named **here**, not as a top-level field: `config.outbound_adapter` (or `config.inbound_adapter` for inbound webhooks) points at an adapter module such as `adapters/openai-outbound`.
- **Credentials (JSON)** — secrets keyed by field name, each `{ "source": "env_var" | "value", "value": "..." }`. `source: "env_var"` resolves the named env var inside the function runtime; `source: "value"` stores the literal secret in the DB. The credential field callers read defaults to `api_token`.
- **Configured** — computed, read-only. `is_configured` is re-derived on every save from `credentials` (all entries must resolve); the UI shows it as Configured/Pending.
- **App ID** — select, optional. Owning app; blank = account-scoped.
- **Active** — boolean. Inactive integrations fail closed — callers get an error, not a fallback.
- **Description / Metadata** — optional notes and free-form data.

**Downstream effects**

- `env_var` credentials are resolved inside the function runtime — the variable must exist in the deployed env or calls fail at request time (`credential_env_missing`), not at save time. `source: "value"` persists the literal secret — prefer `env_var` for anything real.
- An absent or explicitly-empty (`source: "value"`, `value: ""`) credential entry means "call without auth" — the outbound broker sends no credential and the adapter decides whether one is required (the seeded `generic-http` integration works unauthenticated out of the box this way).
- Built-in outbound adapters: `adapters/openai-outbound`, `adapters/generic-webhook-outbound`, `adapters/resend-outbound`. Any other adapter path is dynamically imported — a typo saves fine but fails on first call.
- Outbound calls create a `webhook_deliveries` row (`pending`, `max_attempts` default 3 or `config.retry_policy.max_attempts`) and show up under Deliveries.
- Apps declare `integration_deps`; installing an app without its integrations leaves features broken until the records exist.
- The list/detail APIs use `adminDb` for system admins — integrations exist per account and per system scope.

## Minimal configuration

```json
{
  "name": "OpenAI",
  "integration_type": "api",
  "provider": "openai",
  "is_active": true,
  "config": {
    "outbound_adapter": "adapters/openai-outbound",
    "model": "gpt-4o"
  },
  "credentials": { "api_token": { "source": "env_var", "value": "OPENAI_API_KEY" } }
}
```

## Full configuration

```json
{
  "name": "Outbound webhook",
  "integration_type": "api",
  "provider": "custom",
  "version": "1.2.0",
  "is_active": true,
  "config": {
    "outbound_adapter": "adapters/generic-webhook-outbound",
    "base_url": "https://hooks.example.com",
    "timeout_ms": 10000,
    "retry_policy": { "max_attempts": 5 }
  },
  "credentials": { "api_token": { "source": "env_var", "value": "ACME_HOOK_TOKEN" } },
  "metadata": { "owner": "platform" }
}
```

## Example

A support app lists `integration_deps: ["openai"]` — the AI agents resolve the `openai` integration by slug for model calls (credential field `api_token`), and a second integration (`config.outbound_adapter: "adapters/generic-webhook-outbound"`) delivers outbound ticket events, each attempt logged under Deliveries.

## Core files

- `.framework/functions/integrations.ts` — API (list/get/create/update; `is_configured` computed on write; non-admin reads are sanitized)
- `.framework/functions/integration-outbound.ts` — outbound broker (adapter registry, delivery rows, retry math)
- `.framework/functions/integration-routes.ts` — inbound webhook entry
- `.framework/functions/_shared/resolve-credentials.ts` — `env_var`/`value` credential resolution
- `.framework/src/pages/admin/IntegrationsPage.tsx` / `IntegrationDetailPage.tsx` — admin UI (per-type config templates on the detail form)
- Table: `public.integrations`

## Agent notes

- Credentials shape is `{ "api_token": { "source": "env_var", "value": "OPENAI_API_KEY" } }` — nested `source`/`value` objects, not `{ "env_var": "..." }`. The latter saves but never resolves.
- Never put real secrets in `credentials.*.value` with `source: "value"` in seeds or docs — always `env_var`.
- There is no top-level `adapter` or `configuration` column — the field is `config`, and the adapter lives at `config.outbound_adapter` / `config.inbound_adapter`.
- After changing credentials, the broker picks them up on the next call — no cache flush needed.
