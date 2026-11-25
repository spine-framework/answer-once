-- ── notifications: tighten the account-wide read policy ───────────────────────
-- 050 granted every account member SELECT on everyone's inbox
-- (notifications_account_read) — fine for admin/audit intent, but it means any
-- member querying PostgREST directly can read every colleague's notifications.
-- Function-layer admin surfaces use adminDb (service_role) and are unaffected.
-- Scope the account-wide grant to system_admin; recipient self-read/update is
-- unchanged.

DROP POLICY IF EXISTS notifications_account_read ON public.notifications;
DROP POLICY IF EXISTS notifications_admin_read ON public.notifications;
CREATE POLICY notifications_admin_read ON public.notifications FOR SELECT
  USING (public.person_is_system_admin(public.current_actor_id()));
