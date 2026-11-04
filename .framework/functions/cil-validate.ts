// CIL[BEGIN stable_id="~/.framework/functions/cil-validate.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-validate.ts"]
// CIL[DOC-MACRO purpose="Netlify function endpoint for validating and updating CIL chunk content hashes"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose HTTP actions to verify chunk drift, compute hashes, update stored hashes, and validate source files"]
// CIL[DOC-CONTEXT module="cil-validate" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="HTTP request with action query and JSON body" outputs="JSON validation summary, hash value, or updated hash record" errors="Missing required fields, unknown action, chunk not found, file not found, missing repo_path" side_effects="Queries and updates the adminDb items table, reads source files from disk"]
// CIL[DOC-MICRO logic_summary="Dispatches to validate, update_hash, compute_hash, or validate_file actions and returns structured results" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system-maintainers"]


import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { computeContentHash } from './_shared/cil'
import * as fs from 'fs'
import * as path from 'path'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function endpoint for validating and updating CIL chunk content hashes'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-validate.ts:module_header:module_header"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-validate.ts:ChunkToValidate:interface" type="interface" identity="ChunkToValidate" parent="~/.framework/functions/cil-validate.ts"]
// CIL[DOC-MACRO purpose="Shape of a chunk reference used in validation requests"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the type contract for chunks submitted to the validate action"]
// CIL[DOC-CONTEXT module="cil-validate" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-validate.ts"]
// CIL[DOC-CONTRACT inputs="raw JSON with optional chunk_id, stable_id, version_id, required chunk_name, and content" outputs="typed ChunkToValidate interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface with optional identifiers and required chunk_name and content fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ChunkToValidate {
  chunk_id?: string
  chunk_name: string
  content: string
  stable_id?: string
  version_id?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Shape of a chunk reference used in validation requests'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-validate.ts:ChunkToValidate:interface"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-validate.ts:ValidationResult:interface" type="interface" identity="ValidationResult" parent="~/.framework/functions/cil-validate.ts"]
// CIL[DOC-MACRO purpose="Shape of the result returned for a validated chunk"]
// CIL[DOC-RESPONSIBILITY responsibility="Report whether a chunk is current, drifted, or not found"]
// CIL[DOC-CONTEXT module="cil-validate" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-validate.ts"]
// CIL[DOC-CONTRACT inputs="chunk metadata, stored and computed hashes, and status message" outputs="typed ValidationResult interface" errors="none" side_effects="none"]
  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface describing validation outcome fields" notable_decisions="[]"]
interface ValidationResult {
  chunk_id: string
  stable_id: string | null
  chunk_name: string
  status: 'current' | 'drift_detected' | 'not_found'
  stored_hash: string | null
  validation_hash: string
  message: string
}
// CIL[END stable_id="~/.framework/functions/cil-validate.ts:ValidationResult:interface"]


// CIL[DOC-VECTOR type="context" content="purpose='Shape of the result returned for a validated chunk'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]



// CIL[BEGIN stable_id="~/.framework/functions/cil-validate.ts:ValidateRequest:interface" type="interface" identity="ValidateRequest" parent="~/.framework/functions/cil-validate.ts"]
// CIL[DOC-MACRO purpose="Shape of a batch chunk validation request"]
// CIL[DOC-RESPONSIBILITY responsibility="Collect optional file path and an array of chunks to validate"]
// CIL[DOC-CONTEXT module="cil-validate" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-validate.ts"]
// CIL[DOC-CONTRACT inputs="optional file_path and chunks array" outputs="typed ValidateRequest interface" errors="none" side_effects="none"]
  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface with optional file_path and required chunks array" notable_decisions="[]"]
interface ValidateRequest {
  file_path?: string
  chunks: ChunkToValidate[]
}
// CIL[END stable_id="~/.framework/functions/cil-validate.ts:ValidateRequest:interface"]

// CIL[DOC-VECTOR type="context" content="purpose='Shape of a batch chunk validation request'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]




