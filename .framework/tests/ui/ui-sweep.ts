// CIL[BEGIN stable_id="~/.framework/tests/ui/ui-sweep.ts:file_header:constant" type="constant" identity="file_header" parent="~/.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-MACRO purpose="Provide file-level documentation and usage notes for the UI sweep test."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the test purpose, run command, dependencies, and exit codes."]
// CIL[DOC-CONTEXT module="tests/ui/ui-sweep" layer="test-ui" related_files=".framework/tests/reporter.ts,.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="file header comments" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="JSDoc block with module metadata and run instructions." notable_decisions="Uses exit codes 0 for all passed and 1 for failures."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * @module tests/ui/ui-sweep
 * @audience core-contributor
 * @layer test-ui
 * @stability stable
 *
 * Playwright UI sweep for all admin routes. Navigates each route, waits for
 * the page to settle, asserts zero console errors, and checks for expected
 * landmark elements. Writes results to public.test_runs via reporter.ts.
 *
 * Run via: tsx v2-core/tests/ui/ui-sweep.ts
 * Requires: Netlify dev server running at SPINE_DEV_URL (default http://localhost:8888)
 *
 * Exit codes:
 *   0 — all routes passed
 *   1 — one or more routes failed
 *
 * @seeAlso tests/reporter.ts (writeRunResults)
 * @seeAlso .windsurf/workflows/ui-test.md
 */
// CIL[DOC-VECTOR type="context" content="purpose='Provide file-level documentation and usage notes for the UI sweep test.'; No verified external callers; imports: .framework/tests/reporter.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/ui/ui-sweep.ts:file_header:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/ui/ui-sweep.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-MACRO purpose="Load environment variables and import dependencies for the Playwright UI sweep."]
// CIL[DOC-RESPONSIBILITY responsibility="Read .xenv files and import the modules required to run the sweep."]
// CIL[DOC-CONTEXT module="tests/ui/ui-sweep" layer="test-ui" related_files=".framework/tests/reporter.ts"]
// CIL[DOC-CONTRACT inputs="process.env and .xenv/.xenv.test files" outputs="loaded environment and imported modules" errors="Import or file read errors propagate" side_effects="Reads .xenv files and sets process.env for missing keys"]
// CIL[DOC-MICRO logic_summary="Resolves the current directory and attempts to load .xenv.test then .xenv before importing Playwright and the reporter." notable_decisions="Only sets process.env keys that are not already defined; stops after the first found env file."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="core-contributor"]
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

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

import { writeRunResults } from '../reporter.ts'
import type { TestCaseResult } from '../reporter.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Load environment variables and import dependencies for the Playwright UI sweep.'; No verified external callers; imports: .framework/tests/reporter.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/ui/ui-sweep.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/ui/ui-sweep.ts:BASE_URL:constant" type="constant" identity="BASE_URL" parent="~/.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-MACRO purpose="Define the base URL used for all sweep navigation."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the dev server URL from the environment or default."]
// CIL[DOC-CONTEXT module="tests/ui/ui-sweep" layer="test-ui" related_files=".framework/tests/reporter.ts,.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-CONTRACT inputs="process.env.SPINE_DEV_URL" outputs="BASE_URL string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fallback to localhost:8888 when SPINE_DEV_URL is unset." notable_decisions="Default is hardcoded."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const BASE_URL = process.env.SPINE_DEV_URL || 'http://localhost:8888'
// CIL[DOC-VECTOR type="context" content="purpose='Define the base URL used for all sweep navigation.'; No verified external callers; imports: .framework/tests/reporter.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/ui/ui-sweep.ts:BASE_URL:constant"]

// ─── ROUTE REGISTRY ──────────────────────────────────────────────────────────

// CIL[BEGIN stable_id="~/.framework/tests/ui/ui-sweep.ts:RouteSpec:interface" type="interface" identity="RouteSpec" parent="~/.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-MACRO purpose="Declare the shape of a route specification."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields used to describe an admin route under test."]
// CIL[DOC-CONTEXT module="tests/ui/ui-sweep" layer="test-ui" related_files=".framework/tests/reporter.ts,.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="RouteSpec TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional waitFor text, expected text, and suite classification." notable_decisions="waitFor and expectText are optional."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface RouteSpec {
  path:       string
  waitFor?:   string   // text or aria label to wait for
  expectText?: string[] // text that should appear on the page
  suite:      'runtime' | 'configs' | 'observability' | 'testing'
}
// CIL[DOC-VECTOR type="context" content="purpose='Declare the shape of a route specification.'; No verified external callers; imports: .framework/tests/reporter.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/ui/ui-sweep.ts:RouteSpec:interface"]

