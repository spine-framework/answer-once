// CIL[BEGIN stable_id="~/.framework/functions/cil-graph.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-graph.ts"]
// CIL[DOC-MACRO purpose="Netlify function that exposes CIL chunk graph queries and search over the spine CIL index"]
// CIL[DOC-RESPONSIBILITY responsibility="Serve callers, blast radius, file chunks, project graph, search, and graph diff for CIL"]
// CIL[DOC-CONTEXT module=".framework/functions" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="HTTP action query parameter" outputs="JSON contract, graph, search results, or diff" errors="Unknown action or missing parameters" side_effects="Queries adminDb and link tables"]
// CIL[DOC-MICRO logic_summary="Creates a handler that dispatches to graph and search actions" notable_decisions="Uses Supabase RPC for vector search and link tables for edges"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="spine-ia CIL pipeline and web UI"]


import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveLinkTypeId } from './_shared/resolve-ids'
import { callOpenAIEmbeddings } from './_shared/llm'
import { parseStableId } from './_shared/cil'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function that exposes CIL chunk graph queries and search over the spine CIL index'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-graph.ts:module_header:module_header"]








// CIL[BEGIN stable_id="~/.framework/functions/cil-graph.ts:resolveChunkByStableId:function" type="function" identity="resolveChunkByStableId" parent="~/.framework/functions/cil-graph.ts"]
// CIL[DOC-MACRO purpose="Resolve a CIL chunk record from the database by its stable_id and optional version"]
// CIL[DOC-RESPONSIBILITY responsibility="Lookup chunk by stable_id, fallback to project active version when version_id omitted"]
// CIL[DOC-CONTEXT module=".framework/functions" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-graph.ts"]
// CIL[DOC-CONTRACT inputs="stableId: string, versionId?: string" outputs="chunk data or null" errors="Returns null when not found" side_effects="Reads items table via adminDb"]
// CIL[DOC-MICRO logic_summary="Parse stable_id, query any matching chunk, derive active version from project if needed, then query exact version" notable_decisions="Returns first match when no version supplied"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function resolveChunkByStableId(stableId: string, versionId?: string): Promise<any | null> {
  const parsed = parseStableId(stableId)
  if (!parsed) return null

  let effectiveVersionId = versionId
  if (!effectiveVersionId) {
    const { data: anyChunk } = await adminDb
      .from('items')
      .select('id, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>stable_id', 'eq', stableId)
      .maybeSingle()

    if (!anyChunk) return null
    const projectId = anyChunk.data?.project_id
    if (projectId) {
      const { data: project } = await adminDb
        .from('items')
        .select('id, data')
        .eq('id', projectId)
        .filter('data->>kb_type', 'eq', 'cil_project')
        .maybeSingle()

      effectiveVersionId = project?.data?.active_version_id
    }
  }

  let q = adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>stable_id', 'eq', stableId)

  if (effectiveVersionId) {
    q = q.filter('data->>version_id', 'eq', effectiveVersionId)
  }

  const { data } = await q.maybeSingle()
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a CIL chunk record from the database by its stable_id and optional version'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-graph.ts:resolveChunkByStableId:function"]
// CIL[BEGIN stable_id="~/.framework/functions/cil-graph.ts:ChunkContract:interface" type="interface" identity="ChunkContract" parent="~/.framework/functions/cil-graph.ts"]
// CIL[DOC-MACRO purpose="TypeScript contract describing a CIL chunk record for the graph API"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the shape and field set returned by get_chunk_contract"]
// CIL[DOC-CONTEXT module=".framework/functions" layer="types" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-graph.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Interface fields for chunk metadata and edges" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Declares all scalar and edge fields for a CIL chunk" notable_decisions="Uses string or null types for optional paths and version"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ChunkContract {
  id: string
  chunk_name: string
  file_path: string
  line_start: number
  line_end: number
  chunk_type: string
  macro: string
  micro: string
  input_spec: string
  output_spec: string
  side_effects: string
  stability: string
  test_unit_path: string | null
  test_e2e_path: string | null
  doc_confidence: string
  boundary_confidence: string
  stored_hash: string | null
  hash_status: 'current' | 'drift_detected' | 'unknown'
  content_hash: string | null
  version_id: string | null
  callers: { chunk_id: string; chunk_name: string; file_path: string }[]
  callees: { chunk_id: string; chunk_name: string; file_path: string }[]
  is_dead_code: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript contract describing a CIL chunk record for the graph API'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-graph.ts:ChunkContract:interface"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-graph.ts:getChunkById:function" type="function" identity="getChunkById" parent="~/.framework/functions/cil-graph.ts"]
