// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Shared logging utilities for admin-data operations and request context"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide logging helpers, log levels and structured log payloads used by admin-data handlers"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports CoreContext, adminDb and formatPrincipalForAudit; defines LogLevel, LogContext, AdminDataLogPayload and helpers for structured admin-data logging" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="framework-developers, admin-data consumers"]

import { CoreContext } from './middleware'
import { adminDb } from './db'
import { formatPrincipalForAudit } from './principal'
// CIL[DOC-VECTOR type="context" content="purpose='Shared logging utilities for admin-data operations and request context'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:LogLevel:type" type="type" identity="LogLevel" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Define the set of logging levels used across the framework"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the union of supported logging levels"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="LogLevel union type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="String-literal union of 'off', 'timing', 'warnings', 'errors' and 'all'" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
export type LogLevel = 'off' | 'timing' | 'warnings' | 'errors' | 'all'
// CIL[DOC-VECTOR type="context" content="purpose='Define the set of logging levels used across the framework'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:LogLevel:type"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:LogContext:interface" type="interface" identity="LogContext" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Extend the core request context with logging-specific fields"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare optional logging fields attached to a request context"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="LogContext interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Adds appId, source and logLevel properties to CoreContext" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
export interface LogContext extends CoreContext {
  appId?: string | null
  source?: string
  logLevel?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Extend the core request context with logging-specific fields'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:LogContext:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:AdminDataLogPayload:interface" type="interface" identity="AdminDataLogPayload" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Define the payload shape for admin-data operation logs"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare all fields logged for an admin-data operation"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AdminDataLogPayload interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Records entity, action, method, duration, recordId, rowCount, filters, typeSlug, error and warning" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Define the payload shape for admin-data operation logs'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:AdminDataLogPayload:interface"]




// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:VALID_LEVELS:constant" type="constant" identity="VALID_LEVELS" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="List the valid log levels in priority order"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the array of supported LogLevel values"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="LogLevel[] constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Array of all LogLevel string literals for filtering and validation" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
const VALID_LEVELS: LogLevel[] = ['off', 'timing', 'warnings', 'errors', 'all']

// Module-level cache of the `system_settings` rows for key='logging'. The
// per-ctx cache in resolveLogLevels only dedupes within one request; polling
// clients re-issue this query on every request otherwise.
let loggingSettingsCache: { rows: any[]; expiresAt: number } | null = null
const LOGGING_SETTINGS_TTL_MS = 60_000

// Test hook — module-level caches survive between cases in one process.
export function __resetLoggingSettingsCache() {
  loggingSettingsCache = null
}
// CIL[DOC-VECTOR type="context" content="purpose='List the valid log levels in priority order'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:VALID_LEVELS:constant"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:parseLogLevelHeader:function" type="function" identity="parseLogLevelHeader" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Parse a comma or pipe delimited log level header into a list"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a raw header string into validated LogLevel values"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="value: string | undefined" outputs="LogLevel[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Splits on commas or pipes, trims and filters to VALID_LEVELS; falls back to a single trimmed value" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Parse a comma or pipe delimited log level header into a list'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:parseLogLevelHeader:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:getCache:function" type="function" identity="getCache" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Retrieve the per-context logging cache if it exists"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the logging cache from a LogContext"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LogContext" outputs="Map<string, any> | undefined" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Accesses (ctx as any).__loggingCache" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
function getCache(ctx: LogContext): Map<string, any> | undefined {
  return (ctx as any).__loggingCache
}
// CIL[DOC-VECTOR type="context" content="purpose='Retrieve the per-context logging cache if it exists'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:getCache:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:getOrCreateCache:function" type="function" identity="getOrCreateCache" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Return a per-context logging cache, creating one if needed"]
// CIL[DOC-RESPONSIBILITY responsibility="Ensure a LogContext has an attached logging cache"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LogContext" outputs="Map<string, any>" errors="none" side_effects="Mutates ctx.__loggingCache when missing"]
// CIL[DOC-MICRO logic_summary="Checks for an existing cache and initializes a new Map if absent" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
function getOrCreateCache(ctx: LogContext): Map<string, any> {
  if (!(ctx as any).__loggingCache) {
    ;(ctx as any).__loggingCache = new Map()
  }
  return (ctx as any).__loggingCache
}
// CIL[DOC-VECTOR type="context" content="purpose='Return a per-context logging cache, creating one if needed'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:getOrCreateCache:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:findSetting:function" type="function" identity="findSetting" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Find the log levels configured for a given scope and optional scopeId"]
// CIL[DOC-RESPONSIBILITY responsibility="Search system_settings rows for a matching logging configuration"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="rows: any[], scope: string, scopeId?: string | null" outputs="LogLevel[] | undefined" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses Array.find with a predicate comparing scope and scope_id, then returns row.value.levels" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Find the log levels configured for a given scope and optional scopeId'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:findSetting:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:resolveLogLevels:function" type="function" identity="resolveLogLevels" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Resolve the effective log levels for a request and optional entity/action"]
// CIL[DOC-RESPONSIBILITY responsibility="Combine cache, system settings and request context to determine active log levels"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LogContext, options?: { entity?: string; action?: string }" outputs="Promise<LogLevel[]>" errors="none" side_effects="Reads system_settings via adminDb, cached module-level with a short TTL"]
// CIL[DOC-MICRO logic_summary="Checks module-level settings cache, fetches system_settings on miss, applies header override, then overlays global/source/principal/account/app/tool scopes" notable_decisions="settings rows are shared across requests so the hot admin-data path doesn't re-read them per call; tests reset the cache via the exported reset hook"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the effective log levels for a request and optional entity/action'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:resolveLogLevels:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:buildMessage:function" type="function" identity="buildMessage" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Build a human-readable log message from an admin-data payload"]
// CIL[DOC-RESPONSIBILITY responsibility="Format a concise message string describing the operation"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="payload: AdminDataLogPayload" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Concatenates action, entity, method, recordId, duration, warning and error details" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Build a human-readable log message from an admin-data payload'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:buildMessage:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:buildContext:function" type="function" identity="buildContext" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Build the structured context object for an admin-data log"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert payload fields into a flat context record for storage"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="payload: AdminDataLogPayload" outputs="Record<string, any>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps duration, method, rowCount, filters, typeSlug, warning and error message into snake_case keys" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Build the structured context object for an admin-data log'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:buildContext:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:traceLogFields:function" type="function" identity="traceLogFields" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Extract OpenTelemetry trace fields from the request context"]
// CIL[DOC-RESPONSIBILITY responsibility="Return trace metadata for a log row"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LogContext" outputs="Record<string, any>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads ctx.trace and maps traceId, spanId, parentSpanId, traceFlags, traceState and sampled" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Extract OpenTelemetry trace fields from the request context'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:traceLogFields:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:buildMetadata:function" type="function" identity="buildMetadata" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Build the metadata object for an admin-data log row"]
// CIL[DOC-RESPONSIBILITY responsibility="Combine request, principal and trace metadata into a log record"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LogContext, payload: AdminDataLogPayload" outputs="Record<string, any>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Merges request_id, source, entity, action, formatted principal and trace fields, with optional record_id and truncated stack" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Build the metadata object for an admin-data log row'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:buildMetadata:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:extractLogResult:function" type="function" identity="extractLogResult" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Extract recordId and rowCount from an admin-data operation result"]
// CIL[DOC-RESPONSIBILITY responsibility="Normalize an admin-data result into log-relevant identifiers and counts"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="result: any" outputs="{ recordId?: string; rowCount?: number }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Handles arrays, single records, result.data arrays/objects and result.count, preferring the first id when available" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Extract recordId and rowCount from an admin-data operation result'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:extractLogResult:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:logAdminDataOperation:function" type="function" identity="logAdminDataOperation" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Write a structured admin-data operation log to the logs table"]
// CIL[DOC-RESPONSIBILITY responsibility="Persist a log row based on resolved log levels and payload"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LogContext, payload: AdminDataLogPayload" outputs="Promise<void>" errors="none" side_effects="Inserts a row into the logs table via ctx.db or adminDb"]
// CIL[DOC-MICRO logic_summary="Resolves levels, filters by error/warning/timing, builds message/context/metadata and inserts a log row" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
      app_id: ctx.appId || null,
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
// CIL[DOC-VECTOR type="context" content="purpose='Write a structured admin-data operation log to the logs table'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:logAdminDataOperation:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/logging.ts:withAdminLogging:function" type="function" identity="withAdminLogging" parent="~/.framework/functions/_shared/logging.ts"]
// CIL[DOC-MACRO purpose="Wrap an admin-data operation with automatic timing and logging"]
// CIL[DOC-RESPONSIBILITY responsibility="Run an async operation and emit a structured log on completion or error"]
// CIL[DOC-CONTEXT module="functions/_shared/logging" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="ctx: LogContext, params: Omit<AdminDataLogPayload, 'durationMs' | 'error' | 'recordId' | 'rowCount'>, operation: () => Promise<T>" outputs="Promise<T>" errors="Re-throws operation errors" side_effects="Calls logAdminDataOperation after the operation"]
// CIL[DOC-MICRO logic_summary="Times the operation, extracts recordId/rowCount from result, catches and re-throws errors, and logs in finally" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
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
// CIL[DOC-VECTOR type="context" content="purpose='Wrap an admin-data operation with automatic timing and logging'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/logging.ts:withAdminLogging:function"]
