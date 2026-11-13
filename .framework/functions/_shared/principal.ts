

















import { getUserDb, adminDb } from './db'
import { createClient } from '@supabase/supabase-js'

import { timingSafeEqual, createHash } from 'crypto'

function isInternalInvokeAuthorized(event: any): boolean {
  const expected = (globalThis as any).process?.env?.INTERNAL_INVOKE_SECRET
  if (!expected) return false

  const provided = event.headers?.['x-internal-secret'] || event.headers?.['X-Internal-Secret']
  if (!provided || typeof provided !== 'string') return false

  // Hash both sides so the comparison always runs on equal-length (32-byte)
  // inputs — an early-exit on length mismatch would leak the expected secret's
  // length via response timing.
  const expectedHash = createHash('sha256').update(expected).digest()
  const providedHash = createHash('sha256').update(provided).digest()

  try {
    return timingSafeEqual(expectedHash, providedHash)
  } catch {
    return false
  }
}



const env = (globalThis as any).process?.env || {}




const supabase = createClient(
  env.SUPABASE_URL || 'https://placeholder.supabase.co',
  env.SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)


export interface Principal {
  id: string
  type: 'human' | 'machine'
  accountId: string | null
  roles?: string[]
  displayName?: string
  email?: string
  scopes?: string[]
  machineType?: 'integration' | 'service_account' | 'internal' | 'timer'
  isInternal?: boolean
  provenance: {
    sourceType: 'jwt' | 'api_key' | 'cron' | 'trigger' | 'manual' | 'webhook' | 'timer'
    createdBy: string | null
    parentExecutionId?: string
    invokedAt: string
    apiKeyId?: string
    cronId?: string
    triggerId?: string
    timerId?: string
    eventId?: string
    ipAddress?: string
    userAgent?: string
  }


  // SECURITY: authContext carries raw credentials needed to build the
  // user-scoped DB client (getPrincipalDb). It is transport-only — never pass
  // a Principal to JSON.stringify, emitAudit, or any logging path. Use
  // formatPrincipalForAudit() for serialized views. apiKey is deliberately
  // absent: raw API keys are verified and discarded during resolution and must
  // never be stored on objects that may be cached or serialized.
  authContext?: {
    jwt?: string
  }
}



export const ANONYMOUS_PRINCIPAL: Principal = {
  id: 'anonymous',
  type: 'machine',
  accountId: null,
  scopes: [],
  provenance: {
    sourceType: 'manual',
    createdBy: null,
    invokedAt: new Date().toISOString()
  }
}






export const SYSTEM_PRINCIPAL: Principal = {
  id: 'system',
  type: 'machine',
  accountId: null,
  scopes: ['*:*'],
  machineType: 'internal',
  isInternal: true,
  provenance: {
    sourceType: 'manual',
    createdBy: null,
    invokedAt: new Date().toISOString()
  }
}





