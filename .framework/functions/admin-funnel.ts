// CIL[BEGIN stable_id="~/.framework/functions/admin-funnel.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/admin-funnel.ts"]
// CIL[DOC-MACRO purpose="Module-level imports for the admin funnel metrics handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Import shared middleware and database client used by the handler"]
// CIL[DOC-CONTEXT module="admin-funnel" layer="function" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Dependency wiring for the admin funnel function" notable_decisions="Uses createHandler and adminDb from _shared"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="internal"]

import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
// CIL[DOC-VECTOR type="context" content="purpose='Module-level imports for the admin funnel metrics handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/admin-funnel.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/admin-funnel.ts:metrics:constant" type="constant" identity="metrics" parent="~/.framework/functions/admin-funnel.ts"]
// CIL[DOC-MACRO purpose="Compute admin funnel metrics for the last 30 days"]
// CIL[DOC-RESPONSIBILITY responsibility="Query item type registry and items table to calculate visitor, user, install, and stage distribution metrics"]
// CIL[DOC-CONTEXT module="admin-funnel" layer="function" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/admin-funnel.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: request payload" outputs="anonymous_visitors, identified_users, installed_instances, conversion_rates, stage_distribution" errors="none — missing signal types degrade to zeroed metrics" side_effects="Reads from adminDb; no writes"]
// CIL[DOC-MICRO logic_summary="Resolve funnel_signal, anonymous_session, and spine_instance type IDs from types (kind='item'); count signals, anonymous sessions, identified accounts, and installed instances; return conversion rates and stage distribution" notable_decisions="Signal types are app-seeded, so absent types produce zeroed sections rather than errors; ignores signal items without account_id for stage counts; uses 30-day window; guards division with zero checks"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Compute admin funnel metrics for the last 30 days'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/admin-funnel.ts:metrics:constant"]