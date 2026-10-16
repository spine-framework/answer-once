-- 056_slug_column_reconciliation.sql
-- CIL[BEGIN stable_id="~/.framework/migrations/056_slug_column_reconciliation.sql:slug_column_reconciliation:file" type="file" identity="slug_column_reconciliation" parent="~/.framework/migrations"]
-- CIL[DOC-MACRO purpose="Add baseline slug identity columns to archive-era config tables so manifest seed upserts resolve"]
-- CIL[DOC-RESPONSIBILITY responsibility="Add slug to triggers/timers/test_runs/ai_agents/item_progress, add missing app_id to test_runs, backfill slug from name, and create UNIQUE(app_id, slug) indexes"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/migrations/001_core_schema.sql,.framework/cli/commands/install-app.ts"]
-- CIL[DOC-CONTRACT inputs="archive-era table shapes" outputs="slug columns present, backfilled, uniquely indexed per app" errors="unique-index creation fails if name-derived slugs collide per app (checked: 17 triggers + 13 agents produce no collisions)" side_effects="Existing rows gain deterministic slug = lower(name) with non-alphanumerics folded to underscores — matches demo seed slugs so upserts update in place instead of duplicating"]
-- CIL[DOC-MICRO logic_summary="Demo ai_agents seeds upsert on slug; live rows existed name-only from pre-E1 seeding — regex backfill makes 'Demo Triage Agent' → 'demo_triage_agent' exactly matching the seed. slug left nullable (unlike baseline NOT NULL) to avoid breaking legacy inserts that omit it; uniqueness enforced by index" notable_decisions="test_runs also lacked app_id — added nullable since the identity index requires it"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[END stable_id="~/.framework/migrations/056_slug_column_reconciliation.sql:slug_column_reconciliation:file"]
-- Adds the consolidated-baseline `slug` identity column to config tables that
-- predate it on archive-era databases, backfills existing rows from `name`,
-- and adds the baseline UNIQUE(app_id, slug) index so seed upserts resolve.
-- All statements are additive and idempotent — no-op on fresh installs where
-- 001_core_schema.sql already created the columns.

ALTER TABLE public.triggers      ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.timers        ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.test_runs     ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.ai_agents     ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.item_progress ADD COLUMN IF NOT EXISTS slug text;

-- Archive-era test_runs also predates app_id, which the (app_id, slug)
-- identity index requires.
ALTER TABLE public.test_runs     ADD COLUMN IF NOT EXISTS app_id uuid;

UPDATE public.triggers
SET slug = regexp_replace(lower(name), '[^a-z0-9]+', '_', 'g')
WHERE slug IS NULL;

UPDATE public.ai_agents
SET slug = regexp_replace(lower(name), '[^a-z0-9]+', '_', 'g')
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS triggers_app_slug_key      ON public.triggers(app_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS timers_app_slug_key        ON public.timers(app_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS test_runs_app_slug_key     ON public.test_runs(app_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS ai_agents_app_slug_key     ON public.ai_agents(app_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS item_progress_app_slug_key ON public.item_progress(app_id, slug);
