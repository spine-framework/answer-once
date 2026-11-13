import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Command } from 'commander'

type DbCall = { op: string; args: any[] }
type DbQuery = { table: string; calls: DbCall[] }
type DbResult = { data?: any; error?: any }

const supaState = vi.hoisted(() => ({
  createClientCalls: [] as any[],
  responder: null as null | ((q: DbQuery) => DbResult),
  history: [] as DbQuery[],
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => {
    supaState.createClientCalls.push(args)
    return {
      from(table: string) {
        const calls: DbCall[] = []
        const query: DbQuery = { table, calls }
        const builder: any = {
          select(...a: any[]) { calls.push({ op: 'select', args: a }); return builder },
          upsert(...a: any[]) { calls.push({ op: 'upsert', args: a }); return builder },
          update(...a: any[]) { calls.push({ op: 'update', args: a }); return builder },
          insert(...a: any[]) { calls.push({ op: 'insert', args: a }); return builder },
          eq(...a: any[]) { calls.push({ op: 'eq', args: a }); return builder },
          single() { supaState.history.push(query); return Promise.resolve(supaState.responder!(query)) },
          maybeSingle() { supaState.history.push(query); return Promise.resolve(supaState.responder!(query)) },
          then(res: any, rej: any) {
            supaState.history.push(query)
            return Promise.resolve(supaState.responder!(query)).then(res, rej)
          },
        }
        return builder
      },
    }
  },
}))

const pgState = vi.hoisted(() => ({
  instances: [] as any[],
  handler: null as null | ((sql: string, params?: any[]) => any),
}))

vi.mock('pg', () => ({
  default: {
    Client: class {
      config: any
      calls: { sql: string; params?: any[] }[] = []
      ended = false
      constructor(config: any) { this.config = config; pgState.instances.push(this) }
      async connect() {}
      async end() { this.ended = true }
      async query(sql: string, params?: any[]) {
        this.calls.push({ sql, params })
        if (pgState.handler) return pgState.handler(sql, params)
        return { rows: [] }
      }
    },
  },
}))

const execState = vi.hoisted(() => ({ calls: [] as string[] }))

vi.mock('child_process', () => ({
  execSync: (cmd: string) => { execState.calls.push(cmd); return Buffer.from('') },
}))

const rlState = vi.hoisted(() => ({ answer: 'r' }))

vi.mock('readline', () => ({
  default: {
    createInterface: () => ({
      question: (_q: string, cb: (answer: string) => void) => cb(rlState.answer),
      close: () => {},
    }),
  },
  createInterface: () => ({
    question: (_q: string, cb: (answer: string) => void) => cb(rlState.answer),
    close: () => {},
  }),
}))

const ORIG_CWD = process.cwd()
const ENV_KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_DB_PASSWORD'] as const
let savedEnv: Record<string, string | undefined> = {}
let workdir = ''
let exitSpy: any

function writeJson(path: string, value: any) {
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2))
}

function baseManifest(overrides: Record<string, any> = {}) {
  return {
    name: 'Test App',
    slug: 'testapp',
    version: '1.0.0',
    app_type: 'data',
    ...overrides,
  }
}

function manifestWithRegistration(overrides: Record<string, any> = {}) {
  return baseManifest({
    registration: {
      enabled: true,
      default_role: 'member',
      redirect_path: '/testapp',
      account_strategy: 'new',
    },
    required_roles: ['member', 'admin'],
    ...overrides,
  })
}

function makeApp(dir: string, manifest: Record<string, any>, files: Record<string, string> = {}) {
  mkdirSync(dir, { recursive: true })
  writeJson(join(dir, 'manifest.json'), manifest)
  writeJson(join(dir, 'package.json'), { name: 'testapp', version: manifest.version })
  for (const [rel, content] of Object.entries(files)) {
    const p = join(dir, rel)
    mkdirSync(join(p, '..'), { recursive: true })
    writeFileSync(p, content)
  }
  return dir
}

async function freshModule() {
  vi.resetModules()
  return await import('../../cli/commands/install-app.ts')
}

function setSeedEnv() {
  process.env.SUPABASE_URL = 'https://abc123.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
}

function setMigrateEnv() {
  setSeedEnv()
  process.env.SUPABASE_DB_PASSWORD = 'dbpass'
}

function dbResponder(handler: (q: DbQuery) => DbResult) {
  supaState.responder = handler
}

function defaultResponder(q: DbQuery): DbResult {
  const first = q.calls[0]?.op
  if (q.table === 'apps' && first === 'select') return { data: null, error: null }
  if (first === 'upsert' && q.table === 'apps') return { data: { id: 'app-1' }, error: null }
  return { data: null, error: null }
}

function queriesTo(table: string, op?: string) {
  return supaState.history.filter(q => q.table === table && (!op || q.calls.some(c => c.op === op)))
}

async function makeProgram() {
  const mod = await freshModule()
  const program = new Command()
  program.exitOverride()
  mod.registerInstallAppCommands(program)
  return program
}

function writeSpineConfig(content: any) {
  writeFileSync(join(workdir, 'spine.config.json'), typeof content === 'string' ? content : JSON.stringify(content))
}

function readSpineConfig(path = join(workdir, 'spine.config.json')) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

beforeEach(() => {
  savedEnv = {}
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k]
  workdir = mkdtempSync(join(tmpdir(), 'spine-install-test-'))
  process.chdir(workdir)
  supaState.createClientCalls = []
  supaState.history = []
  supaState.responder = defaultResponder
  pgState.instances = []
  pgState.handler = null
  execState.calls = []
  rlState.answer = 'r'
  exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`process.exit(${code})`)
  }) as any)
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(process.stdout, 'write').mockImplementation((() => true) as any)
})

