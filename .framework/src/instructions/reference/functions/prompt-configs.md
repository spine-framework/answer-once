---
title: prompt-configs
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/prompt-configs.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/public/_redirects
---

# prompt-configs

## What it does

CRUD over `public.prompt_configs` — reusable prompt/model
configurations (`system_prompt`, `context_template`, `model`,
temperature/token limits, escalation and output bindings,
`knowledge_sources`, `available_tools`) that agents resolve at run time
(see [AI and prompts](../../concepts/ai-and-prompts.md)).

## Route and methods

`/.netlify/functions/prompt-configs`, reachable as
`/api/prompt-configs` (`/api/*` → `/.netlify/functions/:splat`,
`.framework/public/_redirects`). `?action=` is **ignored** — the
dispatcher has only a `default` branch keyed on method:

| Call | Handler |
|---|---|
| `GET /api/prompt-configs` | `list` |
| `GET /api/prompt-configs?id=<uuid>` | `get` |
| `POST /api/prompt-configs` | `create` |
| `PATCH /api/prompt-configs` (`id` in body or query) | `update` |
| `DELETE /api/prompt-configs?id=<uuid>` | `remove` |

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list`/`create` additionally require `ctx.accountId` (`Account context
  required`).
- There is **no role check** in this file. System admins use `adminDb`;
  everyone else uses `ctx.db` — JWT-scoped (RLS) for humans, service
  role for machine principals. Non-admin row access is whatever RLS
  allows, and returned rows are sanitized to `{ id }` (prompt-config
  rows carry no `design_schema`).

## Request contract

**list** (query): `model`, `is_active` (`'true'`/`'false'`), `limit`
(default 100), `offset` (default 0). Ordered by `name`.

**get** (query): `id`.

**create** (body): `name`, `slug` required. Optional with defaults:
`app_id` `null`, `description`/`system_prompt`/`context_template`
`null`, `model` `'gpt-4o'`, `temperature` `0.7`, `max_tokens` `4000`,
`is_multi_turn` `true`, `max_history_messages` `20`,
`confidence_threshold`/`escalation_action`/`escalation_target`/
`output_mode`/`output_field` `null`, `requires_review` `false`,
`knowledge_sources` `[]`, `available_tools` `[]`, `tool_constraints`
`{}`, `metadata` `{}`. `account_id` is stamped from context.

**update** (`id` in body or query + body): allowlist only — `name`,
`slug`, `description`, `app_id`, `system_prompt`, `context_template`,
`model`, `temperature`, `max_tokens`, `is_multi_turn`,
`max_history_messages`, `confidence_threshold`, `escalation_action`,
`escalation_target`, `output_mode`, `output_field`, `requires_review`,
`knowledge_sources`, `available_tools`, `tool_constraints`, `metadata`,
`is_active`. Unknown keys are ignored; `updated_at` is stamped.

**remove** (query): `id` — **hard delete**.

## Response contract

Standard `{ data, error, meta }` envelope.

- `list`/`get`/`create`/`update` → row(s) passed through
  `sanitizeRecordData`: full row for system admins, `{ id }` for
  non-admins (first-surface path, no `design_schema` on the row).
- `remove` → `{ success: true }`.

## Side effects

- `create` inserts into `public.prompt_configs` with the caller's
  `account_id`.
- `remove` issues a real `DELETE` — unlike `types`/`apps`/`roles`/
  `integrations`, deletion here is permanent.
- `emitLog` writes `prompt_config.created` / `.updated` / `.deleted`
  audit rows to `public.logs`.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| No account context (list, create) | 500 | `Account context required` |
| Missing create fields | 500 | `name and slug are required` |
| Missing `id` | 500 | `Config ID is required` |
| Row missing on delete | 500 | `Prompt config not found` |
| Unmatched method | 500 | `Invalid action or method` |

Validation failures surface as HTTP 500 — thrown `Error`s without a
`statusCode` map to 500 in the shared error path.

## Agent notes

- `?action=get&id=…` works only by accident — every action value lands
  in the `default` branch. Don't rely on action names here; dispatch is
  method + `id` presence.
- `remove` is a hard delete; there is no `is_active` restore path.
  Prefer `PATCH { is_active: false }` if reversibility matters.
- Create stamps `account_id` from the caller's context — there is no
  way to create a config for another account through this endpoint.
- Consumers resolve configs at run time by `prompt_config_id` stored on
  threads/agents, not through this endpoint; this function is pure
  config management.
