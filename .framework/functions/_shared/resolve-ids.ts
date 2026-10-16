// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Shared id resolution helpers for types, link types, accounts, agents and prompt configs."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide reusable functions that map slugs and (kind, slug) pairs to primary keys for Spine entities."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Module header for resolve-ids.ts; contains the import and no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Shared id resolution helpers for types, link types, accounts, agents and prompt configs.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveTypeIds:function" type="function" identity="resolveTypeIds" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Resolve many (kind, slug) pairs to their type primary keys."]
// CIL[DOC-RESPONSIBILITY responsibility="Query the types table in batches and validate that every requested pair has a matching row."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="pairs: Array<{ kind: string; slug: string }>" outputs="Record<string, string> mapping kind/slug to id" errors="Throws if any type is not found" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Builds slug and kind lists, queries types via adminDb, returns a record keyed by kind/slug, then verifies all requested pairs exist." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve many (kind, slug) pairs to their type primary keys.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveTypeIds:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveTypeId:function" type="function" identity="resolveTypeId" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Resolve a single (kind, slug) pair to its type primary key."]
// CIL[DOC-RESPONSIBILITY responsibility="Call resolveTypeIds for one pair and return the matching id."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="kind: string, slug: string" outputs="string id" errors="Throws if type not found" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Delegates to resolveTypeIds([{ kind, slug }]) and returns the single key." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function resolveTypeId(kind: string, slug: string): Promise<string> {
  const ids = await resolveTypeIds([{ kind, slug }])
  return ids[`${kind}/${slug}`]
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a single (kind, slug) pair to its type primary key.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveTypeId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:TypeRecord:interface" type="interface" identity="TypeRecord" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Describe the shape of a type record from the types table."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a TypeScript type for type rows including schemas and active status."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Defines id, slug, kind, design_schema, validation_schema and is_active fields." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface TypeRecord {
  id: string
  slug: string
  kind: string
  design_schema: Record<string, any>
  validation_schema: Record<string, any>
  is_active: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Describe the shape of a type record from the types table.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:TypeRecord:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveTypeRecord:function" type="function" identity="resolveTypeRecord" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Fetch a full type record by kind and slug."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a single TypeRecord after verifying it is active."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="kind: string, slug: string" outputs="TypeRecord" errors="Throws if type not found or inactive" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Queries types with .single() and returns an object with schema fallbacks." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a full type record by kind and slug.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveTypeRecord:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveLinkTypeIds:function" type="function" identity="resolveLinkTypeIds" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Resolve many link type slugs to their primary keys."]
// CIL[DOC-RESPONSIBILITY responsibility="Query the link_types table in a batch and confirm all slugs are resolved."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="slugs: string[]" outputs="Record<string, string> mapping slug to id" errors="Throws if any link type is not found" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Queries link_types by slug list, builds a record, and validates every input slug is present." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve many link type slugs to their primary keys.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveLinkTypeIds:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveLinkTypeId:function" type="function" identity="resolveLinkTypeId" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Resolve a single link type slug to its primary key."]
// CIL[DOC-RESPONSIBILITY responsibility="Call resolveLinkTypeIds for one slug and return the id."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="slug: string" outputs="string id" errors="Throws if link type not found" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Delegates to resolveLinkTypeIds([slug]) and returns ids[slug]." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function resolveLinkTypeId(slug: string): Promise<string> {
  const ids = await resolveLinkTypeIds([slug])
  return ids[slug]
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a single link type slug to its primary key.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveLinkTypeId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveAccountId:function" type="function" identity="resolveAccountId" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Resolve an account slug to its primary key."]
// CIL[DOC-RESPONSIBILITY responsibility="Query accounts table by slug and return the id."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="slug: string" outputs="string id" errors="Throws if account not found" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Queries accounts selecting id, applies .single(), and throws on missing data." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve an account slug to its primary key.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveAccountId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveAgentId:function" type="function" identity="resolveAgentId" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Resolve an active AI agent name to its primary key."]
// CIL[DOC-RESPONSIBILITY responsibility="Query ai_agents table by name and active status and return the id."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="name: string" outputs="string id" errors="Throws if active AI agent not found" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Queries ai_agents selecting id, filters is_active true, and throws on missing data." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve an active AI agent name to its primary key.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolveAgentId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolvePromptConfigId:function" type="function" identity="resolvePromptConfigId" parent="~/.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-MACRO purpose="Resolve an active prompt config slug to its primary key."]
// CIL[DOC-RESPONSIBILITY responsibility="Query prompt_configs table by slug and active status and return the id."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="slug: string" outputs="string id" errors="Throws if active prompt config not found" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Queries prompt_configs selecting id with active filter and single, throws on missing." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve an active prompt config slug to its primary key.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-ids.ts:resolvePromptConfigId:function"]
