// CIL[BEGIN stable_id="~/.framework/src/hooks/useBranding.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/hooks/useBranding.ts"]
// CIL[DOC-MACRO purpose="React hook exposing resolved instance branding and applying it to the document"]
// CIL[DOC-RESPONSIBILITY responsibility="Give framework components the instance brand (name, logo, favicon, title) and keep document.title/favicon in sync"]
// CIL[DOC-CONTEXT module="framework-hooks" layer="hook" related_files=".framework/src/lib/branding.ts,spine.config.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="SpineBranding" errors="load failures resolve to defaults" side_effects="document.title and favicon mutation via applyBrandingToDocument"]
// CIL[DOC-MICRO logic_summary="Seeds state from the module cache, kicks the shared loadBranding fetch, updates state when it resolves, and applies document effects on every change" notable_decisions="every consumer applies document effects — idempotent, so pages that render a logo also fix the tab title/favicon"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework developers"]

import { useEffect, useState } from 'react'
import {
  applyBrandingToDocument,
  getCachedBranding,
  loadBranding,
  type SpineBranding,
} from '../lib/branding'
// CIL[END stable_id="~/.framework/src/hooks/useBranding.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useBranding.ts:usebranding:hook" type="hook" identity="useBranding" parent="~/.framework/src/hooks/useBranding.ts"]
// CIL[DOC-MACRO purpose="Return the resolved SpineBranding and sync document.title/favicon"]
// CIL[DOC-RESPONSIBILITY responsibility="Bridge the cached branding loader into React state"]
// CIL[DOC-CONTEXT module="framework-hooks" layer="hook" related_files=".framework/src/lib/branding.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SpineBranding (defaults until fetch resolves)" errors="none" side_effects="triggers shared /spine.config.json fetch; mutates document head"]
// CIL[DOC-MICRO logic_summary="useState seeded by getCachedBranding; effect calls loadBranding then setBranding; second effect applies branding to the document whenever it changes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
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
// CIL[END stable_id="~/.framework/src/hooks/useBranding.ts:usebranding:hook"]
