
// integration-outbound is imported lazily — a static edge closes the cycle
// middleware → security → rate-limit → funnel → trigger-engine →
// pipeline-runner → kb → llm → integration-outbound → admin-data → middleware,
// leaving createHandler undefined during module evaluation.
const executeOutbound = async (ctx: any, args: any) =>
  (await import('../integration-outbound')).execute(ctx, args)
import { adminDb } from './db'
import { SYSTEM_PRINCIPAL } from './principal'


export interface LlmContext {
  db?: any
  principal?: any
  accountId?: string | null
  requestId?: string
  integration?: any
}


function buildCoreContext(ctx?: LlmContext): any {
  return ctx || {
    db: adminDb,
    principal: SYSTEM_PRINCIPAL,
    accountId: null,
    requestId: crypto.randomUUID()
  }
}


// Relies on the integration-outbound executor for credential handling and retries
export async function callOpenAI(ctx: LlmContext | undefined, endpoint: string, body: any): Promise<any> {
  const coreCtx = buildCoreContext(ctx)
  const result = await executeOutbound(coreCtx, {
    integration_slug: 'openai',
    action_config: { endpoint, body, credential_field: 'api_token' }
  })
  return result.response_body
}


export async function callOpenAIEmbeddings(
  ctx: LlmContext | undefined,
  inputs: string[],
  model = 'text-embedding-3-small'
): Promise<any> {
  const integration = ctx?.integration
  const resolvedModel = integration?.config?.models?.embedding || model
  return callOpenAI(ctx, '/embeddings', {
    model: resolvedModel,
    input: inputs
  })
}


export async function callOpenAIChat(
  ctx: LlmContext | undefined,
  messages: any[],
  model = 'gpt-4o-mini',
  options: { temperature?: number; max_tokens?: number; tools?: any[]; tool_choice?: any; response_format?: any } = {}
): Promise<any> {
  const integration = ctx?.integration
  const resolvedModel = integration?.config?.models?.chat || model
  const body: any = {
    model: resolvedModel,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 4000
  }
  if (options.tools?.length) {
    body.tools = options.tools
    body.tool_choice = options.tool_choice ?? 'auto'
  }
  if (options.response_format) {
    body.response_format = options.response_format
  }
  return callOpenAI(ctx, '/chat/completions', body)
}


export async function callEmbeddingApi(inputs: string[], model = 'text-embedding-3-small'): Promise<number[][]> {
  if (!inputs.length) throw new Error('No inputs provided')
  const j = await callOpenAIEmbeddings(undefined, inputs, model)
  return (j.data || [])
    .sort((a: any, b: any) => a.index - b.index)
    .map((d: any) => d.embedding)
}
