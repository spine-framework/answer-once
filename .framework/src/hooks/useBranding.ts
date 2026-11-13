// every consumer applies document effects — idempotent, so pages that render a logo also fix the tab title/favicon

import { useEffect, useState } from 'react'
import {
  applyBrandingToDocument,
  getCachedBranding,
  loadBranding,
  type SpineBranding,
} from '../lib/branding'

export function useBranding(): SpineBranding {
  const [branding, setBranding] = useState<SpineBranding>(getCachedBranding)

  useEffect(() => {
    let active = true
    loadBranding().then(resolved => {
      if (active) setBranding(resolved)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    applyBrandingToDocument(branding)
  }, [branding])

  return branding
}
