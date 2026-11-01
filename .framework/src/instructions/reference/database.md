---
title: Database Reference
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/004_core_rpc_and_broker.sql
  - .framework/migrations/018_runtime_tables.sql
  - .framework/migrations/035_rate_limits.sql
  - .framework/migrations/049_security_blocklist.sql
  - .framework/migrations/050_notifications.sql
  - .framework/migrations/054_kb_ingest_lease.sql
  - .framework/migrations/064_episode_leases.sql
  - .framework/cli/commands/migrate.ts
  - .framework/src/types/types.ts
---

# Database Reference

Postgres (Supabase) tables that custom code touches, grouped by purpose.
Column lists are the ones custom code actually reads/writes — every table has
`id uuid` plus `created_at`, and most have `updated_at`, `is_active`,
`account_id`, `app_id`, `created_by`/`updated_by`, and stamped
`design_schema`/`validation_schema` jsonb. The canonical DDL is
`.framework/migrations/001_core_schema.sql` (base) plus later migrations.

## Tenancy & identity

| Table | Purpose | Key columns |
|---|---|---|
| `accounts` | Tenant boundary; every scoped row hangs off one | `slug` UNIQUE, `display_name`, `parent_id`, `type_id`, `data`, `logs_retention_days`, `observability_retention_days` |
| `account_paths` | Closure table for account hierarchies | `ancestor_id`, `descendant_id`, `depth` (PK pair) |
| `people` | Human users (one per Supabase auth user + invite stubs) | `auth_uid` UNIQUE, `email` UNIQUE, `full_name`, `account_id`, `role_id`, `status`, `data` |
| `roles` | Role definitions granting record/field permissions | `slug` UNIQUE, `name`, `permissions` jsonb, `is_system`, `is_protected`, `account_id` |
| `system_settings` | Instance/account-scoped key-value settings | `scope`, `scope_id`, `key`, `value` |
| `invites` | Invite tokens and placement config | `app_id`, `account_id`, `slug`, `config`, `is_active` |

## Types, apps, configuration

| Table | Purpose | Key columns |
|---|---|---|
| `types` | Type definitions — the `design_schema` contract lives here | `kind`, `slug` (UNIQUE per `kind,slug` since 015), `name`, `icon`, `color`, `design_schema`, `validation_schema`, `ownership`, `is_active`, `app_id` |
| `apps` | Installed apps | `slug` UNIQUE, `name`, `app_type`, `source`, `renderer` (`generic`/`custom`/`none`), `route_prefix`, `required_roles`, `min_role`, `config` (incl. `registration`), `nav_items`, `manifest_path`, `config_source` |
| `link_types` | Named link semantics between records | `slug`, `name`, `config`, `source_kind`, `target_kind` |

## Runtime records

Every runtime row is typed (`type_id` → `types`) and stamped with the type's
schemas at insert. `system: true` fields are top-level columns; others live
in `data`.

| Table | Purpose | Key columns |
|---|---|---|
| `items` | The workhorse record kind | `type_id`, `title`, `status`, `data`, `account_id`, `app_id` |
| `threads` | Conversation containers bound to a target record | `type_id`, `title`, `target_type`, `target_id`, `visibility` (`internal`/`external`/`public`), `status`; UNIQUE `(target_type, target_id, visibility)` |
| `messages` | Posts inside threads | `thread_id`, `type_id`, `content`, `direction`, `sequence`, `visibility`, `person_id`; UNIQUE `(thread_id, sequence)` |
| `links` | Typed edges between records | `link_type_id`, `link_type`, `source_type`/`source_id`, `target_type`/`target_id`; UNIQUE edge constraint |
| `attachments` | File records | `filename`, `file_size`, `mime_type`, `storage_path`, `storage_provider`, `uploaded_by` |
| `watchers` | People watching a target record | `target_type`/`target_id`, `person_id`, `watch_type`, `notification_level`; UNIQUE `(target_type, target_id, person_id)` |
| `item_progress` | Per-item pipeline progress rows | `item_id`, `slug`, `config`, `status` fields |

## Automation

