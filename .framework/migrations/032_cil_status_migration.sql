-- CIL[BEGIN stable_id="~/.framework/migrations/032_cil_status_migration.sql:cil_status_migration:file" type="file" identity="cil_status_migration" parent="~/.framework/migrations/032_cil_status_migration.sql"]
-- CIL[DOC-MACRO purpose="One-time SQL migration: collapse legacy CIL file_statuses into the canonical 0-8 model."]
-- CIL[DOC-RESPONSIBILITY responsibility="Remap legacy status aliases in items.data->file_statuses to canonical statuses."]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/migrations/032_cil_status_migration.sql"]
-- CIL[DOC-CONTRACT inputs="items table rows with kb_type='cil_project' and active file_statuses JSONB" outputs="Updated items.data.file_statuses with canonical 0-8 statuses" errors="May leave unmapped statuses as 0-discovered; only affects active CIL project rows" side_effects="Updates items.data and sets updated_at to now()"]
-- CIL[DOC-MICRO logic_summary="Builds a CTE mapping each file_statuses key to canonical status, then updates items rows in place." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- 032_cil_status_migration.sql
-- One-time migration: collapse legacy CIL file_statuses into the canonical 0–8 model.
-- This removes the need for the code to carry legacy status aliases.

WITH mapped_statuses AS (
  SELECT
    i.id,
    jsonb_object_agg(
      kv.key,
      CASE kv.value
        WHEN '0-discovered'     THEN '0-discovered'
        WHEN '1-selected'       THEN '1-selected'
        WHEN '2-chunked'        THEN '2-chunked'
        WHEN '3-documented'     THEN '3-documented'
        WHEN '4-chunk-validated' THEN '4-chunk-validated'
        WHEN '5-doc-validated'  THEN '5-doc-validated'
        WHEN '6-enriched'       THEN '6-enriched'
        WHEN '7-embedded-mapped' THEN '7-embedded-mapped'
        WHEN '8-published'      THEN '8-published'
        -- Legacy aliases
        WHEN '2-discovered'     THEN '0-discovered'
        WHEN '3-selected'       THEN '1-selected'
        WHEN '4-chunked'        THEN '2-chunked'
        WHEN '5-documented'     THEN '3-documented'
        WHEN '4-embedded'       THEN '7-embedded-mapped'
        WHEN '5-mapped'         THEN '7-embedded-mapped'
        WHEN '6-embedded'       THEN '7-embedded-mapped'
        WHEN '7-mapped'         THEN '7-embedded-mapped'
        WHEN '7-embedded'       THEN '7-embedded-mapped'
        WHEN '7-embedded-2'     THEN '7-embedded-mapped'
        WHEN '7.5-selected'     THEN '1-selected'
        WHEN '8-mapped'         THEN '7-embedded-mapped'
        WHEN '8-mapped-2'       THEN '7-embedded-mapped'
        WHEN '8-enriched'       THEN '6-enriched'
        WHEN '9-embedded'       THEN '7-embedded-mapped'
        WHEN '10-mapped'        THEN '7-embedded-mapped'
        -- Anything else (e.g. stale timestamps or _updated entries) becomes discovered
        ELSE '0-discovered'
      END
    ) AS new_file_statuses
  FROM items i
  JOIN jsonb_each_text(i.data -> 'file_statuses') kv
    ON kv.key NOT LIKE '%\\_updated'
  WHERE i.data ->> 'kb_type' = 'cil_project'
    AND i.is_active = true
  GROUP BY i.id
)
UPDATE items
SET data = jsonb_set(
        items.data,
        '{file_statuses}',
        mapped_statuses.new_file_statuses,
        true
      ),
    updated_at = now()
FROM mapped_statuses
WHERE items.id = mapped_statuses.id;
-- CIL[DOC-VECTOR type="context" content="purpose='One-time SQL migration: collapse legacy CIL file_statuses into the canonical 0-8 model.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/032_cil_status_migration.sql:cil_status_migration:file"]
