// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Provides MCP tools for monitoring and managing the CIL pipeline state across files"]
// CIL[DOC-RESPONSIBILITY responsibility="Register MCP tools that expose pipeline status, file readiness, bottleneck analysis, and state updates"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance" outputs="Registered tools" errors="Database query failures, invalid project or step" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Imports MCP server and adminDb, defines pipeline step constants and types, then exposes tool registrations" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system"]

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
// CIL[DOC-VECTOR type="context" content="purpose='Provides MCP tools for monitoring and managing the CIL pipeline state across files'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:PIPELINE_STEPS:constant" type="constant" identity="PIPELINE_STEPS" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Defines the ordered sequence of CIL pipeline processing stages"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a static, type-safe lookup of pipeline step metadata including prerequisites and target status strings"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="Constant step definition object" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Maps each step number to a name, prerequisite array, and target status string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const PIPELINE_STEPS = {
  0: { name: 'discover', prerequisites: [], target_status: '0-discovered' },
  1: { name: 'select', prerequisites: [0], target_status: '1-selected' },
  2: { name: 'chunk', prerequisites: [1], target_status: '2-chunked' },
  3: { name: 'document', prerequisites: [2], target_status: '3-documented' },
  4: { name: 'validate-chunks', prerequisites: [3], target_status: '4-chunk-validated' },
  5: { name: 'validate-docs', prerequisites: [4], target_status: '5-doc-validated' },
  6: { name: 'enrich', prerequisites: [5], target_status: '6-enriched' },
  7: { name: 'embed-and-map', prerequisites: [6], target_status: '7-embedded-mapped' },
  8: { name: 'publish', prerequisites: [7], target_status: '8-published' },
} as const
// CIL[DOC-VECTOR type="context" content="purpose='Defines the ordered sequence of CIL pipeline processing stages'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:PIPELINE_STEPS:constant"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:PipelineStep:type" type="type" identity="PipelineStep" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Provides a type-safe union of valid pipeline step identifiers"]
// CIL[DOC-RESPONSIBILITY responsibility="Constrain step references to the keys of the PIPELINE_STEPS object"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="PipelineStep union type" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Derives step keys from the PIPELINE_STEPS constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

