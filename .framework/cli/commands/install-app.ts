/**
 * The RegistrationConfig interface defines the configuration options for user registration in the application. It allows customization of registration behavior, including role assignment and account strategies.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface RegistrationConfig {
  enabled: boolean
  default_role: string
  redirect_path: string
  account_strategy?: 'existing' | 'new' | 'choice'
  target_account?: string
  /** Account slug that becomes parent_id for accounts created via the 'new'
      strategy — e.g. 'spine-system' gives staff hierarchical visibility. */
  parent_account?: string
  /** When true, registration skips the personal/company choice and
      auto-names the workspace from the user's name/email. */
  default_workspace_name?: boolean
  allow_domain_join?: boolean
}
/**
 * The SpineConfig interface defines the configuration structure for application registration and role management within the CLI framework. It allows for flexible configuration of applications, roles, and their associated settings.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface SpineConfig {
  registration?: {
    default_app?: string
    default_role?: string
    allow_url_override?: boolean
    default_app_by_role?: Record<string, string>
    apps?: Record<string, {
      roles: string[]
      default_role: string
      path: string
      enabled: boolean
      account_strategy: 'existing' | 'new' | 'choice'
      target_account?: string
      parent_account?: string
      default_workspace_name?: boolean
      allow_domain_join?: boolean
    }>
  }
}
/**
 * @module   install-app
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module handles the installation of applications by managing file operations and executing necessary migrations. It serves as a command-line interface (CLI) command that integrates with the Supabase client for database interactions. INVARIANT: The application must exist in the specified directory before installation can proceed.
 *
 * @seeAlso migrate.js (provides migration functionality).
 * @seeAlso supabase-js (used for database interactions).
 *
 * @cil-generated
 */
















import type { Command } from 'commander'
import { existsSync, readFileSync, mkdirSync, cpSync, writeFileSync, realpathSync, statSync, readdirSync, rmSync } from 'fs'
import { resolve, dirname, join, basename, isAbsolute, sep } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import * as readline from 'readline'
import { createClient } from '@supabase/supabase-js'
import { runMigrations } from './migrate.js'
import { validateAppStructure } from './validate-app.js'
import { guardUpdateApp } from '../lib/update-app-guard.js'
import { generateValidationSchema } from '../../functions/_shared/schema-utils.ts'


/**
 * __filename is a constant that holds the resolved path of the current module's file URL. It exists to provide a reliable reference to the file's location in the filesystem.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       fileURLToPath
 * @cil-generated
 */
const __filename = fileURLToPath(import.meta.url)


/**
 * __dirname is a constant that holds the directory name of the current module, allowing for relative path resolution. It exists to facilitate file operations within the module's directory context.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       dirname
 * @cil-generated
 */
const __dirname = dirname(__filename)


/**
 * PROJECT_ROOT holds the current working directory of the process. It is used to determine the base path for file operations within the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const PROJECT_ROOT = process.cwd()


/**
 * SPINE_CONFIG_PATH defines the path to the spine configuration file, which is essential for the application's setup process. This constant ensures that the application can locate the configuration file reliably.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       join
 * @cil-generated
 */
const SPINE_CONFIG_PATH = join(PROJECT_ROOT, 'spine.config.json')


const APP_COPY_ENTRIES: readonly string[] = [
  'index.tsx', 'manifest.json', 'package.json', 'standalone.config.json',
  'pages', 'components', 'hooks', 'utils', 'lib', 'views', 'docs',
  'functions', 'api', 'seed', 'public', 'installer', 'mcp',
  'migrations', 'migrations-archive', 'tests', 'agent', 'decisions',
]

export const AGENT_SKILL_PREFIX_RE = /^[a-z][a-z0-9]{0,7}$/

