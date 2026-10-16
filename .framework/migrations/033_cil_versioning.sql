-- CIL[BEGIN stable_id="~/.framework/migrations/033_cil_versioning.sql:cil_versioning:file" type="file" identity="cil_versioning" parent="~/.framework/migrations/033_cil_versioning.sql"]
-- CIL[DOC-MACRO purpose="Add manifest, diff, and customer/version packaging fields to CIL versioning schema"]
-- CIL[DOC-RESPONSIBILITY responsibility="Applies design_schema metadata updates for cil_version, cil_project, cil_file, and cil_chunk types"]
-- CIL[DOC-CONTEXT module="migrations" layer="data" related_files=".framework/migrations/033_cil_versioning.sql"]
-- CIL[DOC-CONTRACT inputs="spine-core app slug; existing public.types rows for cil_version, cil_project, cil_file, cil_chunk" outputs="updated design_schema with new fields" errors="app not found; type not found or missing design_schema fields" side_effects="modifies public.types.design_schema in place"]
-- CIL[DOC-MICRO logic_summary="Lookup the spine-core app id, then use jsonb_set to append new json/text/boolean fields to each target type's design_schema fields" notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL versioning schema: add manifest, diff, and customer/version packaging fields to existing CIL types.
-- This migration only updates design_schema metadata; runtime data is stored in items.data as jsonb.
DO $$
DECLARE
  v_spine_core_app_id uuid;
BEGIN
  SELECT id INTO v_spine_core_app_id FROM public.apps WHERE slug = 'spine-core' LIMIT 1;

  -- Extend cil_version with manifest, diff, and packaging fields
  UPDATE public.types
  SET design_schema = jsonb_set(
    design_schema,
    '{fields}'::text[],
    (design_schema->'fields') || '{
      "manifest": {"data_type": "json", "label": "Version Manifest", "required": false},
      "diff": {"data_type": "json", "label": "Version Diff", "required": false},
      "parent_version_id": {"data_type": "text", "label": "Parent Version ID", "required": false},
      "npm_name": {"data_type": "text", "label": "NPM Package Name", "required": false},
      "npm_version": {"data_type": "text", "label": "NPM Version", "required": false},
      "is_customer": {"data_type": "boolean", "label": "Is Customer Version", "required": false},
      "base_spine_version_id": {"data_type": "text", "label": "Base Spine Version ID", "required": false},
      "spine_source_version_id": {"data_type": "text", "label": "Spine Source Version ID", "required": false}
    }'::jsonb
  )
  WHERE kind = 'item' AND slug = 'cil_version' AND app_id = v_spine_core_app_id;

  -- Extend cil_project with customer versioning fields
  UPDATE public.types
  SET design_schema = jsonb_set(
    design_schema,
    '{fields}'::text[],
    (design_schema->'fields') || '{
      "installed_spine_version_id": {"data_type": "text", "label": "Installed Spine Version ID", "required": false},
      "target_spine_version_id": {"data_type": "text", "label": "Target Spine Version ID", "required": false},
      "customer_version_id": {"data_type": "text", "label": "Customer Version ID", "required": false},
      "customer_npm_name": {"data_type": "text", "label": "Customer NPM Name", "required": false},
      "customized_paths": {"data_type": "json", "label": "Customized Paths", "required": false},
      "pending_merges": {"data_type": "json", "label": "Pending Merges", "required": false}
    }'::jsonb
  )
  WHERE kind = 'item' AND slug = 'cil_project' AND app_id = v_spine_core_app_id;

  -- Extend cil_file and cil_chunk with spine/customer version tracking fields
  UPDATE public.types
  SET design_schema = jsonb_set(
    design_schema,
    '{fields}'::text[],
    (design_schema->'fields') || '{
      "spine_version_id": {"data_type": "text", "label": "Spine Version ID", "required": false},
      "customer_version_id": {"data_type": "text", "label": "Customer Version ID", "required": false},
      "customized": {"data_type": "boolean", "label": "Customized", "required": false},
      "pending_spine_version_id": {"data_type": "text", "label": "Pending Spine Version ID", "required": false},
      "pending_spine_source_id": {"data_type": "text", "label": "Pending Spine Source ID", "required": false}
    }'::jsonb
  )
  WHERE kind = 'item' AND slug IN ('cil_file', 'cil_chunk') AND app_id = v_spine_core_app_id;

END $$;
-- CIL[DOC-VECTOR type="context" content="purpose='Add manifest, diff, and customer/version packaging fields to CIL versioning schema'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/033_cil_versioning.sql:cil_versioning:file"]
