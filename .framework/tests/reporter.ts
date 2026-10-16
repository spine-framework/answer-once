// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:file_header:constant" type="constant" identity="file_header" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Provide module-level documentation and metadata for the Vitest custom reporter."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the test reporter's purpose, environment requirements, registration, and related files."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSDoc metadata" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains only docblock and @seeAlso references." notable_decisions="JSDoc is retained as module metadata."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
/// <reference types="node" />
/**
 * @module tests/reporter
 * @audience core-contributor
 * @layer test-infrastructure
 * @stability stable
 *
 * Vitest custom reporter that persists test run results to public.test_runs
 * and public.test_results in Supabase. Also exports writeRunResults() for
 * use by non-Vitest runners (API tests, UI sweep).
 *
 * Registered in vitest.config.ts via:
 *   reporters: ['default', './v2-core/tests/reporter.ts']
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.
 *
 * @seeAlso migrations_dayzero/008_test_runs.sql
 * @seeAlso tests/ui/ui-sweep.ts (calls writeRunResults directly)
 * @seeAlso tests/api/api-surface.test.ts (calls writeRunResults directly)
 */
// CIL[DOC-VECTOR type="context" content="purpose='Provide module-level documentation and metadata for the Vitest custom reporter.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:file_header:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Import dependencies required by the test reporter."]
// CIL[DOC-RESPONSIBILITY responsibility="Load fs, path, url utilities and Vitest reporter types."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported modules and types" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Four import statements for Node and Vitest APIs." notable_decisions="Named imports preferred; Vitest types only imported."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="core-contributor"]
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Reporter, File, Task } from 'vitest'
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies required by the test reporter.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Capture the current module's filename path."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve this file's filesystem path for locating environment files."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="import.meta.url" outputs="__filename string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts import.meta.url to a file path using fileURLToPath." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Capture the current module's filename path.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Capture the current module's directory path."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide directory context for resolving dotenv files."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="__filename" outputs="__dirname string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Derives __dirname from __filename using dirname." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Capture the current module's directory path.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:__dirname:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:loadEnv:function" type="function" identity="loadEnv" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Load local test environment variables from .xenv files."]
// CIL[DOC-RESPONSIBILITY responsibility="Read the closest .xenv or .xenv.test and populate process.env."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="none (uses __dirname and process.env)" outputs="mutated process.env" errors="silently skips missing files" side_effects="sets process.env key=value pairs"]
// CIL[DOC-MICRO logic_summary="Searches parent .xenv files, parses KEY=value lines, trims quotes, and assigns only when not already set." notable_decisions="Stops after first found file; does not overwrite existing environment variables."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function loadEnv() {
  for (const name of ['.xenv.test', '.xenv']) {
    const p = resolve(__dirname, '../', name)
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
// CIL[DOC-VECTOR type="context" content="purpose='Load local test environment variables from .xenv files.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:loadEnv:function"]
// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:reporter_init:variable" type="variable" identity="reporter_init" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Trigger environment loading at module import time."]
// CIL[DOC-RESPONSIBILITY responsibility="Execute loadEnv when the reporter module is imported."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="side effect" errors="none" side_effects="process.env populated by loadEnv"]
// CIL[DOC-MICRO logic_summary="Single call to loadEnv and a section marker comment." notable_decisions="Loads environment immediately on import so reporters can run with correct config."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
loadEnv()

// ─── TYPES ─────────────────────────────────────────────────────────────────
// CIL[DOC-VECTOR type="context" content="purpose='Trigger environment loading at module import time.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:reporter_init:variable"]

// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:TestCaseResult:interface" type="interface" identity="TestCaseResult" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Define the data shape for an individual test case outcome."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a TypeScript contract for test result records."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TestCaseResult type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fields: suite, optional file/describe, name, status, optional duration and error." notable_decisions="Status is a union of passed, failed, skipped."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface TestCaseResult {
  suite:      string
  file?:      string
  describe?:  string
  name:       string
  status:     'passed' | 'failed' | 'skipped'
  duration_ms?: number
  error?:     string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the data shape for an individual test case outcome.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:TestCaseResult:interface"]

// ─── DB WRITER ─────────────────────────────────────────────────────────────

// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:writeRunResults:function" type="function" identity="writeRunResults" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Persist a completed test run and its results to Supabase."]
// CIL[DOC-RESPONSIBILITY responsibility="Insert a public.test_runs row and public.test_results rows from supplied outcome data."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="suite string, results TestCaseResult[], durationMs number" outputs="run_id string or null" errors="missing env returns null; insert errors warn and return null" side_effects="inserts rows into public.test_runs and public.test_results; logs to console"]
// CIL[DOC-MICRO logic_summary="Validates env, creates Supabase client, computes pass/fail/skip counts, inserts run, then bulk inserts results." notable_decisions="Returns null on any failure; triggered_by set to 'agent'."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
/**
 * Writes a completed test run + individual results to public schema.
 * Safe to call from any test runner (Vitest, Playwright, fetch-based API tests).
 *
 * @param suite - 'unit' | 'integration' | 'api' | 'ui'
 * @param results - array of individual test case outcomes
 * @param durationMs - total wall-clock duration of the suite
 */
export async function writeRunResults(
  suite: string,
  results: TestCaseResult[],
  durationMs: number
): Promise<string | null> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('[reporter] Skipping DB write — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
    return null
  }

  const { createClient } = await import('@supabase/supabase-js')
  const db = createClient(url, key, { db: { schema: 'public' } })

  const passed  = results.filter(r => r.status === 'passed').length
  const failed  = results.filter(r => r.status === 'failed').length
  const skipped = results.filter(r => r.status === 'skipped').length
  const status  = failed > 0 ? 'failed' : 'passed'

  const { data: run, error: runErr } = await db
    .from('test_runs')
    .insert({
      suite,
      status,
      duration_ms: durationMs,
      total: results.length,
      passed,
      failed,
      skipped,
      finished_at: new Date().toISOString(),
      triggered_by: 'agent'
    })
    .select('id')
    .single()

  if (runErr || !run) {
    console.warn('[reporter] Failed to insert test_run:', runErr?.message)
    return null
  }

  if (results.length > 0) {
    const rows = results.map(r => ({
      run_id:      run.id,
      suite:       r.suite,
      file:        r.file ?? null,
      describe:    r.describe ?? null,
      name:        r.name,
      status:      r.status,
      duration_ms: r.duration_ms ?? null,
      error:       r.error ?? null
    }))

    const { error: resultErr } = await db.from('test_results').insert(rows)
    if (resultErr) console.warn('[reporter] Failed to insert test_results:', resultErr.message)
  }

  console.log(`[reporter] Wrote run ${run.id} — ${suite}: ${passed}✓ ${failed}✗ ${skipped}⊘`)
  return run.id
}
// CIL[DOC-VECTOR type="context" content="purpose='Persist a completed test run and its results to Supabase.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:writeRunResults:function"]

