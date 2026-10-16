-- CIL[BEGIN stable_id="~/.framework/migrations/047_people_updated_by.sql:people_updated_by:file" type="file" identity="people_updated_by" parent="~/.framework/migrations/047_people_updated_by.sql"]
-- CIL[DOC-MACRO purpose="Add updated_by to entity tables missing it so admin-data PATCH stops failing for human callers"]
-- CIL[DOC-RESPONSIBILITY responsibility="Add nullable uuid updated_by columns to people, watchers, and attachments — the three entity tables that follow the created_by/updated_by audit convention but lacked the column"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/admin-data.ts,.framework/migrations/045_security_critical_rls.sql,.framework/migrations/046_security_missing_rls.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="Three new nullable uuid columns" errors="none — add column if not exists is idempotent" side_effects="Enables admin-data to stamp updated_by on PATCH for people/watchers/attachments"]
-- CIL[DOC-MICRO logic_summary="admin-data's update handler unconditionally writes updated_by for every non-raw entity; PATCH on these three tables failed with a schema-cache error for human callers. Column shape matches sibling tables (items/accounts/threads/messages/links): nullable uuid, no FK — created_by/updated_by across the schema are plain uuid markers, not enforced references" notable_decisions="nullable and unindexed because no read path queries by updated_by today; kept people/watchers/attachments together since they share the identical gap"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Migration 047: add updated_by to entity tables that follow the created_by/
-- updated_by audit convention but are missing the column. admin-data's update
-- handler unconditionally writes updated_by for every non-raw entity, so PATCH
-- on people/watchers/attachments currently fails for human callers with
-- "Could not find the 'updated_by' column ... in the schema cache".

alter table public.people       add column if not exists updated_by uuid;
alter table public.watchers     add column if not exists updated_by uuid;
alter table public.attachments  add column if not exists updated_by uuid;

comment on column public.people.updated_by      is 'Person id of the last updater; written by admin-data update handler';
comment on column public.watchers.updated_by    is 'Person id of the last updater; written by admin-data update handler';
comment on column public.attachments.updated_by is 'Person id of the last updater; written by admin-data update handler';
-- CIL[DOC-VECTOR type="context" content="purpose='Fix admin-data PATCH failures on people/watchers/attachments by adding the missing updated_by column.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="Human-caller updates via admin-data to people (user settings modal), watchers, and attachments now succeed instead of failing with a schema-cache error" status="ready"]
-- CIL[DOC-VECTOR type="configuration" content="None — plain ALTER TABLE; admin-data update handler consumes the column automatically" status="ready"]
-- CIL[DOC-VECTOR type="constraint" content="Column is a plain uuid marker with no FK, matching the created_by convention across the schema" status="ready"]
-- CIL[END stable_id="~/.framework/migrations/047_people_updated_by.sql:people_updated_by:file"]
