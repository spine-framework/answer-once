---
title: Security Checklist
audience: both
kind: guide
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/api-keys.ts
  - .framework/functions/_shared/hash-api-key.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/resolve-credentials.ts
  - .framework/functions/_shared/security.ts
  - .framework/functions/security.ts
  - .framework/functions/logs.ts
  - .framework/functions/debug-auth.ts
  - .framework/migrations/049_security_blocklist.sql
  - netlify.toml
  - .env.example
---

# Security Checklist

Operational security posture for a Spine deployment — what the platform
already enforces, and the surfaces you must keep an eye on yourself.
Related reading: [Auth & API Keys](../concepts/auth-and-api-keys.md),
[Permissions](../concepts/permissions.md),
[Environment Variables](../reference/env-vars.md).

## Secrets that must stay server-side

- **`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely.** It is read only by
  functions and the CLI (`adminDb` in `.framework/functions/_shared/db.ts`)
  and must never appear under a `VITE_*` name — `VITE_*` vars are compiled
  into the public browser bundle. Older docs recommended
  `VITE_SUPABASE_SERVICE_ROLE_KEY`; that is an anti-pattern the audit
  flagged (S-004). If it ever shipped, rotate the key.
- `netlify.toml` `SECRETS_SCAN_OMIT_KEYS` whitelists only vars that are
  **meant** to be public (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `APP_BASE_URL`, `SITE_URL`, …). Do not add secrets to it.
- `INTERNAL_INVOKE_SECRET`, `SCHEDULER_API_KEY`, `RESEND_API_KEY`,
  `OPENAI_API_KEY`, `NETLIFY_ACCESS_TOKEN` — server-side Netlify env only.
- `.env` is gitignored and excluded from the shipped file set; no framework
  command writes it (see [Project Map](../guide/02-project-map.md)).

## API key hygiene

- Keys mint as `sk_<uuid>`; only `key_prefix` (first 8 chars) and a
  `pbkdf2$<iters>$<salt>$<hash>` value (100k iterations, SHA-256,
  `timingSafeEqual` verify) are stored
  (`.framework/functions/api-keys.ts`,
  `.framework/functions/_shared/hash-api-key.ts`). The raw key is returned
  once as `raw_key`; `omitSecretFields` strips `key_value`/`key_hash` from
  `list`, `get`, and `revoke` responses.
- Grant **scopes**, not `*:*`. A machine key with `*:*` resolves to the
  `system_admin` role and effectively becomes an RLS-immune superuser
  (`.framework/functions/_shared/principal.ts`). `is_internal` keys are for platform machinery.
- Every key has a rate limit (default `100`/60s) plus a per-IP ceiling
  (`SPINE_IP_RATE_LIMIT`, default `300`/60s); usage lands in
  `api_key_usage_logs` — read via `/api/api-keys?action=usage-logs` before
  revoking so you see what the key touched.
- Revoke, don't delete: `POST /api/api-keys?action=revoke` sets
  `is_active=false`. Audit `api_keys` rows for a non-null `key_value`
  column — a legacy column that can hold plaintext (the S-001 incident
  class); nothing in `_shared` reads it, but `select('*')` surfaces used to
  return it.

## Credential sanitization

- Integration credentials resolve server-side only:
  `credentials.<field>.source = 'env_var'` reads `process.env` inside the
  function (`.framework/functions/_shared/resolve-credentials.ts`); literal `value` entries are
  stored in `integrations.credentials` — treat that column as secret.
- `integrations` is a second-surface table: non-system-admin and machine
  reads are sanitized to minimal fields by `.framework/functions/_shared/permissions.ts`.
- Outbound stage configs (`http_request`) reference the `generic-http`
  integration — credentials live on the integration row, never in the
  pipeline stage JSON.

## Ban / blocklist surface

`/api/security` (`.framework/functions/security.ts`) is gated by
`requireSystemContextWithAudit` — system-admin only. Actions:
`flagged_accounts`, `ban_user`, `unban_user`, `blocklist`,
`blocklist_add`, `blocklist_revoke`. A ban is three layers:

1. `security_blocklist` rows (person/email/account/IP) — the authoritative
   layer; enforced per-request in `createHandler` (`isBlockedRequest`) and
   on public endpoints (`isBlockedIp`).
2. Supabase Auth ban (`auth.admin.updateUserById`, ~100y `ban_duration`).
3. Netlify edge deny rule `spine-security:blocklist` — only when
   `NETLIFY_ACCESS_TOKEN` + `NETLIFY_SITE_ID` are set; skipped silently
   otherwise (auth/edge failures are audited, not thrown).

Caveat: blocklist enforcement **fails open** when
`security_blocklist` is absent (pre-049 installs) — a missing table means
no blocking, not an error.

## Endpoint exposure notes

- `debug-auth` (`/api/debug-auth`) is gated by *any authenticated
  principal*, not system-admin — it reports principal type and
  `SET`/`NOT_SET` env flags. Diagnostic, not product surface; consider
  whether it belongs in a hardened production deploy
  (see [debug-auth](../reference/functions/debug-auth.md)).
- `/api/system` (`manifest`, `health`, `openapi`) likewise answers any
  authenticated principal — the OpenAPI spec and manifest are not
  admin-only information.
- Public endpoints (`invites`, `integration-routes`, registration flows)
  run through `createPublicHandler` — anonymous by design; their abuse
  controls are IP blocklist, rate limits, and Turnstile, not auth.

## Known ungated surfaces

Honest list — the audit found these; mitigate by key discipline until
they are tightened:

- **`logs?action=cleanup`** uses `ctx.db` with no `isSystemAdmin` check and
  no account scoping (`.framework/functions/logs.ts`). Machine principals
  get `adminDb` from `getPrincipalDb` — so **any valid API key can delete
  log rows across all accounts**. Mitigation: issue machine keys narrowly,
  watch `api_key_usage_logs`, rotate on suspicion.
- **`api-keys` `list`/`get`** select `*` via `adminDb` for system admins —
  and `ctx.db` is *also* `adminDb` for machine principals, so a scoped
  machine key reads `api_keys` metadata cross-account
  (`api_keys` rows are stripped of `key_value`/`key_hash`, but slugs,
  integration links, rate limits, and scopes are visible).
- **Function-level RLS is uneven** — mutating handlers branch
  `isSystemAdmin ? adminDb : ctx.db`; a scoped machine key still gets
  `adminDb`, so "machine keys are always RLS-bounded" is not a safe
  assumption anywhere `ctx.db` is used without an explicit account filter.

## Checklist

- [ ] No `VITE_`-prefixed secret anywhere; service-role key server-only.
- [ ] `INTERNAL_INVOKE_SECRET`, `SCHEDULER_API_KEY`, `APP_BASE_URL` set; `SITE_URL` pinned to the real origin for CORS.
- [ ] Machine keys carry least-privilege scopes (never `*:*` for third parties), rate limits, and expiry where possible.
- [ ] `api_keys` rows audited for legacy `key_value` plaintext.
- [ ] Blocklist tested end-to-end (a banned IP gets 403); Netlify edge sync env vars set if edge bans are wanted.
- [ ] `debug-auth` and `/api/system` exposure reviewed for the environment.
- [ ] Machine-principal surfaces above understood — `ctx.db` = service role for machines.

## Related

- [Auth & API Keys](../concepts/auth-and-api-keys.md) · [Permissions](../concepts/permissions.md)
- [Errors and Envelopes](../reference/api/errors-and-envelopes.md) · [api-keys](../reference/functions/api-keys.md) · [security](../reference/functions/security.md)
- [Troubleshooting](troubleshooting.md) · [Deployment](deployment.md)
