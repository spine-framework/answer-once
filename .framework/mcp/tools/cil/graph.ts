// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/graph.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/graph.ts"]
// CIL[DOC-MACRO purpose="Import dependencies and set up the CIL graph MCP tool module"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare module-level imports for the MCP CIL graph tool"]
// CIL[DOC-CONTEXT module="mcp-tools-cil" layer="tools" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import McpServer SDK, zod, and shared database helpers" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="maintainer"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb, resolveLinkTypeId, fetchFunction } from '../../shared/db.js'
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies and set up the CIL graph MCP tool module'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/graph.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/graph.ts:getChunkById:function" type="function" identity="getChunkById" parent="~/.framework/mcp/tools/cil/graph.ts"]
// CIL[DOC-MACRO purpose="Fetch a single CIL chunk by its primary item id"]
// CIL[DOC-RESPONSIBILITY responsibility="Load a chunk record from the items table by id"]
// CIL[DOC-CONTEXT module="mcp-tools-cil" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/graph.ts"]
// CIL[DOC-CONTRACT inputs="id: string" outputs="chunk record or null" errors="none" side_effects="database read"]
// CIL[DOC-MICRO logic_summary="Query adminDb items table for id, title, data matching the given id and return the data" notable_decisions="Uses maybeSingle to return null when no match"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getChunkById(id: string) {
  const { data } = await adminDb.from('items').select('id, title, data')
    .eq('id', id).maybeSingle()
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single CIL chunk by its primary item id'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/graph.ts:getChunkById:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/graph.ts:getChunkByStableId:function" type="function" identity="getChunkByStableId" parent="~/.framework/mcp/tools/cil/graph.ts"]
// CIL[DOC-MACRO purpose="Fetch a CIL chunk by its stable_id within a project and optional version"]
// CIL[DOC-RESPONSIBILITY responsibility="Locate a unique active CIL chunk by stable_id"]
// CIL[DOC-CONTEXT module="mcp-tools-cil" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/graph.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, stableId: string, versionId?: string" outputs="chunk record or null" errors="none" side_effects="database read"]
// CIL[DOC-MICRO logic_summary="Filter items by kb_type, project_id, stable_id, is_active and optional version_id, then return data" notable_decisions="Casts query to any when adding the optional version filter"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getChunkByStableId(projectId: string, stableId: string, versionId?: string) {
  let q = adminDb.from('items').select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>project_id', 'eq', projectId)
    .filter('data->>stable_id', 'eq', stableId)
    .eq('is_active', true)
  if (versionId) q = (q as any).filter('data->>version_id', 'eq', versionId)
  const { data } = await (q as any).maybeSingle()
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a CIL chunk by its stable_id within a project and optional version'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/graph.ts:getChunkByStableId:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/graph.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/graph.ts"]
// CIL[DOC-MACRO purpose="Register CIL graph query tools on an MCP server"]
// CIL[DOC-RESPONSIBILITY responsibility="Wire up MCP tools for blast radius, callers, file chunks and graph diff"]
// CIL[DOC-CONTEXT module="mcp-tools-cil" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/graph.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="registered tool handlers" errors="throws if cil_calls link type or chunk is not found" side_effects="registers tools on the server and queries the database and links table"]
// CIL[DOC-MICRO logic_summary="Use server.registerTool to expose four CIL graph introspection endpoints backed by Supabase items and links" notable_decisions="Returns JSON-stringified content; uses BFS for blast radius; filters symbol references for direct callers; delegates graph_diff to fetchFunction"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {

  server.registerTool(
    'spine_cil_blast_radius',
    {
      description: 'Find all chunks that transitively call a given chunk (BFS traversal). Use this before refactoring to understand how many callers will be affected.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        stable_id: z.string().describe('The chunk stable_id to analyse'),
        version_id: z.string().optional().describe('Optional version UUID to scope the lookup'),
        max_depth: z.number().int().min(1).max(6).default(4).optional().describe('Maximum BFS hop depth'),
      }),
    },
    async ({ project_id, stable_id, version_id, max_depth = 4 }) => {
      let callsId: string
      try { callsId = await resolveLinkTypeId('cil_calls') }
      catch { return { content: [{ type: 'text', text: JSON.stringify({ error: 'cil_calls link type not found — run Pass 4b first' }) }] } }

      const chunk = await getChunkByStableId(project_id, stable_id, version_id)
      if (!chunk) return { content: [{ type: 'text', text: JSON.stringify({ error: `Chunk not found: ${stable_id}` }) }] }

      const startId = chunk.id
      const visited = new Set([startId])
      const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }]
      const callers: { stable_id: string; chunk_name: string; file_path: string; depth: number }[] = []

      while (queue.length > 0) {
        const { id, depth } = queue.shift()!
        if (depth >= max_depth) continue
        const { data: links } = await adminDb.from('links').select('source_id')
          .eq('link_type_id', callsId).eq('target_id', id)
        for (const l of links || []) {
          if (visited.has(l.source_id)) continue
          visited.add(l.source_id)
          const c = await getChunkById(l.source_id)
          if (!c) continue
          callers.push({ stable_id: c.data?.stable_id || c.id, chunk_name: c.data?.chunk_name || '', file_path: c.data?.file_path || '', depth: depth + 1 })
          queue.push({ id: c.id, depth: depth + 1 })
        }
      }

      const result = {
        stable_id,
        chunk_name: chunk.data?.chunk_name || '',
        file_path: chunk.data?.file_path || '',
        max_depth,
        direct_callers: callers.filter(c => c.depth === 1).length,
        total_affected: callers.length,
        callers,
      }
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_get_callers',
    {
      description: 'Get the direct callers and symbol references (imports/references) of a chunk (depth-1 only). Faster than spine_cil_blast_radius when you just need to know what directly uses a chunk.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        stable_id: z.string().describe('The chunk stable_id'),
        version_id: z.string().optional().describe('Optional version UUID to scope the lookup'),
      }),
    },
    async ({ project_id, stable_id, version_id }) => {
      let callsId: string
      try { callsId = await resolveLinkTypeId('cil_calls') }
      catch { return { content: [{ type: 'text', text: JSON.stringify({ error: 'cil_calls link type not found' }) }] } }

      const chunk = await getChunkByStableId(project_id, stable_id, version_id)
      if (!chunk) return { content: [{ type: 'text', text: JSON.stringify({ error: `Chunk not found: ${stable_id}` }) }] }

      const { data: links } = await adminDb.from('links').select('source_id, data, metadata')
        .eq('link_type_id', callsId).eq('target_id', chunk.id)

      const callers = []
      for (const l of links || []) {
        const c = await getChunkById(l.source_id)
        if (c) callers.push({ stable_id: c.data?.stable_id || c.id, chunk_name: c.data?.chunk_name || '', file_path: c.data?.file_path || '' })
      }

      return { content: [{ type: 'text', text: JSON.stringify({ stable_id, caller_count: callers.length, callers }, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_get_file_chunks',
    {
      description: 'List all indexed chunks for a file, sorted by line number. Useful for understanding the structure of a file before editing.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('Relative file path from repo root, e.g. ".framework/cli/commands/auth.ts"'),
      }),
    },
    async ({ project_id, file_path }) => {
      const { data: chunks } = await adminDb.from('items').select('id, title, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .filter('data->>file_path', 'eq', file_path)
        .eq('is_active', true)

      if (!chunks || chunks.length === 0) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: `No chunks found for file: ${file_path}` }) }] }
      }

      const sorted = chunks
        .map((c: any) => ({
          id: c.id,
          stable_id: c.data?.stable_id || '',
          version_id: c.data?.version_id || '',
          chunk_name: c.data?.chunk_name || '',
          chunk_type: c.data?.chunk_type || '',
          line_start: c.data?.line_start || 0,
          line_end: c.data?.line_end || 0,
          macro: c.data?.macro || '',
          doc_confidence: c.data?.doc_confidence || 'unverified_legacy',
          is_dead_code: c.data?.is_dead_code || false,
          stability: c.data?.stability || '',
        }))
        .sort((a: any, b: any) => a.line_start - b.line_start)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project_id,
            file_path,
            chunk_count: sorted.length,
            chunks: sorted,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_graph_diff',
    {
      description: 'Compare the CIL call and import graph between two project versions. Returns added, removed, and unchanged edges keyed by stable IDs and file paths.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        from_version_id: z.string().uuid().describe('The source version UUID to diff from'),
        to_version_id: z.string().uuid().describe('The target version UUID to diff to'),
      }),
    },
    async ({ project_id, from_version_id, to_version_id }) => {
      try {
        const result = await fetchFunction('cil-graph', 'graph_diff', {
          project_id,
          from_version_id,
          to_version_id,
        })
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: err?.message || String(err) }) }] }
      }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register CIL graph query tools on an MCP server'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/graph.ts:register:function"]
