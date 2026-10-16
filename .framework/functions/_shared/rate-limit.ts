/**
 * @module   functions/_shared
 * @audience internal
 * @layer    rate-limit
 * @stability stable
 *
 * Configurable DB-backed rate limiting for sensitive actions
 *
 * @seeAlso .framework/functions/_shared/db.ts (provides database access for rate limits).
 * @seeAlso .framework/functions/_shared/audit.ts (emits security.rate_limit_exceeded audit events).
 * @seeAlso .framework/functions/_shared/middleware.ts (contains context types used in this module).
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/rate-limit.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/rate-limit.ts"]
// CIL[DOC-MACRO purpose="Configurable DB-backed rate limiting for sensitive actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve rate-limit policy from accounts.data (override or named profile) falling back to apps.config.rate_limits, and enforce it via the atomic rate_limit_hit RPC"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="rate-limit" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/migrations/035_rate_limits.sql"]
// CIL[DOC-CONTRACT inputs="ctx, action name, optional identifier override" outputs="void or throws RateLimitError (429)" errors="RateLimitError when over policy; fail-closed policies throw on limiter outage" side_effects="Increments rate_limits counters"]
// CIL[DOC-MICRO logic_summary="accounts.data.rate_limits[action] wins; accounts.data.rate_limit_profile selects config.rate_limits.profiles[profile][action] before the app's base policy; each policy is a fixed window counter keyed action:identifier; over-limit throws 429 with retry_after" notable_decisions="Policy is data/config, not code — accounts and apps declare limits and Core enforces; window_seconds 0 means lifetime cap; fail_closed reserved for cost-bearing actions like agent_step"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-VECTOR type="context" content="purpose='Configurable DB-backed rate limiting for sensitive actions'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="Policies read from accounts.data.rate_limits / accounts.data.rate_limit_profile, falling back to apps.config.rate_limits (incl. named profiles) keyed by action name"]
// CIL[DOC-VECTOR type="constraint" content="Requires migration 035 (rate_limits table + rate_limit_hit RPC); fail-closed only for cost-bearing actions"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

import { adminDb } from './db'
import type { CoreContext, RequestContext } from './middleware'
import { emitAudit } from './audit'
// CIL[END stable_id="~/.framework/functions/_shared/rate-limit.ts:module_header:module_header"]

// CIL[DOC-MACRO purpose="RateLimitPolicy defines the parameters for controlling the rate of actions within a specified time window."]
// CIL[DOC-RESPONSIBILITY responsibility="RateLimitPolicy defines the parameters for controlling the rate of actions within a specified time window. It is used to enforce limits on the number of allowed actions to prevent abuse and manage resource usage."]
// CIL[DOC-CONTEXT module="rate-limit" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/middleware,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="RateLimitPolicy defines the parameters for controlling the rate of actions within a specified time window. It is used to enforce limits on the number of allowed actions to prevent abuse and manage resource usage." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * RateLimitPolicy defines the parameters for controlling the rate of actions within a specified time window. It is used to enforce limits on the number of allowed actions to prevent abuse and manage resource usage.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/rate-limit.ts:ratelimitpolicy:type" type="type" identity="RateLimitPolicy" parent="~/.framework/functions/_shared/rate-limit.ts"]
// CIL[DOC-MACRO purpose="RateLimitPolicy type"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the RateLimitPolicy type."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/rate-limit.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the RateLimitPolicy type." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export type RateLimitPolicy = {
  /** Max hits allowed inside the window. */
  limit: number
  /** Window size in seconds. 0 = lifetime cap (no reset). */
  window_seconds: number
  /** When true, an inability to check the limit denies the action. Use for cost-bearing actions (e.g. agent_step). Default false = fail-open. */
  fail_closed?: boolean
}
// CIL[END stable_id="~/.framework/functions/_shared/rate-limit.ts:ratelimitpolicy:type"]
// CIL[DOC-VECTOR type="context" content="purpose='RateLimitPolicy defines the parameters for controlling the rate of actions within a specified time window.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Custom error class for handling rate limit violations."]
// CIL[DOC-RESPONSIBILITY responsibility="RateLimitError is an error class that represents a situation where a rate limit has been exceeded for a specific action. It provides additional context such as the action, limit, and retry duration."]
// CIL[DOC-CONTEXT module="rate-limit" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/middleware,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="action: string (required) — the action that triggered the rate limit.\\nlimit: number (required) — the maximum number of allowed requests.\\nretryAfter: number | null (optional|nullable) — the duration in seconds to wait before retrying." outputs="RateLimitError — an instance of RateLimitError with specific properties set." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constructs an error message that includes the action for which the rate limit was exceeded." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * RateLimitError is an error class that represents a situation where a rate limit has been exceeded for a specific action. It provides additional context such as the action, limit, and retry duration.
 *
 * @macro       Custom error class for handling rate limit violations.
 * @micro       Constructs an error message that includes the action for which the rate limit was exceeded.
 * @inputSpec
 *   action: string (required) — the action that triggered the rate limit.
 *   limit: number (required) — the maximum number of allowed requests.
 *   retryAfter: number | null (optional|nullable) — the duration in seconds to wait before retrying.
 * @outputSpec  RateLimitError — an instance of RateLimitError with specific properties set.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/rate-limit.ts:ratelimiterror:class" type="class" identity="RateLimitError" parent="~/.framework/functions/_shared/rate-limit.ts"]