afterEach(() => {
  process.chdir(ORIG_CWD)
  rmSync(workdir, { recursive: true, force: true })
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
  }
  vi.restoreAllMocks()
})

describe('seedApp preflight', () => {
  it('throws when Supabase env is missing without creating a client', async () => {
    const { seedApp } = await freshModule()
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const appDir = makeApp(join(workdir, 'app'), baseManifest())
    await expect(seedApp(appDir, 'testapp', join(workdir, 'spine.config.json'))).rejects.toThrow(/SUPABASE_URL/)
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('rejects a missing declared seed file before creating a client', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/missing.json', table: 'roles', conflict: 'slug' }],
    }))
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('rejects a seed path escaping the app root before creating a client', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    writeJson(join(workdir, 'outside.json'), [])
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: '../outside.json', table: 'roles', conflict: 'slug' }],
    }))
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('rejects a malformed declared seed file before creating a client', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }],
    }), { 'seed/roles.json': JSON.stringify([null]) })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('rejects a malformed optional fallback seed file before creating a client', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest(), {
      'seed/roles.json': JSON.stringify({ not: 'an array' }),
    })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('throws on manifest slug mismatch before creating a client', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest({ slug: 'other-app' }))
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/slug/i)
    expect(supaState.createClientCalls.length).toBe(0)
  })
})

describe('seedApp config and manifest preflight', () => {
  it.each([
    '{ not json',
    'null',
    '[]',
    '"text"',
    '42',
    JSON.stringify({ registration: 'x' }),
    JSON.stringify({ registration: [] }),
    JSON.stringify({ registration: null }),
    JSON.stringify({ registration: { apps: 'x' } }),
    JSON.stringify({ registration: { apps: [] } }),
    JSON.stringify({ registration: { apps: null } }),
  ])('rejects malformed local config %s before creating a client', async (content) => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    writeSpineConfig(content)
    const appDir = makeApp(join(workdir, 'app'), manifestWithRegistration())
    await expect(seedApp(appDir, 'testapp', configPath)).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('never reads the local config when the manifest has no registration block', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    writeSpineConfig('{ not json')
    const appDir = makeApp(join(workdir, 'app'), baseManifest())
    await seedApp(appDir, 'testapp', configPath)
    expect(supaState.createClientCalls.length).toBe(1)
    expect(readFileSync(configPath, 'utf8')).toBe('{ not json')
  })

  it.each(['"plain"', '[1,2]', '5'])('rejects a non-object manifest.config %s before creating a client', async (cfg) => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest({ config: JSON.parse(cfg) }))
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('treats manifest.config null as absent', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest({ config: null }))
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    const upsert = queriesTo('apps', 'upsert')[0].calls.find(c => c.op === 'upsert')!.args[0]
    expect(upsert.config).toBeUndefined()
  })

  it('rejects a malformed existing apps.config before the app upsert', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'select') return { data: { config: 'broken' }, error: null }
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest())
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
    expect(queriesTo('apps', 'upsert').length).toBe(0)
  })

  it.each(['__proto__', 'Bad_Slug', 'UPPER', '-lead', 'has space', 'test_app', '9start'])(
    'rejects invalid app slug %s before validation and client creation',
    async (slug) => {
      const { seedApp } = await freshModule()
      setSeedEnv()
      const appDir = makeApp(join(workdir, 'app'), manifestWithRegistration())
      await expect(seedApp(appDir, slug as any, join(workdir, 'c.json'))).rejects.toThrow(/slug/i)
      expect(supaState.createClientCalls.length).toBe(0)
    },
  )

  it('rejects a non-string app slug before creating a client', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), manifestWithRegistration())
    await expect(seedApp(appDir, 42 as any, join(workdir, 'c.json'))).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it.each([{ enabled: 'yes' }, { enabled: 1 }, { enabled: {} }])(
    'rejects non-boolean registration.enabled %j before creating a client',
    async (registration) => {
      const { seedApp } = await freshModule()
      setSeedEnv()
      const appDir = makeApp(join(workdir, 'app'), baseManifest({
        registration: { ...registration, default_role: 'member', redirect_path: '/x' },
      }))
      await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
      expect(supaState.createClientCalls.length).toBe(0)
    },
  )

  it.each([
    { enabled: true, redirect_path: '/x' },
    { enabled: true, default_role: 'member' },
    { enabled: true, default_role: '  ', redirect_path: '/x' },
    { enabled: true, default_role: 'member', redirect_path: '' },
  ])('requires nonempty default_role and redirect_path when enabled %j before creating a client', async (registration) => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest({ registration }))
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })
})

describe('permissions patch preflight', () => {
  const patchEntry = {
    file: 'seed/type_permissions.json',
    table: 'types',
    conflict: 'kind,slug',
    inject_app_id: false,
    permissions_patch: true,
  }

  function patchApp(records: any[]) {
    return makeApp(join(workdir, 'app'), baseManifest({ seed: [patchEntry] }), {
      'seed/type_permissions.json': JSON.stringify(records),
    })
  }

  it.each<{ records: any[] }>([
    { records: [{ slug: 'task', record_permissions: { admin: ['read'] } }] },
    { records: [{ kind: '', slug: 'task', record_permissions: {} }] },
    { records: [{ kind: 'item', slug: '  ', record_permissions: {} }] },
    { records: [{ kind: 'item', slug: 'task' }] },
    { records: [{ kind: 'item', slug: 'task', record_permissions: null }] },
    { records: [{ kind: 'item', slug: 'task', record_permissions: ['read'] }] },
    { records: [{ kind: 'item', slug: 'task', record_permissions: 'x' }] },
    { records: [{ kind: 'item', slug: 'task', record_permissions: { admin: 'read' } }] },
    { records: [{ kind: 'item', slug: 'task', record_permissions: { admin: ['read', 'drop'] } }] },
  ])('rejects malformed patch row %# before creating a client', async ({ records }) => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    await expect(seedApp(patchApp(records), 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('accepts an empty record_permissions map and treats it as an explicit no-grant', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'types' && q.calls[0]?.op === 'select') {
        return { data: { id: 't-1', design_schema: { record_permissions: {} } }, error: null }
      }
      return { data: null, error: null }
    })
    await seedApp(patchApp([{ kind: 'item', slug: 'task', record_permissions: {} }]), 'testapp', join(workdir, 'c.json'))
    expect(supaState.createClientCalls.length).toBe(1)
    expect(queriesTo('types', 'update').length).toBe(0)
  })
})

