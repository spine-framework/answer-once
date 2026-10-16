-- CIL[BEGIN stable_id="~/.framework/migrations/009_roles_slug_unique.sql:roles_slug_unique:file" type="file" identity="roles_slug_unique" parent="~/.framework/migrations/009_roles_slug_unique.sql"]
-- CIL[DOC-MACRO purpose="Ensure the public.roles slug column has a unique index, dropping any prior app_id+slug constraints."]
-- CIL[DOC-RESPONSIBILITY responsibility="Apply a one-time, idempotent schema change to enforce slug uniqueness across roles."]
-- CIL[DOC-CONTEXT module="roles" layer="migrations" related_files=".framework/migrations/009_roles_slug_unique.sql"]
-- CIL[DOC-CONTRACT inputs="public.roles table with slug column" outputs="Unique index roles_slug_key on public.roles(slug)" errors="Constraint-violation if duplicate slugs exist" side_effects="Drops roles_app_id_slug_key constraint and index if present"]
-- CIL[DOC-MICRO logic_summary="Drops the old constraint and index, then creates a unique index on slug" notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Idempotent: safe for fresh (001 already has this) and existing DBs.
-- If duplicates exist, the DBA must dedupe before running; this migration
-- will fail with a clear constraint-violation error until they do.

ALTER TABLE public.roles
  DROP CONSTRAINT IF EXISTS roles_app_id_slug_key;

DROP INDEX IF EXISTS roles_app_id_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS roles_slug_key
  ON public.roles (slug);
-- CIL[DOC-VECTOR type="context" content="purpose='Ensure the public.roles slug column has a unique index, dropping any prior app_id+slug constraints.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/009_roles_slug_unique.sql:roles_slug_unique:file"]
