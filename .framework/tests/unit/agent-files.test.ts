import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  loadProjectProfile,
  syncAgentFiles,
  collectAgentFileHashes,
  mergeAgentsFile,
  findAgentsBlock,
  agentsBlockVersion,
  renderAgentTemplate,
  writeFrozenManifest,
  AGENTS_BEGIN_RE,
  AGENTS_END_RE,
} from '../../cli/lib/project-files.ts'
import { validateDesignSchema } from '../../cli/commands/validate-schema.ts'

// The repo root doubles as the package root — the shipped templates live at
// .framework/templates/agent/ relative to it.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const AGENT_SRC = join(REPO_ROOT, '.framework/templates/agent')
const TEMPLATE_PATH = join(AGENT_SRC, 'AGENTS.md')
const SKILLS_SRC = join(AGENT_SRC, 'skills')

let workdir: string

beforeEach(() => {
  workdir = mkdtempSync(join(tmpdir(), 'spine-agent-files-'))
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  rmSync(workdir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

/* ---------------- template + skill asset lint ---------------- */

describe('AGENTS.md template', () => {
  const template = readFileSync(TEMPLATE_PATH, 'utf8')

  it('carries the marker pair and the version placeholder', () => {
    expect(template).toContain('<!-- spine-framework:begin version={{SPINE_VERSION}} -->')
    expect(template).toContain('<!-- spine-framework:end -->')
    expect(template).toContain('never overwritten by spine-framework upgrade')
  })

  it('contains the required framework-rule sections', () => {
    for (const required of [
      'design_schema',
      'record_permissions',
      'admin-data',
      'custom/',
      'data_type',
      'display_type',
      '.framework/src/instructions/',
      '.devin/skills/',
      'npm run typecheck',
      'npm run test',
      'npm run verify',
      'npx spine-framework validate-schema',
    ]) {
      expect(template, required).toContain(required)
    }
  })

  it('excludes CIL-specific content (not shipped to customers)', () => {
    expect(template).not.toMatch(/\bcil_\w+/)
    expect(template).not.toContain('DOC-')
    expect(template).not.toContain('CIL[')
  })

  it('cites only .framework/.devin paths that exist in the package', () => {
    // Mirror of docs-lint check 5 — only vendored-tree paths are checked;
    // custom/, .env, and app-relative paths live in the customer project, not
    // this repo. Globs/placeholders are skipped.
    for (const m of template.matchAll(/`([^\s`]+)`/g)) {
      const p = m[1].replace(/[.,;:)]+$/, '')
      if (p.includes('*') || p.includes('<') || p.includes('{')) continue
      if (!/^\.(framework|devin)\//.test(p)) continue
      expect(existsSync(join(REPO_ROOT, p)), p).toBe(true)
    }
  })
})

describe('spine-* skill files', () => {
  const skillDirs = readdirSync(SKILLS_SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('spine-'))
    .map((d) => d.name)

  it('ships the expected skill set', () => {
    expect(skillDirs.sort()).toEqual([
      'spine-add-ai-agent',
      'spine-add-automation',
      'spine-add-integration',
      'spine-architect',
      'spine-decision-capture',
      'spine-install-app',
      'spine-migration',
      'spine-new-app',
      'spine-new-function',
      'spine-new-type',
      'spine-schema',
      'spine-test',
      'spine-troubleshoot',
      'spine-upgrade',
    ])
  })

  for (const dir of skillDirs) {
    it(`${dir}/SKILL.md has valid frontmatter and cites real paths`, () => {
      const file = join(SKILLS_SRC, dir, 'SKILL.md')
      const src = readFileSync(file, 'utf8')
      expect(src.startsWith('---'), 'missing frontmatter').toBe(true)
      const fmEnd = src.indexOf('\n---', 3)
      expect(fmEnd, 'unterminated frontmatter').toBeGreaterThan(-1)
      const fm = src.slice(3, fmEnd)
      expect(fm).toMatch(/^name:\s*.+$/m)
      expect(fm).toMatch(/^description:\s*.+$/m)
      expect(fm).toMatch(/^allowed-tools:/m)
      expect(fm).toContain(`name: ${dir}`)
      // Procedural body — a Steps/procedure section and sane length.
      const body = src.slice(fmEnd + 4)
      expect(body.length).toBeGreaterThan(400)
      // Backticked .framework/.devin paths must exist (docs-lint check 5).
      for (const m of src.matchAll(/`([^\s`]+)`/g)) {
        const p = m[1].replace(/[.,;:)]+$/, '')
        if (p.includes('*') || p.includes('<') || p.includes('{')) continue
        if (!/^\.(framework|devin)\//.test(p)) continue
        expect(existsSync(join(REPO_ROOT, p)), `${dir} cites missing path ${p}`).toBe(true)
      }
      // No MCP / CIL tooling references — those don't ship.
      expect(src).not.toMatch(/\bcil_\w+/)
      expect(src).not.toContain('mcp_call_tool')
    })
  }
})

/* ---------------- init-side sync + manifest ---------------- */

describe('syncAgentFiles — init path (real package templates)', () => {
  it('writes AGENTS.md with the version substituted and copies all skills', () => {
    const profile = loadProjectProfile(REPO_ROOT)
    const actions = syncAgentFiles({
      pkgRoot: REPO_ROOT,
      projectRoot: workdir,
      entries: profile.agent_files ?? [],
      version: '9.9.9',
    })

    expect(actions.map((a) => a.rel).sort()).toEqual(['.devin/skills', 'AGENTS.md'])

    const agents = readFileSync(join(workdir, 'AGENTS.md'), 'utf8')
    expect(agents).toContain('<!-- spine-framework:begin version=9.9.9 -->')
    expect(agents).not.toContain('{{SPINE_VERSION}}')

    const skills = readdirSync(join(workdir, '.devin/skills')).sort()
    expect(skills.length).toBe(14)
    for (const name of skills) {
      expect(name.startsWith('spine-')).toBe(true)
      expect(existsSync(join(workdir, '.devin/skills', name, 'SKILL.md'))).toBe(true)
    }
  })

  it('records every installed asset in the manifest agent_files map', () => {
    const profile = loadProjectProfile(REPO_ROOT)
    syncAgentFiles({
      pkgRoot: REPO_ROOT,
      projectRoot: workdir,
      entries: profile.agent_files ?? [],
      version: '9.9.9',
    })
    const hashes = collectAgentFileHashes(workdir, profile.agent_files ?? [])

    expect(hashes['AGENTS.md']).toMatch(/^sha256:[0-9a-f]{64}$/)
    const skillEntries = Object.keys(hashes).filter((k) => k.startsWith('.devin/skills/spine-'))
    expect(skillEntries.length).toBe(14)

    mkdirSync(join(workdir, '.framework/cli'), { recursive: true })
    writeFileSync(join(workdir, '.framework/cli/x.ts'), 'export {}\n')
    writeFrozenManifest({
      projectRoot: workdir,
      frameworkVersion: '9.9.9',
      frameworkDeps: [],
      agentFiles: hashes,
    })
    const manifest = JSON.parse(readFileSync(join(workdir, '.spine-manifest.json'), 'utf8'))
    // agent files live outside `files` — sealing them would break verify.
    expect(manifest.files['AGENTS.md']).toBeUndefined()
    expect(Object.keys(manifest.files).every((k) => !k.startsWith('.devin/'))).toBe(true)
    expect(manifest.agent_files['AGENTS.md']).toMatch(/^sha256:/)
    expect(Object.keys(manifest.agent_files).filter((k) => k.startsWith('.devin/skills/')).length).toBe(14)
  })
})

/* ---------------- merge semantics (upgrade path) ---------------- */

describe('mergeAgentsFile / upgrade block refresh', () => {
  const renderedNew = renderAgentTemplate(readFileSync(TEMPLATE_PATH, 'utf8'), '9.9.9')

  function agentsWithVersion(version: string, tail = ''): string {
    const rendered = renderAgentTemplate(readFileSync(TEMPLATE_PATH, 'utf8'), version)
    return tail ? `${rendered}\n${tail}` : rendered
  }

  it('replaces only the framework block and preserves the user section', () => {
    const existing = agentsWithVersion('0.0.1', '\n# My project rules\n\n- never do the thing\n')
    const merged = mergeAgentsFile(existing, renderedNew)
    expect(merged.status).toBe('replaced')
    expect(merged.text).toContain('version=9.9.9')
    expect(merged.text).not.toContain('version=0.0.1')
    expect(merged.text).toContain('# My project rules')
    expect(merged.text).toContain('- never do the thing')
  })

  it('prepends a fresh block when markers are absent', () => {
    const existing = '# Existing rules\n\nMy own AGENTS file.\n'
    const merged = mergeAgentsFile(existing, renderedNew)
    expect(merged.status).toBe('prepended')
    expect(merged.text.startsWith('<!-- spine-framework:begin version=9.9.9 -->')).toBe(true)
    expect(merged.text).toContain('# Existing rules')
    // Exactly one begin marker afterwards.
    expect(merged.text.match(AGENTS_BEGIN_RE)!.length).toBeGreaterThan(0)
    expect((merged.text.match(/spine-framework:begin/g) ?? []).length).toBe(1)
  })

  it('preserves CRLF line endings in the merged file', () => {
    const existing = agentsWithVersion('0.0.1', '\nuser tail\n').replace(/\n/g, '\r\n')
    const merged = mergeAgentsFile(existing, renderedNew)
    expect(merged.text).toContain('\r\n')
    expect(merged.text).not.toMatch(/[^\r]\n/) // no bare LF survives
    expect(merged.text).toContain('version=9.9.9')
    expect(merged.text).toContain('user tail')
  })

  it('writes the full template when AGENTS.md is missing (via syncAgentFiles)', () => {
    const profile = loadProjectProfile(REPO_ROOT)
    const actions = syncAgentFiles({
      pkgRoot: REPO_ROOT,
      projectRoot: workdir,
      entries: profile.agent_files ?? [],
      version: '9.9.9',
    })
    expect(actions.find((a) => a.rel === 'AGENTS.md')?.action).toBe('written')
    const text = readFileSync(join(workdir, 'AGENTS.md'), 'utf8')
    expect(findAgentsBlock(text.split('\n'))).not.toBeNull()
    expect(agentsBlockVersion(text)).toBe('9.9.9')
  })

  it('syncAgentFiles refreshes the block on rerun and drops removed spine-* dirs', () => {
    const profile = loadProjectProfile(REPO_ROOT)
    // Seed an "old" install: old block version + a stale spine-* dir + a customer dir.
    const oldRendered = renderAgentTemplate(readFileSync(TEMPLATE_PATH, 'utf8'), '0.0.1')
    writeFileSync(join(workdir, 'AGENTS.md'), `${oldRendered}\nuser-owned section\n`)
    mkdirSync(join(workdir, '.devin/skills/spine-removed'), { recursive: true })
    writeFileSync(join(workdir, '.devin/skills/spine-removed/SKILL.md'), 'stale\n')
    mkdirSync(join(workdir, '.devin/skills/my-own'), { recursive: true })
    writeFileSync(join(workdir, '.devin/skills/my-own/SKILL.md'), 'customer-owned\n')

    const actions = syncAgentFiles({
      pkgRoot: REPO_ROOT,
      projectRoot: workdir,
      entries: profile.agent_files ?? [],
      version: '9.9.9',
    })
    expect(actions.find((a) => a.rel === 'AGENTS.md')?.action).toBe('replaced')

    const text = readFileSync(join(workdir, 'AGENTS.md'), 'utf8')
    expect(agentsBlockVersion(text)).toBe('9.9.9')
    expect(text).toContain('user-owned section')

    expect(existsSync(join(workdir, '.devin/skills/spine-removed'))).toBe(false)
    expect(readFileSync(join(workdir, '.devin/skills/my-own/SKILL.md'), 'utf8')).toBe('customer-owned\n')
    expect(existsSync(join(workdir, '.devin/skills/spine-architect/SKILL.md'))).toBe(true)
  })

  it('dry-run reports actions without writing', () => {
    const profile = loadProjectProfile(REPO_ROOT)
    writeFileSync(join(workdir, 'AGENTS.md'), '# mine\n')
    const actions = syncAgentFiles({
      pkgRoot: REPO_ROOT,
      projectRoot: workdir,
      entries: profile.agent_files ?? [],
      version: '9.9.9',
      dryRun: true,
    })
    expect(actions.find((a) => a.rel === 'AGENTS.md')?.action).toBe('prepended')
    expect(readFileSync(join(workdir, 'AGENTS.md'), 'utf8')).toBe('# mine\n')
    expect(existsSync(join(workdir, '.devin'))).toBe(false)
  })
})

/* ---------------- validate-schema ---------------- */

const MIN_SCHEMA = {
  scope: 'account',
  fields: {
    title: { data_type: 'text', label: 'Title', required: true, system: true },
  },
  views: {
    default_list: {
      type: 'list',
      fields: { title: { display_type: 'text' } },
      default_sort: { field: 'created_at', direction: 'desc' },
    },
    default_detail: {
      type: 'detail',
      sections: [{ title: 'Details', fields: { title: { display_type: 'input' } } }],
    },
  },
  record_permissions: { 'system-admin': ['create', 'read', 'update', 'delete'] },
}

describe('validateDesignSchema', () => {
  it('accepts the minimal valid schema', () => {
    const r = validateDesignSchema(MIN_SCHEMA)
    expect(r.ok).toBe(true)
    expect(r.errors).toEqual([])
  })

  it('rejects non-object roots, missing fields, and missing record_permissions', () => {
    expect(validateDesignSchema(null).errors).toContain('design_schema must be an object')
    const noFields = validateDesignSchema({ record_permissions: { 'system-admin': ['read'] } })
    expect(noFields.errors.some((e) => e.startsWith('fields is required'))).toBe(true)
    const noPerms = validateDesignSchema({ fields: MIN_SCHEMA.fields })
    expect(noPerms.errors.some((e) => e.startsWith('record_permissions'))).toBe(true)
  })

  it('flags unknown data_type and missing options/select variants', () => {
    const schema = {
      ...MIN_SCHEMA,
      fields: {
        bad: { data_type: 'wat', label: 'X', required: true },
        sel: { data_type: 'select', label: 'S', required: true },
      },
    }
    const r = validateDesignSchema(schema)
    expect(r.errors).toContain('fields.bad has unknown data_type: wat')
    expect(r.errors.some((e) => e.includes('fields.sel') && e.includes('options'))).toBe(true)
  })

  it('flags unknown display_type inside views', () => {
    const schema = JSON.parse(JSON.stringify(MIN_SCHEMA))
    schema.views.default_list.fields.title.display_type = 'sparkles'
    const r = validateDesignSchema(schema)
    expect(r.errors.some((e) => e.includes('unknown display_type: sparkles'))).toBe(true)
  })

  it('requires views unless checkViews is disabled', () => {
    const schema = { fields: MIN_SCHEMA.fields, record_permissions: MIN_SCHEMA.record_permissions }
    expect(validateDesignSchema(schema).ok).toBe(false)
    expect(validateDesignSchema(schema, { checkViews: false }).ok).toBe(true)
  })
})
