---
title: The Spine domain model
audience: developers, agents
kind: guide
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/003_core_system_data.sql
  - .framework/migrations/004_core_rpc_and_broker.sql
  - .framework/migrations/020_schema_reconciliation.sql
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/trigger-scheduler.ts
  - .framework/functions/pipeline-runner-background.ts
  - .framework/src/App.tsx
  - .framework/src/components/app-shell/GenericAppShell.tsx
  - .framework/src/components/CustomAppLoader.tsx
  - .framework/src/contexts/AppContext.tsx
  - .framework/src/hooks/useApps.ts
  - netlify.toml
---

# The Spine domain model

Everything in Spine is one of about ten primitives. Once you can name them and
say how they connect, the whole system — admin UI, APIs, automation — is just
compositions of the diagram below.

```
                         ┌──────────────────────── IDENTITY ────────────────────────┐
                         │                                                        │
   auth.users (Supabase) │   account ──< people >── role                          │
        │                │   (tenant,    (human,    (permission                  │
        │ auth_uid       │    tree via    auth_uid,  set; system_admin           │
        ▼                │    parent_id   account_id, is the seeded root)         │
   JWT / x-api-key ──────┤    + account_   role_id)                              │
        │                │    paths)                                             │
        ▼                └──────────────────────────┬─────────────────────────────┘
   principal ─────────── every request resolves one │
   (anonymous | human | machine | system)           │
                                                    ▼
                         ┌──────────────────────── SCHEMA ─────────────────────────┐
                         │  type (kind + slug) → design_schema → validation_schema  │
                         │  fields · views · record_permissions · scope             │
                         └──────────────────────────┬─────────────────────────────┘
                                                    │ stamped at create
                                                    ▼
                         ┌──────────────────────── RECORDS ────────────────────────┐
                         │  items · threads · messages · links · attachments ·      │
                         │  watchers  (+ accounts, people as records)               │
                         │  system columns  +  data jsonb  +  stamped schemas       │
                         └──────────────────────────┬─────────────────────────────┘
                                                    │ CRUD via /api/admin-data
        ┌──────────────────────── APPS ◄────────────┘ renders / consumes
        │                generic | custom | none    │
        │  app row: slug, route_prefix, renderer,   ▼
        │  nav_items, roles              ┌────────────────────── AUTOMATION ───────┐
        └───────────────┬────────────────┤ triggers (event) → pipelines (stages)  │
                        │ seeds/owns     │ timers (cron/interval/once) ──┘        │
                        ▼                │ integrations (adapters+creds)          │
        ┌──────────────────────── AI ────┤ ai_agents · prompt_configs ·           │
        │  embeddings (pgvector search)  │ embeddings                            │
        └────────────────────────────────┴──────────────┬────────────────────────┘
                                                        ▼
                         ┌──────────────────────── OBSERVE ────────────────────────┐
                         │ logs · observability · pipeline_executions ·            │
                         │ trigger_executions · webhook_deliveries ·               │
                         │ api_key_usage_logs · audit                              │
                         └─────────────────────────────────────────────────────────┘
```

## Identity: account → person → role → principal

- **Account** (`public.accounts`) — the tenant. Accounts form a hierarchy via
  `parent_id` + the `account_paths` closure table; the seeded `spine-system`
  account is the platform root
  (`.framework/migrations/011_spine_system_account.sql`).
- **Person** (`public.people`) — a human user, bound to `auth.users` by
  `auth_uid`, placed in one `account_id`, holding one `role_id`. Like every
  runtime record, a person row also carries `type_id` and `data`.
- **Role** (`public.roles`) — a named permission set with a globally unique
  `slug`. `system_admin` is seeded, protected, and bypasses record-level
  checks (`.framework/migrations/003_core_system_data.sql`).
- **Principal** — the *resolved* identity of a request, computed per call by
  `.framework/functions/_shared/principal.ts`: `x-api-key` header → machine
  principal (verified against `api_keys` hash), internal-invoke headers →
  cron/trigger/system, `Authorization: Bearer` JWT → human principal, anything
  else → anonymous. Handlers receive it as `ctx.principal` with
  `ctx.accountId`.

## Schema: type → design_schema → validation_schema

A **type** (`public.types`) is the schema for a record kind. `kind` selects the
runtime table — `item`, `thread`, `message`, `link`, `attachment`, `watcher`,
`account`, `person` — and `(kind, slug)` is unique. Its `design_schema` JSON
carries:

- `fields` — each with `data_type`, `label`, `required`, and optional
  `system` flag.
- `views` — `default_list` / `default_detail` consumed by the generic UI.
- `record_permissions` — per-role base grant of `create`/`read`/`update`/
  `delete`; `fields.*.permissions` exists only to *override* that base per
  field (`.framework/functions/_shared/permissions.ts`).
- `scope` — `account` (tenant data, the default) or `platform` (record is
  re-anchored to the `spine-system` account at create).

`validation_schema` is **generated from `design_schema`** on every save
(`.framework/functions/types.ts` via `_shared/schema-utils.ts`) — never
hand-edit it.

## Records: the runtime tables

Six typed record tables — `items`, `threads`, `messages`, `links`,
`attachments`, `watchers` — plus `accounts` and `people` in the same shape
(`.framework/migrations/001_core_schema.sql`). Every record has:

- **system columns** — `id`, `type_id`, `account_id`, `app_id`, `created_at`,
  `updated_at`, `created_by`, `is_active`, plus kind-specific ones
  (`items.title/status`, `threads.target_type/target_id`,
  `messages.thread_id/sequence`, `links.source_*/target_*`,
  `attachments.storage_path`, `watchers.person_id`).
