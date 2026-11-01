



// CIL[BEGIN stable_id="~/.framework/cli/index.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Import CLI dependencies and environment loader"]
// CIL[DOC-RESPONSIBILITY responsibility="Load required modules for CLI setup"]
// CIL[DOC-CONTEXT module="cli" layer="entry" related_files=".framework/cli/env-loader.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="loaded_modules" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports environment loader and Commander.js" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
import './env-loader.ts'
import { Command } from 'commander'
import { readFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
// CIL[DOC-VECTOR type="context" content="purpose='Import CLI dependencies and environment loader'; No verified external callers; imports: .framework/cli/env-loader.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/index.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/cli/index.ts:program:variable" type="variable" identity="program" parent="none"]
// CIL[DOC-MACRO purpose="Initialize CLI program with basic configuration"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure main CLI program instance"]
// CIL[DOC-CONTEXT module="cli" layer="entry" related_files=".framework/cli/env-loader.ts,.framework/cli/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="configured_program" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates Commander program with name, description, version, and account option" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Initialize CLI program with basic configuration'; No verified external callers; imports: .framework/cli/env-loader.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/index.ts:program:variable"]
// CIL[BEGIN stable_id="~/.framework/cli/index.ts:command_imports:block" type="block" identity="command_imports" parent="none"]
// CIL[DOC-MACRO purpose="Dynamically import all CLI command modules"]
// CIL[DOC-RESPONSIBILITY responsibility="Load command registration functions"]
// CIL[DOC-CONTEXT module="cli" layer="entry" related_files=".framework/cli/env-loader.ts,.framework/cli/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="command_modules" errors="import_failures" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses Promise.all to parallel import all command modules" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Dynamically import all CLI command modules'; No verified external callers; imports: .framework/cli/env-loader.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/index.ts:command_imports:block"]
// CIL[BEGIN stable_id="~/.framework/cli/index.ts:command_registrations:block" type="block" identity="command_registrations" parent="none"]
// CIL[DOC-MACRO purpose="Register all CLI commands with the program"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure CLI with all available commands"]
// CIL[DOC-CONTEXT module="cli" layer="entry" related_files=".framework/cli/env-loader.ts,.framework/cli/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="registered_commands" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls each command registration function with the program instance" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Register all CLI commands with the program'; No verified external callers; imports: .framework/cli/env-loader.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/index.ts:command_registrations:block"]
// CIL[BEGIN stable_id="~/.framework/cli/index.ts:error_handling:block" type="block" identity="error_handling" parent="none"]
// CIL[DOC-MACRO purpose="Parse CLI arguments and handle errors"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute CLI and handle uncaught errors"]
// CIL[DOC-CONTEXT module="cli" layer="entry" related_files=".framework/cli/env-loader.ts,.framework/cli/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="command_execution" errors="cli_errors" side_effects="process_exit"]
// CIL[DOC-MICRO logic_summary="Parses async command line arguments and exits on error" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
program.parseAsync(process.argv).catch((error) => {
  console.error('CLI Error:', error.message)
  process.exit(1)
})
// CIL[DOC-VECTOR type="context" content="purpose='Parse CLI arguments and handle errors'; No verified external callers; imports: .framework/cli/env-loader.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/index.ts:error_handling:block"]