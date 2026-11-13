
import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
// Signal types are app-seeded, so absent types produce zeroed sections rather than errors; ignores signal items without account_id for stage counts; uses 30-day window; guards division with zero checks
export const metrics = createHandler(async (ctx, body) => {
  requireSystemContextWithAudit(ctx)
  const { data: typeRows } = await adminDb
    .from('types')
    .select('id, slug')
    .eq('kind', 'item')
    .in('slug', ['funnel_signal', 'anonymous_session', 'spine_instance'])

  const typeIdFor = (slug: string) => typeRows?.find((t: any) => t.slug === slug)?.id || null
  const signalTypeId = typeIdFor('funnel_signal')
  const sessionTypeId = typeIdFor('anonymous_session')
  const instanceTypeId = typeIdFor('spine_instance')

  // Signal types are seeded by installed apps — a clean framework install
  // legitimately has none, so degrade to zeroed metrics instead of 500s.
  if (!signalTypeId && !sessionTypeId && !instanceTypeId) {
    return {
      anonymous_visitors: 0,
      identified_users: 0,
      installed_instances: 0,
      conversion_rates: {
        anonymous_to_identified: 0,
        identified_to_installed: 0
      },
      stage_distribution: []
    }
  }

  const { data: stageData } = signalTypeId ? await adminDb
    .from('items')
    .select('data->>stage, account_id')
    .eq('type_id', signalTypeId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) : { data: [] }

  const stageCounts = stageData?.reduce((acc, item) => {
    const stage = item.data?.stage || 'unknown'
    if (item.account_id) {
      acc[stage] = (acc[stage] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const totalStageSignals = Object.values(stageCounts).reduce((sum, count) => sum + count, 0)

  const { count: anonymousSessions } = sessionTypeId ? await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', sessionTypeId)
    .is('data->lifecycle->>stitched_to_account_id', null)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) : { count: 0 }

  const { data: accountData } = signalTypeId ? await adminDb
    .from('items')
    .select('account_id')
    .eq('type_id', signalTypeId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .not('account_id', 'is', null) : { data: [] }

  const uniqueAccounts = new Set(accountData?.map(item => item.account_id)).size

  const { count: installedInstances } = instanceTypeId ? await adminDb
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('type_id', instanceTypeId)
    .not('data->>claimed_by_person_id', 'is', null) : { count: 0 }

  const stageDistribution = Object.entries(stageCounts).map(([stage, count]) => ({
    stage,
    count,
    percentage: totalStageSignals > 0 ? (count / totalStageSignals) * 100 : 0
  }))

  const anonymousToIdentified = anonymousSessions > 0 ? (uniqueAccounts / anonymousSessions) * 100 : 0
  const identifiedToInstalled = uniqueAccounts > 0 ? (installedInstances / uniqueAccounts) * 100 : 0

  return {
    anonymous_visitors: anonymousSessions || 0,
    identified_users: uniqueAccounts,
    installed_instances: installedInstances || 0,
    conversion_rates: {
      anonymous_to_identified: anonymousToIdentified,
      identified_to_installed: identifiedToInstalled
    },
    stage_distribution: stageDistribution
  }
})