describe('seedApp fail-closed writes', () => {
  it('seeds an empty declared seed array successfully', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }],
    }), { 'seed/roles.json': '[]' })
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    expect(supaState.createClientCalls.length).toBe(1)
    expect(queriesTo('apps', 'upsert').length).toBe(1)
    expect(queriesTo('roles').length).toBe(0)
  })

  it('throws when the app upsert errors', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: null, error: { message: 'upsert blew up' } }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest())
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow('upsert blew up')
    expect(queriesTo('roles').length).toBe(0)
  })

  it('throws when the app upsert returns no id', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: null, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest())
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/no id/i)
  })

  it('throws on an ordinary seed row upsert failure', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'roles' && q.calls[0]?.op === 'upsert') return { data: null, error: { message: 'row conflict' } }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }],
    }), { 'seed/roles.json': JSON.stringify([{ slug: 'member', name: 'Member' }]) })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow('row conflict')
  })

  it('throws when a trigger seed references a missing pipeline', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'pipelines') return { data: null, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/triggers.json', table: 'triggers', conflict: 'slug' }],
    }), { 'seed/triggers.json': JSON.stringify([{ slug: 't1', pipeline_slug: 'missing-pipe' }]) })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/pipeline/i)
  })

  it('generates validation_schema for types rows and keeps insert-only conflict contract', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      return { data: null, error: null }
    })
    const design = { fields: { title: { data_type: 'text', required: true } } }
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/types.json', table: 'types', conflict: 'kind,slug', inject_app_id: false }],
    }), { 'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'task', design_schema: design }]) })
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    const typeUpserts = queriesTo('types', 'upsert')
    expect(typeUpserts.length).toBe(1)
    const [row, opts] = typeUpserts[0].calls.find(c => c.op === 'upsert')!.args
    expect(row.app_id).toBeUndefined()
    expect(row.validation_schema).toEqual({ fields: { title: { data_type: 'text', required: true } } })
    expect(opts).toEqual({ onConflict: 'kind,slug', ignoreDuplicates: true })
  })

  it('throws when a types row carries a non-object design_schema before creating a client', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/types.json', table: 'types', conflict: 'kind,slug', inject_app_id: false }],
    }), { 'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'task', design_schema: 'nope' }]) })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/design_schema/)
    expect(supaState.createClientCalls.length).toBe(0)
    expect(queriesTo('apps', 'upsert').length).toBe(0)
    expect(queriesTo('types', 'upsert').length).toBe(0)
  })

  it('throws when an explicit permissions patch targets a missing type', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'types' && q.calls[0]?.op === 'select') return { data: null, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/type_permissions.json', table: 'types', conflict: 'kind,slug', inject_app_id: false, permissions_patch: true }],
    }), { 'seed/type_permissions.json': JSON.stringify([{ kind: 'item', slug: 'ghost', record_permissions: { admin: ['read'] } }]) })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/ghost|not found/i)
  })

  it('throws on a malformed permissions patch row', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/type_permissions.json', table: 'types', conflict: 'kind,slug', inject_app_id: false, permissions_patch: true }],
    }), { 'seed/type_permissions.json': JSON.stringify([{ kind: 'item' }]) })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow()
  })

  it('regenerates validation_schema from the merged design schema on patch replace and throws on patch DB failure', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const existingSchema = { fields: { title: { data_type: 'text', required: true } }, record_permissions: { admin: ['read'] } }
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'types' && q.calls[0]?.op === 'select') return { data: { id: 't-1', design_schema: existingSchema }, error: null }
      if (q.table === 'types' && q.calls[0]?.op === 'update') return { data: null, error: { message: 'patch write failed' } }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/type_permissions.json', table: 'types', conflict: 'kind,slug', inject_app_id: false, permissions_patch: true }],
    }), { 'seed/type_permissions.json': JSON.stringify([{ kind: 'item', slug: 'task', record_permissions: { admin: ['read', 'update'] } }]) })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow('patch write failed')
    const updateCall = queriesTo('types', 'update')[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updateCall.design_schema.record_permissions).toEqual({ admin: ['read', 'update'] })
    expect(updateCall.validation_schema).toEqual({ fields: { title: { data_type: 'text', required: true } } })
  })
})

