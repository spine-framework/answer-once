// config lives in apps.config.analytics (manifest-seeded) rather than system_settings so it ships with the app; only hosts listed in the ga4 map are tracked — previews, localhost, and unlisted domains stay dark; the whole apps.config is NOT exposed to clients, only the analytics subtree via the apps sanitizer; this module stays free of React/context imports so the pure resolvers are unit-testable in the node vitest env


export interface AnalyticsAppFields {
  slug: string
  route_prefix: string | null
  renderer?: string | null
  config?: Record<string, any> | null
}

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

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

// absent/invalid config returns null so unconfigured apps and unlisted hosts never load gtag
export function resolveGa4MeasurementId(
  app: AnalyticsAppFields | null | undefined,
  hostname: string,
): string | null {
  const ga4 = app?.config?.analytics?.ga4
  if (!ga4 || typeof ga4 !== 'object') return null
  const id = ga4[hostname] ?? ga4['*']
  return typeof id === 'string' && /^G-[A-Z0-9]+$/.test(id) ? id : null
}

const loadedIds = new Set<string>()

// send_page_view disabled so AnalyticsTracker is the single source of page_view events — no double counting on first load
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
