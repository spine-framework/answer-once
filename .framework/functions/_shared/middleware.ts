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


/**
 * CoreContext provides a structured context for handling requests within the application, encapsulating essential information such as the principal, account ID, and request details. It exists to facilitate consistent access to contextual data throughout the middleware layer.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export interface CoreContext {
  principal: Principal
  accountId: string | null
  db: any
  requestId: string
  source?: string
  logLevel?: string
  trace?: TraceContext
}

/**
 * The RequestContext interface defines the structure for context information related to an incoming request, including application ID, query parameters, request path, and headers. It is used to facilitate middleware operations by providing essential request-related data.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export interface RequestContext extends CoreContext {
  appId: string | null
  query: Record<string, string>
  requestPath: string
  /** Lowercased request headers — used by geo/rate-limit helpers. */
  headers?: Record<string, string>
}

/**
 * HandlerFunction is a type that defines a function signature for handling requests in a middleware context. It facilitates the processing of a request context and an optional body, returning a promise for asynchronous operations.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export type HandlerFunction = (ctx: RequestContext, body?: any) => Promise<any>

/**
 * HandlerResult is an interface that encapsulates the result of a handler operation, allowing for the inclusion of data, error messages, and metadata. It exists to standardize the response structure across various handler implementations.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export interface HandlerResult {
  data?: any
  error?: string
  meta?: any
}

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
function isValidUuid(value: any): value is string {
  if (typeof value !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

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
function traceResponseHeaders(trace?: TraceContext, requestId?: string): Record<string, string> {
  const headers: Record<string, string> = {}
  if (requestId) headers['X-Request-ID'] = requestId
  if (trace) headers['traceparent'] = formatTraceParent(trace.traceId, trace.spanId, trace.traceFlags)
  if (trace?.traceState) headers['tracestate'] = trace.traceState
  return headers
}

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
function mergeHeaders(base: Record<string, string>, extra?: Record<string, string>): Record<string, string> {
  return { ...base, ...extra }
}
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
export function error(message: string, status: number = 400, requestId?: string, trace?: TraceContext) {
  return json({
    data: null,
    error: message
  }, status, requestId, trace)
}

// Error responses carry whitelisted structured fields (e.g. rate-limit
// action/limit/retry_after) so clients can render recovery UX.
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
function structuredError(err: any, status: number, requestId?: string, trace?: TraceContext) {
  const body: Record<string, any> = { data: null, error: err?.message || 'Internal server error' }
  for (const key of ['action', 'limit', 'retry_after']) {
    if (err?.[key] !== undefined) body[key] = err[key]
  }
  if (err?.retryAfter !== undefined) body.retry_after = err.retryAfter
  return json(body, status, requestId, trace)
}
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
export function parseBody(event: any): any {
  if (!event.body) return null
  
  try {
    return JSON.parse(event.body)
  } catch (e) {
    throw new Error('Invalid JSON in request body')
  }
}
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
export function requireUserContext(handler: HandlerFunction): HandlerFunction
export function requireUserContext(ctx: RequestContext): HandlerResult | null
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
    throw Object.assign(new Error('User context (person and account) required'), { statusCode: 403 })
  }
  return null
}
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
export function requireSystemContextWithAudit(handler: HandlerFunction): HandlerFunction
export function requireSystemContextWithAudit(ctx: RequestContext, triggeredBy?: string): HandlerResult | null
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
      if (!isSystemAdmin(ctx.principal) && !(ctx.principal?.isInternal === true && !ctx.accountId)) {
        throw new Error('System context required')
      }
      ;(ctx as any).triggeredBy = ctx.principal.id
      return handler(ctx, body)
    }
  }

  const ctx = arg
  if (!ctx.principal || ctx.principal.id === 'anonymous') {
    // Thrown (not returned) so createHandler's catch maps statusCode to a real
    // HTTP status — returning the response object here let it be wrapped as
    // {data: {statusCode: 401}} under HTTP 200 (F-051).
    throw Object.assign(new Error('Authentication required'), { statusCode: 401 })
  }
  // System admins and unbound internal machines (x-internal-secret) pass —
  // same trust boundary as the isSystemPrincipal convention elsewhere.
  if (!isSystemAdmin(ctx.principal) && !(ctx.principal?.isInternal === true && !ctx.accountId)) {
    throw Object.assign(new Error('System context required'), { statusCode: 403 })
  }
  ;(ctx as any).triggeredBy = triggeredBy || ctx.principal.id
  return null
}
/**
 * The cors function enables Cross-Origin Resource Sharing (CORS) for HTTP responses. It is used to allow web applications running at one origin to access resources from a different origin.
 *
 * @outputSpec  Promise<{ message: string }> — returns a JSON object with a message indicating CORS is enabled.
 * @sideEffects none
 * @stability   stable
 * @calls       json
 * @cil-generated
 */
export function cors() {
  return json({ message: 'CORS enabled' }, 200)
}