function syncAppAgentAssets(appDir: string, appSlug: string): void {
  const agentDir = join(appDir, 'agent')
  if (!existsSync(agentDir)) return

  const stagedSkills = join(agentDir, 'skills')
  const stagedInstructions = join(agentDir, 'instructions')
  const hasSkills = existsSync(stagedSkills)
  const hasInstructions = existsSync(stagedInstructions)
  if (!hasSkills && !hasInstructions) return

  const manifest: Record<string, any> = JSON.parse(readFileSync(join(appDir, 'manifest.json'), 'utf8'))
  const prefix = manifest.agent?.skill_prefix

  if (hasSkills) {
    if (typeof prefix !== 'string' || !AGENT_SKILL_PREFIX_RE.test(prefix)) {
      throw new Error(`manifest.json agent.skill_prefix for "${appSlug}" is required (^[a-z][a-z0-9]{0,7}$) when the package ships agent/skills/`)
    }

    for (const other of readdirSync(join(PROJECT_ROOT, 'custom', 'apps'), { withFileTypes: true })) {
      if (!other.isDirectory() || other.name === appSlug) continue
      const otherManifest = join(PROJECT_ROOT, 'custom', 'apps', other.name, 'manifest.json')
      try {
        const m = JSON.parse(readFileSync(otherManifest, 'utf8'))
        if (m.agent?.skill_prefix === prefix) {
          throw new Error(`skill_prefix "${prefix}" is already used by app "${other.name}" — prefixes must be unique across installed apps`)
        }
      } catch (e: any) {
        if (e.message?.includes('skill_prefix')) throw e
      }
    }

    const skillsDest = join(PROJECT_ROOT, 'custom', '.devin', 'skills')
    for (const dir of readdirSync(stagedSkills, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      if (!dir.name.startsWith(`${prefix}_`)) {
        throw new Error(`agent/skills/${dir.name} does not match the declared prefix "${prefix}_"`)
      }
      const skillFile = join(stagedSkills, dir.name, 'SKILL.md')
      if (!existsSync(skillFile)) {
        throw new Error(`agent/skills/${dir.name} is missing SKILL.md`)
      }
      const nameMatch = /^name:\s*(.+)$/m.exec(readFileSync(skillFile, 'utf8'))
      if (!nameMatch || nameMatch[1].trim() !== dir.name) {
        throw new Error(`agent/skills/${dir.name}/SKILL.md name field must equal its directory name "${dir.name}"`)
      }
      cpSync(join(stagedSkills, dir.name), join(skillsDest, dir.name), { recursive: true })
      console.log(`    Skill installed: custom/.devin/skills/${dir.name}`)
    }
  }

  if (hasInstructions) {
    const instrDest = join(appDir, 'src', 'instructions')
    mkdirSync(instrDest, { recursive: true })
    cpSync(stagedInstructions, instrDest, { recursive: true })
    console.log(`    Instructions installed: custom/apps/${appSlug}/src/instructions/`)
  }
}

function removeAppAgentSkills(appDir: string, appSlug: string): void {
  try {
    const manifest: Record<string, any> = JSON.parse(readFileSync(join(appDir, 'manifest.json'), 'utf8'))
    const prefix = manifest.agent?.skill_prefix
    if (typeof prefix !== 'string' || !prefix) return
    const skillsDir = join(PROJECT_ROOT, 'custom', '.devin', 'skills')
    if (!existsSync(skillsDir)) return
    for (const dir of readdirSync(skillsDir, { withFileTypes: true })) {
      if (dir.isDirectory() && dir.name.startsWith(`${prefix}_`)) {
        rmSync(join(skillsDir, dir.name), { recursive: true, force: true })
        console.log(`  ✓ Removed skill custom/.devin/skills/${dir.name}`)
      }
    }
  } catch {
    console.log(`  ○ No agent.skill_prefix for "${appSlug}" — no skills to remove`)
  }
}

function isLocalPackageSpec(packageName: string): boolean {
  return packageName.startsWith('file:')
    || packageName.startsWith('.')
    || packageName.startsWith('/')
    || packageName.endsWith('.tgz')
}

function resolvePackageDirName(packageName: string): string {
  let spec = packageName
  if (spec.startsWith('file:')) spec = spec.slice(5)
  if (spec.endsWith('.tgz')) {
    const json = execSync(`tar -xOf "${spec}" package/package.json`, { cwd: PROJECT_ROOT, encoding: 'utf8' })
    return JSON.parse(json).name
  }
  if (spec.startsWith('.') || spec.startsWith('/')) {
    return JSON.parse(readFileSync(join(PROJECT_ROOT, spec, 'package.json'), 'utf8')).name
  }
  return packageName.replace(/@[^@/]+$/, '')
}

/**
 * Registers a command to install a Spine Framework app from npm and handles the installation process, including file copying and database migrations. This function ensures that the app is properly set up within the project environment.
 *
 * @macro       Command registration and installation handler for Spine Framework apps.
 * @micro       Executes npm install, manages file copying, and runs database migrations based on the installation outcome.
 * @inputSpec
 *   program: Command (required) — the command program instance to register the install-app command.
 * @outputSpec  Promise<void>
 * @throws      Error — if the package is not found at the expected path.
 * @sideEffects Installs npm packages, creates directories, copies files, and potentially modifies the database.
 * @stability   stable
 * @calls       execSync, existsSync, mkdirSync, cpSync, runMigrations, seedApp
 * @errorHandling Logs migration errors but continues execution.
 * @cil-generated
 */
export function registerInstallAppCommands(program: Command) {
  
  program
    .command('install-app <package>')
    .description('Install a Spine Framework app from npm')
    .option('--no-seed', 'Skip seeding types and roles into the database')
    .option('--reconcile-owned-types', 'Prompt to update manifest-owned types whose DB design_schema differs from the seed')
    .action(async (packageName: string, opts) => {
      console.log(`\nInstalling app: ${packageName}\n`)

      loadEnv()

      try {
        
        console.log(`  Installing ${packageName} via npm...`)
        execSync(`npm install ${packageName} --save`, {
          cwd: PROJECT_ROOT,
          stdio: 'inherit',
        })
        console.log('  ✓ npm install complete')

        
        const pkgSlug = resolvePackageDirName(packageName)
        const pkgPath = join(PROJECT_ROOT, 'node_modules', pkgSlug)

        if (!existsSync(pkgPath)) {
          throw new Error(`Package not found at ${pkgPath}`)
        }

        console.log(`  Package path: ${pkgPath}`)
        
        
        const appSlug = resolveAppSlug(pkgPath, pkgSlug)
        console.log(`  App slug: ${appSlug}`)

        
        const appDest = join(PROJECT_ROOT, 'custom/apps', appSlug)
        const isReinstall = existsSync(appDest)
        if (!isReinstall) {
          mkdirSync(appDest, { recursive: true })
        }

        
        console.log(`  Copying files from ${pkgPath} to ${appDest}`)

        for (const entry of APP_COPY_ENTRIES) {
          const src = join(pkgPath, entry)
          if (!existsSync(src)) continue

          
          if (entry === 'manifest.json' && isReinstall) {
            console.log(`    Preserving local manifest.json (use update-db-app to sync changes)`)
            continue
          }

          console.log(`    Copying ${entry}`)
          cpSync(src, join(appDest, entry), { recursive: true })
        }
        console.log(`  ✓ App files copied to custom/apps/${appSlug}/`)

        
        syncAppAgentAssets(appDest, appSlug)

        
        console.log('  Running migrations...')
        const migrateResult = await runMigrations({ frameworkOnly: false })
        if (migrateResult === null) {
          if (opts.seed !== false) {
            throw new Error('SUPABASE_URL or SUPABASE_DB_PASSWORD not set — cannot run migrations or seed (rerun with --no-seed to install files only)')
          }
          console.log('  ○ Skipping migrations (SUPABASE_DB_PASSWORD not set)')
        } else if (migrateResult.applied > 0) {
          console.log(`  ✓ Migrations: ${migrateResult.applied} applied, ${migrateResult.skipped} skipped`)
        } else {
          console.log(`  ✓ Migrations: up to date (${migrateResult.skipped} already applied)`)
        }
        if (migrateResult && migrateResult.failed > 0) {
          throw new Error(`${migrateResult.failed} migration(s) failed — aborting install before seed`)
        }

        
        if (opts.seed !== false) {
          await seedApp(appDest, appSlug, SPINE_CONFIG_PATH, { reconcileOwnedTypes: opts.reconcileOwnedTypes === true })
        } else {
          console.log('  ○ Seed skipped (--no-seed)')
        }

        
        const manifestPath = join(appDest, 'manifest.json')
        let manifest: Record<string, any> = {}
        try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) } catch {}
        if (opts.seed === false && manifest.registration && typeof manifest.registration.enabled === 'boolean') {
          updateRegistrationConfig(appSlug, manifest.registration, manifest.required_roles ?? [], SPINE_CONFIG_PATH, manifest.route_prefix ?? '/')
        }

        let installedVersion = 'unknown'
        try { installedVersion = JSON.parse(readFileSync(join(pkgPath, 'package.json'), 'utf8')).version ?? 'unknown' } catch {}

        console.log(`\n✅ ${appSlug} installed successfully! (${pkgSlug}@${installedVersion})\n`)
        console.log('Next: npm run assemble && netlify dev\n')

      } catch (err: any) {
        console.error(`\n❌ Install failed: ${err.message}`)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }
    })

  
  program
    .command('uninstall-app <package>')
    .description('Remove an installed Spine Framework app')
    .option('--keep-data', 'Keep seeded types and roles in the database', false)
    .action(async (packageName: string, opts) => {
      console.log(`\nUninstalling app: ${packageName}\n`)
      loadEnv()

      const pkgSlug = resolvePackageDirName(packageName)
      const pkgPath = join(PROJECT_ROOT, 'node_modules', pkgSlug)
      const appSlug = resolveAppSlug(pkgPath, pkgSlug)
      const appDir = join(PROJECT_ROOT, 'custom/apps', appSlug)

      try {
        if (existsSync(appDir)) {
          removeAppAgentSkills(appDir, appSlug)
          rmSync(appDir, { recursive: true, force: true })
          console.log(`  ✓ Removed custom/apps/${appSlug}/`)
        } else {
          console.log(`  ○ custom/apps/${appSlug}/ not found, nothing to remove`)
        }

        execSync(`npm uninstall ${pkgSlug}`, { cwd: PROJECT_ROOT, stdio: 'inherit' })
        console.log(`  ✓ npm uninstall complete`)

        console.log(`\n✅ ${appSlug} uninstalled.\n`)
      } catch (err: any) {
        console.error(`\n❌ Uninstall failed: ${err.message}`)
        process.exit(1)
      }
    })

  
  program
    .command('update-app <package>')
    .description('Update an installed Spine Framework app to a newer version')
    .option('--force', 'Overwrite local modifications after writing a backup to .spine/backups/', false)
    .action(async (packageName: string, opts: { force?: boolean }) => {
      console.log(`\nUpdating app: ${packageName}\n`)
      loadEnv()

      try {
        // Guard first — before npm install changes the lockfile or the
        // package. The baseline is the currently-installed version.
        const prePkgSlug = resolvePackageDirName(packageName)
        const prePkgPath = join(PROJECT_ROOT, 'node_modules', prePkgSlug)
        const preAppSlug = resolveAppSlug(prePkgPath, prePkgSlug)
        const preAppDest = join(PROJECT_ROOT, 'custom/apps', preAppSlug)

        if (existsSync(preAppDest)) {
          const outcome = guardUpdateApp({
            projectRoot: PROJECT_ROOT,
            pkgDirName: prePkgSlug,
            appSlug: preAppSlug,
            appDest: preAppDest,
            copyEntries: APP_COPY_ENTRIES,
            force: opts.force === true,
          })
          if (!outcome.proceed) {
            console.error(`\n❌ Update aborted — ${outcome.baseline}\n`)
            process.exit(1)
          }
        } else {
          console.log(`  ○ custom/apps/${preAppSlug}/ not found — nothing local to protect`)
        }

        execSync(`npm install ${isLocalPackageSpec(packageName) ? packageName : `${packageName}@latest`} --save`, {
          cwd: PROJECT_ROOT,
          stdio: 'inherit',
        })

        const pkgSlug = resolvePackageDirName(packageName)
        const pkgPath = join(PROJECT_ROOT, 'node_modules', pkgSlug)
        const appSlug = resolveAppSlug(pkgPath, pkgSlug)
        const appDest = join(PROJECT_ROOT, 'custom/apps', appSlug)

        if (!existsSync(appDest)) {
          mkdirSync(appDest, { recursive: true })
        }

        for (const entry of APP_COPY_ENTRIES) {
          const src = join(pkgPath, entry)
          if (existsSync(src)) {
            if (entry === 'manifest.json' && existsSync(join(appDest, 'manifest.json'))) continue
            cpSync(src, join(appDest, entry), { recursive: true })
          }
        }

        syncAppAgentAssets(appDest, appSlug)

        
        const manifestPath = join(appDest, 'manifest.json')
        let manifest: Record<string, any> = {}
        try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) } catch {}
        if (manifest.registration && typeof manifest.registration.enabled === 'boolean') {
          updateRegistrationConfig(appSlug, manifest.registration, manifest.required_roles ?? [], SPINE_CONFIG_PATH, manifest.route_prefix ?? '/')
        }

        let updatedVersion = 'unknown'
        try { updatedVersion = JSON.parse(readFileSync(join(pkgPath, 'package.json'), 'utf8')).version ?? 'unknown' } catch {}

        console.log(`\n✅ ${appSlug} updated! (${pkgSlug}@${updatedVersion})\n`)
      } catch (err: any) {
        console.error(`\n❌ Update failed: ${err.message}`)
        process.exit(1)
      }
    })

  
  program
    .command('update-db-app <slug>')
    .description('Sync local manifest.json changes to the database (no npm, no file changes)')
    .action(async (slug: string) => {
      console.log(`\nSyncing manifest to DB for: ${slug}\n`)
      loadEnv()

      const appDir = join(PROJECT_ROOT, 'custom/apps', slug)
      const manifestPath = join(appDir, 'manifest.json')

      if (!existsSync(manifestPath)) {
        console.error(`❌ No app found at custom/apps/${slug}/manifest.json`)
        console.error(`   Run install-app first: npx spine-framework install-app spine-framework-${slug}`)
        process.exit(1)
      }

      const supabaseUrl = process.env.SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
        process.exit(1)
      }

      let manifest: Record<string, any>
      try {
        manifest = preflightAppInputs(appDir, slug, SPINE_CONFIG_PATH)
      } catch (err: any) {
        console.error(`❌ ${err.message}`)
        process.exit(1)
      }

      const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

      const { data: existingApp, error: existingErr } = await db
        .from('apps')
        .select('config')
        .eq('slug', slug)
        .maybeSingle()
      if (existingErr) {
        console.error(`❌ Failed to read existing app config: ${existingErr.message}`)
        process.exit(1)
      }
      if (existingApp?.config !== undefined && existingApp?.config !== null && !isPlainObject(existingApp.config)) {
        console.error(`❌ apps.config for ${slug} is not an object — refusing to merge`)
        process.exit(1)
      }

      const { data: appRow, error: appErr } = await db
        .from('apps')
        .upsert(
          appRowPayload(manifest, slug, existingApp?.config ?? undefined),
          { onConflict: 'slug' }
        )
        .select('id')
        .single()

      if (appErr || !appRow?.id) {
        console.error(`❌ Failed to update app row: ${appErr?.message ?? 'no id returned'}`)
        process.exit(1)
      }

      console.log(`  ✓ apps row updated (route_prefix: ${manifest.route_prefix ?? '/' + slug}, config: ${manifest.config ? 'synced' : 'none'})`)

      
      try {
        await syncAppRegistration(db, slug, manifest)
      } catch (err: any) {
        console.error(`❌ Registration sync failed: ${err.message}`)
        process.exit(1)
      }

      console.log(`\n✅ ${slug} DB synced from local manifest.\n`)
      console.log(`Next: npm run assemble && netlify dev\n`)
    })

  program
    .command('seed-app <slug>')
    .description('Run the manifest seed block for a local app (no npm, no file changes)')
    .option('--reconcile-owned-types', 'Prompt to update manifest-owned types whose DB design_schema differs from the seed')
    .action(async (slug: string, opts) => {
      console.log(`\nSeeding app: ${slug}\n`)
      loadEnv()

      const appDir = join(PROJECT_ROOT, 'custom/apps', slug)
      if (!existsSync(join(appDir, 'manifest.json'))) {
        console.error(`❌ No app found at custom/apps/${slug}/manifest.json`)
        process.exit(1)
      }

      try {
        await seedApp(appDir, slug, SPINE_CONFIG_PATH, { reconcileOwnedTypes: opts.reconcileOwnedTypes === true })
      } catch (err: any) {
        console.error(`\n❌ Seed failed: ${err.message}`)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }

      console.log(`\n✅ ${slug} seeded.\n`)
    })
}

