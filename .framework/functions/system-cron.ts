/**
 * @module   system-cron
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module handles scheduled tasks within the system, ensuring timely execution of various background processes. It utilizes a multi-step pipeline for task execution, which includes running pipelines and sweeping stale executions. INVARIANT: All scheduled tasks must be executed in a timely manner to maintain system integrity.
 *
 * @seeAlso middleware.ts (provides request handling capabilities).
 * @seeAlso db.ts (manages database interactions).
 * @seeAlso audits.ts (handles audit logging).
 * @seeAlso pipeline-runner.ts (executes task pipelines).
 *
 * @cil-generated
 */









import { createHandler, RequestContext } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitAudit } from './_shared/audit'
import { runPipeline, sweepStaleExecutions } from './_shared/pipeline-runner'
import { retryPendingDeliveries } from './_shared/retry-deliveries'

















/**
 * SCHEDULER_API_KEY retrieves the API key for the scheduler from the environment variables to ensure that the application can access the necessary credentials for scheduling tasks.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const SCHEDULER_API_KEY: string | undefined = (globalThis as any).process?.env?.SCHEDULER_API_KEY || (globalThis as any).Deno?.env?.get?.('SCHEDULER_API_KEY')






















/**
 * The handler processes scheduled tasks by validating their execution conditions and executing them if due. It ensures proper authentication and logs unauthorized access attempts.
 *
 * @throws      Error — if fetching due schedules or validating schedules fails.
 * @sideEffects DB reads from 'schedules', 'actions', and 'api_keys'; emits audit logs for unauthorized access.
 * @stability   internal
 * @calls       adminDb.rpc('get_due_schedules'), adminDb.rpc('validate_schedule_creator'), adminDb.from('actions'), adminDb.from('api_keys')
 * @errorHandling logs errors to the console without throwing them further.
 * @cil-generated
 */
export const handler = createHandler(async (ctx: RequestContext) => {
  const requestApiKey = ctx.query?.api_key || ctx.query?.scheduler_key
  
  // Fail closed: when SCHEDULER_API_KEY is unset, `undefined !== undefined`
  // is false and any signed-in user would skip auth entirely.
  if (!SCHEDULER_API_KEY || requestApiKey !== SCHEDULER_API_KEY) {
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
  
  // Reap executions whose runner died mid-flight (detached process killed,
  // function timeout, dispatched trigger never started). Runs every minute
  // regardless of whether schedules/timers are due this tick.
  try {
    await sweepStaleExecutions()
  } catch (sweepError) {
    console.warn('[system-cron] stale-execution sweep failed:', sweepError)
  }

  try {
    const { data: dueSchedules, error: schedulesError } = await adminDb.rpc('get_due_schedules', {
      p_now: new Date().toISOString()
    })
    
    if (schedulesError) {
      throw new Error(`Failed to fetch due schedules: ${schedulesError.message}`)
    }
    
    // An empty schedule list must not end the tick: due timers, threshold
    // alerts, delivery retries, and log cleanup below run every minute.
    for (const schedule of dueSchedules || []) {
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

    let retrySummary = null
    try {
      retrySummary = await retryPendingDeliveries(ctx)
    } catch (retryError) {
      console.error('Delivery retry error:', retryError)
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Executed ${results.length} total (schedules + timers)`,
        executed: results.length,
        schedules_due: dueSchedules?.length || 0,
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
















/**
 * Executes a specified action by delegating to the appropriate handler based on the action's module type. This function facilitates the execution of different types of actions within the system.
 *
 * @macro       Action executor that routes to specific handler implementations.
 * @micro       Merges action-specific and provided configuration before invoking the appropriate handler function.
 * @inputSpec
 *   - ctx: RequestContext (required) — the context for the request execution.
 *   - action: any (required) — the action object containing handler information.
 *   - config: any (required) — additional configuration to merge with the action's config.
 * @outputSpec  Promise<any> — resolves to the result of the executed action handler.
 * @throws      Error — Custom handlers not yet implemented: <handlerName>
Error — Unknown handler module: <handlerModule>
 * @sideEffects none
 * @stability   internal
 * @calls       executeFunctionHandler, executeIntegrationHandler
 * @cil-generated
 */
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
















/**
 * Executes a specified function handler based on the provided handler name and configuration. This module facilitates various operations such as sending emails, generating reports, notifying watchers, and running pipelines.
 *
 * @macro       Function dispatcher for executing predefined asynchronous handlers.
 * @micro       Uses a record of handler functions indexed by name to dynamically invoke the appropriate operation.
 * @inputSpec
 *   ctx: RequestContext (required) — the context for the request.
 *   handlerName: string (required) — the name of the handler to execute.
 *   config: any (required) — configuration object for the handler.
 * @outputSpec  Promise<any> — resolves to the result of the executed handler, which varies based on the handler type.
 * @throws      Error — Unknown function handler: handlerName
 * @sideEffects Logs to the console for each handler execution.
 * @stability   internal
 * @calls       runPipeline
 * @errorHandling none
 * @cil-generated
 */
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
















/**
 * Executes an integration handler based on the provided handler name and configuration. This function facilitates the execution of various integration tasks within the system.
 *
 * @inputSpec
 *   ctx: RequestContext (required) — the context of the request including metadata.
 *   handlerName: string (required) — the name of the integration handler to execute.
 *   config: any (required) — configuration parameters for the integration handler.
 * @outputSpec  Promise<any> — returns an object indicating execution status and the handler name.
 * @sideEffects logs the execution details to the console
 * @stability   internal
 * @cil-generated
 */
async function executeIntegrationHandler(
  ctx: RequestContext,
  handlerName: string,
  config: any
): Promise<any> {
  console.log(`[${ctx.requestId}] Integration handler: ${handlerName}`, config)
  return { executed: true, handler: handlerName }
}
















/**
 * Evaluates active thresholds for various metrics to determine if they have been breached, potentially triggering associated pipelines. This function is essential for monitoring system performance and alerting based on predefined criteria.
 *
 * @macro       Async function responsible for evaluating threshold alerts and managing pipeline executions.
 * @micro       Iterates through active thresholds, fetching metric data via RPC calls and assessing breaches based on specified operators.
 * @inputSpec
 *   ctx: RequestContext (required) — the context for the request containing necessary information for processing.
 * @outputSpec  Promise<Array<{thresholdId: string, breached: boolean, fired: boolean}>> — an array of objects indicating the threshold ID, breach status, and whether the associated pipeline was fired.
 * @sideEffects DB reads from 'threshold_alerts', RPC calls to fetch metric data, potential DB writes when triggering pipelines.
 * @stability   internal
 * @calls       adminDb.from('threshold_alerts'), adminDb.rpc('get_error_rate'), adminDb.rpc('get_latency_percentiles'), adminDb.rpc('get_pipeline_stats'), runPipeline
 * @errorHandling logs errors to the console but does not throw them.
 * @cil-generated
 */
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
















/**
 * Cleans up old log records that are older than a specified retention period to maintain the database by removing unnecessary log entries.
 *
 * @outputSpec  Promise<number> - returns the count of deleted log records.
 * @sideEffects Makes an RPC call to 'cleanup_old_logs' in the database.
 * @stability   internal
 * @calls       adminDb.rpc
 * @cil-generated
 */
async function cleanupOldLogs(): Promise<number> {
  try {
    const { data, error } = await adminDb.rpc('cleanup_old_logs', {
      p_retention_days: 30
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