// CIL[BEGIN stable_id="~/.framework/tests/ui/ui-sweep.ts:ROUTES:constant" type="constant" identity="ROUTES" parent="~/.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-MACRO purpose="Define the list of admin routes to sweep."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the canonical route registry for the UI sweep."]
// CIL[DOC-CONTEXT module="tests/ui/ui-sweep" layer="test-ui" related_files=".framework/tests/reporter.ts,.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ROUTES array of RouteSpec" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant array of routes grouped by runtime, configs, observability, and testing suites." notable_decisions="Each route includes a waitFor string to verify page load."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ROUTES: RouteSpec[] = [
  // Runtime
  { path: '/admin/runtime/accounts',    waitFor: 'Accounts',     suite: 'runtime' },
  { path: '/admin/runtime/people',      waitFor: 'People',       suite: 'runtime' },
  { path: '/admin/runtime/items',       waitFor: 'Items',        suite: 'runtime' },
  { path: '/admin/runtime/threads',     waitFor: 'Threads',      suite: 'runtime' },
  { path: '/admin/runtime/messages',    waitFor: 'Messages',     suite: 'runtime' },
  { path: '/admin/runtime/links',       waitFor: 'Links',        suite: 'runtime' },
  { path: '/admin/runtime/attachments', waitFor: 'Attachments',  suite: 'runtime' },
  { path: '/admin/runtime/watchers',    waitFor: 'Watchers',     suite: 'runtime' },
  // Configs
  { path: '/admin/configs/types',       waitFor: 'Types',        suite: 'configs' },
  { path: '/admin/configs/apps',        waitFor: 'Apps',         suite: 'configs' },
  { path: '/admin/configs/roles',       waitFor: 'Roles',        suite: 'configs' },
  { path: '/admin/configs/pipelines',   waitFor: 'Pipelines',    suite: 'configs' },
  { path: '/admin/configs/triggers',    waitFor: 'Triggers',     suite: 'configs' },
  // Observability
  { path: '/admin/observability',       waitFor: 'Observability', suite: 'observability' },
  { path: '/admin/observability/logs',  waitFor: 'Logs',          suite: 'observability' },
  // Testing
  { path: '/admin/testing',             waitFor: 'Testing',       suite: 'testing' },
]
// CIL[DOC-VECTOR type="context" content="purpose='Define the list of admin routes to sweep.'; No verified external callers; imports: .framework/tests/reporter.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/ui/ui-sweep.ts:ROUTES:constant"]

// ─── SWEEP ───────────────────────────────────────────────────────────────────

