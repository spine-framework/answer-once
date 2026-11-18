// Asserts config/tsconfig.json and config/vite.config.ts agree on where
// @custom/* resolves — the two mappings diverged once (custom/* vs
// custom/apps/*) and the docs inherited the split.
// (decision spine-framework:0025-custom-import-alias)
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const CONFIG_DIR = resolve(ROOT, 'config')

describe('@custom/* import alias parity', () => {
  it('tsconfig paths and the vite alias resolve @custom to the same directory', () => {
    const tsconfig = readFileSync(resolve(CONFIG_DIR, 'tsconfig.json'), 'utf8')
    const vite = readFileSync(resolve(CONFIG_DIR, 'vite.config.ts'), 'utf8')

    // tsconfig: "@custom/*": ["../custom/apps/*"] — baseUrl is config/
    const tsMatch = tsconfig.match(/"@custom\/\*"\s*:\s*\[\s*"([^"]+)"/)
    // vite: '@custom': path.resolve(__dirname, '../custom/apps')
    const viteMatch = vite.match(/'@custom'\s*:\s*path\.resolve\(__dirname,\s*'([^']+)'\)/)

    expect(tsMatch, 'tsconfig must declare a @custom/* path entry').toBeTruthy()
    expect(viteMatch, 'vite.config must declare a @custom alias').toBeTruthy()

    const tsTarget = resolve(CONFIG_DIR, tsMatch![1].replace(/\/\*$/, ''))
    const viteTarget = resolve(CONFIG_DIR, viteMatch![1])

    expect(viteTarget).toBe(tsTarget)
  })
})
