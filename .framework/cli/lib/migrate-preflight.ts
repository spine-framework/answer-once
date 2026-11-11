// CIL[BEGIN stable_id="~/.framework/cli/lib/migrate-preflight.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// migrate --preflight — read-only reference simulation for pending migrations.
//
// For every pending migration in apply order, each UPDATE slug/name
// reference (same extraction as the migration-refs lint) is resolved:
//
//   pending NNN  — an earlier pending migration (or an earlier statement in
//                  the same file) inserts the value in this run
//   observed     — not provided by the pending set, but a live SELECT on the
//                  target DB finds the row
//   missing      — neither; blocks migrate unless --skip-preflight
//
// `ref-ok` annotations suppress checks entirely; `ref-optional` downgrades a
// missing reference to a warning. Nothing here writes — no CREATE, no
// INSERT, no _spine_migrations rows.

import {
  extractRefs, extractInserts, extractAnnotations, statementBounds,
  type RefColumn,
} from './migration-refs.ts'
// CIL[END stable_id="~/.framework/cli/lib/migrate-preflight.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/migrate-preflight.ts:preflightcheck:interface" type="interface" identity="PreflightCheck" parent="none"]
export interface PreflightCheck {
  file: string
  line: number
  table: string
  column: RefColumn
  value: string
  /** pending = provided by a pending migration; observed = row exists in DB;
   *  missing = blocks; optional-missing = warns (ref-optional annotated) */
  status: 'pending' | 'observed' | 'missing' | 'optional-missing' | 'ok'
  /** migration that provides the value, when status is 'pending' */
  pendingFrom?: string
}
// CIL[END stable_id="~/.framework/cli/lib/migrate-preflight.ts:preflightcheck:interface"]

/** Injectable DB probe — the migrate command binds a real pg client. */
// CIL[BEGIN stable_id="~/.framework/cli/lib/migrate-preflight.ts:dbprobe:interface" type="interface" identity="DbProbe" parent="none"]
export interface DbProbe {
  hasRow(table: string, column: RefColumn, value: string): Promise<boolean>
}
// CIL[END stable_id="~/.framework/cli/lib/migrate-preflight.ts:dbprobe:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/migrate-preflight.ts:preflightoutcome:interface" type="interface" identity="PreflightOutcome" parent="none"]
export interface PreflightOutcome {
  checks: PreflightCheck[]
  blocked: PreflightCheck[]
  warnings: PreflightCheck[]
}
// CIL[END stable_id="~/.framework/cli/lib/migrate-preflight.ts:preflightoutcome:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/migrate-preflight.ts:runpreflight:function" type="function" identity="runPreflight" parent="none"]
export async function runPreflight(opts: {
  /** Pending migrations only, in apply order. */
  migrations: { name: string; sql: string }[]
  probe: DbProbe
}): Promise<PreflightOutcome> {
  const checks: PreflightCheck[] = []
  const provided = new Map<string, Map<string, string>>() // table.col -> value -> file
  const add = (t: string, c: RefColumn, v: string, file: string) => {
    const key = `${t}.${c}`
    if (!provided.has(key)) provided.set(key, new Map())
    provided.get(key)!.set(v, file)
  }

  // DB observations are cached per reference value.
  const observedCache = new Map<string, Promise<boolean>>()
  const observe = (t: string, c: RefColumn, v: string) => {
    const key = `${t}.${c}.${v}`
    if (!observedCache.has(key)) {
      observedCache.set(key, opts.probe.hasRow(t, c, v).catch(() => false))
    }
    return observedCache.get(key)!
  }

  for (const mig of opts.migrations) {
    const refs = extractRefs(mig.sql, mig.name).sort((a, b) => a.line - b.line)
    const inserts = extractInserts(mig.sql, mig.name)
    const anns = extractAnnotations(mig.sql)
    const stmts = statementBounds(mig.sql)

    let insCursor = 0
    const sortedIns = [...inserts].sort((a, b) => a.statementIndex - b.statementIndex)
    for (const ref of refs) {
      while (insCursor < sortedIns.length && sortedIns[insCursor].statementIndex < ref.statementIndex) {
        const v = sortedIns[insCursor++]
        add(v.table, v.column, v.value, mig.name)
      }

      // Same scoping as the lint: trailing-on-same-line first, then the
      // nearest standalone annotation inside or directly above the statement.
      let ann = anns.find(a => !a.standalone && a.line === ref.line)
      const stmt = stmts[ref.statementIndex]
      const prevEnd = ref.statementIndex > 0 ? stmts[ref.statementIndex - 1].endLine : 0
      if (!ann && stmt) {
        ann = anns.filter(a => a.standalone && a.line > prevEnd && a.line < stmt.startLine)
          .sort((a, b) => b.line - a.line)[0]
          ?? anns.filter(a => a.standalone && a.line >= stmt.startLine && a.line <= ref.line)
            .sort((a, b) => b.line - a.line)[0]
      }
      if (ann?.kind === 'ok') {
        checks.push({ ...refFields(ref), status: 'ok' })
        continue
      }

      const pendingFrom = provided.get(`${ref.table}.${ref.column}`)?.get(ref.value)
      if (pendingFrom) {
        checks.push({ ...refFields(ref), status: 'pending', pendingFrom })
        continue
      }

      const present = await observe(ref.table, ref.column, ref.value)
      if (present) {
        checks.push({ ...refFields(ref), status: 'observed' })
      } else if (ann?.kind === 'optional') {
        checks.push({ ...refFields(ref), status: 'optional-missing' })
      } else {
        checks.push({ ...refFields(ref), status: 'missing' })
      }
    }

    for (const v of inserts) add(v.table, v.column, v.value, mig.name)
  }

  return {
    checks,
    blocked: checks.filter(c => c.status === 'missing'),
    warnings: checks.filter(c => c.status === 'optional-missing'),
  }
}
// CIL[END stable_id="~/.framework/cli/lib/migrate-preflight.ts:runpreflight:function"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/migrate-preflight.ts:reffields:function" type="function" identity="refFields" parent="none"]
function refFields(ref: { file: string; line: number; table: string; column: RefColumn; value: string }) {
  return { file: ref.file, line: ref.line, table: ref.table, column: ref.column, value: ref.value }
}
// CIL[END stable_id="~/.framework/cli/lib/migrate-preflight.ts:reffields:function"]
