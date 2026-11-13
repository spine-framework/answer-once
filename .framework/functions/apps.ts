































 







import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin } from './_shared/principal'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'

const permissions = PermissionEngine as any
export const list = createHandler(async (ctx, body) => {
  const { include_system, include_inactive, account_id } = ctx.query || {}

  const targetAccountId = account_id || ctx.accountId

  if (!targetAccountId) {
    throw new Error('Account context required')
  }

  const userRoles = ctx.principal?.roles || []
  const isSysAdmin = userRoles.includes('system_admin')
  const isSystem = isSysAdmin || (ctx.principal?.isInternal === true && !ctx.accountId)

  // get_account_apps is service-role-only — the account boundary is enforced
  // here. A scoped caller may only resolve apps inside its access set
  // (own account plus descendants); the query param alone never widened that.
  if (!isSystem && targetAccountId !== ctx.accountId) {
    const { data: accessible, error: accessErr } = await adminDb
      .rpc('get_accessible_accounts', { actor_id: ctx.principal?.id })
    const ids = (accessible || []).map((r: any) => r.account_id ?? r)
    if (accessErr || !ids.includes(targetAccountId)) {
      const e: any = new Error('Account not accessible')
      e.statusCode = 403
      throw e
    }
  }

  const { data, error: err } = await adminDb
    .rpc('get_account_apps', {
      account_id: targetAccountId,
      include_system: include_system !== 'false',
      include_inactive: include_inactive === 'true',
      user_role_slugs: userRoles,
      is_system_admin: isSysAdmin,
    })

  if (err) throw err

  
  const sanitized = []
  for (const app of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, app, 'app'))
  }

  return sanitized
})
export const get = createHandler(async (ctx, body) => {
  const { id, slug } = ctx.query || {}
  
  if (!id && !slug) {
    throw new Error('App ID or slug is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('apps')
    .select('*')
    .eq('is_active', true)

  if (id) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', slug)
  }

  const { data, error: err } = await query.single()

  if (err) throw err

  
  return await sanitizeRecordData(ctx, data, 'app')
})
export const getSchema = createHandler(async (ctx, body) => {
  const { slug } = ctx.query || {}

  if (!slug) {
    throw new Error('App slug is required')
  }

  const { data, error: err } = await ctx.db
    .rpc('get_app_schema', { app_slug: slug })

  if (err) throw err

  return data
})
// Defaults version, app_type, source, route_prefix, and min_role; only system admins bypass permission checks
export const create = createHandler(async (ctx, body) => {
  const { slug, name, description, icon, color, version, app_type, source, owner_account_id, config, nav_items, min_role, required_roles, integration_deps, metadata, route_prefix, renderer, preview_domain, prod_domain, prod_domains, preview_route_prefix, prod_route_prefix } = body

  if (!slug || !name) {
    throw new Error('slug and name are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  
  if (!permissions.isSystemAdmin(ctx)) {
    const perms = await permissions.resolveFirstSurfacePermissions(
      ctx.principal.id,
      ctx.accountId!,
      'app',
      'create'
    )
    
    if (!perms.canCreate) {
      throw new Error('Insufficient permissions to create apps')
    }
  }

  
  const { data: existing } = await ctx.db
    .from('apps')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    throw new Error('App slug already exists')
  }

  const { data, error: err } = await adminDb
    .from('apps')
    .insert({
      slug,
      name,
      description,
      icon,
      color,
      version: version || '1.0.0',
      app_type: app_type || 'custom',
      source: source || 'custom',
      owner_account_id: owner_account_id || ctx.accountId,
      config: config || {},
      nav_items: nav_items || [],
      min_role: min_role || 'member',
      required_roles: required_roles || [],
      integration_deps: integration_deps || [],
      metadata: metadata || {},
      route_prefix: route_prefix !== undefined ? route_prefix : ('/' + slug),
      renderer: renderer || 'generic',
      preview_domain: preview_domain ?? null,
      prod_domain: prod_domain ?? null,
      prod_domains: prod_domains ?? null,
      preview_route_prefix: preview_route_prefix ?? null,
      prod_route_prefix: prod_route_prefix ?? null,
      is_active: true,
      is_system: false
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'app.created', { type: 'app', id: data.id }, { after: data })

  return data
})
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, ...updates } = body || {}

  if (!id) {
    throw new Error('App ID is required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  
  const { data: current } = await ctx.db
    .from('apps')
    .select('*')
    .eq('id', id)
    .single()

  if (!current) {
    throw new Error('App not found')
  }

  
  const fieldValidation = await permissions.validateUpdatePermissions(
    ctx,
    updates,
    current,
    'apps'
  )
  
  if (!fieldValidation.valid) {
    throw new Error(fieldValidation.error)
  }

  const { data, error: err } = await adminDb
    .from('apps')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'app.updated', { type: 'app', id }, { before: current, after: data })

  return data
})
export const remove = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id

  if (!id) {
    throw new Error('App ID is required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  
  const { data: current } = await ctx.db
    .from('apps')
    .select('*')
    .eq('id', id)
    .single()

  if (!current) {
    throw new Error('App not found')
  }

  if (!permissions.isSystemAdmin(ctx)) {
    const perms = await permissions.resolveFirstSurfacePermissions(
      ctx.principal.id,
      ctx.accountId!,
      'app',
      'delete'
    )
    if (!perms.canDelete) {
      throw new Error('Insufficient permissions to delete apps')
    }
  }

  const { data, error: err } = await adminDb
    .from('apps')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'app.deleted', { type: 'app', id }, { before: current })

  return data
})
export const checkAvailability = createHandler(async (ctx, body) => {
  const { slug } = ctx.query || {}

  if (!slug) {
    throw new Error('App slug is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { data, error: err } = await ctx.db
    .rpc('is_app_available', {
      app_slug: slug,
      account_id: ctx.accountId
    })

  if (err) throw err

  return { available: data }
})
export const updateVersion = createHandler(async (ctx, body) => {
  const { id, version } = body

  if (!id || !version) {
    throw new Error('App ID and version are required')
  }

  if (!permissions.isSystemAdmin(ctx)) {
    throw new Error('Insufficient permissions to update app version')
  }

  const { data, error: err } = await adminDb
    .rpc('update_app_version', {
      app_id: id,
      new_version: version
    })

  if (err) throw err

  await emitLog(ctx, 'app.version_updated', { type: 'app', id }, { after: { version } })

  return { success: true }
})
export const handler = createHandler(async (ctx, body) => {
  const method = ctx.query?.method || 'GET'

  switch (method) {
    case 'GET':
      if (ctx.query?.action === 'get' || ctx.query?.id) {
        return await get(ctx, body)
      } else if (ctx.query?.slug) {
        return await get(ctx, body)
      } else if (ctx.query?.action === 'schema') {
        return await getSchema(ctx, body)
      } else if (ctx.query?.action === 'available') {
        return await checkAvailability(ctx, body)
      } else {
        return await list(ctx, body)
      }
    case 'POST':
      if (ctx.query?.action === 'version') {
        return await updateVersion(ctx, body)
      } else {
        return await create(ctx, body)
      }
    case 'PATCH':
      return await update(ctx, body)
    case 'DELETE':
      return await remove(ctx, body)
    default:
      throw new Error(`Unsupported method: ${method}`)
  }
})
