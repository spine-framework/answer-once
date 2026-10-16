// CIL[BEGIN stable_id="~/.framework/functions/_shared/llm.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/llm.ts"]
// CIL[DOC-MACRO purpose="Shared LLM integration entry point for OpenAI chat and embeddings"]
// CIL[DOC-RESPONSIBILITY responsibility="Import shared dependencies and export the LlmContext type and helper functions used by LLM callers"]
// CIL[DOC-CONTEXT module="llm" layer="functions/shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="LlmContext type, buildCoreContext, callOpenAI, callOpenAIEmbeddings, callOpenAIChat, callEmbeddingApi" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Provides the shared LLM context shape and thin async wrappers around the OpenAI outbound integration" notable_decisions="Context fields are intentionally permissive (any) to stay flexible across callers"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="framework developers"]

// integration-outbound is imported lazily — a static edge closes the cycle
// middleware → security → rate-limit → funnel → trigger-engine →
// pipeline-runner → kb → llm → integration-outbound → admin-data → middleware,
// leaving createHandler undefined during module evaluation.
const executeOutbound = async (ctx: any, args: any) =>
  (await import('../integration-outbound')).execute(ctx, args)
import { adminDb } from './db'
import { SYSTEM_PRINCIPAL } from './principal'
// CIL[DOC-VECTOR type="context" content="purpose='Shared LLM integration entry point for OpenAI chat and embeddings'; No verified external callers; imports: .framework/functions/integration-outbound.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/llm.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/llm.ts:LlmContext:interface" type="interface" identity="LlmContext" parent="~/.framework/functions/_shared/llm.ts"]
// CIL[DOC-MACRO purpose="Define the shared context shape passed to LLM helper functions"]
// CIL[DOC-RESPONSIBILITY responsibility="Carry optional request, database, principal, account, and integration references for LLM calls"]
// CIL[DOC-CONTEXT module="llm" layer="functions/shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="LlmContext object shape" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional fields: db, principal, accountId, requestId, integration" notable_decisions="All fields are optional to allow default context building"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface LlmContext {
  db?: any
  principal?: any
  accountId?: string | null
  requestId?: string
  integration?: any
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shared context shape passed to LLM helper functions'; No verified external callers; imports: .framework/functions/integration-outbound.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/llm.ts:LlmContext:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/llm.ts:buildCoreContext:function" type="function" identity="buildCoreContext" parent="~/.framework/functions/_shared/llm.ts"]
// CIL[DOC-MACRO purpose="Assemble a fallback LlmContext from shared defaults"]
// CIL[DOC-RESPONSIBILITY responsibility="Merge the supplied context with admin db and system principal defaults when one is not provided"]
// CIL[DOC-CONTEXT module="llm" layer="functions/shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="ctx?: LlmContext" outputs="LlmContext" errors="none" side_effects="generates a random UUID for requestId"]
// CIL[DOC-MICRO logic_summary="Return the provided context or a default object containing adminDb, SYSTEM_PRINCIPAL, a null accountId, and a fresh crypto.randomUUID" notable_decisions="Uses crypto.randomUUID for request tracking"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function buildCoreContext(ctx?: LlmContext): any {
  return ctx || {
    db: adminDb,
    principal: SYSTEM_PRINCIPAL,
    accountId: null,
    requestId: crypto.randomUUID()
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Assemble a fallback LlmContext from shared defaults'; No verified external callers; imports: .framework/functions/integration-outbound.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/llm.ts:buildCoreContext:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/llm.ts:callOpenAI:function" type="function" identity="callOpenAI" parent="~/.framework/functions/_shared/llm.ts"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
  // CIL[DOC-CONTEXT module="llm" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Execute an arbitrary OpenAI API request through the outbound integration"]
// CIL[DOC-RESPONSIBILITY responsibility="Build core context, call the openai integration, and return the response body"]
// CIL[DOC-CONTRACT inputs="ctx: LlmContext | undefined, endpoint: string, body: any" outputs="any (response_body)" errors="throws on outbound integration or HTTP failure" side_effects="calls the external OpenAI HTTP endpoint through the integration"]
// CIL[DOC-MICRO logic_summary="Wraps executeOutbound with the openai slug and the supplied endpoint/body, then returns result.response_body" notable_decisions="Relies on the integration-outbound executor for credential handling and retries"]
// CIL[DOC-STABILITY stable]
export async function callOpenAI(ctx: LlmContext | undefined, endpoint: string, body: any): Promise<any> {
  const coreCtx = buildCoreContext(ctx)
  const result = await executeOutbound(coreCtx, {
    integration_slug: 'openai',
    action_config: { endpoint, body, credential_field: 'api_token' }
  })
  return result.response_body
}
// CIL[END stable_id="~/.framework/functions/_shared/llm.ts:callOpenAI:function"]

// CIL[DOC-VECTOR type="context" content="purpose='Execute an arbitrary OpenAI API request through the outbound integration'; No verified external callers; imports: .framework/functions/integration-outbound.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/llm.ts:callOpenAIEmbeddings:function" type="function" identity="callOpenAIEmbeddings" parent="~/.framework/functions/_shared/llm.ts"]
// CIL[DOC-MACRO purpose="Request text embeddings from OpenAI for a list of strings"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the configured embedding model and delegate the request to callOpenAI"]
// CIL[DOC-CONTEXT module="llm" layer="functions/shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LlmContext | undefined, inputs: string[], model?: string" outputs="Promise<any> (OpenAI embeddings response)" errors="propagates callOpenAI errors" side_effects="calls the OpenAI /embeddings endpoint"]
// CIL[DOC-MICRO logic_summary="Selects the model from ctx.integration.config.models.embedding or the default, then calls callOpenAI with the embeddings endpoint and input array" notable_decisions="Falls back to text-embedding-3-small when no custom model is configured"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Request text embeddings from OpenAI for a list of strings'; No verified external callers; imports: .framework/functions/integration-outbound.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/llm.ts:callOpenAIEmbeddings:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/llm.ts:callOpenAIChat:function" type="function" identity="callOpenAIChat" parent="~/.framework/functions/_shared/llm.ts"]
// CIL[DOC-MACRO purpose="Send a chat completion request to OpenAI"]
// CIL[DOC-RESPONSIBILITY responsibility="Build a chat request body with optional tools and response format and return the OpenAI response"]
// CIL[DOC-CONTEXT module="llm" layer="functions/shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LlmContext | undefined, messages: any[], model?: string, options?: { temperature?: number; max_tokens?: number; tools?: any[]; tool_choice?: any; response_format?: any }" outputs="Promise<any> (OpenAI chat completion response)" errors="propagates callOpenAI errors" side_effects="calls the OpenAI /chat/completions endpoint"]
// CIL[DOC-MICRO logic_summary="Resolves the chat model, builds a body with temperature 0.7 and max_tokens 4000 defaults, appends tools and response_format when provided, then calls callOpenAI" notable_decisions="Uses gpt-4o-mini as the default chat model"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[END stable_id="~/.framework/functions/_shared/llm.ts:callOpenAIChat:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Send a chat completion request to OpenAI'; No verified external callers; imports: .framework/functions/integration-outbound.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/llm.ts:callEmbeddingApi:function" type="function" identity="callEmbeddingApi" parent="~/.framework/functions/_shared/llm.ts"]
// CIL[DOC-MACRO purpose="Generate and normalize a numeric embedding matrix from string inputs"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate input, request embeddings, sort by index, and extract embedding vectors"]
// CIL[DOC-CONTEXT module="llm" layer="functions/shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="inputs: string[], model?: string" outputs="Promise<number[][]>" errors="throws 'No inputs provided' when inputs is empty" side_effects="calls callOpenAIEmbeddings"]
// CIL[DOC-MICRO logic_summary="Throws if inputs is empty, fetches embeddings, sorts each result by its index, and maps to d.embedding arrays" notable_decisions="Returns an empty array when j.data is missing"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export async function callEmbeddingApi(inputs: string[], model = 'text-embedding-3-small'): Promise<number[][]> {
  if (!inputs.length) throw new Error('No inputs provided')
  const j = await callOpenAIEmbeddings(undefined, inputs, model)
  return (j.data || [])
    .sort((a: any, b: any) => a.index - b.index)
    .map((d: any) => d.embedding)
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate and normalize a numeric embedding matrix from string inputs'; No verified external callers; imports: .framework/functions/integration-outbound.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/llm.ts:callEmbeddingApi:function"]
