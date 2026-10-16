// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Defines the item-progress module and its CRUD handler exports"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides Netlify function entry points and helpers for item progress records"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports shared utilities and wires list, get, upsert, and update handlers behind a single method router" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="human; ai"]




import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveTypeId } from './_shared/resolve-ids'
import { emitLog } from './_shared/audit'
// CIL[DOC-VECTOR type="context" content="purpose='Defines the item-progress module and its CRUD handler exports'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:PIPELINE_DEFAULT:constant" type="constant" identity="PIPELINE_DEFAULT" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Default status pipeline used when a type has no custom design schema pipeline"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide fallback ordered status values"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static array of default progress statuses" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const PIPELINE_DEFAULT = ['not_started', 'in_progress', 'completed']
// CIL[DOC-VECTOR type="context" content="purpose='Default status pipeline used when a type has no custom design schema pipeline'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:PIPELINE_DEFAULT:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:getPipeline:function" type="function" identity="getPipeline" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Resolve the status pipeline for a type record, falling back to the default"]
// CIL[DOC-RESPONSIBILITY responsibility="Return ordered pipeline from type design schema or default"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="typeRecord any" outputs="string[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Read typeRecord design schema pipeline or return PIPELINE_DEFAULT" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getPipeline(typeRecord: any): string[] {
  return typeRecord?.design_schema?.pipeline ?? PIPELINE_DEFAULT
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the status pipeline for a type record, falling back to the default'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:getPipeline:function"]

// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:isValidTransition:function" type="function" identity="isValidTransition" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Validate that a status transition is forward or unchanged in the pipeline"]
// CIL[DOC-RESPONSIBILITY responsibility="Check if target status index is at least source status index"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="pipeline string[], from string, to string" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return true if either status is missing or target index is greater than or equal to source index" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function isValidTransition(pipeline: string[], from: string, to: string): boolean {
  const fromIdx = pipeline.indexOf(from)
  const toIdx = pipeline.indexOf(to)
  if (fromIdx === -1 || toIdx === -1) return true
  return toIdx >= fromIdx
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate that a status transition is forward or unchanged in the pipeline'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:isValidTransition:function"]

// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:composeTitle:function" type="function" identity="composeTitle" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Build a title from item and person names"]
// CIL[DOC-RESPONSIBILITY responsibility="Combine item title and person name with an em dash"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="itemTitle string|null, personName string|null" outputs="string|null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return null if both empty, otherwise combine with em dash" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function composeTitle(itemTitle: string | null, personName: string | null): string | null {
  if (!itemTitle && !personName) return null
  if (!personName) return itemTitle
  if (!itemTitle) return personName
  return `${itemTitle} — ${personName}`
}
// CIL[DOC-VECTOR type="context" content="purpose='Build a title from item and person names'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:composeTitle:function"]

// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:composeDescription:function" type="function" identity="composeDescription" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Compose a human readable status description with optional score and attempts"]
// CIL[DOC-RESPONSIBILITY responsibility="Format label, score, and attempt count into a dot separated string"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="status string, score number|null, attempts number|null" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Label status, append score and attempt count if present, join with middle dot" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function composeDescription(status: string, score: number | null, attempts: number | null): string {
  const parts: string[] = []
  const label = status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'
  parts.push(label)
  if (score !== null && score !== undefined) parts.push(`score ${score}`)
  if (attempts !== null && attempts !== undefined && attempts > 0) parts.push(`${attempts} attempt${attempts === 1 ? '' : 's'}`)
  return parts.join(' · ')
}
// CIL[DOC-VECTOR type="context" content="purpose='Compose a human readable status description with optional score and attempts'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:composeDescription:function"]
// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="List active item progress records with optional filters"]
// CIL[DOC-RESPONSIBILITY responsibility="Query item_progress table and return matching records"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="ctx RequestContext" outputs="array of item progress records" errors="throws on database error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a query, apply optional filters, and return data ordered by updated_at desc" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const list = createHandler(async (ctx) => {
  const { person_id, item_id, item_ids, status, limit = '100', offset = '0' } = ctx.query || {}

  let query = ctx.db
    .from('item_progress')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (person_id) query = query.eq('person_id', person_id)
  if (item_id)   query = query.eq('item_id', item_id)
  if (item_ids)  query = query.in('item_id', item_ids.split(',').map((s: string) => s.trim()))
  if (status)    query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='List active item progress records with optional filters'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Fetch a single item progress record by ID"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the requested record or throw not found"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="ctx RequestContext" outputs="item progress record" errors="throws if id missing or record not found" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Read id from query, select single row, and return data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const get = createHandler(async (ctx) => {
  const id = ctx.query?.id
  if (!id) throw new Error('Progress record ID is required')

  const { data, error } = await ctx.db
    .from('item_progress')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw new Error('Progress record not found')
  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Fetch a single item progress record by ID'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:upsert:constant" type="constant" identity="upsert" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Create or update an item progress record"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve type, validate status transitions, enrich title/description, and upsert record"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="ctx RequestContext, body object" outputs="upserted record" errors="throws on missing required fields, invalid transition, or database error" side_effects="emits audit log"]
// CIL[DOC-MICRO logic_summary="Resolve type id, load existing record, validate status transition, compute attempts and timestamps, fetch title and description if missing, build payload, upsert, and emit log" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const upsert = createHandler(async (ctx, body) => {
  const { person_id, item_id, type_id, type_slug, account_id, app_id, force } = body || {}
  let { status, score, data: dataPayload, title, description } = body || {}

  let resolvedTypeId = type_id
  if (!resolvedTypeId && type_slug) {
    resolvedTypeId = await resolveTypeId('item_progress', type_slug)
  }

  if (!person_id || !item_id || !resolvedTypeId || !account_id) {
    throw new Error('person_id, item_id, type_id (or type_slug), and account_id are required')
  }

  const { data: typeRecord } = await adminDb
    .from('types')
    .select('design_schema')
    .eq('id', resolvedTypeId)
    .single()

  const pipeline = getPipeline(typeRecord)

  const { data: existing } = await ctx.db
    .from('item_progress')
    .select('*')
    .eq('person_id', person_id)
    .eq('item_id', item_id)
    .maybeSingle()

  const currentStatus = existing?.status ?? 'not_started'
  const targetStatus  = status ?? currentStatus

  if (status && existing && !force && !isValidTransition(pipeline, currentStatus, targetStatus)) {
    throw new Error(`Invalid status transition: ${currentStatus} → ${targetStatus}. Use force: true to override.`)
  }

  const now = new Date().toISOString()
  const existingData = existing?.data ?? {}
  const attempts = (existingData.attempts ?? 0) + (status && status !== currentStatus ? 1 : 0)
  const mergedData: any = {
    ...existingData,
    ...(dataPayload || {}),
    attempts,
  }
  if (targetStatus === 'in_progress' && !existingData.started_at) mergedData.started_at = now
  if (targetStatus === 'completed' && !existingData.completed_at) mergedData.completed_at = now

  if (!title) {
    const [{ data: itemRow }, { data: personRow }] = await Promise.all([
      adminDb.from('items').select('title').eq('id', item_id).single(),
      adminDb.from('people').select('full_name').eq('id', person_id).single(),
    ])
    title = composeTitle(itemRow?.title ?? null, personRow?.full_name ?? null) ?? undefined
  }
  if (!description) {
    description = composeDescription(targetStatus, score ?? existing?.score ?? null, mergedData.attempts)
  }

  const payload: any = {
    type_id: resolvedTypeId,
    account_id,
    app_id: app_id ?? existing?.app_id ?? null,
    person_id,
    item_id,
    title: title ?? existing?.title ?? null,
    description,
    status: targetStatus,
    score: score !== undefined ? score : (existing?.score ?? null),
    data: mergedData,
    is_active: true,
    updated_at: now,
  }

  if (!existing) {
    payload.created_by = ctx.principal?.id ?? null
    payload.created_at = now
  } else {
    payload.updated_by = ctx.principal?.id ?? null
  }

  const { data: result, error } = await ctx.db
    .from('item_progress')
    .upsert(payload, { onConflict: 'person_id,item_id' })
    .select()
    .single()

  if (error) throw error

  await emitLog(ctx, 'item_progress.upserted',
    { type: 'item_progress', id: result.id },
    { before: existing ?? null, after: result }
  )

  return result
})
// CIL[DOC-VECTOR type="context" content="purpose='Create or update an item progress record'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:upsert:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Patch an existing item progress record by ID"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply status transition and merge data, then update row"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="ctx RequestContext, body object" outputs="updated record" errors="throws if id missing, record not found, or invalid transition" side_effects="emits audit log"]
// CIL[DOC-MICRO logic_summary="Read id, load record, validate transition, merge data with timestamps, update, and emit log" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  if (!id) throw new Error('Progress record ID is required')

  const { id: _id, force, ...updates } = body || {}

  const { data: existing, error: fetchErr } = await ctx.db
    .from('item_progress')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !existing) throw new Error('Progress record not found')

  if (updates.status && updates.status !== existing.status) {
    const { data: typeRecord } = await adminDb
      .from('types')
      .select('design_schema')
      .eq('id', existing.type_id)
      .single()

    const pipeline = getPipeline(typeRecord)
    if (!force && !isValidTransition(pipeline, existing.status, updates.status)) {
      throw new Error(`Invalid status transition: ${existing.status} → ${updates.status}. Use force: true to override.`)
    }

    const now = new Date().toISOString()
    const mergedData = { ...existing.data, ...(updates.data || {}) }
    if (updates.status === 'in_progress' && !existing.data?.started_at) mergedData.started_at = now
    if (updates.status === 'completed'   && !existing.data?.completed_at) mergedData.completed_at = now
    updates.data = mergedData

    if (!updates.description) {
      updates.description = composeDescription(
        updates.status,
        updates.score ?? existing.score,
        mergedData.attempts ?? null
      )
    }
  }

  const { data: result, error } = await ctx.db
    .from('item_progress')
    .update({ ...updates, updated_by: ctx.principal?.id ?? null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await emitLog(ctx, 'item_progress.updated',
    { type: 'item_progress', id },
    { before: existing, after: result }
  )

  return result
})
// CIL[DOC-VECTOR type="context" content="purpose='Patch an existing item progress record by ID'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:update:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/item-progress.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/item-progress.ts"]
// CIL[DOC-MACRO purpose="Route method-based requests to list, get, upsert, or update"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch GET/POST/PATCH calls to the appropriate handler"]
// CIL[DOC-CONTEXT module="item-progress" layer="framework/functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/item-progress.ts"]
// CIL[DOC-CONTRACT inputs="ctx RequestContext, body object" outputs="handler result" errors="throws for unsupported method" side_effects="calls downstream handlers"]
// CIL[DOC-MICRO logic_summary="Read method and id from query, dispatch to list/get/upsert/update accordingly" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const method = ctx.query?.method || 'GET'
  const id = ctx.query?.id

  if (method === 'GET')   return id ? get(ctx, body) : list(ctx, body)
  if (method === 'POST')  return upsert(ctx, body)
  if (method === 'PATCH') return update(ctx, body)

  throw new Error(`Method ${method} not supported`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Route method-based requests to list, get, upsert, or update'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/item-progress.ts:handler:constant"]
