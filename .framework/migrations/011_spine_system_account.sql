-- CIL[BEGIN stable_id="~/.framework/migrations/011_spine_system_account.sql:spine_system_account:file" type="file" identity="spine_system_account" parent="~/.framework/migrations/011_spine_system_account.sql"]
-- CIL[DOC-MACRO purpose="Seed the account type and spine-system master account"]
-- CIL[DOC-RESPONSIBILITY responsibility="Ensure the runtime account type and master account exist for auth and registration flows"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/migrations/011_spine_system_account.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="public.types row for account; public.accounts row for spine-system" errors="none" side_effects="Inserts rows into public.types and public.accounts when missing"]
-- CIL[DOC-MICRO logic_summary="Inserts the account type into public.types with a full design schema if absent, then inserts the spine-system master account using that type if it does not already exist." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Seed the account type and Spine system master account required by the auth trigger and existing-account registration flow

-- Ensure the runtime account type exists
INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
SELECT
  gen_random_uuid(),
  (SELECT id FROM public.apps WHERE slug = 'spine-core' LIMIT 1),
  'account',
  'account',
  'Account',
  'Organization or tenant account',
  jsonb_build_object(
    'scope', 'platform',
    'fields', jsonb_build_object(
      'display_name', jsonb_build_object('data_type', 'text', 'label', 'Account Name', 'required', true, 'system', true, 'validation', null),
      'description',  jsonb_build_object('data_type', 'textarea', 'label', 'Description', 'required', false, 'system', true, 'validation', null),
      'is_active',    jsonb_build_object('data_type', 'boolean', 'label', 'Active', 'required', true, 'system', true, 'validation', null),
      'created_at',   jsonb_build_object('data_type', 'datetime', 'label', 'Created', 'required', false, 'system', true, 'readonly', true, 'validation', null),
      'updated_at',   jsonb_build_object('data_type', 'datetime', 'label', 'Updated', 'required', false, 'system', true, 'readonly', true, 'validation', null)
    ),
    'views', jsonb_build_object(
      'default_list', jsonb_build_object('type', 'list', 'display', 'table', 'label', 'Accounts',
        'fields', jsonb_build_object(
          'display_name', jsonb_build_object('sortable', true, 'display_type', 'text'),
          'is_active',    jsonb_build_object('sortable', true, 'display_type', 'badge'),
          'created_at',   jsonb_build_object('sortable', true, 'display_type', 'timestamp')
        ),
        'default_sort', jsonb_build_object('field', 'created_at', 'direction', 'desc')
      ),
      'default_detail', jsonb_build_object('type', 'detail', 'label', 'Account',
        'sections', jsonb_build_array(
          jsonb_build_object('title', 'Details', 'fields', jsonb_build_array('display_name', 'description', 'is_active')),
          jsonb_build_object('title', 'Metadata', 'fields', jsonb_build_array('created_at', 'updated_at'))
        )
      )
    ),
    'record_permissions', jsonb_build_object(
      'system_admin', ARRAY['create', 'read', 'update', 'delete']
    ),
    'functionality', null
  ),
  '{}'::jsonb,
  'pack',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.types WHERE kind = 'account' AND slug = 'account')
ON CONFLICT (app_id, kind, slug) DO NOTHING;

-- Ensure the spine-system master account exists, stamping the account type's schema
INSERT INTO public.accounts (id, slug, display_name, description, data, is_active, design_schema, validation_schema, type_id)
SELECT
  gen_random_uuid(),
  'spine-system',
  'Spine System',
  'Master system account for internal Spine operations',
  '{}'::jsonb,
  true,
  t.design_schema,
  t.validation_schema,
  t.id
FROM public.types t
WHERE t.kind = 'account' AND t.slug = 'account'
  AND NOT EXISTS (SELECT 1 FROM public.accounts a WHERE a.slug = 'spine-system');
-- CIL[DOC-VECTOR type="context" content="purpose='Seed the account type and spine-system master account'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/011_spine_system_account.sql:spine_system_account:file"]