/**
 * PipelineStep represents a key of the PIPELINE_STEPS object, defining the various steps in a data processing pipeline. It exists to provide a type-safe way to reference these steps throughout the module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
type PipelineStep = keyof typeof PIPELINE_STEPS
// CIL[DOC-VECTOR type="context" content="purpose='Provides a type-safe union of valid pipeline step identifiers'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:PipelineStep:type"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:FilePipelineState:interface" type="interface" identity="FilePipelineState" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Defines the structure for tracking a single file's progress through the pipeline"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the per-file pipeline state returned by status and readiness tools"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="FilePipelineState interface" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Lists file path, current status, completed/ready/blocked step arrays, and progress percentage" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

/**
 * The FilePipelineState interface represents the state of a file processing pipeline, including its path, current status, and progress. It is used to track the steps completed, those that are ready to proceed, and any that are blocked.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface FilePipelineState {
  file_path: string
  current_status: string
  completed_steps: PipelineStep[]
  ready_for: PipelineStep[]
  blocked_by: PipelineStep[]
  progress_percentage: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the structure for tracking a single file's progress through the pipeline'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:FilePipelineState:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:PipelineStatus:interface" type="interface" identity="PipelineStatus" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Defines the aggregate pipeline status returned for a whole project"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the project-level status object containing all file states, step summaries, and overall progress"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="PipelineStatus interface" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Groups project id, file state array, per-step counts, and overall progress percentage" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

/**
 * The PipelineStatus interface defines the structure for tracking the status of a pipeline, including project identification, file states, step summaries, and overall progress. It exists to provide a comprehensive overview of the pipeline's execution state.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface PipelineStatus {
  project_id: string
  files: FilePipelineState[]
  step_summary: Record<PipelineStep, { completed: number; pending: number; in_progress: number }>
  overall_progress: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the aggregate pipeline status returned for a whole project'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:PipelineStatus:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Registers all CIL pipeline MCP tools with a server instance"]
// CIL[DOC-RESPONSIBILITY responsibility="Bind tool handlers for get_pipeline_status, get_files_ready_for_step, update_file_pipeline_state, and get_pipeline_bottlenecks"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="Tool registrations on the server" errors="Database failures, invalid project or step" side_effects="Queries adminDb and returns JSON tool responses"]
// CIL[DOC-MICRO logic_summary="Defines four tool registrations that read or update project file_statuses and compute step readiness or bottleneck summaries" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function register(server: McpServer) {

  server.registerTool(
    'spine_cil_get_pipeline_status',
    {
      description: 'Get comprehensive pipeline status showing file-by-file progress, dependencies, and readiness for next steps.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
      }),
    },
    async ({ project_id }) => {
      const { data: project } = await adminDb.from('items').select('data')
        .eq('id', project_id).maybeSingle()
      
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const fileStatuses: Record<string, string> = project.data?.file_statuses || {}
      const files = Object.entries(fileStatuses).map(([file_path, status]) => ({
        file_path,
        current_status: status,
        completed_steps: getCompletedSteps(status),
        ready_for: getReadySteps(status),
        blocked_by: getBlockedSteps(status),
        progress_percentage: calculateProgress(status)
      }))

      const stepSummary: Record<PipelineStep, { completed: number; pending: number; in_progress: number }> = {}
      for (const step of Object.keys(PIPELINE_STEPS) as PipelineStep[]) {
        const stepNum = step as unknown as number
        stepSummary[step] = {
          completed: files.filter(f => f.completed_steps.includes(stepNum)).length,
          pending: files.filter(f => f.ready_for.includes(stepNum)).length,
          in_progress: files.filter(f => f.current_status === PIPELINE_STEPS[step].target_status).length
        }
      }

      const overallProgress = files.reduce((sum, file) => sum + file.progress_percentage, 0) / files.length

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project_id,
            files,
            step_summary: stepSummary,
            overall_progress: Math.round(overallProgress)
          }, null, 2)
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_get_files_ready_for_step',
    {
      description: 'Get files that are ready to process for a specific pipeline step, considering dependencies.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        step: z.number().min(0).max(8).describe('Pipeline step number (0-8)'),
        include_blocking_info: z.boolean().default(false).describe('Include information about what blocks each file'),
      }),
    },
    async ({ project_id, step, include_blocking_info }) => {
      const stepKey = step as PipelineStep
      if (!PIPELINE_STEPS[stepKey]) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Invalid step: ${step}` }) }] }
      }

      const { data: project } = await adminDb.from('items').select('data')
        .eq('id', project_id).maybeSingle()
      
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const fileStatuses: Record<string, string> = project.data?.file_statuses || {}
      const allFiles = Object.entries(fileStatuses)

      const readyFiles = allFiles.filter(([file_path, status]) => {
        const completedSteps = getCompletedSteps(status)
        return PIPELINE_STEPS[stepKey].prerequisites.every(prereq => completedSteps.includes(prereq))
      })

      const filePaths = readyFiles.map(([file_path]) => file_path)
      const { data: chunks } = await adminDb.from('items').select('data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)
        .in('data->>file_path' as any, filePaths)

      const chunkCountByFile: Record<string, number> = {}
      for (const c of chunks || []) {
        const fp = c.data?.file_path
        if (fp) chunkCountByFile[fp] = (chunkCountByFile[fp] || 0) + 1
      }

      const files = readyFiles.map(([file_path, status]) => {
        const fileInfo = {
          file_path,
          status,
          chunk_count: chunkCountByFile[file_path] || 0,
          completed_steps: getCompletedSteps(status),
          ready_for: getReadySteps(status),
          blocked_by: getBlockedSteps(status)
        }

        if (include_blocking_info) {
          return {
            ...fileInfo,
            blocking_reasons: getBlockingReasons(status, stepKey),
            can_proceed: fileInfo.ready_for.includes(stepKey)
          }
        }

        return fileInfo
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            project_id,
            step: stepKey,
            step_name: PIPELINE_STEPS[stepKey].name,
            prerequisites: PIPELINE_STEPS[stepKey].prerequisites,
            target_status: PIPELINE_STEPS[stepKey].target_status,
            file_count: files.length,
            files
          }, null, 2)
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_update_file_pipeline_state',
    {
      description: 'Update pipeline state for a specific file, supporting incremental progress tracking.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('File path relative to repo root'),
        step_completed: z.number().min(0).max(8).describe('Pipeline step that was just completed'),
        new_status: z.string().describe('New pipeline status for the file'),
      }),
    },
    async ({ project_id, file_path, step_completed, new_status }) => {
      
      const { data: project } = await adminDb.from('items').select('data')
        .eq('id', project_id).maybeSingle()
      
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const fileStatuses = project.data?.file_statuses || {}
      fileStatuses[file_path] = new_status

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
        previous_status: project.data?.file_statuses?.[file_path],
        new_status,
        step_completed,
        completed_steps: getCompletedSteps(new_status),
        ready_for: getReadySteps(new_status),
        progress_percentage: calculateProgress(new_status)
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
    'spine_cil_get_pipeline_bottlenecks',
    {
      description: 'Analyze pipeline bottlenecks and suggest optimal processing order.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
      }),
    },
    async ({ project_id }) => {
      const { data: project } = await adminDb.from('items').select('data')
        .eq('id', project_id).maybeSingle()
      
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const fileStatuses: Record<string, string> = project.data?.file_statuses || {}
      const files = Object.entries(fileStatuses)

      const bottlenecks = []
      const recommendations = []

      for (const step of Object.keys(PIPELINE_STEPS) as PipelineStep[]) {
        const stepNum = step as unknown as number
        const readyCount = files.filter(([_, status]) => {
          const completedSteps = getCompletedSteps(status)
          return PIPELINE_STEPS[step].prerequisites.every(prereq => completedSteps.includes(prereq))
        }).length

        const totalCount = files.length
        const blockedCount = totalCount - readyCount

        if (blockedCount > 0) {
          bottlenecks.push({
            step: stepNum,
            step_name: PIPELINE_STEPS[step].name,
            ready: readyCount,
            blocked: blockedCount,
            blocking_reasons: getStepBlockingReasons(files, step)
          })

          recommendations.push({
            step: stepNum,
            action: `Process ${blockedCount} files through prerequisite steps first`,
            priority: step === 8 ? 'high' : 'medium'
          })
        }
      }

      const optimalOrder = getOptimalProcessingOrder(files)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project_id,
            bottlenecks,
            recommendations: recommendations.sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 }
              return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
            }),
            optimal_processing_order: optimalOrder,
            summary: {
              total_files: files.length,
              bottleneck_count: bottlenecks.length,
              ready_for_processing: files.filter(([_, status]) => 
                getCompletedSteps(status).length >= 3 
              ).length
            }
          }, null, 2)
        }],
      }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Registers all CIL pipeline MCP tools with a server instance'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:register:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getCompletedSteps:function" type="function" identity="getCompletedSteps" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Converts a pipeline status string into the set of completed step numbers"]
// CIL[DOC-RESPONSIBILITY responsibility="Determine which steps have already been completed for a file given its current status"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="number[] of completed step numbers" errors="Returns empty array for unknown status" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Maps status string to rank, then collects all step numbers less than or equal to that rank" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function getCompletedSteps(status: string): number[] {
  const stepMap: Record<string, number> = {
    '0-discovered': 0,
    '1-selected': 1,
    '2-chunked': 2,
    '3-documented': 3,
    '4-chunk-validated': 4,
    '5-doc-validated': 5,
    '6-enriched': 6,
    '7-embedded-mapped': 7,
    '8-published': 8,
  }

  const rank = stepMap[status]
  if (rank === undefined) return []

  const completed: number[] = []
  for (const step of Object.keys(PIPELINE_STEPS) as PipelineStep[]) {
    const stepNum = parseInt(step, 10)
    if (stepNum <= rank) completed.push(stepNum)
  }
  return completed
}
// CIL[DOC-VECTOR type="context" content="purpose='Converts a pipeline status string into the set of completed step numbers'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getCompletedSteps:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getReadySteps:function" type="function" identity="getReadySteps" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Identifies pipeline steps whose prerequisites are satisfied by a file's completed steps"]
// CIL[DOC-RESPONSIBILITY responsibility="Compute the next steps a file can immediately progress to"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="PipelineStep[] of ready step numbers" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Gathers completed steps, then iterates remaining steps and keeps those whose prerequisites are all present" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

/**
 * Retrieves the steps that are ready to be executed based on the current status by checking completed prerequisites. This function helps in orchestrating the pipeline execution flow.
 *
 * @macro       Function that identifies ready pipeline steps based on their prerequisites.
 * @micro       Iterates through defined pipeline steps and checks if their prerequisites are met by the completed steps.
 * @inputSpec
 *   status: string (required) — the current status of the pipeline to determine completed steps.
 * @outputSpec  PipelineStep[] — an array of steps that are ready for execution.
 * @sideEffects none
 * @stability   stable
 * @calls       getCompletedSteps
 * @cil-generated
 */
