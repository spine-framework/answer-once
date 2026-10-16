// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registry.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-MACRO purpose="Defines the shared webhook handler registry and its data access for serverless functions"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide imports, types, and core utilities for resolving and loading webhook handler functions"]
// CIL[DOC-CONTEXT module="webhook-registry" layer="functions" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains the file header and shared adminDb import used by the registry functions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="spine-functions maintainers"]

import { adminDb } from './db'
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shared webhook handler registry and its data access for serverless functions'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registry.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registry.ts:HandlerCacheEntry:interface" type="interface" identity="HandlerCacheEntry" parent="~/.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-MACRO purpose="Type definition for a cached webhook handler entry"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the shape of an in-memory cached handler record"]
// CIL[DOC-CONTEXT module="webhook-registry" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares functionName and loaded boolean fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface HandlerCacheEntry {
  functionName: string
  loaded: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for a cached webhook handler entry'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registry.ts:HandlerCacheEntry:interface"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registry.ts:handlerCache:constant" type="constant" identity="handlerCache" parent="~/.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-MACRO purpose="In-memory cache of resolved webhook handler metadata"]
// CIL[DOC-RESPONSIBILITY responsibility="Store loaded handler lookups to avoid repeated DB queries"]
// CIL[DOC-CONTEXT module="webhook-registry" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="Mutates when lookups or cache clears occur"]
// CIL[DOC-MICRO logic_summary="Map keyed by appId, accountId, and handlerName" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const handlerCache = new Map<string, HandlerCacheEntry>()
// CIL[DOC-VECTOR type="context" content="purpose='In-memory cache of resolved webhook handler metadata'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registry.ts:handlerCache:constant"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registry.ts:lookupHandler:function" type="function" identity="lookupHandler" parent="~/.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-MACRO purpose="Look up a webhook handler by name and optional scope, with fallback to global handlers"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the serverless function name for a given webhook handler"]
// CIL[DOC-CONTEXT module="webhook-registry" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-CONTRACT inputs="handlerName: string, appId: string | null | undefined, accountId: string | null | undefined" outputs="{ functionName: string } | null" errors="Returns null when not found; logs console warnings" side_effects="Writes matching entries to handlerCache"]
// CIL[DOC-MICRO logic_summary="Builds a cache key, checks the cache, queries webhook_handlers with optional app and account filters, falls back to a null-scoped handler, and caches the result" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export async function lookupHandler(
  handlerName: string,
  appId?: string | null,
  accountId?: string | null
): Promise<{ functionName: string } | null> {
  const cacheKey = `${appId || 'null'}:${accountId || 'null'}:${handlerName}`
  const cached = handlerCache.get(cacheKey)
  if (cached) {
    return { functionName: cached.functionName }
  }


  let query = adminDb
    .from('webhook_handlers')
    .select('name, function_name, is_active, is_deleted')
    .eq('name', handlerName)
    .eq('is_active', true)
    .eq('is_deleted', false)

  if (appId !== undefined) {
    query = query.eq('app_id', appId)
  }
  if (accountId !== undefined) {
    query = query.eq('account_id', accountId)
  }

  const { data, error } = await query.single()

  // Fallback to a global / system handler if no app- or account-scoped one exists.
  if (error || !data) {
    const { data: fallbackData, error: fallbackError } = await adminDb
      .from('webhook_handlers')
      .select('name, function_name, is_active, is_deleted')
      .eq('name', handlerName)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .is('app_id', null)
      .is('account_id', null)
      .single()

    if (fallbackError || !fallbackData) {
      console.log(`[webhook-registry] Handler not found: ${handlerName} (appId=${appId}, accountId=${accountId})`)
      return null
    }

    handlerCache.set(cacheKey, {
      functionName: fallbackData.function_name,
      loaded: false
    })

    return { functionName: fallbackData.function_name }
  }

  handlerCache.set(cacheKey, {
    functionName: data.function_name,
    loaded: false
  })

  return { functionName: data.function_name }
}
// CIL[DOC-VECTOR type="context" content="purpose='Look up a webhook handler by name and optional scope, with fallback to global handlers'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registry.ts:lookupHandler:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registry.ts:loadHandler:function" type="function" identity="loadHandler" parent="~/.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-MACRO purpose="Dynamically import and extract a handler function by module name"]
// CIL[DOC-RESPONSIBILITY responsibility="Load the configured serverless function at runtime"]
// CIL[DOC-CONTEXT module="webhook-registry" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-CONTRACT inputs="functionName: string" outputs="Function | null" errors="Returns null if export missing or dynamic import fails; logs console errors" side_effects="None beyond module import"]
// CIL[DOC-MICRO logic_summary="Chooses a relative import prefix based on custom/ prefix, awaits the module, and returns the first available adapt, handler, or default export" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export async function loadHandler(functionName: string): Promise<Function | null> {
  try {
    const prefix = functionName.startsWith('custom/') ? '../../../' : '../'
    const module = await import(`${prefix}${functionName}`)
    
    const handler = module.adapt || module.handler || module.default
    
    if (typeof handler !== 'function') {
      console.error(`[webhook-registry] No 'adapt' or 'handler' export found in ${functionName}`)
      return null
    }

    return handler
  } catch (err) {
    console.error(`[webhook-registry] Failed to load ${functionName}:`, err)
    return null
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Dynamically import and extract a handler function by module name'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registry.ts:loadHandler:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registry.ts:resolveHandler:function" type="function" identity="resolveHandler" parent="~/.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-MACRO purpose="Resolve and load a handler in one call"]
// CIL[DOC-RESPONSIBILITY responsibility="Combine lookup and load for a given webhook handler name"]
// CIL[DOC-CONTEXT module="webhook-registry" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-CONTRACT inputs="handlerName: string, appId?: string | null, accountId?: string | null" outputs="Function | null" errors="Returns null when lookup or load fails" side_effects="May populate handlerCache via lookupHandler"]
// CIL[DOC-MICRO logic_summary="Calls lookupHandler then loadHandler and returns the loaded function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export async function resolveHandler(
  handlerName: string,
  appId?: string | null,
  accountId?: string | null
): Promise<Function | null> {
  const metadata = await lookupHandler(handlerName, appId, accountId)
  if (!metadata) return null

  return loadHandler(metadata.functionName)
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve and load a handler in one call'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registry.ts:resolveHandler:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registry.ts:clearHandlerCache:function" type="function" identity="clearHandlerCache" parent="~/.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-MACRO purpose="Clear the in-memory handler cache"]
// CIL[DOC-RESPONSIBILITY responsibility="Allow callers to invalidate cached webhook handler metadata"]
// CIL[DOC-CONTEXT module="webhook-registry" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="none" side_effects="Empties the handlerCache map"]
// CIL[DOC-MICRO logic_summary="Calls Map.clear on the handler cache" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function clearHandlerCache(): void {
  handlerCache.clear()
}
// CIL[DOC-VECTOR type="context" content="purpose='Clear the in-memory handler cache'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registry.ts:clearHandlerCache:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registry.ts:listRegisteredHandlers:function" type="function" identity="listRegisteredHandlers" parent="~/.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-MACRO purpose="List active webhook handler names from the database"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a roster of available, active handlers"]
// CIL[DOC-CONTEXT module="webhook-registry" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registry.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string[]" errors="Returns empty array and logs error on DB failure" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Queries webhook_handlers for active names and returns an array of name values" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export async function listRegisteredHandlers(): Promise<string[]> {
  const { data, error } = await adminDb
    .from('webhook_handlers')
    .select('name')
    .eq('is_active', true)

  if (error) {
    console.error('[webhook-registry] Failed to list handlers:', error)
    return []
  }

  return data?.map(h => h.name) || []
}
// CIL[DOC-VECTOR type="context" content="purpose='List active webhook handler names from the database'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registry.ts:listRegisteredHandlers:function"]
