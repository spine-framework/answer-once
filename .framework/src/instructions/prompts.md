---
title: Prompt Configs
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/prompt-configs.ts
  - .framework/functions/_shared/agent-runner.ts
  - .framework/src/pages/admin/PromptConfigsPage.tsx
  - .framework/src/pages/admin/PromptConfigDetailPage.tsx
---

## What this is for

A **prompt config** stores the prompt body, model settings, escalation rules, knowledge sources, available tools, and metadata that AI agents and chat interfaces use at runtime. Callers select a config by slug.

## Fields and settings

- **Name** *(required)* — display and lookup name.
- **Slug** *(required)* — unique key callers use to select this config.
- **Description** — optional purpose note.
- **App ID** — optional owning app.
- **System Prompt** — base system instructions (composes with the agent's own `system_prompt` at run time).
- **Context Template** — the prompt body. The agent runner substitutes only `{{user_message}}` and `{{conversation_history}}`; any other `{{placeholder}}` is left literal in the rendered prompt.
- **Model** — default `gpt-4o`. The model used for this prompt.
- **Temperature** — default `0.7`. `0` = deterministic; higher = more random.
- **Max Tokens** — default `4000`. Response token limit.
- **Is Multi Turn** — default `true`. Whether conversation history is included.
- **Max History Messages** — default `20`. Prior messages to include when multi-turn.
- **Confidence Threshold** — optional minimum confidence before acting.
- **Escalation Action / Target** — where to route low-confidence results.
- **Output Mode / Field** — how and where the model output is emitted.
- **Requires Review** — default `false`. Outputs need human review before use.
- **Knowledge Sources (JSON array)** — data sources the prompt can draw from.
- **Available Tools (JSON array)** — tool definitions the prompt may invoke.
- **Tool Constraints (JSON object)** — rules restricting tool use.
- **Metadata (JSON object)** — extra structured data.
- **Active** — default `true`. Inactive configs are not returned to callers.

**Downstream effects**

- Agents and pipelines resolve prompt configs by slug or by ID (`thread.data.prompt_config_id` → `agent.metadata.default_prompt_config_id`) — a missing or inactive config breaks those calls.
- `requires_review` + `escalation_*` define the human-in-the-loop path; without an escalation target, low-confidence output is just flagged.
- JSON fields must be valid and correctly shaped (arrays for sources/tools, objects for constraints/metadata).

## Minimal configuration

```json
{
  "name": "Ticket reply draft",
  "slug": "ticket-reply-draft",
  "context_template": "Draft a reply to this message: {{user_message}}",
  "model": "gpt-4o",
  "is_active": true
}
```

## Full configuration

```json
{
  "name": "Ticket triage",
  "slug": "ticket-triage",
  "system_prompt": "You classify support tickets.",
  "context_template": "Message: {{user_message}}\nHistory: {{conversation_history}}",
  "model": "gpt-4o",
  "temperature": 0.2,
  "max_tokens": 1500,
  "confidence_threshold": 0.75,
  "escalation_action": "assign",
  "escalation_target": "support-manager",
  "requires_review": true,
  "knowledge_sources": [{ "type": "kb", "slug": "support-kb" }],
  "available_tools": ["search_kb", "set_field"],
  "tool_constraints": { "max_calls": 3 },
  "is_active": true
}
```

## Example

A support app ships `ticket-triage` (low temperature, tools constrained to `search_kb` + `set_field`, `requires_review`) and `customer-chat` (multi-turn, `max_history_messages: 30`, `output_mode` streaming). The triage pipeline resolves `ticket-triage` by slug for every new ticket.

## Core files

- `.framework/functions/prompt-configs.ts` — API
- `.framework/src/pages/admin/PromptConfigsPage.tsx` / `PromptConfigDetailPage.tsx` — admin UI
- Table: `public.prompt_configs`

## Agent notes

- The `is_default`/`prompt_type`/`category` columns do **not** exist — the dead UI for them was removed (F-013); use `is_system` and `output_mode`.
- Pair with an `ai_agents` record: the agent holds model/behavior, this config holds the prompt text.
- Keep templates small and pass data through placeholders — large embedded blobs defeat versioning.