export async function resolvePrincipal(event: any): Promise<Principal> {
  const apiKey = event.headers?.['x-api-key'] || event.headers?.['X-Api-Key']
  if (apiKey) {
    return resolveMachinePrincipal(apiKey, event)
  }

  // x-cron-id / x-trigger-id let the caller assume a privileged machine
  // principal by ID alone. They must never be honored unless the request
  // also proves it came from a trusted internal caller via a shared
  // secret (see isInternalInvokeAuthorized) — otherwise anyone who learns
  // a valid schedule/trigger id (e.g. from the admin UI or an audit log)
  // could impersonate that principal on any endpoint.
  if (isInternalInvokeAuthorized(event)) {
    const cronId = event.headers?.['x-cron-id'] || event.headers?.['X-Cron-Id']
    if (cronId) {
      return resolveCronPrincipal(cronId)
    }

    const triggerId = event.headers?.['x-trigger-id'] || event.headers?.['X-Trigger-Id']
    if (triggerId) {
      return resolveTriggerPrincipal(triggerId, event)
    }

    // A bare internal-invoke secret is itself a first-class credential —
    // function-to-function calls without a cron/trigger principal to
    // impersonate (e.g. manual system-cron runs) get the privileged
    // system principal rather than falling through to anonymous.
    return SYSTEM_PRINCIPAL
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization
  if (authHeader?.startsWith('Bearer ')) {
    return resolveHumanPrincipal(authHeader.replace('Bearer ', ''), event)
  }
  
  return ANONYMOUS_PRINCIPAL
}

async function resolveMachinePrincipal(apiKey: string, event: any): Promise<Principal> {
  const keyPrefix = apiKey.slice(0, 8)

  const { data: rows, error } = await adminDb
    .from('api_keys')
    .select('*')
    .eq('key_prefix', keyPrefix)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !rows || rows.length === 0) {
    throw new Error('Invalid or inactive machine principal')
  }

  const now = Date.now()
  const key = rows.find((k: any) => !k.expires_at || new Date(k.expires_at).getTime() >= now)
  if (!key) {
    throw new Error('Invalid or inactive machine principal')
  }
  const { verifyApiKey } = await import('./hash-api-key')
  if (!verifyApiKey(apiKey, key.key_hash)) {
    throw new Error('Invalid or inactive machine principal')
  }

  const rateWindowSeconds = (key.config?.rate_limit_window_seconds as number) || 60
  const rateLimit = key.rate_limit || 100
  const windowStart = new Date(Date.now() - rateWindowSeconds * 1000).toISOString()

  const { count, error: countError } = await adminDb
    .from('api_key_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', key.id)
    .gte('created_at', windowStart)

  if (!countError && count !== null && count >= rateLimit) {
    throw new Error('Rate limit exceeded for this API key')
  }

  // Secondary per-IP ceiling: the per-key limit alone cannot catch a caller
  // rotating through many valid keys. rate_limit_hit (migration 035) is the
  // atomic DB counter — key on the trusted client IP + endpoint so expensive
  // endpoints can be tuned separately. Fail-open: a limiter outage must not
  // take down machine authentication.
  const clientIp = getClientIp(event)
  if (clientIp) {
    const ipWindowSeconds = 60
    const ipLimit = Number(env.SPINE_IP_RATE_LIMIT || 300)
    const ipWindowStart = new Date(
      Math.floor(now / (ipWindowSeconds * 1000)) * ipWindowSeconds * 1000
    ).toISOString()
    try {
      const { data: ipCount } = await adminDb.rpc('rate_limit_hit', {
        p_key: `ip:${clientIp}:${event.path || '/'}`,
        p_window_start: ipWindowStart,
      })
      if (typeof ipCount === 'number' && ipCount > ipLimit) {
        throw new Error('Rate limit exceeded for this address')
      }
    } catch (err: any) {
      if (err?.message === 'Rate limit exceeded for this address') throw err
      console.warn('IP rate limit check failed (fail-open):', err?.message)
    }
  }

  await adminDb.from('api_key_usage_logs').insert({
    api_key_id: key.id,
    account_id: key.account_id,
    request_method: event.httpMethod,
    request_path: event.path,
    request_ip: getClientIp(event),
    user_agent: event.headers?.['user-agent'] || event.headers?.['User-Agent'],
    success: true,
    metadata: { source: 'resolve_machine_principal' }
  })

  const isGlobal = (key.scopes || []).includes('*:*')

  return {
    id: key.id,
    type: 'machine',
    accountId: key.account_id,
    scopes: key.scopes || [],
    roles: isGlobal ? ['system_admin'] : [],
    machineType: (key.machine_type as any) || 'integration',
    isInternal: key.is_internal,
    provenance: {
      sourceType: 'api_key',
      createdBy: key.created_by,
      invokedAt: new Date().toISOString(),
      apiKeyId: key.id,
      ipAddress: getClientIp(event),
      userAgent: event.headers?.['user-agent'] || event.headers?.['User-Agent']
    }
    // The raw API key is intentionally NOT stored on the principal — the key is
    // verified above and discarded. getPrincipalDb() returns adminDb for machine
    // principals regardless, so no downstream consumer needs the credential.
  }
}



