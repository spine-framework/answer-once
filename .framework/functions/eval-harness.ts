





















import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { scopeFor, ifAccountScope } from './_shared/account-scope'
import { resolveTypeId } from './_shared/resolve-ids'
import { create } from './admin-data'
import { emitLog } from './_shared/audit'
import { callOpenAIEmbeddings } from './_shared/llm'
const TEST_TYPES = ['easy', 'medium', 'hard', 'security', 'hallucination', 'stale', 'account_gating'] as const
type TestType = typeof TEST_TYPES[number]

const CONFIDENCE_TIERS = {
  high:   { min: 0.85, max: 1.00 },
  medium: { min: 0.60, max: 0.849 },
  low:    { min: 0.00, max: 0.599 },
}
export const createTestCase = createHandler(async (ctx, body) => {
  const {
    question, expected_tier = 'medium', expected_escalate = false,
    expected_source_ids = [], excluded_source_ids = [],
    test_type = 'medium',
  } = body || {}

  if (!question) throw new Error('question is required')

  let typeId: string | null = null
  try { typeId = await resolveTypeId('item', 'eval_test_case') } catch { /* not yet seeded */ }
  if (!typeId) throw new Error('eval_test_case type not found — run app install first')

  return await create(ctx, {
    entity: 'items',
    type_id: typeId,
    title: question.slice(0, 120),
    status: 'active',
    data: {
      question,
      expected_tier,
      expected_escalate,
      expected_source_ids,
      excluded_source_ids,
      test_type,
    },
  })
})
export const listTestCases = createHandler(async (ctx, _body) => {
  const { test_type, limit = '200', offset = '0' } = ctx.query || {}

  const { data: typeRow } = await adminDb
    .from('types').select('id').eq('slug', 'eval_test_case').eq('kind', 'item').maybeSingle()

  const { accountIds } = await scopeFor(ctx)
  let q = ifAccountScope(ctx.db
    .from('items')
    .select('*'), accountIds)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (typeRow?.id) q = q.eq('type_id', typeRow.id)
  if (test_type) q = q.eq('data->>test_type', test_type)

  const { data, error } = await q
  if (error) throw error
  return data || []
})
export const runEval = createHandler(async (ctx, body) => {
  const { test_type, similarity_threshold = 0.15, match_count = 8 } = body || {}
  if (!ctx.accountId) throw new Error('Account context required')

  const { data: typeRow } = await adminDb
    .from('types').select('id').eq('slug', 'eval_test_case').eq('kind', 'item').maybeSingle()

  const { data: platformAcct } = await adminDb
    .from('accounts').select('id').eq('slug', 'spine-system').maybeSingle()
  const evalAccounts = [ctx.accountId]
  if (platformAcct?.id && platformAcct.id !== ctx.accountId) evalAccounts.push(platformAcct.id)

  let q = adminDb.from('items').select('*').eq('status', 'active')
    .in('account_id', evalAccounts).limit(500)
  if (typeRow?.id) q = q.eq('type_id', typeRow.id)
  if (test_type)   q = q.eq('data->>test_type', test_type)
  const { data: testCases, error: tcErr } = await q
  if (tcErr) throw tcErr
  if (!testCases?.length) return { run_id: null, message: 'No test cases found', total: 0 }

  
  const { data: platformAccount } = await adminDb
    .from('accounts').select('id').eq('slug', 'spine-system').maybeSingle()
  const accountIds = [ctx.accountId]
  if (platformAccount?.id && platformAccount.id !== ctx.accountId) accountIds.push(platformAccount.id)

  
  const results: any[] = []
  let passed = 0; let failed = 0; let skipped = 0

  for (const tc of testCases) {
    // Cases created from a live ticket carry observed (diagnostic) sources but
    // no human-approved expected_source_ids yet — exclude them from scoring
    // until review promotes them to golden cases.
    if (tc.data?.needs_source_review) {
      skipped++
      results.push({ id: tc.id, status: 'skipped', reason: 'needs_source_review' })
      continue
    }
    const question     = tc.data?.question || tc.title
    const expectedSrcs = tc.data?.expected_source_ids || []
    const excludedSrcs = tc.data?.excluded_source_ids || []
    const expectedTier = tc.data?.expected_tier || 'medium'

    try {
      
      let embedJson: any
      try {
        embedJson = await callOpenAIEmbeddings(ctx, [question], 'text-embedding-3-small')
      } catch {
        skipped++; results.push({ id: tc.id, status: 'skipped', reason: 'embed_api_error' }); continue
      }
      const queryEmbedding: number[] = embedJson.data?.[0]?.embedding || []

      
      const { data: matches } = await adminDb.rpc('match_embeddings', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_count: match_count * 2,
        filter_account_ids: accountIds,
        filter_vector_type: 'semantic',
        similarity_threshold,
        filter_item_types: null,
      })

      const retrievedIds = new Set((matches || []).map((m: any) => m.document_id))
      const meanSim = matches?.length
        ? (matches as any[]).reduce((s: number, m: any) => s + m.similarity, 0) / matches.length
        : 0

      
      const recallHits     = expectedSrcs.filter((id: string) => retrievedIds.has(id)).length
      const retrievalRecall = expectedSrcs.length > 0 ? recallHits / expectedSrcs.length : null

      const boundaryViolations = excludedSrcs.filter((id: string) => retrievedIds.has(id))
      const boundarySafe = boundaryViolations.length === 0

      
      let inferredTier: string
      if (meanSim >= CONFIDENCE_TIERS.high.min) inferredTier = 'high'
      else if (meanSim >= CONFIDENCE_TIERS.medium.min) inferredTier = 'medium'
      else inferredTier = 'low'
      const tierCorrect = inferredTier === expectedTier

      const casePassed = boundarySafe &&
        (retrievalRecall === null || retrievalRecall >= 0.5) &&
        tierCorrect

      if (casePassed) passed++; else failed++

      results.push({
        id:                  tc.id,
        question:            question.slice(0, 80),
        test_type:           tc.data?.test_type,
        status:              casePassed ? 'pass' : 'fail',
        retrieval_recall:    retrievalRecall,
        boundary_safe:       boundarySafe,
        boundary_violations: boundaryViolations,
        tier_correct:        tierCorrect,
        inferred_tier:       inferredTier,
        expected_tier:       expectedTier,
        mean_similarity:     Math.round(meanSim * 1000) / 1000,
        retrieved_count:     retrievedIds.size,
      })
    } catch (err: any) {
      skipped++
      results.push({ id: tc.id, status: 'skipped', reason: err.message })
    }
  }

  const summary = {
    total: testCases.length,
    passed,
    failed,
    skipped,
    pass_rate: testCases.length > 0 ? Math.round((passed / testCases.length) * 100) : 0,
    run_at: new Date().toISOString(),
    account_id: ctx.accountId,
  }

  
  const { data: execRow } = await adminDb
    .from('pipeline_executions')
    .insert({
      pipeline_id: '00000000-0000-0000-0000-000000000000', // sentinel UUID for eval runs
      account_id:  ctx.accountId,
      status:      failed === 0 ? 'completed' : 'failed',
      trigger_data: { eval_run: true, test_type: test_type || 'all' },
      result:      { summary, results },
      started_at: summary.run_at,
      completed_at: new Date().toISOString(),
      duration_ms: 0,
    })
    .select('id')
    .single()

  await emitLog(ctx, 'eval.run_completed',
    { type: 'system', id: execRow?.id || 'eval' },
    { after: summary }
  )

  return { run_id: execRow?.id || null, summary, results }
})
export const getResults = createHandler(async (ctx, _body) => {
  if (!ctx.accountId) throw new Error('Account context required')

  const limit = Number(ctx.query?.limit || 5)

  const { data, error } = await adminDb
    .from('pipeline_executions')
    .select('id, status, result, started_at, completed_at, trigger_data')
    .eq('account_id', ctx.accountId)
    .eq('trigger_data->>eval_run', 'true')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
})
export const getCoverage = createHandler(async (ctx, _body) => {
  const { data: typeRow } = await adminDb
    .from('types').select('id').eq('slug', 'eval_test_case').eq('kind', 'item').maybeSingle()

  const { data: platformAcct } = await adminDb
    .from('accounts').select('id').eq('slug', 'spine-system').maybeSingle()
  const evalAccounts = ctx.accountId ? [ctx.accountId] : []
  if (platformAcct?.id && platformAcct.id !== ctx.accountId) evalAccounts.push(platformAcct.id)

  let covQ = adminDb
    .from('items')
    .select('data')
    .eq('status', 'active')
    .eq('type_id', typeRow?.id || '00000000-0000-0000-0000-000000000000')
  if (evalAccounts.length) covQ = covQ.in('account_id', evalAccounts)
  const { data: testCases } = await covQ.limit(1000)

  const countByType: Record<string, number> = {}
  for (const tt of TEST_TYPES) countByType[tt] = 0
  for (const tc of testCases || []) {
    const t = tc.data?.test_type || 'medium'
    countByType[t] = (countByType[t] || 0) + 1
  }

  const coverage = TEST_TYPES.map(tt => ({
    test_type:   tt,
    case_count:  countByType[tt] || 0,
    has_cases:   (countByType[tt] || 0) > 0,
  }))

  return {
    total_cases: testCases?.length || 0,
    coverage,
    recommendation: coverage.filter(c => !c.has_cases).map(c => c.test_type),
  }
})
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'create_test_case':
      if (method === 'POST') return await createTestCase(ctx, body)
      break
    case 'list_test_cases':
      if (method === 'GET') return await listTestCases(ctx, body)
      break
    case 'run_eval':
      if (method === 'POST') return await runEval(ctx, body)
      break
    case 'get_results':
      if (method === 'GET') return await getResults(ctx, body)
      break
    case 'get_coverage':
      if (method === 'GET') return await getCoverage(ctx, body)
      break
    default:
      if (method === 'GET') return await listTestCases(ctx, body)
  }

  throw new Error('Invalid action or method')
})