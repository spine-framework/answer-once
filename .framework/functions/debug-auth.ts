















import { createHandler } from './_shared/middleware'
import { isSystemAdmin } from './_shared/principal'
const debug = createHandler(async (ctx, _body) => {
  const envObj = (globalThis as any).process?.env || {}
  return {
    data: {
      message: 'Debug auth endpoint',
      hasPrincipal: !!ctx.principal,
      principalType: ctx.principal?.type || 'none',
      requestId: ctx.requestId,
      envVars: {
        supabaseUrl: envObj.SUPABASE_URL ? 'SET' : 'NOT_SET',
        supabaseAnonKey: envObj.SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      }
    }
  }
})
const testJwt = createHandler(async (ctx, _body) => {
  const envObj = (globalThis as any).process?.env || {}
  if (!ctx.principal) {
    return {
      data: null,
      error: 'No principal resolved from token'
    }
  }
  
  return {
    data: {
      tokenValid: true,
      principal: {
        type: ctx.principal.type,
        id: ctx.principal.id,
        accountId: ctx.accountId
      }
    }
  }
})
export async function handler(event: any, context: any) {
  const method = event.queryStringParameters?.method || 'debug'
  
  const ctx = await createHandler(async (ctx, _body) => {
    if (!isSystemAdmin(ctx.principal)) {
      const e: any = new Error('system_admin required')
      e.statusCode = 403
      throw e
    }
    switch (method) {
      case 'debug':
        return await debug(ctx, _body)
      case 'testJwt':
        return await testJwt(ctx, _body)
      default:
        return await debug(ctx, _body)
    }
  })(event, context)
  
  return ctx
}