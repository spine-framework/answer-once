import { createHandler, json, error, parseBody } from './_shared/middleware'
import { emitLog } from './_shared/audit'
import { adminDb } from './_shared/db'
import { isSystemAdmin, isSystemPrincipal } from './_shared/principal'
import { scopeFor, ifAccountScope } from './_shared/account-scope'










export const list = createHandler(async (ctx, body) => {
  const { pipeline_id, status, limit = 100, offset = 0 } = ctx.query || {}
  const { db, accountIds } = await scopeFor(ctx)

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = db
    .from('pipeline_executions')
    .select('*')
    .order('created_at', { ascending: false })
  query = ifAccountScope(query, accountIds)

  if (pipeline_id) query = query.eq('pipeline_id', pipeline_id)
  if (status) query = query.eq('status', status)

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  return data || []
})
export const get = createHandler(async (ctx, body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Execution ID is required')
  }

  const { db, accountIds } = await scopeFor(ctx)

  const { data, error: err } = await ifAccountScope(db
    .from('pipeline_executions')
    .select('*')
    .eq('id', id), accountIds)
    .single()

  if (err) throw err

  return data
})
export const create = createHandler(async (ctx, body) => {
  const { pipeline_id, trigger_data } = body

  if (!pipeline_id) {
    throw new Error('Pipeline ID is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { data, error: err } = await ctx.db
    .from('pipeline_executions')
    .insert({
      pipeline_id,
      status: 'pending',
      trigger_data: trigger_data || {},
      created_by: ctx.principal?.type === 'human' ? ctx.principal.id : null,
      account_id: ctx.accountId,
    })
    .select('id')
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline_execution.created',
    { type: 'pipeline_execution', id: data?.id },
    { after: { pipeline_id } }
  )

  return { execution_id: data?.id }
})
export const start = createHandler(async (ctx, body) => {
  const { id } = body

  if (!id) {
    throw new Error('Execution ID is required')
  }

  const { db: sdb, accountIds } = await scopeFor(ctx)
  const { data, error: err } = await ifAccountScope(sdb
    .from('pipeline_executions')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', id), accountIds)
    .select('id')
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline_execution.started',
    { type: 'pipeline_execution', id },
    { after: { status: 'running' } }
  )

  return { success: true }
})
export const complete = createHandler(async (ctx, body) => {
  const { id, output_data, error_message } = body

  if (!id) {
    throw new Error('Execution ID is required')
  }

  const now = new Date().toISOString()
  const finalStatus = error_message ? 'failed' : 'completed'

  const { db: cdb, accountIds } = await scopeFor(ctx)
  const { data: existing } = await ifAccountScope(cdb
    .from('pipeline_executions')
    .select('started_at')
    .eq('id', id), accountIds)
    .single()

  const duration_ms = existing?.started_at
    ? Math.round(Date.now() - new Date(existing.started_at).getTime())
    : null

  const { data, error: err } = await ifAccountScope(cdb
    .from('pipeline_executions')
    .update({
      status: finalStatus,
      result: output_data || {},
      error_message: error_message || null,
      completed_at: now,
      duration_ms,
    })
    .eq('id', id), accountIds)
    .select('id')
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline_execution.completed',
    { type: 'pipeline_execution', id },
    { after: { status: finalStatus, error_message } }
  )

  return { success: true }
})
export const cancel = createHandler(async (ctx, body) => {
  const { id } = body

  if (!id) {
    throw new Error('Execution ID is required')
  }

  const { db: xdb, accountIds } = await scopeFor(ctx)
  const { data, error: err } = await ifAccountScope(xdb
    .from('pipeline_executions')
    .update({ status: 'cancelled', completed_at: new Date().toISOString() })
    .eq('id', id), accountIds)
    .select('id')
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline_execution.cancelled',
    { type: 'pipeline_execution', id },
    { after: { status: 'cancelled' } }
  )

  return { success: true }
})
export const getRunning = createHandler(async (ctx, body) => {
  const { pipeline_id } = ctx.query || {}
  const { db, accountIds } = await scopeFor(ctx)

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = db
    .from('pipeline_executions')
    .select('*')
    .eq('status', 'running')
    .order('started_at', { ascending: false })
  query = ifAccountScope(query, accountIds)

  if (pipeline_id) query = query.eq('pipeline_id', pipeline_id)

  const { data, error: err } = await query

  if (err) throw err

  return data || []
})
export const getStats = createHandler(async (ctx, body) => {
  const { pipeline_id, date_from, date_to } = ctx.query || {}
  const { db, accountIds } = await scopeFor(ctx)

  if (!isSystemAdmin(ctx.principal) && !ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = db
    .from('pipeline_executions')
    .select('id, status')
  query = ifAccountScope(query, accountIds)

  if (pipeline_id) query = query.eq('pipeline_id', pipeline_id)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to)

  const { data, error: err } = await query

  if (err) throw err

  const rows = data || []
  return {
    total: rows.length,
    completed: rows.filter((r: any) => r.status === 'completed').length,
    failed: rows.filter((r: any) => r.status === 'failed').length,
    running: rows.filter((r: any) => r.status === 'running').length,
  }
})
export const cleanup = createHandler(async (ctx, body) => {
  const { days_to_keep = 30, status_filter } = body

  // cleanup deletes rows platform-wide and machine principals run it on the
  // service-role client — restrict to system-level callers (same gate as
  // logs.cleanup).
  if (!isSystemPrincipal(ctx)) {
    const e: any = new Error('Insufficient permissions for pipeline execution cleanup')
    e.statusCode = 403
    throw e
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - parseInt(days_to_keep.toString()))

  let query = ctx.db
    .from('pipeline_executions')
    .delete()
    .lt('created_at', cutoff.toISOString())

  if (status_filter) query = query.eq('status', status_filter)

  const { data, error: err } = await query.select('id')

  if (err) throw err

  await emitLog(ctx, 'pipeline_executions.cleaned',
    { type: 'system', id: 'cleanup' },
    { after: { deleted_count: (data || []).length } }
  )

  return { deleted_count: (data || []).length }
})
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'list':
      if (method === 'GET') return await list(ctx, body)
      break
    case 'running':
      if (method === 'GET') return await getRunning(ctx, body)
      break
    case 'stats':
      if (method === 'GET') return await getStats(ctx, body)
      break
    case 'cleanup':
      if (method === 'POST') return await cleanup(ctx, body)
      break
    default:
      if (method === 'GET') {
        if (ctx.query?.id) {
          return await get(ctx, body)
        } else {
          return await list(ctx, body)
        }
      } else if (method === 'POST') {
        return await create(ctx, body)
      } else if (method === 'PATCH') {
        if (ctx.query?.action === 'start') return await start(ctx, body)
        else if (ctx.query?.action === 'complete') return await complete(ctx, body)
        else if (ctx.query?.action === 'cancel') return await cancel(ctx, body)
      }
  }

  throw new Error('Invalid action or method')
})