import { randomUUID } from 'crypto'
import { SYSTEM_PRINCIPAL } from './_shared/principal'
import { adminDb } from './_shared/db'
import { autoResolvePending } from './custom_answeronce-journey'

// the once-a-day lazy sweep on the company tickets page remains the fallback if cron never fires
export const handler = async () => {
  const ctx = {
    requestId: randomUUID(),
    principal: {
      ...SYSTEM_PRINCIPAL,
      provenance: { sourceType: 'cron', createdBy: null, invokedAt: new Date().toISOString() },
    },
    db: adminDb,
    accountId: null,
    appId: null,
    query: {},
    requestPath: '/.netlify/functions/custom_answeronce-autoresolve-cron',
    headers: {},
    source: 'cron',
  }
  try {
    const result = await autoResolvePending(ctx, {})
    console.log('[answeronce-autoresolve]', JSON.stringify(result))
  } catch (err) {
    console.error('[answeronce-autoresolve] sweep failed:', err)
    throw err
  }
}
