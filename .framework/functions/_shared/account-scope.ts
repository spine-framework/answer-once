// CIL[BEGIN stable_id="~/.framework/functions/_shared/account-scope.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/account-scope.ts"]
// CIL[DOC-MACRO purpose="Tenant-isolation helpers for account-scoped queries on service-role clients"]
// CIL[DOC-RESPONSIBILITY responsibility="Map entities to their tenant column, apply account filters to PostgREST queries, and 403 foreign-account record access for non-system principals"]
// CIL[DOC-CONTEXT module="functions/_shared/account-scope" layer="shared" related_files=".framework/functions/_shared/principal.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="PostgREST builders, RequestContext, entity names, records" outputs="scoped builders and authorization verdicts" errors="403 on foreign-account access" side_effects="get_accessible_accounts RPC for human principals"]
// CIL[DOC-MICRO logic_summary="ENTITY_ACCOUNT_KEY drives applyAccountScope/ifAccountScope (query filters) and assertRecordAccess (post-load check); scopeFor returns db + accessible ids; canAccessAccount validates a single target account" notable_decisions="ctx.db is adminDb for machine principals so the explicit .in/.eq filter is the enforcement — never trust caller-supplied account_id for non-system principals"]
// CIL[DOC-STABILITY stability="stable"]
import { adminDb } from './db'
import { isSystemPrincipal, resolveAccessibleAccountIds } from './principal'
// CIL[END stable_id="~/.framework/functions/_shared/account-scope.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/account-scope.ts:ENTITY_ACCOUNT_KEY:constant" type="constant" identity="ENTITY_ACCOUNT_KEY" parent="~/.framework/functions/_shared/account-scope.ts"]
// CIL[DOC-MACRO purpose="Which column carries tenant ownership for each admin-data entity"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the tenant key used by applyAccountScope and assertRecordAccess"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record<string,string|null>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="'accounts' is self-keyed on id; 'types'/'link_types' map to null (global config — reads stay open, writes are config-gated elsewhere); everything else uses account_id" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/account-scope.ts:ENTITY_ACCOUNT_KEY:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/account-scope.ts:applyAccountScope:function" type="function" identity="applyAccountScope" parent="~/.framework/functions/_shared/account-scope.ts"]
// CIL[DOC-MACRO purpose="Add a tenant filter to a PostgREST query for non-system principals"]
// CIL[DOC-RESPONSIBILITY responsibility="eq/in the entity's tenant column to the caller's accessible accounts; no-op for global entities and system principals"]
// CIL[DOC-CONTRACT inputs="query, entity, accountIds (null = system/unscoped)" outputs="filtered query builder" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Looks up ENTITY_ACCOUNT_KEY; single id → .eq, multiple → .in, null ids or null key → unscoped" notable_decisions="Must stay synchronous: PostgREST builders are thenable, so returning one from an async function unwraps it into a query result instead of a builder"]
// CIL[DOC-STABILITY stability="stable"]
export function applyAccountScope(query: any, entity: string, accountIds: string[] | null): any {
  const key = ENTITY_ACCOUNT_KEY[entity]
  if (!key || accountIds === null) return query
  return accountIds.length === 1 ? query.eq(key, accountIds[0]) : query.in(key, accountIds)
}
// CIL[END stable_id="~/.framework/functions/_shared/account-scope.ts:applyAccountScope:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/account-scope.ts:assertRecordAccess:function" type="function" identity="assertRecordAccess" parent="~/.framework/functions/_shared/account-scope.ts"]
// CIL[DOC-MACRO purpose="Throw 403 when a loaded row sits outside the caller's accessible accounts"]
// CIL[DOC-RESPONSIBILITY responsibility="Post-load authorization check for get/update/remove paths that fetched via a service-role client"]
// CIL[DOC-CONTRACT inputs="ctx, entity, record" outputs="void" errors="403 Record not found or access denied" side_effects="resolves accessible accounts on first call per request"]
// CIL[DOC-MICRO logic_summary="null tenant key or system principal → allow; otherwise record's tenant value must be in accessible ids" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export async function assertRecordAccess(ctx: any, entity: string, record: any): Promise<void> {
  const key = ENTITY_ACCOUNT_KEY[entity]
  if (!key || !record) return
  if (isSystemPrincipal(ctx)) return
  const ids = await resolveAccessibleAccountIds(ctx)
  const owner = record[key]
  if (owner && !(ids || []).includes(owner)) {
    const e: any = new Error('Record not found or access denied')
    e.statusCode = 403
    throw e
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/account-scope.ts:assertRecordAccess:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/account-scope.ts:scopeFor:function" type="function" identity="scopeFor" parent="~/.framework/functions/_shared/account-scope.ts"]
// CIL[DOC-MACRO purpose="Return the db client and account scope a handler should use"]
// CIL[DOC-RESPONSIBILITY responsibility="Pair the right client (adminDb for system, ctx.db otherwise) with the caller's accessible account ids"]
// CIL[DOC-CONTRACT inputs="ctx" outputs="{ db, accountIds|null }" errors="none" side_effects="get_accessible_accounts RPC for humans (memoized)"]
// CIL[DOC-MICRO logic_summary="System principals get adminDb + null scope; humans get ctx.db + own + descendant accounts; account-bound machines get ctx.db (which is adminDb) + their single bound account" notable_decisions="The explicit filter is what enforces tenancy for machines — RLS never applies on the service-role client"]
// CIL[DOC-STABILITY stability="stable"]
export async function scopeFor(ctx: any): Promise<{ db: any; accountIds: string[] | null }> {
  const db = isSystemPrincipal(ctx) ? adminDb : ctx.db
  const accountIds = await resolveAccessibleAccountIds(ctx)
  return { db, accountIds }
}
// CIL[END stable_id="~/.framework/functions/_shared/account-scope.ts:scopeFor:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/account-scope.ts:ifAccountScope:function" type="function" identity="ifAccountScope" parent="~/.framework/functions/_shared/account-scope.ts"]
// CIL[DOC-MACRO purpose="Apply an account_id .in filter to a built query when the caller is scoped"]
// CIL[DOC-RESPONSIBILITY responsibility="Convenience wrapper for the common account_id-column case in pipelines/executions/item-progress/eval handlers"]
// CIL[DOC-CONTRACT inputs="query, accountIds (null = unscoped)" outputs="query builder" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="null → query unchanged; otherwise .in('account_id', accountIds)" notable_decisions="Call AFTER .select()/.update() — .in is a filter method that does not exist on the raw from() builder"]
// CIL[DOC-STABILITY stability="stable"]
export function ifAccountScope(query: any, accountIds: string[] | null): any {
  return accountIds === null ? query : query.in('account_id', accountIds)
}
// CIL[END stable_id="~/.framework/functions/_shared/account-scope.ts:ifAccountScope:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/account-scope.ts:canAccessAccount:function" type="function" identity="canAccessAccount" parent="~/.framework/functions/_shared/account-scope.ts"]
// CIL[DOC-MACRO purpose="True when the value names an account the caller may write into"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate a caller-supplied or parent-derived account_id before a write"]
// CIL[DOC-CONTRACT inputs="ctx, accountId" outputs="boolean" errors="none" side_effects="resolves accessible accounts on first call per request"]
// CIL[DOC-MICRO logic_summary="falsy → false; system principal → true; otherwise membership check against accessible ids" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export async function canAccessAccount(ctx: any, accountId: string | null | undefined): Promise<boolean> {
  if (!accountId) return false
  if (isSystemPrincipal(ctx)) return true
  const ids = await resolveAccessibleAccountIds(ctx)
  return (ids || []).includes(accountId)
}
// CIL[END stable_id="~/.framework/functions/_shared/account-scope.ts:canAccessAccount:function"]
