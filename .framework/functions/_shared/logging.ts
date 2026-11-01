// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * @module   logging
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides logging functionality that is shared across the application, facilitating consistent logging practices. It integrates with core middleware and database components to ensure that logs are formatted and stored appropriately.
 * INVARIANT: All logs must include relevant context for auditing purposes.
 *
 * @seeAlso middleware.ts (provides core context for logging)
 * @seeAlso db.ts (handles database interactions for log storage)
 * @seeAlso principal.ts (formats principal information for audit logs)
 *
 * @cil-generated
 */










import { CoreContext } from './middleware'
import { adminDb } from './db'
import { formatPrincipalForAudit } from './principal'
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:module_header:module_header"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:LogLevel:type" type="type" identity="LogLevel" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * LogLevel defines a set of string constants representing different logging levels to standardize logging behavior across the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
export type LogLevel = 'off' | 'timing' | 'warnings' | 'errors' | 'all'
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:LogLevel:type"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:LogContext:interface" type="interface" identity="LogContext" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * The LogContext interface defines the structure for logging context information within the application, allowing for optional properties that provide additional context for log entries. This enhances the clarity and usefulness of logs by including details like application ID and log level.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
export interface LogContext extends CoreContext {
  appId?: string | null
  source?: string
  logLevel?: string
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:LogContext:interface"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:AdminDataLogPayload:interface" type="interface" identity="AdminDataLogPayload" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * The AdminDataLogPayload interface defines the structure for logging administrative actions within the application. It captures essential details about the entity being acted upon, the action taken, and any relevant metadata.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
export interface AdminDataLogPayload {
  entity: string
  action: string
  method?: string
  durationMs?: number
  recordId?: string
  rowCount?: number
  filters?: Record<string, any>
  typeSlug?: string
  error?: any
  warning?: string
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:AdminDataLogPayload:interface"]



















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:VALID_LEVELS:constant" type="constant" identity="VALID_LEVELS" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * VALID_LEVELS defines the acceptable logging levels for the application to provide a standardized set of log levels used throughout the logging system.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const VALID_LEVELS: LogLevel[] = ['off', 'timing', 'warnings', 'errors', 'all']
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:VALID_LEVELS:constant"]

// Module-level cache of the `system_settings` rows for key='logging'. The
// per-ctx cache in resolveLogLevels only dedupes within one request; polling
// clients re-issue this query on every request otherwise.

let loggingSettingsCache: { rows: any[]; expiresAt: number } | null = null

// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:LOGGING_SETTINGS_TTL_MS:constant" type="constant" identity="LOGGING_SETTINGS_TTL_MS" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * LOGGING_SETTINGS_TTL_MS defines the time-to-live for logging settings in milliseconds to ensure that module-level caches persist for a specified duration between test cases.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const LOGGING_SETTINGS_TTL_MS = 60_000
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:LOGGING_SETTINGS_TTL_MS:constant"]

// Test hook — module-level caches survive between cases in one process.
// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:__resetLoggingSettingsCache:component" type="component" identity="__resetLoggingSettingsCache" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * __resetLoggingSettingsCache resets the logging settings cache to null to clear any cached logging settings, ensuring that fresh settings are retrieved when needed.
 *
 * @outputSpec  void
 * @sideEffects sets loggingSettingsCache to null
 * @stability   internal
 * @cil-generated
 */
export function __resetLoggingSettingsCache() {
  loggingSettingsCache = null
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:__resetLoggingSettingsCache:component"]


















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:parseLogLevelHeader:function" type="function" identity="parseLogLevelHeader" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * Parses a log level header string into an array of valid log levels, ensuring only recognized levels are returned. This function handles both single and multiple log levels.
 *
 * @inputSpec
 *   - value: string | undefined (optional) — the log level header string to parse.
 * @outputSpec  LogLevel[] — an array of valid log levels.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function parseLogLevelHeader(value: string | undefined): LogLevel[] {
  if (!value) return []
  const parts = value.split(/[,|]/).map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) {
    const single = value.trim() as LogLevel
    return VALID_LEVELS.includes(single) ? [single] : []
  }


  const levels = parts.filter(p => VALID_LEVELS.includes(p as LogLevel)) as LogLevel[]
  return levels
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:parseLogLevelHeader:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:getCache:function" type="function" identity="getCache" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * Retrieves the logging cache from the provided log context if it exists. This function is useful for accessing cached logging data associated with a specific context.
 *
 * @inputSpec
 *   - ctx: LogContext (required) — the logging context from which to retrieve the cache.
 * @outputSpec  Map<string, any> | undefined — returns the logging cache map or undefined if it does not exist.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function getCache(ctx: LogContext): Map<string, any> | undefined {
  return (ctx as any).__loggingCache
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:getCache:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:getOrCreateCache:function" type="function" identity="getOrCreateCache" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * This function retrieves an existing logging cache from the provided context or creates a new one if it doesn't exist. It ensures that logging operations can efficiently store and retrieve log-related data.
 *
 * @inputSpec
 *   ctx: LogContext (required) — the logging context that may contain a cache.
 * @outputSpec  Map<string, any> — a Map object representing the logging cache.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function getOrCreateCache(ctx: LogContext): Map<string, any> {
  if (!(ctx as any).__loggingCache) {
    ;(ctx as any).__loggingCache = new Map()
  }
  return (ctx as any).__loggingCache
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:getOrCreateCache:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:findSetting:function" type="function" identity="findSetting" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * Retrieves logging levels associated with a specific scope and optional scope ID from a list of rows. This function is used to configure logging settings based on the provided parameters.
 *
 * @inputSpec
 *   rows: any[] (required) — an array of row objects containing logging settings.
 *   scope: string (required) — the scope to filter the rows by.
 *   scopeId: string | null (optional) — an optional identifier to further filter the rows.
 * @outputSpec  LogLevel[] | undefined — an array of logging levels or undefined if no matching row is found.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function findSetting(
  rows: any[],
  scope: string,
  scopeId?: string | null
): LogLevel[] | undefined {
  const row = rows.find(
    (r) => r.scope === scope && (scopeId === undefined ? r.scope_id == null : r.scope_id === scopeId)
  )
  return row?.value?.levels as LogLevel[] | undefined
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:findSetting:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:resolveLogLevels:function" type="function" identity="resolveLogLevels" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * Resolves logging levels based on the provided context and options, caching results for efficiency. It retrieves settings from a database if not already cached.
 *
 * @macro       Async function that determines log levels for a given context and options.
 * @micro       Uses a caching mechanism to store and retrieve log levels, querying a database when necessary.
 * @inputSpec
 *   ctx: LogContext (required) — the logging context containing relevant information.
 *   options: { entity?: string; action?: string } (optional) — optional parameters to specify the entity and action for logging.
 * @outputSpec  Promise<LogLevel[]> — an array of resolved log levels.
 * @sideEffects Database query to 'system_settings' if cache is expired or empty.
 * @stability   internal
 * @calls       getOrCreateCache, adminDb.from('system_settings'), findSetting, parseLogLevelHeader
 * @cil-generated
 */
export async function resolveLogLevels(
  ctx: LogContext,
  options?: { entity?: string; action?: string }
): Promise<LogLevel[]> {
  const cache = getOrCreateCache(ctx)
  const cacheKey = `levels:${options?.entity || ''}:${options?.action || ''}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const defaultLevels: LogLevel[] = ['timing', 'errors']

  let rows = loggingSettingsCache && loggingSettingsCache.expiresAt > Date.now()
    ? loggingSettingsCache.rows
    : null
  if (!rows) {
    const { data, error } = await adminDb
      .from('system_settings')
      .select('scope, scope_id, value')
      .eq('key', 'logging')
    if (!error && data) {
      rows = data
      loggingSettingsCache = { rows, expiresAt: Date.now() + LOGGING_SETTINGS_TTL_MS }
    }
  }

  if (!rows || rows.length === 0) {
    cache.set(cacheKey, defaultLevels)
    return defaultLevels
  }

  const headerLevels = parseLogLevelHeader(ctx.logLevel)
  if (headerLevels.length > 0) {
    cache.set(cacheKey, headerLevels)
    return headerLevels
  }

  let levels: LogLevel[] = findSetting(rows, 'global') || defaultLevels

  function apply(scope: string, scopeId?: string | null) {
    const found = findSetting(rows, scope, scopeId)
    if (found && found.length > 0) {
      levels = found
    }
  }

  const source = ctx.source || ctx.principal?.provenance?.sourceType
  if (source) apply('source', source)

  if (ctx.principal?.id) apply('principal', ctx.principal.id)

  if (ctx.accountId) apply('account', ctx.accountId)

  if (ctx.appId) apply('app', ctx.appId)

  if (options?.entity && options?.action) {
    apply('tool', `${options.entity}:${options.action}`)
  }

  if (options?.entity) {
    apply('tool', options.entity)
  }

  cache.set(cacheKey, levels)
  return levels
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:resolveLogLevels:function"]
















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:APP_UUID_TTL_MS:constant" type="constant" identity="APP_UUID_TTL_MS" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * APP_UUID_TTL_MS defines the time-to-live duration for application UUIDs in milliseconds. This constant helps manage the lifecycle of UUIDs within the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const APP_UUID_TTL_MS = 5 * 60_000
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:APP_UUID_TTL_MS:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:appUuidCache:constant" type="constant" identity="appUuidCache" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * The appUuidCache stores mappings of application UUIDs to their corresponding metadata, allowing for efficient retrieval of this information. It exists to optimize the management of UUIDs and their associated data within the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const appUuidCache = new Map<string, { id: string | null; at: number }>()
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:appUuidCache:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:UUID_PATTERN:constant" type="constant" identity="UUID_PATTERN" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * UUID_PATTERN is a regular expression that validates the format of UUIDs to ensure consistency and correctness in logging. It is essential for maintaining the integrity of UUIDs used within the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:UUID_PATTERN:constant"]
















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:resolveAppUuid:function" type="function" identity="resolveAppUuid" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * Resolves the application UUID based on a given reference string by checking a cache and querying a database if necessary. This function is essential for retrieving application identifiers in a consistent manner.
 *
 * @macro       Async function that resolves application UUIDs from references.
 * @micro       Utilizes a caching mechanism and database query to retrieve the UUID efficiently.
 * @inputSpec
 *   - ref: string | null | undefined — The reference string used to look up the application UUID.
 * @outputSpec  Promise<string | null> — Returns the application UUID or null if not found.
 * @sideEffects Writes to appUuidCache and queries the adminDb database.
 * @stability   internal
 * @calls       adminDb.from('apps')
 * @errorHandling returns null on database query error.
 * @cil-generated
 */
export async function resolveAppUuid(ref: string | null | undefined): Promise<string | null> {
  if (!ref) return null
  if (UUID_PATTERN.test(ref)) return ref
  const hit = appUuidCache.get(ref)
  if (hit && Date.now() - hit.at < APP_UUID_TTL_MS) return hit.id
  try {
    const { data, error } = await adminDb
      .from('apps')
      .select('id')
      .eq('slug', ref)
      .maybeSingle()
    if (error) return null
    const id = data?.id ?? null
    appUuidCache.set(ref, { id, at: Date.now() })
    return id
  } catch {
    return null
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:resolveAppUuid:function"]
















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:buildMessage:function" type="function" identity="buildMessage" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * Builds a log message string based on the provided payload containing administrative data log details. This function is used for generating consistent log messages for various administrative actions.
 *
 * @macro       Log message builder for administrative actions.
 * @micro       Constructs a message string by conditionally appending details from the payload.
 * @inputSpec
 *   payload: AdminDataLogPayload (required) — object containing details for the log message.
 * @outputSpec  string — formatted log message.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function buildMessage(payload: AdminDataLogPayload): string {
  const { entity, action, method, durationMs, recordId, error, warning } = payload
  let msg = `admin-data ${action} ${entity}`
  if (method) msg += ` (${method})`
  if (recordId) msg += ` id:${recordId}`
  if (durationMs !== undefined) msg += ` in ${durationMs}ms`
  if (warning) msg += ` warning: ${warning}`
  if (error) msg += ` failed: ${error.message || String(error)}`
  return msg
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:buildMessage:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:buildContext:function" type="function" identity="buildContext" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * The buildContext function constructs a context object from the provided AdminDataLogPayload, extracting relevant properties for logging purposes. It ensures that only defined and relevant fields are included in the resulting context.
 *
 * @macro       Context builder for logging structured data.
 * @micro       Conditionally adds properties to the context object based on the presence of corresponding fields in the payload.
 * @inputSpec
 *   payload: AdminDataLogPayload (required) — the payload containing data for logging.
 * @outputSpec  Record<string, any> — an object containing the extracted context properties.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function buildContext(payload: AdminDataLogPayload): Record<string, any> {
  const ctx: Record<string, any> = {}
  if (payload.durationMs !== undefined) ctx.duration_ms = payload.durationMs
  if (payload.method) ctx.method = payload.method
  if (payload.rowCount !== undefined) ctx.row_count = payload.rowCount
  if (payload.filters && Object.keys(payload.filters).length > 0) ctx.filters = payload.filters
  if (payload.typeSlug) ctx.type_slug = payload.typeSlug
  if (payload.warning) ctx.warning = payload.warning
  if (payload.error) ctx.error_message = payload.error.message || String(payload.error)
  return ctx
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:buildContext:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:traceLogFields:function" type="function" identity="traceLogFields" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * The function extracts trace-related fields from a logging context if available, providing structured trace information for logging purposes. This enhances the logging capabilities by including relevant trace data.
 *
 * @inputSpec
 *   ctx: LogContext (required) — the logging context containing trace information.
 * @outputSpec  Record<string, any> — an object containing trace fields or an empty object if no trace is present.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function traceLogFields(ctx: LogContext): Record<string, any> {
  const trace = ctx.trace
  if (!trace) return {}
  return {
    trace_id: trace.traceId,
    span_id: trace.spanId,
    parent_span_id: trace.parentSpanId,
    trace_flags: trace.traceFlags,
    tracestate: trace.traceState,
    sampled: trace.sampled
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:traceLogFields:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:buildMetadata:function" type="function" identity="buildMetadata" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * The buildMetadata function constructs a metadata object for logging purposes, aggregating information from the log context and payload. It facilitates the logging of administrative actions with relevant details.
 *
 * @macro       Function that generates a structured metadata object for logging.
 * @micro       Utilizes properties from the log context and payload, conditionally adding fields based on the presence of specific data.
 * @inputSpec
 *   - ctx: LogContext (required) — context containing request and principal information.
 *   - payload: AdminDataLogPayload (required) — data payload containing entity and action details.
 * @outputSpec  Record<string, any> — an object containing structured metadata for logging.
 * @sideEffects none
 * @stability   internal
 * @calls       formatPrincipalForAudit, traceLogFields
 * @cil-generated
 */
function buildMetadata(
  ctx: LogContext,
  payload: AdminDataLogPayload
): Record<string, any> {
  const meta: Record<string, any> = {
    request_id: ctx.requestId,
    source: ctx.source || ctx.principal?.provenance?.sourceType,
    entity: payload.entity,
    action: payload.action,
    principal: ctx.principal ? formatPrincipalForAudit(ctx.principal) : null,
    ...traceLogFields(ctx)
  }
  if (payload.recordId) meta.record_id = payload.recordId
  if (payload.error && payload.error.stack) {
    meta.error_stack = String(payload.error.stack).split('\n').slice(0, 5).join('\n')
  }
  return meta
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:buildMetadata:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:extractLogResult:function" type="function" identity="extractLogResult" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * Extracts relevant log result information from a given input object, returning either a record ID or row count. This function helps standardize the output format for logging purposes.
 *
 * @inputSpec
 *   result: any (required) — the input object from which to extract log information.
 * @outputSpec  { recordId?: string; rowCount?: number } — an object containing either a record ID or a row count based on the input.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function extractLogResult(result: any): { recordId?: string; rowCount?: number } {
  if (!result || typeof result !== 'object') return {}

  if (Array.isArray(result)) {
    return { rowCount: result.length }
  }

  if (typeof result.id === 'string') {
    return { recordId: result.id }
  }

  if (result.data && Array.isArray(result.data)) {
    const out: any = { rowCount: result.data.length }
    if (result.data.length === 1 && result.data[0]?.id) {
      out.recordId = result.data[0].id
    }
    return out
  }

  if (result.data && typeof result.data === 'object' && typeof result.data.id === 'string') {
    return { recordId: result.data.id }
  }

  if (typeof result.count === 'number') {
    return { rowCount: result.count }
  }

  return {}
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:extractLogResult:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:logAdminDataOperation:function" type="function" identity="logAdminDataOperation" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * Logs administrative data operations to a database, ensuring that only relevant log entries are recorded based on the provided payload and context. This function filters logs based on log levels and error/warning status.
 *
 * @macro       Async function responsible for logging administrative data operations.
 * @micro       Determines the appropriate log level based on the presence of errors or warnings and the resolved log levels.
 * @inputSpec
 *   ctx: LogContext (required) — context containing logging and user information.
 *   payload: AdminDataLogPayload (required) — data payload containing details about the operation being logged.
 * @outputSpec  Promise<void>
 * @sideEffects Writes log entries to the database.
 * @stability   internal
 * @calls       resolveLogLevels, resolveAppUuid, traceLogFields, buildMessage, buildContext, buildMetadata, ctx.db.from('logs').insert
 * @errorHandling Logs errors to the console if logging fails.
 * @cil-generated
 */
export async function logAdminDataOperation(
  ctx: LogContext,
  payload: AdminDataLogPayload
): Promise<void> {
  try {
    if (payload.entity === 'logs' || payload.entity === 'observability') {
      return
    }

    const levels = await resolveLogLevels(ctx, payload)

    if (levels.includes('off') || levels.length === 0) {
      return
    }

    const isAll = levels.includes('all')
    const isError = !!payload.error
    const isWarning = !!payload.warning

    if (isError && !isAll && !levels.includes('errors')) return
    if (isWarning && !isAll && !levels.includes('warnings')) return
    if (!isError && !isWarning && !isAll && !levels.includes('timing')) return

    let level: 'info' | 'warn' | 'error' = 'info'
    if (isError) level = 'error'
    else if (isWarning) level = 'warn'

    const logRow = {
      level,
      source: 'admin-data',
      source_type: payload.entity,
      source_id: payload.recordId || null,
      person_id: ctx.principal?.id || null,
      created_by: ctx.principal?.id || null,
      app_id: await resolveAppUuid(ctx.appId),
      account_id: ctx.accountId || null,
      span_name: `admin-data.${payload.action}`,
      kind: 'event',
      started_at: new Date().toISOString(),
      duration_ms: payload.durationMs || null,
      ...traceLogFields(ctx),
      message: buildMessage(payload),
      context: buildContext(payload),
      metadata: buildMetadata(ctx, payload),
      created_at: new Date().toISOString()
    }

    const logDb = ctx.db || adminDb
    await logDb.from('logs').insert(logRow)
  } catch (err) {
    console.error('Failed to write admin-data log:', err)
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:logAdminDataOperation:function"]

















// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:withAdminLogging:function" type="function" identity="withAdminLogging" parent="~/.framework/functions/_shared/logging.ts"]
/**
 * The withAdminLogging function wraps an asynchronous operation with logging capabilities for admin data operations. It captures execution time, potential errors, and relevant result metadata for logging purposes.
 *
 * @macro       Async function that logs admin data operations.
 * @micro       Measures execution duration and logs details in a finally block regardless of success or failure.
 * @inputSpec
 *   ctx: LogContext (required) — the logging context for the operation.
 *   params: Omit<AdminDataLogPayload, 'durationMs' | 'error' | 'recordId' | 'rowCount'> (required) — parameters for logging excluding certain fields.
 *   operation: () => Promise<T> (required) — the asynchronous operation to execute.
 * @outputSpec  Promise<T> — the result of the executed operation.
 * @sideEffects Logs admin data operation details to an external logging service.
 * @stability   internal
 * @calls       extractLogResult, logAdminDataOperation
 * @cil-generated
 */
export async function withAdminLogging<T>(
  ctx: LogContext,
  params: Omit<AdminDataLogPayload, 'durationMs' | 'error' | 'recordId' | 'rowCount'>,
  operation: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  let result: T
  let error: any
  let recordId: string | undefined
  let rowCount: number | undefined

  try {
    result = await operation()
    const extracted = extractLogResult(result)
    recordId = extracted.recordId
    rowCount = extracted.rowCount
    return result
  } catch (err) {
    error = err
    throw err
  } finally {
    const durationMs = Date.now() - start
    logAdminDataOperation(ctx, {
      ...params,
      durationMs,
      error,
      recordId,
      rowCount
    }).catch(console.error)
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:withAdminLogging:function"]







