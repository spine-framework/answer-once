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

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:isAdminRole:function" type="function" identity="isAdminRole" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="Classify a role slug as admin-capable"]
// CIL[DOC-RESPONSIBILITY responsibility="system_admin plus any *_admin slug count as admin roles"]
// CIL[DOC-CONTRACT inputs="roleSlug" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exact system_admin match or _admin suffix" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export function isAdminRole(roleSlug: string | undefined): boolean {
  return !!roleSlug && (roleSlug === 'system_admin' || roleSlug.endsWith('_admin'))
}
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:isAdminRole:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:isAccountAdmin:function" type="function" identity="isAccountAdmin" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="True when the principal administers the given account"]
// CIL[DOC-RESPONSIBILITY responsibility="Gate account-admin surfaces (invites, integrations, member updates) for tenant callers"]
// CIL[DOC-CONTRACT inputs="ctx, accountId" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="System-level principals pass; otherwise principal.accountId must equal the target account and carry an *_admin role" notable_decisions="principal.accountId is server-resolved from the people row — no client input feeds the check"]
// CIL[DOC-STABILITY stability="stable"]
export function isAccountAdmin(ctx: any, accountId: string | null | undefined): boolean {
  const principal = ctx?.principal
  if (!principal || principal.id === 'anonymous') return false
  if (principal.permissions?.includes('system') || (principal.roles || []).includes('system_admin')) return true
  if (principal.isInternal === true && !ctx.accountId) return true
  return !!accountId && principal.accountId === accountId &&
    (principal.roles || []).some((r: string) => isAdminRole(r))
}
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:isAccountAdmin:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:requireAccountAdmin:function" type="function" identity="requireAccountAdmin" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="Throw unless the principal administers the given account"]
// CIL[DOC-RESPONSIBILITY responsibility="Hard-fail variant of isAccountAdmin for guard-clause use"]
// CIL[DOC-CONTRACT inputs="ctx, accountId" outputs="void" errors="Authentication required; Insufficient permissions" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Anonymous → Authentication required; otherwise delegates to isAccountAdmin" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export function requireAccountAdmin(ctx: any, accountId: string | null | undefined): void {
  const principal = ctx?.principal
  if (!principal || principal.id === 'anonymous') {
    throw new Error('Authentication required')
  }
  if (!isAccountAdmin(ctx, accountId)) {
    throw new Error('Insufficient permissions — *_admin role required for this account')
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:requireAccountAdmin:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:escapeHtml:function" type="function" identity="escapeHtml" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="Entity-escape a value for safe interpolation into HTML"]
// CIL[DOC-RESPONSIBILITY responsibility="Neutralize markup injection in server-rendered email templates (invite emails)"]
// CIL[DOC-CONTRACT inputs="any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Escapes & < > \" ' to HTML entities" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:escapeHtml:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/access.ts:assertPublicOutboundUrl:function" type="function" identity="assertPublicOutboundUrl" parent="~/.framework/functions/_shared/access.ts"]
// CIL[DOC-MACRO purpose="SSRF guard: only public http(s) URLs may be fetched by outbound integrations"]
// CIL[DOC-RESPONSIBILITY responsibility="Reject private/loopback/link-local/metadata IP literals and internal-suffix hostnames before outbound fetch"]
// CIL[DOC-CONTRACT inputs="rawUrl string" outputs="void" errors="Invalid outbound URL; 403 host not allowed" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Parses URL, requires http(s), rejects PRIVATE_HOSTNAMES, .internal/.local/.corp/.lan suffixes, and RFC1918/loopback/link-local/multicast IP literals" notable_decisions="Hostname-level check only — a public hostname can still resolve to a private IP (DNS rebinding); adapters should pin resolved IPs for full protection"]
// CIL[DOC-STABILITY stability="stable"]
const PRIVATE_HOSTNAMES = new Set([
  'localhost', 'metadata.google.internal', 'instance-data', 'kubernetes.default',
])

const PRIVATE_HOST_RE = /\.(internal|local|localhost|corp|lan)$/i

function isPrivateIpLiteral(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '')
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split('.').map(Number)
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224
  }
  if (h.includes(':')) {
    const lower = h.toLowerCase()
    return lower === '::1' || lower === '::' || lower.startsWith('fe80:') ||
      lower.startsWith('fc') || lower.startsWith('fd')
  }
  return false
}

export function assertPublicOutboundUrl(rawUrl: string): void {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error(`Invalid outbound URL: ${rawUrl}`)
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`Outbound URL must be http(s): ${url.protocol}`)
  }
  const host = url.hostname.toLowerCase()
  if (
    PRIVATE_HOSTNAMES.has(host) ||
    PRIVATE_HOST_RE.test(host) ||
    isPrivateIpLiteral(host)
  ) {
    const e: any = new Error(`Outbound URL host is not allowed: ${host}`)
    e.statusCode = 403
    throw e
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/access.ts:assertPublicOutboundUrl:function"]
