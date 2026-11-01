// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/ingest.ts:mcp_ingest_tools:file" type="file" identity="mcp_ingest_tools" parent="~/.framework/mcp/tools/cil/ingest.ts"]
// CIL[DOC-MACRO purpose="Register all CIL ingest, discovery, chunking, embedding, mapping, and pipeline orchestration MCP tools on a shared McpServer"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the MCP-facing surface for CIL ingestion, embedding, mapping, and pipeline orchestration"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="mcp-tools" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/ingest.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance, raw chunk content strings" outputs="Registered tool handlers" errors="Database and function call failures" side_effects="Registers handlers on McpServer; reads/writes CIL project, chunk, and file records"]
// CIL[DOC-MICRO logic_summary="Binds one handler per CIL tool, delegating to adminDb, fetchFunction, and helpers for chunking, embedding, mapping, and pipeline steps" notable_decisions="Uses helper normaliseAgentChunkContent for chunk hashing; pipeline steps 3-8 dispatch to cil-doc, cil-embeddings, cil-callmap, and cil-config functions"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb, resolveLinkTypeId, resolveTypeId, fetchFunction } from '../../shared/db.js'
import { handler as callmapHandler } from '../../../functions/cil-callmap.js'
import { SYSTEM_PRINCIPAL } from '../../../functions/_shared/principal.js'
import { adminDb as functionsAdminDb } from '../../../functions/_shared/db.js'
import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { computeContentHash, isSelectedPath } from '../../../functions/_shared/cil.js'

