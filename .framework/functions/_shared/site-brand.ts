// CIL[BEGIN stable_id="~/.framework/functions/_shared/site-brand.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/site-brand.ts"]
// CIL[DOC-MACRO purpose="Server-side site brand registry — resolve which brand an email or request belongs to"]
// CIL[DOC-RESPONSIBILITY responsibility="Parse the brands config (SITE_BRANDS env or integrations.config.brands) and resolve host→brand, account→brand, and account→brand-slug lookups for branded outbound mail"]
// CIL[DOC-CONTEXT module="functions" layer="shared" related_files=".framework/functions/_shared/pipeline-runner.ts,.framework/functions/invites.ts,.framework/functions/_shared/db.ts,.framework/migrations/077_multi_brand.sql"]
// CIL[DOC-CONTRACT inputs="hostnames, account ids, person rows" outputs="SiteBrand definitions (slug/name/site_url/email_from/logos) with configured-default fallback" errors="none — all lookups fall back to the configured default brand" side_effects="adminDb reads on integrations/accounts/people"]
// CIL[DOC-MICRO logic_summary="getBrandsConfig resolves the registry from SITE_BRANDS env JSON then the transactional-email integration config; resolveBrand overlays a definition over neutral defaults; NULL account.brand always means the configured default" notable_decisions="registry lives in integration config so brand changes need no deploy; account.brand is stamped once at registration because send paths carry no request host"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework developers"]

import { adminDb } from './db'

export interface SiteBrandDefinition {
  name?: string
  site_url?: string
  email_from?: string
  logo_url?: string
  email_logo_url?: string
}

export interface SiteBrandsConfig {
  default?: string
  by_host?: Record<string, string>
  definitions?: Record<string, SiteBrandDefinition>
}

export interface SiteBrand {
  slug: string
  name: string
  site_url: string | null
  email_from: string | null
  logo_url: string | null
  email_logo_url: string | null
}

// Neutral brand used when nothing is configured — keeps vanilla installs on
// today's single-identity behavior (EMAIL_FROM env remains the sender).
const NEUTRAL_BRAND: SiteBrand = {
  slug: 'default',
  name: 'Support',
  site_url: null,
  email_from: null,
  logo_url: null,
  email_logo_url: null,
}