/**
 * Resolves the application slug from a given package path and package name. It attempts to read the slug from a manifest file, falling back to a modified package name if not found.
 *
 * @inputSpec
 *   pkgPath: string (required) — the file path to the package manifest.
 *   pkgName: string (required) — the name of the package to derive the slug from.
 * @outputSpec  string — the resolved application slug.
 * @sideEffects file I/O
 * @stability   stable
 * @calls       readFileSync, JSON.parse, join
 * @cil-generated
 */
function resolveAppSlug(pkgPath: string, pkgName: string): string {
  try {
    const manifest = JSON.parse(readFileSync(join(pkgPath, 'manifest.json'), 'utf8'))
    if (manifest.slug) return manifest.slug
  } catch {}
  
  const slug = pkgName.replace(/^spine-framework-/, '')
  return slug || pkgName // fallback to full name if replacement results in empty
}

/**
 * Loads environment variables from a .env file located at the project root if it exists. This function ensures that environment variables are set in the process environment for the application to use.
 *
 * @outputSpec  void
 * @sideEffects Reads from the file system to load environment variables.
 * @stability   stable
 * @calls       join, existsSync, readFileSync
 * @cil-generated
 */
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

// throws on missing environment variables and database errors instead of warning and continuing.
/**
 * Seeds the application database with initial data based on the provided manifest file. It ensures that necessary environment variables are set and handles the upsertion of application details into the database.
 *
 * @macro       Database seeding function for application setup.
 * @micro       Reads a manifest file to determine seed entries and performs upsert operations on the database.
 * @inputSpec
 *   appDir: string (required) — the directory where the application files are located.
 *   appSlug: string (required) — a unique identifier for the application.
 * @outputSpec  Promise<void>
 * @sideEffects Writes to the database and reads from the file system.
 * @stability   stable
 * @calls       createClient, db.from, db.upsert, db.select, readFileSync, existsSync, join
 * @errorHandling logs warnings for missing environment variables and database errors without throwing.
 * @cil-generated
 */