| Table | Purpose | Key columns |
|---|---|---|
| `pipelines` | Declarative stage sequences | `slug`, `name`, `config`/`metadata` (incl. `stages[]`), `account_id`, `app_id`, UNIQUE `(app_id, slug)` |
| `pipeline_executions` | Pipeline run ledger | `pipeline_id` FK CASCADE, `status`, `started_at`, `completed_at`, `input_data`, `output_data`, `error_message` |
| `triggers` | Event→pipeline dispatch rules | `slug`, `config` (event type, entity, filters, `pipeline_id`), `account_id`, UNIQUE `(app_id, slug)` |
| `trigger_executions` | Trigger fire ledger | `trigger_id` FK CASCADE, `status`, `input_data`, `output_data` |
| `timers` | Scheduled work definitions | `slug`, `config`, `account_id`, UNIQUE `(app_id, slug)` |
| `schedules` | Cron schedule principals (018) | schedule rows bound to `machine_principal_id` with `delegated_scopes` |
| `schedule_executions` | Schedule run ledger (018) | execution rows |
| `actions` | Stage-type catalog for pipelines (018, seeded by 053) | `slug`, `name`, `config`, `default_machine_principal_id` |
| `episode_leases` | Agent-episode concurrency leases (064) | lease rows gated by `lease_token` |
| `document_leases` | KB ingest leases by content hash (054) | lease rows |
| `rate_limits` | Atomic rate counters for `rate_limit_hit` RPC (035) | `key`, `window_start`, `count` |

## AI & knowledge

| Table | Purpose | Key columns |
|---|---|---|
| `ai_agents` | Agent configurations | `slug`, `name`, `config` (model, prompts, capabilities), `account_id`, UNIQUE `(app_id, slug)` |
| `prompt_configs` | Named prompt templates | `slug`, `name`, `config`, `account_id`, UNIQUE `(app_id, slug)` |
| `embeddings` | KB chunks with pgvector | `model_id`, `document_id`, `chunk_index`, `content`, `embedding vector(1536)`, `content_hash`, `approved_at`, `revoked_at`; UNIQUE `(model_id, document_id, chunk_index)` |

## Integrations & webhooks

| Table | Purpose | Key columns |
|---|---|---|
| `integrations` | Outbound/inbound integration configs | `slug`, `name`, `config` (credentials, adapters), `account_id`, UNIQUE `(app_id, account_id, slug)` |
| `integration_routes` | Inbound route definitions | `slug`, `config` (event path, handler), `account_id` |
| `webhook_handlers` | Dynamic handler registry (004) | `name`, `function_name`, `events[]`, `account_id`, `is_deleted`; UNIQUE `(app_id, account_id, name)` |
| `webhook_deliveries` | Inbound+outbound delivery ledger (004) | `direction`, `integration_id`, `api_key_id`, `handler_name`, `action_slug`, attempt/status fields |
| `api_keys` | Machine principals and integration keys | `key_prefix`, `key_hash`, `key_type` (`inbound`/`outbound`/`internal`/`cli`), `scopes[]`, `rate_limit`, `machine_type`, `is_internal`, `expires_at`, `integration_id` |
| `api_key_usage_logs` | Per-key request ledger (004) | `api_key_id` FK, `request_method`, `request_path`, `request_ip`, `success` |

## Observability & security

| Table | Purpose | Key columns |
|---|---|---|
| `logs` | Append-only log/audit/span/event rows | `level`, `message`, `context`, `metadata`, `source`/`source_type`/`source_id` |
| `observability` | Metric points | `metric_name`, `metric_value`, `metric_unit`, `context` |
| `alerts` | Alert rule configs | `slug`, `config` |
| `security_blocklist` | Hard-blocked persons/accounts/emails/IPs (049) | blocklist entries with `type` and value |
| `notifications` | User notifications (050) | recipient/title/body rows |

## Testing

`test_runs` (suite results incl. `pipeline_execution_id`), `test_cases`,
`test_results` (018) — test definitions and outcomes.

## Migration conventions

- Files live in `.framework/migrations/` (framework) and `custom/migrations/`
  (project); `migrate` applies framework first, then custom, in filename
  order — `.framework/cli/commands/migrate.ts`.
- Naming: `NNN_snake_case_description.sql`, three-digit prefix. Applied files
  are recorded in the `_spine_migrations` ledger (`filename` UNIQUE); each
  file runs in its own transaction and the run stops on first failure.
- Known numbering gaps: **22–31, 39–41, 63** — numbers were reserved or
  consolidated during development (audit D-007). A gap is expected, not a
  missing migration.
- `idempotent by convention`: framework migrations use `IF NOT EXISTS` /
  `ON CONFLICT DO NOTHING` so re-running a file is safe.

## Related

- [Design Schema](design-schema.md) · [Runtime Records](../concepts/runtime-records.md)
- [admin-data](api/admin-data.md) — the API surface over these tables
- `.framework/migrations/` — authoritative DDL
