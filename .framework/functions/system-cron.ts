// CIL[BEGIN stable_id="~/.framework/functions/system-cron.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/system-cron.ts"]
// CIL[DOC-MACRO purpose="Imports shared middleware, database, audit, pipeline and retry helpers for the system-cron Netlify function."]
// CIL[DOC-RESPONSIBILITY responsibility="Sets up module dependencies and shared imports for the cron handler."]
// CIL[DOC-CONTEXT module="system-cron" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/retry-deliveries.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports required shared modules for database access, audit logging, pipeline execution and delivery retries." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers,operators"]
import { createHandler, RequestContext } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitAudit } from './_shared/audit'
import { runPipeline } from './_shared/pipeline-runner'
import { retryPendingDeliveries } from './_shared/retry-deliveries'
// CIL[DOC-VECTOR type="context" content="purpose='Imports shared middleware, database, audit, pipeline and retry helpers for the system-cron Netlify function.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system-cron.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/system-cron.ts:SCHEDULER_API_KEY:constant" type="constant" identity="SCHEDULER_API_KEY" parent="~/.framework/functions/system-cron.ts"]
// CIL[DOC-MACRO purpose="Resolves the scheduler API key from Node or Deno environment variables."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the secret key used to authenticate cron requests."]
// CIL[DOC-CONTEXT module="system-cron" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/system-cron.ts"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTRACT inputs="none" outputs="string | undefined" errors="none" side_effects="reads environment variables"]
// CIL[DOC-MICRO logic_summary="Reads SCHEDULER_API_KEY from process.env or Deno.env, falling back to undefined." notable_decisions="none"]
// CIL[DOC-AUDIENCE audience="developers"]
const SCHEDULER_API_KEY: string | undefined = (globalThis as any).process?.env?.SCHEDULER_API_KEY || (globalThis as any).Deno?.env?.get?.('SCHEDULER_API_KEY')
// CIL[END stable_id="~/.framework/functions/system-cron.ts:SCHEDULER_API_KEY:constant"]

// CIL[DOC-VECTOR type="context" content="purpose='Resolves the scheduler API key from Node or Deno environment variables.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]





