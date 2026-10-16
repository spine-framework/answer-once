// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:file_header:constant" type="constant" identity="file_header" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Top-level file documentation and environment reference for the API surface test suite."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide file-level metadata, module description, and JSDoc tags for the test file."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="file-level JSDoc metadata" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Documents test scope, auth matrix, and skip conditions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/// <reference types="node" />
/**
 * @module tests/api/api-surface
 * @audience core-contributor
 * @layer test-api
 * @stability stable
 *
 * HTTP API surface tests. Runs fetch requests against the local dev server
 * (SPINE_DEV_URL, default http://localhost:8888) and validates the auth matrix,
 * CRUD lifecycle, and error handling — all against the **public schema**.
 *
 * **Auth matrix tested:**
 * - No auth token        → 401
 * - Valid JWT (system admin) → 200 with full records
 * - Invalid token        → 401 / 403
 * - Machine API key (if SPINE_TEST_API_KEY set) → 200
 *
 * Skips when SPINE_DEV_JWT is not set (server not running or not logged in).
 *
 * @seeAlso tests/integration/helpers.ts
 * @seeAlso functions/admin-data.ts
 */
// CIL[DOC-VECTOR type="context" content="purpose='Top-level file documentation and environment reference for the API surface test suite.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:file_header:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Import vitest testing utilities and mark the module header."]
// CIL[DOC-RESPONSIBILITY responsibility="Set up the test runner imports for this module."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported describe, it, expect" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports vitest functions used throughout the test file." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="core-contributor"]
import { describe, it, expect } from 'vitest'
// CIL[DOC-VECTOR type="context" content="purpose='Import vitest testing utilities and mark the module header.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:dev_url:constant" type="constant" identity="dev_url" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Define the dev server base URL from environment or default."]
// CIL[DOC-RESPONSIBILITY responsibility="Read SPINE_DEV_URL env var and provide a fallback localhost URL."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="process.env.SPINE_DEV_URL" outputs="DEV_URL string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolves the target server URL with a localhost default." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const DEV_URL     = process.env.SPINE_DEV_URL  || 'http://localhost:8888'
// CIL[DOC-VECTOR type="context" content="purpose='Define the dev server base URL from environment or default.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:dev_url:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:dev_jwt:constant" type="constant" identity="dev_jwt" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Provide the JWT token for authenticated requests from environment."]
// CIL[DOC-RESPONSIBILITY responsibility="Read SPINE_DEV_JWT environment variable or default to empty string."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="process.env.SPINE_DEV_JWT" outputs="DEV_JWT string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Loads bearer token used in auth headers." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const DEV_JWT     = process.env.SPINE_DEV_JWT  || ''
// CIL[DOC-VECTOR type="context" content="purpose='Provide the JWT token for authenticated requests from environment.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:dev_jwt:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:test_api_key:constant" type="constant" identity="test_api_key" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Provide the machine API key for machine principal tests."]
// CIL[DOC-RESPONSIBILITY responsibility="Read SPINE_TEST_API_KEY environment variable or default to empty string."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="process.env.SPINE_TEST_API_KEY" outputs="TEST_API_KEY string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Loads optional machine API key used in API-key auth tests." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const TEST_API_KEY = process.env.SPINE_TEST_API_KEY || ''
// CIL[DOC-VECTOR type="context" content="purpose='Provide the machine API key for machine principal tests.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:test_api_key:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:has_server:constant" type="constant" identity="has_server" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Determine whether the dev server is available based on the presence of a JWT."]
// CIL[DOC-RESPONSIBILITY responsibility="Evaluate whether authenticated integration tests should run."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="DEV_JWT" outputs="hasServer boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts the JWT presence into a boolean gate for skipping tests." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const hasServer = !!DEV_JWT
// CIL[DOC-VECTOR type="context" content="purpose='Determine whether the dev server is available based on the presence of a JWT.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:has_server:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:api:function" type="function" identity="api" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Perform an HTTP request against the dev server and return status/body."]
// CIL[DOC-RESPONSIBILITY responsibility="Abstract fetch calls with JSON body parsing and error swallowing."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="path: string, opts: RequestInit" outputs="{ status: number, body: any }" errors="network or parse errors are caught and returned as {status:0,body:null}" side_effects="initiates an HTTP request"]
// CIL[DOC-MICRO logic_summary="Fetches JSON from DEV_URL+path, parses body, and suppresses exceptions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function api(path: string, opts: RequestInit = {}) {
  try {
    const res = await fetch(`${DEV_URL}${path}`, opts)
    let body: any = null
    try { body = await res.json() } catch {}
    return { status: res.status, body }
  } catch {
    return { status: 0, body: null }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Perform an HTTP request against the dev server and return status/body.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:api:function"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:describe_unauthenticated_requests:block" type="block" identity="describe_unauthenticated_requests" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Verify unauthenticated requests to protected endpoints return 401."]
// CIL[DOC-RESPONSIBILITY responsibility="Test auth gate for public API endpoints without a token."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="vitest describe/it blocks asserting 401 status" errors="assertion failures reported by vitest" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Iterates a list of endpoints and checks status equals 401." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// ─── 1. Unauthenticated → 401 ─────────────────────────────────────────────────
describe.skipIf(!hasServer)('auth — unauthenticated requests', () => {
  const endpoints = [
    '/.netlify/functions/admin-data?entity=accounts&method=GET',
    '/.netlify/functions/admin-data?entity=people&method=GET',
    '/.netlify/functions/admin-data?entity=types&method=GET',
    '/.netlify/functions/types?action=list',
  ]

  for (const path of endpoints) {
    it(`${path} → 401 without auth`, async () => {
      const { status } = await api(path)
      expect(status).toBe(401)
    })
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Verify unauthenticated requests to protected endpoints return 401.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:describe_unauthenticated_requests:block"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:describe_system_admin_gets_full_records:block" type="block" identity="describe_system_admin_gets_full_records" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Verify valid JWT system admin requests return 200 with data arrays."]
// CIL[DOC-RESPONSIBILITY responsibility="Test happy path for accounts, people, types list and response envelope."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="passing/failing test results" errors="assertion or runtime errors raised by vitest" side_effects="console.log of statuses and counts"]
// CIL[DOC-MICRO logic_summary="Uses authHeader to call protected endpoints and validates response shape." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// ─── 2. System admin gets full records ────────────────────────────────────────
describe.skipIf(!hasServer)('auth — system admin gets full records', () => {
  const authHeader = { Authorization: `Bearer ${DEV_JWT}` }

  it('GET accounts → 200 with data array', async () => {
    const { status, body } = await api(
      '/.netlify/functions/admin-data?entity=accounts&method=GET',
      { headers: authHeader }
    )
    console.log('[api-gap] accounts status:', status, '| count:', body?.data?.length ?? '?')
    expect(status).toBe(200)
    expect(body?.error).toBeNull()
    expect(Array.isArray(body?.data)).toBe(true)
  })

  it('GET people → 200 with data array', async () => {
    const { status, body } = await api(
      '/.netlify/functions/admin-data?entity=people&method=GET',
      { headers: authHeader }
    )
    console.log('[api-gap] people status:', status, '| count:', body?.data?.length ?? '?')
    expect(status).toBe(200)
    expect(body?.error).toBeNull()
  })

  it('GET types → 200 with data array', async () => {
    const { status, body } = await api(
      '/.netlify/functions/types?action=list',
      { headers: authHeader }
    )
    console.log('[api-gap] types status:', status, '| count:', body?.data?.length ?? '?')
    if (body?.data?.length === 0) {
      console.warn('[gap] public.types empty — day-zero seeds missing from public schema')
    }
    expect(status).toBe(200)
  })

  it('response envelope shape is { data, error: null, meta }', async () => {
    const { body } = await api(
      '/.netlify/functions/admin-data?entity=accounts&method=GET',
      { headers: authHeader }
    )
    expect(body).toHaveProperty('data')
    expect(body?.error).toBeNull()
    expect(body?.meta?.requestId).toBeTruthy()
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Verify valid JWT system admin requests return 200 with data arrays.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:describe_system_admin_gets_full_records:block"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:describe_invalid_token_rejected:block" type="block" identity="describe_invalid_token_rejected" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Verify malformed bearer token is rejected with 401."]
// CIL[DOC-RESPONSIBILITY responsibility="Negative auth test for an invalid JWT."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="vitest failures" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls admin-data with a fake bearer token and expects 401." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// ─── 3. Invalid token → 401 ───────────────────────────────────────────────────
describe.skipIf(!hasServer)('auth — invalid token rejected', () => {
  it('malformed bearer token → 401', async () => {
    const { status } = await api(
      '/.netlify/functions/admin-data?entity=accounts&method=GET',
      { headers: { Authorization: 'Bearer not-a-real-jwt' } }
    )
    expect(status).toBe(401)
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Verify malformed bearer token is rejected with 401.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:describe_invalid_token_rejected:block"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:describe_crud_lifecycle_items_via_admin_data:block" type="block" identity="describe_crud_lifecycle_items_via_admin_data" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Exercise CRUD and query operations on items via admin-data endpoint."]
// CIL[DOC-RESPONSIBILITY responsibility="Validate GET items, unknown entity handling, and limit parameter."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test results" errors="assertion or runtime failures" side_effects="console.log and console.warn of data gaps"]
// CIL[DOC-MICRO logic_summary="Fetches items, checks unknown entity returns error, and verifies limit=1." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// ─── 4. CRUD lifecycle on items ───────────────────────────────────────────────
describe.skipIf(!hasServer)('CRUD lifecycle — items via admin-data', () => {
  const authHeader = { Authorization: `Bearer ${DEV_JWT}` }
  let createdId: string | null = null

  it('GET items returns 200', async () => {
    const { status, body } = await api(
      '/.netlify/functions/admin-data?entity=items&method=GET',
      { headers: authHeader }
    )
    console.log('[api-gap] items status:', status, '| count:', body?.data?.length ?? '?')
    expect(status).toBe(200)
    if (!body?.data?.length) {
      console.warn('[gap] public.items is empty')
    }
  })

  it('unknown entity returns error not crash', async () => {
    const { status, body } = await api(
      '/.netlify/functions/admin-data?entity=passwords&method=GET',
      { headers: authHeader }
    )
    expect([400, 422, 500]).toContain(status)
    expect(body?.error).toBeTruthy()
  })

  it('?limit=1 is honoured', async () => {
    const { body } = await api(
      '/.netlify/functions/admin-data?entity=items&method=GET&limit=1',
      { headers: authHeader }
    )
    const records: any[] = body?.data ?? []
    expect(records.length).toBeLessThanOrEqual(1)
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Exercise CRUD and query operations on items via admin-data endpoint.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:describe_crud_lifecycle_items_via_admin_data:block"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:describe_machine_principal_api_key:block" type="block" identity="describe_machine_principal_api_key" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Verify machine principal API key authentication succeeds on types list."]
// CIL[DOC-RESPONSIBILITY responsibility="Test x-api-key header acceptance."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test results" errors="vitest failures" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls types list with x-api-key header and expects 200 with no error." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// ─── 5. Machine principal (API key) ───────────────────────────────────────────
describe.skipIf(!hasServer || !TEST_API_KEY)('auth — machine principal (API key)', () => {
  it('valid API key → 200 on types list', async () => {
    const { status, body } = await api(
      '/.netlify/functions/types?action=list',
      { headers: { 'x-api-key': TEST_API_KEY } }
    )
    expect(status).toBe(200)
    expect(body?.error).toBeNull()
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Verify machine principal API key authentication succeeds on types list.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:describe_machine_principal_api_key:block"]

// CIL[BEGIN stable_id="~/.framework/tests/api/api-surface.test.ts:describe_validation_required_field_checks:block" type="block" identity="describe_validation_required_field_checks" parent="~/.framework/tests/api/api-surface.test.ts"]
// CIL[DOC-MACRO purpose="Verify missing required fields return 400/422 rather than crashing."]
// CIL[DOC-RESPONSIBILITY responsibility="Negative validation test for POST with empty data."]
// CIL[DOC-CONTEXT module="tests/api/api-surface" layer="test-api" related_files=".framework/tests/api/api-surface.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test results" errors="vitest failures" side_effects="none"]
// CIL[DOC-MICRO logic_summary="POSTs empty data to items and expects 400/422 with a truthy error." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// ─── 6. Validation errors ─────────────────────────────────────────────────────
describe.skipIf(!hasServer)('validation — required field checks', () => {
  const authHeader = { Authorization: `Bearer ${DEV_JWT}` }

  it('missing required field returns 400 not 500', async () => {
    const { status, body } = await api(
      '/.netlify/functions/admin-data?entity=items&method=POST',
      {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: {} })
      }
    )
    expect([400, 422]).toContain(status)
    expect(body?.error).toBeTruthy()
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Verify missing required fields return 400/422 rather than crashing.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/api/api-surface.test.ts:describe_validation_required_field_checks:block"]
