// person_id on notifications is a uuid column, so a literal 'role:member_admin' must never reach the insert; both notification writers (pipeline-runner send_notification, agent-runner executeSendNotification) share this resolver

import { CoreContext } from './middleware'
import { adminDb } from './db'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ROLE_RE = /^role:(.+)$/

export async function resolveNotificationRecipients(
  ctx: CoreContext,
  recipients: any[]
): Promise<string[]> {
  const personIds: string[] = []

  for (const entry of recipients ?? []) {
    if (typeof entry !== 'string' || entry.length === 0) {
      console.warn('[notify] skipping non-string notification recipient:', entry)
      continue
    }

    const roleMatch = entry.match(ROLE_RE)
    if (roleMatch) {
      const slug = roleMatch[1]
      // people.role_id -> roles.id (same join as permissions.ts/principal.ts);
      // !inner filters to people whose role carries this slug.
      const { data, error } = await adminDb
        .from('people')
        .select('id, role:roles!role_id!inner(slug)')
        .eq('account_id', ctx.accountId)
        .eq('is_active', true)
        .eq('role.slug', slug)

      if (error) {
        console.warn(`[notify] role recipient lookup failed for 'role:${slug}': ${error.message}`)
        continue
      }
      if (!data || data.length === 0) {
        console.warn(`[notify] no active people found for role recipient 'role:${slug}'`)
        continue
      }
      for (const row of data) {
        if (row?.id) personIds.push(row.id)
      }
      continue
    }

    if (UUID_RE.test(entry)) {
      personIds.push(entry)
      continue
    }

    console.warn(`[notify] skipping unresolvable notification recipient '${entry}' — expected a person UUID or 'role:<slug>'`)
  }

  return [...new Set(personIds)]
}
