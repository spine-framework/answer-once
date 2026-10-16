// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="Integration handler module that exports CRUD handlers and helpers for the integrations table"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide create, read, update, and delete handlers plus slug derivation and credential validation helpers for integration records"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="HTTP request context and method" outputs="Routed integration data responses" errors="Throws on missing context, invalid input, or database errors" side_effects="Reads and writes integrations table and emits audit logs"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware, database joins, audit, and permissions helpers then defines slug derivation, credential configuration check, list, get, create, update, remove, and a top-level method router" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers maintaining integration handlers and related admin-data endpoints"]

import { createHandler } from './_shared/middleware'
import { joins } from './_shared/db'
import { emitLog } from './_shared/audit'
import { sanitizeRecordData } from './_shared/permissions'
// CIL[DOC-VECTOR type="context" content="purpose='Integration handler module that exports CRUD handlers and helpers for the integrations table'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integrations.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:deriveSlug:function" type="function" identity="deriveSlug" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="Derive a URL-safe slug from a name and optional override"]
// CIL[DOC-RESPONSIBILITY responsibility="Normalize integration names to kebab-case slugs"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/integrations.ts"]
// CIL[DOC-CONTRACT inputs="name: string, slug?: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Returns provided slug or lowercases the name, collapses whitespace to hyphens, and strips characters that are not alphanumeric or hyphens" notable_decisions="[]"]
function deriveSlug(name: string, slug?: string): string {
  return slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
// CIL[END stable_id="~/.framework/functions/integrations.ts:deriveSlug:function"]

// CIL[DOC-VECTOR type="context" content="purpose='Derive a URL-safe slug from a name and optional override'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:computeIsConfigured:function" type="function" identity="computeIsConfigured" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="Determine whether all credential entries are populated strings"]
// CIL[DOC-RESPONSIBILITY responsibility="Evaluate integration configured status from a credentials map"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/integrations.ts"]
// CIL[DOC-CONTRACT inputs="credentials: Record<string, any> | undefined" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns false if credentials is undefined or empty; otherwise requires every entry to have a source and a non-empty string value" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function computeIsConfigured(credentials: Record<string, any> | undefined): boolean {
  if (!credentials || Object.keys(credentials).length === 0) return false
  return Object.values(credentials).every((entry: any) => {
    if (!entry || !entry.source) return false
    return typeof entry.value === 'string' && entry.value.length > 0
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Determine whether all credential entries are populated strings'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integrations.ts:computeIsConfigured:function"]
// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="List integration records with optional filters and pagination"]
// CIL[DOC-RESPONSIBILITY responsibility="Handle GET /integrations list requests"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/integrations.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: any" outputs="Sanitized integration records" errors="Throws on missing account or database error" side_effects="Reads integrations table with optional filters"]
// CIL[DOC-MICRO logic_summary="Builds a query from query parameters, applies pagination, and sanitizes each returned record" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const list = createHandler(async (ctx, _body) => {
  const { integration_type, provider, is_active, is_configured, limit = 100, offset = 0 } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = ctx.db
    .from('integrations')
    .select(`*, ${joins.app}, ${joins.createdBy}`)
    .order('name')

  if (integration_type) {
    query = query.eq('integration_type', integration_type)
  }
  if (provider) {
    query = query.eq('provider', provider)
  }
  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true')
  }
  if (is_configured !== undefined) {
    query = query.eq('is_configured', is_configured === 'true')
  }

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  const sanitized = []
  for (const integration of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, integration, 'integration'))
  }

  return sanitized
})
// CIL[DOC-VECTOR type="context" content="purpose='List integration records with optional filters and pagination'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integrations.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="Retrieve a single integration by id"]
// CIL[DOC-RESPONSIBILITY responsibility="Handle GET /integrations?id=... requests"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/integrations.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: any" outputs="Sanitized integration record" errors="Throws when id missing or record not found" side_effects="Reads integrations table"]
// CIL[DOC-MICRO logic_summary="Fetches one integration by id and sanitizes the result for the caller" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Integration ID is required')
  }

  const { data, error: err } = await ctx.db
    .from('integrations')
    .select(`*, ${joins.app}, ${joins.createdBy}`)
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'integration')
})
// CIL[DOC-VECTOR type="context" content="purpose='Retrieve a single integration by id'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integrations.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="Create a new integration record"]
// CIL[DOC-RESPONSIBILITY responsibility="Handle POST /integrations requests"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/integrations.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body with integration fields" outputs="New integration record" errors="Throws on validation, permission, or database error" side_effects="Inserts into integrations table and emits audit log"]
// CIL[DOC-MICRO logic_summary="Validates required fields and context, derives a slug, computes configured state, inserts the record, and emits an audit log" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, integration_type, provider, version, config, credentials, metadata } = body

  if (!name || !integration_type || !provider) {
    throw new Error('name, integration_type, and provider are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const safeCredentials = credentials || {}

  const { data, error: err } = await ctx.db
    .from('integrations')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      slug: deriveSlug(name, body.slug),
      name,
      description: description || null,
      integration_type,
      provider,
      version: version || '1.0.0',
      config: config || {},
      credentials: safeCredentials,
      metadata: metadata || {},
      is_configured: computeIsConfigured(safeCredentials),
      created_by: ctx.principal.id
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'integration.created', 
    { type: 'integration', id: data.id }, 
    { after: { name, integration_type, provider } }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a new integration record'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integrations.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="Update an existing integration record"]
// CIL[DOC-RESPONSIBILITY responsibility="Handle PATCH /integrations requests"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/integrations.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body with id and allowed fields" outputs="Updated integration record" errors="Throws on missing id or database error" side_effects="Updates integrations table and emits audit log"]
// CIL[DOC-MICRO logic_summary="Collects allowed fields, recomputes configured state when credentials change, updates by id, and emits an audit log" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, ...updates } = body || {}

  if (!id) {
    throw new Error('Integration ID is required')
  }

  const allowed = ['name', 'slug', 'description', 'integration_type', 'provider', 'version', 'config', 'credentials', 'metadata', 'is_active']
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (updates[key] !== undefined) updateData[key] = updates[key]
  }

  if (updateData.credentials !== undefined) {
    updateData.is_configured = computeIsConfigured(updateData.credentials)
  }

  const { data, error: err } = await ctx.db
    .from('integrations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'integration.updated', 
    { type: 'integration', id }, 
    { after: updateData }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing integration record'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integrations.ts:update:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="Soft-delete an integration by marking it inactive"]
// CIL[DOC-RESPONSIBILITY responsibility="Handle DELETE /integrations requests"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/integrations.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: any" outputs="Record marked inactive" errors="Throws when id missing or record not found" side_effects="Sets is_active to false and emits audit log"]
// CIL[DOC-MICRO logic_summary="Verifies the integration exists, marks it inactive with an updated timestamp, and emits an audit log" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const remove = createHandler(async (ctx, _body) => {
  const id = ctx.query?.id

  if (!id) {
    throw new Error('Integration ID is required')
  }

  const { data: current } = await ctx.db
    .from('integrations')
    .select('id, name, provider')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Integration not found')

  const { data, error: err } = await ctx.db
    .from('integrations')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'integration.deleted',
    { type: 'integration', id },
    { before: current, after: { is_active: false } }
  )

  return data
})
// CIL[END stable_id="~/.framework/functions/integrations.ts:remove:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/integrations.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/integrations.ts"]
// CIL[DOC-MACRO purpose="Route integration HTTP requests by method"]
// CIL[DOC-VECTOR type="context" content="purpose='Soft-delete an integration by marking it inactive'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch GET, POST, PATCH, DELETE to the appropriate handler"]
// CIL[DOC-CONTEXT module="integrations" layer=".framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/integrations.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: any" outputs="Result from chosen handler" errors="Throws for unsupported method or delegate errors" side_effects="Delegates to CRUD handlers and helpers"]
// CIL[DOC-MICRO logic_summary="Selects a handler based on the request method and optional id in query" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Route integration HTTP requests by method'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integrations.ts:handler:constant"]
