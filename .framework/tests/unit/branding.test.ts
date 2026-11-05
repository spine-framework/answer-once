// CIL[BEGIN stable_id="~/.framework/tests/unit/branding.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/unit/branding.test.ts"]
// CIL[DOC-MACRO purpose="Unit tests for resolveBranding — host-keyed brand resolution over the flat branding block"]
// CIL[DOC-CONTRACT inputs="resolveBranding calls with branding/brands/hostname args" outputs="vitest assertions" errors="none" side_effects="none"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import { describe, it, expect } from 'vitest'
import { resolveBranding, DEFAULT_BRANDING } from '../../src/lib/branding.ts'
// CIL[END stable_id="~/.framework/tests/unit/branding.test.ts:module_header:module_header"]

const brands = {
  default: 'answer-once',
  by_host: {
    'support.answer-once.com': 'answer-once',
    'support.spine-framework.com': 'spine',
  },
  definitions: {
    'answer-once': {
      name: 'Answer Once',
      title: 'Answer Once',
      site_url: 'https://support.answer-once.com',
      logo_url: '/answer-once-logo.svg',
      favicon_url: '/answer-once-icon.svg',
    },
    spine: {
      name: 'Spine',
      title: 'Spine Framework',
      site_url: 'https://support.spine-framework.com',
      logo_url: '/spine-logo.svg',
      favicon_url: '/spine-logo.svg',
    },
  },
}

// CIL[BEGIN stable_id="~/.framework/tests/unit/branding.test.ts:resolvebranding_suite:block" type="block" identity="resolvebranding_suite" parent="none"]
// CIL[DOC-MACRO purpose="Cover flat-branding fallback, host-keyed definition override, default-brand fallback, per-field merge, and absent-brands legacy behavior"]
describe('resolveBranding', () => {
  it('returns flat branding unchanged when no brands block exists (legacy)', () => {
    const b = { app_name: 'Answer Once', logo_url: '/ao.svg' }
    const r = resolveBranding(b, null, 'anything.example.com')
    expect(r).toEqual({
      slug: null,
      app_name: 'Answer Once',
      title: 'Answer Once',
      logo_url: '/ao.svg',
      favicon_url: DEFAULT_BRANDING.favicon_url,
      site_url: null,
    })
  })

  it('resolves the host-matched brand definition', () => {
    const r = resolveBranding({ app_name: 'Answer Once' }, brands, 'support.spine-framework.com')
    expect(r.slug).toBe('spine')
    expect(r.app_name).toBe('Spine')
    expect(r.title).toBe('Spine Framework')
    expect(r.logo_url).toBe('/spine-logo.svg')
    expect(r.favicon_url).toBe('/spine-logo.svg')
    expect(r.site_url).toBe('https://support.spine-framework.com')
  })

  it('resolves the AO brand on the AO host', () => {
    const r = resolveBranding({}, brands, 'support.answer-once.com')
    expect(r.slug).toBe('answer-once')
    expect(r.app_name).toBe('Answer Once')
    expect(r.logo_url).toBe('/answer-once-logo.svg')
  })

  it('falls back to the configured default brand on unknown hosts', () => {
    const r = resolveBranding({}, brands, 'localhost')
    expect(r.slug).toBe('answer-once')
    expect(r.app_name).toBe('Answer Once')
  })

  it('definition fields fall through to flat branding then defaults', () => {
    const partial = { default: 'b', by_host: { 'x.test': 'b' }, definitions: { b: { name: 'BrandB' } } }
    const r = resolveBranding({ logo_url: '/flat.svg' }, partial, 'x.test')
    expect(r.app_name).toBe('BrandB')
    expect(r.title).toBe('BrandB')
    expect(r.logo_url).toBe('/flat.svg')
    expect(r.favicon_url).toBe(DEFAULT_BRANDING.favicon_url)
  })

  it('accepts app_name as an alias of name in definitions', () => {
    const defs = { default: 'x', by_host: {}, definitions: { x: { app_name: 'ViaAppName' } } }
    expect(resolveBranding({}, defs, 'any').app_name).toBe('ViaAppName')
  })
})
// CIL[END stable_id="~/.framework/tests/unit/branding.test.ts:resolvebranding_suite:block"]
