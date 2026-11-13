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
/**
 * VECTOR_TYPE_SLOTS defines a mapping of vector types to their corresponding fixed slots, ensuring consistency with the CIL pipeline's conventions. This structure is essential for managing unique identifiers for each vector type based on model and document IDs.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// chunk_index is unique per (model_id, document_id) — each vector type
// occupies a fixed slot (matching the CIL pipeline's convention).
const VECTOR_TYPE_SLOTS: Record<string, number> = {
  semantic: 0, structure: 1, context: 2, blast_radius: 3,
  configuration: 4, constraint: 5, summary: 6, intent: 7,
  cause: 8, procedure: 9, outcome: 10, error_signal: 11,
}
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

















 


















































  



  


  


  


  



  

  


  


  


















import { createHash } from 'crypto'
import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin, isSystemPrincipal } from './_shared/principal'
import { sanitizeRecordData } from './_shared/permissions'
import { callOpenAIEmbeddings, callOpenAIChat } from './_shared/llm'

// True only for platform-level principals: a system_admin role or an
// internal machine principal with no account binding (SYSTEM_PRINCIPAL,
// produced only by the INTERNAL_INVOKE_SECRET path). Machine principals
// resolve to the service-role adminDb via getPrincipalDb, so account-bound
// API keys must be scoped to their own account below.
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
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

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
function firstNonEmpty(...values: (string | undefined | null)[]): string {
  for (const v of values) {
    if (v && String(v).trim()) return String(v).trim()
  }
  return ''
}

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
// KB articles store their body in data.content (data.body/markdown for other kinds) while description is only a short blurb — embedding title+description alone produced useless vectors.
function buildSemanticContent(item: any): string {
  const title = item.title || ''
  const blurb = stripHtml(item.description || '')
  const body = stripHtml(
    item.data?.content || item.data?.body || item.data?.markdown || ''
  )
  return [title, blurb, body].filter(Boolean).join('\n')
}

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
function buildIntentContent(item: any): string {
  return firstNonEmpty(
    item.data?.intent,
    item.data?.learning_objectives,
    item.data?.ca_reported_issue,
    item.data?.use_case,
  )
}

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
function buildCauseContent(item: any): string {
  return firstNonEmpty(
    item.data?.cause,
    item.data?.ca_true_problem,
    item.data?.concept,
    item.data?.root_cause,
  )
}

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
function buildProcedureContent(item: any): string {
  const steps = item.data?.procedure || item.data?.ca_solution_steps || item.data?.steps
  if (Array.isArray(steps) && steps.length) {
    return steps.map((s: any, i: number) => `${i + 1}. ${s}`).join('\n')
  }
  return firstNonEmpty(item.data?.procedure, item.data?.resolution)
}

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
function buildOutcomeContent(item: any): string {
  return firstNonEmpty(
    item.data?.outcome,
    item.data?.ca_final_solution,
    item.data?.outcomes,
    item.data?.result,
  )
}

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
function buildErrorSignalContent(item: any): string {
  const sigs = item.data?.error_signatures
  if (Array.isArray(sigs) && sigs.length) return sigs.join('\n')
  const tags = item.data?.ca_analysis_tags
  if (Array.isArray(tags) && tags.length) return tags.join('\n')
  
  const desc = item.description || ''
  const codeBlocks = desc.match(/```[\s\S]*?```/g) || []
  return codeBlocks.map((b: string) => b.replace(/```\w*\n?/g, '')).join('\n').trim()
}

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
function buildSummaryContentSync(item: any): string {
  
  const desc = stripHtml(item.description || '')
  return `${item.title || ''}: ${desc.slice(0, 300)}`
}

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
async function callEmbeddingApi(inputs: string[], ctx?: any): Promise<string[]> {
  if (!inputs.length) return inputs.map(() => '')
  const j = await callOpenAIEmbeddings(ctx, inputs, 'text-embedding-3-small')
  const sorted = (j.data || []).sort((a: any, b: any) => a.index - b.index)
  return sorted.map((d: any) => `[${d.embedding.join(',')}]`)
}

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
function contentHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16)
}




/**
 * The _platformAccountId constant holds a cached identifier for the spine-system account to optimize performance by avoiding repeated lookups. It is initialized as null and is intended for use within the embeddings module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */

let _platformAccountId: string | null = null


/**
 * Resolves and caches the spine-system platform account id. It fetches the platform account from the accounts table and caches it for future use.
 *
 * @outputSpec  Promise<string | null> — resolves to the platform account id or null if not found.
 * @sideEffects queries the accounts table and caches the id in _platformAccountId
 * @stability   stable
 * @calls       adminDb.from('accounts')
 * @cil-generated
 */
