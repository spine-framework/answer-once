-- CIL[BEGIN stable_id="~/.framework/migrations/078_webhook_handlers_reconcile.sql:webhook_handlers_reconcile:file" type="file" identity="webhook_handlers_reconcile" parent="~/.framework/migrations"]
-- Migration 078: reconcile legacy webhook_handlers shape with 004_core_rpc_and_broker
-- Databases created before the archive/014 -> 004 transition can carry the old
-- webhook_handlers table: globally UNIQUE name, events jsonb, and no app_id /
-- is_system columns. 004's CREATE TABLE IF NOT EXISTS never altered it, so
-- app-scoped handler lookup (webhook-registry.lookupHandler) and scoped
-- registration (webhook-registration upsert on app_id,account_id,name) fail.
-- Idempotent: every statement is guarded so fresh databases are unaffected.

-- 1) Columns the current shape expects
ALTER TABLE public.webhook_handlers ADD COLUMN IF NOT EXISTS app_id uuid;
ALTER TABLE public.webhook_handlers ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- 2) Legacy shape had events jsonb; current code expects text[]. Postgres
--    forbids subqueries in ALTER COLUMN ... USING, so swap via a new column.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webhook_handlers'
      AND column_name = 'events' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE public.webhook_handlers ADD COLUMN IF NOT EXISTS events_text text[];
    UPDATE public.webhook_handlers SET events_text = CASE
      WHEN jsonb_typeof(events) = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(events))
      WHEN jsonb_typeof(events) = 'string'
        THEN ARRAY[events #>> '{}']
      ELSE '{}'::text[]
    END;
    ALTER TABLE public.webhook_handlers DROP COLUMN events;
    ALTER TABLE public.webhook_handlers RENAME COLUMN events_text TO events;
    ALTER TABLE public.webhook_handlers ALTER COLUMN events SET DEFAULT '{}'::text[];
  END IF;
END $$;

-- Recreate the events GIN index if the column swap dropped it.
CREATE INDEX IF NOT EXISTS idx_webhook_handlers_events
  ON public.webhook_handlers USING GIN(events) WHERE is_active = true;

-- 3) Legacy UNIQUE(name) must go — handlers are now unique per
--    (app_id, account_id, name) so the same handler name can exist at
--    system/app/account scope.
ALTER TABLE public.webhook_handlers DROP CONSTRAINT IF EXISTS webhook_handlers_name_key;

-- 4) Composite uniqueness matching the upsert onConflict target.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.webhook_handlers'::regclass
      AND conname = 'webhook_handlers_app_account_name_key'
  ) THEN
    ALTER TABLE public.webhook_handlers
      ADD CONSTRAINT webhook_handlers_app_account_name_key
      UNIQUE (app_id, account_id, name);
  END IF;
END $$;

-- 5) app_id foreign key (matches 004)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.webhook_handlers'::regclass
      AND conname = 'fk_webhook_handlers_app'
  ) THEN
    ALTER TABLE public.webhook_handlers
      ADD CONSTRAINT fk_webhook_handlers_app
      FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
  END IF;
END $$;
-- CIL[END stable_id="~/.framework/migrations/078_webhook_handlers_reconcile.sql:webhook_handlers_reconcile:file"]