// CIL[BEGIN stable_id="~/.framework/functions/cil-validate.ts:UpdateHashRequest:interface" type="interface" identity="UpdateHashRequest" parent="~/.framework/functions/cil-validate.ts"]
// CIL[DOC-MACRO purpose="Shape of a request to update a stored content hash"]
// CIL[DOC-RESPONSIBILITY responsibility="Identify a chunk by stable_id or chunk_id and provide new content"]
// CIL[DOC-CONTEXT module="cil-validate" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-validate.ts"]
// CIL[DOC-CONTRACT inputs="optional chunk_id, stable_id, version_id and required content" outputs="typed UpdateHashRequest interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface with optional identifiers and required content field" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UpdateHashRequest {
  chunk_id?: string
  stable_id?: string
  version_id?: string
  content: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Shape of a request to update a stored content hash'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-validate.ts:UpdateHashRequest:interface"]








// CIL[BEGIN stable_id="~/.framework/functions/cil-validate.ts:computeHash:function" type="function" identity="computeHash" parent="~/.framework/functions/cil-validate.ts"]
// CIL[DOC-MACRO purpose="Compute the stored content hash for a given string"]
// CIL[DOC-RESPONSIBILITY responsibility="Delegate to the shared computeContentHash implementation"]
// CIL[DOC-CONTEXT module="cil-validate" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-validate.ts"]
// CIL[DOC-CONTRACT inputs="content string" outputs="hash string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Thin wrapper around computeContentHash from _shared/cil" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function computeHash(content: string): string {
  return computeContentHash(content)
}
// CIL[DOC-VECTOR type="context" content="purpose='Compute the stored content hash for a given string'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-validate.ts:computeHash:function"]








