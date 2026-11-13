import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'

/**
 * @module   list-types
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module defines types for handling keyboard input in the MCP framework, facilitating the interaction between the server and client components. It ensures that the data structures used for keyboard events are validated and conform to the expected formats. INVARIANT: All keyboard events must be processed through the defined types to maintain consistency across the application.
 *
 * @seeAlso adminDb.js (provides database access for admin operations)
 * @seeAlso @modelcontextprotocol/sdk/server/mcp.js (core SDK for server interactions)
 * @seeAlso zod (used for data validation)
 *
 * @cil-generated
 */


export function register(server: McpServer) {
  server.registerTool(
    'spine_kb_list_types',
    {
      description: 'List installed KB type slugs and their scopes.',
      inputSchema: z.object({
        app_id: z.string().uuid().optional().describe('Filter by app UUID'),
      }),
    },
    async ({ app_id }) => {
      let query = adminDb
        .from('types')
        .select('slug, app_id, design_schema')
        .eq('kind', 'item')
        .eq('is_active', true)
        .ilike('slug', 'kb-%')

      if (app_id) {
        query = query.eq('app_id', app_id)
      }

      const { data, error } = await query
      if (error) throw error

      const types = (data || []).map((t: any) => ({
        slug: t.slug,
        app_id: t.app_id,
        scope: t.design_schema?.scope || 'account',
      }))

      return { content: [{ type: 'text', text: JSON.stringify({ types }) }] }
    }
  )
}

/**
 * Registers a tool to list installed KB type slugs and their scopes for a given application. This function facilitates querying and retrieving specific type information from the database.
 *
 * @macro       Tool registration function for listing KB types.
 * @micro       Constructs a database query based on optional application ID filtering.
 * @inputSpec
 *   server: McpServer (required) — the server instance to register the tool with.
 *   app_id: string (optional) — Filter by app UUID.
 * @outputSpec  Promise<{ content: Array<{ type: 'text', text: string }> }> — Returns a structured response containing the list of types.
 * @throws      Error — if the database query encounters an error.
 * @sideEffects Database read operation to fetch type data.
 * @stability   internal
 * @calls       adminDb.from('types')
 * @errorHandling throws error if the database query fails
 * @cil-generated
 */
