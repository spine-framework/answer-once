-- The attachments table carries no polymorphic target — "file belongs to
-- record" is expressed with the generic link layer, one convention every
-- app would otherwise re-derive: a has_attachment edge from the owning
-- record to the attachment row. Seeded globally on the spine-core app so
-- all installs share the same link type; per-app link types (jh-photo
-- style) still work alongside it for app-specific semantics.
--
-- ON CONFLICT keeps this idempotent on re-apply and on installs that
-- already created the same slug under spine-core.
DO $$
DECLARE
  v_app uuid;
BEGIN
  SELECT id INTO v_app FROM public.apps WHERE slug = 'spine-core' LIMIT 1;

  INSERT INTO public.link_types (app_id, slug, name, description, icon, color, config)
  VALUES (
    v_app,
    'has_attachment',
    'Attachment',
    'Links a record to one of its attachment files (source = record, target = attachment)',
    'paperclip',
    '#6b7280',
    '{"target_kind": "attachment"}'::jsonb
  )
  ON CONFLICT (app_id, slug) DO NOTHING;
END $$;