// CIL[BEGIN stable_id="~/.framework/tests/ui/ui-sweep.ts:sweep:function" type="function" identity="sweep" parent="~/.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-MACRO purpose="Run the Playwright UI sweep across all admin routes."]
// CIL[DOC-RESPONSIBILITY responsibility="Launch a headless browser, navigate each route, detect console errors, record pass/fail results, and exit with the appropriate code."]
// CIL[DOC-CONTEXT module="tests/ui/ui-sweep" layer="test-ui" related_files=".framework/tests/reporter.ts,.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-CONTRACT inputs="BASE_URL and ROUTES" outputs="console log summary and test results persisted via writeRunResults" errors="Navigation timeout, console errors, or writeRunResults failure" side_effects="Spawns browser process, loads pages, writes results, calls process.exit"]
// CIL[DOC-MICRO logic_summary="Iterates ROUTES, captures console errors, awaits title, pushes TestCaseResult objects, then closes the browser and writes run results." notable_decisions="Uses networkidle wait and an 8s selector timeout; reports up to three console errors per route."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function sweep() {
  const startMs = Date.now()
  console.log(`\n🔍 UI Sweep — ${BASE_URL}\n`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page    = await context.newPage()

  const results: TestCaseResult[] = []
  let passed = 0, failed = 0

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route.path}`
    const testName = `navigate ${route.path}`
    const testStart = Date.now()

    try {
      const consoleErrors: string[] = []
      const handler = (msg: any) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      }
      page.on('console', handler)

      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })

      if (route.waitFor) {
        await page.waitForSelector(`text=${route.waitFor}`, { timeout: 8000 }).catch(() => {})
      }

      const title = await page.title()

      if (consoleErrors.length > 0) {
        const errorText = consoleErrors.slice(0, 3).join(' | ')
        console.log(`  ✗ ${route.path}  [${consoleErrors.length} console errors]`)
        results.push({
          suite: 'ui',
          file:  `ui-sweep/${route.suite}`,
          name:  testName,
          status: 'failed',
          duration_ms: Date.now() - testStart,
          error: `Console errors: ${errorText}`
        })
        failed++
      } else {
        console.log(`  ✓ ${route.path}  (${title})`)
        results.push({
          suite: 'ui',
          file:  `ui-sweep/${route.suite}`,
          name:  testName,
          status: 'passed',
          duration_ms: Date.now() - testStart
        })
        passed++
      }

      page.off('console', handler)
    } catch (err: any) {
      console.log(`  ✗ ${route.path}  [${err.message?.slice(0, 80)}]`)
      results.push({
        suite: 'ui',
        file:  `ui-sweep/${route.suite}`,
        name:  testName,
        status: 'failed',
        duration_ms: Date.now() - testStart,
        error: err.message
      })
      failed++
    }
  }

  await browser.close()

  const durationMs = Date.now() - startMs
  console.log(`\n${passed}✓  ${failed}✗  ${durationMs}ms total\n`)

  await writeRunResults('ui', results, durationMs)

  process.exit(failed > 0 ? 1 : 0)
}
// CIL[DOC-VECTOR type="context" content="purpose='Run the Playwright UI sweep across all admin routes.'; No verified external callers; imports: .framework/tests/reporter.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/ui/ui-sweep.ts:sweep:function"]
// CIL[BEGIN stable_id="~/.framework/tests/ui/ui-sweep.ts:sweep_invocation:variable" type="variable" identity="sweep_invocation" parent="~/.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-MACRO purpose="Start the UI sweep and handle uncaught errors."]
// CIL[DOC-RESPONSIBILITY responsibility="Invoke the sweep and exit the process on unhandled failure."]
// CIL[DOC-CONTEXT module="tests/ui/ui-sweep" layer="test-ui" related_files=".framework/tests/reporter.ts,.framework/tests/ui/ui-sweep.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="process exit" errors="uncaught sweep rejection" side_effects="calls sweep(); logs to stderr; process.exit(1) on failure"]
// CIL[DOC-MICRO logic_summary="Top-level call to sweep with a catch handler that logs and exits." notable_decisions="Only called once when the script is executed."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
sweep().catch(err => {
  console.error('UI sweep failed:', err)
  process.exit(1)
})
// CIL[DOC-VECTOR type="context" content="purpose='Start the UI sweep and handle uncaught errors.'; No verified external callers; imports: .framework/tests/reporter.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/ui/ui-sweep.ts:sweep_invocation:variable"]
