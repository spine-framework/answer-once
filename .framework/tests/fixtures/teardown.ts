// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:file_header:constant" type="constant" identity="file_header" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="File header for the teardown test fixture script"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide JSDoc metadata and reference the node types module"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Triple-slash node reference and module-level JSDoc" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
/// <reference types="node" />
/**
 * @module tests/fixtures/teardown
 * @audience core-contributor
 * @layer test-infrastructure
 * @stability stable
 *
 * Deletes all test fixtures from the public schema. Removes every row whose
 * slug starts with `test-` under SPINE_TEST_ACCOUNT_ID, in FK-safe order.
 *
 * Run after integration tests: `tsx v2-core/tests/fixtures/teardown.ts`
 *
 * @seeAlso tests/fixtures/seed.ts
 */
// CIL[DOC-VECTOR type="context" content="purpose='File header for the teardown test fixture script'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:file_header:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-AUDIENCE audience="core-contributor"]
// CIL[DOC-MACRO purpose="Load environment variables and import dependencies for test fixture teardown"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="loaded process.env and imports" errors="none" side_effects="Reads .xenv files and mutates process.env"]
// CIL[DOC-MICRO logic_summary="Derives __filename and __dirname, loads dotenv-style files, then imports @supabase/supabase-js" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadEnv() {
  for (const name of ['.xenv.test', '.xenv']) {
    const p = resolve(__dirname, '../../', name)
    if (existsSync(p)) {
      const lines = readFileSync(p, 'utf8').split('\n')
      for (const line of lines) {
        const t = line.trim()
        if (!t || t.startsWith('#')) continue
        const eq = t.indexOf('=')
        if (eq === -1) continue
        const k = t.slice(0, eq).trim()
        const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[k]) process.env[k] = v
      }
      break
    }
  }
}

loadEnv()

import { createClient } from '@supabase/supabase-js'
// CIL[DOC-VECTOR type="context" content="purpose='Load environment variables and import dependencies for test fixture teardown'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:SUPABASE_URL:constant" type="constant" identity="SUPABASE_URL" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="URL of the Supabase instance used for test fixture teardown"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the Supabase project URL from environment"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads process.env.SUPABASE_URL with a non-null assertion" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const SUPABASE_URL = process.env.SUPABASE_URL!
// CIL[DOC-VECTOR type="context" content="purpose='URL of the Supabase instance used for test fixture teardown'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:SUPABASE_URL:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:SERVICE_KEY:constant" type="constant" identity="SERVICE_KEY" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="Supabase service role key for test fixture teardown"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the Supabase service role key from environment"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads process.env.SUPABASE_SERVICE_ROLE_KEY with a non-null assertion" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
// CIL[DOC-VECTOR type="context" content="purpose='Supabase service role key for test fixture teardown'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:SERVICE_KEY:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:ACCOUNT_ID:constant" type="constant" identity="ACCOUNT_ID" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="Spine test account ID for test fixture teardown"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the target account identifier from environment"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads process.env.SPINE_TEST_ACCOUNT_ID with a non-null assertion" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const ACCOUNT_ID   = process.env.SPINE_TEST_ACCOUNT_ID!
// CIL[DOC-VECTOR type="context" content="purpose='Spine test account ID for test fixture teardown'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:ACCOUNT_ID:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:env_check:variable" type="variable" identity="env_check" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="Validate that required environment variables are present"]
// CIL[DOC-RESPONSIBILITY responsibility="Exit the process early if any required env var is missing"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none or process.exit(1)" errors="Missing required environment variable" side_effects="Logs an error and may exit the process"]
// CIL[DOC-MICRO logic_summary="Checks SUPABASE_URL, SERVICE_KEY, and ACCOUNT_ID for truthy values" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
if (!SUPABASE_URL || !SERVICE_KEY || !ACCOUNT_ID) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or SPINE_TEST_ACCOUNT_ID')
  process.exit(1)
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate that required environment variables are present'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:env_check:variable"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:db:constant" type="constant" identity="db" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="Supabase client for the public schema"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a database client used to delete test rows"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SupabaseClient" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a Supabase client configured for the public schema using SUPABASE_URL and SERVICE_KEY" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const db = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'public' } })
// CIL[DOC-VECTOR type="context" content="purpose='Supabase client for the public schema'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:db:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:del:function" type="function" identity="del" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="Delete test rows from a single table"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute a slug-filtered delete query with an optional extra filter"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="table: string, filter?: (q: any) => any" outputs="none" errors="Logs a warning on Supabase error" side_effects="Deletes rows whose slug starts with test-% and logs the count"]
// CIL[DOC-MICRO logic_summary="Builds a delete query filtered by slug like test-%, applies an optional filter callback, awaits the result, and logs the affected count or warning" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function del(table: string, filter?: (q: any) => any) {
  let q = db.from(table).delete().like('slug', 'test-%')
  if (filter) q = filter(q)
  const { error, count } = await (q as any)
  if (error) console.warn(`  [warn] ${table}:`, error.message)
  else console.log(`  ✓ ${table}: removed ${count ?? '?'} rows`)
}
// CIL[DOC-VECTOR type="context" content="purpose='Delete test rows from a single table'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:del:function"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:teardown:function" type="function" identity="teardown" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="Remove all test fixtures from the public schema in FK-safe order"]
// CIL[DOC-RESPONSIBILITY responsibility="Orchestrate deletion of seeded test records across multiple tables"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="Throws if any delete fails" side_effects="Deletes test rows from items, people, pipelines, types, and roles"]
// CIL[DOC-MICRO logic_summary="Logs start, deletes records from each table in order, then logs completion" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function teardown() {
  console.log('🧹 Tearing down test fixtures from public schema...')

  await del('items',     q => q.eq('account_id', ACCOUNT_ID))
  await del('people',    q => q.eq('account_id', ACCOUNT_ID))
  await del('pipelines', q => q.eq('account_id', ACCOUNT_ID))
  await del('types')
  await del('roles',     q => q.eq('account_id', ACCOUNT_ID))

  console.log('✅ Teardown complete.')
}
// CIL[DOC-VECTOR type="context" content="purpose='Remove all test fixtures from the public schema in FK-safe order'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:teardown:function"]
// CIL[BEGIN stable_id="~/.framework/tests/fixtures/teardown.ts:teardown_invocation:variable" type="variable" identity="teardown_invocation" parent="~/.framework/tests/fixtures/teardown.ts"]
// CIL[DOC-MACRO purpose="Invoke the teardown routine when the script runs directly"]
// CIL[DOC-RESPONSIBILITY responsibility="Run teardown and exit with an error code on failure"]
// CIL[DOC-CONTEXT module=".framework/tests/fixtures/teardown" layer="test-infrastructure" related_files=".framework/tests/fixtures/teardown.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="Exits with code 1 on unhandled rejection" side_effects="Calls teardown, logs failures, and exits the process on error"]
// CIL[DOC-MICRO logic_summary="Calls teardown and catches rejections to log an error and exit with code 1" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
teardown().catch(err => {
  console.error('Teardown failed:', err)
  process.exit(1)
})
// CIL[DOC-VECTOR type="context" content="purpose='Invoke the teardown routine when the script runs directly'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/teardown.ts:teardown_invocation:variable"]
