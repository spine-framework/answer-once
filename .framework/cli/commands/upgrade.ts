// Upgrade is file-sync, not git-aware; rollback = git. Migrations are reported, never run — `npx spine-framework migrate` applies them

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
  syncAgentFiles,
  collectAgentFileHashes,
} from '../lib/project-files.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PACKAGE_ROOT = resolve(__dirname, '../../../')
const PROJECT_ROOT = process.cwd()

const MANIFEST_PATH = join(PROJECT_ROOT, '.spine-manifest.json')

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

  // Agent assets are computed before the dry-run exit so the report is complete:
  // AGENTS.md gets its marker-delimited framework block refreshed in place
  // (customer content outside the markers is preserved); .devin/skills/spine-*
  // dirs are replaced wholesale (customer-owned sibling dirs untouched).
  const agentActions = syncAgentFiles({
    pkgRoot: PACKAGE_ROOT,
    projectRoot: PROJECT_ROOT,
    entries: profile.agent_files ?? [],
    version: newVersion,
    dryRun: true,
  })

  if (opts.dryRun) {
    for (const f of added) console.log(`     + ${f}`)
    for (const f of changed) console.log(`     ~ ${f}`)
    for (const f of removed) console.log(`     - ${f}`)
    for (const f of staleOutside) console.log(`     ? ${f} (dropped upstream, left in place)`)
    for (const a of agentActions) {
      if (a.action !== 'unchanged') console.log(`     ~ ${a.rel} (agent asset: ${a.action})`)
    }
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

  // 4b. Apply agent assets (the dry-run pass above reported; this one writes)
  const applied = syncAgentFiles({
    pkgRoot: PACKAGE_ROOT,
    projectRoot: PROJECT_ROOT,
    entries: profile.agent_files ?? [],
    version: newVersion,
  })
  for (const a of applied) {
    if (a.action === 'prepended') {
      console.log(`  ⚠ ${a.rel} had no spine-framework markers — fresh framework block prepended`)
    } else if (a.action !== 'unchanged') {
      console.log(`  ✓ ${a.rel} (${a.action})`)
    }
  }
  console.log('  ✓ agent assets synced (AGENTS.md + .devin/skills/spine-*)')

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
    agentFiles: collectAgentFileHashes(PROJECT_ROOT, profile.agent_files ?? []),
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
