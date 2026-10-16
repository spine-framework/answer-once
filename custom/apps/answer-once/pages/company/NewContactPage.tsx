// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/company/NewContactPage.tsx:module_header:module_header" type="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Company new-contact form — add a person to a customer account"]
// CIL[DOC-RESPONSIBILITY responsibility="Collect full name/email/phone for a new contact on the account passed via ?account_id, POST a people record via admin-data, and return to the account page"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/company/NewContactPage.tsx" layer="custom_app" related_files=".framework/src/lib/api.ts, custom/apps/answer-once/pages/company/AccountPage.tsx, custom/apps/answer-once/pages/company/ContactPage.tsx"]
// CIL[DOC-CONTRACT inputs="search param account_id" outputs="JSX page" errors="missing account and create errors render inline" side_effects="POST /api/admin-data?entity=people"]
// CIL[DOC-MICRO logic_summary="Creates a person record scoped to the target account with status=active; role_id and auth_uid are left unset — this is a directory contact, not a login invite (invites own credential provisioning)" notable_decisions="no role picker — contacts get role assignment when/if they authenticate through the claim flow"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { ArrowLeft, Check } from 'lucide-react'
// CIL[END stable_id="~/custom/apps/answer-once/pages/company/NewContactPage.tsx:module_header:module_header"]

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

export default function NewContactPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const accountId = searchParams.get('account_id') || ''

  const [account, setAccount] = useState<any>(null)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accountId) { setAccountError('No account specified.'); return }
    fetchJSON(`/api/admin-data?entity=accounts&id=${accountId}`)
      .then((a) => setAccount(a || null))
      .catch((e) => setAccountError(e.message || 'Account not found'))
  }, [accountId])

  const back = () => navigate(accountId ? appPath(`/company/accounts/${accountId}`) : appPath('/company/accounts'))

  const handleCreate = async () => {
    if (saving || !accountId) return
    setSaving(true)
    setError(null)
    try {
      const created = await fetchJSON('/api/admin-data', {
        method: 'POST',
        body: JSON.stringify({
          entity: 'people',
          type_slug: 'person',
          account_id: accountId,
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          status: 'active',
          is_active: true,
        }),
      })
      navigate(appPath(`/company/contacts/${created.id}`))
    } catch (e: any) {
      setError(e.message || 'Create failed')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={back}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-lg font-semibold">New contact</h1>
      </div>
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        {accountError ? (
          <div className="py-8 text-center border border-dashed border-border rounded-lg max-w-lg mx-auto space-y-3 px-4">
            <p className="text-sm text-destructive">{accountError}</p>
            <p className="text-xs text-muted-foreground">
              Contacts are added from an account — pick the account first.
            </p>
            <Button size="sm" variant="outline" onClick={() => navigate(appPath('/company/accounts'))}>
              Choose an account
            </Button>
          </div>
        ) : (
          <section className="rounded-lg border border-border bg-card p-4 space-y-4 max-w-lg">
            {account && (
              <p className="text-xs text-muted-foreground">
                Adding to <span className="font-medium text-foreground">{account.display_name || account.slug}</span>
              </p>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoFocus />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@acme.com" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={saving || !name.trim() || !email.trim() || !accountId}>
                <Check size={13} className="mr-1.5" /> {saving ? 'Creating…' : 'Add contact'}
              </Button>
              <Button size="sm" variant="outline" onClick={back} disabled={saving}>
                Cancel
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
