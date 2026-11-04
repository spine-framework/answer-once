// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Import dependencies and set module context for the cil-project Netlify function"]
// CIL[DOC-RESPONSIBILITY responsibility="Load shared middleware, database, id resolution, admin-data helpers, CIL hashing and semver for the project handler"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports createHandler, adminDb, resolveTypeId, admin-data CRUD, computeContentHash and semver to support the exported handler" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="maintainer"]


import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveTypeId } from './_shared/resolve-ids'
import { create as adminCreate, update as adminUpdate, remove as adminRemove } from './admin-data'
import { computeContentHash } from './_shared/cil'
import * as semver from 'semver'
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies and set module context for the cil-project Netlify function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:module_header:module_header"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:DEFAULT_GLOBS:constant" type="constant" identity="DEFAULT_GLOBS" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Define default source glob patterns for CIL project discovery"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the default list of file extensions to include during CIL discovery"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="constant" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string[] of glob patterns" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares a constant array of glob strings for TypeScript and TSX source discovery" notable_decisions="[]"]
const DEFAULT_GLOBS = ['**/*.ts', '**/*.tsx', '**/*.sql']
// CIL[END stable_id="~/.framework/functions/cil-project.ts:DEFAULT_GLOBS:constant"]

// CIL[DOC-VECTOR type="context" content="purpose='Define default source glob patterns for CIL project discovery'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]



// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:DEFAULT_EXCLUDE_GLOBS:constant" type="constant" identity="DEFAULT_EXCLUDE_GLOBS" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Define default exclusion globs for CIL project discovery"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide default ignored paths during CIL discovery"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="constant" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string[] of exclusion globs" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares a constant array of exclusion globs covering dependencies, build output and generated files" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const DEFAULT_EXCLUDE_GLOBS = ['node_modules/**', '.git/**', '.assembled/**', 'dist/**', 'build/**', '.netlify/**', '**/*.min.js', '**/*.d.ts']
// CIL[DOC-VECTOR type="context" content="purpose='Define default exclusion globs for CIL project discovery'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:DEFAULT_EXCLUDE_GLOBS:constant"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:SourceSet:interface" type="interface" identity="SourceSet" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Define the typed shape of a CIL project source set"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the fields of a SourceSet configuration"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="interface" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SourceSet TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares an interface with id, name, base_path, globs, exclude_globs and optional layer" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface SourceSet {
  id: string
  name: string
  base_path: string
  globs?: string[]
  exclude_globs?: string[]
  layer?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the typed shape of a CIL project source set'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:SourceSet:interface"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:CreateProjectRequest:interface" type="interface" identity="CreateProjectRequest" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Define the typed request shape for creating a CIL project"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the input fields accepted by the project create action"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="interface" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CreateProjectRequest TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares an interface with name, description, repo_path, language_mix, kind, globs, exclude_globs, source_sets and dependencies" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface CreateProjectRequest {
  name: string
  description?: string
  repo_path: string
  language_mix?: string
  kind?: 'core' | 'custom'
  globs?: string[]
  exclude_globs?: string[]
  source_sets?: SourceSet[]
  dependencies?: string[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the typed request shape for creating a CIL project'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:CreateProjectRequest:interface"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:ProjectStats:interface" type="interface" identity="ProjectStats" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Define the typed shape for CIL project statistics"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the aggregate counters returned by getProjectStats"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="interface" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ProjectStats TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares an interface with file, chunk, proposal, approved, pending review, dead code and doc confidence counters" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ProjectStats {
  file_count: number
  chunk_count: number
  proposal_count: number
  approved_count: number
  pending_review_count: number
  dead_code_count: number
  doc_verified_count: number
  doc_ai_count: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the typed shape for CIL project statistics'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:ProjectStats:interface"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:getProjectStats:function" type="function" identity="getProjectStats" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Compute aggregate CIL project statistics from the database"]
// CIL[DOC-RESPONSIBILITY responsibility="Query files, chunks and proposals for a project and return summary counts"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string" outputs="ProjectStats object" errors="throws on database error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Runs three parallel adminDb queries, filters results by review_status, is_dead_code and doc_confidence to populate counters" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getProjectStats(projectId: string): Promise<ProjectStats> {
  const [filesResult, chunksResult, proposalsResult] = await Promise.all([
    adminDb.from('items').select('id, data', { count: 'exact' })
      .filter('data->>kb_type', 'eq', 'cil_file')
      .filter('data->>project_id', 'eq', projectId)
      .eq('is_active', true),
    adminDb.from('items').select('id, data', { count: 'exact' })
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>project_id', 'eq', projectId)
      .eq('is_active', true),
    adminDb.from('items').select('id, data', { count: 'exact' })
      .filter('data->>kb_type', 'eq', 'cil_chunk_proposal')
      .filter('data->>project_id', 'eq', projectId)
      .eq('is_active', true),
  ])

  const chunks = chunksResult.data || []
  const proposals = proposalsResult.data || []

  return {
    file_count: filesResult.count || 0,
    chunk_count: chunksResult.count || 0,
    proposal_count: proposalsResult.count || 0,
    approved_count: chunks.filter(c => c.data?.review_status === 'approved').length,
    pending_review_count: proposals.filter(p => p.data?.review_status === 'pending_review').length,
    dead_code_count: chunks.filter(c => c.data?.is_dead_code === true).length,
    doc_verified_count: chunks.filter(c => c.data?.doc_confidence === 'human_verified').length,
    doc_ai_count: chunks.filter(c => c.data?.doc_confidence === 'ai_generated').length,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Compute aggregate CIL project statistics from the database'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:getProjectStats:function"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:bulkAdminRemove:function" type="function" identity="bulkAdminRemove" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Bulk delete admin-data records while tolerating individual failures"]
// CIL[DOC-RESPONSIBILITY responsibility="Remove many records of a given entity and return the count of successful deletions"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, entity: string, ids: string[]" outputs="number of successful deletions" errors="logs per-item failures and returns count" side_effects="calls adminRemove for each id"]
// CIL[DOC-MICRO logic_summary="Maps ids through adminRemove with soft false, catches errors per id, and counts non-null results" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function bulkAdminRemove(ctx: any, entity: string, ids: string[]): Promise<number> {
  const results = await Promise.all(ids.map(id =>
    adminRemove({ ...ctx, query: { ...(ctx.query || {}), entity, id, soft: 'false' } } as any).catch((e: any) => {
      console.error(`bulkAdminRemove failed: ${entity}/${id}`, e.message || e)
      return null
    })
  ))
  return results.filter(r => r !== null).length
}
// CIL[DOC-VECTOR type="context" content="purpose='Bulk delete admin-data records while tolerating individual failures'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:bulkAdminRemove:function"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:buildVersionManifest:function" type="function" identity="buildVersionManifest" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Build a version manifest from CIL project files, chunks, embeddings and links"]
// CIL[DOC-RESPONSIBILITY responsibility="Collect all versioned CIL items for a project into a manifest object"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string" outputs="Record with files, chunks, embeddings, links and metadata" errors="throws if manifest or embedding queries fail" side_effects="reads from items, embeddings and links tables"]
// CIL[DOC-MICRO logic_summary="Loads files and chunks, joins embeddings by chunk id, and batches link queries both directions to build a stable-id keyed manifest" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function buildVersionManifest(projectId: string): Promise<Record<string, any>> {
  const IN_LIMIT = 500

  const { data: fileItems, error: fErr } = await adminDb
    .from('items')
    .select('id, data')
    .filter('data->>kb_type', 'eq', 'cil_file')
    .filter('data->>project_id', 'eq', projectId)
    .eq('is_active', true)

  const { data: chunkItems, error: cErr } = await adminDb
    .from('items')
    .select('id, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>project_id', 'eq', projectId)
    .eq('is_active', true)

  if (fErr) throw new Error(`Failed to load files for manifest: ${fErr.message}`)
  if (cErr) throw new Error(`Failed to load chunks for manifest: ${cErr.message}`)

  const files: Record<string, any> = {}
  const chunks: Record<string, any> = {}
  const itemIdToStable: Record<string, { stable_id: string; type: string }> = {}

  for (const f of fileItems || []) {
    const stable = f.data?.stable_id || f.data?.file_path || f.id
    files[stable] = {
      file_id: f.id,
      stable_id: stable,
      stored_hash: f.data?.stored_hash || f.data?.file_hash || '',
      spine_version_id: f.data?.spine_version_id || '',
      customer_version_id: f.data?.customer_version_id || '',
      customized: f.data?.customized || false,
    }
    itemIdToStable[f.id] = { stable_id: stable, type: 'file' }
  }

  const chunkIds: string[] = []
  for (const c of chunkItems || []) {
    const stable = c.data?.stable_id || c.id
    chunks[stable] = {
      chunk_id: c.id,
      file_id: c.data?.file_id || '',
      file_path: c.data?.file_path || '',
      stable_id: stable,
      stored_hash: c.data?.stored_hash || c.data?.content_hash || '',
      spine_version_id: c.data?.spine_version_id || '',
      customer_version_id: c.data?.customer_version_id || '',
      customized: c.data?.customized || false,
    }
    itemIdToStable[c.id] = { stable_id: stable, type: 'chunk' }
    chunkIds.push(c.id)
  }

  const embeddings: Record<string, any> = {}
  if (chunkIds.length > 0) {
    const { data: embeddingRows, error: eErr } = await adminDb
      .from('embeddings')
      .select('id, source_item_id, data')
      .in('source_item_id', chunkIds)
      .eq('is_active', true)
    if (eErr) throw new Error(`Failed to load embeddings for manifest: ${eErr.message}`)
    for (const e of embeddingRows || []) {
      const type = e.data?.type || 'semantic'
      const contentHash = e.data?.input_hash || e.data?.content_hash || ''
      const chunkStable = itemIdToStable[e.source_item_id]?.stable_id
      if (!chunkStable) continue
      if (!embeddings[chunkStable]) embeddings[chunkStable] = {}
      embeddings[chunkStable][type] = {
        embedding_id: e.id,
        content_hash: contentHash,
      }
    }
  }

  const links: any[] = []
  const seenLinks = new Set<string>()
  const allIds = Object.keys(itemIdToStable)
  for (let i = 0; i < allIds.length; i += IN_LIMIT) {
    const batch = allIds.slice(i, i + IN_LIMIT)
    const [{ data: sourceLinks }, { data: targetLinks }] = await Promise.all([
      adminDb.from('links').select('id, source_id, target_id, link_type_id, data').in('source_id', batch),
      adminDb.from('links').select('id, source_id, target_id, link_type_id, data').in('target_id', batch),
    ])
    for (const l of [...(sourceLinks || []), ...(targetLinks || [])]) {
      if (seenLinks.has(l.id)) continue
      seenLinks.add(l.id)
      const sourceStable = itemIdToStable[l.source_id]?.stable_id || l.source_id
      const targetStable = itemIdToStable[l.target_id]?.stable_id || l.target_id
      links.push({
        link_id: l.id,
        source_id: l.source_id,
        target_id: l.target_id,
        source_stable_id: sourceStable,
        target_stable_id: targetStable,
        link_type_id: l.link_type_id,
        metadata_hash: computeContentHash(JSON.stringify(l.data || {})),
      })
    }
  }

  return {
    files,
    chunks,
    embeddings,
    links,
    project_id: projectId,
    generated_at: new Date().toISOString(),
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Build a version manifest from CIL project files, chunks, embeddings and links'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:buildVersionManifest:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:buildVersionDiff:function" type="function" identity="buildVersionDiff" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Compute a diff between two CIL version manifests"]
// CIL[DOC-RESPONSIBILITY responsibility="Compare from and to manifests to produce added, removed and modified lists"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="fromManifest: Record<string, any>, toManifest: Record<string, any>" outputs="Record with added/removed/modified files, chunks, embeddings and links" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Iterates combined keys for files, chunks, embeddings and links, comparing stored_hash or metadata_hash to classify changes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildVersionDiff(fromManifest: Record<string, any> = {}, toManifest: Record<string, any> = {}): Record<string, any> {
  const diff: Record<string, any> = {
    added_files: [],
    removed_files: [],
    modified_files: [],
    added_chunks: [],
    removed_chunks: [],
    modified_chunks: [],
    added_embeddings: [],
    removed_embeddings: [],
    modified_embeddings: [],
    added_links: [],
    removed_links: [],
    modified_links: [],
  }

  const fromFiles = fromManifest.files || {}
  const toFiles = toManifest.files || {}
  const fromChunks = fromManifest.chunks || {}
  const toChunks = toManifest.chunks || {}

  const allFileStables = new Set([...Object.keys(fromFiles), ...Object.keys(toFiles)])
  for (const stable of allFileStables) {
    if (!fromFiles[stable]) diff.added_files.push({ stable_id: stable, ...toFiles[stable] })
    else if (!toFiles[stable]) diff.removed_files.push({ stable_id: stable, ...fromFiles[stable] })
    else if (fromFiles[stable].stored_hash !== toFiles[stable].stored_hash) diff.modified_files.push({ stable_id: stable, from: fromFiles[stable], to: toFiles[stable] })
  }

  const allChunkStables = new Set([...Object.keys(fromChunks), ...Object.keys(toChunks)])
  for (const stable of allChunkStables) {
    if (!fromChunks[stable]) diff.added_chunks.push({ stable_id: stable, ...toChunks[stable] })
    else if (!toChunks[stable]) diff.removed_chunks.push({ stable_id: stable, ...fromChunks[stable] })
    else if (fromChunks[stable].stored_hash !== toChunks[stable].stored_hash) diff.modified_chunks.push({ stable_id: stable, from: fromChunks[stable], to: toChunks[stable] })
  }

  const fromEmbeddings = fromManifest.embeddings || {}
  const toEmbeddings = toManifest.embeddings || {}
  const allChunkEmbeds = new Set([...Object.keys(fromEmbeddings), ...Object.keys(toEmbeddings)])
  for (const chunkStable of allChunkEmbeds) {
    const fromTypes = fromEmbeddings[chunkStable] || {}
    const toTypes = toEmbeddings[chunkStable] || {}
    const allTypes = new Set([...Object.keys(fromTypes), ...Object.keys(toTypes)])
    for (const type of allTypes) {
      const fromE = fromTypes[type]
      const toE = toTypes[type]
      if (!fromE) diff.added_embeddings.push({ chunk_stable_id: chunkStable, vector_type: type, ...toE })
      else if (!toE) diff.removed_embeddings.push({ chunk_stable_id: chunkStable, vector_type: type, ...fromE })
      else if (fromE.content_hash !== toE.content_hash) diff.modified_embeddings.push({ chunk_stable_id: chunkStable, vector_type: type, from: fromE, to: toE })
    }
  }

  const linkKey = (l: any) => `${l.source_stable_id}:${l.target_stable_id}:${l.link_type_id}`
  const fromLinks = (fromManifest.links || []).reduce((acc: Record<string, any>, l: any) => { acc[linkKey(l)] = l; return acc }, {})
  const toLinks = (toManifest.links || []).reduce((acc: Record<string, any>, l: any) => { acc[linkKey(l)] = l; return acc }, {})
  const allLinkKeys = new Set([...Object.keys(fromLinks), ...Object.keys(toLinks)])
  for (const key of allLinkKeys) {
    const fromL = fromLinks[key]
    const toL = toLinks[key]
    if (!fromL) diff.added_links.push(toL)
    else if (!toL) diff.removed_links.push(fromL)
    else if (fromL.metadata_hash !== toL.metadata_hash) diff.modified_links.push({ from: fromL, to: toL })
  }

  return diff
}
// CIL[DOC-VECTOR type="context" content="purpose='Compute a diff between two CIL version manifests'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:buildVersionDiff:function"]
// CIL[BEGIN stable_id="~/.framework/functions/cil-project.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-project.ts"]
// CIL[DOC-MACRO purpose="Netlify function handler for CIL project CRUD and version lifecycle actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch actions: list, get, create, update, delete, pipeline progress, create_version, set_active_version, publish_version, mark_versions_inactive, archive_versions"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-project" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-project.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: any" outputs="action-specific response object" errors="throws Error with action-specific message for missing/invalid inputs or DB failures" side_effects="reads and writes items, embeddings and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="createHandler wrapper that branches on action and method to list, fetch, create, update, delete, version and publish CIL projects" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  // CIL is operator tooling — every action touches the service-role client
  // and server filesystem. System principals only; tenant callers stop here.
  requireSystemContextWithAudit(ctx)

  const action = ctx.query?.action
  const method = (ctx as any).method || (body ? 'POST' : 'GET')

  
  if (action === 'list_proposals') {
    const id = ctx.query?.id
    if (!id) throw new Error('id is required')
    const status = ctx.query?.status || 'pending_review'
    const limit = parseInt(ctx.query?.limit || '1000', 10)

    const proposalTypeId = await resolveTypeId('item', 'cil_chunk_proposal')
    const { data, error } = await adminDb
      .from('items')
      .select('id, title, data, created_at')
      .eq('type_id', proposalTypeId)
      .eq('is_active', true)
      .filter('data->>project_id', 'eq', id)
      .filter('data->>review_status', 'eq', status)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw new Error(`Failed to list proposals: ${error.message}`)
    return { proposals: data || [], total: data?.length || 0 }
  }

  
  if (action === 'list' || (!action && method === 'GET' && !ctx.query?.id)) {
    const typeId = await resolveTypeId('item', 'cil_project')
    const { data, error } = await adminDb
      .from('items')
      .select('id, title, description, status, data, created_at, updated_at')
      .eq('type_id', typeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to list projects: ${error.message}`)
    return { projects: data || [] }
  }

  
  if (action === 'get' || (method === 'GET' && ctx.query?.id)) {
    const id = ctx.query?.id
    if (!id) throw new Error('id is required')

    const { data, error } = await adminDb
      .from('items')
      .select('id, title, description, status, data, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error || !data) throw new Error(`Project not found: ${id}`)

    const stats = await getProjectStats(id)
    return { project: { ...data, stats } }
  }

  
  if (action === 'create' || (!action && method === 'POST')) {
    const req = body as any
    const name = req?.name || req?.title
    if (!name) throw new Error('name is required')
    if (!req?.repo_path) throw new Error('repo_path is required')

    const result = await adminCreate(ctx, {
      entity: 'items',
      type_slug: 'cil_project',
      title: name,
      description: req.description || '',
      status: 'active',
      data: {
        kb_type: 'cil_project',
        repo_path: req.repo_path,
        language_mix: req.language_mix || '',
        kind: req.kind || 'custom',
        ingestion_status: 'not_started',
        file_count: 0,
        chunk_count: 0,
        total_ingestion_cost_usd: 0,
        last_ingested_at: null,
        globs: req.globs || DEFAULT_GLOBS,
        exclude_globs: req.exclude_globs || DEFAULT_EXCLUDE_GLOBS,
        source_sets: req.source_sets || [],
        dependencies: req.dependencies || [],
      }
    })

    const defaultVersion = await adminCreate(ctx, {
      entity: 'items',
      type_slug: 'cil_version',
      title: `${name} v0.0.0`,
      status: 'active',
      data: {
        project_id: result.id,
        version: 'v0.0.0',
        base_version: '',
        is_iteration: false,
        status: 'active',
      },
    })

    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: result.id } }
    await adminUpdate(updateCtx, {
      data: {
        ...result.data,
        active_version_id: defaultVersion.id,
        default_version_id: defaultVersion.id,
      },
    })

    return { project: { ...result, data: { ...result.data, active_version_id: defaultVersion.id, default_version_id: defaultVersion.id } } }
  }

  
  if (action === 'update' || (!action && method === 'PATCH')) {
    const id = ctx.query?.id || body?.id
    if (!id) throw new Error('id is required')

    
    const { data: current, error: fetchErr } = await adminDb
      .from('items').select('data').eq('id', id).maybeSingle()
    if (fetchErr || !current) throw new Error(`Project not found: ${id}`)

    const mergedData = { ...(current.data || {}), ...(body?.data || {}) }

    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id } }
    const result = await adminUpdate(updateCtx, {
      data: mergedData,
      ...(body?.status ? { status: body.status } : {}),
      ...(body?.title ? { title: body.title } : {}),
      ...(body?.description ? { description: body.description } : {}),
    })

    return { project: result }
  }

  
  
  if (action === 'delete' || method === 'DELETE') {
    const id = ctx.query?.id || body?.id
    if (!id) throw new Error('id is required')

    
    const { data: projectItem } = await adminDb
      .from('items')
      .select('id, title, data')
      .eq('id', id)
      .maybeSingle()

    if (!projectItem) throw new Error(`Project not found: ${id}`)

    const deletedCounts: Record<string, number> = {}

    
    const { data: fileItems } = await adminDb
      .from('items')
      .select('id')
      .filter('data->>project_id', 'eq', id)
      .filter('data->>kb_type', 'eq', 'cil_file')

    const fileIds = (fileItems || []).map((f: any) => f.id)

    
    const { data: chunkItems } = await adminDb
      .from('items')
      .select('id')
      .filter('data->>project_id', 'eq', id)
      .filter('data->>kb_type', 'eq', 'cil_chunk')

    const chunkIds = (chunkItems || []).map((c: any) => c.id)

    
    if (fileIds.length > 0 || chunkIds.length > 0) {
      const allIds = [...fileIds, ...chunkIds]
      const IN_LIMIT = 500
      const linkIdsToDelete: string[] = []
      for (let i = 0; i < allIds.length; i += IN_LIMIT) {
        const batch = allIds.slice(i, i + IN_LIMIT)
        const [{ data: sourceLinks }, { data: targetLinks }] = await Promise.all([
          adminDb.from('links').select('id').in('source_id', batch),
          adminDb.from('links').select('id').in('target_id', batch),
        ])
        for (const l of sourceLinks || []) linkIdsToDelete.push(l.id)
        for (const l of targetLinks || []) linkIdsToDelete.push(l.id)
      }
      deletedCounts.links = await bulkAdminRemove(ctx, 'links', [...new Set(linkIdsToDelete)])
    }

    
    if (chunkIds.length > 0) {
      const CHUNK_SIZE = 50
      let embeddingsDeleted = 0
      for (let i = 0; i < chunkIds.length; i += CHUNK_SIZE) {
        const batch = chunkIds.slice(i, i + CHUNK_SIZE)
        const { count } = await adminDb
          .from('embeddings')
          .delete({ count: 'exact' })
          .in('document_id', batch)
        embeddingsDeleted += count || 0
      }
      deletedCounts.embeddings = embeddingsDeleted
    }

    
    for (const kbType of ['cil_chunk', 'cil_chunk_proposal', 'cil_file', 'cil_config', 'cil_version', 'cil_suggestion', 'cil_learning_proposal']) {
      const { data: itemsToDelete } = await adminDb
        .from('items')
        .select('id')
        .filter('data->>project_id', 'eq', id)
        .filter('data->>kb_type', 'eq', kbType)
      deletedCounts[kbType] = await bulkAdminRemove(ctx, 'items', (itemsToDelete || []).map((i: any) => i.id))
    }

    
    await adminRemove({ ...ctx, query: { ...(ctx.query || {}), entity: 'items', id, soft: 'false' } } as any)
    deletedCounts.project = 1

    return {
      deleted: true,
      project_id: id,
      project_title: projectItem.title,
      deleted_counts: deletedCounts,
    }
  }

  
  if (action === 'pipeline_progress') {
    const id = ctx.query?.id
    if (!id) throw new Error('id is required')

    const { data, error } = await adminDb
      .from('items')
      .select('data')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) throw new Error(`Project not found: ${id}`)

    const fileStatuses: Record<string, string> = data.data?.file_statuses || {}
    const selectedPaths: string[] = data.data?.selected_paths || []

    
    const by_status: Record<string, number> = {}
    for (const [key, val] of Object.entries(fileStatuses)) {
      if (key.endsWith('_updated')) continue
      if (typeof val !== 'string') continue
      by_status[val] = (by_status[val] || 0) + 1
    }

    
    const { count: total_chunks } = await adminDb.from('items')
      .select('*', { count: 'exact', head: true })
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>project_id', 'eq', id)
      .eq('is_active', true)

    return {
      progress: {
        total_selected: selectedPaths.length,
        by_status,
        file_statuses: fileStatuses,
        total_chunks: total_chunks || 0,
      },
    }
  }

  
  if (action === 'create_version') {
    const projectId = body?.project_id
    const version = body?.version
    if (!projectId) throw new Error('project_id is required')
    if (!version) throw new Error('version is required')
    if (!semver.valid(version)) throw new Error(`Invalid semver version: ${version}`)

    const versionTypeId = await resolveTypeId('item', 'cil_version')
    const { count, error: countErr } = await adminDb
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', versionTypeId)
      .filter('data->>project_id', 'eq', projectId)
    if (countErr) throw new Error(`Failed to check existing versions: ${countErr.message}`)

    const isFirst = (count || 0) === 0
    const isIteration = semver.prerelease(version) !== null
    const status = isFirst ? 'active' : 'inactive'

    const versionRecord = await adminCreate(ctx, {
      entity: 'items',
      type_slug: 'cil_version',
      title: version,
      status,
      data: {
        project_id: projectId,
        version,
        base_version: body?.base_version || '',
        is_iteration: isIteration,
        status,
      },
    })

    if (isFirst) {
      const projectTypeId = await resolveTypeId('item', 'cil_project')
      const { data: projects, error: pErr } = await adminDb
        .from('items')
        .select('id, data')
        .eq('type_id', projectTypeId)
        .eq('id', projectId)
        .limit(1)
      if (pErr || !projects || projects.length === 0) throw new Error(`Project not found: ${projectId}`)
      const project = projects[0]
      const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: projectId } }
      await adminUpdate(updateCtx, {
        data: {
          ...project.data,
          active_version_id: versionRecord.id,
          default_version_id: versionRecord.id,
        },
      })
    }

    return { version: versionRecord }
  }

  
  if (action === 'set_active_version') {
    const projectId = body?.project_id || ctx.query?.id
    const versionId = body?.version_id
    if (!projectId) throw new Error('project_id is required')
    if (!versionId) throw new Error('version_id is required')

    const projectTypeId = await resolveTypeId('item', 'cil_project')
    const versionTypeId = await resolveTypeId('item', 'cil_version')

    const { data: projectRows, error: pErr } = await adminDb
      .from('items')
      .select('id, data')
      .eq('type_id', projectTypeId)
      .eq('id', projectId)
      .limit(1)
    if (pErr || !projectRows || projectRows.length === 0) throw new Error(`Project not found: ${projectId}`)
    const project = projectRows[0]

    const { data: targetRows, error: tErr } = await adminDb
      .from('items')
      .select('id, data, status, is_active')
      .eq('type_id', versionTypeId)
      .eq('id', versionId)
      .filter('data->>project_id', 'eq', projectId)
      .limit(1)
    if (tErr || !targetRows || targetRows.length === 0) throw new Error(`Version not found: ${versionId}`)
    const targetVersion = targetRows[0]

    const { data: otherVersions, error: oErr } = await adminDb
      .from('items')
      .select('id, data, status, is_active')
      .eq('type_id', versionTypeId)
      .filter('data->>project_id', 'eq', projectId)
      .neq('id', versionId)
    if (oErr) throw new Error(`Failed to list versions: ${oErr.message}`)

    for (const v of otherVersions || []) {
      if (v.data?.status === 'active') {
        await adminDb.from('items').update({
          status: 'inactive',
          data: { ...v.data, status: 'inactive' },
        }).eq('id', v.id)
      }
    }

    await adminDb.from('items').update({
      status: 'active',
      data: { ...targetVersion.data, status: 'active' },
    }).eq('id', versionId)

    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: projectId } }
    const result = await adminUpdate(updateCtx, {
      data: {
        ...project.data,
        active_version_id: versionId,
      },
    })

    return { project: result, version_id: versionId }
  }


  if (action === 'publish_version') {
    const projectId = body?.project_id
    const version = body?.version
    if (!projectId) throw new Error('project_id is required')
    if (!version) throw new Error('version is required')
    if (!semver.valid(version)) throw new Error(`Invalid semver version: ${version}`)

    const projectTypeId = await resolveTypeId('item', 'cil_project')
    const versionTypeId = await resolveTypeId('item', 'cil_version')

    const { data: projectRows, error: pErr } = await adminDb
      .from('items')
      .select('id, data, title')
      .eq('type_id', projectTypeId)
      .eq('id', projectId)
      .limit(1)
    if (pErr || !projectRows || projectRows.length === 0) throw new Error(`Project not found: ${projectId}`)
    const project = projectRows[0]

    const versionRecord = await adminCreate(ctx, {
      entity: 'items',
      type_slug: 'cil_version',
      title: version,
      status: 'active',
      data: {
        project_id: projectId,
        version,
        base_version: body?.base_version || '',
        parent_version_id: project.data?.active_version_id || '',
        npm_name: project.data?.npm_name || '',
        npm_version: version,
        is_iteration: false,
        is_customer: false,
        status: 'active',
        manifest: null,
        diff: null,
      },
    })

    const manifest = await buildVersionManifest(projectId)
    const parentVersionId = versionRecord.data.parent_version_id
    const { data: parentVersionRows } = parentVersionId
      ? await adminDb.from('items').select('id, data').eq('id', parentVersionId).maybeSingle()
      : { data: null }
    const parentManifest = parentVersionRows?.data?.manifest || null
    const diff = buildVersionDiff(parentManifest, manifest)
    await adminDb.from('items').update({ data: { ...versionRecord.data, manifest, diff } }).eq('id', versionRecord.id)
    versionRecord.data = { ...versionRecord.data, manifest, diff }

    const { data: allVersions, error: vErr } = await adminDb
      .from('items')
      .select('id, data, status, is_active')
      .eq('type_id', versionTypeId)
      .filter('data->>project_id', 'eq', projectId)
      .neq('id', versionRecord.id)
    if (vErr) throw new Error(`Failed to list versions: ${vErr.message}`)

    for (const v of allVersions || []) {
      if (v.data?.status !== 'inactive') {
        await adminDb.from('items').update({
          status: 'inactive',
          data: { ...v.data, status: 'inactive' },
        }).eq('id', v.id)
      }
    }

    if (body?.base_version) {
      const baseVersion = body.base_version
      const { data: iterations, error: iErr } = await adminDb
        .from('items')
        .select('id, data, status, is_active')
        .eq('type_id', versionTypeId)
        .filter('data->>project_id', 'eq', projectId)
        .filter('data->>base_version', 'eq', baseVersion)
        .filter('data->>is_iteration', 'eq', 'true')
      if (iErr) throw new Error(`Failed to list iterations: ${iErr.message}`)

      for (const iter of iterations || []) {
        if (iter.data?.status !== 'inactive') {
          await adminDb.from('items').update({
            status: 'inactive',
            data: { ...iter.data, status: 'inactive' },
          }).eq('id', iter.id)
        }
      }

      const activeIteration = (iterations || []).find((i: any) => i.data?.status === 'active' || !i.data?.published_version_id)
        || (iterations || [])[0]
      if (activeIteration) {
        await adminDb.from('items').update({
          data: { ...activeIteration.data, published_version_id: versionRecord.id },
        }).eq('id', activeIteration.id)
      }
    }

    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: projectId } }
    const result = await adminUpdate(updateCtx, {
      data: {
        ...project.data,
        active_version_id: versionRecord.id,
        default_version_id: versionRecord.id,
      },
    })

    return { version: versionRecord, project: result }
  }

  
  if (action === 'mark_versions_inactive') {
    const projectId = body?.project_id
    const versionPattern = body?.version_pattern
    if (!projectId) throw new Error('project_id is required')
    if (!versionPattern) throw new Error('version_pattern is required')

    const versionTypeId = await resolveTypeId('item', 'cil_version')
    const { data: matches, error } = await adminDb
      .from('items')
      .select('id, data, status, is_active')
      .eq('type_id', versionTypeId)
      .filter('data->>project_id', 'eq', projectId)
      .ilike('data->>version', `%${versionPattern}%`)
    if (error) throw new Error(`Failed to find versions: ${error.message}`)

    const updatedIds: string[] = []
    for (const v of matches || []) {
      await adminDb.from('items').update({
        status: 'inactive',
        data: { ...v.data, status: 'inactive' },
      }).eq('id', v.id)
      updatedIds.push(v.id)
    }

    return { updated_ids: updatedIds, count: updatedIds.length }
  }

  
  if (action === 'archive_versions') {
    const projectId = body?.project_id
    const keepLastN = parseInt(body?.keep_last_n, 10)
    if (!projectId) throw new Error('project_id is required')
    if (Number.isNaN(keepLastN) || keepLastN < 0) throw new Error('keep_last_n is required and must be a number >= 0')

    const versionTypeId = await resolveTypeId('item', 'cil_version')
    const { data: allVersions, error } = await adminDb
      .from('items')
      .select('id, data, status, is_active, created_at')
      .eq('type_id', versionTypeId)
      .filter('data->>project_id', 'eq', projectId)
      .order('created_at', { ascending: true })
    if (error) throw new Error(`Failed to list versions: ${error.message}`)

    const activeVersionId = (allVersions || []).find((v: any) => v.data?.status === 'active')?.id
    const inactiveVersions = (allVersions || []).filter((v: any) =>
      v.data?.status === 'inactive' && v.id !== activeVersionId
    )

    const toArchive = inactiveVersions.slice(0, Math.max(0, inactiveVersions.length - keepLastN))
    const archivedIds: string[] = []

    for (const v of toArchive) {
      await adminDb.from('items').update({
        is_active: false,
        status: 'archived',
        data: { ...v.data, status: 'archived' },
      }).eq('id', v.id)
      archivedIds.push(v.id)
    }

    return { archived_ids: archivedIds, count: archivedIds.length, kept: (allVersions || []).length - archivedIds.length }
  }

  throw new Error(`Unknown action: ${action}. Valid: list, get, create, update, delete, pipeline_progress, create_version, set_active_version, publish_version, mark_versions_inactive, archive_versions`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function handler for CIL project CRUD and version lifecycle actions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-project.ts:handler:constant"]


