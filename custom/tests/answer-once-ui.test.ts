// Static UI-structure tests for Answer Once — verifies the app shell is
// self-contained: every declared route resolves to a real page file and no
// source imports reach outside the app + framework boundary.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const APP = join(__dirname, '../apps/answer-once')
const ROOT = join(APP, '../..')
const indexSrc = readFileSync(join(APP, 'index.tsx'), 'utf8')

const walk = (dir: string, out: string[] = []): string[] => {
  for (const n of readdirSync(dir, { withFileTypes: true })) {
    if (n.isSymbolicLink()) continue // dev-alias symlink into .framework — target is framework-owned
    const p = join(dir, n.name)
    if (n.isDirectory() && n.name !== 'node_modules') walk(p, out)
    else if (/\.(ts|tsx)$/.test(n.name)) out.push(p)
  }
  return out
}

describe('answer-once app shell', () => {
  it('every lazy-imported page resolves to a real file', () => {
    const imports = [...indexSrc.matchAll(/import\('(\.[^']+)'\)/g)].map((m) => m[1])
    expect(imports.length).toBeGreaterThan(0)
    for (const spec of imports) {
      const abs = join(dirname(join(APP, 'index.tsx')), spec) + '.tsx'
      expect(existsSync(abs), spec).toBe(true)
    }
  })

  it('company workspace routes exist under /company', () => {
    expect(indexSrc).toContain('/company/')
    expect(indexSrc).toContain('RequireCompany')
  })

  it('no source imports from sibling apps or monorepo-only paths', () => {
    const files = walk(APP)
    for (const f of files) {
      const src = readFileSync(f, 'utf8')
      for (const m of src.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        const spec = m[1]
        expect(spec, `${f}: ${spec}`).not.toMatch(/apps\/(demo|portal|cortex|workbench)/)
        expect(spec.startsWith('@custom/'), `${f}: ${spec}`).toBe(false)
      }
    }
  })

  it('uses only dependency-resolved or aliased imports', () => {
    const files = walk(APP)
    for (const f of files) {
      const src = readFileSync(f, 'utf8')
      for (const m of src.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        const spec = m[1]
        const allowed = spec.startsWith('.') || spec.startsWith('@core/') ||
          spec.startsWith('@shared/') || spec === 'react' || spec.startsWith('react-') ||
          spec.startsWith('lucide') || spec === 'recharts' || spec === 'remark-gfm' ||
          spec === 'crypto' || spec === 'react-router-dom' || spec === 'react-markdown'
        expect(allowed, `${f}: ${spec}`).toBe(true)
      }
    }
  })

  it('empty KB is a legal startup state — no page requires seeded articles', () => {
    // KB pages must render from query results, not assume content exists.
    // Guard: no page hardcodes an article id or a required-content fetch.
    const kbPages = walk(join(APP, 'pages')).filter((f) => /KB/i.test(f))
    expect(kbPages.length).toBeGreaterThan(0)
    for (const f of kbPages) {
      const src = readFileSync(f, 'utf8')
      expect(src, f).not.toMatch(/seed|fixture|hardcoded[_-]?article/i)
    }
  })
})
