// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Defines the admin API key detail/create page module and imports its dependencies."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the React page component, UI primitives, hooks, and utilities for creating and viewing API keys in the admin console."]
// CIL[DOC-CONTEXT module="api-key-management" layer="pages/admin" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TSX page module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, router, UI components, icons, hooks, and utilities for the API key detail page." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers, ai"]





import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { ArrowLeft, Key, RefreshCw, Trash2, AlertCircle, Copy, Check } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Defines the admin API key detail/create page module and imports its dependencies.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:APIKey:interface" type="interface" identity="APIKey" parent="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the API key record shape used by the admin detail page."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the TypeScript contract for API key objects loaded, edited, and rendered by the page."]
// CIL[DOC-CONTEXT module="api-key-management" layer="pages/admin" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/APIKeyDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes all fields on an API key including id, name, key_type, rate_limit, permissions, scopes, metadata, machine_type, created_by, and timestamps." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface APIKey {
  id: string
  name: string
  integration_id?: string
  app_id?: string
  key_type: 'inbound' | 'outbound' | 'internal' | 'cli'
  key_value?: string
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
// CIL[DOC-VECTOR type="context" content="purpose='Defines the API key record shape used by the admin detail page.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:APIKey:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:KEY_TYPE_OPTIONS:constant" type="constant" identity="KEY_TYPE_OPTIONS" parent="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the selectable labels for API key types."]
// CIL[DOC-RESPONSIBILITY responsibility="Maps key type values to human-readable labels shown in the Key Type select control."]
// CIL[DOC-CONTEXT module="api-key-management" layer="pages/admin" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/APIKeyDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="constant array of option objects" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Array of option objects with value and label for inbound, outbound, internal, and cli key types." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const KEY_TYPE_OPTIONS = [
  { value: 'inbound', label: 'Inbound (External callers to Spine)' },
  { value: 'outbound', label: 'Outbound (Spine to external services)' },
  { value: 'internal', label: 'Internal (Spine-to-Spine)' },
  { value: 'cli', label: 'CLI / Script' }
]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the selectable labels for API key types.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:KEY_TYPE_OPTIONS:constant"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:APIKeyDetailPage:component" type="component" identity="APIKeyDetailPage" parent="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the admin page for creating a new API key and viewing an existing API key."]
// CIL[DOC-RESPONSIBILITY responsibility="Handles form state, API fetch, submission, JSON parsing, and rendering the create/read-only UI for API keys."]
// CIL[DOC-CONTEXT module="api-key-management" layer="pages/admin" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/APIKeyDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="route id parameter, API key response, user form input" outputs="TSX UI, navigation" errors="fetchError, form validation and submission errors, JSON parse errors" side_effects="POST to /api/api-keys, navigator.clipboard.writeText, setTimeout navigation, React state changes"]
// CIL[DOC-MICRO logic_summary="Renders the admin page for creating or viewing API keys. Manages form state with useState and useEffect, fetches the API key via useApi, parses JSON inputs for permissions, scopes and metadata, submits to /api/api-keys, shows a generated key once, and renders read-only summary or error alerts." notable_decisions="[\"Uses separate JSON string state for permissions, scopes, and metadata to allow text editing.\",\"Existing API keys are shown read-only with the key value masked.\",\"Only the create mode handles submission and receives a one-time generated key.\"]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
  const [copied, setCopied] = useState(false)

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
      setGeneratedKey(result.key_value || result.data?.key_value)
      setTimeout(() => navigate(`/spine-framework/admin/configs/api-keys/${result.id || result.data?.id}`), 3000)
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
        <PageInstructions
        description="Create an API key and set its permissions, rate limits, and expiration."
        sections={[
          { title: 'What this API key controls', content: 'API keys authenticate callers to Spine. A key controls which callers are accepted, how fast they can call, and which permissions they carry.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string, required. A human-readable label. Missing name blocks creation.</li>
            <li><strong>Integration ID</strong> — string. Optional UUID of the integration this key is for.</li>
            <li><strong>App ID</strong> — string. Optional UUID of the owning app.</li>
            <li><strong>Key Type</strong> — select. inbound, outbound, internal, or cli. Determines which direction the key is used and how it is validated.</li>
            <li><strong>Prefix</strong> — string. The public prefix that appears before the generated secret. Default is "sk_". The create API may override this with the generated prefix.</li>
            <li><strong>Rate Limit (requests/min)</strong> — number 1-10000. Enforces a cap on calls per minute. Missing or 0 may prevent usage.</li>
            <li><strong>Expires At</strong> — date. Optional expiration. After this date the key is rejected.</li>
            <li><strong>Machine Type</strong> — string. The machine principal type, e.g. integration.</li>
            <li><strong>Internal</strong> — checkbox. Marks a key for internal service-to-service use.</li>
            <li><strong>Active</strong> — checkbox. Inactive keys are rejected.</li>
            <li><strong>Permissions (JSON)</strong> — JSON object. Defines allowed actions/resources. Invalid JSON fails creation.</li>
            <li><strong>Scopes (JSON)</strong> — JSON array of scope strings. Invalid JSON fails creation.</li>
            <li><strong>Metadata (JSON)</strong> — JSON object. Optional notes such as environment. Invalid JSON fails creation.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>inbound</strong>: External callers into Spine APIs.</li>
            <li><strong>outbound</strong>: Spine calling external services.</li>
            <li><strong>internal</strong>: Service-to-service calls within Spine.</li>
            <li><strong>cli</strong>: Scripts or command-line tooling.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>API gateway validates the key on every call. An inactive, expired, or missing key is rejected.</li>
            <li>Rate limits are enforced at the edge; a misconfigured limit may throttle or deny callers.</li>
            <li>Permission JSON is parsed and used for authorization checks. Badly shaped permissions may grant too much or too little access.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>Only create mode is available; existing keys are shown read-only with the value masked.</li>
            <li>Fill Name, Key Type, and Rate Limit. Provide valid JSON for Permissions and Metadata.</li>
            <li>Submit the form. A one-time key is generated and shown; copy it immediately because it cannot be retrieved again.</li>
            <li>Validation checks required fields, rate limit range, and valid JSON.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">
            <li>Forgetting to copy the generated key before leaving the page.</li>
            <li>Entering Permissions as a comma-separated list instead of JSON.</li>
            <li>Setting Rate Limit to 0, which blocks all requests.</li>
          </ul> },
        ]}
      />
        <Card><CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Key Type</span><span>{apiKey.key_type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Prefix</span><span>{apiKey.key_prefix}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Rate Limit</span><span>{apiKey.rate_limit}/min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{apiKey.is_active ? 'Active' : 'Inactive'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Usage</span><span>{apiKey.usage_count} requests</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDateTime(apiKey.created_at)}</span></div>
          </div>
          <div className="mt-4"><span className="text-muted-foreground">Key Value</span><div className="mt-1 font-mono text-sm bg-muted p-3 rounded">{apiKey.key_value || '***'}</div></div>
        </CardContent></Card>
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
          <Button className="mt-4" onClick={() => navigate('/spine-framework/admin/configs/api-keys')}>Done</Button>
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
      <PageInstructions
        description="Create an API key and set its permissions, rate limits, and expiration."
        sections={[
          { title: 'What this API key controls', content: 'API keys authenticate callers to Spine. A key controls which callers are accepted, how fast they can call, and which permissions they carry.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string, required. A human-readable label. Missing name blocks creation.</li>
            <li><strong>Integration ID</strong> — string. Optional UUID of the integration this key is for.</li>
            <li><strong>App ID</strong> — string. Optional UUID of the owning app.</li>
            <li><strong>Key Type</strong> — select. inbound, outbound, internal, or cli. Determines which direction the key is used and how it is validated.</li>
            <li><strong>Prefix</strong> — string. The public prefix that appears before the generated secret. Default is "sk_". The create API may override this with the generated prefix.</li>
            <li><strong>Rate Limit (requests/min)</strong> — number 1-10000. Enforces a cap on calls per minute. Missing or 0 may prevent usage.</li>
            <li><strong>Expires At</strong> — date. Optional expiration. After this date the key is rejected.</li>
            <li><strong>Machine Type</strong> — string. The machine principal type, e.g. integration.</li>
            <li><strong>Internal</strong> — checkbox. Marks a key for internal service-to-service use.</li>
            <li><strong>Active</strong> — checkbox. Inactive keys are rejected.</li>
            <li><strong>Permissions (JSON)</strong> — JSON object. Defines allowed actions/resources. Invalid JSON fails creation.</li>
            <li><strong>Scopes (JSON)</strong> — JSON array of scope strings. Invalid JSON fails creation.</li>
            <li><strong>Metadata (JSON)</strong> — JSON object. Optional notes such as environment. Invalid JSON fails creation.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>inbound</strong>: External callers into Spine APIs.</li>
            <li><strong>outbound</strong>: Spine calling external services.</li>
            <li><strong>internal</strong>: Service-to-service calls within Spine.</li>
            <li><strong>cli</strong>: Scripts or command-line tooling.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>API gateway validates the key on every call. An inactive, expired, or missing key is rejected.</li>
            <li>Rate limits are enforced at the edge; a misconfigured limit may throttle or deny callers.</li>
            <li>Permission JSON is parsed and used for authorization checks. Badly shaped permissions may grant too much or too little access.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>Only create mode is available; existing keys are shown read-only with the value masked.</li>
            <li>Fill Name, Key Type, and Rate Limit. Provide valid JSON for Permissions and Metadata.</li>
            <li>Submit the form. A one-time key is generated and shown; copy it immediately because it cannot be retrieved again.</li>
            <li>Validation checks required fields, rate limit range, and valid JSON.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">
            <li>Forgetting to copy the generated key before leaving the page.</li>
            <li>Entering Permissions as a comma-separated list instead of JSON.</li>
            <li>Setting Rate Limit to 0, which blocks all requests.</li>
          </ul> },
        ]}
      />
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card><CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g., Production API Key" /></div>
            <div className="space-y-2"><Label>Key Type</Label><Select value={formData.key_type} onValueChange={v => setFormData({...formData, key_type: v as 'inbound' | 'outbound' | 'internal' | 'cli'})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{KEY_TYPE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Integration ID</Label><Input value={formData.integration_id} onChange={e => setFormData({...formData, integration_id: e.target.value})} placeholder="Optional integration UUID" /></div>
            <div className="space-y-2"><Label>App ID</Label><Input value={formData.app_id} onChange={e => setFormData({...formData, app_id: e.target.value})} placeholder="Optional app UUID" /></div>
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
// CIL[DOC-VECTOR type="context" content="purpose='Renders the admin page for creating a new API key and viewing an existing API key.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeyDetailPage.tsx:APIKeyDetailPage:component"]