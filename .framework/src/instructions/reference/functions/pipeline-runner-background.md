---
title: pipeline-runner-background
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/pipeline-runner-background.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/_shared/principal.ts
  - netlify.toml
---

# pipeline-runner-background

## What it does

The isolated executor for trigger-dispatched pipeline runs. When a record
write matches a trigger, `.framework/functions/_shared/trigger-engine.ts`
inserts a `pipeline_executions` row with `status: 'queued'` and POSTs the
dispatch payload here. This function authenticates the call, reconstructs
a machine `RequestContext`, and hands the pre-created `execution_id` to
`runPipeline` — so the queued row transitions `queued → running → terminal`
instead of a duplicate execution being inserted.

The `-background` filename suffix makes Netlify treat it as a background
function: the dispatcher gets a 202 acknowledgement immediately and the
run itself gets the fixed 15-minute invocation budget in its own process
and connection pool (see the note in `netlify.toml`). It is **not** a
scheduled function — it is invoked once per trigger fire, over HTTP.

## Route and methods

`POST /.netlify/functions/pipeline-runner-background` — internal
function-to-function traffic only. The only caller in the framework is the
trigger engine's dispatch path, which sends an `X-Internal-Secret` header
and awaits only the ack (bounded by a 5s timeout), never the pipeline's
completion.

## Authentication

Not `createHandler` — auth is checked inline, by design: the middleware
path would resolve the secret-bearing request to anonymous and 401 before
the handler ran.

`isDispatchAuthorized` compares the `X-Internal-Secret` header against the
`INTERNAL_INVOKE_SECRET` environment variable. Both sides are SHA-256
hashed before `timingSafeEqual`, so length-mismatch early-exit cannot leak
the expected secret via timing. If `INTERNAL_INVOKE_SECRET` is unset, the
check always fails — every dispatch gets 403 (fail closed).

On success the handler fabricates a context with `SYSTEM_PRINCIPAL`
(wildcard `*:*` machine principal), `adminDb`, the dispatching
`account_id`, and provenance `sourceType: 'trigger'` carrying the
`trigger_id`.

## Request contract

JSON body:

| Field | Required | Purpose |
|---|---|---|
| `pipeline_id` | yes | Pipeline to run; missing → 400 |
| `execution_id` | no | Pre-created `queued` execution row to claim |
| `trigger_data` | no | Trigger envelope passed to stage templates |
| `account_id` | no | Account scope for the fabricated context |
| `trigger_id` | no | Recorded in principal provenance |

Malformed JSON → 400 `Invalid JSON body`.

## Response contract

- `200` — `{ ok, execution_id, status }` where `ok` is true only when the
  run finished `completed`. (In practice Netlify answers background
  invocations with 202 to the dispatcher; the JSON body matters to
  `netlify functions:invoke` and logs.)
- `400` — `{ error: 'Invalid JSON body' }` or
  `{ error: 'pipeline_id is required' }`.
- `403` — `{ error: 'Forbidden — invalid internal secret' }`.
- `500` — `{ error, execution_id }` when `runPipeline` throws (missing or
  inactive pipeline, claim failure, stage abort).

## Side effects

- On entry, `sweepStaleExecutions()` runs fire-and-forget — fails
  `running`/`pending`/`queued` execution rows untouched for over 10
  minutes.
- `runPipeline` claims the `queued` execution row (or inserts one with the
  same id when the claim finds nothing), executes the pipeline stages, and
  writes terminal status, stage results, and `duration_ms` back to
  `pipeline_executions`. Whatever the stages do — record writes, outbound
  HTTP, embeddings, notifications — happens here, outside the triggering
  request's process.

## Errors

- Missing/invalid secret → 403.
- Missing `pipeline_id` or unparseable body → 400.
- `Pipeline not found or inactive`, claim/insert failures, and stage
  errors → 500 with the thrown message. Stage-level failures are normally
  captured on the execution row rather than thrown, unless the stage
  aborts the run.

## Agent notes

- Duplicate-delivery safety lives in `runPipeline`: it only claims rows
  still `status = 'queued'`; when the claim matches nothing it inserts a
  row with the same `execution_id`, so a redelivered dispatch dies on the
  primary-key conflict instead of running the pipeline twice
  (`.framework/functions/_shared/pipeline-runner.ts`).
- If `INTERNAL_INVOKE_SECRET` is not set in the environment, trigger
  dispatch is a silent no-op — triggers still insert `queued` rows but the
  POST to this function 403s, and the sweeper eventually marks those rows
  `failed`.
- The timing-safe secret check duplicates
  `isInternalInvokeAuthorized` in `.framework/functions/_shared/principal.ts`;
  keep the two implementations in sync if either changes.
- Do not call this endpoint from client code. It exists for the trigger
  engine; manual pipeline runs go through `runPipeline` callers (CLI,
  timers, `system-cron`) or the `pipelines` API.
