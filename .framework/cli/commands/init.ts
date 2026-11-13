// never writes .env (secrets) — prints instructions to copy .env.example; existing files are never overwritten except generated package.json/netlify.toml which merge
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
  syncAgentFiles,
  collectAgentFileHashes,
} from '../lib/project-files.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PACKAGE_ROOT = resolve(__dirname, '../../../')

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

        // 8. Agent assets — AGENTS.md framework block + .devin/skills/spine-*
        const agentActions = syncAgentFiles({
          pkgRoot: PACKAGE_ROOT,
          projectRoot: target,
          entries: profile.agent_files ?? [],
          version: frameworkVersion,
        })
        for (const a of agentActions) {
          console.log(`  ✓ ${a.rel} (${a.action}${a.detail ? ` — ${a.detail}` : ''})`)
        }

        // 9. Frozen integrity manifest — version + framework-owned dep inventory
        const manifest = writeFrozenManifest({
          projectRoot: target,
          frameworkVersion,
          frameworkDeps: merged.frameworkDeps,
          agentFiles: collectAgentFileHashes(target, profile.agent_files ?? []),
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
        console.log('Docs + agent assets:')
        console.log('  - Instruction book: .framework/src/instructions/README.md')
        console.log('  - Agent rules:      AGENTS.md (framework block refreshes on upgrade)')
        console.log('  - Agent skills:     .devin/skills/spine-*')
        console.log()
      } catch (err: any) {
        console.error('\n❌ Init failed:', err.message)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }
    })
}

function getPackageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
    return pkg.version || '0.0.0'
  } catch {
    return '0.0.0'
  }
}
