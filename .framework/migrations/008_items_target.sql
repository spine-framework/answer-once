-- CIL[BEGIN stable_id="~/.framework/migrations/008_items_target.sql:items_target:file" type="file" identity="items_target" parent="~/.framework/migrations/008_items_target.sql"]
-- CIL[DOC-MACRO purpose="Add target scoping columns to public.items so any item can be explicitly scoped to a person or account."]
-- CIL[DOC-RESPONSIBILITY responsibility="Apply schema migration that introduces target_type and target_id columns and an index for target-based lookups."]
-- CIL[DOC-CONTEXT module="schema" layer="migration" related_files=".framework/migrations/008_items_target.sql"]
-- CIL[DOC-CONTRACT inputs="Existing public.items table." outputs="public.items with target_type and target_id columns and idx_items_target index." errors="Fails if public.items does not exist or if the executing role lacks ALTER/CREATE INDEX privileges." side_effects="Modifies public.items table schema and creates a new index."]
-- CIL[DOC-MICRO logic_summary="Use IF NOT EXISTS clauses to idempotently add target_type text and target_id uuid columns, then create a composite index on (target_type, target_id)." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Add target scoping columns to public.items to align with threads, links, and watchers.
-- This lets any item (note, ticket, deal, etc.) be explicitly scoped to a person or account.

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS target_type text,
  ADD COLUMN IF NOT EXISTS target_id uuid;

CREATE INDEX IF NOT EXISTS idx_items_target ON public.items (target_type, target_id);
-- CIL[DOC-VECTOR type="context" content="purpose='Add target scoping columns to public.items so any item can be explicitly scoped to a person or account.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/008_items_target.sql:items_target:file"]
