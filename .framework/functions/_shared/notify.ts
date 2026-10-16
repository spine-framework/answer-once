// CIL[BEGIN stable_id="~/.framework/functions/_shared/notify.ts:resolve_notification_recipients:module" type="module" identity="resolve_notification_recipients" parent="~/.framework/functions/_shared/notify.ts"]
// CIL[DOC-MACRO purpose="Resolve notification recipient entries (person UUIDs and 'role:<slug>' handles) into concrete people.id values for notification writes."]
// CIL[DOC-RESPONSIBILITY responsibility="Translate each recipient entry — a person UUID passthrough or a 'role:<slug>' lookup against account-scoped, active people joined to roles — into people.id strings, warning and skipping anything unresolvable."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/agent-runner.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext (account scope); recipients: any[] of 'role:<slug>' or person UUID strings" outputs="Promise<string[]> of deduped people.id values" errors="none thrown — lookup failures and malformed entries warn and are skipped" side_effects="One people/roles join query per role: entry"]
// CIL[DOC-MICRO logic_summary="Each entry matching /^role:(.+)$/ queries people in ctx.accountId with an inner join to roles on people.role_id filtered by roles.slug; UUID-shaped entries pass through; anything else warns and is skipped. A role that matches zero people yields zero recipients — a valid empty result, not an error." notable_decisions="person_id on notifications is a uuid column, so a literal 'role:member_admin' must never reach the insert; both notification writers (pipeline-runner send_notification, agent-runner executeSendNotification) share this resolver"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Resolve notification recipient entries (person UUIDs and role:<slug> handles) into concrete people.id values.'; callers: pipeline-runner send_notification stage, agent-runner executeSendNotification; imports: middleware, db" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="Both notification writers share the resolver — behavior change is confined to recipient mapping before the notifications insert" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="notifications.person_id is uuid — only resolved people.id values may be inserted; unknown entries warn and are skipped rather than failing the stage" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/notify.ts:resolve_notification_recipients:module"]
