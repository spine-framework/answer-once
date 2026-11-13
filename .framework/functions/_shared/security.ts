/**
 * @module   functions/_shared
 * @audience internal
 * @layer    security
 * @stability stable
 *
 * Shared security enforcement: denylist lookups (security_blocklist),
 * client geo stamping, prompt-injection detection, and app security
 * config resolution. INVARIANT: every check fails OPEN when the backing
 * table/RPC is absent so installs without migration 049 keep working.
 *
 * @seeAlso .framework/functions/_shared/middleware.ts (enforcement point)
 * @seeAlso .framework/functions/_shared/rate-limit.ts (violation signal)
 * @seeAlso .framework/migrations/049_security_blocklist.sql (schema)
 * @seeAlso .framework/functions/security.ts (admin actions)
 *
 * @cil-generated
 */
// Fail-open everywhere: a missing 049 table must never deny legitimate traffic; IP block entries are also enforced at the Netlify edge but the app-layer check covers direct function hits

import { adminDb } from './db'
import { getClientGeo } from './geo'
import { checkRateLimit } from './rate-limit'
import type { RateLimitPolicy } from './rate-limit'
import { emitAudit } from './audit'
import type { RequestContext } from './middleware'
import type { Principal } from './principal'

// First-pass heuristic — deliberately narrow to keep false positives low; catches verbatim 'ignore previous instructions' style attacks, not obfuscated variants
export const INJECTION_PATTERNS: Array<[string, RegExp]> = [
  ['ignore_instructions', /ignore\s+(all\s+)?(the\s+)?(previous|prior|above|earlier)\s+(instruction|prompt|rule|context)s?/i],
  ['role_reassignment',   /you\s+are\s+now\s+(a\s+|an\s+)?(system\s+)?(administrator|admin|root|developer|system\s+prompt)/i],
  ['exfil_everything',    /(output|print|return|dump|reveal|leak)\s+(the\s+)?(contents|full\s+text|entire|all)\s+(of\s+)?(every|all|the\s+system)/i],
  ['disregard_prompt',    /disregard\s+(your\s+)?(previous|prior|system|all)\s+(prompt|instruction|rule|guideline)s?/i],
  ['dan_jailbreak',       /\bDAN\s+(mode|jailbreak)\b|\bdo\s+anything\s+now\b/i],
  ['fake_system_prefix',  /^\s*system\s*:\s*/im],
  ['prompt_echo',         /repeat\s+(back\s+)?(your\s+)?(system\s+)?(prompt|instructions)\s+(verbatim|word\s+for\s+word|exactly)/i],
]

export function detectInjection(text: string | null | undefined): string | null {
  if (!text || typeof text !== 'string') return null
  for (const [name, re] of INJECTION_PATTERNS) {
    if (re.test(text)) return name
  }
  return null
}

function isActiveRule(row: { revoked_at?: string | null; expires_at?: string | null }): boolean {
  if (row.revoked_at) return false
  if (row.expires_at && Date.parse(row.expires_at) <= Date.now()) return false
  return true
}

// Blocklist decision cache — every authenticated request hits lookupBlocklist,
// which is a DB round-trip even when the table is empty. Cache the decision per
// candidate set for a bounded window: a newly-added hard block takes effect
// within BLOCKLIST_CACHE_TTL_MS, and a revoked block releases within the same
// window. Promise memoization means concurrent requests share one query.
const BLOCKLIST_CACHE_TTL_MS = 15_000
const BLOCKLIST_CACHE_MAX = 1000
const blocklistCache = new Map<string, { value: Promise<any>; expiresAt: number }>()

async function lookupBlocklist(
  checks: Array<{ type: string; value: string }>,
): Promise<{ type: string; value: string; reason: string | null } | null> {
  if (!checks.length) return null
  try {
    // Per-check .eq queries — interpolating caller values into a .or()
    // filter string let a crafted IP/email break the query and fail open.
    for (const c of checks) {
      const { data, error } = await adminDb
        .from('security_blocklist')
        .select('type, value, reason, severity, revoked_at, expires_at')
        .eq('severity', 'hard')
        .eq('type', c.type)
        .eq('value', c.value)
        .limit(5)
      if (error) {
        console.warn('blocklist lookup failed (fail-open):', error.message)
        return null
      }
      const hit = (data || []).find(isActiveRule)
      if (hit) return hit
    }
    return null
  } catch (err: any) {
    console.warn('blocklist lookup error (fail-open):', err?.message)
    return null
  }
}

// Machine principals (cron/api-key/system) are never blocklist-denied — they are infrastructure, not users
export async function isBlockedRequest(ctx: RequestContext): Promise<{ type: string; value: string; reason: string | null } | null> {
  const p: Principal | null = ctx.principal as any
  const { ip } = getClientGeo(ctx)

  const checks: Array<{ type: string; value: string }> = []
  if (p && p.type === 'human' && p.id && p.id !== 'anonymous') {
    checks.push({ type: 'person_id', value: p.id })
    if (p.accountId) checks.push({ type: 'account_id', value: p.accountId })
    if (p.email) checks.push({ type: 'email', value: p.email.toLowerCase() })
  }
  if (ip) checks.push({ type: 'ip', value: ip })
  if (!checks.length) return null

  const key = checks.map(c => `${c.type}=${c.value}`).sort().join('|')
  const hit = blocklistCache.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.value
  blocklistCache.delete(key)
  const pending = lookupBlocklist(checks)
  if (blocklistCache.size >= BLOCKLIST_CACHE_MAX) {
    const oldest = blocklistCache.keys().next().value
    if (oldest !== undefined) blocklistCache.delete(oldest)
  }
  blocklistCache.set(key, { value: pending, expiresAt: Date.now() + BLOCKLIST_CACHE_TTL_MS })
  pending.catch(() => blocklistCache.delete(key))
  return pending
}

