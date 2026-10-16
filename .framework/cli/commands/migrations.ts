// CIL[BEGIN stable_id="~/.framework/cli/commands/migrations.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/migrations.ts"]
// CIL[DOC-MACRO purpose="CLI migration inspection commands for listing applied migrations and comparing local SQL files"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the migration CLI module and wires list/status subcommands"]
// CIL[DOC-CONTEXT module="cli/commands/migrations" layer="cli" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="Commander program" outputs="registered subcommands" errors="None at module level" side_effects="Imports and re-exports registerMigrationCommands"]
// CIL[DOC-MICRO logic_summary="Imports commander helpers, database utilities, and the registerMigrationCommands function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework developers"]




import type { Command } from 'commander'
import { readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { buildCliContext, printResult, handleError } from '../context.ts'
import { adminDb } from '../../functions/_shared/index.ts'
// CIL[DOC-VECTOR type="context" content="purpose='CLI migration inspection commands for listing applied migrations and comparing local SQL files'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/migrations.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/migrations.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/migrations.ts"]
// CIL[DOC-MACRO purpose="Resolve the current module filename from import.meta.url"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a CommonJS-style __filename value in ESM"]
// CIL[DOC-CONTEXT module="cli/commands/migrations" layer="utility" related_files=".framework/cli/commands/migrations.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="import.meta.url" outputs="absolute __filename" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="call fileURLToPath on import.meta.url" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the current module filename from import.meta.url'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/migrations.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/migrations.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/migrations.ts"]
// CIL[DOC-MACRO purpose="Resolve the current module directory name"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a CommonJS-style __dirname value in ESM"]
// CIL[DOC-CONTEXT module="cli/commands/migrations" layer="utility" related_files=".framework/cli/commands/migrations.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="__filename" outputs="absolute __dirname" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="call dirname on the resolved __filename" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the current module directory name'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/migrations.ts:__dirname:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/migrations.ts:registerMigrationCommands:function" type="function" identity="registerMigrationCommands" parent="~/.framework/cli/commands/migrations.ts"]
// CIL[DOC-MACRO purpose="Register migration list and status CLI subcommands"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose commands that query supabase_migrations and compare local SQL files"]
// CIL[DOC-CONTEXT module="cli/commands/migrations" layer="cli" related_files=".framework/cli/commands/migrations.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void" errors="Throws on missing migrations directory or failed DB queries" side_effects="Adds commands and options to the Commander program"]
// CIL[DOC-MICRO logic_summary="Define migrations command, add list and status subcommands with options, perform DB calls and console output" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function registerMigrationCommands(program: Command) {
  const migrations = program
    .command('migrations')
    .description('Database migration inspection')

  migrations
    .command('list')
    .description('List applied migrations from supabase schema_migrations')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        await buildCliContext()

        const { data, error } = await adminDb
          .schema('supabase_migrations' as any)
          .from('schema_migrations' as any)
          .select('version, name, executed_at')
          .order('version', { ascending: true })

        if (error) {
          throw new Error(
            `Could not query migrations: ${error.message}\n` +
            'Ensure SUPABASE_SERVICE_ROLE_KEY has access to the public schema.'
          )
        }

        printResult(data || [], { json: opts.json })
      } catch (err: any) {
        handleError(err)
      }
    })

  migrations
    .command('status')
    .description('Compare local migration files against applied migrations')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        await buildCliContext()

        const migrationsDir = resolve(__dirname, '../../migrations')

        if (!existsSync(migrationsDir)) {
          throw new Error(`Migrations directory not found: ${migrationsDir}`)
        }

        const localFiles = readdirSync(migrationsDir)
          .filter((f: string) => f.endsWith('.sql'))
          .sort()

        const { data: applied, error } = await adminDb
          .schema('supabase_migrations' as any)
          .from('schema_migrations' as any)
          .select('version')

        if (error) {
          throw new Error(`Could not query migrations: ${error.message}`)
        }

        const appliedVersions = new Set(
          (applied || []).map((r: any) => r.version)
        )

        const status = localFiles.map((file: string) => {
          const version = file.replace('.sql', '')
          const isApplied = appliedVersions.has(version)
          return {
            file,
            version,
            status: isApplied ? 'applied' : 'pending'
          }
        })

        if (opts.json) {
          console.log(JSON.stringify(status, null, 2))
        } else {
          console.log('\nMigration Status')
          console.log('─'.repeat(60))
          for (const m of status as Array<{file: string; status: string}>) {
            const icon = m.status === 'applied' ? '✓' : '○'
            console.log(`  ${icon} ${m.file.padEnd(40)} ${m.status}`)
          }
          const pending = status.filter(m => m.status === 'pending').length
          console.log(`\n  ${status.length - pending} applied, ${pending} pending`)
          console.log()
        }
      } catch (err: any) {
        handleError(err)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register migration list and status CLI subcommands'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/migrations.ts:registerMigrationCommands:function"]
