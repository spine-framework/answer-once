
import { createPublicHandler, CoreContext } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { resolveHandler } from './_shared/webhook-registry'
import { create as adminDataCreate } from './admin-data'

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

function getClientIp(event: any): string {
  return event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || 'unknown'
}

function computeNextAttempt(attemptCount: number, baseMs = 30000, maxDelayMs = 3600000): Date {
  const delay = Math.min(baseMs * Math.pow(2, attemptCount), maxDelayMs)
  const jitter = Math.floor(Math.random() * delay * 0.2)
  return new Date(Date.now() + delay + jitter)
}

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

export const handler = createPublicHandler(execute)

