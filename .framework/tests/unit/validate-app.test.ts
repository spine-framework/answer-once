// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/unit/validate-app.test.ts"]
// CIL[DOC-MACRO purpose="Import Vitest, filesystem fixture utilities, Commander, and validator entry points."]
// CIL[DOC-RESPONSIBILITY responsibility="Import Vitest, filesystem fixture utilities, Commander, and validator entry points."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import Vitest, filesystem fixture utilities, Commander, and validator entry points." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { Command } from 'commander'
import { validateAppStructure, registerValidateAppCommands } from '../../cli/commands/validate-app.ts'
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:root:variable" type="variable" identity="root" parent="none"]
// CIL[DOC-MACRO purpose="Declare the temporary repository root used by validator fixtures."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the temporary repository root used by validator fixtures."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mutable root path" errors="Assertion or fixture failures propagate to Vitest" side_effects="Declares module-local fixture state"]
// CIL[DOC-MICRO logic_summary="Declare the temporary repository root used by validator fixtures." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
let root: string
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:root:variable"]
// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:app:variable" type="variable" identity="app" parent="none"]
// CIL[DOC-MACRO purpose="Declare the current temporary app directory."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the current temporary app directory."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Mutable app path" errors="Assertion or fixture failures propagate to Vitest" side_effects="Declares module-local fixture state"]
// CIL[DOC-MICRO logic_summary="Declare the current temporary app directory." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
let app: string
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:app:variable"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:fixture_setup:block" type="block" identity="fixture_setup" parent="none"]
// CIL[DOC-MACRO purpose="Register fixture setup that creates a temporary root and mocks console output."]
// CIL[DOC-RESPONSIBILITY responsibility="Register fixture setup that creates a temporary root and mocks console output."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Vitest beforeEach lifecycle" outputs="Fixture paths and console spies" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers a hook that creates a temporary directory and installs console spies"]
// CIL[DOC-MICRO logic_summary="Register fixture setup that creates a temporary root and mocks console output." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'spine-validate-app-'))
  app = join(root, 'test-app')
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:fixture_setup:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:fixture_cleanup:block" type="block" identity="fixture_cleanup" parent="none"]
// CIL[DOC-MACRO purpose="Register fixture cleanup that removes the created root and restores spies."]
// CIL[DOC-RESPONSIBILITY responsibility="Register fixture cleanup that removes the created root and restores spies."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture root and Vitest mocks" outputs="Cleaned fixture and restored mocks" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers a cleanup hook"]
// CIL[DOC-MICRO logic_summary="Register fixture cleanup that removes the created root and restores spies." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  vi.restoreAllMocks()
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:fixture_cleanup:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:fixtureoptions:interface" type="interface" identity="FixtureOptions" parent="none"]
// CIL[DOC-MACRO purpose="Describe optional manifest, directory, file, and seed overrides for a fixture."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe optional manifest, directory, file, and seed overrides for a fixture."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture override values" outputs="FixtureOptions type" errors="Assertion or fixture failures propagate to Vitest" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describe optional manifest, directory, file, and seed overrides for a fixture." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
interface FixtureOptions {
  manifest?: Record<string, any>
  manifestText?: string
  dirs?: string[]
  files?: Record<string, string>
  seedJson?: Record<string, string>
}
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:fixtureoptions:interface"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:makeapp:function" type="function" identity="makeApp" parent="none"]
// CIL[DOC-MACRO purpose="Write a minimal valid temporary app with optional manifest, directory, file, and seed overrides."]
// CIL[DOC-RESPONSIBILITY responsibility="Write a minimal valid temporary app with optional manifest, directory, file, and seed overrides."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="opts: FixtureOptions default empty object" outputs="void" errors="Assertion or fixture failures propagate to Vitest" side_effects="Creates temporary app directories and writes fixture files"]
// CIL[DOC-MICRO logic_summary="Write a minimal valid temporary app with optional manifest, directory, file, and seed overrides." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function makeApp(opts: FixtureOptions = {}): void {
  mkdirSync(app, { recursive: true })
  const manifest = opts.manifest ?? {
    name: 'Test App',
    slug: 'test-app',
    version: '0.1.0',
    app_type: 'full',
    route_prefix: '/test-app',
    entry_point: 'index.tsx',
    seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }],
    config: { knowledge: { account: true } },
    registration: { enabled: true },
  }
  writeFileSync(join(app, 'manifest.json'), opts.manifestText ?? JSON.stringify(manifest))
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'test-app', version: '0.1.0', private: true }))
  writeFileSync(join(app, 'index.tsx'), 'export default () => null\n')
  for (const d of ['pages', 'functions', 'seed', ...(opts.dirs ?? [])]) {
    mkdirSync(join(app, d), { recursive: true })
  }
  writeFileSync(join(app, 'seed/roles.json'), JSON.stringify([{ slug: 'member' }]))
  for (const [rel, content] of Object.entries(opts.files ?? {})) {
    mkdirSync(dirname(join(app, rel)), { recursive: true })
    writeFileSync(join(app, rel), content)
  }
  for (const [rel, content] of Object.entries(opts.seedJson ?? {})) {
    writeFileSync(join(app, rel), content)
  }
}
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:makeapp:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:basemanifest:function" type="function" identity="baseManifest" parent="none"]
// CIL[DOC-MACRO purpose="Build the standard validator fixture manifest with supplied overrides."]
// CIL[DOC-RESPONSIBILITY responsibility="Build the standard validator fixture manifest with supplied overrides."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="overrides: Record<string, any> default empty object" outputs="Manifest fixture object" errors="Assertion or fixture failures propagate to Vitest" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build the standard validator fixture manifest with supplied overrides." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function baseManifest(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    name: 'Test App',
    slug: 'test-app',
    version: '0.1.0',
    app_type: 'full',
    route_prefix: '/test-app',
    entry_point: 'index.tsx',
    seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }],
    config: { knowledge: { account: true } },
    registration: { enabled: true },
    ...overrides,
  }
}
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:basemanifest:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:acceptance_suite:block" type="block" identity="acceptance_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register successful validation cases for current JSON seed paths, private packages, legacy app_type, source directories, and empty seeds."]
// CIL[DOC-RESPONSIBILITY responsibility="Register successful validation cases for current JSON seed paths, private packages, legacy app_type, source directories, and empty seeds."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="makeApp, baseManifest, validateAppStructure" outputs="Vitest acceptance assertions" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers test cases using temporary fixture files"]
// CIL[DOC-MICRO logic_summary="Register successful validation cases for current JSON seed paths, private packages, legacy app_type, source directories, and empty seeds." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
describe('validateAppStructure — acceptance', () => {
  it('accepts a valid app fixture using current seed/ JSON paths', () => {
    makeApp()
    expect(() => validateAppStructure(app)).not.toThrow()
  })

  it('accepts a private internal package', () => {
    makeApp()
    expect(() => validateAppStructure(app)).not.toThrow()
  })

  it('normalizes nested registration.app_type when root app_type is absent', () => {
    const m = baseManifest()
    delete m.app_type
    m.registration = { enabled: true, app_type: 'full' }
    makeApp({ manifest: m })
    expect(() => validateAppStructure(app)).not.toThrow()
  })

  it('accepts the expanded allowed source directories', () => {
    makeApp({ dirs: ['lib', 'views', 'docs', 'mcp', 'migrations', 'migrations-archive', 'tests'] })
    expect(() => validateAppStructure(app)).not.toThrow()
  })

  it('accepts an empty JSON array seed file', () => {
    makeApp({ manifest: baseManifest({ seed: [{ file: 'seed/empty.json', table: 'roles', conflict: 'slug' }] }), seedJson: { 'seed/empty.json': '[]' } })
    expect(() => validateAppStructure(app)).not.toThrow()
  })
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:acceptance_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:manifest_rules_suite:block" type="block" identity="manifest_rules_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register malformed and missing manifest, app_type precedence, invalid roots, and whitespace-name rejection cases."]
// CIL[DOC-RESPONSIBILITY responsibility="Register malformed and missing manifest, app_type precedence, invalid roots, and whitespace-name rejection cases."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers and validateAppStructure" outputs="Vitest manifest validation assertions" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers tests that mutate or remove their own fixture files"]
// CIL[DOC-MICRO logic_summary="Register malformed and missing manifest, app_type precedence, invalid roots, and whitespace-name rejection cases." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
describe('validateAppStructure — manifest rules', () => {
  it('rejects a missing manifest.json', () => {
    mkdirSync(app, { recursive: true })
    expect(() => validateAppStructure(app)).toThrowError(/manifest\.json is required/)
  })

  it('rejects malformed manifest.json', () => {
    makeApp({ manifestText: '{nope' })
    expect(() => validateAppStructure(app)).toThrowError(/not valid JSON/)
  })

  it('rejects an invalid explicit app_type', () => {
    makeApp({ manifest: baseManifest({ app_type: 'banana' }) })
    expect(() => validateAppStructure(app)).toThrowError(/app_type/)
  })

  it('rejects an invalid nested registration.app_type', () => {
    const m = baseManifest()
    delete m.app_type
    m.registration = { app_type: 'banana' }
    makeApp({ manifest: m })
    expect(() => validateAppStructure(app)).toThrowError(/app_type/)
  })

  it('still requires app_type when neither root nor nested value is present', () => {
    const m = baseManifest()
    delete m.app_type
    makeApp({ manifest: m })
    expect(() => validateAppStructure(app)).toThrowError(/app_type/)
  })

  it('lets a root app_type take precedence over the nested registration value', () => {
    const m = baseManifest({ app_type: 'backend', entry_point: undefined })
    delete m.entry_point
    m.registration = { app_type: 'full' }
    makeApp({ manifest: m })
    rmSync(join(app, 'index.tsx'))
    rmSync(join(app, 'pages'), { recursive: true })
    expect(() => validateAppStructure(app)).not.toThrow()
  })

  it('rejects a manifest.json root that is null, an array, or a primitive', () => {
    for (const body of ['null', '[1]', '"x"', '7']) {
      makeApp({ manifestText: body })
      expect(() => validateAppStructure(app), body).toThrowError(/JSON object/)
      rmSync(app, { recursive: true, force: true })
    }
  })

  it('rejects a whitespace-only manifest name', () => {
    makeApp({ manifest: baseManifest({ name: '   ' }) })
    expect(() => validateAppStructure(app)).toThrowError(/name/)
  })
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:manifest_rules_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:directory_rules_suite:block" type="block" identity="directory_rules_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register rejection of an unknown app source directory."]
// CIL[DOC-RESPONSIBILITY responsibility="Register rejection of an unknown app source directory."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="makeApp and validateAppStructure" outputs="Vitest directory validation assertion" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers a temporary fixture test"]
// CIL[DOC-MICRO logic_summary="Register rejection of an unknown app source directory." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
describe('validateAppStructure — directory rules', () => {
  it('rejects unknown directories', () => {
    makeApp({ dirs: ['junk-drawer'] })
    expect(() => validateAppStructure(app)).toThrowError(/Unknown directories/)
  })
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:directory_rules_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:seed_rules_suite:block" type="block" identity="seed_rules_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register missing, malformed, non-object, absolute, escaping, and externally linked JSON seed rejection cases."]
// CIL[DOC-RESPONSIBILITY responsibility="Register missing, malformed, non-object, absolute, escaping, and externally linked JSON seed rejection cases."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers and validateAppStructure" outputs="Vitest seed validation assertions" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers tests that create, rewrite, and remove temporary seed fixtures"]
// CIL[DOC-MICRO logic_summary="Register missing, malformed, non-object, absolute, escaping, and externally linked JSON seed rejection cases." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
describe('validateAppStructure — seed rules', () => {
  it('rejects a missing seed file', () => {
    makeApp({ manifest: baseManifest({ seed: [{ file: 'seed/nope.json', table: 'roles', conflict: 'slug' }] }) })
    expect(() => validateAppStructure(app)).toThrowError(/not found/)
  })

  it('rejects a non-.json seed file', () => {
    makeApp({
      manifest: baseManifest({ seed: [{ file: 'seed/x.sql', table: 'roles', conflict: 'slug' }] }),
      seedJson: { 'seed/x.sql': 'INSERT INTO roles VALUES (1);' },
    })
    expect(() => validateAppStructure(app)).toThrowError(/\.json/)
  })

  it('rejects a seed file that is not valid JSON', () => {
    makeApp({ seedJson: { 'seed/roles.json': '{oops' } })
    expect(() => validateAppStructure(app)).toThrowError(/valid JSON/)
  })

  it('rejects a seed JSON root that is an object not an array', () => {
    makeApp({ seedJson: { 'seed/roles.json': '{"a":1}' } })
    expect(() => validateAppStructure(app)).toThrowError(/array/)
  })

  it('rejects null, primitive, or array seed rows', () => {
    for (const body of ['[null]', '[1]', '["x"]', '[[1]]']) {
      makeApp({ seedJson: { 'seed/roles.json': body } })
      expect(() => validateAppStructure(app), body).toThrowError(/non-null object/)
      rmSync(app, { recursive: true, force: true })
    }
  })

  it('rejects a seed entry with missing file/table/conflict', () => {
    makeApp({ manifest: baseManifest({ seed: [{ file: 'seed/roles.json', conflict: 'slug' }] }) })
    expect(() => validateAppStructure(app)).toThrowError(/file, table, and conflict/)
  })

  it('rejects a whitespace-only file/table/conflict', () => {
    makeApp({ manifest: baseManifest({ seed: [{ file: '  ', table: 'roles', conflict: 'slug' }] }) })
    expect(() => validateAppStructure(app)).toThrowError(/file, table, and conflict/)
    rmSync(app, { recursive: true, force: true })
    makeApp({ manifest: baseManifest({ seed: [{ file: 'seed/roles.json', table: ' ', conflict: 'slug' }] }) })
    expect(() => validateAppStructure(app)).toThrowError(/file, table, and conflict/)
  })

  it('rejects null, array, or primitive seed entries', () => {
    for (const entry of [null, 7, 'x', ['seed/roles.json']]) {
      makeApp({ manifest: baseManifest({ seed: [entry] }) })
      expect(() => validateAppStructure(app), JSON.stringify(entry)).toThrowError(/seed entries must be objects/)
      rmSync(app, { recursive: true, force: true })
    }
  })

  it('rejects an absolute seed path', () => {
    makeApp({ manifest: baseManifest({ seed: [{ file: join(app, 'seed/roles.json'), table: 'roles', conflict: 'slug' }] }) })
    expect(() => validateAppStructure(app)).toThrowError()
  })

  it('rejects a traversal seed path escaping the app root', () => {
    writeFileSync(join(root, 'outside.json'), '[]')
    makeApp({ manifest: baseManifest({ seed: [{ file: '../outside.json', table: 'roles', conflict: 'slug' }] }) })
    expect(() => validateAppStructure(app)).toThrowError()
  })

  it('rejects a seed file that symlinks outside the app root', () => {
    const external = join(root, 'external-seed.json')
    writeFileSync(external, '[]')
    makeApp({
      manifest: baseManifest({ seed: [{ file: 'seed/external.json', table: 'roles', conflict: 'slug' }] }),
    })
    rmSync(join(app, 'seed/external.json'), { force: true })
    symlinkSync(external, join(app, 'seed/external.json'))
    expect(() => validateAppStructure(app)).toThrowError()
  })
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:seed_rules_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:component_paths_suite:block" type="block" identity="component_paths_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register entry and sidebar path confinement checks plus successful contained paths."]
// CIL[DOC-RESPONSIBILITY responsibility="Register entry and sidebar path confinement checks plus successful contained paths."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers and validateAppStructure" outputs="Vitest component path assertions" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers temporary file and symlink fixture tests"]
// CIL[DOC-MICRO logic_summary="Register entry and sidebar path confinement checks plus successful contained paths." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
describe('validateAppStructure — component path confinement', () => {
  it('rejects an entry_point escaping the app root', () => {
    writeFileSync(join(root, 'escape.tsx'), 'export default () => null\n')
    makeApp({ manifest: baseManifest({ entry_point: '../escape.tsx' }) })
    expect(() => validateAppStructure(app)).toThrowError(/entry_point/)
  })

  it('rejects an absolute entry_point outside the app root', () => {
    makeApp({ manifest: baseManifest({ entry_point: join(root, 'escape.tsx') }) })
    expect(() => validateAppStructure(app)).toThrowError(/entry_point/)
  })

  it('rejects a sidebar_component that symlinks outside the app root', () => {
    const external = join(root, 'external-sidebar.tsx')
    writeFileSync(external, 'export default () => null\n')
    makeApp({ manifest: baseManifest({ sidebar_component: 'components/Sidebar.tsx' }) })
    mkdirSync(join(app, 'components'), { recursive: true })
    symlinkSync(external, join(app, 'components/Sidebar.tsx'))
    expect(() => validateAppStructure(app)).toThrowError(/sidebar_component/)
  })

  it('accepts entry_point and sidebar_component inside the app', () => {
    makeApp({
      manifest: baseManifest({ entry_point: './index.tsx', sidebar_component: 'components/Sidebar.tsx' }),
      files: { 'components/Sidebar.tsx': 'export default () => null\n' },
    })
    expect(() => validateAppStructure(app)).not.toThrow()
  })
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:component_paths_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:isolation_suite:block" type="block" identity="isolation_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register successful validation while cwd differs from the repository and restore cwd afterward."]
// CIL[DOC-RESPONSIBILITY responsibility="Register successful validation while cwd differs from the repository and restore cwd afterward."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture app and validateAppStructure" outputs="Vitest cwd-independence assertion" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers a test that temporarily changes and restores process cwd"]
// CIL[DOC-MICRO logic_summary="Register successful validation while cwd differs from the repository and restore cwd afterward." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
describe('validateAppStructure — isolation', () => {
  it('validates without repo .env or cwd dependence and no network use', () => {
    makeApp()
    const cwd = process.cwd()
    try {
      process.chdir(root)
      expect(() => validateAppStructure(app)).not.toThrow()
    } finally {
      process.chdir(cwd)
    }
  })
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:isolation_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:command_registration_suite:block" type="block" identity="command_registration_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register a Commander assertion that validate-app appears in the command list and help."]
// CIL[DOC-RESPONSIBILITY responsibility="Register a Commander assertion that validate-app appears in the command list and help."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Command and registerValidateAppCommands" outputs="Vitest command registration assertions" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers an in-memory Commander test"]
// CIL[DOC-MICRO logic_summary="Register a Commander assertion that validate-app appears in the command list and help." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
describe('registerValidateAppCommands', () => {
  it('registers a validate-app command that appears in CLI help', () => {
    const program = new Command()
    registerValidateAppCommands(program)
    expect(program.commands.map((c) => c.name())).toContain('validate-app')
    expect(program.helpInformation()).toContain('validate-app')
  })
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:command_registration_suite:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/validate-app.test.ts:owned_types_suite:block" type="block" identity="owned_types_suite" parent="none"]
// CIL[DOC-MACRO purpose="Register owned_types shape and type-seed resolution validation cases."]
// CIL[DOC-RESPONSIBILITY responsibility="Register owned_types shape and type-seed resolution validation cases."]
// CIL[DOC-CONTEXT module="tests/unit" layer="test-unit" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="Fixture helpers and validateAppStructure" outputs="Vitest owned_types assertions" errors="Assertion or fixture failures propagate to Vitest" side_effects="Registers tests that write temporary seed fixtures"]
// CIL[DOC-MICRO logic_summary="Register owned_types shape and type-seed resolution validation cases." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
describe('validateAppStructure — owned_types', () => {
  const typesSeedEntry = { file: 'seed/types.json', table: 'types', conflict: 'kind,slug', inject_app_id: false }

  it('treats an absent owned_types as a valid optional field', () => {
    makeApp()
    expect(() => validateAppStructure(app)).not.toThrow()
  })

  it('accepts owned_types slugs that resolve to the types seed', () => {
    makeApp({
      manifest: baseManifest({
        owned_types: ['demo_thing', 'demo_other'],
        seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }, typesSeedEntry],
      }),
      seedJson: {
        'seed/types.json': JSON.stringify([
          { kind: 'item', slug: 'demo_thing' },
          { kind: 'item', slug: 'demo_other' },
        ]),
      },
    })
    expect(() => validateAppStructure(app)).not.toThrow()
  })

  it('accepts owned_types resolved by a declared non-patch types seed file', () => {
    makeApp({
      manifest: baseManifest({
        owned_types: ['demo_thing'],
        seed: [
          { file: 'seed/roles.json', table: 'roles', conflict: 'slug' },
          { file: 'seed/more-types.json', table: 'types', conflict: 'kind,slug', inject_app_id: false },
        ],
      }),
      seedJson: { 'seed/more-types.json': JSON.stringify([{ kind: 'item', slug: 'demo_thing' }]) },
    })
    expect(() => validateAppStructure(app)).not.toThrow()
  })

  it.each([
    'not-an-array',
    42,
    { slug: 'x' },
    ['ok', ''],
    ['ok', '   '],
    ['ok', 7],
    [null],
  ])('rejects malformed owned_types %j', (owned_types) => {
    makeApp({
      manifest: baseManifest({
        owned_types,
        seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }, typesSeedEntry],
      }),
      seedJson: { 'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'ok' }]) },
    })
    expect(() => validateAppStructure(app)).toThrowError(/owned_types/)
  })

  it('rejects an owned slug absent from the types seed', () => {
    makeApp({
      manifest: baseManifest({
        owned_types: ['ghost'],
        seed: [{ file: 'seed/roles.json', table: 'roles', conflict: 'slug' }, typesSeedEntry],
      }),
      seedJson: { 'seed/types.json': JSON.stringify([{ kind: 'item', slug: 'real' }]) },
    })
    expect(() => validateAppStructure(app)).toThrowError(/ghost/)
  })

  it('rejects owned_types when the app ships no types seed', () => {
    makeApp({ manifest: baseManifest({ owned_types: ['anything'] }) })
    expect(() => validateAppStructure(app)).toThrowError(/owned_types.*anything|anything.*types seed/)
  })
})
// CIL[END stable_id="~/.framework/tests/unit/validate-app.test.ts:owned_types_suite:block"]
