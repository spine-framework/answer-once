








import type { Command } from 'commander'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { adminDb } from '../../functions/_shared/index.ts'

/**
 * __filename is a constant that holds the resolved file path of the current module, allowing for accurate file system operations and references. It exists to provide a reliable way to access the file's location in the context of ES modules.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       fileURLToPath
 * @cil-generated
 */
const __filename = fileURLToPath(import.meta.url)
/**
 * __dirname is a constant that holds the directory name of the current module, allowing for relative file path resolution. It exists to facilitate file operations within the module's directory context.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       dirname
 * @cil-generated
 */
const __dirname = dirname(__filename)
/**
 * PROJECT_ROOT defines the root directory of the project, allowing for relative path resolution. It exists to facilitate file operations within the project structure.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       resolve
 * @cil-generated
 */
const PROJECT_ROOT = resolve(__dirname, '../../../')

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
function toTitleCase(slug: string): string {
  return slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

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
