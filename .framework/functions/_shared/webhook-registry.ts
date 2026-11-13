
import { adminDb } from './db'



interface HandlerCacheEntry {
  functionName: string
  loaded: boolean
}




const handlerCache = new Map<string, HandlerCacheEntry>()



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


// Dynamic import of caller-chosen paths cannot work: esbuild only bundles
// literal import() specifiers, and raw .ts shipped via included_files cannot
// execute under the bundled CJS context (functions-serve package.json is
// type:commonjs). function_name therefore resolves through this static
// allowlist keyed by flat assembled basename — same security/bundling model
// as integration-outbound's builtInOutboundAdapters (DB-driven module names
// are also an arbitrary-code-execution surface). Register new inbound
// webhook handler modules here; @ts-ignores are required because the flat
// siblings only exist in .assembled/, not in the .framework source tree.
const INBOUND_MODULE_LOADERS: Record<string, () => Promise<any>> = {
  // @ts-ignore — resolved against the assembled flat functions dir
  'generic-webhook-inbound': () => import('../adapters/generic-webhook-inbound'),
  // @ts-ignore — resolved against the assembled flat functions dir
  'custom_make-inbound': () => import('../custom_make-inbound'),
  // @ts-ignore — resolved against the assembled flat functions dir
  'custom_portal-signals': () => import('../custom_portal-signals'),
}

export async function loadHandler(functionName: string): Promise<Function | null> {
  const basename = functionName.split('/').pop() || functionName
  const loader = INBOUND_MODULE_LOADERS[basename]
  if (!loader) {
    console.error(`[webhook-registry] No built-in loader for ${functionName} (basename '${basename}') — register the module in INBOUND_MODULE_LOADERS`)
    return null
  }
  try {
    const module = await loader()
    const handler = module.adapt || module.handler || module.default
    if (typeof handler === 'function') return handler
    console.error(`[webhook-registry] No 'adapt' or 'handler' export found in ${functionName}`)
    return null
  } catch (err) {
    console.error(`[webhook-registry] Failed to load ${functionName}:`, err)
    return null
  }
}


export async function resolveHandler(
  handlerName: string,
  appId?: string | null,
  accountId?: string | null
): Promise<Function | null> {
  const metadata = await lookupHandler(handlerName, appId, accountId)
  if (!metadata) return null

  return loadHandler(metadata.functionName)
}


export function clearHandlerCache(): void {
  handlerCache.clear()
}


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