describe('registration sync', () => {
  function seededRegManifest(overrides: Record<string, any> = {}) {
    return baseManifest({
      registration: {
        enabled: true,
        default_role: 'member',
        redirect_path: '/testapp',
        account_strategy: 'new',
      },
      required_roles: ['member', 'admin'],
      ...overrides,
    })
  }

  it('writes server registration policy and the local config file after seeds', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    const appDir = makeApp(join(workdir, 'app'), seededRegManifest(), { 'seed/roles.json': '[]' })
    await seedApp(appDir, 'testapp', configPath)
    const updates = queriesTo('apps', 'update')
    expect(updates.length).toBe(1)
    const updatePayload = updates[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updatePayload.config.registration).toEqual({
      roles: ['member', 'admin'],
      default_role: 'member',
      path: '/testapp',
      enabled: true,
      account_strategy: 'new',
      target_account: undefined,
      parent_account: undefined,
      default_workspace_name: undefined,
      allow_domain_join: undefined,
    })
    const fileCfg = readSpineConfig(configPath)
    expect(fileCfg.registration.apps.testapp.default_role).toBe('member')
    expect(fileCfg.registration.default_app).toBe('testapp')
    expect(fileCfg.registration.allow_url_override).toBe(true)
  })

  it('merges existing apps.config instead of erasing unrelated keys', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'select') {
        return { data: { config: { other_key: 'keep', feature_flags: { x: 1 } } }, error: null }
      }
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), seededRegManifest({ config: { manifest_key: true } }))
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    const upsertPayload = queriesTo('apps', 'upsert')[0].calls.find(c => c.op === 'upsert')!.args[0]
    expect(upsertPayload.config).toEqual({ other_key: 'keep', feature_flags: { x: 1 }, manifest_key: true })
    const updatePayload = queriesTo('apps', 'update')[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updatePayload.config.other_key).toBe('keep')
    expect(updatePayload.config.registration.default_role).toBe('member')
  })

  it('does not write server registration when the manifest has no registration block', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = makeApp(join(workdir, 'app'), baseManifest())
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    expect(queriesTo('apps', 'update').length).toBe(0)
    expect(existsSync(join(workdir, 'c.json'))).toBe(false)
  })

  it('preserves a preexisting default_app and unrelated config entries on reseed', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    writeSpineConfig({
      registration: {
        default_app: 'other-app',
        default_role: 'admin',
        allow_url_override: false,
        apps: { 'other-app': { roles: ['admin'], default_role: 'admin', path: '/other', enabled: true, account_strategy: 'new' } },
      },
      unrelated_root: 'keep-me',
    })
    const appDir = makeApp(join(workdir, 'app'), seededRegManifest())
    await seedApp(appDir, 'testapp', configPath)
    const fileCfg = readSpineConfig(configPath)
    expect(fileCfg.unrelated_root).toBe('keep-me')
    expect(fileCfg.registration.default_app).toBe('other-app')
    expect(fileCfg.registration.default_role).toBe('admin')
    expect(fileCfg.registration.allow_url_override).toBe(false)
    expect(fileCfg.registration.apps['other-app'].path).toBe('/other')
    expect(fileCfg.registration.apps.testapp.default_role).toBe('member')
  })

  it('throws when the server registration policy write fails', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'apps' && q.calls[0]?.op === 'update') return { data: null, error: { message: 'policy write denied' } }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), seededRegManifest())
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow('policy write denied')
  })

  it('throws when the local spine.config.json is corrupt before creating a client', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    writeSpineConfig('{ not json')
    const appDir = makeApp(join(workdir, 'app'), seededRegManifest())
    await expect(seedApp(appDir, 'testapp', configPath)).rejects.toThrow()
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('persists an explicit enabled:false policy to server and file with neutral fallback', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    const appDir = makeApp(join(workdir, 'app'), manifestWithRegistration({
      route_prefix: '/testapp',
      registration: { enabled: false },
      required_roles: [],
    }))
    await seedApp(appDir, 'testapp', configPath)
    const updates = queriesTo('apps', 'update')
    expect(updates.length).toBe(1)
    const updatePayload = updates[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updatePayload.config.registration).toEqual({
      roles: ['member'],
      default_role: 'member',
      path: '/testapp',
      enabled: false,
      account_strategy: 'new',
      target_account: undefined,
      parent_account: undefined,
      default_workspace_name: undefined,
      allow_domain_join: undefined,
    })
    const fileCfg = readSpineConfig(configPath)
    expect(fileCfg.registration.apps.testapp).toEqual(updatePayload.config.registration)
    expect(fileCfg.registration.default_app).toBeUndefined()
  })

  it('preserves previous server and local policy fields when toggling enabled:false', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    const prior = {
      roles: ['admin', 'member'],
      default_role: 'admin',
      path: '/prior',
      enabled: true,
      account_strategy: 'existing',
      target_account: 'acme',
      allow_domain_join: true,
    }
    writeSpineConfig({ registration: { default_app: 'testapp', apps: { testapp: prior } } })
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'select') {
        return { data: { config: { registration: prior } }, error: null }
      }
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), manifestWithRegistration({
      registration: { enabled: false },
      required_roles: [],
    }))
    await seedApp(appDir, 'testapp', configPath)
    const updatePayload = queriesTo('apps', 'update')[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updatePayload.config.registration).toEqual({ ...prior, enabled: false })
    const fileCfg = readSpineConfig(configPath)
    expect(fileCfg.registration.apps.testapp).toEqual({ ...prior, enabled: false })
    expect(fileCfg.registration.default_app).toBe('testapp')
  })

  it('writes one canonical disabled entry to both sides when prior server/local policies diverge', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    const localPrior = {
      roles: ['local-role'],
      default_role: 'local-role',
      path: '/local-path',
      enabled: true,
      account_strategy: 'existing',
      target_account: 'local-acct',
    }
    const serverPrior = {
      roles: ['server-role'],
      default_role: 'server-role',
      path: '/server-path',
      enabled: true,
      account_strategy: 'new',
    }
    writeSpineConfig({ registration: { apps: { testapp: localPrior } } })
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'select') {
        return { data: { config: { registration: serverPrior } }, error: null }
      }
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), manifestWithRegistration({
      registration: { enabled: false },
      required_roles: [],
    }))
    await seedApp(appDir, 'testapp', configPath)
    const expected = {
      roles: ['server-role'],
      default_role: 'server-role',
      path: '/server-path',
      enabled: false,
      account_strategy: 'new',
      target_account: 'local-acct',
      parent_account: undefined,
      default_workspace_name: undefined,
      allow_domain_join: undefined,
    }
    const updatePayload = queriesTo('apps', 'update')[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updatePayload.config.registration).toEqual(expected)
    const fileCfg = readSpineConfig(configPath)
    expect(fileCfg.registration.apps.testapp).toEqual(expected)
    expect(fileCfg.registration.default_app).toBeUndefined()
  })

  it('copies allow_domain_join when declared without forcing it on other apps', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const configPath = join(workdir, 'spine.config.json')
    writeSpineConfig({
      registration: {
        default_app: 'other-app',
        apps: { 'other-app': { roles: ['admin'], default_role: 'admin', path: '/o', enabled: true, account_strategy: 'new' } },
      },
    })
    const manifest = seededRegManifest()
    manifest.registration.allow_domain_join = true
    const appDir = makeApp(join(workdir, 'app'), manifest)
    await seedApp(appDir, 'testapp', configPath)
    const fileCfg = readSpineConfig(configPath)
    expect(fileCfg.registration.apps.testapp.allow_domain_join).toBe(true)
    expect(fileCfg.registration.apps['other-app'].allow_domain_join).toBeUndefined()
  })
})

