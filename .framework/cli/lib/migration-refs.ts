// Shared migration-reference extraction for the migration-ref lint and
// `migrate --preflight`.
//
// A "reference" is a row identity a migration assumes already exists:
//   UPDATE [public.]<table> … WHERE … (slug|name) (=|IN) '…'
// on the seed-owned lookup tables. Every reference must resolve to a row
// defined in seed JSON or inserted earlier in apply order (an earlier
// migration, or an earlier statement in the same migration) — otherwise the
// UPDATE silently no-ops (see custom migration 065/067).
//
// Statement-level annotations (SQL comments, never executed):
//   -- ref-ok: <reason>        exempts the reference(s) it governs entirely
//   -- ref-optional: <reason>  downgrades an unresolved reference to a warning
// An annotation on its own line governs the whole nearest following statement;
// a trailing annotation on a code line governs only references on that line.
//
// Three parallel views over one SQL string, identical in length so offsets
// translate directly between them:
//  - masked:     comments → spaces; strings/dollar bodies intact (literals)
//  - structural: comments + all strings + all dollar bodies → spaces
//                (statement splitting — `;` inside bodies stays hidden)
//  - code:       comments + 'quoted'/"quoted" strings + data dollar bodies →
//                spaces; plpgsql dollar bodies ($$…$$ containing BEGIN/
//                DECLARE) are scanned recursively so UPDATE/INSERT statements
//                inside DO blocks are visible (keyword/paren positions)
// Positions are always found on `code`/`structural`; literal text is always
// sliced from `masked`.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const REF_TABLES = new Set([
  'ai_agents', 'prompt_configs', 'types', 'pipelines',
  'triggers', 'actions', 'link_types',
])

export type RefColumn = 'slug' | 'name'

export interface MigrationRef {
  file: string
  table: string
  column: RefColumn
  value: string
  /** 1-based line of the reference itself */
  line: number
  /** 1-based line the containing statement starts on */
  statementLine: number
  /** index of the containing top-level statement in its file */
  statementIndex: number
}

export interface ProvidedValue {
  table: string
  column: RefColumn
  value: string
  statementIndex: number
}

export interface Annotation {
  line: number
  kind: 'ok' | 'optional'
  reason: string
  /** true when the line contains only the annotation comment */
  standalone: boolean
}

export interface SeedIndex {
  [table: string]: { slugs: Set<string>; names: Set<string> }
}

interface Statement {
  start: number
  end: number
  startLine: number
  endLine: number
  index: number
}

type ScanMode = 'masked' | 'structural' | 'code'

/** A dollar-quoted body counts as code when tagged generically and carrying
 *  plpgsql markers — data payloads ($DS$, $F$, $P$ JSON) are always blanked. */
function isCodeDollarBody(tag: string, body: string): boolean {
  const t = tag.toLowerCase()
  if (t !== '$$' && t !== '$body$' && t !== '$function$' && t !== '$procedure$') return false
  return /\b(begin|declare)\b/i.test(body)
}

