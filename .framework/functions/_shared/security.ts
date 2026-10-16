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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Shared security enforcement: denylist lookups, geo stamping, injection detection, app security config"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide fail-open helpers for blocklist enforcement (request + registration), people.data geo stamping via RPC, prompt-injection pattern detection, and cached apps.config reads"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="security" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/_shared/rate-limit.ts,.framework/functions/_shared/geo.ts,.framework/migrations/049_security_blocklist.sql,.framework/functions/security.ts"]
// CIL[DOC-CONTRACT inputs="RequestContext / person id / email / ip / appId" outputs="boolean blocked, matched pattern, void RPC stamps, app config" errors="never throws on infra failure — fail-open" side_effects="security_blocklist reads, people.data writes, logs writes via emitAudit"]
// CIL[DOC-MICRO logic_summary="Blocklist queries filter type+value with revoked/expired exclusion in JS; geo stamping uses SECURITY DEFINER RPCs to merge people.data keys; app config cached 60s per warm instance" notable_decisions="Fail-open everywhere: a missing 049 table must never deny legitimate traffic; IP block entries are also enforced at the Netlify edge but the app-layer check covers direct function hits"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import { adminDb } from './db'
import { getClientGeo } from './geo'
import { checkRateLimit } from './rate-limit'
import type { RateLimitPolicy } from './rate-limit'
import { emitAudit } from './audit'
import type { RequestContext } from './middleware'
import type { Principal } from './principal'
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:injection_patterns:constant" type="constant" identity="INJECTION_PATTERNS" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Prompt-injection detection patterns"]
// CIL[DOC-RESPONSIBILITY responsibility="Named regex set matching known instruction-override phrasings"]
// CIL[DOC-CONTRACT inputs="none" outputs="[name, RegExp][]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Each entry pairs a stable label (stored on the flagged record) with a case-insensitive pattern" notable_decisions="First-pass heuristic — deliberately narrow to keep false positives low; catches verbatim 'ignore previous instructions' style attacks, not obfuscated variants"]
// CIL[DOC-STABILITY stability="stable"]
export const INJECTION_PATTERNS: Array<[string, RegExp]> = [
  ['ignore_instructions', /ignore\s+(all\s+)?(the\s+)?(previous|prior|above|earlier)\s+(instruction|prompt|rule|context)s?/i],
  ['role_reassignment',   /you\s+are\s+now\s+(a\s+|an\s+)?(system\s+)?(administrator|admin|root|developer|system\s+prompt)/i],
  ['exfil_everything',    /(output|print|return|dump|reveal|leak)\s+(the\s+)?(contents|full\s+text|entire|all)\s+(of\s+)?(every|all|the\s+system)/i],
  ['disregard_prompt',    /disregard\s+(your\s+)?(previous|prior|system|all)\s+(prompt|instruction|rule|guideline)s?/i],
  ['dan_jailbreak',       /\bDAN\s+(mode|jailbreak)\b|\bdo\s+anything\s+now\b/i],
  ['fake_system_prefix',  /^\s*system\s*:\s*/im],
  ['prompt_echo',         /repeat\s+(back\s+)?(your\s+)?(system\s+)?(prompt|instructions)\s+(verbatim|word\s+for\s+word|exactly)/i],
]
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:injection_patterns:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:detectinjection:function" type="function" identity="detectInjection" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Detect prompt-injection phrasing in user text"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the matched pattern name or null"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="string | null (pattern name)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Linear scan over INJECTION_PATTERNS; returns first match label" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export function detectInjection(text: string | null | undefined): string | null {
  if (!text || typeof text !== 'string') return null
  for (const [name, re] of INJECTION_PATTERNS) {
    if (re.test(text)) return name
  }
  return null
}
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:detectinjection:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:isactiverule:function" type="function" identity="isActiveRule" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Filter revoked/expired blocklist rows in JS"]
// CIL[DOC-RESPONSIBILITY responsibility="Evaluate revoked_at and expires_at client-side"]
// CIL[DOC-CONTRACT inputs="row: {revoked_at, expires_at}" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Active = not revoked and (no expiry or expiry in future)" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
function isActiveRule(row: { revoked_at?: string | null; expires_at?: string | null }): boolean {
  if (row.revoked_at) return false
  if (row.expires_at && Date.parse(row.expires_at) <= Date.now()) return false
  return true
}
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:isactiverule:function"]

