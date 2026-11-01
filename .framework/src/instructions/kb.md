---
title: Knowledge Base
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/pages/admin/kb/KBAdminPage.tsx
  - .framework/src/components/kb/KBArticleList.tsx
  - .framework/src/components/kb/KBArticleEditor.tsx
  - .framework/src/pages/admin/EmbeddingsPage.tsx
  - .framework/src/pages/admin/EmbeddingDetailPage.tsx
  - .framework/functions/kb.ts
  - .framework/functions/embeddings.ts
  - .framework/functions/admin-data.ts
---

## What this is for

The **KB** section (`/spine-framework/admin/kb/*`) covers three surfaces that share this doc:

- `kb/:typeSlug` — the article admin list/editor (`KBAdminPage`) for the KB item types `kb-spine-admin`, `kb-spine-internal`, `kb-spine-public`, `kb-account`. Articles are `items` records created/edited via `admin-data` and published via `kb`.
- `kb/embeddings` — the embedding record browser (`EmbeddingsPage`): every generated embedding row with its approval state.
- `kb/embeddings/:id` — single embedding detail (`EmbeddingDetailPage`): content, vector type, chunk index, model, approval/revocation timestamps, optional raw vector.

## Fields and settings

**Articles** (`KBArticleList` / `KBArticleEditor`)

- **Type slug tabs** — the four KB type slugs above; articles are `items` records of that type.
- **List** — title, status, created date; search hits `/api/kb?action=search` (sources `['kb']`).
- **Editor** — schema-driven form from the type's `design_schema` (main fields + metadata sidebar); Save writes `admin-data` create/update; **Publish** additionally calls `/api/kb?action=publish`; Delete uses `admin-data` remove.
- **Modes** — `view` (read-only), `edit`, `new` via route (`:id`, `:id/edit`, `new`).

**Embeddings** (`EmbeddingsPage` / `EmbeddingDetailPage`)

- **List** — content/document/model search + sortable columns; status badge: `Revoked` (revoked_at set) > `Approved` (approved_at set) > `Pending`.
- **Detail** — document_id, vector_type, chunk_index, model_id, token count, content preview, approved/revoked timestamps, and a show-vector toggle for the raw embedding.

**Downstream effects**

- Articles are plain `items` records — they inherit the type's `record_permissions` and `validation_schema`; `kb?action=publish` handles the publishing step (ingest/indexing) on top.
- Embeddings are generated per type `design_schema.vector_types` (default `['semantic','structure']`) and feed `match_embeddings`/semantic search used by agents and `search_knowledge` pipeline stages.
- `embeddings` actions: list/get/create/update + `generate`, `revoke`, `approve`, `stats`, `batch-create`, `delete-document`, `cleanup`, `search-similar`, `search-semantic`. `revoke` stamps `revoked_at` (excluded from search); `approve` stamps `approved_at` and clears revocation.

## Minimal configuration

Pick a KB type slug tab → New → fill the schema form → Save → Publish. The article is now searchable via `kb?action=search`.

## Full configuration

```jsonc
// article write — POST /api/admin-data?entity=items
{ "type_id": "kb-account", "title": "Refund policy", "data": { "body": "..." } }
// publish — POST /api/kb?action=publish { "id": "<article uuid>" }
// regenerate vectors — POST /api/embeddings?action=generate { "item_id": "<article uuid>" }
// curate — POST /api/embeddings?action=approve|revoke { "id": "<embedding uuid>" }
```

## Example

A support team writes refund-policy articles under `kb-account`, publishes them, then checks `kb/embeddings` — the new chunks show `Pending` until reviewed; approving the good ones and revoking a stale `semantic` chunk changes what `search_knowledge` returns to the reply-drafting agent.

## Core files

- `.framework/src/pages/admin/kb/KBAdminPage.tsx` — article page shell (list vs editor by mode)
- `.framework/src/components/kb/KBArticleList.tsx` / `KBArticleEditor.tsx` — list + schema-driven editor, publish call
- `.framework/src/pages/admin/EmbeddingsPage.tsx` / `EmbeddingDetailPage.tsx` — embedding browser/detail
- `.framework/functions/kb.ts` — `search`, `publish`, and KB pipeline actions
- `.framework/functions/embeddings.ts` — embedding CRUD + generate/approve/revoke/search
- `.framework/functions/admin-data.ts` — the underlying record CRUD
- Tables: `public.items` (articles), `public.embeddings` (vectors)

## Agent notes

- `instructionKeyFor` maps every `kb/*` route to this doc — there is no separate `embeddings` page key.
- Articles are records, not files — edit them through this UI or `admin-data`, never direct table writes that skip validation/triggers.
- `Pending` embeddings still count toward `stats`; only `revoked_at` removes a vector from similarity search.
- Deleting an article does not cascade to its embedding rows — use `embeddings?action=delete-document` to clean up vectors for a removed document.
- Re-publish after large edits: publishing re-ingests; stale chunks otherwise linger until `generate`/`cleanup` runs.
