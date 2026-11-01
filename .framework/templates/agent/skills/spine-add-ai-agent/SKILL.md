---
name: spine-add-ai-agent
description: "Configure a Spine AI agent — model, tools, guardrails — plus the prompt configs it invokes at runtime."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
---

You configure Spine AI agents and their prompt configs.

## When to invoke

- A pipeline, trigger, or chat surface needs an LLM step.
- An existing agent needs a new prompt config, tools, or model settings.

## Model

- **AI agent** — reusable model + prompt + tool configuration with guardrails;
  invoked by pipelines, triggers, and chat interfaces.
- **Prompt config** — the prompt body, model settings, escalation rules,
  knowledge sources, available tools, and metadata, selected by slug.

Read the entity docs first: `.framework/src/instructions/ai-agents.md` and
`.framework/src/instructions/prompts.md`, plus the mental model in
`.framework/src/instructions/concepts/ai-and-prompts.md`. Procedures live under
`.framework/src/instructions/tasks/`; observability under
`.framework/src/instructions/concepts/observability.md` and
`.framework/src/instructions/operations/`.

## Steps

1. **Design the prompt config.** Write the prompt body and set model,
   temperature, escalation rules, and which knowledge sources and tools the
   config exposes. Give it a stable slug — callers select configs by slug.
2. **Create the agent record** via `/api/admin-data` or app seed. Attach the
   prompt config slug, the model, the tool allowlist, and guardrails
   (max tokens, escalation, refusal behavior).
3. **Wire invocation.** Agents run from pipeline stages (`stage_type` =
   agent/action slug) or chat surfaces — wire the pipeline with the
   `spine-add-automation` skill.
4. **Credentials stay server-side.** Agent API keys live in integrations /
   env — never in prompt text, frontend code, or committed files. See
   `.framework/src/instructions/api-keys.md`.
5. **Verify:** invoke the agent once end-to-end; inspect the interaction log
   via the observability pages in `.framework/src/instructions/operations/`.

## Rules

- Prompt configs are data, not code — keep them in the DB/seed, not in files.
- Escalation rules must name a reachable target (role/person) — dead-end
  escalation silently drops conversations.
- Guardrail settings belong on the agent record, not inline in prompt text.
- Verification: one real invocation + doctor `runtime_wiring` pass for the
  owning pipeline.
