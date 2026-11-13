

import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
export const metrics = createHandler(async (ctx, body) => {
  requireSystemContextWithAudit(ctx)
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  const { data: signalType } = await adminDb
    .from('types')
    .select('id')
    .eq('kind', 'item')
    .eq('slug', 'funnel_signal')
    .maybeSingle()

  // Signal types are seeded by installed apps — a clean framework install
  // legitimately has none, so degrade to zeroed metrics instead of 500s.
  if (!signalType) {
    return {
      total_signals: 0,
      signals_today: 0,
      signals_this_week: 0,
      conversion_rate: 0,
      top_sources: [],
      recent_signals: []
    }
  }

  const { count: totalSignals } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalType.id)

  const { count: signalsToday } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalType.id)
    .gte('created_at', today)

  const { count: signalsThisWeek } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalType.id)
    .gte('created_at', weekAgo)

  const { data: sourceData } = await adminDb
    .from('items')
    .select('data->>source')
    .eq('type_id', signalType.id)
    .gte('created_at', weekAgo)

  const sourceCounts = sourceData?.reduce((acc, item) => {
    const source = item.data?.source || 'unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topSources = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }))

  const { data: recentSignals } = await adminDb
    .from('items')
    .select(`
      id,
      data->>action_type,
      data->>source,
      data->>stage,
      created_at,
      data->>rating,
      account_id,
      accounts(name)
    `)
    .eq('type_id', signalType.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const formattedSignals = recentSignals?.map(signal => ({
    id: signal.id,
    action_type: signal.data?.action_type || 'unknown',
    source: signal.data?.source || 'unknown',
    stage: signal.data?.stage || 'unknown',
    created_at: signal.created_at,
    account_name: signal.accounts?.name,
    rating: parseInt(signal.data?.rating || '1')
  }))

  const { count: highValueSignals } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalType.id)
    .gte('data->>rating', '4')
    .gte('created_at', weekAgo)

  const conversionRate = signalsThisWeek > 0 ? (highValueSignals / signalsThisWeek) * 100 : 0

  return {
    total_signals: totalSignals || 0,
    signals_today: signalsToday || 0,
    signals_this_week: signalsThisWeek || 0,
    conversion_rate: conversionRate,
    top_sources: topSources,
    recent_signals: formattedSignals || []
  }
})
export const audit = createHandler(async (ctx, body) => {
  requireSystemContextWithAudit(ctx)
  const {
    page = '1',
    limit = '50',
    date_from,
    date_to,
    source,
    stage,
    action_type,
    min_rating,
    account_id,
    search,
    export: exportData
  } = ctx.query || {}

  const { data: signalType } = await adminDb
    .from('types')
    .select('id')
    .eq('kind', 'item')
    .eq('slug', 'funnel_signal')
    .maybeSingle()

  // Signal types are seeded by installed apps — degrade to an empty page.
  if (!signalType) {
    if (exportData) return []
    return {
      signals: [],
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  }

  let query = adminDb
    .from('items')
    .select(`
      id,
      data->>action_type,
      data->>action_value,
      data->>stage,
      data->>source,
      created_at,
      data->>rating,
      data->>raw_score,
      data->identity->>anonymous_id,
      data->identity->>session_id,
      data->attribution->>first_touch_referrer_domain,
      data->attribution->>utm_source,
      data->attribution->>utm_medium,
      data->attribution->>utm_campaign,
      account_id,
      people!fk_items_created_by(email),
      accounts(name)
    `, { count: 'exact' })
    .eq('type_id', signalType.id)

  if (date_from) {
    query = query.gte('created_at', date_from)
  }
  if (date_to) {
    query = query.lte('created_at', date_to)
  }
  if (source) {
    query = query.eq('data->>source', source)
  }
  if (stage) {
    query = query.eq('data->>stage', stage)
  }
  if (action_type) {
    query = query.eq('data->>action_type', action_type)
  }
  if (min_rating) {
    query = query.gte('data->>rating', min_rating)
  }
  if (account_id) {
    query = query.eq('account_id', account_id)
  }
  if (search) {
    query = query.or(`accounts.name.ilike.%${search}%,people.email.ilike.%${search}%,data->attribution->>first_touch_referrer_domain.ilike.%${search}%`)
  }

  const offset = (parseInt(page) - 1) * parseInt(limit)
  query = query.order('created_at', { ascending: false })

  if (!exportData) {
    query = query.range(offset, offset + parseInt(limit) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch signals: ${error.message}`)
  }

  const formattedSignals = data?.map(signal => ({
    id: signal.id,
    action_type: signal.data?.action_type || 'unknown',
    action_value: parseInt(signal.data?.action_value || '1'),
    stage: signal.data?.stage || 'unknown',
    source: signal.data?.source || 'unknown',
    created_at: signal.created_at,
    account_name: signal.accounts?.name,
    person_email: signal.people?.email,
    anonymous_id: signal.data?.identity?.anonymous_id,
    session_id: signal.data?.identity?.session_id,
    rating: parseInt(signal.data?.rating || '1'),
    raw_score: parseFloat(signal.data?.raw_score || '0'),
    referrer_domain: signal.data?.attribution?.first_touch_referrer_domain,
    utm_source: signal.data?.attribution?.utm_source,
    utm_medium: signal.data?.attribution?.utm_medium,
    utm_campaign: signal.data?.attribution?.utm_campaign
  }))

  if (exportData) {
    return formattedSignals
  }

  return {
    signals: formattedSignals,
    total: count || 0,
    page: parseInt(page),
    limit: parseInt(limit)
  }
})
