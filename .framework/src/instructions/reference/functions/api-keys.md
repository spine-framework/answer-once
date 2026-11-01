---
title: api-keys
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/api-keys.ts
  - .framework/functions/_shared/hash-api-key.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/public/_redirects
---

# api-keys

## What it does

Mints, validates, revokes, and lists API keys — the `sk_…` credentials
that resolve to machine principals on every other endpoint. Also exposes
per-key usage logs.

## Route and methods

`/.netlify/functions/api-keys`, reachable as `/api/api-keys` (`/api/*` →
`/.netlify/functions/:splat`). Dispatch is by `?action=` plus method
(`?method=` can override the HTTP method):

| Call | Action |
|---|---|
| `GET /api/api-keys` | `list` |
| `GET /api/api-keys?id=<uuid>` | `get` |
| `POST /api/api-keys` | `create` |
| `POST /api/api-keys?action=validate` | `validate` |
| `POST /api/api-keys?action=revoke` | `revoke` |
| `GET /api/api-keys?action=usage-logs` | `listUsageLogs` |

Unrecognized `action` values fall through to the method-based default
branch, so `GET`/`POST` still dispatch; only methods other than `GET`,
`POST` (or a matched action with the wrong method) reach
`Invalid action or method`.

## Authentication

Standard `createHandler`: `x-api-key`, internal secret, or
`Bearer <jwt>`; anonymous → 401. `list`, `create`, and `usage-logs`
additionally require `ctx.accountId` ("Account context required").

- System admins read via `adminDb` (all accounts); other principals use
  `ctx.db` — JWT-scoped (RLS) for humans, service role for machines.
- There is **no machine-scope check** in this file. A machine principal
  with an `account_id` can create/revoke/read keys within what its
  service-role client reaches — treat key management as a trusted-surface
  operation.

## Request contract

**list** (query): `integration_id`, `key_type`, `is_active` (`'true'`/
`'false'`), `expires_before`, `expires_after`, `limit` (default 100),
`offset` (default 0). Ordered `created_at` desc.

**get** (query): `id`.

**create** (body): `name` required. Optional: `slug` (defaults to a
slugified `name`), `key_type` (default `'inbound'`), `permissions`,
`scopes`, `rate_limit` (default `100`), `expires_at`, `metadata`,
`integration_id`, `app_id` (resolved via `resolveAppUuid`, falling back
to the `x-app-id` header's app), `machine_type` (default `'integration'`),
`is_internal` (default `false`). `account_id` and `is_active: true` are
stamped from context; `created_by` is the principal id.

**validate** (body): `key_value` required; `required_permissions`
optional array.

**revoke** (body): `id` required.

**usage-logs** (query): `api_key_id`, `response_status`, `success`,
`date_from`, `date_to`, `limit` (default 100), `offset` (default 0).

## Response contract

Standard `{ data, error, meta }` envelope.

- `create` → the inserted row (`id, name, key_type, rate_limit,
  expires_at, is_active, created_at`) **plus `raw_key` — the only time
  the secret is returned** — and `warning: 'Store this key now. It will
  not be shown again.'` Raw key format: `sk_<32 hex chars>`.
- `validate` → `{ is_valid: true, api_key_id, integration_id, app_id,
  account_id, scopes, permissions }`, or `{ is_valid: false, error }`
  (HTTP 200 in both cases; `Insufficient permissions` carries
  `api_key_id`).
- `list`/`get`/`revoke`/`usage-logs` → rows passed through
  `sanitizeRecordData` + `omitSecretFields`, so `key_hash`/`key_value`-type
  secret columns never leave the function. Only `key_prefix` (first 8
  chars of the raw key) is stored in plaintext as the lookup index.

## Side effects

- `create` inserts an `api_keys` row storing `key_prefix` and a
  PBKDF2-SHA256 `key_hash` (the raw key is never stored).
- `revoke` sets `is_active = false` (keys are never hard-deleted here).
- `emitLog` writes `api_key.created` / `api_key.revoked` audit entries.
- Note: `api_key_usage_logs` rows are written by `resolvePrincipal` on
  every authenticated request that uses a key, not by this endpoint.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Missing `name` / `id` / `key_value` | 500 | `name is required` / `API key ID is required` / `key_value is required` |
| No account context | 500 | `Account context required` |
| Unknown action/method | 500 | `Invalid action or method` |
| DB failures | 500 | PostgREST message |

`validate` failures are payload-level (`is_valid: false`), not HTTP
errors.

## Agent notes

- `validate` checks permissions as **any-match**: a key passes if at least
  one of its `permissions` entries appears in `required_permissions`.
  Wildcard `*:*` in `scopes` is honored at principal resolution, not here.
- Key verification happens on prefix-matched candidates (`key_prefix` =
  first 8 chars), then PBKDF2 verify — `validate` mirrors exactly what
  `resolvePrincipal` does on a live request.
- To call `validate`/`revoke`/`get` a caller needs only to be
  authenticated (no `ctx.accountId` check on those paths); `revoke` on a
  machine principal runs with the service role — pin management calls to
  humans or `*:*` keys in practice.
- `expires_at` is nullable; expiry is enforced at resolution time
  (`expires_at.is.null OR expires_at >= now`).