// ─── VITEST REPORTER ───────────────────────────────────────────────────────

// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:SpineReporter:class" type="class" identity="SpineReporter" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Implement a Vitest Reporter that collects test results and writes them to the database."]
// CIL[DOC-RESPONSIBILITY responsibility="Track suite start time, traverse Vitest task tree, and call writeRunResults on finish."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="files?: File[] from onFinished, tasks: Task[], describePath: string" outputs="persisted run id via writeRunResults" errors="none at class level" side_effects="walks task tree and inserts test results to Supabase"]
// CIL[DOC-MICRO logic_summary="onInit records start time; onFinished computes duration, flattens nested tasks into TestCaseResult rows, and delegates persistence." notable_decisions="suite derived from file path; error message built from first error message and stack."]
// CIL[DOC-NOTE type="param" content="tasks: Task[] - array of Vitest tasks"]
// CIL[DOC-NOTE type="param" content="describePath: string - nested describe path string"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
class SpineReporter implements Reporter {
  private startTime = 0
  private suite = 'unit'

  onInit() {
    this.startTime = Date.now()
  }

  async onFinished(files?: File[]) {
    if (!files?.length) return

    const results: TestCaseResult[] = []

    for (const file of files) {
      const filePath = file.name
      const suiteName = filePath.includes('/integration/') ? 'integration'
        : filePath.includes('/api/')         ? 'api'
        : filePath.includes('/ui/')          ? 'ui'
        : 'unit'
      this.suite = suiteName

      /**
       * Recursively collect test tasks into results.
       * @param {Task[]} tasks - array of Vitest tasks
       * @param {string} describePath - nested describe path string
       */
      function collectTasks(tasks: Task[], describePath: string) {
        for (const task of tasks) {
          if (task.type === 'suite') {
            const nested = (task as any).tasks ?? []
            collectTasks(nested, describePath ? `${describePath} > ${task.name}` : task.name)
          } else {
            const result = (task as any).result
            const status: TestCaseResult['status'] =
              result?.state === 'pass' ? 'passed'
              : result?.state === 'skip' ? 'skipped'
              : 'failed'

            const errorMsg = result?.errors?.[0]
              ? `${result.errors[0].message ?? ''}\n${result.errors[0].stack ?? ''}`.trim()
              : undefined

            results.push({
              suite:       suiteName,
              file:        filePath,
              describe:    describePath || undefined,
              name:        task.name,
              status,
              duration_ms: result?.duration ? Math.round(result.duration) : undefined,
              error:       errorMsg
            })
          }
        }
      }

      collectTasks((file as any).tasks ?? [], '')
    }

    const durationMs = Date.now() - this.startTime
    await writeRunResults(this.suite, results, durationMs)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implement a Vitest Reporter that collects test results and writes them to the database.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:SpineReporter:class"]

// CIL[BEGIN stable_id="~/.framework/tests/reporter.ts:default:function" type="function" identity="default" parent="~/.framework/tests/reporter.ts"]
// CIL[DOC-MACRO purpose="Export the SpineReporter class as the default Vitest reporter."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose SpineReporter to Vitest reporter resolution."]
// CIL[DOC-CONTEXT module="tests/reporter" layer="test-infrastructure" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="default export of SpineReporter" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Single default export statement." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export default SpineReporter
// CIL[DOC-VECTOR type="context" content="purpose='Export the SpineReporter class as the default Vitest reporter.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/reporter.ts:default:function"]
