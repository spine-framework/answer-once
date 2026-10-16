// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/list-types.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/list-types.ts"]
// CIL[DOC-MACRO purpose="Provides module-level JSDoc and imports for the list-types KB tool"]
// CIL[DOC-RESPONSIBILITY responsibility="Documents the module scope, audience, and dependencies for the MCP KB list-types tool"]
// CIL[DOC-CONTEXT module="list-types" layer="shared-core" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines module metadata and imports required for the tool" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="both"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
// CIL[DOC-VECTOR type="context" content="purpose='Provides module-level JSDoc and imports for the list-types KB tool'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/list-types.ts:module_header:module_header"]

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


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/list-types.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/list-types.ts"]
// CIL[DOC-MACRO purpose="Registers the spine_kb_list_types tool on an McpServer"]
// CIL[DOC-RESPONSIBILITY responsibility="Bind a named MCP tool that queries installed KB type slugs and their scopes"]
// CIL[DOC-CONTEXT module="list-types" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/kb/list-types.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer, app_id?: string" outputs="Promise<{ content: Array<{ type: 'text', text: string }> }>" errors="Error on database query failure" side_effects="Database read from public.types"]
// CIL[DOC-MICRO logic_summary="Query active types with slug ilike 'kb-%', optionally filter by app_id, and return a JSON list of slug, app_id, and scope" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Registers the spine_kb_list_types tool on an McpServer'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/list-types.ts:register:function"]

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
