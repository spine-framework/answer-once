// Branding lives in instance-owned spine.config.json so framework upgrades can never overwrite app branding; index.html keeps the Spine default and the runtime swap handles app-branded instances
// branding is a top-level sibling of registration in spine.config.json. All keys optional; absent block yields DEFAULT_BRANDING so bare framework installs stay Spine-branded.

export interface SiteBrandDefinition {
  name?: string
  app_name?: string
  title?: string
  site_url?: string
  logo_url?: string
  favicon_url?: string
  email_logo_url?: string
  email_from?: string
}

export interface SiteBrandsConfig {
  default?: string
  by_host?: Record<string, string>
  definitions?: Record<string, SiteBrandDefinition>
}

export interface SpineBranding {
  slug: string | null
  app_name: string
  title: string
  logo_url: string
  favicon_url: string
  site_url: string | null
}

export const DEFAULT_BRANDING: SpineBranding = {
  slug: null,
  app_name: 'Spine',
  title: 'Spine Framework',
  logo_url: '/spine-logo.svg',
  favicon_url: '/spine-logo.svg',
  site_url: null,
}

let cached: SpineBranding | null = null
let inflight: Promise<SpineBranding> | null = null

export function resolveBranding(
  raw: unknown,
  brands?: SiteBrandsConfig | null,
  hostname?: string,
): SpineBranding {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const defs = brands?.definitions ?? {}
  const slug = (hostname ? brands?.by_host?.[hostname] : undefined) ?? brands?.default ?? null
  const def = (slug && defs[slug]) || {}

  const defName =
    (typeof def.name === 'string' && def.name) ||
    (typeof def.app_name === 'string' && def.app_name) ||
    null
  const appName = defName ?? (typeof b.app_name === 'string' && b.app_name ? b.app_name : DEFAULT_BRANDING.app_name)
  const configuredTitle =
    (typeof def.title === 'string' && def.title ? def.title : null) ??
    (typeof b.title === 'string' && b.title ? b.title : null)
  return {
    slug,
    app_name: appName,
    title: configuredTitle ?? (defName || b.app_name ? appName : DEFAULT_BRANDING.title),
    logo_url:
      (typeof def.logo_url === 'string' && def.logo_url) ||
      (typeof b.logo_url === 'string' && b.logo_url) ||
      DEFAULT_BRANDING.logo_url,
    favicon_url:
      (typeof def.favicon_url === 'string' && def.favicon_url) ||
      (typeof b.favicon_url === 'string' && b.favicon_url) ||
      DEFAULT_BRANDING.favicon_url,
    site_url: (typeof def.site_url === 'string' && def.site_url) || null,
  }
}

export function loadBranding(): Promise<SpineBranding> {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = fetch('/spine.config.json')
      .then(res => (res.ok ? res.json() : null))
      .then(config => {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
        cached = resolveBranding(config?.branding, config?.brands, hostname)
        return cached
      })
      .catch(() => {
        cached = DEFAULT_BRANDING
        return cached
      })
  }
  return inflight
}

export function getCachedBranding(): SpineBranding {
  return cached ?? DEFAULT_BRANDING
}

export function applyBrandingToDocument(branding: SpineBranding): void {
  if (branding.title) document.title = branding.title
  if (!branding.favicon_url) return
  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = branding.favicon_url
}
