---
title: API Authentication
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/hash-api-key.ts
  - .framework/functions/_shared/db.ts
  - .framework/functions/api-keys.ts
  - .framework/migrations/004_core_rpc_and_broker.sql
  - .framework/src/lib/api.ts
---

# API Authentication

Every function wrapped by `createHandler` resolves a `Principal` from request
headers via `resolvePrincipal` (`.framework/functions/_shared/principal.ts`)
before your code runs. `createPublicHandler` resolves a principal too but
does not require one. `/api/*` paths proxy to Netlify functions via
`/.netlify/functions/:splat` (`.framework/public/_redirects`).

## Credential resolution order

`resolvePrincipal` checks headers in this order — **first match wins**:

1. **`X-Api-Key`** → machine principal. Looks up `api_keys` rows by
   `key_prefix` (first 8 chars of the presented key) among `is_active` keys,
   requires `expires_at` unset-or-future, verifies `key_hash` with a
   timing-safe pbkdf2 compare (`.framework/functions/_shared/hash-api-key.ts`
   — `pbkdf2$100000$sha256`), enforces per-key rate limit (`rate_limit`,
   default 100 per `config.rate_limit_window_seconds`, default 60s) and a
   per-IP ceiling (`rate_limit_hit` RPC, default 300/60s), then logs usage to
   `api_key_usage_logs`. Scopes come from `key.scopes`; `*:*` grants
   `system_admin`-equivalent reach. `key.machine_type` and `is_internal` ride
   on the principal.
2. **`X-Internal-Secret`** → internal invocation. Compared against
   `INTERNAL_INVOKE_SECRET` with a timing-safe hash compare. When valid,
   `X-Cron-Id` resolves a cron principal from `schedules` (validated by the
   `validate_schedule_creator` RPC), `X-Trigger-Id` resolves the trigger's
   action `default_machine_principal_id` from `api_keys`, and a bare secret
   resolves `SYSTEM_PRINCIPAL` (`*:*` scope). **Without this secret the
   `x-cron-id`/`x-trigger-id` headers are never honored** — they exist only
   for trusted function-to-function calls.
3. **`Authorization: Bearer <jwt>`** → human principal.
   `supabase.auth.getUser` validates the JWT, `resolveInternalPersonId` maps
   `auth.users.id` → `people.id` (auth_uid binding, then email fallback),
   and the person's `roles.slug` becomes `principal.roles`. Results are
   cached ~60s per token hash (max 500 entries); principals with neither
   `account_id` nor `role_id` (mid-registration) are never cached.
4. **Nothing** → `ANONYMOUS_PRINCIPAL` → `createHandler` returns 401.

## Principal shape

```ts
interface Principal {
  id: string                      // people.id, api_keys.id, 'system', or 'anonymous'
  type: 'human' | 'machine'
  accountId: string | null
  roles?: string[]                // role slugs (humans; *:* machines get system_admin)
  scopes?: string[]               // machine scopes, e.g. 'items:read', '*:*'
  machineType?: 'integration' | 'service_account' | 'internal' | 'timer'
  isInternal?: boolean
  provenance: { sourceType: 'jwt'|'api_key'|'cron'|'trigger'|'manual'|'webhook'|'timer', ... }
  authContext?: { jwt?: string }  // transport-only — never serialize
}
```

`getPrincipalDb(principal)` picks the request's DB client: humans with a JWT
get an RLS-scoped client (`getUserDb`); machines/anonymous get `adminDb`.

## Scope checking

`machineHasScope` honors exact `resource:action`, `resource:*`, and `*:*`
wildcards. `admin-data` create treats machine `*:*` as authorized; elsewhere
`isSystemAdmin` (human `system_admin` role or machine `*:*`) is the bypass.
`humanHasRole` matches role slugs.

## Client headers that matter

| Header | Effect |
|---|---|
| `Authorization: Bearer <jwt>` | human auth |
| `X-Api-Key: <key>` | machine auth |
| `X-Internal-Secret: <secret>` | internal function-to-function auth (+ `X-Cron-Id`/`X-Trigger-Id`) |
| `X-Account-Id` | carried into `ctx` for account-scoped flows (set by `apiFetch` from `setAccountId`) |
| `X-App-Id` | app slug hint for app-scoped behavior (auto-set by `apiFetch` from the route prefix) |
| `X-Request-Id` | propagated request id (a UUID is generated when absent/invalid) |
| `traceparent`/`tracestate` | W3C trace context, echoed back on responses |

The browser client `apiFetch` (`.framework/src/lib/api.ts`) attaches
`Authorization`, `X-Account-Id`, `traceparent`, and `x-app-id`
automatically.

## Failure modes

| Status | Cause |
|---|---|
| 401 `Authentication required` | no credential resolved, expired/invalid JWT (`auth.getUser` fails → anonymous), or `resolvePrincipal` threw (see below) |
| 401 `Invalid or inactive machine principal` | unknown `key_prefix`, inactive key, expired key, or hash mismatch — thrown by `resolveMachinePrincipal` |
| 401 `Rate limit exceeded for this API key` / `for this address` | per-key or per-IP ceilings hit — thrown as errors, surfaced via the 500-unless-statusCode path (these errors carry no `statusCode`, so check function logs when a 500 appears on auth) |
| 401 `Invalid or inactive schedule: <id>` / `Invalid trigger: <id>` | `x-cron-id`/`x-trigger-id` resolution failed after a valid internal secret |
| 401 `Person lookup error …` / `Person not found: <id>` | JWT verified but no `people` row exists (incomplete registration or deleted person) |
| 403 `Access denied` | principal resolved but matched `security_blocklist` (person/account/email/IP), checked by `isBlockedRequest` — fails open when the table is absent |
| 400 `Invalid JSON in request body` | body was present but unparseable |

## Related

- [Errors and Envelopes](errors-and-envelopes.md) · [admin-data](admin-data.md)
- [API Keys](../../api-keys.md) · [Auth and API Keys](../../concepts/auth-and-api-keys.md)
- [Environment Variables](../env-vars.md) — `INTERNAL_INVOKE_SECRET`, `SPINE_IP_RATE_LIMIT`
