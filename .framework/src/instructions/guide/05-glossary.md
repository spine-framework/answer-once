---
title: Glossary
audience: developers, agents
kind: guide
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/004_core_rpc_and_broker.sql
  - .framework/migrations/011_spine_system_account.sql
  - .framework/migrations/020_schema_reconciliation.sql
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/system-cron.ts
  - .framework/cli/lib/project-files.ts
  - .framework/src/components/CustomAppLoader.tsx
  - .framework/src/components/app-shell/GenericAppShell.tsx
  - scripts/assemble.sh
  - scripts/assemble-frontend.sh
  - scripts/assemble-functions.sh
---

# Glossary

The Spine vocabulary, in dependency order. Terms in **bold** are defined
elsewhere on this page or in the [domain model](./03-domain-model.md).

## Identity

**account** — a tenant boundary (`public.accounts`). Every runtime record is
scoped to an `account_id`; accounts nest via `parent_id` with the
`account_paths` closure table for descendant lookups. The seeded `spine-system`
account is the platform root (see **scope**).

**person** — a human user (`public.people`), linked to Supabase `auth.users`
by `auth_uid` and placed in one account with one role. Non-first,
non-invited signups have no account until registration placement assigns one.

**principal** — the resolved identity attached to a request (`ctx.principal`),
computed per call by `.framework/functions/_shared/principal.ts`. One of:
`human` (Bearer JWT → person), `machine` (`x-api-key` header → API key, or
internal cron/trigger principal), `system` (internal invoke), or `anonymous`.
Carries `id`, `type`, `accountId`, `roles`, `scopes`, and provenance.

**role** — a named permission set (`public.roles`, unique `slug`) assigned to
a person. Roles are referenced throughout `design_schema.record_permissions`.
`system_admin` is the seeded superuser role; roles ending in `_admin` can
manage invites/members within their own account.

## Schema

**type** — the schema definition for a record kind (`public.types`), unique
per `(kind, slug)`. Carries `design_schema` (generated into
`validation_schema`), `ownership` (`system` | `app` | `tenant`), `icon`,
`color`, `is_active`.

**design_schema** — the authoring-format JSON on a type: `fields`, `views`,
`record_permissions`, `scope`, `functionality`. See [types](../types.md) and
the worked example in [04-first-app.md](./04-first-app.md).

**validation_schema** — the runtime-format schema derived from
`design_schema` on every save by `.framework/functions/types.ts` /
`.framework/functions/_shared/schema-utils.ts`. Read-only; used to validate
record writes.

**kind** — which runtime table a type governs: `item`, `thread`, `message`,
`link`, `attachment`, `watcher`, `account`, `person` (the `ENTITY_TO_KIND`
map in `.framework/functions/admin-data.ts`).

**runtime record** — a row in one of the typed tables (`items`, `threads`,
`messages`, `links`, `attachments`, `watchers`, `accounts`, `people`). Always
has `type_id`, `account_id`, `data` jsonb, and the `design_schema`/
`validation_schema` stamped at creation.

**system field** — a `design_schema` field flagged `system: true`, stored as
a real table column and read as `record.<field>` (e.g. `title` →
`items.title`). Non-system fields live in `data` and read as
`record.data.<field>` (split implemented in
`.framework/src/components/app-shell/GenericDetailPage.tsx`).

## Apps

**app** — a registered application (`public.apps`): `slug`, `route_prefix`,
`renderer`, `nav_items`, `min_role`/`required_roles`, `config`, `is_active`,
`is_system`. Appears in the authenticated router when it has a
`route_prefix` and `renderer != 'none'`
(`.framework/src/contexts/AppContext.tsx`).

**renderer** — how an app's UI is produced. `generic` = schema-driven shell
(`GenericAppShell` renders `nav_items` → list/detail pages from type views).
`custom` = lazy-loaded React entry (`custom/apps/<slug>/index.tsx`, falling
back to `.framework/src/apps/<slug>/index.tsx`) via
`.framework/src/components/CustomAppLoader.tsx`. `none` = registry-only, not
routed.

