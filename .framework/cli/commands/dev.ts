// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Provides CLI commands for the development environment, facilitating process spawning and file watching."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose dev command utilities for developers to streamline application development workflow."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="[]" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Defines the dev module and its intent, invariant, and related modules." notable_decisions="Commands should only be executed in a valid development environment."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
















import type { Command } from 'commander'
import { spawn, execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { watch, existsSync, statSync, readdirSync } from 'fs'

// CIL[DOC-VECTOR type="context" content="purpose='Provides CLI commands for the development environment, facilitating process spawning and file watching.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Resolves the current module's file URL to a filesystem path."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a stable __filename reference for the module."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Call fileURLToPath(import.meta.url) and assign to const __filename." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]


const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Resolves the current module's file URL to a filesystem path.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Provides the directory name of the current module for relative path resolution."]
// CIL[DOC-RESPONSIBILITY responsibility="Derive the current module's directory from __filename."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Call dirname(__filename) and assign to const __dirname." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]


const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Provides the directory name of the current module for relative path resolution.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:__dirname:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Defines the project root directory for relative path resolution."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a resolved project root path for file operations."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolve __dirname joined with '../../../' to produce PROJECT_ROOT." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * PROJECT_ROOT defines the root directory of the project, allowing for relative path resolution. It exists to facilitate file operations within the project structure.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       resolve
 * @cil-generated
 */
const PROJECT_ROOT = resolve(__dirname, '../../../')
// CIL[DOC-VECTOR type="context" content="purpose='Defines the project root directory for relative path resolution.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:PROJECT_ROOT:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:registerDevCommands:function" type="function" identity="registerDevCommands" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Registers the 'dev' command for starting the Spine development server with options."]
// CIL[DOC-RESPONSIBILITY responsibility="Configure and launch the dev server with integrity verification and file watching."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="Promise<void>" errors="Process exits on failure" side_effects="Executes shell commands, spawns a child process, and watches for file changes."]
// CIL[DOC-MICRO logic_summary="Assemble v2 core and custom files, verify integrity unless skipped, spawn Vite server, and optionally watch v2-custom for changes with debounced reassembly." notable_decisions="Honors --no-verify, --port, --host, --no-watch, and --watch-delay options; ignores changes in node_modules and dotfiles; sets SPINE_DEV=true for the Vite process."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Registers development commands for starting the Spine development server with various options. It facilitates the assembly and verification of core components before launching the server.
 *
 * @macro       Command registration function for a CLI tool.
 * @micro       Utilizes external scripts for assembly and integrity verification, followed by spawning a Vite server process.
 * @inputSpec
 *   program: Command (required) — The command program to register the dev commands with.
 * @outputSpec  Promise<void>
 * @sideEffects Executes shell commands, spawns a child process, and potentially modifies the file system through watching for changes.
 * @stability   stable
 * @calls       runCommand, spawn, watch, existsSync, resolve
 * @errorHandling none
 * @cil-generated
 */
export function registerDevCommands(program: Command) {
  program
    .command('dev')
    .description('Start Spine development server')
    .option('--no-verify', 'Skip integrity verification')
    .option('--port <port>', 'Dev server port', '3001')
    .option('--host', 'Expose to network', false)
    .option('--no-watch', 'Disable file watching')
    .option('--watch-delay <ms>', 'Debounce delay for reassembly', '500')
    .action(async (opts) => {
      console.log('\n🚀 Starting Spine dev server...\n')

      try {
        
        console.log('📦 Step 1: Assembling v2-core + v2-custom...')
        const assemblyExitCode = await runCommand(
          'bash',
          [resolve(PROJECT_ROOT, 'scripts/assemble-v2.sh')],
          PROJECT_ROOT
        )

        if (assemblyExitCode !== 0) {
          console.error('\n❌ Assembly failed. Please check the errors above.')
          process.exit(1)
        }
        console.log('✓ Assembly complete\n')

        
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

        
        console.log(`🌐 Step 3: Starting Vite dev server on port ${opts.port}...`)
        console.log('   (Press Ctrl+C to stop)\n')

        const vite = spawn(
          resolve(PROJECT_ROOT, 'node_modules/.bin/vite'),
          [
            '--config', resolve(PROJECT_ROOT, 'vite.config.ts'),
            '--port', opts.port,
            ...(opts.host ? ['--host'] : [])
          ],
          {
            cwd: PROJECT_ROOT,
            stdio: 'inherit',
            env: { ...process.env, SPINE_DEV: 'true' }
          }
        )

        
        let watcher: ReturnType<typeof watch> | null = null
        if (opts.watch !== false) {
          const watchDelay = parseInt(opts.watchDelay) || 500
          const customDir = resolve(PROJECT_ROOT, 'v2-custom')

          if (existsSync(customDir)) {
            console.log(`👁️  Step 4: Watching v2-custom/ for changes...`)
            console.log(`   (Changes trigger fast reassembly after ${watchDelay}ms debounce)\n`)

            let reassemblyTimeout: NodeJS.Timeout | null = null

            watcher = watch(customDir, { recursive: true }, (eventType, filename) => {
              
              if (!filename || filename.includes('node_modules') || filename.startsWith('.')) {
                return
              }

              console.log(`\n📝 Change detected in v2-custom/${filename}`)

              
              if (reassemblyTimeout) {
                clearTimeout(reassemblyTimeout)
              }

              reassemblyTimeout = setTimeout(async () => {
                console.log('🔧 Running fast reassembly...')
                try {
                  const start = Date.now()
                  await fastReassemble(PROJECT_ROOT)
                  const duration = Date.now() - start
                  console.log(`✓ Reassembly complete (${duration}ms)\n`)
                } catch (err: any) {
                  console.error(`✗ Reassembly failed: ${err.message}\n`)
                }
              }, watchDelay)
            })
          } else {
            console.log('⏭️  Step 4: v2-custom/ not found, skipping watch mode\n')
          }
        } else {
          console.log('⏭️  Step 4: File watching disabled (--no-watch)\n')
        }

        vite.on('exit', (code) => {
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
          vite.kill('SIGTERM')
        })

        process.on('SIGTERM', () => {
          if (watcher) {
            watcher.close()
          }
          vite.kill('SIGTERM')
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
// CIL[DOC-VECTOR type="context" content="purpose='Registers the 'dev' command for starting the Spine development server with options.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:registerDevCommands:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:runCommand:function" type="function" identity="runCommand" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Executes a shell command in a given working directory and returns its exit code."]
// CIL[DOC-RESPONSIBILITY responsibility="Run a command as a child process and report its exit code."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="command: string, args: string[], cwd: string" outputs="Promise<number>" errors="Rejects on process error" side_effects="Spawns a child process with inherited stdio."]
// CIL[DOC-MICRO logic_summary="Spawn the command with inherited stdio and environment, resolve with the exit code, reject on spawn error." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Executes a shell command in a given working directory and returns its exit code.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:runCommand:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:fastReassemble:function" type="function" identity="fastReassemble" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Synchronizes custom source and configuration files into assembled destinations."]
// CIL[DOC-RESPONSIBILITY responsibility="Copy changed files from v2-custom to src/v2-assembled and functions, and update public spine.config.json."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="projectRoot: string" outputs="Promise<void>" errors="Throws on command or file system failure" side_effects="File I/O: copying, synchronizing, creating directories."]
// CIL[DOC-MICRO logic_summary="Check for rsync; rsync or manually copy changed custom src and functions; conditionally copy spine.config.json if newer." notable_decisions="Prefers rsync when available; filters to changed files via mtime when rsync is absent; conditionally copies spine.config.json to src/v2-assembled/public."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The fastReassemble function synchronizes custom source files and configuration from a specified project root to designated destination directories. It ensures that the latest changes are reflected in the assembled output, using rsync if available for efficiency.
 *
 * @inputSpec
 *   projectRoot: string (required) — the root directory of the project to reassemble.
 * @outputSpec  Promise<void>
 * @sideEffects file I/O operations including copying and synchronizing files, creating directories.
 * @stability   stable
 * @calls       execSync, existsSync, mkdirSync, statSync, copyFileSync, copyChangedFiles
 * @cil-generated
 */
async function fastReassemble(projectRoot: string): Promise<void> {
  const customDir = resolve(projectRoot, 'v2-custom')
  const srcDest = resolve(projectRoot, 'src/v2-assembled')
  const funcsDest = resolve(projectRoot, 'functions')

  
  let hasRsync = false
  try {
    execSync('which rsync', { stdio: 'pipe' })
    hasRsync = true
  } catch {
    hasRsync = false
  }

  
  const customSrcDir = resolve(customDir, 'src')
  if (existsSync(customSrcDir)) {
    const destDir = srcDest

    if (hasRsync) {
      
      execSync(
        `rsync -av --delete "${customSrcDir}/" "${destDir}/"`,
        { stdio: 'pipe', cwd: projectRoot }
      )
    } else {
      
      copyChangedFiles(customSrcDir, destDir)
    }
  }

  
  const customFuncsDir = resolve(customDir, 'functions')
  if (existsSync(customFuncsDir)) {
    if (hasRsync) {
      execSync(
        `rsync -av --delete "${customFuncsDir}/" "${funcsDest}/"`,
        { stdio: 'pipe', cwd: projectRoot }
      )
    } else {
      copyChangedFiles(customFuncsDir, funcsDest)
    }
  }

  
  const spineConfigSrc = resolve(projectRoot, 'spine.config.json')
  const publicDest = resolve(srcDest, 'public')
  if (existsSync(spineConfigSrc)) {
    if (!existsSync(publicDest)) {
      mkdirSync(publicDest, { recursive: true })
    }
    const spineConfigDest = resolve(publicDest, 'spine.config.json')
    const srcStat = statSync(spineConfigSrc)
    let needsCopy = true
    if (existsSync(spineConfigDest)) {
      const destStat = statSync(spineConfigDest)
      needsCopy = srcStat.mtimeMs > destStat.mtimeMs
    }
    if (needsCopy) {
      copyFileSync(spineConfigSrc, spineConfigDest)
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Synchronizes custom source and configuration files into assembled destinations.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:fastReassemble:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/dev.ts:copyChangedFiles:function" type="function" identity="copyChangedFiles" parent="~/.framework/cli/commands/dev.ts"]
// CIL[DOC-MACRO purpose="Copies files from source to destination only when modified."]
// CIL[DOC-RESPONSIBILITY responsibility="Recursively mirror changed files while creating missing directories."]
// CIL[DOC-CONTEXT module="dev" layer="app-specific" related_files=".framework/cli/commands/dev.ts"]
// CIL[DOC-CONTRACT inputs="src: string, dest: string" outputs="void" errors="Throws on file system errors" side_effects="File I/O"]
// CIL[DOC-MICRO logic_summary="Read source entries; for directories ensure destination and recurse; for files compare mtime and copy if newer." notable_decisions="Uses require('fs') for mkdirSync and copyFileSync inside the function; compares mtime to decide whether to copy."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Copies files from the source directory to the destination directory only if they have changed. This function ensures that only modified files are copied, optimizing the file transfer process.
 *
 * @inputSpec
 *   src: string (required) — the source directory path.
 *   dest: string (required) — the destination directory path.
 * @outputSpec  void
 * @sideEffects file I/O
 * @stability   stable
 * @calls       readdirSync, existsSync, mkdirSync, statSync, copyFileSync
 * @cil-generated
 */
function copyChangedFiles(src: string, dest: string): void {
  const files = readdirSync(src, { withFileTypes: true })

  for (const entry of files) {
    const srcPath = resolve(src, entry.name)
    const destPath = resolve(dest, entry.name)

    if (entry.isDirectory()) {
      if (!existsSync(destPath)) {
        
        const { mkdirSync } = require('fs')
        mkdirSync(destPath, { recursive: true })
      }
      
      copyChangedFiles(srcPath, destPath)
    } else {
      
      const srcStat = statSync(srcPath)
      let needsCopy = true

      if (existsSync(destPath)) {
        const destStat = statSync(destPath)
        needsCopy = srcStat.mtime > destStat.mtime
      }

      if (needsCopy) {
        const { copyFileSync } = require('fs')
        copyFileSync(srcPath, destPath)
      }
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Copies files from source to destination only when modified.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/dev.ts:copyChangedFiles:function"]