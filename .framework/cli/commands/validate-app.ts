// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Provide module-level imports for the validate-app CLI command"]
// CIL[DOC-RESPONSIBILITY responsibility="Load required modules for CLI execution, filesystem inspection, path resolution and URL helpers"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports Command from commander, fs utilities, path helpers and url helpers" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]











import { Command } from 'commander'
import { readFileSync, existsSync, readdirSync, statSync, realpathSync } from 'fs'
import { createHash } from 'crypto'
import { join, dirname, resolve, isAbsolute, sep } from 'path'
import { fileURLToPath } from 'url'
// CIL[DOC-VECTOR type="context" content="purpose='Provide module-level imports for the validate-app CLI command'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Expose the current module filename for path resolution"]
// CIL[DOC-RESPONSIBILITY responsibility="Derive __filename from import.meta.url"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use fileURLToPath to convert import.meta.url to an absolute file path" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Expose the current module filename for path resolution'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Expose the current module directory for path resolution"]
// CIL[DOC-RESPONSIBILITY responsibility="Derive __dirname from __filename"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use dirname to get the directory portion of __filename" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Expose the current module directory for path resolution'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:__dirname:constant"]


// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:SeedEntry:interface" type="interface" identity="SeedEntry" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Define the shape of a manifest seed entry"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the TypeScript interface for a single seed configuration used by validate-app"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares file, table, conflict and optional inject_app_id/permissions_patch fields" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
interface SeedEntry {
  file: string
  table: string
  conflict: string
  inject_app_id?: boolean
  permissions_patch?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of a manifest seed entry'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:SeedEntry:interface"]


// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:Manifest:interface" type="interface" identity="Manifest" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Define the shape of an app manifest"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the TypeScript interface for the manifest.json structure used by validate-app"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares app metadata, type, entry points, seed, owned_types, registration and routing fields" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
interface Manifest {
  name: string
  slug: string
  version: string
  app_type: 'full' | 'ui' | 'backend' | 'data'
  entry_point?: string
  sidebar_component?: string
  seed?: SeedEntry[]
  owned_types?: string[]
  config?: {
    knowledge?: {
      account?: boolean | { scope?: string; item_types?: string[] }
      platform?: boolean | { sources?: string[] }
      cil?: boolean | { project_ids?: string[] }
    }
    [key: string]: any
  }
  registration?: {
    enabled?: boolean
    app_type?: 'full' | 'ui' | 'backend' | 'data'
    default_role?: string
    redirect_path?: string
    account_strategy?: 'existing' | 'new' | 'choice'
    target_account?: string
    parent_account?: string
    default_workspace_name?: boolean
  }
  route_prefix?: string
  preview_domain?: string
  prod_domain?: string
  preview_route_prefix?: string
  prod_route_prefix?: string
  agent?: {
    skill_prefix?: string
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of an app manifest'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:Manifest:interface"]


// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:PackageJson:interface" type="interface" identity="PackageJson" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Define the shape of a package.json with spine configuration"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the TypeScript interface for package.json consumed by validate-app"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares name, version, files and the optional spine block fields" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
interface PackageJson {
  name: string
  version: string
  private?: boolean
  files?: string[]
  spine?: {
    type?: string
    slug?: string
    manifestPath?: string
    app_slug?: string
    entry_point?: string
    manifest?: string
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of a package.json with spine configuration'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:PackageJson:interface"]


// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:ValidationError:class" type="class" identity="ValidationError" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Custom error type for app validation failures"]
// CIL[DOC-RESPONSIBILITY responsibility="Instantiate typed validation errors that identify validation problems"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="message: string" outputs="ValidationError instance" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Extends Error and sets the name property to ValidationError" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Custom error type for app validation failures'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:ValidationError:class"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateManifest:function" type="function" identity="validateManifest" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate the presence and content of an app manifest.json"]
// CIL[DOC-RESPONSIBILITY responsibility="Check that manifest.json exists, is valid JSON, has required fields and a valid app_type"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string" outputs="Manifest" errors="ValidationError on missing file, invalid JSON or invalid fields" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolve manifest path, read and parse, reject non-object roots, enforce required fields and allowed app_type values" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function validateManifest(appPath: string): Manifest {
  const manifestPath = join(appPath, 'manifest.json')
  
  if (!existsSync(manifestPath)) {
    throw new ValidationError('❌ manifest.json is required')
  }
  
  let manifest: Manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (err) {
    throw new ValidationError('❌ manifest.json is not valid JSON')
  }

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new ValidationError('❌ manifest.json must contain a JSON object')
  }

  if (manifest.app_type === undefined && manifest.registration?.app_type !== undefined) {
    manifest.app_type = manifest.registration.app_type
  }

  const requiredFields = ['name', 'slug', 'version', 'app_type']
  for (const field of requiredFields) {
    if (!manifest[field]) {
      throw new ValidationError(`❌ manifest.json missing required field: ${field}`)
    }
  }

  if (typeof manifest.name !== 'string' || !manifest.name.trim()) {
    throw new ValidationError(`❌ manifest.json missing required field: name`)
  }
  
  const validAppTypes = ['full', 'ui', 'backend', 'data']
  if (!validAppTypes.includes(manifest.app_type)) {
    throw new ValidationError(`❌ manifest.json app_type must be one of: ${validAppTypes.join(', ')}`)
  }
  
  return manifest
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate the presence and content of an app manifest.json'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateManifest:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validatePackageJson:function" type="function" identity="validatePackageJson" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate the presence and version of an app package.json"]
// CIL[DOC-RESPONSIBILITY responsibility="Check that package.json exists, is valid JSON and its version matches the manifest"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, manifest: Manifest" outputs="PackageJson" errors="ValidationError on missing file, invalid JSON or version mismatch" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolve package path, read and parse, compare package version to manifest version" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function validatePackageJson(appPath: string, manifest: Manifest): PackageJson {
  const packagePath = join(appPath, 'package.json')
  
  if (!existsSync(packagePath)) {
    throw new ValidationError('❌ package.json is required')
  }
  
  let packageJson: PackageJson
  try {
    packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
  } catch (err) {
    throw new ValidationError('❌ package.json is not valid JSON')
  }
  
  if (packageJson.version !== manifest.version) {
    throw new ValidationError(`❌ Version mismatch: package.json has ${packageJson.version} but manifest.json has ${manifest.version}`)
  }
  
  return packageJson
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate the presence and version of an app package.json'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validatePackageJson:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateRequiredFiles:function" type="function" identity="validateRequiredFiles" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate the presence of files and directories required by the app type"]
// CIL[DOC-RESPONSIBILITY responsibility="Check for index.tsx, pages/ and functions/ depending on app_type"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, manifest: Manifest" outputs="void" errors="ValidationError on missing required files or directories" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Switch on app_type and assert existence of index.tsx, pages/ and/or functions/" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function validateRequiredFiles(appPath: string, manifest: Manifest): void {
  const { app_type } = manifest
  
  if (['full', 'ui'].includes(app_type)) {
    if (!existsSync(join(appPath, 'index.tsx'))) {
      throw new ValidationError('❌ index.tsx is required for full and ui apps')
    }
  }
  
  if (['full', 'ui'].includes(app_type)) {
    if (!existsSync(join(appPath, 'pages'))) {
      throw new ValidationError('❌ pages/ directory is required for full and ui apps')
    }
  }
  
  if (['full', 'backend'].includes(app_type)) {
    if (!existsSync(join(appPath, 'functions'))) {
      throw new ValidationError('❌ functions/ directory is required for full and backend apps')
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate the presence of files and directories required by the app type'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateRequiredFiles:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateAllowedDirectories:function" type="function" identity="validateAllowedDirectories" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate that the app root contains only allowed directories"]
// CIL[DOC-RESPONSIBILITY responsibility="Scan top-level directories and reject any not in the allow list"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string" outputs="void" errors="ValidationError on disallowed directories" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Read app root directories and compare against an allow list of generic app features including optional .devin" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function validateAllowedDirectories(appPath: string): void {
  const allowedDirs = [
    'pages', 'components', 'hooks', 'utils', 'functions',
    'seed', 'public', 'lib', 'views', 'docs', 'mcp',
    'migrations', 'migrations-archive', 'tests', 'installer',
    'agent', 'src'
  ]
  
  const entries = readdirSync(appPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  const unknownDirs = entries.filter(dir => !allowedDirs.includes(dir) && dir !== '.devin')
  
  if (unknownDirs.length > 0) {
    throw new ValidationError(`❌ Unknown directories found: ${unknownDirs.join(', ')}. Allowed directories: ${allowedDirs.join(', ')} (plus optional .devin/)`)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate that the app root contains only allowed directories'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateAllowedDirectories:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateDevinDirectory:function" type="function" identity="validateDevinDirectory" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate the optional .devin/ directory structure"]
// CIL[DOC-RESPONSIBILITY responsibility="Check that .devin/ contains AGENTS.md and that every skill has SKILL.md"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string" outputs="void" errors="ValidationError on missing AGENTS.md or missing SKILL.md" side_effects="logs to stdout"]
// CIL[DOC-MICRO logic_summary="If .devin exists, verify AGENTS.md and each skill subdirectory has SKILL.md" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function validateDevinDirectory(appPath: string): void {
  const devinPath = join(appPath, '.devin')
  
  if (existsSync(devinPath)) {
    const agentsPath = join(devinPath, 'AGENTS.md')
    const agentsAltPath = join(devinPath, 'AGENT.md')
    
    if (!existsSync(agentsPath) && !existsSync(agentsAltPath)) {
      throw new ValidationError('❌ .devin/ directory exists but AGENTS.md is missing. If .devin/ exists, it must contain AGENTS.md with agentic guidance.')
    }
    
    const skillsPath = join(devinPath, 'skills')
    if (existsSync(skillsPath)) {
      const skillDirs = readdirSync(skillsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
      
      for (const skillDir of skillDirs) {
        const skillFile = join(skillsPath, skillDir.name, 'SKILL.md')
        if (!existsSync(skillFile)) {
          throw new ValidationError(`❌ Skill directory ${skillDir.name} exists but SKILL.md is missing`)
        }
      }
    }
    
    console.log(`✅ .devin/ directory valid (if present)`)
  } else {
    console.log(`✅ .devin/ directory not present (optional)`)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate the optional .devin/ directory structure'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateDevinDirectory:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateRoutes:function" type="function" identity="validateRoutes" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate route and nav_item paths in the manifest"]
// CIL[DOC-RESPONSIBILITY responsibility="Check that routes are root-relative and do not repeat the route_prefix"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, manifest: Manifest" outputs="void" errors="ValidationError on route prefix duplication or missing leading slash" side_effects="logs warnings to stdout"]
// CIL[DOC-MICRO logic_summary="If route_prefix is set, ensure routes and nav_items do not include it and start with /" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function validateRoutes(appPath: string, manifest: Manifest): void {
  // Host-keyed mount overrides: an override prefix only makes sense with its
  // domain trigger, and both must be root-relative.
  const pairs: [keyof Manifest, keyof Manifest][] = [
    ['prod_route_prefix', 'prod_domain'],
    ['preview_route_prefix', 'preview_domain'],
  ]
  for (const [prefixKey, domainKey] of pairs) {
    const prefix = manifest[prefixKey] as string | undefined
    if (prefix === undefined) continue
    if (typeof prefix !== 'string' || !prefix.startsWith('/')) {
      throw new ValidationError(`❌ manifest.json ${prefixKey} "${prefix}" must start with /`)
    }
    if (!manifest[domainKey]) {
      throw new ValidationError(`❌ manifest.json ${prefixKey} requires ${domainKey} — the override has no trigger host without it`)
    }
  }

  if (!manifest.route_prefix) {
    console.warn('⚠️  manifest.json is missing route_prefix — install-app will default to /{slug}')
    return
  }

  const prefix = manifest.route_prefix === '/' ? null : manifest.route_prefix

  if (!Array.isArray((manifest as any).routes)) return

  for (const route of (manifest as any).routes as string[]) {
    if (prefix && route.startsWith(prefix)) {
      throw new ValidationError(
        `❌ manifest.json route "${route}" must be root-relative (should not include route_prefix "${prefix}"). Use "${route.replace(prefix, '') || '/'}" instead.`
      )
    }
    if (!route.startsWith('/')) {
      throw new ValidationError(
        `❌ manifest.json route "${route}" must start with /`
      )
    }
  }

  if (Array.isArray((manifest as any).nav_items)) {
    const checkNavItem = (item: any) => {
      if (item.path && prefix && item.path.startsWith(prefix)) {
        throw new ValidationError(
          `❌ manifest.json nav_items path "${item.path}" must be root-relative (should not include route_prefix "${prefix}"). Use "${item.path.replace(prefix, '') || '/'}" instead.`
        )
      }
      if (Array.isArray(item.children)) {
        for (const child of item.children) checkNavItem(child)
      }
    }
    for (const item of (manifest as any).nav_items) checkNavItem(item)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate route and nav_item paths in the manifest'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateRoutes:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:canonicalfilewithin:function" type="function" identity="canonicalFileWithin" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Resolve a root-contained file path for manifest-referenced files"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the canonical path of an existing regular file inside the app root, or null"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, relPath: string" outputs="string canonical path or null" errors="none" side_effects="reads filesystem metadata via realpathSync and statSync"]
// CIL[DOC-MICRO logic_summary="Rejects absolute paths, lexical escapes, symlink escapes, and non-file targets by canonicalizing app root and target with realpathSync" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function canonicalFileWithin(appPath: string, relPath: string): string | null {
  try {
    if (isAbsolute(relPath)) return null
    const root = realpathSync(appPath)
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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a root-contained file path for manifest-referenced files'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:canonicalfilewithin:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateManifestComponents:function" type="function" identity="validateManifestComponents" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate manifest references to component files and registration constraints"]
// CIL[DOC-RESPONSIBILITY responsibility="Check entry_point, sidebar_component and account strategy fields"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, manifest: Manifest" outputs="void" errors="ValidationError on missing referenced files or inconsistent registration" side_effects="reads filesystem metadata for root-contained files via canonicalFileWithin"]
// CIL[DOC-MICRO logic_summary="Verify referenced files exist as root-contained regular files via canonicalFileWithin and that existing account strategy has target_account" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function validateManifestComponents(appPath: string, manifest: Manifest): void {
  if (manifest.entry_point) {
    const ep = manifest.entry_point.replace(/^\.\//, '')
    if (!canonicalFileWithin(appPath, ep)) {
      throw new ValidationError(`❌ manifest.json entry_point "${manifest.entry_point}" does not exist or escapes the app root`)
    }
  }

  if (manifest.sidebar_component) {
    const sc = manifest.sidebar_component.replace(/^\.\//, '')
    if (!canonicalFileWithin(appPath, sc)) {
      throw new ValidationError(`❌ manifest.json sidebar_component "${manifest.sidebar_component}" does not exist or escapes the app root`)
    }
  }

  if (manifest.registration?.account_strategy === 'existing' && !manifest.registration?.target_account) {
    throw new ValidationError(`❌ manifest.json registration.account_strategy is "existing" but target_account is not set`)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate manifest references to component files and registration constraints'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateManifestComponents:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateSeedBlock:function" type="function" identity="validateSeedBlock" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate the seed block in the manifest"]
// CIL[DOC-RESPONSIBILITY responsibility="Check that seed entries are well-formed and reference root-contained .json files containing an array of object records"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, manifest: Manifest" outputs="void" errors="ValidationError on malformed seed entries, missing seed files, path escapes, or non-object rows" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assert seed is an array of objects; each entry needs nonempty-trimmed file/table/conflict strings; entry.file is relative to the app root, must resolve to a root-contained regular .json file via canonicalFileWithin, and must parse to a JSON array of non-null objects" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function validateSeedBlock(appPath: string, manifest: Manifest): void {
  if (!manifest.seed) return

  if (!Array.isArray(manifest.seed)) {
    throw new ValidationError('❌ manifest.json seed must be an array')
  }

  for (const entry of manifest.seed) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new ValidationError('❌ manifest.json seed entries must be objects')
    }
    if (typeof entry.file !== 'string' || !entry.file.trim() || typeof entry.table !== 'string' || !entry.table.trim() || typeof entry.conflict !== 'string' || !entry.conflict.trim()) {
      throw new ValidationError('❌ manifest.json seed entries must have file, table, and conflict fields')
    }

    if (isAbsolute(entry.file) || !existsSync(join(appPath, entry.file))) {
      throw new ValidationError(`❌ Seed file not found: ${entry.file}`)
    }

    const seedFile = canonicalFileWithin(appPath, entry.file)
    if (!seedFile) {
      throw new ValidationError(`❌ Seed file escapes the app root: ${entry.file}`)
    }

    if (!seedFile.endsWith('.json')) {
      throw new ValidationError(`❌ Seed file must be .json: ${entry.file}`)
    }

    let rows: unknown
    try {
      rows = JSON.parse(readFileSync(seedFile, 'utf8'))
    } catch {
      throw new ValidationError(`❌ Seed file is not valid JSON: ${entry.file}`)
    }

    if (!Array.isArray(rows)) {
      throw new ValidationError(`❌ Seed file must contain a JSON array of records: ${entry.file}`)
    }

    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        throw new ValidationError(`❌ Seed file must contain only non-null object records: ${entry.file}`)
      }
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate the seed block in the manifest'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateSeedBlock:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateownedtypes:function" type="function" identity="validateOwnedTypes" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate the optional owned_types manifest declaration"]
// CIL[DOC-RESPONSIBILITY responsibility="Require owned_types to be an array of non-empty strings where each slug resolves to a record in the app's types seed (seed/types.json)"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, manifest: Manifest" outputs="void" errors="ValidationError on a malformed owned_types array or a slug absent from the types seed" side_effects="reads types seed files"]
// CIL[DOC-MICRO logic_summary="Return early when owned_types is absent; shape-check the array, then collect slugs from every declared non-patch types seed entry plus the conventional seed/types.json default and reject undeclared slugs" notable_decisions="absent owned_types is a valid optional field; install-app --reconcile-owned-types trusts the same resolution set"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function validateOwnedTypes(appPath: string, manifest: Manifest): void {
  const owned = manifest.owned_types
  if (owned === undefined) return

  if (!Array.isArray(owned) || owned.some(s => typeof s !== 'string' || !s.trim())) {
    throw new ValidationError('❌ manifest.json owned_types must be an array of non-empty strings')
  }

  // Resolve declared slugs against every types seed this app ships: declared
  // non-patch seed entries for the types table, plus the conventional
  // seed/types.json the installer applies by default.
  const typeSlugs = new Set<string>()
  const collectFrom = (relPath: string) => {
    const file = canonicalFileWithin(appPath, relPath)
    if (!file) return
    try {
      const rows: unknown = JSON.parse(readFileSync(file, 'utf8'))
      if (Array.isArray(rows)) {
        for (const row of rows) {
          if (row && typeof row === 'object' && typeof (row as any).slug === 'string') typeSlugs.add((row as any).slug)
        }
      }
    } catch { /* malformed declared files already failed in validateSeedBlock */ }
  }
  for (const entry of manifest.seed ?? []) {
    if (entry && typeof entry === 'object' && !Array.isArray(entry)
      && entry.table === 'types' && entry.permissions_patch !== true && typeof entry.file === 'string') {
      collectFrom(entry.file)
    }
  }
  collectFrom('seed/types.json')

  for (const slug of owned) {
    if (!typeSlugs.has(slug)) {
      throw new ValidationError(`❌ manifest.json owned_types declares "${slug}" but no type record with that slug exists in the app's types seed (seed/types.json)`)
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate the optional owned_types manifest declaration'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateownedtypes:function"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateknowledgeenvelope:function" type="function" identity="validateKnowledgeEnvelope" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-MACRO purpose="Validate the manifest knowledge envelope and seed prompt-config picks"]
// CIL[DOC-RESPONSIBILITY responsibility="Check config.knowledge shape and verify seeded prompt_configs' retrieval_policy picks stay inside the envelope — an agent may narrow the app envelope but never widen it"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/functions/_shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, manifest: Manifest" outputs="void" errors="ValidationError on malformed envelope or out-of-envelope picks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Shape-check account/platform/cil blocks, then intersect each seeded prompt config's item_types and cil project_ids against the envelope; warns when agents would get no access (deny-by-default)" notable_decisions="trailing-* prefix patterns supported in item_types/sources"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
function validateKnowledgeEnvelope(appPath: string, manifest: Manifest): void {
  const envelope = manifest.config?.knowledge
  if (envelope === undefined) {
    console.warn('⚠️  manifest.json config.knowledge is absent — agents and KB search will be denied (deny-by-default)')
    return
  }
  if (envelope === null || typeof envelope !== 'object' || Array.isArray(envelope)) {
    throw new ValidationError('❌ manifest.json config.knowledge must be an object')
  }

  const isPatternList = (v: any) => Array.isArray(v) && v.every((s) => typeof s === 'string' && s.length > 0)

  if (envelope.account !== undefined) {
    const a = envelope.account
    if (a !== true && a !== false && (typeof a !== 'object' || a === null || Array.isArray(a))) {
      throw new ValidationError('❌ config.knowledge.account must be a boolean or an object')
    }
    if (a && typeof a === 'object') {
      if (a.scope !== undefined && !['self', 'self_and_descendants'].includes(a.scope)) {
        throw new ValidationError(`❌ config.knowledge.account.scope must be "self" or "self_and_descendants", got "${a.scope}"`)
      }
      if (a.item_types !== undefined && !isPatternList(a.item_types)) {
        throw new ValidationError('❌ config.knowledge.account.item_types must be an array of item_type slugs or "prefix*" patterns')
      }
    }
  }
  if (envelope.platform !== undefined) {
    const p = envelope.platform
    if (p !== true && p !== false && (typeof p !== 'object' || p === null || Array.isArray(p))) {
      throw new ValidationError('❌ config.knowledge.platform must be a boolean or an object')
    }
    if (p && typeof p === 'object' && p.sources !== undefined && !isPatternList(p.sources)) {
      throw new ValidationError('❌ config.knowledge.platform.sources must be an array of item_type slugs')
    }
  }
  if (envelope.cil !== undefined) {
    const c = envelope.cil
    if (c !== true && c !== false && (typeof c !== 'object' || c === null || Array.isArray(c))) {
      throw new ValidationError('❌ config.knowledge.cil must be a boolean or an object')
    }
    if (c && typeof c === 'object' && c.project_ids !== undefined && !isPatternList(c.project_ids)) {
      throw new ValidationError('❌ config.knowledge.cil.project_ids must be an array of project UUIDs')
    }
    if (c === true) {
      console.warn('⚠️  config.knowledge.cil is enabled without project_ids — CIL access requires a non-empty project list to resolve at runtime')
    }
  }

  // Cross-check seeded prompt-config picks against the envelope.
  const seedPath = join(appPath, 'seed', 'prompt-configs.json')
  if (!existsSync(seedPath)) return
  let configs: any[] = []
  try {
    const parsed = JSON.parse(readFileSync(seedPath, 'utf8'))
    configs = Array.isArray(parsed) ? parsed : (parsed.prompt_configs || parsed.items || [])
  } catch {
    return
  }
  const accountPatterns = envelope.account && envelope.account !== true ? (envelope.account.item_types ?? null) : (envelope.account ? null : [])
  const platformPatterns = envelope.platform && envelope.platform !== true ? (envelope.platform.sources ?? null) : (envelope.platform ? null : [])
  const matchAny = (patterns: string[] | null, t: string) =>
    patterns == null ? true : patterns.some((p) => p === '*' || (p.endsWith('*') ? t.startsWith(p.slice(0, -1)) : p === t))
  const envCilIds = envelope.cil && envelope.cil !== true ? (envelope.cil.project_ids ?? null) : null

  for (const cfg of configs) {
    const pick = cfg?.metadata?.retrieval_policy?.item_types || []
    const label = cfg.slug || cfg.name || '(unnamed)'
    const outside = pick.filter((t: string) =>
      !(t === 'cil_chunk' && !!envelope.cil) && !matchAny(accountPatterns, t) && !matchAny(platformPatterns, t)
    )
    if (outside.length) {
      throw new ValidationError(
        `❌ seed/prompt-configs.json "${label}" picks item_types outside the knowledge envelope: ${outside.join(', ')}`
      )
    }
    const pickCil = cfg?.metadata?.cil_config?.project_ids || []
    if (pickCil.length) {
      if (!envelope.cil) {
        throw new ValidationError(`❌ prompt config "${label}" sets cil_config.project_ids but config.knowledge.cil is not enabled`)
      }
      if (envCilIds) {
        const bad = pickCil.filter((id: string) => !envCilIds.includes(id))
        if (bad.length) {
          throw new ValidationError(`❌ prompt config "${label}" cil project_ids outside envelope: ${bad.join(', ')}`)
        }
      }
    }
  }
}
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateknowledgeenvelope:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateagentdirectory:function" type="function" identity="validateAgentDirectory" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Validate the app's staged agent/ directory (skills and instructions)"]
// CIL[DOC-RESPONSIBILITY responsibility="Enforce skill prefix naming and SKILL.md name/dir equality, markdown-only instructions, and warn when staged assets drift from their live copies"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string, manifest: Manifest" outputs="void" errors="ValidationError on missing skill_prefix, prefix mismatch, missing SKILL.md, or non-markdown instructions" side_effects="logs warnings to stdout on staged-vs-live drift"]
// CIL[DOC-MICRO logic_summary="agent/skills requires manifest.agent.skill_prefix; every staged dir must start <prefix>_ and its SKILL.md name must equal the dir name; agent/instructions may only contain .md; sha1 snapshots of staged trees are compared to live custom/.devin/skills and src/instructions" notable_decisions="['drift_is_a_warning_not_an_error','skill_prefix_fail_closed']"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function validateAgentDirectory(appPath: string, manifest: Manifest): void {
  const agentPath = join(appPath, 'agent')
  if (!existsSync(agentPath)) return

  const skillsPath = join(agentPath, 'skills')
  const instructionsPath = join(agentPath, 'instructions')

  if (existsSync(skillsPath)) {
    const prefix = manifest.agent?.skill_prefix
    if (typeof prefix !== 'string' || !/^[a-z][a-z0-9]{0,7}$/.test(prefix)) {
      throw new ValidationError(
        `❌ agent/skills/ requires manifest.json agent.skill_prefix matching /^[a-z][a-z0-9]{0,7}$/`
      )
    }
    for (const dir of readdirSync(skillsPath, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      if (!dir.name.startsWith(`${prefix}_`)) {
        throw new ValidationError(
          `❌ agent/skills/${dir.name} must start with the declared prefix "${prefix}_"`
        )
      }
      const skillFile = join(skillsPath, dir.name, 'SKILL.md')
      if (!existsSync(skillFile)) {
        throw new ValidationError(`❌ agent/skills/${dir.name}/ is missing SKILL.md`)
      }
      const nameMatch = /^name:\s*(.+)$/m.exec(readFileSync(skillFile, 'utf8'))
      if (!nameMatch || nameMatch[1].trim() !== dir.name) {
        throw new ValidationError(
          `❌ agent/skills/${dir.name}/SKILL.md name must equal its directory name "${dir.name}"`
        )
      }
    }
  }

  if (existsSync(instructionsPath)) {
    const checkMarkdownOnly = (dirPath: string): void => {
      for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
        const full = join(dirPath, entry.name)
        if (entry.isDirectory()) checkMarkdownOnly(full)
        else if (!entry.name.endsWith('.md')) {
          throw new ValidationError(
            `❌ agent/instructions may only contain .md files — found ${entry.name}`
          )
        }
      }
    }
    checkMarkdownOnly(instructionsPath)
  }

  // Staged copies should match their live counterparts — drift means one
  // side was edited without re-staging (or the live install is stale).
  const snapshot = (root: string): Map<string, string> => {
    const out = new Map<string, string>()
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else out.set(full.slice(root.length + 1), createHash('sha1').update(readFileSync(full)).digest('hex'))
      }
    }
    if (existsSync(root)) walk(root)
    return out
  }
  const sameTree = (a: Map<string, string>, b: Map<string, string>): boolean =>
    a.size === b.size && [...a].every(([k, v]) => b.get(k) === v)

  if (existsSync(skillsPath)) {
    const liveSkillsRoot = join(appPath, '..', '..', '.devin', 'skills')
    for (const dir of readdirSync(skillsPath, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      if (!sameTree(snapshot(join(skillsPath, dir.name)), snapshot(join(liveSkillsRoot, dir.name)))) {
        console.warn(`⚠️  agent/skills/${dir.name} differs from live custom/.devin/skills/${dir.name} — re-stage or reinstall`)
      }
    }
  }

  if (existsSync(instructionsPath)) {
    if (!sameTree(snapshot(instructionsPath), snapshot(join(appPath, 'src', 'instructions')))) {
      console.warn(`⚠️  agent/instructions differs from src/instructions — re-stage before packaging`)
    }
  }

  if (existsSync(skillsPath) || existsSync(instructionsPath)) {
    console.log(`✅ agent/ staged assets valid`)
  }
}
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateagentdirectory:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:validateAppStructure:function" type="function" identity="validateAppStructure" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Run the full app structure validation pipeline"]
// CIL[DOC-RESPONSIBILITY responsibility="Orchestrate manifest, package, required files, directories, devin, routes, components, seed and owned_types checks"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appPath: string" outputs="void" errors="ValidationError from any sub-validator" side_effects="logs validation result to stdout"]
// CIL[DOC-MICRO logic_summary="Call each validator in sequence — including validateOwnedTypes after validateSeedBlock so declared seed files are already proven well-formed — and log success" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function validateAppStructure(appPath: string): void {
  const manifest = validateManifest(appPath)
  validatePackageJson(appPath, manifest)
  validateRequiredFiles(appPath, manifest)
  validateAllowedDirectories(appPath)
  validateDevinDirectory(appPath)
  validateAgentDirectory(appPath, manifest)
  validateRoutes(appPath, manifest)
  validateManifestComponents(appPath, manifest)
  validateSeedBlock(appPath, manifest)
  validateOwnedTypes(appPath, manifest)
  validateKnowledgeEnvelope(appPath, manifest)
  console.log(`✅ App structure is valid`)
}
// CIL[DOC-VECTOR type="context" content="purpose='Run the full app structure validation pipeline'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:validateAppStructure:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/validate-app.ts:registerValidateAppCommands:function" type="function" identity="registerValidateAppCommands" parent="~/.framework/cli/commands/validate-app.ts"]
// CIL[DOC-AUDIENCE audience="CLI engineers and framework maintainers"]
// CIL[DOC-MACRO purpose="Register the validate-app CLI subcommand and run validation"]
// CIL[DOC-RESPONSIBILITY responsibility="Add a validate-app command to a Commander program that validates a local app directory"]
// CIL[DOC-CONTEXT module="validate-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="none" errors="process.exit(1) on validation or unexpected errors" side_effects="logs to stdout and stderr, may exit process"]
// CIL[DOC-MICRO logic_summary="Define the validate-app command, resolve the app path, call validateAppStructure and handle errors" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function registerValidateAppCommands(program: Command) {
  program
    .command('validate-app [path]')
    .description('Validate app structure and manifest')
    .option('--fix', 'Attempt to fix common issues (not implemented)')
    .action(async (path = '.') => {
      try {
        const appPath = join(process.cwd(), path)
        console.log(`Validating app at: ${appPath}`)
        validateAppStructure(appPath)
        console.log(`✅ App validation passed`)
      } catch (err: any) {
        if (err instanceof ValidationError) {
          console.error(err.message)
          process.exit(1)
        } else {
          console.error('❌ Unexpected error:', err.message)
          process.exit(1)
        }
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register the validate-app CLI subcommand and run validation'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/validate-app.ts:registerValidateAppCommands:function"]