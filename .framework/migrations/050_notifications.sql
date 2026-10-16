-- ── notifications: durable notification-delivery records ─────────────────────
-- send_notification previously wrote into watchers, which is a SUBSCRIPTION
-- table (target_type/target_id/person_id, unique per target+person) — not a
-- delivery log. This table holds actual deliveries: one row per recipient per
-- notification. watchers stays the "who is subscribed" record; notifications is
-- "what was sent".

CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   uuid        NOT NULL REFERENCES public.accounts(id),
  person_id    uuid        NOT NULL,               -- recipient
  source_type  text        NOT NULL DEFAULT 'pipeline_execution',
  source_id    text,                               -- pipeline execution / request id (not always a uuid)
  target_type  text,                               -- entity the notification concerns
  target_id    uuid,
  message      text        NOT NULL,
  data         jsonb       NOT NULL DEFAULT '{}',
  is_read      boolean     NOT NULL DEFAULT false,
  read_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_inbox
  ON public.notifications (account_id, person_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_target
  ON public.notifications (target_type, target_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recipients read and mark-read their own notifications. Delivery inserts go
-- through adminDb (service_role) from pipeline-runner / agent-runner.
DROP POLICY IF EXISTS notifications_recipient_read ON public.notifications;
CREATE POLICY notifications_recipient_read ON public.notifications FOR SELECT
  USING (person_id = public.current_actor_id());

DROP POLICY IF EXISTS notifications_recipient_update ON public.notifications;
CREATE POLICY notifications_recipient_update ON public.notifications FOR UPDATE
  USING (person_id = public.current_actor_id())
  WITH CHECK (person_id = public.current_actor_id());

-- Account members can see deliveries into their workspace (admin/audit views).
DROP POLICY IF EXISTS notifications_account_read ON public.notifications;
CREATE POLICY notifications_account_read ON public.notifications FOR SELECT
  USING (account_id IN (SELECT public.get_accessible_accounts(public.current_actor_id())));

DROP POLICY IF EXISTS notifications_service_role ON public.notifications;
CREATE POLICY notifications_service_role ON public.notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);
