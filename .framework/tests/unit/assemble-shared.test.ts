// Decision spine-framework:0035 — custom/shared/ is the project-owned
// location for domain modules both trees consume: staged to
// .assembled/netlify/functions/_shared/domain/ (functions) and reachable
// via the @domain alias (frontend). Fixture test per assembly-scripts.test.
import { describe, it, expect, afterEach } from 'vitest'
import {
  mkdtempSync, mkdirSync, writeFileSync,
  existsSync, rmSync, readFileSync,
} from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { spawnSync } from 'child_process'

const REPO = resolve(__dirname, '../../..')
const FUNCTIONS_SCRIPT = join(REPO, 'scripts/assemble-functions.sh')
const TSCONFIG = join(REPO, 'config/tsconfig.json')
const VITECONFIG = join(REPO, 'config/vite.config.ts')

const roots: string[] = []

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'spine-shared-'))
  roots.push(root)
  mkdirSync(join(root, '.framework/functions/_shared'), { recursive: true })
  writeFileSync(join(root, '.framework/functions/handler.ts'), 'export const framework = true\n')
  mkdirSync(join(root, 'custom/functions'), { recursive: true })
  return root
}

afterEach(() => {
  while (roots.length) rmSync(roots.pop()!, { recursive: true, force: true })
})

describe('custom/shared assembly', () => {
  it('stages custom/shared into _shared/domain for function imports', () => {
    const root = makeRoot()
    mkdirSync(join(root, 'custom/shared'), { recursive: true })
    writeFileSync(join(root, 'custom/shared/engine.ts'), 'export const price = () => 42\n')
    const r = spawnSync('bash', [FUNCTIONS_SCRIPT], {
      env: { ...process.env, SPINE_PROJECT_ROOT: root },
      encoding: 'utf8', timeout: 60_000,
    })
    expect(r.status, r.stderr).toBe(0)
    const staged = join(root, '.assembled/netlify/functions/_shared/domain/engine.ts')
    expect(existsSync(staged)).toBe(true)
    expect(readFileSync(staged, 'utf8')).toContain('price')
  })

  it('is a no-op when custom/shared does not exist', () => {
    const root = makeRoot()
    const r = spawnSync('bash', [FUNCTIONS_SCRIPT], {
      env: { ...process.env, SPINE_PROJECT_ROOT: root },
      encoding: 'utf8', timeout: 60_000,
    })
    expect(r.status, r.stderr).toBe(0)
    expect(existsSync(join(root, '.assembled/netlify/functions/_shared/domain'))).toBe(false)
  })

  it('the @domain alias resolves custom/shared in both configs', () => {
    const tsRaw = readFileSync(TSCONFIG, 'utf8')
    expect(tsRaw).toMatch(/"@domain\/\*":\s*\["\.\.\/custom\/shared\/\*"\]/)
    expect(readFileSync(VITECONFIG, 'utf8')).toMatch(/'@domain':\s*path\.resolve\(__dirname, '\.\.\/custom\/shared'\)/)
  })
})
