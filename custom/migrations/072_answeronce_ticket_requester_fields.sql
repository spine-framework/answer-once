-- Migration 072: add requester/origin fields to ao_support_ticket.
-- createTicket now stamps requester_name, requester_email, account_name, and
-- referring_site at creation so pipeline templates and integrations read them
-- via {{record.*}} without joining people/accounts. The seed declares the
-- fields; this migration restamps existing installs' type rows (and the schema
-- copies carried by already-created ticket items) so a plain re-seed finds the
-- row identical instead of stopping on owned-type drift.
-- Merge is additive and idempotent: seed-first installs (types seeded before
-- custom migrations run) re-apply identical values harmlessly.

UPDATE public.types
SET design_schema = jsonb_set(design_schema, '{fields}',
        COALESCE(design_schema->'fields', '{}'::jsonb) || '{
          "requester_name":  {"label": "Requester Name",  "data_type": "text", "required": false},
          "requester_email": {"label": "Requester Email", "data_type": "text", "required": false},
          "account_name":    {"label": "Company",         "data_type": "text", "required": false},
          "referring_site":  {"label": "Referring Site",  "data_type": "text", "required": false}
        }'::jsonb, true),
    validation_schema = jsonb_set(COALESCE(validation_schema, '{}'::jsonb), '{fields}',
        COALESCE(validation_schema->'fields', '{}'::jsonb) || '{
          "requester_name":  {"data_type": "text", "required": false},
          "requester_email": {"data_type": "text", "required": false},
          "account_name":    {"data_type": "text", "required": false},
          "referring_site":  {"data_type": "text", "required": false}
        }'::jsonb, true)
WHERE kind = 'item' AND slug = 'ao_support_ticket';

-- Detail-view field list. Skipped on drifted rows lacking the expected shape —
-- seed --reconcile-owned-types remains the path for those.
UPDATE public.types
SET design_schema = jsonb_set(design_schema, '{views,default_detail,sections,0,fields}',
        design_schema->'views'->'default_detail'->'sections'->0->'fields' || '{
          "requester_name": {}, "requester_email": {}, "account_name": {}, "referring_site": {}
        }'::jsonb, true)
WHERE kind = 'item' AND slug = 'ao_support_ticket'
  AND jsonb_typeof(design_schema->'views'->'default_detail'->'sections'->0->'fields') = 'object';

UPDATE public.items i
SET design_schema = jsonb_set(i.design_schema, '{fields}',
        COALESCE(i.design_schema->'fields', '{}'::jsonb) || '{
          "requester_name":  {"label": "Requester Name",  "data_type": "text", "required": false},
          "requester_email": {"label": "Requester Email", "data_type": "text", "required": false},
          "account_name":    {"label": "Company",         "data_type": "text", "required": false},
          "referring_site":  {"label": "Referring Site",  "data_type": "text", "required": false}
        }'::jsonb, true),
    validation_schema = jsonb_set(COALESCE(i.validation_schema, '{}'::jsonb), '{fields}',
        COALESCE(i.validation_schema->'fields', '{}'::jsonb) || '{
          "requester_name":  {"data_type": "text", "required": false},
          "requester_email": {"data_type": "text", "required": false},
          "account_name":    {"data_type": "text", "required": false},
          "referring_site":  {"data_type": "text", "required": false}
        }'::jsonb, true)
WHERE i.type_id = (SELECT id FROM public.types WHERE kind = 'item' AND slug = 'ao_support_ticket');

UPDATE public.items i
SET design_schema = jsonb_set(i.design_schema, '{views,default_detail,sections,0,fields}',
        i.design_schema->'views'->'default_detail'->'sections'->0->'fields' || '{
          "requester_name": {}, "requester_email": {}, "account_name": {}, "referring_site": {}
        }'::jsonb, true)
WHERE i.type_id = (SELECT id FROM public.types WHERE kind = 'item' AND slug = 'ao_support_ticket')
  AND jsonb_typeof(i.design_schema->'views'->'default_detail'->'sections'->0->'fields') = 'object';
