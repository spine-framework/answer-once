/**
 * @module   PipelineDetailPage
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module represents the Pipeline Detail Page in the admin section of the application, allowing users to view and manage pipeline details. It integrates various UI components for user interaction and data display, relying on API calls to fetch relevant information.
 * INVARIANT: The user must have appropriate permissions to access this page.
 *
 * @seeAlso apiFetch (handles API requests).
 * @seeAlso PageInstructions (provides guidance on page usage).
 * @seeAlso EntitySelect (for selecting entities related to the pipeline).
 *
 * @cil-generated
 */










import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
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
import { Badge } from '../../components/ui/badge'
import { ArrowLeft, Play, Pause, AlertCircle } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
















/**
 * The Pipeline interface defines the structure for a pipeline object, which represents a sequence of processing stages in a data workflow. It includes properties for identification, configuration, and metadata related to the pipeline's execution.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface Pipeline {
  id: string
  name: string
  description?: string
  app_id?: string
  trigger_type: 'manual' | 'scheduled' | 'webhook' | 'event'
  stages?: Array<{ id: string; name: string; type: string; config: Record<string, any> }>
  config?: Record<string, any>
  metadata?: Record<string, any>
  is_active: boolean
  is_system?: boolean
  created_at: string
  updated_at: string
}
















/**
 * STATUSES is a constant array that defines the various states a pipeline can be in within the admin interface. It provides a structured way to reference these states throughout the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' }
]
















/**
 * TRIGGER_TYPES defines a set of available trigger types for a pipeline, providing a structured way to categorize different triggering mechanisms. This constant is used to facilitate the selection of trigger types in the admin interface.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const TRIGGER_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'event', label: 'Event' }
]
















/**
 * The PipelineDetailPage component manages the creation and editing of pipeline configurations in an admin interface. It fetches existing pipeline data or initializes a new pipeline form based on the provided ID.
 *
 * @macro       Component responsible for displaying and managing pipeline details.
 * @micro       Uses React hooks to manage state and side effects for fetching and saving pipeline data.
 * @outputSpec  JSX.Element
 * @sideEffects Fetches data from an external API and navigates to a different route upon saving.
 * @stability   stable
 * @calls       apiFetch, useParams, useNavigate
 * @errorHandling Sets error state on fetch failure.
 * @cil-generated
 */
