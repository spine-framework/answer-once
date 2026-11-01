---
title: auth
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/auth.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/principal.ts
  - .framework/public/_redirects
---

# auth

## What it does

Returns the caller's resolved user context: the `people` row bound to the
JWT, its role and permissions, and the set of accounts the person can
reach through the account hierarchy. This is the endpoint the frontend
calls after login to learn "who am I".

## Route and methods

`/.netlify/functions/auth`, reachable as `/api/auth` (`/api/*` →
`/.netlify/functions/:splat`). Dispatch is on `ctx.query.method`, which
the middleware fills from the HTTP method but a `?method=` query
parameter can override:

| Call | Result |
|---|---|
| `GET /api/auth` | `context` — the user-context payload below |
| `GET /api/auth?method=HEALTH` | `health` — `{ status: 'healthy', timestamp, service: 'auth' }` |
| any other method | error `Unsupported method: <method>` |

`HEALTH` is a query-param convention, not an HTTP method — there is no
`?action=` dispatch.

## Authentication

Standard `createHandler`: `x-api-key`, internal secret, or
`Bearer <jwt>`; anonymous is rejected with 401, and `context` re-checks
`principal.id !== 'anonymous'`. All queries run on `ctx.db` — JWT-scoped
for humans (RLS applies), service role for machines/system. In practice
`context` is human-only: a machine principal's id is an API-key id, not a
`people.id`, so the person lookup returns "User not found".

## Request contract

No parameters for `context` — identity comes entirely from the resolved
principal. `?method=HEALTH` selects the health check.

## Response contract

`context` returns inside the standard `{ data, error, meta }` envelope:

```json
{
  "id": "<people.id>",
  "email": "...",
  "full_name": "...",
  "account_id": "<uuid>",
  "account": { "id", "slug", "display_name", "parent_id" },
  "roles": ["<role slug>"],
  "permissions": ["read", "write", ...],
  "is_system_admin": false,
  "status": "active",
  "accessible_accounts": [{ "id", "slug", "display_name", "parent_id" }]
}
```

- `roles` is a single-element array of the person's role slug.
- `permissions` is `['read', 'write', 'admin', 'system']` for
  `system_admin`, else the role row's `permissions` array (possibly `[]`).
- `accessible_accounts` comes from the `get_accessible_accounts` RPC,
  raced against a 5-second timeout; on failure or timeout it degrades to
  `[]` rather than erroring.

## Side effects

None — read-only (the middleware still emits request spans/logs).

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Anonymous | 401 | `Authentication required` |
| `people` row missing/inactive | 500 | `User not found: <principal.id>` |
| Unsupported method | 500 | `Unsupported method: <method>` |

## Agent notes

- `is_system_admin` and `permissions` are derived here, not authoritative
  checks — server-side endpoints re-evaluate roles from the principal.
- The 5-second `get_accessible_accounts` timeout means a slow hierarchy
  query yields `accessible_accounts: []`, not an error; clients should not
  treat an empty list as proof of a single-account deployment.
- Role/account changes can lag up to ~60 seconds because human principals
  are cached per warm function instance.