describe('update-db-app', () => {
  it('produces the same server registration as a fresh seed', async () => {
    setSeedEnv()
    const manifest = baseManifest({
      registration: { enabled: true, default_role: 'member', redirect_path: '/testapp', account_strategy: 'new' },
      required_roles: ['member'],
    })
    makeApp(join(workdir, 'custom/apps/testapp'), manifest)
    const program = await makeProgram()
    await program.parseAsync(['node', 'cli', 'update-db-app', 'testapp'])
    const updatePayload = queriesTo('apps', 'update')[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updatePayload.config.registration).toEqual({
      roles: ['member'],
      default_role: 'member',
      path: '/testapp',
      enabled: true,
      account_strategy: 'new',
      target_account: undefined,
      parent_account: undefined,
      default_workspace_name: undefined,
      allow_domain_join: undefined,
    })
    const fileCfg = readSpineConfig()
    expect(fileCfg.registration.apps.testapp.roles).toEqual(['member'])
  })

  it('exits nonzero when the registration policy write fails', async () => {
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'apps' && q.calls[0]?.op === 'update') return { data: null, error: { message: 'denied' } }
      return { data: null, error: null }
    })
    const manifest = baseManifest({
      registration: { enabled: true, default_role: 'member', redirect_path: '/testapp' },
    })
    makeApp(join(workdir, 'custom/apps/testapp'), manifest)
    const program = await makeProgram()
    await expect(program.parseAsync(['node', 'cli', 'update-db-app', 'testapp'])).rejects.toThrow('process.exit(1)')
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('exits before creating a client when manifest slug does not match the command slug', async () => {
    setSeedEnv()
    makeApp(join(workdir, 'custom/apps/testapp'), baseManifest({ slug: 'other-app' }))
    const program = await makeProgram()
    await expect(program.parseAsync(['node', 'cli', 'update-db-app', 'testapp'])).rejects.toThrow('process.exit(1)')
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('exits before creating a client when the local config is corrupt and registration is declared', async () => {
    setSeedEnv()
    writeSpineConfig('{ not json')
    makeApp(join(workdir, 'custom/apps/testapp'), manifestWithRegistration())
    const program = await makeProgram()
    await expect(program.parseAsync(['node', 'cli', 'update-db-app', 'testapp'])).rejects.toThrow('process.exit(1)')
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('syncs an explicit enabled:false policy like seedApp does', async () => {
    setSeedEnv()
    makeApp(join(workdir, 'custom/apps/testapp'), manifestWithRegistration({
      route_prefix: '/testapp',
      registration: { enabled: false },
      required_roles: [],
    }))
    const program = await makeProgram()
    await program.parseAsync(['node', 'cli', 'update-db-app', 'testapp'])
    const updatePayload = queriesTo('apps', 'update')[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updatePayload.config.registration.enabled).toBe(false)
    expect(updatePayload.config.registration.default_role).toBe('member')
    expect(updatePayload.config.registration.path).toBe('/testapp')
    const fileCfg = readSpineConfig()
    expect(fileCfg.registration.apps.testapp).toEqual(updatePayload.config.registration)
  })
})

describe('install-app CLI', () => {
  function makePkg(manifest: Record<string, any>, files: Record<string, string> = {}) {
    const pkgDir = join(workdir, 'node_modules/spine-framework-testapp')
    mkdirSync(join(pkgDir, 'seed'), { recursive: true })
    writeJson(join(pkgDir, 'manifest.json'), manifest)
    writeJson(join(pkgDir, 'package.json'), { name: 'spine-framework-testapp', version: manifest.version })
    for (const [rel, content] of Object.entries(files)) {
      const p = join(pkgDir, rel)
      mkdirSync(join(p, '..'), { recursive: true })
      writeFileSync(p, content)
    }
    return pkgDir
  }

  const regManifest = () => baseManifest({
    seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }],
    registration: { enabled: true, default_role: 'member', redirect_path: '/testapp' },
  })

  it('seeds by default after successful migrations', async () => {
    setMigrateEnv()
    makePkg(regManifest(), { 'seed/roles.json': JSON.stringify([{ slug: 'member', name: 'Member' }]) })
    const program = await makeProgram()
    await program.parseAsync(['node', 'cli', 'install-app', 'spine-framework-testapp'])
    expect(execState.calls.some(c => c.startsWith('npm install'))).toBe(true)
    expect(supaState.createClientCalls.length).toBe(1)
    expect(queriesTo('roles', 'upsert').length).toBe(1)
    const fileCfg = readSpineConfig()
    expect(fileCfg.registration.apps.testapp.enabled).toBe(true)
  })

  it('--no-seed skips all DB seed work but still updates local registration config', async () => {
    setMigrateEnv()
    makePkg(regManifest(), { 'seed/roles.json': '[]' })
    const program = await makeProgram()
    await program.parseAsync(['node', 'cli', 'install-app', 'spine-framework-testapp', '--no-seed'])
    expect(supaState.createClientCalls.length).toBe(0)
    expect(queriesTo('roles').length).toBe(0)
    const fileCfg = readSpineConfig()
    expect(fileCfg.registration.apps.testapp.enabled).toBe(true)
  })

  it('aborts before seeding when a migration fails', async () => {
    setMigrateEnv()
    mkdirSync(join(workdir, 'custom/migrations'), { recursive: true })
    writeFileSync(join(workdir, 'custom/migrations/001_mig.sql'), 'BOOM;')
    pgState.handler = (sql: string) => {
      if (sql === 'BOOM;') throw new Error('migration exploded')
      return { rows: [] }
    }
    makePkg(regManifest(), { 'seed/roles.json': '[]' })
    const program = await makeProgram()
    await expect(program.parseAsync(['node', 'cli', 'install-app', 'spine-framework-testapp'])).rejects.toThrow('process.exit(1)')
    expect(supaState.createClientCalls.length).toBe(0)
    expect(queriesTo('roles').length).toBe(0)
    expect(existsSync(join(workdir, 'spine.config.json'))).toBe(false)
  })

  it('aborts with a clear error when DB credentials are absent and seeding is requested', async () => {
    setSeedEnv()
    delete process.env.SUPABASE_DB_PASSWORD
    makePkg(regManifest(), { 'seed/roles.json': '[]' })
    const program = await makeProgram()
    await expect(program.parseAsync(['node', 'cli', 'install-app', 'spine-framework-testapp'])).rejects.toThrow('process.exit(1)')
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('installs files only with --no-seed when DB credentials are absent', async () => {
    setSeedEnv()
    delete process.env.SUPABASE_DB_PASSWORD
    makePkg(regManifest(), { 'seed/roles.json': '[]' })
    const program = await makeProgram()
    await program.parseAsync(['node', 'cli', 'install-app', 'spine-framework-testapp', '--no-seed'])
    expect(pgState.instances.length).toBe(0)
    expect(supaState.createClientCalls.length).toBe(0)
    expect(existsSync(join(workdir, 'custom/apps/testapp/manifest.json'))).toBe(true)
    expect(readSpineConfig().registration.apps.testapp.enabled).toBe(true)
  })
})

describe('seedApp deterministic ordering', () => {
  it('seeds in dependency order regardless of manifest declaration order', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'actions' && q.calls[0]?.op === 'select') return { data: [{ slug: 'update_item' }], error: null }
      if (q.table === 'pipelines' && q.calls[0]?.op === 'select') return { data: { id: 'pipe-1' }, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [
        { file: 'seed/triggers.json', table: 'triggers', conflict: 'app_id,slug' },
        { file: 'seed/pipelines.json', table: 'pipelines', conflict: 'app_id,slug' },
        { file: 'seed/roles.json', table: 'roles', conflict: 'slug' },
      ],
    }), {
      'seed/triggers.json': JSON.stringify([{ slug: 'trg', pipeline_slug: 'pipe' }]),
      'seed/pipelines.json': JSON.stringify([{ slug: 'pipe', stages: [{ stage_type: 'update_item', config: {} }] }]),
      'seed/roles.json': JSON.stringify([{ slug: 'member', name: 'Member' }]),
    })
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    const upsertOrder = supaState.history
      .filter(q => q.calls.some(c => c.op === 'upsert'))
      .map(q => q.table)
    expect(upsertOrder).toEqual(['apps', 'roles', 'pipelines', 'triggers'])
  })

  it('runs permissions_patch entries after types even when declared first', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'types' && q.calls[0]?.op === 'select') {
        const slugEq = q.calls.find(c => c.op === 'eq' && c.args[0] === 'slug')
        if (slugEq?.args[1] === 'task-patch') {
          return { data: { id: 't-9', design_schema: { record_permissions: { admin: ['read'] } } }, error: null }
        }
        return { data: null, error: null }
      }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({
      seed: [
        { file: 'seed/type_permissions.json', table: 'types', conflict: 'kind,slug', inject_app_id: false, permissions_patch: true },
        { file: 'seed/types.json', table: 'types', conflict: 'kind,slug', inject_app_id: false },
      ],
    }), {
      'seed/type_permissions.json': JSON.stringify([{ kind: 'item', slug: 'task-patch', record_permissions: { admin: ['read', 'update'] } }]),
      'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'task-seed', design_schema: { fields: { title: { data_type: 'text', required: true } } } }]),
    })
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    const typeUpsertIdx = supaState.history.findIndex(q => q.table === 'types' && q.calls.some(c => c.op === 'upsert'))
    const patchUpdateIdx = supaState.history.findIndex(q => q.table === 'types' && q.calls.some(c => c.op === 'update'))
    expect(typeUpsertIdx).toBeGreaterThanOrEqual(0)
    expect(patchUpdateIdx).toBeGreaterThan(typeUpsertIdx)
  })
})

