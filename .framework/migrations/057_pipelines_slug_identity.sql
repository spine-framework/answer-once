-- 057_pipelines_slug_identity.sql
-- CIL[BEGIN stable_id="~/.framework/migrations/057_pipelines_slug_identity.sql:pipelines_slug_identity:file" type="file" identity="pipelines_slug_identity" parent="~/.framework/migrations"]
-- CIL[DOC-MACRO purpose="Add the baseline UNIQUE(app_id, slug) identity to pipelines on archive-era databases"]
-- CIL[DOC-RESPONSIBILITY responsibility="Create pipelines_app_slug_key unique index so manifest seed upserts with conflict 'app_id,slug' resolve"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/migrations/001_core_schema.sql,.framework/migrations/056_slug_column_reconciliation.sql"]
-- CIL[DOC-CONTRACT inputs="pipelines table with app_id + slug columns (both already present)" outputs="unique index exists" errors="fails if duplicate (app_id,slug) pairs exist (verified none: 5 rows, 5 unique)" side_effects="none — index only"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[END stable_id="~/.framework/migrations/057_pipelines_slug_identity.sql:pipelines_slug_identity:file"]
-- Archive-era databases lack the baseline UNIQUE(app_id, slug) identity on
-- pipelines, so manifest seed upserts with conflict "app_id,slug" fail with
-- "no unique or exclusion constraint matching the ON CONFLICT specification".
-- Idempotent — no-op where the constraint already exists.

CREATE UNIQUE INDEX IF NOT EXISTS pipelines_app_slug_key ON public.pipelines(app_id, slug);
