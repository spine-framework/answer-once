// must render inside AppsRegistryProvider and a Router; unauthenticated pages are untracked because the registry is empty without a user; a matched app with no measurement ID for this host yields no tracking rather than falling back to a parent-prefix app

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppsRegistry } from '../contexts/AppContext'
import { ensureGtag, matchAppForPath, resolveGa4MeasurementId } from '../lib/analytics'

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
