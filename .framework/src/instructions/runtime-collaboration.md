---
title: Collaboration records (threads, messages, links, attachments, watchers)
audience: both
kind: entity
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/notify.ts
  - .framework/src/instructions/reference/database.md
---

# Collaboration records

## What this is for

Five runtime record kinds give any typed record a social layer: a ticket
gets a conversation (`threads`/`messages`), relationships to other records
(`links`), files (`attachments`), and subscribers who get notified
(`watchers`). They are ordinary typed records — created and read through
`/api/admin-data` like everything else — but their shapes and uniqueness
rules are fixed.

## Fields and settings

### `threads` — conversation containers

| Column | Notes |
|---|---|
| `type_id`, `title` | Typed record fields. |
| `target_type`, `target_id` | The record this thread is attached to (polymorphic — e.g. `item` + item id). |
| `visibility` | `internal` / `external` / `public` — who may see the conversation. |
| `status` | open/closed lifecycle. |
| UNIQUE `(target_type, target_id, visibility)` | **One thread per visibility per record** — find-or-create is the required pattern (see Agent notes). |

### `messages` — posts inside threads

| Column | Notes |
|---|---|
| `thread_id` | required parent thread. |
| `type_id`, `content` | Typed content; the body. |
| `direction` | inbound/outbound. |
| `person_id` | author (`people.id`). |
| `visibility` | mirrors thread visibility. |
| `sequence` | ordering; UNIQUE `(thread_id, sequence)` — assign next = max+1. |

### `links` — typed edges

| Column | Notes |
|---|---|
| `link_type_id`, `link_type` | FK + denormalized slug from `link_types` (`source_kind`/`target_kind` constrain valid endpoints). |
| `source_type`/`source_id`, `target_type`/`target_id` | Polymorphic endpoints; UNIQUE edge constraint prevents duplicates. |

### `attachments` — files

`filename`, `file_size`, `mime_type`, `storage_path`, `storage_provider`,
`uploaded_by`. The file bytes live in storage; the row is metadata.

### `watchers` — subscriptions

| Column | Notes |
|---|---|
| `target_type`, `target_id`, `person_id` | Who watches what; UNIQUE across all three. |
| `watch_type` | subscription kind. |
| `notification_level` | how much to notify. |

## Minimal configuration

A conversation on a record needs: one `threads` row (`target_type`,
`target_id`, `visibility`, `type_id` → a thread kind type) then `messages`
rows (`thread_id`, `content`, `sequence`, `person_id`).

## Full configuration

`links` for record↔record semantics, `attachments` for files, `watchers`
for per-person notification subscription.

## Example

A support ticket (`item`) gets `visibility: 'external'` thread found-or-
created on first customer message; each reply inserts a `messages` row with
`sequence = max+1`; staff `watchers` on the ticket get `notifications` via
the pipeline stage.

## Core files

- `.framework/migrations/001_core_schema.sql` — tables + unique constraints
- `.framework/functions/admin-data.ts` — CRUD path for all five kinds
- `.framework/functions/_shared/notify.ts` — watcher/recipient resolution
- [Database reference](reference/database.md) — column-level contract

## Agent notes

- **Threads are find-or-create, not create.** The
  `(target_type, target_id, visibility)` unique constraint rejects a second
  same-visibility thread — list first, insert only when absent. Custom apps
  do this via `apiFetch` → `/api/admin-data` (`action=list` then
  `action=create`), never a bespoke function.
- `messages.sequence` must be computed (`max+1`) — the unique constraint
  will reject collisions, and sequence gaps are fine but duplicates fail.
- `links` need a seeded `link_types` row first — `link_type` is validated
  against it.
- All five kinds take `type_id` — seed a `kind: 'thread'`, `'message'`,
  `'link'`, `'attachment'`, `'watcher'` type for each your app uses
  (`conflict: "kind,slug"`, `inject_app_id: false`).
