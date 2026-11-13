
import { readFileSync, realpathSync } from 'node:fs'
import { resolve, sep } from 'node:path'


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


export interface NavItem {
  title: string
  path: string
  icon?: string
  order?: number
  children?: NavItem[]
}



const manifestCache = new Map<string, AppManifest>()



function repoRoot(): string {
  return process.env.REPO_PATH || process.cwd()
}



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


export function clearManifestCache(): void {
  manifestCache.clear()
}


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
