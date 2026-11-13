



import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { scopeFor, ifAccountScope, canAccessAccount } from './_shared/account-scope'
import { resolveTypeId } from './_shared/resolve-ids'
import { emitLog } from './_shared/audit'
const PIPELINE_DEFAULT = ['not_started', 'in_progress', 'completed']

function getPipeline(typeRecord: any): string[] {
  return typeRecord?.design_schema?.pipeline ?? PIPELINE_DEFAULT
}

function isValidTransition(pipeline: string[], from: string, to: string): boolean {
  const fromIdx = pipeline.indexOf(from)
  const toIdx = pipeline.indexOf(to)
  if (fromIdx === -1 || toIdx === -1) return true
  return toIdx >= fromIdx
}

function composeTitle(itemTitle: string | null, personName: string | null): string | null {
  if (!itemTitle && !personName) return null
  if (!personName) return itemTitle
  if (!itemTitle) return personName
  return `${itemTitle} — ${personName}`
}

function composeDescription(status: string, score: number | null, attempts: number | null): string {
  const parts: string[] = []
  const label = status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'
  parts.push(label)
  if (score !== null && score !== undefined) parts.push(`score ${score}`)
  if (attempts !== null && attempts !== undefined && attempts > 0) parts.push(`${attempts} attempt${attempts === 1 ? '' : 's'}`)
  return parts.join(' · ')
}
export const list = createHandler(async (ctx) => {
  const { person_id, item_id, item_ids, status, limit = '100', offset = '0' } = ctx.query || {}

  let query = ctx.db
    .from('item_progress')
    .select('*')
  query = ifAccountScope(query, (await scopeFor(ctx)).accountIds)
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
export const get = createHandler(async (ctx) => {
  const id = ctx.query?.id
  if (!id) throw new Error('Progress record ID is required')

  const { db: gdb, accountIds } = await scopeFor(ctx)
  const { data, error } = await ifAccountScope(gdb
    .from('item_progress')
    .select('*')
    .eq('id', id), accountIds)
    .single()

  if (error || !data) throw new Error('Progress record not found')
  return data
})
export const upsert = createHandler(async (ctx, body) => {
  const { person_id, item_id, type_id, type_slug, account_id, app_id, force } = body || {}
  let { status, score, data: dataPayload, title, description } = body || {}

  let resolvedTypeId = type_id
  if (!resolvedTypeId && type_slug) {
    resolvedTypeId = await resolveTypeId('item_progress', type_slug)
  }

  if (!person_id || !item_id || !resolvedTypeId) {
    throw new Error('person_id, item_id, and type_id (or type_slug) are required')
  }

  const { db: sdb, accountIds } = await scopeFor(ctx)
  const effectiveAccountId = accountIds === null ? (account_id || ctx.accountId) : ctx.accountId
  if (!effectiveAccountId) throw new Error('account_id is required')
  if (!(await canAccessAccount(ctx, effectiveAccountId))) {
    const e: any = new Error('Cannot write progress in a different account')
    e.statusCode = 403
    throw e
  }
  const { data: personRow } = await sdb
    .from('people')
    .select('id, account_id')
    .eq('id', person_id)
    .maybeSingle()
  if (personRow && personRow.account_id !== effectiveAccountId) {
    const e: any = new Error('person_id belongs to a different account')
    e.statusCode = 403
    throw e
  }

  const { data: typeRecord } = await adminDb
    .from('types')
    .select('design_schema')
    .eq('id', resolvedTypeId)
    .single()

  const pipeline = getPipeline(typeRecord)

  const { data: existing } = await ifAccountScope(sdb
    .from('item_progress')
    .select('*')
    .eq('person_id', person_id)
    .eq('item_id', item_id), accountIds)
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
    account_id: effectiveAccountId,
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

  // account_id is already forced to the caller's account in the payload —
  // PostgREST ignores filters on upsert, so scoping the builder would be a
  // no-op (and .in isn't valid on the pre-write builder anyway).
  const { data: result, error } = await sdb
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
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  if (!id) throw new Error('Progress record ID is required')

  const { id: _id, force, ...updates } = body || {}

  const { db: udb, accountIds } = await scopeFor(ctx)
  const { data: existing, error: fetchErr } = await ifAccountScope(udb
    .from('item_progress')
    .select('*')
    .eq('id', id), accountIds)
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

  const { data: result, error } = await ifAccountScope(udb
    .from('item_progress')
    .update({ ...updates, updated_by: ctx.principal?.id ?? null, updated_at: new Date().toISOString() })
    .eq('id', id), accountIds)
    .select()
    .single()

  if (error) throw error

  await emitLog(ctx, 'item_progress.updated',
    { type: 'item_progress', id },
    { before: existing, after: result }
  )

  return result
})
export const handler = createHandler(async (ctx, body) => {
  const method = ctx.query?.method || 'GET'
  const id = ctx.query?.id

  if (method === 'GET')   return id ? get(ctx, body) : list(ctx, body)
  if (method === 'POST')  return upsert(ctx, body)
  if (method === 'PATCH') return update(ctx, body)

  throw new Error(`Method ${method} not supported`)
})
