-- CIL[BEGIN stable_id="~/.framework/migrations/036_demo_record_flags.sql:demo_record_flags:file" type="file" identity="demo_record_flags" parent="~/.framework/migrations/036_demo_record_flags.sql"]
-- CIL[DOC-MACRO purpose="Auto-stamp data.is_demo / data.demo_run_id on runtime records created under demo accounts"]
-- CIL[DOC-RESPONSIBILITY responsibility="Provide apply_demo_flag() trigger function and attach it to runtime tables so every write path (admin-data, adminDb, seeds) flags demo-owned records"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/functions/_shared/funnel.ts,.framework/functions/admin-data.ts"]
-- CIL[DOC-CONTRACT inputs="accounts.data.is_demo + accounts.data.demo_run_id on the row's account" outputs="NEW.data with reserved keys is_demo/demo_run_id set or stripped" errors="none — missing account defaults to non-demo" side_effects="Mutates NEW.data on INSERT/UPDATE"]
-- CIL[DOC-MICRO logic_summary="BEFORE INSERT OR UPDATE: look up NEW.account_id's account flag; demo accounts get is_demo=true + demo_run_id merged into data, non-demo accounts get the reserved keys stripped so clients cannot forge them" notable_decisions="DB trigger chosen over admin-data stamping so agent-runner/support-triage adminDb writes are flagged identically; strip on non-demo makes the flag unforgeable"]
-- CIL[DOC-STABILITY stability="stable"]

CREATE OR REPLACE FUNCTION public.apply_demo_flag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_demo boolean;
  v_run_id  text;
BEGIN
  -- accounts has no account_id; nothing to derive from.
  IF NEW.account_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT (a.data->>'is_demo')::boolean, a.data->>'demo_run_id'
    INTO v_is_demo, v_run_id
    FROM public.accounts a
   WHERE a.id = NEW.account_id;

  IF COALESCE(v_is_demo, false) THEN
    NEW.data := COALESCE(NEW.data, '{}'::jsonb)
                || jsonb_build_object('is_demo', true);
    IF v_run_id IS NOT NULL THEN
      NEW.data := NEW.data || jsonb_build_object('demo_run_id', v_run_id);
    END IF;
  ELSE
    -- Reserved keys are server-owned; strip any client-supplied values.
    NEW.data := COALESCE(NEW.data, '{}'::jsonb) - 'is_demo' - 'demo_run_id';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach to every runtime entity that carries an account_id + data payload.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['items', 'threads', 'messages', 'links', 'attachments', 'watchers', 'people']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_demo_flag ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_demo_flag BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.apply_demo_flag()',
      t
    );
  END LOOP;
END $$;

-- Backfill: flag existing rows belonging to demo accounts that predate the trigger.
UPDATE public.items i
   SET data = i.data || jsonb_build_object('is_demo', true)
  FROM public.accounts a
 WHERE i.account_id = a.id
   AND (a.data->>'is_demo')::boolean IS TRUE
   AND COALESCE(i.data->>'is_demo', 'false') <> 'true';
-- CIL[DOC-VECTOR type="context" content="purpose='Auto-stamp data.is_demo / data.demo_run_id on runtime records created under demo accounts'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Reserved keys is_demo/demo_run_id are server-owned on all runtime tables; clients cannot set or clear them"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/036_demo_record_flags.sql:demo_record_flags:file"]
