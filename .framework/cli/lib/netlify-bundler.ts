// Parse the function-bundler settings out of a generated netlify.toml so
// local bundling checks (verify:exports) simulate the bundler the deploy
// actually uses — never a second, hardcoded copy of the externals list.
// Netlify's own build remains the packaging authority; this keeps the
// pre-filter honest.

export interface NetlifyBundlerConfig {
  /** `[functions] node_bundler` value, or null when unset (Netlify default) */
  bundler: string | null
  /** `[functions] external_node_modules` list (empty when unset) */
  externals: string[]
}

export function netlifyBundlerConfig(toml: string): NetlifyBundlerConfig {
  const extMatch = /external_node_modules\s*=\s*\[([^\]]*)\]/.exec(toml)
  const externals = extMatch
    ? [...extMatch[1].matchAll(/["']([^"']+)["']/g)].map(m => m[1])
    : []
  const bundler = /node_bundler\s*=\s*["']([^"']+)["']/.exec(toml)?.[1] ?? null
  return { bundler, externals }
}
