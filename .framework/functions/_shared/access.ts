// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="Core access-control primitives: internal-audience detection and customer-safe record projections"]
// CIL[DOC-RESPONSIBILITY responsibility="Decide which principals may read internal-visibility records and project internal messages into customer-safe shapes"]
// CIL[DOC-CONTEXT module="functions/_shared/access" layer="shared" related_files=".framework/functions/_shared/principal.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="Principal and runtime records" outputs="audience decisions and projected records" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Role-set based internal audience check plus message/thread projection helpers used by admin-data and retrieval paths" notable_decisions="Customer-facing roles (member, member_admin) are deliberately absent from the internal audience set"]
// CIL[DOC-STABILITY stability="stable"]
import { isSystemAdmin } from './principal'
import type { Principal } from './principal'
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:INTERNAL_AUDIENCE_ROLES:constant" type="constant" identity="INTERNAL_AUDIENCE_ROLES" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="Staff-side role slugs whose holders may read internal-visibility records"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the default internal audience for Spine installs"]
// CIL[DOC-CONTRACT inputs="none" outputs="Set of role slugs" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static role set; member and member_admin stay customer-scoped" notable_decisions="Roles carry permissions=['*'] so audience cannot be derived from role permissions; an explicit set is the honest default until per-type audience config lands"]
export const INTERNAL_AUDIENCE_ROLES = new Set<string>([
  'system_admin',
  'support',
  'support_admin',
  'devops',
  'engineering',
  'engineering_admin',
  'incident_commander',
])
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:INTERNAL_AUDIENCE_ROLES:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:hasInternalAudience:function" type="function" identity="hasInternalAudience" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="Return true when the principal may read internal-visibility records"]
// CIL[DOC-RESPONSIBILITY responsibility="Evaluate machine/internal flags, system-admin status, and staff role membership"]
// CIL[DOC-CONTRACT inputs="principal: Principal | null | undefined" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="isInternal or system-admin short-circuit true; otherwise any role in INTERNAL_AUDIENCE_ROLES grants access" notable_decisions="isInternal alone is insufficient — human staff authenticate as JWT principals with roles, not machine flags"]
export function hasInternalAudience(principal?: Principal | null): boolean {
  if (!principal) return false
  if (principal.isInternal) return true
  if (isSystemAdmin(principal)) return true
  return (principal.roles || []).some(r => INTERNAL_AUDIENCE_ROLES.has(r))
}
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:hasInternalAudience:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:CUSTOMER_STEP_TYPES:constant" type="constant" identity="CUSTOMER_STEP_TYPES" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="Internal message types that may be projected (not dropped) for customer audiences"]
// CIL[DOC-RESPONSIBILITY responsibility="Whitelist agent step types that power the customer-facing progress trail"]
// CIL[DOC-CONTRACT inputs="none" outputs="Set of message_type slugs" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="plan/thinking/tool_call/tool_result become label-only progress markers; all other internal types are hidden" notable_decisions="Message content is stripped — reasoning and tool payloads never cross to customer browsers"]
export const CUSTOMER_STEP_TYPES = new Set<string>([
  'plan',
  'thinking',
  'tool_call',
  'tool_result',
])
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:CUSTOMER_STEP_TYPES:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:projectMessageForCustomer:function" type="function" identity="projectMessageForCustomer" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="Project an internal message row into a customer-safe skeleton or drop it"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a deliberately shaped progress summary for whitelisted step types; null for everything else internal"]
// CIL[DOC-CONTRACT inputs="record: sanitized message row, opts.threadIsInternal" outputs="projected record, original record, or null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Non-internal messages pass through; internal rows project only on external threads; internal threads and unknown scope drop" notable_decisions="Content is always stripped for internal rows — a fixed label is enough for the progress trail and reasoning must not cross the boundary; unknown thread visibility defaults to dropping"]
export function projectMessageForCustomer(
  record: any,
  opts: { threadIsInternal?: boolean } = {}
): any | null {
  if (!record) return null
  if (record.visibility !== 'internal') return record
  if (opts.threadIsInternal !== false) return null
  const mt = record?.data?.message_type
  if (!CUSTOMER_STEP_TYPES.has(mt)) return null
  return {
    id: record.id,
    thread_id: record.thread_id,
    direction: record.direction ?? 'outbound',
    sequence: record.sequence,
    created_at: record.created_at,
    visibility: 'internal',
    content: '',
    data: {
      message_type: mt,
      ...(mt === 'tool_call' || mt === 'tool_result'
        ? { tool: record.data?.tool, error: Boolean(record.data?.error) }
        : {}),
    },
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:projectMessageForCustomer:function"]