// CIL[BEGIN stable_id="~/.framework/functions/cil-validate.ts:resolveChunk:function" type="function" identity="resolveChunk" parent="~/.framework/functions/cil-validate.ts"]
// CIL[DOC-MACRO purpose="Resolve a chunk record from the graph by stable_id, version_id, or chunk_id"]
// CIL[DOC-RESPONSIBILITY responsibility="Look up the active chunk record and fallback through versioned and legacy identifiers"]
// CIL[DOC-CONTEXT module="cil-validate" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-validate.ts"]
// CIL[DOC-CONTRACT inputs="input: object with optional chunk_id, stable_id, and version_id" outputs="item id and data or null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Query adminDb by stable_id/version, fallback to active version via project, then chunk_id" notable_decisions="[]"]
// CIL[DOC-NOTE type="parameter" content="input: object containing optional chunk_id, stable_id, and version_id"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function resolveChunk(
  input: { chunk_id?: string; stable_id?: string; version_id?: string }
): Promise<{ id: string; data: any } | null> {
  if (input.stable_id) {
    if (input.version_id) {
      const { data: item } = await adminDb
        .from('items')
        .select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>stable_id', 'eq', input.stable_id)
        .filter('data->>version_id', 'eq', input.version_id)
        .maybeSingle()
      if (item) return item
    } else {
      const { data: candidates } = await adminDb
        .from('items')
        .select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>stable_id', 'eq', input.stable_id)
        .limit(1)
      const candidate = candidates?.[0]
      if (candidate?.data?.project_id) {
        const { data: project } = await adminDb
          .from('items')
          .select('id, data')
          .eq('id', candidate.data.project_id)
          .maybeSingle()
        const activeVersionId = project?.data?.active_version_id
        if (activeVersionId) {
          const { data: item } = await adminDb
            .from('items')
            .select('id, data')
            .filter('data->>kb_type', 'eq', 'cil_chunk')
            .filter('data->>stable_id', 'eq', input.stable_id)
            .filter('data->>version_id', 'eq', activeVersionId)
            .maybeSingle()
          if (item) return item
        }
      }
      if (candidate) return candidate
    }
  }

  if (input.chunk_id) {
    const { data: item } = await adminDb
      .from('items')
      .select('id, data')
      .eq('id', input.chunk_id)
      .maybeSingle()
    if (item) return item
  }

  return null
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a chunk record from the graph by stable_id, version_id, or chunk_id'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-validate.ts:resolveChunk:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-validate.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-validate.ts"]
// CIL[DOC-MACRO purpose="Netlify function handler that dispatches CIL validation actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Handle validate, update_hash, compute_hash, and validate_file HTTP actions"]
// CIL[DOC-CONTEXT module="cil-validate" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-validate.ts"]
// CIL[DOC-CONTRACT inputs="HTTP context and parsed request body" outputs="JSON response" errors="Validation or action errors" side_effects="Reads files, queries and updates adminDb"]
// CIL[DOC-MICRO logic_summary="Switch on action, validate inputs, process chunks or files, and return summary" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  // CIL is operator tooling — every action touches the service-role client
  // and server filesystem. System principals only; tenant callers stop here.
  requireSystemContextWithAudit(ctx)

  const action = ctx.query?.action

  
  if (action === 'validate' || !action) {
    const req = body as ValidateRequest
    if (!req?.chunks || !Array.isArray(req.chunks)) {
      throw new Error('chunks array is required')
    }

    const results: ValidationResult[] = []

    for (const chunk of req.chunks) {
      const validationHash = computeHash(chunk.content)

      const item = await resolveChunk(chunk)

      if (!item) {
        results.push({
          chunk_id: chunk.chunk_id || chunk.stable_id || '',
          stable_id: chunk.stable_id || null,
          chunk_name: chunk.chunk_name,
          status: 'not_found',
          stored_hash: null,
          validation_hash: validationHash,
          message: 'Chunk not found in graph — needs ingestion',
        })
        continue
      }

      const storedHash: string | null = item.data?.content_hash || item.data?.stored_hash || null

      if (!storedHash) {
        results.push({
          chunk_id: item.id,
          stable_id: item.data?.stable_id || null,
          chunk_name: chunk.chunk_name,
          status: 'drift_detected',
          stored_hash: null,
          validation_hash: validationHash,
          message: 'No stored hash — chunk has never been hash-verified',
        })
        continue
      }

      const status: 'current' | 'drift_detected' =
        storedHash === validationHash ? 'current' : 'drift_detected'

      results.push({
        chunk_id: item.id,
        stable_id: item.data?.stable_id || null,
        chunk_name: chunk.chunk_name,
        status,
        stored_hash: storedHash,
        validation_hash: validationHash,
        message: status === 'current'
          ? 'Embedding is current — content matches stored hash'
          : 'Content has drifted since last ingestion — re-ingest required before trusting contract',
      })
    }

    const driftCount = results.filter(r => r.status === 'drift_detected').length
    const currentCount = results.filter(r => r.status === 'current').length

    return {
      file_path: req.file_path || null,
      results,
      summary: {
        total: results.length,
        current: currentCount,
        drift_detected: driftCount,
        not_found: results.filter(r => r.status === 'not_found').length,
        trust_rating: results.length > 0 ? Math.round((currentCount / results.length) * 100) : 0,
      }
    }
  }

  
  if (action === 'update_hash') {
    const req = body as UpdateHashRequest
    if (!req?.chunk_id && !req?.stable_id) throw new Error('chunk_id or stable_id is required')
    if (!req?.content) throw new Error('content is required')

    const newHash = computeHash(req.content)

    const item = await resolveChunk(req)

    if (!item) throw new Error(`Chunk not found: ${req.chunk_id || req.stable_id}`)

    const { error } = await adminDb
      .from('items')
      .update({
        data: { ...item.data, content_hash: newHash, stored_hash: newHash, hash_updated_at: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (error) throw new Error(`Failed to update hash: ${error.message}`)

    return {
      chunk_id: item.id,
      new_hash: newHash,
      updated_at: new Date().toISOString(),
    }
  }

  
  if (action === 'compute_hash') {
    const content = body?.content
    if (!content) throw new Error('content is required')
    return { hash: computeHash(content) }
  }

  
  
  
  
  
  
  
  if (action === 'validate_file') {
    const fileId = ctx.query?.file_id || body?.file_id
    const repoPathOverride: string | null = ctx.query?.repo_path || body?.repo_path || null

    if (!fileId) throw new Error('file_id is required')

    
    const { data: fileItem } = await adminDb
      .from('items')
      .select('id, title, data')
      .eq('id', fileId)
      .maybeSingle()

    if (!fileItem) throw new Error(`File not found: ${fileId}`)

    const filePath: string = fileItem.data?.file_path || fileItem.title
    const projectId: string = fileItem.data?.project_id

    
    let repoPath = repoPathOverride
    if (!repoPath && projectId) {
      const { data: project } = await adminDb
        .from('items')
        .select('data')
        .eq('id', projectId)
        .maybeSingle()
      repoPath = project?.data?.repo_path || null
    }

    if (!repoPath) throw new Error('Could not determine repo_path. Pass repo_path in request body or ensure project has repo_path set.')

    const absPath = path.join(repoPath, filePath)
    if (!fs.existsSync(absPath)) {
      throw new Error(`Source file not found on disk: ${absPath}`)
    }

    const content = fs.readFileSync(absPath, 'utf-8')
    const lines = content.split('\n')

    
    const { data: chunks } = await adminDb
      .from('items')
      .select('id, data')
      .filter('data->>file_id', 'eq', fileId)
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .eq('is_active', true)

    if (!chunks?.length) {
      return {
        file_id: fileId,
        file_path: filePath,
        results: [],
        summary: { total: 0, current: 0, drift_detected: 0, not_found: 0, trust_rating: 100 },
      }
    }

    const results: ValidationResult[] = []

    for (const chunk of chunks) {
      const d = chunk.data || {}
      const lineStart: number = d.line_start || 0
      const lineEnd: number = d.line_end || 0
      const chunkName: string = d.chunk_name || ''
      const storedHash: string | null = d.content_hash || d.stored_hash || null

      if (!lineStart || !lineEnd) {
        results.push({
          chunk_id: chunk.id,
          stable_id: d.stable_id || null,
          chunk_name: chunkName,
          status: 'not_found',
          stored_hash: storedHash,
          validation_hash: '',
          message: 'Chunk has no line_start / line_end — cannot extract from file',
        })
        continue
      }

      
      const chunkLines = lines.slice(lineStart - 1, lineEnd)
      const liveContent = chunkLines.join('\n')
      const validationHash = computeHash(liveContent)

      if (!storedHash) {
        results.push({
          chunk_id: chunk.id,
          stable_id: d.stable_id || null,
          chunk_name: chunkName,
          status: 'drift_detected',
          stored_hash: null,
          validation_hash: validationHash,
          message: 'No stored hash — chunk has never been hash-verified',
        })
        continue
      }

      const status: 'current' | 'drift_detected' = storedHash === validationHash ? 'current' : 'drift_detected'
      results.push({
        chunk_id: chunk.id,
        stable_id: d.stable_id || null,
        chunk_name: chunkName,
        status,
        stored_hash: storedHash,
        validation_hash: validationHash,
        message: status === 'current'
          ? 'Content matches stored hash'
          : 'Content has drifted since last ingestion — re-ingest required',
      })
    }

    const currentCount = results.filter(r => r.status === 'current').length
    const driftCount = results.filter(r => r.status === 'drift_detected').length

    return {
      file_id: fileId,
      file_path: filePath,
      repo_path: repoPath,
      results,
      summary: {
        total: results.length,
        current: currentCount,
        drift_detected: driftCount,
        not_found: results.filter(r => r.status === 'not_found').length,
        trust_rating: results.length > 0 ? Math.round((currentCount / results.length) * 100) : 0,
      },
    }
  }

  throw new Error(`Unknown action: ${action}. Valid: validate, validate_file, update_hash, compute_hash`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function handler that dispatches CIL validation actions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-validate.ts:handler:constant"]


