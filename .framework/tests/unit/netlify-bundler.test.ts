import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { netlifyBundlerConfig } from '../../cli/lib/netlify-bundler.ts'

const REPO = resolve(__dirname, '../../..')

describe('netlifyBundlerConfig', () => {
  it('extracts node_bundler and external_node_modules', () => {
    const cfg = netlifyBundlerConfig(`[functions]
  node_bundler = "esbuild"
  external_node_modules = ["typescript", "pg"]
`)
    expect(cfg.bundler).toBe('esbuild')
    expect(cfg.externals).toEqual(['typescript', 'pg'])
  })

  it('defaults to empty externals and null bundler when unset', () => {
    const cfg = netlifyBundlerConfig('[functions]\n  directory = "functions"\n')
    expect(cfg.bundler).toBeNull()
    expect(cfg.externals).toEqual([])
  })

  it('matches the repo netlify.toml the exports derive from (evidence: source)', () => {
    // The exported netlify.toml is generated from the root file — if this
    // drifts, verify-exports stops simulating the real bundler config.
    const cfg = netlifyBundlerConfig(readFileSync(join(REPO, 'netlify.toml'), 'utf8'))
    expect(cfg.bundler).toBe('esbuild')
    expect(cfg.externals).toContain('typescript')
  })
})
