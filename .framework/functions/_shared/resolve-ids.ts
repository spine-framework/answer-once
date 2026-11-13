
import { adminDb } from './db'

// Design-time resolution caches. `types`/`accounts` rows change only on app
// install or schema edits — a 60s TTL bounds staleness the same way the
// principal and app-config caches do. Entries are keyed before any DB call so
// concurrent resolvers share one query (promise memoization).
const RESOLVE_CACHE_TTL_MS = 60_000
const RESOLVE_CACHE_MAX = 500

type CacheSlot<T> = { value: Promise<T>; expiresAt: number }

function makeResolveCache<T>() {
  const map = new Map<string, CacheSlot<T>>()
  return {
    get(key: string): Promise<T> | undefined {
      const slot = map.get(key)
      if (!slot) return undefined
      if (slot.expiresAt < Date.now()) { map.delete(key); return undefined }
      return slot.value
    },
    set(key: string, value: Promise<T>) {
      if (map.size >= RESOLVE_CACHE_MAX) {
        const oldest = map.keys().next().value
        if (oldest !== undefined) map.delete(oldest)
      }
      map.set(key, { value, expiresAt: Date.now() + RESOLVE_CACHE_TTL_MS })
      // Failed lookups must not be cached — a type installed mid-TTL would
      // otherwise stay invisible. Evict rejections immediately.
      value.catch(() => map.delete(key))
    },
  }
}

const typeIdCache = makeResolveCache<Record<string, string>>()
const typeRecordCache = makeResolveCache<TypeRecord>()
const accountIdCache = makeResolveCache<string>()

export async function resolveTypeIds(
  pairs: Array<{ kind: string; slug: string }>
): Promise<Record<string, string>> {
  if (pairs.length === 0) return {}

  // Batch-level memoization: an episode resolving the same pair set (e.g.
  // every save_message → createRecord → type lookup) shares one query.
  const cacheKey = pairs.map(p => `${p.kind}/${p.slug}`).sort().join('|')
  const hit = typeIdCache.get(cacheKey)
  if (hit) return hit
  const pending = resolveTypeIdsUncached(pairs)
  typeIdCache.set(cacheKey, pending)
  return pending
}

async function resolveTypeIdsUncached(
  pairs: Array<{ kind: string; slug: string }>
): Promise<Record<string, string>> {
  const { data, error } = await adminDb
    .from('types')
    .select('id, kind, slug')
    .in('slug', pairs.map(p => p.slug))
    .in('kind', [...new Set(pairs.map(p => p.kind))])

  if (error) throw new Error(`resolveTypeIds failed: ${error.message}`)

  const result: Record<string, string> = {}
  for (const row of data || []) {
    const key = `${row.kind}/${row.slug}`
    result[key] = row.id
  }

  for (const pair of pairs) {
    const key = `${pair.kind}/${pair.slug}`
    if (!result[key]) throw new Error(`Type not found: ${key}`)
  }

  return result
}

export async function resolveTypeId(kind: string, slug: string): Promise<string> {
  const ids = await resolveTypeIds([{ kind, slug }])
  return ids[`${kind}/${slug}`]
}

export interface TypeRecord {
  id: string
  slug: string
  kind: string
  design_schema: Record<string, any>
  validation_schema: Record<string, any>
  is_active: boolean
}

export async function resolveTypeRecord(kind: string, slug: string): Promise<TypeRecord> {
  const cacheKey = `${kind}/${slug}`
  const hit = typeRecordCache.get(cacheKey)
  if (hit) return hit
  const pending = resolveTypeRecordUncached(kind, slug)
  typeRecordCache.set(cacheKey, pending)
  return pending
}

async function resolveTypeRecordUncached(kind: string, slug: string): Promise<TypeRecord> {
  const { data, error } = await adminDb
    .from('types')
    .select('id, slug, kind, design_schema, validation_schema, is_active')
    .eq('kind', kind)
    .eq('slug', slug)
    .single()

  if (error || !data) throw new Error(`Type not found: ${kind}/${slug}`)
  if (!data.is_active) throw new Error(`Type is inactive: ${kind}/${slug}`)

  return {
    id: data.id,
    slug: data.slug,
    kind: data.kind,
    design_schema: data.design_schema || {},
    validation_schema: data.validation_schema || {},
    is_active: data.is_active,
  }
}

export async function resolveLinkTypeIds(slugs: string[]): Promise<Record<string, string>> {
  if (slugs.length === 0) return {}

  const { data, error } = await adminDb
    .from('link_types')
    .select('id, slug')
    .in('slug', slugs)

  if (error) throw new Error(`resolveLinkTypeIds failed: ${error.message}`)

  const result: Record<string, string> = {}
  for (const row of data || []) {
    result[row.slug] = row.id
  }

  for (const slug of slugs) {
    if (!result[slug]) throw new Error(`Link type not found: ${slug}`)
  }

  return result
}

export async function resolveLinkTypeId(slug: string): Promise<string> {
  const ids = await resolveLinkTypeIds([slug])
  return ids[slug]
}

export async function resolveAccountId(slug: string): Promise<string> {
  const hit = accountIdCache.get(slug)
  if (hit) return hit
  const pending = resolveAccountIdUncached(slug)
  accountIdCache.set(slug, pending)
  return pending
}

async function resolveAccountIdUncached(slug: string): Promise<string> {
  const { data, error } = await adminDb
    .from('accounts')
    .select('id')
    .eq('slug', slug)
    .single()

  if (error || !data) throw new Error(`Account not found: ${slug}`)
  return data.id
}

export async function resolveAgentId(name: string): Promise<string> {
  const { data, error } = await adminDb
    .from('ai_agents')
    .select('id')
    .eq('name', name)
    .eq('is_active', true)
    .single()

  if (error || !data) throw new Error(`AI agent not found: ${name}`)
  return data.id
}

export async function resolvePromptConfigId(slug: string): Promise<string> {
  const { data, error } = await adminDb
    .from('prompt_configs')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) throw new Error(`Prompt config not found: ${slug}`)
  return data.id
}
