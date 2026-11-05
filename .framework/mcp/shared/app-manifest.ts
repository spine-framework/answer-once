// CIL[BEGIN stable_id="~/.framework/mcp/shared/app-manifest.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Shared TypeScript module for loading and merging app manifests from JSON files"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares AppManifest and NavItem interfaces and exposes loadManifest, clearManifestCache, and mergeWithManifest helpers"]
// CIL[DOC-CONTEXT module="mcp/shared" layer="shared" related_files=".framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Provides shared manifest data types and loader/merger functions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="mcp"]

import { readFileSync, realpathSync } from 'node:fs'
import { resolve, sep } from 'node:path'
// CIL[DOC-VECTOR type="context" content="purpose='Shared TypeScript module for loading and merging app manifests from JSON files'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/app-manifest.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/app-manifest.ts:AppManifest:interface" type="interface" identity="AppManifest" parent="~/.framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Defines the typed contract for an app manifest JSON file"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe all configurable fields exposed by a Spine app manifest"]
// CIL[DOC-CONTEXT module="mcp/shared" layer="shared" related_files=".framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppManifest interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Property list for an app manifest including metadata, roles, routes, navigation, dependencies, and feature toggles" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface AppManifest {
  name: string
  slug: string
  description?: string
  version?: string
  required_roles: string[]
  route_prefix?: string
  renderer?: 'generic' | 'custom' | 'none'
  routes: string[]
  nav_items: NavItem[]
  features?: string[]
  dependencies?: string[]
  entry_point: string
  is_public?: boolean
  auth_required?: boolean
  preview_domain?: string
  prod_domain?: string
  prod_domains?: string[]
  preview_route_prefix?: string
  prod_route_prefix?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the typed contract for an app manifest JSON file'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/app-manifest.ts:AppManifest:interface"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/app-manifest.ts:NavItem:interface" type="interface" identity="NavItem" parent="~/.framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Defines the recursive navigation item contract for app manifests"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe a single navigation entry with optional children"]
// CIL[DOC-CONTEXT module="mcp/shared" layer="shared" related_files=".framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="NavItem interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Navigation item structure with title, path, icon, order, and nested children" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface NavItem {
  title: string
  path: string
  icon?: string
  order?: number
  children?: NavItem[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the recursive navigation item contract for app manifests'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/app-manifest.ts:NavItem:interface"]



// CIL[BEGIN stable_id="~/.framework/mcp/shared/app-manifest.ts:manifestCache:constant" type="constant" identity="manifestCache" parent="~/.framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="In-memory cache for loaded app manifests keyed by file path"]
// CIL[DOC-RESPONSIBILITY responsibility="Store and reuse parsed manifest objects across loadManifest calls"]
// CIL[DOC-CONTEXT module="mcp/shared" layer="shared" related_files=".framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="canonical manifest path key and AppManifest value" outputs="cached manifest or undefined" errors="none" side_effects="reads and writes a module-level Map"]
// CIL[DOC-MICRO logic_summary="Uses a module-scoped Map keyed by canonical path to avoid repeated JSON parsing of the same manifest file" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const manifestCache = new Map<string, AppManifest>()
// CIL[DOC-VECTOR type="context" content="purpose='In-memory cache for loaded app manifests keyed by file path'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/app-manifest.ts:manifestCache:constant"]



// CIL[BEGIN stable_id="~/.framework/mcp/shared/app-manifest.ts:repoRoot:function" type="function" identity="repoRoot" parent="~/.framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Resolve the repository root directory used to locate manifest files"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the absolute repository root for manifest path resolution"]
// CIL[DOC-CONTEXT module="mcp/shared" layer="shared" related_files=".framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string absolute path" errors="none" side_effects="reads process.env.REPO_PATH or process.cwd"]
// CIL[DOC-MICRO logic_summary="Prefers the REPO_PATH environment variable, falling back to the current working directory" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function repoRoot(): string {
  return process.env.REPO_PATH || process.cwd()
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the repository root directory used to locate manifest files'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/app-manifest.ts:repoRoot:function"]



// CIL[BEGIN stable_id="~/.framework/mcp/shared/app-manifest.ts:loadManifest:function" type="function" identity="loadManifest" parent="~/.framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Load and parse an app manifest JSON file from a path relative to the repo root"]
// CIL[DOC-RESPONSIBILITY responsibility="Read, validate, and cache app manifests for downstream use"]
// CIL[DOC-CONTEXT module="mcp/shared" layer="shared" related_files=".framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="manifestPath: string relative path, projectRoot: optional root (defaults to REPO_PATH or cwd)" outputs="AppManifest | null" errors="returns null on path escapes, missing or invalid fields, or file read and parse failures" side_effects="reads the manifest file from disk and updates the in-memory cache keyed by canonical path; may log errors to console"]
// CIL[DOC-MICRO logic_summary="Canonicalizes project root and manifest path with realpathSync, rejects lexical or symlink escapes, checks the cache, parses the JSON, validates object shape, nonempty name, slug charset, and required_roles array, then caches by canonical path" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function loadManifest(
  manifestPath: string,
  projectRoot: string = resolve(repoRoot())
): AppManifest | null {
  try {
    const root = realpathSync(resolve(projectRoot))
    const lexical = resolve(root, manifestPath)
    if (lexical !== root && !lexical.startsWith(root + sep)) {
      console.error(`[app-manifest] Manifest path escapes project root: ${manifestPath}`)
      return null
    }
    const canonical = realpathSync(lexical)
    if (canonical !== root && !canonical.startsWith(root + sep)) {
      console.error(`[app-manifest] Manifest resolves outside project root: ${manifestPath}`)
      return null
    }

    if (manifestCache.has(canonical)) {
      return manifestCache.get(canonical)!
    }

    const content = readFileSync(canonical, 'utf-8')
    const manifest: AppManifest = JSON.parse(content)

    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
      console.error(`[app-manifest] Invalid manifest at ${manifestPath}: root must be an object`)
      return null
    }

    if (typeof manifest.name !== 'string' || !manifest.name.trim()) {
      console.error(`[app-manifest] Invalid manifest at ${manifestPath}: missing name`)
      return null
    }

    if (typeof manifest.slug !== 'string' || !/^[a-z][a-z0-9-]*$/.test(manifest.slug)) {
      console.error(`[app-manifest] Invalid manifest at ${manifestPath}: missing or invalid slug`)
      return null
    }

    if (manifest.required_roles === undefined || manifest.required_roles === null) {
      manifest.required_roles = []
    } else if (!Array.isArray(manifest.required_roles) || manifest.required_roles.some((r) => typeof r !== 'string' || !r.trim())) {
      console.error(`[app-manifest] Invalid manifest at ${manifestPath}: required_roles must be an array of nonempty strings`)
      return null
    }

    manifestCache.set(canonical, manifest)
    return manifest
  } catch (err) {
    console.error(`[app-manifest] Failed to load ${manifestPath}:`, err)
    return null
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Load and parse an app manifest JSON file from a path relative to the repo root'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/app-manifest.ts:loadManifest:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/app-manifest.ts:clearManifestCache:function" type="function" identity="clearManifestCache" parent="~/.framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Clear the in-memory manifest cache"]
// CIL[DOC-RESPONSIBILITY responsibility="Allow callers to invalidate cached manifests so fresh files are loaded on the next call"]
// CIL[DOC-CONTEXT module="mcp/shared" layer="shared" related_files=".framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="none" side_effects="clears the manifestCache Map"]
// CIL[DOC-MICRO logic_summary="Calls manifestCache.clear() to remove all entries" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function clearManifestCache(): void {
  manifestCache.clear()
}
// CIL[DOC-VECTOR type="context" content="purpose='Clear the in-memory manifest cache'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/app-manifest.ts:clearManifestCache:function"]


