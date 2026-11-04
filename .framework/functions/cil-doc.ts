// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Module header for the CIL documentation service, defining imports and module constants."]
// CIL[DOC-RESPONSIBILITY responsibility="Orients readers to the module, its entry points, and key dependencies."]
// CIL[DOC-CONTEXT module="cil-doc" layer="shared-core" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares imports and constants used throughout the CIL documentation pipeline." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="both"]





import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { update as adminUpdate } from './admin-data'
import { callOpenAIChat } from './_shared/llm'
import { FileStatus, FileTreeNode, isSelectedPath, getFileStatus, updateTreeNodeStatus, saveProjectTree, parseStableId } from './_shared/cil'
import * as fs from 'fs'
import * as path from 'path'
// CIL[DOC-VECTOR type="context" content="purpose='Module header for the CIL documentation service, defining imports and module constants.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:module_header:module_header"]









// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:DEFAULT_MODEL:constant" type="constant" identity="DEFAULT_MODEL" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Declares the d e f a u l t_ m o d e l constant used by the documentation pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the d e f a u l t_ m o d e l value used across documentation operations."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="none" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const DEFAULT_MODEL = 'gpt-4o-mini'
// CIL[DOC-VECTOR type="context" content="purpose='Declares the d e f a u l t_ m o d e l constant used by the documentation pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:DEFAULT_MODEL:constant"]









// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:MODEL_PRICES:constant" type="constant" identity="MODEL_PRICES" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Declares the m o d e l_ p r i c e s constant used by the documentation pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the m o d e l_ p r i c e s value used across documentation operations."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="none" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const MODEL_PRICES: Record<string, { input_per_1m: number; output_per_1m: number }> = {
  'gpt-4o-mini':   { input_per_1m: 0.15,  output_per_1m: 0.60  },
  'gpt-4o':        { input_per_1m: 2.50,  output_per_1m: 10.00 },
  'gpt-4-turbo':   { input_per_1m: 10.00, output_per_1m: 30.00 },
  'gpt-3.5-turbo': { input_per_1m: 0.50,  output_per_1m: 1.50  },
}
// CIL[DOC-VECTOR type="context" content="purpose='Declares the m o d e l_ p r i c e s constant used by the documentation pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:MODEL_PRICES:constant"]








// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:ESTIMATED_OUTPUT_TOKENS_PER_CHUNK:constant" type="constant" identity="ESTIMATED_OUTPUT_TOKENS_PER_CHUNK" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Declares the e s t i m a t e d_ o u t p u t_ t o k e n s_ p e r_ c h u n k constant used by the documentation pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the e s t i m a t e d_ o u t p u t_ t o k e n s_ p e r_ c h u n k value used across documentation operations."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="none" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ESTIMATED_OUTPUT_TOKENS_PER_CHUNK = 200
// CIL[DOC-VECTOR type="context" content="purpose='Declares the e s t i m a t e d_ o u t p u t_ t o k e n s_ p e r_ c h u n k constant used by the documentation pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:ESTIMATED_OUTPUT_TOKENS_PER_CHUNK:constant"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:SYSTEM_PROMPT_OVERHEAD_TOKENS:constant" type="constant" identity="SYSTEM_PROMPT_OVERHEAD_TOKENS" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Declares the s y s t e m_ p r o m p t_ o v e r h e a d_ t o k e n s constant used by the documentation pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the s y s t e m_ p r o m p t_ o v e r h e a d_ t o k e n s value used across documentation operations."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="none" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const SYSTEM_PROMPT_OVERHEAD_TOKENS = 350
// CIL[DOC-VECTOR type="context" content="purpose='Declares the s y s t e m_ p r o m p t_ o v e r h e a d_ t o k e n s constant used by the documentation pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:SYSTEM_PROMPT_OVERHEAD_TOKENS:constant"]









// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:estimateTokens:function" type="function" identity="estimateTokens" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the estimate tokens behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the estimate tokens responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the estimate tokens result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the estimate tokens behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:estimateTokens:function"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:needsDocumentation:function" type="function" identity="needsDocumentation" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the needs documentation behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the needs documentation responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the needs documentation result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function needsDocumentation(chunk: any): boolean {
  const d = chunk.data || {}
  
  if (d.doc_validation_errors && d.doc_validation_errors.length > 0) return true
  
  
  
  const required = d.chunk_type === 'module_header'
    ? REQUIRED_MODULE_FIELDS
    : REQUIRED_CHUNK_FIELDS
  return required.some(f => !d[f] || String(d[f]).trim() === '')
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the needs documentation behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:needsDocumentation:function"]








// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:loadAllChunks:function" type="function" identity="loadAllChunks" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the load all chunks behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the load all chunks responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, filePath?: string" outputs="Promise<any[]>" errors="Throws Error on invalid input or missing resources" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the load all chunks result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function loadAllChunks(projectId: string, filePath?: string): Promise<any[]> {
  const PAGE = 1000
  const all: any[] = []
  for (let offset = 0; ; offset += PAGE) {
    let q = adminDb
      .from('items')
      .select('id, title, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>project_id', 'eq', projectId)
      .eq('is_active', true)
      .order('id')
      .range(offset, offset + PAGE - 1)
    if (filePath) q = q.filter('data->>file_path', 'eq', filePath)
    const { data, error } = await q
    if (error) throw new Error(`Failed to load chunks: ${error.message}`)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE) break
  }
  return all
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the load all chunks behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:loadAllChunks:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:resolveChunk:function" type="function" identity="resolveChunk" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the resolve chunk behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the resolve chunk responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any,   body: any" outputs="Promise<any>" errors="Throws Error on invalid input or missing resources" side_effects="Supabase database queries and updates"]
// CIL[DOC-MICRO logic_summary="Computes the resolve chunk result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function resolveChunk(
  ctx: any,
  body: any
): Promise<any> {
  const stableId = body?.stable_id || ctx.query?.stable_id
  const versionId = body?.version_id || ctx.query?.version_id
  const chunkId = body?.chunk_id || ctx.query?.chunk_id
  const chunkName = body?.chunk_name || ctx.query?.chunk_name
  const projectId = body?.project_id || ctx.query?.project_id

  if (stableId) {
    if (parseStableId(stableId) === null) {
      throw new Error(`Invalid stable_id: ${stableId}`)
    }

    if (versionId) {
      const { data: chunk, error } = await adminDb
        .from('items')
        .select('id, title, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>stable_id', 'eq', stableId)
        .filter('data->>version_id', 'eq', versionId)
        .eq('is_active', true)
        .maybeSingle()
      if (error || !chunk) throw new Error(`Chunk not found for stable_id: ${stableId}, version_id: ${versionId}`)
      return chunk
    }

    let activeVersion: string | undefined
    if (projectId) {
      const { data: proj } = await adminDb.from('items').select('data').eq('id', projectId).maybeSingle()
      activeVersion = proj?.data?.active_version_id
    }

    let q = adminDb
      .from('items')
      .select('id, title, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>stable_id', 'eq', stableId)
      .eq('is_active', true)
    if (activeVersion) q = q.filter('data->>version_id', 'eq', activeVersion)
    const { data: chunk, error } = await q.maybeSingle()
    if (error || !chunk) {
      throw new Error(`Chunk not found for stable_id: ${stableId}${activeVersion ? ` (active version ${activeVersion})` : ''}`)
    }
    return chunk
  }

  if (chunkId) {
    const { data: chunk, error } = await adminDb
      .from('items')
      .select('id, title, data')
      .eq('id', chunkId)
      .maybeSingle()
    if (error || !chunk) throw new Error(`Chunk not found: ${chunkId}`)
    return chunk
  }

  if (chunkName) {
    const { data: chunk, error } = await adminDb
      .from('items')
      .select('id, title, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>chunk_name', 'eq', chunkName)
      .eq('is_active', true)
      .maybeSingle()
    if (error || !chunk) throw new Error(`Chunk not found: ${chunkName}`)
    return chunk
  }

  throw new Error('chunk_id, stable_id, or chunk_name is required')
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the resolve chunk behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:resolveChunk:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:loadPendingChunks:function" type="function" identity="loadPendingChunks" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the load pending chunks behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the load pending chunks responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, selectedPaths: string[], requiredStatus: FileStatus" outputs="Promise<any[]>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the load pending chunks result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function loadPendingChunks(projectId: string, selectedPaths: string[], requiredStatus: FileStatus): Promise<any[]> {
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
// CIL[DOC-VECTOR type="context" content="purpose='Implements the load pending chunks behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:loadPendingChunks:function"]




// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:maybeAdvanceFileToPass3:function" type="function" identity="maybeAdvanceFileToPass3" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the maybe advance file to pass3 behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the maybe advance file to pass3 responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, fileId: string, tree: FileTreeNode | null" outputs="Promise<void>" errors="none" side_effects="Supabase database queries and updates"]
// CIL[DOC-MICRO logic_summary="Computes the maybe advance file to pass3 result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function maybeAdvanceFileToPass3(ctx: any, fileId: string, tree: FileTreeNode | null): Promise<void> {
  const { data: fileChunks } = await adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>file_id', 'eq', fileId)
    .eq('is_active', true)

  const allDocumented = (fileChunks || []).every(c => !needsDocumentation(c))
  if (!allDocumented) return

  const { data: fileItem } = await adminDb
    .from('items')
    .select('id, data')
    .eq('id', fileId)
    .maybeSingle()

  if (!fileItem) return

  const updateCtx = { ...ctx, query: { ...(ctx.query || {}), entity: 'items', id: fileId } }
  await adminUpdate(updateCtx, {
    data: {
      ...fileItem.data,
      status: '3-documented',
      last_status_at: new Date().toISOString(),
    },
  }).catch((e: any) => console.error('advance to pass3 failed:', e.message))

  if (tree) updateTreeNodeStatus(tree, fileId, '3-documented')
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the maybe advance file to pass3 behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:maybeAdvanceFileToPass3:function"]






















































// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:REQUIRED_MODULE_FIELDS:constant" type="constant" identity="REQUIRED_MODULE_FIELDS" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Declares the r e q u i r e d_ m o d u l e_ f i e l d s constant used by the documentation pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the r e q u i r e d_ m o d u l e_ f i e l d s value used across documentation operations."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="none" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const REQUIRED_MODULE_FIELDS = ['module', 'audience', 'layer', 'stability', 'description']
// CIL[DOC-VECTOR type="context" content="purpose='Declares the r e q u i r e d_ m o d u l e_ f i e l d s constant used by the documentation pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:REQUIRED_MODULE_FIELDS:constant"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:REQUIRED_CHUNK_FIELDS:constant" type="constant" identity="REQUIRED_CHUNK_FIELDS" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Declares the r e q u i r e d_ c h u n k_ f i e l d s constant used by the documentation pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the r e q u i r e d_ c h u n k_ f i e l d s value used across documentation operations."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="none" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const REQUIRED_CHUNK_FIELDS = ['description', 'input_spec', 'output_spec', 'side_effects', 'stability']
// CIL[DOC-VECTOR type="context" content="purpose='Declares the r e q u i r e d_ c h u n k_ f i e l d s constant used by the documentation pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:REQUIRED_CHUNK_FIELDS:constant"]




// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:moduleNameFromPath:function" type="function" identity="moduleNameFromPath" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the module name from path behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the module name from path responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="relPath: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the module name from path result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function moduleNameFromPath(relPath: string): string {
  return path.basename(relPath, path.extname(relPath))
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the module name from path behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:moduleNameFromPath:function"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:buildJsDoc:function" type="function" identity="buildJsDoc" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the build js doc behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the build js doc responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any" outputs="string" errors="none" side_effects="local file system access"]
// CIL[DOC-MICRO logic_summary="Computes the build js doc result from the provided input parameters." notable_decisions="Skips redundant macro/micro lines and filters trivial calls from the @calls tag."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildJsDoc(chunk: any): string {
  const d = chunk.data || {}
  const isModuleHeader = d.chunk_type === 'module_header'
  const description = (d.description || d.macro || '').trim()
  if (!description) return ''

  
  if (isModuleHeader) {
    const body: string[] = []
    if (d.module)   body.push(`@module   ${d.module}`)
    if (d.audience) body.push(`@audience ${d.audience}`)
    if (d.layer)    body.push(`@layer    ${d.layer}`)
    if (d.stability)body.push(`@stability ${d.stability}`)

    
    
    const descLines = description.split('\n')

    
    const seeAlsoRefs = d.see_also
      ? d.see_also.split(/\n/).map((s: string) => s.trim()).filter(Boolean)
      : []

    const docLines = [
      '/**',
      ...body.map(l => ` * ${l}`),
      ' *',
      ...descLines.map(l => ` * ${l}`),
      ...(seeAlsoRefs.length > 0 ? [' *'] : []),
      ...seeAlsoRefs.map(ref => ` * @seeAlso ${ref}`),
      ' *',
      ' * @cil-generated',
      ' */',
    ]
    return docLines.join('\n')
  }

  
  const body: string[] = []

  const chunkKind = d.chunk_type || ''
  const isTypeDecl = ['interface', 'type', 'enum'].includes(chunkKind)
  const isConstant = chunkKind === 'constant'
  const isCallableChunk = !isTypeDecl && !isConstant

  
  
  
  const macro = (d.macro || '').trim()
  const micro = (d.micro || '').trim()
  if (!isTypeDecl && !isConstant) {
    const descNorm = description.toLowerCase().replace(/\s+/g, ' ')
    const macroNorm = macro.toLowerCase().replace(/\s+/g, ' ')
    const macroDistinct = macro && macroNorm !== descNorm && !descNorm.includes(macroNorm.slice(0, 40))
    const microDistinct = micro && micro !== description && micro !== macro
    if (macroDistinct) body.push(`@macro       ${macro}`)
    if (macroDistinct && microDistinct) body.push(`@micro       ${micro}`)
  }

  
  if (isCallableChunk && d.input_spec) {
    const entries = d.input_spec.split(/\n/).map((s: string) => s.trim()).filter(Boolean)
    if (entries.length === 1 && entries[0].toLowerCase() === 'none') {
    } else {
      body.push('@inputSpec')
      for (const entry of entries) body.push(`  ${entry}`)
    }
  }

  
  
  if (isCallableChunk && d.output_spec) body.push(`@outputSpec  ${d.output_spec}`)

  
  const throwsVal = (d.throws || '').trim()
  if (throwsVal && throwsVal.toLowerCase() !== 'none') body.push(`@throws      ${throwsVal}`)

  
  if (d.side_effects) body.push(`@sideEffects ${d.side_effects}`)

  
  if (d.stability) body.push(`@stability   ${d.stability}`)

  
  
  const callsVal = (d.calls || '').trim()
  if (callsVal && callsVal.toLowerCase() !== 'unknown' && callsVal.toLowerCase() !== 'none') {
    body.push(`@calls       ${callsVal}`)
  }

  
  
  
  const ehVal = (d.error_handling || '').trim()
  const ehNoise = /^throws( on (unhandled|unexpected) errors?)?$/i.test(ehVal)
  if (ehVal && !ehNoise) body.push(`@errorHandling ${ehVal}`)

  
  

  body.push('@cil-generated')

  const docLines = [
    '/**',
    ` * ${description}`,
    ...(body.length > 0 ? [' *'] : []),
    ...body.map(l => ` * ${l}`),
    ' */',
  ]
  return docLines.join('\n')
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the build js doc behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:buildJsDoc:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:validateChunkDocs:function" type="function" identity="validateChunkDocs" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the validate chunk docs behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the validate chunk docs responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any, text: string" outputs="string[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the validate chunk docs result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function splitParameterList(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let inString = false
  let quote = ''
  let current = ''
  for (const ch of text) {
    if (inString) {
      if (ch === quote) inString = false
      current += ch
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true
      quote = ch
      current += ch
      continue
    }
    if (ch === '(' || ch === '[' || ch === '<' || ch === '{') depth++
    else if (ch === ')' || ch === ']' || ch === '>' || ch === '}') depth = Math.max(0, depth - 1)
    else if ((ch === ',' || ch === '\n') && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += ch
  }
  parts.push(current)
  return parts.map(s => s.trim()).filter(Boolean)
}

function expandParamEntries(rawParams: string): Array<{ name: string; type: string; optional: boolean }> {
  const out: Array<{ name: string; type: string; optional: boolean }> = []
  const push = (part: string, depth: number): void => {
    if (depth > 4) return
    const t = part.trim()
    if (!t) return
    const open = t[0]
    if (open === '{' || open === '[') {
      const close = open === '{' ? '}' : ']'
      let d = 0
      let end = -1
      for (let i = 0; i < t.length; i++) {
        if (t[i] === open) d++
        else if (t[i] === close) { d--; if (d === 0) { end = i; break } }
      }
      const inner = end > 0 ? t.slice(1, end) : t.slice(1, -1)
      for (const p of splitParameterList(inner)) push(p, depth + 1)
      return
    }
    const m = t.replace(/^\.\.\./, '').match(/^([A-Za-z_$][A-Za-z0-9_$]*)(\?)?\s*(?::\s*([^=]+?))?(?:\s*=.*)?$/)
    if (m) out.push({ name: m[1], type: (m[3] || 'any').trim(), optional: !!m[2] || t.includes('=') })
  }
  for (const part of splitParameterList(rawParams)) push(part, 0)
  return out
}

function validateChunkDocs(chunk: any): string[] {
  const d = chunk.data || {}
  const errors: string[] = []
  const isModuleHeader = d.chunk_type === 'module_header'

  const required = isModuleHeader ? REQUIRED_MODULE_FIELDS : REQUIRED_CHUNK_FIELDS
  for (const field of required) {
    if (!d[field] || String(d[field]).trim() === '') {
      errors.push(`missing ${field}`)
    }
  }

  if (!isModuleHeader && d.input_spec && d.input_spec !== 'none') {
    const paramNames = splitParameterList(d.input_spec).map(p => {
      const m = p.match(/^[-\s]*([a-zA-Z0-9_]+)/)
      return m ? m[1] : ''
    }).filter(Boolean)

    const code = d.code_content || ''
    const signatureMatch = code.match(/(?:function|const|let|var)\s+\w+\s*\(([^)]*)\)/)
    if (signatureMatch) {
      const rawParams = signatureMatch[1]
      const declaredNames = expandParamEntries(rawParams).map(p => p.name)
      for (const declared of declaredNames) {
        if (!paramNames.includes(declared)) {
          errors.push(`undocumented parameter: ${declared}`)
        }
      }
    }
  }

  return errors
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the validate chunk docs behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:validateChunkDocs:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:findExistingCilJsDoc:function" type="function" identity="findExistingCilJsDoc" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the find existing cil js doc behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the find existing cil js doc responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[], markerIdx: number" outputs="void" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the find existing cil js doc result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function findExistingCilJsDoc(lines: string[], markerIdx: number): { start: number; end: number } | null {
  let startIdx = -1
  for (let i = markerIdx + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed === '') continue
    if (trimmed.startsWith('/**')) { startIdx = i; break }
    break
  }
  if (startIdx === -1) return null

  let endIdx = -1
  let hasCilTag = false
  for (let i = startIdx; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed.includes('@cil-generated')) hasCilTag = true
    if (trimmed === '*/' || trimmed.endsWith('*/')) { endIdx = i; break }
  }
  if (endIdx === -1 || !hasCilTag) return null
  return { start: startIdx, end: endIdx }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the find existing cil js doc behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:findExistingCilJsDoc:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:findLegacyCilJsDocAbove:function" type="function" identity="findLegacyCilJsDocAbove" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the find legacy cil js doc above behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the find legacy cil js doc above responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[], markerIdx: number" outputs="void" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the find legacy cil js doc above result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function findLegacyCilJsDocAbove(lines: string[], markerIdx: number): { start: number; end: number } | null {
  let endIdx = -1
  for (let i = markerIdx - 1; i >= 0; i--) {
    const trimmed = lines[i].trim()
    if (trimmed === '') continue
    if (trimmed === '*/' || trimmed.endsWith('*/')) { endIdx = i; break }
    break
  }
  if (endIdx === -1) return null

  let startIdx = -1
  let hasCilTag = false
  for (let i = endIdx; i >= 0; i--) {
    const trimmed = lines[i].trim()
    if (trimmed.includes('@cil-generated')) hasCilTag = true
    if (trimmed.startsWith('/**')) { startIdx = i; break }
  }
  if (startIdx === -1 || !hasCilTag) return null

  return { start: startIdx, end: endIdx }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the find legacy cil js doc above behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:findLegacyCilJsDocAbove:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:writeJsDocToSource:function" type="function" identity="writeJsDocToSource" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the write js doc to source behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the write js doc to source responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any, repoPath: string" outputs="void" errors="none" side_effects="local file system access"]
