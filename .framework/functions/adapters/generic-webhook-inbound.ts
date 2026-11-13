


interface InboundAdapterContext {
  integration: any
  apiKey: any
  accountId: string
  appId?: string
  event: string | null
  logger: { info: (msg: string, meta?: any) => void; warn: (msg: string, meta?: any) => void; error: (msg: string, meta?: any) => void }
}


interface AdapterResult {
  type_slug: string
  data: Record<string, any>
  title?: string
  status?: string
  external_id?: string
  error?: string
  retryable?: boolean
}


export async function adapt(payload: any, ctx: InboundAdapterContext): Promise<AdapterResult> {
  ctx.logger.info('generic-webhook-inbound received payload', {
    provider: ctx.integration?.provider,
    event: ctx.event,
    account_id: ctx.accountId
  })

  return {
    type_slug: 'webhook_event',
    title: `${ctx.integration?.provider || 'unknown'} ${ctx.event || 'webhook'}`,
    data: {
      provider: ctx.integration?.provider || 'unknown',
      event: ctx.event,
      payload: payload,
      headers: ctx.apiKey ? {} : {}
    },
    external_id: ctx.event
  }
}

