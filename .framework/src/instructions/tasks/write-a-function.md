---
title: Write a function
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/db.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/logging.ts
  - .framework/functions/timers.ts
  - .framework/public/_redirects
  - scripts/assemble-functions.sh
---

# Write a function

## Goal

Add a custom Netlify function when — and only when — the generic
`/api/admin-data` endpoint cannot cover the case: specialized auth, inbound
webhooks, heavy compute, or bespoke orchestration. Record CRUD must go
through `admin-data` so permission, validation, audit, and trigger logic
stay shared ([Runtime records](../concepts/runtime-records.md)).

## Steps

1. **Decide it is warranted.** `admin-data` already covers list/get/create/
   update/remove/stats across every runtime table with permissions and
   triggers enforced ([admin-data reference](../reference/functions/admin-data.md)).
   Legitimate custom functions: public webhook receivers, scheduled
   sweeps, compute-heavy transforms, auth-bridging endpoints.

2. **Create the file.** Put it in `custom/functions/` (or
   `custom/apps/<slug>/functions/` for app-scoped code) with a `custom_`
   prefix — assembly copies `.framework/functions`, `custom/functions`,
   and `custom/apps/*/functions` into one flat Netlify dir and **fails the
   build on a basename collision**
   (`scripts/assemble-functions.sh`). All functions are reachable at
   `/api/<basename>` via the `_redirects` rule
   (`.framework/public/_redirects`).

   Imports resolve in the **assembled** layout, not the source tree:
   `./_shared/*` and `./<other-function>` are sibling paths inside
   `.assembled/netlify/functions/`, and `@shared/*` is an alias to the
   same dir (`config/tsconfig.functions.json`). A function's own
   `functions/_shared -> .framework/functions/_shared` symlink (as the
   existing app functions dirs carry) makes `./_shared` resolve in the
   source tree too.

   ```ts
   // custom/functions/custom_my-endpoint.ts
   import { createHandler, error, json } from './_shared/middleware'
   import { adminDb } from './_shared/db'
   import { PermissionEngine } from './_shared/permissions'
   import { emitLog } from './_shared/logging'

   export const handler = createHandler(async (ctx, body) => {
     // ctx.requestId, ctx.principal, ctx.db, ctx.accountId, ctx.appId,
     // ctx.query, ctx.headers, ctx.trace — all populated by middleware
     if (!PermissionEngine.isSystemAdmin(ctx)) {
       throw new Error('System admin required')
     }
     const { data, error: err } = await ctx.db
       .from('items').select('id,title').eq('is_active', true).limit(10)
     if (err) throw err
     return data
   })
   ```

3. **Follow the `createHandler` contract** (`.framework/functions/_shared/middleware.ts`):

   - The middleware resolves the principal (`x-api-key` → internal secret →
     Bearer JWT), builds `RequestContext`, and wraps your return value in
     the `{ data, error, meta }` envelope. Thrown `Error`s become
     `{ error }` responses — don't build response objects yourself.
   - `ctx.db` is the principal-scoped client (humans get a user-scoped,
     RLS-bound client; machines/anonymous get `adminDb`).
   - `ctx.query` merges `queryStringParameters`; `ctx.query.method` carries
     the HTTP method. Functions dispatching on `?action=` use a
     `switch (ctx.query.action)` (see `.framework/functions/timers.ts`).
   - For endpoints that must accept anonymous or raw requests, use
     `createPublicHandler` instead (same file, `createPublicHandler`).

4. **Use the `_shared` modules, don't reinvent them** — `db` (`adminDb`,
   `getUserDb`), `permissions` (`PermissionEngine`, `isSystemAdmin`,
   `sanitizeRecordData`), `principal` (`resolvePrincipal`,
   `SYSTEM_PRINCIPAL`), `audit`/`logging` (`emitLog`, `emitAudit`),
   `resolve-ids`, `rate-limit` — see
   [Shared modules reference](../reference/shared-modules.md) and
   [Functions index](../reference/functions/index.md).

5. **Assemble and run.** `npm run assemble && npm run dev:netlify`, then
   `curl http://localhost:8888/api/custom_my-endpoint` — see
   [Install and first run](../guide/01-install-and-first-run.md).
   Function typecheck is separate from `npm run typecheck`:
   `npx tsc --noEmit -p config/tsconfig.functions.json` checks the
   assembled output (run it after `assemble`).

## Verify

- `GET /api/custom_my-endpoint` returns the `{ data, error, meta }`
  envelope; unauthenticated calls return `401 Authentication required`
  from the middleware, not from your code.
- `npm run assemble` passes (no basename collision error) and
  `npm run typecheck` compiles.

## Common mistakes

- **Duplicating a framework basename.** Assembly hard-fails naming both
  sources — prefix custom files `custom_`.
- **Returning raw Response objects.** `createHandler` expects a return
  value (serialized into `data`) or a thrown error — don't emit Netlify
  `{statusCode, body}` shapes yourself inside a `createHandler` function.
- **Using `adminDb` for user-facing reads.** It bypasses RLS — prefer
  `ctx.db` unless you intentionally need service-role access.
- **Putting secrets in the response.** `sanitizeRecordData` /
  `omitSecretFields` exist for a reason — strip credentials before
  returning.
- **Writing record CRUD** — if the function creates/updates `items`,
  `threads`, etc., you are bypassing `admin-data`; call it via
  `adminDataCreate`/`/api/admin-data` instead.

## Reference

- [Shared modules reference](../reference/shared-modules.md) ·
  [Functions index](../reference/functions/index.md) ·
  [Auth and API keys](../concepts/auth-and-api-keys.md)
- [admin-data reference](../reference/functions/admin-data.md) ·
  [Build a custom page](./build-a-custom-page.md) ·
  [Anatomy of an installed project](../guide/02-project-map.md)
