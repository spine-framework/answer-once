// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/embeddings.ts"]
/**
 * Creates a new embedding record for a knowledge base item and persists it to the database. This function also handles ownership and audit logging for the embedding.
 *
 * @throws      Error — if required fields are missing, user/account context is invalid, or database insert fails.
 * @sideEffects Inserts one row into the embeddings table and emits an audit log.
 * @stability   stable
 * @calls       ctx.db.from, emitLog
 * @cil-generated
 */
export const create = createHandler(async (ctx, body) => {
  const { model_id, document_id, chunk_index, content, metadata } = body
  if (!model_id || !document_id || !content) {
    throw new Error('model_id, document_id, and content are required')
  }
  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }
  const { data, error: err } = await ctx.db
    .from('embeddings')
    .insert({
      model_id,
      document_id,
      chunk_index: chunk_index || 0,
      content,
      metadata: metadata || {},
      account_id: ctx.accountId
    })
    .select()
    .single()
  if (err) throw err
  await emitLog(ctx, 'embedding.created', 
    { type: 'embedding', id: data.id }, 
    { after: { document_id, model_id } }
  )
  return data
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/embeddings.ts"]
/**
 * Updates an existing embedding's content and metadata, applying partial updates to an embedding record. It also emits an audit log for tracking changes.
 *
 * @throws      Error — if no id is provided or the database update fails.
 * @sideEffects Updates the embeddings row in the database and emits an audit log.
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), emitLog
 * @cil-generated
 */
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, content, metadata } = body || {}
  if (!id) {
    throw new Error('Embedding ID is required')
  }
  const updateFields: Record<string, any> = {}
  if (content !== undefined) updateFields.content = content
  if (metadata !== undefined) updateFields.metadata = metadata
  let query = ctx.db
    .from('embeddings')
    .update(updateFields)
    .eq('id', id)
  if (!isSystemPrincipal(ctx)) {
    if (!ctx.accountId) throw new Error('Account context required')
    query = query.eq('account_id', ctx.accountId)
  }
  const { data, error: err } = await query.select().single()
  if (err) throw err
  await emitLog(ctx, 'embedding.updated', 
    { type: 'embedding', id }, 
    { after: { content_updated: !!content } }
  )
  return data
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:update:constant"]
/**
 * VECTOR_TYPE_SLOTS defines a mapping of vector types to their corresponding fixed slots, ensuring consistency with the CIL pipeline's conventions. This structure is essential for managing unique identifiers for each vector type based on model and document IDs.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// chunk_index is unique per (model_id, document_id) — each vector type
// occupies a fixed slot (matching the CIL pipeline's convention).
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:VECTOR_TYPE_SLOTS:constant" type="constant" identity="VECTOR_TYPE_SLOTS" parent="~/.framework/functions/embeddings.ts"]
const VECTOR_TYPE_SLOTS: Record<string, number> = {
  semantic: 0, structure: 1, context: 2, blast_radius: 3,
  configuration: 4, constraint: 5, summary: 6, intent: 7,
  cause: 8, procedure: 9, outcome: 10, error_signal: 11,
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:VECTOR_TYPE_SLOTS:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:generate:constant" type="constant" identity="generate" parent="~/.framework/functions/embeddings.ts"]
/**
 * Generates or refreshes vector embeddings for a knowledge base item. This function builds text content for configured vector types, calls an embedding API, and persists vectors with hashes.
 *
 * @throws      Error — if item_id missing, item not found, or embedding API fails
 * @sideEffects reads and writes embeddings rows, calls external OpenAI embedding API, emits an audit log
 * @stability   stable
 * @calls       adminDb.from('items'), adminDb.select, adminDb.eq, adminDb.single
 * @cil-generated
 */
