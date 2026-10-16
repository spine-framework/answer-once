-- Migration 062: Answer Once record_permissions convergence
-- CIL[DOC-RESPONSIBILITY responsibility="Converge record_permissions on the Answer Once types (ao_support_ticket, ao_kb_article, ao_ticket_thread, ao_ticket_message, ao_kb_shared) and the core account/person types to the standard AO grant map — member/member_admin/support/support_admin CRU, system_admin CRUD — then restamp every affected runtime row so stamped schemas carry the grants. The account/person grants fix staff roles (support, support_admin) receiving skeleton records from admin-data sanitization, which surfaced as raw UUIDs in AO company UI."]
-- CIL[DOC-MICRO logic_summary="jsonb_set replaces design_schema.record_permissions on the seven type rows, then restamps accounts, people, and all AO-typed items/threads/messages from their type rows. Restamp is by current type_id only — type identity is never reassigned on runtime rows." notable_decisions="Grant map = member/member_admin/support/support_admin CRU + system_admin CRUD, matching AO seed types.json. account/person keep 060's member grants verbatim and gain only the support roles — member read on person/account was already the established baseline, so staff roles need no tighter restriction. No 'all' wildcard: grants stay explicit per role."]
-- ============================================

UPDATE public.types
SET design_schema = jsonb_set(
  design_schema,
  '{record_permissions}',
  '{
    "member":        ["create","read","update"],
    "member_admin":  ["create","read","update"],
    "system_admin":  ["create","read","update","delete"],
    "support":       ["create","read","update"],
    "support_admin": ["create","read","update"]
  }'::jsonb
)
WHERE (kind = 'account' AND slug = 'account')
   OR (kind = 'person'  AND slug = 'person')
   OR (kind = 'item'    AND slug IN ('ao_support_ticket', 'ao_kb_article', 'ao_kb_shared'))
   OR (kind = 'thread'  AND slug = 'ao_ticket_thread')
   OR (kind = 'message' AND slug = 'ao_ticket_message');

-- Restamp all account rows with the updated type schema.
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

-- Restamp AO item rows (tickets, KB articles, shared KB artifacts).
UPDATE public.items i
SET design_schema     = t.design_schema,
    validation_schema = COALESCE(t.validation_schema, '{}'::jsonb),
    updated_at        = now()
FROM public.types t
WHERE t.kind = 'item'
  AND t.slug IN ('ao_support_ticket', 'ao_kb_article', 'ao_kb_shared')
  AND i.type_id = t.id;

-- Restamp AO thread rows.
UPDATE public.threads th
SET design_schema     = t.design_schema,
    validation_schema = COALESCE(t.validation_schema, '{}'::jsonb),
    updated_at        = now()
FROM public.types t
WHERE t.kind = 'thread' AND t.slug = 'ao_ticket_thread'
  AND th.type_id = t.id;

-- Restamp AO message rows.
UPDATE public.messages m
SET design_schema     = t.design_schema,
    validation_schema = COALESCE(t.validation_schema, '{}'::jsonb),
    updated_at        = now()
FROM public.types t
WHERE t.kind = 'message' AND t.slug = 'ao_ticket_message'
  AND m.type_id = t.id;
