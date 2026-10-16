// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/ingest.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/ingest.ts"]
// CIL[DOC-MACRO purpose="Knowledge base data ingestion module for MCP; integrates external KB sources and ensures ingested data passes schema and validation checks before storage."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the kb ingest entry point and validation plumbing for the MCP server."]
// CIL[DOC-MICRO logic_summary="Exports the register function and serves as the integration point for the spine_kb_ingest tool." notable_decisions="Uses JSDoc metadata to document invariants and related files; delegates actual database and embedding work to shared modules."]
// CIL[DOC-CONTEXT module="ingest" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="none (module import)" outputs="register function for MCP tool registration" errors="none (initialization)" side_effects="none (definitions only)"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="both"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { kbIngest } from '../../shared/kb.js'
// CIL[DOC-VECTOR type="context" content="purpose='Knowledge base data ingestion module for MCP; integrates external KB sources and ensures ingested data passes schema and validation checks before storage.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/ingest.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/ingest.ts:buildCtx:function" type="function" identity="buildCtx" parent="~/.framework/mcp/tools/kb/ingest.ts"]
// CIL[DOC-MACRO purpose="Build a request context for a given account."]
// CIL[DOC-RESPONSIBILITY responsibility="Create and return a processing context containing request ID, principal, db, and trace for kbIngest operations."]
// CIL[DOC-MICRO logic_summary="Constructs a machine principal with the system_admin role, prefixes a request ID, and returns the context object with adminDb." notable_decisions="Uses type assertion `as any` and `machine` as const for principal; sets trace to undefined."]
// CIL[DOC-CONTEXT module="ingest" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/ingest.ts"]
// CIL[DOC-CONTRACT inputs="accountId: string" outputs="object { requestId, accountId, principal, db, trace }" errors="none" side_effects="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Build a request context for a given account.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/ingest.ts:buildCtx:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/ingest.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/ingest.ts"]
// CIL[DOC-MACRO purpose="Register the spine_kb_ingest tool on an MCP server to generate and store embeddings for published KB items."]
// CIL[DOC-RESPONSIBILITY responsibility="Bind a Zod-validated tool to the server that accepts id and account_id and invokes kbIngest with a built context."]
// CIL[DOC-MICRO logic_summary="Defines tool metadata and an async handler that builds a context and awaits kbIngest, returning the result wrapped as text content." notable_decisions="Uses Zod for input validation; builds the context with buildCtx; returns JSON stringified result in MCP text content."]
// CIL[DOC-CONTEXT module="ingest" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/ingest.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="Promise<{ content: Array<{ type: 'text', text: string }> }>" errors="throws if validation or kbIngest fails" side_effects="Registers a tool with the server"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export function register(server: McpServer) {
  server.registerTool(
    'spine_kb_ingest',
    {
      description: 'Generate and store embeddings for a published KB item.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Item UUID'),
        account_id: z.string().uuid().describe('Account UUID for audit scope'),
      }),
    },
    async ({ id, account_id }) => {
      const ctx = buildCtx(account_id)
      const result = await kbIngest(ctx, { id })
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the spine_kb_ingest tool on an MCP server to generate and store embeddings for published KB items.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/ingest.ts:register:function"]
