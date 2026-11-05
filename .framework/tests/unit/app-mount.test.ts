// CIL[BEGIN stable_id="~/.framework/tests/unit/app-mount.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/unit/app-mount.test.ts"]
// CIL[DOC-MACRO purpose="Unit tests for resolveAppMount — host-keyed mount overrides on apps records"]
// CIL[DOC-CONTRACT inputs="resolveAppMount calls with injected hostname/environment" outputs="vitest assertions" errors="none" side_effects="none"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import { describe, it, expect } from 'vitest'
import { resolveAppMount } from '../../src/lib/app-mount.ts'
// CIL[END stable_id="~/.framework/tests/unit/app-mount.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/app-mount.test.ts:fixtures:block" type="block" identity="fixtures" parent="none"]
// CIL[DOC-MACRO purpose="Shared app record fixture and default opts (localhost, prod env)"]

const base = {
  route_prefix: '/demo' as string | null,
  preview_domain: null as string | null,
  prod_domain: null as string | null,
  preview_route_prefix: null as string | null,
  prod_route_prefix: null as string | null,
}

const opts = { hostname: 'localhost', environment: 'prod' }
// CIL[END stable_id="~/.framework/tests/unit/app-mount.test.ts:fixtures:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/app-mount.test.ts:resolveappmount_suite:block" type="block" identity="resolveappmount_suite" parent="none"]
// CIL[DOC-MACRO purpose="Cover default mount, host-matched override, non-matching fallback, legacy domain lock, preview env fields, URL/port domains, and idempotence"]
describe('resolveAppMount', () => {
  it('returns the default mount when no domain is configured', () => {
    expect(resolveAppMount({ ...base }, opts))
      .toEqual({ routable: true, route_prefix: '/demo' })
  })

  it('mounts at prod_route_prefix when the host matches prod_domain', () => {
    const app = { ...base, prod_domain: 'demo.answer-once.com', prod_route_prefix: '/' }
    expect(resolveAppMount(app, { hostname: 'demo.answer-once.com', environment: 'prod' }))
      .toEqual({ routable: true, route_prefix: '/' })
  })

  it('stays routable at the default mount on other hosts when an override exists', () => {
    const app = { ...base, prod_domain: 'demo.answer-once.com', prod_route_prefix: '/' }
    expect(resolveAppMount(app, opts))
      .toEqual({ routable: true, route_prefix: '/demo' })
  })

  it('filters the app on other hosts when a domain is set without an override (legacy lock)', () => {
    const app = { ...base, prod_domain: 'demo.answer-once.com' }
    expect(resolveAppMount(app, opts)).toEqual({ routable: false, route_prefix: '/demo' })
    expect(resolveAppMount(app, { hostname: 'demo.answer-once.com', environment: 'prod' }))
      .toEqual({ routable: true, route_prefix: '/demo' })
  })

  it('uses preview fields when environment is preview', () => {
    const app = {
      ...base,
      preview_domain: 'staging.answer-once.com',
      preview_route_prefix: '/',
      prod_domain: 'demo.answer-once.com',
      prod_route_prefix: '/',
    }
    expect(resolveAppMount(app, { hostname: 'staging.answer-once.com', environment: 'preview' }))
      .toEqual({ routable: true, route_prefix: '/' })
    // prod host does not match under preview env — falls back to default mount
    expect(resolveAppMount(app, { hostname: 'demo.answer-once.com', environment: 'preview' }))
      .toEqual({ routable: true, route_prefix: '/demo' })
  })

  it('accepts full URLs and host:port in domain fields', () => {
    const app = { ...base, prod_domain: 'https://demo.answer-once.com/', prod_route_prefix: '/' }
    expect(resolveAppMount(app, { hostname: 'demo.answer-once.com', environment: 'prod' }))
      .toEqual({ routable: true, route_prefix: '/' })
  })

  it('mounts at prod_route_prefix when the host matches any prod_domains entry', () => {
    const app = {
      ...base,
      prod_domain: 'demo.answer-once.com',
      prod_domains: ['demo.answer-once.com', 'demo.spine-framework.com'],
      prod_route_prefix: '/',
    }
    expect(resolveAppMount(app, { hostname: 'demo.spine-framework.com', environment: 'prod' }))
      .toEqual({ routable: true, route_prefix: '/' })
    expect(resolveAppMount(app, { hostname: 'demo.answer-once.com', environment: 'prod' }))
      .toEqual({ routable: true, route_prefix: '/' })
  })

  it('prod_domains works without prod_domain set', () => {
    const app = {
      ...base,
      prod_domains: ['a.example.com', 'b.example.com'],
      prod_route_prefix: '/',
    }
    expect(resolveAppMount(app, { hostname: 'b.example.com', environment: 'prod' }))
      .toEqual({ routable: true, route_prefix: '/' })
    // Non-matching host with override → routable at default mount
    expect(resolveAppMount(app, opts))
      .toEqual({ routable: true, route_prefix: '/demo' })
  })

  it('prod_domains without override locks matching like prod_domain', () => {
    const app = { ...base, prod_domains: ['a.example.com', 'b.example.com'] }
    expect(resolveAppMount(app, opts)).toEqual({ routable: false, route_prefix: '/demo' })
    expect(resolveAppMount(app, { hostname: 'a.example.com', environment: 'prod' }))
      .toEqual({ routable: true, route_prefix: '/demo' })
  })

  it('ignores malformed prod_domains entries', () => {
    const app = { ...base, prod_domains: ['', 'b.example.com', 42] as any, prod_route_prefix: '/' }
    expect(resolveAppMount(app, { hostname: 'b.example.com', environment: 'prod' }))
      .toEqual({ routable: true, route_prefix: '/' })
    expect(resolveAppMount(app, opts))
      .toEqual({ routable: true, route_prefix: '/demo' })
  })

  it('is idempotent — re-resolving a resolved record returns the same mount', () => {
    const app = { ...base, prod_domain: 'demo.answer-once.com', prod_route_prefix: '/' }
    const once = resolveAppMount(app, { hostname: 'demo.answer-once.com', environment: 'prod' })
    const twice = resolveAppMount({ ...app, route_prefix: once.route_prefix },
      { hostname: 'demo.answer-once.com', environment: 'prod' })
    expect(twice).toEqual(once)
  })
})
// CIL[END stable_id="~/.framework/tests/unit/app-mount.test.ts:resolveappmount_suite:block"]