async function resolveCronPrincipal(scheduleId: string): Promise<Principal> {
  const { data: schedule, error: scheduleError } = await adminDb
    .from('schedules')
    .select(`
      *,
      machine:machine_principal_id (*)
    `)
    .eq('id', scheduleId)
    .single()
  
  if (scheduleError || !schedule) {
    throw new Error('Invalid or inactive schedule: ' + scheduleId)
  }
  
  const { data: validation, error: validationError } = await adminDb.rpc('validate_schedule_creator', {
    p_schedule_id: scheduleId
  })
  
  if (validationError || !validation.is_valid) {
    throw new Error(validation.error_message || 'Schedule validation failed')
  }
  
  const machine = schedule.machine
  
  return {
    id: machine.id,
    type: 'machine',
    accountId: machine.account_id,
    scopes: schedule.delegated_scopes || machine.scopes || [],
    machineType: machine.machine_type,
    isInternal: machine.is_internal,
    provenance: {
      sourceType: 'cron',
      createdBy: machine.created_by,
      invokedAt: new Date().toISOString(),
      cronId: scheduleId
    }
  }
}

async function resolveTriggerPrincipal(triggerId: string, event: any): Promise<Principal> {
  const { data: trigger, error: triggerError } = await adminDb
    .from('triggers')
    .select(`
      *,
      action:target_id (*)
    `)
    .eq('id', triggerId)
    .single()
  
  if (triggerError || !trigger) {
    throw new Error('Invalid trigger: ' + triggerId)
  }
  
  const action = trigger.action
  if (!action?.default_machine_principal_id) {
    throw new Error('Trigger action has no machine principal configured')
  }
  
  const { data: machine, error: machineError } = await adminDb
    .from('api_keys')
    .select('*')
    .eq('id', action.default_machine_principal_id)
    .single()
  
  if (machineError || !machine) {
    throw new Error('Machine principal not found: ' + action.default_machine_principal_id)
  }
  
  return {
    id: machine.id,
    type: 'machine',
    accountId: machine.account_id,
    scopes: machine.scopes || [],
    machineType: machine.machine_type,
    isInternal: machine.is_internal,
    provenance: {
      sourceType: 'trigger',
      createdBy: machine.created_by,
      invokedAt: new Date().toISOString(),
      triggerId: triggerId,
      eventId: event.body?.eventId || event.headers?.['x-event-id']
    }
  }
}

// cache avoids three sequential auth/people lookups on every polled request; provenance timestamps are refreshed per request so audit stays honest; unplaced (mid-registration, both fields null) principals skip the cache so placement lands on the next request instead of stalling 60s
// Module-level cache: sha256(token) → resolved human principal. Resolution
// costs 3 sequential round-trips (supabase.auth.getUser, person-id mapping,
// people+role join) and runs on every request — polling-heavy clients were
// paying ~1s of auth overhead per poll. 60s TTL bounds staleness for
// role/account changes. The authContext.jwt in the cached entry is only ever
// served back to the request that presented the same token. Principals for
// people missing BOTH account_id and role_id (registration placement still
// in flight) are never cached — see the comment at the cache write.
//
// SECURITY NOTE: role revocations, account deactivations, and account
// reassignments take up to 60 seconds to propagate to in-flight requests on
// warm function instances. This is a deliberate performance trade-off. Incident
// response: a full function redeploy clears the in-memory cache immediately. A
// DB-backed invalidation channel (e.g. a version counter on the people row)
// would close the window but costs a round-trip per cached hit.
const humanPrincipalCache = new Map<string, { principal: Principal; expiresAt: number }>()
const PRINCIPAL_CACHE_TTL_MS = 60_000
const PRINCIPAL_CACHE_MAX = 500