export async function isBlockedIp(ip: string | undefined): Promise<{ type: string; value: string; reason: string | null } | null> {
  if (!ip) return null
  return lookupBlocklist([{ type: 'ip', value: ip }])
}

// Error messages deliberately generic — do not tell an attacker which signal matched
export async function checkRegistrationBlocklist(
  ctx: RequestContext,
  email: string,
  ip?: string,
): Promise<void> {
  const normalized = (email || '').toLowerCase()
  const domain = normalized.split('@')[1]
  const checks: Array<{ type: string; value: string }> = [
    { type: 'email', value: normalized },
  ]
  if (domain) checks.push({ type: 'email_domain', value: domain })
  if (ip) checks.push({ type: 'ip', value: ip })

  const hit = await lookupBlocklist(checks)
  if (!hit) return

  void emitAudit(ctx, 'security.registration_blocked', { type: 'registration' }, {
    result: 'denied',
    blocked_type: hit.type,
    reason: hit.reason,
  })
  const err: any = new Error('This registration is not eligible. Contact support if you believe this is an error.')
  err.statusCode = 403
  throw err
}

const GEO_TOUCH_TTL_MS = 5 * 60 * 1000
const geoTouchCache = new Map<string, number>()

// Missing RPC (pre-049 install) is swallowed — callers must not await for correctness; throttle is per warm instance so it needs no extra reads
export async function touchPersonGeo(personId: string, ctx: RequestContext): Promise<void> {
  try {
    if (!personId || personId === 'anonymous') return
    const { ip, country } = getClientGeo(ctx)
    if (!ip && !country) return
    // Chatty clients (polling UIs) otherwise trigger one RPC write per
    // request. last_seen_at doesn't need sub-minute granularity — skip the
    // write if this warm instance stamped the person recently.
    const last = geoTouchCache.get(personId) || 0
    if (Date.now() - last < GEO_TOUCH_TTL_MS) return
    geoTouchCache.set(personId, Date.now())
    await adminDb.rpc('person_touch_geo', {
      p_person_id: personId,
      p_ip: ip ?? null,
      p_country: country ?? null,
    })
  } catch (err: any) {
    console.warn('touchPersonGeo failed (non-fatal):', err?.message)
  }
}

export async function recordRegistrationGeo(personId: string, ctx: RequestContext): Promise<void> {
  try {
    if (!personId || personId === 'anonymous') return
    const { ip, country } = getClientGeo(ctx)
    if (!ip && !country) return
    await adminDb.rpc('person_record_registration_geo', {
      p_person_id: personId,
      p_ip: ip ?? null,
      p_country: country ?? null,
    })
  } catch (err: any) {
    console.warn('recordRegistrationGeo failed (non-fatal):', err?.message)
  }
}

const APP_CONFIG_TTL_MS = 60_000
const appConfigCache = new Map<string, { config: any; at: number }>()

async function getAppConfig(appId: string | null | undefined): Promise<any | null> {
  if (!appId) return null
  const hit = appConfigCache.get(appId)
  if (hit && Date.now() - hit.at < APP_CONFIG_TTL_MS) return hit.config
  try {
    const { data } = await adminDb
      .from('apps')
      .select('config')
      .eq('slug', appId)
      .maybeSingle()
    const config = data?.config ?? null
    appConfigCache.set(appId, { config, at: Date.now() })
    return config
  } catch {
    return null
  }
}

export async function getAppSecurityConfig(appId: string | null | undefined): Promise<{
  prompt_injection?: 'flag' | 'block' | 'off'
  [key: string]: any
} | null> {
  const config = await getAppConfig(appId)
  return config?.security ?? null
}

export async function checkTypeSlugRateLimit(ctx: RequestContext, typeSlug: string | null | undefined): Promise<void> {
  if (!typeSlug) return
  const action = `${typeSlug}_create`
  const config = await getAppConfig(ctx.appId)
  const raw = config?.rate_limits?.[action]
  const policies: RateLimitPolicy[] = (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .filter((p: any) => typeof p?.limit === 'number' && typeof p?.window_seconds === 'number')
  if (!policies.length) return
  await checkRateLimit(ctx, action, { policies })
}

export async function emitSecurityEvent(
  ctx: RequestContext,
  action: string,
  target?: { type: string; id?: string; account_id?: string },
  metadata?: Record<string, any>,
): Promise<void> {
  try {
    await emitAudit({ ...ctx, db: adminDb } as any, action, target || { type: 'security' }, {
      result: 'denied',
      ...metadata,
    })
  } catch (err: any) {
    console.warn('emitSecurityEvent failed:', err?.message)
  }
}
