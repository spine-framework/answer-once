// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/TimerDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Admin detail page for creating and editing scheduled timers."]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a form for viewing, creating, and editing timers, and submits changes to the timers API."]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="timer id from URL (optional)" outputs="JSX rendering of the TimerDetailPage" errors="Displays API and JSON validation errors to the user" side_effects="Calls /api/timers endpoints and navigates on successful creation."]
// CIL[DOC-MICRO logic_summary="Initializes form state, loads an existing timer when editing, validates JSON config and metadata, and renders the create/edit UI with PageInstructions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]





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
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Admin detail page for creating and editing scheduled timers.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:Timer:interface" type="interface" identity="Timer" parent="~/.framework/src/pages/admin/TimerDetailPage.tsx"]
// CIL[DOC-MACRO purpose="TypeScript type contract for a Timer record."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the shape and field types of timer data used by the detail page."]
// CIL[DOC-CONTEXT module="admin" layer="model" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TimerDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Timer interface declaration" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Declares fields for id, name, description, app_id, timer_type, config, pipeline_id, metadata, is_active, created_at, and updated_at." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface Timer {
  id: string
  name: string
  description?: string
  app_id?: string
  timer_type: 'interval' | 'cron' | 'once'
  config?: Record<string, any>
  pipeline_id?: string
  metadata?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript type contract for a Timer record.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:Timer:interface"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:timer_types:constant" type="constant" identity="timer_types" parent="~/.framework/src/pages/admin/TimerDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Provides the selectable options for timer type."]
