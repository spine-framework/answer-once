-- CIL[BEGIN stable_id="~/.framework/migrations/016_cil_types.sql:cil_types:file" type="file" identity="cil_types" parent="~/.framework/migrations/016_cil_types.sql"]
-- CIL[DOC-MACRO purpose="Upsert core CIL runtime types and link relation types for spine-core"]
-- CIL[DOC-RESPONSIBILITY responsibility="Ensure public.types and public.link_types contain the CIL account, project, file, chunk, proposal, config, learning, version, suggestion, and link-type rows needed by the CIL pipeline"]
-- CIL[DOC-CONTEXT module="migrations" layer="framework" related_files=".framework/migrations/016_cil_types.sql"]
-- CIL[DOC-CONTRACT inputs="Existing public.apps row with slug 'spine-core'" outputs="Active type and link_type rows for all CIL kinds" errors="NULL app_id selected if spine-core app missing" side_effects="Inserts or updates rows in public.types and public.link_types"]
-- CIL[DOC-MICRO logic_summary="Resolves the spine-core app id, then loops through UPSERT statements for each CIL item type and each CIL link type using ON CONFLICT (kind, slug) / (app_id, slug)" notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL types: move to core, add version/suggestion types, align permissions and stable-ID fields.
-- This migration upserts types on (kind, slug) so existing CIL records keep their type_id.
DO $$
DECLARE
  v_spine_core_app_id uuid;
BEGIN
  SELECT id INTO v_spine_core_app_id FROM public.apps WHERE slug = 'spine-core' LIMIT 1;

INSERT INTO public.types (id, app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  gen_random_uuid(),
  v_spine_core_app_id,
  'item',
  'cil_project',
  'CIL Project',
  'A codebase registered in the Code Intelligence Layer for graph ingestion and analysis',
  'folder-git-2',
  '#6366F1',
  $DESIGN${"scope":"account","fields":{"repo_path":{"label":"Repository Path","data_type":"text","required":false},"language_mix":{"label":"Languages","data_type":"text","required":false},"file_count":{"label":"File Count","data_type":"number","required":false},"chunk_count":{"label":"Chunk Count","data_type":"number","required":false},"ingestion_status":{"label":"Ingestion Status","data_type":"select","options":[{"label":"Not Started","value":"not_started"},{"label":"In Progress","value":"in_progress"},{"label":"Complete","value":"complete"}],"required":false},"total_ingestion_cost_usd":{"label":"Total Ingestion Cost (USD)","data_type":"number","required":false},"last_ingested_at":{"label":"Last Ingested At","data_type":"text","required":false},"kb_type":{"label":"KB Type","data_type":"text","required":false},"npm_name":{"data_type":"text","label":"NPM Package Name","required":true},"canonical_root":{"data_type":"text","label":"Canonical Root","required":false},"active_version_id":{"data_type":"text","label":"Active Version ID","required":false},"default_version_id":{"data_type":"text","label":"Default Version ID","required":false},"dependencies":{"data_type":"json","label":"Dependencies","required":false}},"record_permissions":{"system_admin":["create","read","update","delete"],"engineering_admin":["create","read","update","delete"],"engineering":["create","read","update"],"devops":["create","read","update"],"product":["create","read","update"],"docs":["create","read","update"],"qa":["create","read","update"],"management":["create","read","update"],"support_admin":["create","read","update"],"support":["read"],"csm":["read"],"tam":["read"],"sales":["read"],"member_admin":["read","update"],"member":["read"]},"functionality":null,"vector_types":["semantic"]}$DESIGN$::jsonb,
  '{}'::jsonb,
  'tenant',
  true
)
ON CONFLICT (kind, slug) DO UPDATE SET
  app_id = EXCLUDED.app_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  ownership = EXCLUDED.ownership,
  is_active = EXCLUDED.is_active;

INSERT INTO public.types (id, app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  gen_random_uuid(),
  v_spine_core_app_id,
  'item',
  'cil_file',
  'CIL File',
  'A source file within a CIL project — tracks ingestion pass, hash, and dead code status',
  'file-code-2',
  '#8B5CF6',
  $DESIGN${"scope":"account","fields":{"file_path":{"label":"File Path","data_type":"text","required":false},"language":{"label":"Language","data_type":"text","required":false},"project_id":{"label":"Project ID","data_type":"text","required":false},"stored_hash":{"label":"Stored Hash","data_type":"text","required":false},"ingestion_pass":{"label":"Ingestion Pass","data_type":"number","required":false},"chunk_count":{"label":"Chunk Count","data_type":"number","required":false},"has_existing_markers":{"label":"Had Existing Markers","data_type":"boolean","required":false},"is_dead_code":{"label":"Dead Code","data_type":"boolean","required":false},"git_last_commit":{"label":"Git Last Commit","data_type":"text","required":false},"existing_marker_agreement_count":{"label":"Marker Agreement Count","data_type":"number","required":false},"existing_marker_disagreement_count":{"label":"Marker Disagreement Count","data_type":"number","required":false},"line_count":{"label":"Line Count","data_type":"number","required":false},"existing_marker_names":{"label":"Existing Marker Names","data_type":"text","required":false},"existing_marker_count":{"label":"Existing Marker Count","data_type":"number","required":false},"kb_type":{"label":"KB Type","data_type":"text","required":false},"stable_id":{"data_type":"text","label":"Stable ID","required":true},"version_id":{"data_type":"text","label":"Version ID","required":true},"file_hash":{"data_type":"text","label":"File Hash","required":false},"content_hash":{"data_type":"text","label":"Content Hash","required":false},"dead_reason":{"data_type":"text","label":"Dead Reason","required":false}},"record_permissions":{"system_admin":["create","read","update","delete"],"engineering_admin":["create","read","update","delete"],"engineering":["create","read","update"],"devops":["create","read","update"],"product":["create","read","update"],"docs":["create","read","update"],"qa":["create","read","update"],"management":["create","read","update"],"support_admin":["create","read","update"],"support":["read"],"csm":["read"],"tam":["read"],"sales":["read"],"member_admin":["read","update"],"member":["read"]},"functionality":null}$DESIGN$::jsonb,
  '{}'::jsonb,
  'tenant',
  true
)
ON CONFLICT (kind, slug) DO UPDATE SET
  app_id = EXCLUDED.app_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  ownership = EXCLUDED.ownership,
  is_active = EXCLUDED.is_active;

INSERT INTO public.types (id, app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  gen_random_uuid(),
  v_spine_core_app_id,
  'item',
  'cil_chunk',
  'CIL Chunk',
  'A semantically meaningful chunk within a CIL file — carries inline contract, hash, and graph edges',
  'code-2',
  '#10B981',
  $DESIGN${"scope":"account","fields":{"chunk_name":{"label":"Chunk Name","data_type":"text","required":false},"file_id":{"label":"File ID","data_type":"text","required":false},"project_id":{"label":"Project ID","data_type":"text","required":false},"file_path":{"label":"File Path","data_type":"text","required":false},"line_start":{"label":"Line Start","data_type":"number","required":false},"line_end":{"label":"Line End","data_type":"number","required":false},"chunk_type":{"label":"Chunk Type","data_type":"select","options":[{"label":"Function","value":"function"},{"label":"Class","value":"class"},{"label":"Interface","value":"interface"},{"label":"Type","value":"type"},{"label":"Component","value":"component"},{"label":"Hook","value":"hook"},{"label":"Route","value":"route"},{"label":"Config","value":"config"}],"required":false},"stored_hash":{"label":"Stored Hash","data_type":"text","required":false},"boundary_confidence":{"label":"Boundary Confidence","data_type":"select","options":[{"label":"High","value":"high"},{"label":"Low","value":"low"},{"label":"Human Verified","value":"human_verified"}],"required":false},"boundary_source":{"label":"Boundary Source","data_type":"select","options":[{"label":"AST Auto","value":"ast_auto"},{"label":"AST Approved","value":"ast_approved"},{"label":"Human Override","value":"human_override"}],"required":false},"review_status":{"label":"Review Status","data_type":"select","options":[{"label":"Pending Review","value":"pending_review"},{"label":"Approved","value":"approved"},{"label":"Rejected","value":"rejected"}],"required":false},"doc_confidence":{"label":"Doc Confidence","data_type":"select","options":[{"label":"AI Generated","value":"ai_generated"},{"label":"Human Verified","value":"human_verified"},{"label":"Unverified Legacy","value":"unverified_legacy"}],"required":false},"is_dead_code":{"label":"Dead Code","data_type":"boolean","required":false},"description":{"label":"Description","data_type":"textarea","required":false},"macro":{"label":"Macro (Purpose)","data_type":"text","required":false},"micro":{"label":"Micro (Detail)","data_type":"text","required":false},"input_spec":{"label":"Input Spec","data_type":"textarea","required":false},"output_spec":{"label":"Output Spec","data_type":"text","required":false},"throws":{"label":"Throws","data_type":"text","required":false},"side_effects":{"label":"Side Effects","data_type":"text","required":false},"calls":{"label":"Calls","data_type":"text","required":false},"called_by":{"label":"Called By","data_type":"text","required":false},"error_handling":{"label":"Error Handling","data_type":"text","required":false},"tags":{"label":"Tags","data_type":"text","required":false},"complexity":{"label":"Complexity","data_type":"select","options":[{"label":"Simple","value":"simple"},{"label":"Moderate","value":"moderate"},{"label":"Complex","value":"complex"}],"required":false},"stability":{"label":"Stability","data_type":"select","options":[{"label":"Stable","value":"stable"},{"label":"Internal","value":"internal"},{"label":"Experimental","value":"experimental"},{"label":"Deprecated","value":"deprecated"}],"required":false},"module":{"label":"Module Name","data_type":"text","required":false},"audience":{"label":"Audience","data_type":"select","options":[{"label":"Internal","value":"internal"},{"label":"External","value":"external"},{"label":"Both","value":"both"}],"required":false},"layer":{"label":"Layer","data_type":"select","options":[{"label":"Shared Core","value":"shared-core"},{"label":"App Specific","value":"app-specific"},{"label":"Infrastructure","value":"infrastructure"},{"label":"Test","value":"test"}],"required":false},"see_also":{"label":"See Also","data_type":"textarea","required":false},"doc_validation_errors":{"label":"Doc Validation Errors","data_type":"text","required":false},"test_unit_path":{"label":"Unit Test Path","data_type":"text","required":false},"test_e2e_path":{"label":"E2E Test Path","data_type":"text","required":false},"token_count":{"label":"Token Count","data_type":"number","required":false},"existing_marker_agreement":{"label":"Existing Marker Agreement","data_type":"select","options":[{"label":"None (no prior marker)","value":"none"},{"label":"Agreed","value":"agreed"},{"label":"Disagreed","value":"disagreed"}],"required":false},"code_content":{"label":"Code Content","data_type":"textarea","required":false},"hash_updated_at":{"label":"Hash Updated At","data_type":"text","required":false},"kb_type":{"label":"KB Type","data_type":"text","required":false},"stable_id":{"data_type":"text","label":"Stable ID","required":true},"version_id":{"data_type":"text","label":"Version ID","required":true},"parent_stable_id":{"data_type":"text","label":"Parent Stable ID","required":false},"content_hash":{"data_type":"text","label":"Content Hash","required":false},"file_hash":{"data_type":"text","label":"File Hash","required":false},"legacy_chunk_id":{"data_type":"text","label":"Legacy Chunk ID","required":false},"embedding_types":{"data_type":"json","label":"Embedding Types","required":false},"embedding_ids":{"data_type":"json","label":"Embedding IDs","required":false}},"record_permissions":{"system_admin":["create","read","update","delete"],"engineering_admin":["create","read","update","delete"],"engineering":["create","read","update"],"devops":["create","read","update"],"product":["create","read","update"],"docs":["create","read","update"],"qa":["create","read","update"],"management":["create","read","update"],"support_admin":["create","read","update"],"support":["read"],"csm":["read"],"tam":["read"],"sales":["read"],"member_admin":["read","update"],"member":["read"]},"functionality":null,"vector_types":["semantic","structural","contract"],"embedding_fields":{"structural":["chunk_type","file_path","stability","is_dead_code","boundary_confidence","doc_confidence","review_status"]}}$DESIGN$::jsonb,
  '{}'::jsonb,
  'tenant',
  true
)
ON CONFLICT (kind, slug) DO UPDATE SET
  app_id = EXCLUDED.app_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  ownership = EXCLUDED.ownership,
  is_active = EXCLUDED.is_active;

INSERT INTO public.types (id, app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  gen_random_uuid(),
  v_spine_core_app_id,
  'item',
  'cil_chunk_proposal',
  'CIL Chunk Proposal',
  'Staged low-confidence chunk boundary proposal awaiting human or Devin review before being written to source file',
  'git-pull-request',
  '#F59E0B',
  $DESIGN${"scope":"account","fields":{"file_id":{"label":"File ID","data_type":"text","required":false},"project_id":{"label":"Project ID","data_type":"text","required":false},"file_path":{"label":"File Path","data_type":"text","required":false},"proposed_name":{"label":"Proposed Chunk Name","data_type":"text","required":false},"line_start":{"label":"Line Start","data_type":"number","required":false},"line_end":{"label":"Line End","data_type":"number","required":false},"chunk_type":{"label":"Chunk Type","data_type":"text","required":false},"confidence_score":{"label":"Confidence Score","data_type":"number","required":false},"confidence_reasons":{"label":"Confidence Reasons","data_type":"text","required":false},"existing_marker_match":{"label":"Matches Existing Marker","data_type":"boolean","required":false},"existing_marker_name":{"label":"Existing Marker Name","data_type":"text","required":false},"review_status":{"label":"Review Status","data_type":"select","options":[{"label":"Pending Review","value":"pending_review"},{"label":"Approved","value":"approved"},{"label":"Rejected","value":"rejected"},{"label":"Merged","value":"merged"}],"required":false},"reviewed_by":{"label":"Reviewed By","data_type":"text","required":false},"reviewed_at":{"label":"Reviewed At","data_type":"text","required":false},"adjusted_line_start":{"label":"Adjusted Line Start","data_type":"number","required":false},"adjusted_line_end":{"label":"Adjusted Line End","data_type":"number","required":false},"token_count":{"label":"Token Count","data_type":"number","required":false},"code_preview":{"label":"Code Preview","data_type":"text","required":false},"stable_id":{"data_type":"text","label":"Stable ID","required":false},"version_id":{"data_type":"text","label":"Version ID","required":false}},"record_permissions":{"system_admin":["create","read","update","delete"],"engineering_admin":["create","read","update","delete"],"engineering":["create","read","update"],"devops":["create","read","update"],"product":["create","read","update"],"docs":["create","read","update"],"qa":["create","read","update"],"management":["create","read","update"],"support_admin":["create","read","update"],"support":["read"],"csm":["read"],"tam":["read"],"sales":["read"],"member_admin":["read","update"],"member":["read"]},"functionality":null}$DESIGN$::jsonb,
  '{}'::jsonb,
  'tenant',
  true
)
ON CONFLICT (kind, slug) DO UPDATE SET
  app_id = EXCLUDED.app_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  ownership = EXCLUDED.ownership,
  is_active = EXCLUDED.is_active;

INSERT INTO public.types (id, app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  gen_random_uuid(),
  v_spine_core_app_id,
  'item',
  'cil_config',
  'CIL Config',
  'Config field contract — what a setting means, what each value drives downstream, and how to query the current value',
  'settings-2',
  '#EF4444',
  $DESIGN${"scope":"account","fields":{"config_table":{"label":"Config Table","data_type":"text","required":false},"record_slug":{"label":"Record Slug","data_type":"text","required":false},"field_name":{"label":"Field Name","data_type":"text","required":false},"field_type":{"label":"Field Type","data_type":"text","required":false},"allowed_range":{"label":"Allowed Range","data_type":"text","required":false},"default_value":{"label":"Default Value","data_type":"text","required":false},"description":{"label":"Description","data_type":"text","required":false},"settings":{"label":"Settings (JSON)","data_type":"text","required":false},"current_value_query":{"label":"Current Value Query","data_type":"text","required":false},"current_value_query_type":{"label":"Query Type","data_type":"select","options":[{"label":"SQL","value":"sql"},{"label":"JSON Path","value":"json_path"},{"label":"Env Var","value":"env"}],"required":false},"code_edge_chunk_ids":{"label":"Code Edge Chunk IDs","data_type":"text","required":false},"project_id":{"label":"Project ID","data_type":"text","required":false}},"record_permissions":{"system_admin":["create","read","update","delete"],"engineering_admin":["create","read","update","delete"],"engineering":["create","read","update"],"devops":["create","read","update"],"product":["create","read","update"],"docs":["create","read","update"],"qa":["create","read","update"],"management":["create","read","update"],"support_admin":["create","read","update"],"support":["read"],"csm":["read"],"tam":["read"],"sales":["read"],"member_admin":["read","update"],"member":["read"]},"functionality":null,"vector_types":["semantic"]}$DESIGN$::jsonb,
  '{}'::jsonb,
  'tenant',
  true
)
ON CONFLICT (kind, slug) DO UPDATE SET
  app_id = EXCLUDED.app_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  ownership = EXCLUDED.ownership,
  is_active = EXCLUDED.is_active;

INSERT INTO public.types (id, app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  gen_random_uuid(),
  v_spine_core_app_id,
  'item',
  'cil_learning_proposal',
  'CIL Learning Proposal',
  'Developer-review queue entry for CIL learning extracted from a support case',
  'git-pull-request',
  '#10B981',
  $DESIGN${"scope":"account","fields":{"ticket_id":{"label":"Ticket ID","data_type":"text","required":false},"thread_id":{"label":"Thread ID","data_type":"text","required":false},"ai_message_id":{"label":"AI Message ID","data_type":"text","required":false},"proposed_summary":{"label":"Proposed Summary","data_type":"textarea","required":true},"source_message_ids":{"label":"Source Message IDs","data_type":"json","required":false},"source_chunk_ids":{"label":"Source Chunk IDs","data_type":"json","required":false},"proposed_tags":{"label":"Proposed Tags","data_type":"json","required":false},"status":{"label":"Status","data_type":"select","required":true,"options":[{"label":"Draft","value":"draft"},{"label":"Submitted for Developer Review","value":"submitted_for_developer_review"},{"label":"In Review","value":"in_review"},{"label":"Approved","value":"approved"},{"label":"Applied","value":"applied"},{"label":"Rejected","value":"rejected"}]},"submitted_at":{"label":"Submitted At","data_type":"text","required":false},"reviewed_by":{"label":"Reviewed By","data_type":"text","required":false},"review_notes":{"label":"Developer Review Notes","data_type":"textarea","required":false}},"record_permissions":{"system_admin":["create","read","update","delete"],"engineering_admin":["create","read","update","delete"],"engineering":["create","read","update"],"devops":["create","read","update"],"product":["create","read","update"],"docs":["create","read","update"],"qa":["create","read","update"],"management":["create","read","update"],"support_admin":["create","read","update"],"support":["read"],"csm":["read"],"tam":["read"],"sales":["read"],"member_admin":["read","update"],"member":["read"]},"functionality":null}$DESIGN$::jsonb,
  '{}'::jsonb,
  'system',
  true
)
ON CONFLICT (kind, slug) DO UPDATE SET
  app_id = EXCLUDED.app_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  ownership = EXCLUDED.ownership,
  is_active = EXCLUDED.is_active;

INSERT INTO public.types (id, app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  gen_random_uuid(),
  v_spine_core_app_id,
  'item',
  'cil_version',
  'CIL Version',
  'A published or iteration version of a CIL project, aligned to npm semver.',
  'tag',
  '#6366F1',
  $DESIGN${"scope":"account","fields":{"project_id":{"data_type":"text","label":"Project ID","required":true},"version":{"data_type":"text","label":"Version","required":true},"base_version":{"data_type":"text","label":"Base Version","required":false},"status":{"data_type":"select","label":"Status","required":true,"options":[{"label":"Active","value":"active"},{"label":"Inactive","value":"inactive"},{"label":"Archived","value":"archived"}]},"is_iteration":{"data_type":"boolean","label":"Is Iteration","required":true},"published_version_id":{"data_type":"text","label":"Published Version ID","required":false}},"record_permissions":{"system_admin":["create","read","update","delete"],"engineering_admin":["create","read","update","delete"],"engineering":["create","read","update"],"devops":["create","read","update"],"product":["create","read","update"],"docs":["create","read","update"],"qa":["create","read","update"],"management":["create","read","update"],"support_admin":["create","read","update"],"support":["read"],"csm":["read"],"tam":["read"],"sales":["read"],"member_admin":["read","update"],"member":["read"]},"functionality":null}$DESIGN$::jsonb,
  '{}'::jsonb,
  'tenant',
  true
)
ON CONFLICT (kind, slug) DO UPDATE SET
  app_id = EXCLUDED.app_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  ownership = EXCLUDED.ownership,
  is_active = EXCLUDED.is_active;

INSERT INTO public.types (id, app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  gen_random_uuid(),
  v_spine_core_app_id,
  'item',
  'cil_suggestion',
  'CIL Suggestion',
  'Pending AI or human suggestion for a CIL learning, note, or KB link awaiting review.',
  'lightbulb',
  '#F59E0B',
  $DESIGN${"scope":"account","fields":{"project_id":{"data_type":"text","label":"Project ID","required":true},"version_id":{"data_type":"text","label":"Version ID","required":false},"target_stable_id":{"data_type":"text","label":"Target Stable ID","required":false},"suggestion_type":{"data_type":"select","label":"Suggestion Type","required":true,"options":[{"label":"Learning","value":"learning"},{"label":"Note","value":"note"},{"label":"KB Link","value":"kb_link"}]},"content":{"data_type":"textarea","label":"Content","required":true},"source":{"data_type":"text","label":"Source","required":false},"confidence":{"data_type":"number","label":"Confidence","required":false},"status":{"data_type":"select","label":"Status","required":true,"options":[{"label":"Pending","value":"pending"},{"label":"Accepted","value":"accepted"},{"label":"Rejected","value":"rejected"},{"label":"Escalated","value":"escalated"}]},"proposed_by":{"data_type":"select","label":"Proposed By","required":false,"options":[{"label":"AI","value":"ai"},{"label":"Human","value":"human"},{"label":"System","value":"system"}]},"reviewed_by":{"data_type":"text","label":"Reviewed By","required":false},"reviewed_at":{"data_type":"text","label":"Reviewed At","required":false}},"record_permissions":{"system_admin":["create","read","update","delete"],"engineering_admin":["create","read","update","delete"],"engineering":["create","read","update"],"devops":["create","read","update"],"product":["create","read","update"],"docs":["create","read","update"],"qa":["create","read","update"],"management":["create","read","update"],"support_admin":["create","read","update"],"support":["read"],"csm":["read"],"tam":["read"],"sales":["read"],"member_admin":["read","update"],"member":["read"]},"functionality":null}$DESIGN$::jsonb,
  '{}'::jsonb,
  'tenant',
  true
)
ON CONFLICT (kind, slug) DO UPDATE SET
  app_id = EXCLUDED.app_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  ownership = EXCLUDED.ownership,
  is_active = EXCLUDED.is_active;

END $$;

-- CIL link types
DO $$
DECLARE v_spine_core_app_id uuid;
BEGIN
  SELECT id INTO v_spine_core_app_id FROM public.apps WHERE slug = 'spine-core' LIMIT 1;
INSERT INTO public.link_types (id, app_id, slug, name, description, is_active)
VALUES (gen_random_uuid(), v_spine_core_app_id, 'cil_calls', 'CIL Calls', 'Source chunk calls target chunk', true)
ON CONFLICT (app_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.link_types (id, app_id, slug, name, description, is_active)
VALUES (gen_random_uuid(), v_spine_core_app_id, 'cil_imports', 'CIL Imports', 'Source file imports target file or chunk', true)
ON CONFLICT (app_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.link_types (id, app_id, slug, name, description, is_active)
VALUES (gen_random_uuid(), v_spine_core_app_id, 'cil_parent_child', 'CIL Parent/Child', 'Source chunk contains or defines target child', true)
ON CONFLICT (app_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.link_types (id, app_id, slug, name, description, is_active)
VALUES (gen_random_uuid(), v_spine_core_app_id, 'cil_configures', 'CIL Configures', 'Source chunk reads or writes target config', true)
ON CONFLICT (app_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.link_types (id, app_id, slug, name, description, is_active)
VALUES (gen_random_uuid(), v_spine_core_app_id, 'cil_tests', 'CIL Tests', 'Source chunk tests target chunk', true)
ON CONFLICT (app_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.link_types (id, app_id, slug, name, description, is_active)
VALUES (gen_random_uuid(), v_spine_core_app_id, 'cil_kb_reference', 'CIL KB Reference', 'Source chunk references a KB article', true)
ON CONFLICT (app_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.link_types (id, app_id, slug, name, description, is_active)
VALUES (gen_random_uuid(), v_spine_core_app_id, 'cil_suggestion_target', 'CIL Suggestion Target', 'Suggestion targets a specific CIL chunk', true)
ON CONFLICT (app_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
END $$;
-- CIL[DOC-VECTOR type="context" content="purpose='Upsert core CIL runtime types and link relation types for spine-core'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/016_cil_types.sql:cil_types:file"]
