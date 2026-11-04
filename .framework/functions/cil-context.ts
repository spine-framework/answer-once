// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Netlify function handler for CIL context lookup, edit-safety briefing, and post-edit next steps"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose /api/cil-context endpoint that dispatches get_context, find_context, and post_edit actions"]
// CIL[DOC-CONTEXT module="functions/cil" layer="api" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query/body: action, stable_id, version_id, project_id, chunk_id, chunk_name, max_depth" outputs="JSON { ok, brief } or { ok, error, hint }" errors="Invalid stable_id; missing version_id or chunk_id; chunk not found; unknown action" side_effects="Reads items and links tables; resolves link type IDs"]
// CIL[DOC-MICRO logic_summary="Routes requests to buildBrief or post-edit helpers and returns a structured response" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developer, ai, runtime"]




import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { parseStableId } from './_shared/cil'
import { resolveLinkTypeId } from './_shared/resolve-ids'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function handler for CIL context lookup, edit-safety briefing, and post-edit next steps'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:module_header:module_header"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:getChunkById:function" type="function" identity="getChunkById" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Fetch a single CIL chunk row by item id"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the items row for a given chunk database id"]
// CIL[DOC-CONTEXT module="functions/cil" layer="data" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="id: string" outputs="item object or null" errors="none" side_effects="Selects id, title, data from items table"]
// CIL[DOC-MICRO logic_summary="Query adminDb items by id using maybeSingle and return data" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getChunkById(id: string): Promise<any | null> {
  const { data } = await adminDb.from('items').select('id, title, data')
    .eq('id', id).maybeSingle()
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single CIL chunk row by item id'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:getChunkById:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:findChunkByName:function" type="function" identity="findChunkByName" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Find an active CIL chunk by its chunk name and optional project"]
// CIL[DOC-RESPONSIBILITY responsibility="Locate a chunk item using its chunk_name and optional project_id"]
// CIL[DOC-CONTEXT module="functions/cil" layer="data" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="name: string, projectId?: string" outputs="item object or null" errors="none" side_effects="Filters items table by kb_type, chunk_name, is_active, and optional project_id"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Build a query for cil_chunk items matching name and project, limit 1, and return data" notable_decisions=""]
// CIL[DOC-STABILITY stability="stable"]
async function findChunkByName(name: string, projectId?: string): Promise<any | null> {
  let q = adminDb.from('items').select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>chunk_name', 'eq', name)
    .eq('is_active', true)
  if (projectId) q = q.filter('data->>project_id', 'eq', projectId)
  const { data } = await q.limit(1).maybeSingle()
  return data
}
// CIL[END stable_id="~/.framework/functions/cil-context.ts:findChunkByName:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Find an active CIL chunk by its chunk name and optional project'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:getProjectActiveVersionId:function" type="function" identity="getProjectActiveVersionId" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Resolve a project's currently active version id"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the active_version_id stored on a project item"]
// CIL[DOC-CONTEXT module="functions/cil" layer="data" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string" outputs="version id string or null" errors="none" side_effects="Selects from items table"]
// CIL[DOC-MICRO logic_summary="Fetch the project item and return data.active_version_id or null" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getProjectActiveVersionId(projectId: string): Promise<string | null> {
  const { data } = await adminDb.from('items').select('id, data')
    .eq('id', projectId).maybeSingle()
  return data?.data?.active_version_id || null
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a project's currently active version id'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:getProjectActiveVersionId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:findChunkByStableId:function" type="function" identity="findChunkByStableId" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Find a CIL chunk by its stable id within a version and optional project"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the active chunk matching stable_id and version_id"]
// CIL[DOC-CONTEXT module="functions/cil" layer="data" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="stableId: string, versionId: string, projectId?: string" outputs="item object or null" errors="none" side_effects="Filters items table by kb_type, stable_id, version_id, is_active, and optional project_id"]
// CIL[DOC-MICRO logic_summary="Query cil_chunk items by stable_id, version, and project, limit 1, and return data" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function findChunkByStableId(
  stableId: string,
  versionId: string,
  projectId?: string
): Promise<any | null> {
  let q = adminDb.from('items').select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>stable_id', 'eq', stableId)
    .filter('data->>version_id', 'eq', versionId)
    .eq('is_active', true)
  if (projectId) q = q.filter('data->>project_id', 'eq', projectId)
  const { data } = await q.limit(1).maybeSingle()
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='Find a CIL chunk by its stable id within a version and optional project'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:findChunkByStableId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:blastRadiusBFS:function" type="function" identity="blastRadiusBFS" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Breadth-first search of transitive callers for a chunk"]
// CIL[DOC-RESPONSIBILITY responsibility="Collect upstream callers up to maxDepth using cil_calls links"]
// CIL[DOC-CONTEXT module="functions/cil" layer="analysis" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="chunkId: string, maxDepth: number, callsLinkTypeId: string" outputs="Array of { chunk_id, chunk_name, file_path, depth }" errors="none" side_effects="Repeatedly queries links and items tables"]
// CIL[DOC-MICRO logic_summary="Traverse caller links from target to source, tracking depth and visited set, aggregating chunk metadata" notable_decisions="Uses queue-based BFS; only follows depth hops; populates result with chunk_id, name, path, and depth"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function blastRadiusBFS(
  chunkId: string,
  maxDepth: number,
  callsLinkTypeId: string
): Promise<{ chunk_id: string; chunk_name: string; file_path: string; depth: number }[]> {
  const visited = new Set<string>([chunkId])
  const queue: { id: string; depth: number }[] = [{ id: chunkId, depth: 0 }]
  const result: { chunk_id: string; chunk_name: string; file_path: string; depth: number }[] = []

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!
    if (depth >= maxDepth) continue

    
    const { data: callerLinks } = await adminDb.from('links').select('source_id')
      .eq('link_type_id', callsLinkTypeId)
      .eq('target_id', id)

    for (const link of callerLinks || []) {
      const callerId = link.source_id
      if (visited.has(callerId)) continue
      visited.add(callerId)

      const callerChunk = await getChunkById(callerId)
      if (!callerChunk) continue

      result.push({
        chunk_id: callerId,
        chunk_name: callerChunk.data?.chunk_name || '',
        file_path: callerChunk.data?.file_path || '',
        depth: depth + 1,
      })
      queue.push({ id: callerId, depth: depth + 1 })
    }
  }

  return result
}
// CIL[DOC-VECTOR type="context" content="purpose='Breadth-first search of transitive callers for a chunk'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:blastRadiusBFS:function"]




    // CIL[DOC-STABILITY stability="internal"]
    // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
    // CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:getConfigDeps:function" type="function" identity="getConfigDeps" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Find configuration fields that target a chunk"]
