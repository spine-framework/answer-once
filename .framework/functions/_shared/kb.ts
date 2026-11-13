
import { createHash } from 'crypto'
import { adminDb } from './db'
import { isSystemPrincipal, resolveAccessibleAccountIds } from './principal'
import type { CoreContext } from './middleware'
import { sanitizeRecordData } from './permissions'
import { callOpenAIEmbeddings } from './llm'
// admin-data is imported lazily — a static edge closes the cycle
// middleware → security → rate-limit → funnel → trigger-engine →
// pipeline-runner → kb → admin-data → middleware, leaving createHandler
// undefined during module evaluation.
const adminUpdate = async (ctx: any, body: any) =>
  (await import('../admin-data')).update(ctx, body)

const EMBEDDING_MODEL = 'text-embedding-3-small'
const DEFAULT_CHUNK_SIZE = 800
const DEFAULT_CHUNK_OVERLAP = 100
const SIMILARITY_THRESHOLD = 0.15
const DEFAULT_MATCH_COUNT = 10
// Security level is declared per KB type in seed design_schema (functionality.kb.security_level); undeclared types deny by default to 'internal' — no hardcoded slug map.
export function resolveSecurityLevel(designSchema: any): string {
  const declared = designSchema?.functionality?.kb?.security_level
  return typeof declared === 'string' && declared ? declared : 'internal'
}


/**
 * Generates an embedding for the provided text using an external API. This function is essential for transforming textual data into a numerical format suitable for machine learning tasks.
 *
 * @macro       Async function that retrieves embeddings from an external service.
 * @micro       Calls an external API to obtain the embedding for the given text.
 * @inputSpec
 *   text: string (required) — the input text to generate an embedding for.
 *   ctx: CoreContext (optional) — optional context for the API call.
 * @outputSpec  Promise<number[]> — an array of numbers representing the embedding, or an empty array if not found.
 * @sideEffects calls OpenAI API for embeddings
 * @stability   internal
 * @calls       callOpenAIEmbeddings
 * @cil-generated
 */
async function generateEmbedding(text: string, ctx?: CoreContext): Promise<number[]> {
  const json = await callOpenAIEmbeddings(ctx, [text], EMBEDDING_MODEL)
  return json.data?.[0]?.embedding || []
}


function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  if (!text) return []
  if (text.length <= chunkSize) return [text]

  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    chunks.push(chunk)
    start += chunkSize - overlap
    if (start >= end) break
  }
  return chunks
}


function getFieldValue(record: any, field: string): string {
  if (record[field] !== undefined && record[field] !== null) {
    const value = record[field]
    if (Array.isArray(value)) return value.join(' ')
    return String(value)
  }
  const data = record.data || {}
  if (data[field] !== undefined && data[field] !== null) {
    const value = data[field]
    if (Array.isArray(value)) return value.join(' ')
    return String(value)
  }
  return ''
}

const UUID_TOKEN_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi
const HTML_TAG_RE = /<[^>]*>/g
const HTML_LOOKS_LIKE_RE = /<\/?[a-z][^>]*>/i

