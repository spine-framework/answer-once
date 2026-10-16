-- 058_account_data_field_declarations.sql
-- CIL[BEGIN stable_id="~/.framework/migrations/058_account_data_field_declarations.sql:account_data_field_declarations:file" type="file" identity="account_data_field_declarations" parent="~/.framework/migrations"]
-- CIL[DOC-MACRO purpose="Declare the account.data extension fields that runtime code already writes"]
-- CIL[DOC-RESPONSIBILITY responsibility="Merge is_demo, demo_provisioned_at, geo_country, rate_limits, lifecycle_stage, segment, temperature into the account type design_schema.fields and re-stamp existing accounts"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/functions/admin-data.ts,.framework/functions/_shared/permissions.ts,custom/apps/demo/functions/custom_demo-journey.ts,.framework/migrations/037_kb_types_canonical.sql"]
-- CIL[DOC-CONTRACT inputs="types row kind='account' slug='account'; accounts rows with stamped design_schema" outputs="declared fields present on type schema and every account stamp" errors="none — merges are idempotent" side_effects="member/member_admin can now adminDataUpdate these account.data keys"]
-- CIL[DOC-MICRO logic_summary="admin-data field gate requires every key in an update's data object to be declared in the record's stamped design_schema.fields; these keys were historically written via raw adminDb so they were never declared. jsonb merge adds declarations without touching existing fields or record_permissions — declared fields inherit the record-level update grant." notable_decisions="no field-level permissions — member/member_admin already hold record-level update; no validation_schema regeneration needed (baseline is '{}' and sanitization is optional per-field); legacy demo_run_id/expires_at/demo_expired/expired_at deliberately NOT re-declared — provisioning scrubs them"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[END stable_id="~/.framework/migrations/058_account_data_field_declarations.sql:account_data_field_declarations:file"]
-- Account data fields historically written through raw adminDb were never
-- declared on the account type. admin-data's field gate (permissions.ts)
-- denies writes to undeclared fields, so provisioning a demo workspace as
-- member_admin 403s on accounts.data.is_demo. Declaring the fields is the
-- schema-correct fix: record_permissions already grant member/member_admin
-- update, and declared fields inherit it. Follows the 037 jsonb merge pattern.

-- 1. Declare the fields on the account type (covers accounts created later,
--    since account creation stamps the type's design_schema).
UPDATE public.types
SET design_schema = jsonb_set(
      design_schema,
      '{fields}',
      COALESCE(design_schema->'fields', '{}'::jsonb) || $F${
        "is_demo":             { "data_type": "boolean",  "label": "Demo Account",        "required": false },
        "demo_provisioned_at": { "data_type": "datetime", "label": "Demo Provisioned At", "required": false },
        "geo_country":         { "data_type": "text",     "label": "Geo Country",         "required": false },
        "rate_limits":         { "data_type": "json",     "label": "Rate Limits",         "required": false },
        "lifecycle_stage":     { "data_type": "text",     "label": "Lifecycle Stage",     "required": false },
        "segment":             { "data_type": "text",     "label": "Segment",             "required": false },
        "temperature":         { "data_type": "text",     "label": "Temperature",         "required": false }
      }$F$::jsonb,
      true
    )
WHERE kind = 'account' AND slug = 'account';

-- 2. Re-stamp existing accounts — the field gate reads the schema stamped on
--    the record at creation, so the types update alone only helps new rows.
UPDATE public.accounts
SET design_schema = jsonb_set(
      design_schema,
      '{fields}',
      COALESCE(design_schema->'fields', '{}'::jsonb) || $F${
        "is_demo":             { "data_type": "boolean",  "label": "Demo Account",        "required": false },
        "demo_provisioned_at": { "data_type": "datetime", "label": "Demo Provisioned At", "required": false },
        "geo_country":         { "data_type": "text",     "label": "Geo Country",         "required": false },
        "rate_limits":         { "data_type": "json",     "label": "Rate Limits",         "required": false },
        "lifecycle_stage":     { "data_type": "text",     "label": "Lifecycle Stage",     "required": false },
        "segment":             { "data_type": "text",     "label": "Segment",             "required": false },
        "temperature":         { "data_type": "text",     "label": "Temperature",         "required": false }
      }$F$::jsonb,
      true
    )
WHERE design_schema IS NOT NULL;
