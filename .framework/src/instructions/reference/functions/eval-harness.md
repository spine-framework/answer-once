---
title: eval-harness
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/eval-harness.ts
  - .framework/functions/_shared/llm.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/resolve-ids.ts
  - .framework/functions/admin-data.ts
  - .framework/migrations/034_match_embeddings_knn.sql
  - public/_redirects
---

# eval-harness

## What it does

`eval-harness` (`.framework/functions/eval-harness.ts`) is an internal
retrieval-quality harness. It stores test cases as `eval_test_case` `items`
rows, replays each question against the `embeddings` corpus via the
`match_embeddings` RPC, scores the retrieval, and records the run as a
`pipeline_executions` row so results show up in the executions UI.

This is a dev/QA tool, not a production path — nothing else calls it.

Actions (dispatched on `?action=`):

| Action | Method | Purpose |
|---|---|---|
| `create_test_case` | POST | Insert an `eval_test_case` item via admin-data. |
| `list_test_cases` | GET | List active cases (default action for any GET). |
| `run_eval` | POST | Score all (or one `test_type` of) active cases. |
| `get_results` | GET | Recent eval runs (`pipeline_executions` rows). |
| `get_coverage` | GET | Case count per `test_type`, with gaps listed. |

`test_type` values: `easy`, `medium`, `hard`, `security`, `hallucination`,
`stale`, `account_gating`.

## Route and methods

- `/api/eval-harness?action=<action>` — `public/_redirects` maps `/api/*` to
  `/.netlify/functions/:splat`. The method guard is `ctx.query.method`
  (populated from the HTTP method): creates/runs are POST, reads are GET.
- GET with no `action` (or an unrecognized action on GET) falls through to
  `list_test_cases`; anything else throws `Invalid action or method`.

## Authentication

`createHandler` resolves a principal and rejects anonymous requests with 401.
`run_eval` and `get_results` additionally require `ctx.accountId`
(`Account context required`). There is **no system-admin gate** — any
authenticated principal can create cases and run evals, which is part of why
this page treats the surface as internal-facing.

## Request contract

`create_test_case` (POST):

| Field | Default | Notes |
|---|---|---|
| `question` | — | Required; also becomes the item `title` (120 chars). |
| `expected_tier` | `'medium'` | `high` / `medium` / `low`. |
| `expected_escalate` | `false` | Stored, not currently scored. |
| `expected_source_ids` | `[]` | Document ids retrieval should hit. |
| `excluded_source_ids` | `[]` | Document ids retrieval must not hit (boundary). |
| `test_type` | `'medium'` | One of the categories above. |

`list_test_cases` (GET): query params `test_type`, `limit` (200), `offset`.

`run_eval` (POST): `{ test_type?, similarity_threshold = 0.15,
match_count = 8 }`.

`get_results` (GET): query param `limit` (5).

`get_coverage` (GET): no inputs.

## Response contract

- `create_test_case` → the created `items` record (admin-data `create`
  result).
- `run_eval` →
  `{ run_id, summary, results }` where `summary` is `{ total, passed,
  failed, skipped, pass_rate, run_at, account_id }` and each result is
  `{ id, question, test_type, status, retrieval_recall, boundary_safe,
  boundary_violations, tier_correct, inferred_tier, expected_tier,
  mean_similarity, retrieved_count }`. With no cases it returns
  `{ run_id: null, message: 'No test cases found', total: 0 }`.
- `get_results` → recent `pipeline_executions` rows (`id`, `status`,
  `result`, `started_at`, `completed_at`, `trigger_data`) filtered to
  `trigger_data->>eval_run = 'true'`.
- `get_coverage` → `{ total_cases, coverage: [{ test_type, case_count,
  has_cases }], recommendation: [<test_types with no cases>] }`.

Scoring per case: **boundary safe** means no `excluded_source_ids` appear in
the retrieved set; **retrieval recall** is the fraction of
`expected_source_ids` retrieved (`null` when none declared); **inferred
tier** maps mean match similarity to `high` ≥ 0.85, `medium` ≥ 0.60, else
`low`. A case passes when boundary-safe AND (recall is null OR ≥ 0.5) AND
inferred tier equals expected tier. Cases with `data.needs_source_review`
are skipped — they're diagnostic captures awaiting human promotion to
golden cases. Embed-API errors skip the case (`skipped`, reason
`embed_api_error`), as does any per-case exception.

## Side effects

- `create_test_case` inserts an `items` row through admin-data — type
  `eval_test_case`, `status: 'active'` — so validation, audit, and triggers
  run.
- `run_eval` calls `callOpenAIEmbeddings` (`text-embedding-3-small`) once per
  case — that routes through `integration-outbound` with the `openai`
  integration — then `match_embeddings` with `filter_vector_type:
  'semantic'` over the caller's account plus the `spine-system` platform
  account.
- `run_eval` inserts a `pipeline_executions` row with the sentinel
  `pipeline_id` `00000000-0000-0000-0000-000000000000`,
  `trigger_data.eval_run: true`, `status: 'completed'` when zero failures
  else `'failed'`, and the full `{ summary, results }` in `result` — then
  emits an `eval.run_completed` audit event.

## Errors

| Condition | Error |
|---|---|
| Missing question | `question is required` |
| Type not installed | `eval_test_case type not found — run app install first` |
| No account context | `Account context required` |
| Bad dispatch | `Invalid action or method` |

## Agent notes

- **Internal-facing.** This is a QA harness shipped with the framework, not
  a product surface: no admin gate, results land in `pipeline_executions`
  rather than a dedicated table, and `run_eval` synchronously embeds up to
  500 questions in one request — slow and costly on large suites. Run it in
  dev/staging or behind your own gate.
- `expected_escalate` is stored but never read by scoring — only
  recall/boundary/tier count.
- Recall uses `document_id` equality against `expected_source_ids` — fill
  those with `embeddings.document_id` values (items UUIDs for knowledge
  records), not item titles.
- Eval runs share the `spine-system` platform corpus with search — account
  isolation is tested by `account_gating` cases whose
  `excluded_source_ids` cover other tenants' documents.
- The `eval_test_case` item type must be installed for creation to work;
  `resolveTypeId` failure throws the "run app install first" error rather
  than skipping.