- **`data` jsonb** — where all non-system schema fields live. Convention:
  `system: true` fields read from `record.<field>`; everything else from
  `record.data.<field>` (see `GenericDetailPage` splitting on
  `fieldDef.system` in `.framework/src/components/app-shell/GenericDetailPage.tsx`).
- **stamped `design_schema` + `validation_schema`** — copied from the type at
  create time by `admin-data` (`create` in `.framework/functions/admin-data.ts`),
  so the record is the source of truth for its own permissions even if the
  type changes later.

All CRUD flows through `/api/admin-data` (`action=list|get|stats|create|
update|remove`, `entity=<table>`; GET for reads, POST/PATCH/DELETE for writes). The handler maps entity → kind
(`ENTITY_TO_KIND`), resolves `type_slug`/`type_id`, evaluates record/field
permissions, writes, then fires create/update/delete triggers.

## Apps: registry + two renderers

An **app** (`public.apps`) is a registered application: `slug`,
`route_prefix`, `renderer`, `nav_items`, `min_role`/`required_roles`,
`config`, `is_active`, `is_system`. The authenticated router
(`.framework/src/App.tsx`) mounts every routable app at its `route_prefix`:

- **`renderer: 'generic'`** — `GenericAppShell` builds the UI *from data*: the
  sidebar comes from `nav_items`, and each nav item with a `type_slug` gets
  list/new/detail routes rendered by `GenericListPage`/`GenericDetailPage`
  straight from the type's `views`
  (`.framework/src/components/app-shell/GenericAppShell.tsx`).
- **`renderer: 'custom'`** — `CustomAppLoader` lazy-loads
  `custom/apps/<slug>/index.tsx` (falling back to
  `.framework/src/apps/<slug>/index.tsx`)
  (`.framework/src/components/CustomAppLoader.tsx`). Custom apps render their
  own pages but still use `/api/admin-data` for record CRUD.
- **`renderer: 'none'`** — registry-only; not routable.

## Automation: triggers → pipelines, timers → pipelines

- **Pipeline** (`public.pipelines`) — a `stages` array executed in order by
  `runPipeline` (`.framework/functions/_shared/pipeline-runner.ts`). Each
  stage's `stage_type` resolves to a `public.actions` row or a built-in
  handler (`update_item`, `create_record`, `http_request`,
  `send_notification`, `send_email`, `run_pipeline`, `query_items`,
  `agent_inference`, `search_knowledge`, `generate_embeddings`,
  `revoke_embeddings`, `kb_ingest`, `kb_revoke`, `create_interaction`).
  Every run writes a `pipeline_executions` row.
- **Trigger** (`public.triggers`) — `event_type` + `pipeline_id` (+ optional
  `config` filters). `admin-data` calls `fireCreate/Update/DeleteTriggers`
  after each write; events are named `<entity>_<created|updated|deleted>`
  (e.g. `item_created`). A match enqueues a `pipeline_executions` row and
  dispatches to the `pipeline-runner-background` function over HTTP — which
  requires `INTERNAL_INVOKE_SECRET` to be set
  (`.framework/functions/_shared/trigger-engine.ts`).
- **Timer** (`public.timers`) — `timer_type` (`interval` | `cron` | `once`) +
  `pipeline_id` + schedule in `config`. The scheduled function
  `trigger-scheduler` (every minute, `netlify.toml`) runs `system-cron`,
  which calls the `get_due_timers` RPC and executes each due timer's pipeline
  under a `timer:*` machine principal
  (`.framework/functions/system-cron.ts`).

## Integrations and AI

- **Integration** (`public.integrations`) — a named adapter + `config` +
  `credentials` (`{"env_var": "NAME"}` resolved in the function environment,
  or a literal `{"value": …}`). Inbound webhooks arrive via
  `integration-routes`; outbound calls go through `integration-outbound`,
  which records each attempt in `public.webhook_deliveries` (the deliveries
  ledger — `system-cron` retries pending ones via
  `.framework/functions/_shared/retry-deliveries.ts`).
- **AI agent** (`public.ai_agents`) — a model/prompt/tool config invocable via
  `/api/ai-agents?action=run` or the `agent_inference` pipeline stage.
  **Prompt config** (`public.prompt_configs`) — named, versioned prompt
  templates agents and stages reference.
- **Embedding** (`public.embeddings`) — pgvector vectors with the
  `match_embeddings` / `search_similar_embeddings` RPCs
  (`.framework/migrations/004_core_rpc_and_broker.sql`), powering semantic
  search and the `search_knowledge` stage type.

## Observability: everything leaves a trail

`public.logs` (per-account log stream), `public.observability` (metrics),
`pipeline_executions` + `trigger_executions` (automation history),
`webhook_deliveries` (outbound attempts), `api_key_usage_logs` (machine
principal usage), and audit events emitted by `emitAudit` on privileged
actions. The admin UI surfaces them under Observability, Deliveries, and
Executions (`.framework/functions/logs.ts`,
`.framework/functions/observability.ts`,
`.framework/functions/pipeline-executions.ts`,
`.framework/functions/deliveries.ts`).

## Where to go next

- Entity deep-dives: [types](../types.md), [apps](../apps.md),
  [roles](../roles.md), [pipelines](../pipelines.md),
  [triggers](../triggers.md), [timers](../timers.md),
  [integrations](../integrations.md), [ai-agents](../ai-agents.md),
  [prompts](../prompts.md), [api-keys](../api-keys.md),
  [deliveries](../deliveries.md).
- Build something: [04-first-app.md](./04-first-app.md).
- Terminology: [05-glossary.md](./05-glossary.md).