describe('seedApp type conflict detection', () => {
  const typesEntry = { file: 'seed/types.json', table: 'types', conflict: 'kind,slug', inject_app_id: false }

  it('skips an identical existing type row without upserting, ignoring key order', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'types' && q.calls[0]?.op === 'select') {
        // Same schema, different key order — jsonb key order is not significant.
        return { data: { id: 't-1', design_schema: { record_permissions: { admin: ['read'] }, fields: { title: { required: true, data_type: 'text' } } } }, error: null }
      }
      return { data: null, error: null }
    })
    const design = { fields: { title: { data_type: 'text', required: true } }, record_permissions: { admin: ['read'] } }
    const appDir = makeApp(join(workdir, 'app'), baseManifest({ seed: [typesEntry] }), {
      'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'task', design_schema: design }]),
    })
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    expect(queriesTo('types', 'upsert').length).toBe(0)
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('item/task already seeded — identical'))
  })

  it('throws naming kind/slug and --reconcile-owned-types when the DB row differs', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'types' && q.calls[0]?.op === 'select') {
        return { data: { id: 't-1', design_schema: { fields: { title: { data_type: 'textarea' } } } }, error: null }
      }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({ seed: [typesEntry] }), {
      'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'task', design_schema: { fields: { title: { data_type: 'text' } } } }]),
    })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/item\/task/)
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/--reconcile-owned-types/)
    expect(queriesTo('types', 'upsert').length).toBe(0)
    expect(queriesTo('types', 'update').length).toBe(0)
  })

  it('still inserts absent types with the insert-only conflict contract', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      return { data: null, error: null }
    })
    const appDir = makeApp(join(workdir, 'app'), baseManifest({ seed: [typesEntry] }), {
      'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'task', design_schema: { fields: {} } }]),
    })
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    const upserts = queriesTo('types', 'upsert')
    expect(upserts.length).toBe(1)
    const [, opts] = upserts[0].calls.find(c => c.op === 'upsert')!.args
    expect(opts).toEqual({ onConflict: 'kind,slug', ignoreDuplicates: true })
  })
})