// CIL[DOC-MACRO purpose="Fetch a single chunk by id, title, or chunk_name, with optional stable_id and version fallback"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve chunk identifier to record using multiple lookup strategies"]
// CIL[DOC-CONTEXT module=".framework/functions" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-graph.ts"]
// CIL[DOC-CONTRACT inputs="chunkId: string, stableId?: string, versionId?: string" outputs="chunk data or null" errors="Returns null when not found" side_effects="Reads active items table"]
// CIL[DOC-MICRO logic_summary="Try stable_id resolution, then id, title, and chunk_name lookups" notable_decisions="Short-circuits on stable_id before trying other keys"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getChunkById(chunkId: string, stableId?: string, versionId?: string): Promise<any | null> {
  if (stableId) {
    const chunk = await resolveChunkByStableId(stableId, versionId)
    if (chunk) return chunk
    return null
  }

  const { data: byId } = await adminDb
    .from('items')
    .select('id, title, data')
    .eq('id', chunkId)
    .maybeSingle()
  if (byId) return byId

  const { data: byTitle } = await adminDb
    .from('items')
    .select('id, title, data')
    .eq('title', chunkId)
    .eq('is_active', true)
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .maybeSingle()
  if (byTitle) return byTitle

  const { data: byChunkName } = await adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>chunk_name', 'eq', chunkId)
    .eq('is_active', true)
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .maybeSingle()
  return byChunkName
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single chunk by id, title, or chunk_name, with optional stable_id and version fallback'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-graph.ts:getChunkById:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-graph.ts:getLinkedChunks:function" type="function" identity="getLinkedChunks" parent="~/.framework/functions/cil-graph.ts"]
// CIL[DOC-MACRO purpose="Retrieve caller or callee chunks for a given chunk via the cil_calls link type"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve link type, query links, then map target/source ids to chunk metadata"]
// CIL[DOC-CONTEXT module=".framework/functions" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-graph.ts"]
// CIL[DOC-CONTRACT inputs="chunkId: string, linkTypeSlug: string, direction: callers|callees, versionId?: string" outputs="Array of chunk_id, chunk_name, file_path" errors="Returns empty array on link-type resolution failure" side_effects="Reads links and items tables"]
// CIL[DOC-MICRO logic_summary="Resolve link type, filter by version, collect ids, then map linked chunks" notable_decisions="Swallows exceptions and returns empty list on errors"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getLinkedChunks(
  chunkId: string,
  linkTypeSlug: string,
  direction: 'callers' | 'callees',
  versionId?: string
): Promise<{ chunk_id: string; chunk_name: string; file_path: string }[]> {
  try {
    const linkTypeId = await resolveLinkTypeId(linkTypeSlug)

    let query = direction === 'callees'
      ? adminDb.from('links').select('target_id, metadata').eq('source_id', chunkId).eq('link_type_id', linkTypeId)
      : adminDb.from('links').select('source_id, metadata').eq('target_id', chunkId).eq('link_type_id', linkTypeId)

    if (versionId) {
      query = query.filter('metadata->>version_id', 'eq', versionId)
    }

    const { data: links } = await query
    if (!links || links.length === 0) return []

    const ids = direction === 'callees'
      ? links.map((l: any) => l.target_id)
      : links.map((l: any) => l.source_id)

    const { data: chunks } = await adminDb
      .from('items')
      .select('id, data')
      .in('id', ids)

    return (chunks || []).map((c: any) => ({
      chunk_id: c.id,
      chunk_name: c.data?.chunk_name || c.data?.title || 'Unknown',
      file_path: c.data?.file_path || '',
    }))
  } catch {
    return []
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Retrieve caller or callee chunks for a given chunk via the cil_calls link type'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-graph.ts:getLinkedChunks:function"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-graph.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-graph.ts"]
// CIL[DOC-MACRO purpose="Main request handler for the cil-graph function dispatching graph and search actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate query parameters, route to the correct action, and return JSON results"]
// CIL[DOC-CONTEXT module=".framework/functions" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-graph.ts"]
// CIL[DOC-CONTRACT inputs="ctx, body, action via ctx.query.action, versionId via ctx.query.version_id or body" outputs="JSON response per action" errors="Throws Error for missing/invalid action or parameters" side_effects="Queries adminDb and calls embeddings"]
// CIL[DOC-MICRO logic_summary="Create handler that branches on action, runs db queries and vector search, then serializes results" notable_decisions="Vector search falls through to text search on failure; graph diff loads two versions and compares edge sets"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  // CIL is operator tooling — every action touches the service-role client
  // and server filesystem. System principals only; tenant callers stop here.
  requireSystemContextWithAudit(ctx)

  const action = ctx.query?.action

  
  if (action === 'get_chunk_contract') {
    const chunkId = ctx.query?.chunk_id
    const stableId = ctx.query?.stable_id
    const versionId = ctx.query?.version_id
    if (!chunkId && !stableId) throw new Error('chunk_id or stable_id is required')

    const chunk = await getChunkById(chunkId || '', stableId, versionId)
    if (!chunk) {
      throw new Error(stableId ? `Chunk not found for stable_id: ${stableId}` : `Chunk not found: ${chunkId}`)
    }
    const resolvedChunkId = chunk.id
    const effectiveVersionId = versionId || chunk.data?.version_id

    const [callers, callees] = await Promise.all([
      getLinkedChunks(resolvedChunkId, 'cil_calls', 'callers', effectiveVersionId),
      getLinkedChunks(resolvedChunkId, 'cil_calls', 'callees', effectiveVersionId),
    ])

    const d = chunk.data || {}
    const contract: ChunkContract = {
      id: chunk.id,
      chunk_name: d.chunk_name || chunk.title || '',
      file_path: d.file_path || '',
      line_start: d.line_start || 0,
      line_end: d.line_end || 0,
      chunk_type: d.chunk_type || '',
      macro: d.macro || '',
      micro: d.micro || '',
      input_spec: d.input_spec || '',
      output_spec: d.output_spec || '',
      side_effects: d.side_effects || '',
      stability: d.stability || 'unknown',
      test_unit_path: d.test_unit_path || null,
      test_e2e_path: d.test_e2e_path || null,
      doc_confidence: d.doc_confidence || 'unknown',
      boundary_confidence: d.boundary_confidence || 'unknown',
      stored_hash: d.stored_hash || null,
      hash_status: 'unknown', // validated on demand via custom_cil-validate
      content_hash: d.content_hash || null,
      version_id: d.version_id || null,
      callers,
      callees,
      is_dead_code: d.is_dead_code || false,
    }

    return { contract }
  }

  
  if (action === 'get_callers') {
    const chunkId = ctx.query?.chunk_id
    const stableId = ctx.query?.stable_id
    const versionId = ctx.query?.version_id
    if (!chunkId && !stableId) throw new Error('chunk_id or stable_id is required')
    const chunk = await getChunkById(chunkId || '', stableId, versionId)
    if (!chunk) {
      throw new Error(stableId ? `Chunk not found for stable_id: ${stableId}` : `Chunk not found: ${chunkId}`)
    }
    const effectiveVersionId = versionId || chunk.data?.version_id
    const callers = await getLinkedChunks(chunk.id, 'cil_calls', 'callers', effectiveVersionId)
    return { chunk_id: chunk.id, callers }
  }

  
  if (action === 'get_blast_radius') {
    const chunkId = ctx.query?.chunk_id
    const stableId = ctx.query?.stable_id
    const versionId = ctx.query?.version_id
    const maxDepth = parseInt(ctx.query?.max_depth || '3')
    if (!chunkId && !stableId) throw new Error('chunk_id or stable_id is required')

    const rootChunk = await getChunkById(chunkId || '', stableId, versionId)
    if (!rootChunk) {
      throw new Error(stableId ? `Chunk not found for stable_id: ${stableId}` : `Chunk not found: ${chunkId}`)
    }
    const resolvedChunkId = rootChunk.id
    const effectiveVersionId = versionId || rootChunk.data?.version_id

    const visited = new Set<string>()
    const queue: { id: string; depth: number }[] = [{ id: resolvedChunkId, depth: 0 }]
    const affected: { chunk_id: string; chunk_name: string; file_path: string; depth: number }[] = []

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!
      if (visited.has(id) || depth > maxDepth) continue
      visited.add(id)

      if (id !== resolvedChunkId) {
        const chunk = await getChunkById(id)
        if (chunk) {
          affected.push({
            chunk_id: id,
            chunk_name: chunk.data?.chunk_name || chunk.title || 'Unknown',
            file_path: chunk.data?.file_path || '',
            depth,
          })
        }
      }

      if (depth < maxDepth) {
        const callers = await getLinkedChunks(id, 'cil_calls', 'callers', effectiveVersionId)
        for (const caller of callers) {
          if (!visited.has(caller.chunk_id)) {
            queue.push({ id: caller.chunk_id, depth: depth + 1 })
          }
        }
      }
    }

    return {
      chunk_id: resolvedChunkId,
      max_depth: maxDepth,
      affected_count: affected.length,
      affected,
    }
  }

  
  if (action === 'get_test_paths') {
    const chunkId = ctx.query?.chunk_id
    if (!chunkId) throw new Error('chunk_id is required')

    const chunk = await getChunkById(chunkId)
    if (!chunk) throw new Error(`Chunk not found: ${chunkId}`)

    return {
      chunk_id: chunk.id,
      chunk_name: chunk.data?.chunk_name || '',
      test_unit_path: chunk.data?.test_unit_path || null,
      test_e2e_path: chunk.data?.test_e2e_path || null,
      doc_confidence: chunk.data?.doc_confidence || 'unknown',
    }
  }

  
  if (action === 'get_file_graph') {
    const fileId = ctx.query?.file_id
    if (!fileId) throw new Error('file_id is required')

    const { data: file } = await adminDb
      .from('items')
      .select('id, title, data')
      .eq('id', fileId)
      .maybeSingle()

    if (!file) throw new Error(`File not found: ${fileId}`)

    
    const { data: chunks } = await adminDb
      .from('items')
      .select('id, title, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>file_id', 'eq', fileId)
      .eq('is_active', true)

    
    let imports: any[] = []
    try {
      const importLinkTypeId = await resolveLinkTypeId('cil_imports')
      const { data: importLinks } = await adminDb
        .from('links')
        .select('target_id, metadata')
        .eq('source_id', fileId)
        .eq('link_type_id', importLinkTypeId)
      imports = importLinks || []
    } catch { /* link type may not exist yet */ }

    return {
      file: {
        id: file.id,
        file_path: file.data?.file_path || '',
        language: file.data?.language || '',
        ingestion_pass: file.data?.ingestion_pass || 0,
        stored_hash: file.data?.stored_hash || null,
        is_dead_code: file.data?.is_dead_code || false,
      },
      chunks: (chunks || []).map(c => ({
        id: c.id,
        chunk_name: c.data?.chunk_name || '',
        line_start: c.data?.line_start || 0,
        line_end: c.data?.line_end || 0,
        chunk_type: c.data?.chunk_type || '',
        boundary_confidence: c.data?.boundary_confidence || '',
        review_status: c.data?.review_status || '',
        doc_confidence: c.data?.doc_confidence || '',
        is_dead_code: c.data?.is_dead_code || false,
        stored_hash: c.data?.stored_hash || null,
      })),
      imports,
    }
  }

  
  if (action === 'search') {
    const query = ctx.query?.q || body?.q
    const projectId = ctx.query?.project_id || body?.project_id
    const versionId = ctx.query?.version_id || body?.version_id
    const limit = parseInt(ctx.query?.limit || '20')
    const mode = ctx.query?.mode || body?.mode || 'hybrid' 
    if (!query) throw new Error('q is required')

    const results: any[] = []
    const seenIds = new Set<string>()

    
    if (mode !== 'text') {
      try {
        const ej = await callOpenAIEmbeddings(ctx, [query], 'text-embedding-3-small')
        const vec = ej.data?.[0]?.embedding
            if (vec) {
              const vectorLiteral = `[${vec.join(',')}]`
              const { data: matches } = await adminDb.rpc('match_embeddings', {
                query_embedding: vectorLiteral,
                match_count: limit * 3,
                filter_vector_type: null,
                similarity_threshold: 0.15,
                filter_item_types: ['cil_chunk'],
              })

              const matchIds = [...new Set((matches || []).map((m: any) => m.document_id))]
              if (matchIds.length > 0) {
                let chunkQuery = adminDb
                  .from('items')
                  .select('id, title, data')
                  .in('data->>stable_id', matchIds)
                  .eq('is_active', true)

                if (projectId) {
                  chunkQuery = chunkQuery.filter('data->>project_id', 'eq', projectId)
                }
                if (versionId) {
                  chunkQuery = chunkQuery.filter('data->>version_id', 'eq', versionId)
                }

                const { data: chunks } = await chunkQuery
                const chunkMap = new Map((chunks || []).map((c: any) => [c.data?.stable_id, c]))

                for (const m of (matches || [])) {
                  const chunk = chunkMap.get(m.document_id)
                  if (!chunk || seenIds.has(chunk.id)) continue
                  seenIds.add(chunk.id)
                  const d = chunk.data || {}
                  results.push({
                    id: chunk.id,
                    stable_id: d.stable_id || '',
                    version_id: d.version_id || null,
                    chunk_name: d.chunk_name || chunk.title,
                    file_path: d.file_path || '',
                    chunk_type: d.chunk_type || '',
                    source_set_id: d.source_set_id || null,
                    layer: d.layer || null,
                    macro: d.macro || '',
                    micro: d.micro || '',
                    input_spec: d.input_spec || '',
                    output_spec: d.output_spec || '',
                    side_effects: d.side_effects || '',
                    stability: d.stability || 'unknown',
                    tags: d.tags || '',
                    complexity: d.complexity || '',
                    doc_confidence: d.doc_confidence || 'unverified_legacy',
                    similarity: m.similarity,
                    match_type: 'semantic',
                  })
                }
              }
            }
      } catch { /* fall through to text search */ }
    }

    
    if (mode !== 'semantic' && results.length < limit) {
      let dbQuery = adminDb
        .from('items')
        .select('id, title, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .eq('is_active', true)
        .limit(5000)

      if (projectId) dbQuery = dbQuery.filter('data->>project_id', 'eq', projectId)
      if (versionId) dbQuery = dbQuery.filter('data->>version_id', 'eq', versionId)
      const { data: textResults } = await dbQuery

      const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '')
      const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t: string) => t.length >= 2)
      const phrase = query.toLowerCase()

      const scored = (textResults || []).map((r: any) => {
        const d = r.data || {}
        const title = (r.title || '').toLowerCase()
        const macro = (d.macro || '').toLowerCase()
        const micro = (d.micro || '').toLowerCase()
        const tags = (d.tags || '').toLowerCase()
        const codeContent = (d.code_content || '').toLowerCase()
        const normTitle = title.replace(/[^a-z0-9]/g, '')
        const normMacro = macro.replace(/[^a-z0-9]/g, '')
        const normMicro = micro.replace(/[^a-z0-9]/g, '')
        const normTags = tags.replace(/[^a-z0-9]/g, '')
        const normCode = codeContent.replace(/[^a-z0-9]/g, '')
        let score = 0
        for (const term of terms) {
          if (normTitle.includes(term)) score += 3
          if (normMacro.includes(term)) score += 2
          if (normMicro.includes(term)) score += 1
          if (normTags.includes(term)) score += 1
          const codeCount = normCode.split(term).length - 1
          score += Math.min(codeCount, 3)
        }
        if (codeContent.includes(phrase) || normCode.includes(normalizedQuery)) score += 5
        return { chunk: r, score }
      })
        .filter(({ score }: any) => score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, limit - results.length)

      for (const { chunk: r, score } of scored) {
        if (seenIds.has(r.id)) continue
        seenIds.add(r.id)
        const d = r.data || {}
        results.push({
          id: r.id,
          stable_id: d.stable_id || '',
          version_id: d.version_id || null,
          chunk_name: d.chunk_name || r.title,
          file_path: d.file_path || '',
          chunk_type: d.chunk_type || '',
          source_set_id: d.source_set_id || null,
          layer: d.layer || null,
          macro: d.macro || '',
          micro: d.micro || '',
          input_spec: d.input_spec || '',
          output_spec: d.output_spec || '',
          side_effects: d.side_effects || '',
          stability: d.stability || 'unknown',
          tags: d.tags || '',
          complexity: d.complexity || '',
          doc_confidence: d.doc_confidence || 'unverified_legacy',
          similarity: score / maxScore,
          match_type: 'content',
        })
      }
    }

    return { query, mode, results, count: results.length }
  }

  
  if (action === 'get_file_chunks') {
    const fileId = ctx.query?.file_id
    if (!fileId) throw new Error('file_id is required')

    const { data: fileItem } = await adminDb.from('items').select('id, title, data')
      .eq('id', fileId).maybeSingle()
    if (!fileItem) throw new Error(`File not found: ${fileId}`)

    let versionId = ctx.query?.version_id
    if (!versionId) {
      const projectId = fileItem.data?.project_id
      if (projectId) {
        const { data: project } = await adminDb
          .from('items')
          .select('id, data')
          .eq('id', projectId)
          .filter('data->>kb_type', 'eq', 'cil_project')
          .maybeSingle()
        versionId = project?.data?.active_version_id
      }
    }

    let chunksQuery = adminDb.from('items').select('id, title, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>file_id', 'eq', fileId)
      .eq('is_active', true)

    if (versionId) chunksQuery = chunksQuery.filter('data->>version_id', 'eq', versionId)

    const { data: chunks } = await chunksQuery

    const sorted = (chunks || [])
      .map((c: any) => ({
        id: c.id,
        stable_id: c.data?.stable_id || '',
        chunk_name: c.data?.chunk_name || '',
        chunk_type: c.data?.chunk_type || '',
        line_start: c.data?.line_start || 0,
        line_end: c.data?.line_end || 0,
        macro: c.data?.macro || '',
        doc_confidence: c.data?.doc_confidence || 'unverified_legacy',
        boundary_confidence: c.data?.boundary_confidence || '',
        stored_hash: c.data?.stored_hash || null,
        is_dead_code: c.data?.is_dead_code || false,
        review_status: c.data?.review_status || '',
        stability: c.data?.stability || '',
        file_path: c.data?.file_path || fileItem.data?.file_path || '',
        project_id: c.data?.project_id || '',
      }))
      .sort((a: any, b: any) => a.line_start - b.line_start)

    return {
      file_id: fileId,
      file_path: fileItem.data?.file_path || '',
      language: fileItem.data?.language || '',
      chunk_count: sorted.length,
      chunks: sorted,
    }
  }

  
  if (action === 'get_project_graph') {
    const projectId = ctx.query?.project_id
    const versionId = ctx.query?.version_id
    if (!projectId) throw new Error('project_id is required')

    const PAGE_SIZE = 1000

    async function fetchAllItems(kbType: string) {
      const out: any[] = []
      let offset = 0
      while (true) {
        let q = adminDb.from('items').select('id, title, data')
          .filter('data->>kb_type', 'eq', kbType)
          .filter('data->>project_id', 'eq', projectId)
          .eq('is_active', true)
          .range(offset, offset + PAGE_SIZE - 1)
        if (versionId) q = q.filter('data->>version_id', 'eq', versionId)
        const { data } = await q
        const rows = data || []
        out.push(...rows)
        if (rows.length < PAGE_SIZE) break
        offset += PAGE_SIZE
      }
      return out
    }

    async function fetchAllLinks(linkTypeId: string) {
      const out: any[] = []
      let offset = 0
      while (true) {
        let q = adminDb.from('links')
          .select('source_id, target_id, source_type, target_type, metadata')
          .eq('link_type_id', linkTypeId)
          .range(offset, offset + PAGE_SIZE - 1)
        if (versionId) q = q.filter('metadata->>version_id', 'eq', versionId)
        const { data } = await q
        const rows = data || []
        out.push(...rows)
        if (rows.length < PAGE_SIZE) break
        offset += PAGE_SIZE
      }
      return out
    }

    const [fileItems, chunkItems] = await Promise.all([
      fetchAllItems('cil_file'),
      fetchAllItems('cil_chunk'),
    ])

    const fileIdSet = new Set(fileItems.map((f: any) => f.id))
    const chunkIdSet = new Set(chunkItems.map((c: any) => c.id))

    let importEdges: any[] = []
    try {
      const importLinkTypeId = await resolveLinkTypeId('cil_imports')
      const edges = await fetchAllLinks(importLinkTypeId)
      importEdges = edges.filter((e: any) =>
        chunkIdSet.has(e.source_id) &&
        (fileIdSet.has(e.target_id) || chunkIdSet.has(e.target_id))
      )
    } catch { /* link type may not exist yet */ }

    let callEdges: any[] = []
    try {
      const callLinkTypeId = await resolveLinkTypeId('cil_calls')
      const edges = await fetchAllLinks(callLinkTypeId)
      callEdges = edges.filter((e: any) =>
        chunkIdSet.has(e.source_id) && chunkIdSet.has(e.target_id)
      )
    } catch { /* link type may not exist yet */ }

    return {
      project_id: projectId,
      nodes: {
        files: fileItems.map((f: any) => ({
          id: f.id,
          file_path: f.data?.file_path || '',
          language: f.data?.language || '',
          ingestion_pass: f.data?.ingestion_pass || 0,
          is_dead_code: f.data?.is_dead_code || false,
          chunk_count: f.data?.chunk_count || 0,
        })),
        chunks: chunkItems.map((c: any) => ({
          id: c.id,
          chunk_name: c.data?.chunk_name || '',
          file_id: c.data?.file_id || '',
          file_path: c.data?.file_path || '',
          chunk_type: c.data?.chunk_type || '',
          boundary_confidence: c.data?.boundary_confidence || '',
          doc_confidence: c.data?.doc_confidence || '',
          is_dead_code: c.data?.is_dead_code || false,
          stored_hash: c.data?.stored_hash || null,
        })),
      },
      edges: {
        imports: importEdges,
        calls: callEdges,
      },
    }
  }

  if (action === 'graph_diff') {
    const projectId = ctx.query?.project_id
    const fromVersionId = ctx.query?.from_version_id
    const toVersionId = ctx.query?.to_version_id
    if (!projectId) throw new Error('project_id is required')
    if (!fromVersionId) throw new Error('from_version_id is required')
    if (!toVersionId) throw new Error('to_version_id is required')

    const items: any[] = []
    for (const versionId of [fromVersionId, toVersionId]) {
      for (const kbType of ['cil_chunk', 'cil_file']) {
        const { data: rows } = await adminDb
          .from('items')
          .select('id, data')
          .filter('data->>kb_type', 'eq', kbType)
          .filter('data->>project_id', 'eq', projectId)
          .filter('data->>version_id', 'eq', versionId)
          .eq('is_active', true)
        if (rows) items.push(...rows)
      }
    }

    const stableMap = new Map<string, string>()
    const pathMap = new Map<string, string>()
    for (const item of items) {
      stableMap.set(item.id, item.data?.stable_id || item.id)
      pathMap.set(item.id, item.data?.file_path || '')
    }

    const [callsId, importsId] = await Promise.all([
      resolveLinkTypeId('cil_calls'),
      resolveLinkTypeId('cil_imports'),
    ])
    const edgeTypeById: Record<string, string> = {
      [callsId]: 'cil_calls',
      [importsId]: 'cil_imports',
    }

    async function getEdgesForVersion(versionId: string) {
      const { data: edges } = await adminDb
        .from('links')
        .select('source_id, target_id, link_type_id, metadata')
        .in('link_type_id', [callsId, importsId])
        .filter('metadata->>version_id', 'eq', versionId)

      const seen = new Map<string, { edge_type: string; from_stable_id: string; to_stable_id: string; from_file_path: string; to_file_path: string }>()
      for (const edge of edges || []) {
        const edgeType = edgeTypeById[edge.link_type_id]
        if (!edgeType) continue
        if (!stableMap.has(edge.source_id) || !stableMap.has(edge.target_id)) continue

        const fromStable = stableMap.get(edge.source_id)!
        const toStable = stableMap.get(edge.target_id)!
        const key = `${edgeType}|${fromStable}|${toStable}`
        if (seen.has(key)) continue

        seen.set(key, {
          edge_type: edgeType,
          from_stable_id: fromStable,
          to_stable_id: toStable,
          from_file_path: pathMap.get(edge.source_id) || '',
          to_file_path: pathMap.get(edge.target_id) || '',
        })
      }
      return seen
    }

    const [fromEdges, toEdges] = await Promise.all([
      getEdgesForVersion(fromVersionId),
      getEdgesForVersion(toVersionId),
    ])

    const added: any[] = []
    const removed: any[] = []
    const unchanged: any[] = []

    for (const [key, entry] of toEdges) {
      if (fromEdges.has(key)) unchanged.push(entry)
      else added.push(entry)
    }
    for (const [key, entry] of fromEdges) {
      if (!toEdges.has(key)) removed.push(entry)
    }

    return {
      project_id: projectId,
      from_version_id: fromVersionId,
      to_version_id: toVersionId,
      added,
      removed,
      unchanged,
    }
  }

  throw new Error(`Unknown action: ${action}. Valid: get_chunk_contract, get_callers, get_blast_radius, get_test_paths, get_file_graph, get_file_chunks, search, get_project_graph`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Main request handler for the cil-graph function dispatching graph and search actions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-graph.ts:handler:constant"]


