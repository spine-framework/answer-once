-- CIL[BEGIN stable_id="~/.framework/migrations/003_core_system_data.sql:core_system_data:file" type="file" identity="core_system_data" parent="~/.framework/migrations/003_core_system_data.sql"]
-- CIL[DOC-MACRO purpose="Seed Spine v2 core system data including built-in roles, core apps, system types, the spine-system master account, and the get_account_apps helper."]
-- CIL[DOC-RESPONSIBILITY responsibility="Insert or upsert protected platform records required before runtime operation; establishes built-in system roles, core apps, generic types, the master account, and a query helper for account-scoped apps."]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/003_core_system_data.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="mutated public.roles, public.apps, public.types, public.accounts rows; created public.get_account_apps function" errors="none (ON CONFLICT DO NOTHING/UPDATE ensures idempotency)" side_effects="persists Spine v2 core system seed data and helper function to the database"]
-- CIL[DOC-MICRO logic_summary="Inserts the system_admin role, a set of built-in roles, the spine-core and admin apps, core runtime types (person, item, thread, message, link, attachment, watcher, account), the spine-system master account, and defines the get_account_apps PL/pgSQL function." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- Spine v2 consolidated core system data
-- System roles and essential platform records.

INSERT INTO public.roles (id, slug, name, description, permissions, is_system, is_active, is_protected, app_id, account_id)
VALUES (
  gen_random_uuid(),
  'system_admin',
  'System Admin',
  'Full system access - can manage all accounts, types, and system configuration',
  '["*"]'::jsonb,
  true,
  true,
  true,
  NULL,
  NULL
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.roles (id, slug, name, description, permissions, is_system, is_active, is_protected, app_id, account_id)
VALUES
  (gen_random_uuid(), 'engineering',       'Engineering',       'Engineering — work tracking, delivery, quality, and code intelligence',     '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'engineering_admin', 'Engineering Admin', 'Engineering administrator with invitation and configuration privileges',    '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'product',           'Product',           'Product — discovery, prioritization, and roadmap ownership',                 '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'docs',              'Docs',              'Docs — documentation and knowledge-base authoring',                          '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'qa',                'QA',                'QA — test plans, test runs, and quality gates',                              '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'devops',            'DevOps',            'DevOps — delivery, observability, and incident response',                  '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'management',        'Management',        'Management — cross-team oversight and operational control',                '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'sales',             'Sales',             'Sales — opportunities, deals, and customer communications',                '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'csm',               'Customer Success Manager', 'CSM — account health, support, and customer success',             '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'tam',               'Technical Account Manager', 'TAM — technical account health and technical signals',            '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'support',           'Support',           'Support — tickets, community moderation, and knowledge base',             '["*"]'::jsonb, true, true, false, NULL, NULL),
  (gen_random_uuid(), 'support_admin',     'Support Admin',     'Support administrator — can invite and manage support staff',             '["*"]'::jsonb, true, true, false, NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.apps (id, slug, name, description, version, app_type, source, is_active, is_system, renderer, route_prefix)
VALUES (
  gen_random_uuid(),
  'spine-core',
  'Spine Core',
  'Core Spine runtime - provides accounts, people, items, threads, messages, links, attachments, watchers',
  '1.0.0',
  'system',
  'builtin',
  true,
  true,
  'none',
  NULL
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.apps (
  id, slug, name, description, icon, color, version,
  app_type, source, config, nav_items, min_role,
  is_active, is_system, route_prefix, renderer
)
VALUES (
  gen_random_uuid(),
  'admin',
  'Admin',
  'Spine system administration interface',
  'settings',
  'slate',
  '1.0.0',
  'system',
  'builtin',
  '{}'::jsonb,
  '[]'::jsonb,
  'system_admin',
  true,
  true,
  '/admin',
  'custom'
)
ON CONFLICT (slug) DO UPDATE SET
  route_prefix = EXCLUDED.route_prefix,
  renderer = EXCLUDED.renderer,
  min_role = EXCLUDED.min_role,
  is_system = EXCLUDED.is_system,
  app_type = EXCLUDED.app_type;

DO $$
DECLARE
  v_spine_core_app_id uuid;
BEGIN
  SELECT id INTO v_spine_core_app_id FROM public.apps WHERE slug = 'spine-core' LIMIT 1;

    INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
  VALUES (
    gen_random_uuid(),
    v_spine_core_app_id,
    'person',
    'person',
    'Person',
    'User or contact person',
    jsonb_build_object(
      'scope', 'account',
      'record_permissions', jsonb_build_object('system_admin', ARRAY['create', 'read', 'update', 'delete']),
      'fields', jsonb_build_object(
        'full_name', jsonb_build_object('data_type', 'text', 'label', 'Full Name', 'required', true, 'system', true, 'validation', null),
        'email', jsonb_build_object('data_type', 'email', 'label', 'Email', 'required', true, 'system', true, 'validation', null),
        'phone', jsonb_build_object('data_type', 'phone', 'label', 'Phone', 'required', false, 'system', true, 'validation', null),
        'avatar_url', jsonb_build_object('data_type', 'url', 'label', 'Avatar URL', 'required', false, 'system', true, 'validation', null),
        'status', jsonb_build_object('data_type', 'text', 'label', 'Status', 'required', true, 'system', true, 'validation', null),
        'is_active', jsonb_build_object('data_type', 'boolean', 'label', 'Active', 'required', true, 'system', true, 'validation', null),
        'created_at', jsonb_build_object('data_type', 'datetime', 'label', 'Created', 'required', false, 'system', true, 'readonly', true, 'validation', null),
        'updated_at', jsonb_build_object('data_type', 'datetime', 'label', 'Updated', 'required', false, 'system', true, 'readonly', true, 'validation', null)
      ),
      'views', jsonb_build_object(
        'default_list', jsonb_build_object('type', 'list', 'display', 'table', 'label', 'People',
          'fields', jsonb_build_object(
            'full_name', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'email', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'status', jsonb_build_object('sortable', true, 'display_type', 'badge'),
            'is_active', jsonb_build_object('sortable', true, 'display_type', 'badge')
          )
        ),
        'default_detail', jsonb_build_object('type', 'detail', 'label', 'Person',
          'sections', jsonb_build_array(
            jsonb_build_object('title', 'Profile', 'fields', jsonb_build_array('full_name', 'email', 'phone', 'avatar_url')),
            jsonb_build_object('title', 'Status', 'fields', jsonb_build_array('status', 'is_active')),
            jsonb_build_object('title', 'Metadata', 'fields', jsonb_build_array('created_at', 'updated_at'))
          )
        )
      )
    ),
    '{}'::jsonb,
    'pack',
    true
  )

  ON CONFLICT (app_id, kind, slug) DO NOTHING;

    INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
  VALUES (
    gen_random_uuid(),
    v_spine_core_app_id,
    'item',
    'item',
    'Item',
    'Generic item - tickets, tasks, records',
    jsonb_build_object(
      'scope', 'account',
      'record_permissions', jsonb_build_object('system_admin', ARRAY['create', 'read', 'update', 'delete']),
      'fields', jsonb_build_object(
        'title', jsonb_build_object('data_type', 'text', 'label', 'Title', 'required', true, 'system', true, 'validation', null),
        'description', jsonb_build_object('data_type', 'textarea', 'label', 'Description', 'required', false, 'system', true, 'validation', null),
        'status', jsonb_build_object('data_type', 'text', 'label', 'Status', 'required', true, 'system', true, 'validation', null),
        'is_active', jsonb_build_object('data_type', 'boolean', 'label', 'Active', 'required', true, 'system', true, 'validation', null),
        'created_at', jsonb_build_object('data_type', 'datetime', 'label', 'Created', 'required', false, 'system', true, 'readonly', true, 'validation', null),
        'updated_at', jsonb_build_object('data_type', 'datetime', 'label', 'Updated', 'required', false, 'system', true, 'readonly', true, 'validation', null)
      ),
      'views', jsonb_build_object(
        'default_list', jsonb_build_object('type', 'list', 'display', 'table', 'label', 'Items',
          'fields', jsonb_build_object(
            'title', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'status', jsonb_build_object('sortable', true, 'display_type', 'badge'),
            'is_active', jsonb_build_object('sortable', true, 'display_type', 'badge'),
            'created_at', jsonb_build_object('sortable', true, 'display_type', 'datetime')
          )
        ),
        'default_detail', jsonb_build_object('type', 'detail', 'label', 'Item',
          'sections', jsonb_build_array(
            jsonb_build_object('title', 'Overview', 'fields', jsonb_build_array('title', 'description', 'status', 'is_active')),
            jsonb_build_object('title', 'Metadata', 'fields', jsonb_build_array('created_at', 'updated_at'))
          )
        )
      )
    ),
    '{}'::jsonb,
    'pack',
    true
  )

  ON CONFLICT (app_id, kind, slug) DO NOTHING;

    INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
  VALUES (
    gen_random_uuid(),
    v_spine_core_app_id,
    'thread',
    'thread',
    'Thread',
    'Discussion thread for items or accounts',
    jsonb_build_object(
      'scope', 'account',
      'record_permissions', jsonb_build_object(
        'system_admin', ARRAY['create', 'read', 'update', 'delete'],
        'support_admin', ARRAY['create', 'read', 'update'],
        'support', ARRAY['create', 'read', 'update'],
        'member_admin', ARRAY['create', 'read', 'update'],
        'member', ARRAY['create', 'read', 'update']
      ),
      'fields', jsonb_build_object(
        'title', jsonb_build_object('data_type', 'text', 'label', 'Title', 'required', false, 'system', true, 'validation', null),
        'target_type', jsonb_build_object('data_type', 'text', 'label', 'Target Type', 'required', true, 'system', true, 'validation', null),
        'target_id', jsonb_build_object('data_type', 'uuid', 'label', 'Target ID', 'required', true, 'system', true, 'validation', null),
        'visibility', jsonb_build_object('data_type', 'text', 'label', 'Visibility', 'required', true, 'system', true, 'validation', null),
        'status', jsonb_build_object('data_type', 'text', 'label', 'Status', 'required', true, 'system', true, 'validation', null),
        'is_active', jsonb_build_object('data_type', 'boolean', 'label', 'Active', 'required', true, 'system', true, 'validation', null),
        'created_at', jsonb_build_object('data_type', 'datetime', 'label', 'Created', 'required', false, 'system', true, 'readonly', true, 'validation', null),
        'updated_at', jsonb_build_object('data_type', 'datetime', 'label', 'Updated', 'required', false, 'system', true, 'readonly', true, 'validation', null)
      ),
      'views', jsonb_build_object(
        'default_list', jsonb_build_object('type', 'list', 'display', 'table', 'label', 'Threads',
          'fields', jsonb_build_object(
            'title', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'target_type', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'visibility', jsonb_build_object('sortable', true, 'display_type', 'badge'),
            'status', jsonb_build_object('sortable', true, 'display_type', 'badge')
          )
        ),
        'default_detail', jsonb_build_object('type', 'detail', 'label', 'Thread',
          'sections', jsonb_build_array(
            jsonb_build_object('title', 'Overview', 'fields', jsonb_build_array('title', 'target_type', 'target_id', 'visibility', 'status')),
            jsonb_build_object('title', 'Metadata', 'fields', jsonb_build_array('created_at', 'updated_at'))
          )
        )
      )
    ),
    '{}'::jsonb,
    'pack',
    true
  )

  ON CONFLICT (app_id, kind, slug) DO NOTHING;

    INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
  VALUES (
    gen_random_uuid(),
    v_spine_core_app_id,
    'message',
    'message',
    'Message',
    'Individual message within a thread',
    jsonb_build_object(
      'scope', 'account',
      'record_permissions', jsonb_build_object(
        'system_admin', ARRAY['create', 'read', 'update', 'delete'],
        'support_admin', ARRAY['create', 'read', 'update'],
        'support', ARRAY['create', 'read', 'update'],
        'member_admin', ARRAY['create', 'read', 'update'],
        'member', ARRAY['create', 'read', 'update']
      ),
      'fields', jsonb_build_object(
        'content', jsonb_build_object('data_type', 'textarea', 'label', 'Content', 'required', true, 'system', true, 'validation', null),
        'direction', jsonb_build_object('data_type', 'text', 'label', 'Direction', 'required', true, 'system', true, 'validation', null),
        'sequence', jsonb_build_object('data_type', 'number', 'label', 'Sequence', 'required', true, 'system', true, 'validation', null),
        'visibility', jsonb_build_object('data_type', 'text', 'label', 'Visibility', 'required', true, 'system', true, 'validation', null),
        'is_active', jsonb_build_object('data_type', 'boolean', 'label', 'Active', 'required', true, 'system', true, 'validation', null),
        'created_at', jsonb_build_object('data_type', 'datetime', 'label', 'Created', 'required', false, 'system', true, 'readonly', true, 'validation', null),
        'updated_at', jsonb_build_object('data_type', 'datetime', 'label', 'Updated', 'required', false, 'system', true, 'readonly', true, 'validation', null)
      ),
      'views', jsonb_build_object(
        'default_list', jsonb_build_object('type', 'list', 'display', 'table', 'label', 'Messages',
          'fields', jsonb_build_object(
            'content', jsonb_build_object('sortable', false, 'display_type', 'text'),
            'direction', jsonb_build_object('sortable', true, 'display_type', 'badge'),
            'visibility', jsonb_build_object('sortable', true, 'display_type', 'badge'),
            'created_at', jsonb_build_object('sortable', true, 'display_type', 'datetime')
          )
        ),
        'default_detail', jsonb_build_object('type', 'detail', 'label', 'Message',
          'sections', jsonb_build_array(
            jsonb_build_object('title', 'Content', 'fields', jsonb_build_array('content', 'direction', 'visibility')),
            jsonb_build_object('title', 'Metadata', 'fields', jsonb_build_array('sequence', 'created_at', 'updated_at'))
          )
        )
      )
    ),
    '{}'::jsonb,
    'pack',
    true
  )

  ON CONFLICT (app_id, kind, slug) DO NOTHING;

    INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
  VALUES (
    gen_random_uuid(),
    v_spine_core_app_id,
    'link',
    'link',
    'Link',
    'Relationship between two entities',
    jsonb_build_object(
      'scope', 'account',
      'record_permissions', jsonb_build_object('system_admin', ARRAY['create', 'read', 'update', 'delete']),
      'fields', jsonb_build_object(
        'source_type', jsonb_build_object('data_type', 'text', 'label', 'Source Type', 'required', true, 'system', true, 'validation', null),
        'source_id', jsonb_build_object('data_type', 'uuid', 'label', 'Source ID', 'required', true, 'system', true, 'validation', null),
        'target_type', jsonb_build_object('data_type', 'text', 'label', 'Target Type', 'required', true, 'system', true, 'validation', null),
        'target_id', jsonb_build_object('data_type', 'uuid', 'label', 'Target ID', 'required', true, 'system', true, 'validation', null),
        'link_type', jsonb_build_object('data_type', 'text', 'label', 'Link Type', 'required', false, 'system', true, 'validation', null),
        'created_at', jsonb_build_object('data_type', 'datetime', 'label', 'Created', 'required', false, 'system', true, 'readonly', true, 'validation', null),
        'updated_at', jsonb_build_object('data_type', 'datetime', 'label', 'Updated', 'required', false, 'system', true, 'readonly', true, 'validation', null)
      ),
      'views', jsonb_build_object(
        'default_list', jsonb_build_object('type', 'list', 'display', 'table', 'label', 'Links',
          'fields', jsonb_build_object(
            'source_type', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'target_type', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'link_type', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'created_at', jsonb_build_object('sortable', true, 'display_type', 'datetime')
          )
        ),
        'default_detail', jsonb_build_object('type', 'detail', 'label', 'Link',
          'sections', jsonb_build_array(
            jsonb_build_object('title', 'Connection', 'fields', jsonb_build_array('source_type', 'source_id', 'target_type', 'target_id', 'link_type')),
            jsonb_build_object('title', 'Metadata', 'fields', jsonb_build_array('created_at', 'updated_at'))
          )
        )
      )
    ),
    '{}'::jsonb,
    'pack',
    true
  )

  ON CONFLICT (app_id, kind, slug) DO NOTHING;

    INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
  VALUES (
    gen_random_uuid(),
    v_spine_core_app_id,
    'attachment',
    'attachment',
    'Attachment',
    'File attachment with storage reference',
    jsonb_build_object(
      'scope', 'account',
      'record_permissions', jsonb_build_object('system_admin', ARRAY['create', 'read', 'update', 'delete']),
      'fields', jsonb_build_object(
        'filename', jsonb_build_object('data_type', 'text', 'label', 'Filename', 'required', true, 'system', true, 'validation', null),
        'file_size', jsonb_build_object('data_type', 'number', 'label', 'File Size', 'required', false, 'system', true, 'validation', null),
        'mime_type', jsonb_build_object('data_type', 'text', 'label', 'MIME Type', 'required', false, 'system', true, 'validation', null),
        'storage_path', jsonb_build_object('data_type', 'text', 'label', 'Storage Path', 'required', false, 'system', true, 'validation', null),
        'storage_provider', jsonb_build_object('data_type', 'text', 'label', 'Storage Provider', 'required', true, 'system', true, 'validation', null),
        'created_at', jsonb_build_object('data_type', 'datetime', 'label', 'Created', 'required', false, 'system', true, 'readonly', true, 'validation', null),
        'updated_at', jsonb_build_object('data_type', 'datetime', 'label', 'Updated', 'required', false, 'system', true, 'readonly', true, 'validation', null)
      ),
      'views', jsonb_build_object(
        'default_list', jsonb_build_object('type', 'list', 'display', 'table', 'label', 'Attachments',
          'fields', jsonb_build_object(
            'filename', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'file_size', jsonb_build_object('sortable', true, 'display_type', 'number'),
            'mime_type', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'created_at', jsonb_build_object('sortable', true, 'display_type', 'datetime')
          )
        ),
        'default_detail', jsonb_build_object('type', 'detail', 'label', 'Attachment',
          'sections', jsonb_build_array(
            jsonb_build_object('title', 'File', 'fields', jsonb_build_array('filename', 'file_size', 'mime_type', 'storage_provider')),
            jsonb_build_object('title', 'Storage', 'fields', jsonb_build_array('storage_path')),
            jsonb_build_object('title', 'Metadata', 'fields', jsonb_build_array('created_at', 'updated_at'))
          )
        )
      )
    ),
    '{}'::jsonb,
    'pack',
    true
  )

  ON CONFLICT (app_id, kind, slug) DO NOTHING;

    INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
  VALUES (
    gen_random_uuid(),
    v_spine_core_app_id,
    'watcher',
    'watcher',
    'Watcher',
    'Person watching an entity for notifications',
    jsonb_build_object(
      'scope', 'account',
      'record_permissions', jsonb_build_object('system_admin', ARRAY['create', 'read', 'update', 'delete']),
      'fields', jsonb_build_object(
        'target_type', jsonb_build_object('data_type', 'text', 'label', 'Target Type', 'required', true, 'system', true, 'validation', null),
        'target_id', jsonb_build_object('data_type', 'uuid', 'label', 'Target ID', 'required', true, 'system', true, 'validation', null),
        'person_id', jsonb_build_object('data_type', 'uuid', 'label', 'Person', 'required', true, 'system', true, 'validation', null),
        'watch_type', jsonb_build_object('data_type', 'text', 'label', 'Watch Type', 'required', true, 'system', true, 'validation', null),
        'notification_level', jsonb_build_object('data_type', 'text', 'label', 'Notification Level', 'required', true, 'system', true, 'validation', null),
        'created_at', jsonb_build_object('data_type', 'datetime', 'label', 'Created', 'required', false, 'system', true, 'readonly', true, 'validation', null),
        'updated_at', jsonb_build_object('data_type', 'datetime', 'label', 'Updated', 'required', false, 'system', true, 'readonly', true, 'validation', null)
      ),
      'views', jsonb_build_object(
        'default_list', jsonb_build_object('type', 'list', 'display', 'table', 'label', 'Watchers',
          'fields', jsonb_build_object(
            'target_type', jsonb_build_object('sortable', true, 'display_type', 'text'),
            'watch_type', jsonb_build_object('sortable', true, 'display_type', 'badge'),
            'notification_level', jsonb_build_object('sortable', true, 'display_type', 'badge'),
            'created_at', jsonb_build_object('sortable', true, 'display_type', 'datetime')
          )
        ),
        'default_detail', jsonb_build_object('type', 'detail', 'label', 'Watcher',
          'sections', jsonb_build_array(
            jsonb_build_object('title', 'Target', 'fields', jsonb_build_array('target_type', 'target_id')),
            jsonb_build_object('title', 'Settings', 'fields', jsonb_build_array('person_id', 'watch_type', 'notification_level')),
            jsonb_build_object('title', 'Metadata', 'fields', jsonb_build_array('created_at', 'updated_at'))
          )
        )
      )
    ),
    '{}'::jsonb,
    'pack',
    true
  )

  ON CONFLICT (app_id, kind, slug) DO NOTHING;

  -- Seed the runtime account type for the spine-system master account
  INSERT INTO public.types (id, app_id, kind, slug, name, description, design_schema, validation_schema, ownership, is_active)
  VALUES (
    gen_random_uuid(),
    v_spine_core_app_id,
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
  )
  ON CONFLICT (app_id, kind, slug) DO NOTHING;

  -- Seed the spine-system master account, stamping the account type's design/validation schema
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

    UPDATE public.accounts 
  SET type_id = (SELECT id FROM public.types WHERE slug = 'account' AND app_id = v_spine_core_app_id LIMIT 1)
  WHERE slug = 'spine-system';

END $$;

CREATE OR REPLACE FUNCTION public.get_account_apps(
  account_id uuid,
  include_system boolean DEFAULT true,
  include_inactive boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  slug text,
  name text,
  description text,
  icon text,
  color text,
  version text,
  app_type text,
  source text,
  owner_account_id uuid,
  is_active boolean,
  is_system boolean,
  min_role text,
  config jsonb,
  nav_items jsonb,
  route_prefix text,
  renderer text,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.name,
    a.description,
    a.icon,
    a.color,
    a.version,
    a.app_type,
    a.source,
    a.owner_account_id,
    a.is_active,
    a.is_system,
    a.min_role,
    a.config,
    a.nav_items,
    a.route_prefix,
    a.renderer,
    a.created_at
  FROM public.apps a
  WHERE
    (include_system OR a.is_system = false)
    AND (include_inactive OR a.is_active = true)
    AND (a.is_system OR a.owner_account_id = get_account_apps.account_id)
  ORDER BY
    a.is_system DESC,
    a.app_type,
    a.name;
END;
$function$;
-- CIL[DOC-VECTOR type="context" content="purpose='Seed Spine v2 core system data including built-in roles, core apps, system types, the spine-system master account, and the get_account_apps helper.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/003_core_system_data.sql:core_system_data:file"]
