// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="Eval harness module imports and entry re-export"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and expose the main eval handler for serverless function routing"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none at module level" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the shared imports and main handler re-export for the evaluation harness" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]






















import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveTypeId } from './_shared/resolve-ids'
import { create } from './admin-data'
import { emitLog } from './_shared/audit'
import { callOpenAIEmbeddings } from './_shared/llm'
// CIL[DOC-VECTOR type="context" content="purpose='Eval harness module imports and entry re-export'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:TEST_TYPES:constant" type="constant" identity="TEST_TYPES" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="Enumeration of supported evaluation test categories"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the canonical list of test_type values used in eval test cases and coverage"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="readonly array of test type strings" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static const array of eval test categories" notable_decisions="[]"]
const TEST_TYPES = ['easy', 'medium', 'hard', 'security', 'hallucination', 'stale', 'account_gating'] as const
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:TEST_TYPES:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:TestType:type" type="type" identity="TestType" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Enumeration of supported evaluation test categories'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Type union derived from the TEST_TYPES array"]
// CIL[DOC-RESPONSIBILITY responsibility="Constrain test_type fields to the supported categories"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TestType union type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Type alias derived from TEST_TYPES" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type TestType = typeof TEST_TYPES[number]
// CIL[DOC-VECTOR type="context" content="purpose='Type union derived from the TEST_TYPES array'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:TestType:type"]

// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:CONFIDENCE_TIERS:constant" type="constant" identity="CONFIDENCE_TIERS" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="Threshold map for categorizing confidence scores"]
// CIL[DOC-RESPONSIBILITY responsibility="Define min and max score boundaries for high, medium and low tiers"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="constant tier threshold object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Object mapping tier names to min and max similarity score ranges" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const CONFIDENCE_TIERS = {
  high:   { min: 0.85, max: 1.00 },
  medium: { min: 0.60, max: 0.849 },
  low:    { min: 0.00, max: 0.599 },
}
// CIL[DOC-VECTOR type="context" content="purpose='Threshold map for categorizing confidence scores'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:CONFIDENCE_TIERS:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:createTestCase:constant" type="constant" identity="createTestCase" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="Create a new eval test case record"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate input, resolve the eval_test_case type, and persist the test case item"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="question, expected_tier, expected_escalate, expected_source_ids, excluded_source_ids, test_type" outputs="created item record" errors="throws if question missing or eval_test_case type not found" side_effects="inserts a new active item into the items table"]
// CIL[DOC-MICRO logic_summary="Resolves the eval_test_case type and inserts an item with the provided test parameters" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Create a new eval test case record'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:createTestCase:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:listTestCases:constant" type="constant" identity="listTestCases" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="List active eval test case records"]
// CIL[DOC-RESPONSIBILITY responsibility="Query active items for the eval_test_case type with optional test_type filter"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="query: test_type, limit, offset" outputs="array of test case records" errors="throws on database error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a query against items filtered by status, type and optional test_type" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
export const listTestCases = createHandler(async (ctx, _body) => {
  const { test_type, limit = '200', offset = '0' } = ctx.query || {}

  const { data: typeRow } = await adminDb
    .from('types').select('id').eq('slug', 'eval_test_case').eq('kind', 'item').maybeSingle()

  let q = ctx.db
    .from('items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (typeRow?.id) q = q.eq('type_id', typeRow.id)
  if (test_type) q = q.eq('data->>test_type', test_type)

  const { data, error } = await q
  if (error) throw error
  return data || []
})
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:listTestCases:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='List active eval test case records'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:runEval:constant" type="constant" identity="runEval" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="Run an evaluation pass over active test cases and store results"]
// CIL[DOC-RESPONSIBILITY responsibility="Embed questions, retrieve similar documents, score recall, boundaries, tier correctness and record the execution"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="body: test_type, similarity_threshold, match_count; requires account context" outputs="run summary and per-case results" errors="throws if account missing or database errors; skips cases on embed failure" side_effects="inserts a pipeline_executions row and emits an audit log"]
// CIL[DOC-MICRO logic_summary="For each test case, computes embeddings, calls match_embeddings, checks recall, boundaries, tier correctness, and writes the execution result" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const runEval = createHandler(async (ctx, body) => {
  const { test_type, similarity_threshold = 0.15, match_count = 8 } = body || {}
  if (!ctx.accountId) throw new Error('Account context required')

  const { data: typeRow } = await adminDb
    .from('types').select('id').eq('slug', 'eval_test_case').eq('kind', 'item').maybeSingle()

  let q = adminDb.from('items').select('*').eq('status', 'active').limit(500)
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
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:runEval:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:getResults:constant" type="constant" identity="getResults" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="Fetch recent eval run results"]
// CIL[DOC-VECTOR type="context" content="purpose='Run an evaluation pass over active test cases and store results'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the latest pipeline_executions rows triggered by eval runs for the current account"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="query limit" outputs="array of execution records" errors="throws on db error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Queries pipeline_executions for eval_run trigger data and returns recent records" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Fetch recent eval run results'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:getResults:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:getCoverage:constant" type="constant" identity="getCoverage" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="Report how many test cases exist per test category"]
// CIL[DOC-RESPONSIBILITY responsibility="Count active eval test cases by test_type and list missing categories"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="coverage summary and recommendations" errors="throws on db error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Counts cases per TEST_TYPES and returns totals and recommendations" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const getCoverage = createHandler(async (ctx, _body) => {
  const { data: typeRow } = await adminDb
    .from('types').select('id').eq('slug', 'eval_test_case').eq('kind', 'item').maybeSingle()

  const { data: testCases } = await adminDb
    .from('items')
    .select('data')
    .eq('status', 'active')
    .eq('type_id', typeRow?.id || '00000000-0000-0000-0000-000000000000')
    .limit(1000)

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
// CIL[DOC-VECTOR type="context" content="purpose='Report how many test cases exist per test category'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:getCoverage:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/eval-harness.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/eval-harness.ts"]
// CIL[DOC-MACRO purpose="Route incoming eval harness requests to the correct action"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch based on action and method to create, list, run, or get eval operations"]
// CIL[DOC-CONTEXT module="eval-harness" layer="function" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/eval-harness.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.action and method; body for POST actions" outputs="result of the chosen action or throws" errors="throws Invalid action or method for unsupported combinations" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Switch on action, guard by method, and dispatch to internal handlers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Route incoming eval harness requests to the correct action'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/eval-harness.ts:handler:constant"]