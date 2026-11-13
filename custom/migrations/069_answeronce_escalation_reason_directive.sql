-- CIL[BEGIN stable_id="~/custom/migrations/069_answeronce_escalation_reason_directive.sql:answeronce_escalation_reason_directive:file" type="file" identity="answeronce_escalation_reason_directive" parent="~/custom/migrations"]
-- Migration 069: add 'directive' to ao_support_ticket.aim_escalation_reason
-- apply_directive's record_ops.escalate stamps aim_escalation_reason='directive'
-- via handleEscalation; without the option the select renders/validates the
-- value as unknown. Applied to the type row and to already-created ticket
-- items, which carry stamped copies of design_schema/validation_schema.

UPDATE public.types
SET
  design_schema = jsonb_set(
    design_schema,
    '{fields,aim_escalation_reason,options}',
    COALESCE(design_schema #> '{fields,aim_escalation_reason,options}', '[]'::jsonb)
      || CASE
           WHEN design_schema #> '{fields,aim_escalation_reason,options}' @> '[{"value":"directive"}]'::jsonb
           THEN '[]'::jsonb
           ELSE '[{"label":"Directive","value":"directive"}]'::jsonb
         END,
    true
  ),
  validation_schema = jsonb_set(
    validation_schema,
    '{fields,aim_escalation_reason,options}',
    COALESCE(validation_schema #> '{fields,aim_escalation_reason,options}', '[]'::jsonb)
      || CASE
           WHEN validation_schema #> '{fields,aim_escalation_reason,options}' @> '[{"value":"directive"}]'::jsonb
           THEN '[]'::jsonb
           ELSE '[{"label":"Directive","value":"directive"}]'::jsonb
         END,
    true
  )
WHERE kind = 'item' AND slug = 'ao_support_ticket';

UPDATE public.items i
SET
  design_schema = jsonb_set(
    i.design_schema,
    '{fields,aim_escalation_reason,options}',
    COALESCE(i.design_schema #> '{fields,aim_escalation_reason,options}', '[]'::jsonb)
      || CASE
           WHEN i.design_schema #> '{fields,aim_escalation_reason,options}' @> '[{"value":"directive"}]'::jsonb
           THEN '[]'::jsonb
           ELSE '[{"label":"Directive","value":"directive"}]'::jsonb
         END,
    true
  ),
  validation_schema = jsonb_set(
    i.validation_schema,
    '{fields,aim_escalation_reason,options}',
    COALESCE(i.validation_schema #> '{fields,aim_escalation_reason,options}', '[]'::jsonb)
      || CASE
           WHEN i.validation_schema #> '{fields,aim_escalation_reason,options}' @> '[{"value":"directive"}]'::jsonb
           THEN '[]'::jsonb
           ELSE '[{"label":"Directive","value":"directive"}]'::jsonb
         END,
    true
  )
WHERE i.type_id = (SELECT id FROM public.types WHERE kind = 'item' AND slug = 'ao_support_ticket')
  AND i.design_schema IS NOT NULL;
-- CIL[END stable_id="~/custom/migrations/069_answeronce_escalation_reason_directive.sql:answeronce_escalation_reason_directive:file"]