// All input validation happens before createClient so malformed manifests, seeds, or config produce zero DB clients or writes; declared seed entries are mandatory; legacy fallback and auto-added type_permissions files are optional but must be well-formed when present; types rows are never silently overwritten — a DB-vs-seed design_schema diff throws unless the manifest owns the slug and --reconcile-owned-types was passed; action and role slug lookups are fetched once per run and only when pipelines demand them
export async function seedApp(
  appDir: string,
  appSlug: string,
  configPath: string = SPINE_CONFIG_PATH,
  opts: { reconcileOwnedTypes?: boolean; assumeYes?: boolean } = {},
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to seed')
  }

  const reconcileOwnedTypes = opts.reconcileOwnedTypes === true
  const manifest = preflightAppInputs(appDir, appSlug, configPath)

  interface SeedEntry {
    file: string
    table: string
    conflict: string
    inject_app_id?: boolean
    ignore_duplicates?: boolean
    permissions_patch?: boolean
  }

  const declaredEntries: SeedEntry[] = Array.isArray(manifest.seed)
    ? manifest.seed.map((entry: SeedEntry) => ({ ...entry }))
    : []
  const declared = new Set<SeedEntry>(declaredEntries)

  const seedEntries: SeedEntry[] = Array.isArray(manifest.seed)
    ? declaredEntries
    : [

        { file: 'seed/roles.json',      table: 'roles',      conflict: 'slug' },
        { file: 'seed/types.json',       table: 'types',      conflict: 'kind,slug', inject_app_id: false },
        { file: 'seed/link-types.json',  table: 'link_types', conflict: 'app_id,slug' },
      ]


  const hasPermissionsPatch = seedEntries.some(e => e.permissions_patch)
  if (!hasPermissionsPatch) {
    seedEntries.push({
      file: 'seed/type_permissions.json',
      table: 'types',
      conflict: 'kind,slug',
      inject_app_id: false,
      permissions_patch: true,
    })
  }

  const prepared: { entry: SeedEntry; records: Record<string, any>[] }[] = []
  for (const entry of seedEntries) {
    const filePath = canonicalFileWithin(appDir, entry.file)
    if (!filePath) {
      if (declared.has(entry)) {
        throw new Error(`Declared seed file not found or escapes the app root: ${entry.file}`)
      }
      console.log(`  ○ ${entry.file} not found, skipping`)
      continue
    }

    let records: unknown
    try {
      records = JSON.parse(readFileSync(filePath, 'utf8'))
    } catch {
      throw new Error(`Could not parse seed file: ${entry.file}`)
    }
    if (!Array.isArray(records)) {
      throw new Error(`Seed file must contain a JSON array of records: ${entry.file}`)
    }
    for (const record of records) {
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        throw new Error(`Seed file contains a non-object record: ${entry.file}`)
      }
    }

    let preparedRecords = records as Record<string, any>[]
    if (entry.permissions_patch) {
      for (const record of preparedRecords) {
        validatePermissionsPatchRow(record, entry.file)
      }
    } else if (entry.table === 'types') {
      preparedRecords = preparedRecords.map(record => {
        if (!('design_schema' in record)) return { ...record }
        if (!isPlainObject(record.design_schema)) {
          const label = record.slug ?? record.name ?? JSON.stringify(record).slice(0, 40)
          throw new Error(`types seed "${label}": design_schema must be a non-null object`)
        }
        return { ...record, validation_schema: generateValidationSchema(record.design_schema) }
      })
    }
    prepared.push({ entry, records: preparedRecords })
  }

  // Deterministic dependency ordering — seeds apply in SEED_TABLE_ORDER rather
  // than manifest declaration order, so e.g. a trigger's pipeline_slug lookup
  // can never race its pipeline. permissions_patch ranks just after types (it
  // patches types rows) and unknown tables keep declared relative order last.
  // Array.prototype.sort is stable, so equal ranks preserve declaration order.
  prepared.sort((a, b) => seedTableRank(a.entry) - seedTableRank(b.entry))

  // Type slugs this app seeds (non-patch types entries) plus the conventional
  // seed/types.json — owned_types declarations resolve against this set, and
  // role slugs from this run's roles seeds backstop recipient validation.
  const seedTypeSlugs = new Set<string>()
  const seedRoleSlugs = new Set<string>()
  for (const { entry, records } of prepared) {
    const target = entry.table === 'types' && !entry.permissions_patch ? seedTypeSlugs
      : entry.table === 'roles' ? seedRoleSlugs
      : null
    if (!target) continue
    for (const record of records) {
      if (typeof record.slug === 'string' && record.slug) target.add(record.slug)
    }
  }
  const typesSeedPath = canonicalFileWithin(appDir, 'seed/types.json')
  if (typesSeedPath) {
    try {
      const extra: unknown = JSON.parse(readFileSync(typesSeedPath, 'utf8'))
      if (Array.isArray(extra)) {
        for (const row of extra) {
          if (row && typeof row === 'object' && typeof row.slug === 'string') seedTypeSlugs.add(row.slug)
        }
      }
    } catch { /* an undeclared malformed file is not this check's concern */ }
  }

  const ownedTypeSlugs = new Set<string>()
  if (reconcileOwnedTypes) {
    const owned = manifest.owned_types
    if (!Array.isArray(owned) || owned.length === 0) {
      throw new Error(`--reconcile-owned-types requires manifest.json to declare "owned_types" — a non-empty array of type slugs this app owns`)
    }
    for (const slug of owned) {
      if (!seedTypeSlugs.has(slug)) {
        throw new Error(`manifest.json owned_types declares "${slug}" but no record with that slug exists in the app's types seed (seed/types.json)`)
      }
      ownedTypeSlugs.add(slug)
    }
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: existingApp, error: existingErr } = await db
    .from('apps')
    .select('config')
    .eq('slug', appSlug)
    .maybeSingle()
  if (existingErr) {
    throw new Error(`Could not read existing app config for ${appSlug}: ${existingErr.message}`)
  }
  if (existingApp?.config !== undefined && existingApp?.config !== null && !isPlainObject(existingApp.config)) {
    throw new Error(`apps.config for ${appSlug} is not an object — refusing to merge`)
  }

  const { data: appRow, error: appErr } = await db
    .from('apps')
    .upsert(
      appRowPayload(manifest, appSlug, existingApp?.config ?? undefined),
      { onConflict: 'slug' }
    )
    .select('id')
    .single()

  if (appErr || !appRow?.id) {
    throw new Error(`Could not upsert app row for ${appSlug}: ${appErr?.message ?? 'no id returned'}`)
  }

  const appId = appRow.id
  console.log(`  ✓ App registered (id: ${appId}, config: ${manifest.config ? 'synced' : 'none'})`)

  // Lazily fetched once per run — stage_type and recipient lookups only happen
  // when a pipelines seed actually demands them.
  let cachedActionSlugs: Set<string> | null = null
  const getActionSlugs = async (): Promise<Set<string>> => {
    if (!cachedActionSlugs) {
      const { data, error } = await db.from('actions').select('slug')
      if (error) {
        throw new Error(`Could not read public.actions for pipeline stage validation: ${error.message}`)
      }
      cachedActionSlugs = new Set(
        (data ?? []).map((r: any) => r?.slug).filter((s: any) => typeof s === 'string')
      )
    }
    return cachedActionSlugs
  }
  let cachedRoleSlugs: Set<string> | null = null
  const getRoleSlugs = async (): Promise<Set<string>> => {
    if (!cachedRoleSlugs) {
      const { data, error } = await db.from('roles').select('slug')
      if (error) {
        throw new Error(`Could not read public.roles for recipient validation: ${error.message}`)
      }
      cachedRoleSlugs = new Set(
        (data ?? []).map((r: any) => r?.slug).filter((s: any) => typeof s === 'string')
      )
      // Roles seeded earlier in this same run are valid references even if the
      // read raced the write.
      for (const slug of seedRoleSlugs) cachedRoleSlugs.add(slug)
    }
    return cachedRoleSlugs
  }

  for (const { entry, records } of prepared) {
    if (records.length === 0) {
      console.log(`  ○ ${entry.file} is empty, skipping`)
      continue
    }


    if (entry.permissions_patch) {
      console.log(`  Patching record_permissions for ${records.length} type(s) from ${entry.file}...`)
      for (const record of records) {
        const { kind, slug, record_permissions: newPerms } = record


        const { data: existing, error: existingTypeErr } = await db
          .from('types')
          .select('id, design_schema')
          .eq('kind', kind)
          .eq('slug', slug)
          .maybeSingle()

        if (existingTypeErr) {
          throw new Error(`Could not read type ${kind}/${slug}: ${existingTypeErr.message}`)
        }
        if (!existing) {
          throw new Error(`Type ${kind}/${slug} not found in DB — cannot apply permissions patch (install the owning app first)`)
        }

        const existingSchema = (existing.design_schema ?? {}) as Record<string, any>
        const existingPerms = existingSchema.record_permissions ?? null


        if (JSON.stringify(existingPerms) === JSON.stringify(newPerms)) {
          console.log(`    ✓ ${kind}/${slug} record_permissions unchanged — skipped`)
          continue
        }


        console.log(`\n    Type: ${kind}/${slug}`)
        console.log(`    Existing record_permissions:`)
        console.log('    ' + JSON.stringify(existingPerms, null, 2).replace(/\n/g, '\n    '))
        console.log(`    New record_permissions:`)
        console.log('    ' + JSON.stringify(newPerms, null, 2).replace(/\n/g, '\n    '))

        const choice = opts.assumeYes ? 'r' : await prompt('    Replace? [R]eplace / [K]eep  → ')
        if (choice.trim().toLowerCase() !== 'r') {
          console.log(`    ○ Kept existing`)
          continue
        }


        const mergedSchema = { ...existingSchema, record_permissions: newPerms }
        const { error: patchErr } = await db
          .from('types')
          .update({
            design_schema: mergedSchema,
            validation_schema: generateValidationSchema(mergedSchema),
          })
          .eq('id', existing.id)

        if (patchErr) {
          throw new Error(`Could not patch ${kind}/${slug}: ${patchErr.message}`)
        }
        console.log(`    ✓ ${kind}/${slug} record_permissions updated`)
      }
      console.log(`  ✓ type_permissions patch complete`)
      continue
    }


    const injectAppId = entry.inject_app_id !== false // default true
    console.log(`  Seeding ${records.length} record(s) from ${entry.file} → ${entry.table}...`)

    for (const record of records) {
      const row = injectAppId ? { ...record, app_id: appId } : { ...record }

      // Types are global (conflict kind,slug) — fetch the existing row first so
      // a drifted design_schema fails loudly instead of being silently skipped
      // by ignoreDuplicates. Identical rows skip cleanly; differing rows throw
      // unless the slug is manifest-owned and --reconcile-owned-types was set.
      if (entry.table === 'types') {
        const { data: existingType, error: typeReadErr } = await db
          .from('types')
          .select('id, design_schema')
          .eq('kind', row.kind)
          .eq('slug', row.slug)
          .maybeSingle()
        if (typeReadErr) {
          throw new Error(`types "${row.kind}/${row.slug}": could not read existing row: ${typeReadErr.message}`)
        }
        if (existingType) {
          if (canonicalJson(existingType.design_schema) === canonicalJson(row.design_schema)) {
            console.log(`    ✓ ${row.kind}/${row.slug} already seeded — identical`)
            continue
          }
          if (ownedTypeSlugs.has(row.slug)) {
            await reconcileOwnedType(db, existingType, row, opts.assumeYes === true)
            continue
          }
          throw new Error(
            `Type conflict on ${row.kind}/${row.slug} (${entry.file}): the DB row's design_schema differs from the seed — ` +
            `refusing to overwrite. Inspect the diff and rerun with --reconcile-owned-types if this app owns the type.`
          )
        }
        // Absent — fall through to the upsert; ignoreDuplicates stays as the
        // race guard for a concurrent insert between the read and the write.
      }

      // Pipeline seeds are validated at install time so a bad stage_type or
      // notification recipient fails here, not at first trigger fire.
      if (entry.table === 'pipelines') {
        await validatePipelineSeedStages(row, entry.file, getActionSlugs, getRoleSlugs)
      }

      // Trigger seeds reference pipelines by slug — resolve to pipeline_id so
      // the trigger engine can dispatch. Pipelines must be seeded first.
      if (entry.table === 'triggers' && row.pipeline_slug && !row.pipeline_id) {
        const { data: pipeline, error: pipelineErr } = await db
          .from('pipelines')
          .select('id')
          .eq('slug', row.pipeline_slug)
          .eq('app_id', appId)
          .maybeSingle()
        if (pipelineErr) {
          throw new Error(`trigger "${row.name || row.slug}": could not resolve pipeline '${row.pipeline_slug}': ${pipelineErr.message}`)
        }
        if (!pipeline?.id) {
          throw new Error(`trigger "${row.name || row.slug}": pipeline '${row.pipeline_slug}' not found — seed pipelines first`)
        }
        row.pipeline_id = pipeline.id
        delete row.pipeline_slug
      }

      const { error } = await db
        .from(entry.table)
        .upsert(row, {
          onConflict: entry.conflict,
          ignoreDuplicates: entry.table === 'types' || entry.ignore_duplicates === true,
        })
      if (error) {
        const label = record.slug ?? record.name ?? JSON.stringify(record).slice(0, 40)
        throw new Error(`${entry.table} "${label}": ${error.message}`)
      }
    }

    console.log(`  ✓ ${entry.table} seeded`)
  }

  await syncAppRegistration(db, appSlug, manifest, configPath)
}

