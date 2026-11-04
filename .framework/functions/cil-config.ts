// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Configuration extraction and link-pass handler for CIL config knowledge items"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides endpoints to scan repo config files, extract fields, persist cil_config items, and link them to source code chunks"]
// CIL[DOC-CONTEXT module="framework/functions" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="HTTP request with action, project_id, optional repo_path/file_path/selected_paths/selected_extensions/force" outputs="JSON status/extraction/link result" errors="project_id or repo_path missing/invalid, DB or FS errors" side_effects="Reads repo files; creates/updates items and links in adminDb"]
// CIL[DOC-MICRO logic_summary="Imports shared utilities and defines the Netlify-style handler" notable_decisions="Uses adminDb and admin-data CRUD helpers; keeps file scanning and field extraction in the same module"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="spine-cil,framework-maintainers"]

import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveTypeId, resolveLinkTypeId } from './_shared/resolve-ids'
import { create as adminCreate, update as adminUpdate } from './admin-data'
import { isSelectedPath } from './_shared/cil'
import * as fs from 'fs'
import * as path from 'path'
// CIL[DOC-VECTOR type="context" content="purpose='Configuration extraction and link-pass handler for CIL config knowledge items'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-config.ts:module_header:module_header"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:ExtractedConfigField:interface" type="interface" identity="ExtractedConfigField" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Data shape for a single configuration field extracted from a repo file"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the typed record used by JSON/ENV/SQL extractors"]
// CIL[DOC-CONTEXT module="framework/functions" layer="domain" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="TypeScript interface definition" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Contract for config field metadata including name, type, default, description, source file and source type" notable_decisions="Restricted to known source types and a closed field_type union"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ExtractedConfigField {
  field_name: string
  field_type: 'string' | 'number' | 'boolean' | 'json' | 'env' | 'unknown'
  default_value: string
  description: string
  source_file: string
  source_type: 'json' | 'env' | 'sql' | 'ts'
}
// CIL[DOC-VECTOR type="context" content="purpose='Data shape for a single configuration field extracted from a repo file'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-config.ts:ExtractedConfigField:interface"]










// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:CONFIG_FILE_PATTERNS:constant" type="constant" identity="CONFIG_FILE_PATTERNS" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Regex patterns that identify config files to scan in a repo"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the file glob regexes and associated source types used by the file walker"]
// CIL[DOC-CONTEXT module="framework/functions" layer="config" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Array of glob/source_type pairs" errors="N/A" side_effects="N/A"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Static list of regexes for JSON/ENV/SQL config files and migrations" notable_decisions="Uses RegExp.test against relative repo paths; excludes dotfiles except .env variants"]
const CONFIG_FILE_PATTERNS: { glob: RegExp; source_type: ExtractedConfigField['source_type'] }[] = [
  { glob: /spine\.config\.json$/,            source_type: 'json' },
  { glob: /\.env(\.example|\.local|\.prod)?$/, source_type: 'env'  },
  { glob: /config\.json$/,                   source_type: 'json' },
  { glob: /settings\.json$/,                 source_type: 'json' },
  { glob: /manifest\.json$/,                 source_type: 'json' },
  { glob: /tsconfig[^/]*\.json$/,            source_type: 'json' },
  { glob: /migrations\/\d+_.*\.sql$/,        source_type: 'sql'  },
]
// CIL[END stable_id="~/.framework/functions/cil-config.ts:CONFIG_FILE_PATTERNS:constant"]

// CIL[DOC-VECTOR type="context" content="purpose='Regex patterns that identify config files to scan in a repo'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]








// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:extractFromJson:function" type="function" identity="extractFromJson" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Walk a JSON object and emit flat configuration fields"]
// CIL[DOC-RESPONSIBILITY responsibility="Converts a JSON file's top-level object into ExtractedConfigField records, recursing shallow nested objects"]
// CIL[DOC-CONTEXT module="framework/functions" layer="extraction" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]
// CIL[DOC-CONTRACT inputs="content: string, sourceFile: string" outputs="ExtractedConfigField[]" errors="Swallowed JSON parse failures" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Parses JSON and walks object keys, assigning primitive types and stringified defaults, recursing one level of nested objects" notable_decisions="Cap default JSON object values at 200 chars; type 'unknown' for null; recursion depth capped at prefix.length < 2"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function extractFromJson(content: string, sourceFile: string): ExtractedConfigField[] {
  const fields: ExtractedConfigField[] = []
  try {
    const obj = JSON.parse(content)
    const walk = (node: any, prefix: string) => {
      if (typeof node !== 'object' || node === null || Array.isArray(node)) return
      for (const [k, v] of Object.entries(node)) {
        const fullKey = prefix ? `${prefix}.${k}` : k
        const type = v === null ? 'unknown'
          : typeof v === 'boolean' ? 'boolean'
          : typeof v === 'number'  ? 'number'
          : typeof v === 'string'  ? 'string'
          : typeof v === 'object'  ? 'json'
          : 'unknown'
        fields.push({
          field_name:    fullKey,
          field_type:    type as ExtractedConfigField['field_type'],
          default_value: v === null ? 'null' : typeof v === 'object' ? JSON.stringify(v).slice(0, 200) : String(v),
          description:   '',
          source_file:   sourceFile,
          source_type:   'json',
        })
        
        if (typeof v === 'object' && v !== null && !Array.isArray(v) && prefix.split('.').length < 2) {
          walk(v, fullKey)
        }
      }
    }
    walk(obj, '')
  } catch {
  }
  return fields
}
// CIL[DOC-VECTOR type="context" content="purpose='Walk a JSON object and emit flat configuration fields'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-config.ts:extractFromJson:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:extractFromEnv:function" type="function" identity="extractFromEnv" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Parse an env-style file into configuration fields"]
// CIL[DOC-RESPONSIBILITY responsibility="Reads KEY=VALUE lines, skipping blanks and comments, and returns env-typed fields"]
// CIL[DOC-CONTEXT module="framework/functions" layer="extraction" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]
          // CIL[DOC-STABILITY stability="internal"]
          // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTRACT inputs="content: string, sourceFile: string" outputs="ExtractedConfigField[]" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Splits content by newline, trims, ignores blanks/comments, splits on first '=' and records key/value pairs" notable_decisions="Env values are stored verbatim; missing value becomes empty string"]
function extractFromEnv(content: string, sourceFile: string): ExtractedConfigField[] {
  const fields: ExtractedConfigField[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    
    fields.push({
      field_name:    key,
      field_type:    'env',
      default_value: val || '',
      description:   '',
      source_file:   sourceFile,
      source_type:   'env',
    })
  }
  return fields
}
// CIL[END stable_id="~/.framework/functions/cil-config.ts:extractFromEnv:function"]

// CIL[DOC-VECTOR type="context" content="purpose='Parse an env-style file into configuration fields'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


          // CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:extractFromSql:function" type="function" identity="extractFromSql" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Extract table.column definitions from SQL CREATE TABLE statements"]
