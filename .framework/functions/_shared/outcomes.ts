// CIL[BEGIN stable_id="~/.framework/functions/_shared/outcomes.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/outcomes.ts"]
// CIL[DOC-MACRO purpose="Module-level header for shared outcome audit utilities."]
// CIL[DOC-RESPONSIBILITY responsibility="Declares module imports and establishes file context for outcome audit helpers."]
// CIL[DOC-CONTEXT module="outcomes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains import statements for CoreContext and emitAudit; no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import { CoreContext } from './middleware'
import { emitAudit } from './audit'
// CIL[DOC-VECTOR type="context" content="purpose='Module-level header for shared outcome audit utilities.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/outcomes.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/outcomes.ts:emitOutcome:function" type="function" identity="emitOutcome" parent="~/.framework/functions/_shared/outcomes.ts"]
// CIL[DOC-MACRO purpose="Emits an outcome audit record for an operation result."]
// CIL[DOC-RESPONSIBILITY responsibility="Records the success/failure/partial result of an operation to the audit log."]
// CIL[DOC-CONTEXT module="outcomes" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/outcomes.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, intent: string, result: 'success'|'failure'|'partial', metadata?: Record<string, any>" outputs="Promise<void>" errors="none" side_effects="Calls emitAudit to persist an outcome record."]
// CIL[DOC-MICRO logic_summary="Calls emitAudit with an outcome event, including the operation result and optional metadata." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export async function emitOutcome(
  ctx: CoreContext,
  intent: string,
  result: 'success' | 'failure' | 'partial',
  metadata: Record<string, any> = {}
): Promise<void> {
  await emitAudit(ctx, intent, {
    type: 'outcome',
    account_id: ctx.accountId ?? undefined
  }, {
    result,
    ...metadata
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Emits an outcome audit record for an operation result.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/outcomes.ts:emitOutcome:function"]
