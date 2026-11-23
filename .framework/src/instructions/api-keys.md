---
title: API Keys
audience: both
kind: entity
verified_against: 3ff4b85
verified_on: 2026-11-17
source_files:
  - .framework/functions/api-keys.ts
  - .framework/functions/_shared/hash-api-key.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/logging.ts
  - .framework/src/pages/admin/APIKeysPage.tsx
  - .framework/src/pages/admin/APIKeyDetailPage.tsx
---

## What this is for

An **API key** authenticates callers to Spine — integrations, MCP servers, CLI tooling, and service-to-service calls. A key controls which callers are accepted, how fast they can call, and which permissions they carry.

## Why it exists

### api-keys

Users authenticate with Supabase Auth, but background jobs, external services, and CLI tools need their own scoped credentials.

**Why it exists (5-whys):**

1. Background jobs, external services, and CLIs aren't people — they need scoped credentials that don't die with a session.
2. `key_hash` (salted slow hash, added in `004`) stores a verifier, not the secret — a leaked database must not leak usable credentials.
3. The config-table shape (`UNIQUE(app_id, slug)`, `config`) carries scope/limit config and app/account scoping — `principal.ts` resolves keys into machine principals like any other governed identity.
4. `api_key_usage_logs` is a separate table because machine traffic differs from human logs — method/path/IP/status/duration per call for billing, abuse detection, and forensics without polluting `logs`.
5. **Root:** non-human actors are principals too — `api_keys` gives machines scoped, revocable identity, and `api_key_usage_logs` makes their activity as auditable as a person's. *(confirmed 2026-11-13)*

Companion ledger: api-key-usage-logs.

### api-key-usage-logs

API keys are machine principals; you need to track who/what called which endpoint, when, and whether it succeeded, separately from human-user activity in `logs`.

Companion of `api_keys` — its full reasoning is level 4 of the chain in api-keys `## Problem it solves` and the api-keys article.

## Fields and settings

- **Name** *(required)* — human-readable label; missing name blocks creation.
- **Integration ID** — optional UUID of the integration this key serves.
- **App ID** — optional UUID/slug of the owning app (server resolves slugs via `resolveAppUuid`).
- **Key Type** — `inbound` (external callers into Spine), `outbound` (Spine calling out), `internal` (service-to-service), `cli` (scripts/tooling). Determines how the key is validated.
- **Key Prefix** — derived server-side: the raw key is `sk_<uuid>` and `key_prefix` stores its first 8 characters for lookup. Not a form field.
- **Rate Limit (requests/min)** — `rate_limit`, UI range 1–10000. Enforced per key inside `rate_limit_window_seconds` (default 60s, overridable via key `config`). An unset/`0` value falls back to the default 100 — it does not block requests.
- **Expires At** — optional date; after it the key is rejected.
- **Machine Type** — machine principal type, e.g. `integration`.
- **Internal** — marks the key for internal service-to-service use.
- **Active** — inactive keys are rejected on every call.
- **Permissions / Scopes / Metadata (JSON)** — `permissions` and `scopes` are string arrays (validated against required permissions on `action=validate`); `metadata` is free-form. Invalid JSON fails creation.

**Downstream effects**

- The gateway validates `key_prefix` + `key_hash` on every call — inactive, expired, or over-limit keys are rejected.
- The raw key is returned **once** at create (`raw_key` in the response envelope). It is never stored or returned again — `key_value`/`key_hash` are stripped from all API responses (S-001/F-040).
- The API has no update action (list/get/create plus `validate`, `revoke`, `usage-logs`) — rotate = create new + revoke old.
- **Who can create/revoke:** any authenticated, account-bound principal — `create`, `revoke`, `list`, `get`, and `usage-logs` are scoped to `ctx.accountId` for non-system callers. Non-system callers are denied `is_internal` keys and `*:*` scope (403), and requested `scopes` are clipped to the caller's own — a `cli` key can mint replacements carrying at most its own scopes. Only `system_admin` or an unbound internal machine can mint wildcard/internal keys or operate across accounts (S-011).
- Keys still referenced in local MCP configs or scripts fail immediately when revoked/deactivated.

## Minimal configuration

```json
{
  "name": "CI deploy key",
  "key_type": "cli",
  "rate_limit": 60,
  "is_active": true
}
```

## Full configuration

```json
{
  "name": "Answer Once MCP",
  "key_type": "inbound",
  "app_id": "answer-once",
  "rate_limit": 600,
  "expires_at": "2027-01-01",
  "machine_type": "integration",
  "is_active": true,
  "permissions": ["admin-data:read"],
  "scopes": ["admin-data:read", "logs:read"],
  "metadata": { "env": "dev" }
}
```

## Example

A local MCP server authenticates with an `inbound` key scoped to read-only admin-data calls; a separate `cli` key (low rate limit) backs the `spine-framework` CLI. A leaked key gets rotated by creating a replacement and revoking the old one — the audit found a plaintext-stored legacy key and deactivated it (S-001/S-003).

## Core files

- `.framework/functions/api-keys.ts` — API (create/list/get + `validate`/`revoke`/`usage-logs` actions; mints `sk_<uuid>` raw key)
- `.framework/functions/_shared/hash-api-key.ts` — `hashApiKey`, `verifyApiKey` (pbkdf2), `omitSecretFields` (strips `key_value`/`key_hash`)
- `.framework/functions/_shared/logging.ts` — `resolveAppUuid` (app slug → UUID on create)
- `.framework/functions/_shared/principal.ts` — per-request key resolution (`x-api-key` → prefix lookup → pbkdf2 verify → per-key + per-IP rate limit)
- `.framework/cli/context.ts` — CLI auth path (F-042)
- `.framework/src/pages/admin/APIKeysPage.tsx` / `APIKeyDetailPage.tsx` — admin UI
- Table: `public.api_keys`

## Agent notes

- Copy `raw_key` at creation — there is no "show key" later. Treat any key whose value was ever visible as burned.
- Prefer short `expires_at` + documented `metadata.env` over long-lived keys.
- Scripted/agent access: `npx spine-framework bootstrap` mints the first `sk_` key without a browser (S-002); after that, create additional `cli`/`inbound` keys here or via the API — see [Install and first run](guide/01-install-and-first-run.md) § Giving your agent access.
- Rotation procedure (create → switch → verify → revoke, with the real authority model): [Rotate an API key](tasks/rotate-an-api-key.md).