export function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(isCreateMode)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    app_id: '',
    trigger_type: 'manual' as const,
    config: '{}',
    stages: '[]',
    metadata: '{}',
    is_active: true
  })

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false)
      return
    }


    setLoading(true)
    const fetchPipeline = async () => {
      try {
        const response = await apiFetch(`/api/pipelines?action=get&id=${id}`)
        if (!response.ok) throw new Error('Failed to fetch pipeline')
        const result = await response.json()
        const data = result.data
        setPipeline(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          app_id: data.app_id || '',
          trigger_type: data.trigger_type,
          config: JSON.stringify(data.config || {}, null, 2),
          stages: JSON.stringify(data.stages || [], null, 2),
          metadata: JSON.stringify(data.metadata || {}, null, 2),
          is_active: data.is_active ?? true
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pipeline')
      } finally {
        setLoading(false)
      }
    }
    fetchPipeline()
  }, [id, isCreateMode])

  const handleSave = async () => {
    try {
      let parsedConfig = {}
      let parsedStages: any[] = []
      let parsedMetadata = {}
      try { parsedConfig = JSON.parse(formData.config) } catch (error) { console.warn('Invalid JSON in config:', error) }
      try { parsedStages = JSON.parse(formData.stages) } catch (error) { console.warn('Invalid JSON in stages:', error) }
      try { parsedMetadata = JSON.parse(formData.metadata) } catch (error) { console.warn('Invalid JSON in metadata:', error) }

      const saveData = {
        name: formData.name,
        description: formData.description,
        app_id: formData.app_id || null,
        trigger_type: formData.trigger_type,
        is_active: formData.is_active,
        config: parsedConfig,
        stages: parsedStages,
        metadata: parsedMetadata
      }

      const url = isCreateMode ? '/api/pipelines?action=create' : `/api/pipelines?action=update&id=${id}`
      const method = isCreateMode ? 'POST' : 'PATCH'
      const response = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saveData) })
      if (!response.ok) throw new Error('Failed to save')
      if (isCreateMode) {
        const result = await response.json()
        navigate(`/spine-framework/admin/configs/pipelines/${result.data?.id || result.id}`)
      } else setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const toggleStatus = async () => {
    if (!pipeline) return
    const newActive = !pipeline.is_active
    try {
      const response = await apiFetch(`/api/pipelines?action=update&id=${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: newActive }) })
      if (!response.ok) throw new Error('Failed to update status')
      setPipeline({ ...pipeline, is_active: newActive })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => isCreateMode ? navigate('/spine-framework/admin/configs/pipelines') : navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{isCreateMode ? 'Create Pipeline' : pipeline?.name}</h1>
            {pipeline && <Badge variant={pipeline.is_active ? 'default' : 'secondary'}>{pipeline.is_active ? 'Active' : 'Inactive'}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {!isCreateMode && (
            <Button variant="outline" onClick={toggleStatus}>{pipeline?.is_active ? <><Pause className="h-4 w-4 mr-2" />Pause</> : <><Play className="h-4 w-4 mr-2" />Activate</>}</Button>
          )}
          {isEditing ? (
            <><Button variant="outline" onClick={() => isCreateMode ? navigate(-1) : setIsEditing(false)}>Cancel</Button><Button onClick={handleSave}>{isCreateMode ? 'Create' : 'Save'}</Button></>
          ) : !isCreateMode && <Button onClick={() => setIsEditing(true)}>Edit</Button>}
        </div>
      </div>
      <Card><CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Configuration</h3>
            <div className="space-y-2"><Label>Name</Label>{isEditing ? <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm">{pipeline?.name}</div>}</div>
            <div className="space-y-2"><Label>App</Label>{isEditing ? <AppSelect value={formData.app_id} onChange={v => setFormData({...formData, app_id: v})} /> : <div className="text-sm font-mono">{pipeline?.app_id || '—'}</div>}</div>
            <div className="space-y-2"><Label>Trigger Type</Label>{isEditing ? <Select value={formData.trigger_type} onValueChange={v => setFormData({...formData, trigger_type: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TRIGGER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select> : <div className="text-sm">{pipeline?.trigger_type}</div>}</div>
            <div className="space-y-2"><Label>Active</Label>{isEditing ? <div className="flex items-center gap-2"><Checkbox id="active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c === true})} /><Label htmlFor="active">Enabled</Label></div> : <div className="text-sm">{pipeline?.is_active ? 'Yes' : 'No'}</div>}</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Execution Info</h3>
            {!isCreateMode && (
              <>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Active</span><Badge variant={pipeline?.is_active ? 'default' : 'secondary'}>{pipeline?.is_active ? 'Active' : 'Inactive'}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Stages</span><span className="text-sm">{pipeline?.stages?.length || 0}</span></div>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 space-y-2"><Label>Description</Label>{isEditing ? <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /> : <div className="text-sm">{pipeline?.description || '—'}</div>}</div>
        <div className="space-y-2"><Label>Config (JSON)</Label>{isEditing ? <Textarea value={formData.config} onChange={e => setFormData({...formData, config: e.target.value})} className="font-mono text-sm" rows={4} placeholder="{}" /> : <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-48">{JSON.stringify(pipeline?.config || {}, null, 2)}</pre>}</div>
        <div className="space-y-2"><Label>Stages (JSON)</Label>{isEditing ? <Textarea value={formData.stages} onChange={e => setFormData({...formData, stages: e.target.value})} className="font-mono text-sm" rows={6} placeholder="[]" /> : <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-48">{JSON.stringify(pipeline?.stages || [], null, 2)}</pre>}</div>
        <div className="space-y-2"><Label>Metadata (JSON)</Label>{isEditing ? <Textarea value={formData.metadata} onChange={e => setFormData({...formData, metadata: e.target.value})} className="font-mono text-sm" rows={4} placeholder="{}" /> : <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-48">{JSON.stringify(pipeline?.metadata || {}, null, 2)}</pre>}</div>
      </CardContent></Card>

      {!isCreateMode && pipeline?.stages && (
        <Card><CardHeader><CardTitle>Stages ({pipeline.stages.length})</CardTitle></CardHeader><CardContent>
          <div className="space-y-2">
            {pipeline.stages.map((stage, idx) => (
              <div key={stage.id || idx} className="flex items-center gap-4 p-3 bg-muted rounded">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">{idx + 1}</div>
                <div className="flex-1"><div className="font-medium">{stage.name}</div><div className="text-sm text-muted-foreground">{stage.type}</div></div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  )
}