// local copy because the validate-app helper is module-private
function canonicalFileWithin(appDir: string, relPath: string): string | null {
  try {
    if (isAbsolute(relPath)) return null
    const root = realpathSync(appDir)
    const lexical = resolve(root, relPath)
    if (lexical !== root && !lexical.startsWith(root + sep)) return null
    const canonical = realpathSync(lexical)
    if (canonical !== root && !canonical.startsWith(root + sep)) return null
    if (!statSync(canonical).isFile()) return null
    return canonical
  } catch {
    return null
  }
}

function isPlainObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

// the local config is only read when the manifest declares a registration block, so data-only seeds never touch unrelated config; slug validation runs before all filesystem reads so hostile slugs like __proto__ can never reach config indexing
function preflightAppInputs(appDir: string, appSlug: string, configPath: string): Record<string, any> {
  if (typeof appSlug !== 'string' || !/^[a-z][a-z0-9-]*$/.test(appSlug)) {
    throw new Error(`Invalid app slug "${appSlug}" — expected /^[a-z][a-z0-9-]*$/`)
  }

  validateAppStructure(appDir)

  const manifest: Record<string, any> = JSON.parse(readFileSync(join(appDir, 'manifest.json'), 'utf8'))
  if (manifest.slug !== appSlug) {
    throw new Error(`manifest.json slug "${manifest.slug}" does not match app slug "${appSlug}"`)
  }
  if (manifest.config !== undefined && manifest.config !== null && !isPlainObject(manifest.config)) {
    throw new Error(`manifest.json config for "${appSlug}" must be an object`)
  }
  if (manifest.agent !== undefined && manifest.agent !== null) {
    if (!isPlainObject(manifest.agent)) {
      throw new Error(`manifest.json agent for "${appSlug}" must be an object`)
    }
    if (manifest.agent.skill_prefix !== undefined && !AGENT_SKILL_PREFIX_RE.test(manifest.agent.skill_prefix)) {
      throw new Error(`manifest.json agent.skill_prefix for "${appSlug}" must match ${AGENT_SKILL_PREFIX_RE}`)
    }
  }
  if (manifest.owned_types !== undefined) {
    if (!Array.isArray(manifest.owned_types) || manifest.owned_types.some((s: any) => typeof s !== 'string' || !s.trim())) {
      throw new Error(`manifest.json owned_types for "${appSlug}" must be an array of non-empty strings`)
    }
  }
  if (manifest.registration !== undefined && manifest.registration !== null) {
    const reg = manifest.registration
    if (!isPlainObject(reg)) {
      throw new Error(`manifest.json registration for "${appSlug}" must be an object`)
    }
    if (reg.enabled !== undefined && typeof reg.enabled !== 'boolean') {
      throw new Error(`manifest.json registration.enabled for "${appSlug}" must be a boolean`)
    }
    if (reg.enabled === true) {
      if (typeof reg.default_role !== 'string' || !reg.default_role.trim()) {
        throw new Error(`manifest.json registration.default_role for "${appSlug}" must be a non-empty string when registration is enabled`)
      }
      if (typeof reg.redirect_path !== 'string' || !reg.redirect_path.trim()) {
        throw new Error(`manifest.json registration.redirect_path for "${appSlug}" must be a non-empty string when registration is enabled`)
      }
    }
    loadSpineConfig(configPath)
  }
  return manifest
}

