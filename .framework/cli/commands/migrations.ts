



import type { Command } from 'commander'
import { buildCliContext, printResult, handleError } from '../context.ts'
import { adminDb } from '../../functions/_shared/index.ts'
import { collectMigrations } from './migrate.ts'


export function registerMigrationCommands(program: Command) {
  const migrations = program
    .command('migrations')
    .description('Database migration inspection')

  migrations
    .command('list')
    .description('List applied migrations from _spine_migrations')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        await buildCliContext()

        const { data, error } = await adminDb
          .from('_spine_migrations' as any)
          .select('filename, applied_at')
          .order('filename', { ascending: true })

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

        const migrationFiles = collectMigrations(false)

        if (migrationFiles.length === 0) {
          throw new Error('Migrations directory not found (.framework/migrations)')
        }

        const { data: applied, error } = await adminDb
          .from('_spine_migrations' as any)
          .select('filename')

        if (error) {
          throw new Error(`Could not query migrations: ${error.message}`)
        }

        const appliedVersions = new Set(
          (applied || []).map((r: any) => r.filename)
        )

        const status = migrationFiles.map(({ name }) => {
          const version = name.replace('.sql', '')
          const isApplied = appliedVersions.has(name)
          return {
            file: name,
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
