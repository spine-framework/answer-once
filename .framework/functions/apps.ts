// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/apps.ts"]
// CIL[DOC-MACRO purpose="Application management handlers and CRUD operations for public.apps"]
// CIL[DOC-RESPONSIBILITY responsibility="Define and export Netlify-style handler functions for the app lifecycle: list, get, schema, create, update, remove, availability, version, and dispatch"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="imported shared modules" outputs="exported handler constants" errors="import-time type errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware and permission helpers; exports handler functions for the apps API" notable_decisions="Uses createHandler for consistent request/response wrapping; delegates to PermissionEngine for access control"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="backend maintainers"]
































 







import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin } from './_shared/principal'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'
// CIL[END stable_id="~/.framework/functions/apps.ts:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='Application management handlers and CRUD operations for public.apps'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Type alias shim for PermissionEngine"]
// CIL[DOC-RESPONSIBILITY responsibility="Reference PermissionEngine with loose typing for app handlers"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="permissions reference" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Casts PermissionEngine to any to avoid strict type errors in this module" notable_decisions="Should be replaced by a properly typed export from the permissions engine"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:permissions:constant" type="constant" identity="permissions" parent="~/.framework/functions/apps.ts"]
const permissions = PermissionEngine as any
// CIL[END stable_id="~/.framework/functions/apps.ts:permissions:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Type alias shim for PermissionEngine'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="List apps for an account with optional filters"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a sanitized list of apps accessible to the caller's roles"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query with include_system, include_inactive, account_id; ctx.accountId, ctx.principal, ctx.db" outputs="array of sanitized app records" errors="Account context required; database errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolves target account, selects adminDb for system admins, calls get_account_apps RPC, and sanitizes each record" notable_decisions="Defaults include_system to true unless explicitly false; uses sanitizeRecordData per row"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/apps.ts"]
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
// CIL[END stable_id="~/.framework/functions/apps.ts:list:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='List apps for an account with optional filters'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Fetch a single active app by id or slug"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a sanitized app record matching the requested id or slug"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id or slug" outputs="sanitized app record" errors="App ID or slug required; not found; database errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Queries the apps table by id or slug, limits to active records, and returns sanitized data" notable_decisions="Prefers id over slug; uses .single() to enforce a single result"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/apps.ts"]
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
// CIL[END stable_id="~/.framework/functions/apps.ts:get:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single active app by id or slug'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Retrieve the design schema for an app by slug"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the schema payload from the get_app_schema RPC"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.slug" outputs="app design schema" errors="App slug is required; database errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validates the slug and invokes the get_app_schema RPC, returning the result" notable_decisions="Relies on a database stored procedure for schema generation"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:getSchema:constant" type="constant" identity="getSchema" parent="~/.framework/functions/apps.ts"]
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
// CIL[END stable_id="~/.framework/functions/apps.ts:getSchema:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Retrieve the design schema for an app by slug'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Create a new app record"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate input and permissions, insert a new app row, and emit an audit log"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="body with slug, name, and optional fields; ctx.principal, ctx.accountId" outputs="created app record" errors="Missing slug/name; anonymous user; insufficient permissions; duplicate slug; database errors" side_effects="inserts an apps row and emits app.created log"]
// CIL[DOC-MICRO logic_summary="Enforces required fields and auth, checks create permission, ensures slug uniqueness, inserts with defaults, and emits an audit event" notable_decisions="Defaults version, app_type, source, route_prefix, and min_role; only system admins bypass permission checks"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/apps.ts"]
export const create = createHandler(async (ctx, body) => {
  const { slug, name, description, icon, color, version, app_type, source, owner_account_id, config, nav_items, min_role, required_roles, integration_deps, metadata, route_prefix, renderer, preview_domain, prod_domain, preview_route_prefix, prod_route_prefix } = body

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
// CIL[END stable_id="~/.framework/functions/apps.ts:create:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Create a new app record'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Update an existing app"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate the caller, load the current record, check field-level permissions, and apply updates"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="body with id and update fields; ctx.principal, ctx.accountId" outputs="updated app record" errors="App ID is required; not found; field permission denied; database errors" side_effects="updates the apps row and emits app.updated log"]
// CIL[DOC-MICRO logic_summary="Finds the current record, validates update permissions, sets updated_at, persists changes, and emits an audit event" notable_decisions="Strips body id from updates; uses validateUpdatePermissions to enforce field-level access"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/apps.ts"]
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
// CIL[END stable_id="~/.framework/functions/apps.ts:update:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing app'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Soft-delete an app"]
// CIL[DOC-RESPONSIBILITY responsibility="Set is_active to false for an app after authentication and existence checks"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="body or query id; ctx.principal, ctx.accountId" outputs="deactivated app record" errors="App ID is required; not found; database errors" side_effects="deactivates the app and emits app.deleted log"]
// CIL[DOC-MICRO logic_summary="Loads the record, flips the is_active flag and updated_at, and emits an audit event" notable_decisions="Performs a soft delete rather than a hard delete"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/apps.ts"]
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
// CIL[END stable_id="~/.framework/functions/apps.ts:remove:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Soft-delete an app'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Check whether a slug is available for an account"]
// CIL[DOC-RESPONSIBILITY responsibility="Return an availability boolean from the is_app_available RPC"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.slug and ctx.accountId" outputs="{ available: boolean }" errors="App slug is required; account context required; database errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validates the slug and account, then calls the is_app_available RPC" notable_decisions="Uses an account-scoped stored procedure to determine availability"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:checkAvailability:constant" type="constant" identity="checkAvailability" parent="~/.framework/functions/apps.ts"]
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
// CIL[END stable_id="~/.framework/functions/apps.ts:checkAvailability:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Check whether a slug is available for an account'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Update an app version via a stored procedure"]
// CIL[DOC-RESPONSIBILITY responsibility="Bump the version of an app and emit an audit log"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="body.id and body.version" outputs="{ success: true }" errors="App ID and version are required; database errors" side_effects="updates the app version and emits app.version_updated log"]
// CIL[DOC-MICRO logic_summary="Validates inputs, calls the update_app_version RPC, and emits an audit event" notable_decisions="RPC encapsulates version logic and any related triggers"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:updateVersion:constant" type="constant" identity="updateVersion" parent="~/.framework/functions/apps.ts"]
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
// CIL[END stable_id="~/.framework/functions/apps.ts:updateVersion:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Update an app version via a stored procedure'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Dispatch incoming app requests to the correct handler by HTTP method and action"]
// CIL[DOC-RESPONSIBILITY responsibility="Route GET/POST/PATCH/DELETE methods to the appropriate list, get, schema, create, update, remove, and version handlers"]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/apps.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.method, action, id, and slug" outputs="result of the delegated handler" errors="Unsupported HTTP method" side_effects="delegates to other handlers"]
// CIL[DOC-MICRO logic_summary="Switches on HTTP method and query params to dispatch to the appropriate app operation" notable_decisions="GET with id or slug maps to get; action schema/available handled; POST action version or create; PATCH update; DELETE remove"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/apps.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/apps.ts"]
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
// CIL[END stable_id="~/.framework/functions/apps.ts:handler:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Dispatch incoming app requests to the correct handler by HTTP method and action'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
