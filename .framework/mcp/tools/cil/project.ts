// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/project.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-MACRO purpose="Module header for CIL project MCP tools, importing dependencies used for project lifecycle and version management"]
// CIL[DOC-RESPONSIBILITY responsibility="Import MCP server SDK, Zod, CIL pipeline utilities, and shared database helpers required by this tool module"]
// CIL[DOC-CONTEXT module="mcp/tools/cil/project" layer="mcp" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="" errors="" side_effects=""]
// CIL[DOC-MICRO logic_summary="Sets up the module imports and makes the register function available for MCP server wiring" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ai"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { PIPELINE_STATUS_RANK, pipelineRank } from '../../../functions/_shared/cil.js'
import { adminDb, fetchFunction } from '../../shared/db.js'
// CIL[DOC-VECTOR type="context" content="purpose='Module header for CIL project MCP tools, importing dependencies used for project lifecycle and version management'; No verified external callers; imports: .framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/project.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/project.ts:getCompletedSteps:function" type="function" identity="getCompletedSteps" parent="~/.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-MACRO purpose="Compute the list of completed pipeline step indices for a file based on its current status"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a file's pipeline status rank into the set of completed step numbers"]
// CIL[DOC-CONTEXT module="mcp/tools/cil/project" layer="mcp" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-CONTRACT inputs="file_path: string, fileStatuses: Record<string, string>" outputs="number[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Looks up the file status rank, caps it to the maximum rank, and returns a range of completed step numbers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getCompletedSteps(file_path: string, fileStatuses: Record<string, string>): number[] {
  const rank = pipelineRank(fileStatuses[file_path])
  const maxRank = Math.max(...Object.values(PIPELINE_STATUS_RANK))
  const capped = Math.min(rank, maxRank)
  const completed: number[] = []
  for (let i = 0; i <= capped; i++) completed.push(i)
  return completed
}
// CIL[DOC-VECTOR type="context" content="purpose='Compute the list of completed pipeline step indices for a file based on its current status'; No verified external callers; imports: .framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/project.ts:getCompletedSteps:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/project.ts:getReadySteps:function" type="function" identity="getReadySteps" parent="~/.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-MACRO purpose="Determine which pipeline steps are ready to be executed next"]
// CIL[DOC-RESPONSIBILITY responsibility="Return step numbers whose prerequisites are all completed but which are not yet completed"]
// CIL[DOC-CONTEXT module="mcp/tools/cil/project" layer="mcp" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-CONTRACT inputs="file_path: string, fileStatuses: Record<string, string>" outputs="number[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Iterates steps 0-8 and collects those not completed with all prerequisites fulfilled" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getReadySteps(file_path: string, fileStatuses: Record<string, string>): number[] {
  const completed = getCompletedSteps(file_path, fileStatuses)
  const ready: number[] = []
  for (let step = 0; step <= 8; step++) {
    const prerequisites = Array.from({ length: step }, (_, i) => i)
    if (!completed.includes(step) && prerequisites.every(p => completed.includes(p))) {
      ready.push(step)
    }
  }
  return ready
}
// CIL[DOC-VECTOR type="context" content="purpose='Determine which pipeline steps are ready to be executed next'; No verified external callers; imports: .framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/project.ts:getReadySteps:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/project.ts:getBlockedSteps:function" type="function" identity="getBlockedSteps" parent="~/.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-MACRO purpose="Identify pipeline steps that are neither completed nor ready to execute"]
// CIL[DOC-RESPONSIBILITY responsibility="Return step numbers that cannot yet be executed because prerequisites are missing"]
  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="mcp/tools/cil/project" layer="mcp" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-CONTRACT inputs="file_path: string, fileStatuses: Record<string, string>" outputs="number[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compares all steps 0-8 against completed and ready sets and returns the remainder" notable_decisions="[]"]
