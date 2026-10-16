// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/revoke.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/revoke.ts"]
// CIL[DOC-MACRO purpose="MCP tool module that registers the spine_kb_revoke KB item revocation capability"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose spine_kb_revoke to the MCP server for marking all embeddings of a KB item as revoked"]
// CIL[DOC-CONTEXT module="mcp-tools-kb" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance" outputs="registered tool binding" errors="registration failures" side_effects="spine_kb_revoke becomes available on the MCP server"]
// CIL[DOC-MICRO logic_summary="Imports the MCP server SDK, zod, shared admin DB, and the kbRevoke helper" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ai-agents"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { kbRevoke } from '../../shared/kb.js'
// CIL[DOC-VECTOR type="context" content="purpose='MCP tool module that registers the spine_kb_revoke KB item revocation capability'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/revoke.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/revoke.ts:buildCtx:function" type="function" identity="buildCtx" parent="~/.framework/mcp/tools/kb/revoke.ts"]
// CIL[DOC-MACRO purpose="Construct a machine request context for a KB revoke operation"]
// CIL[DOC-RESPONSIBILITY responsibility="Create a valid request context object using the shared admin DB and a system-admin machine principal"]
// CIL[DOC-CONTEXT module="mcp-tools-kb" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/revoke.ts"]
// CIL[DOC-CONTRACT inputs="accountId: string" outputs="RequestContext-like object { requestId, accountId, principal, db, trace }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a unique requestId, sets a machine principal with the system_admin role, and returns the adminDb context" notable_decisions="[]"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Construct a machine request context for a KB revoke operation'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/revoke.ts:buildCtx:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/revoke.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/revoke.ts"]
// CIL[DOC-MACRO purpose="Register the spine_kb_revoke MCP tool on a server"]
// CIL[DOC-RESPONSIBILITY responsibility="Bind the revoke tool handler and input schema to the given McpServer"]
// CIL[DOC-CONTEXT module="mcp-tools-kb" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/revoke.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="void" errors="throws on registration or handler failure" side_effects="spine_kb_revoke tool is available and invokes kbRevoke"]
// CIL[DOC-MICRO logic_summary="Defines the tool description and zod input schema, then registers an async handler that builds context and calls kbRevoke" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {
  server.registerTool(
    'spine_kb_revoke',
    {
      description: 'Mark all embeddings for a KB item as revoked.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Item UUID'),
        account_id: z.string().uuid().describe('Account UUID for audit scope'),
      }),
    },
    async ({ id, account_id }) => {
      const ctx = buildCtx(account_id)
      const result = await kbRevoke(ctx, { id })
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the spine_kb_revoke MCP tool on a server'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/revoke.ts:register:function"]
