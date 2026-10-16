/**
 * @module   search
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides search functionality for the MCP framework, enabling content, semantic, and title-based searches. It acts as a bridge between the search core and the server, facilitating efficient query handling. INVARIANT: The search functions must always return results in a consistent format.
 *
 * @seeAlso search-core.js (contains the core search logic)
 * @seeAlso @mcp/sdk (provides the server interface)
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/search.ts"]
// CIL[DOC-MACRO purpose="Provides search functionality for the MCP framework"]
// CIL[DOC-RESPONSIBILITY responsibility="Bridge the CIL search core and the MCP server by exporting the register function"]
// CIL[DOC-CONTEXT module="mcp-tools-cil" layer="shared-core" related_files=".framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Imports McpServer, zod and the search core, then exposes a register function for the MCP tool" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="both"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { contentSearch, semanticSearch, titleSearch } from './search-core.js'
// CIL[DOC-VECTOR type="context" content="purpose='Provides search functionality for the MCP framework'; No verified external callers; imports: .framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/search.ts"]
// CIL[DOC-MACRO purpose="Register the spine_cil_search_chunks MCP tool and dispatch queries"]
// CIL[DOC-RESPONSIBILITY responsibility="Implement the tool handler that selects search mode and formats JSON results"]
// CIL[DOC-CONTEXT module="mcp-tools-cil" layer="shared-core" related_files=".framework/mcp/tools/cil/search-core.ts,.framework/mcp/tools/cil/search.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="void" errors="Database and network failures propagate to caller" side_effects="registers tool on server and calls search functions"]
// CIL[DOC-MICRO logic_summary="Use server.registerTool with a zod schema, then dispatch semantic, text or hybrid search and return JSON text" notable_decisions="Hybrid merges content and semantic by similarity; falls back to title search if empty"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {

  server.registerTool(
    'spine_cil_search_chunks',
    {
      description: 'Search for code chunks by purpose, behaviour, or name. Uses hybrid semantic + text search over all embedded chunks. Returns chunk_name, file_path, macro (purpose), chunk_type, doc_confidence, and similarity score.',
      inputSchema: z.object({
        q: z.string().describe('Search query — describe what the chunk does, e.g. "authenticate user and check roles"'),
        project_id: z.string().optional().describe('Limit to a specific project UUID'),
        mode: z.enum(['hybrid', 'semantic', 'text']).default('hybrid').optional().describe('hybrid = semantic + content; semantic = embedding only; text = name/path substring'),
        limit: z.number().int().min(1).max(50).default(10).optional().describe('Max results to return'),
      }),
    },
    async ({ q, project_id, mode, limit }) => {
      let results: any[] = []

      if (mode === 'semantic') {
        results = await semanticSearch({ q, project_id, limit })
        if (results.length === 0) results = await contentSearch({ q, project_id, limit })
      } else if (mode === 'text') {
        results = await titleSearch({ q, project_id, limit })
      } else {
        const [content, semantic] = await Promise.all([
          contentSearch({ q, project_id, limit }),
          semanticSearch({ q, project_id, limit }),
        ])
        const byId = new Map<string, any>()
        for (const r of content) byId.set(r.id, r)
        for (const r of semantic) {
          const existing = byId.get(r.id)
          if (!existing || (r.similarity ?? 0) > (existing.similarity ?? 0)) {
            byId.set(r.id, r)
          }
        }
        results = Array.from(byId.values())
          .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
          .slice(0, limit ?? 10)
        if (results.length === 0) results = await titleSearch({ q, project_id, limit })
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ query: q, mode: mode ?? 'hybrid', count: results.length, results }, null, 2),
        }],
      }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the spine_cil_search_chunks MCP tool and dispatch queries'; No verified external callers; imports: .framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search.ts:register:function"]
