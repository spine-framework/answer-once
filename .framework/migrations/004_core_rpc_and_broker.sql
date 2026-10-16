-- CIL[BEGIN stable_id="~/.framework/migrations/004_core_rpc_and_broker.sql:core_rpc_and_broker:file" type="file" identity="core_rpc_and_broker" parent="~/.framework/migrations/004_core_rpc_and_broker.sql"]
-- CIL[DOC-MACRO purpose="Consolidated RPCs and integration broker migration: vector search functions, integrations, API keys, webhooks, RLS, triggers, and seed integrations"]
-- CIL[DOC-RESPONSIBILITY responsibility="Creates HNSW index, match_embeddings and search_similar_embeddings RPCs, alters integrations and api_keys tables, creates api_key_usage_logs, webhook_handlers, webhook_deliveries tables, enables RLS and policies, sets updated_at triggers, and seeds default integrations and webhook handlers"]
-- CIL[DOC-CONTEXT module="migrations" layer="database" related_files=".framework/migrations/004_core_rpc_and_broker.sql"]
-- CIL[DOC-CONTRACT inputs="none" outputs="schema changes, functions, tables, indexes, RLS policies, triggers, seed rows" errors="SQL execution errors, permission denied, constraint violations" side_effects="Modifies public.integrations, public.api_keys, public.api_key_usage_logs, public.webhook_handlers, public.webhook_deliveries, and public.types; grants execute on functions; enables row level security"]
-- CIL[DOC-MICRO logic_summary="Create HNSW index if missing; define match_embeddings and search_similar_embeddings RPCs; augment integrations and api_keys columns, constraints and indexes; create api_key_usage_logs, webhook_handlers, and webhook_deliveries tables with indexes and foreign keys; enable RLS with auth-based and service_role bypass policies; add updated_at triggers; seed webhook_event type and openai, generic-http integrations plus generic and portal webhook handlers" notable_decisions="[]"]
-- CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
-- CIL[DOC-STABILITY stability="stable"]