function getBlockedSteps(file_path: string, fileStatuses: Record<string, string>): number[] {
  const completed = getCompletedSteps(file_path, fileStatuses)
  const ready = getReadySteps(file_path, fileStatuses)
  const blocked: number[] = []
  for (let step = 0; step <= 8; step++) {
    if (!completed.includes(step) && !ready.includes(step)) blocked.push(step)
  }
  return blocked
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/project.ts:getBlockedSteps:function"]

// CIL[DOC-VECTOR type="context" content="purpose='Identify pipeline steps that are neither completed nor ready to execute'; No verified external callers; imports: .framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/project.ts:calculateProgress:function" type="function" identity="calculateProgress" parent="~/.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-MACRO purpose="Calculate a percentage progress value for a file based on its pipeline status rank"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a file's pipeline status rank into a 0-100 progress percentage"]
// CIL[DOC-CONTEXT module="mcp/tools/cil/project" layer="mcp" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-CONTRACT inputs="file_path: string, fileStatuses: Record<string, string>" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Divides the capped status rank by the maximum rank and rounds to the nearest integer" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function calculateProgress(file_path: string, fileStatuses: Record<string, string>): number {
  const rank = pipelineRank(fileStatuses[file_path])
  const maxRank = Math.max(...Object.values(PIPELINE_STATUS_RANK))
  return Math.round((Math.min(rank, maxRank) / maxRank) * 100)
}
// CIL[DOC-VECTOR type="context" content="purpose='Calculate a percentage progress value for a file based on its pipeline status rank'; No verified external callers; imports: .framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/project.ts:calculateProgress:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/project.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-MACRO purpose="Register CIL project management and version lifecycle tools on an MCP server"]
// CIL[DOC-RESPONSIBILITY responsibility="Bind MCP tool handlers for listing projects, reporting status, managing versions, and updating pipeline status"]
// CIL[DOC-CONTEXT module="mcp/tools/cil/project" layer="mcp" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/project.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="void" errors="Throws if fetchFunction or database calls fail" side_effects="Registers tools on the provided MCP server and may read or update database records"]
// CIL[DOC-MICRO logic_summary="Registers a suite of CIL project tools including status reporting, version lifecycle, file selection, and pipeline publishing" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {

  server.registerTool(
    'spine_cil_list_projects',
    {
      description: 'List all CIL projects registered in the database. Returns project names, repo paths, and basic file/chunk counts.',
      inputSchema: z.object({}),
    },
    async () => {
      const { data } = await adminDb.from('items').select('id, title, data')
        .filter('data->>kb_type', 'eq', 'cil_project')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      const projects = (data || []).map((p: any) => ({
        id: p.id,
        name: p.title,
        repo_path: p.data?.repo_path || '',
        language_mix: p.data?.language_mix || '',
        file_count: p.data?.file_count || 0,
        chunk_count: p.data?.chunk_count || 0,
        ingestion_status: p.data?.ingestion_status || 'not_started',
        last_ingested_at: p.data?.last_ingested_at || null,
        selected_paths: p.data?.selected_paths || [],
      }))

      return { content: [{ type: 'text', text: JSON.stringify({ project_count: projects.length, projects }, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_project_status',
    {
      description: 'Get the full pipeline status for a CIL project: unique file count (from chunks), chunk count, embedding coverage, documentation coverage, and link counts.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
      }),
    },
    async ({ project_id }) => {
      const PAGE_SIZE = 1000

      const [projectRes, totalChunksRes] = await Promise.allSettled([
        adminDb.from('items').select('id, title, data').eq('id', project_id).maybeSingle(),
        adminDb.from('items').select('*', { count: 'exact', head: true })
          .filter('data->>kb_type', 'eq', 'cil_chunk')
          .filter('data->>project_id', 'eq', project_id)
          .eq('is_active', true),
      ])

      const project = projectRes.status === 'fulfilled' ? projectRes.value.data : null
      const totalChunks = totalChunksRes.status === 'fulfilled' ? (totalChunksRes.value.count || 0) : 0

      const chunks: any[] = []
      let from = 0
      while (true) {
        const { data, error } = await adminDb.from('items').select('id, data')
          .filter('data->>kb_type', 'eq', 'cil_chunk')
          .filter('data->>project_id', 'eq', project_id)
          .eq('is_active', true)
          .order('id')
          .range(from, from + PAGE_SIZE - 1)
        if (error) break
        if (!data || data.length === 0) break
        chunks.push(...data)
        if (data.length < PAGE_SIZE) break
        from += PAGE_SIZE
      }

      const chunkIds = new Set(chunks.map((c: any) => c.id))
      const embeddedIds = new Set<string>()
      if (chunkIds.size > 0) {
        let embFrom = 0
        while (true) {
          const { data: embeddings, error: embErr } = await adminDb.from('embeddings').select('document_id')
            .order('id')
            .range(embFrom, embFrom + PAGE_SIZE - 1)
          if (embErr) break
          if (!embeddings || embeddings.length === 0) break
          for (const row of embeddings) {
            if (chunkIds.has(row.document_id)) embeddedIds.add(row.document_id)
          }
          if (embeddings.length < PAGE_SIZE) break
          embFrom += PAGE_SIZE
        }
      }

      const embeddedChunks = chunks.filter((c: any) => embeddedIds.has(c.id)).length
      const documentedChunks = chunks.filter((c: any) => c.data?.macro && c.data?.doc_confidence !== 'unverified_legacy').length
      const verifiedChunks = chunks.filter((c: any) => c.data?.doc_confidence === 'human_verified').length
      const aiChunks = chunks.filter((c: any) => c.data?.doc_confidence === 'ai_generated').length
      const pendingReview = chunks.filter((c: any) => c.data?.review_status === 'pending_review').length
      const deadCode = chunks.filter((c: any) => c.data?.is_dead_code).length

      const uniqueFilePaths = new Set(chunks.map((c: any) => c.data?.file_path).filter(Boolean))

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project_id,
            project_name: project?.title || '',
            repo_path: project?.data?.repo_path || '',
            selected_paths: project?.data?.selected_paths || [],
            pipeline: {
              files: { total: uniqueFilePaths.size },
              chunks: {
                total: totalChunks,
                dead_code: deadCode,
                pending_review: pendingReview,
                embedded: embeddedChunks,
                embedding_coverage_pct: totalChunks > 0 ? Math.round((embeddedChunks / totalChunks) * 100) : 0,
                documented: documentedChunks,
                human_verified: verifiedChunks,
                ai_generated: aiChunks,
                doc_coverage_pct: totalChunks > 0 ? Math.round((documentedChunks / totalChunks) * 100) : 0,
              },
            },
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_doc_gap_report',
    {
      description: 'List chunks that have no AI-generated or human-verified documentation. Use this to find chunks that need to be documented before they can be safely edited.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        limit: z.number().int().min(1).max(100).default(20).optional(),
      }),
    },
    async ({ project_id, limit = 20 }) => {
      const { data: chunks } = await adminDb.from('items').select('id, title, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .filter('data->>doc_confidence', 'eq', 'unverified_legacy')
        .eq('is_active', true)
        .limit(limit)

      const undocumented = (chunks || []).map((c: any) => ({
        chunk_id: c.id,
        chunk_name: c.data?.chunk_name || '',
        file_path: c.data?.file_path || '',
        chunk_type: c.data?.chunk_type || '',
        line_start: c.data?.line_start || 0,
        line_end: c.data?.line_end || 0,
      }))

      const { data: allChunks } = await adminDb.from('items').select('id')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)

      const total = allChunks?.length || 0
      const undocCount = undocumented.length

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project_id,
            summary: {
              total_chunks: total,
              undocumented_shown: undocCount,
              coverage_pct: total > 0 ? Math.round(((total - undocCount) / total) * 100) : 100,
            },
            undocumented,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_get_files_by_status',
    {
      description: `Get the ordered work queue for a pipeline step — all files in a project at a given pipeline status.
Use this at the start of each pipeline step to get the list of files to process.
Valid statuses: "0-discovered", "1-selected", "2-chunked", "3-documented", "4-chunk-validated", "5-doc-validated", "6-enriched", "7-embedded-mapped", "8-published".
Returns file_path, chunk_count, and last_updated for each file. Process files in the order returned — complete all steps for one file before moving to the next.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        status: z.string().describe('Pipeline status to filter by, e.g. "0-discovered", "2-chunked"'),
        include_progress_info: z.boolean().default(false).describe('Include pipeline progress and dependency information'),
      }),
    },
    async ({ project_id, status, include_progress_info }) => {
      const { data: project } = await adminDb.from('items').select('data')
        .eq('id', project_id).maybeSingle()
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const fileStatuses: Record<string, string> = project.data?.file_statuses || {}

      const matchingPaths = Object.entries(fileStatuses)
        .filter(([, v]) => v === status)
        .map(([file_path]) => file_path)

      if (matchingPaths.length === 0) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ ok: true, project_id, status, file_count: 0, files: [], message: `No files found with status "${status}"` }, null, 2),
          }],
        }
      }

      const { data: chunks } = await adminDb.from('items').select('data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)
        .in('data->>file_path' as any, matchingPaths)

      const chunkCountByFile: Record<string, number> = {}
      for (const c of chunks || []) {
        const fp = c.data?.file_path
        if (fp) chunkCountByFile[fp] = (chunkCountByFile[fp] || 0) + 1
      }

      const files = matchingPaths.map(file_path => {
        const baseFile = {
          file_path,
          status,
          chunk_count: chunkCountByFile[file_path] || 0,
        }

        if (include_progress_info) {
          const completedSteps = getCompletedSteps(file_path, fileStatuses)
          const readySteps = getReadySteps(file_path, fileStatuses)
          const blockedSteps = getBlockedSteps(file_path, fileStatuses)
          
          return {
            ...baseFile,
            completed_steps: completedSteps,
            ready_for: readySteps,
            blocked_by: blockedSteps,
            progress_percentage: calculateProgress(file_path, fileStatuses),
            can_proceed_to: readySteps
          }
        }

        return baseFile
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ ok: true, project_id, status, file_count: files.length, files }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_update_pipeline_status_flexible',
    {
      description: 'Update pipeline status with dependency tracking and progress monitoring for flexible processing.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('File path relative to repo root'),
        status: z.string().describe('New pipeline status'),
        step_completed: z.number().optional().describe('Step number that was just completed'),
        force: z.boolean().default(false).describe('Force update even if dependencies not met'),
      }),
    },
    async ({ project_id, file_path, status, step_completed, force }) => {
      
      const { data: project } = await adminDb.from('items').select('data')
        .eq('id', project_id).maybeSingle()
      
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      if (!force) {
        const fileStatuses = project.data?.file_statuses || {}
        const completedSteps = getCompletedSteps(file_path, fileStatuses)
        
        const statusRequirements: Record<string, number[]> = {
          '0-discovered': [],
          '1-selected': [0],
          '2-chunked': [1],
          '3-documented': [2],
          '4-chunk-validated': [3],
          '5-doc-validated': [4],
          '6-enriched': [5],
          '7-embedded-mapped': [6],
          '8-published': [7],
        }
        
        const requiredSteps = statusRequirements[status] || []
        const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step))
        
        if (missingSteps.length > 0) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                ok: false,
                error: `Cannot update to ${status}. Missing prerequisite steps: ${missingSteps.join(', ')}`,
                current_completed: completedSteps,
                required: requiredSteps
              })
            }]
          }
        }
      }

      const fileStatuses = project.data?.file_statuses || {}
      const previousStatus = fileStatuses[file_path]
      fileStatuses[file_path] = status

      const { error } = await adminDb.from('items')
        .update({ 
          data: { 
            ...project.data,
            file_statuses: fileStatuses,
            last_ingested_at: new Date().toISOString()
          }
        })
        .eq('id', project_id)

      if (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: error.message }) }] }
      }

      const updatedState = {
        file_path,
        previous_status: previousStatus,
        new_status: status,
        step_completed,
        completed_steps: getCompletedSteps(file_path, fileStatuses),
        ready_for: getReadySteps(file_path, fileStatuses),
        blocked_by: getBlockedSteps(file_path, fileStatuses),
        progress_percentage: calculateProgress(file_path, fileStatuses)
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ ok: true, ...updatedState }, null, 2)
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_list_files',
    {
      description: 'List indexed files for a CIL project with their status and chunk counts.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        limit: z.number().int().min(1).max(1000).default(100).optional(),
      }),
    },
    async ({ project_id, limit = 100 }) => {
      const { data: project } = await adminDb.from('items').select('data')
        .eq('id', project_id).maybeSingle()
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const { data: chunks, error } = await adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)
        .limit(limit)

      if (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: error.message }) }] }
      }

      const fileMap: Record<string, { chunk_count: number; statuses: Set<string> }> = {}
      for (const c of chunks || []) {
        const fp = c.data?.file_path || ''
        if (!fp) continue
        if (!fileMap[fp]) fileMap[fp] = { chunk_count: 0, statuses: new Set() }
        fileMap[fp].chunk_count += 1
        if (c.data?.status) fileMap[fp].statuses.add(c.data.status)
      }

      const fileStatuses: Record<string, string> = project.data?.file_statuses || {}
      const files = Object.entries(fileMap).map(([file_path, info]) => ({
        file_path,
        status: fileStatuses[file_path] || null,
        chunk_count: info.chunk_count,
        chunk_statuses: Array.from(info.statuses),
      })).sort((a, b) => a.file_path.localeCompare(b.file_path))

      return { content: [{ type: 'text', text: JSON.stringify({ ok: true, project_id, file_count: files.length, files }, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_list_versions',
    {
      description: 'List all versions for a CIL project.',
      inputSchema: z.object({
        project_id: z.string().describe('The cil_project UUID'),
      }),
    },
    async ({ project_id }) => {
      try {
        const { data, error } = await adminDb.from('items')
          .select('id, title, data')
          .filter('data->>kb_type', 'eq', 'cil_version')
          .filter('data->>project_id', 'eq', project_id)
          .order('created_at', { ascending: false })
        if (error) return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: error.message }) }] }
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, versions: data || [] }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_create_version',
    {
      description: 'Create a new CIL version for a project. The version must be valid semver; prerelease versions are automatically marked as iterations.',
      inputSchema: z.object({
        project_id: z.string().describe('The cil_project UUID'),
        version: z.string().describe('Version string, e.g. "0.1.0" or "0.1.6-dev.467.1"'),
        base_version: z.string().optional().describe('Optional base version string to copy from'),
      }),
    },
    async ({ project_id, version, base_version }) => {
      try {
        const result = await fetchFunction('cil-project', 'create_version', {}, {
          project_id,
          version,
          base_version,
        })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, version: result.version }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_set_active_version',
    {
      description: 'Set the active version for a CIL project.',
      inputSchema: z.object({
        project_id: z.string().describe('The cil_project UUID'),
        version_id: z.string().describe('The cil_version UUID to make active'),
      }),
    },
    async ({ project_id, version_id }) => {
      try {
        const result = await fetchFunction('cil-project', 'set_active_version', {}, {
          project_id,
          version_id,
        })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, project: result.project, version_id: result.version_id }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_publish_version',
    {
      description: 'Publish a new CIL version. Marks all other versions as inactive and sets it as the active and default version.',
      inputSchema: z.object({
        project_id: z.string().describe('The cil_project UUID'),
        version: z.string().describe('Version string to publish, e.g. "0.2.0"'),
        base_version: z.string().optional().describe('Optional base version whose prerelease iteration should be linked'),
      }),
    },
    async ({ project_id, version, base_version }) => {
      try {
        const result = await fetchFunction('cil-project', 'publish_version', {}, {
          project_id,
          version,
          base_version,
        })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, version: result.version, project: result.project }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_mark_versions_inactive',
    {
      description: 'Mark all CIL versions whose version string matches a pattern as inactive.',
      inputSchema: z.object({
        project_id: z.string().describe('The cil_project UUID'),
        version_pattern: z.string().describe('Substring to match in version strings'),
      }),
    },
    async ({ project_id, version_pattern }) => {
      try {
        const result = await fetchFunction('cil-project', 'mark_versions_inactive', {}, {
          project_id,
          version_pattern,
        })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, ...result }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_archive_versions',
    {
      description: 'Archive the oldest inactive CIL versions, keeping only the most recent N inactive versions.',
      inputSchema: z.object({
        project_id: z.string().describe('The cil_project UUID'),
        keep_last_n: z.number().int().min(0).describe('Number of most recent inactive versions to keep'),
      }),
    },
    async ({ project_id, keep_last_n }) => {
      try {
        const result = await fetchFunction('cil-project', 'archive_versions', {}, {
          project_id,
          keep_last_n,
        })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, ...result }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_create_project',
    {
      description: 'Create a new CIL project for a repository. The project will be created with discovery not yet run.',
      inputSchema: z.object({
        title: z.string().describe('Project title'),
        repo_path: z.string().describe('Absolute path to the repository root'),
        npm_name: z.string().describe('NPM package name'),
        canonical_root: z.string().describe('Canonical root prefix for stable IDs'),
        kind: z.enum(['core', 'custom']).default('custom').describe('Project kind: core (framework) or custom app'),
        globs: z.array(z.string()).default(['**/*.{ts,tsx,js,jsx}']).optional().describe('Globs for source discovery'),
        exclude_globs: z.array(z.string()).default(['**/node_modules/**', '**/dist/**', '**/*.d.ts']).optional().describe('Globs to exclude'),
      }),
    },
    async ({ title, repo_path, npm_name, canonical_root, kind, globs, exclude_globs }) => {
      try {
        const result = await fetchFunction('cil-project', 'create', {}, {
          title,
          repo_path,
          npm_name,
          canonical_root,
          kind,
          globs,
          exclude_globs,
        })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, ...result }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_delete_project',
    {
      description: 'Delete a CIL project and all attached records: files, chunks, proposals, versions, suggestions, embeddings, and links.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID to delete'),
      }),
    },
    async ({ project_id }) => {
      try {
        const result = await fetchFunction('cil-project', 'delete', { id: project_id })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, ...result }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_select_files',
    {
      description: 'Set the selected file paths for a CIL project and advance matching discovered files to 1-selected. Files must already have been discovered (step 0). Only selected files are processed by steps 2-8.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        selected_paths: z.array(z.string()).describe('List of relative file paths or directories to include in ingestion'),
      }),
    },
    async ({ project_id, selected_paths }) => {
      try {
        const result = await fetchFunction('cil-ingest', 'select', {}, { project_id, selected_paths })
        return { content: [{ type: 'text', text: JSON.stringify({ ok: true, ...result }) }] }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

  server.registerTool(
    'spine_cil_publish',
    {
      description: 'Publish a CIL project version and mark all files at 7-embedded-mapped as 8-published. If file_path is provided, only that file is published.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        version: z.string().describe('Version string to publish, e.g. "0.2.0"'),
        file_path: z.string().optional().describe('Optional single file to publish'),
      }),
    },
    async ({ project_id, version, file_path }) => {
      try {
        const pubResult = await fetchFunction('cil-project', 'publish_version', {}, {
          project_id,
          version,
        })

        const { data: project } = await adminDb.from('items').select('data').eq('id', project_id).maybeSingle()
        const fileStatuses: Record<string, string> = project?.data?.file_statuses || {}
        const now = new Date().toISOString()
        const updated: Record<string, string> = {}
        for (const [fp, status] of Object.entries(fileStatuses)) {
          if (file_path && fp !== file_path) continue
          if (status === '7-embedded-mapped') {
            updated[fp] = '8-published'
          }
        }

        if (Object.keys(updated).length > 0) {
          const newStatuses = { ...fileStatuses, ...updated }
          await adminDb.from('items').update({
            data: { ...project.data, file_statuses: newStatuses, published_at: now },
            updated_at: now,
          }).eq('id', project_id)
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              ok: true,
              project_id,
              version,
              version_id: pubResult.version?.id,
              published_files: Object.keys(updated).length,
              file_path: file_path || null,
            }, null, 2),
          }],
        }
      } catch (err: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] }
      }
    }
  )

}
// CIL[DOC-VECTOR type="context" content="purpose='Register CIL project management and version lifecycle tools on an MCP server'; No verified external callers; imports: .framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/project.ts:register:function"]