function getReadySteps(status: string): PipelineStep[] {
  const completed = getCompletedSteps(status)
  const ready: PipelineStep[] = []

  for (const [stepNum, stepDef] of Object.entries(PIPELINE_STEPS)) {
    const num = parseInt(stepNum, 10) as PipelineStep
    if (completed.includes(num)) continue
    if (stepDef.prerequisites.every(prereq => completed.includes(prereq))) {
      ready.push(num)
    }
  }

  return ready
}
// CIL[DOC-VECTOR type="context" content="purpose='Identifies pipeline steps whose prerequisites are satisfied by a file's completed steps'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getReadySteps:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getBlockedSteps:function" type="function" identity="getBlockedSteps" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Identifies pipeline steps whose prerequisites are not yet satisfied"]
// CIL[DOC-RESPONSIBILITY responsibility="Compute which steps a file cannot yet proceed to"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="PipelineStep[] of blocked step numbers" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Collects completed steps, then returns every step whose prerequisites are not fully met" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

/**
 * Identifies and returns the steps in a pipeline that are blocked due to unmet prerequisites. This function is essential for determining which steps cannot proceed based on the current status.
 *
 * @macro       Function that evaluates pipeline steps based on their prerequisites.
 * @micro       Iterates through predefined pipeline steps, checking if all prerequisites are met against completed steps.
 * @inputSpec
 *   status: string (required) — the current status of the pipeline to evaluate against.
 * @outputSpec  PipelineStep[] — an array of blocked pipeline step numbers.
 * @sideEffects none
 * @stability   stable
 * @calls       getCompletedSteps
 * @cil-generated
 */
