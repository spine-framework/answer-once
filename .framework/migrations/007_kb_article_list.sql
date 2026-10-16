-- CIL[BEGIN stable_id="~/.framework/migrations/007_kb_article_list.sql:kb_article_list:file" type="file" identity="kb_article_list" parent="~/.framework/migrations/007_kb_article_list.sql"]
-- CIL[DOC-MACRO purpose="Creates the kb-article-list type, rebuild cache function, cache trigger, and seeds cache records for existing accounts."]
-- CIL[DOC-RESPONSIBILITY responsibility="Installs and maintains the cached ordered KB article tree for each account by rebuilding on structural item changes."]
-- CIL[DOC-CONTEXT module="knowledge-base" layer="migrations" related_files=".framework/migrations/007_kb_article_list.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="public.types row for kb-article-list, public.rebuild_kb_cache function, public.trg_rebuild_kb_article_list trigger, seeded cache records" errors="none expected; slug conflicts upserted; trigger ignores non-KB types and cache record recursion" side_effects="Inserts or updates public.items cache rows, recalculates article trees on structural changes"]
-- CIL[DOC-MICRO logic_summary="Upserts the kb-article-list type with design and validation schemas, defines a function that aggregates ordered article trees by scope into a jsonb trees field, attaches an AFTER INSERT/UPDATE/DELETE trigger on public.items to rebuild when parent, order, title, status, or type change, and seeds global and account caches for existing data." notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]
-- CIL[DOC-NOTE type="caution" content="cil_validate_file reports perpetual drift_detected on whole-file .sql chunks (32-char stored vs ~16-char computed hash) — also true of untouched 008/009 migrations. Pre-existing hash-format quirk for SQL file chunks, not real drift."]
-- KB article list cache: a single row per scope/account that stores the
-- pre-built ordered tree of KB articles. Updated by trigger on structural
-- changes (parent, order, title, status, type) but NOT on content edits.

-- 1. Create the kb-article-list type
INSERT INTO public.types (
  app_id, kind, slug, name, description, icon, color,
  design_schema, validation_schema, ownership, is_active, created_at, updated_at
)
VALUES (
  NULL,
  'item',
  'kb-article-list',
  'KB Article List',
  'Cached ordered article trees for the KB UI',
  'List',
  NULL,
  $JSON${
    "scope": "platform",
    "fields": {
      "title": { "data_type": "text", "label": "Title", "required": true, "system": true },
      "status": { "data_type": "select", "label": "Status", "required": true, "system": true, "options": ["draft", "published", "archived"] },
      "trees": { "data_type": "json", "label": "Trees", "required": false }
    },
    "views": {
      "default_list": {
        "type": "list",
        "label": "KB Article Lists",
        "fields": {
          "title": { "sortable": true, "display_type": "text" },
          "status": { "sortable": true, "display_type": "badge" },
          "created_at": { "sortable": true, "display_type": "timestamp" }
        },
        "default_sort": { "field": "created_at", "direction": "desc" }
      },
      "default_detail": {
        "type": "detail",
        "label": "KB Article List",
        "sections": [
          {
            "title": "Core",
            "fields": {
              "title": { "display_type": "input" },
              "status": { "display_type": "select" },
              "trees": { "display_type": "textarea" }
            }
          }
        ]
      }
    },
    "record_permissions": {
      "all": ["read"],
      "system_admin": ["create", "read", "update", "delete"],
      "admin": ["create", "read", "update", "delete"],
      "member": ["read"]
    },
    "functionality": null
  }$JSON$::jsonb,
  $JSON${
    "fields": {
      "title": { "data_type": "text", "required": true },
      "status": { "data_type": "select", "required": true, "options": ["draft", "published", "archived"] }
    }
  }$JSON$::jsonb,
  NULL,
  true,
  now(),
  now()
)
ON CONFLICT (app_id, kind, slug) DO UPDATE SET
  design_schema = EXCLUDED.design_schema,
  validation_schema = EXCLUDED.validation_schema,
  is_active = true,
  updated_at = now();

-- 2. Function to rebuild the cache for a given account + scope
CREATE OR REPLACE FUNCTION public.rebuild_kb_cache(p_account_id uuid, p_scope text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cache_type_id uuid := (SELECT id FROM public.types WHERE slug = 'kb-article-list');
  v_data jsonb := '{}'::jsonb;
  v_tree jsonb;
  r RECORD;
  v_title text := CASE p_scope WHEN 'global' THEN 'KB Article List - Global' ELSE 'KB Article List - Account' END;
  v_type_slugs text[] := CASE p_scope
    WHEN 'global' THEN ARRAY['kb-spine-public', 'kb-spine-internal', 'kb-spine-admin']
    ELSE ARRAY['kb-account']
  END;
BEGIN
  FOR r IN
    SELECT t.id AS type_id, t.slug AS type_slug
    FROM public.types t
    WHERE t.slug = ANY(v_type_slugs)
  LOOP
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', i.id,
        'title', i.title,
        'status', i.status,
        'type_slug', r.type_slug,
        'type_id', r.type_id,
        'data', jsonb_build_object(
          'parent_id', i.data->>'parent_id',
          'order', COALESCE((i.data->>'order')::int, 0),
          'description', i.data->>'description'
        )
      ) ORDER BY COALESCE((i.data->>'order')::int, 0), i.title
    ), '[]'::jsonb)
    INTO v_tree
    FROM public.items i
    WHERE i.type_id = r.type_id
      AND i.status != 'deleted'
      AND i.account_id = p_account_id;

    v_data := jsonb_set(v_data, ARRAY[r.type_slug], v_tree);
  END LOOP;

  UPDATE public.items
  SET data = jsonb_build_object('trees', v_data),
      updated_at = now(),
      title = v_title
  WHERE type_id = v_cache_type_id
    AND account_id = p_account_id
    AND status != 'deleted';

  IF NOT FOUND THEN
    INSERT INTO public.items (
      type_id, account_id, app_id, title, description, status,
      data, is_active, design_schema, validation_schema,
      created_by, updated_by, created_at, updated_at
    )
    SELECT
      v_cache_type_id, p_account_id, NULL, v_title, NULL, 'published',
      jsonb_build_object('trees', v_data), true,
      t.design_schema, t.validation_schema,
      NULL, NULL, now(), now()
    FROM public.types t
    WHERE t.id = v_cache_type_id;
  END IF;
