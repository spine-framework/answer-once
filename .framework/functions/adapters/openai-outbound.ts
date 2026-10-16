// CIL[BEGIN stable_id="~/.framework/functions/adapters/openai-outbound.ts:buildRequest:function" type="function" identity="buildRequest" parent="~/.framework/functions/adapters/openai-outbound.ts"]
// CIL[DOC-MACRO purpose="Build an outbound HTTP request for the OpenAI API"]
// CIL[DOC-RESPONSIBILITY responsibility="Construct the request payload and headers for an OpenAI API call, validating endpoint and apiKey"]
// CIL[DOC-CONTEXT module="openai-outbound" layer="adapter" related_files=".framework/functions/adapters/openai-outbound.ts"]
// CIL[DOC-CONTRACT inputs="_record (unused), ctx (execution context with integration config, action config, and apiKey)" outputs="Request object with url, method, headers, and body" errors="Throws if endpoint or apiKey is missing" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads base URL, endpoint, and API key from ctx; validates them; builds and returns a POST request object" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function buildRequest(_record: any, ctx: any) {
  const baseUrl = ctx?.integration?.config?.base_url || 'https://api.openai.com/v1'
  const endpoint = ctx?.actionConfig?.endpoint
  const apiKey = ctx?.apiKey?.value

  if (!endpoint) {
    throw new Error('OpenAI adapter requires action_config.endpoint')
  }
  if (!apiKey) {
    throw new Error('OpenAI adapter requires api_token credential')
  }

  return {
    url: `${baseUrl.replace(/\/$/, '')}${endpoint}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: ctx?.actionConfig?.body || {}
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Build an outbound HTTP request for the OpenAI API'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/adapters/openai-outbound.ts:buildRequest:function"]

