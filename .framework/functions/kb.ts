// CIL[BEGIN stable_id="~/.framework/functions/kb.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/kb.ts"]
// CIL[DOC-MACRO purpose="Netlify function entry point for knowledge base operations"]
// CIL[DOC-RESPONSIBILITY responsibility="Import shared kb handlers and the admin-data update helper for the unified kb function"]
// CIL[DOC-CONTEXT module="framework.functions.kb" layer="function" related_files=".framework/functions/_shared/kb.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports createHandler, kbIngest/kbRevoke/kbReindex/kbSearch, and adminUpdate for the kb Netlify function" notable_decisions=[]]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
import { createHandler } from './_shared/middleware'
import { kbIngest, kbPublish, kbRevoke, kbReindex, kbSearch } from './_shared/kb'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function entry point for knowledge base operations'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/kb.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/kb.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/kb.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/kb.ts"]
// CIL[DOC-MACRO purpose="Dispatch knowledge base actions from a Netlify function handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Route the incoming action to the correct kb handler or publish workflow"]
// CIL[DOC-CONTEXT module="framework.functions.kb" layer="function" related_files=".framework/functions/_shared/kb.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/kb.ts"]
// CIL[DOC-CONTRACT inputs="ctx (RequestContext), body (object), action from query or body" outputs="kb handler result or { record, ingest } for publish" errors="unknown kb action, missing id for publish" side_effects="calls kbIngest/kbRevoke/kbReindex/kbSearch, delegates publish to admin-data then re-ingests"]
// CIL[DOC-MICRO logic_summary="Determines the action from ctx.query.action defaulting to search, switches on ingest/revoke/reindex/search/publish, and for publish builds a synthetic PATCH context for admin-data before re-ingesting" notable_decisions=["Publishes by delegating to admin-data with a synthetic PATCH context", "Re-ingests the record after publishing to refresh the knowledge base"]']
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const action = ctx.query?.action || 'search'

  switch (action) {
    case 'ingest':
      return await kbIngest(ctx, body)
    case 'revoke':
      return await kbRevoke(ctx, body)
    case 'reindex':
      return await kbReindex(ctx, body)
    case 'search':
      return await kbSearch(ctx, body)
    case 'publish':
      return await kbPublish(ctx, body)
    default:
      throw new Error(`unknown kb action: ${action}`)
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Dispatch knowledge base actions from a Netlify function handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/kb.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/kb.ts:handler:constant"]
