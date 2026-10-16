// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:EMBED_SOURCE_STATUS:constant" type="constant" identity="EMBED_SOURCE_STATUS" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Defines the source and target status labels for embedding pipeline passes."]
// CIL[DOC-RESPONSIBILITY responsibility="Holds the status mapping used to select files for first and second embedding passes."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps 'first' and 'second' pass keys to prior and target file status strings." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const EMBED_SOURCE_STATUS: Record<'first' | 'second', { prior: string; target: string }> = {
  first: { prior: '6-enriched', target: '7-embedded-mapped' },
  second: { prior: '6-enriched', target: '7-embedded-mapped' },
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the source and target status labels for embedding pipeline passes.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:EMBED_SOURCE_STATUS:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:getEmbedSourceFilePaths:function" type="function" identity="getEmbedSourceFilePaths" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Selects source file paths that are ready for embedding."]
// CIL[DOC-RESPONSIBILITY responsibility="Filters project file_statuses for entries matching the configured embedding source or target status."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="projectItem: any, secondPass: boolean" outputs="string[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Extracts the relevant prior and target statuses from EMBED_SOURCE_STATUS and filters file paths accordingly." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getEmbedSourceFilePaths(projectItem: any, secondPass: boolean): string[] {
  const fileStatuses: Record<string, string> = projectItem?.data?.file_statuses || {}
  const { prior, target } = secondPass ? EMBED_SOURCE_STATUS.second : EMBED_SOURCE_STATUS.first
  return Object.entries(fileStatuses)
    .filter(([, status]) => status === prior || status === target)
    .map(([filePath]) => filePath)
}
// CIL[DOC-VECTOR type="context" content="purpose='Selects source file paths that are ready for embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:getEmbedSourceFilePaths:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:loadSourceChunks:function" type="function" identity="loadSourceChunks" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Loads CIL chunks from a set of source file paths in batches."]
// CIL[DOC-RESPONSIBILITY responsibility="Queries the database for active cil_chunk items matching the requested file paths and returns a paginated result."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, sourceFilePaths: string[], offset: number, limit: number, projectItem?: any" outputs="{ chunks: any[]; total: number }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Splits file paths into batches, counts matching chunks, then fetches the requested page by stable id order." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function loadSourceChunks(
  projectId: string,
  sourceFilePaths: string[],
  offset: number,
  limit: number,
  projectItem?: any
): Promise<{ chunks: any[]; total: number }> {
  if (sourceFilePaths.length === 0) return { chunks: [], total: 0 }

  // Keep the REST URL under the ~8k character limit while still using the
  // indexed file_path filter instead of scanning every project chunk page.
  const FILE_PATH_IN_BATCH = 50
  const allIds: string[] = []
  let total = 0

  for (let i = 0; i < sourceFilePaths.length; i += FILE_PATH_IN_BATCH) {
    const batch = sourceFilePaths.slice(i, i + FILE_PATH_IN_BATCH)
    let countQuery: any = (adminDb.from('items') as any)
      .select('id', { count: 'exact', head: true })
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>project_id', 'eq', projectId)
      .eq('is_active', true)
      .in('data->>file_path' as any, batch)
    let selectQuery: any = (adminDb.from('items') as any)
      .select('id, data->>file_path')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>project_id', 'eq', projectId)
      .eq('is_active', true)
      .in('data->>file_path' as any, batch)
      .order('id')
    const [{ count }, { data, error }] = await Promise.all([countQuery, selectQuery])

    if (error) throw new Error(`Failed to load source chunk ids: ${error.message}`)
    total += count || 0
    for (const row of data || []) allIds.push(row.id)
  }

  allIds.sort()
  const pageIds = allIds.slice(offset, offset + limit)
  if (pageIds.length === 0) return { chunks: [], total }

  const { data: chunks, error } = await adminDb
    .from('items')
    .select('id, title, data')
    .in('id', pageIds)

  if (error) throw new Error(`Failed to load source chunks: ${error.message}`)

  const chunkMap = new Map((chunks || []).map((c: any) => [c.id, c]))
  const ordered = pageIds.map(id => chunkMap.get(id)).filter(Boolean) as any[]
  return { chunks: ordered, total }
}
// CIL[DOC-VECTOR type="context" content="purpose='Loads CIL chunks from a set of source file paths in batches.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:loadSourceChunks:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Netlify handler for CIL embedding, search, and status operations."]
// CIL[DOC-RESPONSIBILITY responsibility="Imports dependencies and exposes the module's main embeddings handler and helpers."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware, database, embedding utilities, CIL helpers, and registers the handler." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { generate } from './embeddings'
import { callOpenAIEmbeddings, callEmbeddingApi } from './_shared/llm'
import { FileStatus, FileTreeNode, isSelectedPath, getFileStatus, updateTreeNodeStatus, saveProjectTree, pipelineRank, computeContentHash, CIL_BOILERPLATE_PHRASES } from './_shared/cil'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify handler for CIL embedding, search, and status operations.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:module_header:module_header"]











// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:rank:function" type="function" identity="rank" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Returns the numeric pipeline rank for a status string."]
// CIL[DOC-RESPONSIBILITY responsibility="Wraps the shared pipelineRank helper to provide a default of 0 for undefined statuses."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="status: string | undefined" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns pipelineRank(status) when status is defined and 0 otherwise." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function rank(status: string | undefined): number {
  return status ? pipelineRank(status) : 0
}
// CIL[DOC-VECTOR type="context" content="purpose='Returns the numeric pipeline rank for a status string.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:rank:function"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:EMBEDDING_MODEL:constant" type="constant" identity="EMBEDDING_MODEL" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Defines the default OpenAI embedding model used for vector generation."]
// CIL[DOC-RESPONSIBILITY responsibility="Holds the model name string passed to embedding API calls."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Stores the 'text-embedding-3-small' model identifier as a constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const EMBEDDING_MODEL = 'text-embedding-3-small'
// CIL[DOC-VECTOR type="context" content="purpose='Defines the default OpenAI embedding model used for vector generation.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:EMBEDDING_MODEL:constant"]




// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:DEFAULT_BATCH_SIZE:constant" type="constant" identity="DEFAULT_BATCH_SIZE" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Defines the default number of embedding rows to insert per batch."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a fallback batch size for bulk embedding insert operations."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets a constant default of 20 items per embedding insert batch." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const DEFAULT_BATCH_SIZE = 20
// CIL[DOC-VECTOR type="context" content="purpose='Defines the default number of embedding rows to insert per batch.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:DEFAULT_BATCH_SIZE:constant"]








// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:VECTOR_TYPE_INDEX:constant" type="constant" identity="VECTOR_TYPE_INDEX" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Defines numeric chunk_index values for each embedding vector type."]
// CIL[DOC-RESPONSIBILITY responsibility="Maps semantic, structure, context, blast_radius, configuration, and constraint vector names to fixed integer indices."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Records a static mapping from vector type names to their chunk_index values." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const VECTOR_TYPE_INDEX: Record<string, number> = {
  semantic:      0,
  structure:     1,
  context:       2,
  blast_radius:  3,
  configuration: 4,
  constraint:    5,
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines numeric chunk_index values for each embedding vector type.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:VECTOR_TYPE_INDEX:constant"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:EMBEDDING_PRICES:constant" type="constant" identity="EMBEDDING_PRICES" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Defines the per-million-token price for each supported embedding model."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides cost lookup for the embedding cost estimator."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps supported model names to their USD price per 1M tokens." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const EMBEDDING_PRICES: Record<string, number> = {
  'text-embedding-3-small': 0.02,
  'text-embedding-3-large': 0.13,
  'text-embedding-ada-002': 0.10,
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the per-million-token price for each supported embedding model.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:EMBEDDING_PRICES:constant"]










// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:buildSemanticText:function" type="function" identity="buildSemanticText" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Builds the searchable semantic text payload for a CIL chunk."]
// CIL[DOC-RESPONSIBILITY responsibility="Combines chunk metadata, vector content, macro, micro, inputs, outputs, notes, and learnings into a single string."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assembles available chunk data fields into a dot-separated summary string for embedding." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function buildSemanticText(chunk: any): string {
  const d = chunk.data || {}
  const parts: string[] = []
  if (d.chunk_name) parts.push(d.chunk_name)
  if (d.chunk_type) parts.push(`[${d.chunk_type}]`)
  if (d.file_path) parts.push(`in ${d.file_path}`)

  const vc = d.vector_content || {}
  const hasBoilerplate = (s: string) =>
    CIL_BOILERPLATE_PHRASES.some(p => s.toLowerCase().includes(p.toLowerCase()))
  if (vc.context?.status === 'ready' && vc.context.content && !hasBoilerplate(vc.context.content)) {
    parts.push(`Context: ${vc.context.content}`)
  }
  if (vc.blast_radius?.status === 'ready' && vc.blast_radius.content && !hasBoilerplate(vc.blast_radius.content)) {
    parts.push(`Blast radius: ${vc.blast_radius.content}`)
  }

  if (d.macro) parts.push(d.macro)
  if (d.micro) parts.push(d.micro)
  if (d.input_spec) parts.push(`Inputs: ${d.input_spec}`)
  if (d.output_spec) parts.push(`Returns: ${d.output_spec}`)
  if (Array.isArray(d.notes)) {
    for (const note of d.notes) {
      if (note.content) parts.push(`Note (${note.type || 'general'}): ${note.content}`)
    }
  }
  if (Array.isArray(d.learnings)) {
    for (const learning of d.learnings) {
      if (learning.content) parts.push(`Learning (${learning.topic || 'general'}): ${learning.content}`)
    }
  }
  return parts.join('. ')
}
// CIL[DOC-VECTOR type="context" content="purpose='Builds the searchable semantic text payload for a CIL chunk.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:buildSemanticText:function"]



// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:buildStructuralText:function" type="function" identity="buildStructuralText" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Builds a structural JSON text payload for a CIL chunk."]
// CIL[DOC-RESPONSIBILITY responsibility="Serializes key chunk metadata fields into a compact JSON string for structural vector indexing."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts chunk_name, chunk_type, file_path, stability, is_dead_code, and other flags into JSON." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function buildStructuralText(chunk: any): string {
  const d = chunk.data || {}
  return JSON.stringify({
    chunk_name: d.chunk_name || '',
    chunk_type: d.chunk_type || '',
    file_path: d.file_path || '',
    stability: d.stability || '',
    is_dead_code: d.is_dead_code || false,
    boundary_confidence: d.boundary_confidence || '',
    doc_confidence: d.doc_confidence || '',
    review_status: d.review_status || '',
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Builds a structural JSON text payload for a CIL chunk.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:buildStructuralText:function"]



// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:buildContractText:function" type="function" identity="buildContractText" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Builds the contract text payload for a CIL chunk."]
// CIL[DOC-RESPONSIBILITY responsibility="Assembles input, output, side effect, and purpose descriptions into a contract vector string."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Joins input_spec, output_spec, side_effects, and macro fields into a line-separated contract string." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function buildContractText(chunk: any): string {
  const d = chunk.data || {}
  const parts: string[] = []
  if (d.input_spec) parts.push(`INPUTS: ${d.input_spec}`)
  if (d.output_spec) parts.push(`OUTPUTS: ${d.output_spec}`)
  if (d.side_effects) parts.push(`SIDE_EFFECTS: ${d.side_effects}`)
  if (d.macro) parts.push(`PURPOSE: ${d.macro}`)
  return parts.join('\n') || `${d.chunk_name || 'unknown'} — no contract yet`
}
// CIL[DOC-VECTOR type="context" content="purpose='Builds the contract text payload for a CIL chunk.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:buildContractText:function"]




// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:buildCodeText:function" type="function" identity="buildCodeText" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Builds the code text payload for a CIL chunk."]
// CIL[DOC-RESPONSIBILITY responsibility="Produces a human-readable code vector string from chunk metadata and stored code content."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Joins chunk name, file path, chunk type, macro, micro, and raw code content into a text block." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildCodeText(chunk: any): string {
  const d = chunk.data || {}
  const parts: string[] = []
  if (d.chunk_name) parts.push(d.chunk_name)
  if (d.file_path) parts.push(`in ${d.file_path}`)
  if (d.chunk_type) parts.push(`[${d.chunk_type}]`)
  if (d.macro) parts.push(d.macro)
  if (d.micro) parts.push(d.micro)
  if (d.code_content) {
    parts.push('CODE:')
    parts.push(String(d.code_content))
  }
  return parts.join('\n') || `${d.chunk_name || 'unknown'} — no code content`
}
// CIL[DOC-VECTOR type="context" content="purpose='Builds the code text payload for a CIL chunk.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:buildCodeText:function"]



// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:buildConstraintText:function" type="function" identity="buildConstraintText" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Builds the constraint text payload for a CIL chunk."]
// CIL[DOC-RESPONSIBILITY responsibility="Combines constraint vector content with contract and purpose details for vector indexing."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Adds constraint vector content when ready and falls back to input/output specs and macro." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function buildConstraintText(chunk: any): string {
  const d = chunk.data || {}
  const vc = d.vector_content || {}
  const parts: string[] = []
  if (vc.constraint?.status === 'ready' && vc.constraint.content) {
    parts.push(vc.constraint.content)
  }
  if (d.input_spec) parts.push(`INPUTS: ${d.input_spec}`)
  if (d.output_spec) parts.push(`OUTPUTS: ${d.output_spec}`)
  if (d.side_effects) parts.push(`SIDE_EFFECTS: ${d.side_effects}`)
  if (d.macro) parts.push(`PURPOSE: ${d.macro}`)
  return parts.join('\n') || `${d.chunk_name || 'unknown'} — no constraint yet`
}
// CIL[DOC-VECTOR type="context" content="purpose='Builds the constraint text payload for a CIL chunk.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:buildConstraintText:function"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:loadPendingChunks:function" type="function" identity="loadPendingChunks" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Loads approved CIL chunks for selected files that need embedding."]
// CIL[DOC-RESPONSIBILITY responsibility="Queries active cil_file and cil_chunk items to find chunks matching the required status and selection."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, selectedPaths: string[], requiredStatus: FileStatus, projectItem?: any" outputs="any[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects file ids with the required status, then filters active chunks by file_id." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function loadPendingChunks(projectId: string, selectedPaths: string[], requiredStatus: FileStatus, projectItem?: any): Promise<any[]> {
  // The live project is scoped by project_id and is_active. The active_version_id is a
  // pointer to the cil_version manifest, not a runtime filter.
  const { data: fileItems } = await adminDb
    .from('items')
    .select('id, data')
    .filter('data->>kb_type', 'eq', 'cil_file')
    .filter('data->>project_id', 'eq', projectId)
    .eq('is_active', true)

  const selectedFileIds = (fileItems || [])
    .filter((f: any) => getFileStatus(f) === requiredStatus && isSelectedPath(f.data?.file_path || f.title, selectedPaths))
    .map((f: any) => f.id)

  if (selectedFileIds.length === 0) return []

  const { data: allChunks } = await adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>project_id', 'eq', projectId)
    .eq('is_active', true)

  return (allChunks || []).filter((c: any) => selectedFileIds.includes(c.data?.file_id))
}
// CIL[DOC-VECTOR type="context" content="purpose='Loads approved CIL chunks for selected files that need embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:loadPendingChunks:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:maybeAdvanceFileToPass4:function" type="function" identity="maybeAdvanceFileToPass4" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Advances a file's pipeline status once all its chunks are embedded."]
// CIL[DOC-RESPONSIBILITY responsibility="Checks embedding coverage for a file's stable ids, then updates file and project statuses if complete."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, fileId: string, tree: FileTreeNode | null, secondPass: boolean, projectItem?: any" outputs="void" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Verifies all stable ids have active embeddings, then updates the cil_file status and file_tree when coverage is complete." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function maybeAdvanceFileToPass4(
  ctx: any,
  fileId: string,
  tree: FileTreeNode | null,
  secondPass = false,
  projectItem?: any
): Promise<void> {
  const { data: fileChunks } = await adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>file_id', 'eq', fileId)
    .eq('is_active', true)

  if (!fileChunks || fileChunks.length === 0) return

  const stableIds = fileChunks.map((c: any) => c.data?.stable_id).filter(Boolean)
  const { data: embeddedDocs } = await adminDb
    .from('embeddings')
    .select('document_id')
    .in('document_id', stableIds)
    .is('revoked_at', null)

  const embeddedChunkIds = new Set((embeddedDocs || []).map((e: any) => e.document_id))
  const allEmbedded = stableIds.every(id => embeddedChunkIds.has(id))
  if (!allEmbedded) return

  const { data: fileItem } = await adminDb
    .from('items')
    .select('id, data')
    .eq('id', fileId)
    .maybeSingle()

  if (!fileItem) return

  const cil_file_status = secondPass ? '7-embedded-mapped' : '7-embedded-mapped'
  const pipeline_status = secondPass ? '7-embedded-mapped' : '7-embedded-mapped'
  const currentFileStatus = getFileStatus(fileItem)
  const filePath: string = fileItem.data?.file_path

  
  if (rank(currentFileStatus) < rank(cil_file_status)) {
    const { update } = await import('./admin-data')
    const updateCtx = { ...ctx, query: { ...(ctx.query || {}), entity: 'items', id: fileId } }
    await update(updateCtx, {
      data: {
        ...fileItem.data,
        status: cil_file_status,
        last_status_at: new Date().toISOString(),
      },
    }).catch((e: any) => console.error(`advance to ${cil_file_status} failed:`, e.message))
  }

  if (tree) updateTreeNodeStatus(tree, fileId, cil_file_status)

  
  const projectId: string = fileItem.data?.project_id
  if (!filePath || !projectId) return

  let projItem = projectItem
  if (!projItem) {
    const { data } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
    projItem = data
  }
  if (!projItem) return

  const currentPipelineStatus = projItem.data?.file_statuses?.[filePath]
  if (rank(currentPipelineStatus) >= rank(pipeline_status)) return

  const fileStatuses = { ...(projItem.data?.file_statuses || {}) }
  fileStatuses[filePath] = pipeline_status
  fileStatuses[`${filePath}_updated`] = new Date().toISOString()
  const { error: fsErr } = await adminDb.from('items')
    .update({ data: { ...projItem.data, file_statuses: fileStatuses } })
    .eq('id', projectId)
    .select('id')
  if (fsErr) {
    console.error(`pipeline status advance to ${pipeline_status} failed:`, fsErr.message)
    return
  }

  
  if (projectItem) {
    if (!projectItem.data) projectItem.data = {}
    projectItem.data.file_statuses = fileStatuses
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Advances a file's pipeline status once all its chunks are embedded.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:maybeAdvanceFileToPass4:function"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:contentHash:function" type="function" identity="contentHash" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Computes a 32-bit FNV-1a hash for a string."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a fast content hash for comparing embedding input texts."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Iterates over characters, mixing each into an FNV-style 32-bit integer and returning a zero-padded hex string." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function contentHash(text: string): string {
  
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}
// CIL[DOC-VECTOR type="context" content="purpose='Computes a 32-bit FNV-1a hash for a string.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:contentHash:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:embedChunk:function" type="function" identity="embedChunk" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Generates or updates OpenAI embeddings for a single CIL chunk."]
// CIL[DOC-RESPONSIBILITY responsibility="Builds vector texts, hashes them, calls the embedding API, and upserts rows in the embeddings table."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="chunkItem: any, accountId: string, forceRegenerate: boolean" outputs="{ created: string[]; skipped: string[]; error?: string }" errors="Embedding API failures" side_effects="Inserts or updates rows in the embeddings table"]
// CIL[DOC-MICRO logic_summary="Skips unchanged vectors, calls the embedding API for new or changed texts, and writes the resulting vector rows." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function embedChunk(
  chunkItem: any,
  accountId: string,
  forceRegenerate: boolean
): Promise<{ created: string[]; skipped: string[]; error?: string }> {
  const chunkId = chunkItem.id
  const stableId = chunkItem.data?.stable_id || chunkId
  const created: string[] = []
  const skipped: string[] = []

  
  const d = chunkItem.data || {}
  const vc = d.vector_content || {}
  const vectorReadyText = (t: string) => (vc[t]?.status === 'ready' && vc[t]?.content ? vc[t].content : '')
  const vectors: { type: string; text: string }[] = [
    { type: 'semantic',      text: buildSemanticText(chunkItem) },
    { type: 'structure',     text: buildStructuralText(chunkItem) },
    { type: 'context',       text: vectorReadyText('context') },
    { type: 'blast_radius',  text: vectorReadyText('blast_radius') },
    { type: 'configuration', text: vectorReadyText('configuration') },
    { type: 'constraint',    text: buildConstraintText(chunkItem) },
  ].filter(v => v.text.trim().length > 0)

  if (!vectors.length) return { created, skipped: ['all:empty'] }

  
  // Retire legacy chunk-UUID keyed embeddings now that stable_id is the document key
  await adminDb.from('embeddings').delete().eq('document_id', chunkId)

  
  const { data: existing } = await adminDb
    .from('embeddings')
    .select('id, content_hash, metadata')
    .eq('document_id', stableId)

  const existingMap = new Map<string, any>()
  for (const row of existing || []) {
    existingMap.set(row.metadata?.vector_type || '', row)
  }

  if (forceRegenerate && (existing || []).length > 0) {
    await adminDb.from('embeddings').delete().eq('document_id', stableId)
    existingMap.clear()
  }

  
  const toEmbed = vectors.filter(v => {
    const inputHash = contentHash(v.text)
    const row = existingMap.get(v.type)
    if (row && row.metadata?.input_hash === inputHash) { skipped.push(v.type); return false }
    return true
  })

  if (!toEmbed.length) return { created, skipped }

  try {
    const embeddings = await callEmbeddingApi(toEmbed.map(v => v.text))
    const now = new Date().toISOString()

    for (let i = 0; i < toEmbed.length; i++) {
      const { type, text } = toEmbed[i]
      const hash = computeContentHash(text)
      const inputHash = contentHash(text)
      const existingRow = existingMap.get(type)

      
      const vectorLiteral = `[${embeddings[i].join(',')}]`

      const row = {
        account_id:   accountId,
        model_id:     EMBEDDING_MODEL,
        document_id:  stableId,
        chunk_index:  VECTOR_TYPE_INDEX[type] ?? 0,
        content:      text,
        embedding:    vectorLiteral,
        content_hash: hash,
        approved_at:  now, // CIL chunks are always "approved" — they're internal, not published content
        revoked_at:   null,
        metadata: {
          vector_type:    type,
          item_type:      'cil_chunk',
          kb_type:        'cil_chunk',
          security_level: 'internal',
          source_item_id: chunkId,
          chunk_name:     chunkItem.data?.chunk_name || '',
          file_path:      chunkItem.data?.file_path || '',
          project_id:     chunkItem.data?.project_id || '',
          version_id:     chunkItem.data?.version_id || '',
          input_hash:     inputHash,
        },
      }

      if (existingRow) {
        await adminDb.from('embeddings').update(row).eq('id', existingRow.id)
      } else {
        await adminDb.from('embeddings').insert(row)
      }
      created.push(type)
    }
  } catch (err) {
    return { created, skipped, error: err instanceof Error ? err.message : String(err) }
  }

  return { created, skipped }
}
// CIL[DOC-VECTOR type="context" content="purpose='Generates or updates OpenAI embeddings for a single CIL chunk.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:embedChunk:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:semanticSearch:function" type="function" identity="semanticSearch" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Performs a semantic search over embedded CIL chunks."]
// CIL[DOC-RESPONSIBILITY responsibility="Embeds a query, calls the match_embeddings RPC, and returns matching chunk metadata."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="query: string, projectId: string | null, limit: number, accountId: string" outputs="any[]" errors="Embedding or RPC failures" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Generates a query embedding, runs match_embeddings, resolves chunks by stable_id, and applies project filtering." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function semanticSearch(
  query: string,
  projectId: string | null,
  limit: number,
  accountId: string
): Promise<any[]> {
  const j = await callOpenAIEmbeddings(undefined, [query], EMBEDDING_MODEL)
  const queryVector = j.data?.[0]?.embedding
  if (!queryVector) throw new Error('Failed to embed query')

  const vectorLiteral = `[${queryVector.join(',')}]`

  
  const rpcParams: any = {
    query_embedding: vectorLiteral,
    match_count: limit * 3,
    filter_account_ids: [accountId],
    filter_vector_type: null,
    similarity_threshold: 0.15,
    filter_item_types: ['cil_chunk'],
  }

  const { data: matches, error } = await adminDb.rpc('match_embeddings', rpcParams)
  if (error) throw new Error(`match_embeddings RPC error: ${error.message}`)

  
  const stableIds = [...new Set((matches || []).map((m: any) => m.document_id))]
  if (!stableIds.length) return []

  const { data: chunks } = await adminDb
    .from('items')
    .select('id, title, data')
    .in('data->>stable_id', stableIds)

  const chunkMap = new Map((chunks || []).map((c: any) => [c.data?.stable_id, c]))

  return (matches || [])
    .filter((m: any) => {
      const chunk = chunkMap.get(m.document_id)
      if (!chunk || chunk.data?.kb_type !== 'cil_chunk') return false
      if (!projectId) return true
      return chunk.data?.project_id === projectId
    })
    .map((m: any) => {
      const chunk = chunkMap.get(m.document_id)
      return {
        chunk_id: chunk?.data?.stable_id || m.document_id,
        chunk_name: chunk?.data?.chunk_name || chunk?.title || '',
        file_path: chunk?.data?.file_path || '',
        macro: chunk?.data?.macro || '',
        micro: chunk?.data?.micro || '',
        chunk_type: chunk?.data?.chunk_type || '',
        doc_confidence: chunk?.data?.doc_confidence || '',
        similarity: m.similarity,
        content_snippet: (m.content || '').slice(0, 200),
        vector_content: chunk?.data?.vector_content || null,
      }
    })
    .slice(0, limit)
}
// CIL[DOC-VECTOR type="context" content="purpose='Performs a semantic search over embedded CIL chunks.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:semanticSearch:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:getPlatformAccountId:function" type="function" identity="getPlatformAccountId" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Resolves the spine-system account id for platform-wide operations."]
// CIL[DOC-RESPONSIBILITY responsibility="Looks up the 'spine-system' account record and returns its id."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Queries the accounts table for the slug 'spine-system' and returns the id or an empty string." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getPlatformAccountId(): Promise<string> {
  const { data } = await adminDb.from('accounts').select('id').eq('slug', 'spine-system').maybeSingle()
  return data?.id || ''
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolves the spine-system account id for platform-wide operations.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:getPlatformAccountId:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-embeddings.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-embeddings.ts"]
// CIL[DOC-MACRO purpose="Exposes the Netlify function handler for embedding and search actions."]
// CIL[DOC-RESPONSIBILITY responsibility="Routes action requests to estimate, embed_chunk, embed_project, embed_approved, status, search, and delete logic."]
// CIL[DOC-CONTEXT module="cil-embeddings" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-embeddings.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, body: any" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses createHandler to dispatch action types and process embedding jobs through the CIL pipeline." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const action = ctx.query?.action
  const accountId = ctx.accountId || await getPlatformAccountId()

  
  if (action === 'estimate') {
    const projectId = body?.project_id || ctx.query?.project_id
    if (!projectId) throw new Error('project_id is required')
    const model = body?.model || ctx.query?.model || EMBEDDING_MODEL
    const pricePerMillion = EMBEDDING_PRICES[model] ?? EMBEDDING_PRICES[EMBEDDING_MODEL]
    const filePath = body?.file_path || ctx.query?.file_path

    
    const PAGE_SIZE = 1000
    let offset = 0
    const chunks: any[] = []
    while (true) {
      let q = adminDb
        .from('items')
        .select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', projectId)
        .filter('data->>review_status', 'eq', 'approved')
        .eq('is_active', true)
        .range(offset, offset + PAGE_SIZE - 1)
      if (filePath) q = q.filter('data->>file_path', 'eq', filePath)
      const { data: page, error } = await q
      if (error) throw new Error(`Failed to load chunks: ${error.message}`)
      chunks.push(...(page || []))
      if ((page || []).length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    
    const chunkStableIds = (chunks || []).map((c: any) => c.data?.stable_id).filter(Boolean)
    const existingDocIds = new Set<string>()
    const SUPABASE_IN_LIMIT = 500
    for (let i = 0; i < chunkStableIds.length; i += SUPABASE_IN_LIMIT) {
      const { data: emb } = await adminDb
        .from('embeddings')
        .select('document_id')
        .in('document_id', chunkStableIds.slice(i, i + SUPABASE_IN_LIMIT))
      for (const row of emb || []) existingDocIds.add(row.document_id)
    }

    const toEmbed = (chunks || []).filter((c: any) => !existingDocIds.has(c.data?.stable_id))
    const alreadyEmbedded = (chunks || []).length - toEmbed.length

    
    
    let totalTokens = 0
    for (const chunk of toEmbed) {
      const baseTokens = chunk.data?.token_count || Math.ceil((chunk.data?.code_content?.length || 200) / 4)
      totalTokens += baseTokens * 4
    }

    const estimatedCostUsd = (totalTokens / 1_000_000) * pricePerMillion

    return {
      project_id: projectId,
      model,
      file_path: filePath || null,
      price_per_1m_tokens: pricePerMillion,
      total_approved_chunks: (chunks || []).length,
      chunks_to_embed: toEmbed.length,
      already_embedded: alreadyEmbedded,
      vectors_per_chunk: 4,
      estimated_tokens: totalTokens,
      estimated_cost_usd: parseFloat(estimatedCostUsd.toFixed(4)),
    }
  }

  
  if (action === 'embed_chunk') {
    const projectId = body?.project_id || ctx.query?.project_id
    const stableId = body?.stable_id || ctx.query?.stable_id
    const versionId = body?.version_id || ctx.query?.version_id
    if (!projectId) throw new Error('project_id is required')
    if (!stableId) throw new Error('stable_id is required')

    let q = adminDb
      .from('items')
      .select('id, title, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>stable_id', 'eq', stableId)
      .eq('is_active', true)
    if (versionId) q = (q as any).filter('data->>version_id', 'eq', versionId)

    const { data: chunk, error } = await (q as any).maybeSingle()

    if (error || !chunk) throw new Error(`Chunk not found: ${stableId}`)

    const result = await embedChunk(chunk, accountId, body?.force_regenerate ?? false)
    return {
      project_id: projectId,
      stable_id: stableId,
      version_id: versionId || chunk.data?.version_id || null,
      chunk_name: chunk.data?.chunk_name || '',
      ...result,
    }
  }

  
  
  
  
  
  
  
  
  
  
  if (action === 'embed_project' || action === 'embed_approved') {
    const projectId = body?.project_id || ctx.query?.project_id
    if (!projectId) throw new Error('project_id is required')

    const forceRegenerate = body?.force_regenerate ?? false
    const secondPass = body?.second_pass ?? false
    const filePath = body?.file_path || ctx.query?.file_path
    const pageLimit  = Math.min(parseInt(body?.limit  || '10', 10), 25)
    const pageOffset = parseInt(body?.offset || '0', 10)

    
    const { data: projectItem } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
    
    const selectedPaths: string[] = projectItem?.data?.selected_paths || []
    const fileTree = (projectItem?.data?.file_tree as FileTreeNode) || null

    
    let totalChunks = 0
    let pageChunks: any[] = []
    let error: any = null

    if (action === 'embed_approved' && selectedPaths.length > 0 && !filePath) {
      
      const pending = await loadPendingChunks(projectId, selectedPaths, '3-documented', projectItem)
      const sorted = pending.sort((a: any, b: any) => a.id.localeCompare(b.id))
      totalChunks = sorted.length
      pageChunks = sorted.slice(pageOffset, pageOffset + pageLimit)
    } else {
      const sourceFilePaths = filePath ? [filePath] : getEmbedSourceFilePaths(projectItem, secondPass)
      const sourceChunks = await loadSourceChunks(projectId, sourceFilePaths, pageOffset, pageLimit, projectItem)
      totalChunks = sourceChunks.total
      pageChunks = sourceChunks.chunks
      error = null
    }

    if (error) throw new Error(`Failed to load chunks: ${error.message}`)
    if (error) throw new Error(`Failed to load chunks: ${error.message}`)
    if (!pageChunks || pageChunks.length === 0) {
      return { project_id: projectId, total: totalChunks, embeddings_created: 0, embeddings_skipped: 0, errors: [], has_more: false, next_offset: null, done_total: totalChunks }
    }

    
    const pageChunkDocumentIds = pageChunks.map((c: any) => c.data?.stable_id || c.id)
    const SUPABASE_IN_LIMIT = 500
    const existingRows: any[] = []
    for (let i = 0; i < pageChunkDocumentIds.length; i += SUPABASE_IN_LIMIT) {
      const { data } = await adminDb
        .from('embeddings')
        .select('id, document_id, content_hash, metadata')
        .in('document_id', pageChunkDocumentIds.slice(i, i + SUPABASE_IN_LIMIT))
      existingRows.push(...(data || []))
    }

    const existingMap = new Map<string, Map<string, any>>()
    for (const row of existingRows) {
      const docId = row.document_id
      if (!existingMap.has(docId)) existingMap.set(docId, new Map())
      existingMap.get(docId)!.set(row.metadata?.vector_type || '', row)
    }

    
    const toEmbed: { chunkId: string; type: string; text: string; existingRowId?: string }[] = []
    let totalSkipped = 0

    for (const chunk of pageChunks) {
      const d = chunk.data || {}
      const vc = d.vector_content || {}
      const vectorReadyText = (t: string) => (vc[t]?.status === 'ready' && vc[t]?.content ? vc[t].content : '')
      const vectors = [
        { type: 'semantic',      text: buildSemanticText(chunk) },
        { type: 'structure',     text: buildStructuralText(chunk) },
        { type: 'context',       text: vectorReadyText('context') },
        { type: 'blast_radius',  text: vectorReadyText('blast_radius') },
        { type: 'configuration', text: vectorReadyText('configuration') },
        { type: 'constraint',    text: buildConstraintText(chunk) },
      ].filter(v => v.text.trim().length > 0)

      const chunkStableId = chunk.data?.stable_id || chunk.id
      for (const v of vectors) {
        const inputHash = contentHash(v.text)
        const existing = existingMap.get(chunkStableId)?.get(v.type)
        if (!forceRegenerate && existing && existing.metadata?.input_hash === inputHash) {
          totalSkipped++
          continue
        }
        toEmbed.push({ chunkId: chunkStableId, type: v.type, text: v.text, existingRowId: existing?.id })
      }
    }

    
    
    
    const targetPipelineStatus = secondPass ? '7-embedded-mapped' : '7-embedded-mapped'

    const advanceFiles = async () => {
      const affectedFileIds = [...new Set(pageChunks.map(c => c.data?.file_id).filter(Boolean))]
      for (const fileId of affectedFileIds) {
        const chunk = pageChunks.find((c: any) => c.data?.file_id === fileId)
        const filePath = chunk?.data?.file_path
        const fileStatus = projectItem?.data?.file_statuses?.[filePath]
        if (fileStatus === targetPipelineStatus) continue
        await maybeAdvanceFileToPass4(ctx, fileId, fileTree, secondPass, projectItem)
      }
      if (fileTree) {
        await saveProjectTree(ctx, projectId, fileTree, { last_ingested_at: new Date().toISOString() }, projectItem)
      }
    }

    if (toEmbed.length === 0) {
      await advanceFiles()
      const nextOffset = pageOffset + pageLimit
      return {
        project_id: projectId, total: totalChunks,
        embeddings_created: 0, embeddings_skipped: totalSkipped, errors: [],
        has_more: nextOffset < totalChunks, next_offset: nextOffset < totalChunks ? nextOffset : null,
        done_total: pageOffset + pageChunks.length,
      }
    }

    
    if (forceRegenerate && pageChunkDocumentIds.length > 0) {
      for (let i = 0; i < pageChunkDocumentIds.length; i += SUPABASE_IN_LIMIT) {
        await adminDb.from('embeddings').delete().in('document_id', pageChunkDocumentIds.slice(i, i + SUPABASE_IN_LIMIT))
      }
      for (const item of toEmbed) { item.existingRowId = undefined }
    }

    
    const OPENAI_BATCH = 100
    const errors: string[] = []

    
    const batchPromises: Promise<{ startIdx: number; vecs: number[][] }>[] = []
    for (let i = 0; i < toEmbed.length; i += OPENAI_BATCH) {
      const startIdx = i
      const batchTexts = toEmbed.slice(i, i + OPENAI_BATCH).map(e => e.text)
      batchPromises.push(
        callEmbeddingApi(batchTexts)
          .then(vecs => ({ startIdx, vecs }))
          .catch(err => {
            errors.push(`OpenAI batch ${startIdx}-${startIdx + OPENAI_BATCH}: ${err instanceof Error ? err.message : String(err)}`)
            return { startIdx, vecs: batchTexts.map(() => []) }
          })
      )
    }
    const batchResults = await Promise.all(batchPromises)

    
    const allVectors: number[][] = new Array(toEmbed.length)
    for (const { startIdx, vecs } of batchResults) {
      for (let k = 0; k < vecs.length; k++) allVectors[startIdx + k] = vecs[k]
    }

    
    const now = new Date().toISOString()
    const chunkMap = new Map(pageChunks.map((c: any) => [c.data?.stable_id || c.id, c]))

    const rowsToInsert: object[] = []
    const rowsToUpdate: { id: string; row: object }[] = []

    for (let i = 0; i < toEmbed.length; i++) {
      const { chunkId, type, text, existingRowId } = toEmbed[i]
      const vec = allVectors[i]
      if (!vec || vec.length === 0) continue

      const chunk = chunkMap.get(chunkId)
      const hash = computeContentHash(text)
      const inputHash = contentHash(text)
      const row = {
        account_id:   accountId,
        model_id:     EMBEDDING_MODEL,
        document_id:  chunkId,
        chunk_index:  VECTOR_TYPE_INDEX[type] ?? 0,
        content:      text,
        embedding:    `[${vec.join(',')}]`,
        content_hash: hash,
        approved_at:  now,
        revoked_at:   null,
        metadata: {
          vector_type:    type,
          item_type:      'cil_chunk',
          kb_type:        'cil_chunk',
          security_level: 'internal',
          source_item_id: chunkId,
          chunk_name:     chunk?.data?.chunk_name || '',
          file_path:      chunk?.data?.file_path || '',
          project_id:     projectId,
          version_id:     chunk?.data?.version_id || '',
          input_hash:     inputHash,
        },
      }

      if (existingRowId) rowsToUpdate.push({ id: existingRowId, row })
      else rowsToInsert.push(row)
    }

    
    const INSERT_BATCH = 10
    for (let i = 0; i < rowsToInsert.length; i += INSERT_BATCH) {
      const { error: e } = await adminDb.from('embeddings').insert(rowsToInsert.slice(i, i + INSERT_BATCH))
      if (e) errors.push(`embedding insert batch failed: ${e.message}`)
    }

    
    const PARALLEL_UPDATE = 5
    const updatePromises: Promise<void>[] = []
    for (let i = 0; i < rowsToUpdate.length; i += PARALLEL_UPDATE) {
      for (const { id, row } of rowsToUpdate.slice(i, i + PARALLEL_UPDATE)) {
        updatePromises.push(
          adminDb.from('embeddings').update(row).eq('id', id)
            .then(({ error: e }) => { if (e) errors.push(`embedding update ${id}: ${e.message}`) }) as Promise<void>
        )
      }
    }

    await Promise.all(updatePromises)

    await advanceFiles()

    const nextOffset = pageOffset + pageLimit
    return {
      project_id: projectId,
      file_path: filePath || null,
      total: totalChunks,
      embeddings_created: rowsToInsert.length + rowsToUpdate.length,
      embeddings_skipped: totalSkipped,
      errors,
      has_more: nextOffset < totalChunks,
      next_offset: nextOffset < totalChunks ? nextOffset : null,
      done_total: pageOffset + pageChunks.length,
    }
  }

  
  if (action === 'status') {
    const projectId = body?.project_id || ctx.query?.project_id
    if (!projectId) throw new Error('project_id is required')

    const { count: totalChunks } = await adminDb
      .from('items')
      .select('id', { count: 'exact' })
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>project_id', 'eq', projectId)
      .eq('is_active', true)

    const { count: embeddedCount } = await adminDb
      .from('embeddings')
      .select('document_id', { count: 'exact', head: true })
      .filter('metadata->>project_id', 'eq', projectId)
      .filter('metadata->>vector_type', 'eq', 'semantic')
      .not('approved_at', 'is', null)
      .is('revoked_at', null)

    const safeEmbeddedCount = embeddedCount || 0

    return {
      project_id: projectId,
      total_chunks: totalChunks || 0,
      embedded_chunks: safeEmbeddedCount,
      unembedded_chunks: (totalChunks || 0) - safeEmbeddedCount,
      coverage_pct: totalChunks ? Math.round((safeEmbeddedCount / totalChunks) * 100) : 0,
    }
  }

  
  if (action === 'search') {
    const query = body?.q || ctx.query?.q
    const projectId = body?.project_id || ctx.query?.project_id || null
    const limit = parseInt(body?.limit || ctx.query?.limit || '10')
    if (!query) throw new Error('q is required')

    const results = await semanticSearch(query, projectId, limit, accountId)
    return { query, results, count: results.length }
  }

  
  if (action === 'delete') {
    const chunkId = body?.chunk_id || ctx.query?.chunk_id
    if (!chunkId) throw new Error('chunk_id is required')

    const { data: chunkItem } = await adminDb
      .from('items')
      .select('data')
      .eq('id', chunkId)
      .maybeSingle()
    const stableId = chunkItem?.data?.stable_id || chunkId

    const { error } = await adminDb
      .from('embeddings')
      .delete()
      .eq('document_id', stableId)

    if (error) throw new Error(`Failed to delete embeddings: ${error.message}`)
    return { chunk_id: stableId, deleted: true }
  }

  throw new Error(`Unknown action: ${action}. Valid: embed_chunk, embed_project, embed_approved, status, search, delete`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Exposes the Netlify function handler for embedding and search actions.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-embeddings.ts:handler:constant"]


