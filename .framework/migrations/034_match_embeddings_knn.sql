-- CIL[BEGIN stable_id="~/.framework/migrations/034_match_embeddings_knn.sql:match_embeddings_knn:file" type="file" identity="match_embeddings_knn" parent="~/.framework/migrations/034_match_embeddings_knn.sql"]
-- CIL[DOC-MACRO purpose="Rework match_embeddings to use KNN-first oversampling and a higher statement timeout"]
-- CIL[DOC-RESPONSIBILITY responsibility="Replace the match_embeddings RPC so filtered semantic search uses the HNSW index instead of a filtered btree scan + heapsort"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/005_core_observability.sql,.framework/functions/_shared/agent-runner.ts"]
-- CIL[DOC-CONTRACT inputs="existing public.match_embeddings function and embeddings table" outputs="replaced function with same signature and result shape" errors="requires pgvector >= 0.8 for hnsw.iterative_scan" side_effects="drops the superseded 5-arg overload; raises the function statement_timeout to 25s"]
-- CIL[DOC-MICRO logic_summary="When filter_document_ids is set, keep the filter-first query (document-targeted lookup). Otherwise oversample the HNSW KNN index (match_count*10, min 100) with hnsw.iterative_scan=strict_order, then apply account/vector_type/item_type/similarity filters outside the subquery" notable_decisions="Filters moved outside the ORDER BY subquery because the planner mis-estimates account_id selectivity (rows=23 vs ~3k actual) and picks embeddings_active_idx, scanning+sorting every matching row and intermittently exceeding the 8s PostgREST statement_timeout"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[DOC-LEARNING topic="filtered_knn" content="On Postgres + pgvector, putting a selective filter (account_id) in the same query as ORDER BY embedding <=> q lets the planner pick a btree + heapsort over the HNSW index; isolate the KNN ORDER BY/LIMIT in a subquery it cannot flatten, then post-filter. hnsw.iterative_scan=strict_order (pgvector 0.8) is required or the scan stops at ef_search (40) rows"]
-- CIL[DOC-VECTOR type="context" content="purpose='Rework match_embeddings to use KNN-first oversampling and a higher statement timeout'; no verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Affects all callers of the match_embeddings RPC: agent-runner retrieveKnowledge, kb.ts, cil-embeddings, embeddings.ts, eval-harness, custom_kb-embeddings"]
-- CIL[DOC-VECTOR type="configuration" content="Requires pgvector 0.8+; function statement_timeout set to 25s (under the 30s lambda cap)"]
-- CIL[DOC-VECTOR type="constraint" content="Result shape and parameter signature unchanged; empty filter_document_ids array returns no rows as before"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

-- match_embeddings was intermittently exceeding the 8s statement_timeout on
-- PostgREST roles: the planner mis-estimates the account_id filter
-- (rows=23 vs ~3k actual) and picks embeddings_active_idx, scanning and
-- sorting every matching row. Restructure so the KNN scan runs through the
-- HNSW index first (oversampled), with filters applied to the candidates.

DROP FUNCTION IF EXISTS public.match_embeddings(vector, integer, uuid[], text, double precision);
DROP FUNCTION IF EXISTS public.match_embeddings(vector, integer, uuid[], text, real);

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

  -- KNN-first: oversample the HNSW index, then apply filters. Keeping the
  -- filters out of the ORDER BY subquery stops the planner choosing the
  -- account btree; strict_order lets the scan iterate past ef_search.
  PERFORM set_config('hnsw.iterative_scan', 'strict_order', true);
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
-- CIL[END stable_id="~/.framework/migrations/034_match_embeddings_knn.sql:match_embeddings_knn:file"]
