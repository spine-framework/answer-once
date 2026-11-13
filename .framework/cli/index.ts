



import './env-loader.ts'
import { Command } from 'commander'
import { readFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
const program = new Command()

// Version: the spine-framework package.json when running from the package,
// otherwise the project's frozen manifest (vendored CLI copy).
function cliVersion(): string {
  const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../')
  try {
    const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
    if (pkg.name === 'spine-framework' && typeof pkg.version === 'string') return pkg.version
  } catch { /* fall through */ }
  try {
    const manifest = JSON.parse(readFileSync(join(process.cwd(), '.spine-manifest.json'), 'utf8'))
    if (typeof manifest.framework_version === 'string') return manifest.framework_version
  } catch { /* fall through */ }
  return '0.0.0'
}

program
  .name('spine-framework')
  .description('Spine Framework CLI — install, migrate, and manage your Spine instance')
  .version(cliVersion())
  .option('--account <id>', 'Override the account ID for this command')
const [
  { registerInitCommands },
  { registerMigrateCommands },
  { registerBootstrapCommands },
  { registerInstallAppCommands },
  { registerStatusCommands },
  { registerAuthCommands },
  { registerPipelineCommands },
  { registerItemCommands },
  { registerAgentCommands },
  { registerMigrationCommands },
  { registerDoctorCommands },
  { registerDevCommands },
  { registerTestCommands },
  { registerSystemCommands },
  { registerGenerateCommands },
  { registerCreateAppCommands },
  { registerValidateAppCommands },
  { registerValidateSchemaCommands },
  { registerUpgradeCommands },
] = await Promise.all([
  import('./commands/init.ts'),
  import('./commands/migrate.ts'),
  import('./commands/bootstrap.ts'),
  import('./commands/install-app.ts'),
  import('./commands/status.ts'),
  import('./commands/auth.ts'),
  import('./commands/pipelines.ts'),
  import('./commands/items.ts'),
  import('./commands/agents.ts'),
  import('./commands/migrations.ts'),
  import('./commands/doctor.ts'),
  import('./commands/dev.ts'),
  import('./commands/test.ts'),
  import('./commands/system.ts'),
  import('./commands/generate.ts'),
  import('./commands/create-app.ts'),
  import('./commands/validate-app.ts'),
  import('./commands/validate-schema.ts'),
  import('./commands/upgrade.ts'),
])
registerInitCommands(program)
registerMigrateCommands(program)
registerBootstrapCommands(program)
registerInstallAppCommands(program)
registerStatusCommands(program)
registerAuthCommands(program)
registerPipelineCommands(program)
registerItemCommands(program)
registerAgentCommands(program)
registerMigrationCommands(program)
registerDoctorCommands(program)
registerDevCommands(program)
registerTestCommands(program)
registerSystemCommands(program)
registerGenerateCommands(program)
registerCreateAppCommands(program)
registerValidateAppCommands(program)
registerValidateSchemaCommands(program)
registerUpgradeCommands(program)
program.parseAsync(process.argv).catch((error) => {
  console.error('CLI Error:', error.message)
  process.exit(1)
})