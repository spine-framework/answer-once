import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { kbIngest } from '../../shared/kb.js'


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
