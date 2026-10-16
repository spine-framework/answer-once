// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useDirectory.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Resolve account and person display names for ticket cards and detail panels"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch accounts and people once per session and expose id→name lookups"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useDirectory.ts" layer="custom_app" related_files="custom/apps/answer-once/components/TicketCard.tsx, custom/apps/answer-once/pages/company/TicketPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ accountName(id), personName(id), loading }" errors="lookup misses return undefined" side_effects="GET /api/admin-data (accounts, people) once, module-cached"]
// CIL[DOC-MICRO logic_summary="Single shared promise cached at module scope so every page/card resolves names without refetching; RLS scopes results to accessible accounts — support sees all customer accounts, members only their own" notable_decisions="id-keyed maps keep the API dumb — callers pass account_id/created_by straight through"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState, useEffect } from 'react'
import { apiFetch } from '@core/lib/api'
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useDirectory.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useDirectory.ts:load:function" type="function" identity="load" parent="~/custom/apps/answer-once/hooks/useDirectory.ts"]
// CIL[DOC-MACRO purpose="Fetch and index the accounts/people directory"]
// CIL[DOC-RESPONSIBILITY responsibility="Call admin-data once and build id→display-name maps"]
// CIL[DOC-CONTRACT inputs="none" outputs="Promise<{accounts, people}>" errors="returns empty maps on failure" side_effects="2 GET requests, memoized"]
// CIL[DOC-MICRO logic_summary="Accounts prefer display_name over slug; people prefer full_name over email" notable_decisions="module-level inflight promise dedupes concurrent mounts"]
// CIL[DOC-STABILITY stability="experimental"]
interface Directory {
  accounts: Map<string, string>
  people: Map<string, string>
}

let inflight: Promise<Directory> | null = null

function load(): Promise<Directory> {
  if (!inflight) {
    inflight = Promise.all([
      apiFetch('/api/admin-data?entity=accounts&limit=500').then((r) => r.json()).catch(() => null),
      apiFetch('/api/admin-data?entity=people&limit=500').then((r) => r.json()).catch(() => null),
    ]).then(([accountsJson, peopleJson]) => {
      const accounts = new Map<string, string>()
      for (const a of accountsJson?.data || []) {
        accounts.set(a.id, a.display_name || a.slug || a.id)
      }
      const people = new Map<string, string>()
      for (const p of peopleJson?.data || []) {
        people.set(p.id, p.full_name || p.email || p.id)
      }
      return { accounts, people }
    })
  }
  return inflight
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useDirectory.ts:load:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useDirectory.ts:usedirectory:function" type="function" identity="useDirectory" parent="~/custom/apps/answer-once/hooks/useDirectory.ts"]
// CIL[DOC-MACRO purpose="React hook exposing directory name lookups"]
// CIL[DOC-RESPONSIBILITY responsibility="Return accountName/personName resolvers backed by the cached directory"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ accountName(id?), personName(id?), loading }" errors="none" side_effects="triggers load() on first mount"]
// CIL[DOC-MICRO logic_summary="Resolvers are stable closures over the fetched maps; unknown ids return undefined so callers can fall back" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="experimental"]
export function useDirectory() {
  const [dir, setDir] = useState<Directory | null>(null)

  useEffect(() => {
    let cancelled = false
    load().then((d) => { if (!cancelled) setDir(d) })
    return () => { cancelled = true }
  }, [])

  return {
    accountName: (id?: string | null) => (id ? dir?.accounts.get(id) : undefined),
    personName: (id?: string | null) => (id ? dir?.people.get(id) : undefined),
    loading: dir === null,
  }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useDirectory.ts:usedirectory:function"]
