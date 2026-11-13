---
title: kb
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/kb.ts
  - .framework/functions/_shared/kb.ts
  - .framework/functions/_shared/llm.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/migrations/054_kb_ingest_lease.sql
  - netlify.toml
  - public/_redirects
---

# kb

## What it does

`kb` (`.framework/functions/kb.ts`) is the knowledge-base surface: a thin
`?action=` dispatcher over the shared implementation in
`.framework/functions/_shared/kb.ts`. It maintains `embeddings` vector rows
for published knowledge items and serves semantic search over them, gated by
the calling app's knowledge envelope.

| Action | Handler | Purpose |
|---|---|---|
| `ingest` | `kbIngest` | Embed one `items` record's declared vector fields into `embeddings`. |
| `revoke` | `kbRevoke` | Revoke + delete a document's embeddings and clear its ingest lease. |
| `reindex` | `kbReindex` | Re-ingest every `published` item of a type (batched, 10 in flight). |
| `search` | `kbSearch` | Vector search via `match_embeddings`, best-match-per-document. Default action. |
| `publish` | `kbPublish` | PATCH `status: 'published'` through admin-data, then ingest. |

## Route and methods

- `/api/kb?action=<action>` — `public/_redirects` maps `/api/*` to
  `/.netlify/functions/:splat`. The action comes from `ctx.query.action`
  only — it must be a query parameter; the HTTP method itself is not
  checked, and the body carries the parameters.
- The function is configured with a 120s timeout in `netlify.toml` (reindex
  sweeps a whole corpus).

## Authentication

`createHandler` resolves a principal and rejects anonymous requests with 401.
There is no role gate on the actions themselves; authorization is enforced
downstream:

- `kbSearch` runs `resolveKnowledgeScope` — deny-by-default unless the
  caller's app declares `config.knowledge` — and each result is passed
  through `sanitizeRecordData` before returning.
- `kbPublish` goes through admin-data `update` (a synthetic PATCH), so
  field-level permissions and triggers apply.
- `kbIngest`/`kbRevoke`/`kbReindex` operate via `adminDb` — they rely on the
  caller being trusted to name a document; `body.account_id` on ingest lets
  an operator ingest a record owned by another account.

## Request contract

`ingest`: `{ id (required, items.id), account_id? }`

`revoke`: `{ id (required) }`

`reindex`: `{ type_slug (required), app_id? }` — `app_id` narrows the items
re-ingested.

`search`:

| Field | Default | Notes |
|---|---|---|
| `query` | — | Required. |
| `type_slugs` | `[]` | The caller's pick — intersected with the app envelope; picks outside it deny the call. |
| `sources` | `['kb']` | `'kb'` for knowledge items, `'code'` for legacy `cil_chunk` vectors — the CIL corpus is retired (079) but preserved rows remain readable. |
| `app_id` | `null` | Post-filter on `metadata.app_id`. |
| `vector_fields` | `[]` | Restrict to specific `metadata.vector_type` values. |
| `limit` / `offset` | `10` / `0` | Page over best-match documents. |
| `similarity_threshold` | `0.15` | Minimum cosine similarity. |
| `filters` | `{}` | Post-filter on the resolved `items` row. |

`publish`: `{ id (required) }`

## Response contract

- `ingest` → `{ ok, message, count?, in_progress? }`. `message` is one of
  `embeddings generated`, `embeddings reused (unchanged content)`,
  `record is not published; embeddings revoked if any`,
  `embedding already in progress` (with `in_progress: true` — **not** a
  success signal for stampers), or `no content to embed`.
- `revoke` → `{ ok, message: 'embeddings revoked', count }`, or
  `{ ok, skipped: true, message: 'document is published — embeddings
  retained', count: 0 }` — revoke re-checks current status at execution time
  and refuses to strip a now-published document.
- `reindex` → `{ ok, count, errors?: [{ id, error }] }` — per-item failures
  are collected, not fatal.
- `search` → `{ results, count, error? }`; results are
  `{ id, document_id, type_slug, title, snippet, app_id, similarity, status,
  created_at, source, data }` sorted by similarity. `error` carries
  `knowledge_denied: <reason>` when the envelope refuses.
- `publish` → `{ record, ingest }` — the admin-data update result plus the
  ingest result.

## Side effects

- `ingest`: reads the record's stamped `design_schema.functionality.kb` —
  `vector_fields` (default `['title', 'content']`), `chunk_field` (default
  `content`), `chunk_size` (800), `chunk_overlap` (100), `security_level`
  (deny-by-default `internal`), `supersede_keys`. Field text is normalized
  (rich-text HTML stripped, bare UUID tokens dropped) and hashed — a
  `document_leases` row (migration `054`) dedupes unchanged re-embeds
  (`reused`) and fences concurrent workers (`processing`). Prior embeddings
  are cleared via `revoke_embeddings_for_item` + delete, chunks are embedded
  in **one batched** `callOpenAIEmbeddings` call (`text-embedding-3-small`),
  and new rows are inserted with `metadata.{type_slug, item_type, app_id,
  vector_type, security_level, status}` and `approved_at` set. Older
  `published` items sharing a `supersede_keys` value are archived with
  `superseded_by`/`superseded_at` and their embeddings revoked.
- `revoke`: `revoke_embeddings_for_item` RPC + embeddings row delete +
  unconditional `document_leases` delete (warn-only on failure).
- `reindex`: sweeps `published` items of the type in batches of 10, calling
  `kbIngest` each — sequential ingest would exceed the function budget.
- `publish`: admin-data PATCH sets `status: 'published'` (permissions,
  audit, triggers run), then `kbIngest` runs immediately in the same
  request.
- `search`: one `callOpenAIEmbeddings` call for the query embedding plus
  `match_embeddings` RPC per requested vector type.

## Errors

| Condition | Error |
|---|---|
| Missing inputs | `id is required` · `type_slug is required` · `query is required` |
| Unknown record | `record not found` |
| Unknown type | `type not found: <type_slug>` |
| Bad action | `unknown kb action: <action>` |
| RPC/insert failures | thrown — the lease is released with `failed` status |

## Agent notes

- **Ingest outcomes are tri-state.** `in_progress: true` means another
  worker owns this content's embed — callers that stamp embedding state on
  the record must not write success *or* failure; the owning worker's
  completion reconciles the corpus. A fenced lease release (superseded
  mid-flight) warns without throwing.
- **Search is deny-by-default.** No `config.knowledge` envelope on the app →
  `knowledge_denied`. The envelope declares `account` (self, or
  `self_and_descendants` via `get_accessible_accounts`), `platform`
  (spine-system account, own `sources` allowlist), and project-scoped code
  chunks — the last only when an explicit project id list survives the
  envelope∩pick intersection. When the app declares `required_roles`, the
  principal must hold one (system_admin bypasses).
- **`document_id` is polymorphic.** Regular records key `embeddings` by
  their items UUID; code-chunk vectors key it by a `stable_id` string —
  `kbSearch` splits the `items` lookup (`id` vs `data->>stable_id`) to
  handle both.
- **Pipelines don't call this endpoint.** The `kb_ingest`/`kb_revoke` stage
  handlers lazy-import `kbIngest`/`kbRevoke` directly and resolve `item_id`
  from trigger data; `search_knowledge` uses its own text-search path over
  `embeddings`, not `kbSearch`.
- `adminUpdate` is imported lazily to avoid a circular-import deadlock
  through `pipeline-runner` — preserve that pattern if adding admin-data
  calls.
- See [AI agents, prompt configs, and embeddings](../../concepts/ai-and-prompts.md)
  for how these vectors feed agent retrieval.
