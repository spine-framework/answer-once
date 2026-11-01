// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Provides the 'dev' CLI command: assemble the project, optionally verify integrity, then run the real dev server flow."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose dev command utilities for developers to streamline application development workflow."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts,scripts/assemble.sh,scripts/dev-netlify.sh,config/vite.config.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="[]" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Runs scripts/assemble.sh, optional scripts/verify-integrity.sh, then spawns Vite (config/vite.config.ts) or scripts/dev-netlify.sh; watches custom/ for changes with debounced reassembly." notable_decisions="Commands should only be executed in a valid development environment."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]




import type { Command } from 'commander'
import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { watch, existsSync } from 'fs'
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:module_header:module_header"]

// CIL[DOC-VECTOR type="context" content="purpose='Provides CLI commands for the development environment, facilitating process spawning and file watching.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Resolves the current module's file URL to a filesystem path."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a stable __filename reference for the module."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Call fileURLToPath(import.meta.url) and assign to const __filename." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]


// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/dev.ts"]
const __filename = fileURLToPath(import.meta.url)
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:__filename:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Resolves the current module's file URL to a filesystem path.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Provides the directory name of the current module for relative path resolution."]
// CIL[DOC-RESPONSIBILITY responsibility="Derive the current module's directory from __filename."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Call dirname(__filename) and assign to const __dirname." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]


// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/dev.ts"]
const __dirname = dirname(__filename)
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:__dirname:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Provides the directory name of the current module for relative path resolution.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Defines the project root directory for relative path resolution."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a resolved project root path for file operations."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolve __dirname joined with '../../../' to produce PROJECT_ROOT." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/dev.ts"]
/**
 * PROJECT_ROOT defines the root directory of the project, allowing for relative path resolution. It exists to facilitate file operations within the project structure.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       resolve
 * @cil-generated
 */
const PROJECT_ROOT = resolve(__dirname, '../../../')
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:PROJECT_ROOT:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the project root directory for relative path resolution.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Registers the 'dev' command for starting the Spine development server with options."]
// CIL[DOC-RESPONSIBILITY responsibility="Configure and launch the dev server with assembly, integrity verification, and file watching."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts,scripts/assemble.sh,scripts/dev-netlify.sh,config/vite.config.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="Promise<void>" errors="Process exits on failure" side_effects="Executes shell commands, spawns a child process, and watches for file changes."]
// CIL[DOC-MICRO logic_summary="Run scripts/assemble.sh, verify integrity unless skipped, then spawn Vite with config/vite.config.ts (npm run dev equivalent) or scripts/dev-netlify.sh with --netlify (npm run dev:netlify equivalent); watch custom/ for changes with debounced reassembly." notable_decisions="Honors --netlify, --no-verify, --port, --host, --no-watch, and --watch-delay options; ignores changes in node_modules and dotfiles; sets SPINE_DEV=true for the spawned process. --port/--host only apply to the Vite path — netlify dev pins 8888/3001 via netlify.toml."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:registerDevCommands:function" type="function" identity="registerDevCommands" parent="~/.framework/cli/commands/dev.ts"]
/**
 * Registers development commands for starting the Spine development server with various options. It facilitates the assembly and verification of core components before launching the server.
 *
 * @macro       Command registration function for a CLI tool.
 * @micro       Runs the real shipped dev flow: scripts/assemble.sh, optional
 *              scripts/verify-integrity.sh, then Vite with
 *              config/vite.config.ts (equivalent to `npm run dev`) or
 *              scripts/dev-netlify.sh when --netlify is passed (equivalent to
 *              `npm run dev:netlify`).
 * @inputSpec
 *   program: Command (required) — The command program to register the dev commands with.
 * @outputSpec  Promise<void>
 * @sideEffects Executes shell commands, spawns a child process, and watches custom/ for changes.
 * @stability   stable
 * @calls       runCommand, spawn, watch, existsSync, resolve
 * @errorHandling none
 * @cil-generated
 */
