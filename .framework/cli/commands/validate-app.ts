










import { Command } from 'commander'
import { readFileSync, existsSync, readdirSync, statSync, realpathSync } from 'fs'
import { createHash } from 'crypto'
import { join, dirname, resolve, isAbsolute, sep } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


interface SeedEntry {
  file: string
  table: string
  conflict: string
  inject_app_id?: boolean
  permissions_patch?: boolean
}


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
  prod_domains?: string[]
  preview_route_prefix?: string
  prod_route_prefix?: string
  agent?: {
    skill_prefix?: string
  }
}


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


class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

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

function validateAllowedDirectories(appPath: string): void {
  const allowedDirs = [
    'pages', 'components', 'hooks', 'utils', 'functions',
    'seed', 'public', 'lib', 'views', 'docs', 'mcp',
    'migrations', 'migrations-archive', 'tests', 'installer',
    'agent', 'src', 'emails', 'decisions'
  ]
  
  const entries = readdirSync(appPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  const unknownDirs = entries.filter(dir => !allowedDirs.includes(dir) && dir !== '.devin')
  
  if (unknownDirs.length > 0) {
    throw new ValidationError(`❌ Unknown directories found: ${unknownDirs.join(', ')}. Allowed directories: ${allowedDirs.join(', ')} (plus optional .devin/)`)
  }
}

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
    const hasTrigger = domainKey === 'prod_domain'
      ? manifest.prod_domain || (Array.isArray(manifest.prod_domains) && manifest.prod_domains.length > 0)
      : manifest[domainKey]
    if (!hasTrigger) {
      throw new ValidationError(`❌ manifest.json ${prefixKey} requires ${domainKey} — the override has no trigger host without it`)
    }
  }

  if (manifest.prod_domains !== undefined) {
    if (!Array.isArray(manifest.prod_domains) || manifest.prod_domains.some(d => typeof d !== 'string' || !d)) {
      throw new ValidationError('❌ manifest.json prod_domains must be an array of non-empty host strings')
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
  for (const cfg of configs) {
    const pick = cfg?.metadata?.retrieval_policy?.item_types || []
    const label = cfg.slug || cfg.name || '(unnamed)'
    const outside = pick.filter((t: string) =>
      !matchAny(accountPatterns, t) && !matchAny(platformPatterns, t)
    )
    if (outside.length) {
      throw new ValidationError(
        `❌ seed/prompt-configs.json "${label}" picks item_types outside the knowledge envelope: ${outside.join(', ')}`
      )
    }
    // The CIL corpus is retired — no envelope can enable it anymore.
    if ((cfg?.metadata?.cil_config?.project_ids || []).length) {
      throw new ValidationError(`❌ prompt config "${label}" sets cil_config.project_ids — the CIL corpus was retired (migration 079); remove the pick`)
    }
  }
}

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