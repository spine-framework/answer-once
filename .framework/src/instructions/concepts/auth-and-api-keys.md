---
title: "Auth: sessions, API keys, and invites"
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/hash-api-key.ts
  - .framework/functions/_shared/rate-limit.ts
  - .framework/functions/api-keys.ts
  - .framework/functions/invites.ts
  - .framework/functions/integration-routes.ts
  - .framework/migrations/035_rate_limits.sql
  - .framework/migrations/052_registration_security.sql
---

# Auth: sessions, API keys, and invites

Every request to a Spine function resolves to one **Principal**
(`_shared/principal.ts`): either `type: 'human'` (a `people` row + roles) or
`type: 'machine'` (an `api_keys` row + scopes), plus `ANONYMOUS_PRINCIPAL` and
`SYSTEM_PRINCIPAL` sentinels. `resolvePrincipal` is the single dispatch point,
run by `createHandler` / `createPublicHandler` in `_shared/middleware.ts`:

1. `x-api-key` header → **machine** principal.
2. A valid `INTERNAL_INVOKE_SECRET` (function-to-function) → `x-cron-id` /
   `x-trigger-id` impersonation, else `SYSTEM_PRINCIPAL`. These headers are
   honored only alongside the secret — a bare id is ignored.
3. `Authorization: Bearer <jwt>` → **human** principal via Supabase auth.
4. Nothing → `ANONYMOUS_PRINCIPAL` (machine, no scopes, no account).

The principal also selects the database client (`getPrincipalDb`): humans get a
JWT-scoped client (row-level security applies); machines and anonymous get the
service-role client, so endpoint code is responsible for checking machine
scopes — `machineHasScope` honors `resource:action`, `resource:*`, and `*:*`,
and `admin-data` treats a machine with `*:*` as authorized (with role
`system_admin`) while lesser keys still pass through record permissions.

## Browser sessions (humans)

`Bearer <supabase-jwt>` → `supabase.auth.getUser` → `resolveInternalPersonId`
binds the auth user to a `people` row by `auth_uid` (email fallback never
binds unclaimed invite stubs), then loads the person with its role join. The
principal carries `roles: [role.slug]`, `accountId`, and the raw JWT in
`authContext` (never serialized — `formatPrincipalForAudit` omits it). Results
cache for 60 seconds per warm instance, so role/account changes take up to a
minute to propagate; a person with neither `account_id` nor `role_id`
(registration not yet placed) is never cached.

A human's effective rights come from `roles` → `isSystemAdmin` /
`humanHasRole` → the `design_schema.record_permissions` on each type. An
invalid or expired JWT silently becomes anonymous — endpoints then fail with
"Authentication required" / "Account context required" rather than 401s.

## API keys (machines)

Mint a key with `POST /api/api-keys` (`.framework/functions/api-keys.ts`):
`{ name, key_type?, scopes?, rate_limit?, expires_at?, integration_id?,
app_id?, machine_type?, is_internal? }`. The response returns `raw_key` —
`sk_<32 hex>` — **once**, with a "store this now" warning. Only the first 8
characters (`key_prefix`, the lookup index) and a PBKDF2-SHA256 hash
(100k iterations, `pbkdf2$iterations$salt$hash`) are stored; `omitSecretFields`
strips secret material from every read response.

Use it as `x-api-key: sk_...` on any function endpoint. Resolution:

- Prefix-matched candidate keys must be `is_active` and unexpired, then the
  hash is verified with a timing-safe compare.
- Per-key rate limit: `rate_limit` (default 100) requests per
  `config.rate_limit_window_seconds` (default 60), counted in
  `api_key_usage_logs`.
- Per-IP ceiling: `rate_limit_hit` RPC on `ip:<ip>:<path>`, default 300/minute
  (`SPINE_IP_RATE_LIMIT`), fail-open.
- Every request writes an `api_key_usage_logs` row (method, path, IP,
  user-agent) — `action=usage-logs` on the same endpoint reads them back.

The resulting machine principal inherits `key.scopes`, `key.machine_type`
(default `'integration'`), `key.is_internal`, and `key.account_id`. A `*:*`
scope acts as `system_admin`. `integration-routes` (inbound webhooks)
*requires* a machine principal — a JWT cannot deliver webhooks — and keys
pinned to `integration_id`/`app_id` are restricted to those integrations.
Related actions: `action=validate` (verify a key + check permissions),
`action=revoke` (sets `is_active=false`), `action=usage-logs`.

Shared throttling also applies: `checkRateLimit(ctx, action)`
(`_shared/rate-limit.ts`) resolves named policies from
`accounts.data.rate_limits[action]` (account override) or the calling app's
`config.rate_limits` (with `rate_limit_profile` indirection), and enforces
them through the atomic `rate_limit_hit` RPC on `public.rate_limits`
(migration `035`). Over-limit → 429 (`RateLimitError`); a `fail_closed`
policy → 503 when the counter RPC is unavailable.

## First admin and invites

Bootstrap is a Postgres trigger, not an endpoint: on the first `auth.users`
signup, `handle_new_auth_user` (migrations `010`, hardened in `052`) takes an
advisory lock, creates the `people` row, and — only when **no** `people` rows
exist — grants the `system_admin` role under the `spine-system` account.
Serialization means two concurrent first signups cannot both become
system-admin; `system_admin` can never be assigned through registration.

Everyone after that arrives by invite (`.framework/functions/invites.ts`):

- `action=create-invite` — requires `system_admin` or an `*_admin` role on the
  target account; `role_slug: 'system_admin'` is refused. Creates a stub
  `people` row holding `data.invite_token` (16-char) and
  `invite_expires_at` (7 days), returns
  `{APP_BASE_URL}/register?t=<token>`, and can send the email through a
  configured email integration.
- `action=validate-token` (public) — checks the token exists, is unblocked,
  and unexpired.
- `action=complete-registration` — after Supabase signup, calls the
  service-role-only `complete_registration_placement` RPC, which atomically
  stamps `account_id` + `role_id` from the app's server-side registration
  config (`new_account`, `existing_account`, `join_request` paths). Client
  claims about role or target are never trusted — the RPC is the only
  placement writer.
- Admin management: `list-invites`, `revoke-invite`, `reinvite`,
  `block-invite`, `approve`, `deny`, `list-members`, `update-member`,
  `deactivate-member`. `check-first-user` and `check-domain` are public
  read-only probes used by the registration UI.

## What each surface can reach

| | Browser JWT | API key | Internal secret |
|---|---|---|---|
| Principal | human (roles) | machine (scopes) | system / cron / trigger |
| DB client | JWT-scoped (RLS) | service role | service role |
| `admin-data`, entity APIs | role + record permissions | scopes; `*:*` = system admin | full |
| `integration-routes` (inbound) | no | required | — |
| `system-cron` / `trigger-scheduler` | no | `SCHEDULER_API_KEY` or internal machine | yes |