-- Spine v2 consolidated RPCs and integration broker
-- Vector search RPC, integration broker schema, and broker RLS/policies.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename  = 'embeddings'
      AND indexname  = 'embeddings_embedding_hnsw_idx'
  ) THEN
    EXECUTE 'CREATE INDEX embeddings_embedding_hnsw_idx
             ON public.embeddings
             USING hnsw (embedding vector_cosine_ops)
             WITH (m = 16, ef_construction = 64)';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.match_embeddings(
  query_embedding     vector(1536),
  match_count         int            DEFAULT 10,
  filter_account_ids  uuid[]         DEFAULT NULL,
  filter_vector_type  text           DEFAULT NULL,
  similarity_threshold float         DEFAULT 0.15
)
RETURNS TABLE (
  id              uuid,
  document_id     text,
  content         text,
  metadata        jsonb,
  account_id      uuid,
  similarity      float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.document_id,
    e.content,
    e.metadata,
    e.account_id,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.embeddings e
  WHERE
    (filter_account_ids IS NULL OR e.account_id = ANY(filter_account_ids))
    AND (filter_vector_type IS NULL OR e.metadata->>'vector_type' = filter_vector_type)
    AND (1 - (e.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END
$$;

GRANT EXECUTE ON FUNCTION public.match_embeddings(vector, int, uuid[], text, float) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_embeddings(vector, int, uuid[], text, float) TO service_role;

CREATE OR REPLACE FUNCTION public.search_similar_embeddings(
  p_account_id uuid,
  p_model_id text,
  p_query_embedding vector(1536),
  p_limit int DEFAULT 10,
  p_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  id uuid,
  document_id text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.document_id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> p_query_embedding) AS similarity
  FROM public.embeddings e
  WHERE
    e.account_id = p_account_id
    AND e.model_id = p_model_id
    AND e.approved_at IS NOT NULL
    AND e.revoked_at IS NULL
    AND (1 - (e.embedding <=> p_query_embedding)) >= p_threshold
  ORDER BY e.embedding <=> p_query_embedding
  LIMIT p_limit;
END
$$;

GRANT EXECUTE ON FUNCTION public.search_similar_embeddings(uuid, text, vector, int, float) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_similar_embeddings(uuid, text, vector, int, float) TO service_role;

-- ============================================
-- INTEGRATIONS: restore/augment columns
-- ============================================

ALTER TABLE public.integrations
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS integration_type text NOT NULL DEFAULT 'webhook',
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS version text,
  ADD COLUMN IF NOT EXISTS credentials jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_configured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS ownership text DEFAULT 'tenant';

COMMENT ON COLUMN public.integrations.integration_type IS 'Semantic category: webhook, oauth, api, scheduled_sync';
COMMENT ON COLUMN public.integrations.provider IS 'Provider name: stripe, kibo, make, openai, etc.';
COMMENT ON COLUMN public.integrations.credentials IS 'Secrets map with source/value pairs: { field: { source: value|env_var, value: string } }';
COMMENT ON COLUMN public.integrations.is_configured IS 'True when required credentials are present';

-- Replace the old unique key with one that scopes by account
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_app_id_slug_key;
ALTER TABLE public.integrations ADD CONSTRAINT integrations_app_account_slug_key UNIQUE (app_id, account_id, slug);

ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS fk_integrations_created_by;
ALTER TABLE public.integrations ADD CONSTRAINT fk_integrations_created_by
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;

-- ============================================
-- API KEYS: restore/augment columns
-- ============================================

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS app_id uuid,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS integration_id uuid,
  ADD COLUMN IF NOT EXISTS key_prefix text,
  ADD COLUMN IF NOT EXISTS key_hash text,
  ADD COLUMN IF NOT EXISTS key_type text NOT NULL DEFAULT 'inbound',
  ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS scopes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rate_limit integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS machine_type text,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS ownership text DEFAULT 'tenant';

COMMENT ON COLUMN public.api_keys.integration_id IS 'The integration this key is bound to';
COMMENT ON COLUMN public.api_keys.key_prefix IS 'Plaintext first N chars used for key lookup and UI';
COMMENT ON COLUMN public.api_keys.key_hash IS 'Salted slow hash of the full key';
COMMENT ON COLUMN public.api_keys.key_type IS 'inbound, outbound, internal, cli';
COMMENT ON COLUMN public.api_keys.rate_limit IS 'Requests per rate_limit_window_seconds';

ALTER TABLE public.api_keys ADD CONSTRAINT fk_api_keys_integration
  FOREIGN KEY (integration_id) REFERENCES public.integrations(id) ON DELETE CASCADE;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS fk_api_keys_created_by;
ALTER TABLE public.api_keys ADD CONSTRAINT fk_api_keys_created_by
  FOREIGN KEY (created_by) REFERENCES public.people(id) ON DELETE SET NULL;

-- Unique key for key_hash (multiple NULLs allowed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash) WHERE key_hash IS NOT NULL;

-- Scope api_keys slug by account as well
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_app_id_slug_key;
ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_app_account_slug_key UNIQUE (app_id, account_id, slug);

-- ============================================
-- API KEY USAGE LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.api_key_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL,
  account_id uuid,
  request_method text,
  request_path text,
  request_ip text,
  user_agent text,
  response_status integer,
  response_size integer,
  duration_ms integer,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_api_key_id ON public.api_key_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_created_at ON public.api_key_usage_logs(created_at);

ALTER TABLE public.api_key_usage_logs ADD CONSTRAINT fk_akul_api_key
  FOREIGN KEY (api_key_id) REFERENCES public.api_keys(id) ON DELETE CASCADE;
ALTER TABLE public.api_key_usage_logs ADD CONSTRAINT fk_akul_account
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;

-- ============================================
-- WEBHOOK HANDLERS
-- ============================================

CREATE TABLE IF NOT EXISTS public.webhook_handlers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid,
  account_id uuid,
  name text NOT NULL,
  function_name text NOT NULL,
  description text,
  events text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (app_id, account_id, name)
);

CREATE INDEX IF NOT EXISTS idx_webhook_handlers_name ON public.webhook_handlers(name) WHERE is_active = true AND is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_webhook_handlers_account ON public.webhook_handlers(account_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_webhook_handlers_events ON public.webhook_handlers USING GIN(events) WHERE is_active = true;

ALTER TABLE public.webhook_handlers ADD CONSTRAINT fk_webhook_handlers_app
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE SET NULL;
ALTER TABLE public.webhook_handlers ADD CONSTRAINT fk_webhook_handlers_account
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

COMMENT ON TABLE public.webhook_handlers IS 'Dynamic registry for webhook handlers. Custom functions self-register here to be discoverable by the integration-routes handler without static imports.';

-- ============================================
-- WEBHOOK DELIVERIES (inbound + outbound ledger)
-- ============================================

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid,
  account_id uuid,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  integration_id uuid,
  api_key_id uuid,
  handler_name text,
  action_slug text,
  record_id uuid,
  external_id text,
  payload jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'failed', 'cancelled')),
  attempt_count integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  next_attempt_at timestamptz,
  last_error text,
  response_status integer,
  response_body jsonb,
  duration_ms integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status_next_attempt ON public.webhook_deliveries(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_integration_external ON public.webhook_deliveries(integration_id, external_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_account_created ON public.webhook_deliveries(account_id, created_at);

ALTER TABLE public.webhook_deliveries ADD CONSTRAINT fk_webhook_deliveries_integration
  FOREIGN KEY (integration_id) REFERENCES public.integrations(id) ON DELETE SET NULL;
ALTER TABLE public.webhook_deliveries ADD CONSTRAINT fk_webhook_deliveries_api_key
  FOREIGN KEY (api_key_id) REFERENCES public.api_keys(id) ON DELETE SET NULL;

COMMENT ON TABLE public.webhook_deliveries IS 'Shared delivery/retry ledger for inbound and outbound integration calls.';

-- ============================================
-- DROP UNUSED integration_routes
-- ============================================

DROP TABLE IF EXISTS public.integration_routes CASCADE;

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS integrations_access ON public.integrations;
CREATE POLICY integrations_access ON public.integrations FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         OR auth.uid() IS NULL);

DROP POLICY IF EXISTS api_keys_access ON public.api_keys;
CREATE POLICY api_keys_access ON public.api_keys FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         OR auth.uid() IS NULL);

DROP POLICY IF EXISTS akul_access ON public.api_key_usage_logs;
CREATE POLICY akul_access ON public.api_key_usage_logs FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         OR auth.uid() IS NULL);