// empty maps and empty grant arrays remain valid explicit no-grant declarations
function validatePermissionsPatchRow(record: Record<string, any>, file: string): void {
  const crudActions = new Set(['create', 'read', 'update', 'delete'])
  const { kind, slug, record_permissions: perms } = record
  if (typeof kind !== 'string' || !kind.trim() || typeof slug !== 'string' || !slug.trim()) {
    throw new Error(`Malformed permissions patch entry in ${file} (requires kind, slug, record_permissions)`)
  }
  if (!isPlainObject(perms)) {
    throw new Error(`Malformed permissions patch entry in ${file} (record_permissions must be an object)`)
  }
  for (const [role, actions] of Object.entries(perms)) {
    if (!Array.isArray(actions) || actions.some(a => !crudActions.has(a))) {
      throw new Error(`Malformed permissions patch entry in ${file} (record_permissions.${role} must be an array of create/read/update/delete)`)
    }
  }
}

const SEED_TABLE_ORDER: readonly string[] = [
  'roles', 'types', 'link_types', 'actions',
  'ai_agents', 'prompt_configs', 'pipelines', 'triggers',
]

function seedTableRank(entry: { table: string; permissions_patch?: boolean }): number {
  if (entry.permissions_patch) return 1.5
  const idx = SEED_TABLE_ORDER.indexOf(entry.table)
  return idx === -1 ? SEED_TABLE_ORDER.length : idx
}

