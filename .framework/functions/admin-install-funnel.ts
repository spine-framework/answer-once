// CIL[BEGIN stable_id="~/.framework/functions/admin-install-funnel.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/admin-install-funnel.ts"]
// CIL[DOC-MACRO purpose="Netlify function entrypoint for install funnel admin metrics and export handlers"]
// CIL[DOC-RESPONSIBILITY responsibility="Define admin metrics and exportData handler exports for the install-funnel function"]
// CIL[DOC-CONTEXT module="admin" layer="function" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware and database client for the install funnel admin endpoints" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin-api consumer"]


import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function entrypoint for install funnel admin metrics and export handlers'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/admin-install-funnel.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/admin-install-funnel.ts:metrics:constant" type="constant" identity="metrics" parent="~/.framework/functions/admin-install-funnel.ts"]
// CIL[DOC-MACRO purpose="Serve install funnel metrics including downloads, installs, first use, claimed, trends and version breakdown"]
// CIL[DOC-RESPONSIBILITY responsibility="Compute and return install funnel analytics from the item registry"]
// CIL[DOC-CONTEXT module="admin" layer="function" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-install-funnel.ts"]
// CIL[DOC-CONTRACT inputs="admin request context and body" outputs="JSON metrics object with funnel counts, trends, recent installs and top versions" errors="none — missing signal types degrade to zeroed metrics" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolves the funnel_signal and spine_instance types, aggregates counts, formats recent installs and computes 30-day daily trends" notable_decisions="Signal types are app-seeded, so absent types produce zeroed sections rather than errors"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Serve install funnel metrics including downloads, installs, first use, claimed, trends and version breakdown'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/admin-install-funnel.ts:metrics:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/admin-install-funnel.ts:exportData:constant" type="constant" identity="exportData" parent="~/.framework/functions/admin-install-funnel.ts"]
// CIL[DOC-MACRO purpose="Export raw install funnel instance records with contact and account details"]
// CIL[DOC-RESPONSIBILITY responsibility="Return all funnel_signal instances with source 'inst' and a non-null serial"]
// CIL[DOC-CONTEXT module="admin" layer="function" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-install-funnel.ts"]
// CIL[DOC-CONTRACT inputs="admin request context and body" outputs="JSON object with instances array, exported_at and total_count" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects instances with joined people and accounts, ordered by created_at descending" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Export raw install funnel instance records with contact and account details'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/admin-install-funnel.ts:exportData:constant"]