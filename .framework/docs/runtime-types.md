<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:module_header:module_header" type="module_header" identity="module_header" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Catalog every active runtime type in the Spine database with its design_schema contract and the code that stamps and consumes it"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Provide a single searchable reference for the design_schema fields, views, permissions, and special keys required by each runtime type"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="searchable markdown catalog of runtime types" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="One chunk per active type describing scope, fields, views, record_permissions, special keys, stamper, and consumers" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Content is derived from the live types table in Supabase project jyanuujwuuxhklpusssy. Seed files may contain additional inactive type definitions."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Generated manifest used as RAG source for design_schema troubleshooting."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps developers and AI agents answer questions like what fields does a support_ticket need or which code consumes design_schema.pipeline."] -->

# Runtime Type Catalog

This catalog documents the `design_schema` contract for every active type in the `spine-dev` (`jyanuujwuuxhklpusssy`) `types` table.

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:module_header:module_header"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:account:runtime_type" type="runtime_type" identity="account" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type account/account (account)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for account/account"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for account/account" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for account/account" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions account/account requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:account/account" content="kind=account slug=account scope=account fields=[created_at(datetime,system label:Created); description(textarea,system label:Description); display_name(text,required,system label:Display Name); is_active(boolean,required,system label:Active); slug(text,required,system label:Slug); updated_at(datetime,system label:Updated)] views=[default_detail:detailAccount/sections=Overview(slug,display_name,description,is_active);Metadata(created_at,updated_at); default_list:listtable/Accounts/fields=display_name[text,sortable],is_active[badge,sortable],slug[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## account/account — account