// CIL[BEGIN stable_id="~/.framework/functions/system-cron.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/system-cron.ts"]
// CIL[DOC-MACRO purpose="Netlify function entrypoint that runs scheduled actions, timers, threshold checks, retries and daily log cleanup."]
// CIL[DOC-RESPONSIBILITY responsibility="Executes the cron loop for due schedules and timers, evaluates thresholds, retries pending deliveries and cleans logs at midnight."]
// CIL[DOC-CONTEXT module="system-cron" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/system-cron.ts"]
// CIL[DOC-CONTRACT inputs="RequestContext" outputs="HTTP 200/403/500 response" errors="Throws on schedule or timer failures; returns 403 for auth failures and 500 for system errors." side_effects="Reads and writes schedule_executions, runs pipelines, emits audit events, updates schedules and timers."]
// CIL[DOC-MICRO logic_summary="Validates scheduler API key or internal machine principal, fetches due schedules and timers, executes each action with scoped machine context, evaluates threshold alerts, retries pending deliveries, cleans logs at midnight, and returns a summary." notable_decisions="Uses a global try/catch to convert unhandled errors into a 500 response; runs threshold and log cleanup in non-failing branches; handles both Node and Deno runtimes for API key."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
export const handler = createHandler(async (ctx: RequestContext) => {
  const requestApiKey = ctx.query?.api_key || ctx.query?.scheduler_key
  
  if (requestApiKey !== SCHEDULER_API_KEY) {
    if (ctx.principal?.type !== 'machine' || ctx.principal?.machineType !== 'internal') {
      await emitAudit(ctx, 'system_cron.unauthorized_access', {
        type: 'system',
        account_id: ctx.accountId || undefined
      }, { result: 'denied', error: 'Invalid or missing scheduler authentication' })
      
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden - Invalid scheduler authentication' })
      }
    }
  }
  
  const results: Array<{
    scheduleId: string
    actionId: string
    status: 'success' | 'failed' | 'skipped'
    error?: string
    durationMs: number
  }> = []
  
  try {
    const { data: dueSchedules, error: schedulesError } = await adminDb.rpc('get_due_schedules', {
      p_now: new Date().toISOString()
    })
    
    if (schedulesError) {
      throw new Error(`Failed to fetch due schedules: ${schedulesError.message}`)
    }
    
    if (!dueSchedules || dueSchedules.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No schedules due for execution',
          executed: 0,
          results: []
        })
      }
    }
    
    for (const schedule of dueSchedules) {
      const startTime = Date.now()
      
      try {
        const { data: validation, error: validationError } = await adminDb.rpc('validate_schedule_creator', {
          p_schedule_id: schedule.schedule_id
        })
        
        if (validationError || !validation?.is_valid) {
          results.push({
            scheduleId: schedule.schedule_id,
            actionId: schedule.action_id,
            status: 'skipped',
            error: validation?.error_message || 'Schedule validation failed',
            durationMs: Date.now() - startTime
          })
          continue
        }
        
        const { data: action, error: actionError } = await adminDb
          .from('actions')
          .select('*')
          .eq('id', schedule.action_id)
          .single()
        
        if (actionError || !action) {
          throw new Error(`Action not found: ${schedule.action_id}`)
        }
        
        const { data: machine, error: machineError } = await adminDb
          .from('api_keys')
          .select('*')
          .eq('id', schedule.machine_principal_id)
          .single()
        
        if (machineError || !machine) {
          throw new Error(`Machine principal not found: ${schedule.machine_principal_id}`)
        }
        
        const executionCtx: RequestContext = {
          requestId: ctx.requestId,
          principal: {
            id: machine.id,
            type: 'machine',
            accountId: machine.account_id,
            scopes: schedule.delegated_scopes || machine.scopes || [],
            machineType: machine.machine_type,
            isInternal: machine.is_internal,
            provenance: {
              sourceType: 'cron',
              createdBy: machine.created_by,
              invokedAt: new Date().toISOString(),
              cronId: schedule.schedule_id
            }
          },
          db: adminDb,
          accountId: machine.account_id,
          appId: null,
          requestPath: '/.netlify/functions/system-cron',
          query: {}
        }
        
        const requiredScope = action.required_scopes?.[0] || `${action.handler}:execute`
        const hasScope = executionCtx.principal.scopes?.includes(requiredScope) ||
                        executionCtx.principal.scopes?.includes('*:*')
        
        if (!hasScope) {
          throw new Error(`Machine lacks required scope: ${requiredScope}`)
        }
        
        const executionResult = await executeAction(executionCtx, action, schedule.config)
        
        await adminDb.from('schedule_executions').insert({
          schedule_id: schedule.schedule_id,
          account_id: schedule.account_id,
          machine_principal_id: machine.id,
          status: 'success',
          input_params: schedule.config,
          output_result: executionResult,
          duration_ms: Date.now() - startTime
        })
        
        await adminDb.rpc('update_schedule_after_run', {
          p_schedule_id: schedule.schedule_id,
          p_success: true,
          p_error_message: null
        })
        
        await emitAudit(executionCtx, 'schedule.execute', {
          type: 'schedule',
          id: schedule.schedule_id,
          account_id: schedule.account_id
        }, {
          action_id: action.id,
          action_handler: action.handler,
          result: 'success'
        })
        
        results.push({
          scheduleId: schedule.schedule_id,
          actionId: schedule.action_id,
          status: 'success',
          durationMs: Date.now() - startTime
        })
        
      } catch (execError: any) {
        const errorMessage = execError.message || 'Execution failed'
        
        await adminDb.from('schedule_executions').insert({
          schedule_id: schedule.schedule_id,
          account_id: schedule.account_id,
          machine_principal_id: schedule.machine_principal_id,
          status: 'failed',
          input_params: schedule.config,
          error_message: errorMessage,
          duration_ms: Date.now() - startTime
        })
        
        await adminDb.rpc('update_schedule_after_run', {
          p_schedule_id: schedule.schedule_id,
          p_success: false,
          p_error_message: errorMessage
        })
        
        results.push({
          scheduleId: schedule.schedule_id,
          actionId: schedule.action_id,
          status: 'failed',
          error: errorMessage,
          durationMs: Date.now() - startTime
        })
      }
    }
    
    try {
      const { data: dueTimers, error: timersError } = await adminDb.rpc('get_due_timers', {
        p_now: new Date().toISOString()
      })
      
      if (!timersError && dueTimers && dueTimers.length > 0) {
        for (const timer of dueTimers) {
          const timerStartTime = Date.now()
          
          try {
            if (!timer.pipeline_id) {
              throw new Error(`Timer ${timer.timer_id} has no pipeline_id`)
            }
            
            const timerCtx: RequestContext = {
              requestId: ctx.requestId,
              principal: {
                id: 'timer:' + timer.timer_id,
                type: 'machine' as const,
                accountId: timer.account_id,
                scopes: ['pipelines:execute'],
                machineType: 'timer',
                isInternal: true,
                provenance: {
                  sourceType: 'timer',
                  createdBy: timer.created_by,
                  invokedAt: new Date().toISOString(),
                  timerId: timer.timer_id
                }
              },
              db: adminDb,
              accountId: timer.account_id,
              appId: timer.app_id || null,
              requestPath: '/.netlify/functions/system-cron',
              query: {}
            }
            
            const result = await runPipeline(timer.pipeline_id, {
              timer_id: timer.timer_id,
              timer_name: timer.name,
              execution_count: timer.execution_count || 0
            }, timerCtx)
            
            await adminDb.rpc('update_timer_after_run', {
              p_timer_id: timer.timer_id,
              p_success: result.status === 'completed',
              p_error_message: result.error || null
            })
            
            results.push({
              scheduleId: timer.timer_id,
              actionId: timer.pipeline_id,
              status: result.status === 'completed' ? 'success' : 'failed',
              error: result.error,
              durationMs: Date.now() - timerStartTime
            })
            
          } catch (timerError: any) {
            await adminDb.rpc('update_timer_after_run', {
              p_timer_id: timer.timer_id,
              p_success: false,
              p_error_message: timerError.message
            })
            
            results.push({
              scheduleId: timer.timer_id,
              actionId: timer.pipeline_id,
              status: 'failed',
              error: timerError.message,
              durationMs: Date.now() - timerStartTime
            })
          }
        }
      }
    } catch (timerLoopError) {
      console.error('Timer execution error:', timerLoopError)
    }
    
    let thresholdResults: any[] = []
    try {
      thresholdResults = await evaluateThresholds(ctx)
      const breachedCount = thresholdResults.filter(r => r.breached).length
      const firedCount = thresholdResults.filter(r => r.fired).length
      
      if (breachedCount > 0) {
        console.log(`Thresholds: ${breachedCount} breached, ${firedCount} pipelines fired`)
      }
    } catch (thresholdError) {
      console.error('Threshold evaluation error:', thresholdError)
    }
    
    let logsCleaned = 0
    const now = new Date()
    const currentHour = now.getUTCHours()
    const currentMinute = now.getUTCMinutes()
    
    if (currentHour === 0 && currentMinute === 0) {
      try {
        logsCleaned = await cleanupOldLogs()
      } catch (cleanupError) {
        console.error('Log cleanup error:', cleanupError)
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status === 'failed').length
    const skippedCount = results.filter(r => r.status === 'skipped').length

    const retrySummary = await retryPendingDeliveries(ctx)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Executed ${results.length} total (schedules + timers)`,
        executed: results.length,
        success: successCount,
        failed: failedCount,
        skipped: skippedCount,
        thresholds_evaluated: thresholdResults.length,
        thresholds_breached: thresholdResults.filter(r => r.breached).length,
        logs_cleaned: logsCleaned,
        deliveries_retried: retrySummary,
        results
      })
    }
    
  } catch (error: any) {
    console.error('System cron error:', error)
    
    await emitAudit(ctx, 'system_cron.error', {
      type: 'system',
      account_id: ctx.accountId || undefined
    }, {
      result: 'failure',
      error: error.message
    })
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'System cron execution failed',
        message: error.message
      })
    }
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function entrypoint that runs scheduled actions, timers, threshold checks, retries and daily log cleanup.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system-cron.ts:handler:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/system-cron.ts:executeAction:function" type="function" identity="executeAction" parent="~/.framework/functions/system-cron.ts"]
// CIL[DOC-MACRO purpose="Dispatches an action to the appropriate handler module (functions, integrations or custom)."]
// CIL[DOC-RESPONSIBILITY responsibility="Merges action and schedule config and delegates to a handler module."]
// CIL[DOC-CONTEXT module="system-cron" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/system-cron.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, action: any, config: any" outputs="any handler result" errors="Throws for unknown handler module or not-implemented custom handlers." side_effects="none"]
// CIL[DOC-MICRO logic_summary="Merges config from the action with the schedule, then switches on handler_module to call the function, integration, or custom handler." notable_decisions="Custom handlers are explicitly not implemented and rejected; defaults fall through to an unknown-module error."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
async function executeAction(
  ctx: RequestContext,
  action: any,
  config: any
): Promise<any> {
  const handlerModule = action.handler_module || 'functions'
  const handlerName = action.handler
  
  const mergedConfig = {
    ...action.config,
    ...config
  }
  
  switch (handlerModule) {
    case 'functions':
      return await executeFunctionHandler(ctx, handlerName, mergedConfig)
    
    case 'integrations':
      return await executeIntegrationHandler(ctx, handlerName, mergedConfig)
    
    case 'custom':
      throw new Error(`Custom handlers not yet implemented: ${handlerName}`)
    
    default:
      throw new Error(`Unknown handler module: ${handlerModule}`)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Dispatches an action to the appropriate handler module (functions, integrations or custom).'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system-cron.ts:executeAction:function"]
// CIL[BEGIN stable_id="~/.framework/functions/system-cron.ts:executeFunctionHandler:function" type="function" identity="executeFunctionHandler" parent="~/.framework/functions/system-cron.ts"]
// CIL[DOC-MACRO purpose="Implements built-in function handlers: send_email, generate_report, notify_watchers, run_pipeline."]
// CIL[DOC-RESPONSIBILITY responsibility="Maps a handler name to a typed function and invokes it with the request context and config."]
// CIL[DOC-CONTEXT module="system-cron" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/system-cron.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, handlerName: string, config: any" outputs="handler result object" errors="Throws for unknown handler or missing pipeline_id in run_pipeline." side_effects="May call runPipeline and log to console."]
// CIL[DOC-MICRO logic_summary="Uses a handlers map to select and call the requested function; validates required fields before invoking run_pipeline." notable_decisions="Stubs produce console logs and mock results; run_pipeline requires pipeline_id and returns normalized execution summary."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
async function executeFunctionHandler(
  ctx: RequestContext,
  handlerName: string,
  config: any
): Promise<any> {
  const handlers: Record<string, Function> = {
    'send_email': async (ctx: RequestContext, config: any) => {
      console.log(`[${ctx.requestId}] Sending email:`, config)
      return { sent: true, recipients: config.recipients }
    },
    
    'generate_report': async (ctx: RequestContext, config: any) => {
      console.log(`[${ctx.requestId}] Generating report:`, config)
      return { generated: true, format: config.output_format }
    },
    
    'notify_watchers': async (ctx: RequestContext, config: any) => {
      console.log(`[${ctx.requestId}] Notifying watchers:`, config)
      return { notified: true }
    },
    
    'run_pipeline': async (ctx: RequestContext, config: any) => {
      const { pipeline_id, trigger_data = {} } = config
      
      if (!pipeline_id) {
        throw new Error('pipeline_id is required for run_pipeline handler')
      }
      
      const result = await runPipeline(pipeline_id, trigger_data, ctx)
      return { 
        success: result.status === 'completed',
        execution_id: result.executionId,
        stages_completed: result.stages?.length || 0,
        duration_ms: result.durationMs
      }
    }
  }
  
  const handler = handlers[handlerName]
  if (!handler) {
    throw new Error(`Unknown function handler: ${handlerName}`)
  }
  
  return await handler(ctx, config)
}
// CIL[END stable_id="~/.framework/functions/system-cron.ts:executeFunctionHandler:function"]
// CIL[BEGIN stable_id="~/.framework/functions/system-cron.ts:executeIntegrationHandler:function" type="function" identity="executeIntegrationHandler" parent="~/.framework/functions/system-cron.ts"]
// CIL[DOC-MACRO purpose="Stub for integration-based action handlers."]
// CIL[DOC-VECTOR type="context" content="purpose='Implements built-in function handlers: send_email, generate_report, notify_watchers, run_pipeline.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-RESPONSIBILITY responsibility="Logs the invocation of an integration handler and returns a placeholder result."]
// CIL[DOC-CONTEXT module="system-cron" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/system-cron.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, handlerName: string, config: any" outputs="placeholder result" errors="none" side_effects="logs to console"]
// CIL[DOC-MICRO logic_summary="Logs the handler name and config, then returns an executed placeholder." notable_decisions="Integration handlers are not fully implemented in this file."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
async function executeIntegrationHandler(
  ctx: RequestContext,
  handlerName: string,
  config: any
): Promise<any> {
  console.log(`[${ctx.requestId}] Integration handler: ${handlerName}`, config)
  return { executed: true, handler: handlerName }
}
// CIL[DOC-VECTOR type="context" content="purpose='Stub for integration-based action handlers.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system-cron.ts:executeIntegrationHandler:function"]
// CIL[BEGIN stable_id="~/.framework/functions/system-cron.ts:evaluateThresholds:function" type="function" identity="evaluateThresholds" parent="~/.framework/functions/system-cron.ts"]
// CIL[DOC-MACRO purpose="Fetches active threshold alerts, compares metrics to thresholds and fires associated pipelines when breached."]
// CIL[DOC-RESPONSIBILITY responsibility="Evaluates error_rate, latency_p95 and pipeline_failure_rate thresholds and runs fire pipelines for breached ones."]
// CIL[DOC-CONTEXT module="system-cron" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/system-cron.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext" outputs="array of threshold evaluation results" errors="Logs and swallows individual threshold errors; returns empty on DB errors." side_effects="Queries threshold_alerts, calls runPipeline, emits threshold.breached audit events."]
// CIL[DOC-MICRO logic_summary="Fetches active thresholds, computes the requested metric over a window, compares it to the configured operator/value, fires the linked pipeline if breached, and emits audit events." notable_decisions="Unknown metrics are skipped with a warning; pipeline fire errors are logged but the threshold result still records breached=true."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
async function evaluateThresholds(ctx: RequestContext): Promise<Array<{thresholdId: string, breached: boolean, fired: boolean}>> {
  const results: Array<{thresholdId: string, breached: boolean, fired: boolean}> = []
  
  try {
    const { data: thresholds, error } = await adminDb
      .from('threshold_alerts')
      .select('*')
      .eq('is_active', true)
    
    if (error) {
      console.error('Failed to fetch thresholds:', error)
      return results
    }
    
    if (!thresholds || thresholds.length === 0) {
      return results
    }
    
    const now = new Date()
    
    for (const threshold of thresholds) {
      try {
        const { metric, operator, value, window_minutes, pipeline_id } = threshold
        let actualValue: number
        let breached = false
        
        switch (metric) {
          case 'error_rate':
            const { data: errorRateData } = await adminDb.rpc('get_error_rate', {
              p_window_minutes: window_minutes
            })
            
            if (errorRateData && errorRateData.length > 0) {
              actualValue = errorRateData[0].error_rate || 0
              breached = operator === 'gt' ? actualValue > value : actualValue < value
            }
            break
            
          case 'latency_p95':
            const { data: latencyData } = await adminDb.rpc('get_latency_percentiles', {
              p_window_minutes: window_minutes
            })
            
            if (latencyData && latencyData.length > 0) {
              actualValue = latencyData[0].p95 || 0
              breached = operator === 'gt' ? actualValue > value : actualValue < value
            }
            break
            
          case 'pipeline_failure_rate':
            const { data: pipelineStats } = await adminDb.rpc('get_pipeline_stats', {
              p_window_minutes: window_minutes
            })
            
            if (pipelineStats && pipelineStats.length > 0) {
              const totalSuccess = pipelineStats[0].total_success || 0
              const totalFailure = pipelineStats[0].total_failure || 0
              const total = totalSuccess + totalFailure
              actualValue = total > 0 ? (totalFailure / total) * 100 : 0
              breached = operator === 'gt' ? actualValue > value : actualValue < value
            }
            break
            
          default:
            console.warn(`Unknown metric: ${metric}`)
            continue
        }
        
        let fired = false
        if (breached && pipeline_id) {
          try {
            await runPipeline(pipeline_id, {
              threshold_id: threshold.id,
              metric,
              threshold_value: value,
              actual_value: actualValue,
              window_minutes,
              triggered_at: now.toISOString()
            }, ctx)
            
            fired = true
          } catch (pipelineError: any) {
            console.error(`Failed to fire threshold pipeline ${pipeline_id}:`, pipelineError)
          }
        }
        
        if (breached) {
          await emitAudit(ctx, 'threshold.breached', {
            type: 'threshold_alert',
            id: threshold.id,
            account_id: threshold.account_id
          }, {
            metric,
            operator,
            threshold_value: value,
            actual_value: actualValue,
            window_minutes,
            pipeline_fired: fired,
            pipeline_id
          })
        }
        
        results.push({
          thresholdId: threshold.id,
          breached,
          fired
        })
        
      } catch (thresholdError: any) {
        console.error(`Error evaluating threshold ${threshold.id}:`, thresholdError)
        results.push({
          thresholdId: threshold.id,
          breached: false,
          fired: false
        })
      }
    }
    
    return results
    
  } catch (error: any) {
    console.error('Threshold evaluation error:', error)
    return results
  }
}
// CIL[END stable_id="~/.framework/functions/system-cron.ts:evaluateThresholds:function"]
// CIL[BEGIN stable_id="~/.framework/functions/system-cron.ts:cleanupOldLogs:function" type="function" identity="cleanupOldLogs" parent="~/.framework/functions/system-cron.ts"]
// CIL[DOC-MACRO purpose="Invokes the database cleanup_old_logs RPC to delete log records older than 90 days."]
// CIL[DOC-VECTOR type="context" content="purpose='Fetches active threshold alerts, compares metrics to thresholds and fires associated pipelines when breached.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-RESPONSIBILITY responsibility="Removes stale logs and returns the number of deleted records."]
// CIL[DOC-CONTEXT module="system-cron" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/system-cron.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="number of deleted records" errors="Logs cleanup errors and returns 0 on failure." side_effects="Calls the cleanup_old_logs RPC which deletes old log records."]
// CIL[DOC-MICRO logic_summary="Calls the cleanup_old_logs RPC with a 90-day retention and returns the deleted count, logging any errors." notable_decisions="Uses a fixed 90-day retention window; deletion count is read from the first row of the RPC result."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
async function cleanupOldLogs(): Promise<number> {
  try {
    const { data, error } = await adminDb.rpc('cleanup_old_logs', {
      p_retention_days: 90
    })
    
    if (error) {
      console.error('Log cleanup failed:', error)
      return 0
    }
    
    const deletedCount = data?.[0]?.deleted_count || 0
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old log records`)
    }
    
    return deletedCount
  } catch (error: any) {
    console.error('Log cleanup error:', error)
    return 0
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Invokes the database cleanup_old_logs RPC to delete log records older than 90 days.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system-cron.ts:cleanupOldLogs:function"]