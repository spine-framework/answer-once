









import { supabase } from './supabase'

let _accountId: string | null = null


export function setAccountId(id: string | null) {
  _accountId = id
}

export function getAccountId(): string | null {
  return _accountId
}


const AUTH_PATHS = ['/api/auth', '/api/admin-data']




let _onUnauthorizedCallback: (() => void) | null = null



export function onUnauthorized(cb: () => void): () => void {
  _onUnauthorizedCallback = cb
  return () => { _onUnauthorizedCallback = null }
}



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



let _sessionTraceId: string | null = null





let _sessionTraceState: string = ''




function generateHexId(length: number): string {
  const uuid = crypto.randomUUID().replace(/-/g, '')
  if (length > uuid.length) {
    return (uuid + crypto.randomUUID().replace(/-/g, '')).slice(0, length).toLowerCase()
  }


  return uuid.slice(0, length).toLowerCase()
}


function getSessionTraceId(): string {
  if (!_sessionTraceId) {
    _sessionTraceId = generateHexId(32)
  }
  return _sessionTraceId
}


function buildTraceParent(): string {
  return `00-${getSessionTraceId()}-${generateHexId(16)}-01`
}


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