export const generate = createHandler(async (ctx, body) => {
  const { item_id, force_regenerate = false, account_id_override } = body || {}
  if (!item_id) throw new Error('item_id is required')
  const isSystem = isSystemPrincipal(ctx)
  if (!isSystem && !ctx.accountId) {
    throw new Error('Account context required')
  }
  const { data: item, error: itemErr } = await adminDb
    .from('items')
    .select('*, type:types(slug, design_schema)')
    .eq('id', item_id)
    .single()
  if (itemErr || !item) throw new Error(`Item ${item_id} not found`)
  // The adminDb read above bypasses RLS — a scoped caller may only generate
  // vectors for items inside its own account.
  if (!isSystem && item.account_id && item.account_id !== ctx.accountId) {
    const e: any = new Error('Insufficient permissions to generate embeddings for this item')
    e.statusCode = 403
    throw e
  }
  const typeDesign = item.type?.design_schema || {}
  const typeSlug = item.type?.slug || ''
  // Match the kbIngest convention (metadata.item_type = type slug) so retrieval
  // item_type filters behave the same regardless of which pipeline wrote the row.
  const itemType = typeSlug.startsWith('kb') ? typeSlug : (item.data?.kb_type ? 'kb_article' : 'item')
  const kbType = item.data?.kb_type || 'article'
  let vectorTypes: string[] = []
  const rawVT = typeDesign.vector_types
  if (Array.isArray(rawVT)) {
    vectorTypes = rawVT
  } else if (rawVT && typeof rawVT === 'object') {
    vectorTypes = rawVT[kbType] || rawVT['default'] || ['semantic', 'structure']
  } else {
    vectorTypes = ['semantic', 'structure']
  }
  const embeddingFields: string[] = typeDesign.embedding_fields?.structure || []
  // account_id_override is a cross-account write primitive — honor it only
  // for system-level callers. Scoped principals always write vectors under
  // their own account.
  const resolvedAccountId = isSystem
    ? (account_id_override || item.account_id || await getPlatformAccountId())
    : ctx.accountId
  const isPublished = item.status === 'published'
  const { data: existing } = await adminDb
    .from('embeddings')
    .select('id, content_hash, chunk_index, metadata')
    .eq('document_id', item_id)
  const existingMap = new Map<string, any>()
  for (const row of existing || []) {
    const vt = row.metadata?.vector_type || ''
    const ci = row.chunk_index ?? 0
    existingMap.set(`${vt}:${ci}`, row)
  }
  if (force_regenerate) {
    await adminDb.from('embeddings').delete().eq('document_id', item_id)
    existingMap.clear()
  }
  const created: string[] = []
  const skipped: string[] = []
  const errors: string[] = []
  const syncVectors = vectorTypes.filter(vt => vt !== 'summary')
  const contents: Array<{ vt: string; text: string; chunkIndex: number }> = []
  // chunk_index must be unique per (model_id, document_id) — assign each
  // vector type a fixed slot (same convention as the CIL pipeline) so rows
  // for different vector types never collide on the UNIQUE constraint.
  for (const vt of syncVectors) {
    const builder = CONTENT_BUILDERS[vt]
    if (!builder) { errors.push(`Unknown vector type: ${vt}`); continue }
    const text = builder(item, { embedding_fields: embeddingFields })
    if (!text) { skipped.push(`${vt}:empty`); continue }
    contents.push({ vt, text, chunkIndex: VECTOR_TYPE_SLOTS[vt] ?? (20 + syncVectors.indexOf(vt)) })
  }
  // Drop rows left over from a previously larger vector-type set.
  const keep = new Set(contents.map(c => `${c.vt}:${c.chunkIndex}`))
  const staleIds = (existing || [])
    .filter(r => !keep.has(`${r.metadata?.vector_type || ''}:${r.chunk_index ?? 0}`))
    .map(r => r.id)
  if (staleIds.length) {
    await adminDb.from('embeddings').delete().in('id', staleIds)
  }
  if (vectorTypes.includes('summary')) {
    const summaryText = await generateAiSummary(item, ctx)
    if (summaryText) contents.push({ vt: 'summary', text: summaryText, chunkIndex: 0 })
  }
  const toEmbed = contents.filter(({ vt, text, chunkIndex }) => {
    const hash = contentHash(text)
    const key = `${vt}:${chunkIndex}`
    const row = existingMap.get(key)
    if (row && row.content_hash === hash) { skipped.push(key); return false }
    return true
  })
  if (!toEmbed.length) {
    return { item_id, embeddings_created: 0, embeddings_skipped: skipped.length, errors }
  }
  let vectors: string[] = []
  try {
    vectors = await callEmbeddingApi(toEmbed.map(c => c.text), ctx)
  } catch (e: any) {
    throw new Error(`Embedding API call failed: ${e.message}`)
  }
  const now = new Date().toISOString()
  for (let i = 0; i < toEmbed.length; i++) {
    const { vt, text, chunkIndex } = toEmbed[i]
    const hash = contentHash(text)
    const key = `${vt}:${chunkIndex}`
    const existingRow = existingMap.get(key)
    const row = {
      account_id:   resolvedAccountId,
      model_id:     'text-embedding-3-small',
      document_id:  item_id,
      chunk_index:  chunkIndex,
      content:      text,
      embedding:    vectors[i],
      content_hash: hash,
      approved_at:  isPublished ? now : null,
      revoked_at:   null,
      metadata: {
        vector_type:    vt,
        item_type:      itemType,
        kb_type:        kbType,
        security_level: item.data?.security_level || 'internal',
        source_item_id: item_id,
      },
    }
    if (existingRow) {
      await adminDb.from('embeddings').update(row).eq('id', existingRow.id)
    } else {
      await adminDb.from('embeddings').insert(row)
    }
    created.push(key)
  }
  await emitLog(ctx, 'embeddings.generated',
    { type: 'item', id: item_id },
    { after: { vectors_created: created.length, vectors_skipped: skipped.length, is_published: isPublished } }
  )
  return {
    item_id,
    embeddings_created: created.length,
    embeddings_skipped: skipped.length,
    errors,
  }
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:generate:constant"]
/**
 * @module   embeddings
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module imports shared utilities for the embeddings Netlify function, setting up the necessary dependencies for handling embedding requests. It plays a crucial role in the system by providing essential functions for authentication, database access, and logging. INVARIANT: No verified external callers; all interactions are local and managed through the defined imports.
 *
 * @seeAlso .framework/functions/_shared/middleware.ts (provides middleware for request handling).
 * @seeAlso .framework/functions/_shared/db.ts (handles database interactions).
 * @seeAlso .framework/functions/_shared/audit.ts (manages logging and auditing).
 *
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Creates a new embedding record for a knowledge base item."]
// CIL[DOC-RESPONSIBILITY responsibility="Persists an embedding to the embeddings table with ownership and audit logging."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { model_id, document_id, chunk_index, content, metadata }" outputs="the inserted embedding record" errors="throws if required fields missing, user/account context invalid, or database insert fails" side_effects="inserts one row into embeddings table and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Validates required fields and account context, inserts the embedding row into the database, and emits an embedding.created audit log." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

















 




// CIL[DOC-MACRO purpose="create constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the create constant."]
// CIL[DOC-CONTEXT module=".framework/functions/embeddings.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the create constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]






// CIL[DOC-VECTOR type="context" content="purpose='Creates a new embedding record for a knowledge base item.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]




// CIL[DOC-MACRO purpose="Updates an existing embedding's content and metadata."]
// CIL[DOC-RESPONSIBILITY responsibility="Applies partial updates to an embedding record and emits an audit log."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { id?, content?, metadata? }" outputs="the updated embedding record" errors="throws if no id is provided or the database update fails" side_effects="updates embeddings row and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Resolves the embedding ID from the request, builds an update object, patches the database row, and emits an embedding.updated log." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]






// CIL[DOC-VECTOR type="context" content="purpose='Updates an existing embedding's content and metadata.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]




























// CIL[DOC-MACRO purpose="VECTOR_TYPE_SLOTS defines a mapping of vector types to their corresponding fixed slots, ensuring consistency with the CIL pipeline's conventions."]
// CIL[DOC-RESPONSIBILITY responsibility="VECTOR_TYPE_SLOTS defines a mapping of vector types to their corresponding fixed slots, ensuring consistency with the CIL pipeline's conventions. This structure is essential for managing unique identifiers for each vector type based on model and document IDs."]
// CIL[DOC-CONTEXT module="embeddings" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/principal,.framework/functions/_shared/permissions,.framework/functions/_shared/llm"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="VECTOR_TYPE_SLOTS defines a mapping of vector types to their corresponding fixed slots, ensuring consistency with the CIL pipeline's conventions. This structure is essential for managing unique identifiers for each vector type based on model and document IDs." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-MACRO purpose="VECTOR_TYPE_SLOTS constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the VECTOR_TYPE_SLOTS constant."]
// CIL[DOC-CONTEXT module=".framework/functions/embeddings.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the VECTOR_TYPE_SLOTS constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='VECTOR_TYPE_SLOTS defines a mapping of vector types to their corresponding fixed slots, ensuring consistency with the CIL pipeline's conventions.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Generates or refreshes vector embeddings for a knowledge base item."]
// CIL[DOC-RESPONSIBILITY responsibility="Builds text content for configured vector types, calls an embedding API, and persists vectors with hashes."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { item_id, force_regenerate?, account_id_override? }" outputs="{ item_id, embeddings_created, embeddings_skipped, errors }" errors="throws if item_id missing, item not found, or embedding API fails" side_effects="reads and writes embeddings rows, calls external OpenAI embedding API, emits an audit log"]
// CIL[DOC-MICRO logic_summary="Fetches the item and its type slug+design schema, determines vector types, builds content for each at a per-type chunk_index slot, removes stale rows, compares hashes, calls the embedding API for missing or changed vectors, inserts or updates embeddings rows, and emits an embeddings.generated log." notable_decisions="Hashes and skips unchanged vectors; uses text-embedding-3-small by default; falls back vector types to semantic/structure; summary vectors generated via AI if configured; item_type follows the kbIngest convention (type slug for kb-* items)."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

  



  


  


  


  



  

  


  


  




// CIL[DOC-VECTOR type="context" content="purpose='Generates or refreshes vector embeddings for a knowledge base item.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]













  // CIL[DOC-AUDIENCE audience="developers"]
  // CIL[DOC-STABILITY stability="stable"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
  // CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts"]

// CIL[DOC-MACRO purpose="Imports shared utilities for the embeddings Netlify function."]
// CIL[DOC-RESPONSIBILITY responsibility="Sets up the module's dependencies and shared functions."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports crypto, middleware, admin db, audit, principal, permissions, and LLM helpers used by the embedding handlers." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers, operators"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/embeddings.ts"]
import { createHash } from 'crypto'
import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin, isSystemPrincipal } from './_shared/principal'
import { sanitizeRecordData } from './_shared/permissions'
import { callOpenAIEmbeddings, callOpenAIChat } from './_shared/llm'
// CIL[END stable_id="~/.framework/functions/embeddings.ts:module_header:module_header"]

// True only for platform-level principals: a system_admin role or an
// internal machine principal with no account binding (SYSTEM_PRINCIPAL,
// produced only by the INTERNAL_INVOKE_SECRET path). Machine principals
// resolve to the service-role adminDb via getPrincipalDb, so account-bound
// API keys must be scoped to their own account below.
// CIL[DOC-VECTOR type="context" content="purpose='Imports shared utilities for the embeddings Netlify function.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Strips HTML tags and decodes common HTML entities to normalize HTML content into plain text for embedding. This function is essential for preparing text data by removing formatting and special characters.
 *
 * @inputSpec
 *   html: string (required) — the HTML content to be processed.
 * @outputSpec  string — plain text string without HTML tags.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Strips HTML tags and decodes common HTML entities."]
// CIL[DOC-RESPONSIBILITY responsibility="Normalizes HTML content into plain text for embedding."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="html: string" outputs="plain text string" errors="none" side_effects="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Replaces tags, decodes entities, collapses whitespace, and trims the string." notable_decisions="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:stripHtml:function" type="function" identity="stripHtml" parent="~/.framework/functions/embeddings.ts"]
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:stripHtml:function"]

// CIL[DOC-VECTOR type="context" content="purpose='Strips HTML tags and decodes common HTML entities.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Returns the first non-empty string from a list of values. This function is useful for extracting meaningful input from potentially undefined or null values.
 *
 * @inputSpec
 *   - values: (string | undefined | null)[] (required) — a list of strings that may include undefined or null values.
 * @outputSpec  string — the first non-empty string or an empty string if none are found.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Returns the first non-empty string from a list of values."]
// CIL[DOC-RESPONSIBILITY responsibility="Selects the first truthy, trimmed string from candidates."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="...values: (string | undefined | null)[]" outputs="first non-empty string or empty string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Iterates over arguments and returns the first value that is non-empty after trimming, or an empty string." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:firstNonEmpty:function" type="function" identity="firstNonEmpty" parent="~/.framework/functions/embeddings.ts"]
function firstNonEmpty(...values: (string | undefined | null)[]): string {
  for (const v of values) {
    if (v && String(v).trim()) return String(v).trim()
  }
  return ''
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:firstNonEmpty:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Returns the first non-empty string from a list of values.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Builds the semantic text content for an item embedding by concatenating the item title, description blurb, and data-level body for vector search. This function ensures that the content is formatted correctly for retrieval purposes.
 *
 * @inputSpec
 *   item: any — the item containing title, description, and data content.
 * @outputSpec  string — the concatenated semantic content.
 * @sideEffects none
 * @stability   stable
 * @calls       stripHtml
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Builds the semantic text content for an item embedding."]
// CIL[DOC-LEARNING topic="retrieval" content="KB articles store their body in data.content (data.body/markdown for other kinds) while description is only a short blurb — embedding title+description alone produced useless vectors."]
// CIL[DOC-RESPONSIBILITY responsibility="Concatenates the item title, description blurb, and data-level body for vector search."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Strips HTML from description and data.content/body/markdown, then joins title, blurb, and body with newlines, filtering empty parts." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildSemanticContent:function" type="function" identity="buildSemanticContent" parent="~/.framework/functions/embeddings.ts"]
function buildSemanticContent(item: any): string {
  const title = item.title || ''
  const blurb = stripHtml(item.description || '')
  const body = stripHtml(
    item.data?.content || item.data?.body || item.data?.markdown || ''
  )
  return [title, blurb, body].filter(Boolean).join('\n')
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildSemanticContent:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Builds the semantic text content for an item embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Builds a structured JSON representation of an item for vector indexing. It serializes item fields, metadata, and configured embedding fields into JSON.
 *
 * @inputSpec
 *   - item: any (required) — the item to be serialized.
 *   - embeddingFields: string[] (optional) — an array of field names to include in the serialization.
 * @outputSpec  string — a JSON string representation of the structured item.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Builds a structured JSON representation of an item for vector indexing."]
// CIL[DOC-RESPONSIBILITY responsibility="Serializes item fields, metadata, and configured embedding fields into JSON."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any, embeddingFields?: string[]" outputs="JSON string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Collects title, status, kb fields, and any configured embedding fields into an object and serializes it to JSON." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildStructureContent:function" type="function" identity="buildStructureContent" parent="~/.framework/functions/embeddings.ts"]
function buildStructureContent(item: any, embeddingFields: string[] = []): string {
  const base: Record<string, any> = {
    title: item.title || '',
    status: item.status || '',
    kb_type: item.data?.kb_type || '',
    category: item.data?.category || '',
    tags: item.data?.tags || [],
    audience: item.data?.audience || [],
    security_level: item.data?.security_level || '',
    product_area: item.data?.product_area || '',
  }
  for (const f of embeddingFields) {
    if (item.data?.[f] !== undefined) base[f] = item.data[f]
  }
  return JSON.stringify(base)
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildStructureContent:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Builds a structured JSON representation of an item for vector indexing.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Extracts the intent text for an item embedding by selecting the first available intent field from the provided item data. This function is essential for retrieving meaningful intent information from various potential sources within the item structure.
 *
 * @inputSpec
 *   item: any (required) — the item object containing data fields for intent extraction.
 * @outputSpec  string — the extracted intent text or an empty string if none are found.
 * @sideEffects none
 * @stability   internal
 * @calls       firstNonEmpty
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Extracts the intent text for an item embedding."]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Picks the first available intent field from item data."]
// CIL[DOC-CONTRACT inputs="item: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns the first non-empty value among intent, learning_objectives, ca_reported_issue, use_case." notable_decisions="none"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildIntentContent:function" type="function" identity="buildIntentContent" parent="~/.framework/functions/embeddings.ts"]
function buildIntentContent(item: any): string {
  return firstNonEmpty(
    item.data?.intent,
    item.data?.learning_objectives,
    item.data?.ca_reported_issue,
    item.data?.use_case,
  )
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildIntentContent:function"]

/**
 * Extracts the intent text for an item embedding by retrieving the first non-empty cause-related field from the item data. This function is designed to facilitate the processing of item embeddings in the context of the application.
 *
 * @inputSpec
 *   - item: any (required) — the item data containing potential cause-related fields.
 * @outputSpec  string — the first non-empty cause-related field value.
 * @sideEffects none
 * @stability   stable
 * @calls       firstNonEmpty
 * @cil-generated
 */
// CIL[DOC-VECTOR type="context" content="purpose='Extracts the intent text for an item embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Extracts the cause text for an item embedding."]
// CIL[DOC-RESPONSIBILITY responsibility="Picks the first available cause or root-cause field from item data."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns the first non-empty value among cause, ca_true_problem, concept, root_cause." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildCauseContent:function" type="function" identity="buildCauseContent" parent="~/.framework/functions/embeddings.ts"]
function buildCauseContent(item: any): string {
  return firstNonEmpty(
    item.data?.cause,
    item.data?.ca_true_problem,
    item.data?.concept,
    item.data?.root_cause,
  )
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildCauseContent:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Extracts the cause text for an item embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Extracts the procedure text for an item embedding by selecting the first available procedure or resolution text from item data. This function is designed to format the procedure steps into a numbered list if available.
 *
 * @inputSpec
 *   item: any — the item containing procedure or resolution data.
 * @outputSpec  string — a formatted string of procedure steps or resolution text.
 * @sideEffects none
 * @stability   stable
 * @calls       firstNonEmpty
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Extracts the procedure text for an item embedding."]
// CIL[DOC-RESPONSIBILITY responsibility="Picks the first available procedure or resolution text from item data."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Joins arrays of steps into numbered text, or falls back to the procedure/resolution field." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildProcedureContent:function" type="function" identity="buildProcedureContent" parent="~/.framework/functions/embeddings.ts"]
function buildProcedureContent(item: any): string {
  const steps = item.data?.procedure || item.data?.ca_solution_steps || item.data?.steps
  if (Array.isArray(steps) && steps.length) {
    return steps.map((s: any, i: number) => `${i + 1}. ${s}`).join('\n')
  }
  return firstNonEmpty(item.data?.procedure, item.data?.resolution)
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildProcedureContent:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Extracts the procedure text for an item embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Extracts the outcome text for an item embedding by selecting the first available outcome or result field from the item data. This function is designed to streamline the retrieval of relevant outcome information.
 *
 * @inputSpec
 *   item: any — the item data containing potential outcome fields.
 * @outputSpec  string — the first non-empty outcome text.
 * @sideEffects none
 * @stability   internal
 * @calls       firstNonEmpty
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Extracts the outcome text for an item embedding."]
// CIL[DOC-RESPONSIBILITY responsibility="Picks the first available outcome or result field from item data."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns the first non-empty value among outcome, ca_final_solution, outcomes, result." notable_decisions="none"]
    // CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildOutcomeContent:function" type="function" identity="buildOutcomeContent" parent="~/.framework/functions/embeddings.ts"]
function buildOutcomeContent(item: any): string {
  return firstNonEmpty(
    item.data?.outcome,
    item.data?.ca_final_solution,
    item.data?.outcomes,
    item.data?.result,
  )
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildOutcomeContent:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Extracts the outcome text for an item embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Extracts the context text for an item embedding by prioritizing diagnostic steps or fallback context fields. This function is essential for providing relevant information associated with an item.
 *
 * @inputSpec
 *   item: any (required) — the item containing data for context extraction.
 * @outputSpec  string — the formatted context text or fallback information.
 * @sideEffects none
 * @stability   stable
 * @calls       firstNonEmpty
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Extracts the context text for an item embedding."]
// CIL[DOC-RESPONSIBILITY responsibility="Picks the first available context or prerequisite field from item data."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Joins diagnostic steps into numbered text, or falls back to context, prerequisites, when_to_use, product_area." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildContextContent:function" type="function" identity="buildContextContent" parent="~/.framework/functions/embeddings.ts"]
function buildContextContent(item: any): string {
  const steps = item.data?.ca_diagnostic_steps
  if (Array.isArray(steps) && steps.length) {
    return steps.map((s: any, i: number) => `${i + 1}. ${s}`).join('\n')
  }
  return firstNonEmpty(
    item.data?.context,
    item.data?.prerequisites,
    item.data?.when_to_use,
    item.data?.product_area,
  )
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildContextContent:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Extracts the context text for an item embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

    // CIL[DOC-STABILITY stability="internal"]
    // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
    // CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
/**
 * Extracts error signals or code blocks for an item embedding. This function is designed to retrieve relevant error information from the provided item data.
 *
 * @inputSpec
 *   item: any (required) — the item containing data to extract error signals from.
 * @outputSpec  string — a concatenated string of error signatures, analysis tags, or code blocks.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Extracts error signals or code blocks for an item embedding."]
// CIL[DOC-RESPONSIBILITY responsibility="Picks the first available error signature or code block from item data."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Joins error_signatures or ca_analysis_tags arrays, or extracts code blocks from the description." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildErrorSignalContent:function" type="function" identity="buildErrorSignalContent" parent="~/.framework/functions/embeddings.ts"]
function buildErrorSignalContent(item: any): string {
  const sigs = item.data?.error_signatures
  if (Array.isArray(sigs) && sigs.length) return sigs.join('\n')
  const tags = item.data?.ca_analysis_tags
  if (Array.isArray(tags) && tags.length) return tags.join('\n')
  
  const desc = item.description || ''
  const codeBlocks = desc.match(/```[\s\S]*?```/g) || []
  return codeBlocks.map((b: string) => b.replace(/```\w*\n?/g, '')).join('\n').trim()
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildErrorSignalContent:function"]

/**
 * Builds a synchronous summary string for an item by extracting and formatting its title and description. This function is designed to provide a concise overview of an item embedding.
 *
 * @inputSpec
 *   item: any (required) — the item object containing title and description.
 * @outputSpec  string — a formatted summary string combining the item title and a snippet of its description.
 * @sideEffects none
 * @stability   stable
 * @calls       stripHtml
 * @cil-generated
 */
// CIL[DOC-VECTOR type="context" content="purpose='Extracts error signals or code blocks for an item embedding.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Builds a synchronous summary string for an item."]
// CIL[DOC-RESPONSIBILITY responsibility="Produces a short title-plus-description summary."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Strips HTML from the description and combines the item title with a 300-character snippet." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:buildSummaryContentSync:function" type="function" identity="buildSummaryContentSync" parent="~/.framework/functions/embeddings.ts"]
function buildSummaryContentSync(item: any): string {
  
  const desc = stripHtml(item.description || '')
  return `${item.title || ''}: ${desc.slice(0, 300)}`
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:buildSummaryContentSync:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Builds a synchronous summary string for an item.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Generates an AI-written summary for an item, with a synchronous fallback. It calls OpenAI chat to summarize an article, falling back to a synchronous summary on failure.
 *
 * @inputSpec
 *   item: any (required) — the item to summarize.
 *   ctx: any (optional) — the context for the OpenAI call.
 * @outputSpec  Promise<string> — a summary of the item.
 * @sideEffects calls external OpenAI chat API
 * @stability   internal
 * @calls       callOpenAIChat, buildSummaryContentSync
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Generates an AI-written summary for an item, with a sync fallback."]
// CIL[DOC-RESPONSIBILITY responsibility="Calls OpenAI chat to summarize an article, falling back to a synchronous summary on failure."]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="item: any, ctx?: any" outputs="string summary" errors="none; failures are handled and fallback is returned" side_effects="calls external OpenAI chat API"]
// CIL[DOC-MICRO logic_summary="Strips HTML and truncates the description, calls the LLM with a concise system prompt, and falls back to buildSummaryContentSync if the call fails." notable_decisions="none"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:generateAiSummary:function" type="function" identity="generateAiSummary" parent="~/.framework/functions/embeddings.ts"]
async function generateAiSummary(item: any, ctx?: any): Promise<string> {
  const plain = stripHtml(item.description || '').slice(0, 3000)
  try {
    const j = await callOpenAIChat(
      ctx,
      [
        { role: 'system', content: 'Write one concise paragraph (max 100 words) summarising this knowledge base article for search indexing. Output only the paragraph.' },
        { role: 'user', content: `Title: ${item.title}\n\n${plain}` },
      ],
      process.env.LLM_DEFAULT_MODEL || 'gpt-4o-mini',
      { temperature: 0.2, max_tokens: 120 }
    )
    return j.choices?.[0]?.message?.content?.trim() || buildSummaryContentSync(item)
  } catch {
    return buildSummaryContentSync(item)
  }
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:generateAiSummary:function"]

// CIL[DOC-VECTOR type="context" content="purpose='Generates an AI-written summary for an item, with a sync fallback.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Calls the OpenAI embedding API to convert text inputs into vector arrays. It formats the results for further use in the application.
 *
 * @inputSpec
 *   inputs: string[] (required) — array of text inputs to be converted into embeddings.
 *   ctx: any (optional) — context object for the API call.
 * @outputSpec  Promise<string[]> — an array of formatted embedding vectors as bracketed comma-delimited strings.
 * @sideEffects calls external OpenAI embedding API
 * @stability   stable
 * @calls       callOpenAIEmbeddings
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Calls the OpenAI embedding API and formats the result."]
// CIL[DOC-RESPONSIBILITY responsibility="Converts text inputs into vector arrays from the embedding model."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="inputs: string[], ctx?: any" outputs="string[] of formatted embedding vectors" errors="throws if the embedding API call fails" side_effects="calls external OpenAI embedding API"]
// CIL[DOC-MICRO logic_summary="If inputs are empty returns empty strings, otherwise calls callOpenAIEmbeddings, sorts by index, and formats each embedding as a bracketed comma-delimited string." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:callEmbeddingApi:function" type="function" identity="callEmbeddingApi" parent="~/.framework/functions/embeddings.ts"]
async function callEmbeddingApi(inputs: string[], ctx?: any): Promise<string[]> {
  if (!inputs.length) return inputs.map(() => '')
  const j = await callOpenAIEmbeddings(ctx, inputs, 'text-embedding-3-small')
  const sorted = (j.data || []).sort((a: any, b: any) => a.index - b.index)
  return sorted.map((d: any) => `[${d.embedding.join(',')}]`)
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:callEmbeddingApi:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Calls the OpenAI embedding API and formats the result.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Computes a short SHA-256 hash of the provided text to generate a unique content identifier. This function is essential for creating consistent embeddings based on textual input.
 *
 * @inputSpec
 *   - text: string (required) — the input text to hash.
 * @outputSpec  string — a 16-character hex hash string.
 * @sideEffects none
 * @stability   stable
 * @calls       createHash
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Computes a short SHA-256 hash of text."]
// CIL[DOC-RESPONSIBILITY responsibility="Generates a 16-hex-character content hash for embeddings."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="16-character hex hash string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a SHA-256 digest of the text and slices the first 16 hex characters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:contentHash:function" type="function" identity="contentHash" parent="~/.framework/functions/embeddings.ts"]
function contentHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16)
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:contentHash:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Computes a short SHA-256 hash of text.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]




/**
 * The _platformAccountId constant holds a cached identifier for the spine-system account to optimize performance by avoiding repeated lookups. It is initialized as null and is intended for use within the embeddings module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Cached platform account identifier for spine-system."]
// CIL[DOC-RESPONSIBILITY responsibility="Holds the cached spine-system account id to avoid repeated lookups."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module-level variable that caches the resolved platform account id." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

let _platformAccountId: string | null = null

// CIL[DOC-VECTOR type="context" content="purpose='Cached platform account identifier for spine-system.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * Resolves and caches the spine-system platform account id. It fetches the platform account from the accounts table and caches it for future use.
 *
 * @outputSpec  Promise<string | null> — resolves to the platform account id or null if not found.
 * @sideEffects queries the accounts table and caches the id in _platformAccountId
 * @stability   stable
 * @calls       adminDb.from('accounts')
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Resolves and caches the spine-system platform account id."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches the platform account from the accounts table and caches it."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string | null" errors="none" side_effects="queries the accounts table and caches the id in _platformAccountId"]
// CIL[DOC-MICRO logic_summary="Returns the cached id if present, otherwise queries the accounts table for slug spine-system and stores the result." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:getPlatformAccountId:function" type="function" identity="getPlatformAccountId" parent="~/.framework/functions/embeddings.ts"]
async function getPlatformAccountId(): Promise<string | null> {
  if (_platformAccountId) return _platformAccountId
  const { data } = await adminDb.from('accounts').select('id').eq('slug', 'spine-system').maybeSingle()
  _platformAccountId = data?.id ?? null
  return _platformAccountId
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:getPlatformAccountId:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Resolves and caches the spine-system platform account id.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]





/**
 * ContentBuilder is a type alias for functions that create embedding content. It defines the function signature used by CONTENT_BUILDERS.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Type alias for embedding content builder functions."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the function signature used by CONTENT_BUILDERS."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares a function type that accepts an item and optional meta and returns a string." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:ContentBuilder:type" type="type" identity="ContentBuilder" parent="~/.framework/functions/embeddings.ts"]
type ContentBuilder = (item: any, meta?: any) => string
// CIL[END stable_id="~/.framework/functions/embeddings.ts:ContentBuilder:type"]
// CIL[DOC-VECTOR type="context" content="purpose='Type alias for embedding content builder functions.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

/**
 * CONTENT_BUILDERS is a mapping of vector type names to their corresponding content builder functions, facilitating the creation of various content types. It registers builders for semantic, structure, intent, cause, procedure, outcome, context, and error_signal vectors.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       buildSemanticContent, buildStructureContent, buildIntentContent, buildCauseContent, buildProcedureContent, buildOutcomeContent, buildContextContent, buildErrorSignalContent
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Mapping of vector type names to content builder functions."]
// CIL[DOC-RESPONSIBILITY responsibility="Registers content builders for semantic, structure, intent, cause, procedure, outcome, context, and error_signal vectors."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record<string, ContentBuilder>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines a record that maps each vector type to a builder function, embedding fields for the structure builder." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:CONTENT_BUILDERS:constant" type="constant" identity="CONTENT_BUILDERS" parent="~/.framework/functions/embeddings.ts"]
const CONTENT_BUILDERS: Record<string, ContentBuilder> = {
  semantic:     buildSemanticContent,
  structure:    (item, meta) => buildStructureContent(item, meta?.embedding_fields ?? []),
  intent:       buildIntentContent,
  cause:        buildCauseContent,
  procedure:    buildProcedureContent,
  outcome:      buildOutcomeContent,
  context:      buildContextContent,
  error_signal: buildErrorSignalContent,
  
}
// CIL[END stable_id="~/.framework/functions/embeddings.ts:CONTENT_BUILDERS:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Mapping of vector type names to content builder functions.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Lists embedding records with optional filters for the current account. It returns a paginated, sanitized list of embeddings.
 *
 * @throws      Error — if account context is missing
 * @sideEffects queries the embeddings table
 * @stability   stable
 * @calls       sanitizeRecordData, adminDb.from, ctx.db.from
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Lists embedding records with optional filters."]
// CIL[DOC-RESPONSIBILITY responsibility="Returns a paginated, sanitized list of embeddings for the current account."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: any" outputs="sanitized embedding record array" errors="throws if account context is missing or the query fails" side_effects="queries the embeddings table"]
// CIL[DOC-MICRO logic_summary="Parses query parameters, builds a database query filtered by model_id and document_id, fetches a range, sanitizes each row, and returns the results." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/embeddings.ts"]
export const list = createHandler(async (ctx, _body) => {
  const { model_id, document_id, limit = 100, offset = 0 } = ctx.query || {}

  const isSystem = isSystemPrincipal(ctx)

  if (!isSystem && !ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('embeddings')
    .select('*')
    .order('created_at', { ascending: false })

  if (!isSystem) {
    query = query.eq('account_id', ctx.accountId)
  }

  if (model_id) {
    query = query.eq('model_id', model_id)
  }
  if (document_id) {
    query = query.eq('document_id', document_id)
  }

  const parsedOffset = parseInt(offset.toString())
  const parsedLimit = parseInt(limit.toString())

  const { data, error: err } = await query.range(
    parsedOffset,
    parsedOffset + parsedLimit - 1
  )

  if (err) throw err

  const sanitized = []
  for (const embedding of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, embedding, 'embedding'))
  }

  return sanitized
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:list:constant"]
/**
 * Retrieves a single embedding record by its ID from the database. This function ensures that the embedding data is fetched and sanitized before being returned.
 *
 * @throws      Error — if id missing or query fails
 * @sideEffects queries the embeddings table
 * @stability   stable
 * @calls       adminDb.from('embeddings'), ctx.db.from('embeddings'), sanitizeRecordData
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Retrieves a single embedding by id."]
// CIL[DOC-VECTOR type="context" content="purpose='Lists embedding records with optional filters.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches and sanitizes one embedding record."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: any" outputs="sanitized embedding record" errors="throws if id missing or query fails" side_effects="queries the embeddings table"]
// CIL[DOC-MICRO logic_summary="Reads the id from query, selects the matching embedding from the database, and sanitizes the result." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/embeddings.ts"]
export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Embedding ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('embeddings')
    .select('*')
    .eq('id', id)

  if (!isSystemPrincipal(ctx)) {
    if (!ctx.accountId) throw new Error('Account context required')
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query.single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'embedding')
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:get:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Retrieves a single embedding by id.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Returns the total count of embeddings for the current account. This function counts the number of embeddings owned by the account.
 *
 * @throws      Error — if account context missing or query fails
 * @sideEffects queries the embeddings table
 * @stability   stable
 * @calls       ctx.db.from('embeddings')
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Returns the total count of embeddings for the current account."]
// CIL[DOC-RESPONSIBILITY responsibility="Counts the number of embeddings owned by the account."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: any" outputs="{ total_embeddings: number }" errors="throws if account context missing or query fails" side_effects="queries the embeddings table"]
// CIL[DOC-MICRO logic_summary="Verifies account context, queries the embeddings table with an exact count, and returns the total." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:getStats:constant" type="constant" identity="getStats" parent="~/.framework/functions/embeddings.ts"]
export const getStats = createHandler(async (ctx, _body) => {
  const isSystem = isSystemPrincipal(ctx)
  if (!isSystem && !ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = ctx.db
    .from('embeddings')
    .select('*', { count: 'exact', head: true })

  if (!isSystem) query = query.eq('account_id', ctx.accountId)

  const { count, error: err } = await query

  if (err) throw err

  return { total_embeddings: count || 0 }
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:getStats:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Returns the total count of embeddings for the current account.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Bulk inserts multiple embedding records into the database and logs the batch operation. It ensures that the provided data is valid and associates each embedding with the account context.
 *
 * @throws      Error — if embeddings_data is missing/invalid, account context is missing, or insert fails.
 * @sideEffects Inserts multiple embeddings rows and emits an audit log.
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), emitLog
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Bulk inserts multiple embedding records."]
// CIL[DOC-RESPONSIBILITY responsibility="Creates many embeddings in one transaction and logs the batch."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { embeddings_data: any[] }" outputs="inserted embedding records" errors="throws if embeddings_data is missing/invalid, account context is missing, or insert fails" side_effects="inserts multiple embeddings rows and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Validates the embeddings_data array and account context, appends the account id to each row, inserts the batch, and emits an audit log." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:batchCreate:constant" type="constant" identity="batchCreate" parent="~/.framework/functions/embeddings.ts"]
export const batchCreate = createHandler(async (ctx, body) => {
  const { embeddings_data } = body

  if (!embeddings_data || !Array.isArray(embeddings_data)) {
    throw new Error('embeddings_data array is required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const rows = embeddings_data.map((e: any) => ({
    ...e,
    account_id: ctx.accountId
  }))

  const { data, error: err } = await ctx.db
    .from('embeddings')
    .insert(rows)
    .select()

  if (err) throw err

  await emitLog(ctx, 'embeddings.batch_created', 
    { type: 'system', id: 'batch_create' }, 
    { after: { batch_size: embeddings_data.length } }
  )

  return data
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:batchCreate:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Bulk inserts multiple embedding records.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Deletes all embeddings associated with a given document. This function ensures that the specified document's embeddings are removed from the database and logs the deletion event.
 *
 * @throws      Error — if document_id is missing or deletion fails
 * @sideEffects deletes embeddings rows and emits an audit log
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), emitLog
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Deletes all embeddings for a given document."]
// CIL[DOC-RESPONSIBILITY responsibility="Removes embeddings associated with a document and logs the deletion."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { document_id }" outputs="{ deleted_count: number }" errors="throws if document_id missing or delete fails" side_effects="deletes embeddings rows and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Validates document_id, deletes matching rows from the embeddings table, and emits an embeddings.document_deleted log." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:deleteByDocument:constant" type="constant" identity="deleteByDocument" parent="~/.framework/functions/embeddings.ts"]
export const deleteByDocument = createHandler(async (ctx, body) => {
  const { document_id } = body

  if (!document_id) {
    throw new Error('document_id is required')
  }

  const isSystem = isSystemPrincipal(ctx)
  if (!isSystem && !ctx.accountId) throw new Error('Account context required')

  let query = ctx.db
    .from('embeddings')
    .delete()
    .eq('document_id', document_id)
  if (!isSystem) query = query.eq('account_id', ctx.accountId)
  const { data, error: err } = await query.select()

  if (err) throw err

  await emitLog(ctx, 'embeddings.document_deleted', 
    { type: 'system', id: 'document_delete' }, 
    { after: { document_id, deleted_count: data?.length || 0 } }
  )

  return { deleted_count: data?.length || 0 }
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:deleteByDocument:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Deletes all embeddings for a given document.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Deletes embedding records that are older than a specified threshold to manage data retention. This function ensures that the database remains efficient by purging outdated records.
 *
 * @throws      Error — if account context is missing or delete operation fails.
 * @sideEffects Deletes embedding rows from the database and emits an audit log.
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), emitLog
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Deletes embedding records older than a threshold."]
// CIL[DOC-RESPONSIBILITY responsibility="Purges old embeddings based on a retention policy."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { days_to_keep? }" outputs="{ deleted_count: number }" errors="throws if account context missing or delete fails" side_effects="deletes embeddings rows and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Computes a cutoff date from days_to_keep, deletes embeddings with created_at before that date, and emits an embeddings.cleaned log." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:cleanup:constant" type="constant" identity="cleanup" parent="~/.framework/functions/embeddings.ts"]
export const cleanup = createHandler(async (ctx, body) => {
  const { days_to_keep } = body
  const daysToKeep = days_to_keep || 365

  const isSystem = isSystemPrincipal(ctx)
  if (!isSystem && !ctx.accountId) throw new Error('Account context required')

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysToKeep)

  let query = ctx.db
    .from('embeddings')
    .delete()
    .lt('created_at', cutoff.toISOString())
  if (!isSystem) query = query.eq('account_id', ctx.accountId)
  const { data, error: err } = await query.select()

  if (err) throw err

  await emitLog(ctx, 'embeddings.cleaned', 
    { type: 'system', id: 'batch_cleanup' }, 
    { after: { days_to_keep: daysToKeep, deleted_count: data?.length || 0 } }
  )

  return { deleted_count: data?.length || 0 }
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:cleanup:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Deletes embedding records older than a threshold.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
/**
 * Performs vector similarity search over embeddings to find relevant results based on a query embedding. It returns embeddings whose vectors are within a specified threshold of the query embedding.
 *
 * @throws      Error — if account or query_embedding is missing, or if RPC fails.
 * @sideEffects executes a database RPC
 * @stability   stable
 * @calls       ctx.db.rpc
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Performs vector similarity search over embeddings."]
// CIL[DOC-RESPONSIBILITY responsibility="Returns embeddings whose vectors are within a threshold of a query embedding."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { query_embedding, model_id?, limit?, threshold? }" outputs="{ results, count, model_id, threshold }" errors="throws if account or query_embedding missing, or RPC fails" side_effects="executes a database RPC"]
// CIL[DOC-MICRO logic_summary="Validates account and query_embedding, calls the match_embeddings RPC via adminDb, and returns the results, count, model, and threshold." notable_decisions="adminDb (service role) required — the RPC is service-role-only; scoping is enforced here via filter_account_ids"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:searchSimilar:constant" type="constant" identity="searchSimilar" parent="~/.framework/functions/embeddings.ts"]
export const searchSimilar = createHandler(async (ctx, body) => {
  const {
    query_embedding,
    model_id,
    limit = 10,
    threshold = 0.7,
    filter_account_ids,
    filter_vector_type,
    filter_item_types,
    filter_document_ids,
  } = body || {}

  if (!query_embedding) {
    throw new Error('query_embedding is required for similarity search')
  }

  const isSystem = isSystemPrincipal(ctx)
  if (!isSystem && !ctx.accountId) {
    throw new Error('Account context required')
  }

  // adminDb (service role): match_embeddings is revoked from anon/authenticated.
  // Scoping is enforced here — non-system callers may not widen the corpus
  // beyond their own account.
  const { data, error: err } = await adminDb.rpc('match_embeddings', {
    query_embedding,
    match_count: parseInt(limit.toString()),
    filter_account_ids: isSystem ? (filter_account_ids ?? null) : [ctx.accountId],
    filter_vector_type: filter_vector_type ?? null,
    similarity_threshold: parseFloat(threshold.toString()),
    filter_item_types: filter_item_types ?? null,
    filter_document_ids: filter_document_ids ?? null,
  })

  if (err) throw err

  return {
    results: data || [],
    count: data?.length || 0,
    model_id: model_id || 'text-embedding-3-small',
    threshold: parseFloat(threshold.toString())
  }
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:searchSimilar:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Performs vector similarity search over embeddings.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Performs text search against embedding content to retrieve relevant results based on a query. It validates the account and query before executing a full-text search on the embeddings database.
 *
 * @throws      Error — if account or query is missing, or if the query fails.
 * @sideEffects queries the embeddings table using full-text search
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), ctx.db.select, ctx.db.eq, ctx.db.textSearch, ctx.db.limit, ctx.db.in
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Performs text search against embedding content."]
// CIL[DOC-RESPONSIBILITY responsibility="Returns embeddings matching a text query using full-text search."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { query, model_id?, document_ids?, limit? }" outputs="{ results, count, method, query }" errors="throws if account or query missing, or query fails" side_effects="queries the embeddings table using full-text search"]
// CIL[DOC-MICRO logic_summary="Validates account and query, builds a textSearch query with optional model_id and document_ids filters, and returns the results and count." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:searchSemantic:constant" type="constant" identity="searchSemantic" parent="~/.framework/functions/embeddings.ts"]
export const searchSemantic = createHandler(async (ctx, body) => {
  const { query, model_id, document_ids, limit = 10 } = body || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  if (!query) {
    throw new Error('query is required for semantic search')
  }

  let dbQuery = ctx.db
    .from('embeddings')
    .select('*')
    .eq('account_id', ctx.accountId)
    .textSearch('content', query, {
      type: 'websearch',
      config: 'english'
    })
    .limit(parseInt(limit.toString()))

  if (model_id) {
    dbQuery = dbQuery.eq('model_id', model_id)
  }

  if (document_ids && Array.isArray(document_ids) && document_ids.length > 0) {
    dbQuery = dbQuery.in('document_id', document_ids)
  }

  const { data, error: err } = await dbQuery

  if (err) throw err

  return {
    results: data || [],
    count: data?.length || 0,
    method: 'text_search',
    query
  }
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:searchSemantic:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Performs text search against embedding content.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Revokes all active embeddings for a document by marking them as revoked. This is achieved by updating the revoked_at timestamp for the specified document's embeddings.
 *
 * @throws      Error — if document_id is missing or update fails
 * @sideEffects updates embeddings rows and emits an audit log
 * @stability   stable
 * @calls       adminDb.from('embeddings'), emitLog
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Revokes all active embeddings for a document."]
// CIL[DOC-RESPONSIBILITY responsibility="Marks embeddings for a document as revoked by setting revoked_at."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { document_id }" outputs="{ document_id, revoked_count }" errors="throws if document_id missing or update fails" side_effects="updates embeddings rows and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Updates all non-revoked embeddings for the document with the current timestamp and emits an embeddings.revoked log." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:revoke:constant" type="constant" identity="revoke" parent="~/.framework/functions/embeddings.ts"]
export const revoke = createHandler(async (ctx, body) => {
  const { document_id } = body || {}
  if (!document_id) throw new Error('document_id is required')

  const isSystem = isSystemPrincipal(ctx)
  if (!isSystem && !ctx.accountId) throw new Error('Account context required')

  let query = adminDb
    .from('embeddings')
    .update({ revoked_at: new Date().toISOString() })
    .eq('document_id', document_id)
    .is('revoked_at', null)
  if (!isSystem) query = query.eq('account_id', ctx.accountId)
  const { data, error } = await query.select('id')

  if (error) throw error

  await emitLog(ctx, 'embeddings.revoked',
    { type: 'system', id: document_id },
    { after: { revoked_count: data?.length || 0 } }
  )

  return { document_id, revoked_count: data?.length || 0 }
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:revoke:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Revokes all active embeddings for a document.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * Approves all embeddings for a document by updating their approval timestamps. This function ensures that embeddings are marked as approved and any revoked timestamps are cleared.
 *
 * @throws      Error — if document_id is missing or update fails
 * @sideEffects updates embeddings rows and emits an audit log
 * @stability   stable
 * @calls       adminDb.from('embeddings'), emitLog
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Approves all embeddings for a document."]
// CIL[DOC-RESPONSIBILITY responsibility="Marks embeddings for a document as approved by setting approved_at and clearing revoked_at."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: { document_id }" outputs="{ document_id, approved_count }" errors="throws if document_id missing or update fails" side_effects="updates embeddings rows and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Updates all embeddings for the document with the current approved timestamp, clears any revoked timestamp, and emits an embeddings.approved log." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:approve:constant" type="constant" identity="approve" parent="~/.framework/functions/embeddings.ts"]
export const approve = createHandler(async (ctx, body) => {
  const { document_id } = body || {}
  if (!document_id) throw new Error('document_id is required')

  const isSystem = isSystemPrincipal(ctx)
  if (!isSystem && !ctx.accountId) throw new Error('Account context required')

  const now = new Date().toISOString()
  let query = adminDb
    .from('embeddings')
    .update({ approved_at: now, revoked_at: null })
    .eq('document_id', document_id)
  if (!isSystem) query = query.eq('account_id', ctx.accountId)
  const { data, error } = await query.select('id')

  if (error) throw error

  await emitLog(ctx, 'embeddings.approved',
    { type: 'system', id: document_id },
    { after: { approved_count: data?.length || 0 } }
  )

  return { document_id, approved_count: data?.length || 0 }
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:approve:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Approves all embeddings for a document.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
/**
 * The handler is a Netlify function that routes HTTP requests to the appropriate embedding operation based on the specified action and method. It facilitates various embedding-related actions such as create, update, and search operations.
 *
 * @throws      Error — throws if action and method do not match any valid route.
 * @sideEffects dispatches to create, update, generate, revoke, approve, stats, batch-create, delete-document, cleanup, search-similar, search-semantic, list, or get
 * @stability   stable
 * @calls       generate, revoke, approve, getStats, batchCreate, deleteByDocument, cleanup, searchSimilar, searchSemantic, get, list, create, update
 * @errorHandling none
 * @cil-generated
 */
// CIL[DOC-MACRO purpose="Netlify function router that dispatches embedding actions."]
// CIL[DOC-RESPONSIBILITY responsibility="Routes HTTP requests to the correct embedding operation based on action and method."]
// CIL[DOC-CONTEXT module="embeddings" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/embeddings.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: any" outputs="handler result" errors="throws if action and method do not match any valid route" side_effects="dispatches to create, update, generate, revoke, approve, stats, batch-create, delete-document, cleanup, search-similar, search-semantic, list, or get"]
// CIL[DOC-MICRO logic_summary="Reads action and method from the request, switches to the matching handler, and falls back to GET/POST/PATCH default CRUD actions." notable_decisions="Uses action/method routing; supports both action-specific POST routes and default GET/POST/PATCH CRUD paths."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/.framework/functions/embeddings.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/embeddings.ts"]
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'generate':
      if (method === 'POST') {
        return await generate(ctx, body)
      }
      break
    case 'revoke':
      if (method === 'POST') {
        return await revoke(ctx, body)
      }
      break
    case 'approve':
      if (method === 'POST') {
        return await approve(ctx, body)
      }
      break
    case 'stats':
      if (method === 'GET') {
        return await getStats(ctx, body)
      }
      break
    case 'batch-create':
      if (method === 'POST') {
        return await batchCreate(ctx, body)
      }
      break
    case 'delete-document':
      if (method === 'POST') {
        return await deleteByDocument(ctx, body)
      }
      break
    case 'cleanup':
      if (method === 'POST') {
        return await cleanup(ctx, body)
      }
      break
    case 'search-similar':
      if (method === 'POST') {
        return await searchSimilar(ctx, body)
      }
      break
    case 'search-semantic':
      if (method === 'POST') {
        return await searchSemantic(ctx, body)
      }
      break
    default:
      if (method === 'GET') {
        if (ctx.query?.id) {
          return await get(ctx, body)
        } else {
          return await list(ctx, body)
        }
      } else if (method === 'POST') {
        return await create(ctx, body)
      } else if (method === 'PATCH') {
        return await update(ctx, body)
      }
  }

  throw new Error('Invalid action or method')
})
// CIL[END stable_id="~/.framework/functions/embeddings.ts:handler:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function router that dispatches embedding actions.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
