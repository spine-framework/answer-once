// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/APIKeyDetailPage.tsx"]
/**
 * @module   APIKeyDetailPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides the UI for managing API keys within the admin section of the application. It allows users to view, create, and delete API keys, handling state and side effects related to API interactions.
 * INVARIANT: Users must have appropriate permissions to access this page and perform actions on API keys.
 *
 * @seeAlso useApi (custom hook for API interactions).
 * @seeAlso apiFetch (utility for making API requests).
 * @seeAlso PageInstructions (provides guidance on using the page).
 *
 * @cil-generated
 */














import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { AppSelect } from '../../components/admin/EntitySelect'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { ArrowLeft, Key, RefreshCw, Trash2, AlertCircle, Copy, Check } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:module_header:module_header"]
















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:APIKey:interface" type="interface" identity="APIKey" parent="~/.framework/src/pages/admin/APIKeyDetailPage.tsx"]
/**
 * The APIKey interface defines the structure of an API key object used within the application, encapsulating its properties and metadata. It provides a consistent representation of API keys across the system.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface APIKey {
  id: string
  name: string
  integration_id?: string
  app_id?: string
  key_type: 'inbound' | 'outbound' | 'internal' | 'cli'
  key_prefix: string
  is_active: boolean
  permissions?: Record<string, any>
  scopes?: string[]
  rate_limit: number
  expires_at?: string
  last_used_at?: string
  usage_count: number
  machine_type?: string
  is_internal?: boolean
  metadata?: Record<string, any>
  created_by_person?: { id: string; full_name: string; email: string }
  created_at: string
  updated_at: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:APIKey:interface"]

















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:KEY_TYPE_OPTIONS:constant" type="constant" identity="KEY_TYPE_OPTIONS" parent="~/.framework/src/pages/admin/APIKeyDetailPage.tsx"]
/**
 * KEY_TYPE_OPTIONS defines a structured set of options for categorizing different types of API keys used in the application. It helps in organizing keys based on their intended use cases.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const KEY_TYPE_OPTIONS = [
  { value: 'inbound', label: 'Inbound (External callers to Spine)' },
  { value: 'outbound', label: 'Outbound (Spine to external services)' },
  { value: 'internal', label: 'Internal (Spine-to-Spine)' },
  { value: 'cli', label: 'CLI / Script' }
]
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:KEY_TYPE_OPTIONS:constant"]

















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:APIKeyDetailPage:component" type="component" identity="APIKeyDetailPage" parent="~/.framework/src/pages/admin/APIKeyDetailPage.tsx"]
/**
 * The APIKeyDetailPage component manages the creation and editing of API keys, providing a user interface for inputting key details and submitting them to the server. It handles both the retrieval of existing API key data and the submission of new or updated key information.
 *
 * @macro       Component responsible for managing API key details in an admin interface.
 * @micro       Utilizes React hooks for state management and side effects, including fetching API key data and handling form submissions.
 * @outputSpec  JSX.Element — renders the API key detail page UI
 * @sideEffects Makes API calls to fetch and submit API key data
 * @stability   internal
 * @calls       useParams, useNavigate, useApi, apiFetch
 * @errorHandling none
 * @cil-generated
 */
