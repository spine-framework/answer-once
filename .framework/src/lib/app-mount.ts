// CIL[BEGIN stable_id="~/.framework/src/lib/app-mount.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/lib/app-mount.ts"]
// CIL[DOC-MACRO purpose="Resolve an app's effective route_prefix for the current hostname — host-keyed mount overrides"]
// CIL[DOC-RESPONSIBILITY responsibility="Decide whether an app is routable on this host and at which prefix, honoring prod_domain/preview_domain gating and prod_route_prefix/preview_route_prefix mount overrides"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/hooks/useApps.ts,.framework/src/contexts/AppContext.tsx,.framework/migrations/074_app_route_prefix_domains.sql"]
// CIL[DOC-CONTRACT inputs="app domain/prefix fields + optional hostname/environment overrides" outputs="{routable, route_prefix}" errors="none" side_effects="reads import.meta.env.VITE_ENVIRONMENT and window.location.hostname unless overridden"]
// CIL[DOC-MICRO logic_summary="Environment selects the domain/override pair (preview vs prod); host match + override set → override mount; host match without override → default mount; no match with override → still routable at default mount; no match without override → filtered (legacy domain-lock)" notable_decisions="a route_prefix override converts the domain column from a hard visibility filter into a mount selector, preserving legacy prod_domain filter semantics for rows that set no override"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework developers"]

import { apiFetch } from './api'

export interface AppMountFields {
  route_prefix: string | null
  preview_domain?: string | null
  prod_domain?: string | null
  prod_domains?: string[] | null
  preview_route_prefix?: string | null
  prod_route_prefix?: string | null
}

export interface AppMountResolution {
  routable: boolean
  route_prefix: string | null
}
// CIL[END stable_id="~/.framework/src/lib/app-mount.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/lib/app-mount.ts:resolveappmount:function" type="function" identity="resolveAppMount" parent="~/.framework/src/lib/app-mount.ts"]
// CIL[DOC-MACRO purpose="Compute the effective route_prefix and routability for an app on the current host"]
// CIL[DOC-CONTRACT inputs="app: AppMountFields, opts: {hostname?, environment?} (injectable for tests)" outputs="AppMountResolution" errors="malformed domain treated as non-matching" side_effects="none — pure"]
// CIL[DOC-MICRO logic_summary="Picks preview_* fields when environment==='preview' else prod_*; null domain → default mount; matching host → override ?? route_prefix; non-matching host → routable at route_prefix when an override exists, unroutable when it does not" notable_decisions="opts injection keeps the function testable in the node vitest environment (no jsdom)"]
// CIL[DOC-STABILITY stability="experimental"]
export function resolveAppMount(
  app: AppMountFields,
  opts: { hostname?: string; environment?: string } = {},
): AppMountResolution {
  const environment =
    opts.environment ?? ((import.meta.env?.VITE_ENVIRONMENT as string) || 'prod')
  const hostname =
    opts.hostname ??
    (typeof window !== 'undefined' ? window.location.hostname : '')

  const isPreview = environment === 'preview'
  const override = isPreview ? app.preview_route_prefix : app.prod_route_prefix

  // prod_domains is a multi-host extension of prod_domain — a hostname match
  // on any entry triggers the same override mount.
  const domains: string[] = []
  const single = isPreview ? app.preview_domain : app.prod_domain
  if (single) domains.push(single)
  if (!isPreview && Array.isArray(app.prod_domains)) {
    domains.push(...app.prod_domains.filter((d): d is string => typeof d === 'string' && !!d))
  }

  if (!domains.length) {
    return { routable: true, route_prefix: app.route_prefix }
  }

  const matched = domains.some(domain => {
    let domainHost = domain
    try {
      domainHost = domain.includes('://') ? new URL(domain).hostname : domain.split(':')[0]
    } catch {
      // Malformed domain config — treat as non-matching rather than crash routing.
    }
    return hostname === domainHost
  })

  if (matched) {
    return { routable: true, route_prefix: override ?? app.route_prefix }
  }

  return override != null
    ? { routable: true, route_prefix: app.route_prefix }
    : { routable: false, route_prefix: app.route_prefix }
}
// CIL[END stable_id="~/.framework/src/lib/app-mount.ts:resolveappmount:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/app-mount.ts:resolvepostauthpath:function" type="function" identity="resolvePostAuthPath" parent="~/.framework/src/lib/app-mount.ts"]
// CIL[DOC-MACRO purpose="Resolve where to land a user after login/registration — the target app's effective mount, not the static config path"]
// CIL[DOC-CONTRACT inputs="preferredAppSlug (app chosen by config policy), fallback path" outputs="effective route_prefix to navigate to" errors="fetch/parse failures return fallback" side_effects="authenticated GET /api/apps?action=list"]
// CIL[DOC-MICRO logic_summary="Fetches the apps list, resolves each record's effective mount via resolveAppMount, returns the preferred app's prefix when routable else the first routable app's prefix else the fallback" notable_decisions="spine.config.json apps.<slug>.path and default_app_by_role are per-repo hints that are wrong for single-app prod sites — the DB row's resolved mount is authoritative"]
// CIL[DOC-STABILITY stability="experimental"]
export async function resolvePostAuthPath(
  preferredAppSlug?: string | null,
  fallback: string = '/',
): Promise<string> {
  try {
    const res = await apiFetch('/api/apps?action=list')
    if (!res.ok) return fallback
    const data = await res.json()
    const list: (AppMountFields & { slug: string; renderer?: string })[] = data.data || data || []
    const resolved = list
      .map(a => ({ a, m: resolveAppMount(a) }))
      .filter(r => r.m.routable && r.a.renderer !== 'none' && r.m.route_prefix != null)
    const chosen = resolved.find(r => r.a.slug === preferredAppSlug) ?? resolved[0]
    return chosen?.m.route_prefix ?? fallback
  } catch {
    return fallback
  }
}
// CIL[END stable_id="~/.framework/src/lib/app-mount.ts:resolvepostauthpath:function"]
