-- CIL[BEGIN stable_id="~/.framework/migrations/049_security_blocklist.sql:security_blocklist:file" type="file" identity="security_blocklist" parent="~/.framework/migrations/049_security_blocklist.sql"]
-- CIL[DOC-MACRO purpose="Platform security layer: security_blocklist table, person geo RPCs, and schema declarations for security fields"]
-- CIL[DOC-RESPONSIBILITY responsibility="Create public.security_blocklist (platform-wide denylist for person/account/email/email_domain/ip), person_touch_geo + person_record_registration_geo RPCs for IP capture, and declare registration/last-seen geo fields plus AO injection flags in the affected type design_schemas"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/_shared/security.ts,.framework/functions/_shared/middleware.ts,.framework/functions/invites.ts,.framework/functions/security.ts"]
-- CIL[DOC-CONTRACT inputs="none" outputs="security_blocklist table, person_touch_geo + person_record_registration_geo functions, declared type fields" errors="none — CREATE IF NOT EXISTS / jsonb_set are idempotent" side_effects="Middleware geo stamping + blocklist enforcement + security admin report work"]
-- CIL[DOC-MICRO logic_summary="Blocklist rows are (type, value) unique with severity/expiry; geo fields live in people.data so no schema change; jsonb_set declares them on the person/ao types so admin-data sanitize doesn't strip them on read" notable_decisions="RLS service_role-only: blocklist reads/writes happen exclusively through _shared/security.ts and functions/security.ts; starter disposable-domain rows seed the email_domain check"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- ── security_blocklist ─────────────────────────────────────────────
-- Platform-wide denylist. Enforced at three chokepoints:
--   registration (invites.completeRegistration), authenticated request
--   (middleware.createHandler), public request IP (createPublicHandler).
CREATE TABLE IF NOT EXISTS public.security_blocklist (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text        NOT NULL CHECK (type IN ('ip', 'email', 'email_domain', 'person_id', 'account_id')),
  value       text        NOT NULL,
  severity    text        NOT NULL DEFAULT 'hard' CHECK (severity IN ('soft', 'hard')),
  reason      text,
  banned_by   uuid,
  expires_at  timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (type, value)
);

CREATE INDEX IF NOT EXISTS idx_security_blocklist_lookup
  ON public.security_blocklist (type, value)
  WHERE revoked_at IS NULL;

ALTER TABLE public.security_blocklist ENABLE ROW LEVEL SECURITY;

-- Service-role only: all reads/writes flow through _shared/security.ts
-- (adminDb) and functions/security.ts (system-admin gated).
DROP POLICY IF EXISTS security_blocklist_service_role ON public.security_blocklist;
CREATE POLICY security_blocklist_service_role ON public.security_blocklist
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── person_touch_geo ───────────────────────────────────────────────
-- Fire-and-forget last-seen geo stamp, called from middleware on every
-- authenticated request. Single-statement merge; does not touch
-- updated_at (record content did not change).
CREATE OR REPLACE FUNCTION public.person_touch_geo(p_person_id uuid, p_ip text, p_country text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.people
  SET data = data || jsonb_build_object(
    'last_ip', p_ip,
    'last_country', p_country,
    'last_seen_at', now()
  )
  WHERE id = p_person_id;
$$;

REVOKE ALL ON FUNCTION public.person_touch_geo(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.person_touch_geo(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.person_touch_geo(uuid, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.person_touch_geo(uuid, text, text) TO service_role;

-- ── person_record_registration_geo ─────────────────────────────────
-- First-seen geo stamp, called from invites.completeRegistration.
-- COALESCE keeps the FIRST recorded values (a later registration attempt
-- must not overwrite the original signup IP).
CREATE OR REPLACE FUNCTION public.person_record_registration_geo(p_person_id uuid, p_ip text, p_country text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.people
  SET data = data || jsonb_build_object(
    'registration_ip', coalesce(data->>'registration_ip', p_ip),
    'registration_country', coalesce(data->>'registration_country', p_country)
  )
  WHERE id = p_person_id;
$$;

REVOKE ALL ON FUNCTION public.person_record_registration_geo(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.person_record_registration_geo(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.person_record_registration_geo(uuid, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.person_record_registration_geo(uuid, text, text) TO service_role;

-- ── Declare geo/security fields on the person type ─────────────────
-- Without declaration, admin-data sanitizeRecordData strips these data
-- keys on read (same failure mode as watcher.last_seen_at, migration 048).
update public.types
set design_schema = jsonb_set(
      design_schema,
      '{fields}',
      (design_schema->'fields') || '{
        "registration_ip":       {"data_type":"text","label":"Registration IP","required":false,"validation":null},
        "registration_country":  {"data_type":"text","label":"Registration Country","required":false,"validation":null},
        "last_ip":               {"data_type":"text","label":"Last IP","required":false,"validation":null},
        "last_country":          {"data_type":"text","label":"Last Country","required":false,"validation":null},
        "last_seen_at":          {"data_type":"datetime","label":"Last Seen","required":false,"validation":null}
      }'::jsonb,
      true
    ),
    validation_schema = jsonb_set(
      coalesce(validation_schema, '{"fields":{}}'::jsonb),
      '{fields}',
      (coalesce(validation_schema, '{"fields":{}}'::jsonb)->'fields') || '{
        "registration_ip":       {"data_type":"text","required":false},
        "registration_country":  {"data_type":"text","required":false},
        "last_ip":               {"data_type":"text","required":false},
        "last_country":          {"data_type":"text","required":false},
        "last_seen_at":          {"data_type":"datetime","required":false}
      }'::jsonb,
      true
    )
where kind = 'person' and slug = 'person';

-- ── Declare injection flags on Answer Once types ───────────────────
update public.types
set design_schema = jsonb_set(
      design_schema,
      '{fields}',
      (design_schema->'fields') || '{
        "injection_detected": {"data_type":"boolean","label":"Injection Detected","required":false,"validation":null},
        "injection_pattern":  {"data_type":"text","label":"Injection Pattern","required":false,"validation":null}
      }'::jsonb,
      true
    ),
    validation_schema = jsonb_set(
      coalesce(validation_schema, '{"fields":{}}'::jsonb),
      '{fields}',
      (coalesce(validation_schema, '{"fields":{}}'::jsonb)->'fields') || '{
        "injection_detected": {"data_type":"boolean","required":false},
        "injection_pattern":  {"data_type":"text","required":false}
      }'::jsonb,
      true
    )
where slug in ('ao_ticket_message', 'ao_support_ticket');

-- ── Starter disposable-email domain denylist ───────────────────────
INSERT INTO public.security_blocklist (type, value, severity, reason)
SELECT 'email_domain', d, 'hard', 'Disposable email provider'
FROM (VALUES
  ('mailinator.com'), ('tempmail.com'), ('temp-mail.org'),
  ('guerrillamail.com'), ('10minutemail.com'), ('yopmail.com'),
  ('maildrop.cc'), ('sharklasers.com'), ('dispostable.com'),
  ('trashmail.com'), ('getnada.com'), ('mailnesia.com')
) AS v(d)
ON CONFLICT (type, value) DO NOTHING;
-- CIL[END stable_id="~/.framework/migrations/049_security_blocklist.sql:security_blocklist:file"]
