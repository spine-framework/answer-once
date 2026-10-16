// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/reindex.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/reindex.ts"]
// CIL[DOC-MACRO purpose="MCP KB reindex tool registration"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the register function and buildCtx helper to wire the kb reindex MCP tool."]
// CIL[DOC-CONTEXT module="mcp-tools-kb" layer="tool" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="registered kb reindex tool" errors="runtime registration failures" side_effects="registers 'spine_kb_reindex' tool"]
// CIL[DOC-MICRO logic_summary="Imports McpServer, zod, adminDb, and kbReindex; exports register and buildCtx." notable_decisions="Uses a machine principal with system-admin role for internal requests."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="maintainer"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { kbReindex } from '../../shared/kb.js'
// CIL[DOC-VECTOR type="context" content="purpose='MCP KB reindex tool registration'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/reindex.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/reindex.ts:buildCtx:function" type="function" identity="buildCtx" parent="~/.framework/mcp/tools/kb/reindex.ts"]
// CIL[DOC-MACRO purpose="Build a request context for the kb reindex tool"]
// CIL[DOC-RESPONSIBILITY responsibility="Constructs an internal request context with a machine principal and admin database."]
// CIL[DOC-CONTEXT module="kb" layer="mcp" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/reindex.ts"]
// CIL[DOC-CONTRACT inputs="accountId: string" outputs="RequestContext-like object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a context with a generated requestId, accountId, machine principal, adminDb, and undefined trace." notable_decisions="Casts the returned object as any."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildCtx(accountId: string) {
  return {
    requestId: `kb-mcp-${Date.now()}`,
    accountId,
    principal: {
      id: 'kb-mcp',
      type: 'machine' as const,
      roles: [{ slug: 'system_admin', is_system: true }]
    },
    db: adminDb,
    trace: undefined,
  } as any
}
// CIL[DOC-VECTOR type="context" content="purpose='Build a request context for the kb reindex tool'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/reindex.ts:buildCtx:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/reindex.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/reindex.ts"]
// CIL[DOC-MACRO purpose="Register the kb reindex tool on an MCP server"]
// CIL[DOC-RESPONSIBILITY responsibility="Binds the spine_kb_reindex tool to the provided McpServer with a zod input schema."]
// CIL[DOC-CONTEXT module="kb" layer="mcp" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/reindex.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="void" errors="none" side_effects="registers the 'spine_kb_reindex' tool with the server"]
// CIL[DOC-MICRO logic_summary="Defines the input schema and async handler that builds a context and calls kbReindex, returning JSON." notable_decisions="app_id is optional; response is JSON stringified."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {
  server.registerTool(
    'spine_kb_reindex',
    {
      description: 'Re-ingest all published records of a KB type.',
      inputSchema: z.object({
        type_slug: z.string().describe('KB type slug'),
        account_id: z.string().uuid().describe('Account UUID for audit scope'),
        app_id: z.string().uuid().optional().describe('Filter by app_id'),
      }),
    },
    async ({ type_slug, account_id, app_id }) => {
      const ctx = buildCtx(account_id)
      const result = await kbReindex(ctx, { type_slug, app_id })
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the kb reindex tool on an MCP server'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/reindex.ts:register:function"]
