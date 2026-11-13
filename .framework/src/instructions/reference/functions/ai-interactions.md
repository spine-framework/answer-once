---
title: ai-interactions
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/ai-interactions.ts
  - .framework/functions/ai-agents.ts
  - .framework/functions/_shared/agent-runner.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/funnel.ts
  - .framework/functions/_shared/resolve-ids.ts
  - public/_redirects
---

# ai-interactions

## What it does

`ai-interactions` (`.framework/functions/ai-interactions.ts`) writes the
feedback and observability side of the AI loop as `items` rows. It is *not*
the conversation engine:

- Interactive turns run through `POST /api/ai-agents?action=run` — `runAgent`
  in `.framework/functions/_shared/agent-runner.ts` drives a `threads` row,
  persists `messages`, and manages the episode lease.
- Stateless pipeline inference runs through the `agent_inference` stage
  (`.framework/functions/_shared/pipeline-runner.ts`) — it POSTs `{ context,
  model, temperature, max_tokens }` to `config.webhook_url` via
  `integration-outbound` (`generic-http`), and returns a marked mock response
  when `webhook_url` is unset.
- `ai-interactions` records what happened around those paths: customer
  thumbs feedback, per-interaction telemetry rows, and draft learning
  proposals.

Actions (dispatched on `?action=`):

| Action | Method | Purpose |
|---|---|---|
| `submit_feedback` | POST | Record `helpful`/`not_helpful` on an AI message; escalate or resolve the ticket. |
| `create_interaction` | POST | Insert a telemetry item (default type `ai_feedback_record`, overridable via `type_slug`). The pipeline `create_interaction` stage lazy-imports this handler. |
| `update_interaction` | PATCH or POST | Merge allow-listed fields into an existing interaction item. |
| `list` | GET | List interaction items for the caller's account (default action). |

## Route and methods

- `/api/ai-interactions?action=<action>` — `public/_redirects` maps `/api/*`
  to `/.netlify/functions/:splat`; the export `handler` is a
  `createHandler`-wrapped dispatcher reading `ctx.query.action` and
  `ctx.query.method` (populated from the HTTP method).
- `GET` with no `action` (or an unrecognized one) falls through to `list`;
  other invalid action/method pairs throw `Invalid action or method`.

## Authentication

`createHandler` resolves a principal and rejects anonymous requests with 401.
There is no role gate — any authenticated human or machine principal may call
the actions. `list` reads through `ctx.db` scoped to `ctx.accountId`;
`create_interaction`/`update_interaction` write through
admin-data `create`/`update`, so the caller's permissions, audit, and
triggers apply. `submit_feedback` writes `messages`/`items` via `adminDb`
directly (service role) — it does not check that the caller owns the ticket.

## Request contract

`submit_feedback` (POST):

| Field | Required | Notes |
|---|---|---|
| `message_id` | yes | `messages.id` of the AI reply. |
| `ticket_id` | yes | `items.id` of the ticket under discussion. |
| `feedback` | yes | `'helpful'` or `'not_helpful'`. |
| `reason` | no | Free text, truncated to 2000 chars. |

`create_interaction` (POST): `thread_id` *or* `ai_message_id` required.
Optional: `type_slug` (default `ai_feedback_record`; skipped silently when
the type isn't installed), `retrieved_sources`, `per_source_feedback`,
`ai_confidence`, `retrieval_confidence`, `kb_candidate`, `answer_quality`,
`assistance_outcome`, `eval_case_id`, the learning-proposal linkage id,
`review_notes`, `reviewed_by`, `reviewed_at`. The record is titled
`AI Interaction — <date>`, `status: 'active'`.

`update_interaction` (PATCH/POST): `id` required plus ≥1 allow-listed field:
`kb_article_id`, `human_message_id`, `human_edits_made`, `customer_feedback`,
`kb_candidate`, `reuse_count`, `per_source_feedback`, `answer_quality`,
`assistance_outcome`, `eval_case_id`, the learning-proposal linkage id,
`review_notes`, `reviewed_by`, `reviewed_at`.

optional `thread_id`, `ai_message_id`, `source_message_ids`,
`source_chunk_ids`, `proposed_tags`. Returns `{ skipped: true }` when the
proposal type isn't installed.

`list` (GET): query params `feedback`, `kb_candidate`, `limit` (default 50),
`offset` (default 0).

## Response contract

- `submit_feedback` → `{ message_id, ticket_id, feedback, escalated }` where
  `escalated` is `feedback === 'not_helpful'`.
- `create_interaction` → the created `items` record,
  or `{ skipped: true, reason: '<type> type not found' }` when the type slug
  can't be resolved — **not** an error.
- `update_interaction` → the admin-data `update` result.
- `list` → an array of `items` rows (filtered to the `ai_feedback_record`
  type when that type exists).

## Side effects

- `submit_feedback` stamps `messages.data.feedback` (+ `feedback_reason`,
  and for `not_helpful` a `feedback_diagnosis` + `needs_review: true`).
  Diagnosis is heuristic over the message's own evidence trail:
  `missing_knowledge` (no retrieved sources), `retrieval_miss` (mean
  similarity < 0.35), `reasoning_error` (sources retrieved but none cited),
  else `wrong_answer`.
- Ticket lifecycle side effects on the `items` row: `not_helpful` sets
  `status: 'human_assigned'` from any state except `human_assigned`/
  `in_progress`, reopening `resolved`/`closed` tickets (`reopened_at`,
  `reopen_reason: 'thumbs_down'`, resolution stamps cleared). `helpful` on a
  `pending_resolution` ticket resolves it with `resolved_via:
  ai_confirmed|human_confirmed` (chosen from `pending_proposed_by`) and
  `aim_resolved_by_ai`.
- The first `items` row whose `data.ai_message_id` matches gets
  `customer_feedback` (+reason/diagnosis) stamped.
- `ai_interaction.feedback_submitted` audit event plus a `funnel_signal`
  `feedback_submitted` journey signal (fire-and-forget).

## Errors

| Condition | Error |
|---|---|
| Missing inputs | `message_id is required` · `ticket_id is required` · `id is required` · `thread_id or ai_message_id is required` · `proposed_summary is required` |
| Bad enum | `feedback must be "helpful" or "not_helpful"` |
| Empty patch | `No updatable fields provided` |
| Unknown interaction id | `Interaction record not found` |
| Bad dispatch | `Invalid action or method` |

## Agent notes

- Use `type_slug` on `create_interaction` to record under an app-specific
  item type; the `{ skipped: true }` return makes the call safe to fire even
  when the type isn't installed — check for `skipped` instead of treating it
  as failure.
- `submit_feedback` is a lifecycle accelerator, not just a thumbs counter:
  thumbs-up is the explicit customer confirmation that closes a
  `pending_resolution` ticket, thumbs-down escalates and can reopen. Calling
  it outside the support-ticket statuses is a no-op for the ticket fields.
- The pipeline `create_interaction` stage resolves `ai_message_id`/
  `thread_id` from trigger data and passes `config.type_slug` through.
- `list` queries `ctx.db` — a machine principal sees account-scoped rows via
  `adminDb`, a human sees RLS-filtered rows.
- See [AI agents, prompt configs, and embeddings](../../concepts/ai-and-prompts.md)
  for how the run path, inference, and these records fit together.
