// registry lives in integration config so brand changes need no deploy; account.brand is stamped once at registration because send paths carry no request host

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

// tolerates arbitrary input so a malformed env value can never crash the send path
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

export function brandForHost(cfg: SiteBrandsConfig, host: string | null | undefined): SiteBrand {
  const hostname = (host || '').split(':')[0].toLowerCase()
  const slug = (hostname && cfg.by_host?.[hostname]) || cfg.default || null
  return resolveBrand(cfg, slug)
}

// NULL brand is preserved as null rather than the default slug — the default lives in config, not the column
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
