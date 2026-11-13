/**
 * @module   TriggerDetailPage
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * The TriggerDetailPage module is responsible for displaying and managing the details of a specific trigger within the admin interface. It allows users to view, edit, and configure trigger settings, integrating with the backend API for data fetching and updates. INVARIANT: The user must have appropriate permissions to access this page.
 *
 * @seeAlso apiFetch (for data fetching functionality).
 * @seeAlso PageInstructions (for user guidance on the page).
 * @seeAlso EntitySelect (for selecting entities related to triggers).
 * @seeAlso utils (for utility functions like formatDateTime).
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
import { AppSelect, PipelineSelect } from '../../components/admin/EntitySelect'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { ArrowLeft, Zap, AlertCircle } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'


















/**
 * The Trigger interface defines the structure for a trigger object used in the application, encapsulating essential properties related to the trigger's identity, configuration, and state. It serves to standardize the representation of triggers across the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface Trigger {
  id: string
  name: string
  description?: string
  app_id?: string
  event_type: string
  pipeline_id?: string
  config?: Record<string, any>
  metadata?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}



















/**
 * The TriggerDetailPage component manages the creation and editing of trigger configurations in an admin interface. It handles fetching existing trigger data or initializing a new trigger form based on the provided ID.
 *
 * @macro       Component for managing trigger details in an admin interface.
 * @micro       Utilizes React hooks for state management and side effects, including fetching data from an external API.
 * @outputSpec  JSX.Element
 * @sideEffects Fetches trigger data from an external API, updates application state.
 * @stability   stable
 * @calls       apiFetch, useParams, useNavigate
 * @errorHandling Sets error state on failure to fetch or save trigger data.
 * @cil-generated
 */
export function TriggerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'
  const [trigger, setTrigger] = useState<Trigger | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(isCreateMode)
  const [formData, setFormData] = useState({
    name: '', description: '', app_id: '', event_type: '', pipeline_id: '', config: '{}', metadata: '{}', is_active: true
  })

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false)
      return
    }
    setLoading(true)
    const fetchTrigger = async () => {
      try {
        const response = await apiFetch(`/api/triggers?action=get&id=${id}`)
        if (!response.ok) throw new Error('Failed to fetch trigger')
        const result = await response.json()
        const data = result.data
        setTrigger(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          app_id: data.app_id || '',
          event_type: data.event_type,
          pipeline_id: data.pipeline_id || '',
          config: JSON.stringify(data.config || {}, null, 2),
          metadata: JSON.stringify(data.metadata || {}, null, 2),
          is_active: data.is_active ?? true
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trigger')
      } finally {
        setLoading(false)
      }
    }
    fetchTrigger()
  }, [id, isCreateMode])

  const handleSave = async () => {
    try {
      let parsedConfig = {}
      let parsedMetadata = {}
      try { parsedConfig = JSON.parse(formData.config) } catch {}
      try { parsedMetadata = JSON.parse(formData.metadata) } catch {}
      const url = isCreateMode ? '/api/triggers?action=create' : `/api/triggers?action=update&id=${id}`
      const method = isCreateMode ? 'POST' : 'PATCH'
      const saveData = {
        name: formData.name,
        description: formData.description,
        app_id: formData.app_id || null,
        event_type: formData.event_type,
        pipeline_id: formData.pipeline_id || null,
        config: parsedConfig,
        metadata: parsedMetadata,
        is_active: formData.is_active
      }
      const response = await apiFetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      })
      if (!response.ok) throw new Error('Failed to save trigger')
      if (isCreateMode) {
        const result = await response.json()
        navigate(`/spine-framework/admin/configs/triggers/${result.data?.id || result.id}`)
      } else setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
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
          <Button variant="ghost" onClick={() => isCreateMode ? navigate('/spine-framework/admin/configs/triggers') : navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold">{isCreateMode ? 'Create Trigger' : trigger?.name}</h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <><Button variant="outline" onClick={() => isCreateMode ? navigate(-1) : setIsEditing(false)}>Cancel</Button><Button onClick={handleSave}>{isCreateMode ? 'Create' : 'Save'}</Button></>
          ) : !isCreateMode && <Button onClick={() => setIsEditing(true)}>Edit</Button>}
        </div>
      </div>
      <Card><CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Trigger</h3>
            <div className="space-y-2"><Label>Name</Label>{isEditing ? <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm">{trigger?.name}</div>}</div>
            <div className="space-y-2"><Label>App</Label>{isEditing ? <AppSelect value={formData.app_id} onChange={v => setFormData({...formData, app_id: v})} /> : <div className="text-sm font-mono">{trigger?.app_id || '—'}</div>}</div>
            <div className="space-y-2"><Label>Event Type</Label>{isEditing ? <Input value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})} placeholder="e.g., item.created" /> : <Badge>{trigger?.event_type}</Badge>}</div>
            <div className="space-y-2"><Label>Active</Label>{isEditing ? <div className="flex items-center gap-2"><Checkbox id="active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c === true})} /><Label htmlFor="active">Enabled</Label></div> : <div className="text-sm">{trigger?.is_active ? 'Yes' : 'No'}</div>}</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Action</h3>
            <div className="space-y-2"><Label>Pipeline</Label>{isEditing ? <PipelineSelect value={formData.pipeline_id} onChange={v => setFormData({...formData, pipeline_id: v})} /> : <div className="text-sm font-mono">{trigger?.pipeline_id || '—'}</div>}</div>
          </div>
        </div>
        <div className="mt-6 space-y-2"><Label>Description</Label>{isEditing ? <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} /> : <div className="text-sm">{trigger?.description || '—'}</div>}</div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Config (JSON)</Label>{isEditing ? <Textarea value={formData.config} onChange={e => setFormData({...formData, config: e.target.value})} rows={6} className="font-mono text-sm" /> : <pre className="text-sm bg-muted p-3 rounded">{JSON.stringify(trigger?.config || {}, null, 2)}</pre>}</div>
          <div className="space-y-2"><Label>Metadata (JSON)</Label>{isEditing ? <Textarea value={formData.metadata} onChange={e => setFormData({...formData, metadata: e.target.value})} rows={6} className="font-mono text-sm" /> : <pre className="text-sm bg-muted p-3 rounded">{JSON.stringify(trigger?.metadata || {}, null, 2)}</pre>}</div>
        </div>
      </CardContent></Card>
    </div>
  )
}