function scanInto(sql: string, buf: string[], mode: ScanMode, start: number, end: number): void {
  let i = start
  let inLine = false, inBlock = false, inSingle = false, inDouble = false
  let dollarTag: string | null = null
  const space = (c: string) => (c === '\n' || c === '\r' ? c : ' ')
  const blankStrs = mode !== 'masked'

  while (i < end) {
    const ch = sql[i], next = sql[i + 1]

    if (inLine) {
      if (ch === '\n') inLine = false; else buf[i] = ' '
      i++; continue
    }
    if (inBlock) {
      if (ch === '*' && next === '/') { buf[i] = ' '; buf[i + 1] = ' '; inBlock = false; i += 2 }
      else { buf[i] = space(ch); i++ }
      continue
    }
    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        if (blankStrs) for (let j = 0; j < dollarTag.length; j++) buf[i + j] = ' '
        i += dollarTag.length; dollarTag = null
      } else {
        if (blankStrs) buf[i] = space(ch)
        i++
      }
      continue
    }
    if (inSingle) {
      if (ch === "'" && next === "'") {
        if (blankStrs) { buf[i] = ' '; buf[i + 1] = ' ' }
        i += 2; continue
      }
      if (blankStrs && ch !== "'") buf[i] = space(ch)
      if (ch === "'") inSingle = false
      i++; continue
    }
    if (inDouble) {
      if (ch === '"' && next === '"') {
        if (blankStrs) { buf[i] = ' '; buf[i + 1] = ' ' }
        i += 2; continue
      }
      if (blankStrs && ch !== '"') buf[i] = space(ch)
      if (ch === '"') inDouble = false
      i++; continue
    }

    if (ch === '-' && next === '-') { buf[i] = ' '; buf[i + 1] = ' '; inLine = true; i += 2; continue }
    if (ch === '/' && next === '*') { buf[i] = ' '; buf[i + 1] = ' '; inBlock = true; i += 2; continue }
    if (ch === "'") { inSingle = true; i++; continue }
    if (ch === '"') { inDouble = true; i++; continue }
    if (ch === '$') {
      const m = sql.slice(i, end).match(/^\$[A-Za-z_]*\$/)
      if (m) {
        const tag = m[0]
        if (mode === 'code') {
          const bodyStart = i + tag.length
          const closeIdx = sql.indexOf(tag, bodyStart)
          const bodyEnd = closeIdx < 0 ? end : closeIdx
          if (isCodeDollarBody(tag, sql.slice(bodyStart, bodyEnd))) {
            for (let j = 0; j < tag.length; j++) buf[i + j] = ' '
            scanInto(sql, buf, mode, bodyStart, bodyEnd) // recurse: blank strings/comments inside the code body
            if (closeIdx < 0) { i = end; break }
            for (let j = 0; j < tag.length; j++) buf[closeIdx + j] = ' '
            i = closeIdx + tag.length
            continue
          }
        }
        if (blankStrs) for (let j = 0; j < tag.length; j++) buf[i + j] = ' '
        i += tag.length; dollarTag = tag; continue
      }
    }
    i++
  }
}

function blank(sql: string, mode: ScanMode): string {
  const buf = sql.split('')
  scanInto(sql, buf, mode, 0, sql.length)
  return buf.join('')
}

function lineIndex(sql: string): (idx: number) => number {
  const starts: number[] = [0]
  for (let i = 0; i < sql.length; i++) if (sql[i] === '\n') starts.push(i + 1)
  return (idx: number) => {
    let lo = 0, hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] <= idx) lo = mid; else hi = mid - 1
    }
    return lo + 1
  }
}

/** Split into top-level statements; boundaries come from the structural view. */
function splitStatements(sql: string, structural: string): Statement[] {
  const stmts: Statement[] = []
  const atLine = lineIndex(sql)
  let depth = 0, start = -1, index = 0
  for (let i = 0; i < structural.length; i++) {
    const ch = structural[i]
    if (ch === '(') depth++
    else if (ch === ')') depth = Math.max(0, depth - 1)
    else if (ch === ';' && depth === 0) {
      if (start >= 0) stmts.push({ start, end: i + 1, startLine: atLine(start), endLine: atLine(i), index: index++ })
      start = -1
    } else if (start < 0 && !/\s/.test(ch)) start = i
  }
  if (start >= 0) stmts.push({ start, end: sql.length, startLine: atLine(start), endLine: atLine(sql.length), index })
  return stmts
}

/** Extract ref-ok / ref-optional annotations from the raw SQL text. */
export function extractAnnotations(sql: string): Annotation[] {
  const anns: Annotation[] = []
  const lines = sql.split('\n')
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n]
    const m = line.match(/--\s*ref-(ok|optional)(?:\s*:\s*(.+?))?\s*$/)
    if (!m) continue
    const before = line.slice(0, m.index).trim()
    anns.push({ line: n + 1, kind: m[1] as 'ok' | 'optional', reason: m[2] ?? '', standalone: before === '' })
  }
  return anns
}

/** Index just past the close paren matching the `(` at openIdx, or -1. */
function matchParen(s: string, openIdx: number): number {
  let depth = 0
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === '(') depth++
    else if (s[i] === ')') { depth--; if (depth === 0) return i + 1 }
  }
  return -1
}

