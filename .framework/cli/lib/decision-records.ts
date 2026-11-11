// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// Decision records — validation for git-native, version-scoped decision
// files. Records are Markdown with YAML frontmatter and live in:
//
//   .framework/decisions/                    package-owned (framework)
//   custom/apps/<slug>/decisions/            package-owned for DAHL-shipped
//                                            apps, customer-owned for apps
//                                            the customer authored
//   custom/decisions/                        customer-owned
//
// Package upgrades may overwrite package-owned records; they must never
// write to custom/decisions/ or a customer-authored app's decisions/.
//
// Ownership is derived from the app's package.json name: DAHL-shipped apps
// are published as @spine-framework/<name> or spine-framework-<name>.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { load as yamlLoad } from 'js-yaml'
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:decision_statuses:constant" type="constant" identity="DECISION_STATUSES" parent="none"]
export const DECISION_STATUSES = ['proposed', 'accepted', 'rejected', 'superseded', 'invalidated'] as const
// A record's decision may stand while its stated rationale is disproven —
// rationale_status tracks claim validity independently of the decision.
export const RATIONALE_STATUSES = ['verified', 'invalidated'] as const
// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:decision_kinds:constant" type="constant" identity="DECISION_KINDS" parent="none"]
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:decision_statuses:constant"]
export const DECISION_KINDS = ['decision', 'invariant', 'lesson', 'workaround', 'rejected-alternative'] as const
// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:decision_owners:constant" type="constant" identity="DECISION_OWNERS" parent="none"]
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:decision_kinds:constant"]
export const DECISION_OWNERS = ['package', 'customer'] as const
// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:decision_provenance:constant" type="constant" identity="DECISION_PROVENANCE" parent="none"]
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:decision_owners:constant"]
export const DECISION_PROVENANCE = ['captured', 'reconstructed', 'user-authored'] as const
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:decision_provenance:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:required_keys:constant" type="constant" identity="REQUIRED_KEYS" parent="none"]
const REQUIRED_KEYS = [
  'id', 'title', 'status', 'kind', 'owner',
  'since', 'until', 'supersedes', 'superseded_by', 'links',
  'applies_to', 'enforced_by', 'evidence', 'provenance',
] as const
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:required_keys:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:decisiondir:interface" type="interface" identity="DecisionDir" parent="none"]
export interface DecisionDir {
  /** Absolute path of the decisions/ directory */
  dir: string
  /** Path relative to repo root, for messages */
  rel: string
  owner: 'package' | 'customer'
  /** Expected `id` prefix, e.g. `spine-framework`, `answer-once`, `customer` */
  idPrefix: string
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:decisiondir:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:decisionrecord:interface" type="interface" identity="DecisionRecord" parent="none"]
export interface DecisionRecord {
  /** Path relative to repo root */
  file: string
  dir: DecisionDir
  fm: Record<string, any>
  body: string
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:decisionrecord:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:decisionproblem:interface" type="interface" identity="DecisionProblem" parent="none"]
export interface DecisionProblem {
  file: string
  level: 'error' | 'warning'
  message: string
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:decisionproblem:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:normalizepkgname:function" type="function" identity="normalizePkgName" parent="none"]
function normalizePkgName(name: string): string {
  return name.replace(/^@spine-framework\//, '').replace(/^spine-framework-/, '')
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:normalizepkgname:function"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:ispackageownedapp:function" type="function" identity="isPackageOwnedApp" parent="none"]
function isPackageOwnedApp(appDir: string): { owned: boolean; pkgPrefix: string } {
  try {
    const pkg = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8'))
    const name: string = pkg?.name ?? ''
    if (/^(@spine-framework\/|spine-framework-)/.test(name)) {
      return { owned: true, pkgPrefix: normalizePkgName(name) }
    }
  } catch {}
  return { owned: false, pkgPrefix: 'customer' }
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:ispackageownedapp:function"]

/** Enumerate every decisions/ directory in the repo with its ownership. */
// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:listdecisiondirs:function" type="function" identity="listDecisionDirs" parent="none"]
export function listDecisionDirs(repoRoot: string): DecisionDir[] {
  const dirs: DecisionDir[] = []

  const fw = join(repoRoot, '.framework', 'decisions')
  if (existsSync(fw)) dirs.push({ dir: fw, rel: '.framework/decisions', owner: 'package', idPrefix: 'spine-framework' })

  const cust = join(repoRoot, 'custom', 'decisions')
  if (existsSync(cust)) dirs.push({ dir: cust, rel: 'custom/decisions', owner: 'customer', idPrefix: 'customer' })

  const appsRoot = join(repoRoot, 'custom', 'apps')
  if (existsSync(appsRoot)) {
    for (const slug of readdirSync(appsRoot).sort()) {
      const decDir = join(appsRoot, slug, 'decisions')
      if (!existsSync(decDir)) continue
      const { owned, pkgPrefix } = isPackageOwnedApp(join(appsRoot, slug))
      dirs.push({
        dir: decDir,
        rel: `custom/apps/${slug}/decisions`,
        owner: owned ? 'package' : 'customer',
        idPrefix: pkgPrefix,
      })
    }
  }
  return dirs
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:listdecisiondirs:function"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:frontmatter_re:constant" type="constant" identity="FRONTMATTER_RE" parent="none"]
const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:frontmatter_re:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:parsedecisionfile:function" type="function" identity="parseDecisionFile" parent="none"]
export function parseDecisionFile(absPath: string, relPath: string, dir: DecisionDir): { record?: DecisionRecord; errors: string[] } {
  const errors: string[] = []
  let text: string
  try { text = readFileSync(absPath, 'utf8') } catch (e: any) { return { errors: [`unreadable: ${e.message}`] } }
  const m = FRONTMATTER_RE.exec(text)
  if (!m) return { errors: ['missing YAML frontmatter (--- ... ---)'] }
  let fm: Record<string, any>
  try {
    fm = yamlLoad(m[1]) as Record<string, any>
  } catch (e: any) {
    return { errors: [`frontmatter is not valid YAML: ${e.message}`] }
  }
  if (!fm || typeof fm !== 'object' || Array.isArray(fm)) return { errors: ['frontmatter is not a mapping'] }
  return { record: { file: relPath, dir, fm, body: m[2] }, errors }
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:parsedecisionfile:function"]

/** Resolve an applies_to/enforced_by entry to a repo-relative path (strip #symbol). */
// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:reftopath:function" type="function" identity="refToPath" parent="none"]
export function refToPath(ref: string): string {
  return String(ref).split('#')[0]
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:reftopath:function"]

// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:validateoptions:interface" type="interface" identity="ValidateOptions" parent="none"]
export interface ValidateOptions {
  /** Treat `status: proposed` records as errors (release gate). Default: warning. */
  strictProposed?: boolean
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:validateoptions:interface"]

/** Validate every decision record in the repo. Returns problems sorted by file. */
// CIL[BEGIN stable_id="~/.framework/cli/lib/decision-records.ts:validatedecisions:function" type="function" identity="validateDecisions" parent="none"]
export function validateDecisions(repoRoot: string, opts: ValidateOptions = {}): { problems: DecisionProblem[]; records: DecisionRecord[] } {
  const problems: DecisionProblem[] = []
  const records: DecisionRecord[] = []
  const push = (file: string, level: 'error' | 'warning', message: string) =>
    problems.push({ file, level, message })

  for (const dir of listDecisionDirs(repoRoot)) {
    let files: string[] = []
    try { files = readdirSync(dir.dir).filter(f => /^\d{4}-.+\.md$/.test(f)) } catch { continue }
    for (const f of files.sort()) {
      const rel = relative(repoRoot, join(dir.dir, f)).replace(/\\/g, '/')
      const { record, errors } = parseDecisionFile(join(dir.dir, f), rel, dir)
      for (const e of errors) push(rel, 'error', e)
      if (record) records.push(record)
    }
  }

  const byId = new Map<string, DecisionRecord>()
  for (const r of records) {
    const id = String(r.fm.id ?? '')
    if (byId.has(id)) push(r.file, 'error', `duplicate decision id "${id}" (also in ${byId.get(id)!.file})`)
    else byId.set(id, r)
  }

  for (const r of records) {
    const { fm, dir } = r

    for (const k of REQUIRED_KEYS) {
      if (!(k in fm)) push(r.file, 'error', `missing required field "${k}"`)
    }
    const id = String(fm.id ?? '')
    if (id && !id.startsWith(`${dir.idPrefix}:`)) {
      push(r.file, 'error', `id "${id}" must start with "${dir.idPrefix}:" in ${dir.rel}`)
    }
    if (id && !/^[a-z0-9-]+:\d{4}-[a-z0-9-]+$/.test(id)) {
      push(r.file, 'error', `id "${id}" must match <owner>:<NNNN>-<slug>`)
    }
    if (fm.status !== undefined && !DECISION_STATUSES.includes(fm.status)) {
      push(r.file, 'error', `status "${fm.status}" must be one of ${DECISION_STATUSES.join('|')}`)
    }
    if (fm.kind !== undefined && !DECISION_KINDS.includes(fm.kind)) {
      push(r.file, 'error', `kind "${fm.kind}" must be one of ${DECISION_KINDS.join('|')}`)
    }
    if (fm.owner !== undefined && !DECISION_OWNERS.includes(fm.owner)) {
      push(r.file, 'error', `owner "${fm.owner}" must be one of ${DECISION_OWNERS.join('|')}`)
    }
    if (fm.owner !== undefined && fm.owner !== dir.owner) {
      push(r.file, 'error', `owner "${fm.owner}" does not match directory ownership "${dir.owner}" (${dir.rel})`)
    }
    if (fm.provenance !== undefined && !DECISION_PROVENANCE.includes(fm.provenance)) {
      push(r.file, 'error', `provenance "${fm.provenance}" must be one of ${DECISION_PROVENANCE.join('|')}`)
    }

    for (const listKey of ['links', 'applies_to', 'enforced_by', 'evidence'] as const) {
      if (fm[listKey] !== undefined && !Array.isArray(fm[listKey])) {
        push(r.file, 'error', `"${listKey}" must be a list`)
      }
    }
    for (const scalarKey of ['supersedes', 'superseded_by'] as const) {
      if (fm[scalarKey] !== undefined && fm[scalarKey] !== null && typeof fm[scalarKey] !== 'string') {
        push(r.file, 'error', `"${scalarKey}" must be a string id or null`)
      }
    }

    // Status-specific checks.
    if (fm.status === 'superseded') {
      if (!fm.until) push(r.file, 'error', 'superseded records must set "until"')
      if (!fm.superseded_by) push(r.file, 'error', 'superseded records must set "superseded_by"')
    }
    if (fm.status === 'proposed') {
      push(r.file, opts.strictProposed ? 'error' : 'warning',
        'status "proposed" — must be accepted or rejected before release')
    }
    if (fm.rationale_status !== undefined &&
        !(RATIONALE_STATUSES as readonly string[]).includes(fm.rationale_status)) {
      push(r.file, 'error', `rationale_status "${fm.rationale_status}" must be one of ${RATIONALE_STATUSES.join('|')}`)
    }
    if (fm.status === 'invalidated' && !fm.superseded_by) {
      push(r.file, 'warning', 'invalidated records should link the correcting evidence via superseded_by or evidence[]')
    }

    // supersedes may not cross owners; links may.
    if (typeof fm.supersedes === 'string' && fm.supersedes) {
      const target = byId.get(fm.supersedes)
      if (!target) {
        push(r.file, 'error', `supersedes target "${fm.supersedes}" not found`)
      } else {
        if (target.fm.owner !== fm.owner) {
          push(r.file, 'error', `supersedes may not cross owners: "${fm.supersedes}" is ${target.fm.owner}-owned`)
        }
        if (target.fm.superseded_by !== fm.id) {
          push(r.file, 'error', `supersedes "${fm.supersedes}" but that record's superseded_by is "${target.fm.superseded_by ?? 'null'}" — must be "${fm.id}"`)
        }
      }
    }
    if (typeof fm.superseded_by === 'string' && fm.superseded_by) {
      const target = byId.get(fm.superseded_by)
      if (target && target.fm.supersedes !== fm.id) {
        push(r.file, 'error', `superseded_by "${fm.superseded_by}" but that record's supersedes is "${target.fm.supersedes ?? 'null'}" — must be "${fm.id}"`)
      }
    }

    // Path existence — only for records claiming to hold today.
    if (fm.status === 'accepted' || fm.status === 'proposed') {
      for (const ref of fm.applies_to ?? []) {
        const p = refToPath(ref)
        if (!existsSync(join(repoRoot, p))) push(r.file, 'error', `applies_to path does not exist: ${p}`)
      }
      const enforced = fm.enforced_by ?? []
      if (Array.isArray(enforced) && enforced.length === 0) {
        push(r.file, 'warning', 'enforced_by is [] — explicitly unenforced')
      }
      for (const ref of enforced) {
        const p = refToPath(ref)
        if (!existsSync(join(repoRoot, p))) push(r.file, 'error', `enforced_by path does not exist: ${p}`)
      }
    }
    // superseded/rejected records are validated against the release index of
    // their `until` version once Stage 3 lands — never against today's tree.
  }

  problems.sort((a, b) => a.file.localeCompare(b.file) || a.message.localeCompare(b.message))
  return { problems, records }
}
// CIL[END stable_id="~/.framework/cli/lib/decision-records.ts:validatedecisions:function"]
