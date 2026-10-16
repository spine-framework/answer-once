// CIL[BEGIN stable_id="~/.framework/cli/commands/status.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/status.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Provide module-level imports for the status CLI command"]
// CIL[DOC-RESPONSIBILITY responsibility="Load required third-party and Node modules for filesystem, path and Supabase access"]
// CIL[DOC-CONTEXT module="status" layer="cli" related_files=".framework/cli/commands/status.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports type Command, filesystem utilities, path utilities, url helpers and the Supabase client"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
import type { Command } from 'commander'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
// CIL[DOC-VECTOR type="context" content="purpose='Provide module-level imports for the status CLI command'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/status.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/status.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/status.ts"]
// CIL[DOC-MACRO purpose="Expose the current module filename for path resolution"]
// CIL[DOC-RESPONSIBILITY responsibility="Derive __filename from import.meta.url"]
// CIL[DOC-CONTEXT module="status" layer="cli" related_files=".framework/cli/commands/status.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use fileURLToPath to convert import.meta.url to an absolute file path"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Expose the current module filename for path resolution'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/status.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/status.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/status.ts"]
// CIL[DOC-MACRO purpose="Expose the current module directory for path resolution"]
// CIL[DOC-RESPONSIBILITY responsibility="Derive __dirname from __filename"]
// CIL[DOC-CONTEXT module="status" layer="cli" related_files=".framework/cli/commands/status.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use dirname to get the directory portion of __filename"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Expose the current module directory for path resolution'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/status.ts:__dirname:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/status.ts:PACKAGE_ROOT:constant" type="constant" identity="PACKAGE_ROOT" parent="~/.framework/cli/commands/status.ts"]
// CIL[DOC-MACRO purpose="Locate the spine-framework package root directory"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the package root relative to the current file"]
// CIL[DOC-CONTEXT module="status" layer="cli" related_files=".framework/cli/commands/status.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolve three directories up from __dirname to reach the framework package root"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const PACKAGE_ROOT = resolve(__dirname, '../../../')
// CIL[DOC-VECTOR type="context" content="purpose='Locate the spine-framework package root directory'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/status.ts:PACKAGE_ROOT:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/status.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/status.ts"]
// CIL[DOC-MACRO purpose="Locate the current working directory of the CLI invocation"]
// CIL[DOC-RESPONSIBILITY responsibility="Capture the process current working directory"]
// CIL[DOC-CONTEXT module="status" layer="cli" related_files=".framework/cli/commands/status.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign process.cwd() to PROJECT_ROOT"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const PROJECT_ROOT = process.cwd()
// CIL[DOC-VECTOR type="context" content="purpose='Locate the current working directory of the CLI invocation'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/status.ts:PROJECT_ROOT:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/status.ts:registerStatusCommands:function" type="function" identity="registerStatusCommands" parent="~/.framework/cli/commands/status.ts"]
// CIL[DOC-MACRO purpose="Register the status CLI subcommand and render framework state"]
// CIL[DOC-RESPONSIBILITY responsibility="Add a status command to a Commander program that reports framework version, installed apps and migration state"]
// CIL[DOC-CONTEXT module="status" layer="cli" related_files=".framework/cli/commands/status.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="none" errors="file read errors, Supabase query errors" side_effects="reads files, queries spine_migrations, logs to stdout"]
// CIL[DOC-MICRO logic_summary="Define the status command, parse --json, load env, read package.json, scan custom/apps manifests, list framework migrations, query applied migrations via Supabase, then print human-readable or JSON status"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function registerStatusCommands(program: Command) {
  program
    .command('status')
    .description('Show installed apps and framework version')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      loadEnv()

      const supabaseUrl = process.env.SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      let frameworkVersion = 'unknown'
      try {
        const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
        frameworkVersion = pkg.version
      } catch {}

      const appsDir = join(PROJECT_ROOT, 'custom/apps')
      const installedApps: { slug: string; version?: string; hasManifest: boolean }[] = []

      if (existsSync(appsDir)) {
        for (const slug of readdirSync(appsDir)) {
          const appDir = join(appsDir, slug)
          const manifestPath = join(appDir, 'manifest.json')
          let version: string | undefined
          let hasManifest = false
          if (existsSync(manifestPath)) {
            hasManifest = true
            try {
              const m = JSON.parse(readFileSync(manifestPath, 'utf8'))
              version = m.version
            } catch {}
          }
          installedApps.push({ slug, version, hasManifest })
        }
      }

      let migrations: { applied: number; pending: number; files: string[] } = {
        applied: 0,
        pending: 0,
        files: [],
      }

      const fwMigrationsDir = existsSync(join(PROJECT_ROOT, '.framework/migrations'))
        ? join(PROJECT_ROOT, '.framework/migrations')
        : join(PACKAGE_ROOT, '.framework/migrations')

      if (existsSync(fwMigrationsDir)) {
        migrations.files = readdirSync(fwMigrationsDir)
          .filter(f => f.endsWith('.sql'))
          .sort()
      }

      if (supabaseUrl && serviceRoleKey) {
        try {
          const db = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
          })
          const { data } = await db
            .from('spine_migrations')
            .select('filename')
          const appliedSet = new Set((data || []).map((r: any) => r.filename))
          migrations.applied = migrations.files.filter(f => appliedSet.has(f)).length
          migrations.pending = migrations.files.length - migrations.applied
        } catch {
          migrations.pending = migrations.files.length
        }
      }

      if (opts.json) {
        console.log(JSON.stringify({ frameworkVersion, installedApps, migrations }, null, 2))
        return
      }

      console.log('\n── Spine Framework Status ─────────────────────────────')
      console.log(`   Version:      spine-framework@${frameworkVersion}`)
      console.log(`   Project:      ${PROJECT_ROOT}`)
      console.log()

      console.log('── Installed Apps ─────────────────────────────────────')
      if (installedApps.length === 0) {
        console.log('   No apps installed.')
        console.log('   Run: npx spine-framework install-app <app-package>')
      } else {
        for (const app of installedApps) {
          const ver = app.version ? `@${app.version}` : ''
          const manifest = app.hasManifest ? '' : ' (no manifest)'
          console.log(`   ✓ ${app.slug}${ver}${manifest}`)
        }
      }
      console.log()

      console.log('── Migrations ─────────────────────────────────────────')
      if (!supabaseUrl) {
        console.log('   (Set SUPABASE_URL in .env to check migration state)')
      } else {
        console.log(`   Applied:  ${migrations.applied}`)
        console.log(`   Pending:  ${migrations.pending}`)
        if (migrations.pending > 0) {
          console.log('   Run: npx spine-framework migrate')
        }
      }
      console.log()
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the status CLI subcommand and render framework state'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/status.ts:registerStatusCommands:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/status.ts:loadEnv:function" type="function" identity="loadEnv" parent="~/.framework/cli/commands/status.ts"]
// CIL[DOC-MACRO purpose="Load environment variables from .env"]
// CIL[DOC-RESPONSIBILITY responsibility="Read the project .env file and set missing variables in process.env"]
// CIL[DOC-CONTEXT module="status" layer="cli" related_files=".framework/cli/commands/status.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="mutates process.env"]
// CIL[DOC-MICRO logic_summary="Parse .env line by line, skipping comments and blank lines, and assign key=value pairs to process.env if not already set"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function loadEnv() {
  const envPath = join(PROJECT_ROOT, '.env')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) process.env[key] = val
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Load environment variables from .env'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/status.ts:loadEnv:function"]