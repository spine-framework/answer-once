import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { sanitizeRecordData } from './_shared/permissions'
import { isSystemAdmin } from './_shared/principal'
import { scopeFor, ifAccountScope } from './_shared/account-scope'










export const listByTrigger = createHandler(async (ctx, _body) => {
  const { trigger_type, app_id, include_inactive } = ctx.query || {}

  if (!trigger_type) {
    throw new Error('trigger_type is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { db, accountIds } = await scopeFor(ctx)

  let query = db
    .from('pipelines')
    .select('*')
    .eq('trigger_type', trigger_type)

  query = ifAccountScope(query, accountIds)
  if (app_id) {
    query = query.eq('app_id', app_id)
  }
  if (include_inactive !== 'true') {
    query = query.eq('is_active', true)
  }

  const { data, error: err } = await query.order('name')

  if (err) throw err

  const sanitized = []
  for (const pipeline of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, pipeline, 'pipeline'))
  }

  return sanitized
})
export const list = createHandler(async (ctx, body) => {
  const { app_id, include_inactive } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { db, accountIds } = await scopeFor(ctx)

  let query = db
    .from('pipelines')
    .select('*')

  query = ifAccountScope(query, accountIds)
  if (app_id) {
    query = query.eq('app_id', app_id)
  }

  const { data, error: err } = await query.order('name')

  if (err) throw err

  const sanitized = []
  for (const pipeline of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, pipeline, 'pipeline'))
  }

  return sanitized
})
export const get = createHandler(async (ctx, body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Pipeline ID is required')
  }

  const { db, accountIds } = await scopeFor(ctx)

  const { data, error: err } = await ifAccountScope(db
    .from('pipelines')
    .select('*')
    .eq('id', id), accountIds)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'pipeline')
})
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, trigger_type, config, stages, metadata } = body

  if (!name || !trigger_type || !stages) {
    throw new Error('name, trigger_type, and stages are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data, error: err } = await db
    .from('pipelines')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      name,
      description: description || null,
      trigger_type,
      config: config || {},
      stages,
      metadata: metadata || {},
      created_by: ctx.principal.type === 'human' ? ctx.principal.id : null
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline.created', 
    { type: 'pipeline', id: data.id }, 
    { after: { name, trigger_type } }
  )

  return data
})
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, name, description, config, stages, metadata, trigger_type, is_active, app_id } = body || {}

  if (!id) {
    throw new Error('Pipeline ID is required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data: current } = await ifAccountScope(db
    .from('pipelines')
    .select('*')
    .eq('id', id), accountIds)
    .single()

  if (!current) {
    throw new Error('Pipeline not found')
  }

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  if (name !== undefined) updateData.name = name
  if (description !== undefined) updateData.description = description
  if (config !== undefined) updateData.config = config
  if (stages !== undefined) updateData.stages = stages
  if (metadata !== undefined) updateData.metadata = metadata
  if (trigger_type !== undefined) updateData.trigger_type = trigger_type
  if (is_active !== undefined) updateData.is_active = is_active
  if (app_id !== undefined) updateData.app_id = app_id

  const { data, error: err } = await ifAccountScope(db
    .from('pipelines')
    .update(updateData)
    .eq('id', id), accountIds)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline.updated', 
    { type: 'pipeline', id }, 
    { before: current, after: updateData }
  )

  return data
})
export const toggle = createHandler(async (ctx, body) => {
  const { id, is_active } = body

  if (!id || is_active === undefined) {
    throw new Error('Pipeline ID and is_active are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data: current } = await ifAccountScope(db
    .from('pipelines')
    .select('*')
    .eq('id', id), accountIds)
    .single()

  if (!current) {
    throw new Error('Pipeline not found')
  }

  const { data, error: err } = await ifAccountScope(db
    .from('pipelines')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id), accountIds)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'pipeline.toggled', 
    { type: 'pipeline', id }, 
    { before: { is_active: current.is_active }, after: { is_active } }
  )

  return data
})
export const getExecutions = createHandler(async (ctx, _body) => {
  const { pipeline_id, limit = 50, offset = 0 } = ctx.query || {}

  if (!pipeline_id) {
    throw new Error('Pipeline ID is required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data, error: err } = await ifAccountScope(db
    .from('pipeline_executions')
    .select('*')
    .eq('pipeline_id', pipeline_id), accountIds)
    .order('created_at', { ascending: false })
    .range(
      parseInt(offset.toString()),
      parseInt(offset.toString()) + parseInt(limit.toString()) - 1
    )

  if (err) throw err

  return data
})
export const remove = createHandler(async (ctx, _body) => {
  const id = ctx.query?.id

  if (!id) {
    throw new Error('Pipeline ID is required')
  }

  const { db, accountIds } = await scopeFor(ctx)
  const { data: current } = await ifAccountScope(db
    .from('pipelines')
    .select('id, name')
    .eq('id', id), accountIds)
    .single()

  if (!current) throw new Error('Pipeline not found')

  const { error: err } = await ifAccountScope(db
    .from('pipelines')
    .delete()
    .eq('id', id), accountIds)

  if (err) throw err

  await emitLog(ctx, 'pipeline.deleted', 
    { type: 'pipeline', id }, 
    { before: current }
  )

  return { success: true }
})
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'by-trigger':
      if (method === 'GET') {
        return await listByTrigger(ctx, body)
      }
      break
    case 'executions':
      if (method === 'GET') {
        return await getExecutions(ctx, body)
      }
      break
    case 'toggle':
      if (method === 'POST') {
        return await toggle(ctx, body)
      }
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
        return await update(ctx, body)
      } else if (method === 'DELETE') {
        return await remove(ctx, body)
      }
  }

  throw new Error('Invalid action or method')
})
