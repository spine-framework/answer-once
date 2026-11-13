import { useState, useEffect } from 'react'
import { apiFetch } from '@core/lib/api'

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
