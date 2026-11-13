

import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
// Signal types are app-seeded, so absent types produce zeroed sections rather than errors
export const metrics = createHandler(async (ctx, body) => {
  requireSystemContextWithAudit(ctx)
  const { data: typeRows } = await adminDb
    .from('types')
    .select('id, slug')
    .eq('kind', 'item')
    .in('slug', ['funnel_signal', 'spine_instance'])

  const signalTypeId = typeRows?.find((t: any) => t.slug === 'funnel_signal')?.id || null
  const instanceTypeId = typeRows?.find((t: any) => t.slug === 'spine_instance')?.id || null

  // Signal types are seeded by installed apps — a clean framework install
  // legitimately has none, so degrade to zeroed metrics instead of 500s.
  if (!signalTypeId) {
    return {
      total_downloads: 0,
      unique_installers: 0,
      active_instances: 0,
      conversion_funnel: { downloads: 0, installations: 0, first_use: 0, claimed: 0 },
      install_trends: [],
      recent_installs: [],
      top_versions: []
    }
  }

  const { count: totalDownloads } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalTypeId)
    .eq('data->>source', 'inst')
    .eq('data->>action_type', 'download')

  const { data: installerData } = await adminDb
    .from('items')
    .select('data->>serial')
    .eq('type_id', signalTypeId)
    .eq('data->>source', 'inst')
    .not('data->>serial', 'is', null)

  const uniqueInstallers = new Set(installerData?.map(item => item.data?.serial)).size

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: activeInstances } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalTypeId)
    .eq('data->>source', 'inst')
    .not('data->>serial', 'is', null)
    .gte('created_at', sevenDaysAgo)

  const { count: installations } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalTypeId)
    .eq('data->>source', 'inst')
    .eq('data->>action_type', 'install')

  const { count: firstUse } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalTypeId)
    .eq('data->>source', 'inst')
    .eq('data->>action_type', 'first_command')

  const { count: claimed } = await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', signalTypeId)
    .eq('data->>source', 'inst')
    .not('data->>claimed_by_person_id', 'is', null)

  const { data: recentInstalls } = await adminDb
    .from('items')
    .select(`
      id,
      data->>serial,
      data->>version,
      data->>environment,
      data->>first_seen_at,
      data->>last_signal_at,
      data->>claimed_by_person_id,
      data->>claimed_at,
      account_id,
      people!fk_items_created_by(email),
      accounts(name)
    `)
    .eq('type_id', signalTypeId)
    .eq('data->>source', 'inst')
    .not('data->>serial', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  const formattedInstalls = recentInstalls?.map(instance => ({
    id: instance.id,
    serial: instance.data?.serial || 'unknown',
    app_version: instance.data?.version || 'unknown',
    environment: instance.data?.environment || 'unknown',
    first_seen_at: instance.data?.first_seen_at || instance.created_at,
    last_signal_at: instance.data?.last_signal_at || instance.created_at,
    claimed_by: instance.data?.claimed_by_person_id,
    claimed_at: instance.data?.claimed_at,
    account_name: instance.accounts?.name,
    person_email: instance.people?.email
  }))

  const { data: versionData } = instanceTypeId ? await adminDb
    .from('items')
    .select('data->>version')
    .eq('type_id', instanceTypeId) : { data: [] }

  const versionCounts = versionData?.reduce((acc, item) => {
    const version = item.data?.version || 'unknown'
    acc[version] = (acc[version] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalVersions = Object.values(versionCounts).reduce((sum, count) => sum + count, 0)
  const topVersions = Object.entries(versionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([version, count]) => ({
      version,
      count,
      percentage: totalVersions > 0 ? (count / totalVersions) * 100 : 0
    }))

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const installTrends = []
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const nextDateStr = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const { count: dailyDownloads } = await adminDb
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', signalTypeId)
      .eq('data->>source', 'inst')
      .eq('data->>action_type', 'download')
      .gte('created_at', dateStr)
      .lt('created_at', nextDateStr)

    const { count: dailyInstalls } = await adminDb
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', signalTypeId)
      .eq('data->>source', 'inst')
      .eq('data->>action_type', 'install')
      .gte('created_at', dateStr)
      .lt('created_at', nextDateStr)

    installTrends.push({
      date: dateStr,
      downloads: dailyDownloads || 0,
      installations: dailyInstalls || 0
    })
  }

  return {
    total_downloads: totalDownloads || 0,
    unique_installers: uniqueInstallers,
    active_instances: activeInstances || 0,
    conversion_funnel: {
      downloads: totalDownloads || 0,
      installations: installations || 0,
      first_use: firstUse || 0,
      claimed: claimed || 0
    },
    install_trends: installTrends,
    recent_installs: formattedInstalls || [],
    top_versions: topVersions
  }
})
export const exportData = createHandler(async (ctx, body) => {
  requireSystemContextWithAudit(ctx)
  const { data: signalType } = await adminDb
    .from('types')
    .select('id')
    .eq('kind', 'item')
    .eq('slug', 'funnel_signal')
    .maybeSingle()

  if (!signalType) {
    return {
      instances: [],
      exported_at: new Date().toISOString(),
      total_count: 0
    }
  }

  const { data: instances } = await adminDb
    .from('items')
    .select(`
      id,
      created_at,
      updated_at,
      data,
      account_id,
      people!fk_items_created_by(email),
      accounts(name)
    `)
    .eq('type_id', signalType.id)
    .eq('data->>source', 'inst')
    .not('data->>serial', 'is', null)
    .order('created_at', { ascending: false })

  return {
    instances: instances || [],
    exported_at: new Date().toISOString(),
    total_count: instances?.length || 0
  }
})