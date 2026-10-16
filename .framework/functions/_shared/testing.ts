// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal, test-authors"]
// CIL[DOC-MACRO purpose="Provide shared test helpers and mock objects for Netlify function tests"]
// CIL[DOC-RESPONSIBILITY responsibility="Import adminDb and expose types and factory functions for test contexts, principals, loggers, events, and assertions"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module-level imports and type definitions" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports the adminDb client and re-exports test utility types and factories" notable_decisions="Kept as a shared module for Netlify function unit tests"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]













import { adminDb } from './db'
// CIL[DOC-VECTOR type="context" content="purpose='Provide shared test helpers and mock objects for Netlify function tests'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:TestContext:interface" type="interface" identity="TestContext" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Describe the shape of a test execution context"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the dependencies available during a test"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TestContext interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines db, principal, logger, and accountId fields" notable_decisions="Uses typeof adminDb for the database property"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface TestContext {
  db: typeof adminDb
  principal: TestPrincipal
  logger: TestLogger
  accountId: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Describe the shape of a test execution context'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:TestContext:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:TestPrincipal:interface" type="interface" identity="TestPrincipal" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Describe a mocked principal for tests"]
// CIL[DOC-RESPONSIBILITY responsibility="Type a fake user with roles and permissions"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TestPrincipal interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines id, account_id, roles, permissions, and optional email" notable_decisions="Defaults to member role and test email"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface TestPrincipal {
  id: string
  account_id: string
  roles: string[]
  permissions: Record<string, any>
  email?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Describe a mocked principal for tests'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:TestPrincipal:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:TestLogger:interface" type="interface" identity="TestLogger" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Describe a test logger interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the logging methods used by test doubles"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TestLogger interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares info, warn, error, and debug methods with optional metadata" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface TestLogger {
  info: (msg: string, meta?: any) => void
  warn: (msg: string, meta?: any) => void
  error: (msg: string, meta?: any) => void
  debug: (msg: string, meta?: any) => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Describe a test logger interface'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:TestLogger:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:mockPrincipal:function" type="function" identity="mockPrincipal" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Build a mock principal object"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a TestPrincipal with safe defaults and optional overrides"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="overrides: Partial<TestPrincipal>" outputs="TestPrincipal" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Merges default values with any provided overrides" notable_decisions="Defaults to member role and test IDs"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function mockPrincipal(overrides: Partial<TestPrincipal> = {}): TestPrincipal {
  return {
    id: 'test-user-id',
    account_id: 'test-account-id',
    roles: ['member'],
    permissions: {},
    email: 'test@example.com',
    ...overrides
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Build a mock principal object'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:mockPrincipal:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:mockLogger:function" type="function" identity="mockLogger" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Create a test logger that captures log messages"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a TestLogger implementation with in-memory log capture"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TestLogger & { getLogs: () => string[] }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements info/warn/error/debug methods that record strings" notable_decisions="Mirrors messages to console when meta is provided"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function mockLogger(): TestLogger & { getLogs: () => string[] } {
  const logs: string[] = []

  return {
    info: (msg: string, meta?: any) => {
      logs.push(`INFO: ${msg}`)
      if (meta) console.log('INFO:', msg, meta)
    },
    warn: (msg: string, meta?: any) => {
      logs.push(`WARN: ${msg}`)
      if (meta) console.warn('WARN:', msg, meta)
    },
    error: (msg: string, meta?: any) => {
      logs.push(`ERROR: ${msg}`)
      if (meta) console.error('ERROR:', msg, meta)
    },
    debug: (msg: string, meta?: any) => {
      logs.push(`DEBUG: ${msg}`)
      if (meta) console.debug('DEBUG:', msg, meta)
    },
    getLogs: () => [...logs]
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create a test logger that captures log messages'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:mockLogger:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:makeTestContext:function" type="function" identity="makeTestContext" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Assemble a TestContext from optional components"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a test context with db, principal, logger, and accountId"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="options" outputs="TestContext" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Falls back to mock principal, logger, and account values" notable_decisions="Resolves accountId from options or principal.account_id with test default"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function makeTestContext(options: {
  principal?: TestPrincipal
  accountId?: string
  logger?: TestLogger
} = {}): TestContext {
  return {
    db: adminDb,
    principal: options.principal || mockPrincipal(),
    logger: options.logger || mockLogger(),
    accountId: options.accountId || options.principal?.account_id || 'test-account'
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Assemble a TestContext from optional components'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:makeTestContext:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:mockEvent:function" type="function" identity="mockEvent" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Build a fake Netlify function event"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a base Netlify event object for testing"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="overrides" outputs="any" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Starts with common HTTP event fields and applies overrides" notable_decisions="Defaults to GET /api/test"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function mockEvent(overrides: any = {}): any {
  return {
    httpMethod: 'GET',
    path: '/api/test',
    headers: {},
    queryStringParameters: {},
    body: null,
    ...overrides
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Build a fake Netlify function event'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:mockEvent:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:mockNetlifyContext:function" type="function" identity="mockNetlifyContext" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Create a fake Netlify function context"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a mock AWS Lambda context"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="any" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Provides request ID, function name, memory limit, and timeout getter" notable_decisions="Uses fixed test identifiers"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function mockNetlifyContext(): any {
  return {
    awsRequestId: 'test-request-id',
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'test-function',
    memoryLimitInMB: '1024',
    invokedFunctionArn: 'arn:aws:lambda:test',
    getRemainingTimeInMillis: () => 30000
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create a fake Netlify function context'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:mockNetlifyContext:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:cleanup:function" type="function" identity="cleanup" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Log completion of test cleanup"]
// CIL[DOC-RESPONSIBILITY responsibility="Output a cleanup confirmation message"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Logs a static message to the console" notable_decisions="Minimal shared cleanup hook"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function cleanup(): void {
  console.log('Test cleanup completed')
}
// CIL[DOC-VECTOR type="context" content="purpose='Log completion of test cleanup'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:cleanup:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:setupTests:function" type="function" identity="setupTests" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Bundle all test helpers for convenience"]
// CIL[DOC-RESPONSIBILITY responsibility="Return an object with all factory functions"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="object containing test factories" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exposes makeTestContext, mockPrincipal, mockLogger, mockEvent, mockNetlifyContext, and cleanup" notable_decisions="Simplifies importing helpers in tests"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function setupTests() {
  return {
    makeTestContext,
    mockPrincipal,
    mockLogger,
    mockEvent,
    mockNetlifyContext,
    cleanup
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Bundle all test helpers for convenience'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:setupTests:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:expectSuccessResponse:function" type="function" identity="expectSuccessResponse" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Assert a response indicates success"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate status code and that the body has no error field"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="response, expectedStatus" outputs="void" errors="Throws on assertion failure" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Checks status and parses JSON body for the absence of error" notable_decisions="Skips body checks when body is absent"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function expectSuccessResponse(
  response: { statusCode?: number; body?: string },
  expectedStatus: number = 200
): void {
  expect(response.statusCode).toBe(expectedStatus)
  
  if (response.body) {
    const body = JSON.parse(response.body)
    expect(body.error).toBeUndefined()
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Assert a response indicates success'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:expectSuccessResponse:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/testing.ts:expectErrorResponse:function" type="function" identity="expectErrorResponse" parent="~/.framework/functions/_shared/testing.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Assert a response indicates an error"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate status code and that the body has an error or message"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/testing" layer="shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/testing.ts"]
// CIL[DOC-CONTRACT inputs="response, expectedStatus" outputs="void" errors="Throws on assertion failure" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Checks status and parses JSON body for the presence of error or message" notable_decisions="Accepts either error or message field as the error indicator"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function expectErrorResponse(
  response: { statusCode?: number; body?: string },
  expectedStatus: number = 400
): void {
  expect(response.statusCode).toBe(expectedStatus)
  
  if (response.body) {
    const body = JSON.parse(response.body)
    expect(body.error || body.message).toBeDefined()
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Assert a response indicates an error'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/testing.ts:expectErrorResponse:function"]
