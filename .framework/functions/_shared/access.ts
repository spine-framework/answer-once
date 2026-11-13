// Customer-facing roles (member, member_admin) are deliberately absent from the internal audience set
import { isSystemAdmin } from './principal'
import type { Principal } from './principal'

export const INTERNAL_AUDIENCE_ROLES = new Set<string>([
  'system_admin',
  'support',
  'support_admin',
  'devops',
  'engineering',
  'engineering_admin',
  'incident_commander',
])

export function hasInternalAudience(principal?: Principal | null): boolean {
  if (!principal) return false
  if (principal.isInternal) return true
  if (isSystemAdmin(principal)) return true
  return (principal.roles || []).some(r => INTERNAL_AUDIENCE_ROLES.has(r))
}

// Message content is stripped — reasoning and tool payloads never cross to customer browsers
export const CUSTOMER_STEP_TYPES = new Set<string>([
  'plan',
  'thinking',
  'tool_call',
  'tool_result',
])

// Content is always stripped for internal rows — a fixed label is enough for the progress trail and reasoning must not cross the boundary; unknown thread visibility defaults to dropping
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

export function isAdminRole(roleSlug: string | undefined): boolean {
  return !!roleSlug && (roleSlug === 'system_admin' || roleSlug.endsWith('_admin'))
}

export function isAccountAdmin(ctx: any, accountId: string | null | undefined): boolean {
  const principal = ctx?.principal
  if (!principal || principal.id === 'anonymous') return false
  if (principal.permissions?.includes('system') || (principal.roles || []).includes('system_admin')) return true
  if (principal.isInternal === true && !ctx.accountId) return true
  return !!accountId && principal.accountId === accountId &&
    (principal.roles || []).some((r: string) => isAdminRole(r))
}

export function requireAccountAdmin(ctx: any, accountId: string | null | undefined): void {
  const principal = ctx?.principal
  if (!principal || principal.id === 'anonymous') {
    throw new Error('Authentication required')
  }
  if (!isAccountAdmin(ctx, accountId)) {
    throw new Error('Insufficient permissions — *_admin role required for this account')
  }
}

export function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Hostname-level check only — a public hostname can still resolve to a private IP (DNS rebinding); adapters should pin resolved IPs for full protection
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
