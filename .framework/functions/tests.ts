// CIL[BEGIN stable_id="~/.framework/functions/tests.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/tests.ts"]
// CIL[DOC-MACRO purpose="Module setup and imports for tests.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Establish the public surface and dependencies of tests.ts"]
// CIL[DOC-CONTEXT module=".framework/functions/tests.ts" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports required modules for tests.ts" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-AUDIENCE audience="functions"]
// CIL[DOC-STABILITY stability="stable"]


import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
// CIL[DOC-VECTOR type="context" content="purpose='Module setup and imports for tests.ts'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/tests.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/tests.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/tests.ts"]
// CIL[DOC-MACRO purpose="Define the handler constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the handler value to consumers"]
// CIL[DOC-CONTEXT module=".framework/functions/tests.ts" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/tests.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="handler function" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Binds the expression to the handler identifier" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx) => {
  const authErr = requireSystemContextWithAudit(ctx)
  if (authErr) return authErr

  const q = (ctx as any).query || {}
  const action = q.action || 'list'
  const id = q.id || q.run_id || null

  if (action === 'get' || id) {
    const runId = id
    if (!runId) {
      return { error: 'id is required for action=get', status: 400 }
    }

    const { data: run, error: runErr } = await adminDb
      .from('test_runs')
      .select('*')
      .eq('id', runId)
      .single()

    if (runErr || !run) {
      return { error: `Test run not found: ${runId}`, status: 404 }
    }

    const { data: results, error: resultsErr } = await adminDb
      .from('test_results')
      .select('*')
      .eq('run_id', runId)
      .order('status', { ascending: true })
      .order('file', { ascending: true })
      .order('name', { ascending: true })

    if (resultsErr) {
      return { error: resultsErr.message, status: 500 }
    }

    return { data: { ...run, results: results ?? [] }, error: null }
  }

  if (action === 'stats') {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await adminDb
      .from('test_runs')
      .select('suite, status, started_at, passed, failed, total, duration_ms')
      .gte('started_at', since)
      .order('started_at', { ascending: false })
      .limit(200)

    if (error) return { error: error.message, status: 500 }

    const suites = ['unit', 'integration', 'api', 'ui']
    const stats = suites.map(suite => {
      const suiteRuns = (data ?? []).filter(r => r.suite === suite)
      const lastRun = suiteRuns[0] ?? null
      return {
        suite,
        total_runs: suiteRuns.length,
        last_status: lastRun?.status ?? null,
        last_run_at: lastRun?.started_at ?? null,
        last_passed: lastRun?.passed ?? null,
        last_failed: lastRun?.failed ?? null,
        last_total:  lastRun?.total ?? null,
      }
    })

    return { data: stats, error: null }
  }

  const limit = Math.min(parseInt(q.limit || '20', 10), 100)
  const suite = q.suite || null

  let query = adminDb
    .from('test_runs')
    .select('id, suite, status, started_at, finished_at, duration_ms, total, passed, failed, skipped, triggered_by')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (suite) {
    query = query.eq('suite', suite)
  }

  const { data, error } = await query

  if (error) return { error: error.message, status: 500 }

  return { data: data ?? [], error: null }
})
// CIL[DOC-VECTOR type="context" content="purpose='Define the handler constant'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/tests.ts:handler:constant"]