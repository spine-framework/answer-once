// CIL[BEGIN stable_id="~/.framework/functions/integration-routes.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/integration-routes.ts"]
// CIL[DOC-MACRO purpose="Netlify function entry point for inbound integration webhooks"]
// CIL[DOC-RESPONSIBILITY responsibility="Import shared modules and export the public execute/default handlers"]
// CIL[DOC-CONTEXT module="integration-routes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/webhook-registry.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports dependencies and wires the default public handler" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system-ai"]

import { createPublicHandler, CoreContext } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { resolveHandler } from './_shared/webhook-registry'
import { create as adminDataCreate } from './admin-data'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function entry point for inbound integration webhooks'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-routes.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-routes.ts:InboundAdapterContext:interface" type="interface" identity="InboundAdapterContext" parent="~/.framework/functions/integration-routes.ts"]
// CIL[DOC-MACRO purpose="Defines the context passed to inbound webhook adapters"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide typed fields for adapter input, integration, API key, event, headers and logging"]
// CIL[DOC-CONTEXT module="integration-routes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/webhook-registry.ts,.framework/functions/admin-data.ts,.framework/functions/integration-routes.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface describing the shape of the inbound adapter context" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface InboundAdapterContext {
  payload: any
  integration: any
  apiKey: any
  accountId: string | null
  appId: string | null
  event: string | null
  headers: Record<string, string>
  logger: { info: (msg: string, meta?: any) => void; warn: (msg: string, meta?: any) => void; error: (msg: string, meta?: any) => void }
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the context passed to inbound webhook adapters'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-routes.ts:InboundAdapterContext:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-routes.ts:AdapterResult:interface" type="interface" identity="AdapterResult" parent="~/.framework/functions/integration-routes.ts"]
// CIL[DOC-MACRO purpose="Describes the normalized result returned by inbound webhook adapters"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a typed contract for adapter transformation output"]
// CIL[DOC-CONTEXT module="integration-routes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/webhook-registry.ts,.framework/functions/admin-data.ts,.framework/functions/integration-routes.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface describing the normalized adapter result shape" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AdapterResult {
  type_slug: string
  data: Record<string, any>
  title?: string
  status?: string
  thread?: any
  links?: any[]
  external_id?: string
  error?: string
  retryable?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Describes the normalized result returned by inbound webhook adapters'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-routes.ts:AdapterResult:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-routes.ts:getClientIp:function" type="function" identity="getClientIp" parent="~/.framework/functions/integration-routes.ts"]
