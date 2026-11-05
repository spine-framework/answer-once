// CIL[BEGIN stable_id="~/.framework/src/lib/branding.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/lib/branding.ts"]
// CIL[DOC-MACRO purpose="Instance branding resolved from spine.config.json — app name, logo, favicon, document title"]
// CIL[DOC-RESPONSIBILITY responsibility="Load the optional branding block from /spine.config.json once per session, merge it over Spine defaults, and apply favicon/title to the document"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/hooks/useBranding.ts,spine.config.json,.framework/index.html"]
// CIL[DOC-CONTRACT inputs="none" outputs="SpineBranding resolved object; applyBrandingToDocument performs DOM mutation" errors="fetch or parse failures fall back to DEFAULT_BRANDING" side_effects="HTTP GET /spine.config.json (single cached request); document.title and link[rel=icon] mutation"]
// CIL[DOC-MICRO logic_summary="Module-level cache plus single inflight fetch; resolveBranding fills missing keys with defaults; applyBrandingToDocument sets document.title and swaps the favicon link href" notable_decisions="Branding lives in instance-owned spine.config.json so framework upgrades can never overwrite app branding; index.html keeps the Spine default and the runtime swap handles app-branded instances"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework developers"]
// CIL[DOC-NOTE type="contract" content="branding is a top-level sibling of registration in spine.config.json. All keys optional; absent block yields DEFAULT_BRANDING so bare framework installs stay Spine-branded."]
// CIL[END stable_id="~/.framework/src/lib/branding.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/lib/branding.ts:spinebranding:interface" type="interface" identity="SpineBranding" parent="~/.framework/src/lib/branding.ts"]
// CIL[DOC-MACRO purpose="Resolved instance branding shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Type for the branding block after defaults are applied"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/branding.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SpineBranding object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="app_name drives headings and logo alt; title drives document.title and wordmark text; logo_url and favicon_url are public/ asset paths" notable_decisions="title falls back to app_name, then to 'Spine Framework' when no branding block exists"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
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
// CIL[END stable_id="~/.framework/src/lib/branding.ts:spinebranding:interface"]

// CIL[BEGIN stable_id="~/.framework/src/lib/branding.ts:default_branding:constant" type="constant" identity="DEFAULT_BRANDING" parent="~/.framework/src/lib/branding.ts"]
// CIL[DOC-MACRO purpose="Spine Framework default branding used when spine.config.json has no branding block"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the fallback brand so the framework is self-branded out of the box"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/branding.ts,.framework/index.html"]
// CIL[DOC-CONTRACT inputs="none" outputs="SpineBranding constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Matches the static values in .framework/index.html (title 'Spine Framework', favicon /spine-logo.svg)" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export const DEFAULT_BRANDING: SpineBranding = {
  slug: null,
  app_name: 'Spine',
  title: 'Spine Framework',
  logo_url: '/spine-logo.svg',
  favicon_url: '/spine-logo.svg',
  site_url: null,
}
// CIL[END stable_id="~/.framework/src/lib/branding.ts:default_branding:constant"]

let cached: SpineBranding | null = null
let inflight: Promise<SpineBranding> | null = null

// CIL[BEGIN stable_id="~/.framework/src/lib/branding.ts:resolvebranding:function" type="function" identity="resolveBranding" parent="~/.framework/src/lib/branding.ts"]
// CIL[DOC-MACRO purpose="Merge a raw branding block over defaults"]
// CIL[DOC-RESPONSIBILITY responsibility="Produce a complete SpineBranding from a possibly partial branding config value"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/branding.ts"]
// CIL[DOC-CONTRACT inputs="raw, brands, hostname — raw: unknown (config.branding); brands: SiteBrandsConfig|null (config.brands host-keyed brand map); hostname: string matched against brands.by_host" outputs="SpineBranding" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Brand definition resolved as by_host[hostname] ?? brands.default; its fields merge over flat branding which merges over defaults; title falls back to the resolved app_name" notable_decisions="non-string values treated as absent; unknown/absent brands config degrades to legacy flat-branding behavior"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
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
// CIL[END stable_id="~/.framework/src/lib/branding.ts:resolvebranding:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/branding.ts:loadbranding:function" type="function" identity="loadBranding" parent="~/.framework/src/lib/branding.ts"]
// CIL[DOC-MACRO purpose="Fetch and cache the instance branding from /spine.config.json"]
// CIL[DOC-RESPONSIBILITY responsibility="Perform a single fetch per session and memoize the resolved branding"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/branding.ts,.framework/src/hooks/useBranding.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Promise<SpineBranding>" errors="network/parse failures resolve to DEFAULT_BRANDING" side_effects="one HTTP GET /spine.config.json per session"]
// CIL[DOC-MICRO logic_summary="Returns cached value if present; otherwise shares one inflight promise across callers; any failure caches defaults so a missing config never retries per component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
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
// CIL[END stable_id="~/.framework/src/lib/branding.ts:loadbranding:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/branding.ts:getcachedbranding:function" type="function" identity="getCachedBranding" parent="~/.framework/src/lib/branding.ts"]
// CIL[DOC-MACRO purpose="Synchronous read of resolved branding, or defaults before the fetch lands"]
// CIL[DOC-RESPONSIBILITY responsibility="Give render paths a branding value without awaiting"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/branding.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SpineBranding" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="cached ?? DEFAULT_BRANDING" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function getCachedBranding(): SpineBranding {
  return cached ?? DEFAULT_BRANDING
}
// CIL[END stable_id="~/.framework/src/lib/branding.ts:getcachedbranding:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/branding.ts:applybrandingtodocument:function" type="function" identity="applyBrandingToDocument" parent="~/.framework/src/lib/branding.ts"]
// CIL[DOC-MACRO purpose="Apply resolved branding to document.title and the favicon link"]
// CIL[DOC-RESPONSIBILITY responsibility="Swap the framework-shipped favicon/title for instance branding at runtime"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/branding.ts,.framework/index.html"]
// CIL[DOC-CONTRACT inputs="branding: SpineBranding" outputs="void" errors="none" side_effects="sets document.title; rewrites or creates link[rel~=icon] in document.head"]
// CIL[DOC-MICRO logic_summary="Idempotent DOM mutation — safe to call on every branding state change from every consumer" notable_decisions="runtime swap keeps .framework/index.html a static framework-owned file that upgrades can replace freely"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
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
// CIL[END stable_id="~/.framework/src/lib/branding.ts:applybrandingtodocument:function"]
