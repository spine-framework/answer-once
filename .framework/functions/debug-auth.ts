// CIL[BEGIN stable_id="~/.framework/functions/debug-auth.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/debug-auth.ts"]
// CIL[DOC-MACRO purpose="Netlify function for debugging authentication state and JWT token resolution"]
// CIL[DOC-RESPONSIBILITY responsibility="Exposes debug and testJwt handlers for inspecting principal, environment variables, and token validity"]
// CIL[DOC-CONTEXT module="framework/functions" layer="functions" related_files=".framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="HTTP event and context" outputs="JSON response with auth debug data" errors="Returns structured errors for missing principal" side_effects="Reads environment variables"]
// CIL[DOC-MICRO logic_summary="Defines the debug-auth Netlify function entry point and handler constants" notable_decisions="Uses createHandler from shared middleware to wrap endpoint logic"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
















import { createHandler } from './_shared/middleware'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function for debugging authentication state and JWT token resolution'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/debug-auth.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/debug-auth.ts:debug:constant" type="constant" identity="debug" parent="~/.framework/functions/debug-auth.ts"]
// CIL[DOC-MACRO purpose="Return a debug payload showing whether a principal and selected environment variables are present"]
// CIL[DOC-RESPONSIBILITY responsibility="Builds a safe, read-only debug response from request context and process.env"]
// CIL[DOC-CONTEXT module="framework/functions" layer="functions" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/debug-auth.ts"]
// CIL[DOC-CONTRACT inputs="Request context and body" outputs="JSON data with principal presence, type, request id, and env set flags" errors="None" side_effects="Reads process.env"]
// CIL[DOC-MICRO logic_summary="Checks the request context for a principal and masks environment variable presence" notable_decisions="Only reports SET/NOT_SET for sensitive env values"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Return a debug payload showing whether a principal and selected environment variables are present'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/debug-auth.ts:debug:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/debug-auth.ts:testJwt:constant" type="constant" identity="testJwt" parent="~/.framework/functions/debug-auth.ts"]
// CIL[DOC-MACRO purpose="Validate and return the resolved JWT principal for a request"]
// CIL[DOC-RESPONSIBILITY responsibility="Verifies a principal exists and returns its identity and account association"]
// CIL[DOC-CONTEXT module="framework/functions" layer="functions" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/debug-auth.ts"]
// CIL[DOC-CONTRACT inputs="Request context and body" outputs="JSON data with tokenValid flag and principal details" errors="Returns error when no principal is resolved" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns principal data or an error if authentication did not resolve" notable_decisions="Includes accountId from the request context"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Validate and return the resolved JWT principal for a request'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/debug-auth.ts:testJwt:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/debug-auth.ts:handler:function" type="function" identity="handler" parent="~/.framework/functions/debug-auth.ts"]
// CIL[DOC-MACRO purpose="Route incoming requests to the debug or testJwt handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatches by query method to the appropriate handler and returns the result"]
// CIL[DOC-CONTEXT module="framework/functions" layer="functions" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/debug-auth.ts"]
// CIL[DOC-CONTRACT inputs="event (any), context (any)" outputs="JSON response from selected handler" errors="Falls back to debug for unknown methods" side_effects="Invokes createHandler middleware"]
// CIL[DOC-MICRO logic_summary="Reads the method query parameter, switches to debug or testJwt, and awaits the handler" notable_decisions="Defaults unknown methods to debug"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function handler(event: any, context: any) {
  const method = event.queryStringParameters?.method || 'debug'
  
  const ctx = await createHandler(async (ctx, _body) => {
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
// CIL[DOC-VECTOR type="context" content="purpose='Route incoming requests to the debug or testJwt handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/debug-auth.ts:handler:function"]