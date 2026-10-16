/**
 * @module   middleware
 * @audience internal
 * @layer    shared-core
 * @stability stable
 *
 * This module provides middleware functions that handle authentication and authorization for API requests, ensuring that only authorized users can access certain resources. It integrates with tracing and auditing systems to monitor and log activities. INVARIANT: All requests must be validated against user roles before proceeding to the next step.
 *
 * @seeAlso principal (provides user identity management).
 * @seeAlso db (handles database interactions for user roles).
 * @seeAlso auditing (logs actions for compliance and monitoring).
 * @seeAlso tracing (manages request tracing for performance analysis).
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="This module provides middleware functions that handle authentication and authorization for API requests, ensuring that only authorized users can access certain resources."]
// CIL[DOC-RESPONSIBILITY responsibility="This module provides middleware functions that handle authentication and authorization for API requests, ensuring that only authorized users can access certain resources. It integrates with tracing and auditing systems to monitor and log activities. INVARIANT: All requests must be validated against user roles before proceeding to the next step."]
// CIL[DOC-CONTEXT module="middleware" layer="shared-core" related_files="principal (provides user identity management).,db (handles database interactions for user roles).,auditing (logs actions for compliance and monitoring).,tracing (manages request tracing for performance analysis)."]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="This module provides middleware functions that handle authentication and authorization for API requests, ensuring that only authorized users can access certain resources. It integrates with tracing and auditing systems to monitor and log activities. INVARIANT: All requests must be validated against user roles before proceeding to the next step." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import { 
  Principal, 
  resolvePrincipal, 
  isSystemAdmin, 
  getPrincipalDb
} from './principal'
import { adminDb } from './db'
import { emitAudit, emitSpan } from './audit'
import { isBlockedRequest, isBlockedIp, touchPersonGeo } from './security'
import { getClientGeo } from './geo'
import {
  TraceContext,
  Span,
  startSpan,
  endSpan,
  parseTraceParent,
  parseTraceState,
  formatTraceParent,
  formatTraceState,
  generateSpanId,
  isSampled,
  traceDb
} from './tracing'
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='This module provides middleware functions that handle authentication and authorization for API requests, ensuring that only authorized users can access certain resources.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="CoreContext provides a structured context for handling requests within the application, encapsulating essential information such as the principal, account ID, and request details."]
// CIL[DOC-RESPONSIBILITY responsibility="CoreContext provides a structured context for handling requests within the application, encapsulating essential information such as the principal, account ID, and request details. It exists to facilitate consistent access to contextual data throughout the middleware layer."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="CoreContext provides a structured context for handling requests within the application, encapsulating essential information such as the principal, account ID, and request details. It exists to facilitate consistent access to contextual data throughout the middleware layer." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * CoreContext provides a structured context for handling requests within the application, encapsulating essential information such as the principal, account ID, and request details. It exists to facilitate consistent access to contextual data throughout the middleware layer.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:corecontext:interface" type="interface" identity="CoreContext" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="CoreContext interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the CoreContext interface."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the CoreContext interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface CoreContext {
  principal: Principal
  accountId: string | null
  db: any
  requestId: string
  source?: string
  logLevel?: string
  trace?: TraceContext
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:corecontext:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='CoreContext provides a structured context for handling requests within the application, encapsulating essential information such as the principal, account ID, and request details.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="The RequestContext interface defines the structure for context information related to an incoming request, including application ID, query parameters, request path, and headers."]
// CIL[DOC-RESPONSIBILITY responsibility="The RequestContext interface defines the structure for context information related to an incoming request, including application ID, query parameters, request path, and headers. It is used to facilitate middleware operations by providing essential request-related data."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The RequestContext interface defines the structure for context information related to an incoming request, including application ID, query parameters, request path, and headers. It is used to facilitate middleware operations by providing essential request-related data." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The RequestContext interface defines the structure for context information related to an incoming request, including application ID, query parameters, request path, and headers. It is used to facilitate middleware operations by providing essential request-related data.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:requestcontext:interface" type="interface" identity="RequestContext" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="RequestContext interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the RequestContext interface."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the RequestContext interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface RequestContext extends CoreContext {
  appId: string | null
  query: Record<string, string>
  requestPath: string
  /** Lowercased request headers — used by geo/rate-limit helpers. */
  headers?: Record<string, string>
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:requestcontext:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='The RequestContext interface defines the structure for context information related to an incoming request, including application ID, query parameters, request path, and headers.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="HandlerFunction is a type that defines a function signature for handling requests in a middleware context."]
// CIL[DOC-RESPONSIBILITY responsibility="HandlerFunction is a type that defines a function signature for handling requests in a middleware context. It facilitates the processing of a request context and an optional body, returning a promise for asynchronous operations."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="HandlerFunction is a type that defines a function signature for handling requests in a middleware context. It facilitates the processing of a request context and an optional body, returning a promise for asynchronous operations." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * HandlerFunction is a type that defines a function signature for handling requests in a middleware context. It facilitates the processing of a request context and an optional body, returning a promise for asynchronous operations.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:handlerfunction:type" type="type" identity="HandlerFunction" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="HandlerFunction type"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the HandlerFunction type."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the HandlerFunction type." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export type HandlerFunction = (ctx: RequestContext, body?: any) => Promise<any>
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:handlerfunction:type"]
// CIL[DOC-MACRO purpose="HandlerFunction type"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the HandlerFunction type."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the HandlerFunction type." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='HandlerFunction is a type that defines a function signature for handling requests in a middleware context.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="HandlerResult is an interface that encapsulates the result of a handler operation, allowing for the inclusion of data, error messages, and metadata."]
// CIL[DOC-RESPONSIBILITY responsibility="HandlerResult is an interface that encapsulates the result of a handler operation, allowing for the inclusion of data, error messages, and metadata. It exists to standardize the response structure across various handler implementations."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="HandlerResult is an interface that encapsulates the result of a handler operation, allowing for the inclusion of data, error messages, and metadata. It exists to standardize the response structure across various handler implementations." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * HandlerResult is an interface that encapsulates the result of a handler operation, allowing for the inclusion of data, error messages, and metadata. It exists to standardize the response structure across various handler implementations.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:handlerresult:interface" type="interface" identity="HandlerResult" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="HandlerResult interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the HandlerResult interface."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the HandlerResult interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface HandlerResult {
  data?: any
  error?: string
  meta?: any
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:handlerresult:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='HandlerResult is an interface that encapsulates the result of a handler operation, allowing for the inclusion of data, error messages, and metadata.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Validates whether a given value is a properly formatted UUID string."]
// CIL[DOC-RESPONSIBILITY responsibility="Validates whether a given value is a properly formatted UUID string. This function exists to ensure that UUIDs conform to the expected format before further processing."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="- value: any (required) — the value to be validated as a UUID." outputs="value is string — returns true if the value is a valid UUID string, otherwise false." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Validates whether a given value is a properly formatted UUID string. This function exists to ensure that UUIDs conform to the expected format before further processing." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Validates whether a given value is a properly formatted UUID string. This function exists to ensure that UUIDs conform to the expected format before further processing.
 *
 * @inputSpec
 *   - value: any (required) — the value to be validated as a UUID.
 * @outputSpec  value is string — returns true if the value is a valid UUID string, otherwise false.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:isvaliduuid:function" type="function" identity="isValidUuid" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="isValidUuid function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the isValidUuid function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the isValidUuid function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function isValidUuid(value: any): value is string {
  if (typeof value !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:isvaliduuid:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Validates whether a given value is a properly formatted UUID string.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Trace context builder for distributed tracing."]
// CIL[DOC-RESPONSIBILITY responsibility="Builds a TraceContext object based on incoming event headers or a provided request ID. This function is essential for tracing requests in distributed systems."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="- event: any (required) — the incoming event containing headers for tracing.\\n- requestId: string (required) — a unique identifier for the request." outputs="TraceContext — an object containing traceId, spanId, parentSpanId, traceFlags, traceState, and sampled status." errors="none" side_effects="none dependencies="parseTraceParent, parseTraceState, generateSpanId, formatTraceState, isSampled"]
// CIL[DOC-MICRO logic_summary="Parses trace headers in a specific order and generates a TraceContext based on the parsed values or defaults to the request ID." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Builds a TraceContext object based on incoming event headers or a provided request ID. This function is essential for tracing requests in distributed systems.
 *
 * @macro       Trace context builder for distributed tracing.
 * @micro       Parses trace headers in a specific order and generates a TraceContext based on the parsed values or defaults to the request ID.
 * @inputSpec
 *   - event: any (required) — the incoming event containing headers for tracing.
 *   - requestId: string (required) — a unique identifier for the request.
 * @outputSpec  TraceContext — an object containing traceId, spanId, parentSpanId, traceFlags, traceState, and sampled status.
 * @sideEffects none
 * @stability   stable
 * @calls       parseTraceParent, parseTraceState, generateSpanId, formatTraceState, isSampled
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:buildtracecontext:function" type="function" identity="buildTraceContext" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="buildTraceContext function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the buildTraceContext function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the buildTraceContext function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function buildTraceContext(event: any, requestId: string): TraceContext {
  const traceparentHeader =
    event.headers?.['traceparent'] ||
    event.headers?.['Traceparent'] ||
    event.headers?.['TRACEPARENT']
  const tracestateHeader =
    event.headers?.['tracestate'] ||
    event.headers?.['Tracestate'] ||
    event.headers?.['TRACESTATE']

  const parsed = parseTraceParent(traceparentHeader)
  if (parsed) {
    const traceState = parseTraceState(tracestateHeader)
    return {
      traceId: parsed.traceId,
      spanId: generateSpanId(),
      parentSpanId: parsed.spanId,
      traceFlags: parsed.traceFlags,
      traceState: formatTraceState(traceState),
      sampled: isSampled(parsed.traceFlags)
    }
  }

  return {
    traceId: requestId.replace(/-/g, '').toLowerCase(),
    spanId: generateSpanId(),
    traceFlags: 1,
    sampled: true
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:buildtracecontext:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Builds a TraceContext object based on incoming event headers or a provided request ID.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Generates a set of response headers for tracing purposes, including a request ID and trace information if provided."]
// CIL[DOC-RESPONSIBILITY responsibility="Generates a set of response headers for tracing purposes, including a request ID and trace information if provided. This function is useful for tracking requests in distributed systems."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="trace: TraceContext (optional) — context for tracing, including traceId, spanId, and traceFlags.\\nrequestId: string (optional) — unique identifier for the request." outputs="Record<string, string> — an object containing the generated headers." errors="none" side_effects="none dependencies="formatTraceParent"]
// CIL[DOC-MICRO logic_summary="Generates a set of response headers for tracing purposes, including a request ID and trace information if provided. This function is useful for tracking requests in distributed systems." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Generates a set of response headers for tracing purposes, including a request ID and trace information if provided. This function is useful for tracking requests in distributed systems.
 *
 * @inputSpec
 *   trace: TraceContext (optional) — context for tracing, including traceId, spanId, and traceFlags.
 *   requestId: string (optional) — unique identifier for the request.
 * @outputSpec  Record<string, string> — an object containing the generated headers.
 * @sideEffects none
 * @stability   stable
 * @calls       formatTraceParent
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:traceresponseheaders:function" type="function" identity="traceResponseHeaders" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="traceResponseHeaders function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the traceResponseHeaders function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the traceResponseHeaders function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function traceResponseHeaders(trace?: TraceContext, requestId?: string): Record<string, string> {
  const headers: Record<string, string> = {}
  if (requestId) headers['X-Request-ID'] = requestId
  if (trace) headers['traceparent'] = formatTraceParent(trace.traceId, trace.spanId, trace.traceFlags)
  if (trace?.traceState) headers['tracestate'] = trace.traceState
  return headers
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:traceresponseheaders:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Generates a set of response headers for tracing purposes, including a request ID and trace information if provided.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Merges two sets of headers, combining the base headers with any additional headers provided."]
// CIL[DOC-RESPONSIBILITY responsibility="Merges two sets of headers, combining the base headers with any additional headers provided. This function exists to facilitate the construction of a complete set of headers for HTTP requests or responses."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="base: Record<string, string> (required) — the base headers to merge.\\nextra: Record<string, string> (optional) — additional headers to merge with the base headers." outputs="Record<string, string> — a new object containing the merged headers." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Merges two sets of headers, combining the base headers with any additional headers provided. This function exists to facilitate the construction of a complete set of headers for HTTP requests or responses." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Merges two sets of headers, combining the base headers with any additional headers provided. This function exists to facilitate the construction of a complete set of headers for HTTP requests or responses.
 *
 * @inputSpec
 *   base: Record<string, string> (required) — the base headers to merge.
 *   extra: Record<string, string> (optional) — additional headers to merge with the base headers.
 * @outputSpec  Record<string, string> — a new object containing the merged headers.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:mergeheaders:function" type="function" identity="mergeHeaders" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="mergeHeaders function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the mergeHeaders function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the mergeHeaders function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mergeHeaders(base: Record<string, string>, extra?: Record<string, string>): Record<string, string> {
  return { ...base, ...extra }
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:mergeheaders:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Merges two sets of headers, combining the base headers with any additional headers provided.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Middleware function for handling requests with authentication and context management."]
// CIL[DOC-RESPONSIBILITY responsibility="Creates a middleware handler that processes incoming events and manages authentication and context for the request. It ensures that valid principals are resolved and handles errors related to authentication and request parsing."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="- handler: HandlerFunction (required) — the function to handle the event once validated." outputs="Promise<any> — returns the result of the handler or an error response." errors="none" side_effects="DB writes for logging and tracing, external calls for principal resolution. dependencies="isValidUuid, crypto.randomUUID, buildTraceContext, startSpan, resolvePrincipal, getPrincipalDb, traceDb, emitSpan, error"]
// CIL[DOC-MICRO logic_summary="Validates headers and query parameters to construct a request context, while managing spans for tracing." notable_decisions="returns an error response with a status code for authentication failures and JSON parsing errors."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Creates a middleware handler that processes incoming events and manages authentication and context for the request. It ensures that valid principals are resolved and handles errors related to authentication and request parsing.
 *
 * @macro       Middleware function for handling requests with authentication and context management.
 * @micro       Validates headers and query parameters to construct a request context, while managing spans for tracing.
 * @inputSpec
 *   - handler: HandlerFunction (required) — the function to handle the event once validated.
 * @outputSpec  Promise<any> — returns the result of the handler or an error response.
 * @sideEffects DB writes for logging and tracing, external calls for principal resolution.
 * @stability   stable
 * @calls       isValidUuid, crypto.randomUUID, buildTraceContext, startSpan, resolvePrincipal, getPrincipalDb, traceDb, emitSpan, error
 * @errorHandling returns an error response with a status code for authentication failures and JSON parsing errors.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:createhandler:function" type="function" identity="createHandler" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="createHandler function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the createHandler function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the createHandler function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function createHandler(handler: HandlerFunction) {
  return async (event: any, context: any) => {
    if (event && event.requestId && event.principal) {
      return handler(event, context)
    }

    const rawRequestId = event.headers?.['x-request-id'] || event.headers?.['X-Request-Id']
    const requestId = isValidUuid(rawRequestId) ? rawRequestId : crypto.randomUUID()
    const traceContext = buildTraceContext(event, requestId)
    const span = startSpan({ trace: traceContext }, 'request')
    let principal: Principal | null = null

    try {
      const appId = event.headers?.['x-app-id'] || event.headers?.['X-App-Id']
      const source = event.headers?.['x-source'] || event.headers?.['X-Source']
      const logLevel = event.headers?.['x-log-level'] || event.headers?.['X-Log-Level']

      const headers: Record<string, string> = {}
      if (event.headers) {
        for (const [k, v] of Object.entries(event.headers)) {
          if (typeof v === 'string') headers[k.toLowerCase()] = v
        }
      }

      const queryParams: Record<string, string> = {}
      if (event.queryStringParameters) {
        Object.assign(queryParams, event.queryStringParameters)
      }
      if (!queryParams.method && event.httpMethod) {
        queryParams.method = event.httpMethod
      }

      principal = await resolvePrincipal(event)

      if (!principal || principal.id === 'anonymous') {
        endSpan(span, { status: 'error', attributes: { error: 'Authentication required' } })
        await emitSpan({ db: adminDb, principal: principal as any, accountId: null, requestId, trace: traceContext } as any, span, {
          action: 'request.unauthenticated',
          target: { type: 'request', id: requestId }
        })
        return error('Authentication required', 401, requestId, traceContext)
      }

      const ctxDb = getPrincipalDb(principal)

      const ctx: RequestContext = {
        requestId,
        principal,
        db: ctxDb,
        accountId: principal.accountId,
        appId: appId || null,
        query: queryParams,
        requestPath: event.path || '/',
        headers,
        source,
        logLevel,
        trace: traceContext
      }

      ctx.db = traceDb(ctx, ctxDb, emitSpan)

      // Hard-blocklist enforcement (person/account/email/ip). Fails open
      // when the security_blocklist table is absent (pre-049 install).
      const blocked = await isBlockedRequest(ctx)
      if (blocked) {
        endSpan(span, { status: 'error', attributes: { error: 'blocked' } })
        void emitSpan(ctx, span, {
          action: 'request.blocked',
          target: { type: 'request', id: requestId, account_id: ctx.accountId },
          metadata: { blocked_type: blocked.type }
        }).catch(() => {})
        return error('Access denied', 403, requestId, traceContext)
      }

      // Best-effort last-seen geo stamp — fire-and-forget, never on the
      // request critical path.
      void touchPersonGeo(principal.id, ctx)

      let body = null
      if (event.body) {
        try {
          body = JSON.parse(event.body)
        } catch (e) {
          endSpan(span, { status: 'error', attributes: { error: 'Invalid JSON in request body' } })
          await emitSpan(ctx, span, { action: 'request.parse_error', target: { type: 'request', id: requestId, account_id: ctx.accountId } })
          return error('Invalid JSON in request body', 400, requestId, ctx.trace)
        }
      }
      if (ctx.query.id) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          body = {}
        }
        if (!('id' in body)) {
          body.id = ctx.query.id
        }
      }

      const httpMethod = event.httpMethod || queryParams.method || 'GET'
      const requestPath = event.path || '/'

      const result = await handler(ctx, body)
      endSpan(span, { status: 'ok' })

      // Fire-and-forget like every other span — telemetry is best-effort and
      // must not add a logs INSERT to the request's critical path.
      void emitSpan(ctx, span, {
        action: `request.${httpMethod.toLowerCase()}`,
        target: { type: 'request', id: requestId, account_id: ctx.accountId },
        metadata: {
          path: requestPath,
          method: httpMethod,
          principal_type: principal.type,
          principal_id: principal.id,
          app_id: ctx.appId
        }
      }).catch((e: any) => console.warn(`[${requestId}] request span emit failed:`, e?.message || e))

      return json({
        data: result,
        error: null,
        meta: {
          requestId,
          duration: span.durationMs
        }
      }, 200, requestId, ctx.trace)

    } catch (err: any) {
      console.error(`[${requestId}] Handler error:`, err)
      const status = typeof err.statusCode === 'number' ? err.statusCode : 500
      endSpan(span, { status: 'error', attributes: { error: err.message || 'Internal server error' } })
      const fallbackCtx: CoreContext = {
        db: adminDb,
        principal: principal || ({} as Principal),
        accountId: principal?.accountId || null,
        requestId,
        trace: traceContext
      }
      void emitSpan(fallbackCtx, span, {
        action: 'request.error',
        target: { type: 'request', id: requestId, account_id: fallbackCtx.accountId },
        metadata: { status, error: err.message || 'Internal server error' }
      }).catch(() => {})
      return structuredError(err, status, requestId, traceContext)
    }
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:createhandler:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Creates a middleware handler that processes incoming events and manages authentication and context for the request.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Middleware function that wraps a handler for public access."]
// CIL[DOC-RESPONSIBILITY responsibility="Creates a public handler that processes incoming events and delegates to a specified handler function. It ensures that requests are properly traced and validated before invoking the handler."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="handler: HandlerFunction (required) — the function to handle the event." outputs="Promise<any> — resolves with a JSON response containing data and metadata." errors="none" side_effects="none dependencies="isValidUuid, crypto.randomUUID, buildTraceContext, startSpan, resolvePrincipal, getPrincipalDb, traceDb, emitSpan, json"]
// CIL[DOC-MICRO logic_summary="Validates request headers and constructs a context object before calling the handler." notable_decisions="returns an error response for invalid JSON in the request body."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Creates a public handler that processes incoming events and delegates to a specified handler function. It ensures that requests are properly traced and validated before invoking the handler.
 *
 * @macro       Middleware function that wraps a handler for public access.
 * @micro       Validates request headers and constructs a context object before calling the handler.
 * @inputSpec
 *   handler: HandlerFunction (required) — the function to handle the event.
 * @outputSpec  Promise<any> — resolves with a JSON response containing data and metadata.
 * @sideEffects none
 * @stability   stable
 * @calls       isValidUuid, crypto.randomUUID, buildTraceContext, startSpan, resolvePrincipal, getPrincipalDb, traceDb, emitSpan, json
 * @errorHandling returns an error response for invalid JSON in the request body.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:createpublichandler:function" type="function" identity="createPublicHandler" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="createPublicHandler function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the createPublicHandler function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the createPublicHandler function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function createPublicHandler(handler: HandlerFunction) {
  return async (event: any, context: any) => {
    if (event && event.requestId && event.principal) {
      return handler(event, context)
    }

    const rawRequestId = event.headers?.['x-request-id'] || event.headers?.['X-Request-Id']
    const requestId = isValidUuid(rawRequestId) ? rawRequestId : crypto.randomUUID()
    const traceContext = buildTraceContext(event, requestId)
    const span = startSpan({ trace: traceContext }, 'request')
    let principal: Principal | null = null

    try {
      const appId = event.headers?.['x-app-id'] || event.headers?.['X-App-Id']
      const source = event.headers?.['x-source'] || event.headers?.['X-Source']
      const logLevel = event.headers?.['x-log-level'] || event.headers?.['X-Log-Level']

      const headers: Record<string, string> = {}
      if (event.headers) {
        for (const [k, v] of Object.entries(event.headers)) {
          if (typeof v === 'string') headers[k.toLowerCase()] = v
        }
      }

      const queryParams: Record<string, string> = {}
      if (event.queryStringParameters) {
        Object.assign(queryParams, event.queryStringParameters)
      }
      if (!queryParams.method && event.httpMethod) {
        queryParams.method = event.httpMethod
      }

      principal = await resolvePrincipal(event)

      const ctxDb = getPrincipalDb(principal)

      const ctx: RequestContext = {
        requestId,
        principal,
        db: ctxDb,
        accountId: principal?.accountId || null,
        appId: appId || null,
        query: queryParams,
        requestPath: event.path || '/',
        headers,
        source,
        logLevel,
        trace: traceContext
      }

      ctx.db = traceDb(ctx, ctxDb, emitSpan)

      // IP hard-block on public endpoints (registration, invite preview).
      // Fails open when the blocklist table is absent.
      const blockedIp = await isBlockedIp(getClientGeo(ctx).ip)
      if (blockedIp) {
        endSpan(span, { status: 'error', attributes: { error: 'blocked' } })
        return error('Access denied', 403, requestId, traceContext)
      }

      let body = null
      if (event.body) {
        try {
          body = JSON.parse(event.body)
        } catch (e) {
          endSpan(span, { status: 'error', attributes: { error: 'Invalid JSON in request body' } })
          await emitSpan(ctx, span, { action: 'request.parse_error', target: { type: 'request', id: requestId, account_id: ctx.accountId } })
          return error('Invalid JSON in request body', 400, requestId, ctx.trace)
        }
      }
      if (ctx.query.id) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          body = {}
        }
        if (!('id' in body)) {
          body.id = ctx.query.id
        }
      }

      const result = await handler(ctx, body)
      endSpan(span, { status: 'ok' })

      await emitSpan(ctx, span, {
        action: 'request.public',
        target: { type: 'request', id: requestId, account_id: ctx.accountId },
        metadata: {
          path: event.path || '/',
          method: event.httpMethod || 'GET',
          principal_type: principal?.type,
          principal_id: principal?.id,
          app_id: ctx.appId
        }
      })

      return json({
        data: result,
        error: null,
        meta: {
          requestId,
          duration: span.durationMs
        }
      }, 200, requestId, ctx.trace)

    } catch (err: any) {
      console.error(`[${requestId}] Public handler error:`, err)
      const status = typeof err.statusCode === 'number' ? err.statusCode : 500
      endSpan(span, { status: 'error', attributes: { error: err.message || 'Internal server error' } })
      const fallbackCtx: CoreContext = {
        db: adminDb,
        principal: principal || ({} as Principal),
        accountId: principal?.accountId || null,
        requestId,
        trace: traceContext
      }
      void emitSpan(fallbackCtx, span, {
        action: 'request.error',
        target: { type: 'request', id: requestId, account_id: fallbackCtx.accountId },
        metadata: { status, error: err.message || 'Internal server error' }
      }).catch(() => {})
      return structuredError(err, status, requestId, traceContext)
    }
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:createpublichandler:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Creates a public handler that processes incoming events and delegates to a specified handler function.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Response formatter for JSON API responses."]
// CIL[DOC-RESPONSIBILITY responsibility="The json function formats a given data object into a JSON response with specified HTTP status and optional tracing information. It is designed to standardize the response structure for API endpoints."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="- data: any (required) — the data to be serialized into JSON.\\n- status: number (optional) — the HTTP status code to return, defaults to 200.\\n- requestId: string (optional|nullable) — an optional request identifier for tracing.\\n- trace: TraceContext (optional|nullable) — optional tracing context containing trace information." outputs="{ statusCode: number, headers: Record<string, string>, body: string }" errors="none" side_effects="none dependencies="formatTraceParent"]
// CIL[DOC-MICRO logic_summary="Constructs a response object with headers for CORS and tracing based on input parameters." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The json function formats a given data object into a JSON response with specified HTTP status and optional tracing information. It is designed to standardize the response structure for API endpoints.
 *
 * @macro       Response formatter for JSON API responses.
 * @micro       Constructs a response object with headers for CORS and tracing based on input parameters.
 * @inputSpec
 *   - data: any (required) — the data to be serialized into JSON.
 *   - status: number (optional) — the HTTP status code to return, defaults to 200.
 *   - requestId: string (optional|nullable) — an optional request identifier for tracing.
 *   - trace: TraceContext (optional|nullable) — optional tracing context containing trace information.
 * @outputSpec  { statusCode: number, headers: Record<string, string>, body: string }
 * @sideEffects none
 * @stability   stable
 * @calls       formatTraceParent
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:json:function" type="function" identity="json" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="json function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the json function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the json function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function json(data: any, status: number = 200, requestId?: string, trace?: TraceContext) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Same-origin SPA calls never read this header; it only governs
    // cross-origin API access. SITE_URL (custom domain) → URL (Netlify
    // auto-set site URL) → '*' fallback keeps local dev working when
    // neither is configured.
    'Access-Control-Allow-Origin': process.env.SITE_URL || process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Account-Id, X-App-Id, X-Request-ID, X-Source, X-Log-Level, traceparent, tracestate',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
  }

  if (requestId) headers['X-Request-ID'] = requestId
  if (trace) {
    headers['traceparent'] = formatTraceParent(trace.traceId, trace.spanId, trace.traceFlags)
    if (trace.traceState) headers['tracestate'] = trace.traceState
  }

  return {
    statusCode: status,
    headers,
    body: JSON.stringify(data)
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:json:function"]
// CIL[DOC-VECTOR type="context" content="purpose='The json function formats a given data object into a JSON response with specified HTTP status and optional tracing information.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="The error function generates a standardized JSON response for error handling in the application."]
// CIL[DOC-RESPONSIBILITY responsibility="The error function generates a standardized JSON response for error handling in the application. It provides a consistent structure for error messages along with an optional HTTP status code and request tracing information."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="message: string (required) — the error message to be returned.\\nstatus: number (optional) — the HTTP status code, defaulting to 400.\\nrequestId: string (optional|nullable) — an optional identifier for the request.\\ntrace: TraceContext (optional|nullable) — optional tracing context for debugging." outputs="Promise<any> — returns a JSON response containing the error message." errors="none" side_effects="none dependencies="json"]
// CIL[DOC-MICRO logic_summary="The error function generates a standardized JSON response for error handling in the application. It provides a consistent structure for error messages along with an optional HTTP status code and request tracing information." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The error function generates a standardized JSON response for error handling in the application. It provides a consistent structure for error messages along with an optional HTTP status code and request tracing information.
 *
 * @inputSpec
 *   message: string (required) — the error message to be returned.
 *   status: number (optional) — the HTTP status code, defaulting to 400.
 *   requestId: string (optional|nullable) — an optional identifier for the request.
 *   trace: TraceContext (optional|nullable) — optional tracing context for debugging.
 * @outputSpec  Promise<any> — returns a JSON response containing the error message.
 * @sideEffects none
 * @stability   stable
 * @calls       json
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:error:function" type="function" identity="error" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="error function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the error function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the error function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function error(message: string, status: number = 400, requestId?: string, trace?: TraceContext) {
  return json({
    data: null,
    error: message
  }, status, requestId, trace)
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:error:function"]
// CIL[DOC-VECTOR type="context" content="purpose='The error function generates a standardized JSON response for error handling in the application.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// Error responses carry whitelisted structured fields (e.g. rate-limit
// action/limit/retry_after) so clients can render recovery UX.
// CIL[DOC-MACRO purpose="The structuredError function formats error responses for API calls, ensuring consistent structure and information."]
// CIL[DOC-RESPONSIBILITY responsibility="The structuredError function formats error responses for API calls, ensuring consistent structure and information. It provides a way to include additional error details when available."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="err: any (required) — the error object containing details about the error.\\nstatus: number (required) — the HTTP status code to return.\\nrequestId: string (optional) — an optional identifier for the request.\\ntrace: TraceContext (optional) — optional tracing context for debugging." outputs="Promise<any> — a JSON response containing the error details and status code." errors="none" side_effects="none dependencies="json"]
// CIL[DOC-MICRO logic_summary="The structuredError function formats error responses for API calls, ensuring consistent structure and information. It provides a way to include additional error details when available." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The structuredError function formats error responses for API calls, ensuring consistent structure and information. It provides a way to include additional error details when available.
 *
 * @inputSpec
 *   err: any (required) — the error object containing details about the error.
 *   status: number (required) — the HTTP status code to return.
 *   requestId: string (optional) — an optional identifier for the request.
 *   trace: TraceContext (optional) — optional tracing context for debugging.
 * @outputSpec  Promise<any> — a JSON response containing the error details and status code.
 * @sideEffects none
 * @stability   stable
 * @calls       json
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:structurederror:function" type="function" identity="structuredError" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="structuredError function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the structuredError function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the structuredError function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function structuredError(err: any, status: number, requestId?: string, trace?: TraceContext) {
  const body: Record<string, any> = { data: null, error: err?.message || 'Internal server error' }
  for (const key of ['action', 'limit', 'retry_after']) {
    if (err?.[key] !== undefined) body[key] = err[key]
  }
  if (err?.retryAfter !== undefined) body.retry_after = err.retryAfter
  return json(body, status, requestId, trace)
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:structurederror:function"]
// CIL[DOC-VECTOR type="context" content="purpose='The structuredError function formats error responses for API calls, ensuring consistent structure and information.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Parses the body of an event to extract JSON data."]
// CIL[DOC-RESPONSIBILITY responsibility="Parses the body of an event to extract JSON data. This function exists to handle incoming event data that may be in JSON format."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="event: any (required) — the event object containing the body to be parsed." outputs="any — the parsed JSON object or null if no body is present." errors="Error — Invalid JSON in request body" side_effects="none dependencies="JSON.parse"]
// CIL[DOC-MICRO logic_summary="Parses the body of an event to extract JSON data. This function exists to handle incoming event data that may be in JSON format." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Parses the body of an event to extract JSON data. This function exists to handle incoming event data that may be in JSON format.
 *
 * @inputSpec
 *   event: any (required) — the event object containing the body to be parsed.
 * @outputSpec  any — the parsed JSON object or null if no body is present.
 * @throws      Error — Invalid JSON in request body
 * @sideEffects none
 * @stability   stable
 * @calls       JSON.parse
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:parsebody:function" type="function" identity="parseBody" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="parseBody function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the parseBody function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the parseBody function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function parseBody(event: any): any {
  if (!event.body) return null
  
  try {
    return JSON.parse(event.body)
  } catch (e) {
    throw new Error('Invalid JSON in request body')
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:parsebody:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Parses the body of an event to extract JSON data.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="The requireUserContext function ensures that a valid user context is present before executing a handler function or returning an error."]
// CIL[DOC-RESPONSIBILITY responsibility="The requireUserContext function ensures that a valid user context is present before executing a handler function or returning an error. It is used to enforce user authentication and account association in middleware."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="- arg: HandlerFunction | RequestContext (required) — a function to handle requests or a context object containing user information." outputs="HandlerFunction | HandlerResult | null — returns a handler function, an error result, or null based on user context validation." errors="Error — User context (person and account) required" side_effects="none dependencies="error"]
// CIL[DOC-MICRO logic_summary="The requireUserContext function ensures that a valid user context is present before executing a handler function or returning an error. It is used to enforce user authentication and account association in middleware." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The requireUserContext function ensures that a valid user context is present before executing a handler function or returning an error. It is used to enforce user authentication and account association in middleware.
 *
 * @inputSpec
 *   - arg: HandlerFunction | RequestContext (required) — a function to handle requests or a context object containing user information.
 * @outputSpec  HandlerFunction | HandlerResult | null — returns a handler function, an error result, or null based on user context validation.
 * @throws      Error — User context (person and account) required
 * @sideEffects none
 * @stability   stable
 * @calls       error
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:requireusercontext_signature_1:function" type="function" identity="requireUserContext" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="requireUserContext function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the requireUserContext function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the requireUserContext function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function requireUserContext(handler: HandlerFunction): HandlerFunction
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:requireusercontext_signature_1:function"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:requireusercontext_signature_2:function" type="function" identity="requireUserContext" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="requireUserContext function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the requireUserContext function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the requireUserContext function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='The requireUserContext function ensures that a valid user context is present before executing a handler function or returning an error.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
export function requireUserContext(ctx: RequestContext): HandlerResult | null
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:requireusercontext_signature_2:function"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:requireusercontext:function" type="function" identity="requireUserContext" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="requireUserContext function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the requireUserContext function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the requireUserContext function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function requireUserContext(arg: HandlerFunction | RequestContext): HandlerFunction | HandlerResult | null {
  if (typeof arg === 'function') {
    const handler = arg
    return async (ctx: RequestContext, body?: any) => {
      if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
        throw new Error('User context (person and account) required')
      }
      return handler(ctx, body)
    }
  }

  const ctx = arg
  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    return error('User context (person and account) required', 403) as any
  }
  return null
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:requireusercontext:function"]
// CIL[DOC-MACRO purpose="Middleware function that enforces authentication and authorization for system-level operations."]
// CIL[DOC-RESPONSIBILITY responsibility="This function ensures that the context provided is authenticated and has system administrator privileges, adding an audit trail by tracking who triggered the action. It is used to enforce security requirements in middleware operations. Error — System context required, if the principal is not a system administrator."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="- arg: HandlerFunction | RequestContext (required) — the handler function or request context to be processed.\\n- triggeredBy: string (optional) — the identifier of the user or process that triggered the action." outputs="HandlerFunction | HandlerResult | null — returns a handler function for further processing, an error result, or null if validation passes." errors="Error — Authentication required, if the principal is not authenticated." side_effects="none dependencies="isSystemAdmin, error"]
// CIL[DOC-MICRO logic_summary="Validates the principal's identity and role before executing the provided handler function or returning an error." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * This function ensures that the context provided is authenticated and has system administrator privileges, adding an audit trail by tracking who triggered the action. It is used to enforce security requirements in middleware operations.
 *
 * @macro       Middleware function that enforces authentication and authorization for system-level operations.
 * @micro       Validates the principal's identity and role before executing the provided handler function or returning an error.
 * @inputSpec
 *   - arg: HandlerFunction | RequestContext (required) — the handler function or request context to be processed.
 *   - triggeredBy: string (optional) — the identifier of the user or process that triggered the action.
 * @outputSpec  HandlerFunction | HandlerResult | null — returns a handler function for further processing, an error result, or null if validation passes.
 * @throws      Error — Authentication required, if the principal is not authenticated.
Error — System context required, if the principal is not a system administrator.
 * @sideEffects none
 * @stability   stable
 * @calls       isSystemAdmin, error
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:requiresystemcontextwithaudit_signature_1:function" type="function" identity="requireSystemContextWithAudit" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="requireSystemContextWithAudit function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the requireSystemContextWithAudit function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the requireSystemContextWithAudit function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function requireSystemContextWithAudit(handler: HandlerFunction): HandlerFunction
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:requiresystemcontextwithaudit_signature_1:function"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:requiresystemcontextwithaudit_signature_2:function" type="function" identity="requireSystemContextWithAudit" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="requireSystemContextWithAudit function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the requireSystemContextWithAudit function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the requireSystemContextWithAudit function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='This function ensures that the context provided is authenticated and has system administrator privileges, adding an audit trail by tracking who triggered the action.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
export function requireSystemContextWithAudit(ctx: RequestContext, triggeredBy?: string): HandlerResult | null
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:requiresystemcontextwithaudit_signature_2:function"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:requiresystemcontextwithaudit:function" type="function" identity="requireSystemContextWithAudit" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="requireSystemContextWithAudit function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the requireSystemContextWithAudit function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the requireSystemContextWithAudit function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function requireSystemContextWithAudit(
  arg: HandlerFunction | RequestContext,
  triggeredBy?: string,
): HandlerFunction | HandlerResult | null {
  if (typeof arg === 'function') {
    const handler = arg
    return async (ctx: RequestContext, body?: any) => {
      if (!ctx.principal || ctx.principal.id === 'anonymous') {
        throw new Error('Authentication required')
      }
      if (!isSystemAdmin(ctx.principal)) {
        throw new Error('System context required')
      }
      ;(ctx as any).triggeredBy = ctx.principal.id
      return handler(ctx, body)
    }
  }

  const ctx = arg
  if (!ctx.principal || ctx.principal.id === 'anonymous') {
    return error('Authentication required', 401) as any
  }
  if (!isSystemAdmin(ctx.principal)) {
    return error('System context required', 403) as any
  }
  ;(ctx as any).triggeredBy = triggeredBy || ctx.principal.id
  return null
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:requiresystemcontextwithaudit:function"]
// CIL[DOC-MACRO purpose="The cors function enables Cross-Origin Resource Sharing (CORS) for HTTP responses."]
// CIL[DOC-RESPONSIBILITY responsibility="The cors function enables Cross-Origin Resource Sharing (CORS) for HTTP responses. It is used to allow web applications running at one origin to access resources from a different origin."]
// CIL[DOC-CONTEXT module="middleware" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/audit"]
// CIL[DOC-CONTRACT inputs="none" outputs="Promise<{ message: string }> — returns a JSON object with a message indicating CORS is enabled." errors="none" side_effects="none dependencies="json"]
// CIL[DOC-MICRO logic_summary="The cors function enables Cross-Origin Resource Sharing (CORS) for HTTP responses. It is used to allow web applications running at one origin to access resources from a different origin." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The cors function enables Cross-Origin Resource Sharing (CORS) for HTTP responses. It is used to allow web applications running at one origin to access resources from a different origin.
 *
 * @outputSpec  Promise<{ message: string }> — returns a JSON object with a message indicating CORS is enabled.
 * @sideEffects none
 * @stability   stable
 * @calls       json
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/middleware.ts:cors:function" type="function" identity="cors" parent="~/.framework/functions/_shared/middleware.ts"]
// CIL[DOC-MACRO purpose="cors function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the cors function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/middleware.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the cors function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function cors() {
  return json({ message: 'CORS enabled' }, 200)
}
// CIL[END stable_id="~/.framework/functions/_shared/middleware.ts:cors:function"]
// CIL[DOC-VECTOR type="context" content="purpose='The cors function enables Cross-Origin Resource Sharing (CORS) for HTTP responses.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
