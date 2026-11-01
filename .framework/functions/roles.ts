// CIL[BEGIN stable_id="~/.framework/functions/roles.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/roles.ts"]
// CIL[DOC-AUDIENCE audience="framework-internal"]
// CIL[DOC-MACRO purpose="Set up imports and exports for the roles Edge Function module"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide shared middleware and permission utilities for role handlers"]
// CIL[DOC-CONTEXT module="roles" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module exports and imports" errors="none at module load" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports createHandler, adminDb, emitLog, PermissionEngine and sanitizeRecordData for role CRUD operations" notable_decisions="Centralizes role logic behind shared permission and database helpers"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'
// CIL[DOC-VECTOR type="context" content="purpose='Set up imports and exports for the roles Edge Function module'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/roles.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/roles.ts:permissions:constant" type="constant" identity="permissions" parent="~/.framework/functions/roles.ts"]
// CIL[DOC-MACRO purpose="Provide a local alias for the shared PermissionEngine"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose permission checks under a typed local constant for role handlers"]
// CIL[DOC-CONTEXT module="roles" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/roles.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="permissions: any" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Casts PermissionEngine to any as a module-local permissions reference" notable_decisions="Avoids changing shared permissions typings by using a local any cast"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const permissions = PermissionEngine as any
// CIL[DOC-VECTOR type="context" content="purpose='Provide a local alias for the shared PermissionEngine'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/roles.ts:permissions:constant"]







// CIL[BEGIN stable_id="~/.framework/functions/roles.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/roles.ts"]
// CIL[DOC-MACRO purpose="List active roles with optional app and system filters"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a paginated list of roles respecting query filters and user permission scoping"]
// CIL[DOC-CONTEXT module="roles" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/roles.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query with optional app_id, is_system, limit and offset" outputs="array of role records" errors="database errors and unhandled query failures" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a query on the roles table, filter by app_id and is_system, paginate and then either return full results for system admins or sanitize each record" notable_decisions="Defaults limit to 50 and offset to 0; sorts by is_system then name"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='List active roles with optional app and system filters'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/roles.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/roles.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/roles.ts"]
// CIL[DOC-MACRO purpose="Fetch a single active role by its id"]
// CIL[DOC-RESPONSIBILITY responsibility="Return one sanitized role record when the caller provides a valid id"]
// CIL[DOC-CONTEXT module="roles" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/roles.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id" outputs="single role record" errors="missing id and database fetch errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fetch the role by id with an app join and apply sanitizeRecordData before returning" notable_decisions="Requires id in query and treats missing records as database errors"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single active role by its id'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/roles.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/roles.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/roles.ts"]
// CIL[DOC-MACRO purpose="Create a new role for an app or the platform"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate caller permissions, enforce slug uniqueness and insert a new role record"]
// CIL[DOC-CONTEXT module="roles" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/roles.ts"]
// CIL[DOC-CONTRACT inputs="body with app_id, slug, name, description, permissions object and is_system flag" outputs="newly created role record" errors="missing fields, permission denied, duplicate slug or database errors" side_effects="inserts a roles row and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Require slug and name, enforce system_admin protection, check create permissions, guard against duplicate slugs and insert the role with a logged audit event" notable_decisions="Non-system-admins need surface create permission; system_admin slug is protected"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Create a new role for an app or the platform'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/roles.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/roles.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/roles.ts"]
// CIL[DOC-MACRO purpose="Update an existing role by id"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate the request, apply field-level update permissions and persist the changes"]
// CIL[DOC-CONTEXT module="roles" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/roles.ts"]
// CIL[DOC-CONTRACT inputs="body with id and updates" outputs="updated role record" errors="missing id, missing role, validation failure or database errors" side_effects="updates the roles row and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Require id and a valid principal, fetch the current record, validate update fields, apply updates with a fresh timestamp and log the change" notable_decisions="Uses permissions.validateUpdatePermissions before applying any field changes"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing role by id'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/roles.ts:update:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/roles.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/roles.ts"]
// CIL[DOC-MACRO purpose="Soft-delete a role by setting is_active to false"]
// CIL[DOC-RESPONSIBILITY responsibility="Mark the requested role as inactive and record the deletion in the audit log"]
// CIL[DOC-CONTEXT module="roles" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/roles.ts"]
// CIL[DOC-CONTRACT inputs="body with id" outputs="deactivated role record" errors="missing id, missing role or database errors" side_effects="sets roles.is_active to false and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Require id and a valid principal, fetch the current record, update is_active to false and log the deletion" notable_decisions="Performs a soft delete instead of removing the row"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Soft-delete a role by setting is_active to false'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/roles.ts:remove:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/roles.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/roles.ts"]
// CIL[DOC-MACRO purpose="Route incoming role function requests to the correct handler by HTTP method"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch list, get, create, update and remove operations based on ctx.query.method"]
// CIL[DOC-CONTEXT module="roles" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/roles.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.method and optional id" outputs="result from the dispatched handler" errors="unsupported method" side_effects="none directly; delegated handlers may mutate data"]
// CIL[DOC-MICRO logic_summary="Select the method from query or default to GET, then route to list, get, create, update or remove accordingly" notable_decisions="GET with id calls get; GET without id calls list; unsupported methods throw"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Route incoming role function requests to the correct handler by HTTP method'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/roles.ts:handler:constant"]
