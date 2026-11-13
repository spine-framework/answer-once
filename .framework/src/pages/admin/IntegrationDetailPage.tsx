




import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible'
import { ArrowLeft, Pencil, Trash2, CheckCircle, XCircle, AlertTriangle, AlertCircle, ChevronDown } from 'lucide-react'



interface Integration {
  id: string
  name: string
  provider: string
  version?: string
  integration_type: 'webhook' | 'api' | 'database' | 'file' | 'custom'
  description?: string
  config: Record<string, any>
  credentials?: Record<string, any>
  is_active: boolean
  is_system?: boolean
  is_configured?: boolean
  created_at: string
  updated_at: string
  account_id: string | null
}





const INTEGRATION_TYPES = [
  { value: 'webhook', label: 'Webhook' },
  { value: 'api', label: 'API' },
  { value: 'database', label: 'Database' },
  { value: 'file', label: 'File' },
  { value: 'custom', label: 'Custom' }
]



export function IntegrationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'
  const [integration, setIntegration] = useState<Integration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(isCreateMode)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '', provider: '', version: '', integration_type: 'api' as const, description: '', config: '{}', credentials: '{}', is_active: true
  })

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false)
      return
    }

    setLoading(true)
    const fetchIntegration = async () => {
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(id!)) throw new Error('Invalid ID format')
        const response = await apiFetch(`/api/integrations?action=get&id=${id}`)
        if (!response.ok) throw new Error(response.status === 500 ? 'Integration not found' : 'Failed to fetch integration')
        const result = await response.json()
        const data = result.data
        setIntegration(data)
        setFormData({
          name: data.name, provider: data.provider, version: data.version || '', integration_type: data.integration_type,
          description: data.description || '',
          config: JSON.stringify(data.config || {}, null, 2),
          credentials: JSON.stringify(data.credentials || {}, null, 2),
          is_active: data.is_active
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load integration')
      } finally {
        setLoading(false)
      }
    }
    fetchIntegration()
  }, [id, isCreateMode])

  const handleSave = async () => {
    try {
      let parsedConfig = {}
      try { parsedConfig = JSON.parse(formData.config) } catch { throw new Error('Invalid JSON in config') }
      let parsedCredentials = {}
      try { parsedCredentials = JSON.parse(formData.credentials) } catch { throw new Error('Invalid JSON in credentials') }
      const url = isCreateMode ? '/api/integrations?action=create' : `/api/integrations?action=update&id=${id}`
      const method = isCreateMode ? 'POST' : 'PATCH'
      const body = { ...formData, config: parsedConfig, credentials: parsedCredentials }
      const response = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!response.ok) throw new Error('Failed to save integration')
      if (isCreateMode) {
        const result = await response.json()
        navigate(`/spine-framework/admin/configs/integrations/${result.data?.id || result.id}`)
      } else {
        setIsEditing(false)
        const result = await response.json()
        setIntegration(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const handleDelete = async () => {
    try {
      const response = await apiFetch(`/api/integrations?action=delete&id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      navigate('/spine-framework/admin/configs/integrations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
    </div>
  )

  if (error && !isCreateMode) return (
    <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  )

  const typeInstructions = [
    {
      type: 'api',
      title: 'API integration',
      description: 'For outbound REST calls such as OpenAI, custom LLM providers, or generic HTTP endpoints. Set config.outbound_adapter and credentials.api_token.',
      config: {
        outbound_adapter: 'adapters/openai-outbound',
        base_url: 'https://api.openai.com/v1',
        models: { chat: 'gpt-4o-mini', embedding: 'text-embedding-3-small' }
      },
      credentials: { api_token: { source: 'env_var', value: 'OPENAI_API_KEY' } }
    },
    {
      type: 'webhook',
      title: 'Webhook integration',
      description: 'For inbound HTTP events. Define the adapter that will handle the webhook and any events it listens to. Credentials usually hold a signing secret or API key.',
      config: {
        inbound_adapter: 'adapters/generic-webhook-inbound',
        events: ['my.event']
      },
      credentials: { signing_secret: { source: 'env_var', value: 'WEBHOOK_SECRET' } }
    },
    {
      type: 'database',
      title: 'Database integration',
      description: 'For external database reads/writes. Use env_var sources for host, port, database, and a credentials field for the password.',
      config: {
        adapter: 'adapters/postgres-outbound',
        host_env_var: 'DB_HOST',
        port_env_var: 'DB_PORT',
        database_env_var: 'DB_NAME'
      },
      credentials: { password: { source: 'env_var', value: 'DB_PASSWORD' } }
    },
    {
      type: 'file',
      title: 'File / storage integration',
      description: 'For S3, GCS, or other object storage. Provide bucket and region in config and access keys in credentials.',
      config: {
        adapter: 'adapters/s3-outbound',
        bucket: 'my-bucket',
        region: 'us-east-1'
      },
      credentials: {
        access_key_id: { source: 'env_var', value: 'AWS_ACCESS_KEY_ID' },
        secret_access_key: { source: 'env_var', value: 'AWS_SECRET_ACCESS_KEY' }
      }
    },
    {
      type: 'custom',
      title: 'Custom integration',
      description: 'For any integration not covered above. Point config.outbound_adapter or config.inbound_adapter to a custom function path and define the credentials fields your adapter expects.',
      config: {
        outbound_adapter: 'custom/apps/myapp/functions/my-adapter'
      },
      credentials: { api_token: { source: 'env_var', value: 'MY_CUSTOM_TOKEN' } }
    }
  ]

  const getStatusIcon = (configured?: boolean) => {
    if (configured) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => isCreateMode ? navigate('/spine-framework/admin/configs/integrations') : navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold">{isCreateMode ? 'Create Integration' : integration?.name}</h1>
        </div>
        {!isCreateMode && !isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
            {!integration?.is_system && <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>}
          </div>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => isCreateMode ? navigate(-1) : setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>{isCreateMode ? 'Create' : 'Save'}</Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <Collapsible>
            <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-medium text-slate-700">
              <span>Integration setup instructions</span>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <p className="text-sm text-slate-600">
                Integrations connect Spine to external services. <code>Configuration (JSON)</code> defines the adapter and runtime settings. <code>Credentials (JSON)</code> stores secrets as either <code>env_var</code> (an environment variable name) or <code>value</code> (the literal secret). Fill in the fields for your integration type, save, and the broker will use them on the next call.
              </p>
              <div className="space-y-2">
                {typeInstructions.map((t) => (
                  <Collapsible key={t.type}>
                    <CollapsibleTrigger className="group flex w-full items-center justify-between border-b py-2 text-sm font-medium text-slate-700">
                      <span>{t.title}</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      <p className="text-sm text-slate-600">{t.description}</p>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-500">Config template</div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto font-mono">{JSON.stringify(t.config, null, 2)}</pre>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-500">Credentials template</div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto font-mono">{JSON.stringify(t.credentials, null, 2)}</pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card><CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Info</h3>
            <div className="space-y-2"><Label>Name</Label>{isEditing ? <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm">{integration?.name}</div>}</div>
            <div className="space-y-2"><Label>Provider</Label>{isEditing ? <Input value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} /> : <div className="text-sm">{integration?.provider}</div>}</div>
            <div className="space-y-2"><Label>Version</Label>{isEditing ? <Input value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} /> : <div className="text-sm">{integration?.version || '—'}</div>}</div>
            <div className="space-y-2"><Label>Type</Label>{isEditing ? <Select value={formData.integration_type} onValueChange={v => setFormData({...formData, integration_type: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{INTEGRATION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select> : <Badge>{integration?.integration_type}</Badge>}</div>
            <div className="space-y-2"><Label>Active</Label>{isEditing ? <div className="flex items-center gap-2"><Checkbox id="active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c === true})} /><Label htmlFor="active">Enabled</Label></div> : <div className="text-sm">{integration?.is_active ? 'Yes' : 'No'}</div>}</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            {!isCreateMode && (
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Configured</span><div className="flex items-center gap-2">{getStatusIcon(integration?.is_configured)}<span className="text-sm capitalize">{integration?.is_configured ? 'Configured' : 'Pending'}</span></div></div>
            )}
            <div className="space-y-2"><Label>Description</Label>{isEditing ? <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /> : <div className="text-sm">{integration?.description || '—'}</div>}</div>
          </div>
        </div>
        <div className="mt-6 space-y-2"><Label>Configuration (JSON)</Label>{isEditing ? <Textarea value={formData.config} onChange={e => setFormData({...formData, config: e.target.value})} rows={8} className="font-mono text-sm" /> : <pre className="text-sm bg-muted p-3 rounded overflow-auto">{JSON.stringify(integration?.config || {}, null, 2)}</pre>}</div>
        <div className="mt-6 space-y-2"><Label>Credentials (JSON)</Label>{isEditing ? <Textarea value={formData.credentials} onChange={e => setFormData({...formData, credentials: e.target.value})} rows={8} className="font-mono text-sm" /> : <pre className="text-sm bg-muted p-3 rounded overflow-auto">{JSON.stringify(integration?.credentials || {}, null, 2)}</pre>}</div>
      </CardContent></Card>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Integration" description="Are you sure you want to delete this integration?" size="sm">
        <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></div>
      </Modal>
    </div>
  )
}

