// Both scripts honour SPINE_PROJECT_ROOT so tests never touch the real .assembled tree. NB: .framework/scripts/ holds stale packaged copies — tests must point at /scripts.
import { describe, it, expect, afterEach } from 'vitest'
import {
  mkdtempSync, mkdirSync, writeFileSync, symlinkSync,
  existsSync, rmSync, readFileSync,
} from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { spawnSync } from 'child_process'

// NB: .framework/scripts/ contains stale packaged copies of these scripts —
// the tests must run the live ones at repo root /scripts.
const REPO = resolve(__dirname, '../../..')
const FRONTEND_SCRIPT = join(REPO, 'scripts/assemble-frontend.sh')
const FUNCTIONS_SCRIPT = join(REPO, 'scripts/assemble-functions.sh')

const roots: string[] = []

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'spine-asm-'))
  roots.push(root)
  mkdirSync(join(root, '.framework/src'), { recursive: true })
  writeFileSync(join(root, '.framework/src/main.tsx'), 'export {}')
  mkdirSync(join(root, '.framework/functions'), { recursive: true })
  writeFileSync(join(root, '.framework/functions/handler.ts'), 'export const framework = true\n')
  mkdirSync(join(root, 'custom/apps'), { recursive: true })
  return root
}

function addApp(root: string, slug: string, files: Record<string, string>) {
  for (const [rel, content] of Object.entries(files)) {
    const p = join(root, 'custom/apps', slug, rel)
    mkdirSync(join(p, '..'), { recursive: true })
    writeFileSync(p, content)
  }
}

function run(script: string, root: string) {
  return spawnSync('bash', [script], {
    env: { ...process.env, SPINE_PROJECT_ROOT: root },
    encoding: 'utf8',
    timeout: 60_000,
  })
}

afterEach(() => {
  while (roots.length) rmSync(roots.pop()!, { recursive: true, force: true })
})

describe('assemble-frontend.sh', () => {
  it('lays out each app under src/<slug>/ with no basename flattening', () => {
    const root = makeRoot()
    addApp(root, 'appone', {
      'index.tsx': 'export {}',
      'components/widget.tsx': 'export {}',
      'functions/fn.ts': 'export {}',
      'seed/types.json': '{}',
      'public/icon.svg': '<svg/>',
      '.hidden': 'x',
    })
    const r = run(FRONTEND_SCRIPT, root)
    expect(r.status, r.stderr).toBe(0)
    const src = join(root, '.assembled/src')
    expect(existsSync(join(src, 'appone/index.tsx'))).toBe(true)
    expect(existsSync(join(src, 'appone/components/widget.tsx'))).toBe(true)
    // no flattening: app's components must not appear at src root
    expect(existsSync(join(src, 'components/widget.tsx'))).toBe(false)
    // exclusions
    expect(existsSync(join(src, 'appone/functions'))).toBe(false)
    expect(existsSync(join(src, 'appone/seed'))).toBe(false)
    expect(existsSync(join(src, 'appone/.hidden'))).toBe(false)
    // public assets merge into project public/
    expect(existsSync(join(root, 'public/icon.svg'))).toBe(true)
  })

  it('hard-errors when two apps publish the same public path with different content', () => {
    const root = makeRoot()
    addApp(root, 'appone', { 'public/x.txt': 'one' })
    addApp(root, 'apptwo', { 'public/x.txt': 'two' })
    const r = run(FRONTEND_SCRIPT, root)
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('x.txt')
    expect(r.stderr).toContain('appone')
    expect(r.stderr).toContain('apptwo')
  })

  it('also catches app-vs-framework public collisions', () => {
    const root = makeRoot()
    mkdirSync(join(root, '.framework/public'), { recursive: true })
    writeFileSync(join(root, '.framework/public/logo.svg'), 'framework')
    addApp(root, 'appone', { 'public/logo.svg': 'app' })
    const r = run(FRONTEND_SCRIPT, root)
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('logo.svg')
  })

  it('tolerates identical duplicate public assets', () => {
    const root = makeRoot()
    addApp(root, 'appone', { 'public/x.txt': 'same-bytes' })
    addApp(root, 'apptwo', { 'public/x.txt': 'same-bytes' })
    const r = run(FRONTEND_SCRIPT, root)
    expect(r.status, r.stderr).toBe(0)
    expect(readFileSync(join(root, 'public/x.txt'), 'utf8')).toBe('same-bytes')
  })
})

describe('assemble-functions.sh', () => {
  it('hard-errors when a custom function basename collides with a staged file', () => {
    const root = makeRoot()
    addApp(root, 'appone', { 'functions/handler.ts': 'export const app = true\n' })
    const r = run(FUNCTIONS_SCRIPT, root)
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('handler.ts')
    expect(r.stderr).toContain('appone')
  })

  it('hard-errors on app-vs-app basename collisions', () => {
    const root = makeRoot()
    addApp(root, 'appone', { 'functions/dup.ts': 'export {}' })
    addApp(root, 'apptwo', { 'functions/dup.ts': 'export {}' })
    const r = run(FUNCTIONS_SCRIPT, root)
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('dup.ts')
    expect(r.stderr).toContain('appone')
    expect(r.stderr).toContain('apptwo')
  })

  it('silently skips symlink dev-aliases into .framework/functions', () => {
    const root = makeRoot()
    const appFns = join(root, 'custom/apps/appone/functions')
    mkdirSync(appFns, { recursive: true })
    symlinkSync(
      '../../../../.framework/functions/handler.ts',
      join(appFns, 'handler.ts')
    )
    const r = run(FUNCTIONS_SCRIPT, root)
    expect(r.status, r.stderr).toBe(0)
    // staged file is the framework copy, not the alias
    expect(
      readFileSync(join(root, '.assembled/netlify/functions/handler.ts'), 'utf8')
    ).toContain('framework')
  })

  it('still hard-errors on symlinks that resolve outside .framework/functions', () => {
    const root = makeRoot()
    const appFns = join(root, 'custom/apps/appone/functions')
    mkdirSync(appFns, { recursive: true })
    writeFileSync(join(root, 'custom/apps/appone/real-handler.ts'), 'export {}')
    symlinkSync('../real-handler.ts', join(appFns, 'handler.ts'))
    const r = run(FUNCTIONS_SCRIPT, root)
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('handler.ts')
  })

  it('stages non-colliding custom functions normally', () => {
    const root = makeRoot()
    addApp(root, 'appone', { 'functions/custom_thing.ts': 'export {}' })
    const r = run(FUNCTIONS_SCRIPT, root)
    expect(r.status, r.stderr).toBe(0)
    expect(
      existsSync(join(root, '.assembled/netlify/functions/custom_thing.ts'))
    ).toBe(true)
  })
})
