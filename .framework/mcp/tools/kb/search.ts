
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { kbSearch } from '../../shared/kb.js'


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
