// CIL[BEGIN stable_id="~/.framework/mcp/shared/kb.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/shared/kb.ts"]
// CIL[DOC-MACRO purpose="Shared MCP KB operation wrappers"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide thin async wrappers that route KB search/ingest/reindex/revoke/publish operations to the database fetch function"]
// CIL[DOC-CONTEXT module=".framework/mcp/shared/kb.ts" layer="mcp" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none at module level" outputs="named KB operation exports" errors="none at module level" side_effects="none at module level"]
// CIL[DOC-MICRO logic_summary="Re-exports fetchFunction-bound helpers for the kb namespace" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="mcp"]

import { fetchFunction } from './db.js'
// CIL[DOC-VECTOR type="context" content="purpose='Shared MCP KB operation wrappers'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/kb.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/kb.ts:kbsearch:function" type="function" identity="kbSearch" parent="~/.framework/mcp/shared/kb.ts"]
// CIL[DOC-MACRO purpose="Search the knowledge base"]
// CIL[DOC-RESPONSIBILITY responsibility="Delegate a KB search call to the database fetchFunction"]
// CIL[DOC-CONTEXT module=".framework/mcp/shared/kb.ts" layer="mcp" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="_ctx: any, body: Record<string, any>" outputs="Promise<any>" errors="propagates fetchFunction errors" side_effects="queries the KB search index"]
// CIL[DOC-MICRO logic_summary="Calls fetchFunction with the kb namespace, search action, empty static context, and the provided body" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function kbSearch(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'search', {}, body)
}
// CIL[DOC-VECTOR type="context" content="purpose='Search the knowledge base'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/kb.ts:kbsearch:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/kb.ts:kbingest:function" type="function" identity="kbIngest" parent="~/.framework/mcp/shared/kb.ts"]
// CIL[DOC-MACRO purpose="Ingest content into the knowledge base"]
// CIL[DOC-RESPONSIBILITY responsibility="Delegate a KB ingest call to the database fetchFunction"]
// CIL[DOC-CONTEXT module=".framework/mcp/shared/kb.ts" layer="mcp" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="_ctx: any, body: Record<string, any>" outputs="Promise<any>" errors="propagates fetchFunction errors" side_effects="adds or updates KB records"]
// CIL[DOC-MICRO logic_summary="Calls fetchFunction with the kb namespace, ingest action, empty static context, and the provided body" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function kbIngest(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'ingest', {}, body)
}
// CIL[DOC-VECTOR type="context" content="purpose='Ingest content into the knowledge base'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/kb.ts:kbingest:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/kb.ts:kbreindex:function" type="function" identity="kbReindex" parent="~/.framework/mcp/shared/kb.ts"]
// CIL[DOC-MACRO purpose="Reindex the knowledge base"]
// CIL[DOC-RESPONSIBILITY responsibility="Delegate a KB reindex call to the database fetchFunction"]
// CIL[DOC-CONTEXT module=".framework/mcp/shared/kb.ts" layer="mcp" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="_ctx: any, body: Record<string, any>" outputs="Promise<any>" errors="propagates fetchFunction errors" side_effects="rebuilds the KB index"]
// CIL[DOC-MICRO logic_summary="Calls fetchFunction with the kb namespace, reindex action, empty static context, and the provided body" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function kbReindex(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'reindex', {}, body)
}
// CIL[DOC-VECTOR type="context" content="purpose='Reindex the knowledge base'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/kb.ts:kbreindex:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/kb.ts:kbrevoke:function" type="function" identity="kbRevoke" parent="~/.framework/mcp/shared/kb.ts"]
// CIL[DOC-MACRO purpose="Revoke a knowledge base record"]
// CIL[DOC-RESPONSIBILITY responsibility="Delegate a KB revoke call to the database fetchFunction"]
// CIL[DOC-CONTEXT module=".framework/mcp/shared/kb.ts" layer="mcp" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="_ctx: any, body: Record<string, any>" outputs="Promise<any>" errors="propagates fetchFunction errors" side_effects="removes or invalidates the specified KB record"]
// CIL[DOC-MICRO logic_summary="Calls fetchFunction with the kb namespace, revoke action, empty static context, and the provided body" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function kbRevoke(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'revoke', {}, body)
}
// CIL[DOC-VECTOR type="context" content="purpose='Revoke a knowledge base record'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/kb.ts:kbrevoke:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/kb.ts:kbpublish:function" type="function" identity="kbPublish" parent="~/.framework/mcp/shared/kb.ts"]
// CIL[DOC-MACRO purpose="Publish a knowledge base record"]
// CIL[DOC-RESPONSIBILITY responsibility="Delegate a KB publish call to the database fetchFunction"]
// CIL[DOC-CONTEXT module=".framework/mcp/shared/kb.ts" layer="mcp" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="_ctx: any, body: Record<string, any>" outputs="Promise<any>" errors="propagates fetchFunction errors" side_effects="publishes the specified KB record"]
// CIL[DOC-MICRO logic_summary="Calls fetchFunction with the kb namespace, publish action, empty static context, and the provided body" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function kbPublish(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'publish', {}, body)
}
// CIL[DOC-VECTOR type="context" content="purpose='Publish a knowledge base record'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/kb.ts:kbpublish:function"]
