import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const pgState = vi.hoisted(() => ({
  instances: [] as any[],
  handler: null as null | ((sql: string, params?: any[]) => any),
  connectError: null as null | Error,
}))

vi.mock('pg', () => ({
  default: {
    Client: class {
      config: any
      calls: { sql: string; params?: any[] }[] = []
      ended = false
      constructor(config: any) {
        this.config = config
        pgState.instances.push(this)
      }
      async connect() {
        if (pgState.connectError) throw pgState.connectError
      }
      async end() {
        this.ended = true
      }
      async query(sql: string, params?: any[]) {
        this.calls.push({ sql, params })
        if (pgState.handler) return pgState.handler(sql, params)
        return { rows: [] }
      }
    },
  },
}))

const ORIG_CWD = process.cwd()
const ENV_KEYS = ['SUPABASE_URL', 'SUPABASE_DB_PASSWORD'] as const
let savedEnv: Record<string, string | undefined> = {}
let workdir = ''

function mig(name: string, sql: string) {
  const dir = join(workdir, '.framework/migrations')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, name), sql)
}

function customMig(name: string, sql: string) {
  const dir = join(workdir, 'custom/migrations')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, name), sql)
}

async function freshModule() {
  vi.resetModules()
  return await import('../../cli/commands/migrate.ts')
}

function setEnv() {
  process.env.SUPABASE_URL = 'https://abc123.supabase.co'
  process.env.SUPABASE_DB_PASSWORD = 'p@ss:w/eird?chars'
}