/** Index of the next occurrence of `keyword` (regex, anchored at i) at paren depth 0, or -1. */
function keywordAtDepth0(s: string, keyword: RegExp, from: number): number {
  for (let i = from, depth = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') { depth++; continue }
    if (ch === ')') { depth = Math.max(0, depth - 1); continue }
    if (depth === 0) {
      const m = keyword.exec(s.slice(i))
      if (!m) continue
      const before = i > 0 ? s[i - 1] : ' '
      const after = s[i + m[0].length] ?? ' '
      if (!/\w/.test(before) && !/\w/.test(after)) return i
    }
  }
  return -1
}

/** Spans of top-level parenthesised groups whose content begins with SELECT/WITH. */
function subquerySpans(struct: string, from: number): [number, number][] {
  const spans: [number, number][] = []
  for (let i = from, depth = 0; i < struct.length; i++) {
    const ch = struct[i]
    if (ch === '(') {
      if (depth === 0) {
        const end = matchParen(struct, i)
        if (end < 0) break
        if (/^\(\s*(select|with)\b/i.test(struct.slice(i, end))) spans.push([i, end])
        i = end - 1
        continue
      }
      depth++
    } else if (ch === ')') depth = Math.max(0, depth - 1)
  }
  return spans
}

/** All single-quoted literals inside a masked-text span. */
function literalsIn(s: string): { value: string; index: number }[] {
  const lits: { value: string; index: number }[] = []
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== "'") continue
    let j = i + 1, val = ''
    while (j < s.length) {
      if (s[j] === "'") {
        if (s[j + 1] === "'") { val += "'"; j += 2; continue }
        break
      }
      val += s[j]; j++
    }
    if (j < s.length) lits.push({ value: val, index: i })
    i = j
  }
  return lits
}

/**
 * Extract UPDATE … WHERE (slug|name) (=|IN) references on REF_TABLES —
 * including UPDATEs nested in plpgsql DO blocks. Subqueries are masked so
 * e.g. `app_id = (SELECT … WHERE slug='app')` is never attributed to the
 * outer table.
 */
