
import { randomUUID } from 'crypto'


export interface TraceContext {
  traceId: string
  spanId: string
  parentSpanId?: string
  traceFlags: number
  traceState?: string
  sampled: boolean
}


export interface Span extends TraceContext {
  spanName: string
  startedAt: string
  endedAt?: string
  durationMs?: number
  status?: 'ok' | 'error'
  attributes?: Record<string, any>
}


export interface CoreContextWithTrace {
  trace?: TraceContext
  [key: string]: any
}



const TRACEPARENT_RE = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/i



const TRACE_FLAGS_SAMPLED = 0x01



function generateHex(length: number): string {
  // crypto.randomUUID gives 32 hex chars without dashes
  const hex = randomUUID().replace(/-/g, '')
  if (length > hex.length) {
    return (hex + randomUUID().replace(/-/g, '')).slice(0, length).toLowerCase()
  }


  return hex.slice(0, length).toLowerCase()
}


export function generateTraceId(): string {
  return generateHex(32)
}


export function generateSpanId(): string {
  return generateHex(16)
}


export function newTrace(sampled = true): TraceContext {
  return {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    traceFlags: sampled ? TRACE_FLAGS_SAMPLED : 0,
    sampled,
  }
}


export function parseTraceParent(header?: string): { traceId: string; spanId: string; traceFlags: number } | null {
  if (!header) return null
  const match = header.trim().match(TRACEPARENT_RE)
  if (!match) return null
  return {
    traceId: match[1].toLowerCase(),
    spanId: match[2].toLowerCase(),
    traceFlags: parseInt(match[3], 16),
  }
}


export function formatTraceParent(traceId: string, spanId: string, traceFlags: number): string {
  return `00-${traceId.toLowerCase()}-${spanId.toLowerCase()}-${traceFlags.toString(16).padStart(2, '0')}`
}


export function parseTraceState(header?: string): Record<string, string> {
  const state: Record<string, string> = {}
  if (!header) return state
  for (const part of header.split(',')) {
    const [key, ...rest] = part.trim().split('=')
    if (key && rest.length > 0) state[key.trim()] = rest.join('=').trim()
  }
  return state
}


export function formatTraceState(state: Record<string, string>): string {
  return Object.entries(state)
    .map(([k, v]) => `${k}=${v}`)
    .join(',')
}


export function isSampled(traceFlags: number): boolean {
  return (traceFlags & TRACE_FLAGS_SAMPLED) === TRACE_FLAGS_SAMPLED
}


function traceQueryBuilder(
  ctx: CoreContextWithTrace,
  builder: any,
  operation: string,
  resource: string,
  onSpanEnd?: (ctx: CoreContextWithTrace, span: Span) => void | Promise<void>
): any {
  return new Proxy(builder, {
    get(target, prop: string | symbol) {
      const value = (target as any)[prop]

      if (prop === 'then' && typeof value === 'function') {
        return (onFulfilled?: any, onRejected?: any) => {
          const span = startSpan(ctx, `db.${operation}`, { attributes: { operation, resource } })
          const start = Date.now()
          return value.call(
            target,
            (result: any) => {
              const durationMs = Date.now() - start
              const rowCount = Array.isArray(result?.data) ? result.data.length : undefined
              endSpan(span, { status: 'ok', attributes: { duration_ms: durationMs, row_count: rowCount } })
              if (onSpanEnd) Promise.resolve(onSpanEnd(ctx, span)).catch(() => {})
              return onFulfilled ? onFulfilled(result) : result
            },
            (err: any) => {
              endSpan(span, { status: 'error', attributes: { error: err?.message || String(err) } })
              if (onSpanEnd) Promise.resolve(onSpanEnd(ctx, span)).catch(() => {})
              return onRejected ? onRejected(err) : Promise.reject(err)
            }
          )
        }
      }

      if (prop === 'catch' && typeof value === 'function') {
        return (onRejected?: any) => traceQueryBuilder(ctx, target, operation, resource, onSpanEnd).then(undefined, onRejected)
      }

      if (typeof value === 'function') {
        return (...args: any[]) => {
          const result = value.apply(target, args)
          if (result && typeof result === 'object' && typeof result.then === 'function') {
            return traceQueryBuilder(ctx, result, operation, resource, onSpanEnd)
          }
          return result
        }
      }

      return value
    }
  })
}