async function resolveHumanPrincipal(token: string, event: any): Promise<Principal> {
  const cacheKey = createHash('sha256').update(token).digest('hex')
  const cached = humanPrincipalCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    // Refresh request-scoped provenance so audit/log rows keep honest metadata
    return {
      ...cached.principal,
      provenance: {
        ...cached.principal.provenance,
        invokedAt: new Date().toISOString(),
        ipAddress: getClientIp(event),
        userAgent: event.headers?.['user-agent'] || event.headers?.['User-Agent']
      }
    }
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return ANONYMOUS_PRINCIPAL
  }
  
  const personId = await resolveInternalPersonId(
    user.id,
    user.email,
    Boolean((user as any).email_confirmed_at || (user as any).confirmed_at)
  )
  const userDb = getUserDb(token)
  
  const { data: person, error: personError } = await userDb
    .from('people')
    .select('*, role:roles!role_id(id, slug, name, is_system, permissions)')
    .eq('id', personId)
    .single()
  
  if (personError) {
    throw new Error('Person lookup error: ' + personError.message + ' (id: ' + personId + ')')
  }
  if (!person) {
    throw new Error('Person not found: ' + personId)
  }
  
  const role = Array.isArray(person.role) ? person.role[0] : person.role
  const roleSlugs = role?.slug ? [role.slug] : []
  
  const principal: Principal = {
    id: personId,
    type: 'human',
    accountId: person.account_id || null,
    roles: roleSlugs,
    displayName: person.display_name || person.email,
    email: person.email,
    provenance: {
      sourceType: 'jwt',
      createdBy: personId,
      invokedAt: new Date().toISOString(),
      ipAddress: getClientIp(event),
      userAgent: event.headers?.['user-agent'] || event.headers?.['User-Agent']
    },
    authContext: { jwt: token }
  }

  // Never cache an unplaced principal. Between signUp (people row created)
  // and complete_registration_placement (account_id + role_id stamped
  // atomically), requests would otherwise pin accountId:null for the full
  // TTL — the documented ~60s "Account context required" stall. Both-null
  // is the exact signature of "placement hasn't run yet" — a contact with
  // an account but no role is a valid steady state and still caches.
  if (!person.account_id && !person.role_id) {
    return principal
  }

  if (humanPrincipalCache.size >= PRINCIPAL_CACHE_MAX) {
    for (const [key, entry] of humanPrincipalCache) {
      if (entry.expiresAt <= Date.now()) humanPrincipalCache.delete(key)
    }
    if (humanPrincipalCache.size >= PRINCIPAL_CACHE_MAX) humanPrincipalCache.clear()
  }
  humanPrincipalCache.set(cacheKey, { principal, expiresAt: Date.now() + PRINCIPAL_CACHE_TTL_MS })

  return principal
}

// Invite stubs are claimed exclusively by the token-gated path in handle_new_auth_user (migration 052); binding one here by email would bypass token/expiry/revocation checks
// Registration/invitation hardening: previously this bound auth_uid to ANY person row matching the JWT email with auth_uid NULL — including unclaimed invite stubs — bypassing the invite token entirely.
export async function resolveInternalPersonId(authUserId: string, email?: string, emailConfirmed = true): Promise<string> {
  // auth_uid binding is authoritative — resolve it before any email fallback.
  const { data: byAuthId } = await adminDb
    .from('people')
    .select('id')
    .eq('auth_uid', authUserId)
    .maybeSingle()

  if (byAuthId) return byAuthId.id

  // Email binding requires the auth user's email to be confirmed — otherwise
  // anyone can claim an existing unlinked person row by signing up with its
  // address (pre-account takeover).
  if (email && emailConfirmed) {
    const { data: byEmail } = await adminDb
      .from('people')
      .select('id, auth_uid, status, data')
      .eq('email', email)
      .maybeSingle()

    if (byEmail) {
      if (!byEmail.auth_uid) {
        // Never claim an invite stub by email alone — only bind rows that
        // are not invited/pending and carry no stored invite token.
        const isInviteStub =
          byEmail.status === 'invited' ||
          byEmail.status === 'pending' ||
          !!(byEmail.data && (byEmail.data as any).invite_token)
        if (isInviteStub) return authUserId
        await adminDb
          .from('people')
          .update({ auth_uid: authUserId })
          .eq('id', byEmail.id)
      }
      return byEmail.id
    }
  }

  return authUserId
}

