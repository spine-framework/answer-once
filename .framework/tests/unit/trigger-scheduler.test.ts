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
    process.env.SPINE_TRUST_SCHEDULE_HEADERS = '1'
  })

  it('ignores spoofed Clockwork headers when SPINE_TRUST_SCHEDULE_HEADERS is unset', async () => {
    delete process.env.SPINE_TRUST_SCHEDULE_HEADERS
    const event = {
      path: '/.netlify/functions/trigger-scheduler',
      httpMethod: 'POST',
      headers: { 'x-nf-event': 'schedule', 'user-agent': 'Netlify Clockwork' },
      body: JSON.stringify({ next_run: 'x' }),
    }
    // No secret + untrusted headers → normal middleware path, not SYSTEM_PRINCIPAL.
    const res = await handler(event, {})
    // Either the middleware rejects it (401/403 response) or, if the cron
    // handler was reached at all, it was not given the system principal.
    if (cronHandler.mock.calls.length) {
      const [ctx] = cronHandler.mock.calls[0]
      expect(ctx?.principal?.id).not.toBe('system')
    } else {
      expect(res?.statusCode === 200).toBe(false)
    }
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
