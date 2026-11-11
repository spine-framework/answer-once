-- CIL[BEGIN stable_id="~/.framework/migrations/051_message_agent_fields.sql:message_agent_fields:file" type="file" identity="message_agent_fields" parent="~/.framework/migrations/051_message_agent_fields.sql"]
-- CIL[DOC-MACRO purpose="Declare agent-written data keys on support_reply/community_reply so read sanitize stops stripping citations and evidence metadata"]
-- CIL[DOC-RESPONSIBILITY responsibility="Merge the full set of agent-runner-written data fields into the support_reply and community_reply message types' design_schema.fields and validation_schema.fields"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/_shared/permissions.ts,.framework/functions/_shared/agent-runner.ts,custom/apps/demo/views/CustomerView.tsx,custom/apps/portal/pages/TicketsPage.tsx"]
-- CIL[DOC-CONTRACT inputs="none" outputs="support_reply/community_reply message rows (existing and new) expose cited_sources, evidence_state and tool-step keys on admin-data reads" errors="none — jsonb concat merge and restamp are idempotent" side_effects="customer transcripts render cited-source chips, the grounded badge, and step narration identically on the feed and self-poll paths"]
-- CIL[DOC-MICRO logic_summary="agent-runner persists cited_sources/evidence_state/tools_used/tool-step keys into message.data, but sanitizeRecordData drops undeclared data.* keys for non-system-admin readers — so fetchThreadMessages silently returned retrieved_sources-only rows and CustomerView fell back to rendering all retrieved candidates as cited chips (8 chips for 1 citation). Same failure mode as watcher.last_seen_at (048) and person geo fields (049). Field shape mirrors sibling retrieved_sources: system-stamped, read-only for every record role." notable_decisions="types are global (kind+slug unique) so updating support_reply/community_reply covers demo and portal installs; ao_ticket_message already declares the full set and is skipped"]
-- CIL[DOC-LEARNING topic="stamped_schema" content="Types gain fields on two levels: updating public.types.design_schema only helps NEW records — runtime records snapshot design_schema/validation_schema at creation and must be restamped (see scripts/restamp-ao-record-schemas.ts pattern). Separately, once a field has a validation_schema entry, admin-data display-formats it on read (formatFieldData stringifies json, booleans become 'Yes'/'No') — consumers must parse defensively"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.95" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

update public.types
set design_schema = jsonb_set(
      design_schema,
      '{fields}',
      (design_schema->'fields') || '{
        "cited_sources":     {"data_type":"json","label":"Cited Sources","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "evidence_state":    {"data_type":"text","label":"Evidence State","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "evidence_found":    {"data_type":"boolean","label":"Evidence Found","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "mean_similarity":   {"data_type":"number","label":"Mean Similarity","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "tools_used":        {"data_type":"json","label":"Tools Used","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "human_reply":       {"data_type":"boolean","label":"Human Reply","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "tool":              {"data_type":"text","label":"Tool","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "params":            {"data_type":"json","label":"Tool Params","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "tool_call_id":      {"data_type":"text","label":"Tool Call ID","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "result":            {"data_type":"json","label":"Tool Result","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "details_truncated": {"data_type":"boolean","label":"Details Truncated","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "error":             {"data_type":"text","label":"Error","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "max_turns":         {"data_type":"number","label":"Max Turns","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "turn_count":        {"data_type":"number","label":"Turn Count","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "phase":             {"data_type":"text","label":"Phase","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "analysis_summary":  {"data_type":"textarea","label":"Analysis Summary","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "case_analysis_id":  {"data_type":"text","label":"Case Analysis ID","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}},
        "confidence_score":  {"data_type":"number","label":"Confidence Score","system":true,"permissions":{"member":["read"],"support":["read"],"member_admin":["read"],"support_admin":["read"],"system_admin":["read"]}}
      }'::jsonb,
      true
    ),
    validation_schema = jsonb_set(
      coalesce(validation_schema, '{"fields":{}}'::jsonb),
      '{fields}',
      (coalesce(validation_schema, '{"fields":{}}'::jsonb)->'fields') || '{
        "cited_sources":     {"data_type":"json","required":false},
        "evidence_state":    {"data_type":"text","required":false},
        "evidence_found":    {"data_type":"boolean","required":false},
        "mean_similarity":   {"data_type":"number","required":false},
        "tools_used":        {"data_type":"json","required":false},
        "human_reply":       {"data_type":"boolean","required":false},
        "tool":              {"data_type":"text","required":false},
        "params":            {"data_type":"json","required":false},
        "tool_call_id":      {"data_type":"text","required":false},
        "result":            {"data_type":"json","required":false},
        "details_truncated": {"data_type":"boolean","required":false},
        "error":             {"data_type":"text","required":false},
        "max_turns":         {"data_type":"number","required":false},
        "turn_count":        {"data_type":"number","required":false},
        "phase":             {"data_type":"text","required":false},
        "analysis_summary":  {"data_type":"textarea","required":false},
        "case_analysis_id":  {"data_type":"text","required":false},
        "confidence_score":  {"data_type":"number","required":false}
      }'::jsonb,
      true
    )
where kind = 'message' and slug in ('support_reply', 'community_reply'); -- ref-optional: app-seeded types — no-op on databases without them

-- Restamp existing message records — design_schema/validation_schema are
-- snapshotted onto each record at creation, so the type-level update alone
-- leaves historical rows still stripping the new fields on read.
update public.messages m
set design_schema = t.design_schema,
    validation_schema = t.validation_schema
from public.types t
where m.type_id = t.id
  and t.kind = 'message'
  and t.slug in ('support_reply', 'community_reply');
-- CIL[END stable_id="~/.framework/migrations/051_message_agent_fields.sql:message_agent_fields:file"]
