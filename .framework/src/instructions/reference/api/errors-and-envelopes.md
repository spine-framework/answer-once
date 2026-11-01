---
title: Errors and Response Envelopes
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/rate-limit.ts
  - .framework/functions/_shared/tracing.ts
  - .framework/src/lib/api.ts
---

# Errors and Response Envelopes

Every function wrapped by `createHandler` or `createPublicHandler`
(`.framework/functions/_shared/middleware.ts`) returns the same envelope and
error shape. Custom functions get this for free by returning/throwing from a
wrapped handler — never construct raw `{statusCode, body}` responses in app
code.

## Success envelope

```json
{
  "data": <handler return value>,
  "error": null,
  "meta": { "requestId": "<uuid>", "duration": <ms> }
}
```

HTTP status is always `200` for a handler that returns normally — partial
failures the handler swallows are invisible at the status layer, so handlers
should throw for real failures.

## Error envelope

```json
{ "data": null, "error": "<message>" }
```

Two emitters produce it:

- `error(message, status)` — used for auth/blocklist/parse failures before
  the handler runs.
- `structuredError(err, status)` — used for anything the handler throws.
  The thrown error's `statusCode` number becomes the HTTP status; **absent
  `statusCode` the status is `500`**, so domain errors that should surface
  as 4xx must set `err.statusCode` (the codebase idiom is
  `const e: any = new Error('…'); e.statusCode = 400; throw e`).
  Whitelisted extra fields are copied onto the body when present on the
  error: `action`, `limit`, `retry_after` (plus `retryAfter` → `retry_after`)
  — that is how `RateLimitError` from
  `.framework/functions/_shared/rate-limit.ts` renders a 429 with recovery
  metadata.

## Status codes in practice

| Status | When |
|---|---|
| 200 | success; also preflight (`cors()` returns `{message:'CORS enabled'}`) |
| 400 | `statusCode`-tagged validation failures; unparsable JSON body (`Invalid JSON in request body`) |
| 401 | anonymous principal on a `createHandler` endpoint (`Authentication required`); credential resolution failures (see [Authentication](auth.md)) |
| 403 | `security_blocklist` hits (`Access denied`); `statusCode`-tagged permission failures (`Insufficient permissions …`) |
| 429 | `RateLimitError` — body carries `action`/`limit`/`retry_after` |
| 500 | any thrown error without `statusCode` — includes most `new Error('…')` sites |

Because untagged errors map to 500, a 500 does not always mean a crash — it
can be an intentional refusal (e.g. `Invalid action or method`, `Record not
found`) that nobody tagged. Check `error` text and function logs.

## Response headers

Set by `json()` on every response:

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `Access-Control-Allow-Origin` | `SITE_URL` → `URL` → `*` (in that order) |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization, X-Account-Id, X-App-Id, X-Request-ID, X-Source, X-Log-Level, traceparent, tracestate` |
| `Access-Control-Allow-Methods` | `GET, POST, PATCH, DELETE, OPTIONS` |
| `X-Request-ID` | the request id (echo of a valid `X-Request-Id` input, else generated UUID) |
| `traceparent` / `tracestate` | W3C trace context for the request span |

## Request context the handler receives

`ctx` (`RequestContext`) carries `principal`, `accountId`, `db` (traced,
principal-scoped client), `requestId`, `appId` (`X-App-Id`), `query`
(query-string params plus `method` filled from the HTTP method),
`requestPath`, lowercased `headers`, `source`/`logLevel` (from `X-Source`/
`X-Log-Level`), and `trace`. A `?id=` query param is copied into `body.id`
when the body lacks it.

## Observability side effects

Every request emits fire-and-forget spans (`emitSpan`) for
`request.<method>` / `request.error` / `request.blocked` /
`request.unauthenticated` / `request.parse_error`, and `traceDb` wraps
`ctx.db` calls into `db.*` spans. Telemetry failures never fail the request.

## Client handling

`apiFetch` (`.framework/src/lib/api.ts`) returns the raw `Response` — callers
read `response.json()` and inspect `error`. A `401` invokes the registered
`onUnauthorized` callback except on `/api/auth` and `/api/admin-data` paths.
Debug per-request tracing is opt-in via `localStorage.spine_debug_api = '1'`.

## Related

- [Authentication](auth.md) — credential resolution and its failure modes
- [admin-data](admin-data.md) — the largest consumer of this contract
- [Shared Modules](../shared-modules.md) — `middleware.ts` internals
