// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="API client for Spine: auth, account, and request tracing helpers."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide authenticated fetch utilities and session tracing for the framework."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="module imports" outputs="auth headers, account ID, trace IDs, wrapped fetch" errors="none" side_effects="registers unauthorized callback"]
// CIL[DOC-MICRO logic_summary="Exports helpers for Supabase auth, account scoping, and W3C trace context propagation." notable_decisions="Uses crypto.randomUUID for hex IDs; propagates traceparent on every request."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework consumers and app developers"]










import { supabase } from './supabase'
// CIL[DOC-VECTOR type="context" content="purpose='API client for Spine: auth, account, and request tracing helpers.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:_accountid:constant" type="constant" identity="_accountid" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Holds the currently selected account ID in memory."]
// CIL[DOC-RESPONSIBILITY responsibility="Store mutable account ID state for authenticated requests."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="set by setAccountId" outputs="read by getAuthHeaders and getAccountId" errors="none" side_effects="module-scoped mutable state"]
// CIL[DOC-MICRO logic_summary="Module-level nullable string storing the active account ID." notable_decisions="Null default; no persistence."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
let _accountId: string | null = null
// CIL[DOC-VECTOR type="context" content="purpose='Holds the currently selected account ID in memory.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:_accountid:constant"]


// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:setAccountId:function" type="function" identity="setAccountId" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Set the active account ID for subsequent API calls."]
// CIL[DOC-RESPONSIBILITY responsibility="Update the in-memory account ID variable."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="id: string | null" outputs="void" errors="none" side_effects="mutates _accountId"]
// CIL[DOC-MICRO logic_summary="Assigns the provided id to the _accountId module variable." notable_decisions="Accepts null to clear selection."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function setAccountId(id: string | null) {
  _accountId = id
}
// CIL[DOC-VECTOR type="context" content="purpose='Set the active account ID for subsequent API calls.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:setAccountId:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:getAccountId:function" type="function" identity="getAccountId" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Return the currently selected account ID."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the in-memory account ID value."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string | null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns the current _accountId value." notable_decisions="Simple getter."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function getAccountId(): string | null {
  return _accountId
}
// CIL[DOC-VECTOR type="context" content="purpose='Return the currently selected account ID.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:getAccountId:function"]


// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:AUTH_PATHS:constant" type="constant" identity="AUTH_PATHS" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="List of auth-related API paths used to suppress unauthorized callbacks."]
// CIL[DOC-RESPONSIBILITY responsibility="Define paths that should not trigger the unauthorized callback on 401."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="readonly string array" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant array of auth/admin API path prefixes." notable_decisions="Frozen at module scope."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const AUTH_PATHS = ['/api/auth', '/api/admin-data']
// CIL[DOC-VECTOR type="context" content="purpose='List of auth-related API paths used to suppress unauthorized callbacks.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:AUTH_PATHS:constant"]




// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:_onunauthorizedcallback:constant" type="constant" identity="_onunauthorizedcallback" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Holds the registered 401 callback for the app."]
// CIL[DOC-RESPONSIBILITY responsibility="Store the callback invoked when a request returns 401."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="set by onUnauthorized" outputs="invoked by apiFetch" errors="none" side_effects="module-scoped mutable state"]
// CIL[DOC-MICRO logic_summary="Module-level nullable callback for unauthorized request handling." notable_decisions="Single callback only."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
let _onUnauthorizedCallback: (() => void) | null = null
// CIL[DOC-VECTOR type="context" content="purpose='Holds the registered 401 callback for the app.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:_onunauthorizedcallback:constant"]



// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:onUnauthorized:function" type="function" identity="onUnauthorized" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Register a callback to run when a 401 response is received."]
// CIL[DOC-RESPONSIBILITY responsibility="Manage the unauthorized callback subscription and cleanup."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="cb: () => void" outputs="unsubscribe function" errors="none" side_effects="sets _onUnauthorizedCallback"]
// CIL[DOC-MICRO logic_summary="Assigns the provided callback and returns a cleanup function that clears it." notable_decisions="Only one callback can be registered at a time; cleanup returns callback to null."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function onUnauthorized(cb: () => void): () => void {
  _onUnauthorizedCallback = cb
  return () => { _onUnauthorizedCallback = null }
}
// CIL[DOC-VECTOR type="context" content="purpose='Register a callback to run when a 401 response is received.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:onUnauthorized:function"]



// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:normalizeHeaders:function" type="function" identity="normalizeHeaders" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Normalize HeadersInit into a flat Record<string, string>."]
// CIL[DOC-RESPONSIBILITY responsibility="Convert various header input forms into a consistent object."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="headers?: HeadersInit" outputs="Record<string, string>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Handles undefined, Headers object, array of pairs, and plain object by coercing all values to strings." notable_decisions="Lowercases keys are preserved as-is; values are String(value)-coerced."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
   if (!headers) return {}

   if (headers instanceof Headers) {
     return Object.fromEntries(headers.entries())
   }

   if (Array.isArray(headers)) {
     return Object.fromEntries(headers)
   }

   return Object.fromEntries(
     Object.entries(headers).map(([key, value]) => [key, String(value)])
   )
 }
// CIL[DOC-VECTOR type="context" content="purpose='Normalize HeadersInit into a flat Record<string, string>.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:normalizeHeaders:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:getAuthHeaders:function" type="function" identity="getAuthHeaders" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Build authorization headers from the current Supabase session and account."]
// CIL[DOC-RESPONSIBILITY responsibility="Produce headers including bearer token and account ID when available."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="none (uses supabase global and _accountId)" outputs="Promise<Record<string, string>>" errors="none" side_effects="calls supabase.auth.getSession()"]
// CIL[DOC-MICRO logic_summary="Retrieves the Supabase session, adds Authorization bearer token if present, and adds X-Account-Id if _accountId is set." notable_decisions="Returns empty headers when no session or account."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {}

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  } else {
    
  }

  if (_accountId) {
    headers['X-Account-Id'] = _accountId
  }

  return headers
}
// CIL[DOC-VECTOR type="context" content="purpose='Build authorization headers from the current Supabase session and account.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:getAuthHeaders:function"]



// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:_sessionTraceId:constant" type="constant" identity="_sessionTraceId" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Caches the generated session trace ID for reuse."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the lazy-initialized session-level trace identifier."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="initialized by getSessionTraceId" outputs="read by getSessionTraceId" errors="none" side_effects="module-scoped mutable state"]
// CIL[DOC-MICRO logic_summary="Nullable string caching the 32-character session trace ID." notable_decisions="Lazily initialized on first access."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
let _sessionTraceId: string | null = null
// CIL[DOC-VECTOR type="context" content="purpose='Caches the generated session trace ID for reuse.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:_sessionTraceId:constant"]





// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:_sessionTraceState:constant" type="constant" identity="_sessionTraceState" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Stores the last tracestate header received from a response."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the latest server-provided tracestate value."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="set by apiFetch on response" outputs="read by future apiFetch headers (not yet)" errors="none" side_effects="module-scoped mutable state"]
// CIL[DOC-MICRO logic_summary="String cache for the most recent response tracestate header." notable_decisions="Currently written but not read back into outgoing headers."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
let _sessionTraceState: string = ''
// CIL[DOC-VECTOR type="context" content="purpose='Stores the last tracestate header received from a response.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:_sessionTraceState:constant"]




// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:generateHexId:function" type="function" identity="generateHexId" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Generate a random lowercase hex string of the requested length."]
// CIL[DOC-RESPONSIBILITY responsibility="Produce cryptographic random hex IDs for trace context."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="length: number" outputs="string" errors="none" side_effects="none (but uses crypto)"]
// CIL[DOC-MICRO logic_summary="Uses crypto.randomUUID, strips dashes, and concatenates or slices to the desired length." notable_decisions="Falls back to a second UUID if requested length exceeds 32."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function generateHexId(length: number): string {
  const uuid = crypto.randomUUID().replace(/-/g, '')
  if (length > uuid.length) {
    return (uuid + crypto.randomUUID().replace(/-/g, '')).slice(0, length).toLowerCase()
  }


  return uuid.slice(0, length).toLowerCase()
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a random lowercase hex string of the requested length.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:generateHexId:function"]


// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:getSessionTraceId:function" type="function" identity="getSessionTraceId" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Return the cached session trace ID, generating it on first call."]
// CIL[DOC-RESPONSIBILITY responsibility="Lazy-initialize and reuse the 32-character session trace ID."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="may set _sessionTraceId"]
// CIL[DOC-MICRO logic_summary="Checks _sessionTraceId and, if null, generates a 32-char hex ID and caches it." notable_decisions="Generates once per module session."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getSessionTraceId(): string {
  if (!_sessionTraceId) {
    _sessionTraceId = generateHexId(32)
  }
  return _sessionTraceId
}
// CIL[DOC-VECTOR type="context" content="purpose='Return the cached session trace ID, generating it on first call.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:getSessionTraceId:function"]


// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:buildTraceParent:function" type="function" identity="buildTraceParent" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Build a W3C traceparent header value."]
// CIL[DOC-RESPONSIBILITY responsibility="Compose a traceparent string from session and span IDs."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="none (uses getSessionTraceId and generateHexId)" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns `00-{sessionTraceId}-{16-char span id}-01` in W3C traceparent format." notable_decisions="Fixed version 00 and sampled flag 01."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildTraceParent(): string {
  return `00-${getSessionTraceId()}-${generateHexId(16)}-01`
}
// CIL[DOC-VECTOR type="context" content="purpose='Build a W3C traceparent header value.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:buildTraceParent:function"]


// CIL[BEGIN stable_id="~/.framework/src/lib/api.ts:apiFetch:function" type="function" identity="apiFetch" parent="~/.framework/src/lib/api.ts"]
// CIL[DOC-MACRO purpose="Make an authenticated HTTP request with traceparent and 401 handling."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap fetch with auth headers, trace context, and unauthorized callback dispatch."]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="path: string, options: RequestInit = {}" outputs="Promise<Response>" errors="none explicit" side_effects="may invoke _onUnauthorizedCallback, mutates _sessionTraceState, logs request ID"]
// CIL[DOC-MICRO logic_summary="Builds auth and trace headers, merges user headers, calls fetch, logs request/trace IDs, updates tracestate, and triggers the unauthorized callback for non-auth 401s." notable_decisions="Cleans up Bearer null/undefined/empty from user headers; suppresses callback for AUTH_PATHS."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders()
  const optionHeaders = normalizeHeaders(options.headers)
  const optionAuthorization = optionHeaders.Authorization || optionHeaders.authorization

  if (
    optionAuthorization &&
    ['Bearer null', 'Bearer undefined', 'null', 'undefined', ''].includes(optionAuthorization.trim())
  ) {
    delete optionHeaders.Authorization
    delete optionHeaders.authorization
  }

  const traceparent = buildTraceParent()

  // Best-effort app hint for server-side app-scoped behavior (knowledge
  // envelope, logging). Derived from the route prefix; the server validates
  // the slug against installed apps and the principal's required_roles.
  const appSegment = typeof window !== 'undefined'
    ? (window.location.pathname.split('/')[1] || '')
    : ''
  const appHint = /^[a-z][a-z0-9-]*$/.test(appSegment) ? appSegment : null

  const fetchOptions = {
    ...options,
    headers: {
      ...authHeaders,
      ...optionHeaders,
      traceparent,
      ...(appHint && !optionHeaders['x-app-id'] ? { 'x-app-id': appHint } : {}),
    },
  }

  const response = await fetch(path, fetchOptions)

  const requestId = response.headers.get('X-Request-ID') || response.headers.get('x-request-id')
  const responseTraceparent = response.headers.get('traceparent') || response.headers.get('Traceparent')
  // Debug-only: per-request tracing noise is opt-in — every apiFetch call
  // logs otherwise, which floods the console during polling-heavy views.
  // Enable with localStorage.spine_debug_api = '1'.
  if (
    requestId &&
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('spine_debug_api') === '1'
  ) {
    console.log('[Spine] requestId:', requestId, 'traceparent:', responseTraceparent || traceparent)
  }

  const responseTracestate = response.headers.get('tracestate') || response.headers.get('Tracestate')
  if (responseTracestate) _sessionTraceState = responseTracestate

  if (response.status === 401 && _onUnauthorizedCallback) {
    const isAuthPath = AUTH_PATHS.some(p => path.startsWith(p))
    if (!isAuthPath) {
      _onUnauthorizedCallback()
    }
  }

  return response
}
// CIL[DOC-VECTOR type="context" content="purpose='Make an authenticated HTTP request with traceparent and 401 handling.'; No verified external callers; imports: .framework/src/lib/supabase.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/api.ts:apiFetch:function"]
