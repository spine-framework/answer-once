// ctx.db is adminDb for machine principals so the explicit .in/.eq filter is the enforcement — never trust caller-supplied account_id for non-system principals
import { adminDb } from './db'
import { isSystemPrincipal, resolveAccessibleAccountIds } from './principal'

export const ENTITY_ACCOUNT_KEY: Record<string, string | null> = {
  accounts: 'id',
  people: 'account_id',
  items: 'account_id',
  threads: 'account_id',
  messages: 'account_id',
  links: 'account_id',
  attachments: 'account_id',
  watchers: 'account_id',
  item_progress: 'account_id',
  logs: 'account_id',
  test_runs: 'account_id',
  observability: 'account_id',
  test_cases: 'account_id',
  ai_agents: 'account_id',
  prompt_configs: 'account_id',
  types: null,
  link_types: null,
}

const platformAccountCacheKey = '__platformAccountId'

// spine-system id, cached per request. The platform account holds records
// every actor may read — the items_access RLS policy has a matching
// platform-scope branch, so the explicit filters below must mirror it for
// machine principals on adminDb (where RLS never applies).
export async function resolvePlatformAccountId(ctx: any): Promise<string | null> {
  if (ctx && platformAccountCacheKey in ctx) return ctx[platformAccountCacheKey]
  const { data } = await adminDb
    .from('accounts')
    .select('id')
    .eq('slug', 'spine-system')
    .maybeSingle()
  const id = data?.id ?? null
  if (ctx) ctx[platformAccountCacheKey] = id
  return id
}

// Must stay synchronous: PostgREST builders are thenable, so returning one from an async function unwraps it into a query result instead of a builder
export function applyAccountScope(query: any, entity: string, accountIds: string[] | null, platformAccountId?: string | null): any {
  const key = ENTITY_ACCOUNT_KEY[entity]
  if (!key || accountIds === null) return query
  // items only: mirror the items_access platform branch so list/stats reads
  // reach platform-scope rows on spine-system. Items is the sole table whose
  // RLS policy has that branch — widening other entities would leak
  // spine-system rows to machine principals with no RLS backstop.
  if (entity === 'items' && platformAccountId) {
    const platformClause = `and(${key}.eq.${platformAccountId},design_schema->>scope.eq.platform)`
    if (!accountIds.length) return query.or(platformClause)
    return query.or(`${key}.in.(${accountIds.join(',')}),${platformClause}`)
  }
  return accountIds.length === 1 ? query.eq(key, accountIds[0]) : query.in(key, accountIds)
}

export async function assertRecordAccess(ctx: any, entity: string, record: any, platformAccountId?: string | null): Promise<void> {
  const key = ENTITY_ACCOUNT_KEY[entity]
  if (!key || !record) return
  if (isSystemPrincipal(ctx)) return
  const ids = await resolveAccessibleAccountIds(ctx)
  const owner = record[key]
  if (owner && !(ids || []).includes(owner)) {
    // Read-side exemption — callers pass platformAccountId on read paths only.
    // Write callers omit it so platform rows stay confined to system actors
    // (deliberately stricter than the FOR ALL RLS policy).
    if (entity === 'items' && platformAccountId && owner === platformAccountId &&
        record.design_schema?.scope === 'platform') return
    const e: any = new Error('Record not found or access denied')
    e.statusCode = 403
    throw e
  }
}

// The explicit filter is what enforces tenancy for machines — RLS never applies on the service-role client
export async function scopeFor(ctx: any): Promise<{ db: any; accountIds: string[] | null }> {
  const db = isSystemPrincipal(ctx) ? adminDb : ctx.db
  const accountIds = await resolveAccessibleAccountIds(ctx)
  return { db, accountIds }
}

export function ifAccountScope(query: any, accountIds: string[] | null): any {
  return accountIds === null ? query : query.in('account_id', accountIds)
}

export async function canAccessAccount(ctx: any, accountId: string | null | undefined): Promise<boolean> {
  if (!accountId) return false
  if (isSystemPrincipal(ctx)) return true
  const ids = await resolveAccessibleAccountIds(ctx)
  return (ids || []).includes(accountId)
}