describe('seedApp --reconcile-owned-types', () => {
  const typesEntry = { file: 'seed/types.json', table: 'types', conflict: 'kind,slug', inject_app_id: false }

  function typesApp(records: any[], overrides: Record<string, any> = {}) {
    return makeApp(join(workdir, 'app'), baseManifest({
      seed: [typesEntry],
      ...overrides,
    }), { 'seed/types.json': JSON.stringify(records) })
  }

  function typeSelectResponder(bySlug: Record<string, any>) {
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'types' && q.calls[0]?.op === 'select') {
        const slugEq = q.calls.find(c => c.op === 'eq' && c.args[0] === 'slug')
        const found = bySlug[slugEq?.args[1]]
        return { data: found ? { id: `t-${found}`, design_schema: found } : null, error: null }
      }
      return { data: null, error: null }
    })
  }

  it('fails before creating a client when the manifest does not declare owned_types', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = typesApp([{ kind: 'item', slug: 'task', design_schema: { fields: {} } }])
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'), { reconcileOwnedTypes: true })).rejects.toThrow(/owned_types/)
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('fails before creating a client when an owned slug is absent from the types seed', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const appDir = typesApp(
      [{ kind: 'item', slug: 'task', design_schema: { fields: {} } }],
      { owned_types: ['ghost'] },
    )
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'), { reconcileOwnedTypes: true })).rejects.toThrow(/ghost/)
    expect(supaState.createClientCalls.length).toBe(0)
  })

  it('still throws for a differing type the manifest does not own', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    const design = { fields: { title: { data_type: 'text', required: true } } }
    typeSelectResponder({ task: design, other: { fields: { title: { data_type: 'textarea' } } } })
    const appDir = typesApp(
      [
        { kind: 'item', slug: 'task', design_schema: design },
        { kind: 'item', slug: 'other', design_schema: { fields: { title: { data_type: 'text' } } } },
      ],
      { owned_types: ['task'] },
    )
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'), { reconcileOwnedTypes: true })).rejects.toThrow(/item\/other/)
    expect(queriesTo('types', 'update').length).toBe(0)
  })

  it('updates the owned type on Update, preserving DB-only fields and regenerating validation_schema', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    rlState.answer = 'u'
    const dbSchema = {
      fields: {
        title: { data_type: 'text', required: true },
        legacy: { data_type: 'number', required: false },
      },
      record_permissions: { admin: ['read'] },
    }
    const seedSchema = {
      fields: {
        title: { data_type: 'textarea', required: false },
        extra: { data_type: 'text', required: true },
      },
      record_permissions: { admin: ['read', 'update'] },
    }
    typeSelectResponder({ task: dbSchema })
    const appDir = typesApp(
      [{ kind: 'item', slug: 'task', design_schema: seedSchema }],
      { owned_types: ['task'] },
    )
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'), { reconcileOwnedTypes: true })
    expect(queriesTo('types', 'upsert').length).toBe(0)
    const updates = queriesTo('types', 'update')
    expect(updates.length).toBe(1)
    const updatePayload = updates[0].calls.find(c => c.op === 'update')!.args[0]
    expect(updatePayload.design_schema.fields.title).toEqual({ data_type: 'textarea', required: false })
    expect(updatePayload.design_schema.fields.legacy).toEqual({ data_type: 'number', required: false })
    expect(updatePayload.design_schema.fields.extra).toEqual({ data_type: 'text', required: true })
    expect(updatePayload.design_schema.record_permissions).toEqual({ admin: ['read', 'update'] })
    expect(updatePayload.validation_schema).toEqual({
      fields: {
        title: { data_type: 'textarea', required: false },
        legacy: { data_type: 'number', required: false },
        extra: { data_type: 'text', required: true },
      },
    })
  })

  it('keeps the DB row untouched on Keep', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    rlState.answer = 'k'
    typeSelectResponder({ task: { fields: { title: { data_type: 'textarea' } } } })
    const appDir = typesApp(
      [{ kind: 'item', slug: 'task', design_schema: { fields: { title: { data_type: 'text' } } } }],
      { owned_types: ['task'] },
    )
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'), { reconcileOwnedTypes: true })
    expect(queriesTo('types', 'update').length).toBe(0)
    expect(queriesTo('types', 'upsert').length).toBe(0)
  })

  it('propagates the flag through the seed-app command', async () => {
    setSeedEnv()
    makeApp(join(workdir, 'custom/apps/testapp'), baseManifest({
      seed: [{ file: 'seed/types.json', table: 'types', conflict: 'kind,slug', inject_app_id: false }],
    }), { 'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'task', design_schema: { fields: {} } }]) })
    const program = await makeProgram()
    await expect(program.parseAsync(['node', 'cli', 'seed-app', 'testapp', '--reconcile-owned-types'])).rejects.toThrow('process.exit(1)')
    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(supaState.createClientCalls.length).toBe(0)
  })
})

