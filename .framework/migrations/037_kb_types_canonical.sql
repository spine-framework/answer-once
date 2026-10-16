-- 037_kb_types_canonical.sql
-- Canonical knowledge-base item types. kb-account and kb-spine-public were
-- previously created only by the archived 046_kb_types.sql consolidation, so
-- fresh installs never received them even though 007_kb_article_list.sql
-- references both slugs. This migration:
--   1. Inserts the types when missing (idempotent).
--   2. Merges demo-flag fields (is_demo, demo_run_id) and the member_admin
--      grant into existing design_schema rows without clobbering them.
--   3. Adds source_ticket_id to kb-account for ticket→article candidate links.

-- ─── INSERT: kb-account (fresh installs) ────────────────────────────────────

INSERT INTO public.types (app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  NULL,
  'item',
  'kb-account',
  'KB Account',
  'Account-specific knowledge base articles',
  'briefcase',
  '#3B82F6',
  $DS$
  {
    "scope": "account",
    "fields": {
      "title": { "data_type": "text", "label": "Title", "required": true, "system": true },
      "description": { "data_type": "textarea", "label": "Description", "required": false, "system": true },
      "status": { "data_type": "select", "label": "Status", "required": true, "system": true, "options": ["draft", "published", "archived"] },
      "content": { "data_type": "textarea", "label": "Content", "required": true },
      "tags": { "data_type": "multiselect", "label": "Tags", "required": false, "options": ["support", "how-to", "faq", "tutorial"] },
      "category": { "data_type": "multiselect", "label": "Category", "required": false, "options": ["how-to", "runbook", "policy", "faq", "tutorial"] },
      "product": { "data_type": "multiselect", "label": "Product", "required": false, "options": ["spine-framework", "cortex", "workbench", "portal"] },
      "version": { "data_type": "text", "label": "Version", "required": false },
      "last_reviewed_at": { "data_type": "datetime", "label": "Last Reviewed", "required": false },
      "reviewer_id": { "data_type": "text", "label": "Reviewer ID", "required": false },
      "is_ai_generated": { "data_type": "boolean", "label": "AI Generated", "required": false },
      "customer_segment": { "data_type": "multiselect", "label": "Customer Segment", "required": false, "options": ["enterprise", "startup", "all"] },
      "feature_flag": { "data_type": "text", "label": "Feature Flag", "required": false },
      "work_ticket_id": { "data_type": "text", "label": "Work Ticket ID", "required": false },
      "source_ticket_id": { "data_type": "text", "label": "Source Ticket ID", "required": false },
      "source_file": { "data_type": "text", "label": "Source File Path", "required": false },
      "source_function": { "data_type": "text", "label": "Source Function", "required": false },
      "is_demo": { "data_type": "boolean", "label": "Is Demo", "required": false },
      "demo_run_id": { "data_type": "text", "label": "Demo Run ID", "required": false }
    },
    "views": {
      "default_list": {
        "type": "list",
        "display": "table",
        "label": "Account Articles",
        "fields": {
          "title": { "sortable": true, "display_type": "text" },
          "status": { "sortable": true, "display_type": "badge" },
          "product": { "sortable": true, "display_type": "text" },
          "created_at": { "sortable": true, "display_type": "timestamp" }
        },
        "default_sort": { "field": "created_at", "direction": "desc" }
      },
      "default_detail": {
        "type": "detail",
        "label": "Article",
        "sections": [
          { "title": "Core", "fields": { "title": { "display_type": "input" }, "status": { "display_type": "select" }, "description": { "display_type": "textarea" }, "content": { "display_type": "textarea" } } },
          { "title": "Categorization", "fields": { "tags": { "display_type": "multiselect" }, "category": { "display_type": "multiselect" }, "product": { "display_type": "multiselect" }, "version": { "display_type": "text" } } },
          { "title": "Review", "fields": { "last_reviewed_at": { "display_type": "timestamp" }, "reviewer_id": { "display_type": "text" }, "is_ai_generated": { "display_type": "checkbox" } } },
          { "title": "Context", "fields": { "work_ticket_id": { "display_type": "text" }, "source_ticket_id": { "display_type": "text" }, "source_file": { "display_type": "text" }, "source_function": { "display_type": "text" } } }
        ]
      }
    },
    "record_permissions": {
      "system_admin": ["create", "read", "update", "delete"],
      "support": ["create", "read", "update"],
      "support_admin": ["create", "read", "update", "delete"],
      "engineering_admin": ["create", "read", "update"],
      "engineering": ["create", "read", "update"],
      "devops": ["create", "read", "update"],
      "incident_commander": ["create", "read", "update"],
      "member": ["create", "read", "update"],
      "member_admin": ["create", "read", "update", "delete"]
    },
    "functionality": {
      "kb": {
        "vector_fields": ["title", "description", "content", "tags"],
        "chunk_field": "content",
        "chunk_size": 800,
        "chunk_overlap": 100
      }
    }
  }
  $DS$::jsonb,
  '{}'::jsonb,
  'system',
  true
)
ON CONFLICT (kind, slug) DO NOTHING;

-- ─── INSERT: kb-spine-public (fresh installs) ───────────────────────────────
-- Minimal canonical definition; deployed databases already carry the full
-- schema from 046 and take the UPDATE path below instead.