// Blocklist decision cache — every authenticated request hits lookupBlocklist,
// which is a DB round-trip even when the table is empty. Cache the decision per
// candidate set for a bounded window: a newly-added hard block takes effect
// within BLOCKLIST_CACHE_TTL_MS, and a revoked block releases within the same
// window. Promise memoization means concurrent requests share one query.
const BLOCKLIST_CACHE_TTL_MS = 15_000
const BLOCKLIST_CACHE_MAX = 1000
const blocklistCache = new Map<string, { value: Promise<any>; expiresAt: number }>()

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:lookupblocklist:function" type="function" identity="lookupBlocklist" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Query security_blocklist for a set of (type,value) candidates"]
// CIL[DOC-RESPONSIBILITY responsibility="Single .or() query across candidate identities; returns the matching active row or null"]
// CIL[DOC-CONTRACT inputs="checks: {type,value}[], severity filter implicit ('hard')" outputs="blocklist row | null" errors="returns null on any query failure — fail-open" side_effects="DB read"]
// CIL[DOC-MICRO logic_summary="Builds a PostgREST or() of and(type.eq.,value.eq.) clauses; filters revoked/expired in JS" notable_decisions="severity 'hard' only — 'soft' entries are advisory signals for the report, not request blocks"]
// CIL[DOC-STABILITY stability="stable"]
async function lookupBlocklist(
  checks: Array<{ type: string; value: string }>,
): Promise<{ type: string; value: string; reason: string | null } | null> {
  if (!checks.length) return null
  try {
    const or = checks
      .map(c => `and(type.eq.${c.type},value.eq.${c.value})`)
      .join(',')
    const { data, error } = await adminDb
      .from('security_blocklist')
      .select('type, value, reason, severity, revoked_at, expires_at')
      .eq('severity', 'hard')
      .or(or)
      .limit(5)
    if (error) {
      console.warn('blocklist lookup failed (fail-open):', error.message)
      return null
    }
    return (data || []).find(isActiveRule) ?? null
  } catch (err: any) {
    console.warn('blocklist lookup error (fail-open):', err?.message)
    return null
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:lookupblocklist:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:isblockedrequest:function" type="function" identity="isBlockedRequest" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Check whether the current request identity is hard-blocked"]
// CIL[DOC-RESPONSIBILITY responsibility="Match person_id / account_id / email / client IP against security_blocklist"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext (headers required for IP)" outputs="blocking row | null" errors="never throws" side_effects="DB read"]
// CIL[DOC-MICRO logic_summary="Skips machine principals and anonymous callers; candidates assembled then one lookupBlocklist call" notable_decisions="Machine principals (cron/api-key/system) are never blocklist-denied — they are infrastructure, not users"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:isblockedrequest:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:isblockedip:function" type="function" identity="isBlockedIp" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Check whether a raw client IP is hard-blocked"]
// CIL[DOC-RESPONSIBILITY responsibility="IP-only variant for public/unauthenticated paths"]
// CIL[DOC-CONTRACT inputs="ip: string | undefined" outputs="blocking row | null" errors="never throws" side_effects="DB read"]
// CIL[DOC-MICRO logic_summary="Wraps lookupBlocklist with a single ip candidate" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export async function isBlockedIp(ip: string | undefined): Promise<{ type: string; value: string; reason: string | null } | null> {
  if (!ip) return null
  return lookupBlocklist([{ type: 'ip', value: ip }])
}
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:isblockedip:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:checkregistrationblocklist:function" type="function" identity="checkRegistrationBlocklist" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Deny registration for blocklisted email, domain, or IP"]
// CIL[DOC-RESPONSIBILITY responsibility="Throw a 403 when the signup email, its domain, or the client IP is on the denylist; emit a security audit event on hit"]
// CIL[DOC-CONTRACT inputs="ctx, email, ip" outputs="void" errors="Error (403) when blocked" side_effects="DB read; audit log on hit"]
// CIL[DOC-MICRO logic_summary="Candidates: email (lowercased), email_domain, ip — one lookup; emits security.registration_blocked audit on match" notable_decisions="Error messages deliberately generic — do not tell an attacker which signal matched"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:checkregistrationblocklist:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:geo_touch_throttle:comment" type="comment" identity="geoTouchThrottle" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Per-person throttle state for geo last-seen writes"]
// CIL[DOC-RESPONSIBILITY responsibility="Bound person_touch_geo RPC writes to at most once per GEO_TOUCH_TTL_MS per person per warm instance"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/security.ts" layer="shared-core" related_files=".framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module-level Map<personId, epochMs>" errors="none" side_effects="in-memory throttle state; resets on cold start, which is acceptable"]
// CIL[DOC-MICRO logic_summary="Chatty clients (polling UIs) would otherwise trigger one RPC write per request; last_seen_at does not need sub-minute granularity" notable_decisions="per warm instance so no extra reads are needed; entries are small so growth is bounded by unique persons per instance"]
// CIL[DOC-AUDIENCE audience="framework"]
// CIL[DOC-STABILITY stability="stable"]
const GEO_TOUCH_TTL_MS = 5 * 60 * 1000
const geoTouchCache = new Map<string, number>()
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:geo_touch_throttle:comment"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:touchpersongeo:function" type="function" identity="touchPersonGeo" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Stamp last-seen IP/country onto a person row"]
// CIL[DOC-RESPONSIBILITY responsibility="Fire-and-forget RPC merge of last_ip/last_country/last_seen_at into people.data, throttled per person per warm instance"]
// CIL[DOC-CONTRACT inputs="personId, ctx (headers for geo)" outputs="void" errors="never throws — swallowed with warn" side_effects="people.data update at most once per GEO_TOUCH_TTL_MS per person per instance"]
// CIL[DOC-MICRO logic_summary="Calls person_touch_geo RPC only when geo headers resolved; no-op in local dev without Netlify geo headers; in-memory Map throttles repeat touches inside GEO_TOUCH_TTL_MS" notable_decisions="Missing RPC (pre-049 install) is swallowed — callers must not await for correctness; throttle is per warm instance so it needs no extra reads"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:touchpersongeo:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:recordregistrationgeo:function" type="function" identity="recordRegistrationGeo" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Stamp first-seen registration IP/country onto a person row"]
// CIL[DOC-RESPONSIBILITY responsibility="RPC merge of registration_ip/registration_country that never overwrites existing values"]
// CIL[DOC-CONTRACT inputs="personId, ctx" outputs="void" errors="never throws" side_effects="people.data update"]
// CIL[DOC-MICRO logic_summary="Calls person_record_registration_geo (COALESCE keeps first values)" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:recordregistrationgeo:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:appconfigcache:comment" type="comment" identity="appConfigCache" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="60s per-instance cache of apps.config to keep hot paths cheap"]
// CIL[DOC-RESPONSIBILITY responsibility="Avoid an apps-table read on every admin-data create when no rate limits are configured"]
// CIL[DOC-MICRO logic_summary="Map<slug,{config,at}> with TTL; stale entries refreshed lazily" notable_decisions="Cache lives only as long as the warm lambda; config changes propagate within 60s"]
// CIL[DOC-CONTRACT inputs="appId (getAppConfig)" outputs="apps.config JSON or null" errors="returns null on lookup failure" side_effects="one apps-table read per slug per TTL window"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:appconfigcache:comment"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:getappsecurityconfig:function" type="function" identity="getAppSecurityConfig" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Resolve an app's security config block"]
// CIL[DOC-CONTRACT inputs="appId" outputs="config.security object | null" errors="never throws" side_effects="cached apps read"]
// CIL[DOC-MICRO logic_summary="Returns apps.config.security — prompt_injection mode ('flag'|'block'|'off'), etc." notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export async function getAppSecurityConfig(appId: string | null | undefined): Promise<{
  prompt_injection?: 'flag' | 'block' | 'off'
  [key: string]: any
} | null> {
  const config = await getAppConfig(appId)
  return config?.security ?? null
}
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:getappsecurityconfig:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:checktypeslugestatelimit:function" type="function" identity="checkTypeSlugRateLimit" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Rate-limit an admin-data create by type slug when the calling app declares a policy"]
// CIL[DOC-RESPONSIBILITY responsibility="Zero-cost pass-through unless config.rate_limits has a '<type_slug>_create' policy for the calling app"]
// CIL[DOC-CONTRACT inputs="ctx, typeSlug" outputs="void" errors="RateLimitError (429) when over a configured policy" side_effects="rate_limits upsert when policy exists"]
// CIL[DOC-MICRO logic_summary="Cached app config → policies lookup; only invokes checkRateLimit when a policy is actually declared so unconfigured creates pay no extra DB reads" notable_decisions="Convention over config: '<type_slug>_create' action names keep admin-data generic — apps opt in via manifest config.rate_limits"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:checktypeslugestatelimit:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/security.ts:emitsecurityevent:function" type="function" identity="emitSecurityEvent" parent="~/.framework/functions/_shared/security.ts"]
// CIL[DOC-MACRO purpose="Emit a security.* audit event"]
// CIL[DOC-RESPONSIBILITY responsibility="Write a logs row via emitAudit with adminDb so the security report can aggregate signals"]
// CIL[DOC-CONTRACT inputs="ctx, action ('security.x'), target, metadata" outputs="void" errors="never throws" side_effects="logs insert"]
// CIL[DOC-MICRO logic_summary="Thin wrapper forcing ctx.db=adminDb — security events must be written even when the caller's RLS db lacks logs insert" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/security.ts:emitsecurityevent:function"]
