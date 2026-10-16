// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AppDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Top-level imports and module entry point for the AppDetailPage admin component."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare external dependencies for the App detail admin page."]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, React Router, API hooks, UI components, and utilities used by the AppDetailPage component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]




import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useMutation } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { ArrowLeft, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='Top-level imports and module entry point for the AppDetailPage admin component.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/AppDetailPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AppDetailPage.tsx:App:interface" type="interface" identity="App" parent="~/.framework/src/pages/admin/AppDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define the App data contract used across the admin app detail page."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a TypeScript type describing the shape of an app record."]
// CIL[DOC-CONTEXT module="admin" layer="domain" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/AppDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="app record from API or plain object" outputs="App interface definition" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the App interface with fields for metadata, configuration, and runtime settings." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface App {
  id: string
  slug: string
  name: string
  description?: string
  app_type: string
  version: string
  icon?: string
  color?: string
  source: string
  owner_account_id: string
  is_active: boolean
  is_system: boolean
  min_role: string
  created_at: string
  updated_at?: string
  config?: Record<string, any>
  nav_items?: any[]
  integration_deps?: any[]
  metadata?: Record<string, any>
  route_prefix?: string
  renderer?: 'generic' | 'custom' | 'none'
  item_count?: number
  user_count?: number
  account_name?: string
  created_by?: string
  account_id?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the App data contract used across the admin app detail page.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/AppDetailPage.tsx:App:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AppDetailPage.tsx:AppDetailPage:component" type="component" identity="AppDetailPage" parent="~/.framework/src/pages/admin/AppDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render and manage the admin app create/edit/detail page."]
// CIL[DOC-RESPONSIBILITY responsibility="Display app details, support editing and saving app configuration, and handle deletion."]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/AppDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="route id param" outputs="Rendered admin app detail UI" errors="Invalid ID format, failed fetch, save/delete errors" side_effects="Navigates on save/delete; calls apiFetch for create/update/delete"]
// CIL[DOC-MICRO logic_summary="Fetches app by id, manages edit state and JSON config, renders form fields, and persists changes via API." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function AppDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(isCreateMode)
  const [editData, setEditData] = useState<Record<string, any>>({
    name: '',
    slug: '',
    description: '',
    app_type: 'custom',
    version: '1.0.0',
    icon: null,
    color: null,
    source: 'custom',
    owner_account_id: '',
    is_active: true,
    is_system: false,
    min_role: 'member',
    config: {},
    nav_items: [],
    integration_deps: [],
    metadata: {},
    route_prefix: '',
    renderer: 'generic'
  })
  const [configText, setConfigText] = useState(JSON.stringify({}, null, 2))

  const { data: app, loading, error, refetch } = useApi<App>(
    async () => {
      if (isCreateMode) {
        return {
          id: '',
          slug: '',
          name: '',
          description: '',
          app_type: 'custom',
          version: '1.0.0',
          icon: null,
          color: null,
          source: 'custom',
          owner_account_id: '',
          is_active: true,
          is_system: false,
          min_role: 'member',
          created_at: new Date().toISOString(),
          config: {},
          nav_items: [],
          integration_deps: [],
          metadata: {},
          route_prefix: '',
          renderer: 'generic'
        }
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id!)) {
        throw new Error('Invalid ID format')
      }
      const response = await apiFetch(`/api/apps?action=get&id=${id}`)
      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          throw new Error('App not found')
        }
        throw new Error('Failed to fetch app')
      }
      const result = await response.json()
      return result.data || result
    },
    { immediate: true }
  )

  useEffect(() => {
    if (app) {
      const initialData = {
        name: app.name,
        slug: app.slug,
        description: app.description || '',
        app_type: app.app_type,
        version: app.version,
        icon: app.icon || null,
        color: app.color || null,
        source: app.source,
        owner_account_id: app.owner_account_id,
        is_active: app.is_active,
        is_system: app.is_system,
        min_role: app.min_role,
        config: app.config || {},
        nav_items: app.nav_items || [],
        integration_deps: app.integration_deps || [],
        metadata: app.metadata || {},
        route_prefix: app.route_prefix || '',
        renderer: app.renderer || 'generic'
      }
      setEditData(initialData)
      setConfigText(JSON.stringify(app.config || {}, null, 2))
    }
  }, [app])

  const handleSave = async () => {
    try {
      let parsedConfig = {}
      try {
        parsedConfig = JSON.parse(configText)
      } catch (error) {
        console.warn('Invalid JSON in config field, using default:', error)
      }
      
      const { item_count: _ic, user_count: _uc, account_name: _an, ...cleanData } = editData
      const saveData = { ...cleanData, config: parsedConfig }
      const url = isCreateMode 
        ? '/api/apps?action=create'
        : `/api/apps?action=update&id=${id}`
      const method = isCreateMode ? 'POST' : 'PATCH'
      
      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      })
      
      if (!response.ok) throw new Error('Failed to save app')
      
      if (isCreateMode) {
        const result = await response.json()
        const newId = result.data?.id || result.id
        navigate(`/spine-framework/admin/configs/apps/${newId}`)
      } else {
        await refetch()
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving app:', error)
    }
  }

  const handleCancel = () => {
    if (isCreateMode) {
      navigate('/spine-framework/admin/configs/apps')
      return
    }
    if (app) {
      setEditData({
        name: app.name,
        slug: app.slug,
        description: app.description || '',
        app_type: app.app_type,
        version: app.version,
        icon: app.icon || null,
        color: app.color || null,
        source: app.source,
        owner_account_id: app.owner_account_id,
        is_active: app.is_active,
        is_system: app.is_system,
        min_role: app.min_role,
        config: app.config || {},
        nav_items: app.nav_items || [],
        integration_deps: app.integration_deps || [],
        metadata: app.metadata || {},
        route_prefix: app.route_prefix || '',
        renderer: app.renderer || 'generic'
      })
      setConfigText(JSON.stringify(app.config || {}, null, 2))
    }
    setIsEditing(false)
  }

  const handleEdit = () => setIsEditing(true)

  const deleteMutation = useMutation(
    async () => {
      const response = await apiFetch(`/api/apps?action=delete&id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete app')
      return response.json()
    },
    { onSuccess: () => navigate('/spine-framework/admin/configs/apps') }
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load app</AlertTitle>
          <AlertDescription>{String(error)}</AlertDescription>
        </Alert>
        <Button onClick={refetch} variant="outline" className="mt-4">Retry</Button>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">App not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">The app you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/spine-framework/admin/configs/apps')} className="mt-4">
          Back to Apps
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => isCreateMode ? navigate('/spine-framework/admin/configs/apps') : navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isCreateMode ? 'Create App' : app?.name}</h1>
            <p className="text-sm text-muted-foreground">{isCreateMode ? 'App Configuration' : 'App Details'}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>{isCreateMode ? 'Create' : 'Save Changes'}</Button>
            </>
          ) : (
            !isCreateMode && (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )
          )}
        </div>
      </div>

      <PageInstructions
        description="Configure an app, its metadata, and runtime settings."
        sections={[
          { title: 'What this app controls', content: 'An app is a registered application in Spine. It controls navigation visibility, which people can use it, and the JSON configuration that the app or its runtime types consume.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string. The display name in the app switcher and registry.</li>
            <li><strong>Slug</strong> — string. A unique URL-friendly identifier. Should be set at creation and rarely changed.</li>
            <li><strong>Description</strong> — string. Optional short text shown in the app list.</li>
            <li><strong>App Type</strong> — select. system, custom, or marketplace. Drives how the app is treated by the platform.</li>
            <li><strong>Source</strong> — select. system, custom, or marketplace. Tracks where the app package came from.</li>
            <li><strong>Min Role</strong> — select. member, admin, or owner. The lowest role that can see or access the app.</li>
            <li><strong>Version</strong> — string. The current app version shown in the registry.</li>
            <li><strong>Active</strong> — select true/false. Inactive apps are hidden and cannot be opened.</li>
            <li><strong>System</strong> — select true/false. Marks apps that are part of the platform and should not be treated as tenant-managed.</li>
            <li><strong>Icon</strong> — string. An icon name used by the UI. Invalid names show no icon.</li>
            <li><strong>Color</strong> — select. The theme color for the app tile.</li>
            <li><strong>Route Prefix</strong> — string. Optional URL prefix for the app (defaults to /slug).</li>
            <li><strong>Renderer</strong> — select. generic, custom, or none. generic uses the design schema to render pages.</li>
            <li><strong>Configuration (JSON)</strong> — JSON. Runtime configuration for the app or its generic renderer.</li>
            <li><strong>Nav Items (JSON)</strong> — JSON. Array of navigation items for the app shell.</li>
            <li><strong>Integration Deps (JSON)</strong> — JSON. Array of integration slugs the app depends on.</li>
            <li><strong>Metadata (JSON)</strong> — JSON. Free-form metadata associated with the app.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Type/Source</strong>: <em>system</em> for built-in apps, <em>custom</em> for account-built apps, <em>marketplace</em> for installed apps.</li>
            <li><strong>Min Role</strong>: <em>member</em> is most permissive, <em>admin</em> for admins, <em>owner</em> for account owners.</li>
            <li><strong>Active</strong>: choose Active to publish, Inactive to hide.</li>
            <li><strong>System</strong>: choose System to protect the app from tenant deletion.</li>
            <li><strong>Color</strong>: blue, green, red, yellow, purple, pink, indigo, gray, slate.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>The app registry and shell navigation read these fields to decide which apps to show and who can open them.</li>
            <li>Generic apps use the Configuration JSON and related types to render lists and detail pages.</li>
            <li>Custom apps may read the slug and config to initialize routes. A missing slug or bad config can break the app.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>In create mode, fill the App Information card and enter a unique slug, then choose Type, Source, and Min Role.</li>
            <li>Edit the Configuration JSON with valid JSON; the form warns about invalid syntax on save.</li>
            <li>Click Create to save, or Save Changes when editing. Use Delete to remove the app after a confirmation.</li>
            <li>Validation checks required fields and that the Configuration JSON is parseable.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">
            <li>Reusing a slug that already exists, causing a unique constraint error.</li>


            <li>Switching an app to Inactive while people are using it.</li>

            <li>Pasting non-JSON text or trailing commas in the Configuration JSON.</li>
          </ul> },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Basic Info</h3>
              
              {!isCreateMode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ID:</span>
                  <span className="text-sm font-mono">{app.id}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name:</span>
                {isEditing ? (
                  <Input value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-48" />
                ) : (
                  <span className="text-sm">{app.name}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Slug:</span>
                {isEditing ? (
                  <Input value={editData.slug} onChange={(e) => setEditData({...editData, slug: e.target.value})} className="w-48" />
                ) : (
                  <span className="text-sm font-mono">{app.slug}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Description:</span>
                {isEditing ? (
                  <Input value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} className="w-48" placeholder="Enter description" />
                ) : (
                  <span className="text-sm">{app.description || 'No description'}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type:</span>
                {isEditing ? (
                  <Select value={editData.app_type} onValueChange={(v) => setEditData({...editData, app_type: v})}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge>{app.app_type}</Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Source:</span>
                {isEditing ? (
                  <Select value={editData.source} onValueChange={(v) => setEditData({...editData, source: v})}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{app.source}</Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Min Role:</span>
                {isEditing ? (
                  <Select value={editData.min_role} onValueChange={(v) => setEditData({...editData, min_role: v})}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{app.min_role}</Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Version:</span>
                {isEditing ? (
                  <Input value={editData.version} onChange={(e) => setEditData({...editData, version: e.target.value})} className="w-48" />
                ) : (
                  <span className="text-sm">{app.version}</span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Status & Access</h3>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active:</span>
                {isEditing ? (
                  <Select value={String(editData.is_active)} onValueChange={(v) => setEditData({...editData, is_active: v === 'true'})}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={app.is_active ? 'default' : 'secondary'}>{app.is_active ? 'Active' : 'Inactive'}</Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">System:</span>
                {isEditing ? (
                  <Select value={String(editData.is_system)} onValueChange={(v) => setEditData({...editData, is_system: v === 'true'})}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">System</SelectItem>
                      <SelectItem value="false">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={app.is_system ? 'secondary' : 'outline'}>{app.is_system ? 'System' : 'Custom'}</Badge>
                )}
              </div>
              
              {!isCreateMode && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Owner Account ID:</span>
                    <span className="text-sm font-mono">{app.owner_account_id || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="text-sm">{formatDateTime(app.created_at)}</span>
                  </div>
                  {app.updated_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Updated:</span>
                      <span className="text-sm">{formatDateTime(app.updated_at)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration JSON</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">App Configuration (JSON)</label>
              <Textarea value={configText} onChange={(e) => setConfigText(e.target.value)} className="h-64 font-mono text-sm" placeholder="Enter JSON configuration..." />
              <p className="text-xs text-muted-foreground">Enter JSON for app configuration. Invalid JSON will be handled on save.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <pre className="text-sm font-mono bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(app.config, null, 2)}
              </pre>
              <p className="text-xs text-muted-foreground">Configuration contains {Object.keys(app.config || {}).length} properties</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete App"
        description="Are you sure you want to delete this app? This action cannot be undone."
        size="sm"
      >
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.loading} variant="destructive">
            {deleteMutation.loading ? 'Deleting...' : 'Delete App'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render and manage the admin app create/edit/detail page.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/AppDetailPage.tsx:AppDetailPage:component"]
