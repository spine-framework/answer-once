---
title: debug-auth
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/debug-auth.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/public/_redirects
---

# debug-auth

## What it does

Diagnostic endpoint for troubleshooting authentication. Reports whether a
principal was resolved from the request credentials and whether the
function's Supabase environment variables are configured. **This is a
debug/diagnostic endpoint, not part of the product API.**

## Route and methods

`/.netlify/functions/debug-auth`, reachable as
`/api/debug-auth` (`/api/*` → `/.netlify/functions/:splat`). There is no
HTTP-method or `action` dispatch — the only selector is the `?method=`
**query parameter**, read directly off the request:

| Call | Result |
|---|---|
| `GET /api/debug-auth` (or `?method=debug`, the default) | env + principal summary |
| `GET /api/debug-auth?method=testJwt` | principal echo for a Bearer token |
| any other `?method=` value | falls through to `debug` |

## Authentication

Standard `createHandler` — so a valid `x-api-key`, internal secret, or
`Bearer <jwt>` is required and anonymous gets 401. As of the S-006 fix the
handler **requires a `system_admin` principal** — non-admin principals are
rejected with `statusCode` 403. That is the
point of a diagnostic — it answers "did my credentials resolve, and as
what?".

## Request contract

`?method=debug|testJwt` only. No body.

## Response contract

Both branches return an object with a top-level `data` key, so the payload
is nested one level deep inside the standard envelope —
`{ "data": { "data": { ... } }, "error": null, "meta": {...} }`.

`debug` returns:

```json
{
  "message": "Debug auth endpoint",
  "hasPrincipal": true,
  "principalType": "human",
  "requestId": "<uuid>",
  "envVars": {
    "supabaseUrl": "SET",
    "supabaseAnonKey": "SET"
  }
}
```

`testJwt` returns `{ tokenValid: true, principal: { type, id, accountId } }`,
or `{ data: null, error: 'No principal resolved from token' }` when the
principal is missing.

## Side effects

None — read-only. Env-var values are never returned, only `SET`/`NOT_SET`
flags for `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Anonymous | 401 | `Authentication required` |

## Agent notes

- Use `?method=testJwt` to verify a `Bearer` token resolves to the
  expected person + account, and `debug` to sanity-check a deployment's
  env wiring.
- Because it is an admin-only diagnostic surface, do not build
  product logic on it and expect it to behave like a hardened endpoint.
- The double-nested `data.data` shape is real — unwrap twice.
