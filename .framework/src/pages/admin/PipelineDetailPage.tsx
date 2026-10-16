// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Top-level module imports for the pipeline detail admin page"]
// CIL[DOC-RESPONSIBILITY responsibility="Load React, routing, UI primitives, and admin-specific dependencies used by the component"]
// CIL[DOC-CONTEXT module="admin-pipeline" layer="pages" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports hooks, router, API client, UI components, icons, utilities, and PageInstructions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin-ui-developer"]

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
import { ArrowLeft, Play, Pause, AlertCircle } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='Top-level module imports for the pipeline detail admin page'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:pipeline:interface" type="interface" identity="pipeline" parent="~/.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-MACRO purpose="TypeScript shape of a pipeline record"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the Pipeline data structure used by forms and API responses"]
// CIL[DOC-CONTEXT module="admin-pipeline" layer="pages" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Pipeline type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes id, name, description, trigger_type, stages, config, metadata, is_active and timestamps" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript shape of a pipeline record'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:pipeline:interface"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:statuses:constant" type="constant" identity="statuses" parent="~/.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Selectable pipeline status options for UI dropdowns"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide value/label pairs for pipeline status rendering"]
// CIL[DOC-CONTEXT module="admin-pipeline" layer="pages" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="STATUSES array" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant array mapping draft, active, paused, and archived to display labels" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' }
]
// CIL[DOC-VECTOR type="context" content="purpose='Selectable pipeline status options for UI dropdowns'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:statuses:constant"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:trigger_types:constant" type="constant" identity="trigger_types" parent="~/.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Selectable pipeline trigger type options"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide value/label pairs for trigger type rendering"]
// CIL[DOC-CONTEXT module="admin-pipeline" layer="pages" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TRIGGER_TYPES array" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant array mapping manual, scheduled, webhook, and event to display labels" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const TRIGGER_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'event', label: 'Event' }
]
// CIL[DOC-VECTOR type="context" content="purpose='Selectable pipeline trigger type options'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:trigger_types:constant"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:pipelinedetailpage:component" type="component" identity="pipelinedetailpage" parent="~/.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Admin page for viewing, creating, and editing a pipeline"]
// CIL[DOC-RESPONSIBILITY responsibility="Render pipeline form, load/save pipeline data, toggle activation, and display stage list"]
// CIL[DOC-CONTEXT module="admin-pipeline" layer="pages" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/PipelineDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="React element" errors="Network or JSON parse errors" side_effects="Calls /api/pipelines, navigates, updates local state"]
// CIL[DOC-MICRO logic_summary="Fetches pipeline by URL id, manages form state, parses JSON fields, saves via API, and renders editable detail UI" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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

      <PageInstructions
        description="Configure a pipeline with trigger type, JSON stages, config, and metadata."
        sections={[
          { title: 'What this pipeline controls', content: 'A pipeline is a multi-step workflow that can be triggered manually, on a schedule, by a webhook, or by an event. This page controls the pipeline metadata, trigger type, and the JSON stages/config that the runner executes.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string. The display name. Missing name prevents saving.</li>
            <li><strong>Trigger Type</strong> — select. manual, scheduled, webhook, or event. Determines what causes a run.</li>
            <li><strong>Active</strong> — checkbox. Inactive pipelines will not run regardless of trigger.</li>
            <li><strong>App ID</strong> — string. Optional owning app UUID. Leave blank to make it account-scoped.</li>
            <li><strong>Description</strong> — string. Optional human-readable notes.</li>
            <li><strong>Config (JSON)</strong> — JSON. Free-form runtime configuration for the pipeline.</li>
            <li><strong>Stages (JSON)</strong> — JSON. Required array of step definitions the runner executes.</li>
            <li><strong>Metadata (JSON)</strong> — JSON. Optional metadata about the pipeline.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Trigger Type</strong>: <em>manual</em> run by button; <em>scheduled</em> is invoked by a timer; <em>webhook</em> waits for an HTTP call; <em>event</em> waits for a Spine trigger event.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>The runner uses the stages array to execute steps in order.</li>

            <li>Triggers and timers reference pipelines by ID; changing the trigger type may require re-linking triggers or timers.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>In create mode, enter a name and choose a trigger type. Fill in the Stages JSON array.</li>
            <li>Paste valid JSON into the Config and Metadata textareas. Invalid JSON will be ignored on save.</li>
            <li>Click Create to save, or Edit then Save for existing pipelines. Use the Activate/Pause button to toggle is_active.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">

            <li>Setting trigger type to scheduled but not linking a timer.</li>
            <li>Pasting a non-array value into Stages (it must be a JSON array).</li>
            <li>Expecting to edit step order here; the JSON stages field is the source of truth.</li>
          </ul> },
        ]}
      />

      <Card><CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Configuration</h3>
            <div className="space-y-2"><Label>Name</Label>{isEditing ? <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm">{pipeline?.name}</div>}</div>
            <div className="space-y-2"><Label>App ID</Label>{isEditing ? <Input value={formData.app_id} onChange={e => setFormData({...formData, app_id: e.target.value})} placeholder="Optional app UUID" /> : <div className="text-sm font-mono">{pipeline?.app_id || '—'}</div>}</div>
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
// CIL[DOC-VECTOR type="context" content="purpose='Admin page for viewing, creating, and editing a pipeline'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PipelineDetailPage.tsx:pipelinedetailpage:component"]
