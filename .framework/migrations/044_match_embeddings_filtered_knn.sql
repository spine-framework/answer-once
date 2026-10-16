-- CIL[BEGIN stable_id="~/.framework/migrations/044_match_embeddings_filtered_knn.sql:match_embeddings_filtered_knn:file" type="file" identity="match_embeddings_filtered_knn" parent="~/.framework/migrations/044_match_embeddings_filtered_knn.sql"]
-- CIL[DOC-MACRO purpose="Fix match_embeddings crowding-out for small tenants by routing selective searches to an exact filtered scan"]
-- CIL[DOC-RESPONSIBILITY responsibility="Replace the match_embeddings RPC so account-filtered semantic search returns correct results even when the candidate set is a tiny fraction of the embeddings table"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/034_match_embeddings_knn.sql,.framework/functions/_shared/agent-runner.ts,.framework/functions/_shared/kb.ts"]
-- CIL[DOC-CONTRACT inputs="existing public.match_embeddings function and embeddings table" outputs="replaced function with same signature and result shape" errors="requires pgvector >= 0.8 for hnsw.iterative_scan" side_effects="adds one indexed candidate-count query per non-document-targeted search"]
-- CIL[DOC-MICRO logic_summary="The 034 oversample takes the global top-100 KNN rows and then applies account/type filters; in a table dominated by CIL chunks a small account's rows never reach the candidate window, so selective searches return empty. Now: count rows matching the selective filters via embeddings_active_idx; when the candidate set is <= 5000 run an exact filter-first scan (bounded and correct); otherwise keep the global oversample (dense candidate sets always fill the top-N window)" notable_decisions="candidate_count threshold 5000 keeps the KNN fast path for the ~19k-row platform corpus while restoring correctness for small tenants; document-targeted branch unchanged"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="experimental"]
-- CIL[DOC-LEARNING topic="filtered_knn" content="KNN-first oversampling is only safe when the filtered candidate set is dense enough to occupy the oversample window; a 10-embedding account in a 19k-row table returns zero rows because the top-100 global neighbours contain no account rows. Exact filter-first scan is cheap precisely when crowding-out is a risk, so route by candidate count"]
-- CIL[DOC-VECTOR type="context" content="purpose='Fix match_embeddings crowding-out for small tenants by routing selective searches to an exact filtered scan'; callers: agent-runner retrieveKnowledge, kb.ts search, cil-embeddings, embeddings.ts, eval-harness, custom_kb-embeddings"]
-- CIL[DOC-VECTOR type="blast_radius" content="Same signature and result shape as 034; all match_embeddings callers get correct selective-filter results; small-account searches change from empty to populated"]
-- CIL[DOC-VECTOR type="configuration" content="Requires pgvector 0.8+; function statement_timeout stays 25s; candidate-count query uses embeddings_active_idx (account_id, document_id WHERE approved_and_not_revoked)"]
-- CIL[DOC-VECTOR type="constraint" content="Result shape and parameter signature unchanged; filter_document_ids branch unchanged; CANDIDATE_SCAN_LIMIT (5000) bounds the exact-scan path"]

-- match_embeddings (034) oversamples the global KNN index (top 100+) and then
-- applies account/vector_type/item_type filters. When the table is dominated
-- by platform/CIL rows, a small tenant's embeddings never enter the
-- oversample window — the account filter sees an empty candidate set and the
-- search returns zero rows even for perfect matches.
--
-- The original filter-first form was removed in 034 because the planner
-- mis-estimates large accounts and picks a btree scan + heapsort. Keep that
-- fast path for dense candidate sets, but count candidates first (indexed by
-- embeddings_active_idx): when the set is small, an exact filtered scan is
-- both correct and cheap, so crowding-out cannot silently empty results.

CREATE OR REPLACE FUNCTION public.match_embeddings(
  query_embedding      vector(1536),
  match_count          int            DEFAULT 10,
  filter_account_ids   uuid[]         DEFAULT NULL,
  filter_vector_type   text           DEFAULT NULL,
  similarity_threshold float          DEFAULT 0.15,
  filter_item_types    text[]         DEFAULT NULL,
  filter_document_ids  text[]         DEFAULT NULL
)
RETURNS TABLE (
  id              uuid,
  document_id     text,
  content         text,
  metadata        jsonb,
  account_id      uuid,
  similarity      float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '25s'
AS $$
DECLARE
  candidate_count bigint;
BEGIN
  -- Document-targeted lookups stay filter-first: a global KNN oversample
  -- would crowd out the requested documents before they can be scored.
  IF filter_document_ids IS NOT NULL THEN
    RETURN QUERY
    SELECT
      e.id,
      e.document_id,
      e.content,
      e.metadata,
      e.account_id,
      1 - (e.embedding <=> query_embedding) AS similarity
    FROM public.embeddings e
    WHERE
      (filter_account_ids IS NULL OR e.account_id = ANY(filter_account_ids))
      AND (filter_vector_type IS NULL OR e.metadata->>'vector_type' = filter_vector_type)
      AND (filter_item_types IS NULL OR e.metadata->>'item_type' = ANY(filter_item_types))
      AND e.document_id = ANY(filter_document_ids)
      AND e.approved_at IS NOT NULL
      AND e.revoked_at IS NULL
      AND (1 - (e.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
    RETURN;
  END IF;

  PERFORM set_config('hnsw.iterative_scan', 'strict_order', true);

  -- Route by candidate density: a small filtered set would be crowded out of
  -- the global oversample, but is cheap to scan exactly via the account index.
  SELECT count(*) INTO candidate_count
  FROM public.embeddings e
  WHERE
    (filter_account_ids IS NULL OR e.account_id = ANY(filter_account_ids))
    AND (filter_vector_type IS NULL OR e.metadata->>'vector_type' = filter_vector_type)
    AND (filter_item_types IS NULL OR e.metadata->>'item_type' = ANY(filter_item_types))
    AND e.approved_at IS NOT NULL
    AND e.revoked_at IS NULL;

  IF candidate_count <= 5000 THEN
    RETURN QUERY
    SELECT
      e.id,
      e.document_id,
      e.content,
      e.metadata,
      e.account_id,
      1 - (e.embedding <=> query_embedding) AS similarity
    FROM public.embeddings e
    WHERE
      (filter_account_ids IS NULL OR e.account_id = ANY(filter_account_ids))
      AND (filter_vector_type IS NULL OR e.metadata->>'vector_type' = filter_vector_type)
      AND (filter_item_types IS NULL OR e.metadata->>'item_type' = ANY(filter_item_types))
      AND e.approved_at IS NOT NULL
      AND e.revoked_at IS NULL
      AND (1 - (e.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
    RETURN;
  END IF;

  -- Dense candidate set: the global KNN oversample is safe — the top-100
  -- window will contain enough matching rows for the post-filters.
  RETURN QUERY
  SELECT
    t.id,
    t.document_id,
    t.content,
    t.metadata,
    t.account_id,
    t.similarity
  FROM (
    SELECT
      e.id,
      e.document_id,
      e.content,
      e.metadata,
      e.account_id,
      e.approved_at,
      e.revoked_at,
      1 - (e.embedding <=> query_embedding) AS similarity
    FROM public.embeddings e
    ORDER BY e.embedding <=> query_embedding
    LIMIT GREATEST(match_count * 10, 100)
  ) t
  WHERE
    (filter_account_ids IS NULL OR t.account_id = ANY(filter_account_ids))
    AND (filter_vector_type IS NULL OR t.metadata->>'vector_type' = filter_vector_type)
    AND (filter_item_types IS NULL OR t.metadata->>'item_type' = ANY(filter_item_types))
    AND t.approved_at IS NOT NULL
    AND t.revoked_at IS NULL
    AND t.similarity >= similarity_threshold
  ORDER BY t.similarity DESC
  LIMIT match_count;
END
$$;

GRANT EXECUTE ON FUNCTION public.match_embeddings(
  vector(1536), int, uuid[], text, float, text[], text[]
) TO authenticated, service_role;
-- CIL[END stable_id="~/.framework/migrations/044_match_embeddings_filtered_knn.sql:match_embeddings_filtered_knn:file"]
