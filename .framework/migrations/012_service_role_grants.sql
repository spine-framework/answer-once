-- CIL[BEGIN stable_id="~/.framework/migrations/012_service_role_grants.sql:service_role_grants:file" type="file" identity="service_role_grants" parent="~/.framework/migrations/012_service_role_grants.sql"]
-- CIL[DOC-MACRO purpose="Define core schema privileges for Supabase auth roles to enable first-user registration and auth lookups."]
-- CIL[DOC-RESPONSIBILITY responsibility="Grant usage, select, and CRUD privileges on the public schema to anon, authenticated, and service_role, and set default privileges for future objects."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/012_service_role_grants.sql"]
-- CIL[DOC-CONTRACT inputs="SQL execution context in a Supabase migration" outputs="Granted privileges on public schema and default privileges for auth roles" errors="Migration failure if roles or schema public are missing" side_effects="Modifies database grants and default privileges for future objects"]
-- CIL[DOC-MICRO logic_summary="Grant USAGE on schema public to anon, authenticated, and service_role; grant SELECT on all tables and sequences to authenticated; grant full CRUD on tables and sequences to service_role; configure default privileges for future objects." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Spine v2: core schema privileges for Supabase auth roles
--
-- Without these grants, a fresh Supabase project denies "schema public"
-- to service_role (adminDb) and authenticated (userDb) requests, breaking
-- check-first-user, auth lookup, and all first-user registration flows.

-- Allow all auth roles to reference the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Authenticated users can read all tables; row-level security enforces access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Service role bypasses RLS and needs full CRUD for admin operations
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Default privileges for objects created after this migration
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO service_role;
-- CIL[DOC-VECTOR type="context" content="purpose='Define core schema privileges for Supabase auth roles to enable first-user registration and auth lookups.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/012_service_role_grants.sql:service_role_grants:file"]