DROP POLICY IF EXISTS webhook_handlers_access ON public.webhook_handlers;
CREATE POLICY webhook_handlers_access ON public.webhook_handlers FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         OR auth.uid() IS NULL);

DROP POLICY IF EXISTS webhook_deliveries_access ON public.webhook_deliveries;
CREATE POLICY webhook_deliveries_access ON public.webhook_deliveries FOR ALL
  USING (account_id IN (SELECT public.get_accessible_accounts(auth.uid()))
         OR auth.uid() IS NULL);

-- Service role bypass for all broker tables
DROP POLICY IF EXISTS integrations_service_role ON public.integrations;
CREATE POLICY integrations_service_role ON public.integrations FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS api_keys_service_role ON public.api_keys;
CREATE POLICY api_keys_service_role ON public.api_keys FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS akul_service_role ON public.api_key_usage_logs;
CREATE POLICY akul_service_role ON public.api_key_usage_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS webhook_handlers_service_role ON public.webhook_handlers;
CREATE POLICY webhook_handlers_service_role ON public.webhook_handlers FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS webhook_deliveries_service_role ON public.webhook_deliveries;
CREATE POLICY webhook_deliveries_service_role ON public.webhook_deliveries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- updated_at triggers
-- ============================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_integrations ON public.integrations;
CREATE TRIGGER set_updated_at_integrations
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_api_keys ON public.api_keys;
CREATE TRIGGER set_updated_at_api_keys
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_webhook_handlers ON public.webhook_handlers;
CREATE TRIGGER set_updated_at_webhook_handlers
  BEFORE UPDATE ON public.webhook_handlers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_webhook_deliveries ON public.webhook_deliveries;
CREATE TRIGGER set_updated_at_webhook_deliveries
  BEFORE UPDATE ON public.webhook_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- SEED: webhook_event type, openai integration, generic handler
