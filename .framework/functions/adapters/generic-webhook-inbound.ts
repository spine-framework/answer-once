// CIL[BEGIN stable_id="~/.framework/functions/adapters/generic-webhook-inbound.ts:InboundAdapterContext:interface" type="interface" identity="InboundAdapterContext" parent="~/.framework/functions/adapters/generic-webhook-inbound.ts"]
// CIL[DOC-MACRO purpose="Defines the context structure passed to the generic inbound webhook adapter, including integration, credentials, account, app, event, and logger references."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the typed shape of inbound webhook adapter context for TypeScript consumers."]
// CIL[DOC-CONTEXT module="functions/adapters" layer="adapter" related_files=".framework/functions/adapters/generic-webhook-inbound.ts"]
// CIL[DOC-CONTRACT inputs="none (type definition)" outputs="interface InboundAdapterContext" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Plain interface declaration with optional and required fields." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]



interface InboundAdapterContext {
  integration: any
  apiKey: any
  accountId: string
  appId?: string
  event: string | null
  logger: { info: (msg: string, meta?: any) => void; warn: (msg: string, meta?: any) => void; error: (msg: string, meta?: any) => void }
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the context structure passed to the generic inbound webhook adapter, including integration, credentials, account, app, event, and logger references.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/adapters/generic-webhook-inbound.ts:InboundAdapterContext:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/adapters/generic-webhook-inbound.ts:AdapterResult:interface" type="interface" identity="AdapterResult" parent="~/.framework/functions/adapters/generic-webhook-inbound.ts"]
// CIL[DOC-MACRO purpose="Defines the standardized result shape returned by the generic inbound webhook adapter."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the typed shape of webhook adapter results."]
// CIL[DOC-CONTEXT module="functions/adapters" layer="adapter" related_files=".framework/functions/adapters/generic-webhook-inbound.ts"]
// CIL[DOC-CONTRACT inputs="none (type definition)" outputs="interface AdapterResult" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Plain interface declaration for adapter output fields." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AdapterResult {
  type_slug: string
  data: Record<string, any>
  title?: string
  status?: string
  external_id?: string
  error?: string
  retryable?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the standardized result shape returned by the generic inbound webhook adapter.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/adapters/generic-webhook-inbound.ts:AdapterResult:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/adapters/generic-webhook-inbound.ts:adapt:function" type="function" identity="adapt" parent="~/.framework/functions/adapters/generic-webhook-inbound.ts"]
// CIL[DOC-MACRO purpose="Adapts an incoming generic webhook payload into a normalized AdapterResult for further pipeline processing."]
// CIL[DOC-RESPONSIBILITY responsibility="Transforms raw webhook payload and context into a standardized record representation."]
// CIL[DOC-CONTEXT module="functions/adapters" layer="adapter" related_files=".framework/functions/adapters/generic-webhook-inbound.ts"]
// CIL[DOC-CONTRACT inputs="payload: any, ctx: InboundAdapterContext" outputs="Promise<AdapterResult>" errors="" side_effects="logs receipt via ctx.logger"]
// CIL[DOC-MICRO logic_summary="Logs receipt, extracts provider/event/account details, builds a title, and returns a normalized webhook_event result." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Adapts an incoming generic webhook payload into a normalized AdapterResult for further pipeline processing.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/adapters/generic-webhook-inbound.ts:adapt:function"]

