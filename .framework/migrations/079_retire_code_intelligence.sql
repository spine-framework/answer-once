-- 079_retire_code_intelligence.sql
-- Retires the legacy Supabase-backed Code Intelligence Layer.
-- Non-destructive by design: types/link types are deactivated, embeddings are
-- soft-revoked, CIL tool slugs are stripped or renamed in agent configs, and
-- CIL metadata keys are removed. No rows or tables are dropped.
-- Idempotent — every statement is safe to re-run.

-- 1. Deactivate the cil_* item types (seeded by 016_cil_types.sql).
UPDATE public.types
SET is_active = false, updated_at = now()
WHERE slug IN (
  'cil_project', 'cil_file', 'cil_chunk', 'cil_chunk_proposal',
  'cil_config', 'cil_learning_proposal', 'cil_version', 'cil_suggestion'
) AND is_active IS DISTINCT FROM false;

-- 2. Deactivate the cil_* link types (seeded by 016_cil_types.sql).
UPDATE public.link_types
SET is_active = false, updated_at = now()
WHERE slug IN (
  'cil_calls', 'cil_imports', 'cil_parent_child', 'cil_configures',
  'cil_tests', 'cil_kb_reference', 'cil_suggestion_target',
  -- Found on spine-dev post-review: era-seeded link types absent from current
  -- seeds, so F1/F2 fixtures never created them. Explicitly retired here.
  'cil_exports', 'cil_tested_by' -- ref-optional: era-seeded rows — absent on databases built after that seed era
) AND is_active IS DISTINCT FROM false;

-- 3. Soft-revoke embeddings belonging to cil_chunk items — they index the
-- retired marker corpus. Revoked rows stay recoverable in place.
UPDATE public.embeddings e
SET revoked_at = now(), updated_at = now()
WHERE e.revoked_at IS NULL
  AND e.document_id IN (
    SELECT i.id::text
    FROM public.items i
    JOIN public.types t ON t.id = i.type_id
    WHERE t.slug = 'cil_chunk'
  );

-- 4. Rewrite prompt_configs.available_tools: rename the surviving tool
--    cil_fetch_document -> fetch_document and drop every other cil_* slug.
UPDATE public.prompt_configs pc
SET available_tools = sub.tools, updated_at = now()
FROM (
  SELECT pc2.id,
         COALESCE(
           jsonb_agg(DISTINCT v.name ORDER BY v.name)
             FILTER (WHERE v.name IS NOT NULL),
           '[]'::jsonb
         ) AS tools
  FROM public.prompt_configs pc2
  LEFT JOIN LATERAL (
    SELECT CASE
             WHEN e.value = 'cil_fetch_document' THEN 'fetch_document'
             WHEN e.value LIKE 'cil\_%' ESCAPE '\' THEN NULL
             ELSE e.value
           END AS name
    FROM jsonb_array_elements_text(pc2.available_tools) e
  ) v ON true
  WHERE pc2.available_tools::text LIKE '%cil%'
  GROUP BY pc2.id
) sub
WHERE pc.id = sub.id;

-- 5. Strip CIL metadata from prompt configs: the deny_cil kill switch inside
--    retrieval_policy, and the cil_config augmentation block.
UPDATE public.prompt_configs
SET metadata = (
      COALESCE(metadata, '{}'::jsonb) - 'cil_config'
    ) || CASE
      WHEN COALESCE(metadata, '{}'::jsonb) ? 'retrieval_policy'
        THEN jsonb_build_object('retrieval_policy',
               COALESCE(metadata->'retrieval_policy', '{}'::jsonb) - 'deny_cil')
      ELSE '{}'::jsonb
    END,
    updated_at = now()
WHERE metadata ? 'cil_config'
   OR COALESCE(metadata->'retrieval_policy', '{}'::jsonb) ? 'deny_cil';

-- 6. Strip thread-record CIL augmentation (data.cil_config carried
--    project_ids/use_cil_tools for the retired retrieval path).
UPDATE public.threads
SET data = data - 'cil_config', updated_at = now()
WHERE data ? 'cil_config';
