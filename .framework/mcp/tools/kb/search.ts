// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/search.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/search.ts"]
// CIL[DOC-MACRO purpose="MCP tool module that registers the spine_kb_search tool for querying the knowledge base"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose a Model Context Protocol tool to perform vector similarity searches over published knowledge base articles"]
// CIL[DOC-CONTEXT module="mcp/tools/kb" layer="interface" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance" outputs="registered 'spine_kb_search' tool" errors="throws if server registration fails" side_effects="adds a tool to the MCP server"]
// CIL[DOC-MICRO logic_summary="Imports dependencies and re-exports register for the kb search MCP tool" notable_decisions="Uses adminDb and a fixed machine principal for context"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="mcp consumers, ai agents"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { kbSearch } from '../../shared/kb.js'
// CIL[DOC-VECTOR type="context" content="purpose='MCP tool module that registers the spine_kb_search tool for querying the knowledge base'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/search.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/search.ts:buildCtx:function" type="function" identity="buildCtx" parent="~/.framework/mcp/tools/kb/search.ts"]
// CIL[DOC-MACRO purpose="Build an admin request context for knowledge base search"]
// CIL[DOC-RESPONSIBILITY responsibility="Construct a RequestContext-like object with a fixed machine principal and adminDb connection"]
// CIL[DOC-CONTEXT module="mcp/tools/kb" layer="utility" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/search.ts"]
// CIL[DOC-CONTRACT inputs="accountId: string" outputs="request context object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns an object containing requestId, accountId, principal, db, and trace" notable_decisions="Principal uses the system_admin role; trace is undefined; cast to any"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Build an admin request context for knowledge base search'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/search.ts:buildCtx:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/search.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/search.ts"]
// CIL[DOC-MACRO purpose="Register the spine_kb_search tool on the provided MCP server"]
// CIL[DOC-RESPONSIBILITY responsibility="Define input schema and handler for vector similarity knowledge base search"]
// CIL[DOC-CONTEXT module="mcp/tools/kb" layer="interface" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/search.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="none (registers tool by side effect)" errors="Propagates errors from kbSearch" side_effects="Registers the 'spine_kb_search' tool and calls kbSearch on each invocation"]
// CIL[DOC-MICRO logic_summary="Registers a tool with zod input schema and an async handler that builds a context and calls kbSearch" notable_decisions="Defaults type_slugs to a public/internal/admin list and passes optional filters/limits through unchanged"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {
  server.registerTool(
    'spine_kb_search',
    {
      description: 'Search the knowledge base using vector similarity. Returns published articles ranked by similarity.',
      inputSchema: z.object({
        query: z.string().describe('Search query'),
        account_id: z.string().uuid().describe('Account UUID to scope results'),
        type_slugs: z.array(z.string()).optional().describe('Limit to these kb type slugs'),
        sources: z.array(z.enum(['kb', 'code'])).optional().describe('Sources to search'),
        app_id: z.string().uuid().optional().describe('Filter by app_id'),
        filters: z.record(z.any()).optional().describe('Post-match filters on record data, e.g. { product: ["example-app"], category: ["how-to"] }'),
        vector_fields: z.array(z.string()).optional().describe('Specific vector fields to search'),
        limit: z.number().int().min(1).max(50).optional().describe('Max results'),
        offset: z.number().int().min(0).optional().describe('Result offset'),
      }),
    },
    async ({ query, account_id, type_slugs, sources, app_id, filters, vector_fields, limit, offset }) => {
      const ctx = buildCtx(account_id)
      const result = await kbSearch(ctx, {
        query,
        type_slugs: type_slugs || ['kb-spine-admin', 'kb-spine-internal', 'kb-spine-public'],
        sources,
        app_id,
        filters,
        vector_fields,
        limit,
        offset,
      })
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the spine_kb_search tool on the provided MCP server'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/search.ts:register:function"]
