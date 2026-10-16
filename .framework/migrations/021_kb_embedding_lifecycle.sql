-- ============================================================================
-- 021: KB embedding lifecycle RPC
-- ----------------------------------------------------------------------------
-- kbRevoke (functions/_shared/kb.ts) calls revoke_embeddings_for_item during
-- KB ingest/unpublish. The function existed in the dev database (created by the
-- archived embedding-lifecycle migration) but was never present in the live
-- chain, so fresh installs failed with "function not found in schema cache".
-- Definition copied verbatim from the working dev database.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.revoke_embeddings_for_item(p_item_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.embeddings
  SET    revoked_at = now()
  WHERE  document_id = p_item_id::text
  AND    revoked_at  IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.revoke_embeddings_for_item(uuid)
  TO service_role;
