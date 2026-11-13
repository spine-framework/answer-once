









import { createHandler } from './_shared/middleware'
import { joins, adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'
import { isSystemAdmin } from './_shared/principal'

// Used as any to avoid strict typing issues; deprecated usage pattern noted in create chunk
const permissions = PermissionEngine as any
export const AGENT_EVENT_TYPES = {
  INFERENCE_COMPLETED: 'agent.inference.completed',
  INFERENCE_FAILED: 'agent.inference.failed',
  LOW_CONFIDENCE: 'agent.inference.low_confidence',
  TOOL_CALLED: 'agent.tool.called',
  TOOL_COMPLETED: 'agent.tool.completed',
  TOOL_FAILED: 'agent.tool.failed',
  MESSAGE_RECEIVED: 'agent.message.received',
  MESSAGE_SENT: 'agent.message.sent',
  THREAD_CREATED: 'agent.thread.created',
  ESCALATION_TRIGGERED: 'agent.escalation.triggered',
  ESCALATION_RESOLVED: 'agent.escalation.resolved',
  HUMAN_HANDOFF: 'agent.human.handoff'
} as const
export function getAgentEventTypes(): string[] {
  return Object.values(AGENT_EVENT_TYPES)
}
export const listByEvent = createHandler(async (ctx, body) => {
  const { event_type, app_id, include_inactive } = ctx.query || {}

  if (!event_type) {
    throw new Error('event_type is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('triggers')
    .select('*')
    .eq('event_type', event_type)
    .order('name')

  if (app_id) {
    query = query.eq('app_id', app_id)
  }
  if (include_inactive !== 'true') {
    query = query.eq('is_active', true)
  }

  const { data, error: err } = await query

  if (err) throw err

  const sanitized = []
  for (const trigger of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, trigger, 'trigger'))
  }

  return sanitized
})
// Same default active filter and admin bypass as listByEvent, but event_type is optional
export const list = createHandler(async (ctx, body) => {
  const { app_id, event_type, include_inactive } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('triggers')
    .select('*')
    .order('name')

  if (app_id) {
    query = query.eq('app_id', app_id)
  }
  if (event_type) {
    query = query.eq('event_type', event_type)
  }
  if (include_inactive !== 'true') {
    query = query.eq('is_active', true)
  }

  const { data, error: err } = await query

  if (err) throw err

  const sanitized = []
  for (const trigger of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, trigger, 'trigger'))
  }

  return sanitized
})
export const get = createHandler(async (ctx, body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Trigger ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
    .from('triggers')
    .select('*')
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'trigger')
})
// Uses ctx.db directly; no admin cross-account bypass
export const getExecutions = createHandler(async (ctx, body) => {
  const { trigger_id, limit = '50', offset = '0' } = ctx.query || {}

  if (!trigger_id) {
    throw new Error('trigger_id is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data, error: err } = await db
    .from('trigger_executions')
    .select('*')
    .eq('trigger_id', trigger_id)
    .order('executed_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

  if (err) throw err

  return data || []
})
// Replicates isSystemAdmin(ctx)-then-resolveFirstSurfacePermissions pattern from apps/roles/types; previously had a bug by passing principal instead of ctx
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, event_type, trigger_type, pipeline_id, config, metadata } = body

  if (!name || !event_type || !pipeline_id) {
    throw new Error('name, event_type, and pipeline_id are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  // NOTE: previously called `permissions.isSystemAdmin(ctx.principal)` (wrong
  // argument shape — that method reads `ctx.principal.roles`, so passing the
  // Principal itself made it always resolve false) followed by a
  // `permissions.hasPermission(...)` call that doesn't exist on PermissionEngine,
  // so this handler always threw at runtime. Use the same
  // isSystemAdmin(ctx)-then-resolveFirstSurfacePermissions pattern as
  // apps.ts/roles.ts/types.ts.
  if (!permissions.isSystemAdmin(ctx)) {
    const perms = await permissions.resolveFirstSurfacePermissions(
      ctx.principal.id,
      ctx.accountId!,
      'trigger',
      'create'
    )

    if (!perms.canCreate) {
      throw new Error('Insufficient permissions to create triggers')
    }
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data, error: err } = await db
    .from('triggers')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      name,
      description: description || null,
      event_type,
      pipeline_id,
      config: config || {},
      metadata: metadata || {},
      trigger_type: trigger_type || 'event',
      created_by: ctx.principal.type === 'human' ? ctx.principal.id : null
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'trigger.created', 
    { type: 'trigger', id: data.id }, 
    { after: { name, event_type } }
  )

  return data
})
// No explicit permission call; relies on caller middleware
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, ...updates } = body || {}

  if (!id) {
    throw new Error('Trigger ID is required')
  }

  const allowed = ['name', 'description', 'config', 'pipeline_id', 'metadata', 'is_active', 'event_type', 'trigger_type', 'app_id']
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (updates[key] !== undefined) updateData[key] = updates[key]
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data, error: err } = await db
    .from('triggers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'trigger.updated', 
    { type: 'trigger', id }, 
    { after: updateData }
  )

  return data
})
export const remove = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('Trigger ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data: existing } = await db
    .from('triggers')
    .select('name, event_type')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Trigger not found')
  }

  const { error: err } = await db
    .from('triggers')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (err) throw err

  await emitLog(ctx, 'trigger.deleted', 
    { type: 'trigger', id }, 
    { before: { name: existing.name, event_type: existing.event_type } }
  )

  return { success: true }
})
export const toggle = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('Trigger ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data: existing } = await db
    .from('triggers')
    .select('is_active, name')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Trigger not found')
  }

  const newStatus = !existing.is_active

  const { data, error: err } = await db
    .from('triggers')
    .update({
      is_active: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'trigger.toggled', 
    { type: 'trigger', id }, 
    { 
      before: { is_active: existing.is_active },
      after: { is_active: newStatus }
    }
  )

  return data
})

export const handler = createHandler(async (ctx, body) => {
  const { action, id } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  if (!action) {
    if (method === 'GET') return id ? await get(ctx, body) : await list(ctx, body)
    if (method === 'POST') return await create(ctx, body)
    if (method === 'PATCH') return await update(ctx, body)
    if (method === 'DELETE') return await remove(ctx, body)
    throw new Error(`Unsupported method: ${method}`)
  }

  switch (action) {
    case 'list':
      return await list(ctx, body)
    case 'listByEvent':
      return await listByEvent(ctx, body)
    case 'get':
      return await get(ctx, body)
    case 'getExecutions':
      return await getExecutions(ctx, body)
    case 'create':
      return await create(ctx, body)
    case 'update':
      return await update(ctx, body)
    case 'remove':
      return await remove(ctx, body)
    case 'toggle':
      return await toggle(ctx, body)
    default:
      throw new Error(`Unsupported action: ${action}`)
  }
})