function normaliseAgentChunkContent(raw: string): string {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const filtered = lines.filter(line => {
    const trimmed = line.trim()
    return !trimmed.match(/^(?:(?:\/\/|--|#)\s*|<!--\s*)CIL\[(BEGIN|END)/) && !trimmed.match(/^(?:(?:\/\/|--|#)\s*|<!--\s*)CIL\[DOC-/)
  })
  const collapsed: string[] = []
  let lastBlank = false
  for (const line of filtered) {
    const isBlank = line.trim() === ''
    if (isBlank && lastBlank) continue
    collapsed.push(line)
    lastBlank = isBlank
  }
  return collapsed.join('\n').trim()
}

function computeChunkHash(content: string): string {
  return crypto.createHash('sha256').update(normaliseAgentChunkContent(content), 'utf8').digest('hex').slice(0, 16)
}

function computeFileHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

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

async function callCallmapMapProject(
  accountId: string,
  project_id: string,
  file_path: string | undefined,
  force_regenerate: boolean,
  fast: boolean,
  limit: number,
  offset: number
): Promise<any> {
  const event = {
    requestId: crypto.randomUUID(),
    principal: {
      ...SYSTEM_PRINCIPAL,
      accountId,
      provenance: { sourceType: 'mcp', createdBy: null, invokedAt: new Date().toISOString() },
    },
    db: functionsAdminDb,
    accountId,
    appId: null,
    query: { action: 'map_project', method: 'POST' },
    httpMethod: 'POST',
    headers: { 'Content-Type': 'application/json' },
    requestPath: '/.netlify/functions/cil-callmap',
    path: '/.netlify/functions/cil-callmap',
    source: 'spine-framework-mcp',
    trace: {},
    body: null,
  } as any
  const body = {
    project_id,
    file_path,
    force_regenerate,
    fast,
    limit,
    offset,
  }
  return callmapHandler(event, body)
}

export function register(server: McpServer) {

  server.registerTool(
    'spine_cil_detect_changes',
    {
      description: `Detect which selected files have drifted since their last ingestion by comparing per-chunk hashes on disk to stored hashes.
Returns three lists: drifted (file changed — re-run spine_cil_store_markers), missing (file deleted or renamed — run spine_cil_mark_dead), current (no changes).
Run this before starting an incremental ingestion pass to build an accurate work queue.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
      }),
    },
    async ({ project_id }) => {
      const { data: projectRows } = await adminDb.from('items').select('data')
        .filter('data->>kb_type', 'eq', 'cil_project')
        .filter('id', 'eq', project_id)
        .eq('is_active', true)

      const project = (projectRows || [])[0]

      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const repoPath: string = project.data?.repo_path || ''

      if (!repoPath) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Project has no repo_path' }) }] }
      }

      const selectedPaths: string[] = project.data?.selected_paths || []

      if (selectedPaths.length === 0) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, project_id, drifted: [], missing: [], current: [], message: 'No selected_paths on project' }) }] }
      }

      const activeVersionId = project.data?.active_version_id



      // PostgREST caps responses (server max-rows, often below the requested
      // range); active chunk counts exceed it, so page with a stable order and
      // advance by the rows actually returned — otherwise files outside the
      // first page are falsely reported as drifted with total_chunks = 0.
      const chunks: any[] = []
      const CHUNK_PAGE = 1000
      for (let offset = 0; ; ) {
        let pageQuery = adminDb.from('items').select('id, data')
          .filter('data->>kb_type', 'eq', 'cil_chunk')
          .filter('data->>project_id', 'eq', project_id)
          .eq('is_active', true)
          .order('id')
          .range(offset, offset + CHUNK_PAGE - 1)

        if (activeVersionId) {
          pageQuery = pageQuery.filter('data->>version_id', 'eq', activeVersionId)
        }

        const { data: pageRows } = await pageQuery
        if (!pageRows || pageRows.length === 0) break
        chunks.push(...pageRows)
        offset += pageRows.length
      }

      const chunksByFile: Record<string, any[]> = {}

      for (const c of chunks || []) {

        const fp = c.data?.file_path

        if (fp) {
          if (!chunksByFile[fp]) chunksByFile[fp] = []
          chunksByFile[fp].push(c)
        }

      }

      const drifted: { file_path: string; drifted_chunks: number; total_chunks: number; drifted_chunk_ids?: string[] }[] = []

      const missing: { file_path: string; reason: string }[] = []

      const current: { file_path: string; chunk_count: number }[] = []

      for (const filePath of selectedPaths) {

        const absolutePath = path.join(repoPath, filePath.replace(/^\//, ''))

        const fileChunks = chunksByFile[filePath] || []

        if (!fs.existsSync(absolutePath)) {
          missing.push({ file_path: filePath, reason: 'file not found on disk' })
          continue
        }

        if (fileChunks.length === 0) {
          drifted.push({ file_path: filePath, drifted_chunks: 0, total_chunks: 0 })
          continue
        }

        const fileContent = fs.readFileSync(absolutePath, 'utf-8')

        const lines = fileContent.split('\n')



        let driftCount = 0


        const driftedStableIds: string[] = []

        for (const chunk of fileChunks) {

          const cd = chunk.data || {}

          const lineStart = (cd.line_start || 1) - 1

          const lineEnd = (cd.line_end || 1) - 1

          if (lineEnd >= lines.length) {
            driftCount++
            driftedStableIds.push(cd.stable_id || cd.legacy_chunk_id || cd.chunk_id || chunk.id)
            continue
          }

          const extracted = lines.slice(lineStart, lineEnd + 1).join('\n')

          const computed = cd.content_hash ? computeContentHash(extracted) : computeChunkHash(extracted)

          const storedHash = cd.content_hash || cd.stored_hash

          if (computed !== storedHash) {
            driftCount++
            driftedStableIds.push(cd.stable_id || cd.legacy_chunk_id || cd.chunk_id || chunk.id)
          }

        }


        if (driftCount > 0) {
          drifted.push({ file_path: filePath, drifted_chunks: driftCount, total_chunks: fileChunks.length, drifted_chunk_ids: driftedStableIds })
        } else {
          current.push({ file_path: filePath, chunk_count: fileChunks.length })
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            project_id,
            summary: { drifted: drifted.length, missing: missing.length, current: current.length },
            drifted,
            missing,
            current,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_discover',
    {
      description: 'Discover source files for a CIL project by walking repo_path with its configured globs and exclude_globs. Creates cil_file records with status 0-discovered and updates the project file_tree.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().optional().describe('Optional single path or glob to discover within the project'),
      }),
    },
    async ({ project_id, file_path }) => {
      try {
        const result = await fetchFunction('cil-ingest', 'discover', {}, { project_id, file_path })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, ...result }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_mark_dead',
    {
      description: `Mark all chunks for a given file_path as inactive (is_active: false).
Use this when a file has been deleted or renamed and its chunks should be retired from the index.
For renames: first call spine_cil_store_markers on the new path to create fresh chunks, then call spine_cil_mark_dead on the old path.
IMPORTANT: this is irreversible via the MCP — deleted chunks cannot be restored without re-running spine_cil_store_markers.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('Relative file path from repo root whose chunks should be marked inactive'),
        reason: z.string().optional().describe('Optional reason for marking dead, e.g. "file deleted", "file renamed to X"'),
      }),
    },
    async ({ project_id, file_path, reason }) => {
      const { data: chunks } = await adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .filter('data->>file_path', 'eq', file_path)
        .eq('is_active', true)
        .limit(1000)

      if (!chunks || chunks.length === 0) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, project_id, file_path, marked_inactive: 0, message: 'No active chunks found for this file' }) }] }
      }

      const now = new Date().toISOString()

      const errors: string[] = []



      let marked = 0


      for (const chunk of chunks) {

        const newData = { ...chunk.data, is_dead_code: true, dead_reason: reason || 'marked via spine_cil_mark_dead', dead_at: now }

        const { error: updateError } = await adminDb.from('items')
          .update({ is_active: false, data: newData, updated_at: now })
          .eq('id', chunk.id)
        if (updateError) errors.push(`${chunk.id}: ${updateError.message}`)
        else marked++
      }


      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: errors.length === 0,
            project_id,
            file_path,
            marked_inactive: marked,
            reason: reason || 'not specified',
            errors: errors.length > 0 ? errors : undefined,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_generate_embeddings',
    {
      description: `DO NOT call this tool during the pipeline. Steps 6 and 9 (embed) are triggered by the user clicking the UI button — the server runs embeddings automatically and advances file_statuses.

This tool exists for direct/manual embedding outside the standard pipeline flow only. If you are running Steps 4, 5, or 8, use spine_cil_store_markers instead.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().optional().describe('Relative file path from repo root. If omitted, embeds all approved chunks in the project.'),
        force_regenerate: z.boolean().optional().describe('Force regeneration of existing embeddings'),
        batch_size: z.number().int().min(1).max(50).optional().describe('Batch size for embedding API calls'),
      }),
    },
    async ({ project_id, file_path, force_regenerate = false, batch_size = 20 }) => {
      
      const { data: project } = await adminDb.from('items').select('account_id, data')
        .eq('id', project_id).maybeSingle()
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const accountId = project.account_id

      if (!accountId) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Project has no account_id' }) }] }
      }



      let query = adminDb.from('items').select('id, title, account_id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)
        .limit(1000)


      if (file_path) {
        query = query.filter('data->>file_path', 'eq', file_path)
      }


      const { data: chunks, error: fetchError } = await query
      if (fetchError) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Failed to fetch chunks: ${fetchError.message}` }) }] }
      }

      if (!chunks || chunks.length === 0) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, message: 'No chunks found to embed', project_id, file_path, embedded_count: 0 }) }] }
      }

      const { embedChunk } = await import('../../../functions/cil-embeddings.ts')

      const results: any[] = []

      const errors: string[] = []

      for (const chunk of chunks) {
        try {

          const r = await embedChunk(chunk, accountId, force_regenerate)

          results.push({
            chunk_id: chunk.id,
            chunk_name: chunk.data?.chunk_name || '',
            created: r.created,
            skipped: r.skipped,
          })
          if (r.error) errors.push(`${chunk.id}: ${r.error}`)
        } catch (e: any) {
          errors.push(`${chunk.id}: ${e.message}`)
        }

      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: errors.length === 0,
            project_id,
            file_path: file_path || '(all files)',
            chunk_count: chunks.length,
            processed: results.length,
            errors: errors.length > 0 ? errors : undefined,
            results,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_generate_mappings',
    {
      description: `DO NOT call this tool during the pipeline. Steps 7 and 10 (map) are triggered by the user clicking the UI button — the server runs callgraph analysis automatically and advances file_statuses.

This tool exists for direct/manual mapping outside the standard pipeline flow only. If you are running Steps 4, 5, or 8, use spine_cil_store_markers instead.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().optional().describe('Limit mapping to a single file. If omitted, maps the whole project.'),
        force_regenerate: z.boolean().optional().describe('Force regeneration of existing links'),
        fast: z.boolean().optional().describe('Skip updating file_statuses and file_tree; only create links.'),
      }),
    },
    async ({ project_id, file_path, force_regenerate = false, fast = false }) => {
      
      const { data: project } = await adminDb.from('items').select('account_id, data')
        .eq('id', project_id).maybeSingle()
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const accountId = project.account_id

      if (!accountId) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Project has no account_id' }) }] }
      }



      let fileQuery = adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_file')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)


      if (file_path) {
        fileQuery = fileQuery.filter('data->>file_path', 'eq', file_path)
      }


      const { data: files, error: fileError } = await fileQuery
      if (fileError) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Failed to fetch files: ${fileError.message}` }) }] }
      }

      if (!files || files.length === 0) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, message: 'No files found to map', project_id, file_path, mapped_files: 0 }) }] }
      }

      const results: any[] = []

      const errors: string[] = []

      if (file_path) {
        const { data: fileItems } = await adminDb.from('items').select('id, title, data')
          .filter('data->>project_id', 'eq', project_id)
          .filter('data->>kb_type', 'eq', 'cil_file')
          .filter('data->>file_path', 'eq', file_path)
          .eq('is_active', true)
          .limit(1)

        const fileItem = (fileItems || [])[0]

        if (!fileItem) {
          return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `No cil_file for path: ${file_path}` }) }] }
        }

        let r: any = {}
        try {
          r = await callCallmapMapProject(accountId, project_id, file_path, force_regenerate, fast, 1, 0)
        } catch (err: any) {
          errors.push(`map_project(${file_path}): ${err?.message || String(err)}`)
        }

        results.push({
          file_path,
          file_id: fileItem.id,
          ...r,
        })
        if (r.errors) errors.push(...r.errors)
      } else {



        let offset = 0




        let hasMore = true


        while (hasMore) {

          let r: any = { files_processed: 0 }
          try {
            r = await callCallmapMapProject(accountId, project_id, undefined, force_regenerate, fast, 15, offset)
          } catch (err: any) {
            errors.push(`map_project(offset ${offset}): ${err?.message || String(err)}`)
            hasMore = false
            continue
          }

          results.push(r)
          if (r.errors) errors.push(...r.errors)
          hasMore = r.has_more === true
          offset = r.next_offset ?? offset + (r.files_processed || 0)
        }



      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: errors.length === 0,
            project_id,
            file_path: file_path || '(all files)',
            file_count: file_path ? 1 : results.reduce((sum, r) => sum + (r.files_processed || 0), 0),
            processed: file_path ? results.length : results.reduce((sum, r) => sum + (r.files_processed || 0), 0),
            errors: errors.length > 0 ? errors : undefined,
            results,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_get_pending_vectors',
    {
      description: `List all chunks that have vectors awaiting human-authored content (status="pending_human_input").
Used by the CIL UI to surface chunks needing human input for implementation_pattern and user_journey vectors.
Returns stable_id, version_id, chunk_name, file_path, and which vector types are pending for each chunk.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        vector_type: z.string().optional().describe('Filter to a specific vector type, e.g. "user_journey". If omitted, returns all pending.'),
      }),
    },
    async ({ project_id, vector_type }) => {
      const { data: chunks } = await adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)

      const pending = (chunks || [])
        .filter((c: any) => {
          const pendingList: string[] = c.data?.vectors_pending_human_review || []
          if (pendingList.length === 0) return false
          if (vector_type) return pendingList.includes(vector_type)
          return true
        })
        .map((c: any) => ({
          id: c.id,
          stable_id: c.data?.stable_id || '',
          version_id: c.data?.version_id || null,
          chunk_name: c.data?.chunk_name || '',
          file_path: c.data?.file_path || '',
          chunk_type: c.data?.chunk_type || '',
          macro: c.data?.macro || '',
          pending_vectors: vector_type
            ? [vector_type]
            : (c.data?.vectors_pending_human_review || []),
        }))

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            project_id,
            filter: vector_type || 'all',
            pending_count: pending.length,
            chunks: pending,
          }, null, 2),
        }],
      }

    }
  )

  server.registerTool(
    'spine_cil_set_vector_content',
    {
      description: `Store human-authored content for an implementation_pattern or user_journey vector on a chunk.

REQUIRED sequence — the file is always source of truth:
1. Update the DOC-VECTOR tag in the source file on disk first
2. Run spine_cil_store_markers to sync the file to the DB
3. THEN call this tool to mark the vector ready for embedding

Do NOT call this tool before updating the file — that would create DB/file drift.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        stable_id: z.string().describe('The stable_id of the chunk to update'),
        version_id: z.string().optional().describe('Optional version UUID to scope the lookup'),
        vector_type: z.string().describe('The vector type to update, e.g. "implementation_pattern", "user_journey"'),
        content: z.string().describe('The human-authored content for this vector'),
      }),
    },
    async ({ project_id, stable_id, version_id, vector_type, content }) => {

      const chunk = await getChunkByStableId(project_id, stable_id, version_id)

      if (!chunk) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Chunk not found: ${stable_id}` }) }] }
      }

      const cd = chunk.data || {}

      const vectorContent: Record<string, { content: string; status: string }> = { ...(cd.vector_content || {}) }

      vectorContent[vector_type] = { content, status: 'ready' }

      const pendingList: string[] = (cd.vectors_pending_human_review || []).filter((v: string) => v !== vector_type)

      const now = new Date().toISOString()

      const newData = {
        ...cd,
        vector_content: vectorContent,
        vectors_pending_human_review: pendingList,
        vector_content_updated_at: now,
      }

      const { error } = await adminDb.from('items')
        .update({ data: newData, updated_at: now })
        .eq('id', chunk.id)

      if (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: error.message }) }] }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            chunk_id: chunk.id,
            stable_id,
            vector_type,
            content_length: content.length,
            remaining_pending: pendingList,
            note: 'DB updated. Also update the DOC-VECTOR tag in the source file and re-run spine_cil_store_markers to keep file as source of truth.',
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_unmapped_files',
    {
      description: `List selected cil_file records for a CIL project that currently have no mapping links. A file is considered unmapped when neither the file id nor any of its chunk ids appear as source_id in links of type cil_imports, cil_calls, cil_exports, or cil_tested_by.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        limit: z.number().int().min(1).optional().describe('Maximum number of unmapped files to return (default 50)'),
      }),
    },
    async ({ project_id, limit = 50 }) => {
      const { data: projectRows } = await adminDb.from('items').select('data')
        .filter('data->>kb_type', 'eq', 'cil_project')
        .eq('id', project_id)
        .eq('is_active', true)
        .limit(1)

      const project = (projectRows || [])[0]

      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const selectedPaths: string[] = project.data?.selected_paths || []

      if (selectedPaths.length === 0) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, project_id, total_selected: 0, unmapped_count: 0, unmapped: [], message: 'No selected_paths on project' }) }] }
      }

      const { data: files, error: fileError } = await adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_file')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)
        .limit(100000)

      if (fileError) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Failed to fetch files: ${fileError.message}` }) }] }
      }

      const rawFiles = files || []

      const selectedFiles = rawFiles.filter((f: any) => isSelectedPath(f.data?.file_path || f.title || '', selectedPaths))

      const total_selected = selectedFiles.length

      if (total_selected === 0) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, project_id, total_selected: 0, unmapped_count: 0, unmapped: [] }) }] }
      }

      const { data: chunks, error: chunkError } = await adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)
        .limit(100000)

      if (chunkError) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Failed to fetch chunks: ${chunkError.message}` }) }] }
      }

      const chunksByFile: Record<string, any[]> = {}

      for (const c of chunks || []) {

        const fp = c.data?.file_path

        if (fp) {
          if (!chunksByFile[fp]) chunksByFile[fp] = []
          chunksByFile[fp].push(c)
        }

      }

      const linkTypeMap: Record<string, string> = {}

      for (const slug of ['cil_imports', 'cil_calls', 'cil_exports', 'cil_tested_by']) {
        try {
          linkTypeMap[slug] = await resolveLinkTypeId(slug)
        } catch {
          // ignore missing link types
        }

      }

      const linkTypeIds = Object.values(linkTypeMap).filter(Boolean)

      const allSourceIds: string[] = []

      for (const f of selectedFiles) {
        allSourceIds.push(f.id)

        const filePath = f.data?.file_path || f.title || ''

        for (const c of chunksByFile[filePath] || []) {
          allSourceIds.push(c.id)
        }

      }

      const linkCounts: Record<string, number> = {}

      const UUID_IN_LIMIT = 100

      if (linkTypeIds.length > 0 && allSourceIds.length > 0) {
        for (let i = 0; i < allSourceIds.length; i += UUID_IN_LIMIT) {

          const batch = allSourceIds.slice(i, i + UUID_IN_LIMIT)

          const { data: links, error: linkError } = await adminDb.from('links').select('id, link_type_id, source_id')
            .in('link_type_id', linkTypeIds)
            .in('source_id', batch)

          if (linkError) {
            return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Failed to fetch links: ${linkError.message}` }) }] }
          }

          for (const l of links || []) {
            linkCounts[l.source_id] = (linkCounts[l.source_id] || 0) + 1
          }
        }
      }

      const unmapped: { file_path: string; file_id: string; chunk_count: number; link_count: number }[] = []

      for (const f of selectedFiles) {

        const filePath = f.data?.file_path || f.title || ''

        const fileChunks = chunksByFile[filePath] || []



        let totalLinks = linkCounts[f.id] || 0


        for (const c of fileChunks) {
          totalLinks += linkCounts[c.id] || 0
        }


        if (totalLinks === 0) {
          unmapped.push({
            file_path: filePath,
            file_id: f.id,
            chunk_count: fileChunks.length,
            link_count: 0,
          })
        }
      }

      unmapped.sort((a, b) => a.file_path.localeCompare(b.file_path))

      const limited = unmapped.slice(0, limit)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            project_id,
            raw_file_count: rawFiles.length,
            selected_paths_count: selectedPaths.length,
            total_selected,
            unmapped_count: unmapped.length,
            limit,
            unmapped: limited,
          }, null, 2),
        }],
      }

    }
  )

  server.registerTool(
    'spine_cil_validate_chunking',
    {
      description: `Validate whether a source file's CIL markers still match the current AST. Returns not_chunked, valid, or needs_rechunk, plus marker agreement details. Use this before deciding to chunk or rechunk a file.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('Relative file path from repo root, e.g. ".framework/functions/cil-ingest.ts"'),
      }),
    },
    async ({ project_id, file_path }) => {
      try {

        const result = await fetchFunction('cil-ingest', 'validate_chunking', {}, { project_id, file_path })

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (e: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: e.message || String(e) }) }] }
      }

    }
  )

  async function getCilFileId(project_id: string, file_path: string) {
    const { data } = await adminDb
      .from('items')
      .select('id')
      .filter('data->>project_id', 'eq', project_id)
      .filter('data->>kb_type', 'eq', 'cil_file')
      .filter('data->>file_path', 'eq', file_path)
      .eq('is_active', true)
      .maybeSingle()
    if (!data) throw new Error(`No cil_file for path ${file_path}`)
    return data.id
  }

  const STEP_SOURCE_STATUS: Record<number, string> = {
    3: '2-chunked',
    4: '3-documented',
    5: '4-chunk-validated',
    6: '5-doc-validated',
    7: '6-enriched',
    8: '7-embedded-mapped',
  }

  async function findNextFileForStep(project_id: string, sourceStatus: string, selectedPaths: string[]) {
    const { data } = await adminDb
      .from('items')
      .select('id, data')
      .filter('data->>project_id', 'eq', project_id)
      .filter('data->>kb_type', 'eq', 'cil_file')
      .filter('data->>status', 'eq', sourceStatus)
      .eq('is_active', true)
    const ready = (data || [])
      .map((f: any) => f.data?.file_path || f.title)
      .filter((fp: string) => isSelectedPath(fp, selectedPaths))
      .sort((a: string, b: string) => a.localeCompare(b))
    return ready[0] || null
  }

  async function runPipelineStep(project_id: string, step: number, limit: number, file_path?: string, force_reprocess?: boolean) {
    const { data: projectRows } = await adminDb
      .from('items')
      .select('data')
      .filter('data->>kb_type', 'eq', 'cil_project')
      .eq('id', project_id)
      .maybeSingle()

    if (!projectRows) throw new Error('Project not found')
    const project = projectRows.data || {}
    const selectedPaths: string[] = project.selected_paths || []
    const stepCursors: Record<string, any> = project.step_cursors || {}

    if (step === 0 || step === 1 || step === 2) {
      return await fetchFunction('cil-ingest', 'step', {}, { project_id, step, limit, file_path, force_reprocess })
    }

    const sourceStatus = STEP_SOURCE_STATUS[step]
    if (!sourceStatus) throw new Error(`step ${step} is not supported`)

    const stepCursorsKey = String(step)
    const cursor = stepCursors[stepCursorsKey] || null
    const targetPath: string = file_path || (cursor && typeof cursor === 'object' ? cursor.file_path : '')
    const offset: number = cursor && typeof cursor === 'object' ? (cursor.offset || 0) : 0

    if (!targetPath) {
      if (step === 3) {
        file_path = ''
      } else {
        const nextPath = await findNextFileForStep(project_id, sourceStatus, selectedPaths)
        if (!nextPath) {
          return { ok: true, step, status: 'complete', processed: 0, has_more: false, message: 'No files ready for this step' }
        }
        file_path = nextPath
      }
    } else {
      file_path = targetPath
    }

    let result: any
    if (step === 3) {
      result = await fetchFunction('cil-doc', 'document', {}, { project_id, limit, offset })
    } else if (step === 4 || step === 7) {
      result = await fetchFunction('cil-embeddings', 'embed_approved', {}, { project_id, file_path, limit, offset, second_pass: step === 7 })
    } else if (step === 5 || step === 8) {
      const fileId = await getCilFileId(project_id, file_path)
      result = await fetchFunction('cil-callmap', 'map_file', {}, { project_id, file_id: fileId })
    } else if (step === 6) {
      const repoPath = project.repo_path
      if (!repoPath) throw new Error('Project has no repo_path')
      result = await fetchFunction('cil-config', 'run', {}, { project_id, repo_path, file_path })
    } else {
      throw new Error(`step ${step} is not supported`)
    }

    const hasMore = result?.has_more === true
    const nextOffset = hasMore ? (result?.next_offset ?? (offset + limit)) : 0
    const newCursor = hasMore ? { file_path, offset: nextOffset } : null

    const { data: projectAfter } = await adminDb
      .from('items')
      .select('data')
      .eq('id', project_id)
      .maybeSingle()

    if (projectAfter) {
      const now = new Date().toISOString()
      const newCursors = { ...stepCursors, [stepCursorsKey]: newCursor }
      await adminDb.from('items')
        .update({ data: { ...projectAfter.data, step_cursors: newCursors }, updated_at: now })
        .eq('id', project_id)
    }

    return {
      ok: true,
      step,
      file_path,
      status: hasMore ? 'in_progress' : 'in_progress',
      has_more: hasMore,
      next_offset: nextOffset,
      ...result,
    }
  }

  server.registerTool(
    'spine_cil_run_step',
    {
      description: `Run one unit of a CIL ingestion step (0-8). Steps 0-2 go through cil-ingest. Steps 3-8 dispatch to cil-doc, cil-embeddings, cil-callmap, or cil-config. For steps 3, 4, 7 the tool tracks page offset in project.data.step_cursors. Repeat calls until has_more is false and no more files are found.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        step: z.number().int().min(0).max(8).default(2).describe('Pipeline step number to run (0-8)'),
        limit: z.number().int().min(1).default(1).describe('Page/batch size for steps 3, 4, 7. Steps 2, 5, 6, 8 process one file per call.'),
        file_path: z.string().optional().describe('Optional specific file path to process; if omitted the next pending file is chosen from the cursor or the work queue'),
        force_reprocess: z.boolean().optional().default(false).describe('Force reprocessing even if the file has already been chunked (step 2)'),
      }),
    },
    async ({ project_id, step, limit, file_path, force_reprocess }) => {
      try {

        const result = await runPipelineStep(project_id, step, limit, file_path, force_reprocess)

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (e: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: e.message || String(e) }) }] }
      }

    }
  )

  server.registerTool(
    'spine_cil_get_project_items',
    {
      description: `List active CIL file and/or chunk records for a project, optionally filtered by kb_type and file_path. Optionally include the raw chunk source (code_content) when include_source is true. Use this to build the id map for manual mapping or to fetch all chunks for a file in one call.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        kb_type: z.enum(['cil_file', 'cil_chunk']).optional().describe('Filter by kb_type; omit to return both'),
        file_path: z.string().optional().describe('Filter by file_path'),
        chunk_name: z.string().optional().describe('Filter by chunk_name (exact match)'),
        include_source: z.boolean().optional().default(false).describe('Include the raw code_content for chunks; can be large'),
        limit: z.number().int().min(1).max(1000).optional().default(1000).describe('Maximum items to return (max 1000)'),
        offset: z.number().int().min(0).optional().default(0).describe('Pagination offset'),
      }),
    },
    async ({ project_id, kb_type, file_path, chunk_name, include_source = false, limit = 1000, offset = 0 }) => {
      const { data: project } = await adminDb.from('items').select('id, data, account_id')
        .filter('data->>kb_type', 'eq', 'cil_project')
        .eq('id', project_id)
        .maybeSingle()

      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const repoPath: string = project.data?.repo_path || ''
      const accountId: string = project.account_id || ''

      let q = adminDb.from('items').select('id, title, data')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)
        .order('id')
        .range(offset, offset + limit)

      if (kb_type) q = q.filter('data->>kb_type', 'eq', kb_type)
      if (file_path) q = q.filter('data->>file_path', 'eq', file_path)
      if (chunk_name) q = q.filter('data->>chunk_name', 'eq', chunk_name)

      const { data: rows, error } = await q

      if (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `DB query failed: ${error.message}` }) }] }
      }

      const hasMore = (rows || []).length > limit
      const pageRows = (rows || []).slice(0, limit)

      const items = pageRows.map((r: any) => {
        const cd = r.data || {}
        const out: any = {
          id: r.id,
          kb_type: cd.kb_type || '',
          file_path: cd.file_path || r.title || '',
          chunk_name: cd.chunk_name || '',
          stable_id: cd.stable_id || '',
          chunk_type: cd.chunk_type || '',
          line_start: cd.line_start || 0,
          line_end: cd.line_end || 0,
          macro: cd.macro || '',
          doc_confidence: cd.doc_confidence || '',
        }
        if (cd.kb_type === 'cil_chunk' && include_source) {
          if (cd.code_content) {
            out.code_content = cd.code_content
          } else if (repoPath && cd.file_path && cd.line_start && cd.line_end) {
            try {
              const abs = path.join(repoPath, cd.file_path.replace(/^\//, ''))
              const lines = fs.readFileSync(abs, 'utf-8').split('\n')
              const start = Math.max(0, (cd.line_start || 1) - 1)
              const end = Math.min(lines.length, cd.line_end || lines.length)
              out.code_content = lines.slice(start, end).join('\n')
            } catch {
              out.code_content = ''
            }
          } else {
            out.code_content = ''
          }
        }
        return out
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            project_id,
            account_id: accountId,
            repo_path: repoPath,
            kb_type: kb_type || null,
            file_path: file_path || null,
            include_source,
            limit,
            offset,
            returned: items.length,
            has_more: hasMore,
            next_offset: hasMore ? offset + limit : null,
            items,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_upsert_links',
    {
      description: `Batch upsert CIL mapping links (cil_calls, cil_imports, cil_exports) for a project. Provide source_id and target_id as CIL item UUIDs. If force is true, existing links for each source_id/link_type pair are cleared before inserting. Use this with spine_cil_get_project_items for manual, chunk-level mapping that does not wipe the whole graph.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        links: z.array(z.object({
          source_id: z.string().uuid(),
          source_type: z.enum(['cil_file', 'cil_chunk']),
          target_id: z.string().uuid(),
          target_type: z.enum(['cil_file', 'cil_chunk']),
          link_type: z.enum(['cil_calls', 'cil_imports', 'cil_exports', 'cil_tested_by']),
          metadata: z.record(z.any()).optional(),
        })).min(1).max(1000).describe('Links to create'),
        force: z.boolean().optional().default(false).describe('When true, delete existing links for each source_id/link_type before creating new ones'),
      }),
    },
    async ({ project_id, links, force = false }) => {
      const { data: project } = await adminDb.from('items').select('id, data, account_id')
        .filter('data->>kb_type', 'eq', 'cil_project')
        .eq('id', project_id)
        .maybeSingle()

      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const accountId: string = project.account_id || ''
      const linksTypeId = await resolveTypeId('link', 'link')

      const linkTypeIds: Record<string, string> = {}
      for (const slug of ['cil_calls', 'cil_imports', 'cil_exports', 'cil_tested_by']) {
        try {
          linkTypeIds[slug] = await resolveLinkTypeId(slug)
        } catch {
          // ignore missing link types
        }
      }

      const invalid = links.filter(l => !linkTypeIds[l.link_type])
      if (invalid.length > 0) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Some links use an unknown link type', invalid }, null, 2) }] }
      }

      if (force) {
        const linksByType: Record<string, string[]> = {}
        for (const l of links) {
          if (!linksByType[l.link_type]) linksByType[l.link_type] = []
          if (!linksByType[l.link_type].includes(l.source_id)) linksByType[l.link_type].push(l.source_id)
        }
        for (const [slug, ltId] of Object.entries(linkTypeIds)) {
          const sourceIds = linksByType[slug]
          if (!sourceIds || !ltId) continue
          for (let i = 0; i < sourceIds.length; i += 100) {
            await adminDb.from('links')
              .delete()
              .eq('link_type_id', ltId)
              .in('source_id', sourceIds.slice(i, i + 100))
          }
        }
      }

      const inserts = links.map((l: any) => ({
        type_id: linksTypeId,
        account_id: accountId,
        link_type_id: linkTypeIds[l.link_type],
        source_type: l.source_type,
        source_id: l.source_id,
        target_type: l.target_type,
        target_id: l.target_id,
        link_type: l.link_type,
        metadata: l.metadata || {},
      }))

      let created = 0
      for (const row of inserts) {
        const { data, error } = await adminDb.from('links').insert(row).select('id')
        if (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Insert failed: ${error.message}` }) }] }
        }
        if (data?.id) created++
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            project_id,
            requested: links.length,
            created,
            force,
          }, null, 2),
        }],
      }
    }
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Register all CIL ingest, discovery, chunking, embedding, mapping, and pipeline orchestration MCP tools on a shared McpServer'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/ingest.ts:mcp_ingest_tools:file"]
