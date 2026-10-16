// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Module-level setup and shared imports for the CLI test command"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide ESM path helpers, type definitions, and runner configuration used by test command functions"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="" errors="" side_effects=""]
// CIL[DOC-MICRO logic_summary="Imports Commander, child_process, and path helpers; defines constants and types for test execution" notable_decisions="ESM-compatible __filename and __dirname resolution"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="cli developer, maintainer"]
import type { Command } from 'commander'
import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
// CIL[DOC-VECTOR type="context" content="purpose='Module-level setup and shared imports for the CLI test command'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Compute the absolute file path for this ESM module"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the current modules __filename equivalent for path calculations"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="import.meta.url" outputs="string absolute file path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts the ESM import.meta.url to a file URL path using fileURLToPath" notable_decisions="Polyfills CommonJS __filename in an ESM module"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Compute the absolute file path for this ESM module'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Compute the directory path of this ESM module"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the current modules __dirname equivalent for project-root lookup"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="__filename" outputs="string directory path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses path.dirname to derive the directory from the ESM __filename" notable_decisions="Polyfills CommonJS __dirname in an ESM module"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Compute the directory path of this ESM module'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:__dirname:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Resolve the absolute project root from the CLI command location"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the root directory used as working directory for test runners"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="__dirname" outputs="string project root path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolves three parent directories up from .framework/cli/commands" notable_decisions="Hardcoded relative traversal matches the framework path layout"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const PROJECT_ROOT = resolve(__dirname, '../../../')
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the absolute project root from the CLI command location'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:PROJECT_ROOT:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:TestSuite:type" type="type" identity="TestSuite" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Define the union of supported test suite identifiers"]
// CIL[DOC-RESPONSIBILITY responsibility="Type-check the suite argument accepted by the test command"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TestSuite union type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports a string literal union of unit, integration, api, ui, and all" notable_decisions="Keeps suite names as a single source of truth for CLI validation"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
type TestSuite = 'unit' | 'integration' | 'api' | 'ui' | 'all'
// CIL[DOC-VECTOR type="context" content="purpose='Define the union of supported test suite identifiers'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:TestSuite:type"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:SUITES:constant" type="constant" identity="SUITES" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Map suite names to their test directory patterns and runner executables"]
// CIL[DOC-RESPONSIBILITY responsibility="Centralize suite configuration consumed by registerTestCommands and runner functions"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record<string, {pattern: string, runner: vitest|playwright|node}>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines a lookup of suite patterns under v2-core/tests and the runner to invoke" notable_decisions="Defaults all non-ui suites to vitest; ui suite uses playwright"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const SUITES: Record<string, { pattern: string; runner: 'vitest' | 'playwright' | 'node' }> = {
  unit: { pattern: 'v2-core/tests/unit', runner: 'vitest' },
  integration: { pattern: 'v2-core/tests/integration', runner: 'vitest' },
  api: { pattern: 'v2-core/tests/api', runner: 'vitest' },
  ui: { pattern: 'v2-core/tests/ui', runner: 'playwright' }
}
// CIL[DOC-VECTOR type="context" content="purpose='Map suite names to their test directory patterns and runner executables'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:SUITES:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:registerTestCommands:function" type="function" identity="registerTestCommands" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Register the test subcommand with the Commander CLI program"]
// CIL[DOC-RESPONSIBILITY responsibility="Wire the test command, validate the suite argument, run suites, and print a summary"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void" errors="console.error and process.exit(1) on unknown suite" side_effects="registers test subcommand, logs to console, calls process.exit with 0 or 1"]
// CIL[DOC-MICRO logic_summary="Parses suite and options, iterates over suites, dispatches runner, collects results, and prints JSON or text summary" notable_decisions="Unknown suites cause immediate stderr and exit; all runs all known suites in order"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function registerTestCommands(program: Command) {
  const testCmd = program
    .command('test [suite]')
    .description('Run Spine test suites')
    .option('--json', 'Output as JSON')
    .option('--watch', 'Watch mode (unit/integration only)')
    .option('--reporter <name>', 'Vitest reporter', 'default')
    .action(async (suiteArg: string | undefined, opts) => {
      const suite: TestSuite = (suiteArg || 'all') as TestSuite

      if (suite !== 'all' && !SUITES[suite]) {
        console.error(`\n❌ Unknown test suite: ${suite}`)
        console.log('Valid suites: unit, integration, api, ui, all')
        process.exit(1)
      }

      const suitesToRun = suite === 'all'
        ? ['unit', 'integration', 'api', 'ui']
        : [suite]

      console.log(`\n🧪 Running Spine test suites: ${suitesToRun.join(', ')}\n`)

      const results: Array<{ suite: string; exitCode: number; passed: boolean }> = []

      for (const s of suitesToRun) {
        const config = SUITES[s]
        console.log(`\n▶️  ${s.toUpperCase()} tests (${config.runner})`)
        console.log('-'.repeat(40))

        try {
          let exitCode: number

          if (config.runner === 'vitest') {
            exitCode = await runVitest(s, opts)
          } else if (config.runner === 'playwright') {
            exitCode = await runPlaywright(s, opts)
          } else {
            exitCode = await runNode(s, opts)
          }

          results.push({ suite: s, exitCode, passed: exitCode === 0 })

          if (exitCode === 0) {
            console.log(`✓ ${s} tests passed\n`)
          } else {
            console.error(`✗ ${s} tests failed (exit ${exitCode})\n`)
          }

        } catch (err: any) {
          console.error(`\n❌ Error running ${s} tests:`, err.message)
          results.push({ suite: s, exitCode: 1, passed: false })
        }
      }

      console.log('\n' + '='.repeat(50))
      console.log('Test Run Summary')
      console.log('='.repeat(50))

      const totalPassed = results.filter(r => r.passed).length
      const totalFailed = results.filter(r => !r.passed).length

      for (const r of results) {
        const icon = r.passed ? '✓' : '✗'
        const status = r.passed ? 'PASSED' : 'FAILED'
        console.log(`${icon} ${r.suite.padEnd(12)} ${status}`)
      }

      console.log()
      console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`)

      if (opts.json) {
        const jsonOutput = {
          suites: results.map(r => ({
            suite: r.suite,
            status: r.passed ? 'passed' : 'failed',
            exit_code: r.exitCode
          })),
          summary: {
            total: results.length,
            passed: totalPassed,
            failed: totalFailed
          }
        }
        console.log('\n' + JSON.stringify(jsonOutput, null, 2))
      }

      process.exit(totalFailed > 0 ? 1 : 0)
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the test subcommand with the Commander CLI program'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:registerTestCommands:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:runVitest:function" type="function" identity="runVitest" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Assemble and execute a Vitest test run for a given suite"]
// CIL[DOC-RESPONSIBILITY responsibility="Build Vitest CLI arguments and return the exit code"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="suite: string, opts: any" outputs="number (exit code)" errors="rejects if npx vitest fails to spawn or exits with an error event" side_effects="spawns npx vitest child process with inherited stdio"]
// CIL[DOC-MICRO logic_summary="Constructs run/watch and reporter arguments, then delegates to runCommand" notable_decisions="Adds a custom reporter from v2-core/tests/reporter.ts when default is selected"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function runVitest(suite: string, opts: any): Promise<number> {
  const config = SUITES[suite]
  const args = [
    'run',
    config.pattern,
    '--config', resolve(PROJECT_ROOT, 'vitest.config.ts')
  ]

  if (opts.watch) {
    args[0] = 'watch'
  }

  if (opts.reporter === 'default') {
    args.push('--reporter=default')
    args.push('--reporter=' + resolve(PROJECT_ROOT, 'v2-core/tests/reporter.ts'))
  } else {
    args.push(`--reporter=${opts.reporter}`)
  }

  return runCommand('npx', ['vitest', ...args], PROJECT_ROOT)
}
// CIL[DOC-VECTOR type="context" content="purpose='Assemble and execute a Vitest test run for a given suite'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:runVitest:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:runPlaywright:function" type="function" identity="runPlaywright" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Assemble and execute a Playwright test run for the UI suite"]
// CIL[DOC-RESPONSIBILITY responsibility="Build Playwright CLI arguments and return the exit code"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="suite: string, opts: any" outputs="number (exit code)" errors="rejects if npx playwright fails to spawn or exits with an error event" side_effects="spawns npx playwright child process with inherited stdio; logs dev server requirement"]
// CIL[DOC-MICRO logic_summary="Constructs playwright test arguments and optionally enables JSON reporter" notable_decisions="Assumes a dev server is running on localhost:8888"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function runPlaywright(suite: string, opts: any): Promise<number> {
  console.log('   (Playwright tests require dev server on localhost:8888)')

  const args = ['playwright', 'test', SUITES[suite].pattern]

  if (opts.json) {
    args.push('--reporter=json')
  }

  return runCommand('npx', args, PROJECT_ROOT)
}
// CIL[DOC-VECTOR type="context" content="purpose='Assemble and execute a Playwright test run for the UI suite'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:runPlaywright:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:runNode:function" type="function" identity="runNode" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Execute a test file directly with Node.js"]
// CIL[DOC-RESPONSIBILITY responsibility="Run a suites test directory as a Node.js module and return the exit code"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="suite: string, opts: any" outputs="number (exit code)" errors="rejects if node process fails to spawn or emits an error event" side_effects="spawns node child process with inherited stdio"]
// CIL[DOC-MICRO logic_summary="Looks up the suite pattern and spawns node with it as the entry point" notable_decisions="Relies on Node.js for simple or one-off test scripts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function runNode(suite: string, opts: any): Promise<number> {
  const args = [SUITES[suite].pattern]
  return runCommand('node', args, PROJECT_ROOT)
}
// CIL[DOC-VECTOR type="context" content="purpose='Execute a test file directly with Node.js'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:runNode:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/test.ts:runCommand:function" type="function" identity="runCommand" parent="~/.framework/cli/commands/test.ts"]
// CIL[DOC-MACRO purpose="Spawn a shell command and return its exit code"]
// CIL[DOC-RESPONSIBILITY responsibility="Abstract child_process spawn for test runners"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/test.ts"]
// CIL[DOC-CONTRACT inputs="command: string, args: string[], cwd: string" outputs="number (exit code)" errors="rejects on spawn error" side_effects="spawns a child process with inherited stdio and shell mode"]
// CIL[DOC-MICRO logic_summary="Returns a promise that resolves when the child process exits and rejects on spawn errors" notable_decisions="Uses shell: true and stdio: inherit to preserve terminal output"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function runCommand(command: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
      shell: true
    })

    proc.on('exit', (code) => {
      resolve(code || 0)
    })

    proc.on('error', (err) => {
      reject(err)
    })
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Spawn a shell command and return its exit code'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/test.ts:runCommand:function"]