// CIL[DOC-MACRO purpose="RateLimitError class"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the RateLimitError class."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/rate-limit.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the RateLimitError class." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export class RateLimitError extends Error {
  statusCode = 429
  action: string
  limit: number
  retryAfter: number | null

  constructor(action: string, limit: number, retryAfter: number | null) {
    super(`Rate limit exceeded for ${action}`)
    this.name = 'RateLimitError'
    this.action = action
    this.limit = limit
    this.retryAfter = retryAfter
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/rate-limit.ts:ratelimiterror:class"]
// CIL[DOC-VECTOR type="context" content="purpose='RateLimitError is an error class that represents a situation where a rate limit has been exceeded for a specific action.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/rate-limit.ts:resolveratelimitpolicies:function" type="function" identity="resolveRateLimitPolicies" parent="~/.framework/functions/_shared/rate-limit.ts"]
// CIL[DOC-MACRO purpose="Resolve the effective rate-limit policies for an action"]
// CIL[DOC-RESPONSIBILITY responsibility="Read accounts.data.rate_limits / rate_limit_profile for the request account, falling back to apps.config.rate_limits for the calling app"]
// CIL[DOC-CONTRACT inputs="ctx, action" outputs="RateLimitPolicy[] (empty = unlimited)" errors="returns [] on lookup failure" side_effects="accounts + apps table reads"]
// CIL[DOC-MICRO logic_summary="accounts.data.rate_limits[action] wins; accounts.data.rate_limit_profile selects config.rate_limits.profiles[profile][action] before the app's base config.rate_limits[action]" notable_decisions="Policy follows the account, not a named app — enforcement is identical no matter which URL the client hit; ctx.appId selects only the calling app's config"]
// CIL[DOC-STABILITY stability="stable"]
export async function resolveRateLimitPolicies(
  ctx: CoreContext & { appId?: string | null },
  action: string
): Promise<RateLimitPolicy[]> {
  const toPolicies = (raw: any): RateLimitPolicy[] =>
    (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(
      (p: any) => typeof p?.limit === 'number' && typeof p?.window_seconds === 'number'
    )

  try {
    // 1. Account-declared override wins.
    let acctData: any = null
    if (ctx.accountId) {
      const { data: acct } = await adminDb
        .from('accounts').select('data').eq('id', ctx.accountId).maybeSingle()
      acctData = acct?.data || null
    }
    const acctPolicies = toPolicies(acctData?.rate_limits?.[action])
    if (acctPolicies.length) return acctPolicies

    // 2/3. Calling app's config only — no cross-app lookups.
    let appCfg: any = null
    if (ctx.appId) {
      const { data: appRow } = await adminDb
        .from('apps').select('config').eq('slug', ctx.appId).maybeSingle()
      appCfg = appRow?.config || null
    }

    const profile = typeof acctData?.rate_limit_profile === 'string'
      ? acctData.rate_limit_profile
      : null
    if (profile) {
      const raw =
        appCfg?.rate_limits?.profiles?.[profile]?.[action] ??
        appCfg?.rate_limits?.[action]
      return toPolicies(raw)
    }
    return toPolicies(appCfg?.rate_limits?.[action])
  } catch {
    return []
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/rate-limit.ts:resolveratelimitpolicies:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/rate-limit.ts:checkratelimit:function" type="function" identity="checkRateLimit" parent="~/.framework/functions/_shared/rate-limit.ts"]
// CIL[DOC-MACRO purpose="Enforce rate-limit policies for an action"]
// CIL[DOC-RESPONSIBILITY responsibility="Atomically increment each policy's window counter and throw RateLimitError when any policy is exceeded"]
// CIL[DOC-CONTRACT inputs="ctx, action, opts.identifier (defaults to account or anonymous-ip)" outputs="void" errors="RateLimitError (429) over limit; Error (503) when a fail_closed policy cannot be checked" side_effects="rate_limits upsert via RPC"]
// CIL[DOC-MICRO logic_summary="For each resolved policy compute window_start (floored epoch or epoch-zero for lifetime), call rate_limit_hit, compare count to limit" notable_decisions="Counters always increment before the check so the first hit counts; retry_after is seconds until the window rolls"]
// CIL[DOC-STABILITY stability="stable"]
export async function checkRateLimit(
  ctx: CoreContext,
  action: string,
  opts: { identifier?: string; policies?: RateLimitPolicy[] } = {}
): Promise<void> {
  const policies = opts.policies ?? await resolveRateLimitPolicies(ctx, action)
  if (!policies.length) return

  const identifier = opts.identifier || (ctx.accountId ? `acct:${ctx.accountId}` : 'anon')
  const now = Date.now()

  for (const policy of policies) {
    const windowStart = policy.window_seconds > 0
      ? new Date(Math.floor(now / (policy.window_seconds * 1000)) * policy.window_seconds * 1000)
      : new Date(0)
    const key = `${action}:${identifier}`

    let count: number | null = null
    try {
      const { data, error } = await adminDb.rpc('rate_limit_hit', {
        p_key: key,
        p_window_start: windowStart.toISOString(),
      })
      if (error) throw error
      count = typeof data === 'number' ? data : null
    } catch (err: any) {
      console.warn(`checkRateLimit(${action}) RPC failed:`, err?.message)
      if (policy.fail_closed) {
        const e: any = new Error(`Rate limit unavailable for ${action}`)
        e.statusCode = 503
        throw e
      }
      continue
    }

    if (count !== null && count > policy.limit) {
      const retryAfter = policy.window_seconds > 0
        ? Math.ceil((windowStart.getTime() + policy.window_seconds * 1000 - now) / 1000)
        : null
      // Security signal: the flagged-accounts report aggregates these.
      void emitAudit({ ...ctx, db: adminDb } as any, 'security.rate_limit_exceeded', {
        type: 'rate_limit', id: key, account_id: ctx.accountId
      }, {
        result: 'denied',
        action_name: action,
        identifier,
        limit: policy.limit,
        retry_after: retryAfter,
      }).catch(() => {})
      throw new RateLimitError(action, policy.limit, retryAfter)
    }
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/rate-limit.ts:checkratelimit:function"]
