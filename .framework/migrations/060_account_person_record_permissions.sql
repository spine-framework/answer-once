-- Migration 060: account + person type record_permissions convergence
-- CIL[DOC-RESPONSIBILITY responsibility="Grant member/member_admin record-level CRU on the account and person types. The 003 seed grants system_admin only; member_admin provisioning (account data writes via admin-data) and team management (people record updates) fail the record-level gate without these grants. Also restamps every accounts/people row so stamped schemas carry the new grants."]
-- CIL[DOC-MICRO logic_summary="jsonb_set replaces design_schema.record_permissions on the two type rows, then blanket restamps accounts and people from their type rows — covering records stamped with the old schema AND accounts left unstamped (design_schema='{}') by the pre-059 placement RPC." notable_decisions="Grant set = least privilege proven by the standalone demo install (system_admin CRUD, member_admin/member CRU) — deliberately narrower than the dev DB's drifted superset (support/support_admin/engineering_admin/sales/csm/tam); widen with a follow-up migration if another app declares a need"]
-- ============================================

UPDATE public.types
SET design_schema = jsonb_set(
  design_schema,
  '{record_permissions}',
  '{
    "system_admin": ["create","read","update","delete"],
    "member_admin": ["create","read","update"],
    "member":       ["create","read","update"]
  }'::jsonb
)
WHERE (kind = 'account' AND slug = 'account')
   OR (kind = 'person'  AND slug = 'person');

-- Restamp all account rows with the updated type schema (also repairs
-- accounts stamped '{}' by the pre-059 registration RPC).
UPDATE public.accounts a
SET type_id           = t.id,
    design_schema     = t.design_schema,
    validation_schema = COALESCE(t.validation_schema, '{}'::jsonb),
    updated_at        = now()
FROM public.types t
WHERE t.kind = 'account' AND t.slug = 'account'
  AND (a.type_id = t.id OR a.type_id IS NULL);

-- Restamp all people rows with the updated type schema.
UPDATE public.people p
SET type_id           = t.id,
    design_schema     = t.design_schema,
    validation_schema = COALESCE(t.validation_schema, '{}'::jsonb),
    updated_at        = now()
FROM public.types t
WHERE t.kind = 'person' AND t.slug = 'person'
  AND (p.type_id = t.id OR p.type_id IS NULL);
