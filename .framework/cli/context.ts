// CIL[BEGIN stable_id="~/.framework/cli/context.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/context.ts"]
// CIL[DOC-MACRO purpose="Defines shared CLI runtime context and helpers for spine commands."]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize CLI execution context, load environment, and expose result formatting and error handling helpers."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="command-line options and environment variables" outputs="CoreContext, formatted output, error handling" errors="Throws when required Supabase env vars are missing" side_effects="Reads .xenv and process.env"]
// CIL[DOC-MICRO logic_summary="Imports dependencies, sets up ESM-compatible path constants, builds a CoreContext from env/JWT/API key, and provides output/error formatting." notable_decisions="Defaults to SYSTEM_PRINCIPAL; prioritizes API key auth over JWT over anonymous."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="cli_engineers,framework_maintainers"]

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { CoreContext, adminDb, SYSTEM_PRINCIPAL, Principal, getUserDb } from '../functions/_shared/index.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Defines shared CLI runtime context and helpers for spine commands.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/context.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/context.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/context.ts"]
// CIL[DOC-MACRO purpose="Provides an ESM-compatible __filename constant for this module."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the current source file path from import.meta.url."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="import.meta.url" outputs="string absolute file path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts the module's URL to a file path with fileURLToPath." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Provides an ESM-compatible __filename constant for this module.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/context.ts:__filename:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/context.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/context.ts"]
// CIL[DOC-MACRO purpose="Provides an ESM-compatible __dirname constant for this module."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the directory containing this source file."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="__filename" outputs="string absolute directory path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Derives the parent directory of __filename using the dirname helper." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Provides an ESM-compatible __dirname constant for this module.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/context.ts:__dirname:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/context.ts:loadEnv:function" type="function" identity="loadEnv" parent="~/.framework/cli/context.ts"]
// CIL[DOC-MACRO purpose="Loads local environment overrides from a .xenv file."]
// CIL[DOC-RESPONSIBILITY responsibility="Read the framework .xenv file and populate process.env without overwriting existing values."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs=".xenv file in the framework parent directory" outputs="Updated process.env" errors="none" side_effects="Mutates process.env for missing keys only"]
// CIL[DOC-MICRO logic_summary="Resolves .xenv, reads its lines, ignores blank or comment lines, parses KEY=VALUE pairs, strips surrounding quotes, and sets only missing keys." notable_decisions="Existing process.env values are intentionally not overwritten."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function loadEnv() {
  const envPath = resolve(__dirname, '../.xenv')
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Loads local environment overrides from a .xenv file.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/context.ts:loadEnv:function"]

// CIL[BEGIN stable_id="~/.framework/cli/context.ts:CliOptions:interface" type="interface" identity="CliOptions" parent="~/.framework/cli/context.ts"]
// CIL[DOC-MACRO purpose="Declares the shape of options passed to CLI context builders."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the optional account parameter used by CLI commands."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="TypeScript interface" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Contains an optional account property for scoping CLI invocations." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface CliOptions {
  account?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Declares the shape of options passed to CLI context builders.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/context.ts:CliOptions:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/context.ts:buildCliContext:function" type="function" identity="buildCliContext" parent="~/.framework/cli/context.ts"]