// CIL[BEGIN stable_id="~/.framework/mcp/shared/app-manifest.ts:mergeWithManifest:function" type="function" identity="mergeWithManifest" parent="~/.framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Merge a database app record with its corresponding manifest, preferring manifest values when present"]
// CIL[DOC-RESPONSIBILITY responsibility="Build a runtime app object from a database record and manifest file, with fallback to database values when the manifest is absent"]
// CIL[DOC-CONTEXT module="mcp/shared" layer="shared" related_files=".framework/mcp/shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="dbRecord: any" outputs="merged record object | null" errors="returns null for missing dbRecord; warns on missing manifest" side_effects="loads a manifest via loadManifest; may log a warning to console"]
// CIL[DOC-MICRO logic_summary="Returns null for a falsy record. If config_source is not manifest or manifest_path is missing, returns a database-only record tagged _source=database preserving an existing required_roles array and deriving from min_role only when absent. Otherwise loads the manifest and composes a record using manifest values for slug, name, description, roles, routes, nav items, features, dependencies, version, is_public, auth_required, while preserving the full database record including id, is_active, is_system, route_prefix, renderer, config, account_id, pack_id, and ownership" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function mergeWithManifest(dbRecord: any): any {
  if (!dbRecord) return null

  const fallbackRoles = Array.isArray(dbRecord.required_roles)
    ? dbRecord.required_roles
    : dbRecord.min_role ? [dbRecord.min_role] : []

  if (!dbRecord.manifest_path || dbRecord.config_source !== 'manifest') {
    return {
      ...dbRecord,
      required_roles: fallbackRoles,
      _source: 'database',
    }
  }

  const manifest = loadManifest(dbRecord.manifest_path)
  if (!manifest) {
    console.warn(`[app-manifest] Could not load manifest for ${dbRecord.slug}, falling back to DB`)
    return {
      ...dbRecord,
      required_roles: fallbackRoles,
      _source: 'database (manifest missing)',
    }
  }

  return {
    ...dbRecord,
    id: dbRecord.id,
    slug: manifest.slug,
    name: manifest.name,
    description: manifest.description || dbRecord.description,
    required_roles: manifest.required_roles,
    min_role: manifest.required_roles[0] || null,
    routes: manifest.routes,
    nav_items: manifest.nav_items,
    features: manifest.features || [],
    dependencies: manifest.dependencies || [],
    version: manifest.version,
    is_active: dbRecord.is_active,
    is_system: dbRecord.is_system,
    is_public: manifest.is_public ?? false,
    auth_required: manifest.auth_required ?? true,
    account_id: dbRecord.account_id,
    pack_id: dbRecord.pack_id,
    ownership: dbRecord.ownership,
    _source: 'manifest',
    _manifest_path: dbRecord.manifest_path,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Merge a database app record with its corresponding manifest, preferring manifest values when present'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/shared/app-manifest.ts:mergeWithManifest:function"]
