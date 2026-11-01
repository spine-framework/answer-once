---
title: "AI agents, prompt configs, and embeddings"
audience: developers, agents
kind: concept
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/ai-agents.ts
  - .framework/functions/prompt-configs.ts
  - .framework/functions/embeddings.ts
  - .framework/functions/ai-interactions.ts
  - .framework/functions/_shared/agent-runner.ts
  - .framework/functions/_shared/llm.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/migrations/034_match_embeddings_knn.sql
  - .framework/migrations/044_match_embeddings_filtered_knn.sql
---

# AI agents, prompt configs, and embeddings

Three config entities shape Spine's AI behavior:

- An **AI agent** (`public.ai_agents`) is the *who*: a named model + system
  prompt + tool set + guardrails.
- A **prompt config** (`public.prompt_configs`) is the *how*: the prompt
  template, model parameters, retrieval sources, and escalation policy applied
  to a conversation.
- An **embedding** (`public.embeddings`) is the *memory*: per-document vector
  rows that semantic retrieval searches over.

All three are ordinary admin-data-managed rows: `ai-agents` and
`prompt-configs` expose CRUD via their own functions, and the conversational
runtime lives in `.framework/functions/_shared/agent-runner.ts`.

## Agent configuration

`ai-agents` (`.framework/functions/ai-agents.ts`) stores, per row:

- `name` + `agent_type` — required (`chat`, `analysis`, `automation`,
  `custom` in the admin UI).
- `model_config` — `{ model, temperature, max_tokens, tools }`. At inference
  time the model resolves as `model_config.model || LLM_DEFAULT_MODEL ||
  'gpt-4o'`; `model_config.tools` is passed through as OpenAI tool definitions
  with `tool_choice: 'auto'`.
- `system_prompt` — concatenated with the prompt config's `system_prompt`
  (agent first) to form the system message.
- `tools`, `capabilities`, `constraints`, `metadata` — `metadata
  .default_prompt_config_id` is the fallback used when the thread doesn't
  stamp its own `prompt_config_id`.
- `is_active` — inactive agents fail `resolveAgentConfig` lookup.

## Prompt configs and templating

`prompt-configs` (`.framework/functions/prompt-configs.ts`) carries the fields
the runner consumes per turn: `system_prompt`, `context_template`, `model`
(default `gpt-4o`), `temperature` (0.7), `max_tokens` (4000),
`is_multi_turn` (true), `max_history_messages` (20), `confidence_threshold`,
`escalation_action` / `escalation_target`, `output_mode` / `output_field`,
`requires_review`, `knowledge_sources`, `available_tools`, and
`tool_constraints`.

`context_template` supports exactly two placeholders, substituted in
`buildContext`: `{{user_message}}` (the inbound text, truncated to 4000 chars)
and `{{conversation_history}}` (prior messages rendered as
`Customer:`/`Agent:` lines, truncated to 4000 chars).

## How a thread resolves its agent and prompt

`resolveAgentConfig` in `.framework/functions/_shared/agent-runner.ts`:

1. Reads the thread (`threads`, joined with its `types` row).
2. Agent id comes from `thread.data.agent_id`, falling back to the thread
   type's `design_schema.default_agent_id`. No agent → the run aborts.
3. Prompt config id comes from `thread.data.prompt_config_id`, falling back to
   `agent.metadata.default_prompt_config_id`.
4. Both rows must be `is_active`.

`buildContext` then assembles the model input: combined system prompt, the
rendered `context_template`, retrieved knowledge excerpts (numbered `[n]` and
explicitly marked *untrusted* — the prompt instructs the model to treat them as
evidence, never instructions), `## Conversation History`, `## Tool Results`,
the filtered `available_tools` list, and finally `## Current Message` with a
prompt-injection warning.

## Invoking an agent

The interactive path is `POST /api/ai-agents?action=run` with `{ thread_id,
user_message, mode }` — `mode` is `step`, `complete`, or `episode` (default
`complete`). Before any tokens are spent the handler runs a prompt-injection
preflight (`detectInjection`); the app's `security.prompt_injection` setting
chooses `off` | `flag` (default) | `block`. Each claimed run debits the
`agent_step` rate limit.

Inside a run, `runAgent`/`runAgentStep` build context, call inference, dispatch
any `tool_calls` the model returns through `executeToolAction`, persist the
outbound `messages` row stamped with `agent_id` and `prompt_config_id`, and
manage the episode lease (see [concurrency](./concurrency-and-idempotency.md)).

Pipelines reach AI through stage types, not the `run` action:

- `agent_inference` — POSTs `{ context, model, temperature, max_tokens }` to
  `config.webhook_url` via `integration-outbound` (`generic-http`); without a
  `webhook_url` it returns a mock response.
- `search_knowledge` — retrieval over knowledge sources for the stage config's
  `query`.
- `generate_embeddings` / `revoke_embeddings` / `kb_ingest` / `kb_revoke` /
  `create_interaction` — delegate to the `embeddings`, `kb`, and
  `ai-interactions` functions described below.

## The LLM call itself

`_shared/llm.ts` does not hold API keys. `callOpenAI` routes every request
through `integration-outbound` with `integration_slug: 'openai'` and
`credential_field: 'api_token'` — credentials come from the `integrations`
table like any other outbound call. `callOpenAIChat` defaults to
`gpt-4o-mini`/0.7/4000 tokens, overridable per call and via
`integration.config.models.chat` / `.embedding`. When no OpenAI integration or
credential exists, inference returns a clearly-marked mock response rather than
failing.

## Embeddings and retrieval

`embeddings` (`.framework/functions/embeddings.ts`) manages the
`public.embeddings` vector store:

- `action=generate` builds embeddable text per **vector type**. The type's
  `design_schema.vector_types` decides which builders run — default
  `['semantic', 'structure']`; registered builders also cover `intent`,
  `cause`, `procedure`, `outcome`, `context`, and `error_signal`. Each vector
  type occupies a fixed `chunk_index` slot so concurrent types never collide
  on the unique constraint, and unchanged content is skipped by hash.
- `action=revoke` sets `revoked_at` on a document's vectors; `action=approve`
  sets `approved_at` and clears revocation.
- `action=search-similar` calls the `match_embeddings` RPC (pgvector KNN,
  defined in migrations `034`/`044`) with `query_embedding`, `match_count`,
  `similarity_threshold`, and optional account/vector-type/item-type/document
  filters.
- `action=search-semantic` is a Postgres `websearch` full-text query over the
  `content` column — the lexical complement to vector search.

## Interaction records

`ai-interactions` (`.framework/functions/ai-interactions.ts`) writes the
feedback/observability side of the loop as `items` rows (default type
`ai_feedback_record`, overridable via `type_slug`; the call returns
`{ skipped: true }` when the type isn't installed). Actions:
`submit_feedback`, `create_interaction` (what the pipeline stage calls — it
stamps `thread_id`, `ai_message_id`, `retrieved_sources`, `ai_confidence`,
`kb_candidate`, and review fields), `update_interaction`,
`create_cil_proposal`, and `list`.
