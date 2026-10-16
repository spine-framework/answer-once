// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/unit/migrate.test.ts"]
// CIL[DOC-MACRO purpose="Import Vitest and filesystem fixture utilities for isolated CLI tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Import Vitest and filesystem fixture utilities for isolated CLI tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import Vitest and filesystem fixture utilities for isolated CLI tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:pgstate:constant" type="constant" identity="pgState" parent="none"]
// CIL[DOC-MACRO purpose="Initialize hoisted state for isolated Postgres client mocks."]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize hoisted state for isolated Postgres client mocks."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mock client instances, handler, and connect error state" errors="none" side_effects="Initializes mock state"]
// CIL[DOC-MICRO logic_summary="Initialize hoisted state for isolated Postgres client mocks." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const pgState = vi.hoisted(() => ({
  instances: [] as any[],
  handler: null as null | ((sql: string, params?: any[]) => any),
  connectError: null as null | Error,
}))
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:pgstate:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:pg_mock:block" type="block" identity="pg_mock" parent="none"]
// CIL[DOC-MACRO purpose="Register a fake Postgres client that records SQL and never connects to a database."]
// CIL[DOC-RESPONSIBILITY responsibility="Register a fake Postgres client that records SQL and never connects to a database."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="pgState" outputs="Vitest module mock" errors="none" side_effects="Registers a mock"]
// CIL[DOC-MICRO logic_summary="Register a fake Postgres client that records SQL and never connects to a database." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:pg_mock:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:orig_cwd:constant" type="constant" identity="ORIG_CWD" parent="none"]
// CIL[DOC-MACRO purpose="Capture the original working directory for fixture restoration."]
// CIL[DOC-RESPONSIBILITY responsibility="Capture the original working directory for fixture restoration."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Original cwd string" errors="none" side_effects="Reads process cwd"]
// CIL[DOC-MICRO logic_summary="Capture the original working directory for fixture restoration." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const ORIG_CWD = process.cwd()
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:orig_cwd:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:env_keys:constant" type="constant" identity="ENV_KEYS" parent="none"]
// CIL[DOC-MACRO purpose="List environment variables saved and restored by migration tests."]
// CIL[DOC-RESPONSIBILITY responsibility="List environment variables saved and restored by migration tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Readonly environment-key list" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="List environment variables saved and restored by migration tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const ENV_KEYS = ['SUPABASE_URL', 'SUPABASE_DB_PASSWORD'] as const
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:env_keys:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:savedenv:variable" type="variable" identity="savedEnv" parent="none"]
// CIL[DOC-MACRO purpose="Hold saved environment values for fixture cleanup."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold saved environment values for fixture cleanup."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mutable saved environment map" errors="none" side_effects="Initializes local state"]
// CIL[DOC-MICRO logic_summary="Hold saved environment values for fixture cleanup." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
let savedEnv: Record<string, string | undefined> = {}
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:savedenv:variable"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:workdir:variable" type="variable" identity="workdir" parent="none"]
// CIL[DOC-MACRO purpose="Hold the temporary project root for migration fixtures."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the temporary project root for migration fixtures."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mutable fixture path" errors="none" side_effects="Initializes local state"]
// CIL[DOC-MICRO logic_summary="Hold the temporary project root for migration fixtures." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
let workdir = ''
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:workdir:variable"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:mig:function" type="function" identity="mig" parent="none"]
// CIL[DOC-MACRO purpose="Write a framework SQL fixture inside the temporary project."]
// CIL[DOC-RESPONSIBILITY responsibility="Write a framework SQL fixture inside the temporary project."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="name: string, sql: string" outputs="void" errors="none" side_effects="Creates fixture directories and writes a fixture"]
// CIL[DOC-MICRO logic_summary="Write a framework SQL fixture inside the temporary project." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function mig(name: string, sql: string) {
  const dir = join(workdir, '.framework/migrations')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, name), sql)
}
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:mig:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:custommig:function" type="function" identity="customMig" parent="none"]
// CIL[DOC-MACRO purpose="Write a custom SQL fixture inside the temporary project."]
// CIL[DOC-RESPONSIBILITY responsibility="Write a custom SQL fixture inside the temporary project."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="name: string, sql: string" outputs="void" errors="none" side_effects="Creates fixture directories and writes a fixture"]
// CIL[DOC-MICRO logic_summary="Write a custom SQL fixture inside the temporary project." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function customMig(name: string, sql: string) {
  const dir = join(workdir, 'custom/migrations')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, name), sql)
}
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:custommig:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:freshmodule:function" type="function" identity="freshModule" parent="none"]
// CIL[DOC-MACRO purpose="Reset the module cache and import migration code against the current fixture cwd."]
// CIL[DOC-RESPONSIBILITY responsibility="Reset the module cache and import migration code against the current fixture cwd."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Promise of the migration module" errors="none" side_effects="Resets Vitest module cache and imports source"]
// CIL[DOC-MICRO logic_summary="Reset the module cache and import migration code against the current fixture cwd." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
async function freshModule() {
  vi.resetModules()
  return await import('../../cli/commands/migrate.ts')
}
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:freshmodule:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:setenv:function" type="function" identity="setEnv" parent="none"]
// CIL[DOC-MACRO purpose="Set fake hosted Supabase credentials for isolated migration execution tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Set fake hosted Supabase credentials for isolated migration execution tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="none" side_effects="Sets fixture environment variables"]
// CIL[DOC-MICRO logic_summary="Set fake hosted Supabase credentials for isolated migration execution tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function setEnv() {
  process.env.SUPABASE_URL = 'https://abc123.supabase.co'
  process.env.SUPABASE_DB_PASSWORD = 'p@ss:w/eird?chars'
}
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:setenv:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:fixture_setup:block" type="block" identity="fixture_setup" parent="none"]
// CIL[DOC-MACRO purpose="Register temporary-project setup with fake clients and muted console output."]
// CIL[DOC-RESPONSIBILITY responsibility="Register temporary-project setup with fake clients and muted console output."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="Vitest lifecycle and mock state" outputs="Fixture hook" errors="none" side_effects="Registers a hook that creates a temp directory, changes cwd, and installs spies"]
// CIL[DOC-MICRO logic_summary="Register temporary-project setup with fake clients and muted console output." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:fixture_setup:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:fixture_cleanup:block" type="block" identity="fixture_cleanup" parent="none"]
// CIL[DOC-MACRO purpose="Register cleanup that restores cwd, environment, and spies and removes the created fixture."]
// CIL[DOC-RESPONSIBILITY responsibility="Register cleanup that restores cwd, environment, and spies and removes the created fixture."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="Fixture state" outputs="Cleanup hook" errors="none" side_effects="Registers fixture cleanup"]
// CIL[DOC-MICRO logic_summary="Register cleanup that restores cwd, environment, and spies and removes the created fixture." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
afterEach(() => {
  process.chdir(ORIG_CWD)
  rmSync(workdir, { recursive: true, force: true })
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
  }
  vi.restoreAllMocks()
})
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:fixture_cleanup:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:collection_suite:block" type="block" identity="collection_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register framework-before-custom ordering, framework-only, and file-filter tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register framework-before-custom ordering, framework-only, and file-filter tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers and imported migration module" outputs="Vitest assertions" errors="none" side_effects="Registers isolated fixture tests"]
// CIL[DOC-MICRO logic_summary="Register framework-before-custom ordering, framework-only, and file-filter tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:collection_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:sql_parser_suite:block" type="block" identity="sql_parser_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register quoted-literal, comment, dollar-quote, and trailing-statement SQL parser tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register quoted-literal, comment, dollar-quote, and trailing-statement SQL parser tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="Imported splitSqlStatements" outputs="Vitest assertions" errors="none" side_effects="Registers parser tests"]
// CIL[DOC-MICRO logic_summary="Register quoted-literal, comment, dollar-quote, and trailing-statement SQL parser tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:sql_parser_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/migrate.test.ts:execution_suite:block" type="block" identity="execution_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register mocked migration execution tests for credentials, URL validation, tracking, transactions, abort, and cleanup."]
// CIL[DOC-RESPONSIBILITY responsibility="Register mocked migration execution tests for credentials, URL validation, tracking, transactions, abort, and cleanup."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="Mock client and fixture helpers" outputs="Vitest assertions" errors="none" side_effects="Registers fake-database execution tests"]
// CIL[DOC-MICRO logic_summary="Register mocked migration execution tests for credentials, URL validation, tracking, transactions, abort, and cleanup." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/migrate.test.ts:execution_suite:block"]
