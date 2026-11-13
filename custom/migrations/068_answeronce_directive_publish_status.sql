-- CIL[BEGIN stable_id="~/custom/migrations/068_answeronce_directive_publish_status.sql:answeronce_directive_publish_status:file" type="file" identity="answeronce_directive_publish_status" parent="~/custom/migrations"]
-- Migration 068: mark ao_triage_directive embeddings as keyed on status='active'
-- kbIngest gates on record.status === 'published' by default; directives use
-- 'active', so the ao_directive_* triggers "completed" while writing zero
-- embeddings. kbIngest now honors functionality.kb.publish_status — stamp it on
-- the type (and any already-created directive items, which carry a schema copy).

UPDATE public.types
SET design_schema = jsonb_set(design_schema, '{functionality,kb,publish_status}', '"active"'::jsonb, true)
WHERE kind = 'item' AND slug = 'ao_triage_directive';

UPDATE public.items i
SET design_schema = jsonb_set(i.design_schema, '{functionality,kb,publish_status}', '"active"'::jsonb, true)
WHERE i.type_id = (SELECT id FROM public.types WHERE kind = 'item' AND slug = 'ao_triage_directive');
-- CIL[END stable_id="~/custom/migrations/068_answeronce_directive_publish_status.sql:answeronce_directive_publish_status:file"]
