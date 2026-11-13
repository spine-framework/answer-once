
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