INSERT INTO public.types (app_id, kind, slug, name, description, icon, color, design_schema, validation_schema, ownership, is_active)
VALUES (
  NULL,
  'item',
  'kb-spine-public',
  'Spine KB Public',
  'Public Spine knowledge base articles readable by all accounts',
  'book-open',
  '#10B981',
  $DS$
  {
    "scope": "platform",
    "fields": {
      "title": { "data_type": "text", "label": "Title", "required": true, "system": true },
      "description": { "data_type": "textarea", "label": "Description", "required": false, "system": true },
      "status": { "data_type": "select", "label": "Status", "required": true, "system": true, "options": ["draft", "published", "archived"] },
      "content": { "data_type": "textarea", "label": "Content", "required": true },
      "tags": { "data_type": "multiselect", "label": "Tags", "required": false, "options": ["support", "how-to", "faq", "tutorial"] },
      "category": { "data_type": "multiselect", "label": "Category", "required": false, "options": ["how-to", "runbook", "policy", "faq", "tutorial"] },
      "product": { "data_type": "multiselect", "label": "Product", "required": false, "options": ["spine-framework", "cortex", "workbench", "portal"] },
      "version": { "data_type": "text", "label": "Version", "required": false },
      "is_demo": { "data_type": "boolean", "label": "Is Demo", "required": false },
      "demo_run_id": { "data_type": "text", "label": "Demo Run ID", "required": false }
    },
    "views": {
      "default_list": {
        "type": "list",
        "display": "table",
        "label": "Public Articles",
        "fields": {
          "title": { "sortable": true, "display_type": "text" },
          "status": { "sortable": true, "display_type": "badge" },
          "created_at": { "sortable": true, "display_type": "timestamp" }
        },
        "default_sort": { "field": "created_at", "direction": "desc" }
      },
      "default_detail": {
        "type": "detail",
        "label": "Article",
        "sections": [
          { "title": "Core", "fields": { "title": { "display_type": "input" }, "status": { "display_type": "select" }, "description": { "display_type": "textarea" }, "content": { "display_type": "textarea" } } }
        ]
      }
    },
    "record_permissions": {
      "system_admin": ["create", "read", "update", "delete"],
      "support": ["create", "read", "update"],
      "support_admin": ["create", "read", "update", "delete"],
      "engineering_admin": ["create", "read", "update"],
      "engineering": ["create", "read", "update"],
      "devops": ["create", "read", "update"],
      "incident_commander": ["create", "read", "update"],
      "member": ["read"],
      "member_admin": ["read"]
    },
    "functionality": {
      "kb": {
        "vector_fields": ["title", "description", "content", "tags"],
        "chunk_field": "content",
        "chunk_size": 800,
        "chunk_overlap": 100
      }
    }
  }
  $DS$::jsonb,
  '{}'::jsonb,
  'system',
  true
)
ON CONFLICT (kind, slug) DO NOTHING;

-- ─── UPDATE: converge existing rows ─────────────────────────────────────────
-- Merge demo-flag + linkage fields and the member_admin grant into existing
-- design_schema JSON without replacing fields added since 046.

UPDATE public.types
SET design_schema = jsonb_set(
      jsonb_set(
        design_schema,
        '{fields}',
        (design_schema->'fields') || $F${
          "is_demo": { "data_type": "boolean", "label": "Is Demo", "required": false },
          "demo_run_id": { "data_type": "text", "label": "Demo Run ID", "required": false },
          "source_ticket_id": { "data_type": "text", "label": "Source Ticket ID", "required": false }
        }$F$::jsonb,
        true
      ),
      '{record_permissions}',
      (design_schema->'record_permissions') || $P${
        "member_admin": ["create", "read", "update", "delete"],
        "member": ["create", "read", "update"]
      }$P$::jsonb,
      true
    )
WHERE slug = 'kb-account' AND kind = 'item';

UPDATE public.types
SET design_schema = jsonb_set(
      jsonb_set(
        design_schema,
        '{fields}',
        (design_schema->'fields') || $F${
          "is_demo": { "data_type": "boolean", "label": "Is Demo", "required": false },
          "demo_run_id": { "data_type": "text", "label": "Demo Run ID", "required": false }
        }$F$::jsonb,
        true
      ),
      '{record_permissions}',
      (design_schema->'record_permissions') || $P${
        "member_admin": ["read"],
        "member": ["read"]
      }$P$::jsonb,
      true
    )
WHERE slug = 'kb-spine-public' AND kind = 'item';

-- Merge the same flag fields into the Portal-owned support types so the demo
-- flag survives sanitizeRecordData on reads. These UPDATEs are no-ops on
-- databases where the seed has not installed the slugs yet — the portal seed
-- types.json now carries the fields for fresh installs.
UPDATE public.types
SET design_schema = jsonb_set(
      design_schema,
      '{fields}',
      (design_schema->'fields') || $F${
        "is_demo": { "data_type": "boolean", "label": "Is Demo", "required": false },
        "demo_run_id": { "data_type": "text", "label": "Demo Run ID", "required": false }
      }$F$::jsonb,
      true
    )
WHERE (kind, slug) IN (('item', 'support_ticket'), ('thread', 'support_thread'));

UPDATE public.types
SET design_schema = jsonb_set(
      design_schema,
      '{fields}',
      (design_schema->'fields') || $F${
        "is_demo": { "data_type": "boolean", "label": "Is Demo", "required": false },
        "demo_run_id": { "data_type": "text", "label": "Demo Run ID", "required": false },
        "escalation_notice": { "data_type": "boolean", "label": "Escalation Notice", "required": false }
      }$F$::jsonb,
      true
    )
WHERE kind = 'message' AND slug = 'support_reply';
