-- ── fix record_atomic_update SRF aliases (086 shipped a runtime-broken body) ──
--
-- Migration 086's function iterates `SELECT key FROM jsonb_object_keys(...)`.
-- A set-returning function's output column is named after the function, so the
-- reference `key` resolves to nothing and EVERY call fails with 42703
-- `column "key" does not exist`. CREATE OR REPLACE does not validate plpgsql
-- FOR-loop queries, so the defect applied cleanly and only surfaced on first
-- invocation (Art Mojo build, G-001). 086 is published and immutable — this is
-- the same body with `t(key)` aliases; `jsonb_array_elements` legitimately
-- outputs `value`, so the conditions loop is unchanged.
--
-- Decision: spine-framework:0033-atomic-mutation-doctrine

CREATE OR REPLACE FUNCTION public.record_atomic_update(
  p_table      text,
  p_id         uuid,
  p_conditions jsonb DEFAULT '[]'::jsonb,
  p_patch      jsonb DEFAULT '{}'::jsonb,
  p_delta      jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tables   text[] := ARRAY['items','threads','messages','watchers','item_progress'];
  v_columns  text[] := ARRAY['status','title','is_active','metadata'];
  v_ops      jsonb  := '{"eq":"=","neq":"<>","lt":"<","lte":"<=","gt":">","gte":">="}'::jsonb;
  v_where    text;
  v_sets     text[] := ARRAY[]::text[];
  v_data_expr text;
  v_cond     jsonb;
  v_path     text;
  v_lhs      text;
  v_op       text;
  v_key      text;
  v_row      jsonb;
BEGIN
  IF NOT (p_table = ANY(v_tables)) THEN
    RAISE EXCEPTION 'record_atomic_update: unsupported table %', p_table;
  END IF;

  v_where := format('id = %L', p_id);

  FOR v_cond IN SELECT value FROM jsonb_array_elements(coalesce(p_conditions, '[]'::jsonb)) LOOP
    v_path := v_cond->>'path';
    v_op   := v_ops ->> (v_cond->>'op');
    IF v_op IS NULL THEN
      RAISE EXCEPTION 'record_atomic_update: unsupported op %', v_cond->>'op';
    END IF;
    IF v_path = ANY(v_columns) THEN
      v_lhs := format('%I', v_path);
    ELSIF v_path ~ '^data\.[a-zA-Z_][a-zA-Z0-9_]{0,62}$' THEN
      v_lhs := format('(data->>%L)', substring(v_path from 6));
    ELSE
      RAISE EXCEPTION 'record_atomic_update: unsupported condition path %', v_path;
    END IF;
    -- Ordered ops compare numerically (jsonb values arrive as text);
    -- eq/neq stay text so '5' matches both "5" and 5.
    IF (v_cond->>'op') IN ('lt','lte','gt','gte') THEN
      v_where := v_where || format(' AND (%s)::numeric %s %L', v_lhs, v_op, v_cond->>'value');
    ELSE
      v_where := v_where || format(' AND %s %s %L', v_lhs, v_op, v_cond->>'value');
    END IF;
  END LOOP;

  FOR v_key IN SELECT t.key FROM jsonb_object_keys(coalesce(p_patch, '{}'::jsonb)) AS t(key) LOOP
    IF v_key = 'data' THEN CONTINUE; END IF;
    IF NOT (v_key = ANY(v_columns)) THEN
      RAISE EXCEPTION 'record_atomic_update: cannot patch column %', v_key;
    END IF;
    -- Unknown-typed literal casts to the column type (bool/jsonb/text).
    v_sets := v_sets || format('%I = %L', v_key, p_patch->>v_key);
  END LOOP;

  -- data assignment: shallow-merge the patch, then apply numeric deltas —
  -- both inside one UPDATE, so `reserved + n <= cap` is race-free.
  IF (p_patch ? 'data') OR (coalesce(p_delta, '{}'::jsonb) <> '{}'::jsonb) THEN
    v_data_expr := 'coalesce(data, ''{}''::jsonb)';
    IF p_patch ? 'data' THEN
      v_data_expr := v_data_expr || format(' || %L::jsonb', (p_patch->'data')::text);
    END IF;
    FOR v_key IN SELECT t.key FROM jsonb_object_keys(coalesce(p_delta, '{}'::jsonb)) AS t(key) LOOP
      IF v_key !~ '^[a-zA-Z_][a-zA-Z0-9_]{0,62}$' THEN
        RAISE EXCEPTION 'record_atomic_update: invalid delta field %', v_key;
      END IF;
      v_data_expr := format(
        'jsonb_set(%s, ARRAY[%L], to_jsonb(coalesce((%s->>%L)::numeric,0) + %L::numeric))',
        v_data_expr, v_key, v_data_expr, v_key, p_delta->>v_key
      );
    END LOOP;
    v_sets := v_sets || ('data = ' || v_data_expr);
  END IF;

  IF array_length(v_sets, 1) IS NULL THEN
    RAISE EXCEPTION 'record_atomic_update: empty patch';
  END IF;

  EXECUTE format(
    'UPDATE %I SET %s, updated_at = now() WHERE %s RETURNING to_jsonb(%I)',
    p_table, array_to_string(v_sets, ', '), v_where, p_table
  ) INTO v_row;

  RETURN v_row;
END;
$$;

-- Grants survive CREATE OR REPLACE, but re-assert for clarity and so a
-- hand-applied copy stays service_role-only (the 075 lesson).
REVOKE ALL ON FUNCTION public.record_atomic_update(text, uuid, jsonb, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_atomic_update(text, uuid, jsonb, jsonb, jsonb)
  TO service_role;