// CIL[DOC-RESPONSIBILITY responsibility="Parses SQL migration files for column names to generate config field slugs"]
// CIL[DOC-CONTEXT module="framework/functions" layer="extraction" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]
// CIL[DOC-CONTRACT inputs="content: string, sourceFile: string" outputs="ExtractedConfigField[]" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Regex matches CREATE TABLE blocks and column lines, filters out constraints/indexes, emits table.column fields" notable_decisions="Uses case-insensitive regex; skips columns named like constraint keywords"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function extractFromSql(content: string, sourceFile: string): ExtractedConfigField[] {
  
  const fields: ExtractedConfigField[] = []
  const tableRe = /CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(?:\w+\.)?(\w+)\s*\(([^;]+)\)/gis
  let m: RegExpExecArray | null
  while ((m = tableRe.exec(content)) !== null) {
    const tableName = m[1]
    const body = m[2]
    const colRe = /^\s*["']?(\w+)["']?\s+([\w\s[\]()]+?)(?:\s+(?:NOT NULL|DEFAULT|PRIMARY|UNIQUE|REFERENCES|CHECK).*)?,?\s*$/gm
    let cm: RegExpExecArray | null
    while ((cm = colRe.exec(body)) !== null) {
      const colName = cm[1]
      if (['CONSTRAINT', 'PRIMARY', 'UNIQUE', 'CHECK', 'FOREIGN', 'INDEX'].includes(colName.toUpperCase())) continue
      fields.push({
        field_name:    `${tableName}.${colName}`,
        field_type:    'unknown',
        default_value: '',
        description:   '',
        source_file:   sourceFile,
        source_type:   'sql',
      })
    }
  }
  return fields
}
// CIL[DOC-VECTOR type="context" content="purpose='Extract table.column definitions from SQL CREATE TABLE statements'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-config.ts:extractFromSql:function"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:walkForConfigFiles:function" type="function" identity="walkForConfigFiles" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Recursively discover potential config files within a repository"]
// CIL[DOC-RESPONSIBILITY responsibility="Walks repo directories up to maxDepth and returns matching relative paths"]
// CIL[DOC-CONTEXT module="framework/functions" layer="extraction" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]
// CIL[DOC-CONTRACT inputs="repoPath: string, maxDepth: number=3" outputs="string[]" errors="Silently skips unreadable directories" side_effects="Reads directory listings via fs"]
// CIL[DOC-MICRO logic_summary="Recursive fs.readdirSync traversal that excludes dotfiles, build folders and node_modules, then regex-matches rel paths against CONFIG_FILE_PATTERNS" notable_decisions="Depth limit starts at 0 and compares > maxDepth; .env files allowed despite leading dot"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function walkForConfigFiles(repoPath: string, maxDepth = 3): string[] {
  const results: string[] = []
  const walk = (dir: string, depth: number) => {
    if (depth > maxDepth) return
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch { return }

    for (const entry of entries) {
      if (entry.name.startsWith('.') && !entry.name.startsWith('.env')) continue
      if (['node_modules', '.git', 'dist', 'build', '.assembled', 'coverage'].includes(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full, depth + 1)
      } else {
        const rel = path.relative(repoPath, full)
        const matched = CONFIG_FILE_PATTERNS.some(p => p.glob.test(rel))
        if (matched) results.push(rel)
      }
    }
  }
  walk(repoPath, 0)
  return results
}
// CIL[DOC-VECTOR type="context" content="purpose='Recursively discover potential config files within a repository'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-config.ts:walkForConfigFiles:function"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Netlify-style function handler for config extraction and CIL config linking"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatches status/extract/run/link actions, persists cil_config items and creates configures links"]
// CIL[DOC-CONTEXT module="framework/functions" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]
// CIL[DOC-CONTRACT inputs="ctx, body: {action, project_id, repo_path?, file_path?, selected_paths?, selected_extensions?, force?}" outputs="JSON result for status/extract/run/link" errors="Throws on missing project_id/repo_path, unknown action, or DB/FS failures" side_effects="Queries and inserts/updates items and links in adminDb"]
// CIL[DOC-MICRO logic_summary="createHandler wrapper that dispatches actions: status counts items, extract/run scans files and upserts cil_config items, link calls runLinkPass" notable_decisions="Uses resolveTypeId for 'item'; resolves 'cil_configures' link type; supports force to overwrite existing config; batches links in 500 ID chunks"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  // CIL is operator tooling — every action touches the service-role client
  // and server filesystem. System principals only; tenant callers stop here.
  requireSystemContextWithAudit(ctx)

  const action = ctx.query?.action || body?.action || 'run'
  const projectId = ctx.query?.project_id || body?.project_id
  if (!projectId) throw new Error('project_id is required')

  
  if (action === 'status') {
    const [configItems, configuresTypeId] = await Promise.all([
      adminDb.from('items').select('id', { count: 'exact' })
        .filter('data->>project_id', 'eq', projectId)
        .filter('data->>kb_type', 'eq', 'cil_config')
        .eq('is_active', true),
      resolveLinkTypeId('cil_configures').catch(() => null),
    ])

    let linkCount = 0
    if (configuresTypeId && (configItems.count || 0) > 0) {
      const { data: configIds } = await adminDb.from('items').select('id')
        .filter('data->>project_id', 'eq', projectId)
        .filter('data->>kb_type', 'eq', 'cil_config').eq('is_active', true)
      const ids = (configIds || []).map((r: any) => r.id)
      if (ids.length) {
        const { count } = await adminDb.from('links').select('id', { count: 'exact' })
          .eq('link_type_id', configuresTypeId!).in('source_id', ids)
        linkCount = count || 0
      }
    }

    return {
      project_id: projectId,
      config_items: configItems.count || 0,
      configures_links: linkCount,
    }
  }

  
  if (action === 'extract' || action === 'run') {
    
    let repoPath: string = body?.repo_path || ''
    const { data: projectItem } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
    if (!repoPath) repoPath = projectItem?.data?.repo_path || ''
    if (!repoPath) throw new Error('repo_path not set on project. Pass repo_path in request body.')
    if (!fs.existsSync(repoPath)) throw new Error(`repo_path does not exist: ${repoPath}`)

    const force = body?.force ?? false
    const filePath: string | undefined = body?.file_path
    const selectedPaths: string[] = body?.selected_paths || projectItem?.data?.selected_paths || []
    const selectedExtensions: string[] | undefined = body?.selected_extensions || projectItem?.data?.selected_extensions || undefined
    const configTypeId = await resolveTypeId('item', 'cil_config')

    let configFiles = walkForConfigFiles(repoPath)
    if (filePath) {
      configFiles = configFiles.filter(rel => rel === filePath || rel.startsWith(filePath + '/'))
    }
    if (selectedPaths.length > 0) {
      configFiles = configFiles.filter(rel => isSelectedPath(rel, selectedPaths))
    }
    if (selectedExtensions && selectedExtensions.length > 0) {
      configFiles = configFiles.filter(rel => {
        const ext = path.extname(rel).toLowerCase()
        return selectedExtensions.includes(ext)
      })
    }
    const errors: string[] = []
    let created = 0, updated = 0, skipped = 0

    
    const { data: existingConfigs } = await adminDb.from('items').select('id, data')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'eq', 'cil_config').eq('is_active', true)

    
    const existingBySlug = new Map<string, any>()
    for (const item of existingConfigs || []) {
      const slug = `${item.data?.config_table}::${item.data?.field_name}`
      existingBySlug.set(slug, item)
    }

    
    const allFields: { relFile: string; field: ExtractedConfigField }[] = []
    for (const relFile of configFiles) {
      const absFile = path.join(repoPath, relFile)
      const pattern = CONFIG_FILE_PATTERNS.find(p => p.glob.test(relFile))
      if (!pattern) continue
      try {
        const content = fs.readFileSync(absFile, 'utf-8')
        let rawFields: ExtractedConfigField[] = []
        if (pattern.source_type === 'json') rawFields = extractFromJson(content, relFile)
        else if (pattern.source_type === 'env')  rawFields = extractFromEnv(content, relFile)
        else if (pattern.source_type === 'sql')  rawFields = extractFromSql(content, relFile)
        for (const field of rawFields) allFields.push({ relFile, field })
      } catch (err) {
        errors.push(`${relFile}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    
    const now = new Date().toISOString()
    const toInsert: object[] = []
    const toUpdate: { id: string; data: object }[] = []

    for (const { relFile, field } of allFields) {
      const slug = `${relFile}::${field.field_name}`
      const existing = existingBySlug.get(slug)

      if (existing && !force) { skipped++; continue }

      const itemData = {
        kb_type:                  'cil_config',
        project_id:               projectId,
        config_table:             relFile,
        record_slug:              slug,
        field_name:               field.field_name,
        field_type:               field.field_type,
        default_value:            field.default_value,
        description:              field.description,
        settings:                 '',
        current_value_query:      '',
        current_value_query_type: field.source_type === 'env' ? 'env' : 'json_path',
        code_edge_chunk_ids:      '',
        source_type:              field.source_type,
      }

      if (existing) {
        toUpdate.push({ id: existing.id, data: { ...existing.data, ...itemData } })
        updated++
      } else {
        toInsert.push({ type_id: configTypeId, title: slug, status: 'active', is_active: true, data: itemData, created_at: now, updated_at: now })
        created++
      }
    }

    
    const insertPromises = toInsert.map((record: any) =>
      adminCreate(ctx, { ...record, entity: 'items' }).catch((e: any) => {
        errors.push(`config insert: ${e.message || e}`)
        created--
      })
    )
    const updatePromises = toUpdate.map(({ id, data }) =>
      adminUpdate({ ...ctx, query: { ...(ctx.query || {}), entity: 'items', id } } as any, { data }).catch((e: any) => {
        errors.push(`config update ${id}: ${e.message || e}`)
      })
    )
    await Promise.all([...insertPromises, ...updatePromises])

    const extractResult = {
      project_id: projectId,
      repo_path: repoPath,
      file_path: filePath || null,
      config_files_scanned: configFiles.length,
      config_items_created: created,
      config_items_updated: updated,
      config_items_skipped: skipped,
      errors,
    }

    
    if (action === 'extract') return extractResult

    
    const linkResult = await runLinkPass(ctx, projectId, errors)
    return {
      ...extractResult,
      ...linkResult,
    }
  }

  
  if (action === 'link') {
    const errors: string[] = []
    const result = await runLinkPass(ctx, projectId, errors)
    return { project_id: projectId, ...result, errors }
  }

  throw new Error(`Unknown action: ${action}. Valid: extract, link, run, status`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Netlify-style function handler for config extraction and CIL config linking'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-config.ts:handler:constant"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-config.ts:runLinkPass:function" type="function" identity="runLinkPass" parent="~/.framework/functions/cil-config.ts"]
// CIL[DOC-MACRO purpose="Create cil_configures links between config items and code chunks"]
// CIL[DOC-RESPONSIBILITY responsibility="Matches config field names against chunk code content and inserts missing links"]
// CIL[DOC-CONTEXT module="framework/functions" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-config.ts"]
// CIL[DOC-CONTRACT inputs="ctx, projectId: string, errors: string[]" outputs="{configures_links_created: number}" errors="N/A" side_effects="Inserts links into adminDb"]
// CIL[DOC-MICRO logic_summary="Fetches config and chunk items, searches chunk code for field or env patterns, deduplicates against existing links, inserts new links" notable_decisions="Env fields match process.env.<name>; non-env match short name word boundary; 500 ID IN limit for existing link checks"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function runLinkPass(
  ctx: any,
  projectId: string,
  errors: string[]
): Promise<{ configures_links_created: number }> {
  const configuresTypeId = await resolveLinkTypeId('cil_configures').catch(() => null)
  if (!configuresTypeId) return { configures_links_created: 0 }

  
  const [{ data: configItems }, { data: chunkItems }] = await Promise.all([
    adminDb.from('items').select('id, account_id, data')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'eq', 'cil_config').eq('is_active', true),
    adminDb.from('items').select('id, account_id, data')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'eq', 'cil_chunk').eq('is_active', true),
  ])

  if (!configItems?.length || !chunkItems?.length) return { configures_links_created: 0 }

  
  
  const configIds = configItems.map((c: any) => c.id)
  const SUPABASE_IN_LIMIT = 500
  const existingLinkPairs = new Set<string>()
  for (let i = 0; i < configIds.length; i += SUPABASE_IN_LIMIT) {
    const { data: existingLinks } = await adminDb.from('links').select('source_id, target_id')
      .in('source_id', configIds.slice(i, i + SUPABASE_IN_LIMIT))
      .eq('link_type_id', configuresTypeId)
    for (const l of existingLinks || []) {
      existingLinkPairs.add(`${l.source_id}:${l.target_id}`)
    }
  }

  
  const toInsert: { data: Record<string, any>; accountId: string }[] = []

  for (const configItem of configItems) {
    const fieldName: string = configItem.data?.field_name || ''
    if (!fieldName || fieldName.length < 2) continue

    const shortName = fieldName.split('.').pop()!
    const isEnv = configItem.data?.source_type === 'env'
    const searchPattern = isEnv
      ? new RegExp(`process\\.env\\.${fieldName}\\b`)
      : new RegExp(`\\b${shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)

    for (const chunk of chunkItems) {
      const code: string = chunk.data?.code_content || ''
      if (!code) continue
      if (!searchPattern.test(code)) continue

      const pairKey = `${configItem.id}:${chunk.id}`
      if (existingLinkPairs.has(pairKey)) continue 

      existingLinkPairs.add(pairKey) 
      toInsert.push({
        data: {
          source_id:    configItem.id,
          source_type:  configItem.data?.kb_type,
          target_id:    chunk.id,
          target_type:  chunk.data?.kb_type,
          link_type_id: configuresTypeId,
          metadata:     { field_name: fieldName, matched_in_chunk: chunk.data?.chunk_name || '' },
        },
        accountId: configItem.account_id,
      })
    }
  }

  
  let linksCreated = 0
  const linkPromises = toInsert.map(({ data }) =>
    adminCreate(ctx, { entity: 'links', type_slug: 'link', ...data }).then(() => {
      linksCreated++
    }).catch((e: any) => {
      errors.push(`config-link insert: ${e.message || e}`)
    })
  )
  await Promise.all(linkPromises)

  return { configures_links_created: linksCreated }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create cil_configures links between config items and code chunks'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-config.ts:runLinkPass:function"]




