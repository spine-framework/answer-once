






import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve } from 'path'
interface FunctionInfo {
  name: string
  methods: string[]
  path: string
  description?: string
}

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

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    database: { connected: boolean; latency_ms: number }
    migrations: { current: boolean; pending: number; applied: number }
    integrity: { verified: boolean }
    test_runs?: { last_suite: string; last_status: string; last_at: string }
  }
}
const PROJECT_ROOT = resolve(process.cwd(), '.')

function localMigrations(): string[] {
  const dirs = [
    resolve(PROJECT_ROOT, '.framework/migrations'),
    resolve(PROJECT_ROOT, 'custom/migrations')
  ]
  const files: string[] = []
  for (const dir of dirs) {
    if (existsSync(dir)) {
      files.push(...readdirSync(dir).filter(f => f.endsWith('.sql') && !f.startsWith('.')))
    }
  }
  return files.sort()
}

async function appliedMigrationNames(): Promise<string[]> {
  try {
    const { data } = await adminDb
      .from('_spine_migrations' as any)
      .select('filename')
      .order('filename', { ascending: true })
    return (data || []).map((r: any) => r.filename)
  } catch {
    return []
  }
}

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

function functionDirs(): string[] {
  const dirs = [
    resolve(PROJECT_ROOT, '.framework/functions'),
    resolve(PROJECT_ROOT, 'custom/functions')
  ]
  const appsDir = resolve(PROJECT_ROOT, 'custom/apps')
  if (existsSync(appsDir)) {
    for (const app of readdirSync(appsDir)) {
      dirs.push(resolve(appsDir, app, 'functions'))
    }
  }
  return dirs
}

async function discoverFunctions(): Promise<FunctionInfo[]> {
  const names = new Set<string>()
  for (const dir of functionDirs()) {
    if (!existsSync(dir)) continue
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.ts') && !f.startsWith('_') && !f.endsWith('.test.ts') && !f.endsWith('-test.ts')) {
        names.add(f)
      }
    }
  }

  return [...names].sort().map(f => {
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
async function getManifest(): Promise<{ data: SystemManifest }> {
  const manifest = loadManifest()
  const local = localMigrations()
  const appliedMigrations = await appliedMigrationNames()
  const appliedSet = new Set(appliedMigrations)
  const pendingCount = local.filter(m => !appliedSet.has(m)).length

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

  const local = localMigrations()
  const applied = await appliedMigrationNames()
  checks.migrations.applied = applied.length
  const appliedSet = new Set(applied)
  checks.migrations.pending = local.filter(m => !appliedSet.has(m)).length
  checks.migrations.current = checks.migrations.pending === 0

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