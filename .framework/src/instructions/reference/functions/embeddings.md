---
title: embeddings
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/embeddings.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/llm.ts
  - .framework/migrations/001_core_schema.sql
  - .framework/migrations/044_match_embeddings_filtered_knn.sql
  - .framework/public/_redirects
---

# embeddings

## What it does

Lifecycle management for `public.embeddings` — per-document vector rows
(`UNIQUE(model_id, document_id, chunk_index)`, pgvector
`embedding vector(1536)`) used by knowledge retrieval. Beyond basic
CRUD it can **generate** an item's vector set from its type schema,
**search** by vector similarity or full-text, and gate visibility with
`approved_at`/`revoked_at`.

## Route and methods

`/.netlify/functions/embeddings`, reachable as `/api/embeddings`
(`/api/*` → `/.netlify/functions/:splat`,
`.framework/public/_redirects`). Dispatch is by `?action=` + method:

| Call | Handler |
|---|---|
| `GET /api/embeddings` | `list` |
| `GET /api/embeddings?id=<uuid>` | `get` |
| `GET /api/embeddings?action=stats` | `getStats` |
| `POST /api/embeddings` | `create` |
| `PATCH /api/embeddings` (`id` in body or query) | `update` |
| `POST /api/embeddings?action=generate` | `generate` |
| `POST /api/embeddings?action=batch-create` | `batchCreate` |
| `POST /api/embeddings?action=delete-document` | `deleteByDocument` |
| `POST /api/embeddings?action=cleanup` | `cleanup` |
| `POST /api/embeddings?action=search-similar` | `searchSimilar` |
| `POST /api/embeddings?action=search-semantic` | `searchSemantic` |
| `POST /api/embeddings?action=revoke` | `revoke` |
| `POST /api/embeddings?action=approve` | `approve` |

There is no `DELETE` route — `delete-document` is a POST action.

## Authentication

Standard `createHandler` auth: `x-api-key` → machine principal,
`x-internal-secret` → internal principal, `Bearer <jwt>` → human;
anonymous → 401.

- `list`/`create`/`batchCreate`/`getStats`/`searchSemantic` require
  `ctx.accountId`.
- **No role check anywhere.** `generate`, `revoke`, and `approve` read
  and write through `adminDb` (service role) for any authenticated
  caller — including cross-account, since `generate` accepts an
  `account_id_override`. Treat these actions as trusted-surface
  operations.

## Request contract

**list** (query): `model_id`, `document_id`, `limit` (default 100),
`offset` (default 0). Ordered `created_at` desc.

**get** (query): `id`. **getStats**: none → `{ total_embeddings }`.

**create** (body): `model_id`, `document_id`, `content` required;
`chunk_index` (default 0), `metadata` `{}`. `account_id` stamped from
context. (Does **not** compute a vector — it stores a row.)

**update** (`id` + body): `content`, `metadata` only.

**generate** (body): `item_id` required; `force_regenerate` (deletes and
rebuilds all vectors for the document), `account_id_override` (defaults
to the item's account, then the `spine-system` platform account).

**batchCreate** (body): `embeddings_data` array — rows inserted verbatim
with `account_id` stamped.

**deleteByDocument** (body): `document_id` — hard-deletes all its rows.

**cleanup** (body): `days_to_keep` (default 365) — hard-deletes rows
older than the cutoff.

**searchSimilar** (body): `query_embedding` required; `limit` (default
10), `threshold` (default 0.7), `filter_account_ids`,
`filter_vector_type`, `filter_item_types`, `filter_document_ids` — calls
the `match_embeddings` RPC
(`.framework/migrations/044_match_embeddings_filtered_knn.sql`).

**searchSemantic** (body): `query` required; `model_id`,
`document_ids`, `limit` (default 10) — Postgres `textSearch`
(`websearch`, `english`) over `content`, scoped to `ctx.accountId`.

**revoke** / **approve** (body): `document_id`.

## Response contract

Standard `{ data, error, meta }` envelope.

- `generate` → `{ item_id, embeddings_created, embeddings_skipped,
  errors }` (unchanged content is skipped by hash, not re-embedded).
- `searchSimilar` → `{ results, count, model_id, threshold }`;
  `searchSemantic` → `{ results, count, method: 'text_search', query }`.
- `revoke` → `{ document_id, revoked_count }`; `approve` →
  `{ document_id, approved_count }`; `deleteByDocument`/`cleanup` →
  `{ deleted_count }`; `batchCreate` → inserted rows.
- `list`/`get` sanitize via `sanitizeRecordData` — full row for system
  admins, `{ id }` for non-admins (rows carry no `design_schema`).

## Side effects

- `generate` reads the item + its type's `design_schema` (`vector_types`
  — a flat array or a per-`kb_type` map defaulting to
  `['semantic','structure']` — and `embedding_fields.structure`), builds
  one text per vector type via `CONTENT_BUILDERS`, calls the OpenAI
  embeddings API (`text-embedding-3-small`), and upserts
  `public.embeddings` rows keyed by fixed `chunk_index` slots
  (`VECTOR_TYPE_SLOTS`: semantic 0, structure 1, context 2, …) so the
  `(model_id, document_id, chunk_index)` unique constraint never
  collides across vector types.
- `generate` deletes stale rows left over from a previously larger
  vector-type set, and skips re-embedding rows whose `content_hash`
  matches (16-char SHA-256 prefix).
- `generate` sets `approved_at` only when the item's `status` is
  `'published'`; `metadata` carries `vector_type`, `item_type`,
  `kb_type`, `security_level`, `source_item_id`.
- A `'summary'` vector type is generated via `callOpenAIChat`
  (`LLM_DEFAULT_MODEL` or `gpt-4o-mini`) with a sync title+description
  fallback.
- `revoke` sets `revoked_at` on all non-revoked rows for the document;
  `approve` sets `approved_at` and clears `revoked_at` — both via
  `adminDb` regardless of caller role.
- `emitLog` writes `embedding.created`, `embedding.updated`,
  `embeddings.generated`, `embeddings.batch_created`,
  `embeddings.document_deleted`, `embeddings.cleaned`,
  `embeddings.revoked`, `embeddings.approved` to `public.logs`.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Missing fields | 500 | `model_id, document_id, and content are required` / `item_id is required` / `document_id is required` / `embeddings_data array is required` |
| Item missing (generate) | 500 | `Item <id> not found` |
| Embedding API failure | 500 | `Embedding API call failed: <message>` |
| Missing search inputs | 500 | `query_embedding is required for similarity search` / `query is required for semantic search` |
| Bad action/method | 500 | `Invalid action or method` |

## Agent notes

- Vectors are stored as the pgvector string literal `[v1,v2,…]`
  produced by `callEmbeddingApi` — the `embedding` column is
  `vector(1536)` (`.framework/migrations/001_core_schema.sql`).
- `metadata.vector_type` is the discriminator retrieval filters use;
  `chunk_index` is a slot convention, not a sequence of text chunks.
- `generate`'s `account_id_override` plus unconditional `adminDb` means
  any authenticated caller can regenerate embeddings into another
  account — and `revoke`/`approve`/`cleanup`/`deleteByDocument` are
  equally ungated. Do not expose this endpoint to untrusted principals.
- Retrieval-time search is `match_embeddings` (vector) or `textSearch`
  (keyword) — semantic ranking lives in the RPC, not here.
