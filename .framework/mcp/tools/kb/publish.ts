// Knowledge base must be properly formatted before ingestion

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { update as adminUpdate } from '../../../functions/admin-data.js'
import { kbIngest } from '../../shared/kb.js'



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