async function getPlatformAccountId(): Promise<string | null> {
  if (_platformAccountId) return _platformAccountId
  const { data } = await adminDb.from('accounts').select('id').eq('slug', 'spine-system').maybeSingle()
  _platformAccountId = data?.id ?? null
  return _platformAccountId
}





/**
 * ContentBuilder is a type alias for functions that create embedding content. It defines the function signature used by CONTENT_BUILDERS.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
type ContentBuilder = (item: any, meta?: any) => string

/**
 * CONTENT_BUILDERS is a mapping of vector type names to their corresponding content builder functions, facilitating the creation of various content types. It registers builders for semantic, structure, intent, cause, procedure, outcome, context, and error_signal vectors.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       buildSemanticContent, buildStructureContent, buildIntentContent, buildCauseContent, buildProcedureContent, buildOutcomeContent, buildContextContent, buildErrorSignalContent
 * @cil-generated
 */
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
/**
 * Lists embedding records with optional filters for the current account. It returns a paginated, sanitized list of embeddings.
 *
 * @throws      Error — if account context is missing
 * @sideEffects queries the embeddings table
 * @stability   stable
 * @calls       sanitizeRecordData, adminDb.from, ctx.db.from
 * @cil-generated
 */
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
/**
 * Retrieves a single embedding record by its ID from the database. This function ensures that the embedding data is fetched and sanitized before being returned.
 *
 * @throws      Error — if id missing or query fails
 * @sideEffects queries the embeddings table
 * @stability   stable
 * @calls       adminDb.from('embeddings'), ctx.db.from('embeddings'), sanitizeRecordData
 * @cil-generated
 */
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
/**
 * Returns the total count of embeddings for the current account. This function counts the number of embeddings owned by the account.
 *
 * @throws      Error — if account context missing or query fails
 * @sideEffects queries the embeddings table
 * @stability   stable
 * @calls       ctx.db.from('embeddings')
 * @cil-generated
 */
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
/**
 * Bulk inserts multiple embedding records into the database and logs the batch operation. It ensures that the provided data is valid and associates each embedding with the account context.
 *
 * @throws      Error — if embeddings_data is missing/invalid, account context is missing, or insert fails.
 * @sideEffects Inserts multiple embeddings rows and emits an audit log.
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), emitLog
 * @cil-generated
 */
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
/**
 * Deletes all embeddings associated with a given document. This function ensures that the specified document's embeddings are removed from the database and logs the deletion event.
 *
 * @throws      Error — if document_id is missing or deletion fails
 * @sideEffects deletes embeddings rows and emits an audit log
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), emitLog
 * @cil-generated
 */
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
/**
 * Deletes embedding records that are older than a specified threshold to manage data retention. This function ensures that the database remains efficient by purging outdated records.
 *
 * @throws      Error — if account context is missing or delete operation fails.
 * @sideEffects Deletes embedding rows from the database and emits an audit log.
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), emitLog
 * @cil-generated
 */
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
/**
 * Performs vector similarity search over embeddings to find relevant results based on a query embedding. It returns embeddings whose vectors are within a specified threshold of the query embedding.
 *
 * @throws      Error — if account or query_embedding is missing, or if RPC fails.
 * @sideEffects executes a database RPC
 * @stability   stable
 * @calls       ctx.db.rpc
 * @cil-generated
 */
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
/**
 * Performs text search against embedding content to retrieve relevant results based on a query. It validates the account and query before executing a full-text search on the embeddings database.
 *
 * @throws      Error — if account or query is missing, or if the query fails.
 * @sideEffects queries the embeddings table using full-text search
 * @stability   stable
 * @calls       ctx.db.from('embeddings'), ctx.db.select, ctx.db.eq, ctx.db.textSearch, ctx.db.limit, ctx.db.in
 * @cil-generated
 */
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
/**
 * Revokes all active embeddings for a document by marking them as revoked. This is achieved by updating the revoked_at timestamp for the specified document's embeddings.
 *
 * @throws      Error — if document_id is missing or update fails
 * @sideEffects updates embeddings rows and emits an audit log
 * @stability   stable
 * @calls       adminDb.from('embeddings'), emitLog
 * @cil-generated
 */
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
/**
 * Approves all embeddings for a document by updating their approval timestamps. This function ensures that embeddings are marked as approved and any revoked timestamps are cleared.
 *
 * @throws      Error — if document_id is missing or update fails
 * @sideEffects updates embeddings rows and emits an audit log
 * @stability   stable
 * @calls       adminDb.from('embeddings'), emitLog
 * @cil-generated
 */
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