function getBlockedSteps(status: string): PipelineStep[] {
  const completed = getCompletedSteps(status)
  const blocked: PipelineStep[] = []
  
  for (const [stepNum, stepDef] of Object.entries(PIPELINE_STEPS)) {
    const num = parseInt(stepNum) as PipelineStep
    if (!stepDef.prerequisites.every(prereq => completed.includes(prereq))) {
      blocked.push(num)
    }
  }
  
  return blocked
}
// CIL[DOC-VECTOR type="context" content="purpose='Identifies pipeline steps whose prerequisites are not yet satisfied'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getBlockedSteps:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:calculateProgress:function" type="function" identity="calculateProgress" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Calculates a percentage completion value for a given pipeline status"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a file's status into a 0-100 progress percentage"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="number percentage" errors="Returns 0 for unknown status" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Counts completed steps and divides by total steps, multiplying by 100" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

/**
 * Calculates the progress of a pipeline based on the number of completed steps relative to the total steps. This function is essential for tracking the advancement of tasks within the pipeline.
 *
 * @inputSpec
 *   status: string (required) — the current status of the pipeline to determine completed steps.
 * @outputSpec  number — a percentage representing the progress of the pipeline.
 * @sideEffects none
 * @stability   stable
 * @calls       getCompletedSteps
 * @cil-generated
 */
function calculateProgress(status: string): number {
  const completed = getCompletedSteps(status)
  const totalSteps = Object.keys(PIPELINE_STEPS).length
  return (completed.length / totalSteps) * 100
}
// CIL[DOC-VECTOR type="context" content="purpose='Calculates a percentage completion value for a given pipeline status'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:calculateProgress:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getBlockingReasons:function" type="function" identity="getBlockingReasons" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Generates human-readable reasons for a specific step being blocked"]
// CIL[DOC-RESPONSIBILITY responsibility="List missing prerequisite steps that prevent a file from starting a given pipeline step"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="status: string, step: PipelineStep" outputs="string[] of missing prerequisite messages" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Checks each prerequisite of the target step against completed steps and returns messages for those not yet completed" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

