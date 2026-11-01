---
title: Add an AI agent
audience: developers, agents
kind: task
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/ai-agents.ts
  - .framework/functions/_shared/agent-runner.ts
  - .framework/functions/_shared/llm.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/prompt-configs.ts
  - .framework/functions/integration-outbound.ts
---

# Add an AI agent

## Goal

Create an `ai_agents` row plus a `prompt_configs` row, then run it either
conversationally (`ai-agents?action=run` on a thread) or inside a pipeline
(`agent_inference` stage). See
[AI agents, prompt configs, and embeddings](../concepts/ai-and-prompts.md).

## Steps

1. **Create the prompt config.** Admin UI → **Configs → Prompts → New**, or
   `POST /api/prompt-configs`. Key fields: `system_prompt`,
   `context_template` (substitutes `{{user_message}}` and
   `{{conversation_history}}` only), `model` (default `gpt-4o`),
   `temperature` (default `0.7`), `max_tokens` (default `4000`),
   `is_multi_turn`, `max_history_messages` (default `20`)
   (`.framework/functions/prompt-configs.ts`).

2. **Create the agent.** Admin UI → **Configs → AI Agents → New**, or
   `POST /api/ai-agents` — `name` and `agent_type` required; optional
   `model_config`, `system_prompt`, `tools`, `capabilities`,
   `constraints`, `metadata` (`.framework/functions/ai-agents.ts`).
   Link the prompt config via `metadata.default_prompt_config_id`.

3. **Configure the LLM integration.** Inference routes through
   `integration-outbound` against the integration slug `openai` with
   `credential_field: 'api_token'` (`.framework/functions/_shared/llm.ts`).
   Migration 004 seeds `openai` with
   `api_token: { source: 'env_var', value: 'OPENAI_API_KEY' }` — set that env
   var or update the credential. Without it the runner returns a
   `[Mock Response]` string instead of calling the model
   (`.framework/functions/_shared/agent-runner.ts`).

4. **Conversational path — `ai-agents?action=run`.**
   `POST /api/ai-agents?action=run` with `{ thread_id, user_message, mode }`;
   `mode` is `step` | `complete` (default) | `episode`. The runner resolves
   the agent from `thread.data.agent_id` → `design_schema.default_agent_id`,
   and the prompt config from `thread.data.prompt_config_id` →
   `agent.metadata.default_prompt_config_id` — both must be `is_active`
   (`.framework/functions/_shared/agent-runner.ts`). A
   prompt-injection preflight reads `config.security.prompt_injection`
   (`off` | `flag` | `block`) on the agent
   (`.framework/functions/ai-agents.ts`).

5. **Pipeline path — `agent_inference` stage.** Add a stage with
   `stage_type: 'agent_inference'` and `config.context` (required;
   `{{trigger.*}}`/`{{record.*}}` templates resolve). With a
   `config.webhook_url` the stage POSTs `{ context, model, temperature,
   max_tokens }` to that URL via the `generic-http` integration; without
   one it returns a mock response —
   `[Mock Response] Received N chars of context`
   (`.framework/functions/_shared/pipeline-runner.ts`).

## Verify

- `POST /api/ai-agents?action=run` on a thread whose `data.agent_id` points
  at the agent — returns a completion (or the mock string when the OpenAI
  credential is missing).
- `agent_step` rate-limit debits and injection audits appear in
  `public.logs`.
- The `agent_inference` stage output appears in the execution's stage
  results (**Observability → Executions**).

## Common mistakes

- **`threads.target_type` is `NOT NULL`.** A chat thread must be bound to a
  target record — there is no unbound "conversation" row. Point it at
  something stable such as `target_type: 'account'` +
  `target_id: <account id>` and keep `data.agent_id` /
  `data.prompt_config_id` on the thread.
- **No `default_prompt_config_id` on the agent and no
  `prompt_config_id` on the thread** — the run has no prompt config to
  assemble from; always set the agent fallback.
- **Missing `OPENAI_API_KEY` / unconfigured `openai` integration** — you
  get a mock response, not an error; check the reply text for
  `[Mock Response]`.
- **`agent_inference` with no `webhook_url`** — returns a mock. This stage
  is an HTTP bridge, not the in-process `runAgent` path.
- **Agent or prompt config `is_active: false`** — resolution fails before
  inference.
- **`context_template` with unsupported placeholders** — only
  `{{user_message}}` and `{{conversation_history}}` substitute; anything
  else stays literal (`.framework/functions/_shared/agent-runner.ts`).

## Reference

- [ai-agents entity page](../ai-agents.md) ·
  [ai-agents function reference](../reference/functions/ai-agents.md) ·
  [prompt-configs function reference](../reference/functions/prompt-configs.md) ·
  [prompts entity page](../prompts.md)
- [AI agents, prompt configs, and embeddings](../concepts/ai-and-prompts.md) ·
  [Add a pipeline](./add-a-pipeline.md) · [Add an integration](./add-an-integration.md)
