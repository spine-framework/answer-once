-- CIL[BEGIN stable_id="~/.framework/migrations/015_types_kind_slug_unique.sql:types_kind_slug_unique:file" type="file" identity="types_kind_slug_unique" parent="~/.framework/migrations/015_types_kind_slug_unique.sql"]
-- CIL[DOC-MACRO purpose="Enforce global uniqueness of type slugs across all apps"]
-- CIL[DOC-RESPONSIBILITY responsibility="Ensure deterministic resolveTypeId and resolveTypeRecord single lookups for shared kind/slug values"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/migrations/015_types_kind_slug_unique.sql"]
-- CIL[DOC-CONTRACT inputs="public.types table with kind and slug columns" outputs="types_kind_slug_unique unique index on public.types(kind, slug)" errors="Duplicate (kind, slug) values cause uniqueness violation" side_effects="Creates a database index that enforces uniqueness on public.types writes"]
-- CIL[DOC-MICRO logic_summary="Create a unique composite index IF NOT EXISTS on public.types(kind, slug)" notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Enforce global uniqueness of type slugs across all apps.
-- This lets multiple apps share the same kind/slug (e.g. funnel_signal, support_ticket)
-- and makes resolveTypeId/resolveTypeRecord .single() lookups deterministic.
CREATE UNIQUE INDEX IF NOT EXISTS types_kind_slug_unique
  ON public.types (kind, slug);
-- CIL[DOC-VECTOR type="context" content="purpose='Enforce global uniqueness of type slugs across all apps'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/015_types_kind_slug_unique.sql:types_kind_slug_unique:file"]
