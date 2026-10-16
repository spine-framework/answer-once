// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-AUDIENCE audience="internal, cli-users"]
// CIL[DOC-MACRO purpose="Provide CLI commands for generating database types, handler stubs, and UI page stubs"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and expose module-level constants for the generate command"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module-level imports and constants" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports Commander, CLI context helpers, adminDb, fs/path, url utilities and module constants" notable_decisions="ESM-compatible __filename and __dirname constants"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]


import type { Command } from 'commander'
import { buildCliContext, handleError } from '../context.ts'
import { adminDb } from '../../functions/_shared/index.ts'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// CIL[DOC-VECTOR type="context" content="purpose='Provide CLI commands for generating database types, handler stubs, and UI page stubs'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-MACRO purpose="Derive the current module's file path for ESM modules"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the resolved __filename for path operations"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/generate.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string __filename" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls fileURLToPath on import.meta.url" notable_decisions=""]
const __filename = fileURLToPath(import.meta.url)
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Derive the current module's file path for ESM modules'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Derive the current module's directory name for relative path resolution"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the resolved __dirname for directory operations"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/generate.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTRACT inputs="none" outputs="string __dirname" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies dirname to the resolved __filename" notable_decisions=""]
const __dirname = dirname(__filename)
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:__dirname:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:PROJECT_ROOT:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Derive the current module's directory name for relative path resolution'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Resolve the absolute project root directory for file operations"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the resolved project root path for stub generation"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/generate.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string PROJECT_ROOT" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolves __dirname three levels up to reach project root" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const PROJECT_ROOT = resolve(__dirname, '../../../')
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the absolute project root directory for file operations'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:PROJECT_ROOT:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:generateType:function" type="function" identity="generateType" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-MACRO purpose="Generate a new database type and create handler and UI page stubs"]
// CIL[DOC-RESPONSIBILITY responsibility="Check for existing type, insert a new record, and write handler and page stub files"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/generate.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, slug: string, options: any" outputs="Promise<void>" errors="Error on DB check/insert failure; skip if type exists" side_effects="Writes to the database and filesystem"]
// CIL[DOC-MICRO logic_summary="Builds name/kind/description, checks for an existing type, inserts the design schema, and writes handler and page files unless present or force=true" notable_decisions="Defaults kind to 'item' and status options to open/in_progress/closed"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
async function generateType(ctx: any, slug: string, options: any): Promise<void> {
  const name = options.name || slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
  const kind = options.kind || 'item'
  const description = options.description || `${name} type generated by spine CLI`

  console.log(`\n🔧 Generating type '${slug}'...`)

  const { data: existing, error: checkErr } = await adminDb
    .from('types')
    .select('id')
    .eq('slug', slug)
    .eq('kind', kind)
    .single()

  if (checkErr && checkErr.code !== 'PGRST116') {
    throw new Error(`Failed to check existing type: ${checkErr.message}`)
  }

  if (existing) {
    console.log(`  ⚠️  Type '${slug}' already exists (skipping DB creation)`)
  } else {
    const designSchema = {
      fields: {
        title: {
          type: 'string',
          required: true,
          label: 'Title',
          description: `Title for this ${name}`
        },
        status: {
          type: 'select',
          options: ['open', 'in_progress', 'closed'],
          default: 'open',
          label: 'Status'
        }
      },
      layout: {
        detail: ['title', 'status'],
        list: ['title', 'status']
      }
    }

    const { error: insertErr } = await adminDb
      .from('types')
      .insert({
        kind,
        slug,
        name,
        description,
        design_schema: designSchema,
        validation_schema: {},
        ownership: 'system',
        is_active: true
      })

    if (insertErr) {
      throw new Error(`Failed to create type: ${insertErr.message}`)
    }

    console.log('  ✓ Type record created')
  }

  const handlerPath = resolve(PROJECT_ROOT, `v2-custom/functions/${slug}.ts`)

  if (existsSync(handlerPath) && !options.force) {
    console.log(`  ⚠️  Handler stub already exists: ${handlerPath}`)
  } else {
    const handlerCode = generateHandlerStub(slug, kind, name)
    writeFileSync(handlerPath, handlerCode)
    console.log(`  ✓ Handler stub created: v2-custom/functions/${slug}.ts`)
  }

  const pageDir = resolve(PROJECT_ROOT, `v2-custom/src/pages/${slug}`)
  const pagePath = resolve(pageDir, 'index.tsx')

  if (existsSync(pagePath) && !options.force) {
    console.log(`  ⚠️  UI page stub already exists: ${pagePath}`)
  } else {
    mkdirSync(pageDir, { recursive: true })
    const pageCode = generatePageStub(slug, name, kind)
    writeFileSync(pagePath, pageCode)
    console.log(`  ✓ UI page stub created: v2-custom/src/pages/${slug}/index.tsx`)
  }

  console.log(`\n✅ Type '${slug}' generation complete!`)
  console.log(`   Next steps:`)
  console.log(`   1. Edit v2-custom/functions/${slug}.ts to implement custom logic`)
  console.log(`   2. Edit v2-custom/src/pages/${slug}/index.tsx to customize the UI`)
  console.log(`   3. Run 'spine dev' to see your changes`)
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a new database type and create handler and UI page stubs'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:generateType:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:generateHandlerStub:function" type="function" identity="generateHandlerStub" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-MACRO purpose="Generate a custom API handler stub string for a type"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a templated handler function using createHandler"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/generate.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="slug: string, kind: string, name: string" outputs="string handler code" errors="Error for unsupported HTTP method at runtime" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a handler template with a switch for GET/POST/PATCH/DELETE methods" notable_decisions="Uses new Date().toISOString() in the generated header comment"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY experimental]
function generateHandlerStub(slug: string, kind: string, name: string): string {
  return `/**
 * @module ${slug}
 * @audience custom
 * @layer api-handler
 * @stability experimental
 *
 * Custom handler for ${name} (${kind} type).
 * Generated by spine CLI on ${new Date().toISOString()}.
 *
 * Extend this handler to add custom logic for your type.
 */

import { createHandler } from '../v2-core/functions/_shared/middleware'

export const handler = createHandler(async (ctx) => {
  const method = ctx.query?.method || 'GET'

  switch (method) {
    case 'GET':
      return { message: '${name} handler - GET not implemented' }

    case 'POST':
      return { message: '${name} handler - POST not implemented' }

    case 'PATCH':
      return { message: '${name} handler - PATCH not implemented' }

    case 'DELETE':
      return { message: '${name} handler - DELETE not implemented' }

    default:
      throw new Error('Unsupported method: ' + method)
  }
})
`
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a custom API handler stub string for a type'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:generateHandlerStub:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:generatePageStub:function" type="function" identity="generatePageStub" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-MACRO purpose="Generate a React page stub string for a type"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a React component template that fetches and displays record data"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/generate.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="slug: string, name: string, kind: string" outputs="string React component code" errors="Error on failed API fetch at runtime" side_effects="none (generated string only)"]
// CIL[DOC-MICRO logic_summary="Builds a React page template using useParams, useApi, and apiFetch" notable_decisions="Uses new Date().toISOString() in the generated header comment"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY experimental]
function generatePageStub(slug: string, name: string, kind: string): string {
  return `/**
 * @page ${slug}/index
 * @audience custom
 * @layer page
 * @stability experimental
 *
 * UI page for ${name} (${kind} type).
 * Generated by spine CLI on ${new Date().toISOString()}.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../../v2-core/src/hooks/useApi'
import { apiFetch } from '../../v2-core/src/lib/api'

export default function ${name.replace(/\s+/g, '')}Page() {
  const { id } = useParams()

  const { data, loading, error } = useApi(
    () => apiFetch('/.netlify/functions/${slug}' + (id ? '?id=' + id : '')),
    { immediate: true }
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">${name}</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
      <p className="mt-4 text-gray-600">
        Edit v2-custom/src/pages/${slug}/index.tsx to customize this page.
      </p>
    </div>
  )
}
`
}
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:generatePageStub:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:registerGenerateCommands:function" type="function" identity="registerGenerateCommands" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Generate a React page stub string for a type'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Register the generate CLI command with the Commander program"]
// CIL[DOC-RESPONSIBILITY responsibility="Wire the generate command, options, and action into the program"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/generate.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void" errors="none (handled by handleError)" side_effects="Adds command and action to the program"]
// CIL[DOC-MICRO logic_summary="Attaches the 'generate <slug>' command with options and an async action that builds context and calls generateType" notable_decisions="Defaults kind to 'item' and passes parsed options to generateType"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function registerGenerateCommands(program: Command) {
  program
    .command('generate <slug>')
    .description('Generate type, handler, and UI stubs')
    .option('--name <name>', 'Human-readable name')
    .option('--kind <kind>', 'Type kind', 'item')
    .option('--description <description>', 'Type description')
    .option('--force', 'Overwrite existing files', false)
    .action(async (slug, opts) => {
      try {
        const ctx = await buildCliContext()
        await generateType(ctx, slug, opts)
      } catch (err: any) {
        handleError(err)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the generate CLI command with the Commander program'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:registerGenerateCommands:function"]