// CIL[DOC-MICRO logic_summary="Computes the write js doc to source result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function writeJsDocToSource(chunk: any, repoPath: string): void {
  const d = chunk.data || {}
  const relPath = d.file_path
  if (!repoPath || !relPath) return

  const ext = path.extname(relPath).toLowerCase()
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return

  const jsDoc = buildJsDoc(chunk)
  if (!jsDoc) return

  const absPath = path.join(repoPath, relPath)
  if (!fs.existsSync(absPath)) return

  const content = fs.readFileSync(absPath, 'utf-8')
  const lines = content.split('\n')

  const markerMap = findChunkStartMarkers(lines)
  let markerIdx = markerMap.get((d.chunk_name || chunk.title).trim().toLowerCase())
  if (markerIdx === undefined) return

  const newLines = [...lines]

  
  const legacyAbove = findLegacyCilJsDocAbove(newLines, markerIdx)
  if (legacyAbove) {
    newLines.splice(legacyAbove.start, legacyAbove.end - legacyAbove.start + 1)
    
    markerIdx -= (legacyAbove.end - legacyAbove.start + 1)
  }

  const existing = findExistingCilJsDoc(newLines, markerIdx)
  if (existing) {
    newLines.splice(existing.start, existing.end - existing.start + 1, jsDoc)
  } else {
    newLines.splice(markerIdx + 1, 0, jsDoc)
  }

  fs.writeFileSync(absPath, newLines.join('\n'), 'utf-8')
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the write js doc to source behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:writeJsDocToSource:function"]



// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:escapeRegExp:function" type="function" identity="escapeRegExp" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the escape reg exp behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the escape reg exp responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="s: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the escape reg exp result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the escape reg exp behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:escapeRegExp:function"]










// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:CHUNK_START_MARKER_RE:constant" type="constant" identity="CHUNK_START_MARKER_RE" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Declares the c h u n k_ s t a r t_ m a r k e r_ r e constant used by the documentation pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the c h u n k_ s t a r t_ m a r k e r_ r e value used across documentation operations."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="none" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const CHUNK_START_MARKER_RE = /^\s*\/\/\s*CIL\[BEGIN\s+[^\]]*identity="([^"]+)"[^\]]*\]\s*$/
// CIL[DOC-VECTOR type="context" content="purpose='Declares the c h u n k_ s t a r t_ m a r k e r_ r e constant used by the documentation pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:CHUNK_START_MARKER_RE:constant"]










// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:findChunkStartMarkers:function" type="function" identity="findChunkStartMarkers" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the find chunk start markers behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the find chunk start markers responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[]" outputs="Map<string," errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the find chunk start markers result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function findChunkStartMarkers(lines: string[]): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(CHUNK_START_MARKER_RE)
    if (m) {
      const name = m[1].trim().toLowerCase()
      if (!map.has(name)) map.set(name, i)
    }
  }
  return map
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the find chunk start markers behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:findChunkStartMarkers:function"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:buildDocPrompt:function" type="function" identity="buildDocPrompt" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the build doc prompt behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the build doc prompt responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the build doc prompt result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildDocPrompt(chunk: any): string {
  const d = chunk.data || {}
  const code = (d.code_content || '').slice(0, 3000)
  const isModuleHeader = d.chunk_type === 'module_header'
  return isModuleHeader ? buildModuleHeaderPrompt(d, code) : buildChunkPrompt(d, code)
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the build doc prompt behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:buildDocPrompt:function"]










// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:buildModuleHeaderPrompt:function" type="function" identity="buildModuleHeaderPrompt" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the build module header prompt behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the build module header prompt responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="d: any, code: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the build module header prompt result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildModuleHeaderPrompt(d: any, code: string): string {
  const filePath = d.file_path || 'unknown'
  return `You are documenting the MODULE HEADER for file: ${filePath}

This is the top of the file — imports, constants, and module-level setup.

\`\`\`typescript
${code}
\`\`\`

Generate a file-level JSDoc block. Your job is to orient a developer to this module
in 10 seconds — what it does, how it is entered, and what depends on it.

Rules:
- description: 2–4 sentences covering what the module does, its role in the system,
  and any key architectural constraints. If this is an API handler, include the
  route pattern(s). If it has a multi-step pipeline (auth → validate → execute),
  number the steps. If there are non-obvious invariants (things that must always be
  true for callers), prefix them with INVARIANT:.
- seeAlso: 2–4 direct dependencies a reader needs to understand this module.
  Format each as: filename (reason it matters). Omit obvious/trivial imports.
- Do NOT list every import. Do NOT describe individual functions (those get their own docs).

Respond ONLY with a JSON object (no markdown, no commentary):
{
  "description": "<2-4 sentences + optional route table + optional numbered flow + optional INVARIANT lines, all as a single string with \\n between paragraphs>",
  "module": "<filename without extension>",
  "audience": "<internal | external | both>",
  "layer": "<shared-core | app-specific | infrastructure | test>",
  "stability": "<stable | experimental | deprecated>",
  "seeAlso": "<newline-separated list: filename (reason). 2-4 entries max. Empty string if no meaningful cross-references.>",
  "tags": "<comma-separated relevant tags>"
}`
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the build module header prompt behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:buildModuleHeaderPrompt:function"]










// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:buildChunkPrompt:function" type="function" identity="buildChunkPrompt" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the build chunk prompt behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the build chunk prompt responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="d: any, code: string" outputs="string" errors="none" side_effects="Supabase database queries and updates"]
// CIL[DOC-MICRO logic_summary="Computes the build chunk prompt result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildChunkPrompt(d: any, code: string): string {
  const chunkType = d.chunk_type || 'function'
  const chunkName = d.chunk_name || 'unknown'
  const location = `${d.file_path || 'unknown'}:${d.line_start || 0}-${d.line_end || 0}`

  return `You are documenting a ${chunkType} named "${chunkName}" at ${location}.

\`\`\`typescript
${code}
\`\`\`

Rules:
- description: 1–2 sentences — what it does and why it exists in this module.
  Do NOT start with "It achieves this by". Write it as a direct statement.
- macro: one sentence classifying WHAT this chunk IS and its primary responsibility.
  Only write this if it adds information that description does not already convey.
  Example: "Async resolver that maps an HTTP request to a typed Principal object."
  If it would be the same sentence as description, return "".
- micro: one sentence on the SPECIFIC implementation mechanism — the algorithm,
  branching strategy, data structure, or key external call pattern used.
  Must be distinct from macro. If not meaningfully distinct, return "".
  Example: "Checks headers in priority order (API key → cron → trigger → JWT),
  delegating to a type-specific sub-resolver for each."
- inputSpec: one line per parameter: - name: Type (required|optional[|nullable]) — description.
  Be precise about types (string, UUID, timestamp, not just "string").
  Note enums if the field has a fixed value set.
  Write "none" if the function takes no parameters.
- outputSpec: exact return type including Promise<T> if async. Add a brief shape
  description if the return value is non-obvious.
- throws: only list errors the function explicitly throws that callers must handle.
  Write "none" if the function never throws.
- side_effects: concrete observable effects (DB writes, RPC calls, file I/O,
  external API calls). Write "none" if the function is pure.
- stability: stable | experimental | deprecated
- calls: comma-separated list of KEY named functions or external services this chunk
  calls. Write the function name or service name only — not method chains.
  BAD: "adminDb.from, adminDb.select, adminDb.eq, adminDb.single" (these are chained
       builder methods on one call — write "adminDb.from('schedules')" instead)
  GOOD: "adminDb.rpc('validate_machine_principal'), getClientIp"
  GOOD: "supabase.auth.getUser, adminDb.from('people')"
  Omit: String methods, Array methods, standard library, trivial getters.
  Write "none" if no significant external callees.
- errorHandling: only write this if the error handling strategy is non-obvious —
  e.g. "returns ANONYMOUS_PRINCIPAL on auth failure rather than throwing".
  Write "" if it simply throws or returns null on error.
- calledBy: your best guess at likely callers or entry points. For RAG use only.
- complexity: simple | moderate | complex
- tags: comma-separated relevant tags

Respond ONLY with a JSON object (no markdown, no commentary):
{
  "description": "<1-2 direct sentences>",
  "macro": "<classification sentence, or empty string>",
  "micro": "<mechanism sentence distinct from macro, or empty string>",
  "inputSpec": "<newline-separated param lines, or 'none'>",
  "outputSpec": "<return type and shape>",
  "throws": "<ErrorType — condition, or 'none'>",
  "side_effects": "<effects or 'none'>",
  "stability": "<stable | experimental | deprecated>",
  "calls": "<key callees or 'none'>",
  "errorHandling": "<non-obvious strategy or empty string>",
  "calledBy": "<likely callers or 'unknown'>",
  "complexity": "<simple | moderate | complex>",
  "tags": "<comma-separated tags>"
}`
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the build chunk prompt behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:buildChunkPrompt:function"]









// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:callLLM:function" type="function" identity="callLLM" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the call l l m behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the call l l m responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="prompt: string, model: string" outputs="Promise<string>" errors="none" side_effects="OpenAI chat API call"]
// CIL[DOC-MICRO logic_summary="Computes the call l l m result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function callLLM(prompt: string, model: string): Promise<string> {
  const j = await callOpenAIChat(undefined, [
    {
      role: 'system',
      content: 'You are a code documentation assistant. You extract structured contracts from source code. Always respond with valid JSON only.',
    },
    { role: 'user', content: prompt },
  ], model, {
    temperature: 0.2,
    max_tokens: 800,
    response_format: { type: 'json_object' }
  })
  return j.choices?.[0]?.message?.content?.trim() || '{}'
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the call l l m behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:callLLM:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:parseDocResponse:function" type="function" identity="parseDocResponse" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the parse doc response behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the parse doc response responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="raw: string" outputs="Record<string," errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the parse doc response result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function parseDocResponse(raw: string): Record<string, string> {
  try {
    
    let cleaned = raw.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\n?/, '').replace(/\n?```$/, '').trim()
    }
    const parsed = JSON.parse(cleaned)
    return {
      description: String(parsed.description || parsed.macro || '').slice(0, 1000),
      macro:       String(parsed.macro       || '').slice(0, 500),
      micro:       String(parsed.micro       || '').slice(0, 500),
      input_spec:  String(parsed.inputSpec   || parsed.input_spec  || '').slice(0, 2000),
      output_spec: String(parsed.outputSpec  || parsed.output_spec || '').slice(0, 500),
      throws:      String(parsed.throws      || '').slice(0, 500),
      side_effects:String(parsed.sideEffects || parsed.side_effects|| '').slice(0, 500),
      stability:   ['stable', 'internal', 'experimental', 'deprecated'].includes(parsed.stability)
        ? parsed.stability : 'internal',
      called_by:   String(parsed.calledBy    || parsed.called_by  || '').slice(0, 500),
      calls:       String(parsed.calls        || '').slice(0, 500),
      tags:        String(parsed.tags          || '').slice(0, 500),
      complexity:  ['simple', 'moderate', 'complex'].includes(parsed.complexity)
        ? parsed.complexity : 'moderate',
      error_handling: String(parsed.errorHandling || parsed.error_handling || '').slice(0, 500),
      module:      String(parsed.module        || '').slice(0, 100),
      audience:    ['internal', 'external', 'both'].includes(parsed.audience)
        ? parsed.audience : 'both',
      layer:       ['shared-core', 'app-specific', 'infrastructure', 'test'].includes(parsed.layer)
        ? parsed.layer : 'app-specific',
      see_also:    String(parsed.seeAlso       || parsed.see_also    || '').slice(0, 1000),
    }
  } catch {
    return {}
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the parse doc response behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:parseDocResponse:function"]









// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:hasMeaningfulLlmFields:function" type="function" identity="hasMeaningfulLlmFields" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the has meaningful llm fields behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the has meaningful llm fields responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="fields: Record<string, string>" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the has meaningful llm fields result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function hasMeaningfulLlmFields(fields: Record<string, string>): boolean {
  const meaningfulKeys = ['description', 'macro', 'micro', 'input_spec', 'output_spec']
  return meaningfulKeys.some(k => (fields[k] || '').trim() !== '')
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the has meaningful llm fields behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:hasMeaningfulLlmFields:function"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:normalizeDocFields:function" type="function" identity="normalizeDocFields" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the normalize doc fields behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the normalize doc fields responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="fields: Record<string, string>, chunk: any" outputs="Record<string," errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the normalize doc fields result from the provided input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function normalizeDocFields(fields: Record<string, string>, chunk: any): Record<string, string> {
  const d = chunk.data || {}
  const isModuleHeader = d.chunk_type === 'module_header'
  const code = d.code_content || ''
  const chunkName = d.chunk_name || chunk.title || ''
  const layer = d.layer || (isModuleHeader ? 'shared-core' : 'app-specific')

  const normalized = { ...fields }

  if (isModuleHeader) {
    if (!normalized.module) normalized.module = moduleNameFromPath(d.file_path || chunkName)
    if (!normalized.audience) normalized.audience = 'both'
    if (!normalized.layer) normalized.layer = layer
    if (!normalized.description) normalized.description = normalized.macro || `${chunkName} module setup and imports.`
    if (!normalized.stability) normalized.stability = 'stable'
    if (!normalized.see_also) normalized.see_also = ''
  } else {
    const chunkType = d.chunk_type || 'symbol'
    const isCallable = !['interface', 'type', 'enum', 'constant'].includes(chunkType)

    if (!normalized.description) normalized.description = normalized.macro || `${chunkName} ${chunkType}.`

    
    
    
    const macroFromLlm = (fields.macro || '').trim()
    const microFromLlm = (fields.micro || '').trim()
    if (!macroFromLlm) {
      normalized.macro = normalized.description.split(/(?<=[.!?])\s+/)[0] || normalized.description
    }
    if (!microFromLlm) {
      const rest = normalized.description.split(/(?<=[.!?])\s+/).slice(1).join(' ').trim()
      normalized.micro = rest || normalized.description
    }

    
    
    if (!normalized.input_spec) {
      if (isCallable) {
        const sigMatch = code.match(/(?:function|const|let|var)\s+\w+\s*\(([^)]*)\)|(?:async\s+)?function\s*\(([^)]*)\)/)
        const paramStr = sigMatch?.[1] || sigMatch?.[2] || ''
        const params = expandParamEntries(paramStr).map(p => `- ${p.name}: ${p.type} (${p.optional ? 'optional' : 'required'})`)
        normalized.input_spec = params.length ? params.join('\n') : 'none'
      } else {
        normalized.input_spec = 'none'
      }
    }

    
    if (!normalized.output_spec) {
      if (!isCallable) {
        normalized.output_spec = chunkName  
      } else {
        
        const returnMatch = code.match(/\)\s*:\s*(Promise<[^>]+>|[A-Za-z0-9_<>|[\]{}?\s]+)\s*(?:\{|=>)/)
        normalized.output_spec = returnMatch ? returnMatch[1].trim() : 'void'
      }
    }

    if (!normalized.side_effects) normalized.side_effects = 'none'
    if (!normalized.stability) normalized.stability = 'stable'
    if (!normalized.tags) normalized.tags = chunkType
    if (!normalized.complexity) normalized.complexity = 'moderate'
    if (!normalized.error_handling) normalized.error_handling = ''
    if (!normalized.called_by) normalized.called_by = 'unknown'
    if (!normalized.calls) normalized.calls = 'unknown'
  }

  return normalized
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the normalize doc fields behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:normalizeDocFields:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:documentChunk:function" type="function" identity="documentChunk" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Implements the document chunk behavior for CIL documentation processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Carries out the document chunk responsibility within the documentation workflow."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any,   chunk: any,   model: string,   force: boolean,   repoPath?: string" outputs="Promise<" errors="none" side_effects="Supabase database queries and updates"]
// CIL[DOC-MICRO logic_summary="Computes the document chunk result from the provided input parameters." notable_decisions="Writes generated fields to the database and optionally persists JSDoc back to the source file."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function documentChunk(
  ctx: any,
  chunk: any,
  model: string,
  force: boolean,
  repoPath?: string
): Promise<{ success: boolean; fields_set: string[]; error?: string; skipped?: boolean; updatedChunk?: any; validation_errors?: string[] }> {
  if (!force && !needsDocumentation(chunk)) {
    return { success: true, fields_set: [], skipped: true, updatedChunk: chunk }
  }

  const d = chunk.data || {}
  if (!d.code_content && !d.chunk_name) {
    const ref = d.stable_id || d.chunk_name || chunk.id
    return { success: false, fields_set: [], error: `No code content to document: ${ref}` }
  }

  const prompt = buildDocPrompt(chunk)

  let raw: string
  try {
    raw = await callLLM(prompt, model)
  } catch (err) {
    return { success: false, fields_set: [], error: err instanceof Error ? err.message : String(err) }
  }

  const rawFields = parseDocResponse(raw)
  const hadLlmFields = hasMeaningfulLlmFields(rawFields)

  
  
  
  const fields = normalizeDocFields(rawFields, chunk)

  
  const toWrite: Record<string, string> = {}
  for (const [k, v] of Object.entries(fields)) {
    if (force || !d[k]) toWrite[k] = v
  }

  if (!Object.keys(toWrite).length) {
    return { success: true, fields_set: [], skipped: true, updatedChunk: chunk }
  }

  const updatedData = { ...d, ...toWrite, doc_confidence: 'ai_generated', doc_fallback: !hadLlmFields }
  const updatedChunk = { ...chunk, data: updatedData }

  
  const validationErrors = validateChunkDocs(updatedChunk)
  if (validationErrors.length > 0) {
    return { success: false, fields_set: [], error: `Validation failed: ${validationErrors.join(', ')}`, validation_errors: validationErrors, updatedChunk }
  }

  const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: chunk.id } }
  try {
    await adminUpdate(updateCtx, { data: updatedData })
  } catch (updateError: any) {
    return { success: false, fields_set: [], error: updateError.message }
  }

  
  if (repoPath) {
    writeJsDocToSource(updatedChunk, repoPath)
  }

  return { success: true, fields_set: Object.keys(toWrite), updatedChunk }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the document chunk behavior for CIL documentation processing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:documentChunk:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-doc.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-doc.ts"]
// CIL[DOC-MACRO purpose="Netlify handler that dispatches documentation-related HTTP actions."]
// CIL[DOC-RESPONSIBILITY responsibility="Routes documentation actions to the appropriate sub-handler and returns JSON responses."]
// CIL[DOC-CONTEXT module="cil-doc" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-data.ts,.framework/functions/cil-doc.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, body: any" outputs="Promise<any>" errors="Throws Error on invalid input or missing resources" side_effects="Supabase database queries and updates; local file system access"]
// CIL[DOC-MICRO logic_summary="Uses query.action to route to estimate, gap_report, document, doc_chunk, or validate logic." notable_decisions="Supports estimate, gap_report, document, doc_chunk, and validate actions."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  // CIL is operator tooling — every action touches the service-role client
  // and server filesystem. System principals only; tenant callers stop here.
  requireSystemContextWithAudit(ctx)

  const action = ctx.query?.action

  
  if (action === 'gap_report') {
    const projectId = ctx.query?.project_id || body?.project_id
    if (!projectId) throw new Error('project_id is required')

    const chunks = await loadAllChunks(projectId)

    const undocumented = chunks.filter(needsDocumentation)
    const documented   = chunks.filter(c => !needsDocumentation(c))
    const aiGenerated  = documented.filter(c => c.data?.doc_confidence === 'ai_generated')
    const humanVerified= documented.filter(c => c.data?.doc_confidence === 'human_verified')

    return {
      project_id: projectId,
      total_chunks: chunks.length,
      undocumented_count: undocumented.length,
      documented_count: documented.length,
      ai_generated_count: aiGenerated.length,
      human_verified_count: humanVerified.length,
      coverage_pct: chunks.length
        ? Math.round((documented.length / chunks.length) * 100) : 0,
      undocumented: undocumented.slice(0, 100).map(c => ({
        id: c.id,
        stable_id: c.data?.stable_id || null,
        chunk_name: c.data?.chunk_name || c.title,
        file_path: c.data?.file_path || '',
        chunk_type: c.data?.chunk_type || '',
        line_count: (c.data?.line_end || 0) - (c.data?.line_start || 0) + 1,
        token_count: c.data?.token_count || 0,
      })),
    }
  }

  
  if (action === 'estimate') {
    const projectId = ctx.query?.project_id || body?.project_id
    const model = ctx.query?.model || body?.model || DEFAULT_MODEL
    const modelPrices = body?.model_prices || MODEL_PRICES[model] || MODEL_PRICES[DEFAULT_MODEL]
    const filePath = ctx.query?.file_path || body?.file_path

    if (!projectId) throw new Error('project_id is required')

    const chunks = await loadAllChunks(projectId, filePath)
    const toDocument = chunks.filter(needsDocumentation)

    let totalInputTokens = 0
    const breakdown: any[] = []

    for (const chunk of toDocument) {
      const prompt = buildDocPrompt(chunk)
      const inputTokens = estimateTokens(prompt) + SYSTEM_PROMPT_OVERHEAD_TOKENS
      totalInputTokens += inputTokens
      breakdown.push({
        stable_id: chunk.data?.stable_id || null,
        chunk_name: chunk.data?.chunk_name || chunk.title,
        file_path: chunk.data?.file_path || '',
        input_tokens: inputTokens,
      })
    }

    const totalOutputTokens = toDocument.length * ESTIMATED_OUTPUT_TOKENS_PER_CHUNK
    const totalTokens = totalInputTokens + totalOutputTokens

    const inputCostUsd  = (totalInputTokens  / 1_000_000) * modelPrices.input_per_1m
    const outputCostUsd = (totalOutputTokens / 1_000_000) * modelPrices.output_per_1m
    const totalCostUsd  = inputCostUsd + outputCostUsd

    return {
      project_id: projectId,
      model,
      file_path: filePath || null,
      model_prices: modelPrices,
      chunks_to_document: toDocument.length,
      total_chunks: chunks.length,
      already_documented: chunks.length - toDocument.length,
      estimated_input_tokens: totalInputTokens,
      estimated_output_tokens: totalOutputTokens,
      estimated_total_tokens: totalTokens,
      estimated_cost_usd: parseFloat(totalCostUsd.toFixed(4)),
      estimated_cost_usd_breakdown: {
        input:  parseFloat(inputCostUsd.toFixed(4)),
        output: parseFloat(outputCostUsd.toFixed(4)),
      },
      
      top_chunks_by_cost: breakdown
        .sort((a, b) => b.input_tokens - a.input_tokens)
        .slice(0, 20),
    }
  }

  
  if (action === 'doc_chunk') {
    const model = body?.model || ctx.query?.model || DEFAULT_MODEL
    const force = body?.force ?? false
    const chunk = await resolveChunk(ctx, body)
    const chunkId = chunk.id

    const projectId = chunk.data?.project_id
    let repoPath = ''
    if (projectId) {
      const { data: projectItem } = await adminDb.from('items').select('data').eq('id', projectId).maybeSingle()
      repoPath = projectItem?.data?.repo_path || ''
    }

    const result = await documentChunk(ctx, chunk, model, force, repoPath)
    return { chunk_id: chunkId, chunk_name: chunk.data?.chunk_name || chunk.title, stable_id: chunk.data?.stable_id || null, ...result }
  }

  
  
  
  if (action === 'validate') {
    const projectId = ctx.query?.project_id || body?.project_id
    const filePath = ctx.query?.file_path || body?.file_path
    if (!projectId) throw new Error('project_id is required')

    const chunks = await loadAllChunks(projectId, filePath)
    const invalid: any[] = []
    for (const chunk of chunks) {
      const errors = validateChunkDocs(chunk)
      if (errors.length > 0) {
        invalid.push({
          chunk_id: chunk.id,
          stable_id: chunk.data?.stable_id || null,
          chunk_name: chunk.data?.chunk_name || chunk.title,
          file_path: chunk.data?.file_path || '',
          chunk_type: chunk.data?.chunk_type || '',
          errors,
        })
      }
    }

    return {
      project_id: projectId,
      file_path: filePath || null,
      total_chunks: chunks.length,
      valid_chunks: chunks.length - invalid.length,
      invalid_chunks: invalid.length,
      invalid,
    }
  }

  
  
  
  
  
  
  
  
  
  
  
  
  if (action === 'document') {
    const projectId = body?.project_id
    if (!projectId) throw new Error('project_id is required')

    const model     = body?.model     || DEFAULT_MODEL
    const dryRun    = body?.dry_run   ?? false
    const force     = body?.force     ?? false
    const chunkIds: string[] | undefined = body?.chunk_ids
    const filePath: string | undefined = body?.file_path
    const pageLimit = Math.min(parseInt(body?.limit || '5', 10), 100) 
    const pageOffset= parseInt(body?.offset || '0', 10)
    const concurrency = Math.min(parseInt(body?.concurrency || '20', 10), 30)

    
    const { data: projectItem } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
    const selectedPaths: string[] = body?.selected_paths || projectItem?.data?.selected_paths || []
    const fileTree = (projectItem?.data?.file_tree as FileTreeNode) || null

    
    
    let stableList: any[]
    if (chunkIds?.length) {
      let q = adminDb
        .from('items')
        .select('id, title, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', projectId)
        .eq('is_active', true)
        .in('id', chunkIds)
        .order('id')
      if (filePath) q = q.filter('data->>file_path', 'eq', filePath)
      const { data, error } = await q
      if (error) throw new Error(`Failed to load chunks: ${error.message}`)
      stableList = data || []
    } else if (selectedPaths.length > 0 && !filePath) {
      
      stableList = await loadPendingChunks(projectId, selectedPaths, '2-chunked')
    } else {
      stableList = await loadAllChunks(projectId, filePath)
    }

    const totalChunks = stableList.length
    const pageChunks  = stableList.slice(pageOffset, pageOffset + pageLimit)

    
    const allToDocument = force ? pageChunks : pageChunks.filter(needsDocumentation)
    
    const totalToDocument = force
      ? stableList.length
      : stableList.filter(needsDocumentation).length

    if (dryRun) {
      return {
        dry_run: true,
        project_id: projectId,
        model,
        total_to_document: totalToDocument,
        page_offset: pageOffset,
        page_limit: pageLimit,
        page_chunks: pageChunks.length,
        chunk_names: pageChunks.map(c => c.data?.chunk_name || c.title),
      }
    }

    
    
    const results: Array<{ chunk: any; fields: Record<string, string> | null; is_fallback?: boolean; error?: string }> = []

    for (let i = 0; i < allToDocument.length; i += concurrency) {
      const subBatch = allToDocument.slice(i, i + concurrency)
      const subResults = await Promise.all(subBatch.map(async chunk => {
        const d = chunk.data || {}
        if (!d.code_content && !d.chunk_name) {
          const ref = d.stable_id || d.chunk_name || chunk.id
          return { chunk, fields: null, error: `No code content: ${ref}` }
        }
        const prompt = buildDocPrompt(chunk)
        try {
          const raw = await callLLM(prompt, model)
          const rawFields = parseDocResponse(raw)
          const hadLlmFields = hasMeaningfulLlmFields(rawFields)
          
          
          const fields = normalizeDocFields(rawFields, chunk)
          return { chunk, fields, is_fallback: !hadLlmFields, error: undefined }
        } catch (err) {
          
          const fields = normalizeDocFields({}, chunk)
          return { chunk, fields, is_fallback: true, error: undefined }
        }
      }))
      results.push(...subResults)
    }

    
    let documented = 0, validated = 0, skipped = 0, failed = 0
    const errors: string[] = []
    const updatedChunks: any[] = []

    await Promise.all(results.map(async ({ chunk, fields, is_fallback, error: llmError }) => {
      if (!fields) {
        if (llmError) { failed++; errors.push(`${chunk.data?.stable_id || chunk.data?.chunk_name || chunk.id}: ${llmError}`) }
        else skipped++
        return
      }
      const d = chunk.data || {}
      const toWrite: Record<string, string> = {}
      for (const [k, v] of Object.entries(fields)) {
        if (force || !d[k]) toWrite[k] = v
      }
      if (!Object.keys(toWrite).length) { skipped++; return }

      const updatedData = { ...d, ...toWrite, doc_confidence: 'ai_generated', doc_fallback: !!is_fallback }
      const updatedChunk = { ...chunk, data: updatedData }

      
      const validationErrors = validateChunkDocs(updatedChunk)
      const chunkUpdateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: chunk.id } }
      if (validationErrors.length > 0) {
        failed++
        errors.push(`${chunk.data?.stable_id || chunk.data?.chunk_name || chunk.id}: ${validationErrors.join(', ')}`)
        await adminUpdate(chunkUpdateCtx, { data: { ...updatedData, doc_validation_errors: validationErrors } })
          .catch(() => { /* non-fatal — don't mask original validation error */ })
        return
      }

      try {
        await adminUpdate(chunkUpdateCtx, { data: updatedData })
      } catch (updateError: any) {
        failed++; errors.push(`${chunk.data?.stable_id || chunk.data?.chunk_name || chunk.id}: ${updateError.message}`)
        return
      }
      {
        documented++; validated++; updatedChunks.push(updatedChunk)
      }
    }))

    
    
    if (updatedChunks.length > 0) {
      const { data: projectItem } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
      const repoPath = projectItem?.data?.repo_path || ''
      if (repoPath) {
        const byFile = new Map<string, any[]>()
        for (const chunk of updatedChunks) {
          const relPath = chunk.data?.file_path
          if (!relPath) continue
          if (!byFile.has(relPath)) byFile.set(relPath, [])
          byFile.get(relPath)!.push(chunk)
        }
        for (const [relPath, chunks] of byFile) {
          const absPath = path.join(repoPath, relPath)
          if (!fs.existsSync(absPath)) continue
          const content = fs.readFileSync(absPath, 'utf-8')
          const fileLines = content.split('\n')
          const newLines = [...fileLines]
          
          
          
          const markerMap = findChunkStartMarkers(newLines)
          
          
          const sorted = [...chunks]
            .map(c => ({ chunk: c, markerIdx: markerMap.get((c.data?.chunk_name || c.title).trim().toLowerCase()) }))
            .filter((item): item is { chunk: any; markerIdx: number } => item.markerIdx !== undefined)
            .sort((a, b) => b.markerIdx - a.markerIdx)
          const missed = chunks
            .filter(c => markerMap.get((c.data?.chunk_name || c.title).trim().toLowerCase()) === undefined)
            .map(c => c.data?.stable_id || c.data?.chunk_name || c.title)
          if (missed.length > 0) {
            errors.push(`Write-back: could not find markers for ${missed.join(', ')} in ${relPath}`)
          }
          for (const { chunk, markerIdx } of sorted) {
            const jsDoc = buildJsDoc(chunk)
            if (!jsDoc) {
              errors.push(`Write-back: no JSDoc built for ${chunk.data?.stable_id || chunk.data?.chunk_name || chunk.title}`)
              continue
            }
            const existing = findExistingCilJsDoc(newLines, markerIdx)
            if (existing) {
              newLines.splice(existing.start, existing.end - existing.start + 1, jsDoc)
            } else {
              
              newLines.splice(markerIdx + 1, 0, jsDoc)
            }
          }
          fs.writeFileSync(absPath, newLines.join('\n'), 'utf-8')
        }
      }
    }

    
    const affectedFileIds = [...new Set((force ? pageChunks : allToDocument).map(c => c.data?.file_id).filter(Boolean))]
    for (const fileId of affectedFileIds) {
      await maybeAdvanceFileToPass3(ctx, fileId, fileTree)
    }
    if (fileTree) {
      await saveProjectTree(ctx, projectId, fileTree, { last_ingested_at: new Date().toISOString() })
    }

    
    const nextOffset = pageOffset + pageLimit
    const isLastPage = nextOffset >= totalChunks
    if (isLastPage && documented > 0) {
      const { data: projectItem } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
      if (projectItem) {
        const prices = MODEL_PRICES[model] || MODEL_PRICES[DEFAULT_MODEL]
        const approxCost = (documented * (ESTIMATED_OUTPUT_TOKENS_PER_CHUNK + 800) / 1_000_000) * ((prices.input_per_1m + prices.output_per_1m) / 2)
        const projUpdateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: projectId } }
        await adminUpdate(projUpdateCtx, {
          data: { ...projectItem.data, total_ingestion_cost_usd: (projectItem.data?.total_ingestion_cost_usd || 0) + approxCost, last_ingested_at: new Date().toISOString() },
        }).catch(() => { /* non-fatal */ })
      }
    }

    return {
      project_id: projectId,
      model,
      total_to_document: totalToDocument,
      total_chunks: totalChunks,
      page_offset: pageOffset,
      page_limit: pageLimit,
      documented,
      validated,
      skipped,
      failed,
      errors: errors.slice(0, 20),
      
      has_more: nextOffset < totalChunks,
      next_offset: nextOffset < totalChunks ? nextOffset : null,
      done_total: pageOffset + pageChunks.length,
    }
  }

  throw new Error(`Unknown action: ${action}. Valid: estimate, gap_report, document, doc_chunk, validate`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Netlify handler that dispatches documentation-related HTTP actions.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-doc.ts:handler:constant"]



