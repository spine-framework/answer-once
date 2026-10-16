// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TriggerDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/TriggerDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Provides the admin trigger detail page module"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports React, routing, UI components, and utilities used by TriggerDetailPage"]
// CIL[DOC-CONTEXT module="triggers" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assembles the module dependencies for the admin trigger detail and editing page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="administrators"]




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
import { Badge } from '../../components/ui/badge'
import { ArrowLeft, Zap, AlertCircle } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Provides the admin trigger detail page module'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TriggerDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TriggerDetailPage.tsx:Trigger:interface" type="interface" identity="Trigger" parent="~/.framework/src/pages/admin/TriggerDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the shape of a trigger record"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the TypeScript interface for trigger data used in the admin page"]
// CIL[DOC-CONTEXT module="triggers" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TriggerDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Trigger type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields, optionality, and types for a Trigger record" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of a trigger record'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TriggerDetailPage.tsx:Trigger:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TriggerDetailPage.tsx:TriggerDetailPage:component" type="component" identity="TriggerDetailPage" parent="~/.framework/src/pages/admin/TriggerDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Renders and manages the trigger create/edit form"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches trigger data, manages form state, validates JSON, and saves the trigger via the admin API"]
// CIL[DOC-CONTEXT module="triggers" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TriggerDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="id route param" outputs="JSX detail page with edit/create controls" errors="API or JSON parse failures" side_effects="Updates form state, navigates on save"]
// CIL[DOC-MICRO logic_summary="Loads a trigger, supports create and edit modes, validates config and metadata JSON, persists via apiFetch, and renders PageInstructions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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

      <PageInstructions
        description="Define a trigger that reacts to events and invokes a pipeline."
        sections={[
          { title: 'What this trigger controls', content: 'A trigger listens for a Spine event_type and, when active, hands the event payload to a pipeline for processing. The config and metadata JSON objects configure the trigger engine.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string. The display name. Missing name prevents saving.</li>
            <li><strong>Event Type</strong> — string. The event to listen to, e.g. item.created. Must match the emitted event name exactly.</li>
            <li><strong>App ID</strong> — string. Optional owning app UUID; blank means account-scoped.</li>
            <li><strong>Pipeline ID</strong> — string. The pipeline to invoke when the trigger fires.</li>
            <li><strong>Active</strong> — checkbox. Inactive triggers ignore all events.</li>
            <li><strong>Description</strong> — string. Optional notes.</li>
            <li><strong>Config (JSON)</strong> — JSON. Trigger engine configuration, e.g. filters or payload mapping.</li>
            <li><strong>Metadata (JSON)</strong> — JSON. Optional metadata about the trigger.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Active</strong>: enabled means the trigger subscribes to the event bus; disabled means it is ignored.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>The event bus routes matching events to active triggers. A wrong Event Type means no execution.</li>
            <li>Pipeline ID must refer to an existing pipeline; otherwise the event is dropped.</li>
            <li>Config JSON is passed to the trigger engine; bad config can cause repeated failures.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>In create mode, enter the name, event type, and pipeline ID, and provide Config and Metadata as valid JSON.</li>
            <li>Click Create or Save. The form validates JSON and required fields.</li>
            <li>After saving, the trigger subscribes to the event bus when active.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">
            <li>Using a typo in the Event Type so the trigger never matches.</li>
            <li>Forgetting to set Active after saving.</li>
            <li>Writing Config as a string instead of a JSON object.</li>
          </ul> },
        ]}
      />

      <Card><CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Trigger</h3>
            <div className="space-y-2"><Label>Name</Label>{isEditing ? <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm">{trigger?.name}</div>}</div>
            <div className="space-y-2"><Label>App ID</Label>{isEditing ? <Input value={formData.app_id} onChange={e => setFormData({...formData, app_id: e.target.value})} placeholder="Optional app UUID" /> : <div className="text-sm font-mono">{trigger?.app_id || '—'}</div>}</div>
            <div className="space-y-2"><Label>Event Type</Label>{isEditing ? <Input value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})} placeholder="e.g., item.created" /> : <Badge>{trigger?.event_type}</Badge>}</div>
            <div className="space-y-2"><Label>Active</Label>{isEditing ? <div className="flex items-center gap-2"><Checkbox id="active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c === true})} /><Label htmlFor="active">Enabled</Label></div> : <div className="text-sm">{trigger?.is_active ? 'Yes' : 'No'}</div>}</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Action</h3>
            <div className="space-y-2"><Label>Pipeline ID</Label>{isEditing ? <Input value={formData.pipeline_id} onChange={e => setFormData({...formData, pipeline_id: e.target.value})} placeholder="Pipeline to invoke" /> : <div className="text-sm font-mono">{trigger?.pipeline_id || '—'}</div>}</div>
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
// CIL[DOC-VECTOR type="context" content="purpose='Renders and manages the trigger create/edit form'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TriggerDetailPage.tsx:TriggerDetailPage:component"]