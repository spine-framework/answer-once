// CIL[BEGIN stable_id="~/.framework/cli/commands/upgrade.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/upgrade.ts"]
// CIL[DOC-MACRO purpose="Sync an installed project's framework-owned files to the spine-framework version in node_modules"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify the current tree against the frozen .spine-manifest.json, then overwrite .framework/config/scripts/bin from the installed package, merge framework deps+scripts into package.json, re-render netlify.toml preserving app-owned custom_* sections, and regenerate the manifest at the new framework_version"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/lib/project-files.ts,.framework/templates/project.json,.framework/cli/commands/init.ts"]
// CIL[DOC-CONTRACT inputs="[--dry-run] [--force]; runs in the project root; new version comes from node_modules/spine-framework" outputs="synced tree + regenerated manifest + change report" errors="exit 1 when no manifest, package absent/older, or protected files were locally modified (without --force)" side_effects="writes framework-owned paths only; --dry-run writes nothing"]
// CIL[DOC-MICRO logic_summary="The executing command is always the NEW package's copy — npx spine-framework upgrade resolves node_modules. Deletions are limited to .framework/ entries tracked in the old manifest but absent upstream; config/scripts files dropped upstream are warned, not deleted. custom/, spine.config.json, .env, .spine/, and netlify.toml custom_* sections are never touched" notable_decisions="integrity abort is the safety rail — a sealed .framework/ tree means overwrite-on-upgrade loses nothing the user owned"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-NOTE type="design" content="Upgrade is file-sync, not git-aware; rollback = git. Migrations are reported, never run — `npx spine-framework migrate` applies them"]
// CIL[DOC-AUDIENCE audience="developer"]