- **Scope:** account
- **Fields:** 6 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:account:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:attachment:runtime_type" type="runtime_type" identity="attachment" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type attachment/attachment (attachment)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for attachment/attachment"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for attachment/attachment" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for attachment/attachment" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions attachment/attachment requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:attachment/attachment" content="kind=attachment slug=attachment scope=account fields=[created_at(datetime,system label:Created); file_size(number,system label:File Size); filename(text,required,system label:Filename); mime_type(text,system label:MIME Type); storage_path(text,system label:Storage Path); storage_provider(text,required,system label:Storage Provider); updated_at(datetime,system label:Updated)] views=[default_detail:detailAttachment/sections=File(filename,file_size,mime_type,storage_provider);Storage(storage_path);Metadata(created_at,updated_at); default_list:listtable/Attachments/fields=created_at[datetime,sortable],file_size[number,sortable],filename[text,sortable],mime_type[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## attachment/attachment — attachment

- **Scope:** account
- **Fields:** 7 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:attachment:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:activity_log:runtime_type" type="runtime_type" identity="activity_log" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/activity_log (activity_log)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/activity_log"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/activity_log" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/activity_log" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/activity_log requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/activity_log" content="kind=item slug=activity_log scope=account fields=[action(text,required label:Action); new_score(number label:New Score); new_stage(text label:New Stage); score_delta(number label:Score Change); signal_type(text label:Signal Type)] views=[default_detail:detailActivity Log/sections=Action(action,signal_type);Impact(score_delta,new_score,new_stage); default_list:listtable/Activity Logs/fields=action[badge,sortable],created_at[datetime,sortable],signal_type[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/activity_log — activity_log

- **Scope:** account
- **Fields:** 5 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:activity_log:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:ai_feedback_record:runtime_type" type="runtime_type" identity="ai_feedback_record" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/ai_feedback_record (ai_feedback_record)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/ai_feedback_record"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/ai_feedback_record" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/ai_feedback_record" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/ai_feedback_record requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/ai_feedback_record" content="kind=item slug=ai_feedback_record scope=account fields=[ai_confidence(number label:AI Confidence); ai_message_id(text label:AI Message ID); customer_feedback(select options:Helpful/Not Helpful label:Customer Feedback); human_edits_made(boolean default:false label:Human Edits Made); human_message_id(text label:Human Message ID); kb_article_id(text label:KB Article ID); kb_candidate(boolean label:KB Candidate); retrieval_confidence(number label:Retrieval Confidence); retrieved_sources(json label:Retrieved Sources); reuse_count(number default:0 label:Reuse Count); thread_id(text label:Thread ID)] record_permissions=[support:read; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/ai_feedback_record — ai_feedback_record

- **Scope:** account
- **Fields:** 11 fields
- **Record permissions:** 3 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:ai_feedback_record:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:anonymous_session:runtime_type" type="runtime_type" identity="anonymous_session" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/anonymous_session (anonymous_session)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/anonymous_session"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/anonymous_session" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/anonymous_session" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/anonymous_session requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/anonymous_session" content="kind=item slug=anonymous_session scope=system fields=[anonymous_id(text label:Anonymous ID); landing_page(text label:Landing Page); rating(number label:Rating); referrer_domain(text label:Referrer Domain); referrer_url(text label:Referrer URL); session_depth(number label:Session Depth); utm_campaign(text label:UTM Campaign); utm_medium(text label:UTM Medium); utm_source(text label:UTM Source)] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/anonymous_session — anonymous_session

- **Scope:** system
- **Fields:** 9 fields
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:anonymous_session:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:bug_ticket:runtime_type" type="runtime_type" identity="bug_ticket" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/bug_ticket (bug_ticket)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/bug_ticket"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/bug_ticket" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/bug_ticket" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/bug_ticket requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/bug_ticket" content="kind=item slug=bug_ticket scope=account fields=[affected_components(json default:[] label:Affected UI Components); affected_fields(json default:[] label:Affected DB Fields); affected_files(json default:[] label:Affected Files); affected_functions(json default:[] label:Affected Functions); affected_tables(json default:[] label:Affected DB Tables); ai_confidence(number label:AI Attribution Confidence); assignee_id(text label:Assignee Person ID); description(textarea label:Description); error_signals(json default:[] label:Error Signals / Logs); external_ticket_id(text label:External Ticket ID (e.g. Jira)); external_ticket_url(text label:External Ticket URL); kb_article_id(text label:Related KB Article ID); proposed_fix_area(text label:Proposed Fix Area); reproduction_steps(textarea label:Reproduction Steps); severity(select,required options:Critical/High/Medium/Low label:Severity); status(select,required options:Open/In Review/Confirmed/In Progress/Resolved/Won't Fix label:Status); support_ticket_id(text label:Source Support Ticket ID); title(text,required label:Title)] views=[default_list:listtable/Bug Tickets/fields=severity[badge,sortable],status[badge,sortable],title[text,sortable]] record_permissions=[support:read; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="no default_detail view; GenericDetailPage may fail to render unless useSchemaRecord provides a fallback"] -->

## item/bug_ticket — bug_ticket

- **Scope:** account
- **Fields:** 18 fields
- **Views:** default_list
- **Record permissions:** 3 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:bug_ticket:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:cil_chunk:runtime_type" type="runtime_type" identity="cil_chunk" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/cil_chunk (cil_chunk)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/cil_chunk"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/cil_chunk" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/cil_chunk" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/cil_chunk requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/cil_chunk" content="kind=item slug=cil_chunk scope=account fields=[audience(select options:Internal/External/Both label:Audience); boundary_confidence(select options:High/Low/Human Verified label:Boundary Confidence); boundary_source(select options:AST Auto/AST Approved/Human Override label:Boundary Source); called_by(text label:Called By); calls(text label:Calls); chunk_name(text label:Chunk Name); chunk_type(select options:Function/Class/Interface/Type/Component/Hook/Route/Config label:Chunk Type); code_content(textarea label:Code Content); complexity(select options:Simple/Moderate/Complex label:Complexity); description(textarea label:Description); doc_confidence(select options:AI Generated/Human Verified/Unverified Legacy label:Doc Confidence); doc_validation_errors(text label:Doc Validation Errors); error_handling(text label:Error Handling); existing_marker_agreement(select options:None (no prior marker)/Agreed/Disagreed label:Existing Marker Agreement); file_id(text label:File ID); file_path(text label:File Path); hash_updated_at(text label:Hash Updated At); input_spec(textarea label:Input Spec); is_dead_code(boolean label:Dead Code); kb_type(text label:KB Type); layer(select options:Shared Core/App Specific/Infrastructure/Test label:Layer); line_end(number label:Line End); line_start(number label:Line Start); macro(text label:Macro (Purpose)); micro(text label:Micro (Detail)); module(text label:Module Name); output_spec(text label:Output Spec); project_id(text label:Project ID); review_status(select options:Pending Review/Approved/Rejected label:Review Status); see_also(textarea label:See Also); side_effects(text label:Side Effects); stability(select options:Stable/Internal/Experimental/Deprecated label:Stability); stored_hash(text label:Stored Hash); tags(text label:Tags); test_e2e_path(text label:E2E Test Path); test_unit_path(text label:Unit Test Path); throws(text label:Throws); token_count(number label:Token Count)] record_permissions=[support_admin:create/read/update; system_admin:create/read/update/delete] vector_types=[semantic,structural,contract]; embedding_fields={structural=chunk_type,file_path,stability,is_dead_code,boundary_confidence,doc_confidence,review_status} stamped_by=custom/apps/cortex/mcp/tools/pipeline.ts resolves type and stamps design_schema; also .framework/functions/admin-data.ts create consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback),.framework/functions/embeddings.ts (vector_types, embedding_fields)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="vector_types controls which embedding builders run; unsupported vector type names cause embeddings.ts to log an error and skip"] -->

## item/cil_chunk — cil_chunk

- **Scope:** account
- **Fields:** 38 fields
- **Record permissions:** 2 roles
- **Special keys:** vector_types=[semantic,structural,contract]; embedding_fields={structural=chunk_type,file_path,stability,is_dead_code,boundary_confidence,doc_confidence,review_status}
- **Stamped by:** custom/apps/cortex/mcp/tools/pipeline.ts resolves type and stamps design_schema; also .framework/functions/admin-data.ts create
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback), .framework/functions/embeddings.ts (vector_types, embedding_fields)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:cil_chunk:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:cil_chunk_proposal:runtime_type" type="runtime_type" identity="cil_chunk_proposal" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/cil_chunk_proposal (cil_chunk_proposal)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/cil_chunk_proposal"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/cil_chunk_proposal" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/cil_chunk_proposal" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/cil_chunk_proposal requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/cil_chunk_proposal" content="kind=item slug=cil_chunk_proposal scope=account fields=[adjusted_line_end(number label:Adjusted Line End); adjusted_line_start(number label:Adjusted Line Start); chunk_type(text label:Chunk Type); code_preview(text label:Code Preview); confidence_reasons(text label:Confidence Reasons); confidence_score(number label:Confidence Score); existing_marker_match(boolean label:Matches Existing Marker); existing_marker_name(text label:Existing Marker Name); file_id(text label:File ID); file_path(text label:File Path); line_end(number label:Line End); line_start(number label:Line Start); project_id(text label:Project ID); proposed_name(text label:Proposed Chunk Name); review_status(select options:Pending Review/Approved/Rejected/Merged label:Review Status); reviewed_at(text label:Reviewed At); reviewed_by(text label:Reviewed By); token_count(number label:Token Count)] record_permissions=[support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/cil_chunk_proposal — cil_chunk_proposal

- **Scope:** account
- **Fields:** 18 fields
- **Record permissions:** 2 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:cil_chunk_proposal:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:cil_config:runtime_type" type="runtime_type" identity="cil_config" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/cil_config (cil_config)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/cil_config"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/cil_config" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/cil_config" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/cil_config requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/cil_config" content="kind=item slug=cil_config scope=account fields=[allowed_range(text label:Allowed Range); code_edge_chunk_ids(text label:Code Edge Chunk IDs); config_table(text label:Config Table); current_value_query(text label:Current Value Query); current_value_query_type(select options:SQL/JSON Path/Env Var label:Query Type); default_value(text label:Default Value); description(text label:Description); field_name(text label:Field Name); field_type(text label:Field Type); project_id(text label:Project ID); record_slug(text label:Record Slug); settings(text label:Settings (JSON))] record_permissions=[support_admin:create/read/update; system_admin:create/read/update/delete] vector_types=[semantic] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback),.framework/functions/embeddings.ts (vector_types, embedding_fields)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="vector_types controls which embedding builders run; unsupported vector type names cause embeddings.ts to log an error and skip"] -->

## item/cil_config — cil_config

- **Scope:** account
- **Fields:** 12 fields
- **Record permissions:** 2 roles
- **Special keys:** vector_types=[semantic]
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback), .framework/functions/embeddings.ts (vector_types, embedding_fields)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:cil_config:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:cil_file:runtime_type" type="runtime_type" identity="cil_file" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/cil_file (cil_file)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/cil_file"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/cil_file" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/cil_file" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/cil_file requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/cil_file" content="kind=item slug=cil_file scope=account fields=[chunk_count(number label:Chunk Count); existing_marker_agreement_count(number label:Marker Agreement Count); existing_marker_count(number label:Existing Marker Count); existing_marker_disagreement_count(number label:Marker Disagreement Count); existing_marker_names(text label:Existing Marker Names); file_path(text label:File Path); git_last_commit(text label:Git Last Commit); has_existing_markers(boolean label:Had Existing Markers); ingestion_pass(number label:Ingestion Pass); is_dead_code(boolean label:Dead Code); kb_type(text label:KB Type); language(text label:Language); line_count(number label:Line Count); project_id(text label:Project ID); stored_hash(text label:Stored Hash)] record_permissions=[support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=custom/apps/cortex/mcp/tools/pipeline.ts resolves type and stamps design_schema; also .framework/functions/admin-data.ts create consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/cil_file — cil_file

- **Scope:** account
- **Fields:** 15 fields
- **Record permissions:** 2 roles
- **Stamped by:** custom/apps/cortex/mcp/tools/pipeline.ts resolves type and stamps design_schema; also .framework/functions/admin-data.ts create
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:cil_file:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:cil_project:runtime_type" type="runtime_type" identity="cil_project" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/cil_project (cil_project)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/cil_project"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/cil_project" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/cil_project" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/cil_project requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/cil_project" content="kind=item slug=cil_project scope=account fields=[chunk_count(number label:Chunk Count); file_count(number label:File Count); ingestion_status(select options:Not Started/In Progress/Complete label:Ingestion Status); kb_type(text label:KB Type); language_mix(text label:Languages); last_ingested_at(text label:Last Ingested At); repo_path(text label:Repository Path); total_ingestion_cost_usd(number label:Total Ingestion Cost (USD))] record_permissions=[support_admin:create/read/update; system_admin:create/read/update/delete] vector_types=[semantic] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback),.framework/functions/embeddings.ts (vector_types, embedding_fields)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="vector_types controls which embedding builders run; unsupported vector type names cause embeddings.ts to log an error and skip"] -->

## item/cil_project — cil_project

- **Scope:** account
- **Fields:** 8 fields
- **Record permissions:** 2 roles
- **Special keys:** vector_types=[semantic]
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback), .framework/functions/embeddings.ts (vector_types, embedding_fields)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:cil_project:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:community_post:runtime_type" type="runtime_type" identity="community_post" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/community_post (community_post)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/community_post"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/community_post" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/community_post" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/community_post requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/community_post" content="kind=item slug=community_post scope=platform fields=[accepted_answer_id(text label:Accepted Answer); channel(select,required options:General/Announcements/Help/Show and Tell label:Channel); content(textarea,required label:Content); context(select,required options:Support/Community label:Context); helpful_count(number default:0 label:Helpful Votes); moderation_status(select options:Pending/Approved/Flagged label:Moderation Status); not_helpful_count(number default:0 label:Not Helpful Votes); title(text,required label:Title)] views=[default_detail:detailCommunity Post/sections=Content(title,content,channel,context);Moderation(moderation_status,helpful_count,not_helpful_count,accepted_answer_id); default_list:listtable/Community Posts/fields=channel[badge,sortable],moderation_status[badge,sortable],title[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/community_post — community_post

- **Scope:** platform
- **Fields:** 8 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:community_post:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:course_lesson:runtime_type" type="runtime_type" identity="course_lesson" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/course_lesson (course_lesson)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/course_lesson"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/course_lesson" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/course_lesson" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/course_lesson requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/course_lesson" content="kind=item slug=course_lesson scope=platform fields=[content(textarea label:Content); estimated_duration(number label:Estimated Duration (minutes)); prerequisites(json default:[] label:Prerequisite Lesson IDs); progress_required(boolean default:false label:Progress Required to Continue); sequence(number,required default:0 label:Sequence Order); title(text,required label:Title); video_url(text label:Video URL)] views=[default_detail:detailCourse Lesson/sections=Content(title,content,video_url,estimated_duration);Settings(sequence,progress_required,prerequisites); default_list:listtable/Course Lessons/fields=estimated_duration[number,sortable],sequence[number,sortable],title[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] vector_types=[semantic,structure,summary,intent,cause,procedure,outcome]; embedding_fields={structure=course_title,course_id,sequence,estimated_duration,prerequisites} stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback),.framework/functions/embeddings.ts (vector_types, embedding_fields)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="vector_types controls which embedding builders run; unsupported vector type names cause embeddings.ts to log an error and skip"] -->

## item/course_lesson — course_lesson

- **Scope:** platform
- **Fields:** 7 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Special keys:** vector_types=[semantic,structure,summary,intent,cause,procedure,outcome]; embedding_fields={structure=course_title,course_id,sequence,estimated_duration,prerequisites}
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback), .framework/functions/embeddings.ts (vector_types, embedding_fields)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:course_lesson:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:csm_health:runtime_type" type="runtime_type" identity="csm_health" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/csm_health (csm_health)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/csm_health"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/csm_health" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/csm_health" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/csm_health requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/csm_health" content="kind=item slug=csm_health scope=account fields=[account_id(text,required label:Customer Account); adoption_score(number label:Adoption Score (0-100)); churn_risk_score(number label:Churn Risk Score (0-100)); notes(textarea label:CSM Notes); nps_score(number label:NPS Score (-100 to 100)); temperature(select,required options:Green/Yellow/Red label:Health Temperature)] views=[default_detail:detailHealth Record/sections=Health(temperature,churn_risk_score,adoption_score,nps_score);Account(account_id,notes); default_list:listtable/Health Records/fields=account_id[text,sortable],churn_risk_score[number,sortable],nps_score[number,sortable],temperature[badge,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/csm_health — csm_health

- **Scope:** account
- **Fields:** 6 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:csm_health:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:deal:runtime_type" type="runtime_type" identity="deal" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/deal (deal)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/deal"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/deal" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/deal" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/deal requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/deal" content="kind=item slug=deal scope=account fields=[account_id(text label:Company); close_date(date label:Expected Close Date); owner_person_id(text label:Deal Owner); probability(number label:Probability %); source(select options:Inbound/Outbound/Referral/Event/Paid/Organic label:Lead Source); stage(select,required options:Prospecting/Qualification/Proposal/Negotiation/Closed Won/Closed Lost label:Stage); value(number label:Deal Value (USD))] views=[default_detail:detailDeal/sections=Deal Info(stage,value,close_date,probability,source);Ownership(owner_person_id,account_id); default_list:listtable/Deals/fields=close_date[date,sortable],probability[percentage,sortable],stage[badge,sortable],value[currency,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/deal — deal

- **Scope:** account
- **Fields:** 7 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:deal:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:eval_test_case:runtime_type" type="runtime_type" identity="eval_test_case" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/eval_test_case (eval_test_case)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/eval_test_case"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/eval_test_case" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/eval_test_case" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/eval_test_case requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/eval_test_case" content="kind=item slug=eval_test_case scope=platform fields=[excluded_source_ids(json default:[] label:Must NOT Retrieve); expected_escalate(boolean default:false label:Should Escalate); expected_source_ids(json default:[] label:Expected Source IDs); expected_tier(select options:High/Medium/Low label:Expected Confidence Tier); question(text,required label:Test Question); test_type(select options:Easy/Medium/Hard/Security Boundary/Hallucination Trap/Stale Content/Account Gating label:Test Type)] record_permissions=[system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/eval_test_case — eval_test_case

- **Scope:** platform
- **Fields:** 6 fields
- **Record permissions:** 1 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:eval_test_case:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:funnel_aggregation:runtime_type" type="runtime_type" identity="funnel_aggregation" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/funnel_aggregation (funnel_aggregation)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/funnel_aggregation"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/funnel_aggregation" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/funnel_aggregation" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/funnel_aggregation requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/funnel_aggregation" content="kind=item slug=funnel_aggregation scope=system fields=[aggregation_scope(select options:System/Account label:Scope); metrics(json label:Metrics); period_end(datetime label:Period End); period_start(datetime label:Period Start)] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/funnel_aggregation — funnel_aggregation

- **Scope:** system
- **Fields:** 4 fields
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:funnel_aggregation:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:funnel_signal:runtime_type" type="runtime_type" identity="funnel_signal" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/funnel_signal (funnel_signal)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/funnel_signal"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/funnel_signal" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/funnel_signal" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/funnel_signal requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/funnel_signal" content="kind=item slug=funnel_signal scope=system fields=[account_id(text label:Account ID); action_type(text label:Action Type); action_value(number label:Action Value); anonymous_id(text label:Anonymous ID); engagement_score(number label:Engagement Score); person_id(text label:Person ID); session_id(text label:Session ID); source(select options:Marketing/Internal/User/Manual label:Source); stage(select options:Anonymous/Identified/Installed label:Stage); temperature(select options:Cold/Warm/Hot label:Temperature)] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/funnel_signal — funnel_signal

- **Scope:** system
- **Fields:** 10 fields
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:funnel_signal:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:item:runtime_type" type="runtime_type" identity="item" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/item (item)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/item"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/item" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/item" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/item requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/item" content="kind=item slug=item scope=account fields=[created_at(datetime,system label:Created); description(textarea,system label:Description); is_active(boolean,required,system label:Active); status(text,required,system label:Status); title(text,required,system label:Title); updated_at(datetime,system label:Updated)] views=[default_detail:detailItem/sections=Overview(title,description,status,is_active);Metadata(created_at,updated_at); default_list:listtable/Items/fields=created_at[datetime,sortable],is_active[badge,sortable],status[badge,sortable],title[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## item/item — item

- **Scope:** account
- **Fields:** 6 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:item:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:kb_article:runtime_type" type="runtime_type" identity="kb_article" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/kb_article (kb_article)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/kb_article"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/kb_article" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/kb_article" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/kb_article requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/kb_article" content="kind=item slug=kb_article scope=platform fields=[content_markdown(textarea label:Article Content (Markdown)); helpful_count(number default:0 label:Helpful Count); not_helpful_count(number default:0 label:Not Helpful Count); slug(text,required label:URL Slug); tags(json label:Tags); title(text,required label:Title)] views=[default_detail:detailKB Article/sections=Content(title,slug,tags,content_markdown);Feedback(helpful_count,not_helpful_count); default_list:listtable/KB Articles/fields=helpful_count[number,sortable],slug[text,sortable],tags[tags],title[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] vector_types={how_to=semantic,structure,summary,intent,procedure,outcome;article=semantic,structure,summary;default=semantic,structure,summary;use_case=semantic,structure,summary,intent,context,procedure,outcome;db_schema=semantic,structure,cause,context;code_chunk=semantic,structure;postmortem=semantic,structure,summary,intent,cause,procedure,context,error_signal}; embedding_fields={structure=kb_type,category,tags,audience,security_level,product_area} stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback),.framework/functions/embeddings.ts (vector_types, embedding_fields)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="vector_types controls which embedding builders run; unsupported vector type names cause embeddings.ts to log an error and skip"] -->

## item/kb_article — kb_article

- **Scope:** platform
- **Fields:** 6 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Special keys:** vector_types={how_to=semantic,structure,summary,intent,procedure,outcome;article=semantic,structure,summary;default=semantic,structure,summary;use_case=semantic,structure,summary,intent,context,procedure,outcome;db_schema=semantic,structure,cause,context;code_chunk=semantic,structure;postmortem=semantic,structure,summary,intent,cause,procedure,context,error_signal}; embedding_fields={structure=kb_type,category,tags,audience,security_level,product_area}
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback), .framework/functions/embeddings.ts (vector_types, embedding_fields)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:kb_article:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:marketing_touch:runtime_type" type="runtime_type" identity="marketing_touch" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/marketing_touch (marketing_touch)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/marketing_touch"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/marketing_touch" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/marketing_touch" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/marketing_touch requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/marketing_touch" content="kind=item slug=marketing_touch scope=account fields=[campaign(text label:Campaign Name); channel(select,required options:Email/Social/Paid Search/Organic Search/Direct/Event/Referral label:Channel); content(text label:Content/Asset); converted(boolean label:Converted); deal_id(text label:Related Deal)] views=[default_detail:detailMarketing Touch/sections=Touch(channel,campaign,content,converted);Attribution(deal_id); default_list:listtable/Marketing Touches/fields=campaign[text,sortable],channel[badge,sortable],converted[boolean,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/marketing_touch — marketing_touch

- **Scope:** account
- **Fields:** 5 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:marketing_touch:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:opportunity_queue:runtime_type" type="runtime_type" identity="opportunity_queue" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/opportunity_queue (opportunity_queue)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/opportunity_queue"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/opportunity_queue" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/opportunity_queue" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/opportunity_queue requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/opportunity_queue" content="kind=item slug=opportunity_queue scope=system fields=[account_id(text label:Account ID); confidence(select options:Low/Medium/High label:Confidence); opportunity_type(select options:Advanced Portal/Implementation/Support Plan/Managed Services/Expansion/Advocate label:Opportunity Type); person_id(text label:Person ID); reviewer_notes(textarea label:Reviewer Notes); source_signal_id(text label:Source Signal); status(select options:Pending/Accepted/Rejected/Converted label:Status)] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/opportunity_queue — opportunity_queue

- **Scope:** system
- **Fields:** 7 fields
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:opportunity_queue:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:site_visit:runtime_type" type="runtime_type" identity="site_visit" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/site_visit (site_visit)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/site_visit"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/site_visit" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/site_visit" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/site_visit requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/site_visit" content="kind=item slug=site_visit scope=account fields=[duration_seconds(number label:Duration (seconds)); referrer(text label:Referrer URL); source(text label:Traffic Source); url(text,required label:Page URL); utm_campaign(text label:UTM Campaign); utm_medium(text label:UTM Medium); utm_source(text label:UTM Source)] views=[default_detail:detailSite Visit/sections=Visit(url,duration_seconds,source);Attribution(utm_campaign,utm_medium,utm_source,referrer); default_list:listtable/Site Visits/fields=duration_seconds[number,sortable],source[badge,sortable],url[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/site_visit — site_visit

- **Scope:** account
- **Fields:** 7 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:site_visit:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:support_queue:runtime_type" type="runtime_type" identity="support_queue" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/support_queue (support_queue)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/support_queue"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/support_queue" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/support_queue" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/support_queue requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/support_queue" content="kind=item slug=support_queue scope=account fields=[assigned_to(text label:Assignee); escalation_reason(select options:Low Confidence/Thumbs Down/Customer Request label:Escalation Reason); priority_score(number label:Priority Score); sla_deadline(datetime label:SLA Deadline); ticket_id(text label:Source Ticket)] views=[default_detail:detailQueue Entry/sections=Ticket(ticket_id,escalation_reason,priority_score);Assignment(assigned_to,sla_deadline); default_list:listtable/Queue Entries/fields=assigned_to[text,sortable],escalation_reason[badge,sortable],priority_score[number,sortable],sla_deadline[timestamp,sortable],ticket_id[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/support_queue — support_queue

- **Scope:** account
- **Fields:** 5 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:support_queue:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:support_ticket:runtime_type" type="runtime_type" identity="support_ticket" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/support_ticket (support_ticket)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/support_ticket"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/support_ticket" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/support_ticket" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/support_ticket requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/support_ticket" content="kind=item slug=support_ticket scope=platform fields=[aim_resolved_by_ai(boolean default:false label:Resolved by AI); aim_retrieval_confidence(number label:AI Retrieval Confidence); assigned_agent_id(text label:Assigned Agent); bug_confirmed(boolean default:false label:Bug Confirmed); description(textarea,required label:Description); integrity_status(select options:Clean/Modified/Unknown label:Integrity Status); priority(select,required options:Low/Medium/High/Urgent label:Priority); status(select,required options:Open/AI Responding/Community Escalated/Human Assigned/Resolved/Closed label:Status); tier(select options:Core/Custom/Enterprise label:Support Tier); title(text,required label:Title)] views=[default_detail:detailSupport Ticket/sections=Request(title,description,status,priority);Assignment(assigned_agent_id,tier,integrity_status); default_list:listtable/Support Tickets/fields=priority[badge,sortable],status[badge,sortable],tier[badge,sortable],title[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/support_ticket — support_ticket

- **Scope:** platform
- **Fields:** 10 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:support_ticket:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:task:runtime_type" type="runtime_type" identity="task" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type item/task (task)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for item/task"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for item/task" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for item/task" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions item/task requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:item/task" content="kind=item slug=task scope=account fields=[account_id(text label:Account); description(textarea label:Description); due_date(datetime label:Due Date); person_id(text label:Assigned To); priority(select,required options:Low/Medium/High/Critical default:medium label:Priority); task_type(select,required options:Follow-up/Review/Research/Demo/Meeting label:Task Type); title(text,required label:Title)] views=[default_detail:detailTask/sections=Details(title,task_type,priority,description);Assignment(due_date,account_id,person_id); default_list:listtable/Tasks/fields=due_date[date,sortable],priority[badge,sortable],task_type[badge,sortable],title[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## item/task — task

- **Scope:** account
- **Fields:** 7 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:task:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:link:runtime_type" type="runtime_type" identity="link" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type link/link (link)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for link/link"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for link/link" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for link/link" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions link/link requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:link/link" content="kind=link slug=link scope=account fields=[created_at(datetime,system label:Created); link_type(text,system label:Link Type); source_id(uuid,required,system label:Source ID); source_type(text,required,system label:Source Type); target_id(uuid,required,system label:Target ID); target_type(text,required,system label:Target Type); updated_at(datetime,system label:Updated)] views=[default_detail:detailLink/sections=Connection(source_type,source_id,target_type,target_id,link_type);Metadata(created_at,updated_at); default_list:listtable/Links/fields=created_at[datetime,sortable],link_type[text,sortable],source_type[text,sortable],target_type[text,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## link/link — link

- **Scope:** account
- **Fields:** 7 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:link:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:community_reply:runtime_type" type="runtime_type" identity="community_reply" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type message/community_reply (community_reply)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for message/community_reply"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for message/community_reply" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for message/community_reply" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions message/community_reply requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:message/community_reply" content="kind=message slug=community_reply scope=platform fields=[agent_id(text,system label:Agent ID); confidence(number,system label:AI Confidence); escalated(boolean,system label:Escalated); feedback(text,system label:Feedback); feedback_at(datetime,system label:Feedback At); message_type(text,system label:Message Type); prompt_config_id(text,system label:Prompt Config ID); retrieval_confidence(number,system label:Retrieval Confidence); retrieved_sources(json,system label:Retrieved Sources); sender_type(text,system label:Sender Type); suggested_title(text,system label:Suggested Title); tool_calls(json,system label:Tool Calls)] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## message/community_reply — community_reply

- **Scope:** platform
- **Fields:** 12 fields
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:community_reply:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:message:runtime_type" type="runtime_type" identity="message" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type message/message (message)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for message/message"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for message/message" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for message/message" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions message/message requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:message/message" content="kind=message slug=message scope=account fields=[content(textarea,required,system label:Content); created_at(datetime,system label:Created); direction(text,required,system label:Direction); is_active(boolean,required,system label:Active); sequence(number,required,system label:Sequence); updated_at(datetime,system label:Updated); visibility(text,required,system label:Visibility)] views=[default_detail:detailMessage/sections=Content(content,direction,visibility);Metadata(sequence,created_at,updated_at); default_list:listtable/Messages/fields=content[text],created_at[datetime,sortable],direction[badge,sortable],visibility[badge,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## message/message — message

- **Scope:** account
- **Fields:** 7 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:message:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:support_reply:runtime_type" type="runtime_type" identity="support_reply" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type message/support_reply (support_reply)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for message/support_reply"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for message/support_reply" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for message/support_reply" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions message/support_reply requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:message/support_reply" content="kind=message slug=support_reply scope=account fields=[agent_id(text,system label:Agent ID); confidence(number,system label:AI Confidence); escalated(boolean,system label:Escalated); feedback(text,system label:Feedback); feedback_at(datetime,system label:Feedback At); message_type(text,system label:Message Type); prompt_config_id(text,system label:Prompt Config ID); retrieval_confidence(number,system label:Retrieval Confidence); retrieved_sources(json,system label:Retrieved Sources); sender_type(text,system label:Sender Type); suggested_title(text,system label:Suggested Title); tool_calls(json,system label:Tool Calls)] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## message/support_reply — support_reply

- **Scope:** account
- **Fields:** 12 fields
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:support_reply:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:person:runtime_type" type="runtime_type" identity="person" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type person/person (person)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for person/person"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for person/person" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for person/person" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions person/person requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:person/person" content="kind=person slug=person scope=account fields=[avatar_url(url,system label:Avatar URL); created_at(datetime,system label:Created); email(email,required,system label:Email); full_name(text,required,system label:Full Name); is_active(boolean,required,system label:Active); phone(phone,system label:Phone); status(text,required,system label:Status); updated_at(datetime,system label:Updated)] views=[default_detail:detailPerson/sections=Profile(full_name,email,phone,avatar_url);Status(status,is_active);Metadata(created_at,updated_at); default_list:listtable/People/fields=email[text,sortable],full_name[text,sortable],is_active[badge,sortable],status[badge,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/invites.ts creates people and .framework/functions/admin-data.ts create consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## person/person — person

- **Scope:** account
- **Fields:** 8 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/invites.ts creates people and .framework/functions/admin-data.ts create
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:person:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:community_thread:runtime_type" type="runtime_type" identity="community_thread" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type thread/community_thread (community_thread)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for thread/community_thread"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for thread/community_thread" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for thread/community_thread" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions thread/community_thread requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:thread/community_thread" content="kind=thread slug=community_thread scope=platform record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## thread/community_thread — community_thread

- **Scope:** platform
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:community_thread:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:support_thread:runtime_type" type="runtime_type" identity="support_thread" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type thread/support_thread (support_thread)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for thread/support_thread"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for thread/support_thread" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for thread/support_thread" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions thread/support_thread requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:thread/support_thread" content="kind=thread slug=support_thread scope=account record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="validation_schema is generated from design_schema.fields by .framework/functions/_shared/schema-utils.ts; do not edit validation_schema directly"] -->

## thread/support_thread — support_thread

- **Scope:** account
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:support_thread:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:thread:runtime_type" type="runtime_type" identity="thread" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type thread/thread (thread)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for thread/thread"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for thread/thread" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for thread/thread" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions thread/thread requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:thread/thread" content="kind=thread slug=thread scope=account fields=[created_at(datetime,system label:Created); is_active(boolean,required,system label:Active); status(text,required,system label:Status); target_id(uuid,required,system label:Target ID); target_type(text,required,system label:Target Type); title(text,system label:Title); updated_at(datetime,system label:Updated); visibility(text,required,system label:Visibility)] views=[default_detail:detailThread/sections=Overview(title,target_type,target_id,visibility,status);Metadata(created_at,updated_at); default_list:listtable/Threads/fields=status[badge,sortable],target_type[text,sortable],title[text,sortable],visibility[badge,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## thread/thread — thread

- **Scope:** account
- **Fields:** 8 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:thread:runtime_type"] -->

<!-- CIL[BEGIN stable_id="~/.framework/docs/runtime-types.md:watcher:runtime_type" type="runtime_type" identity="watcher" parent="none"] -->
<!-- CIL[DOC-MACRO purpose="Design schema contract for runtime type watcher/watcher (watcher)"] -->
<!-- CIL[DOC-RESPONSIBILITY responsibility="Describe the exact design_schema fields, views, permissions, and special keys required for watcher/watcher"] -->
<!-- CIL[DOC-CONTEXT module="runtime-types" layer="documentation" related_files=".framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts"] -->
<!-- CIL[DOC-CONTRACT inputs="none" outputs="design_schema contract summary for watcher/watcher" errors="none" side_effects="none"] -->
<!-- CIL[DOC-MICRO logic_summary="Generated from the live types row; includes scope, fields, views, record_permissions, stamper code, and consumer code for watcher/watcher" notable_decisions="[]"] -->
<!-- CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"] -->
<!-- CIL[DOC-STABILITY stability="stable"] -->
<!-- CIL[DOC-AUDIENCE audience="developer"] -->
<!-- CIL[DOC-VECTOR type="context" content="Layer: documentation. Direct callers: 0. Direct calls: 0. Related files: .framework/functions/admin-data.ts, .framework/functions/_shared/permissions.ts, .framework/src/components/app-shell/GenericDetailPage.tsx, .framework/src/components/app-shell/GenericListPage.tsx, .framework/src/components/shared/FieldRenderer.tsx, .framework/src/hooks/useEntityRecord.ts, .framework/src/hooks/useListSchema.ts, .framework/src/hooks/useSchemaRecord.ts, .framework/functions/item-progress.ts, .framework/functions/embeddings.ts, .framework/functions/_shared/agent-runner.ts, .framework/functions/types.ts, .framework/functions/_shared/schema-utils.ts."] -->
<!-- CIL[DOC-VECTOR type="blast_radius" content="Direct callers: 0. Total affected: 0."] -->
<!-- CIL[DOC-VECTOR type="configuration" content="No configuration dependencies."] -->
<!-- CIL[DOC-VECTOR type="constraint" content="Derived from the types table in Supabase project jyanuujwuuxhklpusssy."] -->
<!-- CIL[DOC-VECTOR type="implementation_pattern" content="Runtime type contract documentation."] -->
<!-- CIL[DOC-VECTOR type="user_journey" content="Helps answer what fields, views, and permissions watcher/watcher requires."] -->
<!-- CIL[DOC-LEARNING topic="runtime-type:watcher/watcher" content="kind=watcher slug=watcher scope=account fields=[created_at(datetime,system label:Created); notification_level(text,required,system label:Notification Level); person_id(uuid,required,system label:Person); target_id(uuid,required,system label:Target ID); target_type(text,required,system label:Target Type); updated_at(datetime,system label:Updated); watch_type(text,required,system label:Watch Type)] views=[default_detail:detailWatcher/sections=Target(target_type,target_id);Settings(person_id,watch_type,notification_level);Metadata(created_at,updated_at); default_list:listtable/Watchers/fields=created_at[datetime,sortable],notification_level[badge,sortable],target_type[text,sortable],watch_type[badge,sortable]] record_permissions=[member:create/read/update; member_admin:create/read/update; support:create/read/update; support_admin:create/read/update; system_admin:create/read/update/delete] stamped_by=.framework/functions/admin-data.ts create via resolveTypeRecord consumed_by=.framework/functions/_shared/permissions.ts (record_permissions, field.permissions),.framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail),.framework/src/components/app-shell/GenericListPage.tsx (views.default_list),.framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type),.framework/src/hooks/useEntityRecord.ts (fields.system split),.framework/src/hooks/useListSchema.ts (schema fallback)"] -->
<!-- CIL[DOC-NOTE type="design_schema_caveat" content="fields marked system=true are stored on the record row; non-system fields live in record.data"] -->

## watcher/watcher — watcher

- **Scope:** account
- **Fields:** 7 fields
- **Views:** default_list, default_detail
- **Record permissions:** 5 roles
- **Stamped by:** .framework/functions/admin-data.ts create via resolveTypeRecord
- **Consumed by:** .framework/functions/_shared/permissions.ts (record_permissions, field.permissions), .framework/src/components/app-shell/GenericDetailPage.tsx (views.default_detail), .framework/src/components/app-shell/GenericListPage.tsx (views.default_list), .framework/src/components/shared/FieldRenderer.tsx (fields.data_type/display_type), .framework/src/hooks/useEntityRecord.ts (fields.system split), .framework/src/hooks/useListSchema.ts (schema fallback)

<!-- CIL[END stable_id="~/.framework/docs/runtime-types.md:watcher:runtime_type"] -->