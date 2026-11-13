
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { kbReindex } from '../../shared/kb.js'


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
