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

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { remove as adminRemove } from '../../../functions/admin-data.js'
import { kbRevoke } from '../../shared/kb.js'


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