export function traceDb(
  ctx: CoreContextWithTrace,
  db: any,
  onSpanEnd?: (ctx: CoreContextWithTrace, span: Span) => void | Promise<void>
): any {
  if (!ctx.trace?.sampled || !db) return db
  return new Proxy(db, {
    get(target, prop: string | symbol) {
      const value = (target as any)[prop]
      if (prop === 'from' || prop === 'rpc') {
        return (resource: string, ...args: any[]) => {
          const builder = value.call(target, resource, ...args)
          // Avoid tracing inserts into logs to prevent infinite recursion
          if (prop === 'from' && resource === 'logs') return builder
          return traceQueryBuilder(ctx, builder, String(prop), resource, onSpanEnd)
        }
      }
      return value
    }
  })
}


export function startSpan(
  ctx: CoreContextWithTrace,
  spanName: string,
  options?: {
    attributes?: Record<string, any>
    traceId?: string
    traceFlags?: number
    traceState?: string
    sampled?: boolean
  }
): Span {
  const parent = ctx.trace
  const traceId = options?.traceId || parent?.traceId || generateTraceId()
  const parentSpanId = parent?.spanId
  const traceFlags = options?.traceFlags ?? parent?.traceFlags ?? TRACE_FLAGS_SAMPLED
  const traceState = options?.traceState ?? parent?.traceState
  const sampled = options?.sampled ?? parent?.sampled ?? isSampled(traceFlags)

  return {
    traceId,
    spanId: generateSpanId(),
    parentSpanId,
    traceFlags,
    traceState,
    sampled,
    spanName,
    startedAt: new Date().toISOString(),
    status: 'ok',
    attributes: options?.attributes || {},
  }
}


export function endSpan(span: Span, options?: { status?: 'ok' | 'error'; attributes?: Record<string, any> }): Span {
  const endedAt = new Date().toISOString()
  const started = new Date(span.startedAt).getTime()
  const ended = new Date(endedAt).getTime()
  span.endedAt = endedAt
  span.durationMs = ended - started
  if (options?.status) span.status = options.status
  if (options?.attributes) {
    span.attributes = { ...span.attributes, ...options.attributes }
  }
  return span
}


export async function withSpan<T>(
  ctx: CoreContextWithTrace,
  spanName: string,
  fn: (ctx: CoreContextWithTrace) => Promise<T>,
  options?: {
    attributes?: Record<string, any>
    onEnd?: (ctx: CoreContextWithTrace, span: Span) => void | Promise<void>
  }
): Promise<T> {
  const span = startSpan(ctx, spanName, { attributes: options?.attributes })
  const childCtx = { ...ctx, trace: span }
  try {
    const result = await fn(childCtx)
    endSpan(span, { status: 'ok' })
    // onEnd (emitSpan) persists telemetry — fire-and-forget like withSpanSync
    // so a hosted-DB logs insert never adds its latency to the wrapped work.
    if (options?.onEnd) {
      Promise.resolve(options.onEnd(childCtx, span)).catch(() => {})
    }
    return result
  } catch (error: any) {
    endSpan(span, { status: 'error', attributes: { error: error.message || String(error) } })
    if (options?.onEnd) {
      Promise.resolve(options.onEnd(childCtx, span)).catch(() => {})
    }
    throw error
  }
}


export function withSpanSync<T>(
  ctx: CoreContextWithTrace,
  spanName: string,
  fn: (ctx: CoreContextWithTrace) => T,
  options?: {
    attributes?: Record<string, any>
    onEnd?: (ctx: CoreContextWithTrace, span: Span) => void | Promise<void>
  }
): T {
  const span = startSpan(ctx, spanName, { attributes: options?.attributes })
  const childCtx = { ...ctx, trace: span }
  try {
    const result = fn(childCtx)
    endSpan(span, { status: 'ok' })
    if (options?.onEnd) {
      Promise.resolve(options.onEnd(childCtx, span)).catch(() => {})
    }
    return result
  } catch (error: any) {
    endSpan(span, { status: 'error', attributes: { error: error.message || String(error) } })
    if (options?.onEnd) {
      Promise.resolve(options.onEnd(childCtx, span)).catch(() => {})
    }
    throw error
  }
}