function getEmbeddableFieldValue(record: any, field: string, designSchema: any): string {
  let text = getFieldValue(record, field)
  if (!text) return ''
  const dataType = designSchema?.fields?.[field]?.data_type
  if (dataType === 'rich_text' || HTML_LOOKS_LIKE_RE.test(text)) {
    text = text
      .replace(/<\/(p|div|h[1-6]|li|ul|ol|section|article|header|footer|blockquote|tr|table)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(HTML_TAG_RE, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;|&apos;/g, "'")
  }
  return text
    .replace(UUID_TOKEN_RE, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}


function getRawFieldValue(record: any, field: string): any {
  if (record[field] !== undefined && record[field] !== null) return record[field]
  const data = record.data || {}
  if (data[field] !== undefined && data[field] !== null) return data[field]
  return undefined
}


function matchesFilters(record: any, filters: Record<string, any>): boolean {
  if (!filters || Object.keys(filters).length === 0) return true

  for (const [field, expected] of Object.entries(filters)) {
    const raw = getRawFieldValue(record, field)
    const actual = Array.isArray(raw) ? raw : (raw !== undefined ? [raw] : [])
    const expectedArr = Array.isArray(expected) ? expected : (expected !== undefined ? [expected] : [])
    if (expectedArr.length === 0) continue

    const hasOverlap = expectedArr.some((ev: any) => actual.includes(ev))
    if (!hasOverlap) return false
  }

  return true
}


async function ensurePlatformAccountId(): Promise<string | null> {
  const { data, error } = await adminDb
    .from('accounts')
    .select('id')
    .eq('slug', 'spine-system')
    .maybeSingle()
  if (error) throw new Error(`platform_account_lookup_failed: ${error.message}`)
  return data?.id ?? null
}

// missing envelope = no access; envelope is the ceiling, per-agent retrieval_policy picks may only narrow it; retrieval (sources) and execution (actions) are independent gates — readable platform knowledge never implies executable actions
export interface KnowledgeEnvelope {
  /** Own-account corpus. true/object enables; object may carry
   *  scope ('self' | 'self_and_descendants') and item_types patterns
   *  (exact slug or 'prefix*'). Omitted/false = no account KB access. */
  account?: boolean | { scope?: 'self' | 'self_and_descendants'; item_types?: string[] }
  /** Platform (spine-system) corpus. sources = allowed item_type patterns
   *  for retrieval; actions = platform item_types whose structured actions
   *  may EXECUTE in this account (e.g. apply_directive) — separate gate,
   *  deny-by-default. Reading platform knowledge never implies action. */
  platform?: boolean | { sources?: string[]; actions?: string[] }
}

export interface KnowledgeScope {
  allowed: boolean
  deniedReason?: string
  /** All account ids permitted to appear in results (self + descendants + platform when granted). */
  accountIds: string[]
  /** Self (+ descendants under hierarchy scope). */
  selfAccountIds: string[]
  platformAccountId: string | null
  /** null = unrestricted within the corpus; [] = corpus disabled. */
  accountItemTypes: string[] | null
  platformItemTypes: string[] | null
  /** Platform item_types whose structured actions may execute in this
   *  account (envelope platform.actions). Not pick-intersected — this is an
   *  executor gate, not a search filter. [] = no platform actions allowed. */
  platformActionItemTypes: string[]
  /** Safe filter_item_types for match_embeddings, or null when a wildcard/unrestricted corpus exists. */
  rpcItemTypes: string[] | null
  /** Pick entries outside the envelope — callers must fail visibly, not clamp. */
  violations: string[]
  /** Set when the platform account lookup errored — callers may surface an error span while continuing with self scope. */
  platformLookupError?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function matchItemType(patterns: string[] | null | undefined, itemType: string | undefined | null): boolean {
  if (patterns == null) return true
  if (!itemType) return false
  return patterns.some((p) =>
    p === '*' ? true : p.endsWith('*') ? itemType.startsWith(p.slice(0, -1)) : p === itemType
  )
}

export function knowledgeRowAllowed(scope: KnowledgeScope, row: { account_id?: string | null; metadata?: any }): boolean {
  const meta = row.metadata || {}
  // The CIL corpus is retired — cil_chunk rows are never search-visible,
  // regardless of what an envelope or pick would otherwise grant.
  if (meta.item_type === 'cil_chunk') return false
  const isPlatformRow = !!scope.platformAccountId && row.account_id === scope.platformAccountId
  const isOwnRow = scope.selfAccountIds.includes(row.account_id || '')
  if (isPlatformRow && !isOwnRow) return matchItemType(scope.platformItemTypes, meta.item_type)
  if (isOwnRow || isPlatformRow) return matchItemType(scope.accountItemTypes, meta.item_type)
  return false
}

// deny-by-default; violations are surfaced for visible failure rather than silently clamped
export async function resolveKnowledgeScope(
  ctx: { accountId?: string | null; appId?: string | null; principal?: { id?: string } },
  appRef?: string | null,
  pick: { item_types?: string[]; project_ids?: string[] } = {}
): Promise<KnowledgeScope> {
  const denied = (reason: string): KnowledgeScope => ({
    allowed: false,
    deniedReason: reason,
    accountIds: [],
    selfAccountIds: [],
    platformAccountId: null,
    accountItemTypes: [],
    platformItemTypes: [],
    platformActionItemTypes: [],
    rpcItemTypes: null,
    violations: [],
  })

  const ref = appRef || ctx.appId || null
  if (!ref) return denied('no_app: cannot resolve the app for knowledge access')
  if (!ctx.accountId) return denied('no_account: no account context for knowledge access')

  let app: any = null
  try {
    const res = await adminDb
      .from('apps')
      .select('id, slug, config, required_roles')
      .eq(UUID_RE.test(ref) ? 'id' : 'slug', ref)
      .maybeSingle()
    app = res?.data
  } catch (e: any) {
    console.warn('resolveKnowledgeScope: apps lookup failed:', e?.message)
    return denied('envelope_lookup_failed: could not load app config')
  }
  if (!app) return denied(`unknown_app: '${ref}' is not an installed app`)

  // The caller's app claim (x-app-id header) is client-controllable, so bind
  // it: when the app declares required_roles, the principal must hold at least
  // one. Otherwise a low-privilege caller could claim a staff app's envelope.
  const requiredRoles: string[] = Array.isArray(app.required_roles) ? app.required_roles : []
  const principalRoles: string[] = Array.isArray(ctx.principal?.roles) ? ctx.principal!.roles! : []
  const norm = (r: string) => String(r).replace(/-/g, '_')
  // system_admin is the platform superuser — same bypass convention as
  // useApps/AppWrapper/get_account_apps; a god-mode principal must not be
  // blocked by an app's required_roles envelope binding.
  const isSystemAdmin = principalRoles.some((pr) => norm(pr) === 'system_admin')
  if (requiredRoles.length && principalRoles.length && !isSystemAdmin) {
    const ok = requiredRoles.some((rr) => principalRoles.some((pr) => norm(pr) === norm(rr)))
    if (!ok) return denied(`app_role_mismatch: principal lacks any required role for app '${app.slug}'`)
  }

  const envelope = (app.config as any)?.knowledge as KnowledgeEnvelope | undefined
  if (!envelope || typeof envelope !== 'object') {
    return denied(`no_knowledge_envelope: app '${app.slug}' declares no knowledge access`)
  }

  const accountEnabled = !!envelope.account
  const accountBlock = envelope.account === true ? {} : (envelope.account || {})
  const platformEnabled = !!envelope.platform
  const platformBlock = envelope.platform === true ? {} : (envelope.platform || {})

  // Account corpus: self, or self + descendants under hierarchy scope.
  let selfAccountIds: string[] = accountEnabled ? [ctx.accountId] : []
  if (accountEnabled && accountBlock.scope === 'self_and_descendants' && ctx.principal?.id) {
    try {
      const { data } = await adminDb.rpc('get_accessible_accounts', { actor_id: ctx.principal.id })
      const ids = (data || []).map((r: any) => r.account_id ?? r).filter(Boolean)
      if (ids.length) selfAccountIds = ids
    } catch (e: any) {
      console.warn('resolveKnowledgeScope: get_accessible_accounts failed, using self only:', e?.message)
    }
  }

  let platformAccountId: string | null = null
  let platformLookupError: string | undefined
  if (platformEnabled) {
    try {
      platformAccountId = await ensurePlatformAccountId()
    } catch (e: any) {
      platformLookupError = e?.message || String(e)
      console.warn('resolveKnowledgeScope: platform account lookup failed:', platformLookupError)
    }
  }

  // Envelope item types per corpus (null = unrestricted within that corpus).
  const envAccountTypes = accountEnabled ? (accountBlock.item_types ?? null) : []
  const envPlatformTypes = platformEnabled ? (platformBlock.sources ?? null) : []

  // Intersect the agent's pick with the envelope per corpus; record pick
  // entries that match nothing the app permits.
  const violations: string[] = []
  const pickTypes = pick.item_types?.length ? pick.item_types : null
  if (pickTypes) {
    for (const t of pickTypes) {
      const ok =
        matchItemType(envAccountTypes, t) ||
        matchItemType(envPlatformTypes, t)
      if (!ok) violations.push(t)
    }
  }
  const accountItemTypes = pickTypes ? pickTypes.filter((t) => matchItemType(envAccountTypes, t)) : envAccountTypes
  const platformItemTypes = pickTypes ? pickTypes.filter((t) => matchItemType(envPlatformTypes, t)) : envPlatformTypes
  // Execution allowlist for platform-authored structured actions (e.g.
  // directives). Not intersected with the agent pick — an executor that
  // needs it reads the full grant.
  const platformActionItemTypes = platformEnabled ? (platformBlock.actions ?? []) : []

  const accountIds = [
    ...(selfAccountIds),
    ...(platformAccountId && !selfAccountIds.includes(platformAccountId) ? [platformAccountId] : []),
  ]

  // Best-effort SQL-level item_type filter: only expressible when every
  // enabled corpus has an explicit, wildcard-free list.
  let rpcItemTypes: string[] | null
  if (violations.length || (!accountEnabled && !platformEnabled)) {
    rpcItemTypes = []
  } else {
    const parts: string[] = []
    let unrestricted = false
    if (accountEnabled) {
      if (accountItemTypes == null) unrestricted = true
      else parts.push(...accountItemTypes)
    }
    if (platformEnabled) {
      if (platformItemTypes == null) unrestricted = true
      else parts.push(...platformItemTypes)
    }
    const uniq = [...new Set(parts)]
    rpcItemTypes = unrestricted || uniq.some((t) => t.includes('*')) ? null : uniq
  }

  const allowed = accountIds.length > 0 &&
    (accountEnabled || platformEnabled)

  return {
    allowed,
    deniedReason: allowed
      ? (violations.length ? `pick_outside_envelope: ${violations.join(',')}` : undefined)
      : 'empty_scope: knowledge envelope permits no corpora',
    accountIds,
    selfAccountIds,
    platformAccountId,
    accountItemTypes,
    platformItemTypes,
    platformActionItemTypes,
    rpcItemTypes,
    violations,
    platformLookupError,
  }
}


async function clearEmbeddingsForItem(documentId: string): Promise<number> {
  const { data, error } = await adminDb.rpc('revoke_embeddings_for_item', { p_item_id: documentId })
  if (error) throw error

  const { error: deleteError } = await adminDb
    .from('embeddings')
    .delete()
    .eq('document_id', documentId)

  if (deleteError) throw deleteError
  return data || 0
}


// Revokes existing embeddings via clearEmbeddingsForItem (not kbRevoke — that would delete the caller's own lease); supersession is driven by functionality.kb.supersede_keys declared data fields instead of a hardcoded type-slug gate; a fenced release (token mismatch) warns without throwing — the work was written but ownership was lost to a superseding acquire.
// Lease outcomes: 'reused' returns a live-embeddings count so callers may stamp freshness; 'processing' returns in_progress:true with NO success marker — callers that stamp embedding state must not stamp success or failure for it, the owning worker's completion reconciles the corpus.
/**
 * The kbIngest function processes a knowledge base item by generating embeddings from its content and storing them in a database. It ensures the item is published before proceeding with embedding generation.
 *
 * @macro       Async function responsible for ingesting knowledge base items and generating embeddings.
 * @micro       Retrieves item details from the database, processes its content into chunks, and generates embeddings for each chunk.
 * @inputSpec
 *   - ctx: CoreContext (required) — the context containing account information.
 *   - body: { id: string } (required) — an object containing the ID of the knowledge base item.
 * @outputSpec  Promise<{ ok: boolean; message: string; count?: number; in_progress?: boolean }> — indicates success status, a message, and an optional count of embeddings generated; in_progress marks a lease 'processing' outcome another worker owns.
 * @throws      Error — id is required; Error — record not found; Error — error from database operations.
 * @sideEffects Writes embeddings to the database and may revoke previous embeddings; acquires and releases a document_leases row.
 * @stability   internal
 * @calls       adminDb.from('items'), adminDb.from('types'), adminDb.rpc('acquire_document_lease'), clearEmbeddingsForItem, callOpenAIEmbeddings, adminDb.from('embeddings').insert, adminDb.rpc('release_document_lease')
 * @cil-generated
 */
export async function kbIngest(ctx: CoreContext, body: { id: string; account_id?: string }): Promise<{ ok: boolean; message: string; count?: number; in_progress?: boolean }> {
  const { id } = body
  if (!id) throw new Error('id is required')

  // Multi-tenant support callers ingest articles owned by
  // customer accounts — the caller passes the record's account_id explicitly.
  // Default remains the caller's own account.
  const recordAccountId = isSystemPrincipal(ctx)
    ? (body.account_id || ctx.accountId)
    : ctx.accountId
  const { data: record, error } = await adminDb
    .from('items')
    .select('*')
    .eq('id', id)
    .eq('account_id', recordAccountId)
    .maybeSingle()

  if (error) throw error
  if (!record) throw new Error('record not found')

  const designSchema = record.design_schema || {}
  const kbConfig = designSchema.functionality?.kb || {}
  const publishStatus = kbConfig.publish_status || 'published'
  if (record.status !== publishStatus) {
    await kbRevoke(ctx, { id })
    return { ok: true, message: `record is not ${publishStatus}; embeddings revoked if any` }
  }
  const vectorFields = kbConfig.vector_fields || ['title', 'content']
  const chunkField = kbConfig.chunk_field || 'content'
  const chunkSize = kbConfig.chunk_size || DEFAULT_CHUNK_SIZE
  const chunkOverlap = kbConfig.chunk_overlap || DEFAULT_CHUNK_OVERLAP

  const { data: typeRecord, error: typeSlugError } = await adminDb
    .from('types')
    .select('slug, app_id')
    .eq('id', record.type_id)
    .single()
  if (typeSlugError) throw typeSlugError

  const typeSlug = typeRecord?.slug || ''
  const appId = record.app_id || typeRecord?.app_id || null
  // Apps declare the corpus security level on their type's
  // design_schema.functionality.kb.security_level; 'internal' is the
  // deny-by-default fallback when undeclared.
  const securityLevel = resolveSecurityLevel(designSchema)

  // Content-hash lease (document_leases, migration 054): sha256 over the
  // declared vector-field values in order — the same NORMALIZED text that
  // feeds the embedder (HTML stripped, bare UUIDs dropped). The lease
  // dedupes unchanged re-embeds and fences concurrent workers (publish
  // trigger + detached ingest both arrive here).
  const contentHash = createHash('sha256')
    .update(vectorFields.map((field: string) => getEmbeddableFieldValue(record, field, designSchema)).join('\n'))
    .digest('hex')

  const { data: lease, error: leaseError } = await adminDb.rpc('acquire_document_lease', {
    p_document_id: id,
    p_account_id: record.account_id,
    p_content_hash: contentHash,
  })
  if (leaseError) throw leaseError

  if (lease?.outcome === 'reused') {
    // Same-hash completed work exists — reuse it. Count live embeddings so
    // callers that stamp freshness get an honest count.
    const { count } = await adminDb
      .from('embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('document_id', id)
      .is('revoked_at', null)
    return { ok: true, message: 'embeddings reused (unchanged content)', count: count ?? 0 }
  }

  if (lease?.outcome === 'processing') {
    // A live worker owns this content's embed — nothing to do. The caller
    // must NOT stamp success; in_progress lets stampers keep their pending
    // marker instead of writing a false terminal state.
    return { ok: true, message: 'embedding already in progress', in_progress: true }
  }

  const leaseId: string | null = lease?.lease_id || null
  let succeeded = false
  try {
    // Clear prior embeddings WITHOUT deleting the lease row we just hold —
    // kbRevoke clears document_leases for external callers (so a revoked
    // doc re-ingests cleanly); routing through it here would release our
    // own lease mid-flight and reopen the race the lease exists to close.
    await clearEmbeddingsForItem(id)

    const toEmbed: Array<{ field: string; chunk: string }> = []
    for (const field of vectorFields) {
      const raw = getEmbeddableFieldValue(record, field, designSchema)
      if (!raw.trim()) continue

      const isChunked = field === chunkField && raw.length > chunkSize
      const chunks = isChunked ? chunkText(raw, chunkSize, chunkOverlap) : [raw]

      for (const chunk of chunks) {
        if (chunk.trim()) toEmbed.push({ field, chunk })
      }
    }

    // One batched embedding call per item — a sequential call per chunk makes
    // bulk reindex (N items × ~10 chunks) blow past the function timeout.
    const embedJson = await callOpenAIEmbeddings(ctx, toEmbed.map(t => t.chunk), EMBEDDING_MODEL)
    const vectors: number[][] = (embedJson.data || []).map((d: any) => d.embedding)

    const embeddingsToInsert: any[] = []
    for (let i = 0; i < toEmbed.length; i++) {
      const embedding = vectors[i]
      if (!embedding?.length) continue
      embeddingsToInsert.push({
        account_id: record.account_id,
        model_id: EMBEDDING_MODEL,
        document_id: id,
        chunk_index: i,
        content: toEmbed[i].chunk,
        embedding: JSON.stringify(embedding),
        metadata: {
          type_slug: typeSlug,
          item_type: typeSlug,
          app_id: appId,
          vector_type: toEmbed[i].field,
          security_level: securityLevel,
          status: record.status,
        },
        approved_at: new Date().toISOString(),
        revoked_at: null,
      })
    }

    if (embeddingsToInsert.length === 0) {
      succeeded = true
      return { ok: true, message: 'no content to embed', count: 0 }
    }

    const { error: insertError } = await adminDb.from('embeddings').insert(embeddingsToInsert)
    if (insertError) throw insertError

    // Supersession: a newly published document with the same logical
    // identity replaces older published versions. Types declare the data
    // fields that identify a logical document via
    // design_schema.functionality.kb.supersede_keys (e.g. ['slug'],
    // ['source_ticket_id']); undeclared types skip supersession entirely.
    const supersedeKeys: string[] = Array.isArray(kbConfig.supersede_keys) ? kbConfig.supersede_keys : []
    const orParts: string[] = []
    for (const key of supersedeKeys) {
      const value = record.data?.[key]
      if (value !== undefined && value !== null && value !== '') {
        orParts.push(`data->>${key}.eq.${value}`)
      }
    }
    if (orParts.length) {
      const { data: stale } = await adminDb
        .from('items')
        .select('id, status, data')
        .eq('account_id', record.account_id)
        .eq('type_id', record.type_id)
        .eq('status', 'published')
        .neq('id', id)
        .or(orParts.join(','))
      for (const old of stale || []) {
        await adminDb
          .from('items')
          .update({
            status: 'archived',
            data: { ...(old.data || {}), superseded_by: id, superseded_at: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          })
          .eq('id', old.id)
        await kbRevoke(ctx, { id: old.id }).catch((err) =>
          console.warn(`supersession revoke failed for ${old.id}:`, err?.message)
        )
      }
    }

    succeeded = true
    return { ok: true, message: 'embeddings generated', count: embeddingsToInsert.length }
  } finally {
    // Token-gated release. A false return means a superseding acquire took
    // ownership mid-flight (new content hash or expired lease) — the work
    // was already written but ownership was lost; warn, do not throw, and
    // let the next run reconcile.
    const { data: released, error: releaseError } = await adminDb.rpc('release_document_lease', {
      p_document_id: id,
      p_lease_id: leaseId,
      p_status: succeeded ? 'completed' : 'failed',
    })
    if (releaseError) {
      console.warn(`release_document_lease failed for ${id}:`, releaseError.message)
    } else if (released === false) {
      console.warn(`document lease fenced for ${id} — a superseding acquire took ownership before release`)
    }
  }
}


// Lease delete is unconditional — an in-flight ingest racing an external revoke is already racy at the status level.
/**
 * The kbRevoke function revokes embeddings associated with a specific item ID. It ensures that the item ID is provided and performs database operations to delete the embeddings.
 *
 * @inputSpec
 *   ctx: CoreContext (required) — the context object for core operations.
 *   body: { id: string } (required) — an object containing the ID of the item whose embeddings are to be revoked.
 * @outputSpec  Promise<{ ok: boolean; message: string; count?: number }> — returns an object indicating success, a message, and an optional count of revoked embeddings.
 * @throws      Error — id is required, Error — error from revoke_embeddings_for_item, Error — deleteError from embeddings deletion
 * @sideEffects DB writes to revoke embeddings, delete from the embeddings table, and delete the document_leases row.
 * @stability   internal
 * @calls       clearEmbeddingsForItem, adminDb.from('document_leases').delete()
 * @cil-generated
 */
export async function kbRevoke(ctx: CoreContext, body: { id: string }): Promise<{ ok: boolean; message: string; count?: number; skipped?: boolean }> {
  const { id } = body
  if (!id) throw new Error('id is required')

  // Execution-time fence: a revoke queued by an intermediate
  // item_updated event (e.g. auto_revoke_on_unpublish fired while a
  // publish pipeline was mid-flight) executes long after the trigger
  // condition was true. Re-check the document's CURRENT status — if it
  // is published now, its embeddings are fresh and must be kept.
  // Trigger-time evaluation is always stale by the time work runs.
  const { data: doc } = await adminDb
    .from('items')
    .select('status, data, account_id')
    .eq('id', id)
    .maybeSingle()
  const docStatus = doc?.status ?? doc?.data?.status
  if (doc && docStatus === 'published') {
    return { ok: true, skipped: true, message: 'document is published — embeddings retained', count: 0 }
  }

  // Revoke is a delete on the document's search surface — the caller must
  // be able to reach the owning account unless they're a system principal.
  if (!isSystemPrincipal(ctx) && doc?.account_id) {
    const ids = await resolveAccessibleAccountIds(ctx)
    if (!(ids || []).includes(doc.account_id)) {
      const e: any = new Error('Item belongs to a different account')
      e.statusCode = 403
      throw e
    }
  }

  const count = await clearEmbeddingsForItem(id)

  // Clear any stored lease — a 'completed' lease would otherwise force
  // 'reused' on the next ingest of this now-empty corpus. Warn-only: a
  // lease-delete failure must not fail revocation.
  const { error: leaseDeleteError } = await adminDb
    .from('document_leases')
    .delete()
    .eq('document_id', id)
  if (leaseDeleteError) {
    console.warn(`document_leases delete failed for ${id}:`, leaseDeleteError.message)
  }

  return { ok: true, message: 'embeddings revoked', count }
}


export async function kbReindex(ctx: CoreContext, body: { type_slug: string; app_id?: string }): Promise<{ ok: boolean; count: number; errors?: Array<{ id: string; error: string }> }> {
  // Re-embedding the whole corpus spends platform AI budget — system only.
  if (!isSystemPrincipal(ctx)) {
    const e: any = new Error('Insufficient permissions for corpus reindex')
    e.statusCode = 403
    throw e
  }
  const { type_slug } = body
  if (!type_slug) throw new Error('type_slug is required')

  const { data: typeRecord } = await adminDb
    .from('types')
    .select('id')
    .eq('slug', type_slug)
    .maybeSingle()

  if (!typeRecord) throw new Error(`type not found: ${type_slug}`)

  let query = adminDb.from('items').select('id').eq('type_id', typeRecord.id).eq('status', 'published')
  if (body.app_id) query = query.eq('app_id', body.app_id)

  const { data: records, error } = await query
  if (error) throw error

  // Bounded parallelism — sequential ingest of a full corpus exceeds the
  // function timeout, and one bad record should not abort the whole reindex.
  const BATCH = 10
  let count = 0
  const errors: Array<{ id: string; error: string }> = []
  for (let i = 0; i < (records || []).length; i += BATCH) {
    const batch = (records || []).slice(i, i + BATCH)
    const results = await Promise.allSettled(batch.map(r => kbIngest(ctx, { id: r.id })))
    for (let j = 0; j < results.length; j++) {
      const r = results[j]
      if (r.status === 'fulfilled') count++
      else errors.push({ id: batch[j].id, error: String(r.reason?.message || r.reason) })
    }
  }

  return { ok: errors.length === 0, count, errors }
}


export async function kbSearch(ctx: CoreContext, body: any): Promise<{ results: any[]; count: number; error?: string }> {
  const query = body.query
  const typeSlugs = body.type_slugs || []
  const sources = body.sources || ['kb']
  const appId = body.app_id || null
  const vectorFields = body.vector_fields || []
  const limit = body.limit || DEFAULT_MATCH_COUNT
  const offset = body.offset || 0
  const filters = body.filters || {}
  const threshold = typeof body.similarity_threshold === 'number' ? body.similarity_threshold : SIMILARITY_THRESHOLD

  if (!query) throw new Error('query is required')

  // App knowledge envelope is the ceiling; body.type_slugs is the caller's
  // pick within it. Deny-by-default: no envelope, no retrieval.
  const scope = await resolveKnowledgeScope(ctx, (ctx as any).appId || body.app_id, { item_types: typeSlugs })
  if (!scope.allowed) {
    return { results: [], count: 0, error: `knowledge_denied: ${scope.deniedReason}` }
  }
  if (scope.violations.length) {
    return { results: [], count: 0, error: `knowledge_denied: sources outside app envelope: ${scope.violations.join(', ')}` }
  }
  const accountIds = scope.accountIds

  const queryEmbedding = await generateEmbedding(query, ctx)
  if (!queryEmbedding.length) return { results: [], count: 0 }

  const allowedVectorTypes = new Set(vectorFields)
  const allowedTypeSlugs = new Set(typeSlugs)
  const includeKb = !sources.length || sources.includes('kb')
  const includeCode = !sources.length || sources.includes('code')

  const allMatches: any[] = []
  const vectorTypesToSearch = vectorFields.length ? vectorFields : [null]
  const matchCount = Math.max(offset + limit, 50)

  for (const vt of vectorTypesToSearch) {
    const { data: matches, error: rpcError } = await adminDb.rpc('match_embeddings', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      filter_account_ids: accountIds,
      filter_vector_type: vt,
      similarity_threshold: threshold,
      filter_item_types: scope.rpcItemTypes,
    })

    if (rpcError) throw new Error(`rpc_${rpcError.message}`)
    allMatches.push(...(matches || []))
  }

  const filtered = allMatches.filter((m: any) => {
    if (m.similarity < threshold) return false
    if (!knowledgeRowAllowed(scope, m)) return false
    const meta = m.metadata || {}
    const vectorType = meta.vector_type || ''
    const matchAppId = meta.app_id || null

    if (vectorFields.length && !allowedVectorTypes.has(vectorType)) return false

    if (appId && matchAppId !== appId) return false

    const isCode = meta.item_type === 'cil_chunk'
    if (isCode && !includeCode) return false
    if (!isCode && !includeKb) return false

    return true
  })

  const bestByDoc = new Map<string, any>()
  for (const m of filtered) {
    const existing = bestByDoc.get(m.document_id)
    if (!existing || m.similarity > existing.similarity) bestByDoc.set(m.document_id, m)
  }

  const documentIds = Array.from(bestByDoc.keys()).slice(offset, offset + limit)
  if (documentIds.length === 0) return { results: [], count: 0 }

  // document_id is a UUID for regular records but a CIL stable_id for
  // cil_chunk embeddings — feeding stable_ids to .in('id', ...) errors with
  // 'invalid input syntax for type uuid', so split the lookup like
  // retrieveKnowledge does.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const uuidIds = documentIds.filter((id) => UUID_RE.test(id))
  const stableIds = documentIds.filter((id) => !UUID_RE.test(id))
  const records: any[] = []
  if (uuidIds.length) {
    const { data, error } = await (ctx.db || adminDb)
      .from('items')
      .select('*, types!inner(slug)')
      .in('id', uuidIds)
      .in('account_id', accountIds)
    if (error) throw error
    records.push(...(data || []))
  }
  if (stableIds.length) {
    const { data, error } = await (ctx.db || adminDb)
      .from('items')
      .select('*, types!inner(slug)')
      .in('data->>stable_id', stableIds)
      .in('account_id', accountIds)
    if (error) throw error
    records.push(...(data || []))
  }

  const recordByDocId = new Map<string, any>()
  for (const r of records) {
    recordByDocId.set(r.id, r)
    if (r.data?.stable_id) recordByDocId.set(r.data.stable_id, r)
  }

  const results: any[] = []
  for (const match of documentIds.map((id) => bestByDoc.get(id))) {
    const record = recordByDocId.get(match.document_id)
    if (!record) continue
    if (record.status !== 'published') continue
    if (!matchesFilters(record, filters)) continue

    const sanitized = await sanitizeRecordData(ctx, record, 'items')
    if (!sanitized.data || Object.keys(sanitized.data).length === 0) continue
    const recordTypeSlug = (record as any).types?.slug || sanitized.type_slug || record.type_slug
    if (typeSlugs.length > 0 && !allowedTypeSlugs.has(recordTypeSlug || '')) continue

    const source = match.metadata?.item_type === 'cil_chunk' ? 'code' : 'kb'
    results.push({
      id: record.id,
      document_id: match.document_id,
      type_slug: recordTypeSlug,
      title: sanitized.title || record.title,
      snippet: match.content,
      app_id: record.app_id || match.metadata?.app_id || null,
      similarity: match.similarity,
      status: record.status,
      created_at: record.created_at,
      source,
      data: sanitized.data,
    })
  }

  return { results: results.sort((a, b) => b.similarity - a.similarity), count: results.length }
}


// Publish goes through admin-data rather than adminDb so field-level permissions and triggers apply
export async function kbPublish(ctx: CoreContext, body: { id: string }) {
  const { id } = body
  if (!id) throw new Error('id is required')
  const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id, method: 'PATCH' } }
  const record = await adminUpdate(updateCtx as any, { status: 'published' })
  const ingest = await kbIngest(ctx, { id })
  return { record, ingest }
}

