// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/context.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-MACRO purpose="MCP tool module that exposes CIL context and post-edit helpers for named chunks"]
// CIL[DOC-RESPONSIBILITY responsibility="Register MCP tools providing pre-edit context briefs and post-edit next steps"]
// CIL[DOC-CONTEXT module="mcp-cil-context" layer="tools" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance" outputs="registered tools" errors="none" side_effects="registers three tools on the server"]
// CIL[DOC-MICRO logic_summary="Imports SDK, zod, and shared DB helpers; no runtime logic" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb, resolveLinkTypeId } from '../../shared/db.js'
// CIL[DOC-VECTOR type="context" content="purpose='MCP tool module that exposes CIL context and post-edit helpers for named chunks'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/context.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/context.ts:getChunkById:function" type="function" identity="getChunkById" parent="~/.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-MACRO purpose="Fetch a CIL chunk row by its primary id"]
// CIL[DOC-RESPONSIBILITY responsibility="Return raw chunk data for a given id"]
// CIL[DOC-CONTEXT module="mcp-cil-context" layer="data-access" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-CONTRACT inputs="id: string" outputs="chunk data or undefined" errors="none" side_effects="queries adminDb"]
// CIL[DOC-MICRO logic_summary="Selects from items table by id" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getChunkById(id: string) {
  const { data } = await adminDb.from('items').select('id, title, data')
    .eq('id', id).maybeSingle()
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a CIL chunk row by its primary id'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/context.ts:getChunkById:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/context.ts:getChunkByStableId:function" type="function" identity="getChunkByStableId" parent="~/.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-MACRO purpose="Fetch an active CIL chunk by project and stable id"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the matching chunk or undefined"]
// CIL[DOC-CONTEXT module="mcp-cil-context" layer="data-access" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, stableId: string, versionId?: string" outputs="chunk data" errors="none" side_effects="queries adminDb with filters"]
// CIL[DOC-MICRO logic_summary="Builds a filtered Supabase query and returns maybeSingle result" notable_decisions="[]"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Fetch an active CIL chunk by project and stable id'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/context.ts:getChunkByStableId:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/context.ts:findChunkByName:function" type="function" identity="findChunkByName" parent="~/.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-MACRO purpose="Find an active CIL chunk by chunk name"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the first matching chunk by name"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="mcp-cil-context" layer="data-access" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-CONTRACT inputs="name: string, projectId?: string" outputs="chunk data" errors="none" side_effects="queries adminDb"]
// CIL[DOC-MICRO logic_summary="Filters by chunk_name and optional project, returns first result" notable_decisions="[]"]
async function findChunkByName(name: string, projectId?: string) {
  let q = adminDb.from('items').select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>chunk_name', 'eq', name)
    .eq('is_active', true)
  if (projectId) q = (q as any).filter('data->>project_id', 'eq', projectId)
  const { data } = await (q as any).limit(1).maybeSingle()
  return data
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/context.ts:findChunkByName:function"]

// CIL[DOC-VECTOR type="context" content="purpose='Find an active CIL chunk by chunk name'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/context.ts:blastRadiusBFS:function" type="function" identity="blastRadiusBFS" parent="~/.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-MACRO purpose="Compute transitive callers of a chunk up to a max depth"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a list of caller chunks with depth metadata"]
// CIL[DOC-CONTEXT module="mcp-cil-context" layer="analysis" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-CONTRACT inputs="chunkId, maxDepth, callsLinkTypeId" outputs="caller records" errors="none" side_effects="queries links and items tables"]
// CIL[DOC-MICRO logic_summary="Breadth-first search over cil_calls links in reverse direction" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function blastRadiusBFS(
  chunkId: string, maxDepth: number, callsLinkTypeId: string
): Promise<{ chunk_id: string; chunk_name: string; file_path: string; depth: number }[]> {
  const visited = new Set([chunkId])
  const queue: { id: string; depth: number }[] = [{ id: chunkId, depth: 0 }]
  const result: { chunk_id: string; chunk_name: string; file_path: string; depth: number }[] = []

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!
    if (depth >= maxDepth) continue
    const { data: callerLinks } = await adminDb.from('links').select('source_id')
      .eq('link_type_id', callsLinkTypeId).eq('target_id', id)
    for (const link of callerLinks || []) {
      if (visited.has(link.source_id)) continue
      visited.add(link.source_id)
      const c = await getChunkById(link.source_id)
      if (!c) continue
      result.push({ chunk_id: c.id, chunk_name: c.data?.chunk_name || '', file_path: c.data?.file_path || '', depth: depth + 1 })
      queue.push({ id: c.id, depth: depth + 1 })
    }
  }
  return result
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/context.ts:blastRadiusBFS:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/context.ts:safetyVerdict:function" type="function" identity="safetyVerdict" parent="~/.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Compute transitive callers of a chunk up to a max depth'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Assess edit safety for a chunk based on stability, blast radius, docs, and config dependencies"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a safety level and list of risk flags"]
// CIL[DOC-CONTEXT module="mcp-cil-context" layer="analysis" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-CONTRACT inputs="chunk, blastRadius, configDeps" outputs="{level, flags, summary}" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Inspects chunk data and derived metrics to classify risk" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function safetyVerdict(chunk: any, blastRadius: any[], configDeps: any[]) {
  const d = chunk.data || {}
  const flags: string[] = []
  if (d.stability === 'stable') flags.push('stability=stable: downstream consumers may break on signature changes')
  if (blastRadius.length >= 10) flags.push(`high blast radius: ${blastRadius.length} transitive callers`)
  else if (blastRadius.length >= 3) flags.push(`moderate blast radius: ${blastRadius.length} callers`)
  if (configDeps.length > 0) flags.push(`reads ${configDeps.length} config field(s)`)
  if (!d.macro && !d.micro) flags.push('no contract documentation')
  if (d.is_dead_code) flags.push('flagged as dead code')
  const level = flags.length === 0 ? 'safe' : (d.stability === 'stable' || blastRadius.length >= 10) ? 'risky' : 'caution'
  return { level, flags, summary: level === 'safe' ? 'Low risk.' : `${level === 'risky' ? 'High' : 'Moderate'} risk — review flags before editing.` }
}
// CIL[DOC-VECTOR type="context" content="purpose='Assess edit safety for a chunk based on stability, blast radius, docs, and config dependencies'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/context.ts:safetyVerdict:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/context.ts:buildBrief:function" type="function" identity="buildBrief" parent="~/.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-MACRO purpose="Assemble a full pre-edit context brief for a chunk"]
// CIL[DOC-RESPONSIBILITY responsibility="Return contract, blast radius, callees, tests, config deps, and safety verdict"]
// CIL[DOC-CONTEXT module="mcp-cil-context" layer="analysis" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any, maxDepth: number = 4" outputs="context brief object" errors="none" side_effects="queries multiple link and item tables"]
// CIL[DOC-MICRO logic_summary="Resolves link types, computes blast radius, gathers callees, tests, and config dependencies" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function buildBrief(chunk: any, maxDepth = 4) {
  const d = chunk.data || {}
  const [callsId, testedById, configuresId] = await Promise.all([
    resolveLinkTypeId('cil_calls').catch(() => null),
    resolveLinkTypeId('cil_tested_by').catch(() => null),
    resolveLinkTypeId('cil_configures').catch(() => null),
  ])

  const blastRadius = callsId ? await blastRadiusBFS(chunk.id, maxDepth, callsId) : []

  const callees: any[] = []
  if (callsId) {
    const { data: ls } = await adminDb.from('links').select('target_id').eq('link_type_id', callsId).eq('source_id', chunk.id)
    for (const l of ls || []) {
      const c = await getChunkById(l.target_id)
      if (c) callees.push({ chunk_id: c.id, chunk_name: c.data?.chunk_name || '', file_path: c.data?.file_path || '' })
    }
  }

  const testPaths: { path: string; is_e2e: boolean }[] = []
  if (testedById) {
    const { data: ls } = await adminDb.from('links').select('target_id, metadata').eq('link_type_id', testedById).eq('source_id', chunk.id)
    for (const l of ls || []) testPaths.push({ path: l.metadata?.test_path || '', is_e2e: l.metadata?.is_e2e || false })
  }
  if (testPaths.length === 0) {
    if (d.test_unit_path) testPaths.push({ path: d.test_unit_path, is_e2e: false })
    if (d.test_e2e_path)  testPaths.push({ path: d.test_e2e_path, is_e2e: true })
  }

  const configDeps: { field_name: string; config_id: string }[] = []
  if (configuresId) {
    const { data: ls } = await adminDb.from('links').select('source_id, metadata').eq('link_type_id', configuresId).eq('target_id', chunk.id)
    for (const l of ls || []) {
      const ci = await getChunkById(l.source_id)
      if (ci) configDeps.push({ field_name: ci.data?.field_name || '', config_id: l.source_id })
    }
  }

  return {
    chunk_id: chunk.id,
    chunk_name: d.chunk_name || '',
    file_path: d.file_path || '',
    line_start: d.line_start || null,
    line_end: d.line_end || null,
    chunk_type: d.chunk_type || '',
    source_set_id: d.source_set_id || null,
    layer: d.layer || null,
    contract: {
      description: d.description || '',
      module: d.module || '',
      audience: d.audience || '',
      macro: d.macro || '',
      micro: d.micro || '',
      input_spec: d.input_spec || '',
      output_spec: d.output_spec || '',
      side_effects: d.side_effects || '',
      throws: d.throws || '',
      stability: d.stability || 'unknown',
      called_by: d.called_by || '',
      calls: d.calls || '',
      tags: d.tags || '',
      complexity: d.complexity || '',
      error_handling: d.error_handling || '',
      related_files: d.related_files || d.see_also || '',
      depends_on: d.depends_on || [],
      depended_by: d.depended_by || [],
      doc_confidence: d.doc_confidence || 'unverified_legacy',
      validation_errors: d.doc_validation_errors || [],
    },
    hash: { stored_hash: d.stored_hash || null, hash_updated_at: d.hash_updated_at || null },
    blast_radius: { direct_caller_count: blastRadius.filter(r => r.depth === 1).length, total_affected: blastRadius.length, callers: blastRadius },
    calls: callees,
    test_paths: testPaths,
    config_dependencies: configDeps,
    edit_safety: safetyVerdict(chunk, blastRadius, configDeps),
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Assemble a full pre-edit context brief for a chunk'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/context.ts:buildBrief:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/context.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-MACRO purpose="Register CIL context tools on an MCP server"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose spine_cil_find_context, spine_cil_get_context, and spine_cil_post_edit"]
// CIL[DOC-CONTEXT module="mcp-cil-context" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/context.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="none" errors="none" side_effects="registers three tools"]
// CIL[DOC-MICRO logic_summary="Calls server.registerTool for find context, get context, and post edit handlers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {

  server.registerTool(
    'spine_cil_find_context',
    {
      description: 'Get a full pre-edit context brief for a chunk by name. Call this BEFORE editing any named chunk. Returns contract, blast radius, test paths, config dependencies, and an edit_safety verdict (safe/caution/risky).',
      inputSchema: z.object({
        stable_id: z.string().describe('Exact stable_id of the chunk'),
        project_id: z.string().uuid().describe('The cil_project UUID'),
        version_id: z.string().optional().describe('Optional version UUID to scope the lookup'),
        max_depth: z.number().int().min(1).max(6).default(4).optional().describe('BFS depth for blast radius traversal'),
      }),
    },
    async ({ stable_id, project_id, version_id, max_depth }) => {
      const chunk = await getChunkByStableId(project_id, stable_id, version_id)
      if (!chunk) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `No chunk with stable_id "${stable_id}" found`, hint: 'Use spine_cil_search_chunks to find chunks by description' }) }] }
      }
      const brief = await buildBrief(chunk, max_depth ?? 4)
      return { content: [{ type: 'text', text: JSON.stringify({ ok: true, brief }, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_get_context',
    {
      description: 'Get a full pre-edit context brief for a chunk by its stable_id. Returns contract, blast radius, test paths, config dependencies, and edit_safety verdict.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        stable_id: z.string().describe('The chunk stable_id'),
        version_id: z.string().optional().describe('Optional version UUID to scope the lookup'),
        max_depth: z.number().int().min(1).max(6).default(4).optional(),
      }),
    },
    async ({ project_id, stable_id, version_id, max_depth }) => {
      const chunk = await getChunkByStableId(project_id, stable_id, version_id)
      if (!chunk) return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Chunk not found: ${stable_id}` }) }] }
      const brief = await buildBrief(chunk, max_depth ?? 4)
      return { content: [{ type: 'text', text: JSON.stringify({ ok: true, brief }, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_post_edit',
    {
      description: 'Call this AFTER editing a chunk. Returns its stored hash status and exact next_steps commands to reindex and validate the change.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        stable_id: z.string().describe('The stable_id of the chunk you just edited'),
        version_id: z.string().optional().describe('Optional version UUID to scope the lookup'),
      }),
    },
    async ({ project_id, stable_id, version_id }) => {
      const chunk = await getChunkByStableId(project_id, stable_id, version_id)
      if (!chunk) return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Chunk not found: ${stable_id}` }) }] }
      const d = chunk.data || {}
      const result = {
        ok: true,
        stable_id,
        project_id,
        version_id: version_id || d.version_id || null,
        chunk_name: d.chunk_name || '',
        file_path: d.file_path || '',
        stored_hash: d.stored_hash || null,
        hash_updated_at: d.hash_updated_at || null,
        action_required: d.stored_hash
          ? 'Run spine_cil_reindex_chunk to refresh the stored hash after your edit, then spine_cil_validate_file to confirm drift is resolved.'
          : 'No stored hash yet — run spine_cil_reindex_chunk or Pass 2 ingestion.',
        next_steps: [
          `spine_cil_reindex_chunk({ project_id: "${d.project_id || project_id}", stable_id: "${stable_id}", version_id: "${version_id || d.version_id || ''}", also_embed: true })`,
          `spine_cil_validate_file({ project_id: "${d.project_id || project_id}", file_path: "${d.file_path || ''}" })`,
        ],
      }
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register CIL context tools on an MCP server'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/context.ts:register:function"]