/**
 * The function retrieves the reasons why a specific pipeline step is blocked based on its prerequisites. It checks the completed steps against the required prerequisites and generates a list of missing steps.
 *
 * @inputSpec
 *   status: string (required) — the current status of the pipeline.
 *   step: PipelineStep (required) — the specific step in the pipeline to check prerequisites for.
 * @outputSpec  string[] — an array of strings detailing the missing prerequisite steps.
 * @sideEffects none
 * @stability   stable
 * @calls       getCompletedSteps
 * @cil-generated
 */
function getBlockingReasons(status: string, step: PipelineStep): string[] {
  const completed = getCompletedSteps(status)
  const reasons: string[] = []
  
  for (const prereq of PIPELINE_STEPS[step].prerequisites) {
    if (!completed.includes(prereq)) {
      reasons.push(`Missing prerequisite step ${prereq} (${PIPELINE_STEPS[prereq].name})`)
    }
  }
  
  return reasons
}
// CIL[DOC-VECTOR type="context" content="purpose='Generates human-readable reasons for a specific step being blocked'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getBlockingReasons:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getStepBlockingReasons:function" type="function" identity="getStepBlockingReasons" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Aggregates per-file blocking reasons for a specific pipeline step"]
// CIL[DOC-RESPONSIBILITY responsibility="Collect file-level messages indicating which prerequisites are missing for a given step"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="files: Array<[string, string]>, step: PipelineStep" outputs="string[] of unique blocking reasons" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Iterates project files, checks step prerequisites, and gathers unique missing-prerequisite messages" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function getStepBlockingReasons(files: Array<[string, string]>, step: PipelineStep): string[] {
  const blockingReasons: string[] = []
  
  for (const [file_path, status] of files) {
    const completed = getCompletedSteps(status)
    if (!PIPELINE_STEPS[step].prerequisites.every(prereq => completed.includes(prereq))) {
      for (const prereq of PIPELINE_STEPS[step].prerequisites) {
        if (!completed.includes(prereq)) {
          blockingReasons.push(`${file_path}: missing step ${prereq}`)
        }
      }
    }
  }
  
  return [...new Set(blockingReasons)] 
}
// CIL[DOC-VECTOR type="context" content="purpose='Aggregates per-file blocking reasons for a specific pipeline step'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getStepBlockingReasons:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getOptimalProcessingOrder:function" type="function" identity="getOptimalProcessingOrder" parent="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-MACRO purpose="Sorts project files by processing priority for the bottleneck tool"]
// CIL[DOC-RESPONSIBILITY responsibility="Produce a prioritized list of files and their next suggested step"]
// CIL[DOC-CONTEXT module="mcp" layer="tools" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts"]
// CIL[DOC-CONTRACT inputs="files: Array<[string, string]>" outputs="Array of {file_path, suggested_next_step} in priority order" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Computes completed and ready steps for each file, sorts by most ready then least completed, and picks the first ready step" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function getOptimalProcessingOrder(files: Array<[string, string]>): Array<{file_path: string, suggested_next_step: PipelineStep}> {
  const fileStates = files.map(([file_path, status]) => ({
    file_path,
    status,
    completed_steps: getCompletedSteps(status),
    ready_for: getReadySteps(status)
  }))

  return fileStates
    .sort((a, b) => {
      
      if (a.ready_for.length !== b.ready_for.length) {
        return b.ready_for.length - a.ready_for.length
      }
      
      return a.completed_steps.length - b.completed_steps.length
    })
    .map(({ file_path, ready_for }) => ({
      file_path,
      suggested_next_step: ready_for[0] || null
    }))
}
// CIL[DOC-VECTOR type="context" content="purpose='Sorts project files by processing priority for the bottleneck tool'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline-orchestrator.ts:getOptimalProcessingOrder:function"]
