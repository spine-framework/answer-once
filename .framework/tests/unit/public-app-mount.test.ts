// Decision spine-framework:0034 — anonymous visitors render is_public
// custom apps inside the SPA: the anonymous router mounts them at their
// prefixes, discovery rides /api/apps?action=public (no auth wall), and
// AppWrapper admits anonymous principals on public apps.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'

const REPO = resolve(__dirname, '../../..')
const APP = join(REPO, '.framework/src/App.tsx')
const APPS_FN = join(REPO, '.framework/functions/apps.ts')
const WRAPPER = join(REPO, '.framework/src/components/AppWrapper.tsx')
const INSTALL = join(REPO, '.framework/cli/commands/install-app.ts')
const MIGRATION = join(REPO, '.framework/migrations/087_public_app_mount.sql')

const src = readFileSync(APP, 'utf8')
const appsSrc = readFileSync(APPS_FN, 'utf8')
const wrapperSrc = readFileSync(WRAPPER, 'utf8')
const installSrc = readFileSync(INSTALL, 'utf8')
const migrationSrc = readFileSync(MIGRATION, 'utf8')

describe('custom-app mount structure', () => {
  it('mounts every app on a trailing splat, root prefix included', () => {
    expect(src).toMatch(/toRoutePath\s*=\s*\(prefix: string\)\s*=>\s*prefix === '\/' \? '\/\*' : `\$\{prefix\}\/\*`/)
  })

  it('bare / route renders only when no root-mounted app exists', () => {
    // the '/' Route must be conditional on rootElement — a root-mounted app
    // is handled by its own '/*' route (an exact '/' route would shadow it
    // without a splat and break nested <Routes>)
    expect(src).toMatch(/\{rootElement && <Route path="\/"/)
    expect(src).toMatch(/rootApp\s*\?\s*null/)
  })

  it('system_admin still redirects to the admin app from /', () => {
    expect(src).toMatch(/<Navigate to="\/spine-framework\/admin" replace \/>/)
  })
})

describe('anonymous public app mount (decision 0034)', () => {
  it('routes anonymous visitors through a PublicRouter, not a login wall', () => {
    expect(src).toMatch(/!user\s*\?\s*\(\s*<PublicRouter \/>/)
    expect(src).toMatch(/function PublicRouter\(\)/)
  })

  it('public router mounts only is_public custom apps', () => {
    expect(src).toMatch(/app\.is_public === true && app\.renderer === 'custom'/)
  })

  it('keeps auth pages reachable and framework paths out of public apps', () => {
    expect(src).toMatch(/<Route path="\/login" element=\{<LoginPage \/>\} \/>/)
    expect(src).toMatch(/<Route path="\/spine-framework\/\*" element=\{<Navigate to="\/login" replace \/>\} \/>/)
  })

  it('anonymous discovery is a public action, not an authenticated list', () => {
    expect(appsSrc).toMatch(/queryStringParameters\?\.action === 'public'/)
    expect(appsSrc).toMatch(/createPublicHandler/)
    expect(appsSrc).toMatch(/\.eq\('is_public', true\)/)
    // the projection must never hand anonymous config/metadata/tenancy
    const projection = appsSrc.match(/\.select\('([^']+)'\)\s*\n?\s*\.eq\('is_active', true\)\s*\n?\s*\.eq\('is_public', true\)/)
    expect(projection).not.toBeNull()
    expect(projection![1]).not.toMatch(/config|metadata|integration_deps|owner_account_id|account_id/)
  })

  it('AppWrapper admits anonymous principals on is_public apps', () => {
    expect(wrapperSrc).toMatch(/!user[\s\S]{0,200}app\.is_public[\s\S]{0,200}<AppProvider/)
  })

  it('install stamps the manifest flags onto the apps row', () => {
    expect(installSrc).toMatch(/is_public:\s*manifest\.is_public \?\? false/)
    expect(installSrc).toMatch(/auth_required:\s*manifest\.auth_required \?\? true/)
  })

  it('the apps table and schema helpers carry the flags', () => {
    expect(migrationSrc).toMatch(/is_public boolean NOT NULL DEFAULT false/)
    expect(migrationSrc).toMatch(/auth_required boolean NOT NULL DEFAULT true/)
    expect(migrationSrc).toMatch(/REVOKE ALL ON FUNCTION public\.get_account_apps/)
  })
})