// CIL[BEGIN stable_id="~/.framework/functions/_shared/site-brand.ts:parsebrandsconfig:function" type="function" identity="parseBrandsConfig" parent="~/.framework/functions/_shared/site-brand.ts"]
// CIL[DOC-MACRO purpose="Tolerantly normalize an unknown JSON value into SiteBrandsConfig"]
// CIL[DOC-CONTRACT inputs="raw: unknown (env JSON or integrations.config.brands)" outputs="SiteBrandsConfig" errors="none — non-object input yields empty config" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Picks default/by_host/definitions keys off a plain object, filtering non-string values" notable_decisions="tolerates arbitrary input so a malformed env value can never crash the send path"]
// CIL[DOC-STABILITY stability="experimental"]
export function parseBrandsConfig(raw: unknown): SiteBrandsConfig {
  const c = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>
  const out: SiteBrandsConfig = {}
  if (typeof c.default === 'string' && c.default) out.default = c.default
  if (c.by_host && typeof c.by_host === 'object') {
    out.by_host = Object.fromEntries(
      Object.entries(c.by_host).filter(([k, v]) => typeof k === 'string' && typeof v === 'string'),
    ) as Record<string, string>
  }
  if (c.definitions && typeof c.definitions === 'object') {
    out.definitions = c.definitions as Record<string, SiteBrandDefinition>
  }
  return out
}
// CIL[END stable_id="~/.framework/functions/_shared/site-brand.ts:parsebrandsconfig:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/site-brand.ts:getbrandsconfig:function" type="function" identity="getBrandsConfig" parent="~/.framework/functions/_shared/site-brand.ts"]
// CIL[DOC-MACRO purpose="Load the site brand registry — SITE_BRANDS env override, else transactional-email integration config"]
// CIL[DOC-CONTRACT inputs="none" outputs="SiteBrandsConfig" errors="env parse failures and DB errors resolve to empty config" side_effects="adminDb read on integrations"]
// CIL[DOC-MICRO logic_summary="SITE_BRANDS wins when present and non-empty so ops can override without a migration; otherwise the active transactional-email row's config.brands is the runtime source of truth" notable_decisions="integration-scoped config keeps brand data next to the sender templates that consume it"]
// CIL[DOC-STABILITY stability="experimental"]
export async function getBrandsConfig(integrationSlug = 'transactional-email'): Promise<SiteBrandsConfig> {
  const env = process.env.SITE_BRANDS
  if (env) {
    try {
      const parsed = parseBrandsConfig(JSON.parse(env))
      if (Object.keys(parsed.definitions ?? {}).length) return parsed
    } catch {
      // Malformed SITE_BRANDS — fall through to the integration config.
    }
  }
  try {
    const { data } = await adminDb
      .from('integrations')
      .select('config')
      .eq('slug', integrationSlug)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
    return parseBrandsConfig(data?.config?.brands)
  } catch {
    return {}
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/site-brand.ts:getbrandsconfig:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/site-brand.ts:resolvebrand:function" type="function" identity="resolveBrand" parent="~/.framework/functions/_shared/site-brand.ts"]
// CIL[DOC-MACRO purpose="Resolve a brand slug into a full SiteBrand with neutral defaults"]
// CIL[DOC-CONTRACT inputs="cfg, slug|null" outputs="SiteBrand" errors="none — missing slugs resolve to the configured default then NEUTRAL_BRAND" side_effects="none — pure"]
// CIL[DOC-MICRO logic_summary="Slug falls back to cfg.default; definition fields overlay neutral defaults so a partially defined brand still produces usable output" notable_decisions="neutral brand (name=Support) is the last-resort shape for single-brand instances with no config"]
// CIL[DOC-STABILITY stability="experimental"]
export function resolveBrand(cfg: SiteBrandsConfig, slug: string | null | undefined): SiteBrand {
  const key = slug ?? cfg.default ?? null
  const def = (key && cfg.definitions?.[key]) || {}
  if (!key) return NEUTRAL_BRAND
  return {
    slug: key,
    name: def.name ?? NEUTRAL_BRAND.name,
    site_url: def.site_url ?? null,
    email_from: def.email_from ?? null,
    logo_url: def.logo_url ?? null,
    email_logo_url: def.email_logo_url ?? null,
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/site-brand.ts:resolvebrand:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/site-brand.ts:brandforhost:function" type="function" identity="brandForHost" parent="~/.framework/functions/_shared/site-brand.ts"]
// CIL[DOC-MACRO purpose="Resolve the brand a request host belongs to"]
// CIL[DOC-CONTRACT inputs="cfg, host (may include port)" outputs="SiteBrand" errors="none — unknown hosts resolve to the configured default" side_effects="none — pure"]
// CIL[DOC-MICRO logic_summary="Lowercases and strips the port from the Host header before by_host lookup, then falls back to cfg.default" notable_decisions="port stripping keeps localhost:8888-style dev hosts resolving like their bare hostname"]
// CIL[DOC-STABILITY stability="experimental"]
export function brandForHost(cfg: SiteBrandsConfig, host: string | null | undefined): SiteBrand {
  const hostname = (host || '').split(':')[0].toLowerCase()
  const slug = (hostname && cfg.by_host?.[hostname]) || cfg.default || null
  return resolveBrand(cfg, slug)
}
// CIL[END stable_id="~/.framework/functions/_shared/site-brand.ts:brandforhost:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/site-brand.ts:accountbrandslugs:function" type="function" identity="accountBrandSlugs" parent="~/.framework/functions/_shared/site-brand.ts"]
// CIL[DOC-MACRO purpose="Batch-fetch accounts.brand for a set of account ids"]
// CIL[DOC-CONTRACT inputs="accountIds: string[] (account UUIDs to look up)" outputs="Map<accountId, brand|null>" errors="DB errors propagate" side_effects="adminDb read on accounts"]
// CIL[DOC-MICRO logic_summary="Single .in() query over accounts; ids with NULL brand come back mapped to null so callers can resolve the configured default" notable_decisions="NULL brand is preserved as null rather than the default slug — the default lives in config, not the column"]
// CIL[DOC-STABILITY stability="experimental"]
export async function accountBrandSlugs(
  accountIds: (string | null | undefined)[],
): Promise<Map<string, string | null>> {
  const ids = [...new Set(accountIds.filter((i): i is string => !!i))]
  const map = new Map<string, string | null>()
  if (!ids.length) return map
  const { data, error } = await adminDb
    .from('accounts')
    .select('id, brand')
    .in('id', ids)
  if (error) throw error
  for (const a of data || []) map.set(a.id, (a.brand as string) ?? null)
  return map
}
// CIL[END stable_id="~/.framework/functions/_shared/site-brand.ts:accountbrandslugs:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/site-brand.ts:brandforaccount:function" type="function" identity="brandForAccount" parent="~/.framework/functions/_shared/site-brand.ts"]
// CIL[DOC-MACRO purpose="Resolve the brand stamped on an account"]
// CIL[DOC-MICRO logic_summary="Reads accounts.brand for one id and resolves it through resolveBrand" notable_decisions="returns the configured default brand for NULL rows so pre-migration accounts behave as default"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-CONTRACT inputs="cfg, accountId" outputs="SiteBrand" errors="none — missing account/brand resolves to the configured default" side_effects="adminDb read on accounts"]
export async function brandForAccount(
  cfg: SiteBrandsConfig,
  accountId: string | null | undefined,
): Promise<SiteBrand> {
  let slug: string | null = null
  if (accountId) {
    try {
      const map = await accountBrandSlugs([accountId])
      slug = map.get(accountId) ?? null
    } catch {
      slug = null
    }
  }
  return resolveBrand(cfg, slug)
}
// CIL[END stable_id="~/.framework/functions/_shared/site-brand.ts:brandforaccount:function"]
// CIL[END stable_id="~/.framework/functions/_shared/site-brand.ts:module_header:module_header"]
