// CIL[BEGIN stable_id="~/.framework/tests/unit/trigger-scheduler.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Tests for trigger-scheduler's Netlify Clockwork detection and context fabrication"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify scheduled invocations bypass middleware auth via fabricated system ctx while HTTP requests take the normal path"]
// CIL[DOC-CONTEXT module="tests/unit/trigger-scheduler" layer="test-unit" related_files=".framework/functions/trigger-scheduler.ts,.framework/functions/system-cron.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Mocks system-cron handler and db"]
// CIL[DOC-MICRO logic_summary="Mocks the cron handler export, invokes trigger-scheduler with scheduled and non-scheduled event shapes, asserts the fabricated ctx carries SYSTEM_PRINCIPAL" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { cronHandler } = vi.hoisted(() => ({
  cronHandler: vi.fn().mockResolvedValue({ statusCode: 200 })
}))

vi.mock('../../functions/system-cron.ts', () => ({
  handler: cronHandler
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {}
}))

import { handler } from '../../functions/trigger-scheduler.ts'

describe('trigger-scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fabricates a system-principal ctx for Netlify Clockwork invocations', async () => {
    const event = {
      path: '/.netlify/functions/trigger-scheduler',
      httpMethod: 'POST',
      headers: {
        'x-nf-event': 'schedule',
        'user-agent': 'Netlify Clockwork',
      },
      body: JSON.stringify({ next_run: '2026-10-23T21:07:00.000Z' }),
    }
    await handler(event, {})

    expect(cronHandler).toHaveBeenCalledOnce()
    const [ctx] = cronHandler.mock.calls[0]
    // The fabricated ctx flows straight into the cron handler — createHandler
    // short-circuits on requestId+principal without re-resolving auth.
    expect(ctx.requestId).toBeTruthy()
    expect(ctx.principal.id).toBe('system')
    expect(ctx.principal.machineType).toBe('internal')
    expect(ctx.source).toBe('netlify-scheduler')
  })

  it('forwards non-scheduled HTTP requests to the normal middleware path', async () => {
    const event = {
      path: '/.netlify/functions/trigger-scheduler',
      httpMethod: 'POST',
      headers: { 'x-internal-secret': 'some-secret' },
      body: '{}',
    }
    await handler(event, {})

    expect(cronHandler).toHaveBeenCalledOnce()
    // The raw event goes through untouched — createHandler resolves auth.
    expect(cronHandler.mock.calls[0][0]).toBe(event)
  })

  it('does not trust a spoofed x-nf-event header without the next_run payload', async () => {
    const event = {
      path: '/.netlify/functions/trigger-scheduler',
      httpMethod: 'POST',
      headers: { 'x-nf-event': 'schedule' },
      body: '{}',
    }
    await handler(event, {})

    expect(cronHandler.mock.calls[0][0]).toBe(event)
  })
})
// CIL[END stable_id="~/.framework/tests/unit/trigger-scheduler.test.ts:module_header:module_header"]
