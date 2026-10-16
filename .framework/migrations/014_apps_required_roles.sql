-- CIL[BEGIN stable_id="~/.framework/migrations/014_apps_required_roles.sql:apps_required_roles:file" type="file" identity="apps_required_roles" parent="~/.framework/migrations/014_apps_required_roles.sql"]
-- CIL[DOC-MACRO purpose="Adds and backfills a required_roles jsonb column on the public.apps table so that app records can carry a list of roles needed for access."]
-- CIL[DOC-RESPONSIBILITY responsibility="Schema migration: add required_roles column to public.apps and backfill from min_role."]
-- CIL[DOC-CONTEXT module="framework" layer="migrations" related_files=".framework/migrations/014_apps_required_roles.sql"]
-- CIL[DOC-CONTRACT inputs="public.apps table with existing min_role column" outputs="public.apps table with required_roles jsonb column populated for rows having min_role" errors="SQL execution errors, jsonb cast issues" side_effects="Adds column if missing; updates existing rows."]
-- CIL[DOC-MICRO logic_summary="Add required_roles jsonb defaulting to empty array; then set it to a jsonb array containing the existing min_role for rows with min_role and empty/null required_roles." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Add required_roles jsonb column to apps table for get_account_apps filtering.
ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS required_roles jsonb DEFAULT '[]'::jsonb;

-- Backfill required_roles from existing min_role values.
UPDATE public.apps
SET required_roles = jsonb_build_array(min_role)
WHERE min_role IS NOT NULL
  AND (required_roles = '[]'::jsonb OR required_roles IS NULL);
-- CIL[DOC-VECTOR type="context" content="purpose='Adds and backfills a required_roles jsonb column on the public.apps table so that app records can carry a list of roles needed for access.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/014_apps_required_roles.sql:apps_required_roles:file"]
