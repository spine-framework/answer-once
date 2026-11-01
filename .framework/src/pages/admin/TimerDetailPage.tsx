// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/TimerDetailPage.tsx"]
/**
 * @module   TimerDetailPage
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * The TimerDetailPage module is responsible for displaying and managing the details of a timer within the admin interface. It allows users to view, edit, and configure timer settings, leveraging various UI components for a seamless experience.
 * INVARIANT: The user must have appropriate permissions to access this page.
 *
 * @seeAlso apiFetch (handles API requests for timer data).
 * @seeAlso PageInstructions (provides guidance on using the page).
 * @seeAlso EntitySelect (used for selecting related entities).
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
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
// CIL[END stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:module_header:module_header"]

















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:Timer:interface" type="interface" identity="Timer" parent="~/.framework/src/pages/admin/TimerDetailPage.tsx"]
/**
 * The Timer interface defines the structure for timer objects used in the application, encapsulating properties related to timer configuration, state, and metadata. It serves as a blueprint for managing timers effectively within the system.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:Timer:interface"]





















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:TIMER_TYPES:constant" type="constant" identity="TIMER_TYPES" parent="~/.framework/src/pages/admin/TimerDetailPage.tsx"]
/**
 * TIMER_TYPES defines a set of timer configurations available in the application, providing options for interval-based, cron-based, and one-time timers. This constant is used to facilitate the selection of timer types in the user interface.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const TIMER_TYPES = [
  { value: 'interval', label: 'Interval' },
  { value: 'cron', label: 'Cron Expression' },
  { value: 'once', label: 'One-time' }
]
// CIL[END stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:TIMER_TYPES:constant"]



















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:TimerDetailPage:component" type="component" identity="TimerDetailPage" parent="~/.framework/src/pages/admin/TimerDetailPage.tsx"]
/**
 * The TimerDetailPage component manages the creation and editing of timer configurations in an admin interface. It fetches existing timer data for editing or initializes a new timer for creation.
 *
 * @macro       Component responsible for displaying and managing timer details.
 * @micro       Uses React hooks to manage state and side effects for fetching and saving timer data.
 * @outputSpec  JSX.Element
 * @throws      Error — Invalid config JSON, Error — Invalid metadata JSON
 * @sideEffects Fetches timer data from an external API, saves timer data to an external API.
 * @stability   stable
 * @calls       apiFetch, useParams, useNavigate
 * @errorHandling Sets error state on failure to fetch or save timer data.
 * @cil-generated
 */
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
    config: JSON.stringify({ interval_minutes: 60 }, null, 2),
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
      <Card><CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Configuration</h3>
            <div className="space-y-2"><Label>Name</Label>{isEditing ? <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm">{timer?.name}</div>}</div>
            <div className="space-y-2"><Label>App</Label>{isEditing ? <AppSelect value={formData.app_id} onChange={v => setFormData({...formData, app_id: v})} /> : <div className="text-sm font-mono">{timer?.app_id || '—'}</div>}</div>
            <div className="space-y-2"><Label>Type</Label>{isEditing ? <Select value={formData.timer_type} onValueChange={v => setFormData({...formData, timer_type: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select> : <Badge>{timer?.timer_type}</Badge>}</div>
            <div className="space-y-2"><Label>Active</Label>{isEditing ? <div className="flex items-center gap-2"><Checkbox id="active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c === true})} /><Label htmlFor="active">Enabled</Label></div> : <div className="text-sm">{timer?.is_active ? 'Yes' : 'No'}</div>}</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Execution</h3>
            <div className="space-y-2"><Label>Pipeline</Label>{isEditing ? <PipelineSelect value={formData.pipeline_id} onChange={v => setFormData({...formData, pipeline_id: v})} /> : <div className="text-sm font-mono">{timer?.pipeline_id || '—'}</div>}</div>
          </div>
        </div>
        <div className="mt-6 space-y-2"><Label>Description</Label>{isEditing ? <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /> : <div className="text-sm">{timer?.description || '—'}</div>}</div>
        <div className="mt-6 space-y-2"><Label>Config (JSON)</Label>{isEditing ? <Textarea value={formData.config} onChange={e => setFormData({...formData, config: e.target.value})} rows={6} className="font-mono text-sm" /> : <pre className="text-sm bg-muted p-3 rounded">{JSON.stringify(timer?.config || {}, null, 2)}</pre>}</div>
        <div className="mt-6 space-y-2"><Label>Metadata (JSON)</Label>{isEditing ? <Textarea value={formData.metadata} onChange={e => setFormData({...formData, metadata: e.target.value})} rows={4} className="font-mono text-sm" /> : <pre className="text-sm bg-muted p-3 rounded">{JSON.stringify(timer?.metadata || {}, null, 2)}</pre>}</div>
      </CardContent></Card>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/TimerDetailPage.tsx:TimerDetailPage:component"]