export function extractRefs(sql: string, file: string): MigrationRef[] {
  const masked = blank(sql, 'masked')
  const structural = blank(sql, 'structural')
  const code = blank(sql, 'code')
  const atLine = lineIndex(sql)
  const refs: MigrationRef[] = []

  for (const stmt of splitStatements(sql, structural)) {
    const stmtCode = code.slice(stmt.start, stmt.end)
    const stmtMasked = masked.slice(stmt.start, stmt.end)

    const updRe = /\bupdate\s+(?:public\.)?"?(\w+)"?/gi
    let um: RegExpExecArray | null
    while ((um = updRe.exec(stmtCode)) !== null) {
      const table = um[1].toLowerCase()
      if (!REF_TABLES.has(table)) continue

      const whereRel = keywordAtDepth0(stmtCode, /^where\b/i, um.index + um[0].length)
      if (whereRel < 0) continue
      const regionCode = stmtCode.slice(whereRel)
      const regionMasked = stmtMasked.slice(whereRel)
      const regionBase = stmt.start + whereRel

      // Blank subquery spans so refs inside (SELECT …) are not attributed
      // to the outer table.
      const scrubbed = regionCode.split('')
      for (const [s, e] of subquerySpans(regionCode, 0)) {
        for (let j = s; j < e; j++) scrubbed[j] = ' '
      }
      const region = scrubbed.join('')

      // slug|name = 'literal'
      const eqRe = /(?:\w+\.)?"?(slug|name)"?\s*=\s*'/gi
      let m: RegExpExecArray | null
      while ((m = eqRe.exec(region)) !== null) {
        const litEnd = region.indexOf("'", m.index + m[0].length)
        const span = regionMasked.slice(m.index, litEnd < 0 ? regionMasked.length : litEnd + 1)
        const lits = literalsIn(span)
        if (lits.length === 0) continue
        refs.push({
          file, table,
          column: m[1].toLowerCase() as RefColumn,
          value: lits[lits.length - 1].value,
          line: atLine(regionBase + m.index),
          statementLine: stmt.startLine,
          statementIndex: stmt.index,
        })
      }

      // slug|name IN ('a','b')
      const inRe = /(?:\w+\.)?"?(slug|name)"?\s+in\s*\(/gi
      while ((m = inRe.exec(region)) !== null) {
        const openRel = m.index + m[0].length - 1
        const endRel = matchParen(region, openRel)
        if (endRel < 0) continue
        for (const lit of literalsIn(regionMasked.slice(openRel + 1, endRel - 1))) {
          refs.push({
            file, table,
            column: m[1].toLowerCase() as RefColumn,
            value: lit.value,
            line: atLine(regionBase + openRel + 1 + lit.index),
            statementLine: stmt.startLine,
            statementIndex: stmt.index,
          })
        }
      }
    }
  }
  return refs
}

/**
 * Extract slug/name values INSERT statements provide for REF_TABLES —
 * including INSERTs inside plpgsql DO blocks. Only literal VALUES rows
 * count; `INSERT … SELECT` and non-literal values are skipped (they cannot
 * satisfy a reference deterministically).
 */
export function extractInserts(sql: string, file: string): ProvidedValue[] {
  const masked = blank(sql, 'masked')
  const structural = blank(sql, 'structural')
  const code = blank(sql, 'code')
  const provided: ProvidedValue[] = []

  for (const stmt of splitStatements(sql, structural)) {
    const stmtCode = code.slice(stmt.start, stmt.end)
    const stmtMasked = masked.slice(stmt.start, stmt.end)

    const imRe = /\binsert\s+into\s+(?:public\.)?"?(\w+)"?/gi
    let im: RegExpExecArray | null
    while ((im = imRe.exec(stmtCode)) !== null) {
      const table = im[1].toLowerCase()
      if (!REF_TABLES.has(table)) continue

      // Column list: first paren group after the table name.
      const colOpen = stmtCode.indexOf('(', im.index + im[0].length)
      if (colOpen < 0) continue
      const colEnd = matchParen(stmtCode, colOpen)
      if (colEnd < 0) continue
      const cols = stmtMasked.slice(colOpen + 1, colEnd - 1)
        .split(',')
        .map(c => c.trim().replace(/^"|"$/g, '').toLowerCase())
      const slugIdx = cols.indexOf('slug')
      const nameIdx = cols.indexOf('name')
      if (slugIdx < 0 && nameIdx < 0) continue

      // VALUES rows: balanced (...) groups after the top-level VALUES keyword.
      // INSERT ... SELECT (the idempotent WHERE NOT EXISTS form) provides the
      // same values positionally — the select list ends at the first top-level
      // FROM or WHERE.
      const valuesRel = keywordAtDepth0(stmtCode, /^values\b/i, colEnd)
      if (valuesRel < 0) {
        const selectRel = keywordAtDepth0(stmtCode, /^select\b/i, colEnd)
        if (selectRel < 0) continue
        const fromRel = keywordAtDepth0(stmtCode, /^(from|where)\b/i, selectRel + 6)
        const listEnd = fromRel > 0 ? fromRel : stmt.end
        const vals: { start: number; end: number }[] = []
        let depth = 0, vStart = selectRel + 6
        for (let i = vStart; i < listEnd; i++) {
          const ch = stmtCode[i]
          if (ch === '(') depth++
          else if (ch === ')') depth--
          else if (ch === ',' && depth === 0) { vals.push({ start: vStart, end: i }); vStart = i + 1 }
        }
        vals.push({ start: vStart, end: listEnd })
        for (const [idx, col] of [[slugIdx, 'slug'], [nameIdx, 'name']] as const) {
          if (idx < 0 || idx >= vals.length) continue
          const v = vals[idx]
          const lits = literalsIn(stmtMasked.slice(v.start, v.end))
          const trimmed = stmtMasked.slice(v.start, v.end).trim()
          if (lits.length === 1 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
            provided.push({ table, column: col, value: lits[0].value, statementIndex: stmt.index })
          }
        }
        continue
      }
      let cursor = valuesRel + 6
      while (cursor < stmtCode.length) {
        const nextOpen = stmtCode.indexOf('(', cursor)
        const gap = stmtCode.slice(cursor, nextOpen < 0 ? stmtCode.length : nextOpen).trim()
        if (nextOpen < 0 || (gap !== '' && gap !== ',')) break
        const rowEnd = matchParen(stmtCode, nextOpen)
        if (rowEnd < 0) break

        // Split the row at depth-0 commas on the code view; literals come
        // from the masked text at the same offsets.
        const vals: { start: number; end: number }[] = []
        let depth = 0, vStart = nextOpen + 1
        for (let i = nextOpen + 1; i < rowEnd - 1; i++) {
          const ch = stmtCode[i]
          if (ch === '(') depth++
          else if (ch === ')') depth--
          else if (ch === ',' && depth === 0) { vals.push({ start: vStart, end: i }); vStart = i + 1 }
        }
        vals.push({ start: vStart, end: rowEnd - 1 })

        for (const [idx, col] of [[slugIdx, 'slug'], [nameIdx, 'name']] as const) {
          if (idx < 0 || idx >= vals.length) continue
          const v = vals[idx]
          const lits = literalsIn(stmtMasked.slice(v.start, v.end))
          const trimmed = stmtMasked.slice(v.start, v.end).trim()
          if (lits.length === 1 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
            provided.push({ table, column: col, value: lits[0].value, statementIndex: stmt.index })
          }
        }
        cursor = rowEnd
      }
    }
  }
  return provided
}

export interface RefProblem {
  file: string
  line: number
  table: string
  column: RefColumn
  value: string
  /** 'missing' blocks; 'optional' warns (ref-optional annotated, still missing) */
  kind: 'missing' | 'optional'
  /** what satisfied a resolved reference — only set on resolved refs when reported */
  resolvedBy?: string
}

/** Statement boundaries for a migration file — shared by the lint and the
 *  migrate --preflight annotation scoping. */
export function statementBounds(sql: string): { index: number; startLine: number; endLine: number }[] {
  return splitStatements(sql, blank(sql, 'structural'))
    .map(s => ({ index: s.index, startLine: s.startLine, endLine: s.endLine }))
}

/**
 * Lint migrations in apply order. `seedIndex` models rows considered already
 * present (seed JSON). A reference resolves when the value is in the index or
 * was inserted by an earlier statement — an earlier migration, or an earlier
 * statement in the same migration.
 */
export function lintRefs(opts: {
  migrations: { name: string; path: string; sql: string }[]
  seedIndex: SeedIndex
  /** Only report problems for these files (earlier files still provide inserts). */
  scope?: (name: string) => boolean
}): { problems: RefProblem[] } {
  const provided = new Map<string, Set<string>>()
  const add = (t: string, c: RefColumn, v: string) => {
    const key = `${t}.${c}`
    if (!provided.has(key)) provided.set(key, new Set())
    provided.get(key)!.add(v)
  }
  for (const [table, sets] of Object.entries(opts.seedIndex)) {
    for (const v of sets.slugs) add(table, 'slug', v)
    for (const v of sets.names) add(table, 'name', v)
  }

  const problems: RefProblem[] = []

  for (const mig of opts.migrations) {
    const structural = blank(mig.sql, 'structural')
    const refs = extractRefs(mig.sql, mig.name)
    const inserts = extractInserts(mig.sql, mig.name)
    const anns = extractAnnotations(mig.sql)
    const stmts = splitStatements(mig.sql, structural)
    const inScope = opts.scope ? opts.scope(mig.name) : true

    // Walk references in file order, folding in inserts from earlier
    // statements as they pass.
    let insCursor = 0
    const sortedIns = [...inserts].sort((a, b) => a.statementIndex - b.statementIndex)
    for (const ref of [...refs].sort((a, b) => a.line - b.line)) {
      while (insCursor < sortedIns.length && sortedIns[insCursor].statementIndex < ref.statementIndex) {
        const v = sortedIns[insCursor++]
        add(v.table, v.column, v.value)
      }

      // Governing annotation: trailing-on-same-line first, then the nearest
      // standalone annotation inside or directly above the statement.
      let ann = anns.find(a => !a.standalone && a.line === ref.line)
      const stmt = stmts[ref.statementIndex]
      const prevEnd = ref.statementIndex > 0 ? stmts[ref.statementIndex - 1].endLine : 0
      if (!ann && stmt) {
        ann = anns.filter(a => a.standalone && a.line > prevEnd && a.line < stmt.startLine)
          .sort((a, b) => b.line - a.line)[0]
          ?? anns.filter(a => a.standalone && a.line >= stmt.startLine && a.line <= ref.line)
            .sort((a, b) => b.line - a.line)[0]
      }
      if (ann?.kind === 'ok') continue

      const resolved = provided.get(`${ref.table}.${ref.column}`)?.has(ref.value) === true
      if (!resolved && inScope) {
        problems.push({
          file: ref.file, line: ref.line, table: ref.table,
          column: ref.column, value: ref.value,
          kind: ann?.kind === 'optional' ? 'optional' : 'missing',
        })
      }
    }

    for (const v of inserts) add(v.table, v.column, v.value)
  }

  return { problems }
}

/** Default seed table mapping when an app manifest declares no `seed` array
 *  (mirrors the fallback in install-app's seedApp). */
const DEFAULT_SEED_ENTRIES = [
  { file: 'seed/roles.json', table: 'roles' },
  { file: 'seed/types.json', table: 'types' },
  { file: 'seed/link-types.json', table: 'link_types' },
  { file: 'seed/type_permissions.json', table: 'types' },
]

/**
 * Collect seed JSON files → target table.
 * - `.framework/seeds/<table>/*.json`
 * - `custom/apps/<app>/manifest.json` `seed` entries (file relative to app dir)
 * - undeclared `seed/type_permissions.json` is appended (mirrors seedApp)
 */
export function collectSeedFiles(projectRoot: string, opts: { includeCustom: boolean }): { file: string; table: string }[] {
  const out: { file: string; table: string }[] = []

  const fwSeeds = join(projectRoot, '.framework', 'seeds')
  if (existsSync(fwSeeds)) {
    for (const dir of readdirSync(fwSeeds, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      const table = dir.name
      for (const f of readdirSync(join(fwSeeds, dir.name))) {
        if (f.endsWith('.json')) out.push({ file: join(fwSeeds, dir.name, f), table })
      }
    }
  }

  if (!opts.includeCustom) return out

  const appsDir = join(projectRoot, 'custom', 'apps')
  if (!existsSync(appsDir)) return out
  for (const app of readdirSync(appsDir, { withFileTypes: true })) {
    if (!app.isDirectory()) continue
    const appDir = join(appsDir, app.name)
    const manifestPath = join(appDir, 'manifest.json')
    if (!existsSync(manifestPath)) continue
    let manifest: Record<string, any> = {}
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) } catch { continue }

    let entries: { file: string; table: string }[]
    if (Array.isArray(manifest.seed)) {
      entries = manifest.seed
        .filter((e: any) => typeof e?.file === 'string' && typeof e?.table === 'string')
        .map((e: any) => ({ file: e.file, table: e.table }))
      const declared = new Set(entries.map(e => e.file))
      const hasPatch = (manifest.seed as any[]).some((s: any) => s?.permissions_patch)
      if (!hasPatch && !declared.has('seed/type_permissions.json')) {
        entries.push({ file: 'seed/type_permissions.json', table: 'types' })
      }
    } else {
      entries = [...DEFAULT_SEED_ENTRIES]
    }

    for (const e of entries) {
      const abs = join(appDir, e.file)
      if (existsSync(abs)) out.push({ file: abs, table: e.table })
    }
  }
  return out
}

/** Build the seed index from collected seed files (JSON arrays of records). */
export function buildSeedIndex(files: { file: string; table: string }[]): SeedIndex {
  const index: SeedIndex = {}
  for (const { file, table } of files) {
    if (!index[table]) index[table] = { slugs: new Set(), names: new Set() }
    let records: unknown
    try { records = JSON.parse(readFileSync(file, 'utf8')) } catch { continue }
    if (!Array.isArray(records)) continue
    for (const rec of records as Record<string, any>[]) {
      if (!rec || typeof rec !== 'object') continue
      if (typeof rec.slug === 'string') index[table].slugs.add(rec.slug)
      if (typeof rec.name === 'string') index[table].names.add(rec.name)
    }
  }
  return index
}
