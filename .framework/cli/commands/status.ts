import type { Command } from 'commander'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PACKAGE_ROOT = resolve(__dirname, '../../../')
const PROJECT_ROOT = process.cwd()

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