**manifest** — two meanings, both frozen JSON contracts: (a) an app
`manifest.json` in `custom/apps/<slug>/` declaring routes, `nav_items`,
`required_roles`, `registration`, and a `seed` block consumed by
`install-app`/`seed-app`/`update-db-app`
(`.framework/cli/commands/install-app.ts`); (b) `.spine-manifest.json`, the
project's frozen integrity manifest of per-file sha256 hashes
(`.framework/cli/lib/project-files.ts`).

## Automation

**pipeline** — a multi-step workflow (`public.pipelines`, `stages` jsonb)
executed by `runPipeline` in
`.framework/functions/_shared/pipeline-runner.ts`. Each stage's `stage_type`
maps to a `public.actions` row or a built-in handler (`http_request`,
`send_notification`, `agent_inference`, `query_items`, …).

**trigger** — an event subscription (`public.triggers`): `event_type` +
`pipeline_id` + optional `config` filters. `admin-data` emits
`<entity>_<created|updated|deleted>` events (e.g. `item_created`); matching
triggers enqueue an execution and dispatch the pipeline via the
`pipeline-runner-background` function (requires `INTERNAL_INVOKE_SECRET`).

**timer** — a schedule (`public.timers`): `timer_type`
(`interval` | `cron` | `once`) + `pipeline_id`. The `trigger-scheduler`
Netlify scheduled function (every minute, `netlify.toml`) runs `system-cron`,
which runs due timers through `runPipeline` under a `timer:*` principal.

**integration** — a named external connection (`public.integrations`):
adapter slug + `config` + `credentials` (`env_var` reference or literal
`value`). Inbound webhooks arrive via `integration-routes`; outbound calls
via `integration-outbound` write **deliveries**.

## AI

**prompt config** — a named, versioned prompt template
(`public.prompt_configs`) referenced by AI agents and pipeline stages.

**AI agent** — a reusable model + prompt + tool configuration
(`public.ai_agents`), invocable via `/api/ai-agents?action=run` or the
`agent_inference` pipeline stage.

**embedding** — a pgvector embedding (`public.embeddings`) queried through
the `match_embeddings`/`search_similar_embeddings` RPCs; backs semantic
search and knowledge stages.

## Access and delivery

**API key** — a machine credential (`public.api_keys`) presented as the
`x-api-key` header; resolved by prefix and verified against a stored hash
(`.framework/functions/_shared/principal.ts`,
`.framework/functions/_shared/hash-api-key.ts`). Has `rate_limit` and usage
logged in `api_key_usage_logs`.

**delivery** — an outbound delivery attempt record
(`public.webhook_deliveries`) written by `integration-outbound`; retried by
`retry-deliveries` inside `system-cron`. See [deliveries](../deliveries.md).

**execution** — a run record: `pipeline_executions` for pipelines,
`trigger_executions` for trigger fires, `schedule_executions` for scheduled
actions. Statuses progress `queued` → `running` → `completed`/`failed`.

**audit log** — privileged-action events written by `emitAudit`
(`.framework/functions/_shared/audit.ts`) plus the `public.logs` stream —
e.g. `trigger.fired`, `app.created`, `app.version_updated`.

## Project layout

**scope** — `design_schema.scope`: `account` (records belong to the caller's
tenant, the default) or `platform` (`admin-data` re-anchors created records
to the `spine-system` account).

**assembled** — `.assembled/`, the generated build tree:
`.assembled/src` (framework frontend + verbatim `custom/apps/<slug>/`) and
`.assembled/netlify/functions` (flattened functions for Netlify), produced by
`npm run assemble` (`scripts/assemble.sh`).

**`.framework/`** — the sealed, framework-owned tree vendored into your
project. Checksummed in `.spine-manifest.json`; overwritten by
`npx spine-framework upgrade`. See
[02-project-map.md](./02-project-map.md).

**CIL** — the Code Intelligence Layer: Spine's code-intelligence subsystem
(ingested code chunks, embeddings, and a searchable project graph) surfaced
under the admin `cil` pages (`.framework/src/pages/admin/cil/`). Optional;
your apps do not depend on it.