// CIL[DOC-MACRO purpose="Extract the client IP from a request event"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the X-Forwarded-For header from the incoming event"]
// CIL[DOC-CONTEXT module="integration-routes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/webhook-registry.ts,.framework/functions/admin-data.ts,.framework/functions/integration-routes.ts"]
// CIL[DOC-CONTRACT inputs="event" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fallback across lowercase and uppercase header forms, defaulting to 'unknown'" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getClientIp(event: any): string {
  return event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || 'unknown'
}
// CIL[DOC-VECTOR type="context" content="purpose='Extract the client IP from a request event'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-routes.ts:getClientIp:function"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-routes.ts:computeNextAttempt:function" type="function" identity="computeNextAttempt" parent="~/.framework/functions/integration-routes.ts"]
// CIL[DOC-MACRO purpose="Calculate the next retry timestamp for a failed webhook delivery"]
// CIL[DOC-RESPONSIBILITY responsibility="Compute an exponential backoff delay with jitter, capped at a maximum"]
// CIL[DOC-CONTEXT module="integration-routes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/webhook-registry.ts,.framework/functions/admin-data.ts,.framework/functions/integration-routes.ts"]
// CIL[DOC-CONTRACT inputs="attemptCount, baseMs, maxDelayMs" outputs="Date" errors="none" side_effects="uses Math.random"]
// CIL[DOC-MICRO logic_summary="Doubles the base delay per attempt, adds up to 20% jitter, and clamps to the configured max" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function computeNextAttempt(attemptCount: number, baseMs = 30000, maxDelayMs = 3600000): Date {
  const delay = Math.min(baseMs * Math.pow(2, attemptCount), maxDelayMs)
  const jitter = Math.floor(Math.random() * delay * 0.2)
  return new Date(Date.now() + delay + jitter)
}
// CIL[DOC-VECTOR type="context" content="purpose='Calculate the next retry timestamp for a failed webhook delivery'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-routes.ts:computeNextAttempt:function"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-routes.ts:extractEvent:function" type="function" identity="extractEvent" parent="~/.framework/functions/integration-routes.ts"]
// CIL[DOC-MACRO purpose="Determine the event name from an inbound webhook payload"]
// CIL[DOC-RESPONSIBILITY responsibility="Extract the event from a header or a dotted path in the payload"]
// CIL[DOC-CONTEXT module="integration-routes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/webhook-registry.ts,.framework/functions/admin-data.ts,.framework/functions/integration-routes.ts"]
// CIL[DOC-CONTRACT inputs="payload, eventHeader, eventPath" outputs="string | null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns the header value directly when provided; otherwise navigates the payload object by the dotted path and coerces to null if missing or empty" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function extractEvent(payload: any, eventHeader?: string | null, eventPath?: string | null): string | null {
  if (eventHeader) {
    const h = eventHeader.toLowerCase()
    return eventHeader
  }
  if (eventPath) {
    const parts = eventPath.split('.')
    let current = payload
    for (const p of parts) {
      if (current == null) return null
      current = current[p]
    }
    return current || null
  }
  return null
}
// CIL[DOC-VECTOR type="context" content="purpose='Determine the event name from an inbound webhook payload'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-routes.ts:extractEvent:function"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-routes.ts:execute:function" type="function" identity="execute" parent="~/.framework/functions/integration-routes.ts"]
// CIL[DOC-MACRO purpose="Main inbound webhook execution handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate the request, resolve the integration and adapter, persist delivery records, and create the resulting item"]
// CIL[DOC-CONTEXT module="integration-routes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/webhook-registry.ts,.framework/functions/admin-data.ts,.framework/functions/integration-routes.ts"]
// CIL[DOC-CONTRACT inputs="ctx, body" outputs="record" errors="400, 401, 403, 404, adapter error" side_effects="Inserts and updates webhook_deliveries, emits audit logs, calls admin-data create"]
// CIL[DOC-MICRO logic_summary="Performs API key and integration authorization, extracts event, resolves the adapter, persists a delivery record, invokes the adapter, updates delivery status, and creates an admin-data record from the adapter result" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function execute(ctx: CoreContext, body: any = {}): Promise<any> {
  const slug = ctx.query?.slug || body?.slug

  if (!slug) {
    const e: any = new Error('Integration slug is required')
    e.statusCode = 400
    throw e
  }

  const apiKeyId = ctx.principal?.id
  if (!apiKeyId) {
    const e: any = new Error('Machine principal required')
    e.statusCode = 401
    throw e
  }

  const { data: apiKey, error: apiKeyError } = await adminDb
    .from('api_keys')
    .select('*')
    .eq('id', apiKeyId)
    .single()

  if (apiKeyError || !apiKey) {
    const e: any = new Error('Invalid API key')
    e.statusCode = 401
    throw e
  }

  const { data: integration, error: integrationError } = await adminDb
    .from('integrations')
    .select('*')
    .eq('slug', slug)
    .eq('account_id', apiKey.account_id)
    .eq('is_active', true)
    .single()

  if (integrationError || !integration) {
    const e: any = new Error(`Integration not found: ${slug}`)
    e.statusCode = 404
    throw e
  }

  if (apiKey.integration_id && apiKey.integration_id !== integration.id) {
    const e: any = new Error('API key is not authorized for this integration')
    e.statusCode = 403
    throw e
  }

  if (apiKey.app_id && integration.app_id && apiKey.app_id !== integration.app_id) {
    const e: any = new Error('API key is not authorized for this app')
    e.statusCode = 403
    throw e
  }

  const event = extractEvent(
    body,
    (ctx as any).headers?.['x-event-type'] || (ctx as any).headers?.['X-Event-Type'],
    integration.config?.event_path
  )

  const handlerName = integration.config?.handler_name || integration.provider || 'generic-webhook'
  const adapter = await resolveHandler(handlerName, integration.app_id, integration.account_id)

  if (!adapter) {
    const e: any = new Error(`Handler not found: ${handlerName}`)
    e.statusCode = 404
    throw e
  }

  const deliveryPayload = {
    direction: 'inbound',
    integration_id: integration.id,
    api_key_id: apiKey.id,
    handler_name: handlerName,
    external_id: body?.id || null,
    payload: body,
    status: 'pending',
    attempt_count: 0,
    max_attempts: integration.config?.retry_policy?.max_attempts ?? 3,
    next_attempt_at: null,
    account_id: integration.account_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: deliveryRow, error: deliveryInsertError } = await adminDb
    .from('webhook_deliveries')
    .insert(deliveryPayload)
    .select('id')
    .single()

  if (deliveryInsertError || !deliveryRow) {
    throw new Error('Failed to create inbound delivery record')
  }

  const deliveryId = deliveryRow.id

  await emitLog(ctx, 'integration.inbound.started', { type: 'integration', id: integration.id }, undefined, {
    delivery_id: deliveryId,
    integration_id: integration.id,
    api_key_id: apiKey.id,
    account_id: integration.account_id,
    event
  })

  const logger = {
    info: (msg: string, meta?: any) => console.log(`[integration-routes] ${msg}`, meta),
    warn: (msg: string, meta?: any) => console.warn(`[integration-routes] ${msg}`, meta),
    error: (msg: string, meta?: any) => console.error(`[integration-routes] ${msg}`, meta)
  }

  const adapterCtx: InboundAdapterContext = {
    payload: body,
    integration,
    apiKey,
    accountId: integration.account_id,
    appId: integration.app_id,
    event,
    headers: (ctx as any).headers || {},
    logger
  }

  try {
    const adapterResult: AdapterResult = await adapter(adapterCtx.payload, adapterCtx)

    if (adapterResult.error) {
      const status = adapterResult.retryable ? 'pending' : 'failed'
      const nextAttempt = adapterResult.retryable ? computeNextAttempt(1).toISOString() : null

      await adminDb
        .from('webhook_deliveries')
        .update({
          status,
          attempt_count: 1,
          next_attempt_at: nextAttempt,
          last_error: adapterResult.error,
          updated_at: new Date().toISOString()
        })
        .eq('id', deliveryId)

      await emitLog(ctx, adapterResult.retryable ? 'integration.inbound.adapter_retryable' : 'integration.inbound.adapter_failed', { type: 'integration', id: integration.id }, undefined, {
        delivery_id: deliveryId,
        error: adapterResult.error,
        account_id: integration.account_id
      })

      throw new Error(adapterResult.error)
    }

    if (!adapterResult.type_slug) {
      throw new Error('Adapter result is missing type_slug')
    }

    const adminCtx: any = {
      ...ctx,
      db: adminDb,
      accountId: integration.account_id,
      principal: {
        ...ctx.principal,
        id: null,
        accountId: integration.account_id
      }
    }

    const createBody: any = {
      entity: 'items',
      type_slug: adapterResult.type_slug,
      title: adapterResult.title,
      status: adapterResult.status,
      data: adapterResult.data
    }

    const record = await adminDataCreate(adminCtx, createBody)

    if (adapterResult.thread) {
      // TODO: create thread via admin-data if needed
    }

    if (adapterResult.links?.length) {
      // TODO: create links via admin-data if needed
    }

    await adminDb
      .from('webhook_deliveries')
      .update({
        status: 'delivered',
        attempt_count: 1,
        next_attempt_at: null,
        response_status: 200,
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryId)

    await emitLog(ctx, 'integration.inbound.delivered', { type: 'integration', id: integration.id }, undefined, {
      delivery_id: deliveryId,
      record_id: record?.id,
      account_id: integration.account_id
    })

    return record
  } catch (err: any) {
    await adminDb
      .from('webhook_deliveries')
      .update({
        status: 'pending',
        attempt_count: 1,
        next_attempt_at: computeNextAttempt(1).toISOString(),
        last_error: err.message || String(err),
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryId)

    await emitLog(ctx, 'integration.inbound.error', { type: 'integration', id: integration.id }, undefined, {
      delivery_id: deliveryId,
      error: err.message || String(err),
      account_id: integration.account_id
    })

    throw err
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Main inbound webhook execution handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-routes.ts:execute:function"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-routes.ts:default:function" type="function" identity="default" parent="~/.framework/functions/integration-routes.ts"]
// CIL[DOC-MACRO purpose="Exports the named Netlify v1 handler wrapping execute in public middleware"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose execute as the public Netlify function entry point; MUST stay a named 'handler' export — 'export default' makes zip-it-and-ship-it bundle the function as API v2 (Request/Response), which rejects the v1 {statusCode, body} result"]
// CIL[DOC-CONTEXT module="integration-routes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/webhook-registry.ts,.framework/functions/admin-data.ts,.framework/functions/integration-routes.ts"]
// CIL[DOC-CONTRACT inputs="none (createPublicHandler wraps execute)" outputs="public handler" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps the execute function with createPublicHandler for public invocation" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createPublicHandler(execute)
// CIL[DOC-VECTOR type="context" content="purpose='Exports the default Netlify handler wrapping execute in public middleware'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-routes.ts:default:function"]

