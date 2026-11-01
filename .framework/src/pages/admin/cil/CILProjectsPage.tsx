// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx"]
/**
 * @module   CILProjectsPage
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * The CILProjectsPage module is responsible for rendering the user interface for managing CIL projects within the admin section of the application. It fetches project data from the API and displays it in a structured format using cards and badges. INVARIANT: The user must have admin privileges to access this page.
 *
 * @seeAlso apiFetch (used for fetching project data).
 * @seeAlso @core/components/ui/card (provides UI components for displaying project information).
 * @seeAlso react-router-dom (for navigation handling).
 *
 * @cil-generated
 */










import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import {
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:module_header:module_header"]
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@core/components/ui/dialog'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { Textarea } from '@core/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@core/components/ui/native-select'
import { FolderGit2, Plus, Play, CheckCircle2, Clock, AlertCircle, GitGraph, LayoutDashboard, Trash2, Layers, Pencil, X } from 'lucide-react'



















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:SourceSet:interface" type="interface" identity="SourceSet" parent="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx"]
/**
 * The SourceSet interface defines a structure for managing a set of source files, including their identifiers and paths. It is used to facilitate the organization and retrieval of source files in the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface SourceSet {
  id: string
  name: string
  base_path: string
  globs?: string
  exclude_globs?: string
  layer?: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:SourceSet:interface"]




















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:CILProject:interface" type="interface" identity="CILProject" parent="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx"]
/**
 * CILProject defines the structure of a project within the CIL framework, encapsulating essential project details and ingestion data. It standardizes how project information is represented and managed in the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface CILProject {
  id: string
  title: string
  description: string
  status: string
  data: {
    repo_path: string
    language_mix: string
    kind?: 'core' | 'custom'
    globs?: string[]
    exclude_globs?: string[]
    ingestion_status: 'not_started' | 'in_progress' | 'complete'
    file_count: number
    chunk_count: number
    total_ingestion_cost_usd: number
    last_ingested_at: string | null
    source_sets?: SourceSet[]
    dependencies?: string[]
  }
  created_at: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:CILProject:interface"]
























// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:STATUS_BADGE:constant" type="constant" identity="STATUS_BADGE" parent="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx"]
/**
 * STATUS_BADGE is a constant that defines the various status labels and their corresponding visual variants for project statuses in the admin interface. It exists to provide a consistent way to represent project states throughout the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  not_started: { label: 'Not Started', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'secondary' },
  complete: { label: 'Complete', variant: 'default' },
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:STATUS_BADGE:constant"]





























// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:STATUS_ICON:constant" type="constant" identity="STATUS_ICON" parent="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx"]
/**
 * STATUS_ICON is a mapping of project statuses to their corresponding React components, providing a consistent way to render status indicators in the UI. This ensures that the visual representation of project statuses is uniform across the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const STATUS_ICON: Record<string, React.ElementType> = {
  not_started: Clock,
  in_progress: AlertCircle,
  complete: CheckCircle2,
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:STATUS_ICON:constant"]

























// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:CILProjectsPage:component" type="component" identity="CILProjectsPage" parent="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx"]
/**
 * CILProjectsPage manages the display and creation of CIL projects within the admin interface. It handles project data fetching, creation, and editing functionalities.
 *
 * @macro       Component for managing CIL projects in an admin interface.
 * @micro       Utilizes React state management and API calls to fetch and manipulate project data.
 * @outputSpec  JSX.Element — renders the CIL projects page UI
 * @sideEffects API calls to fetch, create, and update CIL project data
 * @stability   stable
 * @calls       apiFetch
 * @errorHandling none
 * @cil-generated
 */
export default function CILProjectsPage() {
  const navigate = useNavigate()
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
  const [projects, setProjects] = useState<CILProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    repo_path: '',
    language_mix: '',
    kind: 'custom' as 'core' | 'custom',
    globs: '**/*.ts, **/*.tsx, **/*.sql',
    exclude_globs: 'node_modules/**, .git/**, .assembled/**, dist/**, build/**, .netlify/**, **/*.min.js, **/*.d.ts',
    source_sets: [] as SourceSet[],
  })
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  const fetchProjects = () => {
    setLoading(true)
    apiFetch('/api/cil-project?action=list')
      .then(r => r.json())
      .then(data => setProjects(data?.projects || data?.data?.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const handleSave = async () => {
    if (!form.name || !form.repo_path) return
    setCreating(true)
    try {
      const payload: Record<string, any> = {
        name: form.name,
        description: form.description,
        repo_path: form.repo_path,
        language_mix: form.language_mix,
        kind: form.kind,
        globs: form.globs.split(',').map((s: string) => s.trim()).filter(Boolean),
        exclude_globs: form.exclude_globs.split(',').map((s: string) => s.trim()).filter(Boolean),
      }
      if (form.source_sets && form.source_sets.length > 0) {
        payload.source_sets = form.source_sets.map(ss => ({
          ...ss,
          globs: ss.globs ? ss.globs.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          exclude_globs: ss.exclude_globs ? ss.exclude_globs.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        }))
      }

      let res: Response
      if (editingProjectId) {
        const updatePayload = { ...payload }
        delete updatePayload.name
        res = await apiFetch(`/api/cil-project?action=update&id=${editingProjectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: form.name, description: form.description, data: updatePayload }),
        })
      } else {
        res = await apiFetch('/api/cil-project?action=create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      const newId = data?.project?.id || data?.data?.project?.id
      setShowCreate(false)
      setEditingProjectId(null)
      setForm({ name: '', description: '', repo_path: '', language_mix: '', kind: 'custom', source_sets: [] })
      if (newId && !editingProjectId) {
        navigate(appPath(`/cil/${newId}/ingest`))
      } else {
        fetchProjects()
      }
    } catch {
    } finally {
      setCreating(false)
    }
  }

  const openCreate = () => {
    setEditingProjectId(null)
    setForm({
      name: '',
      description: '',
      repo_path: '',
      language_mix: '',
      kind: 'custom',
      globs: '**/*.ts, **/*.tsx, **/*.sql',
      exclude_globs: 'node_modules/**, .git/**, .assembled/**, dist/**, build/**, .netlify/**, **/*.min.js, **/*.d.ts',
      source_sets: [],
    })
    setShowCreate(true)
  }

  const openEdit = (project: CILProject) => {
    setEditingProjectId(project.id)
    setForm({
      name: project.title,
      description: project.description,
      repo_path: project.data?.repo_path || '',
      language_mix: project.data?.language_mix || '',
      kind: project.data?.kind || 'custom',
      globs: (project.data?.globs || []).join(', '),
      exclude_globs: (project.data?.exclude_globs || []).join(', '),
      source_sets: (project.data?.source_sets || []).map(ss => ({
        ...ss,
        globs: Array.isArray(ss.globs) ? ss.globs.join(', ') : ss.globs || '',
        exclude_globs: Array.isArray(ss.exclude_globs) ? ss.exclude_globs.join(', ') : ss.exclude_globs || '',
      })),
    })
    setShowCreate(true)
  }

  const handleDeleteProject = async () => {
    if (!confirmDeleteId) return
    setDeleting(true)
    try {
      await apiFetch(`/api/cil-project?action=delete&id=${confirmDeleteId}`, {
        method: 'DELETE',
      })
      setConfirmDeleteId(null)
      fetchProjects()
    } catch {
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-indigo-500" />
            Code Intelligence Layer
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Register codebases, run ingestion passes, and query the code graph
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <FolderGit2 className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">No projects yet. Register a codebase to get started.</p>
          <Button variant="outline" onClick={() => openCreate()}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => {






/**
 * The constant 'ingestionStatus' retrieves the ingestion status of a project, defaulting to 'not_started' if the status is not available. It exists to provide a clear indication of the project's ingestion state within the CILProjectsPage module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
            const ingestionStatus = project.data?.ingestion_status || 'not_started'






            const { label, variant } = STATUS_BADGE[ingestionStatus] || STATUS_BADGE.not_started






/**
 * StatusIcon determines the appropriate icon to represent the current ingestion status, providing a fallback to a default clock icon if the status is not recognized.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
            const StatusIcon = STATUS_ICON[ingestionStatus] || Clock







            return (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(appPath(`/cil/${project.id}/ingest`))}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <Badge variant={variant} className="shrink-0 flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {project.data?.repo_path || '—'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  )}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="text-center">
                      <div className="text-xl font-bold">{project.data?.file_count ?? 0}</div>
                      <div className="text-xs text-muted-foreground">Files</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{project.data?.chunk_count ?? 0}</div>
                      <div className="text-xs text-muted-foreground">Chunks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        ${(project.data?.total_ingestion_cost_usd ?? 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Cost</div>
                    </div>
                  </div>
                  {project.data?.language_mix && (
                    <p className="text-xs text-muted-foreground">{project.data.language_mix}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={e => {
                        e.stopPropagation()
                        navigate(appPath(`/cil/${project.id}/ingest`))
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run Pipeline
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2"
                      onClick={e => {
                        e.stopPropagation()
                        navigate(appPath(`/cil/${project.id}/dashboard`))
                      }}
                      title="Dashboard"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2"
                      onClick={e => {
                        e.stopPropagation()
                        navigate(appPath(`/cil/${project.id}/files`))
                      }}
                      title="Browse Files"
                    >
                      <Layers className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2"
                      onClick={e => {
                        e.stopPropagation()
                        navigate(appPath(`/cil/${project.id}/graph`))
                      }}
                      title="View Graph"
                    >
                      <GitGraph className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2"
                      onClick={e => {
                        e.stopPropagation()
                        openEdit(project)
                      }}
                      title="Edit project"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={e => {
                        e.stopPropagation()
                        setConfirmDeleteId(project.id)
                      }}
                      title="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {}
      <Dialog open={showCreate} onOpenChange={open => { if (!open) { setEditingProjectId(null); setForm({
        name: '',
        description: '',
        repo_path: '',
        language_mix: '',
        kind: 'custom',
        globs: '**/*.ts, **/*.tsx, **/*.sql',
        exclude_globs: 'node_modules/**, .git/**, .assembled/**, dist/**, build/**, .netlify/**, **/*.min.js, **/*.d.ts',
        source_sets: [],
      }) } setShowCreate(open) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProjectId ? 'Edit CIL Project' : 'Register New CIL Project'}</DialogTitle>
            <DialogDescription>
              Configure the code intelligence project and its source sets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="spine-ia"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="repo_path">Repository Path *</Label>
              <Input
                id="repo_path"
                placeholder="/Users/thistle/CascadeProjects/spine-ia"
                value={form.repo_path}
                onChange={e => setForm(f => ({ ...f, repo_path: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Absolute path to the repository root on the agent's filesystem</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kind">Project Kind *</Label>
              <NativeSelect
                id="kind"
                value={form.kind}
                onChange={e => setForm(f => ({ ...f, kind: e.target.value as 'core' | 'custom' }))}
              >
                <NativeSelectOption value="core">Core (framework)</NativeSelectOption>
                <NativeSelectOption value="custom">Custom app</NativeSelectOption>
              </NativeSelect>
              <p className="text-xs text-muted-foreground">Core projects track the framework; custom projects track app code under custom/apps</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="globs">Include globs</Label>
              <Textarea
                id="globs"
                value={form.globs}
                onChange={e => setForm(f => ({ ...f, globs: e.target.value }))}
                rows={2}
                placeholder="**/*.ts, **/*.tsx, **/*.sql"
              />
              <p className="text-xs text-muted-foreground">Comma-separated globs of files to discover</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exclude_globs">Exclude globs</Label>
              <Textarea
                id="exclude_globs"
                value={form.exclude_globs}
                onChange={e => setForm(f => ({ ...f, exclude_globs: e.target.value }))}
                rows={2}
                placeholder="node_modules/**, dist/**, build/**, .git/**, .assembled/**"
              />
              <p className="text-xs text-muted-foreground">Comma-separated globs of files and directories to skip during discovery</p>
            </div>
            {editingProjectId && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="language_mix">Languages</Label>
                  <Input
                    id="language_mix"
                    placeholder="TypeScript, SQL"
                    value={form.language_mix}
                    onChange={e => setForm(f => ({ ...f, language_mix: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Spine framework — multi-tenant SaaS platform"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </>
            )}

            {}
            {editingProjectId && <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>Source Sets</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setForm(f => ({
                    ...f,
                    source_sets: [...f.source_sets, { id: crypto.randomUUID(), name: '', base_path: '', globs: '', exclude_globs: '', layer: 'app-specific' }],
                  }))}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Source Set
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Optional. Leave empty to use the default globs. Each source set defines a base path relative to the repo root, its own globs/excludes, and an architectural layer.
              </p>
              {form.source_sets.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No source sets — default globs will be used.</p>
              )}
              {form.source_sets.map((ss, idx) => (
                <div key={ss.id} className="border rounded-md p-3 space-y-2 bg-muted/30">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      placeholder="Set name"
                      value={ss.name}
                      onChange={e => setForm(f => {
                        const next = [...f.source_sets]
                        next[idx] = { ...next[idx], name: e.target.value }
                        return { ...f, source_sets: next }
                      })}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => setForm(f => ({ ...f, source_sets: f.source_sets.filter((_, i) => i !== idx) }))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Base path (relative to repo)"
                      value={ss.base_path}
                      onChange={e => setForm(f => {
                        const next = [...f.source_sets]
                        next[idx] = { ...next[idx], base_path: e.target.value }
                        return { ...f, source_sets: next }
                      })}
                      className="text-xs font-mono"
                    />
                    <NativeSelect
                      value={ss.layer || 'app-specific'}
                      onChange={e => setForm(f => {
                        const next = [...f.source_sets]
                        next[idx] = { ...next[idx], layer: e.target.value }
                        return { ...f, source_sets: next }
                      })}
                      className="text-xs"
                    >
                      <NativeSelectOption value="shared-core">shared-core</NativeSelectOption>
                      <NativeSelectOption value="app-specific">app-specific</NativeSelectOption>
                      <NativeSelectOption value="infrastructure">infrastructure</NativeSelectOption>
                      <NativeSelectOption value="test">test</NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <Input
                    placeholder="Globs, comma-separated (e.g. **/*.ts, **/*.tsx)"
                    value={ss.globs || ''}
                    onChange={e => setForm(f => {
                      const next = [...f.source_sets]
                      next[idx] = { ...next[idx], globs: e.target.value }
                      return { ...f, source_sets: next }
                    })}
                    className="text-xs font-mono"
                  />
                  <Input
                    placeholder="Exclude globs, comma-separated (optional)"
                    value={ss.exclude_globs || ''}
                    onChange={e => setForm(f => {
                      const next = [...f.source_sets]
                      next[idx] = { ...next[idx], exclude_globs: e.target.value }
                      return { ...f, source_sets: next }
                    })}
                    className="text-xs font-mono"
                  />
                </div>
              ))}
            </div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={creating || !form.name || !form.repo_path}
            >
              {creating ? 'Saving…' : (editingProjectId ? 'Save Project' : 'Create Project')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!confirmDeleteId} onOpenChange={open => { if (!open) setConfirmDeleteId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete Project
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the project and <strong>all associated files, chunks, proposals, embeddings, and graph links</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm font-medium">
            Project: <span className="font-mono">{projects.find(p => p.id === confirmDeleteId)?.title || confirmDeleteId}</span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILProjectsPage.tsx:CILProjectsPage:component"]









