-- CIL[BEGIN stable_id="~/.framework/migrations/048_watcher_last_seen_at.sql:watcher_last_seen_at:file" type="file" identity="watcher_last_seen_at" parent="~/.framework/migrations/048_watcher_last_seen_at.sql"]
-- CIL[DOC-MACRO purpose="Declare last_seen_at in the watcher type design_schema so read sanitize and update validation accept it"]
-- CIL[DOC-RESPONSIBILITY responsibility="Merge the last_seen_at field definition into the watcher type's design_schema.fields and validation_schema.fields"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/functions/_shared/permissions.ts,custom/apps/*/hooks/useWatchers.ts"]
-- CIL[DOC-CONTRACT inputs="none" outputs="watcher type accepts data.last_seen_at on read/write" errors="none — jsonb_set with create_missing is idempotent" side_effects="Unread tracking (markSeen/hasUnreadActivity) works for watcher rows"]
-- CIL[DOC-MICRO logic_summary="sanitizeRecordData strips data keys not declared in design_schema.fields on read, and validateUpdatePermissions rejects them on PATCH — so watcher.data.last_seen_at (written by downstream markSeen hooks) was dropped both ways. Declaring the field makes it readable and writable for roles with record update (member, support). Non-system field: system fields are record columns, last_seen_at lives in data." notable_decisions="type rows are global (kind+slug unique) so updating the single watcher row covers every account"]
-- CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

update public.types
set design_schema = jsonb_set(
      design_schema,
      '{fields,last_seen_at}',
      '{"data_type":"datetime","label":"Last Seen","required":false,"validation":null}'::jsonb,
      true
    ),
    validation_schema = jsonb_set(
      coalesce(validation_schema, '{"fields":{}}'::jsonb),
      '{fields,last_seen_at}',
      '{"data_type":"datetime","required":false}'::jsonb,
      true
    )
where kind = 'watcher' and slug = 'watcher';
-- CIL[END stable_id="~/.framework/migrations/048_watcher_last_seen_at.sql:watcher_last_seen_at:file"]