// x-nf-client-connection-ip first because x-forwarded-for is client-spoofable and feeds rate limiting/provenance
function getClientIp(event: any): string | undefined {
  // x-nf-client-connection-ip is set by Netlify's edge and cannot be spoofed by
  // the client; x-forwarded-for's first hop is client-controllable, so it is a
  // fallback only. Used for provenance AND IP rate limiting — spoofability
  // would let a caller mint fresh buckets by rotating the header.
  return event.headers?.['x-nf-client-connection-ip'] ||
         event.headers?.['X-Nf-Client-Connection-Ip'] ||
         (event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || '').split(',')[0].trim() ||
         event.headers?.['x-real-ip'] ||
         event.headers?.['X-Real-Ip'] ||
         event.requestContext?.identity?.sourceIp ||
         undefined
}

export function machineHasScope(principal: Principal, scope: string): boolean {
  if (principal.type !== 'machine') return false
  
  const scopes = principal.scopes || []
  const [resource, action] = scope.split(':')
  
  if (scopes.includes(scope)) return true
  
  if (scopes.includes(`${resource}:*`)) return true
  
  if (scopes.includes('*:*')) return true
  
  return false
}

export function humanHasRole(principal: Principal, roleSlug: string): boolean {
  if (principal.type !== 'human') return false
  return principal.roles?.includes(roleSlug) || false
}

export function isSystemAdmin(principal: Principal): boolean {
  return principal?.roles?.some(r => r === 'system_admin' || r?.slug === 'system_admin') || false
}

// Account-bound machines (API keys) are NOT system principals — handlers must scope their queries even though getPrincipalDb gives them adminDb
export function isSystemPrincipal(ctx: { principal?: Principal | null; accountId?: string | null }): boolean {
  return isSystemAdmin(ctx?.principal as Principal) || (ctx?.principal?.isInternal === true && !ctx?.accountId)
}

const accessibleAccountsCacheKey = '__accessibleAccountIds'

export async function resolveAccessibleAccountIds(ctx: any): Promise<string[] | null> {
  if (isSystemPrincipal(ctx)) return null
  if (ctx?.[accessibleAccountsCacheKey]) return ctx[accessibleAccountsCacheKey]
  const ids = new Set<string>()
  if (ctx?.accountId) ids.add(ctx.accountId)
  if (ctx?.principal?.type === 'human' && ctx.principal.id) {
    const res = await adminDb.rpc('get_accessible_accounts', { actor_id: ctx.principal.id })
    for (const row of res?.data || []) {
      const id = (row as any)?.account_id ?? row
      if (id) ids.add(id)
    }
  }
  const result = [...ids]
  ctx[accessibleAccountsCacheKey] = result
  return result
}

export function getPrincipalDb(principal: Principal) {
  if (principal.type === 'human' && principal.authContext?.jwt) {
    return getUserDb(principal.authContext.jwt)
  }
  
  return adminDb
}

// Deliberately omits authContext — it holds the raw credential (JWT) and must
// never reach audit rows, log output, or any serialized payload.
export function formatPrincipalForAudit(principal: Principal): object {
  return {
    id: principal.id,
    type: principal.type,
    account_id: principal.accountId,
    ...(principal.type === 'human' && {
      roles: principal.roles,
      display_name: principal.displayName
    }),
    ...(principal.type === 'machine' && {
      machine_type: principal.machineType,
      is_internal: principal.isInternal,
      scopes: principal.scopes
    }),
    provenance: principal.provenance
  }
}