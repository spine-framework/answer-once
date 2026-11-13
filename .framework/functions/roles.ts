// Centralizes role logic behind shared permission and database helpers
import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'

// Avoids changing shared permissions typings by using a local any cast
const permissions = PermissionEngine as any







export const list = createHandler(async (ctx, _body) => {
  const { app_id, is_system, limit = '50', offset = '0' } = ctx.query || {}

  let query = ctx.db
    .from('roles')
    .select(`
      *,
      app:apps(id, slug, name)
    `)
    .eq('is_active', true)
    .order('is_system', { ascending: false })
    .order('name')

  if (app_id) {
    query = query.eq('app_id', app_id)
  } else if (app_id === 'null') {
    query = query.is('app_id', null)
  }

  if (is_system !== undefined) {
    query = query.eq('is_system', is_system === 'true')
  }

  const { data, error: err } = await query
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

  if (err) throw err

  if (permissions.isSystemAdmin(ctx)) {
    return data
  }

  const filteredData = []
  for (const role of data || []) {
    const roleWithType = { ...role, type: 'role' }
    const sanitizedRole = await sanitizeRecordData(ctx, roleWithType, 'role')
      filteredData.push(sanitizedRole)
  }

  return filteredData
})
export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}
  
  if (!id) {
    throw new Error('Role ID is required')
  }

  const { data, error: err } = await ctx.db
    .from('roles')
    .select(`
      *,
      app:apps(id, slug, name)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (err) throw err

  const roleWithType = { ...data, type: 'role' }
  return await sanitizeRecordData(ctx, roleWithType, 'role')
})
// Non-system-admins need surface create permission; system_admin slug is protected
export const create = createHandler(async (ctx, body) => {
  const { app_id, slug, name, description, permissions: rolePermissions, is_system } = body

  if (!slug || !name) {
    throw new Error('slug and name are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  if (slug === 'system_admin' && !permissions.isSystemAdmin(ctx)) {
    throw new Error('system_admin role can only be created by system administrators')
  }

  if (!permissions.isSystemAdmin(ctx)) {
    const perms = await permissions.resolveFirstSurfacePermissions(
      ctx.principal.id,
      ctx.accountId!,
      'role',
      'create'
    )
    
    if (!perms.canCreate) {
      throw new Error('Insufficient permissions to create roles')
    }
  }

  let query = adminDb
    .from('roles')
    .select('id')
    .eq('slug', slug)

  if (app_id) {
    query = query.eq('app_id', app_id)
  } else {
    query = query.is('app_id', null)
  }

  const { data: existing } = await query.single()

  if (existing) {
    throw new Error('Role slug already exists for this app')
  }

  const db = permissions.isSystemAdmin(ctx) ? adminDb : ctx.db
  const { data, error: err } = await db
    .from('roles')
    .insert({
      app_id,
      slug,
      name,
      description,
      permissions: rolePermissions || {},
      is_system: is_system || false,
      is_active: true
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'role.created', { type: 'role', id: data.id }, { after: data })

  return data
})
export const update = createHandler(async (ctx, body) => {
  const { id, ...updates } = body

  if (!id) {
    throw new Error('Role ID is required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const db = permissions.isSystemAdmin(ctx) ? adminDb : ctx.db
  const { data: current, error: fetchErr } = await db
    .from('roles')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !current) {
    throw new Error('Role not found or access denied')
  }

  const fieldValidation = await permissions.validateUpdatePermissions(
    ctx,
    updates,
    current,
    'role'
  )
  
  if (!fieldValidation.valid) {
    throw new Error(fieldValidation.error)
  }

  const { data, error: err } = await db
    .from('roles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'role.updated', { type: 'role', id }, { before: current, after: data })

  return data
})
// Performs a soft delete instead of removing the row
export const remove = createHandler(async (ctx, body) => {
  const { id } = body

  if (!id) {
    throw new Error('Role ID is required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const db = permissions.isSystemAdmin(ctx) ? adminDb : ctx.db
  const { data: current, error: fetchErr } = await db
    .from('roles')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !current) {
    throw new Error('Role not found or access denied')
  }

  const { data, error: err } = await db
    .from('roles')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'role.deleted', { type: 'role', id }, { before: current })

  return data
})
export const handler = createHandler(async (ctx, body) => {
  const method = ctx.query?.method || 'GET'

  switch (method) {
    case 'GET':
      if (ctx.query?.id) {
        return await get(ctx, body)
      } else {
        return await list(ctx, body)
      }
    case 'POST':
      return await create(ctx, body)
    case 'PATCH':
      return await update(ctx, body)
    case 'DELETE':
      return await remove(ctx, body)
    default:
      throw new Error(`Unsupported method: ${method}`)
  }
})
