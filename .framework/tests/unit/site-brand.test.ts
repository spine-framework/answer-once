import { describe, it, expect } from 'vitest'
import { parseBrandsConfig, resolveBrand, brandForHost } from '../../functions/_shared/site-brand.ts'

const cfg = parseBrandsConfig({
  default: 'answer-once',
  by_host: {
    'support.answer-once.com': 'answer-once',
    'support.spine-framework.com': 'spine',
  },
  definitions: {
    'answer-once': {
      name: 'Answer Once',
      site_url: 'https://support.answer-once.com',
      email_from: 'Answer Once Support <noreply@notifications.answer-once.com>',
      email_logo_url: 'https://support.answer-once.com/answer-once-logo-wht.png',
    },
    spine: {
      name: 'Spine',
      site_url: 'https://support.spine-framework.com',
      email_from: 'Spine Framework Support <noreply@notifications.answer-once.com>',
    },
  },
})

describe('parseBrandsConfig', () => {
  it('parses a well-formed config', () => {
    expect(cfg.default).toBe('answer-once')
    expect(cfg.by_host?.['support.spine-framework.com']).toBe('spine')
    expect(Object.keys(cfg.definitions ?? {})).toHaveLength(2)
  })

  it('tolerates non-object and partial input', () => {
    expect(parseBrandsConfig(null)).toEqual({})
    expect(parseBrandsConfig('junk')).toEqual({})
    expect(parseBrandsConfig({ default: 'x', by_host: { a: 1, b: 's' } }))
      .toEqual({ default: 'x', by_host: { b: 's' } })
  })
})

describe('resolveBrand', () => {
  it('resolves a known slug to its full definition', () => {
    const b = resolveBrand(cfg, 'spine')
    expect(b.slug).toBe('spine')
    expect(b.name).toBe('Spine')
    expect(b.email_from).toBe('Spine Framework Support <noreply@notifications.answer-once.com>')
    expect(b.site_url).toBe('https://support.spine-framework.com')
  })

  it('null slug resolves to the configured default', () => {
    expect(resolveBrand(cfg, null).slug).toBe('answer-once')
  })

  it('unknown slug returns the slug with neutral fields', () => {
    const b = resolveBrand(cfg, 'nonexistent')
    expect(b.slug).toBe('nonexistent')
    expect(b.name).toBe('Support')
    expect(b.email_from).toBeNull()
  })

  it('empty config + null slug yields the neutral brand', () => {
    const b = resolveBrand({}, null)
    expect(b.slug).toBe('default')
    expect(b.name).toBe('Support')
  })
})

describe('brandForHost', () => {
  it('maps configured hosts to their brand', () => {
    expect(brandForHost(cfg, 'support.spine-framework.com').slug).toBe('spine')
    expect(brandForHost(cfg, 'support.answer-once.com').slug).toBe('answer-once')
  })

  it('strips ports before matching', () => {
    expect(brandForHost(cfg, 'support.spine-framework.com:443').slug).toBe('spine')
  })

  it('unknown and empty hosts fall back to the configured default', () => {
    expect(brandForHost(cfg, 'localhost:8888').slug).toBe('answer-once')
    expect(brandForHost(cfg, '').slug).toBe('answer-once')
    expect(brandForHost(cfg, null).slug).toBe('answer-once')
  })

  it('empty config yields the neutral brand', () => {
    expect(brandForHost({}, 'anything.example.com').slug).toBe('default')
  })
})