function canonicalJson(value: any): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value).filter(k => value[k] !== undefined).sort()
    return `{${keys.map(k => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

// views and other top-level keys are not itemized — the diff stays semantic rather than a raw JSON dump
function designSchemaDiffLines(dbSchema: any, seedSchema: any): string[] {
  const lines: string[] = []
  const dbFields = isPlainObject(dbSchema?.fields) ? dbSchema.fields : {}
  const seedFields = isPlainObject(seedSchema?.fields) ? seedSchema.fields : {}
  for (const name of Object.keys(seedFields)) {
    if (!(name in dbFields)) lines.push(`+ field "${name}" (added by seed)`)
    else if (canonicalJson(dbFields[name]) !== canonicalJson(seedFields[name])) lines.push(`~ field "${name}" (changed)`)
  }
  for (const name of Object.keys(dbFields)) {
    if (!(name in seedFields)) lines.push(`- field "${name}" (DB-only — preserved)`)
  }
  for (const key of ['record_permissions', 'functionality']) {
    if (canonicalJson(dbSchema?.[key] ?? null) !== canonicalJson(seedSchema?.[key] ?? null)) {
      lines.push(`~ ${key} changed`)
    }
  }
  return lines
}

// kept in sync with notify.ts — anything else must fail install rather than warn-skip at send time
const NOTIFICATION_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NOTIFICATION_ROLE_RE = /^role:(.+)$/

// actions and roles are fetched lazily so apps without pipelines never pay the lookups; a missing action slug means migration 053/054 has not run
async function validatePipelineSeedStages(
  record: Record<string, any>,
  file: string,
  getActionSlugs: () => Promise<Set<string>>,
  getRoleSlugs: () => Promise<Set<string>>,
): Promise<void> {
  const stages = record.stages
  if (stages === undefined || stages === null) return
  const label = record.slug ?? record.name ?? '(unnamed)'
  if (!Array.isArray(stages)) {
    throw new Error(`pipelines "${label}" (${file}): stages must be an array`)
  }
  if (stages.length === 0) return

  const actionSlugs = await getActionSlugs()
  let roleSlugs: Set<string> | null = null
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    const stageType = stage?.stage_type
    if (typeof stageType !== 'string' || !actionSlugs.has(stageType)) {
      throw new Error(
        `pipelines "${label}" (${file}) stage ${i}: unknown stage_type ${JSON.stringify(stageType)} — ` +
        `no matching row in public.actions (migrations 053/054 seed the built-ins; run migrations first)`
      )
    }

    if (stageType !== 'send_notification' && stageType !== 'send_email') continue
    const recipients = stage.config?.recipients
    if (!Array.isArray(recipients)) {
      throw new Error(`pipelines "${label}" (${file}) stage ${i} (${stageType}): config.recipients must be an array`)
    }
    for (const recipient of recipients) {
      const roleMatch = typeof recipient === 'string' ? recipient.match(NOTIFICATION_ROLE_RE) : null
      if (roleMatch) {
        roleSlugs ??= await getRoleSlugs()
        if (!roleSlugs.has(roleMatch[1])) {
          throw new Error(`pipelines "${label}" (${file}) stage ${i} (${stageType}): recipient "${recipient}" references a role that does not exist`)
        }
        continue
      }
      if (
        recipient === 'self' || recipient === 'owner' || recipient === 'watchers' ||
        (typeof recipient === 'string' && NOTIFICATION_UUID_RE.test(recipient)) ||
        (stageType === 'send_email' && typeof recipient === 'string' && recipient.includes('@'))
      ) continue
      throw new Error(
        `pipelines "${label}" (${file}) stage ${i} (${stageType}): invalid recipient ${JSON.stringify(recipient)} — ` +
        `expected 'role:<slug>', 'self', 'owner', 'watchers', a person UUID${stageType === 'send_email' ? ', or an email address' : ''}`
      )
    }
  }
}

async function reconcileOwnedType(db: any, existingType: Record<string, any>, record: Record<string, any>, assumeYes = false): Promise<void> {
  const { kind, slug } = record
  const dbSchema = isPlainObject(existingType.design_schema) ? existingType.design_schema : {}
  const seedSchema = isPlainObject(record.design_schema) ? record.design_schema : {}
  const dbFields = isPlainObject(dbSchema.fields) ? dbSchema.fields : {}
  const seedFields = isPlainObject(seedSchema.fields) ? seedSchema.fields : {}

  console.log(`\n    Owned type ${kind}/${slug} differs from the seed:`)
  for (const line of designSchemaDiffLines(dbSchema, seedSchema)) {
    console.log(`    ${line}`)
  }

  const choice = assumeYes ? 'u' : await prompt('    Apply seed schema? [U]pdate / [K]eep  → ')
  if (choice.trim().toLowerCase() !== 'u') {
    console.log(`    ○ Kept existing ${kind}/${slug}`)
    return
  }

  // DB-only fields survive; the seed wins shared fields and every other key.
  const mergedSchema = {
    ...dbSchema,
    ...seedSchema,
    fields: { ...dbFields, ...seedFields },
  }
  const { error } = await db
    .from('types')
    .update({
      design_schema: mergedSchema,
      validation_schema: generateValidationSchema(mergedSchema),
    })
    .eq('id', existingType.id)
  if (error) {
    throw new Error(`Could not reconcile type ${kind}/${slug}: ${error.message}`)
  }
  console.log(`    ✓ ${kind}/${slug} reconciled to seed schema`)
}

// config is omitted entirely when neither side declares one so upserts never erase existing config
function appRowPayload(manifest: Record<string, any>, appSlug: string, existingConfig?: Record<string, any>) {
  const manifestConfig = manifest.config ?? undefined
  const mergedConfig = manifestConfig !== undefined || existingConfig !== undefined
    ? { ...(existingConfig ?? {}), ...(manifestConfig ?? {}) }
    : undefined
  return {
    slug: appSlug,
    name: manifest.name ?? appSlug,
    description: manifest.description ?? '',
    version: manifest.version ?? '1.0.0',
    nav_items: manifest.nav_items ?? [],
    app_type: 'custom',
    source: 'npm',
    is_active: true,
    route_prefix: manifest.route_prefix ?? ('/' + appSlug),
    renderer: manifest.renderer ?? 'custom',

    required_roles: manifest.required_roles ?? (manifest.min_role ? [manifest.min_role] : []),

    min_role: manifest.required_roles?.[0] ?? manifest.min_role ?? null,
    preview_domain: manifest.preview_domain ?? null,
    prod_domain: manifest.prod_domain ?? null,
    prod_domains: manifest.prod_domains ?? null,
    preview_route_prefix: manifest.preview_route_prefix ?? null,
    prod_route_prefix: manifest.prod_route_prefix ?? null,
    config: mergedConfig,
    metadata: manifest.metadata ?? undefined,
  }
}

// undefined optional fields serialize as absent keys; explicit enabled:false persists a disabled policy instead of skipping sync
function registrationEntry(
  regConfig: RegistrationConfig,
  requiredRoles: string[],
  previous?: Record<string, any>,
  fallbackPath: string = '/',
) {
  if (regConfig.enabled !== true) {
    const prev = previous ?? {}
    const defaultRole = regConfig.default_role ?? prev.default_role ?? 'member'
    const roles = requiredRoles.length
      ? requiredRoles
      : (Array.isArray(prev.roles) && prev.roles.length ? prev.roles : [defaultRole])
    return {
      roles,
      default_role: defaultRole,
      path: regConfig.redirect_path ?? prev.path ?? fallbackPath,
      enabled: regConfig.enabled ?? prev.enabled ?? false,
      account_strategy: regConfig.account_strategy ?? prev.account_strategy ?? 'new',
      target_account: regConfig.target_account ?? prev.target_account,
      parent_account: regConfig.parent_account ?? prev.parent_account,
      default_workspace_name: regConfig.default_workspace_name ?? prev.default_workspace_name,
      allow_domain_join: regConfig.allow_domain_join ?? prev.allow_domain_join,
    }
  }
  const availableRoles: string[] = requiredRoles.length ? requiredRoles : [regConfig.default_role]
  return {
    roles: availableRoles,
    default_role: regConfig.default_role,
    path: regConfig.redirect_path,
    enabled: regConfig.enabled,
    account_strategy: regConfig.account_strategy || 'new',
    target_account: regConfig.target_account,
    parent_account: regConfig.parent_account,
    default_workspace_name: regConfig.default_workspace_name,
    allow_domain_join: regConfig.allow_domain_join,
  }
}

async function syncAppRegistration(db: any, appSlug: string, manifest: Record<string, any>, configPath: string = SPINE_CONFIG_PATH): Promise<void> {
  const regConfig = manifest.registration as RegistrationConfig | undefined
  if (regConfig === undefined || regConfig === null) return

  const requiredRoles: string[] = manifest.required_roles ?? []
  const fallbackPath: string = manifest.route_prefix ?? '/'

  const localPrevious = (() => {
    const prev = loadSpineConfig(configPath).registration?.apps?.[appSlug]
    return isPlainObject(prev) ? prev : undefined
  })()

  // Mirror the resolved registration policy onto apps.config.registration
  // so server-side flows (e.g. complete-registration) can derive
  // strategy/role/target/parent without trusting client-supplied values.
  const { data: existing, error: readErr } = await db
    .from('apps')
    .select('config')
    .eq('slug', appSlug)
    .maybeSingle()
  if (readErr) {
    throw new Error(`Could not read apps.config for ${appSlug}: ${readErr.message}`)
  }

  const existingConfig = existing?.config ?? {}
  if (!isPlainObject(existingConfig)) {
    throw new Error(`apps.config for ${appSlug} is not an object — cannot merge registration policy`)
  }
  const serverPrevious = isPlainObject(existingConfig.registration) ? existingConfig.registration : undefined
  const previous = localPrevious || serverPrevious
    ? { ...(localPrevious ?? {}), ...(serverPrevious ?? {}) }
    : undefined
  const regEntry = registrationEntry(regConfig, requiredRoles, previous, fallbackPath)

  const { error: cfgErr } = await db
    .from('apps')
    .update({ config: { ...existingConfig, registration: regEntry } })
    .eq('slug', appSlug)
  if (cfgErr) {
    throw new Error(`Could not persist registration config to apps.config: ${cfgErr.message}`)
  }

  updateRegistrationConfig(appSlug, regConfig, requiredRoles, configPath, fallbackPath, regEntry)
}

/**
 * Prompts the user with a question and returns their input as a promise. This function is used to facilitate interactive command-line interfaces.
 *
 * @inputSpec
 *   question: string (required) — The question to prompt the user with.
 * @outputSpec  Promise<string> — A promise that resolves to the user's input as a string.
 * @sideEffects none
 * @stability   stable
 * @calls       readline.createInterface
 * @cil-generated
 */
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

// malformed JSON propagates a parse error instead of silently resetting the config; non-object roots and non-object registration or registration.apps values throw a config-shape error.
/**
 * Loads the Spine configuration from a specified file path, returning a default structure if the file does not exist or is invalid. This function ensures that the application has a valid configuration to work with.
 *
 * @outputSpec  SpineConfig — an object representing the Spine configuration structure.
 * @sideEffects none
 * @stability   stable
 * @calls       existsSync, readFileSync, JSON.parse
 * @errorHandling returns a default configuration on JSON parsing failure.
 * @cil-generated
 */
function loadSpineConfig(configPath: string = SPINE_CONFIG_PATH): SpineConfig {
  if (!existsSync(configPath)) {
    return { registration: { apps: {} } }
  }
  const parsed = JSON.parse(readFileSync(configPath, 'utf8'))
  if (!isPlainObject(parsed)) {
    throw new Error(`Invalid spine.config.json at ${configPath}: root must be a JSON object`)
  }
  if (parsed.registration !== undefined && !isPlainObject(parsed.registration)) {
    throw new Error(`Invalid spine.config.json at ${configPath}: registration must be an object`)
  }
  if (parsed.registration?.apps !== undefined && !isPlainObject(parsed.registration.apps)) {
    throw new Error(`Invalid spine.config.json at ${configPath}: registration.apps must be an object`)
  }
  return parsed
}

/**
 * Saves the provided Spine configuration to a specified file path in JSON format. This function ensures that the configuration is persistently stored for future use.
 *
 * @inputSpec
 *   config: SpineConfig (required) — the configuration object to be saved.
 * @outputSpec  void
 * @sideEffects Writes the configuration to a file at SPINE_CONFIG_PATH.
 * @stability   stable
 * @calls       writeFileSync
 * @cil-generated
 */
function saveSpineConfig(config: SpineConfig, configPath: string = SPINE_CONFIG_PATH): void {
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
}

/**
 * Updates the registration configuration for a specific application in the spine configuration file. This function ensures that the application registration is properly set up with roles and other relevant settings.
 *
 * @inputSpec
 *   appSlug: string (required) — the unique identifier for the application.
 *   regConfig: RegistrationConfig (required) — configuration settings for the registration.
 *   requiredRoles: string[] (optional) — an array of roles required for the application.
 * @outputSpec  void
 * @sideEffects Writes to the spine configuration file and logs updates to the console.
 * @stability   stable
 * @calls       loadSpineConfig, saveSpineConfig
 * @cil-generated
 */
function updateRegistrationConfig(appSlug: string, regConfig: RegistrationConfig, requiredRoles: string[] = [], configPath: string = SPINE_CONFIG_PATH, fallbackPath: string = '/', resolvedEntry?: Record<string, any>): void {
  const config = loadSpineConfig(configPath)

  
  if (!config.registration) {
    config.registration = { apps: {} }
  }
  if (!config.registration.apps) {
    config.registration.apps = {}
  }

  
  const previous = isPlainObject(config.registration.apps[appSlug]) ? config.registration.apps[appSlug] : undefined
  const entry = resolvedEntry ?? registrationEntry(regConfig, requiredRoles, previous, fallbackPath)

  
  config.registration.apps[appSlug] = entry

  
  if (entry.enabled === true && !config.registration.default_app) {
    config.registration.default_app = appSlug
    config.registration.default_role = regConfig.default_role
  }

  
  if (config.registration.allow_url_override === undefined) {
    config.registration.allow_url_override = true
  }

  saveSpineConfig(config, configPath)
  console.log(`  ✓ Updated spine.config.json registration for ${appSlug}`)
  console.log(`  ✓ Available roles: ${entry.roles.join(', ')}`)
}
