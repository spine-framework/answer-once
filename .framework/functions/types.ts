// CIL[BEGIN stable_id="~/.framework/functions/types.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Netlify function module that exposes CRUD and schema query handlers for runtime record type definitions"]
// CIL[DOC-RESPONSIBILITY responsibility="Import shared utilities and export typed handlers for listing, reading, creating, updating, soft-deleting, and routing types"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-CONTRACT inputs="HTTP method, query parameters, request body" outputs="JSON response for type records or schema" errors="Validation, permission, and database errors" side_effects="Database reads/writes and audit log emissions"]
// CIL[DOC-MICRO logic_summary="Aggregates all type operation handlers into a single module export" notable_decisions="Uses createHandler for request context; delegates routing to handler"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework_developers"]

import { createHandler } from './_shared/middleware'
import { adminDb, joins } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin } from './_shared/principal'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'
import { generateValidationSchema } from './_shared/schema-utils'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function module that exposes CRUD and schema query handlers for runtime record type definitions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/types.ts:permissions:constant" type="constant" identity="permissions" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Provide a typed alias to the permission engine for system admin checks"]
// CIL[DOC-RESPONSIBILITY responsibility="Cast PermissionEngine to any so handlers can call isSystemAdmin"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="permissions alias" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Casts PermissionEngine to any for convenience" notable_decisions="Avoids strict typing at this boundary"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const permissions = PermissionEngine as any
// CIL[DOC-VECTOR type="context" content="purpose='Provide a typed alias to the permission engine for system admin checks'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:permissions:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/types.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="List active type definitions with optional filters and pagination"]
// CIL[DOC-RESPONSIBILITY responsibility="Query the public.types table and sanitize records based on the caller principal"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="kind, app_id, ownership, limit, offset, include_schema query parameters" outputs="array of sanitized type rows" errors="Database query errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a filtered, paginated Supabase query against the types table and returns sanitized results" notable_decisions="Returns minimal fields for unauthenticated callers; includes schema only when requested"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const list = createHandler(async (ctx, body) => {
  const { kind, app_id, ownership, limit = '50', offset = '0', include_schema } = ctx.query || {}

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('types')
    .select('*')
    .eq('is_active', true)
    .order('kind')
    .order('name')

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
// CIL[DOC-VECTOR type="context" content="purpose='List active type definitions with optional filters and pagination'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/types.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Fetch a single active type record by id"]
// CIL[DOC-RESPONSIBILITY responsibility="Retrieve a single type row by id and sanitize it for the caller"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="id query parameter" outputs="sanitized type record" errors="Missing id, not found, database errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects a single active type by id and returns a sanitized record" notable_decisions="Uses adminDb for system admins and ctx.db otherwise"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
    .eq('is_active', true)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'type')
})
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single active type record by id'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/types.ts:getBySlug:constant" type="constant" identity="getBySlug" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Fetch an active type record by slug"]
// CIL[DOC-RESPONSIBILITY responsibility="Retrieve a single active type row by slug, including related app, and sanitize it"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="slug query parameter" outputs="sanitized type record with app join" errors="Missing slug, not found, database errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects a single active type by slug with the app join and returns sanitized data" notable_decisions="Uses ctx.db rather than adminDb"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Fetch an active type record by slug'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:getBySlug:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/types.ts:getSchema:constant" type="constant" identity="getSchema" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Return the design schema for a given kind and slug"]
// CIL[DOC-RESPONSIBILITY responsibility="Call the get_type_schema database function and return the design schema"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="kind, slug, app_id query parameters" outputs="object containing design_schema" errors="Missing kind or slug, database errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Invokes the get_type_schema Postgres RPC with optional app_id" notable_decisions="Passes app_id as null when not provided"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Return the design schema for a given kind and slug'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:getSchema:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/types.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Create a new type definition"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate admin privileges, enforce required fields, check uniqueness, generate validation schema, insert the row, and emit an audit log"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="request body with name, slug, kind, and optional fields" outputs="newly created type row" errors="Non-admin, missing fields, duplicate slug, database errors" side_effects="Inserts row into public.types and emits type.created audit log"]
// CIL[DOC-MICRO logic_summary="Enforces system admin, validates required fields, prevents duplicate active slug, generates validation schema if absent, inserts the row, and logs" notable_decisions="Uses adminDb for inserts and falls back to generated validation schema"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
    view_config = {},
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
      view_config,
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
// CIL[DOC-VECTOR type="context" content="purpose='Create a new type definition'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/types.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Update an existing type definition"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate admin, find the row, protect system ownership, build allowed updates, regenerate validation schema on design change, and log"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="id query parameter and request body fields" outputs="updated type row" errors="Non-admin, missing id, not found, ownership change forbidden, database errors" side_effects="Updates row and emits type.updated audit log"]
// CIL[DOC-MICRO logic_summary="Selects existing type, blocks ownership changes on system types, applies whitelisted updates, regenerates validation schema when design_schema changes, and logs" notable_decisions="Only updates explicitly provided fields; permission check is performed before lookup"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
    .eq('is_active', true)
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
    view_config,
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
  if (view_config !== undefined) updates.view_config = view_config
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
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing type definition'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:update:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/types.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Soft-delete an existing type definition"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate admin, find the active row, protect system types, set is_active false, and emit an audit log"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="id query parameter" outputs="success flag" errors="Non-admin, missing id, not found, system type deletion" side_effects="Sets is_active false and emits type.deleted audit log"]
// CIL[DOC-MICRO logic_summary="Marks an active type as inactive and emits an audit log" notable_decisions="Uses soft delete via is_active update; blocks deletion of system-owned types"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Soft-delete an existing type definition'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:remove:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/types.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/types.ts"]
// CIL[DOC-MACRO purpose="Route incoming requests to the appropriate type operation"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch method and query parameters to list, get, getBySlug, getSchema, create, update, or remove"]
// CIL[DOC-CONTEXT module="types function" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/schema-utils.ts,.framework/functions/types.ts"]
// CIL[DOC-CONTRACT inputs="action, id, slug, kind, method query parameters" outputs="result from delegated handler" errors="Invalid action or method" side_effects="None beyond delegated handler"]
// CIL[DOC-MICRO logic_summary="Reads HTTP method and query flags to select the correct internal handler and returns its result" notable_decisions="Schema action takes precedence; GET defaults to list when no id/slug/kind provided"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Route incoming requests to the appropriate type operation'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/types.ts:handler:constant"]