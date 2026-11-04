// CIL[BEGIN stable_id="~/.framework/functions/deliveries.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/deliveries.ts"]
// CIL[DOC-MACRO purpose="Module: webhook delivery handlers"]
// CIL[DOC-RESPONSIBILITY responsibility="Exports list, get, retry, and handler functions for delivery operations."]
// CIL[DOC-CONTEXT module="deliveries" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Collects delivery-related handlers into a single functions module." notable_decisions="Uses createHandler for request shape; handler dispatches to list/get/retry based on action and method."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import { createHandler } from './_shared/middleware'
import { emitLog } from './_shared/audit'
import { SYSTEM_PRINCIPAL, isSystemPrincipal } from './_shared/principal'
import { execute as executeOutbound } from './integration-outbound'
// CIL[END stable_id="~/.framework/functions/deliveries.ts:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='Module: webhook delivery handlers'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// True only for platform-level principals: a system_admin role or an
// internal machine principal with no account binding (SYSTEM_PRINCIPAL,
// produced only by the INTERNAL_INVOKE_SECRET path). Machine principals
// resolve to the service-role adminDb via getPrincipalDb, so account-bound
// API keys must be scoped to their own account below.

// CIL[DOC-MACRO purpose="List webhook deliveries for the current account with optional filters."]
// CIL[DOC-RESPONSIBILITY responsibility="Query and return a paginated list of webhook deliveries."]
// CIL[DOC-CONTEXT module="deliveries" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/deliveries.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query with optional direction, status, integration_id, api_key_id, limit, offset" outputs="Array of webhook_deliveries rows" errors="Throws on database error or missing account context" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Builds a Supabase query for webhook_deliveries scoped to the account, applies optional equality filters, and returns a paginated range of results." notable_decisions="Defaults limit to 100 and offset to 0; returns empty array when no data."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/deliveries.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/deliveries.ts"]
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
// CIL[END stable_id="~/.framework/functions/deliveries.ts:list:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='List webhook deliveries for the current account with optional filters.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Retrieve a single webhook delivery by ID."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and return one webhook delivery record."]
// CIL[DOC-CONTEXT module="deliveries" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/deliveries.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id" outputs="Single webhook_deliveries row" errors="Throws if ID missing or database error" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Selects a single webhook delivery matching the provided id." notable_decisions="Assumes id is present and unique; throws generic database error."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/deliveries.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/deliveries.ts"]
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
// CIL[END stable_id="~/.framework/functions/deliveries.ts:get:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Retrieve a single webhook delivery by ID.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Manually retry an outbound webhook delivery."]
// CIL[DOC-RESPONSIBILITY responsibility="Validate the delivery exists and is outbound, then re-run the outbound executor."]
// CIL[DOC-CONTEXT module="deliveries" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/deliveries.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="body.id" outputs="Result of the outbound execution" errors="Throws if delivery not found, not outbound, or outbound execution fails" side_effects="Emits audit log and re-executes the outbound integration"]
// CIL[DOC-MICRO logic_summary="Loads the delivery by id, restricts to outbound direction, builds a retry context using the stored account and system principal, invokes executeOutbound, and logs the retry." notable_decisions="Uses SYSTEM_PRINCIPAL for retries; emits audit log with delivery metadata."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/deliveries.ts:retry:constant" type="constant" identity="retry" parent="~/.framework/functions/deliveries.ts"]
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
// CIL[END stable_id="~/.framework/functions/deliveries.ts:retry:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Manually retry an outbound webhook delivery.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Route delivery requests to list, get, or retry handlers."]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch incoming requests based on action and HTTP method."]
// CIL[DOC-CONTEXT module="deliveries" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/deliveries.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.action, ctx.query.method, ctx.query.id, body" outputs="Result of list, get, or retry" errors="Throws on invalid action or method" side_effects="Delegates to other handlers"]
// CIL[DOC-MICRO logic_summary="Routes GET requests with id to get, without id to list, and POST action retry to retry; otherwise throws." notable_decisions="Defaults method to GET; validates action and method combination."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/functions/deliveries.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/deliveries.ts"]
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
// CIL[END stable_id="~/.framework/functions/deliveries.ts:handler:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Route delivery requests to list, get, or retry handlers.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
