// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/upsert.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/upsert.ts"]
// CIL[DOC-MACRO purpose="MCP tool module that registers the spine_kb_upsert tool for creating or updating KB articles."]
// CIL[DOC-RESPONSIBILITY responsibility="Imports dependencies and exposes the register function to wire the KB upsert MCP tool into a server."]
// CIL[DOC-CONTEXT module="mcp/tools/kb" layer="tools" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance supplied at runtime through register" outputs="Registered spine_kb_upsert tool" errors="Import-time errors if dependencies are missing or malformed" side_effects="No side effects at module load"]
// CIL[DOC-MICRO logic_summary="Imports McpServer SDK, zod, adminDb, admin-data helpers, and KB ingest/revoke helpers; exports a register function for server wiring." notable_decisions="Defers persistence and embedding side effects to the tool handler; uses shared adminDb and admin-data modules."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system-admin"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { create as adminCreate, update as adminUpdate } from '../../../functions/admin-data.js'
import { kbIngest, kbRevoke } from '../../shared/kb.js'
// CIL[DOC-VECTOR type="context" content="purpose='MCP tool module that registers the spine_kb_upsert tool for creating or updating KB articles.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/upsert.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/upsert.ts:buildCtx:function" type="function" identity="buildCtx" parent="~/.framework/mcp/tools/kb/upsert.ts"]
// CIL[DOC-MACRO purpose="Construct a minimal admin request context for KB operations."]
// CIL[DOC-RESPONSIBILITY responsibility="Builds a context object with a machine principal, request id, account, db, and query for admin-data or kbIngest/kbRevoke calls."]
// CIL[DOC-CONTEXT module="mcp/tools/kb" layer="tools" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/upsert.ts"]
// CIL[DOC-CONTRACT inputs="accountId: string, query: any" outputs="Admin-like request context object" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns a hard-coded machine principal with system_admin role, adminDb, a generated requestId, and the supplied query." notable_decisions="No trace field is set; the principal is fixed to the kb-mcp machine role."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Construct a minimal admin request context for KB operations.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/upsert.ts:buildCtx:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/upsert.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/upsert.ts"]
// CIL[DOC-MACRO purpose="Register the spine_kb_upsert MCP tool on an McpServer."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the tool input schema and implement creation or update of KB items, publishing or revoking embeddings based on status."]
// CIL[DOC-CONTEXT module="mcp/tools/kb" layer="tools" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/upsert.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="Tool registered with name spine_kb_upsert" errors="Validation errors from zod or admin-data; ingest or revoke errors" side_effects="Creates or updates a KB item; publishes embeddings for published status or revokes them otherwise"]
// CIL[DOC-MICRO logic_summary="Parses zod input, builds record data, calls adminCreate or adminUpdate, then conditionally calls kbIngest or kbRevoke." notable_decisions="Status defaults to draft; published status triggers kbIngest, all other statuses trigger kbRevoke; app_id and description are optional."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {
  server.registerTool(
    'spine_kb_upsert',
    {
      description: 'Create or update a KB article through admin-data. Publishes and generates embeddings when status is published.',
      inputSchema: z.object({
        account_id: z.string().uuid().describe('Account UUID (ignored for platform-scoped types)'),
        type_slug: z.string().describe('KB type slug'),
        id: z.string().uuid().optional().describe('Item UUID; omit to create'),
        title: z.string().describe('Article title'),
        description: z.string().optional().describe('Short description'),
        content: z.string().describe('Article content'),
        tags: z.array(z.string()).optional().describe('Tags'),
        status: z.enum(['draft', 'published', 'archived']).optional().describe('Article status'),
        app_id: z.string().uuid().optional().describe('App UUID'),
        data: z.record(z.any()).optional().describe('Additional record data fields (product, category, work_ticket_id, source_file, source_function, etc.)'),
      }),
    },
    async ({ account_id, type_slug, id, title, description, content, tags, status, app_id, data: extraData }) => {
      const recordStatus = status || 'draft'

      const recordData: any = {
        entity: 'items',
        title,
        status: recordStatus,
        data: {
          ...(extraData || {}),
          content,
          tags: tags || [],
        },
      }

      if (description !== undefined) recordData.description = description
      if (app_id !== undefined) recordData.app_id = app_id

      let record: any

      if (id) {
        const ctx = buildCtx(account_id, { entity: 'items', id, method: 'PATCH' })
        record = await adminUpdate(ctx, recordData)
      } else {
        recordData.type_slug = type_slug
        const ctx = buildCtx(account_id, { entity: 'items', method: 'POST' })
        record = await adminCreate(ctx, recordData)
      }

      const ingestCtx = buildCtx(account_id, {})
      const ingestResult = record.status === 'published'
        ? await kbIngest(ingestCtx, { id: record.id })
        : await kbRevoke(ingestCtx, { id: record.id })

      return { content: [{ type: 'text', text: JSON.stringify({ record, ingest: ingestResult }) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the spine_kb_upsert MCP tool on an McpServer.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/upsert.ts:register:function"]
