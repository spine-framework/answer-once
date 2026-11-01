---
title: AI Agents
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/functions/ai-agents.ts
  - .framework/functions/_shared/agent-runner.ts
  - .framework/src/pages/admin/AIAgentsPage.tsx
  - .framework/src/pages/admin/AIAgentDetailPage.tsx
---

## What this is for

An **AI agent** is a reusable model + prompt + tool configuration that Spine invokes from pipelines, triggers, and chat interfaces. It defines how an LLM behaves, which tools it can call, and its guardrails.

## Fields and settings

- **Name** — string. Display name used in lists and by callers; required.
- **Type** — select: `chat`, `analysis`, `automation`, `custom`. Categorizes and routes the agent; defaults to `chat`.
- **Model** — string. Stored in `model_config.model`. Blank falls back to `LLM_DEFAULT_MODEL` env then `gpt-4o` at inference time — set it explicitly so the behavior isn't env-dependent.
- **Max Tokens** — number. Maximum response length; empty values can cause provider errors.
- **Temperature** — number 0–2. Lower = deterministic, higher = random; out-of-range values may be rejected by the provider.
- **Description** — string, optional.
- **System Prompt** — text. The agent's personality, instructions, and constraints. Empty = no system message sent.
- **App ID** — select, optional. Owning app; blank = account-scoped.
- **Tools (one per line)** — newline-separated tool names the agent may invoke. Names must match registered tools exactly.
- **Capabilities / Constraints / Metadata (JSON)** — optional objects: feature flags, guardrails, free-form metadata. Invalid JSON blocks save.
- **Active** — checkbox. Inactive agents are hidden from callers and cannot be invoked.

**Downstream effects**

- Pipelines, triggers, and chat UIs reference agents by ID — changing the model changes their output everywhere.
- Tool names must match the tool registry exactly; unknown names produce runtime errors when invoked.
- `system_prompt` composes with the caller's prompt config — conflicting instructions between the two cause unpredictable behavior.

## Minimal configuration

```json
{
  "name": "Triage agent",
  "agent_type": "automation",
  "model_config": { "model": "gpt-4o", "temperature": 0.3, "max_tokens": 2000 },
  "system_prompt": "You classify inbound support tickets...",
  "is_active": true
}
```

## Full configuration

Adds `tools` (the registered tool names the agent may call), `capabilities` (e.g. `{ "json_mode": true, "streaming": false }`), `constraints` (e.g. `{ "max_tool_calls": 5, "disallowed": ["delete"] }`), and `metadata`.

## Example

A support app's triage agent (`agent_type: "automation"`, low temperature) classifies new tickets and calls a `set_field` tool to tag them; its companion chat agent (`agent_type: "chat"`, higher temperature, `tools: [search_kb]`) drafts replies for human review.

## Core files

- `.framework/functions/ai-agents.ts` — API
- `.framework/functions/ai-interactions.ts` — invocation/interaction records
- `.framework/src/pages/admin/AIAgentsPage.tsx` / `AIAgentDetailPage.tsx` — admin UI
- Table: `public.ai_agents`

## Agent notes

- The detail form stores model settings under `model_config` — a flat `model` field on the record will be ignored by callers.
- Pair agents with a `prompt_configs` entry for the prompt body; the agent record holds behavior, the prompt config holds text.
- Validate JSON fields before saving — a parse failure silently keeps the previous config.
