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
// Policy is data/config, not code — accounts and apps declare limits and Core enforces; window_seconds 0 means lifetime cap; fail_closed reserved for cost-bearing actions like agent_step

import { adminDb } from './db'
import type { CoreContext, RequestContext } from './middleware'
import { emitAudit } from './audit'

/**
 * RateLimitPolicy defines the parameters for controlling the rate of actions within a specified time window. It is used to enforce limits on the number of allowed actions to prevent abuse and manage resource usage.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export type RateLimitPolicy = {
  /** Max hits allowed inside the window. */
  limit: number
  /** Window size in seconds. 0 = lifetime cap (no reset). */
  window_seconds: number
  /** When true, an inability to check the limit denies the action. Use for cost-bearing actions (e.g. agent_step). Default false = fail-open. */
  fail_closed?: boolean
}

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

// Counters always increment before the check so the first hit counts; retry_after is seconds until the window rolls
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
