
import { createHandler } from './_shared/middleware'
import { emitLog } from './_shared/audit'
import { SYSTEM_PRINCIPAL, isSystemPrincipal } from './_shared/principal'
import { execute as executeOutbound } from './integration-outbound'

// True only for platform-level principals: a system_admin role or an
// internal machine principal with no account binding (SYSTEM_PRINCIPAL,
// produced only by the INTERNAL_INVOKE_SECRET path). Machine principals
// resolve to the service-role adminDb via getPrincipalDb, so account-bound
// API keys must be scoped to their own account below.

export const list = createHandler(async (ctx, _body) => {
  const { direction, status, integration_id, api_key_id, limit = 100, offset = 0 } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  let query = ctx.db
    .from('webhook_deliveries')
    .select('*')
    .eq('account_id', ctx.accountId)
    .order('created_at', { ascending: false })

  if (direction) query = query.eq('direction', direction)
  if (status) query = query.eq('status', status)
  if (integration_id) query = query.eq('integration_id', integration_id)
  if (api_key_id) query = query.eq('api_key_id', api_key_id)

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err
  return data || []
})

export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) throw new Error('Delivery ID is required')

  let query = ctx.db
    .from('webhook_deliveries')
    .select('*')
    .eq('id', id)

  if (!isSystemPrincipal(ctx)) {
    if (!ctx.accountId) throw new Error('Account context required')
    query = query.eq('account_id', ctx.accountId)
  }

  const { data, error: err } = await query.single()

  if (err) throw err
  return data
})

export const retry = createHandler(async (ctx, body) => {
  const { id } = body

  if (!id) throw new Error('Delivery ID is required')

  const { data: delivery, error } = await ctx.db
    .from('webhook_deliveries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !delivery) throw new Error('Delivery not found')

  // Retry re-executes the delivery under its own account as SYSTEM_PRINCIPAL,
  // so the caller must be entitled to that account first: system-level
  // callers pass through; everyone else may only retry their own account's
  // deliveries.
  if (!isSystemPrincipal(ctx) && (!ctx.accountId || delivery.account_id !== ctx.accountId)) {
    const e: any = new Error('Insufficient permissions to retry this delivery')
    e.statusCode = 403
    throw e
  }

  if (delivery.direction !== 'outbound') {
    throw new Error('Manual retry is only supported for outbound deliveries in this release')
  }

  const retryCtx = {
    ...ctx,
    db: ctx.db,
    accountId: delivery.account_id,
    principal: SYSTEM_PRINCIPAL
  }

  const result = await executeOutbound(retryCtx, { delivery_id: delivery.id })

  await emitLog(ctx, 'delivery.manual_retry', { type: 'webhook_delivery', id }, undefined, {
    direction: delivery.direction,
    integration_id: delivery.integration_id,
    account_id: ctx.accountId
  })

  return result
})

export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'retry':
      if (method === 'POST') return await retry(ctx, body)
      break
    default:
      if (method === 'GET') {
        if (ctx.query?.id) return await get(ctx, body)
        return await list(ctx, body)
      }
  }

  throw new Error('Invalid action or method')
})
