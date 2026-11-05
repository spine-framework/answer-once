// CIL[BEGIN stable_id="~/.framework/functions/_shared/app-manifest.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Shared manifest loader for Spine apps"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines AppManifest and NavItem interfaces and provides manifest loading, caching, merging, and discovery helpers"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module-level entry point; no runtime logic" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]






import { readFileSync, realpathSync, readdirSync, statSync } from 'fs'
import { resolve, join, sep } from 'path'
// CIL[DOC-VECTOR type="context" content="purpose='Shared manifest loader for Spine apps'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/app-manifest.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/app-manifest.ts:AppManifest:interface" type="interface" identity="AppManifest" parent="~/.framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Describes the runtime configuration shape of a Spine app manifest"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the AppManifest type fields used by loaders and renderers"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppManifest type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional and required fields for app metadata, routing, roles, and domains" notable_decisions="[]"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Describes the runtime configuration shape of a Spine app manifest'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/app-manifest.ts:AppManifest:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/app-manifest.ts:NavItem:interface" type="interface" identity="NavItem" parent="~/.framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Describes the shape of a navigation item in an app manifest"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the NavItem type used for app navigation trees"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="NavItem type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Title, path, icon, order, and optional nested children" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface NavItem {
  title: string
  path: string
  icon?: string
  order?: number
  children?: NavItem[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Describes the shape of a navigation item in an app manifest'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/app-manifest.ts:NavItem:interface"]













// CIL[BEGIN stable_id="~/.framework/functions/_shared/app-manifest.ts:manifestCache:constant" type="constant" identity="manifestCache" parent="~/.framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Cache loaded manifests by file path to avoid repeated disk reads"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold in-memory Map of manifest paths to AppManifest objects"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="canonical manifest path string key" outputs="AppManifest or undefined" errors="none" side_effects="Cache state is mutable module state"]
// CIL[DOC-MICRO logic_summary="Instantiated once at module load; keyed by canonical manifest path" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const manifestCache = new Map<string, AppManifest>()
// CIL[DOC-VECTOR type="context" content="purpose='Cache loaded manifests by file path to avoid repeated disk reads'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/app-manifest.ts:manifestCache:constant"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/app-manifest.ts:loadManifest:function" type="function" identity="loadManifest" parent="~/.framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Read, parse, and cache a Spine app manifest JSON file"]
// CIL[DOC-RESPONSIBILITY responsibility="Load manifest from disk, validate required fields, cache, and return it"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="manifestPath: relative or absolute path to manifest JSON, projectRoot: optional root (defaults to REPO_PATH or cwd)" outputs="AppManifest or null" errors="Returns null on path escapes, missing or invalid fields, or read/parse errors and logs to console" side_effects="Reads from filesystem and updates manifestCache keyed by canonical path"]
// CIL[DOC-MICRO logic_summary="Canonicalizes project root and manifest path with realpathSync, rejects lexical or symlink escapes, parses JSON, validates object shape, nonempty name, slug charset, and required_roles array, then caches by canonical path" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function loadManifest(
  manifestPath: string,
  projectRoot: string = resolve(process.env.REPO_PATH || process.cwd())
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
// CIL[DOC-VECTOR type="context" content="purpose='Read, parse, and cache a Spine app manifest JSON file'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/app-manifest.ts:loadManifest:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/app-manifest.ts:clearManifestCache:function" type="function" identity="clearManifestCache" parent="~/.framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Clear the manifest cache"]
// CIL[DOC-RESPONSIBILITY responsibility="Reset the manifestCache Map"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="none" side_effects="Empties manifestCache"]
// CIL[DOC-MICRO logic_summary="Calls Map.clear on the module-level cache" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function clearManifestCache(): void {
  manifestCache.clear()
}
// CIL[DOC-VECTOR type="context" content="purpose='Clear the manifest cache'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/app-manifest.ts:clearManifestCache:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/app-manifest.ts:mergeWithManifest:function" type="function" identity="mergeWithManifest" parent="~/.framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Merge a database app record with its manifest file values"]
// CIL[DOC-RESPONSIBILITY responsibility="When config_source is manifest, load and overlay manifest fields onto the database record"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="dbRecord: any database app row object" outputs="merged app object or null" errors="Falls back to database record if manifest missing or invalid, logging a warning" side_effects="Calls loadManifest which may read from disk and cache"]
// CIL[DOC-MICRO logic_summary="Returns DB-derived fallback when no manifest config, preserving an existing required_roles array and deriving from min_role only when absent; otherwise loads manifest and overlays manifest-authoritative fields on the full DB record" notable_decisions="[]"]
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
      _source: 'database'
    }
  }

  const manifest = loadManifest(dbRecord.manifest_path)
  if (!manifest) {
    console.warn(`[app-manifest] Could not load manifest for ${dbRecord.slug}, falling back to DB`)
    return {
      ...dbRecord,
      required_roles: fallbackRoles,
      _source: 'database (manifest missing)'
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
    _manifest_path: dbRecord.manifest_path
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Merge a database app record with its manifest file values'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/app-manifest.ts:mergeWithManifest:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/app-manifest.ts:discoverManifests:function" type="function" identity="discoverManifests" parent="~/.framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-MACRO purpose="Discover app manifests by enumerating custom/apps directories"]
// CIL[DOC-RESPONSIBILITY responsibility="Enumerate custom/apps children, load and validate each manifest, and return slug/path entries for directories whose name matches the manifest slug"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/app-manifest.ts"]
// CIL[DOC-CONTRACT inputs="projectRoot?: string defaults to REPO_PATH or cwd" outputs="Array of {slug, path} objects sorted lexically by directory name" errors="Returns [] when custom/apps is absent or unreadable" side_effects="Reads the filesystem and may populate the manifest cache"]
// CIL[DOC-MICRO logic_summary="Canonicalizes the project root, lists custom/apps entries sorted lexically, skips non-directories and external symlink escapes via loadManifest containment, and keeps entries whose directory name equals the validated manifest slug" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function discoverManifests(
  projectRoot: string = resolve(process.env.REPO_PATH || process.cwd())
): Array<{slug: string, path: string}> {
  try {
    const root = realpathSync(resolve(projectRoot))
    const appsDir = join(root, 'custom', 'apps')
    const names = readdirSync(appsDir, { withFileTypes: true })
      .map((d) => d.name)
      .sort()

    const found: Array<{slug: string, path: string}> = []
    for (const name of names) {
      const dirPath = join(appsDir, name)
      let isDir = false
      try {
        isDir = statSync(dirPath).isDirectory()
      } catch {
        continue
      }
      if (!isDir) continue

      const rel = `custom/apps/${name}/manifest.json`
      const manifest = loadManifest(rel, root)
      if (!manifest || manifest.slug !== name) continue
      found.push({ slug: manifest.slug, path: rel })
    }
    return found
  } catch {
    return []
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Discover app manifests by enumerating custom/apps directories'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/app-manifest.ts:discoverManifests:function"]