// CIL[DOC-RESPONSIBILITY responsibility="Return config dependencies linked to the chunk via cil_configures"]
// CIL[DOC-CONTEXT module="functions/cil" layer="analysis" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="chunkId: string, configuresLinkTypeId: string | null" outputs="Array of { field_name, source_file, config_id }" errors="none" side_effects="Selects from links and items tables"]
// CIL[DOC-MICRO logic_summary="Fetch cil_configures links pointing to the chunk, then resolve source item metadata into config dependency records" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getConfigDeps(
  chunkId: string,
  configuresLinkTypeId: string | null
): Promise<{ field_name: string; source_file: string; config_id: string }[]> {
  if (!configuresLinkTypeId) return []

  const { data: configLinks } = await adminDb.from('links').select('source_id, metadata')
    .eq('link_type_id', configuresLinkTypeId)
    .eq('target_id', chunkId)

  if (!configLinks?.length) return []

  const results: { field_name: string; source_file: string; config_id: string }[] = []
  for (const link of configLinks) {
    const configItem = await getChunkById(link.source_id)
    if (!configItem) continue
    results.push({
      field_name: configItem.data?.field_name || link.metadata?.field_name || '',
      source_file: configItem.data?.config_table || '',
      config_id: link.source_id,
    })
  }
  return results
}
// CIL[DOC-VECTOR type="context" content="purpose='Find configuration fields that target a chunk'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:getConfigDeps:function"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:safetyVerdict:function" type="function" identity="safetyVerdict" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Classify edit risk for a chunk based on stability, blast radius, drift, and docs"]
// CIL[DOC-RESPONSIBILITY responsibility="Compute safe/caution/risky level and a human-readable flag list"]
// CIL[DOC-CONTEXT module="functions/cil" layer="analysis" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any, blastRadius: any[], driftStatus: 'current' | 'stale' | 'unknown', configDeps: any[]" outputs="{ level, summary, flags }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Collect warning flags from chunk data and derived metrics, then choose a level based on flag severity" notable_decisions="Risky if stable, high blast radius, or stale; caution otherwise; safe when no flags"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function safetyVerdict(
  chunk: any,
  blastRadius: any[],
  driftStatus: 'current' | 'stale' | 'unknown',
  configDeps: any[]
): { level: 'safe' | 'caution' | 'risky'; summary: string; flags: string[] } {
  const d = chunk.data || {}
  const flags: string[] = []

  if (d.stability === 'stable') flags.push('stability=stable: downstream consumers may break on signature changes')
  if (blastRadius.length >= 10) flags.push(`high blast radius: ${blastRadius.length} transitive callers`)
  else if (blastRadius.length >= 3) flags.push(`moderate blast radius: ${blastRadius.length} callers`)
  if (driftStatus === 'stale') flags.push('hash is stale — stored_hash does not match current disk content')
  if (configDeps.length > 0) flags.push(`reads ${configDeps.length} config field(s): ${configDeps.map(c => c.field_name).join(', ')}`)
  if (d.doc_confidence === 'unverified_legacy' || (!d.macro && !d.micro)) flags.push('no contract documentation — behaviour is undocumented')
  if (d.is_dead_code) flags.push('flagged as dead code')

  const level: 'safe' | 'caution' | 'risky' =
    flags.length === 0 ? 'safe' :
    (d.stability === 'stable' || blastRadius.length >= 10 || driftStatus === 'stale') ? 'risky' :
    'caution'

  const summary = level === 'safe'
    ? 'Low risk. Internal chunk, no significant callers, contract is documented.'
    : level === 'caution'
    ? `Moderate risk. ${flags.length} concern(s) — review flags before editing.`
    : `High risk. ${flags.filter(f => f.includes('stable') || f.includes('blast') || f.includes('stale')).join('; ')}`

  return { level, summary, flags }
}
// CIL[DOC-VECTOR type="context" content="purpose='Classify edit risk for a chunk based on stability, blast radius, drift, and docs'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:safetyVerdict:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:buildBrief:function" type="function" identity="buildBrief" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="Assemble a complete context brief for a CIL chunk"]
// CIL[DOC-RESPONSIBILITY responsibility="Return contract, hash status, blast radius, calls, tests, config deps, and edit safety verdict"]
// CIL[DOC-CONTEXT module="functions/cil" layer="analysis" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any, maxBlastDepth = 4" outputs="Record<string, any> brief" errors="Resolves link type ids with catch-to-null; drift status defaults to unknown" side_effects="Queries links and items tables multiple times"]
// CIL[DOC-MICRO logic_summary="Resolve call/test/configure link type IDs, run blast radius BFS, gather callees and test paths, load config dependencies, derive drift status, and compute safety verdict" notable_decisions="Falls back to stored test_unit_path and test_e2e_path when no test links exist; drift status is not currently computed from a hash comparison"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
async function buildBrief(chunk: any, maxBlastDepth = 4): Promise<Record<string, any>> {
  const d = chunk.data || {}

  
  const [callsLinkTypeId, testedByLinkTypeId, configuresLinkTypeId] = await Promise.all([
    resolveLinkTypeId('cil_calls').catch(() => null),
    resolveLinkTypeId('cil_tested_by').catch(() => null),
    resolveLinkTypeId('cil_configures').catch(() => null),
  ])

  
  const blastRadius = callsLinkTypeId
    ? await blastRadiusBFS(chunk.id, maxBlastDepth, callsLinkTypeId)
    : []

  
  let callees: { chunk_id: string; chunk_name: string; file_path: string }[] = []
  if (callsLinkTypeId) {
    const { data: calleeLinks } = await adminDb.from('links').select('target_id')
      .eq('link_type_id', callsLinkTypeId).eq('source_id', chunk.id)
    for (const l of calleeLinks || []) {
      const callee = await getChunkById(l.target_id)
      if (callee) callees.push({ chunk_id: callee.id, chunk_name: callee.data?.chunk_name || '', file_path: callee.data?.file_path || '' })
    }
  }

  
  let testPaths: { path: string; is_e2e: boolean }[] = []
  if (testedByLinkTypeId) {
    const { data: testLinks } = await adminDb.from('links').select('target_id, metadata')
      .eq('link_type_id', testedByLinkTypeId).eq('source_id', chunk.id)
    for (const l of testLinks || []) {
      testPaths.push({ path: l.metadata?.test_path || '', is_e2e: l.metadata?.is_e2e || false })
    }
  }
  
  if (testPaths.length === 0) {
    if (d.test_unit_path) testPaths.push({ path: d.test_unit_path, is_e2e: false })
    if (d.test_e2e_path)  testPaths.push({ path: d.test_e2e_path,  is_e2e: true  })
  }

  
  const configDeps = await getConfigDeps(chunk.id, configuresLinkTypeId)

  
  const driftStatus: 'current' | 'stale' | 'unknown' = d.stored_hash
    ? 'unknown' 
    : 'unknown'

  
  const verdict = safetyVerdict(chunk, blastRadius, driftStatus, configDeps)

  return {
    chunk_id: chunk.id,
    chunk_name: d.chunk_name || '',
    stable_id: d.stable_id || null,
    file_path: d.file_path || '',
    line_start: d.line_start || null,
    line_end: d.line_end || null,
    chunk_type: d.chunk_type || '',

    
    contract: {
      macro:        d.macro        || '',
      micro:        d.micro        || '',
      input_spec:   d.input_spec   || '',
      output_spec:  d.output_spec  || '',
      side_effects: d.side_effects || '',
      stability:    d.stability    || 'unknown',
      doc_confidence: d.doc_confidence || 'unverified_legacy',
    },

    
    hash: {
      stored_hash: d.stored_hash || null,
      hash_updated_at: d.hash_updated_at || null,
      drift_status: driftStatus,
    },

    
    blast_radius: {
      direct_caller_count: blastRadius.filter(r => r.depth === 1).length,
      total_affected: blastRadius.length,
      max_depth_searched: maxBlastDepth,
      callers: blastRadius,
    },
    calls: callees,

    
    test_paths: testPaths,

    
    config_dependencies: configDeps,

    
    edit_safety: verdict,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Assemble a complete context brief for a CIL chunk'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:buildBrief:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-context.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-context.ts"]
// CIL[DOC-MACRO purpose="createHandler wrapper dispatching cil-context API actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate input and call find or build helpers for get_context, find_context, and post_edit"]
// CIL[DOC-CONTEXT module="functions/cil" layer="api" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/cil-context.ts"]
// CIL[DOC-CONTRACT inputs="ctx and body from createHandler" outputs="JSON response for the selected action" errors="Throws on missing/invalid params or unknown action" side_effects="Calls buildBrief and database helpers"]
// CIL[DOC-MICRO logic_summary="Select action from query/body, resolve chunk by stable_id, name, or chunk_id, then build and return the brief or post-edit instructions" notable_decisions="get_context requires stable_id or chunk_id; find_context requires stable_id or chunk_name; post_edit requires chunk_id"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export const handler = createHandler(async (ctx, body) => {
  // CIL is operator tooling — every action touches the service-role client
  // and server filesystem. System principals only; tenant callers stop here.
  requireSystemContextWithAudit(ctx)

  const action = ctx.query?.action || 'get_context'

  
  if (action === 'get_context') {
    const stableId = ctx.query?.stable_id || body?.stable_id
    const versionId = ctx.query?.version_id || body?.version_id
    const projectId = ctx.query?.project_id || body?.project_id
    const chunkId = ctx.query?.chunk_id || body?.chunk_id

    let chunk: any | null = null
    if (stableId) {
      if (!parseStableId(stableId)) throw new Error('Invalid stable_id format')
      const effectiveVersionId = versionId || (projectId ? await getProjectActiveVersionId(projectId) : undefined)
      if (!effectiveVersionId) throw new Error('version_id or project_id required when using stable_id')
      chunk = await findChunkByStableId(stableId, effectiveVersionId, projectId)
      if (!chunk) throw new Error(`Chunk not found: stable_id=${stableId}, version_id=${effectiveVersionId}`)
    } else {
      if (!chunkId) throw new Error('chunk_id is required')
      chunk = await getChunkById(chunkId)
      if (!chunk) throw new Error(`Chunk not found: ${chunkId}`)
    }

    const maxDepth = parseInt(ctx.query?.max_depth || body?.max_depth || '4', 10)
    const brief = await buildBrief(chunk, maxDepth)

    return { ok: true, brief }
  }

  
  if (action === 'find_context') {
    const stableId = ctx.query?.stable_id || body?.stable_id
    const versionId = ctx.query?.version_id || body?.version_id
    const projectId = ctx.query?.project_id || body?.project_id
    const chunkName = ctx.query?.chunk_name || body?.chunk_name

    let chunk: any | null = null
    if (stableId) {
      if (!parseStableId(stableId)) throw new Error('Invalid stable_id format')
      const effectiveVersionId = versionId || (projectId ? await getProjectActiveVersionId(projectId) : undefined)
      if (!effectiveVersionId) throw new Error('version_id or project_id required when using stable_id')
      chunk = await findChunkByStableId(stableId, effectiveVersionId, projectId)
      if (!chunk) {
        return {
          ok: false,
          error: `No chunk with stable_id "${stableId}" found for version ${effectiveVersionId}`,
          hint: 'Use custom_cil-graph?action=search to find chunks by description',
        }
      }
    } else {
      if (!chunkName) throw new Error('chunk_name is required')
      chunk = await findChunkByName(chunkName, projectId)
      if (!chunk) {
        return {
          ok: false,
          error: `No chunk named "${chunkName}" found${projectId ? ` in project ${projectId}` : ''}`,
          hint: 'Use custom_cil-graph?action=search to find chunks by description',
        }
      }
    }

    const maxDepth = parseInt(ctx.query?.max_depth || body?.max_depth || '4', 10)
    const brief = await buildBrief(chunk, maxDepth)

    return { ok: true, brief }
  }

  
  
  
  if (action === 'post_edit') {
    const chunkId = ctx.query?.chunk_id || body?.chunk_id
    if (!chunkId) throw new Error('chunk_id is required')

    const chunk = await getChunkById(chunkId)
    if (!chunk) throw new Error(`Chunk not found: ${chunkId}`)

    const d = chunk.data || {}
    const hasHash = !!d.stored_hash

    return {
      ok: true,
      chunk_id: chunkId,
      chunk_name: d.chunk_name || '',
      stable_id: d.stable_id || null,
      file_path: d.file_path || '',
      stored_hash: d.stored_hash || null,
      hash_updated_at: d.hash_updated_at || null,
      has_stored_hash: hasHash,
      action_required: hasHash
        ? 'Run custom_cil-ingest?action=reindex_chunk to refresh the stored hash and code_content after your edit, then run custom_cil-validate?action=validate_file to confirm drift is resolved.'
        : 'No stored hash — run Pass 2 (custom_cil-ingest?action=pass2) to generate chunk boundaries and hashes for this file.',
      next_steps: [
        `POST /api/custom_cil-ingest?action=reindex_chunk { "project_id": "${d.project_id || '<project_id>'}", "chunk_id": "${chunkId}", "also_embed": true }`,
        `GET  /api/custom_cil-validate?action=validate_file&file_id=${d.file_id || '<file_id>'}`,
      ],
    }
  }

  throw new Error(`Unknown action: ${action}. Valid: get_context, find_context, post_edit`)
})
// CIL[DOC-VECTOR type="context" content="purpose='createHandler wrapper dispatching cil-context API actions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-context.ts:handler:constant"]


