---
title: ai-agents
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/ai-agents.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/agent-runner.ts
  - .framework/functions/_shared/rate-limit.ts
  - .framework/functions/_shared/security.ts
  - .framework/public/_redirects
---

# ai-agents

## What it does

CRUD over `public.ai_agents` (agent definitions: `agent_type`,
`model_config`, `system_prompt`, `tools`, `capabilities`,
`constraints`), plus `action=run` — the interactive entry point that
executes a multi-turn agent episode against a **thread** (not against an
agent row directly; the agent and prompt config are resolved inside
`runAgent` from the thread's `data.agent_id` /
`data.prompt_config_id` and type schema).

## Route and methods

`/.netlify/functions/ai-agents`, reachable as `/api/ai-agents` (`/api/*`
→ `/.netlify/functions/:splat`, `.framework/public/_redirects`).
Dispatch is by `?action=` then method:

| Call | Handler |
|---|---|
| `POST /api/ai-agents?action=run` | `run` (any method dispatches; a JSON body is required in practice) |
| `GET /api/ai-agents` | `list` |
| `GET /api/ai-agents?id=<uuid>` | `get` |
| `POST /api/ai-agents` | `create` |
| `PATCH /api/ai-agents` (`id` in body or query) | `update` |
| `DELETE /api/ai-agents?id=<uuid>` | `remove` |

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list`/`create`/`update`/`run` require `ctx.accountId`.
- No role gate anywhere in this file — `create`/`update`/`remove` only
  require an authenticated person+account context; humans are bounded by
  RLS on `ctx.db`, machines run service-role.
- `run` debits the `agent_step` rate limit
  (`.framework/functions/_shared/rate-limit.ts`) — a fail-closed,
  cost-bearing action; over-limit throws `RateLimitError` (HTTP 429 with
  `retry_after`).

## Request contract

**list** (query): `agent_type`, `is_active` (`'true'`/`'false'`),
`limit` (default 100), `offset` (default 0).

**get** (query): `id`.

**create** (body): `name`, `agent_type` required. Optional: `app_id`,
`description`, `model_config` `{}`, `system_prompt`, `tools` `[]`,
`capabilities` `[]`, `constraints` `{}`, `metadata` `{}`. `account_id`
and `created_by` stamped from context.

**update** (`id` in body or query + body): allowlist — `name`,
`description`, `agent_type`, `model_config`, `system_prompt`, `tools`,
`capabilities`, `constraints`, `metadata`, `is_active`, `app_id`.

**remove** (query): `id` — **hard delete**.

**run** (body): `thread_id` required; `user_message`; `mode`
(`'step'`/`'complete'`/`'episode'`, default `'complete'`);
`driver_token` (optional — lets a client keep a stable driver identity
across calls instead of `ctx.requestId`).

## Response contract

Standard `{ data, error, meta }` envelope.

- CRUD → sanitized row(s) (`{ id }` for non-admins); `remove` →
  `{ success: true }`.
- `run` → `{ ok, thread_id, message_id, status, turn_count, content,
  message_type, data, agent_id, prompt_config_id }` where `status` comes
  from the thread's `data.research_state` (`complete`,
  `awaiting_input`, `failed`, …).
- Lease-refused runs return HTTP 200 with `{ ok: true, status:
  'running', driver_id }` (plus `already_running: true` in episode
  mode) — callers poll the thread rather than interleave writes. A
  replay of an already-answered episode returns `status: 'complete'`
  with `already_done: true` and the last outbound message.

## Side effects

- `run` performs a prompt-injection pre-flight (`detectInjection`); the
  app's `config.security.prompt_injection` mode (`'off'`/`'flag'`
  default/`'block'`) decides whether the hit is audited
  (`security.injection_detected`) or rejected with HTTP 400.
- `run` claims the thread's episode lease — atomically via the
  `episode_leases` RPC (`.framework/migrations/064_episode_leases.sql`),
  with a legacy heartbeat check as fallback — so concurrent drivers
  can't double-drive a thread.
- `run` executes `runAgent`
  (`.framework/functions/_shared/agent-runner.ts`), which writes agent
  messages to `public.messages` and mutates `threads.data
  .research_state`. Episode mode runs inline under an 8-second budget,
  then the client's step loop continues under the same lease.
- Rate limit is debited **only after** a successful lease claim —
  refused requests never double-charge an episode.
- CRUD emits `ai_agent.created` / `.updated` / `.deleted` audit rows to
  `public.logs`.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Missing `thread_id` | 500 | `thread_id is required` |
| No person+account context | 500 | `User context (person and account) required` |
| Missing thread | 500 | `Thread not found` / PostgREST message |
| Injection in `block` mode | 400 | `Your message could not be processed automatically. A support specialist will review it.` |
| `agent_step` over limit | 429 | rate-limit message + `retry_after` |
| Missing `id` | 500 | `Agent ID is required` |
| Row missing on delete | 500 | `Agent not found` |
| Bad action/method | 500 | `Invalid action or method` |

Most `Error`s map to 500 (no `statusCode`); the injection-block and
rate-limit paths carry explicit 400/429 codes.

## Agent notes

- `run` takes a thread, not an agent id — the agent binding lives on
  `threads.data.agent_id` (or the thread type's
  `design_schema.default_agent_id`). Creating an `ai_agents` row does
  not wire it to anything.
- Episode single-flight is keyed by `driver_id`: pass a stable
  `driver_token` from a polling client so re-entry renews the lease
  instead of being refused.
- A "stuck" live driver blocks the thread for the 60-second lease TTL —
  `status: 'running'` is a normal response, not an error.
- `remove` is a hard delete of the agent row; in-flight episodes are
  unaffected (they hold ids in thread data).
- The dispatch `case 'run'` ignores the HTTP method — a `GET
  ?action=run` reaches `run` and fails on missing `thread_id` (body is
  null on GET).