describe('seedApp pipeline stage validation', () => {
  function pipelineApp(pipeline: Record<string, any>) {
    return makeApp(join(workdir, 'app'), baseManifest({
      seed: [{ file: 'seed/pipelines.json', table: 'pipelines', conflict: 'app_id,slug' }],
    }), { 'seed/pipelines.json': JSON.stringify([pipeline]) })
  }

  it('throws naming the pipeline slug, stage index, and bad stage_type', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'actions' && q.calls[0]?.op === 'select') return { data: [{ slug: 'update_item' }], error: null }
      return { data: null, error: null }
    })
    const appDir = pipelineApp({
      slug: 'pipe',
      stages: [
        { stage_type: 'update_item', config: {} },
        { stage_type: 'bogus_stage', config: {} },
      ],
    })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/"pipe"[\s\S]*stage 1[\s\S]*bogus_stage/)
    expect(queriesTo('pipelines', 'upsert').length).toBe(0)
    expect(queriesTo('actions').length).toBe(1)
  })

  it('throws when the actions table cannot be read (migrations not run)', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'actions' && q.calls[0]?.op === 'select') return { data: null, error: { message: 'relation public.actions does not exist' } }
      return { data: null, error: null }
    })
    const appDir = pipelineApp({ slug: 'pipe', stages: [{ stage_type: 'update_item', config: {} }] })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/public\.actions/)
    expect(queriesTo('pipelines', 'upsert').length).toBe(0)
  })

  it('rejects a send_notification stage whose recipients is not an array', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'actions' && q.calls[0]?.op === 'select') return { data: [{ slug: 'send_notification' }], error: null }
      return { data: null, error: null }
    })
    const appDir = pipelineApp({
      slug: 'notify-pipe',
      stages: [{ stage_type: 'send_notification', config: { message: 'hi', recipients: 'role:member' } }],
    })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/recipients must be an array/)
  })

  it('rejects a recipient that is not role:<slug>, self, or a UUID', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'actions' && q.calls[0]?.op === 'select') return { data: [{ slug: 'send_notification' }], error: null }
      return { data: null, error: null }
    })
    const appDir = pipelineApp({
      slug: 'notify-pipe',
      stages: [{ stage_type: 'send_notification', config: { message: 'hi', recipients: ['bogus-value'] } }],
    })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/bogus-value/)
    expect(queriesTo('pipelines', 'upsert').length).toBe(0)
  })

  it('rejects a role: recipient whose role does not exist', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'actions' && q.calls[0]?.op === 'select') return { data: [{ slug: 'send_notification' }], error: null }
      if (q.table === 'roles' && q.calls[0]?.op === 'select') return { data: [{ slug: 'member' }], error: null }
      return { data: null, error: null }
    })
    const appDir = pipelineApp({
      slug: 'notify-pipe',
      stages: [{ stage_type: 'send_notification', config: { message: 'hi', recipients: ['role:ghost'] } }],
    })
    await expect(seedApp(appDir, 'testapp', join(workdir, 'c.json'))).rejects.toThrow(/role:ghost/)
    expect(queriesTo('pipelines', 'upsert').length).toBe(0)
  })

  it('accepts role:, self, and UUID recipients and seeds the pipeline', async () => {
    const { seedApp } = await freshModule()
    setSeedEnv()
    dbResponder(q => {
      if (q.table === 'apps' && q.calls[0]?.op === 'upsert') return { data: { id: 'app-1' }, error: null }
      if (q.table === 'actions' && q.calls[0]?.op === 'select') return { data: [{ slug: 'send_notification' }], error: null }
      if (q.table === 'roles' && q.calls[0]?.op === 'select') return { data: [{ slug: 'member' }], error: null }
      return { data: null, error: null }
    })
    const appDir = pipelineApp({
      slug: 'notify-pipe',
      stages: [{
        stage_type: 'send_notification',
        config: { message: 'hi', recipients: ['role:member', 'self', '12345678-1234-4234-9234-123456789012'] },
      }],
    })
    await seedApp(appDir, 'testapp', join(workdir, 'c.json'))
    expect(queriesTo('pipelines', 'upsert').length).toBe(1)
    expect(queriesTo('roles').length).toBe(1)
  })
})
