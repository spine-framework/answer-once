/**
 * @module   context
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides context management for the CLI, facilitating interactions with the core system and user databases. It serves as a foundational component for handling user authentication and data access. INVARIANT: The CoreContext must be initialized before any database operations are performed.
 *
 * @seeAlso functions/_shared/index.ts (contains shared core functionalities).
 * @seeAlso functions/_shared/hash-api-key.ts (provides API key verification logic).
 *
 * @cil-generated
 */










import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { CoreContext, adminDb, SYSTEM_PRINCIPAL, Principal, getUserDb } from '../functions/_shared/index.ts'
import { verifyApiKey } from '../functions/_shared/hash-api-key.ts'
















/**
 * __filename is a constant that holds the absolute path of the current module file, providing a reference to the file location for logging or resolving relative paths.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       fileURLToPath
 * @cil-generated
 */
const __filename = fileURLToPath(import.meta.url)
















/**
 * __dirname is a constant that holds the directory name of the current module, allowing for relative file path resolution. It exists to facilitate file operations within the module's directory context.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       dirname
 * @cil-generated
 */
const __dirname = dirname(__filename)
















/**
 * Loads environment variables from a specified file into the process environment, ensuring that any variables defined in the file are available to the application at runtime.
 *
 * @outputSpec  void
 * @sideEffects Reads from the file system to load environment variables.
 * @stability   internal
 * @calls       resolve, existsSync, readFileSync
 * @cil-generated
 */
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
















/**
 * The CliOptions interface defines the structure for command-line interface options, allowing for optional configuration of an account string. It exists to standardize the way CLI options are handled within the module.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
export interface CliOptions {
  account?: string
}
















/**
 * Builds a CLI context by validating environment variables and retrieving user or API key information. It ensures that the necessary credentials are available for subsequent operations.
 *
 * @macro       Async function that constructs a CoreContext for CLI operations.
 * @micro       Validates environment variables and checks for either an API key or JWT to determine the principal and associated account.
 * @inputSpec
 *   opts: CliOptions (optional) — options for building the CLI context.
 * @outputSpec  Promise<CoreContext> — returns a context object containing principal, accountId, database connection, and requestId.
 * @throws      Error — Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; Error — Invalid or inactive SPINE_CLI_API_KEY; Error — Invalid or expired SPINE_CLI_JWT
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('api_keys'), adminDb.from('people'), userDb.auth.getUser
 * @cil-generated
 */
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
    const keyPrefix = apiKey.slice(0, 8)

    const { data: rows, error } = await adminDb
      .from('api_keys')
      .select('id, account_id, scopes, key_hash, expires_at')
      .eq('key_prefix', keyPrefix)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    const now = Date.now()
    const keyRecord = !error && rows
      ? rows.find((k: any) =>
          (!k.expires_at || new Date(k.expires_at).getTime() >= now) &&
          verifyApiKey(apiKey, k.key_hash)
        )
      : undefined

    if (!keyRecord) {
      throw new Error('Invalid or inactive SPINE_CLI_API_KEY')
    }

    const principal: Principal = {
      id: keyRecord.id,
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
















/**
 * Prints the result of the given data to the console in a readable format for CLI users. It provides flexibility to display data either as a formatted table or as JSON based on the provided options.
 *
 * @macro       Utility function for displaying data in various formats.
 * @micro       Uses conditional checks to determine the format of the output based on the type of data and options provided.
 * @inputSpec
 *   data: any — the data to be printed.
 *   opts: { json?: boolean } (optional) — options to control the output format.
 * @outputSpec  void
 * @sideEffects prints to console
 * @stability   internal
 * @calls       console.log, console.table, JSON.stringify
 * @cil-generated
 */
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
















/**
 * The handleError function logs error messages to the console based on the error type and exits the process. It provides specific messages for known error codes and a general message for other errors.
 *
 * @inputSpec
 *   error: any (required) — the error object to handle.
 *   context: string (optional) — an optional context string for additional logging.
 * @outputSpec  none
 * @sideEffects Logs error messages to the console and exits the process with status code 1.
 * @stability   internal
 * @calls       console.error, process.exit
 * @cil-generated
 */
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







