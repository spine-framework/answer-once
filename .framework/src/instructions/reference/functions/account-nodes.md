---
title: account-nodes
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/account-nodes.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/public/_redirects
---

# account-nodes

## What it does

Returns one account ("node") plus its position in the account hierarchy:
ancestors, direct children, and full descendants. Used to render account
trees and breadcrumb navigation.

## Route and methods

`/.netlify/functions/account-nodes`, reachable as
`GET /api/account-nodes?node_id=<uuid>` (`/api/*` →
`/.netlify/functions/:splat`). The handler performs no method check — any
HTTP method with the query parameter works.

## Authentication

Standard `createHandler`: `x-api-key`, internal secret, or
`Bearer <jwt>` required; anonymous is rejected with 401. Queries run on
`ctx.db`, so human callers see only what row-level security allows; machine
and system principals use the service role.

## Request contract

One query parameter:

- `node_id` — required, the `accounts.id` to center the lookup on.

## Response contract

`{ node, ancestors, children, descendants }` inside the standard
`{ data, error, meta }` envelope:

- `node` — the account row's embedded `type` (`{ type: { id, slug, name,
  icon, color } }`); the account's own columns are not selected.
- `ancestors` — rows returned by the `get_account_ancestors` RPC, else `[]`.
- `children` — active `accounts` rows with `parent_id = node_id`, each
  shaped `{ type: {...} }`, ordered by `display_name`.
- `descendants` — rows returned by the `get_account_descendants` RPC, else `[]`.

## Side effects

None — read-only. A `request.get` span is emitted by the middleware like
every `createHandler` call.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Missing `node_id` | 500 | `node_id is required` |
| No active account with that id | 500 | `Account node not found` |
| RPC/query failure | 500 | underlying PostgREST message |

## Agent notes

- The `select` on `node` and `children` contains only the embedded `type`
  relation — do not expect `display_name`, `slug`, or other account
  columns on those payloads; fetch the account itself via
  `/api/admin-data?entity=accounts&id=…` when you need them.
- `ancestors`/`descendants` come from database functions; their row shape
  is whatever the RPC returns, not the `{ type }` shape used for `node`.
- Inactive accounts are filtered from `node` and `children`
  (`is_active = true`) but RPC results are whatever the functions return.
