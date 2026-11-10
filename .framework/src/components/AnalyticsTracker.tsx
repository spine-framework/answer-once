// CIL[BEGIN stable_id="~/.framework/src/components/AnalyticsTracker.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/AnalyticsTracker.tsx"]
// CIL[DOC-MACRO purpose="Render nothing; emit GA4 page_view events for the app that owns the current route"]
// CIL[DOC-RESPONSIBILITY responsibility="Bridge AppsRegistryContext + router location to lib/analytics resolvers and gtag"]
// CIL[DOC-CONTEXT module="framework-ui" layer="components" related_files=".framework/src/lib/analytics.ts,.framework/src/contexts/AppContext.tsx,.framework/src/App.tsx"]
// CIL[DOC-CONTRACT inputs="none (reads AppsRegistryContext + router location)" outputs="null" errors="swallows tracking errors" side_effects="gtag page_view events, gtag.js injection via ensureGtag"]
// CIL[DOC-MICRO logic_summary="Effect deps are routableApps + pathname + search; dedupes on id+path+search so registry refetches don't double-count; waits for the apps list before first hit" notable_decisions="must render inside AppsRegistryProvider and a Router; unauthenticated pages are untracked because the registry is empty without a user; a matched app with no measurement ID for this host yields no tracking rather than falling back to a parent-prefix app"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework developers"]

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppsRegistry } from '../contexts/AppContext'
import { ensureGtag, matchAppForPath, resolveGa4MeasurementId } from '../lib/analytics'
// CIL[END stable_id="~/.framework/src/components/AnalyticsTracker.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/AnalyticsTracker.tsx:analyticstracker:component" type="component" identity="AnalyticsTracker" parent="~/.framework/src/components/AnalyticsTracker.tsx"]
// CIL[DOC-MACRO purpose="Track SPA page views for whichever configured app owns the current route"]
// CIL[DOC-RESPONSIBILITY responsibility="Render nothing; on app-registry or location change resolve the active app + hostname measurement ID and emit a GA4 page_view"]
// CIL[DOC-STABILITY stability="experimental"]
export function AnalyticsTracker() {
  const { routableApps } = useAppsRegistry()
  const location = useLocation()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    try {
      const app = matchAppForPath(routableApps, location.pathname)
      const id = resolveGa4MeasurementId(app, window.location.hostname)
      if (!id) return

      ensureGtag(id)

      const key = `${id}${location.pathname}${location.search}`
      if (lastSent.current === key) return
      lastSent.current = key

      window.gtag?.('event', 'page_view', {
        page_location: window.location.href,
        page_path: location.pathname + location.search,
        page_title: document.title,
      })
    } catch {
      // Analytics must never break the app.
    }
  }, [routableApps, location.pathname, location.search])

  return null
}
// CIL[END stable_id="~/.framework/src/components/AnalyticsTracker.tsx:analyticstracker:component"]