import type { Command } from 'commander'
import { existsSync, readFileSync, writeFileSync, rmSync, lstatSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { hashEntry } from '../../../scripts/checksum-manifest.mts'
import {
  loadProjectProfile,
  collectFrameworkFiles,
  copyCollectedFiles,
  renderNetlifyToml,
  mergePackageJson,
  writeFrozenManifest,
  cmpSemver,
} from '../lib/project-files.ts'
// CIL[END stable_id="~/.framework/cli/commands/upgrade.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/upgrade.ts:paths:block" type="block" identity="paths" parent="~/.framework/cli/commands/upgrade.ts"]
// CIL[DOC-MACRO purpose="Path constants — PACKAGE_ROOT is the new version's source of truth; PROJECT_ROOT is the installed project being upgraded"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files="package.json,.spine-manifest.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="resolved path constants" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="PACKAGE_ROOT resolves inside node_modules/spine-framework — the executing command is always the NEW package's copy; PROJECT_ROOT is process.cwd()" notable_decisions="new code upgrades old files, never the reverse"]
// CIL[DOC-CONFIDENCE pass="first" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PACKAGE_ROOT = resolve(__dirname, '../../../')
const PROJECT_ROOT = process.cwd()

const MANIFEST_PATH = join(PROJECT_ROOT, '.spine-manifest.json')
// CIL[END stable_id="~/.framework/cli/commands/upgrade.ts:paths:block"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/upgrade.ts:registerUpgradeCommands:function" type="function" identity="registerUpgradeCommands" parent="~/.framework/cli/commands/upgrade.ts"]
// CIL[DOC-MACRO purpose="Register `upgrade [--dry-run] [--force]` — delegates to runUpgrade with a fatal-error wrapper"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/index.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void" errors="catches runUpgrade errors → exit 1 (stack behind SPINE_CLI_DEBUG)" side_effects="mutates Commander program; may write project files via runUpgrade"]
// CIL[DOC-MICRO logic_summary="Thin Commander wiring — all logic lives in runUpgrade" notable_decisions="error wrapper prints message + exits; stack only under SPINE_CLI_DEBUG"]
// CIL[DOC-CONFIDENCE pass="first" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
export function registerUpgradeCommands(program: Command) {
  program
    .command('upgrade')
    .description('Sync this project to the spine-framework version installed in node_modules')
    .option('--dry-run', 'Report the changes without writing anything', false)
    .option('--force', 'Overwrite locally modified framework files', false)
    .action(async (opts: { dryRun: boolean; force: boolean }) => {
      try {
        runUpgrade(opts)
      } catch (err: any) {
        console.error(`\n❌ Upgrade failed: ${err.message}`)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }
    })
}
// CIL[END stable_id="~/.framework/cli/commands/upgrade.ts:registerUpgradeCommands:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/upgrade.ts:runUpgrade:function" type="function" identity="runUpgrade" parent="~/.framework/cli/commands/upgrade.ts"]
// CIL[DOC-MACRO purpose="Sync installed project's framework-owned files to the package version — integrity check, file sync, package.json merge, netlify.toml render, manifest regen"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".spine-manifest.json,.framework/cli/lib/project-files.ts"]
// CIL[DOC-CONTRACT inputs="abs: string, opts: { dryRun: boolean; force: boolean }" outputs="change report to stdout; synced tree on disk" errors="exit 1 on missing manifest, missing/older package, or locally modified protected files without --force" side_effects="writes framework-owned paths only; --dry-run writes nothing; netlify.toml custom_* sections preserved verbatim"]
// CIL[DOC-MICRO logic_summary="Three-way compare (disk vs old manifest vs package payload): integrity abort on local mods → copy added/changed files → delete only .framework entries dropped upstream → merge package.json deps/scripts/pin → re-render netlify.toml → regenerate frozen manifest → list new migrations without running them" notable_decisions="non-.framework files dropped upstream are warned and retained; identical rendered TOML writes no .bak"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developer"]
function diskHash(abs: string): string {
  const lst = lstatSync(abs)
  return hashEntry({ rel: '', abs, symlink: lst.isSymbolicLink() })
}

function runUpgrade(opts: { dryRun: boolean; force: boolean }): void {
  console.log('\nSpine Framework upgrade\n')

  // 1. Preconditions
  const srcPkgEarly = safeJson(join(PACKAGE_ROOT, 'package.json'))
  if (srcPkgEarly?.name !== 'spine-framework') {
    throw new Error(
      'This upgrade command is running from the vendored project copy, which cannot update itself.\n' +
      '   Run the installed package instead: npx spine-framework upgrade  (or npm run upgrade)',
    )
  }
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error('No .spine-manifest.json — not a Spine-managed project (use `spine-framework init`)')
  }
  const oldManifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  const oldVersion: string | null = oldManifest.framework_version ?? null
  const newVersion = getPackageVersion()
  const prevFrameworkDeps: string[] = Array.isArray(oldManifest.framework_dependencies)
    ? oldManifest.framework_dependencies
    : []

  if (!oldVersion) {
    console.log('  ⚠ Manifest has no framework_version — proceeding carefully')
  } else if (cmpSemver(newVersion, oldVersion) < 0) {
    throw new Error(`Installed package (v${newVersion}) is older than this project (v${oldVersion}). Install a newer spine-framework first.`)
  } else if (cmpSemver(newVersion, oldVersion) === 0) {
    console.log(`  ℹ Project already at spine-framework ${oldVersion}; syncing anyway`)
  } else {
    console.log(`  ${oldVersion} → ${newVersion}`)
  }

  const profile = loadProjectProfile(PACKAGE_ROOT)
  const srcPkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))

  // 2. Integrity — abort on locally modified or missing framework files
  const oldFiles: Record<string, string> = oldManifest.files ?? {}
  const modified: string[] = []
  const missing: string[] = []
  for (const [rel, hash] of Object.entries(oldFiles)) {
    const abs = join(PROJECT_ROOT, rel)
    if (!existsSync(abs)) { missing.push(rel); continue }
    if (diskHash(abs) !== hash) modified.push(rel)
  }
  if ((modified.length > 0 || missing.length > 0) && !opts.force) {
    console.error('\n❌ Framework files were modified locally — upgrade would overwrite them:')
    for (const f of modified) console.error(`     modified: ${f}`)
    for (const f of missing) console.error(`     missing:  ${f}`)
    console.error('\n   Revert the changes, or rerun with --force to overwrite.')
    process.exit(1)
  }
  if (opts.force && (modified.length || missing.length)) {
    console.log(`  ⚠ --force: overwriting ${modified.length} modified, restoring ${missing.length} missing files`)
  }

  // 3. Compute the new file set and the change report
  const files = collectFrameworkFiles(PACKAGE_ROOT, profile)
  const newRels = new Set(files.map((f) => f.rel))
  const added: string[] = []
  const changed: string[] = []
  let kept = 0
  for (const f of files) {
    const oldHash = oldFiles[f.rel]
    const newHash = hashEntry(f)
    if (oldHash) {
      if (newHash !== oldHash) changed.push(f.rel)
      else kept++
    } else {
      // Not in the manifest (root config files aren't integrity-tracked).
      // Compare against what's on disk so reruns don't report phantom adds.
      const abs = join(PROJECT_ROOT, f.rel)
      if (!existsSync(abs)) added.push(f.rel)
      else if (diskHash(abs) !== newHash) changed.push(f.rel)
      else kept++
    }
  }
  // Deletions: only inside .framework/ (fully sealed). config/scripts entries
  // dropped upstream are reported, not deleted — extras there are harmless.
  const removed = Object.keys(oldFiles).filter((rel) => !newRels.has(rel) && rel.startsWith('.framework/'))
  const staleOutside = Object.keys(oldFiles).filter((rel) => !newRels.has(rel) && !rel.startsWith('.framework/'))

  // New framework migrations = files under .framework/migrations not in the old manifest
  const newMigrations = files
    .map((f) => f.rel)
    .filter((rel) => rel.startsWith('.framework/migrations/') && rel.endsWith('.sql') && !(rel in oldFiles))

  console.log(`\n  ${added.length} added · ${changed.length} changed · ${removed.length} removed · ${kept} unchanged`)
  if (opts.dryRun) {
    for (const f of added) console.log(`     + ${f}`)
    for (const f of changed) console.log(`     ~ ${f}`)
    for (const f of removed) console.log(`     - ${f}`)
    for (const f of staleOutside) console.log(`     ? ${f} (dropped upstream, left in place)`)
    if (newMigrations.length > 0) {
      console.log(`\n  New migrations in this version (${newMigrations.length}):`)
      for (const rel of newMigrations) console.log(`     ${rel.split('/').pop()}`)
    }
    console.log('\n  (dry run — nothing written)\n')
    return
  }

  // 4. Apply: copy new files, remove dropped .framework files
  copyCollectedFiles(files, PROJECT_ROOT)
  for (const rel of removed) rmSync(join(PROJECT_ROOT, rel), { force: true })
  for (const rel of staleOutside) console.log(`  ⚠ ${rel} is no longer shipped upstream — left in place`)
  console.log(`  ✓ framework files synced (${files.length})`)

  // 5. package.json — framework scripts/deps, exact pin
  const pkgPath = join(PROJECT_ROOT, 'package.json')
  const existingPkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : {}
  const merged = mergePackageJson({
    existing: existingPkg,
    name: existingPkg.name ?? 'spine-project',
    scripts: profile.package_scripts,
    newDependencies: srcPkg.dependencies ?? {},
    newDevDependencies: srcPkg.devDependencies ?? {},
    prevFrameworkDeps,
    spineVersion: newVersion,
  })
  writeFileSync(pkgPath, merged.text)
  console.log('  ✓ package.json updated (spine-framework pin + framework deps/scripts)')

  // 6. netlify.toml — framework base replaced, app custom_* sections preserved
  const netlifySrc = join(PACKAGE_ROOT, 'netlify.toml')
  const netlifyDest = join(PROJECT_ROOT, 'netlify.toml')
  if (existsSync(netlifySrc)) {
    const existingToml = existsSync(netlifyDest) ? readFileSync(netlifyDest, 'utf8') : undefined
    const nextToml = renderNetlifyToml(readFileSync(netlifySrc, 'utf8'), existingToml)
    if (existingToml && existingToml !== nextToml) {
      writeFileSync(`${netlifyDest}.bak`, existingToml)
      console.log('  ✓ netlify.toml updated (backup at netlify.toml.bak; custom_* sections preserved)')
      writeFileSync(netlifyDest, nextToml)
    } else {
      writeFileSync(netlifyDest, nextToml)
      console.log('  ✓ netlify.toml written')
    }
  }

  // 7. Regenerate frozen manifest at the new version
  const manifest = writeFrozenManifest({
    projectRoot: PROJECT_ROOT,
    frameworkVersion: newVersion,
    frameworkDeps: merged.frameworkDeps,
  })
  console.log(`  ✓ .spine-manifest.json regenerated (${manifest.fileCount} files)`)

  if (newMigrations.length > 0) {
    console.log(`\n  New migrations in this version (${newMigrations.length}):`)
    for (const rel of newMigrations) console.log(`     ${rel.split('/').pop()}`)
  }

  console.log('\nNext steps:')
  console.log('  1. npm install            # resolve the new dependency set')
  console.log('  2. npm run verify         # confirm frozen integrity')
  console.log('  3. npx spine-framework migrate   # apply new migrations (if any)')
  console.log('  4. commit + deploy\n')
}
// CIL[END stable_id="~/.framework/cli/commands/upgrade.ts:runUpgrade:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/upgrade.ts:helpers:block" type="block" identity="helpers" parent="~/.framework/cli/commands/upgrade.ts"]
// CIL[DOC-MACRO purpose="safeJson + getPackageVersion helpers — package version read is tolerant of missing/malformed JSON"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files="package.json"]
// CIL[DOC-CONTRACT inputs="file: string" outputs="parsed JSON | null; version string" errors="safeJson returns null on missing/malformed input" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Tolerant reads — a missing or corrupt JSON file degrades to null rather than throwing" notable_decisions="absence is data for upgrade decisions, not an exception"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
function safeJson(file: string): Record<string, any> | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function getPackageVersion(): string {
  return safeJson(join(PACKAGE_ROOT, 'package.json'))?.version ?? '0.0.0'
}
// CIL[END stable_id="~/.framework/cli/commands/upgrade.ts:helpers:block"]