// CIL[DOC-MACRO purpose="Constructs a CoreContext for spine CLI commands from environment or credentials."]
// CIL[DOC-RESPONSIBILITY responsibility="Load environment, validate required Supabase variables, resolve account/request IDs, authenticate via API key or JWT, and return a CoreContext."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="opts: CliOptions = {}" outputs="Promise<CoreContext>" errors="Throws if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are missing; throws on invalid API key or JWT" side_effects="Reads process.env; queries Supabase; calls crypto.randomUUID"]
// CIL[DOC-MICRO logic_summary="Loads .xenv, asserts required Supabase env, picks account and request IDs, attempts API key auth, then JWT auth, then falls back to SYSTEM_PRINCIPAL." notable_decisions="API key auth takes precedence over JWT; account is resolved from opts, SPINE_CLI_ACCOUNT_ID, or the authenticated key record."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function buildCliContext(opts: CliOptions = {}): Promise<CoreContext> {
  loadEnv()

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Set them in v2-core/.xenv or export them before running spine commands.'
    )
  }

  const accountId = opts.account || process.env.SPINE_CLI_ACCOUNT_ID || null
  const requestId = crypto.randomUUID()

  const apiKey = process.env.SPINE_CLI_API_KEY
  if (apiKey) {
    const { data: keyRecord } = await adminDb
      .from('api_keys')
      .select('id, account_id, scopes, principal_id')
      .eq('key_hash', apiKey)
      .eq('is_active', true)
      .single()

    if (!keyRecord) {
      throw new Error('Invalid or inactive SPINE_CLI_API_KEY')
    }

    const principal: Principal = {
      id: keyRecord.principal_id || keyRecord.id,
      type: 'machine',
      accountId: keyRecord.account_id,
      scopes: keyRecord.scopes || [],
      provenance: {
        sourceType: 'api_key',
        createdBy: null,
        apiKeyId: keyRecord.id,
        invokedAt: new Date().toISOString()
      }
    }

    return {
      principal,
      accountId: accountId || keyRecord.account_id,
      db: adminDb,
      requestId
    }
  }

  const jwt = process.env.SPINE_CLI_JWT
  if (jwt) {
    const userDb = getUserDb(jwt)
    const { data: { user } } = await userDb.auth.getUser()

    if (!user) {
      throw new Error('Invalid or expired SPINE_CLI_JWT')
    }

    const { data: person } = await adminDb
      .from('people')
      .select('id, full_name, email, roles:people_roles(role:roles(slug))')
      .eq('auth_user_id', user.id)
      .single()

    const roles = (person?.roles as any[])?.map((r: any) => r.role?.slug).filter(Boolean) || []

    const principal: Principal = {
      id: person?.id || user.id,
      type: 'human',
      accountId: accountId,
      displayName: person?.full_name || user.email,
      email: person?.email || user.email,
      roles,
      provenance: {
        sourceType: 'jwt',
        createdBy: person?.id || user.id,
        invokedAt: new Date().toISOString()
      },
      authContext: { jwt }
    }

    return {
      principal,
      accountId,
      db: userDb,
      requestId
    }
  }

  return {
    principal: SYSTEM_PRINCIPAL,
    accountId,
    db: adminDb,
    requestId
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Constructs a CoreContext for spine CLI commands from environment or credentials.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/context.ts:buildCliContext:function"]

// CIL[BEGIN stable_id="~/.framework/cli/context.ts:printResult:function" type="function" identity="printResult" parent="~/.framework/cli/context.ts"]
// CIL[DOC-MACRO purpose="Prints CLI command results to stdout in human-readable or JSON form."]
// CIL[DOC-RESPONSIBILITY responsibility="Format and emit command results based on the json option."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="data, opts" outputs="Formatted output to stdout" errors="none" side_effects="Writes to stdout"]
// CIL[DOC-MICRO logic_summary="Takes data and opts. If opts.json is true, pretty-prints JSON; otherwise prints arrays as tables, objects as JSON, and primitives as plain text. Empty arrays print 'No results found.'" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function printResult(data: any, opts: { json?: boolean } = {}) {
  if (opts.json) {
    console.log(JSON.stringify(data, null, 2))
    return
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('No results found.')
      return
    }

    console.table(data)
  } else if (data && typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2))
  } else {
    console.log(data)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Prints CLI command results to stdout in human-readable or JSON form.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/context.ts:printResult:function"]

// CIL[BEGIN stable_id="~/.framework/cli/context.ts:handleError:function" type="function" identity="handleError" parent="~/.framework/cli/context.ts"]
// CIL[DOC-MACRO purpose="Prints a friendly error message for known failure codes and exits the process."]
// CIL[DOC-RESPONSIBILITY responsibility="Map known Postgres/Supabase error codes to readable messages and terminate with exit code 1."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="error, context" outputs="Error message to stderr and process termination" errors="none" side_effects="Writes to stderr; calls process.exit(1)"]
// CIL[DOC-MICRO logic_summary="Takes error and optional context. Extracts the message, prefixes with context when provided, maps PGRST116 to not-found and PGRST301 to permission-denied, prints the message, and exits." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function handleError(error: any, context?: string) {
  const message = error?.message || String(error)
  const contextStr = context ? `[${context}] ` : ''
  
  if (error?.code === 'PGRST116') {
    console.error(`${contextStr}Not found: The requested resource does not exist.`)
  } else if (error?.code === 'PGRST301') {
    console.error(`${contextStr}Permission denied: You don't have access to this resource.`)
  } else {
    console.error(`${contextStr}${message}`)
  }
  
  process.exit(1)
}
// CIL[DOC-VECTOR type="context" content="purpose='Prints a friendly error message for known failure codes and exits the process.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/context.ts:handleError:function"]
