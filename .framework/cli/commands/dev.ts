



import type { Command } from 'commander'
import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { watch, existsSync } from 'fs'



const __filename = fileURLToPath(import.meta.url)


const __dirname = dirname(__filename)
/**
 * PROJECT_ROOT defines the root directory of the project, allowing for relative path resolution. It exists to facilitate file operations within the project structure.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       resolve
 * @cil-generated
 */
const PROJECT_ROOT = resolve(__dirname, '../../../')

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
