// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Shared tracing utilities for OpenTelemetry-style context, spans and id generation"]
// CIL[DOC-RESPONSIBILITY responsibility="Import the crypto module and serve as the module-level CIL header"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="" errors="" side_effects=""]
// CIL[DOC-MICRO logic_summary="Imports randomUUID from the crypto module and establishes the tracing module namespace" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="functions, shared utilities"]

import { randomUUID } from 'crypto'
// CIL[DOC-VECTOR type="context" content="purpose='Shared tracing utilities for OpenTelemetry-style context, spans and id generation'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:TraceContext:interface" type="interface" identity="TraceContext" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Defines the immutable trace context carried with every operation"]
// CIL[DOC-RESPONSIBILITY responsibility="Model the fields that identify a distributed trace and its sampling state"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="none (structural interface)" outputs="none (structural interface)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Trace identifiers, span ids, parent link, trace flags, optional state and sampled boolean" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface TraceContext {
  traceId: string
  spanId: string
  parentSpanId?: string
  traceFlags: number
  traceState?: string
  sampled: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the immutable trace context carried with every operation'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:TraceContext:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:Span:interface" type="interface" identity="Span" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Defines a span as a concrete trace context plus timing and status"]
// CIL[DOC-RESPONSIBILITY responsibility="Extend TraceContext with a name, start/end times, duration and optional attributes"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="none (structural interface)" outputs="none (structural interface)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Adds spanName, startedAt, endedAt, durationMs, status and attributes to TraceContext" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface Span extends TraceContext {
  spanName: string
  startedAt: string
  endedAt?: string
  durationMs?: number
  status?: 'ok' | 'error'
  attributes?: Record<string, any>
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a span as a concrete trace context plus timing and status'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:Span:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:CoreContextWithTrace:interface" type="interface" identity="CoreContextWithTrace" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Extends a generic core context with an optional trace field"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a typed container that may carry trace context among other fields"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="none (structural interface)" outputs="none (structural interface)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Index signature allows additional properties while optionally holding a TraceContext" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface CoreContextWithTrace {
  trace?: TraceContext
  [key: string]: any
}
// CIL[DOC-VECTOR type="context" content="purpose='Extends a generic core context with an optional trace field'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:CoreContextWithTrace:interface"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:TRACEPARENT_RE:constant" type="constant" identity="TRACEPARENT_RE" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Regular expression that parses W3C traceparent version 00 headers"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate and capture trace-id, parent-id and trace-flags from a traceparent string"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="string to match" outputs="RegExp match groups for trace id, span id and flags" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Anchored case-insensitive regex for 00-traceid-spanid-flags format" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const TRACEPARENT_RE = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/i
// CIL[DOC-VECTOR type="context" content="purpose='Regular expression that parses W3C traceparent version 00 headers'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:TRACEPARENT_RE:constant"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:TRACE_FLAGS_SAMPLED:constant" type="constant" identity="TRACE_FLAGS_SAMPLED" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Bit flag indicating a trace is sampled"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the constant value 0x01 used by isSampled"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="number 0x01" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Single-byte flag value that can be bitwise-ANDed against trace flags" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const TRACE_FLAGS_SAMPLED = 0x01
// CIL[DOC-VECTOR type="context" content="purpose='Bit flag indicating a trace is sampled'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:TRACE_FLAGS_SAMPLED:constant"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:generateHex:function" type="function" identity="generateHex" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Generate a lower-case hex string of a specified length"]
// CIL[DOC-RESPONSIBILITY responsibility="Create random hex ids by concatenating UUIDs and slicing to size"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="length: number" outputs="lowercase hex string of requested length" errors="none" side_effects="consumes crypto.randomUUID"]
// CIL[DOC-MICRO logic_summary="Removes dashes from randomUUID, concatenates a second UUID if needed, then slices" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function generateHex(length: number): string {
  // crypto.randomUUID gives 32 hex chars without dashes
  const hex = randomUUID().replace(/-/g, '')
  if (length > hex.length) {
    return (hex + randomUUID().replace(/-/g, '')).slice(0, length).toLowerCase()
  }


  return hex.slice(0, length).toLowerCase()
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a lower-case hex string of a specified length'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:generateHex:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:generateTraceId:function" type="function" identity="generateTraceId" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Generate a 32-character hex trace id"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a unique 128-bit trace identifier"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="32-char hex string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls generateHex with length 32" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function generateTraceId(): string {
  return generateHex(32)
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a 32-character hex trace id'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:generateTraceId:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:generateSpanId:function" type="function" identity="generateSpanId" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Generate a 16-character hex span id"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a unique 64-bit span identifier"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="16-char hex string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls generateHex with length 16" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function generateSpanId(): string {
  return generateHex(16)
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a 16-character hex span id'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:generateSpanId:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:newTrace:function" type="function" identity="newTrace" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Create a new TraceContext with a fresh trace id"]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize a trace root context, optionally sampled"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="sampled?: boolean (default true)" outputs="TraceContext with traceId, spanId and flags" errors="none" side_effects="generates new trace and span ids"]
// CIL[DOC-MICRO logic_summary="Uses generateTraceId, generateSpanId and TRACE_FLAGS_SAMPLED to build a root context" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function newTrace(sampled = true): TraceContext {
  return {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    traceFlags: sampled ? TRACE_FLAGS_SAMPLED : 0,
    sampled,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create a new TraceContext with a fresh trace id'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:newTrace:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:parseTraceParent:function" type="function" identity="parseTraceParent" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Parse a W3C traceparent header into trace metadata"]
// CIL[DOC-RESPONSIBILITY responsibility="Extract traceId, spanId and traceFlags from a traceparent string"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="header?: string" outputs="{ traceId, spanId, traceFlags } | null" errors="returns null for missing or malformed headers" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Trims the header, matches TRACEPARENT_RE and parses the flags as hex" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Parse a W3C traceparent header into trace metadata'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:parseTraceParent:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:formatTraceParent:function" type="function" identity="formatTraceParent" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Format trace metadata into a W3C traceparent string"]
// CIL[DOC-RESPONSIBILITY responsibility="Build the 00-traceId-spanId-flags header format"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="traceId: string, spanId: string, traceFlags: number" outputs="traceparent string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts ids and the flag value to lower-case and pads flags to two hex digits" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatTraceParent(traceId: string, spanId: string, traceFlags: number): string {
  return `00-${traceId.toLowerCase()}-${spanId.toLowerCase()}-${traceFlags.toString(16).padStart(2, '0')}`
}
// CIL[DOC-VECTOR type="context" content="purpose='Format trace metadata into a W3C traceparent string'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:formatTraceParent:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:parseTraceState:function" type="function" identity="parseTraceState" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Parse a W3C tracestate header into a key-value map"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a comma-separated tracestate string into a Record<string, string>"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="header?: string" outputs="Record<string, string>" errors="returns empty object for missing/empty headers" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Splits on commas, then on the first '=' and trims keys/values" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function parseTraceState(header?: string): Record<string, string> {
  const state: Record<string, string> = {}
  if (!header) return state
  for (const part of header.split(',')) {
    const [key, ...rest] = part.trim().split('=')
    if (key && rest.length > 0) state[key.trim()] = rest.join('=').trim()
  }
  return state
}
// CIL[DOC-VECTOR type="context" content="purpose='Parse a W3C tracestate header into a key-value map'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:parseTraceState:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:formatTraceState:function" type="function" identity="formatTraceState" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Format a key-value map as a W3C tracestate header"]
// CIL[DOC-RESPONSIBILITY responsibility="Join key=value pairs with commas"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="state: Record<string, string>" outputs="tracestate string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps entries to k=v and joins with commas" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatTraceState(state: Record<string, string>): string {
  return Object.entries(state)
    .map(([k, v]) => `${k}=${v}`)
    .join(',')
}
// CIL[DOC-VECTOR type="context" content="purpose='Format a key-value map as a W3C tracestate header'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:formatTraceState:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:isSampled:function" type="function" identity="isSampled" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Check whether trace flags include the sampled bit"]
// CIL[DOC-RESPONSIBILITY responsibility="Return true when the TRACE_FLAGS_SAMPLED bit is set"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="traceFlags: number" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Bitwise-AND with TRACE_FLAGS_SAMPLED and compares to the constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function isSampled(traceFlags: number): boolean {
  return (traceFlags & TRACE_FLAGS_SAMPLED) === TRACE_FLAGS_SAMPLED
}
// CIL[DOC-VECTOR type="context" content="purpose='Check whether trace flags include the sampled bit'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:isSampled:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:traceQueryBuilder:function" type="function" identity="traceQueryBuilder" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Wrap a Supabase query builder with automatic span creation"]
// CIL[DOC-RESPONSIBILITY responsibility="Proxy promise-returning query builder methods to trace db calls"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContextWithTrace, builder: any, operation: string, resource: string, onSpanEnd?: callback" outputs="Proxied builder that returns instrumented promises" errors="rejects with the original error, marked on the span" side_effects="creates Proxy and starts/ends spans around then/catch chains"]
// CIL[DOC-MICRO logic_summary="Uses a Proxy to intercept 'then', 'catch' and chained methods, timing async work and reporting row counts or errors" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Wrap a Supabase query builder with automatic span creation'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:traceQueryBuilder:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:traceDb:function" type="function" identity="traceDb" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Wrap a Supabase db client to add per-query tracing"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a Proxy over a db client that instruments from() and rpc() calls"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContextWithTrace, db: any, onSpanEnd?: callback" outputs="Proxy of the input db" errors="none" side_effects="creates a Proxy"]
// CIL[DOC-MICRO logic_summary="Intercepts 'from' and 'rpc' and wraps the resulting builder with traceQueryBuilder, skipping the 'logs' table to avoid recursion" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Wrap a Supabase db client to add per-query tracing'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:traceDb:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:startSpan:function" type="function" identity="startSpan" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Create and start a new span from a core context"]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize a Span with id generation, sampling inheritance and optional overrides"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContextWithTrace, spanName: string, options?: { attributes?, traceId?, traceFlags?, traceState?, sampled? }" outputs="Span object" errors="none" side_effects="generates a new span id"]
// CIL[DOC-MICRO logic_summary="Inherits parent trace id/flags/state/sampled if present, allows per-span overrides and records the start ISO timestamp" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Create and start a new span from a core context'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:startSpan:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:endSpan:function" type="function" identity="endSpan" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Finalize a span with end time, duration and optional status/attributes"]
// CIL[DOC-RESPONSIBILITY responsibility="Mutate the provided Span to record when it ended and how long it ran"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="span: Span, options?: { status?, attributes? }" outputs="the same Span object" errors="none" side_effects="mutates the span object"]
// CIL[DOC-MICRO logic_summary="Computes durationMs from startedAt and ISO endedAt, merges new attributes and sets the status" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Finalize a span with end time, duration and optional status/attributes'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:endSpan:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:withSpan:function" type="function" identity="withSpan" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Run an async function inside a traced span"]
// CIL[DOC-RESPONSIBILITY responsibility="Start a span, call the function with a child context, end the span and return the result"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContextWithTrace, spanName: string, fn: (ctx) => Promise<T>, options?: { attributes?, onEnd? }" outputs="Promise<T>" errors="rejects with the thrown error after marking the span as error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a child context, awaits fn, ends the span with ok or error status and invokes the optional onEnd callback" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Run an async function inside a traced span'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:withSpan:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/tracing.ts:withSpanSync:function" type="function" identity="withSpanSync" parent="~/.framework/functions/_shared/tracing.ts"]
// CIL[DOC-MACRO purpose="Run a synchronous function inside a traced span"]
// CIL[DOC-RESPONSIBILITY responsibility="Start a span, call the function with a child context, end the span and return the result"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/tracing.ts" layer="shared" related_files=".framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContextWithTrace, spanName: string, fn: (ctx) => T, options?: { attributes?, onEnd? }" outputs="T" errors="re-throws after marking the span as error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a child context, runs fn, ends the span and calls onEnd asynchronously without awaiting it" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Run a synchronous function inside a traced span'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/tracing.ts:withSpanSync:function"]