// CIL[DOC-RESPONSIBILITY responsibility="Supplies value/label pairs for the timer type select input."]
// CIL[DOC-CONTEXT module="admin" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TimerDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="TIMER_TYPES array of {value, label} objects" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Maps timer type keys interval, cron, and once to human-readable labels." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const TIMER_TYPES = [
  { value: 'interval', label: 'Interval' },
  { value: 'cron', label: 'Cron Expression' },
  { value: 'once', label: 'One-time' }
]
// CIL[DOC-VECTOR type="context" content="purpose='Provides the selectable options for timer type.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:timer_types:constant"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:TimerDetailPage:component" type="component" identity="TimerDetailPage" parent="~/.framework/src/pages/admin/TimerDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Renders the timer detail form and handles create/update logic."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches timer data when editing, manages form state, validates JSON, and calls the timers API to save."]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TimerDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="URL param id (optional) and user interactions via form fields" outputs="Rendered TimerDetailPage component with create/edit UI" errors="Displays fetch and save errors and validation errors for invalid JSON" side_effects="Fetches timer on mount, calls /api/timers create/update, and navigates after creation."]
// CIL[DOC-MICRO logic_summary="Initializes form state, loads a timer in edit mode, parses config and metadata JSON, builds the save payload, conditionally renders editing or read-only fields, and renders PageInstructions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function TimerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'
  const [timer, setTimer] = useState<Timer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(isCreateMode)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    app_id: '',
    timer_type: 'interval' as const,
    config: JSON.stringify({ schedule: '', interval_seconds: 3600 }, null, 2),
    pipeline_id: '',
    metadata: '{}',
    is_active: true
  })

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false)
      return
    }

    setLoading(true)
    const fetchTimer = async () => {
      try {
        const response = await apiFetch(`/api/timers?action=get&id=${id}`)
        if (!response.ok) throw new Error('Failed to fetch timer')
        const result = await response.json()
        const data = result.data
        setTimer(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          app_id: data.app_id || '',
          timer_type: data.timer_type,
          config: JSON.stringify(data.config || {}, null, 2),
          pipeline_id: data.pipeline_id || '',
          metadata: JSON.stringify(data.metadata || {}, null, 2),
          is_active: data.is_active ?? true
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timer')
      } finally {
        setLoading(false)
      }
    }
    fetchTimer()
  }, [id, isCreateMode])

  const handleSave = async () => {
    try {
      let parsedConfig = {}
      let parsedMetadata = {}
      try { parsedConfig = JSON.parse(formData.config) } catch { throw new Error('Invalid config JSON') }
      try { parsedMetadata = JSON.parse(formData.metadata) } catch { throw new Error('Invalid metadata JSON') }
      const url = isCreateMode ? '/api/timers?action=create' : `/api/timers?action=update&id=${id}`
      const method = isCreateMode ? 'POST' : 'PATCH'
      const saveData = {
        name: formData.name,
        description: formData.description,
        app_id: formData.app_id || null,
        timer_type: formData.timer_type,
        config: parsedConfig,
        pipeline_id: formData.pipeline_id || null,
        metadata: parsedMetadata,
        is_active: formData.is_active
      }
      const response = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saveData) })
      if (!response.ok) throw new Error('Failed to save timer')
      if (isCreateMode) {
        const result = await response.json()
        navigate(`/spine-framework/admin/configs/timers/${result.data?.id || result.id}`)
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
          <Button variant="ghost" onClick={() => isCreateMode ? navigate('/spine-framework/admin/configs/timers') : navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold">{isCreateMode ? 'Create Timer' : timer?.name}</h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <><Button variant="outline" onClick={() => isCreateMode ? navigate(-1) : setIsEditing(false)}>Cancel</Button><Button onClick={handleSave}>{isCreateMode ? 'Create' : 'Save'}</Button></>
          ) : !isCreateMode && <Button onClick={() => setIsEditing(true)}>Edit</Button>}
        </div>
      </div>

      <PageInstructions
        description="Schedule a timer to run actions at intervals, via cron, or once."
        sections={[
          { title: 'What this timer controls', content: 'A timer is a scheduled job that calls a target function or pipeline on an interval, a cron schedule, or one time. It is the Spine equivalent of a recurring or one-off background task.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string. The display name. Missing name prevents saving.</li>
            <li><strong>Type</strong> — select. interval, cron, or once. Controls which schedule field in Config is used and how the next run is calculated.</li>
            <li><strong>App ID</strong> — string. Optional owning app UUID; blank means account-scoped.</li>
            <li><strong>Pipeline ID</strong> — string. The pipeline to invoke when the timer fires.</li>
            <li><strong>Active</strong> — checkbox. Inactive timers are skipped by the scheduler.</li>
            <li><strong>Description</strong> — string. Optional notes.</li>
            <li><strong>Config (JSON)</strong> — JSON. The timer schedule, e.g. { `{ "schedule": "0 */6 * * *" }` } for cron, { `{ "interval_seconds": 3600 }` } for interval, or { `{ "run_at": "2026-01-01T00:00:00Z" }` } for once.</li>
            <li><strong>Metadata (JSON)</strong> — JSON. Optional metadata about the timer.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>interval</strong>: config should contain interval_seconds.</li>
            <li><strong>cron</strong>: config should contain a schedule cron expression like 0 */6 * * *.</li>
            <li><strong>once</strong>: config should contain a run_at ISO timestamp.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>The scheduler uses the active flag and the timer_type/config fields to determine the next run and to enqueue the pipeline.</li>
            <li>Pipeline ID must refer to an existing pipeline; otherwise the timer will fail with a missing handler.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">


            <li>Pick the timer type and fill the Config JSON with the matching schedule. Enter the Pipeline ID and optional Metadata JSON.</li>
            <li>Click Create to save or Edit then Save for existing timers.</li>
            <li>Validation checks the name, timer type, and that Config and Metadata are valid JSON.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">
            <li>Selecting cron but filling interval_seconds instead of a cron schedule.</li>
            <li>Using an invalid cron expression, which the scheduler will not run.</li>
            <li>Leaving Pipeline ID blank when the scheduler expects a pipeline to invoke.</li>
          </ul> },
        ]}
      />

      <Card><CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Configuration</h3>
            <div className="space-y-2"><Label>Name</Label>{isEditing ? <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm">{timer?.name}</div>}</div>
            <div className="space-y-2"><Label>App ID</Label>{isEditing ? <Input value={formData.app_id} onChange={e => setFormData({...formData, app_id: e.target.value})} placeholder="Optional app UUID" /> : <div className="text-sm font-mono">{timer?.app_id || '—'}</div>}</div>
            <div className="space-y-2"><Label>Type</Label>{isEditing ? <Select value={formData.timer_type} onValueChange={v => setFormData({...formData, timer_type: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select> : <Badge>{timer?.timer_type}</Badge>}</div>
            <div className="space-y-2"><Label>Active</Label>{isEditing ? <div className="flex items-center gap-2"><Checkbox id="active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c === true})} /><Label htmlFor="active">Enabled</Label></div> : <div className="text-sm">{timer?.is_active ? 'Yes' : 'No'}</div>}</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Execution</h3>
            <div className="space-y-2"><Label>Pipeline ID</Label>{isEditing ? <Input value={formData.pipeline_id} onChange={e => setFormData({...formData, pipeline_id: e.target.value})} placeholder="Pipeline to invoke" /> : <div className="text-sm font-mono">{timer?.pipeline_id || '—'}</div>}</div>
          </div>
        </div>
        <div className="mt-6 space-y-2"><Label>Description</Label>{isEditing ? <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /> : <div className="text-sm">{timer?.description || '—'}</div>}</div>
        <div className="mt-6 space-y-2"><Label>Config (JSON)</Label>{isEditing ? <Textarea value={formData.config} onChange={e => setFormData({...formData, config: e.target.value})} rows={6} className="font-mono text-sm" /> : <pre className="text-sm bg-muted p-3 rounded">{JSON.stringify(timer?.config || {}, null, 2)}</pre>}</div>
        <div className="mt-6 space-y-2"><Label>Metadata (JSON)</Label>{isEditing ? <Textarea value={formData.metadata} onChange={e => setFormData({...formData, metadata: e.target.value})} rows={4} className="font-mono text-sm" /> : <pre className="text-sm bg-muted p-3 rounded">{JSON.stringify(timer?.metadata || {}, null, 2)}</pre>}</div>
      </CardContent></Card>
    </div>
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Renders the timer detail form and handles create/update logic.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:TimerDetailPage:component"]