beforeEach(() => {
  savedEnv = {}
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k]
  workdir = mkdtempSync(join(tmpdir(), 'spine-migrate-test-'))
  process.chdir(workdir)
  pgState.instances = []
  pgState.handler = null
  pgState.connectError = null
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

describe('collectMigrations', () => {
  it('returns framework then custom migrations sorted lexically', async () => {
    const { collectMigrations } = await freshModule()
    mig('002_b.sql', 'SELECT 2;')
    mig('001_a.sql', 'SELECT 1;')
    customMig('003_c.sql', 'SELECT 3;')
    const files = collectMigrations(false)
    expect(files.map(f => f.name)).toEqual(['001_a.sql', '002_b.sql', '003_c.sql'])
  })

  it('excludes custom migrations when frameworkOnly is true', async () => {
    const { collectMigrations } = await freshModule()
    mig('001_a.sql', 'SELECT 1;')
    customMig('002_b.sql', 'SELECT 2;')
    const files = collectMigrations(true)
    expect(files.map(f => f.name)).toEqual(['001_a.sql'])
  })

  it('ignores non-sql and dotfiles', async () => {
    const { collectMigrations } = await freshModule()
    mig('001_a.sql', 'SELECT 1;')
    mig('notes.txt', 'x')
    mig('.hidden.sql', 'SELECT 0;')
    const files = collectMigrations(false)
    expect(files.map(f => f.name)).toEqual(['001_a.sql'])
  })
})

describe('splitSqlStatements', () => {
  it('keeps semicolons inside single-quoted literals in one statement', async () => {
    const { splitSqlStatements } = await freshModule()
    const stmts = splitSqlStatements("INSERT INTO t VALUES ('a;b'); SELECT 1;")
    expect(stmts).toEqual(["INSERT INTO t VALUES ('a;b');", 'SELECT 1;'])
  })

  it('drops line and block comments including their semicolons', async () => {
    const { splitSqlStatements } = await freshModule()
    const stmts = splitSqlStatements('-- comment ; here\nSELECT 1; /* block ; */ SELECT 2;')
    expect(stmts).toEqual(['SELECT 1;', 'SELECT 2;'])
  })

  it('preserves dollar-quoted function bodies verbatim', async () => {
    const { splitSqlStatements } = await freshModule()
    const sql = 'CREATE FUNCTION f() RETURNS void AS $$ BEGIN RAISE NOTICE \'x;y\'; END; $$ LANGUAGE plpgsql; SELECT 3;'
    const stmts = splitSqlStatements(sql)
    expect(stmts.length).toBe(2)
    expect(stmts[0]).toContain('$$ BEGIN')
    expect(stmts[0]).toContain("'x;y'")
    expect(stmts[1]).toBe('SELECT 3;')
  })

  it('appends a semicolon to a trailing statement without one', async () => {
    const { splitSqlStatements } = await freshModule()
    expect(splitSqlStatements('SELECT 1')).toEqual(['SELECT 1;'])
  })
})

describe('runMigrations', () => {
  it('returns null when credentials are missing', async () => {
    const { runMigrations } = await freshModule()
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_DB_PASSWORD
    mig('001_a.sql', 'SELECT 1;')
    expect(await runMigrations()).toBeNull()
    expect(pgState.instances.length).toBe(0)
  })

  it('throws a credential-free error for an invalid SUPABASE_URL', async () => {
    const { runMigrations } = await freshModule()
    process.env.SUPABASE_URL = 'not-a-url'
    process.env.SUPABASE_DB_PASSWORD = 'supersecretvalue'
    mig('001_a.sql', 'SELECT 1;')
    await expect(runMigrations()).rejects.toThrow(/SUPABASE_URL/)
    try {
      await runMigrations()
    } catch (err: any) {
      expect(err.message).not.toContain('supersecretvalue')
    }
    expect(pgState.instances.length).toBe(0)
  })

  it.each([
    'http://abc123.supabase.co',
    'postgres://abc123.supabase.co',
    'https://abc123.supabase.co:5432',
    'https://abc123.supabase.co/rest',
    'https://abc123.supabase.co/?q=1',
    'https://abc123.supabase.co/#frag',
    'https://abc123.evil.co',
    'https://abc123.supabase.co.evil.com',
    'https://.supabase.co',
  ])('rejects non-hosted SUPABASE_URL %s before creating a client', async (url) => {
    const { runMigrations } = await freshModule()
    process.env.SUPABASE_URL = url
    process.env.SUPABASE_DB_PASSWORD = 'dbpass'
    mig('001_a.sql', 'SELECT 1;')
    await expect(runMigrations()).rejects.toThrow(/SUPABASE_URL/)
    expect(pgState.instances.length).toBe(0)
  })

  it('rejects credential-bearing SUPABASE_URL values without leaking the secret', async () => {
    const { runMigrations } = await freshModule()
    process.env.SUPABASE_URL = 'https://user:s3cr3t-in-url@abc123.supabase.co'
    process.env.SUPABASE_DB_PASSWORD = 'dbpass'
    mig('001_a.sql', 'SELECT 1;')
    let message = ''
    try {
      await runMigrations()
    } catch (err: any) {
      message = err.message
    }
    expect(message).toMatch(/SUPABASE_URL/)
    expect(message).not.toContain('s3cr3t-in-url')
    expect(pgState.instances.length).toBe(0)
  })

  it('accepts a trailing-slash hosted SUPABASE_URL', async () => {
    const { runMigrations } = await freshModule()
    process.env.SUPABASE_URL = 'https://abc123.supabase.co/'
    process.env.SUPABASE_DB_PASSWORD = 'dbpass'
    mig('001_a.sql', 'SELECT 1;')
    await runMigrations()
    expect(pgState.instances[0].config.host).toBe('db.abc123.supabase.co')
  })

  it('returns zero counts without connecting when no migration files exist', async () => {
    mkdirSync(join(workdir, '.framework/migrations'), { recursive: true })
    const { runMigrations } = await freshModule()
    setEnv()
    expect(await runMigrations()).toEqual({ applied: 0, skipped: 0, failed: 0 })
    expect(pgState.instances.length).toBe(0)
  })

  it('passes the password inside the client config object, never a URI', async () => {
    const { runMigrations } = await freshModule()
    setEnv()
    mig('001_a.sql', 'SELECT 1;')
    await runMigrations()
    const cfg = pgState.instances[0].config
    expect(cfg).toMatchObject({
      user: 'postgres',
      password: 'p@ss:w/eird?chars',
      host: 'db.abc123.supabase.co',
      port: 5432,
      database: 'postgres',
    })
    expect(cfg).not.toHaveProperty('connectionString')
  })

  it('applies each file in a transaction and records the tracking row before COMMIT', async () => {
    const { runMigrations } = await freshModule()
    setEnv()
    mig('001_a.sql', 'SELECT 1; SELECT 2;')
    const result = await runMigrations()
    expect(result).toEqual({ applied: 1, skipped: 0, failed: 0 })
    const client = pgState.instances[0]
    const sqls = client.calls.map((c: any) => c.sql)
    expect(sqls[0]).toContain('CREATE TABLE IF NOT EXISTS _spine_migrations')
    expect(sqls[1]).toBe('SELECT filename FROM _spine_migrations')
    const beginIdx = sqls.indexOf('BEGIN')
    const insertIdx = sqls.findIndex(s => s.includes('INSERT INTO _spine_migrations'))
    const commitIdx = sqls.indexOf('COMMIT')
    expect(beginIdx).toBeGreaterThan(-1)
    expect(insertIdx).toBeGreaterThan(beginIdx)
    expect(commitIdx).toBeGreaterThan(insertIdx)
    const insertCall = client.calls[insertIdx]
    expect(insertCall.params).toEqual(['001_a.sql'])
    expect(client.ended).toBe(true)
  })

  it('skips already-tracked files without executing their SQL', async () => {
    const { runMigrations } = await freshModule()
    setEnv()
    mig('001_a.sql', 'SELECT 1;')
    mig('002_b.sql', 'SELECT 2;')
    pgState.handler = (sql: string) => {
      if (sql === 'SELECT filename FROM _spine_migrations') {
        return { rows: [{ filename: '001_a.sql' }] }
      }
      return { rows: [] }
    }
    const result = await runMigrations()
    expect(result).toEqual({ applied: 1, skipped: 1, failed: 0 })
    const client = pgState.instances[0]
    expect(client.calls.filter((c: any) => c.sql === 'BEGIN').length).toBe(1)
    expect(client.calls.some((c: any) => c.sql === 'SELECT 1;')).toBe(false)
  })

  it('stops at the first file error: rollback, one failed count, no later files or tracking insert', async () => {
    const { runMigrations } = await freshModule()
    setEnv()
    mig('001_a.sql', 'SELECT 1;')
    mig('002_b.sql', 'SELECT 2; BOOM;')
    mig('003_c.sql', 'SELECT 3;')
    pgState.handler = (sql: string) => {
      if (sql === 'BOOM;') throw new Error('statement exploded')
      return { rows: [] }
    }
    const result = await runMigrations()
    expect(result).toEqual({ applied: 1, skipped: 0, failed: 1 })
    const client = pgState.instances[0]
    const sqls = client.calls.map((c: any) => c.sql)
    expect(sqls.filter(s => s === 'BEGIN').length).toBe(2)
    expect(sqls.filter(s => s === 'ROLLBACK').length).toBe(1)
    expect(sqls.filter(s => s === 'SELECT 3;').length).toBe(0)
    const inserts = client.calls.filter((c: any) => c.sql.includes('INSERT INTO _spine_migrations'))
    expect(inserts.length).toBe(1)
    expect(inserts[0].params).toEqual(['001_a.sql'])
    expect(client.ended).toBe(true)
  })

  it('propagates tracking-table CREATE failure and runs no migrations', async () => {
    const { runMigrations } = await freshModule()
    setEnv()
    mig('001_a.sql', 'SELECT 1;')
    pgState.handler = (sql: string) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS _spine_migrations')) {
        throw new Error('cannot create tracking table')
      }
      return { rows: [] }
    }
    await expect(runMigrations()).rejects.toThrow('cannot create tracking table')
    const client = pgState.instances[0]
    expect(client.calls.some((c: any) => c.sql === 'BEGIN')).toBe(false)
    expect(client.ended).toBe(true)
  })

  it('propagates tracking SELECT failure and runs no migrations', async () => {
    const { runMigrations } = await freshModule()
    setEnv()
    mig('001_a.sql', 'SELECT 1;')
    pgState.handler = (sql: string) => {
      if (sql === 'SELECT filename FROM _spine_migrations') {
        throw new Error('cannot read tracking state')
      }
      return { rows: [] }
    }
    await expect(runMigrations()).rejects.toThrow('cannot read tracking state')
    const client = pgState.instances[0]
    expect(client.calls.some((c: any) => c.sql === 'BEGIN')).toBe(false)
    expect(client.ended).toBe(true)
  })

  it('propagates read errors and still closes the client', async () => {
    const { runMigrations } = await freshModule()
    setEnv()
    const dir = join(workdir, '.framework/migrations')
    mkdirSync(dir, { recursive: true })
    mkdirSync(join(dir, 'broken.sql'))
    await expect(runMigrations()).rejects.toThrow()
    expect(pgState.instances[0].ended).toBe(true)
  })

  it('ends the client when connect itself succeeds but a later error occurs', async () => {
    const { runMigrations } = await freshModule()
    setEnv()
    mig('001_a.sql', 'SELECT 1;')
    pgState.handler = () => { throw new Error('mid-flight failure') }
    await expect(runMigrations()).rejects.toThrow('mid-flight failure')
    expect(pgState.instances[0].ended).toBe(true)
  })
})
