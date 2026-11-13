
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { kbRevoke } from '../../shared/kb.js'


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
