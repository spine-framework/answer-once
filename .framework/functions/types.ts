
import { createHandler } from './_shared/middleware'
import { adminDb, joins } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin } from './_shared/principal'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'
import { generateValidationSchema } from './_shared/schema-utils'

const permissions = PermissionEngine as any
export const list = createHandler(async (ctx, body) => {
  const { kind, app_id, ownership, active, limit = '50', offset = '0', include_schema } = ctx.query || {}

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('types')
    .select('*')
    .order('kind')
    .order('name')

  if (active === 'false') {
    query = query.eq('is_active', false)
  } else if (active !== 'all') {
    query = query.eq('is_active', true)
  }

  if (kind) {
    query = query.eq('kind', kind)
  }

  if (app_id) {
    query = query.eq('app_id', app_id)
  } else if (app_id === 'null') {
    query = query.is('app_id', null)
  }

  if (ownership) {
    query = query.eq('ownership', ownership)
  }

  const { data, error: err } = await query
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

  if (err) throw err

  const sanitized = []
  for (const type of data || []) {
    if (ctx.principal) {
      const sanitizedType = await sanitizeRecordData(ctx, type, 'type')
      if (type.design_schema && !sanitizedType.design_schema) {
        sanitizedType.design_schema = type.design_schema
      }
      if (include_schema === 'true' && type.validation_schema) {
        sanitizedType.validation_schema = type.validation_schema
      }
      sanitized.push(sanitizedType)
    } else {
      const minimal: any = {
        id: type.id,
        slug: type.slug,
        name: type.name,
        kind: type.kind
      }
      if (include_schema === 'true' && type.design_schema) {
        minimal.design_schema = type.design_schema
      }
      sanitized.push(minimal)
    }
  }

  return sanitized
})
export const get = createHandler(async (ctx, body) => {
  const { id } = ctx.query || {}
  
  if (!id) {
    throw new Error('Type ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
    .from('types')
    .select('*')
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'type')
})
export const getBySlug = createHandler(async (ctx, body) => {
  const { slug } = ctx.query || {}
  
  if (!slug) {
    throw new Error('Type slug is required')
  }

  const { data, error: err } = await ctx.db
    .from('types')
    .select(`*, ${joins.app}`)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'type')
})
export const getSchema = createHandler(async (ctx, body) => {
  const { kind, slug, app_id } = ctx.query || {}

  if (!kind || !slug) {
    throw new Error('kind and slug are required')
  }

  const { data, error: err } = await ctx.db
    .rpc('get_type_schema', {
      kind,
      slug,
      app_id: app_id || null
    })

  if (err) throw err

  return { design_schema: data }
})
export const create = createHandler(async (ctx, body) => {
  if (!permissions.isSystemAdmin(ctx)) {
    throw new Error('System admin required')
  }

  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required')
  }

  const {
    name,
    slug,
    kind,
    ownership = 'system',
    app_id = null,
    design_schema = {},
    validation_schema = null,
    description = null,
    icon = null,
    color = null
  } = body

  if (!name || !slug || !kind) {
    throw new Error('name, slug, and kind are required')
  }

  const { data: existing } = await adminDb
    .from('types')
    .select('id')
    .eq('slug', slug)
    .eq('kind', kind)
    .eq('app_id', app_id)
    .eq('is_active', true)
    .single()

  if (existing) {
    throw new Error(`Type with slug '${slug}' already exists for kind '${kind}'`)
  }

  const validation = validation_schema || generateValidationSchema(design_schema)

  const { data, error } = await adminDb
    .from('types')
    .insert({
      name,
      slug,
      kind,
      ownership,
      app_id,
      design_schema,
      validation_schema: validation,
      description,
      icon,
      color,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error

  await emitLog(ctx, 'type.created', {
    type_id: data.id,
    type_slug: data.slug,
    type_kind: data.kind
  })

  return data
})
// Only updates explicitly provided fields; permission check is performed before lookup
export const update = createHandler(async (ctx, body) => {
  if (!permissions.isSystemAdmin(ctx)) {
    throw new Error('System admin required')
  }

  const { id } = ctx.query || {}
  
  if (!id) {
    throw new Error('Type ID is required')
  }

  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required')
  }

  const { data: existing } = await adminDb
    .from('types')
    .select('*')
    .eq('id', id)
    .single()

  if (!existing) {
    throw new Error('Type not found')
  }

  if (existing.ownership === 'system' && body.ownership && body.ownership !== 'system') {
    throw new Error('Cannot change ownership of system types')
  }

  const {
    name,
    slug,
    design_schema,
    description,
    icon,
    color,
    is_active,
    kind,
    app_id,
    ownership
  } = body

  const updates: any = {}

  if (name !== undefined) updates.name = name
  if (slug !== undefined) updates.slug = slug
  if (description !== undefined) updates.description = description
  if (icon !== undefined) updates.icon = icon
  if (color !== undefined) updates.color = color
  if (is_active !== undefined) updates.is_active = is_active
  if (kind !== undefined) updates.kind = kind
  if (app_id !== undefined) updates.app_id = app_id
  if (ownership !== undefined) updates.ownership = ownership

  if (design_schema !== undefined) {
    updates.design_schema = design_schema
    updates.validation_schema = generateValidationSchema(design_schema)
  }

  if (Object.keys(updates).length === 0) {
    return existing
  }

  const { data, error } = await adminDb
    .from('types')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await emitLog(ctx, 'type.updated', {
    type_id: data.id,
    type_slug: data.slug,
    type_kind: data.kind
  })

  return data
})
export const remove = createHandler(async (ctx, body) => {
  if (!permissions.isSystemAdmin(ctx)) {
    throw new Error('System admin required')
  }

  const { id } = ctx.query || {}
  
  if (!id) {
    throw new Error('Type ID is required')
  }

  const { data: existing } = await adminDb
    .from('types')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!existing) {
    throw new Error('Type not found')
  }

  if (existing.ownership === 'system') {
    throw new Error('Cannot delete system types')
  }

  const { error } = await adminDb
    .from('types')
    .update({ 
      is_active: false
    })
    .eq('id', id)

  if (error) throw error

  await emitLog(ctx, 'type.deleted', {
    type_id: existing.id,
    type_slug: existing.slug,
    type_kind: existing.kind
  })

  return { success: true }
})
export const handler = createHandler(async (ctx, body) => {
  const { action, id, slug, kind } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  if (action === 'schema') {
    return await getSchema(ctx, body)
  }

  if (action === 'list' || (method === 'GET' && !id && !slug && !kind)) {
    return await list(ctx, body)
  }

  if (method === 'GET') {
    if (slug) return await getBySlug(ctx, body)
    if (id || (kind && action !== 'schema')) return await get(ctx, body)
    return await list(ctx, body)
  }

  if (method === 'POST') {
    return await create(ctx, body)
  }

  if (method === 'PATCH') {
    return await update(ctx, body)
  }

  if (method === 'DELETE') {
    return await remove(ctx, body)
  }

  throw new Error('Invalid action or method')
})