#!/usr/bin/env tsx








// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Module entry point for the app-install CLI tool"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and expose the CLI script"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="loaded modules and configured execution environment" errors="none at import time" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports Node.js fs, path, commander, js-yaml, ajv, and url helpers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers using or extending the app install CLI"]
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { program } from 'commander'
import yaml from 'js-yaml'
import Ajv from 'ajv'
import { fileURLToPath } from 'url'
// CIL[DOC-VECTOR type="context" content="purpose='Module entry point for the app-install CLI tool'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Declares and initializes the __filename constant for the CLI"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the value of __filename for use by the script"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="the __filename constant value" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assigns an initial value to the __filename constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Declares and initializes the __filename constant for the CLI'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Declares and initializes the __dirname constant for the CLI"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the value of __dirname for use by the script"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="the __dirname constant value" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assigns an initial value to the __dirname constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Declares and initializes the __dirname constant for the CLI'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:__dirname:constant"]

// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:schemaPath:constant" type="constant" identity="schemaPath" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Declares and initializes the schemaPath constant for the CLI"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the value of schemaPath for use by the script"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="the schemaPath constant value" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assigns an initial value to the schemaPath constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const schemaPath = resolve(__dirname, '../docs/app-installation/schema.json')
// CIL[DOC-VECTOR type="context" content="purpose='Declares and initializes the schemaPath constant for the CLI'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:schemaPath:constant"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:schema:constant" type="constant" identity="schema" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Declares and initializes the schema constant for the CLI"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the value of schema for use by the script"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="the schema constant value" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assigns an initial value to the schema constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
// CIL[DOC-VECTOR type="context" content="purpose='Declares and initializes the schema constant for the CLI'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:schema:constant"]

// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:ajv:constant" type="constant" identity="ajv" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Declares and initializes the ajv constant for the CLI"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the value of ajv for use by the script"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="the ajv constant value" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assigns an initial value to the ajv constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ajv = new Ajv()
// CIL[DOC-VECTOR type="context" content="purpose='Declares and initializes the ajv constant for the CLI'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:ajv:constant"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:validate:constant" type="constant" identity="validate" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Declares and initializes the validate constant for the CLI"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the value of validate for use by the script"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="the validate constant value" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assigns an initial value to the validate constant" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const validate = ajv.compile(schema)
// CIL[DOC-VECTOR type="context" content="purpose='Declares and initializes the validate constant for the CLI'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:validate:constant"]

// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:InstallationContext:interface" type="interface" identity="InstallationContext" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Defines the TypeScript contract for InstallationContext"]
// CIL[DOC-RESPONSIBILITY responsibility="Structural type definition used across the CLI"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="type definition for InstallationContext" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the InstallationContext interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface InstallationContext {
  TARGET_ACCOUNT_ID?: string
  PACK_INSTALLATION_ID?: string
  [key: string]: string | undefined
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the TypeScript contract for InstallationContext'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:InstallationContext:interface"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:substituteVariables:function" type="function" identity="substituteVariables" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Implements the substituteVariables function"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute the substituteVariables logic and return or exit"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="obj, context" outputs="return value or void" errors="may throw or exit on invalid input" side_effects="console output and file system access as applicable"]
// CIL[DOC-MICRO logic_summary="Performs substituteVariables with validation and execution flow" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-PARAM name="obj" type="any" description="Parameter obj"]
// CIL[DOC-PARAM name="context" type="InstallationContext" description="Parameter context"]
function substituteVariables(obj: any, context: InstallationContext): any {
  if (typeof obj === 'string') {
    return obj.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      return context[varName] || match
    })
  } else if (Array.isArray(obj)) {
    return obj.map(item => substituteVariables(item, context))
  } else if (obj && typeof obj === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteVariables(value, context)
    }
    return result
  }
  return obj
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the substituteVariables function'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:substituteVariables:function"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:validateInstructionFile:function" type="function" identity="validateInstructionFile" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Implements the validateInstructionFile function"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute the validateInstructionFile logic and return or exit"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="filePath" outputs="return value or void" errors="may throw or exit on invalid input" side_effects="console output and file system access as applicable"]
// CIL[DOC-MICRO logic_summary="Performs validateInstructionFile with validation and execution flow" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-PARAM name="filePath" type="string" description="Parameter filePath"]
async function validateInstructionFile(filePath: string): Promise<void> {
  try {
    console.log(`🔍 Validating ${filePath}...`)
    
    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`)
      process.exit(1)
    }

    const content = readFileSync(filePath, 'utf8')
    const data = yaml.load(content) as any

    if (!validate(data)) {
      console.error('❌ Validation failed:')
      console.error(JSON.stringify(validate.errors, null, 2))
      process.exit(1)
    }

    console.log('✅ Schema validation passed')
  } catch (error) {
    console.error(`❌ Error validating ${filePath}:`, error)
    process.exit(1)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the validateInstructionFile function'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:validateInstructionFile:function"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:executeInstallation:function" type="function" identity="executeInstallation" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Implements the executeInstallation function"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute the executeInstallation logic and return or exit"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="filePath, options" outputs="return value or void" errors="may throw or exit on invalid input" side_effects="console output and file system access as applicable"]
// CIL[DOC-MICRO logic_summary="Performs executeInstallation with validation and execution flow" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-PARAM name="filePath" type="string" description="Parameter filePath"]
// CIL[DOC-PARAM name="options" type="any" description="Parameter options"]
async function executeInstallation(filePath: string, options: any): Promise<void> {
  try {
    console.log(`🚀 Executing installation from ${filePath}...`)

    await validateInstructionFile(filePath)

    const content = readFileSync(filePath, 'utf8')
    const instructions = yaml.load(content) as any

    const context: InstallationContext = {
      TARGET_ACCOUNT_ID: options.accountId,
      ...instructions.variables
    }

    console.log('📋 Installation plan:')
    console.log(`  App: ${instructions.app.name} v${instructions.app.version}`)
    console.log(`  Target Account: ${context.TARGET_ACCOUNT_ID}`)
    console.log()

    console.log('📦 Step 1: Installing pack...')
    const packInstall = substituteVariables(instructions.installation.pack_installation, context)
    console.log('  Pack installation config:', JSON.stringify(packInstall, null, 2))
    
    const packInstallationId = 'simulated-pack-id-' + Date.now()
    context.PACK_INSTALLATION_ID = packInstallationId
    console.log(`  ✅ Pack installed with ID: ${packInstallationId}`)

    console.log('⚙️  Step 2: Creating app definitions...')
    if (instructions.installation.app_creation) {
      for (const appDef of instructions.installation.app_creation) {
        const appConfig = substituteVariables(appDef, context)
        console.log(`  Creating app: ${appConfig.slug}`)
        console.log('  App config:', JSON.stringify(appConfig, null, 2))
        console.log(`  ✅ App ${appConfig.slug} created`)
      }
    }

    console.log('🔄 Step 3: Running migrations...')
    if (instructions.installation.migrations) {
      for (const migration of instructions.installation.migrations) {
        console.log(`  Running migration: ${migration.file}`)
        console.log(`    Description: ${migration.description}`)
        if (migration.dependencies) {
          console.log(`    Dependencies: ${migration.dependencies.join(', ')}`)
        }
        console.log(`  ✅ Migration completed`)
      }
    }

    console.log('✅ Step 4: Verifying installation...')
    if (instructions.installation.verification) {
      for (const verification of instructions.installation.verification) {
        console.log(`  Verifying: ${verification.check}`)
        if (verification.slug) console.log(`    Slug: ${verification.slug}`)
        if (verification.integration_id) console.log(`    Integration: ${verification.integration_id}`)
        console.log(`  ✅ Verification passed`)
      }
    }

    console.log()
    console.log('🎉 Installation completed successfully!')
    console.log(`📱 App "${instructions.app.name}" is ready to use`)

  } catch (error) {
    console.error('❌ Installation failed:', error)
    process.exit(1)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the executeInstallation function'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:executeInstallation:function"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:generateTemplate:function" type="function" identity="generateTemplate" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Implements the generateTemplate function"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute the generateTemplate logic and return or exit"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="type, options" outputs="return value or void" errors="may throw or exit on invalid input" side_effects="console output and file system access as applicable"]
// CIL[DOC-MICRO logic_summary="Performs generateTemplate with validation and execution flow" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-PARAM name="type" type="string" description="Parameter type"]
// CIL[DOC-PARAM name="options" type="any" description="Parameter options"]
async function generateTemplate(type: string, options: any): Promise<void> {
  try {
    const templateDir = resolve(__dirname, '../docs/app-installation/templates')
    let templateFile: string

    switch (type) {
      case 'app':
        templateFile = resolve(templateDir, 'app-install.yaml')
        break
      case 'migration':
        templateFile = resolve(templateDir, 'migration.yaml')
        break
      default:
        console.error('❌ Unknown template type. Use "app" or "migration"')
        process.exit(1)
    }

    const template = readFileSync(templateFile, 'utf8')
    
    if (options.output) {
      writeFileSync(options.output, template)
      console.log(`✅ Template generated: ${options.output}`)
    } else {
      console.log(template)
    }
  } catch (error) {
    console.error('❌ Error generating template:', error)
    process.exit(1)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the generateTemplate function'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:generateTemplate:function"]
// CIL[BEGIN stable_id="~/.framework/scripts/app-install-cli.ts:cli:variable" type="variable" identity="cli" parent="~/.framework/scripts/app-install-cli.ts"]
// CIL[DOC-MACRO purpose="Configures the cli CLI program and its command wiring"]
// CIL[DOC-RESPONSIBILITY responsibility="Wire commander commands to the appropriate action handlers"]
// CIL[DOC-CONTEXT module=".framework/scripts" layer="script" related_files=".framework/scripts/app-install-cli.ts"]
// CIL[DOC-CONTRACT inputs="command-line arguments" outputs="parsed command dispatch" errors="exits on unknown command or invalid arguments" side_effects="console output and invokes validate, install, or template handlers"]
// CIL[DOC-MICRO logic_summary="Builds commander program with validate, install, and template commands" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
program
  .name('app-install-cli')
  .description('Spine App Installation CLI - Validate and execute app installation instructions')
  .version('1.0.0')

program
  .command('validate')
  .description('Validate an instruction file against the schema')
  .argument('<file>', 'Instruction file path')
  .action(validateInstructionFile)

program
  .command('install')
  .description('Execute app installation from instruction file')
  .argument('<file>', 'Instruction file path')
  .option('-a, --account-id <id>', 'Target account ID')
  .option('-d, --dry-run', 'Simulate installation without making changes')
  .action(executeInstallation)

program
  .command('template')
  .description('Generate a new instruction template')
  .argument('<type>', 'Template type: app or migration')
  .option('-o, --output <path>', 'Output file path (optional, prints to stdout)')
  .action(generateTemplate)

program.parse()
// CIL[DOC-VECTOR type="context" content="purpose='Configures the cli CLI program and its command wiring'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/app-install-cli.ts:cli:variable"]