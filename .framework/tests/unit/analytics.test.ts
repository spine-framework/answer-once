import { describe, it, expect } from 'vitest'
import { matchAppForPath, resolveGa4MeasurementId, type AnalyticsAppFields } from '../../src/lib/analytics.ts'

const aoApp: AnalyticsAppFields = {
  slug: 'answer-once',
  route_prefix: '/',
  config: {
    analytics: {
      ga4: {
        'support.answer-once.com': 'G-3Y038B3HQG',
        'support.spine-framework.com': 'G-QWZR97CXBN',
      },
    },
  },
}

const demoApp: AnalyticsAppFields = {
  slug: 'demo',
  route_prefix: '/demo',
  config: { analytics: { ga4: { 'demo.answer-once.com': 'G-WT2NR4N8SN' } } },
}

const bareApp: AnalyticsAppFields = { slug: 'workbench', route_prefix: '/workbench', config: {} }

describe('matchAppForPath', () => {
  it("'/' prefix matches every path but loses to longer prefixes", () => {
    const apps = [aoApp, demoApp]
    expect(matchAppForPath(apps, '/dashboard')?.slug).toBe('answer-once')
    expect(matchAppForPath(apps, '/demo')?.slug).toBe('demo')
    expect(matchAppForPath(apps, '/demo/run/123')?.slug).toBe('demo')
  })

  it("does not match a sibling prefix like '/demo-x'", () => {
    expect(matchAppForPath([demoApp], '/demo-x')?.slug).toBeUndefined()
    expect(matchAppForPath([demoApp], '/demo')?.slug).toBe('demo')
  })

  it('returns null when nothing matches or apps have no prefix', () => {
    expect(matchAppForPath([demoApp], '/other')).toBeNull()
    expect(matchAppForPath([{ slug: 'x', route_prefix: null }], '/x')).toBeNull()
  })
})

describe('resolveGa4MeasurementId', () => {
  it('returns the measurement ID for an exact hostname match', () => {
    expect(resolveGa4MeasurementId(aoApp, 'support.answer-once.com')).toBe('G-3Y038B3HQG')
    expect(resolveGa4MeasurementId(aoApp, 'support.spine-framework.com')).toBe('G-QWZR97CXBN')
    expect(resolveGa4MeasurementId(demoApp, 'demo.answer-once.com')).toBe('G-WT2NR4N8SN')
  })

  it('returns null for unlisted hosts — no wildcard configured', () => {
    expect(resolveGa4MeasurementId(aoApp, 'localhost')).toBeNull()
    expect(resolveGa4MeasurementId(aoApp, 'deploy-preview-123.netlify.app')).toBeNull()
    // demo on the AO support domain is not tracked
    expect(resolveGa4MeasurementId(demoApp, 'support.answer-once.com')).toBeNull()
  })

  it('honors the "*" wildcard when present', () => {
    const app: AnalyticsAppFields = {
      slug: 'wild',
      route_prefix: '/',
      config: { analytics: { ga4: { '*': 'G-ABCDEFGH12' } } },
    }
    expect(resolveGa4MeasurementId(app, 'anything.example.com')).toBe('G-ABCDEFGH12')
    // exact host still wins over wildcard
    const both: AnalyticsAppFields = {
      slug: 'both',
      route_prefix: '/',
      config: { analytics: { ga4: { '*': 'G-WILDCARD1', 'a.com': 'G-EXACT123' } } },
    }
    expect(resolveGa4MeasurementId(both, 'a.com')).toBe('G-EXACT123')
    expect(resolveGa4MeasurementId(both, 'b.com')).toBe('G-WILDCARD1')
  })

  it('returns null for missing, malformed, or wrongly-shaped config', () => {
    expect(resolveGa4MeasurementId(null, 'a.com')).toBeNull()
    expect(resolveGa4MeasurementId(bareApp, 'a.com')).toBeNull()
    const bad: AnalyticsAppFields = {
      slug: 'bad',
      route_prefix: '/',
      config: { analytics: { ga4: { 'a.com': 'not-a-ga-id' } } },
    }
    expect(resolveGa4MeasurementId(bad, 'a.com')).toBeNull()
    const noGa4: AnalyticsAppFields = {
      slug: 'noga4',
      route_prefix: '/',
      config: { analytics: {} },
    }
    expect(resolveGa4MeasurementId(noGa4, 'a.com')).toBeNull()
  })
})
