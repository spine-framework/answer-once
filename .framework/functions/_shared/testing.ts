












import { adminDb } from './db'

export interface TestContext {
  db: typeof adminDb
  principal: TestPrincipal
  logger: TestLogger
  accountId: string
}

export interface TestPrincipal {
  id: string
  account_id: string
  roles: string[]
  permissions: Record<string, any>
  email?: string
}

export interface TestLogger {
  info: (msg: string, meta?: any) => void
  warn: (msg: string, meta?: any) => void
  error: (msg: string, meta?: any) => void
  debug: (msg: string, meta?: any) => void
}

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

export function cleanup(): void {
  console.log('Test cleanup completed')
}

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