END;
$$;

-- 3. Trigger function to decide when to rebuild
CREATE OR REPLACE FUNCTION public.trg_rebuild_kb_article_list()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  p_type_id uuid;
  p_account_id uuid;
  p_scope text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    p_type_id := OLD.type_id;
    p_account_id := OLD.account_id;
  ELSE
    p_type_id := NEW.type_id;
    p_account_id := NEW.account_id;
  END IF;

  -- don't recurse on the cache record itself
  IF p_type_id = (SELECT id FROM public.types WHERE slug = 'kb-article-list') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- only the KB article types we care about
  IF p_type_id NOT IN (
    SELECT id FROM public.types WHERE slug IN (
      'kb-spine-public', 'kb-spine-internal', 'kb-spine-admin', 'kb-account'
    )
  ) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- on UPDATE, skip if only the article body/content changed
  IF TG_OP = 'UPDATE' THEN
    IF NEW.type_id = OLD.type_id AND
       NEW.title = OLD.title AND
       NEW.status = OLD.status AND
       NEW.data->>'parent_id' IS NOT DISTINCT FROM OLD.data->>'parent_id' AND
       NEW.data->>'order' IS NOT DISTINCT FROM OLD.data->>'order'
    THEN
      RETURN NEW;
    END IF;
  END IF;

  p_scope := CASE
    WHEN p_type_id IN (
      SELECT id FROM public.types WHERE slug IN (
        'kb-spine-public', 'kb-spine-internal', 'kb-spine-admin'
      )
    ) THEN 'global'
    ELSE 'account'
  END;

  PERFORM public.rebuild_kb_cache(p_account_id, p_scope);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_rebuild_kb_article_list ON public.items;
CREATE TRIGGER trg_rebuild_kb_article_list
AFTER INSERT OR UPDATE OR DELETE ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.trg_rebuild_kb_article_list();

-- 4. Seed initial cache records for existing accounts
DO $$
DECLARE
  global_account_id uuid;
  acc_id uuid;
BEGIN
  -- global cache (where the global KB types live)
  SELECT i.account_id INTO global_account_id
  FROM public.items i
  JOIN public.types t ON i.type_id = t.id
  WHERE t.slug = 'kb-spine-public'
  LIMIT 1;

  IF global_account_id IS NOT NULL THEN
    PERFORM public.rebuild_kb_cache(global_account_id, 'global');
  END IF;

  -- account-specific caches
  FOR acc_id IN
    SELECT DISTINCT i.account_id
    FROM public.items i
    JOIN public.types t ON i.type_id = t.id
    WHERE t.slug = 'kb-account'
  LOOP
    PERFORM public.rebuild_kb_cache(acc_id, 'account');
  END LOOP;
END $$;
-- CIL[DOC-VECTOR type="context" content="purpose='Creates the kb-article-list type, rebuild cache function, cache trigger, and seeds cache records for existing accounts.'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/007_kb_article_list.sql:kb_article_list:file"]
