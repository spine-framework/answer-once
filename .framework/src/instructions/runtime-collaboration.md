---
title: Collaboration records (threads, messages, links, attachments, watchers)
audience: both
kind: entity
verified_against: 97bd83d
verified_on: 2026-11-22
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/083_attachment_link_type.sql
  - .framework/functions/admin-data.ts
  - .framework/functions/attachments.ts
  - .framework/functions/_shared/attachments.ts
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

## Why it exists

### link-types

Without typed links, a row in `links` is just two IDs. Link types give the relationship a name, icon, color, and app-specific semantics.

**Why it exists (5-whys):**

1. Free-text relationship names can't be queried, validated, displayed consistently, or reasoned about by shared code — `links.link_type_id` is required, and `resolveLinkTypeIds` throws on unregistered slugs.
2. A hardcoded enum of relationship kinds would freeze domain semantics into core — every new relationship would need a platform change.
3. A registry gives relationships identity: a slug to resolve, a name/icon/color to render, and a constraint that stops typos becoming data.
4. The schema permits app-scoped vocabularies (`UNIQUE(app_id, slug)`), but the shared resolver looks up slugs globally — app-scoped slugs that collide across apps will mis-resolve. Treat slugs as platform-global today.
5. **Root:** relationships are part of the domain, so their vocabulary must be app-definable — but they're queried by platform code, so that vocabulary must be registered data, not per-app convention. *(confirmed 2026-11-13)*

### attachments

You need to upload, store, and retrieve files tied to specific records with access control.

**Why it exists (5-whys):**

1. "Record has files" is universal — tickets, records, messages all need it; per-type file columns mean per-type upload/storage/permission plumbing.
2. The table stores file metadata, not blobs: binary lives in object storage (`storage_path` + `storage_provider`), the row holds what queries need — filename, size, mime, provenance.
3. `type_id` + typed attachments let apps declare kinds (invoice vs screenshot vs contract) with their own schema and permissions.
4. `uploaded_by` + `account_id` + RLS ride on the same governance as every other record — files are the most common leak vector, so access control can't be bespoke.
5. **Root:** files are a capability every domain needs but none should rebuild — the attachment row decouples "this record has files" (governed data) from "the file's bytes" (provider storage), so storage stays swappable and access stays governed. *(confirmed 2026-11-13)*

### links

You need many-to-many or directed relationships (parent/child, blocks, depends on, verified by) without adding foreign keys to every type.

**Why it exists (5-whys):**

1. Relationships are many-to-many and open-ended — any record can relate to any other; foreign keys fix both cardinality and participants.
2. Polymorphic `source_type`/`target_type` connects anything to anything — item↔item, item↔thread, cross-app — without a column or join table per pairing.
3. `UNIQUE(source_type, source_id, target_type, target_id, link_type_id)` means the same pair can carry multiple *kinds* of relationship but not duplicates — dedup is a constraint, not application logic.
4. `metadata` + `data` on the link itself makes relationships first-class records — edges carry data (weight, provenance, reason), not just endpoints.
5. **Root:** domain models are graphs, and graphs can't be pre-declared in table structure — `links` makes the relationship layer as generic as the record layer, the only way a generic platform supports arbitrary domains. *(confirmed 2026-11-13)*

### messages

You need ordered, typed messages with metadata (direction, visibility, sender) attached to threads.

**Why it exists (5-whys):**

1. A thread is a context; messages are its ordered content — different cardinality, lifecycle, and permissions (a message can be internal-only inside a public thread).
2. `sequence` + `UNIQUE(thread_id, sequence)` gives deterministic ordering that survives clock skew and concurrent writers — sequence is a contract, timestamps are a hint.
3. `direction` + `visibility` + `person_id` per row captures flow direction (inbound/outbound), audience, and authorship for audit and attribution — per message, not per thread.
4. `type_id` on messages lets apps declare *kinds* of message (note vs email vs system event) with their own schema — types-as-data at message granularity.
5. **Root:** conversation content needs structure the container can't provide — ordering, direction, audience, authorship per entry — so messages are their own typed, sequenced primitive rather than text blobs on the thread. *(confirmed 2026-11-13)*

### threads

You need a consistent way to add comments, chat history, or audit trails to any record without adding comment fields to every type.

**Why it exists (5-whys):**

1. A comment field per type means per-type plumbing for a capability every record can need.
2. Polymorphic `target_type`/`target_id` attaches a thread to any record — item, account, another app's record — without schema changes per attachable thing.
3. A thread is a container separate from its messages: it has its own lifecycle (open/closed, visibility, participants) independent of the content inside.
4. `UNIQUE(target_type, target_id, visibility)` enforces one conversation context per thing per audience — internal and public threads on the same record are separate contexts, not filtered views of one pile.
5. **Root:** conversation is a capability, not a property of one entity — the platform provides it once, polymorphically, so every type gets threads without shipping a comments feature. *(confirmed 2026-11-13)*

### watchers

You need to know who cares about a record change without embedding a watchers list in every type.

**Why it exists (5-whys):**

1. "Someone cares about changes to this record" is universal — per-type subscriber lists are per-type plumbing and can't drive generic notification logic.
2. Polymorphic `target_type`/`target_id` lets any record be watched — same reason threads and links are polymorphic.
3. `watch_type` + `notification_level` capture that watching isn't binary — all changes vs status only vs mentions; the preference must live on the subscription or notification routing can't be generic.
4. `UNIQUE(target_type, target_id, person_id)` means one subscription per person per thing — duplicate watchers mean duplicate notifications.
5. **Root:** notification routing needs a single place to answer "who cares about this?" — `watchers` makes interest queryable data so any record type is subscribable and any notifier (including pipelines, which resolve `watchers` as recipients, and agents, which can add them) can find its audience. *(confirmed 2026-11-13)*

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

**Byte path** (v1: images only): uploads are a three-step contract —
`POST /api/attachments?action=upload-url` mints a signed URL into the
`attachments-tmp` quarantine bucket (the only place clients may write),
the client PUTs bytes to it, then `admin-data` create with `tmp_path`
commits: actual size + magic-byte mime verified, GPS EXIF stripped per the
type's `file_policy`, bytes written to `attachments` (private, signed
reads) or `attachments-public` (stable public URL) at
`{account_id}/{uuid}/{filename}`, and the verified columns stamped — the
client never supplies `storage_path`. `read-url` resolves an id through
row RLS to a signed or public URL. Row delete cascades to the object.
Association to a record is a `links` edge — seeded `has_attachment`
(link type; source = record, target = attachment) — or a `file`/`image`
field storing the attachment id. See [attachments](reference/functions/attachments.md).

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
  (`conflict: "kind,slug"`, `inject_app_id: false`). For attachment types,
  declare `file_policy` in the `design_schema` — allowed mimes, max bytes,
  visibility, `strip_gps` — and grant `create` to the roles that may
  upload (the seeded `attachment` type grants `system_admin` only).