-- ============================================

INSERT INTO public.types (
  app_id, kind, slug, name, description, icon, color,
  design_schema, validation_schema, ownership, is_active
)
VALUES (
  NULL,
  'item',
  'webhook_event',
  'Webhook Event',
  'Raw or normalized inbound webhook payload captured by the generic adapter for debugging.',
  'radio-receiver',
  '#6366F1',
  '{"scope":"account","fields":{"provider":{"data_type":"text","label":"Provider","required":false,"system":false},"event":{"data_type":"text","label":"Event","required":false,"system":false},"payload":{"data_type":"json","label":"Payload","required":true,"system":false},"headers":{"data_type":"json","label":"Headers","required":false,"system":false}},"views":{"default_list":{"type":"list","display":"table","label":"Webhook Events","fields":{"provider":{"sortable":true,"display_type":"text"},"event":{"sortable":true,"display_type":"text"},"created_at":{"sortable":true,"display_type":"timestamp"}},"default_sort":{"field":"created_at","direction":"desc"}},"default_detail":{"type":"detail","label":"Webhook Event","sections":[{"title":"Payload","fields":{"provider":{"display_type":"input"},"event":{"display_type":"input"},"payload":{"display_type":"textarea"},"headers":{"display_type":"textarea"}}}]}},"record_permissions":{"system_admin":["create","read","update","delete"],"member":["read"]},"functionality":null}',
  '{}',
  'system',
  true
)
ON CONFLICT (app_id, kind, slug) DO NOTHING;

INSERT INTO public.integrations (
  app_id, account_id, slug, name, description,
  integration_type, provider, version, config, credentials,
  is_active, is_system, is_configured, ownership
)
VALUES (
  NULL, NULL, 'openai', 'OpenAI', 'System OpenAI integration for AI agent and embedding calls.', 'api', 'openai', 'v1',
  '{"base_url":"https://api.openai.com/v1","outbound_adapter":"adapters/openai-outbound","models":{"chat":"gpt-4o-mini","embedding":"text-embedding-3-small"}}',
  '{"api_token":{"source":"env_var","value":"OPENAI_API_KEY"}}',
  true, true, true, 'system'
)
ON CONFLICT (app_id, account_id, slug) DO NOTHING;

INSERT INTO public.webhook_handlers (
  app_id, account_id, name, function_name, description, events, is_active
)
VALUES (
  NULL, NULL, 'generic-webhook', 'adapters/generic-webhook-inbound',
  'Generic pass-through adapter that stores the raw webhook payload as a webhook_event item.',
  '{}', true
)
ON CONFLICT (app_id, account_id, name) DO NOTHING;

INSERT INTO public.webhook_handlers (
  app_id, account_id, name, function_name, description, events, is_active
)
VALUES (
  NULL, NULL, 'portal-signals', 'custom/apps/portal/functions/custom_portal-signals',
  'Portal funnel signal adapter that transforms portal engagement payloads into funnel_signal records.',
  '{"funnel.signal"}', true
)
ON CONFLICT (app_id, account_id, name) DO NOTHING;

INSERT INTO public.integrations (
  app_id, account_id, slug, name, description,
  integration_type, provider, version, config, credentials,
  is_active, is_system, is_configured, ownership
)
VALUES (
  NULL, NULL, 'generic-http', 'Generic HTTP Webhook', 'System generic outbound webhook for pipeline webhook stages.', 'api', 'generic', 'v1',
  '{"outbound_adapter":"adapters/generic-webhook-outbound"}',
  '{"api_token":{"source":"value","value":""}}',
  true, true, true, 'system'
)
ON CONFLICT (app_id, account_id, slug) DO NOTHING;
-- CIL[DOC-VECTOR type="context" content="purpose='Consolidated RPCs and integration broker migration: vector search functions, integrations, API keys, webhooks, RLS, triggers, and seed integrations'; No verified external callers; imports: none"]
-- CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
-- CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
-- CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
-- CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
-- CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
-- CIL[END stable_id="~/.framework/migrations/004_core_rpc_and_broker.sql:core_rpc_and_broker:file"]
