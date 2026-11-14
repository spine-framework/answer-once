-- 080_vestigial_table_drops.sql
-- Drops three declared-but-unused tables: public.invites, public.alerts, and
-- public.integration_routes.
--
-- History (decision spine-framework:0016-vestigial-schema-cleanup, accepted):
--   - public.invites (001) never had a reader or writer. The real invite
--     lifecycle lives on pending public.people rows with data.invite_token,
--     claimed by handle_new_auth_user / complete_registration_placement.
--   - public.alerts (001) never had a reader or writer. Alert-shaped admin
--     output is synthesized from public.logs rows in logs.ts.
--   - public.integration_routes was created by 001 and deliberately dropped by
--     004 in favour of the webhook_handlers registry. It re-appears here as
--     DROP IF EXISTS only to converge databases that carry it as lineage
--     drift (spine-dev); on standard chains this statement is a no-op.
--
-- Verification before this migration (2026-11-30):
--   - Zero .from()/entity= callers anywhere in framework, custom, or
--     assembled code; no seed or types rows for either table.
--   - Zero rows in all three tables on spine-dev, AO prod, and AO demo.
--   - No inbound foreign keys, views, cross-table policies, or function
--     bodies referencing them on any live database.
--
-- The guard below re-checks dependencies at apply time so a downstream
-- database that grew a dependent fails loudly here instead of losing
-- objects to a silent CASCADE. Per-table objects (indexes, triggers, own
-- RLS policies, outbound FKs) drop with their table and need no handling.
-- Idempotent — every statement is safe to re-run.

-- 1. Dependency guard: abort if anything outside the tables themselves
-- still references them. plpgsql bodies are not recorded in pg_depend, so
-- function sources and policy expressions are scanned explicitly.
DO $$
DECLARE
  t    text;
  deps text;
BEGIN
  FOREACH t IN ARRAY ARRAY['invites', 'alerts', 'integration_routes'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE; -- table already absent (e.g. integration_routes post-004)
    END IF;

    SELECT string_agg(d.detail, '; ') INTO deps FROM (
      SELECT 'foreign key ' || c.conname || ' on ' || c.conrelid::regclass::text AS detail
        FROM pg_constraint c
       WHERE c.contype = 'f'
         AND c.confrelid = to_regclass('public.' || t)
      UNION ALL
      SELECT 'view ' || v.table_schema || '.' || v.table_name
        FROM information_schema.views v
       WHERE v.table_schema = 'public'
         AND v.view_definition ~ ('\m(public\.)?' || t || '\M')
      UNION ALL
      SELECT 'policy ' || p.polname || ' on ' || p.polrelid::regclass::text
        FROM pg_policy p
       WHERE p.polrelid <> to_regclass('public.' || t)
         AND (pg_get_expr(p.polqual, p.polrelid) ~ ('\m(public\.)?' || t || '\M')
              OR pg_get_expr(p.polwithcheck, p.polrelid) ~ ('\m(public\.)?' || t || '\M'))
      UNION ALL
      SELECT 'function ' || n.nspname || '.' || pr.proname
        FROM pg_proc pr
        JOIN pg_namespace n ON n.oid = pr.pronamespace
       WHERE n.nspname = 'public'
         AND pr.prosrc ~ ('\m(FROM|JOIN|INTO|UPDATE)\s+(public\.)?' || t || '\M')
    ) d;

    IF deps IS NOT NULL THEN
      RAISE EXCEPTION '080_vestigial_table_drops: public.% has dependents — resolve them before dropping: %', t, deps;
    END IF;
  END LOOP;
END $$;

-- 2. Drops. No CASCADE: the guard has already proven nothing inbound
-- depends on these tables, so a bare drop is the loud-failure path.
DROP TABLE IF EXISTS public.invites;
DROP TABLE IF EXISTS public.alerts;
DROP TABLE IF EXISTS public.integration_routes;
