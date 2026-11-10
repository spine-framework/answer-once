// CIL[BEGIN stable_id="~/.framework/src/lib/analytics.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/lib/analytics.ts"]
// CIL[DOC-MACRO purpose="Per-app Google Analytics 4 tracking driven by apps.config.analytics"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the GA4 measurement ID for the app mounted at the current path+host and lazily load gtag.js; the AnalyticsTracker component in components/AnalyticsTracker.tsx owns navigation wiring"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/components/AnalyticsTracker.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/App.tsx,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="app.config.analytics.ga4 hostname→measurement-id map from the apps list API" outputs="gtag page_view events" errors="never throws — tracking failures are swallowed" side_effects="injects gtag.js script and dataLayer on first configured app view"]
// CIL[DOC-MICRO logic_summary="matchAppForPath picks the longest route_prefix match; resolveGa4MeasurementId does exact-host lookup with '*' fallback; ensureGtag injects the GA script once per measurement ID with send_page_view disabled so the tracker owns every page_view" notable_decisions="config lives in apps.config.analytics (manifest-seeded) rather than system_settings so it ships with the app; only hosts listed in the ga4 map are tracked — previews, localhost, and unlisted domains stay dark; the whole apps.config is NOT exposed to clients, only the analytics subtree via the apps sanitizer; this module stays free of React/context imports so the pure resolvers are unit-testable in the node vitest env"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework developers"]

// CIL[DOC-VECTOR type="context" content="purpose='Per-app GA4 tracking driven by apps.config.analytics'; imports: none" status="ready"]
// CIL[END stable_id="~/.framework/src/lib/analytics.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/lib/analytics.ts:analyticsappfields:interface" type="interface" identity="AnalyticsAppFields" parent="~/.framework/src/lib/analytics.ts"]
export interface AnalyticsAppFields {
  slug: string
  route_prefix: string | null
  renderer?: string | null
  config?: Record<string, any> | null
}
// CIL[END stable_id="~/.framework/src/lib/analytics.ts:analyticsappfields:interface"]

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

// CIL[BEGIN stable_id="~/.framework/src/lib/analytics.ts:matchappforpath:function" type="function" identity="matchAppForPath" parent="~/.framework/src/lib/analytics.ts"]
// CIL[DOC-MACRO purpose="Find the app whose resolved route_prefix owns a pathname"]
// CIL[DOC-CONTRACT inputs="apps: AnalyticsAppFields[], pathname: string" outputs="matching app or null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Longest-prefix wins; '/' matches everything; '/demo' matches '/demo' and '/demo/*' but not '/demo-x'" notable_decisions="mirrors the sorted-route precedence in App.tsx without requiring the full AppRecord shape"]
export function matchAppForPath(
  apps: AnalyticsAppFields[],
  pathname: string,
): AnalyticsAppFields | null {
  let best: AnalyticsAppFields | null = null
  let bestLen = -1
  for (const app of apps) {
    const prefix = app.route_prefix
    if (!prefix) continue
    const matches =
      prefix === '/'
        ? true
        : pathname === prefix || pathname.startsWith(prefix + '/')
    if (!matches) continue
    if (prefix.length > bestLen) {
      best = app
      bestLen = prefix.length
    }
  }
  return best
}
// CIL[END stable_id="~/.framework/src/lib/analytics.ts:matchappforpath:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/analytics.ts:resolvega4measurementid:function" type="function" identity="resolveGa4MeasurementId" parent="~/.framework/src/lib/analytics.ts"]
// CIL[DOC-MACRO purpose="Resolve the GA4 measurement ID an app declares for a hostname"]
// CIL[DOC-CONTRACT inputs="app: AnalyticsAppFields | null, hostname: string" outputs="G-XXXX id or null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads config.analytics.ga4; exact hostname key wins, '*' is the wildcard fallback; validates the G-XXXXXXX shape" notable_decisions="absent/invalid config returns null so unconfigured apps and unlisted hosts never load gtag"]
export function resolveGa4MeasurementId(
  app: AnalyticsAppFields | null | undefined,
  hostname: string,
): string | null {
  const ga4 = app?.config?.analytics?.ga4
  if (!ga4 || typeof ga4 !== 'object') return null
  const id = ga4[hostname] ?? ga4['*']
  return typeof id === 'string' && /^G-[A-Z0-9]+$/.test(id) ? id : null
}
// CIL[END stable_id="~/.framework/src/lib/analytics.ts:resolvega4measurementid:function"]

const loadedIds = new Set<string>()

// CIL[BEGIN stable_id="~/.framework/src/lib/analytics.ts:ensuregtag:function" type="function" identity="ensureGtag" parent="~/.framework/src/lib/analytics.ts"]
// CIL[DOC-MACRO purpose="Inject gtag.js and configure a measurement ID exactly once"]
// CIL[DOC-CONTRACT inputs="id: string" outputs="void" errors="none" side_effects="appends script + dataLayer bootstrap to document.head/window; idempotent per ID via module-level Set"]
// CIL[DOC-MICRO logic_summary="Creates the async gtag/js script, initializes window.dataLayer/gtag, fires gtag('js') and gtag('config', {send_page_view:false})" notable_decisions="send_page_view disabled so AnalyticsTracker is the single source of page_view events — no double counting on first load"]
export function ensureGtag(id: string): void {
  if (loadedIds.has(id) || typeof window === 'undefined' || typeof document === 'undefined') return
  loadedIds.add(id)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
}
// CIL[END stable_id="~/.framework/src/lib/analytics.ts:ensuregtag:function"]