export function registerDevCommands(program: Command) {
  program
    .command('dev')
    .description('Start Spine development server (Vite by default; --netlify for functions + UI on :8888)')
    .option('--netlify', 'Run the full Netlify dev stack via scripts/dev-netlify.sh (equivalent to npm run dev:netlify)', false)
    .option('--no-verify', 'Skip integrity verification')
    .option('--port <port>', 'Dev server port (Vite mode only — netlify dev pins 8888/3001 via netlify.toml)', '3001')
    .option('--host', 'Expose Vite to network (Vite mode only)', false)
    .option('--no-watch', 'Disable custom/ file watching')
    .option('--watch-delay <ms>', 'Debounce delay for reassembly', '500')
    .action(async (opts) => {
      console.log('\n🚀 Starting Spine dev server...\n')

      try {
        // Step 1: assemble .framework/ + custom/ → .assembled/ (the vite root).
        console.log('📦 Step 1: Assembling .framework + custom → .assembled/...')
        const assemblyExitCode = await runCommand(
          'bash',
          [resolve(PROJECT_ROOT, 'scripts/assemble.sh')],
          PROJECT_ROOT
        )

        if (assemblyExitCode !== 0) {
          console.error('\n❌ Assembly failed. Please check the errors above.')
          process.exit(1)
        }
        console.log('✓ Assembly complete\n')

        // Step 2: optional integrity verification.
        if (opts.verify !== false) {
          console.log('🔒 Step 2: Verifying core integrity...')
          const verifyExitCode = await runCommand(
            'bash',
            [resolve(PROJECT_ROOT, 'scripts/verify-integrity.sh')],
            PROJECT_ROOT
          )

          if (verifyExitCode !== 0) {
            console.warn('\n⚠️  Integrity check failed. Continuing anyway (--no-verify to skip)\n')
          } else {
            console.log('✓ Integrity verified\n')
          }
        } else {
          console.log('⏭️  Step 2: Skipping integrity verification (--no-verify)\n')
        }

        // Step 3: spawn the dev server.
        //   default:  vite --config config/vite.config.ts   (≡ npm run dev)
        //   --netlify: scripts/dev-netlify.sh               (≡ npm run dev:netlify)
        let server: ReturnType<typeof spawn>
        if (opts.netlify) {
          if (opts.port !== '3001' || opts.host) {
            console.warn('⚠️  --port/--host are ignored with --netlify (netlify.toml pins 8888 → 3001)\n')
          }
          const script = resolve(PROJECT_ROOT, 'scripts/dev-netlify.sh')
          if (!existsSync(script)) {
            console.error(`\n❌ Missing ${script} — this project does not have the shipped dev scripts.`)
            process.exit(1)
          }
          console.log('🌐 Step 3: Starting Netlify dev (functions + UI on http://localhost:8888)...')
          console.log('   (Press Ctrl+C to stop)\n')
          server = spawn('bash', [script], {
            cwd: PROJECT_ROOT,
            stdio: 'inherit',
            env: { ...process.env, SPINE_DEV: 'true' }
          })
        } else {
          const viteBin = resolve(PROJECT_ROOT, 'node_modules/.bin/vite')
          if (!existsSync(viteBin)) {
            console.error(`\n❌ vite not found at ${viteBin}. Run 'npm install' first.`)
            process.exit(1)
          }
          console.log(`🌐 Step 3: Starting Vite dev server on port ${opts.port}...`)
          console.log('   (Press Ctrl+C to stop)\n')
          server = spawn(
            viteBin,
            [
              '--config', resolve(PROJECT_ROOT, 'config/vite.config.ts'),
              '--port', opts.port,
              ...(opts.host ? ['--host'] : [])
            ],
            {
              cwd: PROJECT_ROOT,
              stdio: 'inherit',
              env: { ...process.env, SPINE_DEV: 'true' }
            }
          )
        }

        // Step 4: watch custom/ and re-assemble so Vite/Netlify pick up changes.
        let watcher: ReturnType<typeof watch> | null = null
        if (opts.watch !== false) {
          const watchDelay = parseInt(opts.watchDelay) || 500
          const customDir = resolve(PROJECT_ROOT, 'custom')

          if (existsSync(customDir)) {
            console.log(`👁️  Step 4: Watching custom/ for changes...`)
            console.log(`   (Changes trigger reassembly after ${watchDelay}ms debounce)\n`)

            let reassemblyTimeout: NodeJS.Timeout | null = null

            watcher = watch(customDir, { recursive: true }, (eventType, filename) => {
              if (!filename || filename.includes('node_modules') || filename.startsWith('.')) {
                return
              }

              console.log(`\n📝 Change detected in custom/${filename}`)

              if (reassemblyTimeout) {
                clearTimeout(reassemblyTimeout)
              }

              reassemblyTimeout = setTimeout(async () => {
                console.log('🔧 Running reassembly...')
                try {
                  const start = Date.now()
                  const code = await runCommand(
                    'bash',
                    [resolve(PROJECT_ROOT, 'scripts/assemble.sh')],
                    PROJECT_ROOT
                  )
                  if (code !== 0) {
                    console.error('✗ Reassembly failed (see errors above)\n')
                    return
                  }
                  const duration = Date.now() - start
                  console.log(`✓ Reassembly complete (${duration}ms)\n`)
                } catch (err: any) {
                  console.error(`✗ Reassembly failed: ${err.message}\n`)
                }
              }, watchDelay)
            })
          } else {
            console.log('⏭️  Step 4: custom/ not found, skipping watch mode\n')
          }
        } else {
          console.log('⏭️  Step 4: File watching disabled (--no-watch)\n')
        }

        server.on('exit', (code) => {
          if (watcher) {
            watcher.close()
          }
          process.exit(code || 0)
        })

        process.on('SIGINT', () => {
          console.log('\n\n🛑 Shutting down dev server...')
          if (watcher) {
            watcher.close()
          }
          server.kill('SIGTERM')
        })

        process.on('SIGTERM', () => {
          if (watcher) {
            watcher.close()
          }
          server.kill('SIGTERM')
        })

      } catch (err: any) {
        console.error('\n❌ Error:', err.message)
        if (process.env.SPINE_CLI_DEBUG) {
          console.error(err.stack)
        }
        process.exit(1)
      }
    })
}
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:registerDevCommands:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Registers the 'dev' command for starting the Spine development server with options.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Executes a shell command in a given working directory and returns its exit code."]
// CIL[DOC-RESPONSIBILITY responsibility="Run a command as a child process and report its exit code."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="command: string, args: string[], cwd: string" outputs="Promise<number>" errors="Rejects on process error" side_effects="Spawns a child process with inherited stdio."]
// CIL[DOC-MICRO logic_summary="Spawn the command with inherited stdio and environment, resolve with the exit code, reject on spawn error." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:runCommand:function" type="function" identity="runCommand" parent="~/.framework/cli/commands/dev.ts"]
/**
 * Executes a command in a specified directory and returns the exit code. This function is useful for running shell commands programmatically within the application.
 *
 * @macro       Command execution handler that returns the process exit code.
 * @micro       Spawns a child process to run the command with inherited stdio and environment variables.
 * @inputSpec
 *   command: string (required) — the command to execute.
 *   args: string[] (required) — an array of arguments for the command.
 *   cwd: string (required) — the current working directory for the command.
 * @outputSpec  Promise<number> — resolves with the exit code of the command.
 * @sideEffects none
 * @stability   stable
 * @calls       spawn
 * @cil-generated
 */
function runCommand(command: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env: process.env
    })

    proc.on('exit', (code) => {
      resolve(code || 0)
    })

    proc.on('error', (err) => {
      reject(err)
    })
  })
}
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:runCommand:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Executes a shell command in a given working directory and returns its exit code.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
