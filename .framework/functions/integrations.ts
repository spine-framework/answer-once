/**
 * @module   integrations
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides integration functions for handling various operations within the application. It serves as a middleware layer that processes requests, ensuring proper authentication and data sanitization before interacting with the database. INVARIANT: All requests must be authenticated as a system admin to access sensitive operations.
 *
 * @seeAlso middleware.ts (provides request handling capabilities).
 * @seeAlso db.ts (contains database interaction functions).
 * @seeAlso audits.ts (handles logging of operations).
 * @seeAlso permissions.ts (ensures data access control).
 *
 * @cil-generated
 */










import { createHandler } from './_shared/middleware'
import { joins, adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { sanitizeRecordData } from './_shared/permissions'
import { isSystemAdmin } from './_shared/principal'
import { isAccountAdmin } from './_shared/access'
















/**
 * Derives a URL-friendly slug from a given name, ensuring it is lowercase and replaces spaces with hyphens while removing invalid characters. This function can also use a provided slug if available.
 *
 * @inputSpec
 *   - name: string (required) — the name to derive the slug from.
 *   - slug: string (optional) — an optional slug to use instead of deriving from the name.
 * @outputSpec  string — a URL-friendly slug derived from the name or the provided slug.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function deriveSlug(name: string, slug?: string): string {
  return slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
















/**
 * Determines if the provided credentials are configured correctly by checking for valid entries in the credentials object. This function ensures that all necessary credential values are present and valid.
 *
 * @inputSpec
 *   credentials: Record<string, any> | undefined (optional) — an object containing credential entries or undefined.
 * @outputSpec  boolean — returns true if all entries are valid, otherwise false.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function computeIsConfigured(credentials: Record<string, any> | undefined): boolean {
  if (!credentials || Object.keys(credentials).length === 0) return false
  return Object.values(credentials).every((entry: any) => {
    if (!entry || !entry.source) return false
    return typeof entry.value === 'string' && entry.value.length > 0
  })
}















/**
 * The 'list' constant defines an asynchronous handler that retrieves a list of integrations based on various query parameters, ensuring that the request context includes an account ID. It applies filters based on the provided query parameters.
 *
 * @throws      Error — Account context required if ctx.accountId is missing.
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('integrations'), ctx.db.from('integrations'), sanitizeRecordData
 * @errorHandling none
 * @cil-generated
 */
export const list = createHandler(async (ctx, _body) => {
  const { integration_type, provider, is_active, is_configured, limit = 100, offset = 0 } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
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















/**
 * Retrieves a specific integration record from the database based on the provided integration ID. This function ensures that the caller has the necessary permissions and handles potential errors during the database query.
 *
 * @throws      Error — Integration ID is required, Error — database query error
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('integrations'), ctx.db.from('integrations'), sanitizeRecordData
 * @cil-generated
 */
export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Integration ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
    .from('integrations')
    .select(`*, ${joins.app}, ${joins.createdBy}`)
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'integration')
})















/**
 * Creates a new integration record in the database based on the provided parameters while ensuring required fields are present and validating user context. This function is essential for managing integrations within the application.
 *
 * @throws      Error — name, integration_type, and provider are required; Error — User context (person and account) required; Error — database insert error.
 * @sideEffects Writes a new record to the 'integrations' table and emits a log event.
 * @stability   internal
 * @calls       adminDb.from('integrations'), ctx.db.from('integrations'), emitLog
 * @cil-generated
 */
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, integration_type, provider, version, config, credentials, metadata } = body

  if (!name || !integration_type || !provider) {
    throw new Error('name, integration_type, and provider are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  if (!isSystemAdmin(ctx.principal) && !isAccountAdmin(ctx, ctx.accountId)) {
    const e: any = new Error('Insufficient permissions — *_admin role required to manage integrations')
    e.statusCode = 403
    throw e
  }

  // env_var credentials resolve from server process.env — a tenant caller
  // naming SUPABASE_SERVICE_ROLE_KEY or OPENAI_API_KEY would exfiltrate the
  // platform secret at outbound time. Only system principals may register
  // env-sourced credentials; tenants store literal values.
  if (!isSystemAdmin(ctx.principal) && credentials && typeof credentials === 'object') {
    for (const entry of Object.values(credentials) as any[]) {
      if (entry && entry.source === 'env_var') {
        const e: any = new Error('env_var credentials are restricted to system integrations')
        e.statusCode = 403
        throw e
      }
    }
  }

  const safeCredentials = credentials || {}

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
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
      created_by: ctx.principal.type === 'human' ? ctx.principal.id : null
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















/**
 * The update constant defines a handler for updating integration records in the database. It ensures that required fields are present and only allowed fields are updated.
 *
 * @throws      Error — Integration ID is required, Error — database update error
 * @sideEffects DB writes to the 'integrations' table, emits a log event for the update.
 * @stability   internal
 * @calls       adminDb.from('integrations'), ctx.db.from('integrations'), emitLog
 * @cil-generated
 */
export const update = createHandler(async (ctx, body) => {
  if (!isSystemAdmin(ctx.principal) && !isAccountAdmin(ctx, ctx.accountId)) {
    const e: any = new Error('Insufficient permissions — *_admin role required to manage integrations')
    e.statusCode = 403
    throw e
  }
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
    if (!isSystemAdmin(ctx.principal)) {
      for (const entry of Object.values(updateData.credentials) as any[]) {
        if (entry && entry.source === 'env_var') {
          const e: any = new Error('env_var credentials are restricted to system integrations')
          e.statusCode = 403
          throw e
        }
      }
    }
    updateData.is_configured = computeIsConfigured(updateData.credentials)
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let updQ = db
    .from('integrations')
    .update(updateData)
    .eq('id', id)
  if (!isSystemAdmin(ctx.principal)) {
    // ctx.db is the service-role client for account-bound machine keys — the
    // explicit account filter is what stops them rewriting platform or
    // foreign-tenant integrations.
    updQ = updQ.eq('account_id', ctx.accountId)
  }
  const { data, error: err } = await updQ
    .select()
    .single()

  if (err) throw err

  // S-005: redact credentials from the audit payload — the DB write above is
  // untouched, but `after` lands in public.logs and must never carry secrets.
  const auditAfter = { ...updateData }
  if (auditAfter.credentials !== undefined) {
    auditAfter.credentials = { __redacted: true }
  }

  await emitLog(ctx, 'integration.updated', 
    { type: 'integration', id }, 
    { after: auditAfter }
  )

  return data
})















/**
 * The 'remove' constant defines a handler for deleting an integration by its ID, marking it as inactive in the database. It ensures that the integration ID is provided and logs the deletion event.
 *
 * @throws      Error — Integration ID is required, Error — Integration not found, Error — database error
 * @sideEffects Updates the 'integrations' table in the database and emits a log event.
 * @stability   internal
 * @calls       adminDb.from('integrations'), ctx.db.from('integrations'), emitLog
 * @cil-generated
 */
export const remove = createHandler(async (ctx, _body) => {
  const id = ctx.query?.id

  if (!id) {
    throw new Error('Integration ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data: current } = await db
    .from('integrations')
    .select('id, name, provider')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Integration not found')

  const { data, error: err } = await db
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















/**
 * The handler processes incoming requests based on the HTTP method specified in the query parameters. It routes the request to the appropriate function for handling GET, POST, PATCH, or DELETE operations.
 *
 * @throws      Error — Unsupported method: {method}
 * @sideEffects none
 * @stability   internal
 * @calls       get, list, create, update, remove
 * @cil-generated
 */
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







