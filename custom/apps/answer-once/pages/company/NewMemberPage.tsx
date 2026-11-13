// auth_uid left unset — this is a directory record; the claim/invite flow owns credential provisioning
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { supabase } from '@core/lib/supabase'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select'
import { ArrowLeft, Check } from 'lucide-react'

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

const ASSIGNABLE_ROLES = ['support', 'support_admin']

export default function NewMemberPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()

  const [platformId, setPlatformId] = useState<string | null>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [roleId, setRoleId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchJSON('/api/admin-data?entity=accounts&limit=200'),
      supabase.from('roles').select('id, slug, name').eq('is_active', true),
    ]).then(([accounts, rolesRes]) => {
      const platform = (accounts || []).find((a: any) => a.slug === 'spine-system')
      if (!platform) throw new Error('Platform account not found')
      setPlatformId(platform.id)
      const assignable = (rolesRes.data || []).filter((r: any) => ASSIGNABLE_ROLES.includes(r.slug))
      setRoles(assignable)
      setRoleId(assignable.find((r: any) => r.slug === 'support')?.id || assignable[0]?.id || '')
    }).catch((e) => setLoadError(e.message || 'Failed to load'))
  }, [])

  const handleCreate = async () => {
    if (saving || !platformId) return
    setSaving(true)
    setError(null)
    try {
      const created = await fetchJSON('/api/admin-data', {
        method: 'POST',
        body: JSON.stringify({
          entity: 'people',
          type_slug: 'person',
          account_id: platformId,
          role_id: roleId,
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          status: 'active',
          is_active: true,
        }),
      })
      navigate(appPath(`/company/team/${created.id}`))
    } catch (e: any) {
      setError(e.message || 'Create failed')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(appPath('/company/team'))}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-lg font-semibold">Add support member</h1>
      </div>
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        {loadError ? (
          <div className="py-8 text-center border border-dashed border-border rounded-lg max-w-lg mx-auto space-y-3 px-4">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button size="sm" variant="outline" onClick={() => navigate(appPath('/company/team'))}>
              Back to team
            </Button>
          </div>
        ) : (
          <section className="rounded-lg border border-border bg-card p-4 space-y-4 max-w-lg">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sam Supporter" autoFocus />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sam@yourco.com" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Role</label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name || r.slug}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={saving || !name.trim() || !email.trim() || !roleId || !platformId}>
                <Check size={13} className="mr-1.5" /> {saving ? 'Adding…' : 'Add member'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate(appPath('/company/team'))} disabled={saving}>
                Cancel
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
