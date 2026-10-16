// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Provide module-level imports for the init CLI command"]
// CIL[DOC-RESPONSIBILITY responsibility="Load required third-party and Node modules for filesystem, path, URL and child process access"]
// CIL[DOC-CONTEXT module="init" layer="cli" related_files=".framework/cli/commands/init.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports type Command, filesystem utilities, path helpers, URL helpers and child process execution" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
import type { Command } from 'commander'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, statSync, cpSync, readFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

// CIL[DOC-VECTOR type="context" content="purpose='Provide module-level imports for the init CLI command'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/init.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="Expose the current module filename for path resolution"]
// CIL[DOC-RESPONSIBILITY responsibility="Derive __filename from import.meta.url"]
// CIL[DOC-CONTEXT module="init" layer="cli" related_files=".framework/cli/commands/init.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use fileURLToPath to convert import.meta.url to an absolute file path" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Expose the current module filename for path resolution'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/init.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="Expose the current module directory for path resolution"]
// CIL[DOC-RESPONSIBILITY responsibility="Derive __dirname from __filename"]
// CIL[DOC-CONTEXT module="init" layer="cli" related_files=".framework/cli/commands/init.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use dirname to get the directory portion of __filename" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Expose the current module directory for path resolution'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/init.ts:__dirname:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:PACKAGE_ROOT:constant" type="constant" identity="PACKAGE_ROOT" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="Locate the spine-framework package root directory"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the package root relative to the current file"]
// CIL[DOC-CONTEXT module="init" layer="cli" related_files=".framework/cli/commands/init.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolve three directories up from __dirname to reach the framework package root" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const PACKAGE_ROOT = resolve(__dirname, '../../../')
// CIL[DOC-VECTOR type="context" content="purpose='Locate the spine-framework package root directory'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/init.ts:PACKAGE_ROOT:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="Locate the current working directory of the CLI invocation"]
// CIL[DOC-RESPONSIBILITY responsibility="Capture the process current working directory"]
// CIL[DOC-CONTEXT module="init" layer="cli" related_files=".framework/cli/commands/init.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign process.cwd() to PROJECT_ROOT" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const PROJECT_ROOT = process.cwd()
// CIL[DOC-VECTOR type="context" content="purpose='Locate the current working directory of the CLI invocation'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/init.ts:PROJECT_ROOT:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:registerInitCommands:function" type="function" identity="registerInitCommands" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="Register the init CLI subcommand and scaffold a new Spine Framework project"]
// CIL[DOC-RESPONSIBILITY responsibility="Add an init command to a Commander program that scaffolds .framework, custom workspace, config, scripts and project files"]
// CIL[DOC-CONTEXT module="init" layer="cli" related_files=".framework/cli/commands/init.ts"]
// CIL[DOC-CONTRACT inputs="program: Command (required)" outputs="Promise<void>" errors="process.exit(1) on uncaught init errors" side_effects="Creates directories, copies .framework/ and config files, writes package.json, .env and .gitignore, logs to stdout"]
// CIL[DOC-MICRO logic_summary="Define the init command, parse --force, check existing package.json and .framework, copy .framework and custom/devin assets, copy config and scripts, write netlify.toml, copy the neutral spine.config.neutral.json template as spine.config.json, merge and write package.json, write .env and .gitignore, then log success or failure" notable_decisions="Merges existing package.json dependencies into the scaffolded template; does not overwrite unless --force is set; leaves .env blank for the user to fill; new projects receive the neutral config (empty apps, no default_app) rather than the monorepo's multi-app spine.config.json"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function registerInitCommands(program: Command) {
  program
    .command('init')
    .description('Scaffold a new Spine Framework project in the current directory')
    .option('--force', 'Overwrite existing files', false)
    .action(async (opts) => {
      console.log('\nInitializing Spine Framework project...\n')

      
      const existingPkg = join(PROJECT_ROOT, 'package.json')
      if (existsSync(existingPkg) && !opts.force) {
        try {
          const pkg = JSON.parse(readFileSync(existingPkg, 'utf8'))
          const hasSpine = pkg.dependencies?.['spine-framework'] || pkg.devDependencies?.['spine-framework']
          const hasFramework = existsSync(join(PROJECT_ROOT, '.framework'))
          if (!hasSpine && !hasFramework && pkg.name !== 'spine-framework') {
            console.warn('Warning: package.json exists but does not appear to be a Spine project.')
            console.warn('Use --force to overwrite. Continuing with scaffold...\n')
          }
        } catch {}
      }

      try {
        
        console.log('  Copying .framework/...')
        const fwSrc = join(PACKAGE_ROOT, '.framework')
        const fwDest = join(PROJECT_ROOT, '.framework')
        if (!existsSync(fwDest)) {
          cpSync(fwSrc, fwDest, { recursive: true })
          console.log('  ✓ .framework/ copied')
        } else {
          console.log('  ○ .framework/ already exists, skipping')
        }

        
        console.log('  Creating custom/ workspace...')
        const customDirs = [
          'custom/apps',
          'custom/functions',
          'custom/components',
          'custom/migrations',
          'custom/tests',
        ]
        for (const dir of customDirs) {
          const full = join(PROJECT_ROOT, dir)
          if (!existsSync(full)) {
            mkdirSync(full, { recursive: true })
          }
        }
        
        const devinSrc = join(PACKAGE_ROOT, 'custom/.devin')
        const devinDest = join(PROJECT_ROOT, 'custom/.devin')
        if (existsSync(devinSrc) && !existsSync(devinDest)) {
          cpSync(devinSrc, devinDest, { recursive: true })
        }
        console.log('  ✓ custom/ workspace created')

        
        console.log('  Copying config files...')
        const configSrc = join(PACKAGE_ROOT, 'config')
        const configDest = join(PROJECT_ROOT, 'config')
        if (existsSync(configSrc) && !existsSync(configDest)) {
          cpSync(configSrc, configDest, { recursive: true })
          console.log('  ✓ config/ copied')
        }

        
        console.log('  Copying scripts/...')
        const scriptsSrc = join(PACKAGE_ROOT, 'scripts')
        const scriptsDest = join(PROJECT_ROOT, 'scripts')
        if (existsSync(scriptsSrc) && !existsSync(scriptsDest)) {
          cpSync(scriptsSrc, scriptsDest, { recursive: true })
          console.log('  ✓ scripts/ copied')
        }

        
        const netlifyTomlSrc = join(PACKAGE_ROOT, 'netlify.toml')
        if (existsSync(netlifyTomlSrc) && !existsSync(join(PROJECT_ROOT, 'netlify.toml'))) {
          copyFileSync(netlifyTomlSrc, join(PROJECT_ROOT, 'netlify.toml'))
          console.log('  ✓ netlify.toml copied')
        }

        
        // New projects get the neutral template — empty apps/no default app —
        // not the monorepo's own multi-app spine.config.json.
        const spineConfigSrc = join(PACKAGE_ROOT, '.framework', 'templates', 'spine.config.neutral.json')
        const spineConfigDest = join(PROJECT_ROOT, 'spine.config.json')
        if (existsSync(spineConfigSrc) && !existsSync(spineConfigDest)) {
          copyFileSync(spineConfigSrc, spineConfigDest)
          console.log('  ✓ spine.config.json copied (neutral template)')
        } else if (existsSync(spineConfigDest) && !JSON.parse(readFileSync(spineConfigDest, 'utf8'))?.registration?.default_app_by_role) {
          console.log('  ⚠ Existing spine.config.json does not have default_app_by_role; consider updating it')
        }

        
        console.log('  Writing package.json...')
        const projectName = PROJECT_ROOT.split('/').pop() || 'my-spine-project'
        const pkgJson = {
          name: projectName,
          version: '0.1.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'netlify dev',
            assemble: 'bash scripts/assemble.sh',
            'assemble:frontend': 'bash scripts/assemble-frontend.sh',
            'assemble:functions': 'bash scripts/assemble-functions.sh',
            build: 'npm run assemble && vite build --config config/vite.config.ts',
            verify: 'bash scripts/verify-integrity.sh',
            test: 'vitest run',
          },
          dependencies: {
            'spine-framework': `^${getPackageVersion()}`,
          },
          devDependencies: {
            '@netlify/functions': '^2.8.2',
            '@supabase/supabase-js': '^2.49.1',
            '@tailwindcss/typography': '^0.5.19',
            '@types/node': '^22.12.0',
            '@types/react': '^18.3.18',
            '@types/react-dom': '^18.3.5',
            '@vitejs/plugin-react': '^4.3.4',
            'autoprefixer': '^10.4.20',
            'postcss': '^8.5.1',
            'tailwindcss': '^3.4.17',
            'tsx': '^4.21.0',
            'typescript': '~5.6.2',
            'vite': '^6.0.11',
            'vitest': '^2.1.9',
          },
        }
        
        let finalPkg = pkgJson
        if (existsSync(join(PROJECT_ROOT, 'package.json'))) {
          try {
            const existing = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf8'))
            finalPkg = {
              ...pkgJson,
              name: existing.name || pkgJson.name,
              version: existing.version || pkgJson.version,
              
              dependencies: { ...existing.dependencies, ...pkgJson.dependencies },
              
              devDependencies: { ...pkgJson.devDependencies, ...existing.devDependencies },
            }
          } catch {}
        }
        writeFileSync(
          join(PROJECT_ROOT, 'package.json'),
          JSON.stringify(finalPkg, null, 2) + '\n'
        )
        console.log('  ✓ package.json written')

        
        console.log('  Writing .env template...')
        if (!existsSync(join(PROJECT_ROOT, '.env'))) {
          const envTemplate = [
            '# Supabase credentials',
            '# Get these from: Supabase Dashboard → Your Project → Settings → API',
            '# Replace the values below — do not leave them blank or as placeholders',
            'SUPABASE_URL=',
            'SUPABASE_ANON_KEY=',
            'SUPABASE_SERVICE_ROLE_KEY=',
            'SUPABASE_DB_PASSWORD=',
            '',
            '# Vite (browser-safe) — copy from above',
            'VITE_SUPABASE_URL=',
            'VITE_SUPABASE_ANON_KEY=',
            'VITE_DB_SCHEMA=public',
            'VITE_APP_NAME=Spine',
            '',
          ].join('\n')
          writeFileSync(join(PROJECT_ROOT, '.env'), envTemplate)
          console.log('  ✓ .env template written')
        } else {
          console.log('  ○ .env already exists, skipping')
        }

        
        if (!existsSync(join(PROJECT_ROOT, '.gitignore'))) {
          const gitignore = [
            'node_modules',
            'dist',
            '.assembled/',
            '.netlify',
            '.env',
            '.env.local',
            '.env.production',
            '*.log',
            '.DS_Store',
            '*.tsbuildinfo',
            '.vite',
          ].join('\n') + '\n'
          writeFileSync(join(PROJECT_ROOT, '.gitignore'), gitignore)
          console.log('  ✓ .gitignore written')
        }

        
        let pkgVersion = 'unknown'
        try {
          const pkgJson = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
          pkgVersion = pkgJson.version ?? 'unknown'
        } catch { /* non-fatal */ }

        console.log(`\n✅ Project initialized! (spine-framework@${pkgVersion})\n`)
        console.log('Next steps:')
        console.log('  1. Edit .env with your Supabase credentials')
        console.log('  2. Run: npm install   (installs vite, typescript, and other dev tools)')
        console.log('  3. Run: npx spine-framework migrate')
        console.log('  4. Run: npm run assemble && netlify dev')
        console.log()

      } catch (err: any) {
        console.error('\n❌ Init failed:', err.message)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the init CLI subcommand and scaffold a new Spine Framework project'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/init.ts:registerInitCommands:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:getPackageVersion:function" type="function" identity="getPackageVersion" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="Return the installed spine-framework package version"]
// CIL[DOC-RESPONSIBILITY responsibility="Read package.json from PACKAGE_ROOT and return its version, defaulting to 0.3.0 on failure"]
// CIL[DOC-CONTEXT module="init" layer="cli" related_files=".framework/cli/commands/init.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="reads package.json from PACKAGE_ROOT"]
// CIL[DOC-MICRO logic_summary="Read package.json, parse JSON and return pkg.version or the default 0.3.0" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function getPackageVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')
    )
    return pkg.version || '0.3.0'
  } catch {
    return '0.3.0'
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Return the installed spine-framework package version'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/init.ts:getPackageVersion:function"]
