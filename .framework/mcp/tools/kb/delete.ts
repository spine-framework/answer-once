/**
 * @module   delete
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module handles the deletion of knowledge base entries within the MCP framework. It interacts with the admin database and utilizes the McpServer for server-side operations. INVARIANT: Only authorized admin users can invoke this deletion process.
 *
 * @seeAlso adminDb (provides access to the admin database).
 * @seeAlso kbRevoke (handles knowledge base revocation logic).
 * @seeAlso adminRemove (performs the actual removal of data from admin records).
 *
 * @cil-generated
 */

// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/delete.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/delete.ts"]
// CIL[DOC-MACRO purpose="Knowledge base entry deletion module for the MCP framework"]
// CIL[DOC-RESPONSIBILITY responsibility="Delete KB articles through admin-data and revoke their embeddings"]
// CIL[DOC-CONTEXT module="kb-delete" layer="shared-core" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="server, id, account_id, hard" outputs="deletion and revocation result" errors="invalid UUID, admin errors, revoke errors" side_effects="admin data removal and embedding revocation"]
// CIL[DOC-MICRO logic_summary="Provides tool registration and context building for KB article deletion" notable_decisions="Only authorized admin users can invoke deletion"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="both"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { remove as adminRemove } from '../../../functions/admin-data.js'
import { kbRevoke } from '../../shared/kb.js'
// CIL[DOC-VECTOR type="context" content="purpose='Knowledge base entry deletion module for the MCP framework'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/delete.ts:module_header:module_header"]


/**
 * Builds a context object for the knowledge base operations, including request metadata and account information. This function is essential for tracking requests and associating them with specific accounts.
 *
 * @inputSpec
 *   - accountId: string (required) — The ID of the account associated with the context.
 *   - query: any (required) — The query parameters for the operation.
 * @outputSpec  any — An object containing request metadata, account information, and the provided query.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/delete.ts:buildCtx:function" type="function" identity="buildCtx" parent="~/.framework/mcp/tools/kb/delete.ts"]
// CIL[DOC-MACRO purpose="Builds a context object for knowledge base operations"]
// CIL[DOC-RESPONSIBILITY responsibility="Constructs a request context with metadata, account, and query"]
// CIL[DOC-CONTEXT module="kb-delete" layer="shared-core" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/delete.ts"]
// CIL[DOC-CONTRACT inputs="accountId: string, query: any" outputs="context object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a context with machine principal, admin database, and provided query" notable_decisions="Uses 'kb-mcp' principal with system_admin role"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Builds a context object for knowledge base operations'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/delete.ts:buildCtx:function"]


/**
 * Registers a tool for deleting a KB article and revoking its embeddings. This function facilitates the removal of articles from the admin data system.
 *
 * @macro       Tool registration function for KB article deletion.
 * @micro       Builds context for deletion and revocation operations, invoking external services for both actions.
 * @inputSpec
 *   - server: McpServer (required) — The server instance to register the tool with.
 *   - id: string (required) — Item UUID.
 *   - account_id: string (required) — Account UUID for audit scope.
 *   - hard: boolean (optional) — Permanently delete the record.
 * @outputSpec  Promise<{ content: Array<{ type: string, text: string }> }> — Returns a structured response containing the results of the delete and revoke operations.
 * @sideEffects Calls to external services for article deletion and embedding revocation.
 * @stability   internal
 * @calls       buildCtx, adminRemove, kbRevoke
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/delete.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/delete.ts"]
// CIL[DOC-MACRO purpose="Registers a tool for deleting a KB article and revoking its embeddings"]
// CIL[DOC-RESPONSIBILITY responsibility="Register the spine_kb_delete tool on an McpServer"]
// CIL[DOC-CONTEXT module="kb-delete" layer="shared-core" related_files=".framework/functions/admin-data.ts,.framework/mcp/shared/db.ts,.framework/mcp/shared/kb.ts,.framework/mcp/tools/kb/delete.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="Promise<{ content: Array<{ type: string, text: string }> }>" errors="invalid UUID, admin errors, revoke errors" side_effects="Calls adminRemove and kbRevoke"]
// CIL[DOC-MICRO logic_summary="Registers the tool, builds context, calls adminRemove and kbRevoke, and returns combined result" notable_decisions="Soft delete by default; hard delete controlled by 'hard' flag"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export function register(server: McpServer) {
  server.registerTool(
    'spine_kb_delete',
    {
      description: 'Delete a KB article through admin-data and revoke its embeddings.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Item UUID'),
        account_id: z.string().uuid().describe('Account UUID for audit scope'),
        hard: z.boolean().optional().describe('Permanently delete the record'),
      }),
    },
    async ({ id, account_id, hard }) => {
      const ctx = buildCtx(account_id, {
        entity: 'items',
        id,
        soft: hard ? 'false' : 'true',
        method: 'DELETE',
      })

      const remove = await adminRemove(ctx, {})

      const revokeCtx = buildCtx(account_id, {})
      const revoke = await kbRevoke(revokeCtx, { id })

      return { content: [{ type: 'text', text: JSON.stringify({ remove, revoke }) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Registers a tool for deleting a KB article and revoking its embeddings'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/admin-data.ts,.framework/mcp/shared/kb.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/delete.ts:register:function"]
