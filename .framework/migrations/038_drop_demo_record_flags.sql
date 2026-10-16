-- CIL[BEGIN stable_id="~/.framework/migrations/038_drop_demo_record_flags.sql:drop_demo_record_flags:file" type="file" identity="drop_demo_record_flags" parent="~/.framework/migrations/038_drop_demo_record_flags.sql"]
-- CIL[DOC-MACRO purpose="Remove record-level is_demo flagging in favor of demo-specific types for content isolation"]
-- CIL[DOC-RESPONSIBILITY responsibility="Drop trg_demo_flag triggers and apply_demo_flag() (migration 036); strip is_demo/demo_run_id from existing runtime records. Record visibility is now isolated by demo_* types; accounts.data.is_demo remains a lifecycle-only marker (expiry, rate-limit policy, funnel tagging)"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files="custom/apps/demo/seed/types.json,custom/apps/demo/functions/custom_demo-journey.ts,custom/apps/portal/functions/custom_support-triage.ts"]
-- CIL[DOC-CONTRACT inputs="trg_demo_flag triggers + apply_demo_flag() from migration 036" outputs="triggers/function dropped; records unflagged" errors="none" side_effects="Runtime records can no longer be marked is_demo; accounts.data.is_demo is managed solely by demo provision"]
-- CIL[DOC-MICRO logic_summary="Demo content isolation moved to type-based scoping (demo_support_ticket, demo_support_thread). Accounts and people are never demo-flagged — they are real leads for Cortex." notable_decisions="Type isolation chosen over record flags so demo play can run inside shared accounts without hiding real records"]
-- CIL[DOC-STABILITY stability="stable"]

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['items', 'threads', 'messages', 'links', 'attachments', 'watchers', 'people']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_demo_flag ON public.%I', t);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.apply_demo_flag();

-- Unflag any runtime records that were stamped while the trigger was active.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['items', 'threads', 'messages', 'links', 'attachments', 'watchers', 'people']
  LOOP
    EXECUTE format(
      'UPDATE public.%I SET data = data - ''is_demo'' - ''demo_run_id'' WHERE data ? ''is_demo'' OR data ? ''demo_run_id''',
      t
    );
  END LOOP;
END $$;
-- CIL[DOC-VECTOR type="context" content="purpose='Remove record-level is_demo flagging in favor of demo-specific types'; No verified external callers; imports: none" status="ready"]
-- CIL[DOC-VECTOR type="blast_radius" content="admin-data demo_only/exclude_demo params become no-ops; demo visibility now enforced by type_slug scoping" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="accounts.data.is_demo is still written by demo provision for lifecycle (expiry/rate-limits); it is no longer propagated to records" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/038_drop_demo_record_flags.sql:drop_demo_record_flags:file"]
