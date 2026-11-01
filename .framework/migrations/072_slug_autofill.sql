-- 072_slug_autofill.sql
-- Fill slug from name on insert when the caller omits it.
-- Fresh-install schema (001) declares slug NOT NULL on these tables, but the
-- create handlers for triggers/timers/pipelines/ai_agents/test_runs/
-- item_progress/invites never write slug — inserts fail on fresh chains.
-- The trigger is a no-op whenever the caller supplies a slug.

CREATE OR REPLACE FUNCTION public.spine_fill_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base text;
  candidate text;
  clash boolean;
  i int := 2;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
    RETURN NEW;
  END IF;

  base := trim(both '_' from regexp_replace(lower(coalesce(NEW.name, '')), '[^a-z0-9]+', '_', 'g'));
  IF base = '' THEN
    base := 'row';
  END IF;
  candidate := base;

  LOOP
    EXECUTE format(
      'SELECT EXISTS (SELECT 1 FROM %I.%I WHERE app_id IS NOT DISTINCT FROM $1 AND slug = $2)',
      TG_TABLE_SCHEMA, TG_TABLE_NAME
    ) INTO clash USING NEW.app_id, candidate;
    EXIT WHEN NOT clash;
    candidate := base || '_' || i;
    i := i + 1;
    IF i > 100 THEN
      candidate := base || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
      EXECUTE format(
        'SELECT EXISTS (SELECT 1 FROM %I.%I WHERE app_id IS NOT DISTINCT FROM $1 AND slug = $2)',
        TG_TABLE_SCHEMA, TG_TABLE_NAME
      ) INTO clash USING NEW.app_id, candidate;
      EXIT WHEN NOT clash;
    END IF;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS spine_fill_slug_trg ON public.triggers;
CREATE TRIGGER spine_fill_slug_trg BEFORE INSERT ON public.triggers
  FOR EACH ROW EXECUTE FUNCTION public.spine_fill_slug();

DROP TRIGGER IF EXISTS spine_fill_slug_trg ON public.timers;
CREATE TRIGGER spine_fill_slug_trg BEFORE INSERT ON public.timers
  FOR EACH ROW EXECUTE FUNCTION public.spine_fill_slug();

DROP TRIGGER IF EXISTS spine_fill_slug_trg ON public.pipelines;
CREATE TRIGGER spine_fill_slug_trg BEFORE INSERT ON public.pipelines
  FOR EACH ROW EXECUTE FUNCTION public.spine_fill_slug();

DROP TRIGGER IF EXISTS spine_fill_slug_trg ON public.ai_agents;
CREATE TRIGGER spine_fill_slug_trg BEFORE INSERT ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.spine_fill_slug();

DROP TRIGGER IF EXISTS spine_fill_slug_trg ON public.test_runs;
CREATE TRIGGER spine_fill_slug_trg BEFORE INSERT ON public.test_runs
  FOR EACH ROW EXECUTE FUNCTION public.spine_fill_slug();

DROP TRIGGER IF EXISTS spine_fill_slug_trg ON public.item_progress;
CREATE TRIGGER spine_fill_slug_trg BEFORE INSERT ON public.item_progress
  FOR EACH ROW EXECUTE FUNCTION public.spine_fill_slug();

DROP TRIGGER IF EXISTS spine_fill_slug_trg ON public.invites;
CREATE TRIGGER spine_fill_slug_trg BEFORE INSERT ON public.invites
  FOR EACH ROW EXECUTE FUNCTION public.spine_fill_slug();
