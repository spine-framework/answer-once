/**
 * @module   pipeline-runner
 * @audience internal
 * @layer    shared-core
 * @stability stable
 *
 * This module serves as a pipeline runner that orchestrates the execution of various tasks within the system. It integrates with middleware, database operations, and auditing mechanisms to ensure a cohesive flow of operations. The module is designed to handle multi-step processes, ensuring that each step is executed in the correct order and context.
 * 
 * INVARIANT: The CoreContext must always be provided to maintain the integrity of the operations.
 *
 * @seeAlso middleware (provides context for operations).
 * @seeAlso db (handles database interactions).
 * @seeAlso audit (manages auditing of operations).
 * @seeAlso integration-outbound (executes outbound integrations).
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="This module serves as a pipeline runner that orchestrates the execution of various tasks within the system."]
// CIL[DOC-RESPONSIBILITY responsibility="This module serves as a pipeline runner that orchestrates the execution of various tasks within the system. It integrates with middleware, database operations, and auditing mechanisms to ensure a cohesive flow of operations. The module is designed to handle multi-step processes, ensuring that each step is executed in the correct order and context. INVARIANT: The CoreContext must always be provided to maintain the integrity of the operations."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="shared-core" related_files="middleware (provides context for operations).,db (handles database interactions).,audit (manages auditing of operations).,integration-outbound (executes outbound integrations)."]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="This module serves as a pipeline runner that orchestrates the execution of various tasks within the system. It integrates with middleware, database operations, and auditing mechanisms to ensure a cohesive flow of operations. The module is designed to handle multi-step processes, ensuring that each step is executed in the correct order and context. INVARIANT: The CoreContext must always be provided to maintain the integrity of the operations." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]









import { CoreContext } from './middleware'
import { adminDb } from './db'
import { emitAudit, emitSpan } from './audit'
import { emitOutcome } from './outcomes'
import { withSpan } from './tracing'
import { resolveKnowledgeScope, knowledgeRowAllowed } from './kb'
import { resolveNotificationRecipients } from './notify'
// integration-outbound is imported lazily — a static edge closes the cycle
// middleware → security → rate-limit → funnel → trigger-engine →
// pipeline-runner → integration-outbound → middleware, leaving createHandler
// undefined during module evaluation.
const executeOutbound = async (ctx: CoreContext, args: any) =>
  (await import('../integration-outbound')).execute(ctx, args)
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='This module serves as a pipeline runner that orchestrates the execution of various tasks within the system.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="UUID_RE is a regular expression that validates the format of UUIDs."]
// CIL[DOC-RESPONSIBILITY responsibility="UUID_RE is a regular expression that validates the format of UUIDs. It exists to ensure that any UUIDs processed in this module conform to the standard UUID format."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="UUID_RE is a regular expression that validates the format of UUIDs. It exists to ensure that any UUIDs processed in this module conform to the standard UUID format." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * UUID_RE is a regular expression that validates the format of UUIDs. It exists to ensure that any UUIDs processed in this module conform to the standard UUID format.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:uuid_re:constant" type="constant" identity="UUID_RE" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="UUID_RE constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the UUID_RE constant."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the UUID_RE constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:uuid_re:constant"]
// CIL[DOC-MACRO purpose="UUID_RE constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the UUID_RE constant."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the UUID_RE constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='UUID_RE is a regular expression that validates the format of UUIDs.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Validates whether a given string is a properly formatted UUID."]
// CIL[DOC-RESPONSIBILITY responsibility="Validates whether a given string is a properly formatted UUID. This function is essential for ensuring that UUIDs are correctly identified in the pipeline processing."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="- v: string (optional|nullable) — the value to be checked for UUID format." outputs="v is string — returns true if v is a valid UUID, otherwise false." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validates whether a given string is a properly formatted UUID. This function is essential for ensuring that UUIDs are correctly identified in the pipeline processing." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Validates whether a given string is a properly formatted UUID. This function is essential for ensuring that UUIDs are correctly identified in the pipeline processing.
 *
 * @inputSpec
 *   - v: string (optional|nullable) — the value to be checked for UUID format.
 * @outputSpec  v is string — returns true if v is a valid UUID, otherwise false.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:isuuid:function" type="function" identity="isUuid" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="isUuid function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the isUuid function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the isUuid function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function isUuid(v: string | undefined | null): v is string { return !!v && UUID_RE.test(v) }
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:isuuid:function"]
// CIL[DOC-MACRO purpose="isUuid function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the isUuid function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the isUuid function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='Validates whether a given string is a properly formatted UUID.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="The StageResult interface defines the structure of the result produced by a stage in a pipeline execution."]
// CIL[DOC-RESPONSIBILITY responsibility="The StageResult interface defines the structure of the result produced by a stage in a pipeline execution. It captures essential information about the stage's execution status, output, and duration."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The StageResult interface defines the structure of the result produced by a stage in a pipeline execution. It captures essential information about the stage's execution status, output, and duration." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The StageResult interface defines the structure of the result produced by a stage in a pipeline execution. It captures essential information about the stage's execution status, output, and duration.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:stageresult:interface" type="interface" identity="StageResult" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="StageResult interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the StageResult interface."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the StageResult interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface StageResult {
  stageIndex: number
  stageType: string
  status: 'success' | 'failed' | 'skipped'
  output?: any
  error?: string
  durationMs: number
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:stageresult:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='The StageResult interface defines the structure of the result produced by a stage in a pipeline execution.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="The ExecutionResult interface defines the structure of the result returned after executing a pipeline, including its status and duration."]
// CIL[DOC-RESPONSIBILITY responsibility="The ExecutionResult interface defines the structure of the result returned after executing a pipeline, including its status and duration. It is essential for tracking the outcome of pipeline executions in the system."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The ExecutionResult interface defines the structure of the result returned after executing a pipeline, including its status and duration. It is essential for tracking the outcome of pipeline executions in the system." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The ExecutionResult interface defines the structure of the result returned after executing a pipeline, including its status and duration. It is essential for tracking the outcome of pipeline executions in the system.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executionresult:interface" type="interface" identity="ExecutionResult" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="ExecutionResult interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the ExecutionResult interface."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the ExecutionResult interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ExecutionResult {
  executionId: string
  pipelineId: string
  status: 'completed' | 'failed' | 'cancelled'
  stages: StageResult[]
  durationMs: number
  error?: string
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executionresult:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='The ExecutionResult interface defines the structure of the result returned after executing a pipeline, including its status and duration.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="The PipelineStage interface defines the structure for a stage in a data processing pipeline, specifying the type of stage and its configuration options."]
// CIL[DOC-RESPONSIBILITY responsibility="The PipelineStage interface defines the structure for a stage in a data processing pipeline, specifying the type of stage and its configuration options. It allows for flexible error handling and configuration management within the pipeline execution."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The PipelineStage interface defines the structure for a stage in a data processing pipeline, specifying the type of stage and its configuration options. It allows for flexible error handling and configuration management within the pipeline execution." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The PipelineStage interface defines the structure for a stage in a data processing pipeline, specifying the type of stage and its configuration options. It allows for flexible error handling and configuration management within the pipeline execution.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:pipelinestage:interface" type="interface" identity="PipelineStage" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="PipelineStage interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the PipelineStage interface."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the PipelineStage interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface PipelineStage {
  stage_type: string
  config?: Record<string, any>
  continue_on_error?: boolean
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:pipelinestage:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='The PipelineStage interface defines the structure for a stage in a data processing pipeline, specifying the type of stage and its configuration options.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Pipeline execution orchestrator that manages stage processing and error handling."]
// CIL[DOC-RESPONSIBILITY responsibility="Runs a specified pipeline by executing its stages in sequence, tracking their results and handling errors. This function manages the lifecycle of a pipeline execution, including logging and database updates."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="pipelineId: string (required) — The unique identifier of the pipeline to run.\\ntriggerData: any (optional) — Data to trigger the pipeline execution.\\nctx: CoreContext (required) — The context containing execution metadata and user information." outputs="Promise<ExecutionResult> — Returns the result of the pipeline execution, including stage results." errors="Error — Pipeline not found or inactive: {pipelineId}, Error — Failed to create execution: {execError?.message}, Error — Action not found for stage type: {stage.stage_type}, Error — Stage {i} ({stage.stage_type}) failed: {errorMessage}" side_effects="Writes to 'pipeline_executions' table, emits audit events. dependencies="adminDb.from('pipelines'), adminDb.from('pipeline_executions'), adminDb.from('actions'), executeStage, emitAudit"]
// CIL[DOC-MICRO logic_summary="Iterates through pipeline stages, executing each stage while capturing results and handling potential errors based on stage configuration." notable_decisions="Handles errors at each stage and decides whether to continue based on stage configuration."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Runs a specified pipeline by executing its stages in sequence, tracking their results and handling errors. This function manages the lifecycle of a pipeline execution, including logging and database updates.
 *
 * @macro       Pipeline execution orchestrator that manages stage processing and error handling.
 * @micro       Iterates through pipeline stages, executing each stage while capturing results and handling potential errors based on stage configuration.
 * @inputSpec
 *   pipelineId: string (required) — The unique identifier of the pipeline to run.
 *   triggerData: any (optional) — Data to trigger the pipeline execution.
 *   ctx: CoreContext (required) — The context containing execution metadata and user information.
 * @outputSpec  Promise<ExecutionResult> — Returns the result of the pipeline execution, including stage results.
 * @throws      Error — Pipeline not found or inactive: {pipelineId}, Error — Failed to create execution: {execError?.message}, Error — Action not found for stage type: {stage.stage_type}, Error — Stage {i} ({stage.stage_type}) failed: {errorMessage}
 * @sideEffects Writes to 'pipeline_executions' table, emits audit events.
 * @stability   stable
 * @calls       adminDb.from('pipelines'), adminDb.from('pipeline_executions'), adminDb.from('actions'), executeStage, emitAudit
 * @errorHandling Handles errors at each stage and decides whether to continue based on stage configuration.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:runpipeline:function" type="function" identity="runPipeline" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="runPipeline function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the runPipeline function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the runPipeline function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function runPipeline(
  pipelineId: string,
  triggerData: any,
  ctx: CoreContext
): Promise<ExecutionResult> {
  return withSpan(ctx, 'pipeline.run', async (ctx) => {
  const startTime = Date.now()

  const { data: pipeline, error: pipelineError } = await adminDb
    .from('pipelines')
    .select('*')
    .eq('id', pipelineId)
    .eq('is_active', true)
    .single()

  if (pipelineError || !pipeline) {
    throw new Error(`Pipeline not found or inactive: ${pipelineId}`)
  }

  const { data: execution, error: execError } = await adminDb
    .from('pipeline_executions')
    .insert({
      pipeline_id: pipelineId,
      status: 'running',
      trigger_data: triggerData || {},
      account_id: ctx.accountId,
      created_by: isUuid(ctx.principal?.id) ? ctx.principal?.id : null,
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (execError || !execution) {
    throw new Error(`Failed to create execution: ${execError?.message}`)
  }

  const executionId = execution.id
  const stageResults: StageResult[] = []
  const stages: PipelineStage[] = pipeline.stages || []

  try {
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      const stageStartTime = Date.now()

      try {
        const { data: action, error: actionError } = await adminDb
          .from('actions')
          .select('*')
          .eq('slug', stage.stage_type)
          .eq('is_active', true)
          .single()

        if (actionError || !action) {
          throw new Error(`Action not found for stage type: ${stage.stage_type}`)
        }

        const mergedConfig = {
          ...action.config,
          ...stage.config,
          _pipelineId: pipelineId,
          _executionId: executionId,
          _stageIndex: i,
          _triggerData: triggerData
        }

        const output = await executeStage(ctx, action, mergedConfig)

        stageResults.push({
          stageIndex: i,
          stageType: stage.stage_type,
          status: 'success',
          output,
          durationMs: Date.now() - stageStartTime
        })

      } catch (stageError: any) {
        const errorMessage = stageError.message || 'Stage execution failed'
        
        stageResults.push({
          stageIndex: i,
          stageType: stage.stage_type,
          status: 'failed',
          error: errorMessage,
          durationMs: Date.now() - stageStartTime
        })

        if (!stage.continue_on_error) {
          throw new Error(`Stage ${i} (${stage.stage_type}) failed: ${errorMessage}`)
        }
      }
    }

    const durationMs = Date.now() - startTime
    
    await adminDb
      .from('pipeline_executions')
      .update({
        status: 'completed',
        result: { stages: stageResults },
        completed_at: new Date().toISOString(),
        duration_ms: durationMs
      })
      .eq('id', executionId)

    await emitAudit(ctx, 'pipeline.completed', {
      type: 'pipeline_execution',
      id: executionId,
      account_id: ctx.accountId ?? undefined
    }, {
      pipeline_id: pipelineId,
      duration_ms: durationMs,
      stages_completed: stageResults.length
    })
    await emitOutcome(ctx, 'pipeline.outcome', 'success', {
      pipeline_id: pipelineId,
      execution_id: executionId,
      stages_completed: stageResults.length,
      duration_ms: durationMs
    })

    return {
      executionId,
      pipelineId,
      status: 'completed',
      stages: stageResults,
      durationMs
    }

  } catch (error: any) {
    const durationMs = Date.now() - startTime
    
    await adminDb
      .from('pipeline_executions')
      .update({
        status: 'failed',
        result: { stages: stageResults },
        error_message: error.message,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs
      })
      .eq('id', executionId)

    await emitAudit(ctx, 'pipeline.failed', {
      type: 'pipeline_execution',
      id: executionId,
      account_id: ctx.accountId ?? undefined
    }, {
      pipeline_id: pipelineId,
      error: error.message,
      stages_completed: stageResults.length
    })
    await emitOutcome(ctx, 'pipeline.outcome', 'failure', {
      pipeline_id: pipelineId,
      execution_id: executionId,
      error: error.message,
      stages_completed: stageResults.length
    })

    return {
      executionId,
      pipelineId,
      status: 'failed',
      stages: stageResults,
      durationMs,
      error: error.message
    }
  }
}, { onEnd: emitSpan })
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:runpipeline:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Runs a specified pipeline by executing its stages in sequence, tracking their results and handling errors.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Async function orchestrating the execution of various pipeline handlers."]
// CIL[DOC-RESPONSIBILITY responsibility="Executes a specific stage of a pipeline based on the provided action and configuration. It dynamically routes the execution to the appropriate handler based on the action's module type."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="- ctx: CoreContext (required) — the context for the execution.\\n- action: any (required) — the action object containing handler information.\\n- config: any (required) — the configuration object for the handler." outputs="Promise<any> — resolves to the result of the executed handler." errors="Error — unknown handler module." side_effects="none dependencies="withSpan, executeFunctionHandler, executeIntegrationHandler, executeWebhookHandler, emitSpan"]
// CIL[DOC-MICRO logic_summary="Utilizes a switch statement to determine the handler type and delegates execution to the corresponding handler function." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Executes a specific stage of a pipeline based on the provided action and configuration. It dynamically routes the execution to the appropriate handler based on the action's module type.
 *
 * @macro       Async function orchestrating the execution of various pipeline handlers.
 * @micro       Utilizes a switch statement to determine the handler type and delegates execution to the corresponding handler function.
 * @inputSpec
 *   - ctx: CoreContext (required) — the context for the execution.
 *   - action: any (required) — the action object containing handler information.
 *   - config: any (required) — the configuration object for the handler.
 * @outputSpec  Promise<any> — resolves to the result of the executed handler.
 * @throws      Error — unknown handler module.
 * @sideEffects none
 * @stability   stable
 * @calls       withSpan, executeFunctionHandler, executeIntegrationHandler, executeWebhookHandler, emitSpan
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executestage:function" type="function" identity="executeStage" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="executeStage function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the executeStage function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the executeStage function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function executeStage(
  ctx: CoreContext,
  action: any,
  config: any
): Promise<any> {
  return withSpan(ctx, `pipeline.stage.${action.handler || action.stage_type || 'unknown'}`, async (ctx) => {
    const handlerModule = action.handler_module || 'functions'
    const handlerName = action.handler

    switch (handlerModule) {
      case 'functions':
        return await executeFunctionHandler(ctx, handlerName, config)
      
      case 'integrations':
        return await executeIntegrationHandler(ctx, handlerName, config)
      
      case 'webhook':
        return await executeWebhookHandler(ctx, action, config)
      
      default:
        throw new Error(`Unknown handler module: ${handlerModule}`)
    }
  }, { onEnd: emitSpan })
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executestage:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Executes a specific stage of a pipeline based on the provided action and configuration.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// Resolves {{trigger.*}} and {{record.*}} placeholders in stage config values.
// `trigger` is the triggerData envelope; `record` is the entity row that fired
// it (triggerData.entity.data), so {{record.data.action_type}} reaches into the
// record's jsonb and {{record.account_id}} gives the emitting account.
// CIL[DOC-MACRO purpose="Template resolver for dynamic content generation."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolves template strings by replacing placeholders with corresponding values from the provided trigger data. This function is used to dynamically generate content based on the context of the trigger data."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="- value: any (required) — the input value which may contain template strings, arrays, or objects.\\n- triggerData: any (required) — the data context used for resolving template placeholders." outputs="any — the resolved value with templates replaced or the original value if no templates were found." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Utilizes a recursive approach to handle strings, arrays, and objects for template resolution." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Resolves template strings by replacing placeholders with corresponding values from the provided trigger data. This function is used to dynamically generate content based on the context of the trigger data.
 *
 * @macro       Template resolver for dynamic content generation.
 * @micro       Utilizes a recursive approach to handle strings, arrays, and objects for template resolution.
 * @inputSpec
 *   - value: any (required) — the input value which may contain template strings, arrays, or objects.
 *   - triggerData: any (required) — the data context used for resolving template placeholders.
 * @outputSpec  any — the resolved value with templates replaced or the original value if no templates were found.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:resolvetemplates:function" type="function" identity="resolveTemplates" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="resolveTemplates function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the resolveTemplates function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the resolveTemplates function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function resolveTemplates(value: any, triggerData: any): any {
  const roots: Record<string, any> = {
    trigger: triggerData,
    record: triggerData?.entity?.data,
  }
  if (typeof value === 'string') {
    if (!value.includes('{{')) return value
    return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, rawPath) => {
      const parts = String(rawPath).trim().split('.')
      let cur: any = roots[parts[0]]
      if (cur === undefined) return match
      for (const part of parts.slice(1)) {
        if (cur == null) return match
        cur = cur[part]
      }
      return cur == null ? '' : String(cur)
    })
  }
  if (Array.isArray(value)) return value.map(v => resolveTemplates(v, triggerData))
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) out[k] = resolveTemplates(v, triggerData)
    return out
  }
  return value
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:resolvetemplates:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Resolves template strings by replacing placeholders with corresponding values from the provided trigger data.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Async function that retrieves account IDs from a database using a slug."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolves an account ID based on a provided slug. This function exists to facilitate the retrieval of account identifiers in a structured manner."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext (required) — the context object containing necessary execution context.\\nslug: string (required) — the slug used to identify the account." outputs="Promise<string> — resolves to the account ID as a string." errors="Error — if the slug does not resolve to an account." side_effects="none dependencies="adminDb.from('accounts')"]
// CIL[DOC-MICRO logic_summary="Queries the database for an account ID matching the provided slug and throws an error if not found." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Resolves an account ID based on a provided slug. This function exists to facilitate the retrieval of account identifiers in a structured manner.
 *
 * @macro       Async function that retrieves account IDs from a database using a slug.
 * @micro       Queries the database for an account ID matching the provided slug and throws an error if not found.
 * @inputSpec
 *   ctx: CoreContext (required) — the context object containing necessary execution context.
 *   slug: string (required) — the slug used to identify the account.
 * @outputSpec  Promise<string> — resolves to the account ID as a string.
 * @throws      Error — if the slug does not resolve to an account.
 * @sideEffects none
 * @stability   stable
 * @calls       adminDb.from('accounts')
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:resolveaccountid:function" type="function" identity="resolveAccountId" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="resolveAccountId function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the resolveAccountId function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the resolveAccountId function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function resolveAccountId(ctx: CoreContext, slug: string): Promise<string> {
  const { data } = await adminDb
    .from('accounts').select('id').eq('slug', slug).maybeSingle()
  if (!data?.id) throw new Error(`account_slug '${slug}' did not resolve to an account`)
  return data.id
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:resolveaccountid:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Resolves an account ID based on a provided slug.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="The stageHandlers constant defines a set of asynchronous functions for handling various stages of a pipeline, specifically for updating and creating records in a database."]
// CIL[DOC-RESPONSIBILITY responsibility="The stageHandlers constant defines a set of asynchronous functions for handling various stages of a pipeline, specifically for updating and creating records in a database. It ensures that necessary parameters are provided and manages database interactions based on the provided configuration."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="Error — entity is required for update_item; Error — record_id missing and match found no record; Error — entity and data are required for create_record; Error — Update failed: {error.message}" side_effects="Database writes for updating or creating records. dependencies="adminDb.from, resolveTemplates, resolveAccountId"]
// CIL[DOC-MICRO logic_summary="The stageHandlers constant defines a set of asynchronous functions for handling various stages of a pipeline, specifically for updating and creating records in a database. It ensures that necessary parameters are provided and manages database interactions based on the provided configuration." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The stageHandlers constant defines a set of asynchronous functions for handling various stages of a pipeline, specifically for updating and creating records in a database. It ensures that necessary parameters are provided and manages database interactions based on the provided configuration.
 *
 * @throws      Error — entity is required for update_item; Error — record_id missing and match found no record; Error — entity and data are required for create_record; Error — Update failed: {error.message}
 * @sideEffects Database writes for updating or creating records.
 * @stability   stable
 * @calls       adminDb.from, resolveTemplates, resolveAccountId
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:stagehandlers:constant" type="constant" identity="stageHandlers" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="stageHandlers constant — registry of built-in pipeline stage executors keyed by stage_type slug"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements each built-in stage type: record writes (update_item/create_record), outbound (http_request/send_notification), orchestration (run_pipeline/query_items/agent_inference), knowledge (search_knowledge/generate_embeddings/revoke_embeddings/kb_ingest/kb_revoke), and create_interaction."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=".framework/functions/_shared/kb.ts,.framework/functions/embeddings.ts,.framework/migrations/053_builtin_action_seeds.sql,.framework/migrations/054_kb_ingest_lease.sql"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, config: stage config (item_id/document_id accept {{trigger.entity_id}}/{{entity_id}} templates)" outputs="stage-specific result object" errors="Error on missing required config keys or unresolved templates" side_effects="DB writes and/or outbound calls per stage type"]
// CIL[DOC-MICRO logic_summary="Template-bearing id fields resolve against config._triggerData then dynamic-import their engine — kb_ingest/kb_revoke import _shared/kb (canonical typed path with document lease); generate_embeddings/revoke_embeddings import functions/embeddings (legacy engine) and remain for cortex pipelines." notable_decisions="kb_ingest accepts item_id or document_id; kb_revoke accepts document_id or item_id — matching the seeded demo pipeline configs"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const stageHandlers: Record<string, Function> = {
  'update_item': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    const { entity } = config
    let recordId = config.record_id ? resolveTemplates(config.record_id, triggerData) : null

    if (!entity) {
      throw new Error('entity is required for update_item')
    }

    // Optional record lookup: match finds the target row when the pipeline
    // doesn't know its id (e.g. the deal linked to a prospect account).
    let existing: any = null
    if (!recordId && config.match) {
      const m = resolveTemplates(config.match, triggerData)
      let q = adminDb.from(entity).select('*').limit(1)
      if (m.account_slug) {
        q = q.eq('account_id', await resolveAccountId(ctx, m.account_slug))
      } else if (m.account_id) {
        q = q.eq('account_id', m.account_id)
      } else {
        q = q.eq('account_id', ctx.accountId)
      }
      for (const [key, value] of Object.entries(m.filters || {})) {
        q = q.eq(key, value as any)
      }
      const { data: found } = await q
      existing = found?.[0] || null
      recordId = existing?.id
    }
    if (!recordId) {
      throw new Error('update_item: record_id missing and match found no record')
    }

    let updateData = resolveTemplates(config.data, triggerData)
    // Merge nested data jsonb — stage configs carry only the keys they change.
    if (updateData?.data) {
      if (!existing) {
        const { data: cur } = await adminDb.from(entity).select('data').eq('id', recordId).single()
        existing = cur
      }
      updateData = { ...updateData, data: { ...(existing?.data || {}), ...updateData.data } }
    }

    const { data: result, error } = await adminDb
      .from(entity)
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: ctx.principal?.id
      })
      .eq('id', recordId)
      .select()
      .single()

    if (error) throw new Error(`Update failed: ${error.message}`)
    return { success: true, record: result }
  },

  'create_record': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    const { entity } = config
    const data = resolveTemplates(config.data, triggerData)

    if (!entity || !data) {
      throw new Error('entity and data are required for create_record')
    }

    // Optional cross-account target (e.g. a record lives in the platform
    // account while the trigger fires in a customer account).
    let accountId = ctx.accountId
    if (config.account_slug) {
      accountId = await resolveAccountId(ctx, resolveTemplates(config.account_slug, triggerData))
    }

    // Optional idempotency — skip the insert when a matching record exists.
    if (config.dedupe?.field) {
      const value = resolveTemplates(config.dedupe.value, triggerData)
      let q = adminDb.from(entity).select('*').eq(config.dedupe.field, value)
      if (config.dedupe.account_scoped !== false) q = q.eq('account_id', accountId)
      const { data: found } = await q.limit(1)
      if (found?.length) return { success: true, record: found[0], deduped: true }
    }

    const { data: result, error } = await adminDb
      .from(entity)
      .insert({
        ...data,
        account_id: accountId,
        created_by: isUuid(ctx.principal?.id) ? ctx.principal?.id : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(`Create failed: ${error.message}`)
    return { success: true, record: result }
  },

  'http_request': async (ctx: CoreContext, config: any) => {
    const { method = 'GET', url, headers = {}, body } = config
    
    if (!url) {
      throw new Error('url is required for http_request')
    }

    const result = await executeOutbound(ctx, {
      integration_slug: 'generic-http',
      action_config: { url, method, headers, body: ['POST', 'PUT', 'PATCH'].includes(method) ? body : undefined }
    })

    return {
      success: true,
      status: result.response_status,
      body: result.response_body
    }
  },

  'send_notification': async (ctx: CoreContext, config: any) => {
    const { message, entity_type, entity_id, recipients = [] } = config

    // watchers is the subscription table (who follows what) — deliveries go to
    // the notifications table, one row per recipient. Migration 050 adds it.
    // CIL[DOC-NOTE type="behavior" content="Recipients may be person UUIDs or 'role:<slug>' handles — resolveNotificationRecipients maps role slugs to this account's active people ids; a role matching nobody is a valid 0-notification result, not an error."]
    const personIds = await resolveNotificationRecipients(ctx, recipients)
    const notifications = personIds.map((recipientId: string) => ({
      account_id: ctx.accountId,
      person_id: recipientId,
      message,
      source_type: 'pipeline_execution',
      source_id: entity_id || ctx.requestId,
      target_type: entity_type || null,
      target_id: entity_id && /^[0-9a-f-]{36}$/i.test(entity_id) ? entity_id : null,
      is_read: false,
    }))

    if (notifications.length > 0) {
      const { error } = await adminDb
        .from('notifications')
        .insert(notifications)

      if (error) throw new Error(`Notification failed: ${error.message}`)
    }

    return { success: true, notified_count: notifications.length }
  },

  'run_pipeline': async (ctx: CoreContext, config: any) => {
    const { pipeline_id, trigger_data = {} } = config
    
    if (!pipeline_id) {
      throw new Error('pipeline_id is required for run_pipeline')
    }

    if (config._pipelineId === pipeline_id) {
      throw new Error('Recursive pipeline execution prevented')
    }

    const result = await runPipeline(pipeline_id, trigger_data, ctx)
    return { 
      success: result.status === 'completed',
      execution_id: result.executionId,
      nested_result: result 
    }
  },

  'search_knowledge': async (ctx: CoreContext, config: any) => {
    const { query, knowledge_sources, model_id, limit = 5, threshold = 0.7 } = config

    if (!query) {
      throw new Error('query is required for search_knowledge')
    }

    // Enforce the app knowledge envelope — the pipeline's owning app is the
    // server-side authority (a client-supplied app hint is only a fallback).
    let appRef: string | null = (ctx as any).appId || null
    if (config._pipelineId) {
      const { data: p } = await adminDb
        .from('pipelines')
        .select('app_id')
        .eq('id', config._pipelineId)
        .maybeSingle()
      if (p?.app_id) appRef = p.app_id
    }
    const scope = await resolveKnowledgeScope(ctx, appRef, {})
    if (!scope.allowed) {
      return {
        results: [],
        count: 0,
        method: 'denied',
        error: `knowledge_denied: ${scope.deniedReason}`,
        query
      }
    }

    let dbQuery = adminDb
      .from('embeddings')
      .select('*')
      .in('account_id', scope.accountIds)
      .limit(limit)

    if (knowledge_sources && knowledge_sources.length > 0) {
      dbQuery = dbQuery.in('document_id', knowledge_sources)
    }

    if (model_id) {
      dbQuery = dbQuery.eq('model_id', model_id)
    }

    const { data: textResults, error: textError } = await dbQuery
      .textSearch('content', query, { type: 'websearch', config: 'english' })

    const inScope = (rows: any[]) => (rows || []).filter((r: any) => knowledgeRowAllowed(scope, r))

    if (!textError && textResults && inScope(textResults).length > 0) {
      const rows = inScope(textResults)
      return {
        results: rows,
        count: rows.length,
        method: 'text_search',
        query
      }
    }

    const { data: fallbackResults, error: fallbackError } = await dbQuery
      .ilike('content', `%${query}%`)

    if (fallbackError) {
      throw new Error(`Knowledge search failed: ${fallbackError.message}`)
    }

    const scopedResults = inScope(fallbackResults || [])
    return {
      results: scopedResults,
      count: scopedResults.length,
      method: 'fallback_ilike',
      query
    }
  },

  'query_items': async (ctx: CoreContext, config: any) => {
    const { entity, filters = {}, query, limit = 10 } = config
    
    if (!entity) {
      throw new Error('entity is required for query_items')
    }

    let dbQuery = adminDb
      .from(entity)
      .select('*')
      .eq('account_id', ctx.accountId)
      .limit(parseInt(limit.toString()))

    Object.entries(filters).forEach(([key, value]) => {
      dbQuery = dbQuery.eq(key, value)
    })

    if (query) {
      dbQuery = dbQuery.textSearch('data', query, { type: 'websearch', config: 'english' })
    }

    const { data, error } = await dbQuery

    if (error) throw new Error(`Query failed: ${error.message}`)
    return { items: data || [], count: data?.length || 0 }
  },

  'agent_inference': async (ctx: CoreContext, config: any) => {
    const { context, model, temperature, max_tokens, webhook_url, headers = {} } = config
    
    if (!context) {
      throw new Error('context is required for agent_inference')
    }

    if (webhook_url) {
      const result = await executeOutbound(ctx, {
        integration_slug: 'generic-http',
        action_config: {
          url: webhook_url,
          method: 'POST',
          headers,
          body: {
            context,
            model: model || 'gpt-4o',
            temperature: temperature ?? 0.7,
            max_tokens: max_tokens ?? 4000
          }
        }
      })

      if (!result.success) {
        throw new Error(`Inference failed: ${result.response_status} ${result.response_body}`)
      }

      const response: any = result.response_body
      return {
        content: response.content || response.message || '',
        confidence: response.confidence || 0.8,
        tool_calls: response.tool_calls,
        metadata: response.metadata,
        model: model || 'gpt-4o'
      }
    }

    return {
      content: `[Mock Response] Received ${context.length} chars of context. In production, configure webhook_url in action config.`,
      confidence: 0.9,
      tool_calls: null,
      metadata: { mock: true },
      model: model || 'gpt-4o'
    }
  },

  'generate_embeddings': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    let itemId = config.item_id
    if (!itemId) throw new Error('item_id is required for generate_embeddings')

    if (typeof itemId === 'string' && itemId.includes('{{')) {
      itemId = itemId
        .replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
        .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
    }

    if (!itemId) throw new Error('generate_embeddings: could not resolve item_id from trigger data')

    const { generate } = await import('../embeddings')
    const genCtx = { ...ctx, query: { ...((ctx as any).query || {}), action: 'generate' } } as any
    return await generate(genCtx, {
      item_id: itemId,
      force_regenerate: config.force_regenerate ?? false,
    })
  },

  'revoke_embeddings': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    let documentId = config.document_id ?? config.item_id
    if (!documentId) throw new Error('document_id is required for revoke_embeddings')

    if (typeof documentId === 'string' && documentId.includes('{{')) {
      documentId = documentId
        .replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
        .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
    }

    if (!documentId) throw new Error('revoke_embeddings: could not resolve document_id from trigger data')

    const { revoke } = await import('../embeddings')
    const genCtx = { ...ctx, query: { ...((ctx as any).query || {}), action: 'revoke' } } as any
    return await revoke(genCtx, { document_id: documentId })
  },

  // CIL[DOC-NOTE type="behavior" content="kb_ingest/kb_revoke wrap the canonical typed path in _shared/kb.ts (content-hash lease, declared vector fields, supersede_keys supersession) — unlike generate_embeddings/revoke_embeddings which hit the legacy embeddings engine. Both stage types remain registered; new pipelines should prefer kb_ingest/kb_revoke."]
  'kb_ingest': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    let itemId = config.item_id ?? config.document_id
    if (!itemId) throw new Error('item_id is required for kb_ingest')

    if (typeof itemId === 'string' && itemId.includes('{{')) {
      itemId = itemId
        .replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
        .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
    }

    if (!itemId) throw new Error('kb_ingest: could not resolve item_id from trigger data')

    const { kbIngest } = await import('./kb')
    return await kbIngest(ctx, { id: itemId })
  },

  'kb_revoke': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    let itemId = config.document_id ?? config.item_id
    if (!itemId) throw new Error('document_id is required for kb_revoke')

    if (typeof itemId === 'string' && itemId.includes('{{')) {
      itemId = itemId
        .replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
        .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
    }

    if (!itemId) throw new Error('kb_revoke: could not resolve document_id from trigger data')

    const { kbRevoke } = await import('./kb')
    return await kbRevoke(ctx, { id: itemId })
  },

  'create_interaction': async (ctx: CoreContext, config: any) => {
    const triggerData = config._triggerData || {}
    const entityData = triggerData?.entity?.data || {}
    const resolveField = (v: any) => typeof v === 'string'
      ? v.replace(/\{\{trigger\.entity_id\}\}/g, triggerData?.entity_id || '')
          .replace(/\{\{entity_id\}\}/g, triggerData?.entity_id || '')
          .replace(/\{\{trigger\.thread_id\}\}/g, entityData?.thread_id || '')
      : v

    const aiMessageId = resolveField(config.ai_message_id) || triggerData?.entity_id
    const threadId = resolveField(config.thread_id) || entityData?.thread_id
    if (!aiMessageId && !threadId) throw new Error('create_interaction: could not resolve ai_message_id or thread_id from trigger data')

    const { createInteraction } = await import('../ai-interactions')
    const genCtx = { ...ctx, query: { ...((ctx as any).query || {}), action: 'create_interaction' } } as any
    // CIL[DOC-NOTE type="behavior" content="config.type_slug passes through to createInteraction (default ai_feedback_record when unset) so apps can record interactions under their own item type, e.g. demo_feedback_record."]
    return await createInteraction(genCtx, {
      ai_message_id: aiMessageId,
      thread_id: threadId,
      retrieved_sources: config.retrieved_sources ?? entityData?.data?.retrieved_sources,
      ai_confidence: config.ai_confidence ?? entityData?.data?.confidence,
      retrieval_confidence: config.retrieval_confidence ?? entityData?.data?.mean_similarity,
      type_slug: config.type_slug,
    })
  },
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:stagehandlers:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='The stageHandlers constant defines a set of asynchronous functions for handling various stages of a pipeline, specifically for updating and creating records in a database.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]






// CIL[DOC-MACRO purpose="Handler executor that dynamically invokes function handlers based on their names."]
// CIL[DOC-RESPONSIBILITY responsibility="Executes a specified function handler with the provided context and configuration. This function ensures that the handler exists before attempting to invoke it."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext (required) — the context in which the handler is executed.\\nhandlerName: string (required) — the name of the handler to execute.\\nconfig: any (required) — configuration parameters for the handler." outputs="Promise<any> — the result of the handler execution." errors="Error — if the handler name is unknown." side_effects="none"]
// CIL[DOC-MICRO logic_summary="Retrieves the handler from a collection and invokes it with the provided context and configuration." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Executes a specified function handler with the provided context and configuration. This function ensures that the handler exists before attempting to invoke it.
 *
 * @macro       Handler executor that dynamically invokes function handlers based on their names.
 * @micro       Retrieves the handler from a collection and invokes it with the provided context and configuration.
 * @inputSpec
 *   ctx: CoreContext (required) — the context in which the handler is executed.
 *   handlerName: string (required) — the name of the handler to execute.
 *   config: any (required) — configuration parameters for the handler.
 * @outputSpec  Promise<any> — the result of the handler execution.
 * @throws      Error — if the handler name is unknown.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executefunctionhandler:function" type="function" identity="executeFunctionHandler" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="executeFunctionHandler function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the executeFunctionHandler function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the executeFunctionHandler function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function executeFunctionHandler(
  ctx: CoreContext,
  handlerName: string,
  config: any
): Promise<any> {
  const handler = stageHandlers[handlerName]
  
  if (!handler) {
    throw new Error(`Unknown function handler: ${handlerName}`)
  }

  return await handler(ctx, config)
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executefunctionhandler:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Executes a specified function handler with the provided context and configuration.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Async function that triggers integration actions based on provided configuration."]
// CIL[DOC-RESPONSIBILITY responsibility="Executes an integration handler by importing the execute function from the integration-outbound module and passing the necessary parameters. This function facilitates the integration process by providing a structured way to handle integration actions."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext (required) — the core context for the integration execution.\\nhandlerName: string (required) — the name of the integration handler to execute.\\nconfig: any (required) — configuration object containing integration parameters." outputs="Promise<any> — resolves with the result of the integration execution." errors="none" side_effects="calls external integration service to execute the handler. dependencies="execute"]
// CIL[DOC-MICRO logic_summary="Imports the execute function dynamically and invokes it with a context and action configuration." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Executes an integration handler by importing the execute function from the integration-outbound module and passing the necessary parameters. This function facilitates the integration process by providing a structured way to handle integration actions.
 *
 * @macro       Async function that triggers integration actions based on provided configuration.
 * @micro       Imports the execute function dynamically and invokes it with a context and action configuration.
 * @inputSpec
 *   ctx: CoreContext (required) — the core context for the integration execution.
 *   handlerName: string (required) — the name of the integration handler to execute.
 *   config: any (required) — configuration object containing integration parameters.
 * @outputSpec  Promise<any> — resolves with the result of the integration execution.
 * @sideEffects calls external integration service to execute the handler.
 * @stability   stable
 * @calls       execute
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executeintegrationhandler:function" type="function" identity="executeIntegrationHandler" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="executeIntegrationHandler function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the executeIntegrationHandler function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the executeIntegrationHandler function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function executeIntegrationHandler(
  ctx: CoreContext,
  handlerName: string,
  config: any
): Promise<any> {
  const { execute } = await import('../integration-outbound')
  return execute(ctx, {
    integration_slug: handlerName,
    record_id: config.record_id,
    action_config: config
  })
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executeintegrationhandler:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Executes an integration handler by importing the execute function from the integration-outbound module and passing the necessary parameters.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Executes a webhook action by sending an HTTP request to a specified URL with the provided configuration."]
// CIL[DOC-RESPONSIBILITY responsibility="Executes a webhook action by sending an HTTP request to a specified URL with the provided configuration. This function is designed to facilitate integration with external services via webhooks."]
// CIL[DOC-CONTEXT module="pipeline-runner" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/outcomes,.framework/functions/_shared/tracing,.framework/functions/integration-outbound"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext (required) — the context for the execution environment.\\naction: any (required) — the action configuration containing the webhook details.\\nconfig: any (required) — the body content to send with the webhook request." outputs="Promise<any> — resolves to an object containing success status, response status, and response body." errors="Error — Webhook URL not configured in action" side_effects="Makes an external HTTP request to the specified webhook URL. dependencies="execute"]
// CIL[DOC-MICRO logic_summary="Executes a webhook action by sending an HTTP request to a specified URL with the provided configuration. This function is designed to facilitate integration with external services via webhooks." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Executes a webhook action by sending an HTTP request to a specified URL with the provided configuration. This function is designed to facilitate integration with external services via webhooks.
 *
 * @inputSpec
 *   ctx: CoreContext (required) — the context for the execution environment.
 *   action: any (required) — the action configuration containing the webhook details.
 *   config: any (required) — the body content to send with the webhook request.
 * @outputSpec  Promise<any> — resolves to an object containing success status, response status, and response body.
 * @throws      Error — Webhook URL not configured in action
 * @sideEffects Makes an external HTTP request to the specified webhook URL.
 * @stability   stable
 * @calls       execute
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executewebhookhandler:function" type="function" identity="executeWebhookHandler" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="executeWebhookHandler function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the executeWebhookHandler function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/pipeline-runner.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the executeWebhookHandler function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function executeWebhookHandler(
  ctx: CoreContext,
  action: any,
  config: any
): Promise<any> {
  const { url, method = 'POST', headers = {} } = action.config || {}
  
  if (!url) {
    throw new Error('Webhook URL not configured in action')
  }

  const { execute } = await import('../integration-outbound')
  const result = await execute(ctx, {
    integration_slug: 'generic-http',
    action_config: {
      url,
      method,
      headers,
      body: config,
      credential_field: 'api_token'
    }
  })

  return {
    success: result.success,
    status: result.response_status,
    body: result.response_body
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:executewebhookhandler:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Executes a webhook action by sending an HTTP request to a specified URL with the provided configuration.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
