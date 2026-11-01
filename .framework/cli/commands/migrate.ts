// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/migrate.ts"]
// CIL[DOC-MACRO purpose="Provides the migrate command for applying database migrations to a Supabase project."]
// CIL[DOC-RESPONSIBILITY responsibility="Bootstraps imports and module context for the migrate CLI command."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports Commander type, fs, path, and url helpers and defines package and project root constants." notable_decisions="Package root is resolved relative to the installed package; project root is the current working directory."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]











import type { Command } from 'commander'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='Provides the migrate command for applying database migrations to a Supabase project.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Defines the current module file path."]
// CIL[DOC-RESPONSIBILITY responsibility="Derives __filename from the module import meta URL."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts import.meta.url to a file path and assigns to __filename." notable_decisions="none"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/migrate.ts"]
const __filename = fileURLToPath(import.meta.url)
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:__filename:constant"]
// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the current module file path.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Defines the current module directory."]
// CIL[DOC-RESPONSIBILITY responsibility="Derives __dirname from __filename."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Computes the directory of the current file and assigns to __dirname." notable_decisions="none"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/migrate.ts"]
const __dirname = dirname(__filename)
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:__dirname:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the current module directory.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-CONTEXT module="migrate" layer="cli" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-MACRO purpose="Defines the package root path."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolves the package root by walking up from the CLI directory."]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolves the package root three levels above the current module." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:PACKAGE_ROOT:constant" type="constant" identity="PACKAGE_ROOT" parent="~/.framework/cli/commands/migrate.ts"]
const PACKAGE_ROOT = resolve(__dirname, '../../../')
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:PACKAGE_ROOT:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the package root path.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Defines the project root path."]
// CIL[DOC-RESPONSIBILITY responsibility="Uses the current working directory as the project root."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets PROJECT_ROOT to process.cwd()." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/migrate.ts"]
const PROJECT_ROOT = process.cwd()
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:PROJECT_ROOT:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the project root path.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="Declares the migrate command options."]
// CIL[DOC-RESPONSIBILITY responsibility="Types the CLI flags and optional db password."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines dbPassword, dryRun, and frameworkOnly fields." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:MigrateOptions:interface" type="interface" identity="MigrateOptions" parent="~/.framework/cli/commands/migrate.ts"]
interface MigrateOptions {
  dbPassword?: string
  dryRun: boolean
  frameworkOnly: boolean
}
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:MigrateOptions:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Declares the migrate command options.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Applies pending SQL migration files to the Supabase database and tracks which have been applied."]
// CIL[DOC-RESPONSIBILITY responsibility="Executes migrations safely in transactions and records them in the tracking table."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="opts: { frameworkOnly?: boolean }" outputs="Promise<{ applied: number; skipped: number; failed: number } | null>" errors="Returns null if credentials missing; throws on invalid SUPABASE_URL, tracking-table failures, and file read errors; logs per migration statement errors to stderr, rolls back, increments failed once, and stops." side_effects="Connects to Postgres, creates _spine_migrations table, executes SQL, inserts migration records, writes to stdout/stderr."]
// CIL[DOC-MICRO logic_summary="Reads env, validates SUPABASE_URL is a credential-free hosted https://<project-ref>.supabase.co URL, derives the db host, builds a pg.Client config object, collects migration files, filters already applied, splits and runs SQL statements, updates _spine_migrations, and returns counts." notable_decisions="Skips missing or placeholder credentials; non-HTTPS, credential-bearing, non-supabase.co, ported, pathed, or query/hash URLs are rejected before any client exists; uses a SET to track applied files; runs each migration in a transaction; tracking CREATE and SELECT propagate so migrations never run against unknown tracking state; first file error rolls back and breaks; the connected client always ends via finally."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:runMigrations:function" type="function" identity="runMigrations" parent="~/.framework/cli/commands/migrate.ts"]
export async function runMigrations(opts: { frameworkOnly?: boolean } = {}): Promise<{ applied: number; skipped: number; failed: number } | null> {
  const supabaseUrl = process.env.SUPABASE_URL
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
    return null
  }

  const dbPassword = process.env.SUPABASE_DB_PASSWORD
  if (!dbPassword && !process.env.SUPABASE_DB_URL) {
    return null
  }

  let projectRef: string
  try {
    const parsed = new URL(supabaseUrl)
    if (
      parsed.protocol !== 'https:' ||
      parsed.username !== '' ||
      parsed.password !== '' ||
      parsed.port !== '' ||
      parsed.search !== '' ||
      parsed.hash !== '' ||
      (parsed.pathname !== '/' && parsed.pathname !== '') ||
      !/^[a-z0-9-]+\.supabase\.co$/.test(parsed.hostname)
    ) {
      throw new Error('not a hosted Supabase URL')
    }
    projectRef = parsed.hostname.split('.')[0]
  } catch {
    throw new Error('Invalid SUPABASE_URL — expected a URL like https://<project-ref>.supabase.co')
  }

  const migrationFiles = collectMigrations(opts.frameworkOnly ?? false)
  if (migrationFiles.length === 0) return { applied: 0, skipped: 0, failed: 0 }

  const { default: pg } = await import('pg')
  const client = new pg.Client(
    process.env.SUPABASE_DB_URL
      ? { connectionString: process.env.SUPABASE_DB_URL }
      : {
          user: 'postgres',
          password: dbPassword,
          host: `db.${projectRef}.supabase.co`,
          port: 5432,
          database: 'postgres',
        }
  )
  await client.connect()

  let applied = 0, skipped = 0, failed = 0

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _spine_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    const { rows } = await client.query('SELECT filename FROM _spine_migrations')
    const appliedMigrations = new Set<string>(rows.map((r: { filename: string }) => r.filename))

    for (const { name, path } of migrationFiles) {
      if (appliedMigrations.has(name)) {
        skipped++
        continue
      }

      const sql = readFileSync(path, 'utf8')
      process.stdout.write(`  Applying ${name}... `)
      const statements = splitSqlStatements(sql)

      try {
        await client.query('BEGIN')
        for (const stmt of statements) await client.query(stmt)
        await client.query(
          `INSERT INTO _spine_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING`,
          [name]
        )
        await client.query('COMMIT')
        console.log('✓')
        applied++
      } catch (err: any) {
        await client.query('ROLLBACK').catch(() => { /* non-fatal */ })
        console.log('✗')
        console.error(`    ${err.message}`)
        failed++
        break
      }
    }
  } finally {
    await client.end().catch(() => { /* non-fatal */ })
  }

  return { applied, skipped, failed }
}
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:runMigrations:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Applies pending SQL migration files to the Supabase database and tracks which have been applied.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="CLI action that collects, optionally dry-runs, and applies framework migrations."]
// CIL[DOC-RESPONSIBILITY responsibility="Validates environment, loads .env, handles dry run, and prints result."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="options: MigrateOptions" outputs="Promise<void>" errors="Exits process with status 1 on missing credentials or failed migrations." side_effects="Reads .env, writes to stdout/stderr, may set process.env, calls process.exit."]
// CIL[DOC-MICRO logic_summary="Loads .env, verifies SUPABASE_URL and password, collects migration files, dry-run lists them or calls runMigrations, reports counts, and exits." notable_decisions="Supports --db-password, --dry-run, and --framework-only; sets process.env.SUPABASE_DB_PASSWORD if passed; hard exits on missing env or failed migrations."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:migrateCommand:function" type="function" identity="migrateCommand" parent="~/.framework/cli/commands/migrate.ts"]
async function migrateCommand(options: MigrateOptions): Promise<void> {
  console.log('\nRunning Spine Framework migrations...\n')

  
  loadEnv()

  const envPath = join(PROJECT_ROOT, '.env')
  const envExists = existsSync(envPath)

  const supabaseUrl = process.env.SUPABASE_URL
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
    console.error('❌ SUPABASE_URL is not set.\n')
    if (!envExists) {
      console.error('  No .env file found in this directory.')
      console.error('  Run: npx spine-framework init   (to create the .env template)')
    } else {
      console.error('  Your .env file exists but SUPABASE_URL is missing or still set to a placeholder.')
      console.error('  Edit .env and set SUPABASE_URL to your project URL.')
    }
    console.error('\n  Get it from: https://supabase.com/dashboard/project/_/settings/api')
    process.exit(1)
  }

  const dbPassword = options.dbPassword || process.env.SUPABASE_DB_PASSWORD
  if (!dbPassword && !process.env.SUPABASE_DB_URL) {
    console.error('❌ SUPABASE_DB_PASSWORD is not set.\n')
    if (!envExists) {
      console.error('  No .env file found. Run: npx spine-framework init')
    } else {
      console.error('  Edit .env and add: SUPABASE_DB_PASSWORD=your-db-password')
      console.error('  Or pass it directly: npx spine-framework migrate --db-password <password>')
      console.error('  Or a full connection string (pooler/IPv4): SUPABASE_DB_URL=postgres://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres')
    }
    console.error('\n  Get it from: https://supabase.com/dashboard/project/_/settings/database')
    process.exit(1)
  }

  
  if (options.dbPassword) process.env.SUPABASE_DB_PASSWORD = options.dbPassword

  const migrationFiles = collectMigrations(options.frameworkOnly)

  if (migrationFiles.length === 0) {
    console.log('No migration files found.')
    return
  }

  console.log(`  Found ${migrationFiles.length} migration file(s)\n`)

  if (options.dryRun) {
    for (const file of migrationFiles) {
      console.log(`  [dry-run] Would apply: ${file.name}`)
    }
    console.log('\nDry run complete — no changes made.\n')
    return
  }

  const result = await runMigrations({ frameworkOnly: options.frameworkOnly })

  if (!result) {
    console.error('Could not connect: SUPABASE_URL or SUPABASE_DB_PASSWORD missing.')
    process.exit(1)
  }

  console.log(`\n  ${result.applied} applied, ${result.skipped} skipped, ${result.failed} failed`)

  if (result.failed > 0) {
    console.error('\nSome migrations failed. Check errors above.')
    process.exit(1)
  }

  console.log('\n✅ All migrations applied successfully!\n')
  console.log('Next steps:')
  console.log('  npm install && npm run dev:netlify')
  console.log('  (optional) npx spine-framework install-app <app-package> — only for')
  console.log('  additional app packs; core/admin apps are already seeded\n')
}
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:migrateCommand:function"]

