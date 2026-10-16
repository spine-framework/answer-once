// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/unit/install-app.test.ts"]
// CIL[DOC-MACRO purpose="Import Vitest and filesystem fixture utilities for isolated CLI tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Import Vitest and filesystem fixture utilities for isolated CLI tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import Vitest and filesystem fixture utilities for isolated CLI tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Command } from 'commander'
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:dbcall:type" type="type" identity="DbCall" parent="none"]
// CIL[DOC-MACRO purpose="Describe an operation recorded by a fake query builder."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe an operation recorded by a fake query builder."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DbCall type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describe an operation recorded by a fake query builder." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
type DbCall = { op: string; args: any[] }
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:dbcall:type"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:dbquery:type" type="type" identity="DbQuery" parent="none"]
// CIL[DOC-MACRO purpose="Describe a table and its recorded fake query operations."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe a table and its recorded fake query operations."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DbQuery type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describe a table and its recorded fake query operations." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
type DbQuery = { table: string; calls: DbCall[] }
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:dbquery:type"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:dbresult:type" type="type" identity="DbResult" parent="none"]
// CIL[DOC-MACRO purpose="Describe data and error returned by a fake database responder."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe data and error returned by a fake database responder."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DbResult type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describe data and error returned by a fake database responder." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
type DbResult = { data?: any; error?: any }
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:dbresult:type"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:supastate:constant" type="constant" identity="supaState" parent="none"]
// CIL[DOC-MACRO purpose="Initialize hoisted state for fake Supabase clients and query history."]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize hoisted state for fake Supabase clients and query history."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mock state" errors="none" side_effects="Initializes local mock state"]
// CIL[DOC-MICRO logic_summary="Initialize hoisted state for fake Supabase clients and query history." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const supaState = vi.hoisted(() => ({
  createClientCalls: [] as any[],
  responder: null as null | ((q: DbQuery) => DbResult),
  history: [] as DbQuery[],
}))
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:supastate:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:supabase_mock:block" type="block" identity="supabase_mock" parent="none"]
// CIL[DOC-MACRO purpose="Register a chainable fake Supabase client that records operations without network access."]
// CIL[DOC-RESPONSIBILITY responsibility="Register a chainable fake Supabase client that records operations without network access."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="supaState" outputs="Vitest module mock" errors="none" side_effects="Registers a mock"]
// CIL[DOC-MICRO logic_summary="Register a chainable fake Supabase client that records operations without network access." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:supabase_mock:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:pgstate:constant" type="constant" identity="pgState" parent="none"]
// CIL[DOC-MACRO purpose="Initialize hoisted state for fake migration clients."]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize hoisted state for fake migration clients."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mock state" errors="none" side_effects="Initializes local mock state"]
// CIL[DOC-MICRO logic_summary="Initialize hoisted state for fake migration clients." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const pgState = vi.hoisted(() => ({
  instances: [] as any[],
  handler: null as null | ((sql: string, params?: any[]) => any),
}))
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:pgstate:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:pg_mock:block" type="block" identity="pg_mock" parent="none"]
// CIL[DOC-MACRO purpose="Register a fake Postgres client used by mocked installer migrations."]
// CIL[DOC-RESPONSIBILITY responsibility="Register a fake Postgres client used by mocked installer migrations."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="pgState" outputs="Vitest module mock" errors="none" side_effects="Registers a mock"]
// CIL[DOC-MICRO logic_summary="Register a fake Postgres client used by mocked installer migrations." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:pg_mock:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:execstate:constant" type="constant" identity="execState" parent="none"]
// CIL[DOC-MACRO purpose="Hold recorded shell commands for the fake npm executor."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold recorded shell commands for the fake npm executor."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mock command list" errors="none" side_effects="Initializes local mock state"]
// CIL[DOC-MICRO logic_summary="Hold recorded shell commands for the fake npm executor." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const execState = vi.hoisted(() => ({ calls: [] as string[] }))
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:execstate:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:exec_mock:block" type="block" identity="exec_mock" parent="none"]
// CIL[DOC-MACRO purpose="Register a fake command executor so installer tests never run npm."]
// CIL[DOC-RESPONSIBILITY responsibility="Register a fake command executor so installer tests never run npm."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="execState" outputs="Vitest module mock" errors="none" side_effects="Registers a mock"]
// CIL[DOC-MICRO logic_summary="Register a fake command executor so installer tests never run npm." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
vi.mock('child_process', () => ({
  execSync: (cmd: string) => { execState.calls.push(cmd); return Buffer.from('') },
}))
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:exec_mock:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:rlstate:constant" type="constant" identity="rlState" parent="none"]
// CIL[DOC-MACRO purpose="Hold the answer the fake readline prompt returns."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the answer the fake readline prompt returns."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mock prompt state" errors="none" side_effects="Initializes local mock state"]
// CIL[DOC-MICRO logic_summary="Hold the answer the fake readline prompt returns." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const rlState = vi.hoisted(() => ({ answer: 'r' }))
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:rlstate:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:readline_mock:block" type="block" identity="readline_mock" parent="none"]
// CIL[DOC-MACRO purpose="Register a fake prompt that returns the rlState answer."]
// CIL[DOC-RESPONSIBILITY responsibility="Register a fake prompt that returns the rlState answer."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Vitest module mock" errors="none" side_effects="Registers a mock"]
// CIL[DOC-MICRO logic_summary="Register a fake prompt that answers with rlState.answer — 'r' (Replace) by default; tests may set 'u' or 'k' for owned-type reconcile prompts." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:readline_mock:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:orig_cwd:constant" type="constant" identity="ORIG_CWD" parent="none"]
// CIL[DOC-MACRO purpose="Capture cwd for restoring fixture isolation."]
// CIL[DOC-RESPONSIBILITY responsibility="Capture cwd for restoring fixture isolation."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Original cwd" errors="none" side_effects="Reads process cwd"]
// CIL[DOC-MICRO logic_summary="Capture cwd for restoring fixture isolation." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const ORIG_CWD = process.cwd()
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:orig_cwd:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:env_keys:constant" type="constant" identity="ENV_KEYS" parent="none"]
// CIL[DOC-MACRO purpose="List environment values saved and restored by installer fixtures."]
// CIL[DOC-RESPONSIBILITY responsibility="List environment values saved and restored by installer fixtures."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Readonly key list" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="List environment values saved and restored by installer fixtures." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const ENV_KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_DB_PASSWORD'] as const
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:env_keys:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:savedenv:variable" type="variable" identity="savedEnv" parent="none"]
// CIL[DOC-MACRO purpose="Hold original environment values for restoration."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold original environment values for restoration."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mutable saved environment map" errors="none" side_effects="Initializes local state"]
// CIL[DOC-MICRO logic_summary="Hold original environment values for restoration." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
let savedEnv: Record<string, string | undefined> = {}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:savedenv:variable"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:workdir:variable" type="variable" identity="workdir" parent="none"]
// CIL[DOC-MACRO purpose="Hold the temporary installer project path."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the temporary installer project path."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mutable fixture path" errors="none" side_effects="Initializes local state"]
// CIL[DOC-MICRO logic_summary="Hold the temporary installer project path." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
let workdir = ''
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:workdir:variable"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:exitspy:variable" type="variable" identity="exitSpy" parent="none"]
// CIL[DOC-MACRO purpose="Hold the process-exit spy used by CLI failure tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the process-exit spy used by CLI failure tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Spy reference" errors="none" side_effects="Declares local state"]
// CIL[DOC-MICRO logic_summary="Hold the process-exit spy used by CLI failure tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
let exitSpy: any
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:exitspy:variable"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:writejson:function" type="function" identity="writeJson" parent="none"]
// CIL[DOC-MACRO purpose="Create parent fixture directories and write a JSON fixture."]
// CIL[DOC-RESPONSIBILITY responsibility="Create parent fixture directories and write a JSON fixture."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="path: string, value: any" outputs="void" errors="none" side_effects="Writes temporary fixture files"]
// CIL[DOC-MICRO logic_summary="Create parent fixture directories and write a JSON fixture." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function writeJson(path: string, value: any) {
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2))
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:writejson:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:basemanifest:function" type="function" identity="baseManifest" parent="none"]
// CIL[DOC-MACRO purpose="Build a minimal data-app manifest with supplied overrides."]
// CIL[DOC-RESPONSIBILITY responsibility="Build a minimal data-app manifest with supplied overrides."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="overrides: Record<string, any> default empty object" outputs="Manifest fixture" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a minimal data-app manifest with supplied overrides." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function baseManifest(overrides: Record<string, any> = {}) {
  return {
    name: 'Test App',
    slug: 'testapp',
    version: '1.0.0',
    app_type: 'data',
    ...overrides,
  }
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:basemanifest:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:manifestwithregistration:function" type="function" identity="manifestWithRegistration" parent="none"]
// CIL[DOC-MACRO purpose="Build an enabled new-account registration fixture with optional overrides."]
// CIL[DOC-RESPONSIBILITY responsibility="Build an enabled new-account registration fixture with optional overrides."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="overrides: Record<string, any> default empty object" outputs="Manifest fixture" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build an enabled new-account registration fixture with optional overrides." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:manifestwithregistration:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:makeapp:function" type="function" identity="makeApp" parent="none"]
// CIL[DOC-MACRO purpose="Write an isolated app, package, and optional seed fixtures."]
// CIL[DOC-RESPONSIBILITY responsibility="Write an isolated app, package, and optional seed fixtures."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="dir: string, manifest: Record<string, any>, files: Record<string, string> default empty object" outputs="App directory path" errors="none" side_effects="Creates temporary fixtures"]
// CIL[DOC-MICRO logic_summary="Write an isolated app, package, and optional seed fixtures." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:makeapp:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:freshmodule:function" type="function" identity="freshModule" parent="none"]
// CIL[DOC-MACRO purpose="Reset module cache and import installer code against fixture cwd."]
// CIL[DOC-RESPONSIBILITY responsibility="Reset module cache and import installer code against fixture cwd."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Promise of installer module" errors="none" side_effects="Resets module cache and imports source"]
// CIL[DOC-MICRO logic_summary="Reset module cache and import installer code against fixture cwd." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
async function freshModule() {
  vi.resetModules()
  return await import('../../cli/commands/install-app.ts')
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:freshmodule:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:setseedenv:function" type="function" identity="setSeedEnv" parent="none"]
// CIL[DOC-MACRO purpose="Set fake backend Supabase values for isolated seeding tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Set fake backend Supabase values for isolated seeding tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="none" side_effects="Sets fixture environment"]
// CIL[DOC-MICRO logic_summary="Set fake backend Supabase values for isolated seeding tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function setSeedEnv() {
  process.env.SUPABASE_URL = 'https://abc123.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:setseedenv:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:setmigrateenv:function" type="function" identity="setMigrateEnv" parent="none"]
// CIL[DOC-MACRO purpose="Set fake seed and Postgres values for installer tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Set fake seed and Postgres values for installer tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="none" side_effects="Sets fixture environment"]
// CIL[DOC-MICRO logic_summary="Set fake seed and Postgres values for installer tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function setMigrateEnv() {
  setSeedEnv()
  process.env.SUPABASE_DB_PASSWORD = 'dbpass'
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:setmigrateenv:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:dbresponder:function" type="function" identity="dbResponder" parent="none"]
// CIL[DOC-MACRO purpose="Install the fake query responder for a test."]
// CIL[DOC-RESPONSIBILITY responsibility="Install the fake query responder for a test."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="handler: (q: DbQuery) => DbResult" outputs="void" errors="none" side_effects="Mutates mock state"]
// CIL[DOC-MICRO logic_summary="Install the fake query responder for a test." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function dbResponder(handler: (q: DbQuery) => DbResult) {
  supaState.responder = handler
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:dbresponder:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:defaultresponder:function" type="function" identity="defaultResponder" parent="none"]
// CIL[DOC-MACRO purpose="Return standard fake app reads, app IDs, and success results."]
// CIL[DOC-RESPONSIBILITY responsibility="Return standard fake app reads, app IDs, and success results."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="q: DbQuery" outputs="DbResult" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return standard fake app reads, app IDs, and success results." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function defaultResponder(q: DbQuery): DbResult {
  const first = q.calls[0]?.op
  if (q.table === 'apps' && first === 'select') return { data: null, error: null }
  if (first === 'upsert' && q.table === 'apps') return { data: { id: 'app-1' }, error: null }
  return { data: null, error: null }
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:defaultresponder:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:queriesto:function" type="function" identity="queriesTo" parent="none"]
// CIL[DOC-MACRO purpose="Select recorded mock queries by table and optional operation."]
// CIL[DOC-RESPONSIBILITY responsibility="Select recorded mock queries by table and optional operation."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="table: string, op?: string" outputs="DbQuery array" errors="none" side_effects="Reads mock history"]
// CIL[DOC-MICRO logic_summary="Select recorded mock queries by table and optional operation." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function queriesTo(table: string, op?: string) {
  return supaState.history.filter(q => q.table === table && (!op || q.calls.some(c => c.op === op)))
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:queriesto:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:makeprogram:function" type="function" identity="makeProgram" parent="none"]
// CIL[DOC-MACRO purpose="Create an in-memory Commander program with installer commands."]
// CIL[DOC-RESPONSIBILITY responsibility="Create an in-memory Commander program with installer commands."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Promise of Command" errors="none" side_effects="Resets module cache and registers commands"]
// CIL[DOC-MICRO logic_summary="Create an in-memory Commander program with installer commands." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
async function makeProgram() {
  const mod = await freshModule()
  const program = new Command()
  program.exitOverride()
  mod.registerInstallAppCommands(program)
  return program
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:makeprogram:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:writespineconfig:function" type="function" identity="writeSpineConfig" parent="none"]
// CIL[DOC-MACRO purpose="Write a fixture configuration as JSON or raw malformed text."]
// CIL[DOC-RESPONSIBILITY responsibility="Write a fixture configuration as JSON or raw malformed text."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="content: any" outputs="void" errors="none" side_effects="Writes fixture config"]
// CIL[DOC-MICRO logic_summary="Write a fixture configuration as JSON or raw malformed text." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function writeSpineConfig(content: any) {
  writeFileSync(join(workdir, 'spine.config.json'), typeof content === 'string' ? content : JSON.stringify(content))
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:writespineconfig:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:readspineconfig:function" type="function" identity="readSpineConfig" parent="none"]
// CIL[DOC-MACRO purpose="Read and parse a fixture configuration."]
// CIL[DOC-RESPONSIBILITY responsibility="Read and parse a fixture configuration."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="path: string default fixture spine.config.json" outputs="Parsed config" errors="none" side_effects="Reads fixture config"]
// CIL[DOC-MICRO logic_summary="Read and parse a fixture configuration." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function readSpineConfig(path = join(workdir, 'spine.config.json')) {
  return JSON.parse(readFileSync(path, 'utf8'))
}
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:readspineconfig:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:fixture_setup:block" type="block" identity="fixture_setup" parent="none"]
// CIL[DOC-MACRO purpose="Register isolated cwd, environment, client, process-exit, and console setup."]
// CIL[DOC-RESPONSIBILITY responsibility="Register isolated cwd, environment, client, process-exit, and console setup."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Vitest lifecycle" outputs="Fixture hook" errors="none" side_effects="Registers setup that creates a temp root, changes cwd, and installs mocks"]
// CIL[DOC-MICRO logic_summary="Register isolated cwd, environment, client, process-exit, and console setup." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:fixture_setup:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:fixture_cleanup:block" type="block" identity="fixture_cleanup" parent="none"]
// CIL[DOC-MACRO purpose="Register fixture removal and cwd, environment, and spy restoration."]
// CIL[DOC-RESPONSIBILITY responsibility="Register fixture removal and cwd, environment, and spy restoration."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture state" outputs="Cleanup hook" errors="none" side_effects="Registers fixture cleanup"]
// CIL[DOC-MICRO logic_summary="Register fixture removal and cwd, environment, and spy restoration." notable_decisions=""]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:fixture_cleanup:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:seed_preflight_suite:block" type="block" identity="seed_preflight_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register missing credentials, mandatory seed, malformed fallback, path escape, and slug tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register missing credentials, mandatory seed, malformed fallback, path escape, and slug tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers and seedApp" outputs="Vitest assertions" errors="none" side_effects="Registers fixture tests with fake clients"]
// CIL[DOC-MICRO logic_summary="Register missing credentials, mandatory seed, malformed fallback, path escape, and slug tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:seed_preflight_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:config_preflight_suite:block" type="block" identity="config_preflight_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register config shape, slug grammar, enabled policy, and zero-client preflight tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register config shape, slug grammar, enabled policy, and zero-client preflight tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers and seedApp" outputs="Vitest assertions" errors="none" side_effects="Registers fake-client tests"]
// CIL[DOC-MICRO logic_summary="Register config shape, slug grammar, enabled policy, and zero-client preflight tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:config_preflight_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:permissions_preflight_suite:block" type="block" identity="permissions_preflight_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register valid empty grants and malformed permissions-patch preflight tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register valid empty grants and malformed permissions-patch preflight tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers, seedApp, records: parameterized permission-patch fixture rows" outputs="Vitest assertions" errors="none" side_effects="Registers fake-client tests"]
// CIL[DOC-MICRO logic_summary="Register valid empty grants and malformed permissions-patch preflight tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:permissions_preflight_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:seed_writes_suite:block" type="block" identity="seed_writes_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register seed write failures, pipeline resolution, generated validation, and permission-patch tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register seed write failures, pipeline resolution, generated validation, and permission-patch tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Mock responders and seedApp" outputs="Vitest assertions" errors="none" side_effects="Registers isolated fake-database tests"]
// CIL[DOC-MICRO logic_summary="Register seed write failures, pipeline resolution, generated validation, and permission-patch tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:seed_writes_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:registration_suite:block" type="block" identity="registration_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register policy parity, config preservation, disabled policy, and error handling tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register policy parity, config preservation, disabled policy, and error handling tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Mock responders, fixture config, overrides: local manifest helper options" outputs="Vitest assertions" errors="none" side_effects="Registers fake DB and temporary file tests"]
// CIL[DOC-MICRO logic_summary="Register policy parity, config preservation, disabled policy, and error handling tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:registration_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:update_app_suite:block" type="block" identity="update_app_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register update-db-app policy parity and preflight failure tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register update-db-app policy parity and preflight failure tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Commander and fixture helpers" outputs="Vitest assertions" errors="none" side_effects="Registers isolated CLI tests"]
// CIL[DOC-MICRO logic_summary="Register update-db-app policy parity and preflight failure tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:update_app_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:install_cli_suite:block" type="block" identity="install_cli_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register default seeding, no-seed, migration failure, and file-only installer tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register default seeding, no-seed, migration failure, and file-only installer tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/cli/commands/migrate.ts,.framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Mock npm, Postgres, Commander, manifest: package fixture metadata, files: package fixture contents" outputs="Vitest assertions" errors="none" side_effects="Registers isolated CLI tests"]
// CIL[DOC-MICRO logic_summary="Register default seeding, no-seed, migration failure, and file-only installer tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:install_cli_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:seed_ordering_suite:block" type="block" identity="seed_ordering_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register deterministic seed-ordering tests independent of manifest declaration order."]
// CIL[DOC-RESPONSIBILITY responsibility="Register deterministic seed-ordering tests independent of manifest declaration order."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers and seedApp" outputs="Vitest assertions" errors="none" side_effects="Registers isolated fake-database tests"]
// CIL[DOC-MICRO logic_summary="Register deterministic seed-ordering tests independent of manifest declaration order." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:seed_ordering_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:type_conflict_suite:block" type="block" identity="type_conflict_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register strict type-conflict detection tests for the types seed path."]
// CIL[DOC-RESPONSIBILITY responsibility="Register strict type-conflict detection tests for the types seed path."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="Mock responders and seedApp" outputs="Vitest assertions" errors="none" side_effects="Registers isolated fake-database tests"]
// CIL[DOC-MICRO logic_summary="Register strict type-conflict detection tests for the types seed path." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:type_conflict_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:reconcile_owned_types_suite:block" type="block" identity="reconcile_owned_types_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register --reconcile-owned-types declaration, diff-prompt, merge, and non-owned tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register --reconcile-owned-types declaration, diff-prompt, merge, and non-owned tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="Mock responders, rlState answers, seedApp" outputs="Vitest assertions" errors="none" side_effects="Registers isolated fake-database tests"]
// CIL[DOC-MICRO logic_summary="Register --reconcile-owned-types declaration, diff-prompt, merge, and non-owned tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:reconcile_owned_types_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/install-app.test.ts:pipeline_stage_validation_suite:block" type="block" identity="pipeline_stage_validation_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register install-time pipeline stage_type and send_notification recipient validation tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Register install-time pipeline stage_type and send_notification recipient validation tests."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/install-app.ts,.framework/functions/_shared/notify.ts"]
// CIL[DOC-CONTRACT inputs="Mock responders and seedApp" outputs="Vitest assertions" errors="none" side_effects="Registers isolated fake-database tests"]
// CIL[DOC-MICRO logic_summary="Register install-time pipeline stage_type and send_notification recipient validation tests." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
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
// CIL[END stable_id="~/.framework/tests/unit/install-app.test.ts:pipeline_stage_validation_suite:block"]
