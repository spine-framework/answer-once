// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Shared principal and authorization module for Spine functions"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the Principal model, resolves request principals from headers and tokens, and provides role/scope predicates"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="HTTP event headers and tokens" outputs="Principal objects and authorization booleans" errors="Invalid or inactive credentials, rate limit exceeded, lookup errors" side_effects="Writes API key usage logs; updates people.auth_uid when linking by email"]
// CIL[DOC-MICRO logic_summary="Imports shared db/supabase clients and crypto; declares the Principal interface and anonymous/system constants; exports resolvers and helper functions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework developers, ai agents, security reviewers"]


















import { getUserDb, adminDb } from './db'
import { createClient } from '@supabase/supabase-js'

import { timingSafeEqual, createHash } from 'crypto'
// CIL[DOC-VECTOR type="context" content="purpose='Shared principal and authorization module for Spine functions'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:isInternalInvokeAuthorized:function" type="function" identity="isInternalInvokeAuthorized" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Verify that a request carries the trusted internal invocation secret"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate shared secret header using timing-safe comparison"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="event object with headers" outputs="boolean" errors="none (returns false on any failure)" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compare x-internal-secret against INTERNAL_INVOKE_SECRET using timingSafeEqual" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Verify that a request carries the trusted internal invocation secret'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:isInternalInvokeAuthorized:function"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:env:constant" type="constant" identity="env" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Access process environment variables"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a safe fallback for environment lookups"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record of environment variables" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return global process.env or an empty object" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const env = (globalThis as any).process?.env || {}
// CIL[DOC-VECTOR type="context" content="purpose='Access process environment variables'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:env:constant"]




// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:supabase:constant" type="constant" identity="supabase" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Create a Supabase client configured for function use"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide an anon-key Supabase client for auth.getUser JWT verification"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Supabase client" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Instantiate createClient with URL, anon key, and auth options. Realtime transport omitted — this client is used only for supabase.auth.getUser; no realtime channels are opened server-side." notable_decisions="ws realtime transport removed to reduce bundle size and eliminate unnecessary module-level init overhead across every function"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const supabase = createClient(
  env.SUPABASE_URL || 'https://placeholder.supabase.co',
  env.SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Create a Supabase client configured for function use'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:supabase:constant"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:Principal:interface" type="interface" identity="Principal" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Define the canonical identity shape used across Spine"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe a principal's id, type, account, roles, scopes, machine metadata and provenance"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declare human or machine identity with provenance and optional auth context" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Define the canonical identity shape used across Spine'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:Principal:interface"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:ANONYMOUS_PRINCIPAL:constant" type="constant" identity="ANONYMOUS_PRINCIPAL" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Provide a default principal for unauthenticated requests"]
// CIL[DOC-RESPONSIBILITY responsibility="Represent an anonymous machine principal with no scopes"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Principal" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return an anonymous machine principal with manual provenance" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Provide a default principal for unauthenticated requests'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:ANONYMOUS_PRINCIPAL:constant"]






// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:SYSTEM_PRINCIPAL:constant" type="constant" identity="SYSTEM_PRINCIPAL" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Provide a privileged internal principal for system operations"]
// CIL[DOC-RESPONSIBILITY responsibility="Represent the system machine principal with full scope"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Principal" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return a machine principal with wildcard scope and internal flag" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Provide a privileged internal principal for system operations'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:SYSTEM_PRINCIPAL:constant"]





// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:resolvePrincipal:function" type="function" identity="resolvePrincipal" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Resolve a Principal from incoming request headers"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch to machine, cron, trigger or human resolution based on headers"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="event object with headers" outputs="Principal" errors="Invalid or inactive credentials" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Check x-api-key, internal cron/trigger headers, or Bearer token, falling back to ANONYMOUS_PRINCIPAL" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a Principal from incoming request headers'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:resolvePrincipal:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:resolveMachinePrincipal:function" type="function" identity="resolveMachinePrincipal" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Resolve a machine principal from an API key"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate key prefix and hash, enforce rate limits, and return the principal"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="apiKey: string, event: any" outputs="Principal" errors="Invalid or inactive machine principal, rate limit exceeded" side_effects="Inserts api_key_usage_logs row"]
// CIL[DOC-MICRO logic_summary="Query api_keys by prefix, verify hash, count recent usage, log request, and build the principal" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a machine principal from an API key'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:resolveMachinePrincipal:function"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:resolveCronPrincipal:function" type="function" identity="resolveCronPrincipal" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Resolve a machine principal for a cron schedule"]
// CIL[DOC-RESPONSIBILITY responsibility="Lookup a schedule, validate its creator, and return its associated machine principal"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="scheduleId string" outputs="Principal" errors="Invalid or inactive schedule, validation failed" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fetch schedule with machine join, call validate_schedule_creator RPC, and build principal with cron provenance" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a machine principal for a cron schedule'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:resolveCronPrincipal:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:resolveTriggerPrincipal:function" type="function" identity="resolveTriggerPrincipal" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Resolve a machine principal for a trigger invocation"]
// CIL[DOC-RESPONSIBILITY responsibility="Load trigger, find its action's default machine, and return the principal"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="triggerId: string, event: any" outputs="Principal" errors="Invalid trigger, no machine configured" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fetch trigger with action join, resolve default machine from api_keys, and build trigger provenance" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a machine principal for a trigger invocation'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:resolveTriggerPrincipal:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:resolveHumanPrincipal:function" type="function" identity="resolveHumanPrincipal" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Resolve a human principal from a JWT bearer token"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate Supabase user, map to internal person, and build the principal"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="token: string, event: any" outputs="Principal" errors="Person lookup error, person not found" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Get Supabase user, resolve internal person id, load person with role, and construct human principal; result cached ~60s keyed by token hash, provenance refreshed on hit; principals lacking both account_id and role_id are never cached" notable_decisions="cache avoids three sequential auth/people lookups on every polled request; provenance timestamps are refreshed per request so audit stays honest; unplaced (mid-registration, both fields null) principals skip the cache so placement lands on the next request instead of stalling 60s"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a human principal from a JWT bearer token'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:resolveHumanPrincipal:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:resolveInternalPersonId:function" type="function" identity="resolveInternalPersonId" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Map a Supabase auth user to an internal person id"]
// CIL[DOC-RESPONSIBILITY responsibility="Link auth user to person by email or auth_uid, falling back to the auth id"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="authUserId: string, email?: string" outputs="person id string" errors="none" side_effects="Updates people.auth_uid when linking by email"]
// CIL[DOC-MICRO logic_summary="auth_uid lookup first (authoritative); email fallback only binds rows that are NOT invite stubs — invited/pending status or a stored invite_token is never claimed by email alone" notable_decisions="Invite stubs are claimed exclusively by the token-gated path in handle_new_auth_user (migration 052); binding one here by email would bypass token/expiry/revocation checks"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="security" content="Registration/invitation hardening: previously this bound auth_uid to ANY person row matching the JWT email with auth_uid NULL — including unclaimed invite stubs — bypassing the invite token entirely."]
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
// CIL[DOC-VECTOR type="context" content="purpose='Map a Supabase auth user to an internal person id'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:resolveInternalPersonId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:getClientIp:function" type="function" identity="getClientIp" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Extract the client IP from request headers or context"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the most likely originating IP for a request"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="event with headers and requestContext" outputs="ip string or undefined" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Prefer Netlify's x-nf-client-connection-ip (set by the edge, not client-controllable), then x-forwarded-for's first hop, x-real-ip, and requestContext.identity.sourceIp" notable_decisions="x-nf-client-connection-ip first because x-forwarded-for is client-spoofable and feeds rate limiting/provenance"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Extract the client IP from request headers or context'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:getClientIp:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:machineHasScope:function" type="function" identity="machineHasScope" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Check whether a machine principal holds a given scope"]
// CIL[DOC-RESPONSIBILITY responsibility="Evaluate scope including resource wildcard and global wildcard matches"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="principal: Principal, scope: string" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return true if scope, resource wildcard, or global wildcard is present" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function machineHasScope(principal: Principal, scope: string): boolean {
  if (principal.type !== 'machine') return false
  
  const scopes = principal.scopes || []
  const [resource, action] = scope.split(':')
  
  if (scopes.includes(scope)) return true
  
  if (scopes.includes(`${resource}:*`)) return true
  
  if (scopes.includes('*:*')) return true
  
  return false
}
// CIL[DOC-VECTOR type="context" content="purpose='Check whether a machine principal holds a given scope'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:machineHasScope:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:humanHasRole:function" type="function" identity="humanHasRole" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Check whether a human principal has a role"]
// CIL[DOC-RESPONSIBILITY responsibility="Test principal roles array for a role slug"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="principal: Principal, roleSlug: string" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return true if principal is human and roles includes the slug" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function humanHasRole(principal: Principal, roleSlug: string): boolean {
  if (principal.type !== 'human') return false
  return principal.roles?.includes(roleSlug) || false
}
// CIL[DOC-VECTOR type="context" content="purpose='Check whether a human principal has a role'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:humanHasRole:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:isSystemAdmin:function" type="function" identity="isSystemAdmin" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Determine if a principal is a system administrator"]
// CIL[DOC-RESPONSIBILITY responsibility="Check roles for system_admin by slug or object shape"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="principal" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return true if roles contains system_admin as a string or slug property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function isSystemAdmin(principal: Principal): boolean {
  return principal?.roles?.some(r => r === 'system_admin' || r?.slug === 'system_admin') || false
}
// CIL[DOC-VECTOR type="context" content="purpose='Determine if a principal is a system administrator'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:isSystemAdmin:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:isSystemPrincipal:function" type="function" identity="isSystemPrincipal" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="True for callers trusted to act across accounts"]
// CIL[DOC-RESPONSIBILITY responsibility="Single trust-boundary check for platform-level access decisions"]
// CIL[DOC-CONTRACT inputs="ctx (principal + accountId)" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="system_admin role, or an unbound internal machine (SYSTEM_PRINCIPAL via INTERNAL_INVOKE_SECRET)" notable_decisions="Account-bound machines (API keys) are NOT system principals — handlers must scope their queries even though getPrincipalDb gives them adminDb"]
// CIL[DOC-STABILITY stability="stable"]
export function isSystemPrincipal(ctx: { principal?: Principal | null; accountId?: string | null }): boolean {
  return isSystemAdmin(ctx?.principal as Principal) || (ctx?.principal?.isInternal === true && !ctx?.accountId)
}
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:isSystemPrincipal:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:resolveAccessibleAccountIds:function" type="function" identity="resolveAccessibleAccountIds" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Account ids the caller may touch"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the tenant scope used by account-scoping helpers across adminDb paths"]
// CIL[DOC-CONTRACT inputs="ctx" outputs="string[] of account ids, or null for system principals" errors="none" side_effects="get_accessible_accounts RPC for human principals; memoized on ctx"]
// CIL[DOC-MICRO logic_summary="system → null (unscoped); humans → own account ∪ get_accessible_accounts descendants; account-bound machines → their bound account only" notable_decisions="Memoized on the ctx object (key '__accessibleAccountIds') — one RPC resolution per request"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:resolveAccessibleAccountIds:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:getPrincipalDb:function" type="function" identity="getPrincipalDb" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Select the appropriate database client for a principal"]
// CIL[DOC-RESPONSIBILITY responsibility="Return user-scoped db for humans with JWT, otherwise admin db"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="principal" outputs="Supabase client" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use getUserDb with JWT for humans, otherwise return adminDb" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function getPrincipalDb(principal: Principal) {
  if (principal.type === 'human' && principal.authContext?.jwt) {
    return getUserDb(principal.authContext.jwt)
  }
  
  return adminDb
}
// CIL[DOC-VECTOR type="context" content="purpose='Select the appropriate database client for a principal'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:getPrincipalDb:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/principal.ts:formatPrincipalForAudit:function" type="function" identity="formatPrincipalForAudit" parent="~/.framework/functions/_shared/principal.ts"]
// CIL[DOC-MACRO purpose="Serialize a principal for audit logs"]
// CIL[DOC-RESPONSIBILITY responsibility="Produce a safe, structured view of principal identity and provenance"]
// CIL[DOC-CONTEXT module="functions/_shared/principal" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="principal" outputs="audit object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return id, type, account_id, human/machine fields, and provenance spread" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Serialize a principal for audit logs'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/principal.ts:formatPrincipalForAudit:function"]