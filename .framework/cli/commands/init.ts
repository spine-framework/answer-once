// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Scaffold a new Spine Framework project into a directory"]
// CIL[DOC-RESPONSIBILITY responsibility="Copy the framework-owned file set from .framework/templates/project.json, generate package.json/package-lock.json/.gitignore/netlify.toml/spine.config.json, and write the frozen .spine-manifest.json with framework_version"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/templates/project.json,.framework/cli/lib/project-files.ts,.framework/cli/commands/upgrade.ts"]
// CIL[DOC-CONTRACT inputs="[dir] (default cwd); spine-framework package on disk" outputs="project tree + frozen manifest" errors="exit 1 on existing .framework or missing package files" side_effects="writes <dir> only; no npm install, network, or DB access"]
// CIL[DOC-MICRO logic_summary="Framework-only scaffold — apps install themselves via their own installer (e.g. npx <app> install). netlify.toml carries only framework blocks; apps append their own custom_* sections. package.json gets the framework's full dep set inlined plus an exact spine-framework pin so `spine-framework upgrade` can re-sync this copy" notable_decisions="never writes .env (secrets) — prints instructions to copy .env.example; existing files are never overwritten except generated package.json/netlify.toml which merge"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
import type { Command } from 'commander'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, readdirSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import {
  loadProjectProfile,
  collectFrameworkFiles,
  copyCollectedFiles,
  renderNetlifyToml,
  renderGitignore,
  mergePackageJson,
  writeFrozenManifest,
  sanitizePackageName,
} from '../lib/project-files.ts'
// CIL[END stable_id="~/.framework/cli/commands/init.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:paths:block" type="block" identity="paths" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="ESM __filename/__dirname shim plus PACKAGE_ROOT — the spine-framework package root this init copies files from"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files="package.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="resolved path constants" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="PACKAGE_ROOT resolves three levels up from commands/ — inside the vendored package payload" notable_decisions="computed at module load from import.meta.url, not cwd"]
// CIL[DOC-CONFIDENCE pass="first" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PACKAGE_ROOT = resolve(__dirname, '../../../')
// CIL[END stable_id="~/.framework/cli/commands/init.ts:paths:block"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:registerInitCommands:function" type="function" identity="registerInitCommands" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="Register the `init [dir]` command that scaffolds a neutral framework-only project"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files=".framework/cli/index.ts,.framework/cli/lib/project-files.ts"]
// CIL[DOC-CONTRACT inputs="program: Command; [dir] positional (default cwd)" outputs="project tree + frozen manifest" errors="exit 1 on existing .framework or template missing" side_effects="writes <dir> only"]
// CIL[DOC-MICRO logic_summary="Copies the profile fileset, creates the custom/ workspace, merges package.json with inlined framework deps + exact pin, writes lockfile/gitignore/netlify.toml/neutral spine.config.json, then freezes .spine-manifest.json" notable_decisions="framework-only by design — apps self-install afterwards via their own CLIs"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
export function registerInitCommands(program: Command) {
  program
    .command('init')
    .description('Scaffold a new Spine Framework project')
    .argument('[dir]', 'Target directory (default: current directory)')
    .action(async (dirArg?: string) => {
      const target = resolve(dirArg ?? process.cwd())
      console.log(`\nInitializing Spine Framework project in ${target}\n`)

      try {
        if (existsSync(join(target, '.framework'))) {
          console.error('❌ .framework/ already exists — this looks like a Spine project.')
          console.error('   To update the framework, use: npx spine-framework upgrade')
          process.exit(1)
        }
        mkdirSync(target, { recursive: true })

        const profile = loadProjectProfile(PACKAGE_ROOT)
        const frameworkVersion = getPackageVersion()
        const packageName = sanitizePackageName(basename(target))

        // 1. Framework-owned files (same relative layout in the package and the project)
        console.log('  Copying framework files...')
        const files = collectFrameworkFiles(PACKAGE_ROOT, profile)
        copyCollectedFiles(files, target)
        console.log(`  ✓ ${files.length} files copied`)

        // 2. App workspace skeleton — apps own everything under custom/
        for (const dir of ['custom/apps', 'custom/functions', 'custom/components', 'custom/migrations', 'custom/tests']) {
          mkdirSync(join(target, dir), { recursive: true })
        }
        console.log('  ✓ custom/ workspace created')

        // 3. package.json — framework deps inlined (matching the framework snapshot)
        //    plus an exact spine-framework pin so `upgrade` can re-sync later.
        const existingPkgPath = join(target, 'package.json')
        let existingPkg: Record<string, any> | undefined
        if (existsSync(existingPkgPath)) {
          try { existingPkg = JSON.parse(readFileSync(existingPkgPath, 'utf8')) } catch {}
        }
        const srcPkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
        const merged = mergePackageJson({
          existing: existingPkg,
          name: packageName,
          description: 'Spine Framework project',
          scripts: profile.package_scripts,
          newDependencies: srcPkg.dependencies ?? {},
          newDevDependencies: srcPkg.devDependencies ?? {},
          spineVersion: frameworkVersion,
        })
        writeFileSync(existingPkgPath, merged.text)
        console.log('  ✓ package.json written')

        // 4. package-lock.json — verified lock tree shipped under templates/project/
        const lockTemplate = join(PACKAGE_ROOT, 'templates/project/package-lock.json')
        if (existsSync(lockTemplate)) {
          const lock = JSON.parse(readFileSync(lockTemplate, 'utf8'))
          lock.name = packageName
          if (lock.packages?.['']) lock.packages[''].name = packageName
          writeFileSync(join(target, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n')
          console.log('  ✓ package-lock.json written (verified dependency set)')
        } else {
          console.log('  ○ package-lock template not shipped — npm install will resolve deps')
        }

        // 5. .gitignore — from packed template; .env.example stays tracked
        const gitignoreTemplate = join(PACKAGE_ROOT, 'templates/project/gitignore')
        const gitignoreDest = join(target, '.gitignore')
        if (!existsSync(gitignoreDest) && existsSync(gitignoreTemplate)) {
          writeFileSync(gitignoreDest, renderGitignore(readFileSync(gitignoreTemplate, 'utf8')))
          console.log('  ✓ .gitignore written')
        } else if (existsSync(gitignoreDest)) {
          console.log('  ○ .gitignore already exists, skipping')
        }

        // 6. netlify.toml — framework blocks only; preserves any existing custom_* sections
        const netlifySrc = join(PACKAGE_ROOT, 'netlify.toml')
        const netlifyDest = join(target, 'netlify.toml')
        const existingToml = existsSync(netlifyDest) ? readFileSync(netlifyDest, 'utf8') : undefined
        if (existsSync(netlifySrc)) {
          writeFileSync(netlifyDest, renderNetlifyToml(readFileSync(netlifySrc, 'utf8'), existingToml))
          console.log('  ✓ netlify.toml written')
        }

        // 7. spine.config.json — neutral template; apps register themselves at install
        const spineConfigSrc = join(PACKAGE_ROOT, '.framework', 'templates', 'spine.config.neutral.json')
        const spineConfigDest = join(target, 'spine.config.json')
        if (existsSync(spineConfigSrc) && !existsSync(spineConfigDest)) {
          copyFileSync(spineConfigSrc, spineConfigDest)
          console.log('  ✓ spine.config.json written (neutral template)')
        }

        // 8. Frozen integrity manifest — version + framework-owned dep inventory
        const manifest = writeFrozenManifest({
          projectRoot: target,
          frameworkVersion,
          frameworkDeps: merged.frameworkDeps,
        })
        console.log(`  ✓ .spine-manifest.json written (${manifest.fileCount} protected files, frozen)`)

        console.log(`\n✅ Spine Framework ${frameworkVersion} project initialized\n`)
        console.log('Next steps:')
        if (!existsSync(join(target, '.env'))) {
          console.log('  1. cp .env.example .env  — fill in your Supabase credentials')
        } else {
          console.log('  1. Verify .env contains your Supabase credentials')
        }
        console.log('  2. npm install')
        console.log('  3. npm run verify')
        console.log('  4. Install an app, e.g.: npx <app-package> install')
        console.log('  5. npx spine-framework migrate')
        console.log('  6. npm run dev:netlify')
        console.log()
      } catch (err: any) {
        console.error('\n❌ Init failed:', err.message)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }
    })
}
// CIL[END stable_id="~/.framework/cli/commands/init.ts:registerInitCommands:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/init.ts:getPackageVersion:function" type="function" identity="getPackageVersion" parent="~/.framework/cli/commands/init.ts"]
// CIL[DOC-MACRO purpose="Read the running package's version — becomes the project's frozen framework_version"]
// CIL[DOC-CONTEXT module="cli" layer="framework" related_files="package.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="semver string" errors="returns '0.0.0' when package.json unreadable" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads PACKAGE_ROOT/package.json — the vendored CLI always ships its own manifest" notable_decisions="0.0.0 fallback is defensive only"]
// CIL[DOC-CONFIDENCE pass="first" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
function getPackageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
    return pkg.version || '0.0.0'
  } catch {
    return '0.0.0'
  }
}
// CIL[END stable_id="~/.framework/cli/commands/init.ts:getPackageVersion:function"]