// CIL[DOC-VECTOR type="context" content="purpose='CLI action that collects, optionally dry-runs, and applies framework migrations.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Registers the migrate command with the Commander program."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines CLI command options and delegates to migrateCommand."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void" errors="Logs error and exits on action failure." side_effects="Mutates the Commander program with a new command."]
// CIL[DOC-MICRO logic_summary="Adds the migrate command with --db-password, --dry-run, and --framework-only options and an async action." notable_decisions="Catches action errors, prints messages, and exits on failure; logs stack if SPINE_CLI_DEBUG."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:registerMigrateCommands:function" type="function" identity="registerMigrateCommands" parent="~/.framework/cli/commands/migrate.ts"]
export function registerMigrateCommands(program: Command) {
  program
    .command('migrate')
    .description('Apply pending database migrations to your Supabase project')
    .option('--db-password <password>', 'DB password (default: reads SUPABASE_DB_PASSWORD from .env)')
    .option('--dry-run', 'Show pending migrations without applying them', false)
    .option('--framework-only', 'Only apply .framework/migrations/, skip custom/', false)
    .action(async (opts) => {
      try {
        await migrateCommand(opts)
      } catch (err: any) {
        console.error('Error:', err.message)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }
    })
}
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:registerMigrateCommands:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Registers the migrate command with the Commander program.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Loads key=value pairs from the project .env file into process.env."]
// CIL[DOC-RESPONSIBILITY responsibility="Reads .env without overwriting existing environment variables."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="none (reads PROJECT_ROOT/.env)" outputs="void" errors="silently returns if .env is missing" side_effects="Mutates process.env."]
// CIL[DOC-MICRO logic_summary="Reads .env lines, skips comments and blank lines, parses the first = into key and value, and sets process.env if absent." notable_decisions="Ignores malformed lines; does not overwrite existing environment variables."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:loadEnv:function" type="function" identity="loadEnv" parent="~/.framework/cli/commands/migrate.ts"]
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
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:loadEnv:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Loads key=value pairs from the project .env file into process.env.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Collects SQL migration files from framework and custom directories."]
// CIL[DOC-RESPONSIBILITY responsibility="Sorts and returns file paths for pending migrations, optionally including custom migrations."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="frameworkOnly: boolean" outputs="Array<{ name: string; path: string }>" errors="none" side_effects="Reads directories via readdirSync."]
// CIL[DOC-MICRO logic_summary="Resolves the framework migrations directory, optionally adds custom/migrations, and returns sorted .sql entries." notable_decisions="Prefers PROJECT_ROOT/.framework/migrations over PACKAGE_ROOT; filters dotfiles and non-.sql files."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:collectMigrations:function" type="function" identity="collectMigrations" parent="~/.framework/cli/commands/migrate.ts"]
export function collectMigrations(frameworkOnly: boolean): { name: string; path: string }[] {
  const files: { name: string; path: string }[] = []

  
  const fwMigrationsDir = existsSync(join(PROJECT_ROOT, '.framework/migrations'))
    ? join(PROJECT_ROOT, '.framework/migrations')
    : join(PACKAGE_ROOT, '.framework/migrations')

  if (existsSync(fwMigrationsDir)) {
    readdirSync(fwMigrationsDir)
      .filter(f => f.endsWith('.sql') && !f.startsWith('.'))
      .sort()
      .forEach(f => files.push({ name: f, path: join(fwMigrationsDir, f) }))
  }

  
  if (!frameworkOnly) {
    const customMigrationsDir = join(PROJECT_ROOT, 'custom/migrations')
    if (existsSync(customMigrationsDir)) {
      readdirSync(customMigrationsDir)
        .filter(f => f.endsWith('.sql') && !f.startsWith('.'))
        .sort()
        .forEach(f => files.push({ name: f, path: join(customMigrationsDir, f) }))
    }
  }

  return files
}
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:collectMigrations:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Collects SQL migration files from framework and custom directories.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Splits SQL into executable statements while preserving dollar-quoted blocks."]
// CIL[DOC-RESPONSIBILITY responsibility="Removes single-line comments, splits on semicolons, restores protected dollar-quoted blocks, and returns trimmed statements."]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/commands/migrate.ts"]
// CIL[DOC-CONTRACT inputs="sql: string" outputs="Array<string>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Single-pass scanner tracking --, /* */, single-quote, double-quote, and dollar-tag state so ; only splits statements in normal state" notable_decisions="Regex layering was abandoned — apostrophes inside comments and semicolons inside literals broke both orderings; a state machine is the only correct approach."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrate.ts:splitSqlStatements:function" type="function" identity="splitSqlStatements" parent="~/.framework/cli/commands/migrate.ts"]
export function splitSqlStatements(sql: string): string[] {
  // Single-pass scanner: a ; only ends a statement in normal state. Comments
  // are dropped; string literals, quoted identifiers, and dollar-quoted blocks
  // are preserved verbatim.
  const statements: string[] = []
  let buf = ''
  let i = 0
  let inLine = false, inBlock = false, inSingle = false, inDouble = false
  let dollarTag: string | null = null

  while (i < sql.length) {
    const ch = sql[i], next = sql[i + 1]

    if (inLine) { if (ch === '\n') inLine = false; i++; continue }
    if (inBlock) { if (ch === '*' && next === '/') { inBlock = false; i += 2 } else i++; continue }

    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) { buf += dollarTag; i += dollarTag.length; dollarTag = null }
      else { buf += ch; i++ }
      continue
    }
    if (inSingle) {
      buf += ch
      if (ch === "'") { if (next === "'") { buf += next; i++ } else inSingle = false }
      i++; continue
    }
    if (inDouble) {
      buf += ch
      if (ch === '"') inDouble = false
      i++; continue
    }

    if (ch === '-' && next === '-') { inLine = true; i += 2; continue }
    if (ch === '/' && next === '*') { inBlock = true; i += 2; continue }
    if (ch === "'") { inSingle = true; buf += ch; i++; continue }
    if (ch === '"') { inDouble = true; buf += ch; i++; continue }
    if (ch === '$') {
      const m = sql.slice(i).match(/^\$[A-Za-z_]*\$/)
      if (m) { dollarTag = m[0]; buf += m[0]; i += m[0].length; continue }
    }
    if (ch === ';') {
      const s = buf.trim()
      if (s) statements.push(s + ';')
      buf = ''
      i++
      continue
    }
    buf += ch; i++
  }

  const tail = buf.trim()
  if (tail) statements.push(tail + ';')
  return statements
}
// CIL[END stable_id="~/.framework/cli/commands/migrate.ts:splitSqlStatements:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Splits SQL into executable statements while preserving dollar-quoted blocks.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
