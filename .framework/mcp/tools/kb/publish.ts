// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/publish.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/publish.ts"]
// CIL[DOC-AUDIENCE audience="both"]
// CIL[DOC-MACRO purpose="Handle the publishing of knowledge base content within the MCP framework"]
// CIL[DOC-RESPONSIBILITY responsibility="Integrate with the McpServer and the admin database to update and ingest knowledge base content; ensure the knowledge base is properly formatted before ingestion"]
// CIL[DOC-CONTEXT module="publish" layer="shared-core" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Provides the module header and imports dependencies for the publish module" notable_decisions="Knowledge base must be properly formatted before ingestion"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { update as adminUpdate } from '../../../functions/admin-data.js'
import { kbIngest } from '../../shared/kb.js'
// CIL[DOC-VECTOR type="context" content="purpose='Handle the publishing of knowledge base content within the MCP framework'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/publish.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/publish.ts:buildctx:function" type="function" identity="buildCtx" parent="~/.framework/mcp/tools/kb/publish.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Create a context object for a specific account"]
// CIL[DOC-RESPONSIBILITY responsibility="Encapsulate relevant request and query information to standardize the context structure for operations within the module"]
// CIL[DOC-CONTEXT module="publish" layer="shared-core" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/publish.ts"]
// CIL[DOC-CONTRACT inputs="accountId (string), query (any)" outputs="object containing requestId, accountId, principal, db, trace, and query" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a request context using the provided account and query, assigning a generated requestId, a machine principal with system_admin role, the adminDb client, and the query" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]

function buildCtx(accountId: string, query: any) {
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
    query,
  } as any
}
// CIL[DOC-VECTOR type="context" content="purpose='Create a context object for a specific account'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/publish.ts:buildctx:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/publish.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/publish.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Register the spine_kb_publish tool for managing KB item publishing"]
// CIL[DOC-RESPONSIBILITY responsibility="Register a tool that sets a KB item status to published and triggers embedding generation through admin-data"]
// CIL[DOC-CONTEXT module="publish" layer="shared-core" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/publish.ts"]
// CIL[DOC-CONTRACT inputs="server (McpServer)" outputs="Promise<{ content: Array<{ type: string, text: string }> }>" errors="from adminUpdate or kbIngest" side_effects="DB writes for updating item status and generating embeddings"]
// CIL[DOC-MICRO logic_summary="Register a tool that accepts an item UUID and account UUID, builds a PATCH context for admin-data, updates status to published, builds an ingest context, and calls kbIngest to generate embeddings" notable_decisions="Returns a structured MCP content response"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]

export function register(server: McpServer) {
  server.registerTool(
    'spine_kb_publish',
    {
      description: 'Set a KB item status to published through admin-data and generate embeddings.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Item UUID'),
        account_id: z.string().uuid().describe('Account UUID for audit scope'),
      }),
    },
    async ({ id, account_id }) => {
      const ctx = buildCtx(account_id, {
        entity: 'items',
        id,
        method: 'PATCH',
      })

      const record = await adminUpdate(ctx, { status: 'published' })

      const ingestCtx = buildCtx(account_id, {})
      const ingest = await kbIngest(ingestCtx, { id })

      return { content: [{ type: 'text', text: JSON.stringify({ record, ingest }) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the spine_kb_publish tool for managing KB item publishing'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/publish.ts:register:function"]
