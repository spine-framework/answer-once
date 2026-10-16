// CIL[BEGIN stable_id="~/.framework/functions/adapters/generic-webhook-outbound.ts:buildRequest:function" type="function" identity="buildRequest" parent="~/.framework/functions/adapters/generic-webhook-outbound.ts"]
// CIL[DOC-MACRO purpose="Build an outbound HTTP request payload for the generic webhook adapter"]
// CIL[DOC-RESPONSIBILITY responsibility="Construct the URL, method, headers, and body for a webhook call based on action configuration and API key"]
// CIL[DOC-CONTEXT module="generic-webhook-outbound" layer="adapter" related_files=".framework/functions/adapters/generic-webhook-outbound.ts"]
// CIL[DOC-CONTRACT inputs="_record: any, ctx: any" outputs="{ url, method, headers, body }" errors="Throws if actionConfig.url is missing" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolve actionConfig URL, optional method defaulting to POST, optional body, and optional apiKey; validate URL presence; merge headers with optional Bearer authorization; return request object" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]



export function buildRequest(_record: any, ctx: any) {
  const url = ctx?.actionConfig?.url
  const method = ctx?.actionConfig?.method || 'POST'
  const body = ctx?.actionConfig?.body
  const apiKey = ctx?.apiKey?.value

  if (!url) {
    throw new Error('generic-webhook-outbound adapter requires actionConfig.url')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(ctx?.actionConfig?.headers || {})
  }
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  return {
    url,
    method,
    headers,
    body
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Build an outbound HTTP request payload for the generic webhook adapter'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/adapters/generic-webhook-outbound.ts:buildRequest:function"]