export function APIKeyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'

  const [formData, setFormData] = useState({
    name: '',
    integration_id: '',
    app_id: '',
    key_type: 'inbound' as 'inbound' | 'outbound' | 'internal' | 'cli',
    key_prefix: 'sk_',
    rate_limit: 1000,
    expires_at: '',
    permissions: {},
    scopes: '[]',
    metadata: {},
    machine_type: 'integration',
    is_internal: false,
    is_active: true
  })
  const [permissionsJson, setPermissionsJson] = useState('{}')
  const [metadataJson, setMetadataJson] = useState('{}')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [createdKeyId, setCreatedKeyId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)

  const { data: apiKey, loading, error: fetchError } = useApi<APIKey>(
    async () => {
      if (isCreateMode) return null
      const response = await apiFetch(`/api/api-keys?action=get&id=${id}`)
      if (!response.ok) throw new Error('Failed to fetch API key')
      const result = await response.json()
      return result.data || result
    },
    { immediate: !isCreateMode }
  )

  useEffect(() => {
    if (apiKey) {
      setFormData({
        name: apiKey.name || '',
        integration_id: apiKey.integration_id || '',
        app_id: apiKey.app_id || '',
        key_type: apiKey.key_type || 'inbound',
        key_prefix: apiKey.key_prefix || 'sk_',
        rate_limit: apiKey.rate_limit || 1000,
        expires_at: apiKey.expires_at ? apiKey.expires_at.split('T')[0] : '',
        permissions: apiKey.permissions || {},
        scopes: JSON.stringify(apiKey.scopes || [], null, 2),
        metadata: apiKey.metadata || {},
        machine_type: apiKey.machine_type || 'integration',
        is_internal: apiKey.is_internal || false,
        is_active: apiKey.is_active
      })
      setPermissionsJson(JSON.stringify(apiKey.permissions || {}, null, 2))
      setMetadataJson(JSON.stringify(apiKey.metadata || {}, null, 2))
    }

  }, [apiKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let permissions = {}
      let metadata = {}
      let scopes: string[] = []
      try { permissions = JSON.parse(permissionsJson) } catch {}
      try { metadata = JSON.parse(metadataJson) } catch {}
      try { scopes = JSON.parse(formData.scopes) } catch {}
      const { key_prefix: _kp, ...rest } = formData
      const body = { ...rest, permissions, scopes, metadata }
      const response = await apiFetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!response.ok) throw new Error('Failed to create API key')
      const result = await response.json()
      setGeneratedKey(result.data?.raw_key ?? result.raw_key)
      setCreatedKeyId(result.id || result.data?.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
    </div>
  )

  if (fetchError) return (
    <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Failed to load</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert>
  )

  if (!isCreateMode && apiKey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold">{apiKey.name}</h1>
        </div>
        <Card><CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Key Type</span><span>{apiKey.key_type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Prefix</span><span>{apiKey.key_prefix}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Rate Limit</span><span>{apiKey.rate_limit}/min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{apiKey.is_active ? 'Active' : 'Inactive'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Usage</span><span>{apiKey.usage_count} requests</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDateTime(apiKey.created_at)}</span></div>
          </div>
        </CardContent></Card>
        {apiKey.is_active && (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              disabled={isRevoking}
              onClick={async () => {
                if (!confirm('Revoke this API key? It will stop working immediately.')) return
                setIsRevoking(true)
                try {
/**
 * The constant 'res' holds the response from an API call to revoke an API key, determining the success of the operation and handling navigation. It is essential for managing the revocation process of API keys.
 *
 * @throws      Error — if the response is not ok, indicating a failure to revoke the API key.
 * @sideEffects Makes an external API call to '/api/api-keys?action=revoke'.
 * @stability   internal
 * @calls       apiFetch, navigate
 * @errorHandling Alerts the user with an error message if the revocation fails.
 * @cil-generated
 */
                  const res = await apiFetch('/api/api-keys?action=revoke', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: apiKey.id }),
                  })
                  if (!res.ok) throw new Error('Failed to revoke API key')
                  navigate('/spine-framework/admin/configs/api-keys')
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to revoke API key')
                } finally {
                  setIsRevoking(false)
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isRevoking ? 'Revoking…' : 'Revoke Key'}
            </Button>
          </div>
        )}
        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      </div>
    )
  }


  if (generatedKey) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">API Key Created</h1>
        <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Save this key now</AlertTitle><AlertDescription>You won't be able to see it again. Copy it now and store it securely.</AlertDescription></Alert>
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-2"><code className="flex-1 bg-muted p-4 rounded font-mono text-lg">{generatedKey}</code><Button size="icon" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div>
          <Button className="mt-4" onClick={() => navigate(`/spine-framework/admin/configs/api-keys/${createdKeyId}`)}>Done</Button>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold">Create API Key</h1>
      </div>
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card><CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g., Production API Key" /></div>
            <div className="space-y-2"><Label>Key Type</Label><Select value={formData.key_type} onValueChange={v => setFormData({...formData, key_type: v as 'inbound' | 'outbound' | 'internal' | 'cli'})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{KEY_TYPE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Integration ID</Label><Input value={formData.integration_id} onChange={e => setFormData({...formData, integration_id: e.target.value})} placeholder="Optional integration UUID" /></div>
            <div className="space-y-2"><Label>App</Label><AppSelect value={formData.app_id} onChange={v => setFormData({...formData, app_id: v})} /></div>
            <div className="space-y-2"><Label>Prefix</Label><Input value={formData.key_prefix} onChange={e => setFormData({...formData, key_prefix: e.target.value})} placeholder="e.g., sk_" /></div>
            <div className="space-y-2"><Label>Rate Limit (requests/min)</Label><Input type="number" value={formData.rate_limit} onChange={e => setFormData({...formData, rate_limit: parseInt(e.target.value)})} min={1} max={10000} /></div>
            <div className="space-y-2"><Label>Expires At</Label><Input type="date" value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} /></div>
            <div className="space-y-2"><Label>Machine Type</Label><Input value={formData.machine_type} onChange={e => setFormData({...formData, machine_type: e.target.value})} placeholder="e.g., integration" /></div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2"><Checkbox id="active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c === true})} /><Label htmlFor="active">Active</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="is_internal" checked={formData.is_internal} onCheckedChange={c => setFormData({...formData, is_internal: c === true})} /><Label htmlFor="is_internal">Internal</Label></div>
          </div>
          <div className="space-y-2"><Label>Permissions (JSON)</Label><Textarea value={permissionsJson} onChange={e => setPermissionsJson(e.target.value)} rows={4} className="font-mono text-sm" placeholder='{"resources": ["read", "write"]}' /></div>
          <div className="space-y-2"><Label>Scopes (JSON array)</Label><Textarea value={formData.scopes} onChange={e => setFormData({...formData, scopes: e.target.value})} rows={3} className="font-mono text-sm" placeholder='["read:items"]' /></div>
          <div className="space-y-2"><Label>Metadata (JSON)</Label><Textarea value={metadataJson} onChange={e => setMetadataJson(e.target.value)} rows={3} className="font-mono text-sm" placeholder='{"env": "production"}' /></div>
        </CardContent></Card>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create API Key'}</Button></div>
      </form>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:APIKeyDetailPage:component"]






