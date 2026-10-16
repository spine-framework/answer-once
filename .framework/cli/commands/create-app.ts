








// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Defines the create-app CLI command module, importing dependencies and wiring registration."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the create-app command implementation and exports for CLI registration."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="commander program and CLI arguments" outputs="registered create-app command" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports Commander, fs utilities, path helpers, and shared adminDb; re-exports command registration function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="cli-developers"]
import type { Command } from 'commander'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { adminDb } from '../../functions/_shared/index.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Defines the create-app CLI command module, importing dependencies and wiring registration.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:module_header:module_header"]

/**
 * __filename is a constant that holds the resolved file path of the current module, allowing for accurate file system operations and references. It exists to provide a reliable way to access the file's location in the context of ES modules.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       fileURLToPath
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Resolve the current module file path for ES module file system references."]
// CIL[DOC-RESPONSIBILITY responsibility="Store the absolute file path of this module."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/cli/commands/create-app.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="import.meta.url" outputs="string absolute file path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls fileURLToPath with import.meta.url to produce an absolute path string." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the current module file path for ES module file system references.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:__filename:constant"]
/**
 * __dirname is a constant that holds the directory name of the current module, allowing for relative file path resolution. It exists to facilitate file operations within the module's directory context.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       dirname
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Resolve the current module directory for relative path resolution."]
// CIL[DOC-RESPONSIBILITY responsibility="Store the directory path of this module."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/cli/commands/create-app.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="__filename" outputs="string directory path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls dirname on the __filename constant to get the module directory." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the current module directory for relative path resolution.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:__dirname:constant"]
/**
 * PROJECT_ROOT defines the root directory of the project, allowing for relative path resolution. It exists to facilitate file operations within the project structure.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       resolve
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Resolve the project root directory for absolute path operations."]
// CIL[DOC-RESPONSIBILITY responsibility="Store the project root path relative to this module."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/cli/commands/create-app.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="__dirname" outputs="string project root path" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolves the parent directory three levels above __dirname to locate the project root." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const PROJECT_ROOT = resolve(__dirname, '../../../')
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the project root directory for absolute path operations.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:PROJECT_ROOT:constant"]

/**
 * Converts a slug string formatted with hyphens into title case by capitalizing the first letter of each word. This function is useful for generating user-friendly titles from URL slugs.
 *
 * @inputSpec
 *   - slug: string (required) — the slug string to be converted to title case.
 * @outputSpec  string — the title-cased version of the input slug.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:toTitleCase:function" type="function" identity="toTitleCase" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Convert hyphenated slug strings to title case for display names."]
// CIL[DOC-RESPONSIBILITY responsibility="Generate a human-readable title from a slug."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/cli/commands/create-app.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="slug: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Splits the slug on hyphens, capitalizes each word, and joins them with spaces." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function toTitleCase(slug: string): string {
  return slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}
// CIL[DOC-VECTOR type="context" content="purpose='Convert hyphenated slug strings to title case for display names.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:toTitleCase:function"]

/**
 * Generates a manifest JSON string for an application with specified properties. This function is used to create a structured representation of the app's metadata and configuration.
 *
 * @macro       Function that constructs a JSON manifest for an application.
 * @micro       Utilizes JSON.stringify to format the manifest object into a string.
 * @inputSpec
 *   slug: string (required) — a unique identifier for the app.
 *   name: string (required) — the display name of the app.
 *   role: string (required) — the role required to access the app.
 * @outputSpec  string — a formatted JSON string representing the app manifest.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:generateManifest:function" type="function" identity="generateManifest" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Build a manifest JSON string describing a custom app."]
// CIL[DOC-RESPONSIBILITY responsibility="Generate the manifest.json payload for an app."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/cli/commands/create-app.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="slug: string, name: string, role: string" outputs="string formatted JSON" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates an object with app metadata, routes, nav, and serializes it with JSON.stringify." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function generateManifest(slug: string, name: string, role: string): string {
  return JSON.stringify({
    name,
    slug,
    description: `${name} app`,
    version: "1.0.0",
    required_roles: [role],
    routes: [
      `/${slug}`,
      `/${slug}/dashboard`
    ],
    nav_items: [
      {
        title: "Dashboard",
        path: `/${slug}/dashboard`,
        icon: "LayoutDashboard",
        order: 1
      }
    ],
    features: [],
    dependencies: [],
    entry_point: "./index.tsx"
  }, null, 2) + '\n'
}
// CIL[DOC-VECTOR type="context" content="purpose='Build a manifest JSON string describing a custom app.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:generateManifest:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:generateIndexTsx:function" type="function" identity="generateIndexTsx" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Generate a starter index.tsx for a custom app."]
// CIL[DOC-RESPONSIBILITY responsibility="Produce the React component source for a new app shell."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/cli/commands/create-app.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="slug: string, name: string" outputs="string tsx source" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes a component name from the slug and returns a template string with React Router routes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function generateIndexTsx(slug: string, name: string): string {
  const componentName = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
  return `

import * as React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

function ${componentName}Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">${name}</h1>
      <p className="text-slate-500">Welcome to ${name}. Edit custom/apps/${slug}/index.tsx to get started.</p>
    </div>
  )
}

export default function ${componentName}App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<${componentName}Dashboard />} />
    </Routes>
  )
}
`
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a starter index.tsx for a custom app.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:generateIndexTsx:function"]

/**
 * Creates a new application directory and its associated files based on the provided slug and options. It also registers the app in the database if it does not already exist.
 *
 * @macro       Async function responsible for application creation and database registration.
 * @micro       Checks for existing application directories and conditionally overwrites them based on the force option.
 * @inputSpec
 *   slug: string (required) — the unique identifier for the app.
 *   options: { name?: string; role: string; force: boolean } (required) — configuration options for the app creation.
 * @outputSpec  Promise<void>
 * @sideEffects Creates directories and files in the filesystem, writes to the database.
 * @stability   stable
 * @calls       adminDb.from('apps'), adminDb.select, adminDb.eq, adminDb.single, adminDb.insert
 * @errorHandling Logs errors to the console for database insert failures.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:createApp:function" type="function" identity="createApp" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Create a new custom app directory, files, and database registration."]
// CIL[DOC-RESPONSIBILITY responsibility="Scaffold an app on disk and register it in the apps table."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/cli/commands/create-app.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="slug: string, options: { name?: string; role: string; force: boolean }" outputs="Promise<void>" errors="Database or filesystem errors logged; exits if the directory already exists and force is false" side_effects="Creates directories and files in custom/apps/{slug}; writes to the database"]
// CIL[DOC-MICRO logic_summary="Validates or overwrites the app directory, writes manifest.json, index.tsx, .gitkeep, then upserts the app record via adminDb." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function createApp(slug: string, options: { name?: string; role: string; force: boolean }): Promise<void> {
  const name = options.name || toTitleCase(slug)
  const appDir = resolve(PROJECT_ROOT, `custom/apps/${slug}`)

  console.log(`\n🔧 Creating app '${slug}'...`)

  if (existsSync(appDir) && !options.force) {
    console.error(`  ❌ App directory already exists: custom/apps/${slug}`)
    console.error(`     Use --force to overwrite`)
    process.exit(1)
  }

  
  mkdirSync(resolve(appDir, 'components'), { recursive: true })
  console.log(`  ✓ Created custom/apps/${slug}/`)
  console.log(`  ✓ Created custom/apps/${slug}/components/`)

  
  writeFileSync(
    resolve(appDir, 'manifest.json'),
    generateManifest(slug, name, options.role)
  )
  console.log(`  ✓ Created custom/apps/${slug}/manifest.json`)

  
  writeFileSync(
    resolve(appDir, 'index.tsx'),
    generateIndexTsx(slug, name)
  )
  console.log(`  ✓ Created custom/apps/${slug}/index.tsx`)

  
  writeFileSync(resolve(appDir, 'components', '.gitkeep'), '')

  
  console.log(`  Registering app in database...`)
  const { data: existing } = await adminDb
    .from('apps')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    console.log(`  ⚠️  App '${slug}' already exists in database (skipping insert)`)
  } else {
    const { error: insertErr } = await adminDb
      .from('apps')
      .insert({
        slug,
        name,
        route_prefix: `/${slug}`,
        renderer: 'custom',
        is_active: true,
        is_system: false,
        min_role: options.role,
      })

    if (insertErr) {
      console.error(`  ❌ Database insert failed: ${insertErr.message}`)
      console.error(`     Run manually: INSERT INTO apps (slug, name, route_prefix, renderer, is_active)`)
      console.error(`     VALUES ('${slug}', '${name}', '/${slug}', 'custom', true);`)
    } else {
      console.log(`  ✓ App registered in database`)
    }
  }

  console.log(`\n✅ App '${name}' ready at custom/apps/${slug}/`)
  console.log(`\n   Next steps:`)
  console.log(`   1. Edit custom/apps/${slug}/manifest.json to configure routes and nav`)
  console.log(`   2. Edit custom/apps/${slug}/index.tsx to build your app`)
  console.log(`   3. npm run assemble && netlify dev`)
}
// CIL[DOC-VECTOR type="context" content="purpose='Create a new custom app directory, files, and database registration.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:createApp:function"]

/**
 * Registers a command to scaffold a new custom app in a specified directory. This command allows users to create an app with customizable options such as name and role.
 *
 * @macro       Command registration function for creating custom applications.
 * @micro       Handles command execution asynchronously and manages error logging.
 * @inputSpec
 *   program: Command (required) — the command program to register the create-app command with.
 *   slug: string (required) — the unique identifier for the app being created.
 *   name: string (optional) — display name for the app (defaults to title-cased slug).
 *   role: string (optional) — required role to access this app (defaults to 'member').
 *   force: boolean (optional) — flag to overwrite existing files (defaults to false).
 * @outputSpec  Promise<void>
 * @sideEffects Creates files and directories for the new app based on the provided slug.
 * @stability   stable
 * @calls       createApp
 * @errorHandling Logs error messages to the console and exits the process on failure.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/create-app.ts:registerCreateAppCommands:function" type="function" identity="registerCreateAppCommands" parent="~/.framework/cli/commands/create-app.ts"]
// CIL[DOC-MACRO purpose="Register the create-app command with a commander program."]
// CIL[DOC-RESPONSIBILITY responsibility="Wire the create-app CLI subcommand and its options."]
// CIL[DOC-CONTEXT module="cli/commands/create-app" layer="cli" related_files=".framework/cli/commands/create-app.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void (command registered)" errors="Runtime errors logged; process exits on createApp failure" side_effects="Registers a command and attaches an action handler"]
// CIL[DOC-MICRO logic_summary="Defines the create-app command, options for name, role, and force, and calls createApp on action." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function registerCreateAppCommands(program: Command) {
  program
    .command('create-app <slug>')
    .description('Scaffold a new custom app in custom/apps/{slug}/')
    .option('--name <name>', 'Display name for the app (defaults to title-cased slug)')
    .option('--role <role>', 'Required role to access this app', 'member')
    .option('--force', 'Overwrite existing files', false)
    .action(async (slug, opts) => {
      try {
        await createApp(slug, opts)
      } catch (err: any) {
        console.error('Error:', err.message)
        process.exit(1)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the create-app command with a commander program.'; No verified external callers; imports: .framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/create-app.ts:registerCreateAppCommands:function"]
