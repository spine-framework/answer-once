// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/api-keys.ts"]





















 








// CIL[DOC-AUDIENCE audience="function-developers,system-integrators"]
// CIL[DOC-MACRO purpose="Netlify function module for API key lifecycle management"]
// CIL[DOC-RESPONSIBILITY responsibility="Import shared middleware, DB, audit, principal, permissions and hash helpers"]
// CIL[DOC-CONTEXT module="api-keys" layer="netlify-functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/hash-api-key.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets up imports used by list/get/create/validate/revoke/usage-logs handlers" notable_decisions="Uses shared middleware and principal checks"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin } from './_shared/principal'
import { sanitizeRecordData } from './_shared/permissions'
import { hashApiKey } from './_shared/hash-api-key'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function module for API key lifecycle management'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/api-keys.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/api-keys.ts"]
// CIL[DOC-MACRO purpose="List API keys for an account with optional filters"]
// CIL[DOC-RESPONSIBILITY responsibility="Query api_keys table, apply filters, sanitize results, and return paginated list"]
// CIL[DOC-CONTEXT module="api-keys" layer="netlify-functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/hash-api-key.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/api-keys.ts"]
// CIL[DOC-CONTRACT inputs="integration_id,key_type,is_active,expires_before,expires_after,limit,offset via ctx.query" outputs="Array of sanitized api_key records" errors="Account context required; DB query errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a Supabase query with filters and range, then sanitizes each record" notable_decisions="Uses isSystemAdmin to choose adminDb vs ctx.db"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const list = createHandler(async (ctx, _body) => {
  const { integration_id, key_type, is_active, expires_before, expires_after, limit = 100, offset = 0 } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })

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
    sanitized.push(await sanitizeRecordData(ctx, key, 'api_key'))
  }

  return sanitized
})
// CIL[DOC-VECTOR type="context" content="purpose='List API keys for an account with optional filters'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/api-keys.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/api-keys.ts"]
// CIL[DOC-MACRO purpose="Fetch a single API key by ID"]
// CIL[DOC-RESPONSIBILITY responsibility="Retrieve one api_keys row by id and sanitize it"]
// CIL[DOC-CONTEXT module="api-keys" layer="netlify-functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/hash-api-key.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/api-keys.ts"]
// CIL[DOC-CONTRACT inputs="id via ctx.query" outputs="Sanitized api_key record" errors="API key ID is required; DB errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Queries by id with .single(), then sanitizes" notable_decisions="Reuses principal/adminDb selection"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('API key ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
    .from('api_keys')
    .select('*')
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'api_key')
})
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single API key by ID'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/api-keys.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/api-keys.ts"]
// CIL[DOC-MACRO purpose="Create a new API key"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate input, generate key hash, insert record, emit audit log, and return the raw key once"]
// CIL[DOC-CONTEXT module="api-keys" layer="netlify-functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/hash-api-key.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/api-keys.ts"]
// CIL[DOC-CONTRACT inputs="integration_id,app_id,name,key_type,permissions,scopes,rate_limit,expires_at,metadata,machine_type,is_internal via body" outputs="Created api_key record plus raw_key and warning" errors="name is required; Account context required; DB insert errors" side_effects="Inserts into api_keys; emits api_key.created audit log"]
// CIL[DOC-MICRO logic_summary="Generates slug and raw key, hashes it, inserts data, logs, and returns a one-time raw key" notable_decisions="Hashes the raw key before storage; returns raw key only on creation"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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

  const slug = body.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const rawKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`
  const { key_prefix, key_hash } = hashApiKey(rawKey)

  const insertData = {
    integration_id: integration_id || null,
    app_id: app_id || ctx.appId || null,
    account_id: ctx.accountId,
    slug,
    name,
    key_prefix,
    key_hash,
    key_type: key_type || 'inbound',
    permissions: permissions || [],
    scopes: scopes || [],
    rate_limit: rate_limit || 100,
    expires_at: expires_at || null,
    metadata: metadata || {},
    machine_type: machine_type || 'integration',
    is_internal: is_internal || false,
    is_active: true,
    created_by: ctx.principal?.id || null
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
// CIL[DOC-VECTOR type="context" content="purpose='Create a new API key'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/api-keys.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:validate:constant" type="constant" identity="validate" parent="~/.framework/functions/api-keys.ts"]
// CIL[DOC-MACRO purpose="Validate an API key value and optional permissions"]
// CIL[DOC-RESPONSIBILITY responsibility="Look up active keys by prefix, verify hash, check permissions, and return validity and identity"]
// CIL[DOC-CONTEXT module="api-keys" layer="netlify-functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/hash-api-key.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/api-keys.ts"]
// CIL[DOC-CONTRACT inputs="key_value,required_permissions via body" outputs="{ is_valid, api_key_id, integration_id, app_id, account_id, scopes, permissions } or { is_valid, error }" errors="key_value is required; DB errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Searches active or unexpired keys matching prefix, verifies hash against key_hash, and checks required permissions" notable_decisions="Dynamically imports verifyApiKey; returns first matched key"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const validate = createHandler(async (ctx, body) => {
  const { key_value, required_permissions } = body

  if (!key_value) {
    throw new Error('key_value is required')
  }

  const keyPrefix = key_value.slice(0, 8)

  const { data: rows, error: err } = await ctx.db
    .from('api_keys')
    .select('*')
    .eq('key_prefix', keyPrefix)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gte.now()')

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
// CIL[DOC-VECTOR type="context" content="purpose='Validate an API key value and optional permissions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/api-keys.ts:validate:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:revoke:constant" type="constant" identity="revoke" parent="~/.framework/functions/api-keys.ts"]
// CIL[DOC-MACRO purpose="Deactivate an API key by ID"]
// CIL[DOC-RESPONSIBILITY responsibility="Update is_active to false and emit an audit log"]
// CIL[DOC-CONTEXT module="api-keys" layer="netlify-functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/hash-api-key.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/api-keys.ts"]
// CIL[DOC-CONTRACT inputs="id via body" outputs="Updated api_key record" errors="API key ID is required; DB update errors" side_effects="Sets is_active=false on api_keys row; emits api_key.revoked audit log"]
// CIL[DOC-MICRO logic_summary="Updates the row with is_active false and current timestamp, then logs" notable_decisions="Performs soft revocation via is_active flag"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const revoke = createHandler(async (ctx, body) => {
  const { id } = body

  if (!id) {
    throw new Error('API key ID is required')
  }

  const { data, error: err } = await ctx.db
    .from('api_keys')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'api_key.revoked', 
    { type: 'api_key', id }, 
    { after: { revoked_by: ctx.principal?.id } }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Deactivate an API key by ID'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/api-keys.ts:revoke:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:listUsageLogs:constant" type="constant" identity="listUsageLogs" parent="~/.framework/functions/api-keys.ts"]
// CIL[DOC-MACRO purpose="List API key usage logs with filters"]
// CIL[DOC-RESPONSIBILITY responsibility="Query api_key_usage_logs, join api_keys, apply filters, and return paginated results"]
// CIL[DOC-CONTEXT module="api-keys" layer="netlify-functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/hash-api-key.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/api-keys.ts"]
// CIL[DOC-CONTRACT inputs="api_key_id,response_status,success,date_from,date_to,limit,offset via ctx.query" outputs="Array of usage log records with api_key details" errors="Account context required; DB query errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a Supabase query with filters and range over usage logs" notable_decisions="Joins api_keys in select; normalizes success to boolean"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const listUsageLogs = createHandler(async (ctx, _body) => {
  const { api_key_id, response_status, success, date_from, date_to, limit = 100, offset = 0 } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = ctx.db
    .from('api_key_usage_logs')
    .select(`
      *,
      api_key:api_keys(id, name, key_type)
    `)
    .order('created_at', { ascending: false })

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
// CIL[DOC-VECTOR type="context" content="purpose='List API key usage logs with filters'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/api-keys.ts:listUsageLogs:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/api-keys.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/api-keys.ts"]
// CIL[DOC-MACRO purpose="Route incoming Netlify function requests to the appropriate action"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch GET/POST actions to list, get, create, validate, revoke, or listUsageLogs"]
// CIL[DOC-CONTEXT module="api-keys" layer="netlify-functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/hash-api-key.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/api-keys.ts"]
// CIL[DOC-CONTRACT inputs="action,method,id via ctx.query; body" outputs="Result from delegated handler or error" errors="Invalid action or method" side_effects="Calls delegated handlers"]
// CIL[DOC-MICRO logic_summary="Switch on action and HTTP method to call the correct sub-handler" notable_decisions="Default GET lists or gets; POST creates; validate/revoke/usage-logs are explicit"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Route incoming Netlify function requests to the appropriate action'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/api-keys.ts:handler:constant"]