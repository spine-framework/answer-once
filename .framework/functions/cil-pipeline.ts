// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Module header and imports for the pipeline function"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the function imports and mark the module entry point"]
// CIL[DOC-CONTEXT module="functions" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="None" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Import shared middleware, database client, and CIL helpers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]

import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { pipelineRank } from './_shared/cil'
// CIL[DOC-VECTOR type="context" content="purpose='Module header and imports for the pipeline function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:PIPELINE_STEPS:constant" type="constant" identity="PIPELINE_STEPS" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the PIPELINE_STEPS constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the PIPELINE_STEPS constant for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="PIPELINE_STEPS constant definition" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Implements the PIPELINE_STEPS constant" notable_decisions="[]"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Define the PIPELINE_STEPS constant'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:PIPELINE_STEPS:constant"]


  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
  // CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:PipelineStep:type" type="type" identity="PipelineStep" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the PipelineStep type"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the PipelineStep type for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="PipelineStep type definition" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Implements the PipelineStep type" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type PipelineStep = keyof typeof PIPELINE_STEPS
// CIL[DOC-VECTOR type="context" content="purpose='Define the PipelineStep type'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:PipelineStep:type"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getProject:function" type="function" identity="getProject" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getProject function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getProject function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="project_id: string" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getProject function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getProject(project_id: string) {
  const { data: project } = await adminDb.from('items').select('data')
    .eq('id', project_id).maybeSingle()
  if (!project) throw new Error(`Project not found: ${project_id}`)
  return project
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the getProject function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getProject:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getCompletedSteps:function" type="function" identity="getCompletedSteps" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getCompletedSteps function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getCompletedSteps function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getCompletedSteps function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getCompletedSteps(status: string): PipelineStep[] {
  const rank = pipelineRank(status)
  const completed: PipelineStep[] = []
  for (const step of Object.keys(PIPELINE_STEPS) as PipelineStep[]) {
    if (Number(step) <= rank) completed.push(step)
  }
  return completed
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the getCompletedSteps function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getCompletedSteps:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getReadySteps:function" type="function" identity="getReadySteps" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getReadySteps function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getReadySteps function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getReadySteps function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getReadySteps(status: string): PipelineStep[] {
  const completed = getCompletedSteps(status)
  const ready: PipelineStep[] = []
  for (const [stepNum, stepDef] of Object.entries(PIPELINE_STEPS)) {
    const num = parseInt(stepNum) as PipelineStep
    if (stepDef.prerequisites.every(prereq => completed.includes(prereq))) {
      ready.push(num)
    }
  }
  return ready
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the getReadySteps function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getReadySteps:function"]

  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
  // CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getBlockedSteps:function" type="function" identity="getBlockedSteps" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getBlockedSteps function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getBlockedSteps function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getBlockedSteps function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Define the getBlockedSteps function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getBlockedSteps:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:calculateProgress:function" type="function" identity="calculateProgress" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the calculateProgress function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the calculateProgress function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the calculateProgress function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function calculateProgress(status: string): number {
  const completed = getCompletedSteps(status)
  const totalSteps = Object.keys(PIPELINE_STEPS).length
  return (completed.length / totalSteps) * 100
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the calculateProgress function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:calculateProgress:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getBlockingReasons:function" type="function" identity="getBlockingReasons" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getBlockingReasons function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getBlockingReasons function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="status: string, step: PipelineStep" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getBlockingReasons function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Define the getBlockingReasons function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getBlockingReasons:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getStepBlockingReasons:function" type="function" identity="getStepBlockingReasons" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getStepBlockingReasons function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getStepBlockingReasons function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="files: Array<[string, string]>, step: PipelineStep" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getStepBlockingReasons function" notable_decisions="[]"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Define the getStepBlockingReasons function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getStepBlockingReasons:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getOptimalProcessingOrder:function" type="function" identity="getOptimalProcessingOrder" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getOptimalProcessingOrder function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getOptimalProcessingOrder function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="files: Array<[string, string]>" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getOptimalProcessingOrder function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getOptimalProcessingOrder(files: Array<[string, string]>): Array<{file_path: string, suggested_next_step: PipelineStep | null}> {
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
// CIL[DOC-VECTOR type="context" content="purpose='Define the getOptimalProcessingOrder function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getOptimalProcessingOrder:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getPipelineStatus:function" type="function" identity="getPipelineStatus" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getPipelineStatus function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getPipelineStatus function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="project_id: string" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getPipelineStatus function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getPipelineStatus(project_id: string) {
  const project = await getProject(project_id)
  const fileStatuses: Record<string, string> = project.data?.file_statuses || {}
  const files = Object.entries(fileStatuses).map(([file_path, status]) => ({
    file_path,
    current_status: status,
    completed_steps: getCompletedSteps(status),
    ready_for: getReadySteps(status),
    blocked_by: getBlockedSteps(status),
    progress_percentage: calculateProgress(status)
  }))
  const stepSummary: Record<PipelineStep, { completed: number; pending: number; in_progress: number }> = {} as any
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
    project_id,
    files,
    step_summary: stepSummary,
    overall_progress: Math.round(overallProgress)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the getPipelineStatus function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getPipelineStatus:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getFilesReadyForStep:function" type="function" identity="getFilesReadyForStep" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getFilesReadyForStep function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getFilesReadyForStep function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="project_id: string, step: number, include_blocking_info: boolean" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getFilesReadyForStep function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getFilesReadyForStep(project_id: string, step: number, include_blocking_info: boolean) {
  const stepKey = step as PipelineStep
  if (!PIPELINE_STEPS[stepKey]) {
    throw new Error(`Invalid step: ${step}`)
  }
  const project = await getProject(project_id)
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
    const fileInfo: any = {
      file_path,
      status,
      chunk_count: chunkCountByFile[file_path] || 0,
      completed_steps: getCompletedSteps(status),
      ready_for: getReadySteps(status),
      blocked_by: getBlockedSteps(status)
    }
    if (include_blocking_info) {
      fileInfo.blocking_reasons = getBlockingReasons(status, stepKey)
      fileInfo.can_proceed = fileInfo.ready_for.includes(stepKey)
    }
    return fileInfo
  })
  return {
    ok: true,
    project_id,
    step: stepKey,
    step_name: PIPELINE_STEPS[stepKey].name,
    prerequisites: PIPELINE_STEPS[stepKey].prerequisites,
    target_status: PIPELINE_STEPS[stepKey].target_status,
    file_count: files.length,
    files
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the getFilesReadyForStep function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getFilesReadyForStep:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:updateFilePipelineState:function" type="function" identity="updateFilePipelineState" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the updateFilePipelineState function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the updateFilePipelineState function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="project_id: string, file_path: string, step_completed: number, new_status: string" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the updateFilePipelineState function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function updateFilePipelineState(
  project_id: string,
  file_path: string,
  step_completed: number,
  new_status: string
) {
  const project = await getProject(project_id)
  const fileStatuses = project.data?.file_statuses || {}
  const previous_status = fileStatuses[file_path]
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
  if (error) throw new Error(error.message)
  return {
    ok: true,
    file_path,
    previous_status,
    new_status,
    step_completed,
    completed_steps: getCompletedSteps(new_status),
    ready_for: getReadySteps(new_status),
    progress_percentage: calculateProgress(new_status)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the updateFilePipelineState function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:updateFilePipelineState:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:getPipelineBottlenecks:function" type="function" identity="getPipelineBottlenecks" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the getPipelineBottlenecks function"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the getPipelineBottlenecks function for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="project_id: string" outputs="See implementation" errors="May throw on invalid inputs or missing data" side_effects="May query or update project records"]
// CIL[DOC-MICRO logic_summary="Implements the getPipelineBottlenecks function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getPipelineBottlenecks(project_id: string) {
  const project = await getProject(project_id)
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
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the getPipelineBottlenecks function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:getPipelineBottlenecks:function"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-pipeline.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-pipeline.ts"]
// CIL[DOC-MACRO purpose="Define the handler constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the handler constant for the CIL pipeline"]
// CIL[DOC-CONTEXT module="cil-pipeline" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/cil-pipeline.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="handler constant definition" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Implements the handler constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const action = ctx.query?.action
  if (!action) throw new Error('action is required')

  if (action === 'get_pipeline_status') {
    const { project_id } = body as { project_id: string }
    if (!project_id) throw new Error('project_id is required')
    return await getPipelineStatus(project_id)
  }

  if (action === 'get_files_ready_for_step') {
    const { project_id, step, include_blocking_info } = body as {
      project_id: string
      step: number
      include_blocking_info?: boolean
    }
    if (!project_id || step === undefined) throw new Error('project_id and step are required')
    return await getFilesReadyForStep(project_id, step, include_blocking_info ?? false)
  }

  if (action === 'update_file_pipeline_state') {
    const { project_id, file_path, step_completed, new_status } = body as {
      project_id: string
      file_path: string
      step_completed: number
      new_status: string
    }
    if (!project_id || !file_path || step_completed === undefined || !new_status) {
      throw new Error('project_id, file_path, step_completed, and new_status are required')
    }
    return await updateFilePipelineState(project_id, file_path, step_completed, new_status)
  }

  if (action === 'get_pipeline_bottlenecks') {
    const { project_id } = body as { project_id: string }
    if (!project_id) throw new Error('project_id is required')
    return await getPipelineBottlenecks(project_id)
  }

  throw new Error(`Unknown action: ${action}`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Define the handler constant'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-pipeline.ts:handler:constant"]
