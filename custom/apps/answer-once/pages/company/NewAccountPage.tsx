// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/company/NewAccountPage.tsx:module_header:module_header" type="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Company new-account form — support_admin/system_admin create a customer account"]
// CIL[DOC-RESPONSIBILITY responsibility="Collect display name (slug auto-derived, editable) and description, then POST an account record via admin-data and land on its detail page"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/company/NewAccountPage.tsx" layer="custom_app" related_files=".framework/src/lib/api.ts, custom/apps/answer-once/pages/company/AccountPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX page" errors="create errors render inline" side_effects="POST /api/admin-data?entity=accounts"]
// CIL[DOC-MICRO logic_summary="Slug is slugified from the display name with a random suffix for uniqueness; create sends type_slug=account so the record gets stamped with the account type's schema and permissions" notable_decisions="route is admin-gated at the router (RequireCompanyAdmin) — this page assumes the caller already passed"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Textarea } from '@core/components/ui/textarea'
import { ArrowLeft, Check } from 'lucide-react'
// CIL[END stable_id="~/custom/apps/answer-once/pages/company/NewAccountPage.tsx:module_header:module_header"]

async function fetchJSON(path: string, options?: RequestInit) {
  const res = await apiFetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`)
  }
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`)
  return json.data
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function NewAccountPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onNameChange = (v: string) => {
    setName(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  const handleCreate = async () => {
    if (saving) return
    const displayName = name.trim()
    const finalSlug = slugify(slug || displayName)
    if (!displayName || !finalSlug) return
    setSaving(true)
    setError(null)
    try {
      const suffix = Math.random().toString(36).slice(2, 8)
      const created = await fetchJSON('/api/admin-data', {
        method: 'POST',
        body: JSON.stringify({
          entity: 'accounts',
          type_slug: 'account',
          display_name: displayName,
          slug: `${finalSlug}-${suffix}`,
          description: description.trim() || null,
          is_active: true,
        }),
      })
      navigate(appPath(`/company/accounts/${created.id}`))
    } catch (e: any) {
      setError(e.message || 'Create failed')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(appPath('/company/accounts'))}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-lg font-semibold">New account</h1>
      </div>
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        <section className="rounded-lg border border-border bg-card p-4 space-y-4 max-w-lg">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display name</label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Acme Corp"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Slug</label>
            <Input
              value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }}
              placeholder="acme-corp"
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground mt-1">A short random suffix is appended for uniqueness.</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Notes about this customer account…"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={saving || !name.trim()}>
              <Check size={13} className="mr-1.5" /> {saving ? 'Creating…' : 'Create account'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(appPath('/company/accounts'))} disabled={saving}>
              Cancel
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
