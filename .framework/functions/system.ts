// CIL[BEGIN stable_id="~/.framework/functions/system.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Import shared middleware, db and node modules for the system function handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide module-level imports and top-level dependencies for system.ts"]
// CIL[DOC-CONTEXT module="system" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports createHandler, adminDb, fs utils and path resolve" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="system maintainers and agentic tooling"]







import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve } from 'path'
// CIL[DOC-VECTOR type="context" content="purpose='Import shared middleware, db and node modules for the system function handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/system.ts:FunctionInfo:interface" type="interface" identity="FunctionInfo" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Define the shape of a registered Netlify function endpoint"]
// CIL[DOC-RESPONSIBILITY responsibility="Type contract for function metadata records"]
// CIL[DOC-CONTEXT module="system" layer="types" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FunctionInfo object shape" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Interface with name, methods, path and optional description" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
interface FunctionInfo {
  name: string
  methods: string[]
  path: string
  description?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of a registered Netlify function endpoint'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:FunctionInfo:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/system.ts:SystemManifest:interface" type="interface" identity="SystemManifest" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Describe the system manifest data structure"]
// CIL[DOC-RESPONSIBILITY responsibility="Type contract for the manifest response"]
// CIL[DOC-CONTEXT module="system" layer="types" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SystemManifest shape" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Includes version, schema, migrations, functions and integrity" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
interface SystemManifest {
  version: string
  schema: string
  migrations: {
    applied: number
    latest: string | null
    pending: number
  }
  functions: FunctionInfo[]
  integrity: {
    core_hash: string | null
    verified: boolean
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Describe the system manifest data structure'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:SystemManifest:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/system.ts:HealthCheck:interface" type="interface" identity="HealthCheck" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Define the health check report structure"]
// CIL[DOC-RESPONSIBILITY responsibility="Type contract for the health response"]
// CIL[DOC-CONTEXT module="system" layer="types" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="HealthCheck shape" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Status enum and nested checks for database, migrations, integrity and test_runs" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    database: { connected: boolean; latency_ms: number }
    migrations: { current: boolean; pending: number; applied: number }
    integrity: { verified: boolean }
    test_runs?: { last_suite: string; last_status: string; last_at: string }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the health check report structure'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:HealthCheck:interface"]
// CIL[BEGIN stable_id="~/.framework/functions/system.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Resolve the project root directory at runtime"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a constant path reference for filesystem resolution"]
// CIL[DOC-CONTEXT module="system" layer="constants" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string absolute path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="resolve(process.cwd(), .)" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const PROJECT_ROOT = resolve(process.cwd(), '.')
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the project root directory at runtime'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:PROJECT_ROOT:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/system.ts:loadManifest:function" type="function" identity="loadManifest" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Read and parse the spine manifest file or return a default"]
// CIL[DOC-RESPONSIBILITY responsibility="Load project version and integrity metadata"]
// CIL[DOC-CONTEXT module="system" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ version, integrity }" errors="Returns default on missing file or parse failure" side_effects="Reads .spine-manifest.json from disk"]
// CIL[DOC-MICRO logic_summary="Check existence of .spine-manifest.json, parse JSON, fallback to 2.0.0 with unverified integrity" notable_decisions="Treats any parse error as default"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function loadManifest(): { version: string; integrity: { core_hash: string | null; verified: boolean } } {
  try {
    const manifestPath = resolve(PROJECT_ROOT, '.spine-manifest.json')
    if (!existsSync(manifestPath)) {
      return { version: '2.0.0', integrity: { core_hash: null, verified: false } }
    }
    const content = readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(content)
    return {
      version: manifest.version || '2.0.0',
      integrity: {
        core_hash: manifest.integrity?.src || null,
        verified: true
      }
    }
  } catch {
    return { version: '2.0.0', integrity: { core_hash: null, verified: false } }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Read and parse the spine manifest file or return a default'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:loadManifest:function"]

// CIL[BEGIN stable_id="~/.framework/functions/system.ts:discoverFunctions:function" type="function" identity="discoverFunctions" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Scan the v2-core functions directory and build endpoint metadata"]
// CIL[DOC-RESPONSIBILITY responsibility="Discover available Netlify function endpoints and allowed HTTP methods"]
// CIL[DOC-CONTEXT module="system" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FunctionInfo[]" errors="Returns empty array if directory missing" side_effects="Reads directory entries from v2-core/functions"]
// CIL[DOC-MICRO logic_summary="List .ts files, assign GET, POST, PATCH, DELETE based on blocklists" notable_decisions="Blocklist-based method filtering for log, test, system and auth endpoints"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function discoverFunctions(): Promise<FunctionInfo[]> {
  const functionsDir = resolve(PROJECT_ROOT, 'v2-core/functions')
  if (!existsSync(functionsDir)) {
    return []
  }

  const files = readdirSync(functionsDir)
    .filter(f => f.endsWith('.ts') && !f.startsWith('_'))
    .sort()

  return files.map(f => {
    const name = f.replace('.ts', '')
    const methods = ['GET']
    if (!['logs', 'tests', 'system-cron', 'debug-auth'].includes(name)) {
      methods.push('POST')
    }
    if (!['logs', 'tests', 'system-cron'].includes(name)) {
      methods.push('PATCH')
    }
    if (!['logs', 'tests', 'system-cron', 'debug-auth', 'auth'].includes(name)) {
      methods.push('DELETE')
    }

    return {
      name,
      methods,
      path: `/.netlify/functions/${name}`,
      description: `Spine ${name} endpoint`
    }
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Scan the v2-core functions directory and build endpoint metadata'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:discoverFunctions:function"]
// CIL[BEGIN stable_id="~/.framework/functions/system.ts:getManifest:function" type="function" identity="getManifest" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Assemble the system manifest by combining file discovery and migration state"]
// CIL[DOC-RESPONSIBILITY responsibility="Build the manifest payload for the manifest action"]
// CIL[DOC-CONTEXT module="system" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ data: SystemManifest }" errors="Silently ignores migration query failures, leaving applied list empty" side_effects="Queries schema_migrations table and scans migrations_dayzero directory"]
// CIL[DOC-MICRO logic_summary="Load manifest, scan local SQL migrations, query applied migrations, compute pending count, discover functions" notable_decisions="Swallows adminDb query errors to keep the handler resilient"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function getManifest(): Promise<{ data: SystemManifest }> {
  const manifest = loadManifest()

  const migrationsDir = resolve(PROJECT_ROOT, 'v2-core/migrations_dayzero')
  let localMigrations: string[] = []
  if (existsSync(migrationsDir)) {
    localMigrations = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
  }

  let appliedMigrations: string[] = []
  try {
    const { data } = await adminDb
      .schema('public' as any)
      .from('schema_migrations' as any)
      .select('version')
      .order('version', { ascending: true })
    appliedMigrations = (data || []).map((r: any) => r.version)
  } catch {
  }

  const appliedSet = new Set(appliedMigrations)
  const pendingCount = localMigrations.filter(m => !appliedSet.has(m.replace('.sql', ''))).length

  const functions = await discoverFunctions()

  return {
    data: {
      version: manifest.version,
      schema: 'public',
      migrations: {
        applied: appliedMigrations.length,
        latest: appliedMigrations[appliedMigrations.length - 1] || null,
        pending: pendingCount
      },
      functions,
      integrity: manifest.integrity
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Assemble the system manifest by combining file discovery and migration state'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:getManifest:function"]
// CIL[BEGIN stable_id="~/.framework/functions/system.ts:getHealth:function" type="function" identity="getHealth" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Run health checks against database, migrations, integrity and test runs"]
// CIL[DOC-RESPONSIBILITY responsibility="Build the health payload for the health action"]
// CIL[DOC-CONTEXT module="system" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ data: HealthCheck }" errors="Database, migration or test query failures set degraded or unhealthy status" side_effects="Queries accounts, schema_migrations and test_runs tables; reads migrations_dayzero directory"]
// CIL[DOC-MICRO logic_summary="Test DB connectivity and latency, compare local and applied migrations, verify manifest integrity, fetch latest test run" notable_decisions="Missing DB makes unhealthy; pending migrations or unverified integrity makes degraded"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function getHealth(): Promise<{ data: HealthCheck }> {
  const checks: HealthCheck['checks'] = {
    database: { connected: false, latency_ms: 0 },
    migrations: { current: false, pending: 0, applied: 0 },
    integrity: { verified: false }
  }

  const dbStart = Date.now()
  try {
    const { error } = await adminDb.from('accounts').select('id').limit(1)
    checks.database.connected = !error
    checks.database.latency_ms = Date.now() - dbStart
  } catch {
    checks.database.connected = false
  }

  const migrationsDir = resolve(PROJECT_ROOT, 'v2-core/migrations_dayzero')
  let localMigrations: string[] = []
  if (existsSync(migrationsDir)) {
    localMigrations = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
  }

  try {
    const { data } = await adminDb
      .schema('public' as any)
      .from('schema_migrations' as any)
      .select('version')
    const applied = (data || []).map((r: any) => r.version)
    checks.migrations.applied = applied.length
    const appliedSet = new Set(applied)
    checks.migrations.pending = localMigrations.filter(m => !appliedSet.has(m.replace('.sql', ''))).length
    checks.migrations.current = checks.migrations.pending === 0
  } catch {
    checks.migrations.pending = localMigrations.length
    checks.migrations.current = false
  }

  const manifest = loadManifest()
  checks.integrity.verified = manifest.integrity.verified

  try {
    const { data } = await adminDb
      .from('test_runs')
      .select('suite, status, started_at')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()
    if (data) {
      checks.test_runs = {
        last_suite: data.suite,
        last_status: data.status,
        last_at: data.started_at
      }
    }
  } catch {
  }

  let status: HealthCheck['status'] = 'healthy'
  if (!checks.database.connected) {
    status = 'unhealthy'
  } else if (checks.migrations.pending > 0 || !checks.integrity.verified) {
    status = 'degraded'
  }

  return { data: { status, checks } }
}
// CIL[DOC-VECTOR type="context" content="purpose='Run health checks against database, migrations, integrity and test runs'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:getHealth:function"]
// CIL[BEGIN stable_id="~/.framework/functions/system.ts:getOpenApi:function" type="function" identity="getOpenApi" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Generate an OpenAPI 3.1.0 document from discovered function metadata"]
// CIL[DOC-RESPONSIBILITY responsibility="Build the openapi payload for the openapi action"]
// CIL[DOC-CONTEXT module="system" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ data: any }" errors="None thrown; builds paths from discovered functions" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Discover functions, build path map, add operation metadata and action query parameter, wrap with info and servers" notable_decisions="Response content schema is a placeholder object"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function getOpenApi(): Promise<{ data: any }> {
  const functions = await discoverFunctions()
  const manifest = loadManifest()

  const paths: Record<string, any> = {}
  for (const fn of functions) {
    const pathKey = fn.path.replace('/.netlify/functions', '')
    paths[pathKey] = {}

    for (const method of fn.methods) {
      const methodLower = method.toLowerCase()
      paths[pathKey][methodLower] = {
        operationId: `${fn.name}_${methodLower}`,
        summary: fn.description || `${method} ${fn.name}`,
        parameters: [
          {
            name: 'action',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Action to perform (list, get, create, update, delete)'
          }
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }

  return {
    data: {
      openapi: '3.1.0',
      info: {
        title: 'Spine API',
        version: manifest.version,
        description: 'Spine v2 REST API for agentic IDE integration'
      },
      servers: [
        { url: '/.netlify/functions' }
      ],
      paths
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate an OpenAPI 3.1.0 document from discovered function metadata'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:getOpenApi:function"]
// CIL[BEGIN stable_id="~/.framework/functions/system.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/system.ts"]
// CIL[DOC-MACRO purpose="Create the system Netlify function handler and dispatch actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Route incoming action query to manifest, health, openapi or return an error"]
// CIL[DOC-CONTEXT module="system" layer="entry" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/system.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.action" outputs="Promise<manifest or health or openapi result or error response>" errors="Returns 400 error for unknown action" side_effects="Invokes getManifest, getHealth or getOpenApi"]
// CIL[DOC-MICRO logic_summary="Read action from query, switch on manifest/health/openapi, default to error" notable_decisions="Default action is manifest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export const handler = createHandler(async (ctx) => {
  const q = (ctx as any).query || {}
  const action = q.action || 'manifest'

  switch (action) {
    case 'manifest':
      return getManifest()

    case 'health':
      return getHealth()

    case 'openapi':
      return getOpenApi()

    default:
      return {
        error: `Unknown action: ${action}. Valid actions: manifest, health, openapi`,
        status: 400
      }
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Create the system Netlify function handler and dispatch actions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/system.ts:handler:constant"]