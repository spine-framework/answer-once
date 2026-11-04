// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/api-keys.ts"]
/**
 * @module   api-keys
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module manages API key operations, including creation and validation, as part of the system's security framework. It serves as a middleware handler that interacts with the database and performs necessary logging and permission checks. INVARIANT: All API key operations require system admin privileges. Route patterns include /api/keys for key management operations.
 *
 * @seeAlso middleware.ts (provides request handling functionality).
 * @seeAlso db.ts (interacts with the database for key storage).
 * @seeAlso audit.ts (handles logging of operations).
 * @seeAlso permissions.ts (ensures proper access control).
 *
 * @cil-generated
 */






















 
















import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin, isSystemPrincipal } from './_shared/principal'
import { sanitizeRecordData } from './_shared/permissions'
import { hashApiKey, omitSecretFields } from './_shared/hash-api-key'
import { resolveAppUuid } from './_shared/logging'
// CIL[END stable_id="~/.framework/functions/api-keys.ts:module_header:module_header"]


// True only for platform-level principals: a system_admin role or an
// internal machine principal with no account binding (SYSTEM_PRINCIPAL,
// produced only by the INTERNAL_INVOKE_SECRET path). Machine principals
// resolve to the service-role adminDb via getPrincipalDb, so account-bound
// API keys must be scoped to their own account below.















// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/api-keys.ts"]
/**
 * This function retrieves a list of API keys based on various query parameters and returns sanitized records. It ensures that only authorized users can access the data and applies filters based on the provided criteria.
 *
 * @throws      Error — Account context required.
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('api_keys'), ctx.db.from('api_keys'), sanitizeRecordData
 * @cil-generated
 */
export const list = createHandler(async (ctx, _body) => {
  const { integration_id, key_type, is_active, expires_before, expires_after, limit = 100, offset = 0 } = ctx.query || {}

  const isSystem = isSystemPrincipal(ctx)

  if (!isSystem && !ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })

  // Machine principals run on the service-role client — pin them to their
  // own account so they cannot enumerate other tenants' keys.
  if (!isSystem) {
    query = query.eq('account_id', ctx.accountId)
  }

  if (integration_id) {
    query = query.eq('integration_id', integration_id)
  }
  if (key_type) {
    query = query.eq('key_type', key_type)
  }
  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true')
  }
  if (expires_before) {
    query = query.lte('expires_at', expires_before)
  }
  if (expires_after) {
    query = query.gte('expires_at', expires_after)
  }

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  const sanitized = []
  for (const key of data || []) {
    sanitized.push(omitSecretFields(await sanitizeRecordData(ctx, key, 'api_key')))
  }

  return sanitized
})
// CIL[END stable_id="~/.framework/functions/api-keys.ts:list:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/api-keys.ts"]
/**
 * Retrieves an API key from the database based on the provided ID in the query parameters. It ensures that the caller has the necessary permissions and sanitizes the returned data before sending it back.
 *
 * @throws      Error — API key ID is required, Error — if there is an error fetching the API key.
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('api_keys'), ctx.db.from('api_keys'), sanitizeRecordData
 * @cil-generated
 */
export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('API key ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('api_keys')
    .select('*')
    .eq('id', id)

  if (!isSystemPrincipal(ctx)) {
    if (!ctx.accountId) {
      throw new Error('Account context required')
    }
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query.single()

  if (err) throw err

  return omitSecretFields(await sanitizeRecordData(ctx, data, 'api_key'))
})
// CIL[END stable_id="~/.framework/functions/api-keys.ts:get:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/api-keys.ts"]
/**
 * Creates a new API key for a specified integration and application, ensuring required fields are validated and generating a unique key. This function is essential for managing access to the API securely.
 *
 * @throws      Error — name is required, Error — Account context required, Error — database error
 * @sideEffects Writes a new record to the 'api_keys' table in the database and emits a log event.
 * @stability   internal
 * @calls       ctx.db.from('api_keys'), emitLog, resolveAppUuid
 * @cil-generated
 */
