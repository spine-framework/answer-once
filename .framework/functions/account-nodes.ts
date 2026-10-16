// CIL[BEGIN stable_id="~/.framework/functions/account-nodes.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/account-nodes.ts"]
// CIL[DOC-MACRO purpose="Netlify function entry point for account node retrieval and traversal"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the handler that loads an account node with its ancestors, children, and descendants"]
// CIL[DOC-CONTEXT module="account-nodes" layer="edge-function" related_files=".framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: unknown" outputs="{ node, ancestors, children, descendants }" errors="Missing node_id, account not found, database errors" side_effects="Queries accounts table and calls get_account_ancestors/get_account_descendants RPCs"]
// CIL[DOC-MICRO logic_summary="Wraps createHandler to read node_id, validate presence, fetch the active account with its type, then retrieve ancestors, children, and descendants" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="api consumer"]

import { createHandler } from './_shared/middleware'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function entry point for account node retrieval and traversal'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/account-nodes.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/account-nodes.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/account-nodes.ts"]
// CIL[DOC-MACRO purpose="Load a single account node and related tree"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch an active account by id plus ancestors, children, and descendants"]
// CIL[DOC-CONTEXT module="account-nodes" layer="edge-function" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/account-nodes.ts"]
// CIL[DOC-CONTRACT inputs="node_id: string" outputs="{ node, ancestors: Account[], children: Account[], descendants: Account[] }" errors="Account node not found, database RPC errors" side_effects="Queries accounts table and calls get_account_ancestors and get_account_descendants RPCs"]
// CIL[DOC-MICRO logic_summary="Validate node_id, fetch account, get ancestors, children, and descendants from database; return all four collections" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const { node_id } = ctx.query || {}

  if (!node_id) {
    throw new Error('node_id is required')
  }

  const { data: node, error: nodeError } = await ctx.db
    .from('accounts')
    .select(`
      *,
      type:types(id, slug, name, icon, color)
    `)
    .eq('id', node_id)
    .eq('is_active', true)
    .single()

  if (nodeError || !node) {
    throw new Error('Account node not found')
  }

  const { data: ancestors, error: ancestorsError } = await ctx.db
    .rpc('get_account_ancestors', { account_id: node_id })

  if (ancestorsError) {
    throw ancestorsError
  }

  const { data: children, error: childrenError } = await ctx.db
    .from('accounts')
    .select(`
      *,
      type:types(id, slug, name, icon, color)
    `)
    .eq('parent_id', node_id)
    .eq('is_active', true)
    .order('display_name')

  if (childrenError) {
    throw childrenError
  }

  const { data: descendants, error: descendantsError } = await ctx.db
    .rpc('get_account_descendants', { account_id: node_id })

  if (descendantsError) {
    throw descendantsError
  }

  return {
    node,
    ancestors: ancestors || [],
    children: children || [],
    descendants: descendants || []
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Load a single account node and related tree'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/account-nodes.ts:handler:constant"]
