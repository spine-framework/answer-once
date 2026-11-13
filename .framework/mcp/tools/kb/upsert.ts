
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { create as adminCreate, update as adminUpdate } from '../../../functions/admin-data.js'
import { kbIngest, kbRevoke } from '../../shared/kb.js'


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