export const create = createHandler(async (ctx, body) => {
  const {
    integration_id,
    app_id,
    name,
    key_type,
    permissions,
    scopes,
    rate_limit,
    expires_at,
    metadata,
    machine_type,
    is_internal
  } = body

  if (!name) {
    throw new Error('name is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  // S-011: scopes and is_internal are privilege-bearing fields. A machine
  // caller runs on the service-role client, so accepting them verbatim let
  // any scoped key mint a *:* or is_internal key and escalate itself past
  // the isInternal gates elsewhere. Only system principals may request a
  // wildcard scope or an internal key — for everyone else those are hard
  // denials, other requested scopes are clipped to the scopes the caller
  // itself holds, and an omitted scopes list inherits the caller's own.
  const isSystem = isSystemPrincipal(ctx)
  let effectiveScopes: string[] = scopes || []
  let effectiveIsInternal = is_internal || false

  if (!isSystem) {
    if (is_internal) {
      const e: any = new Error('Insufficient permissions to create an internal API key')
      e.statusCode = 403
      throw e
    }
    if (Array.isArray(scopes) && scopes.includes('*:*')) {
      const e: any = new Error('Insufficient permissions to create a wildcard-scoped API key')
      e.statusCode = 403
      throw e
    }
    const callerScopes = Array.isArray(ctx.principal?.scopes) ? ctx.principal.scopes : []
    effectiveScopes = Array.isArray(scopes)
      ? scopes.filter((s: string) => callerScopes.includes(s))
      : callerScopes
    effectiveIsInternal = false
  }

  const slug = body.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const rawKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`
  const { key_prefix, key_hash } = hashApiKey(rawKey)

  const insertData = {
    integration_id: integration_id || null,
    app_id: (await resolveAppUuid(app_id || ctx.appId)) || null,
    account_id: ctx.accountId,
    slug,
    name,
    key_prefix,
    key_hash,
    key_type: key_type || 'inbound',
    permissions: permissions || [],
    scopes: effectiveScopes,
    rate_limit: rate_limit || 100,
    expires_at: expires_at || null,
    metadata: metadata || {},
    machine_type: machine_type || 'integration',
    is_internal: effectiveIsInternal,
    is_active: true,
    created_by: ctx.principal?.type === 'human' ? ctx.principal.id : null
  }

  const { data, error: err } = await ctx.db
    .from('api_keys')
    .insert(insertData)
    .select('id, name, key_type, rate_limit, expires_at, is_active, created_at')
    .single()

  if (err) throw err

  await emitLog(ctx, 'api_key.created',
    { type: 'api_key', id: data.id },
    { after: { name, key_type, rate_limit, integration_id } }
  )

  return {
    ...data,
    raw_key: rawKey,
    warning: 'Store this key now. It will not be shown again.'
  }
})
// CIL[END stable_id="~/.framework/functions/api-keys.ts:create:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:validate:constant" type="constant" identity="validate" parent="~/.framework/functions/api-keys.ts"]
/**
 * Validates an API key by checking its existence and permissions in the database. This function ensures that only active keys with the required permissions can be used.
 *
 * @throws      Error — key_value is required, Error — database error
 * @sideEffects Database read operations.
 * @stability   internal
 * @calls       ctx.db.from('api_keys'), import('./_shared/hash-api-key')
 * @cil-generated
 */
export const validate = createHandler(async (ctx, body) => {
  const { key_value, required_permissions } = body

  if (!key_value) {
    throw new Error('key_value is required')
  }

  const isSystem = isSystemPrincipal(ctx)
  if (!isSystem && !ctx.accountId) {
    throw new Error('Account context required')
  }

  const keyPrefix = key_value.slice(0, 8)

  let query = ctx.db
    .from('api_keys')
    .select('*')
    .eq('key_prefix', keyPrefix)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gte.now()')

  // Scoped callers may only validate keys belonging to their own account —
  // ctx.db is service-role for machine principals, so without this filter a
  // caller could probe another account's key material.
  if (!isSystem) {
    query = query.eq('account_id', ctx.accountId)
  }

  const { data: rows, error: err } = await query

  if (err) throw err
  if (!rows || rows.length === 0) {
    return { is_valid: false, error: 'Invalid or inactive API key' }
  }

  const { verifyApiKey } = await import('./_shared/hash-api-key')

  for (const key of rows) {
    if (verifyApiKey(key_value, key.key_hash)) {
      const hasPermissions = !required_permissions || required_permissions.length === 0 ||
        (key.permissions || []).some((p: string) => required_permissions.includes(p))

      if (!hasPermissions) {
        return {
          is_valid: false,
          error: 'Insufficient permissions',
          api_key_id: key.id
        }
      }

      return {
        is_valid: true,
        api_key_id: key.id,
        integration_id: key.integration_id,
        app_id: key.app_id,
        account_id: key.account_id,
        scopes: key.scopes,
        permissions: key.permissions
      }
    }
  }

  return { is_valid: false, error: 'Invalid or inactive API key' }
})
// CIL[END stable_id="~/.framework/functions/api-keys.ts:validate:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:revoke:constant" type="constant" identity="revoke" parent="~/.framework/functions/api-keys.ts"]
/**
 * The 'revoke' constant defines a handler for deactivating an API key by its ID. It ensures that the API key ID is provided and logs the revocation action.
 *
 * @throws      Error — if the API key ID is missing or if a database error occurs.
 * @sideEffects Updates the 'api_keys' table in the database and emits a log event.
 * @stability   internal
 * @calls       ctx.db.from('api_keys'), emitLog
 * @cil-generated
 */
export const revoke = createHandler(async (ctx, body) => {
  const { id } = body

  if (!id) {
    throw new Error('API key ID is required')
  }

  let query = ctx.db
    .from('api_keys')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (!isSystemPrincipal(ctx)) {
    if (!ctx.accountId) {
      throw new Error('Account context required')
    }
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query.select().single()

  if (err) throw err

  await emitLog(ctx, 'api_key.revoked', 
    { type: 'api_key', id }, 
    { after: { revoked_by: ctx.principal?.id } }
  )

  return omitSecretFields(data)
})
// CIL[END stable_id="~/.framework/functions/api-keys.ts:revoke:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:listUsageLogs:constant" type="constant" identity="listUsageLogs" parent="~/.framework/functions/api-keys.ts"]
/**
 * The listUsageLogs constant defines an asynchronous handler for retrieving API key usage logs based on various query parameters. It ensures that the account context is valid and constructs a query to fetch logs from the database.
 *
 * @throws      Error — Account context required.
 * @sideEffects none
 * @stability   internal
 * @calls       ctx.db.from('api_key_usage_logs'), ctx.db.select, ctx.db.eq, ctx.db.gte, ctx.db.lte, ctx.db.range
 * @errorHandling none
 * @cil-generated
 */
export const listUsageLogs = createHandler(async (ctx, _body) => {
  const { api_key_id, response_status, success, date_from, date_to, limit = 100, offset = 0 } = ctx.query || {}

  const isSystem = isSystemPrincipal(ctx)

  if (!isSystem && !ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = ctx.db
    .from('api_key_usage_logs')
    .select(`
      *,
      api_key:api_keys(id, name, key_type)
    `)
    .order('created_at', { ascending: false })

  if (!isSystem) {
    query = query.eq('account_id', ctx.accountId)
  }

  if (api_key_id) {
    query = query.eq('api_key_id', api_key_id)
  }
  if (response_status) {
    query = query.eq('response_status', parseInt(response_status.toString()))
  }
  if (success !== undefined) {
    query = query.eq('success', success === 'true')
  }
  if (date_from) {
    query = query.gte('created_at', date_from)
  }
  if (date_to) {
    query = query.lte('created_at', date_to)
  }

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  return data
})
// CIL[END stable_id="~/.framework/functions/api-keys.ts:listUsageLogs:constant"]















// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/api-keys.ts"]
/**
 * The handler processes API requests based on the action and method specified in the query parameters. It routes the request to the appropriate function for validation, revocation, usage logs, or general data handling.
 *
 * @throws      Error — Invalid action or method
 * @sideEffects none
 * @stability   internal
 * @calls       validate, revoke, listUsageLogs, get, list, create
 * @cil-generated
 */
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'validate':
      if (method === 'POST') {
        return await validate(ctx, body)
      }
      break
    case 'revoke':
      if (method === 'POST') {
        return await revoke(ctx, body)
      }
      break
    case 'usage-logs':
      if (method === 'GET') {
        return await listUsageLogs(ctx, body)
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
      }
  }

  throw new Error('Invalid action or method')
})
// CIL[END stable_id="~/.framework/functions/api-keys.ts:handler:constant"]






