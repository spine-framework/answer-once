// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TypeDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/TypeDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Admin type detail page for viewing, creating, and editing Spine type schemas"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports React hooks, shared UI components, and exports the TypeDetailPage component"]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="rendered admin page module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Top-level module header that wires dependencies for the type detail page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="human, ai"]





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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { DataTable } from '../../components/ui/DataTable'
import { ArrowLeft, Pencil, Trash2, AlertCircle } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Admin type detail page for viewing, creating, and editing Spine type schemas'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TypeDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TypeDetailPage.tsx:Type:interface" type="interface" identity="Type" parent="~/.framework/src/pages/admin/TypeDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Shape of a Spine type record used by the admin detail page"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the Type data structure including design_schema, validation_schema, view_config, ownership, and timestamps"]
// CIL[DOC-CONTEXT module="admin" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TypeDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="API or form data" outputs="Type-typed object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Interface describing a configurable runtime record type with schemas and metadata" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface Type {
  id: string
  name: string
  slug: string
  kind: string
  description?: string
  icon?: string
  color?: string
  design_schema?: {
    fields: Record<string, any>
    record_permissions?: Record<string, string[]>
  }
  validation_schema?: Record<string, any>
  view_config?: Record<string, any>
  ownership: string
  is_active: boolean
  app_id?: string
  app?: any
  created_at: string
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Shape of a Spine type record used by the admin detail page'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TypeDetailPage.tsx:Type:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TypeDetailPage.tsx:TypeItem:interface" type="interface" identity="TypeItem" parent="~/.framework/src/pages/admin/TypeDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Shape of a runtime item that belongs to a Spine type"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the TypeItem data structure with data, metadata, and audit fields"]
// CIL[DOC-CONTEXT module="admin" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TypeDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="admin-data API response" outputs="TypeItem-typed array" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Interface describing a single runtime record of a type" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface TypeItem {
  id: string
  item_type_id: string
  data: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  created_by: string
  account_id: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Shape of a runtime item that belongs to a Spine type'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TypeDetailPage.tsx:TypeItem:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TypeDetailPage.tsx:TypeDetailPage:component" type="component" identity="TypeDetailPage" parent="~/.framework/src/pages/admin/TypeDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Render and manage the admin type detail page with create, edit, view, and delete flows"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch type and item data, validate JSON schemas, and present edit/read UI"]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TypeDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="id and kind route params, available apps list, user interactions" outputs="Rendered admin UI, API save/delete requests" errors="Fetch failures, invalid JSON, save errors" side_effects="Browser alert, navigation, useState updates, API calls"]
// CIL[DOC-MICRO logic_summary="Component loads a type by id or slug, allows editing design/view JSON, lists related items, and supports deletion" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function TypeDetailPage() {
  const { id, kind } = useParams<{ id: string, kind: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'
  const typeKind = kind || 'item'

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(isCreateMode)
  const [editData, setEditData] = useState<Record<string, any>>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '',
    kind: typeKind,
    design_schema: { fields: {} },
    view_config: {},
    ownership: 'app',
    app_id: '',
    is_active: true
  })
  const [schemaText, setSchemaText] = useState(JSON.stringify({ fields: {} }, null, 2))
  const [viewConfigText, setViewConfigText] = useState(JSON.stringify({}, null, 2))
  const [availableApps, setAvailableApps] = useState<Array<{id: string, name: string}>>([])

  React.useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await apiFetch('/api/apps?action=list')
        if (response.ok) {
          const data = await response.json()
          setAvailableApps(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching apps:', error)
      }
    }
    fetchApps()
  }, [])

  const getKindDefaults = () => {
    switch (typeKind) {
      case 'account':
        return { kind: 'account', ownership: 'app', icon: 'building-office', color: 'green' }
      case 'person':
        return { kind: 'person', ownership: 'app', icon: 'user', color: 'purple' }
      default:
        return { kind: 'item', ownership: 'app', icon: 'cube', color: 'blue' }
    }
  }

  const { data: type, loading, error, refetch } = useApi<Type>(
    async () => {
      if (isCreateMode) {
        const defaults = getKindDefaults()
        return {
          id: '',
          name: '',
          slug: '',
          description: '',
          icon: defaults.icon,
          color: defaults.color,
          kind: defaults.kind,
          design_schema: { fields: {} },
          ownership: defaults.ownership,
          app_id: '',
          is_active: true,
          created_at: '',
          updated_at: ''
        }
      } else {
        if (!id) throw new Error('Type ID or slug is required')
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        const url = uuidRegex.test(id)
          ? `/api/types?action=get&id=${id}`
          : `/api/types?action=get&slug=${id}`
        const response = await apiFetch(url)
        if (!response.ok) {
          throw new Error(response.status === 500 ? 'Type not found' : 'Failed to fetch type')
        }
        const json = await response.json()
        return json.data as Type
      }
    },
    { immediate: true }
  )

  React.useEffect(() => {
    if (type) {
      setEditData({
        name: type.name,
        slug: type.slug,
        description: type.description || '',
        icon: type.icon || '',
        color: type.color || '',
        kind: type.kind || 'item',
        design_schema: type.design_schema || { fields: {} },
        view_config: type.view_config || {},
        ownership: type.ownership || 'system',
        app_id: type.app_id || '',
        is_active: type.is_active ?? true
      })
      setSchemaText(JSON.stringify(type.design_schema || { fields: {} }, null, 2))
      setViewConfigText(JSON.stringify(type.view_config || {}, null, 2))
    }
  }, [type])

  const handleSave = async () => {
    try {
      const { app_id } = editData
      const ownership = (editData.ownership || '').toLowerCase()
      if (ownership !== 'system' && !app_id) {
        throw new Error('App selection is required when ownership is not "System"')
      }
      let parsedSchema = { fields: {} }
      let parsedViewConfig = {}
      try {
        parsedSchema = JSON.parse(schemaText)
      } catch (error) {
        console.warn('Invalid JSON in schema field, using default:', error)
      }
      try {
        parsedViewConfig = JSON.parse(viewConfigText)
      } catch (error) {
        console.warn('Invalid JSON in view config field, using default:', error)
      }
      const saveData = {
        ...editData,
        design_schema: parsedSchema,
        view_config: parsedViewConfig,
        app_id: editData.app_id || null
      }
      const url = isCreateMode 
        ? '/api/types?action=create'
        : `/api/types?action=update&id=${id}`
      const method = isCreateMode ? 'POST' : 'PATCH'
      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      })
      if (!response.ok) throw new Error(`Failed to ${isCreateMode ? 'create' : 'update'} type`)
      if (isCreateMode) {
        const result = await response.json()
        const newId = result.data?.id || result.id
        navigate(`/spine-framework/admin/configs/${kind || 'types'}/${newId}`)
      } else {
        await refetch()
        setIsEditing(false)
      }
    } catch (error) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} type:`, error)
      alert(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }

  const handleCancel = () => {
    if (isCreateMode) {
      navigate('/spine-framework/admin/configs/types')
      return
    }
    if (type) {
      setEditData({
        name: type.name,
        slug: type.slug,
        description: type.description || '',
        icon: type.icon || '',
        color: type.color || '',
        design_schema: type.design_schema || { fields: {} },
        view_config: type.view_config || {},
        ownership: type.ownership || 'system',
        app_id: type.app_id || '',
        is_active: type.is_active ?? true
      })
      setSchemaText(JSON.stringify(type.design_schema || { fields: {} }, null, 2))
      setViewConfigText(JSON.stringify(type.view_config || {}, null, 2))
    }
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const { data: items, loading: itemsLoading, execute: fetchItems } = useApi<TypeItem[]>(
    async () => {
      if (isCreateMode || !type?.id) {
        return []
      }
      const response = await apiFetch(`/api/admin-data?entity=items&type_id=${type.id}`)
      if (!response.ok) throw new Error('Failed to fetch items')
      const result = await response.json()
      return result.data || []
    },
    { immediate: !isCreateMode }
  )

  useEffect(() => {
    if (!isCreateMode && type?.id) fetchItems()
  }, [type?.id])

  const deleteMutation = useMutation(
    async () => {
      const response = await apiFetch(`/api/types?action=delete&id=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete type')
      return response.json()
    },
    {
      onSuccess: () => {
        navigate(`/spine-framework/admin/configs/${kind || 'types'}`)
      }
    }
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

  if (error || (!type && !isCreateMode)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load type details</AlertTitle>
        <AlertDescription>{error || 'Type not found'}</AlertDescription>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">Retry</Button>

      </Alert>
    )
  }





  const itemColumns = [
    {
      key: 'id' as keyof TypeItem,
      title: 'ID',
      render: (row: any) => (
        <span className="font-mono text-xs">{row.id?.slice(0, 8)}...</span>



      )
    },
    {
      key: 'data' as keyof TypeItem,
      title: 'Data',
      render: (row: any) => {




        const firstFieldKey = Object.keys(type?.design_schema?.fields || {})[0]





        const displayValue = firstFieldKey ? row.data?.[firstFieldKey] : 'No data'

        return (
          <div>
            <div className="font-medium">{displayValue}</div>
            <div className="text-xs text-muted-foreground">
              {Object.keys(row.data || {}).length} fields
            </div>
          </div>
        )
      }







    },
    {
      key: 'created_at' as keyof TypeItem,
      title: 'Created',
      render: (row: any) => formatDateTime(row.created_at)
    },
    {
      key: 'updated_at' as keyof TypeItem,
      title: 'Updated',
      render: (row: any) => formatDateTime(row.updated_at)
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => isCreateMode ? navigate('/spine-framework/admin/configs/types') : navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isCreateMode ? 'Create Type' : type?.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isCreateMode ? 'Type Configuration' : 'Type Details'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>
                {isCreateMode ? 'Create' : 'Save Changes'}
              </Button>
            </>
          ) : (
            !isCreateMode && (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={type?.ownership === 'system'}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )
          )}
        </div>
      </div>

      <PageInstructions
        description="Manage type schemas, fields, and permissions for items, accounts, or people."
        sections={[
          { title: 'What this type controls', content: 'A type is the design schema for a runtime record kind. It defines the fields, default list/detail views, record permissions, icon, color, and metadata that the generic admin and runtime UIs use to create, validate, and display records.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string. The display label for the type. Empty name blocks save.</li>
            <li><strong>Slug</strong> — string. A unique, URL-friendly identifier scoped by kind. Used for type resolution and must be globally unique.</li>
            <li><strong>Description</strong> — string. Optional human-readable context.</li>
            <li><strong>Kind</strong> — select. item, account, person, thread, or message. Determines which runtime table the type governs.</li>
            <li><strong>Ownership</strong> — select. system, app, or tenant. Controls the data scope and who can manage the type.</li>
            <li><strong>Is Active</strong> — checkbox. Inactive types cannot have records created.</li>

]
            <li><strong>App ID</strong> — select. Optional owning app. None means a system type. Selecting an app scopes the type to that app.</li>
]
            <li><strong>Icon</strong> — string. An icon name for the UI stored in the types row.</li>
            <li><strong>Color</strong> — select. The theme color for the type stored in the types row.</li>
            <li><strong>Created / Updated</strong> — read-only timestamps.</li>
            <li><strong>Design Schema (JSON)</strong> — JSON. The full design_schema with fields, views, and record_permissions. The validation_schema is regenerated from this on save.</li>
            <li><strong>View Config (JSON)</strong> — JSON. Optional view_config object stored alongside the design schema.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Kind</strong>: <em>item</em> for records, <em>account</em> for accounts, <em>person</em> for people, <em>thread</em> for threads, <em>message</em> for messages.</li>
            <li><strong>Ownership</strong>: <em>system</em> for platform types, <em>app</em> for an app, <em>tenant</em> for account-specific.</li>
            <li><strong>Color</strong>: blue, green, red, yellow, purple, pink, indigo, gray, slate.</li>
            <li><strong>Design Schema</strong>: must include fields, default_list, default_detail, and record_permissions to satisfy the generic UI.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>Generic List and Detail pages render directly from this schema. A missing view or bad field will break those pages.</li>
            <li>Record creation and validation use the design schema. Bad permissions or data_type values can cause permission errors or failed saves.</li>
            <li>Other apps, pipelines, and triggers resolve types by slug; duplicate or changed slugs break those lookups.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>In create mode, choose a kind, name, slug, and ownership, then fill the Design Schema and optional View Config JSON.</li>
            <li>Click Create or Save Changes. The form validates that the JSON is valid; the API regenerates validation_schema from design_schema.</li>
            <li>Delete is disabled for system-owned types. Delete opens a confirmation modal for others.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">

]
            <li>Reusing a slug for the same kind, which breaks type resolution.</li>
]
            <li>Missing default_list or default_detail in the design schema, causing the generic UI to fail.</li>
            <li>Using an unknown data_type or display_type, leading to validation or rendering errors.</li>
          </ul> },
        ]}
      />

      {isEditing ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreateMode ? `Create New ${typeKind.charAt(0).toUpperCase() + typeKind.slice(1)}` : `Edit ${type?.name || 'Type'}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Type Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input
                        value={editData.slug}
                        onChange={(e) => setEditData({...editData, slug: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kind</Label>
                      <Select value={editData.kind} onValueChange={(v) => setEditData({...editData, kind: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {typeKind ? (
                            <SelectItem value={typeKind}>{typeKind.charAt(0).toUpperCase() + typeKind.slice(1)}</SelectItem>
                          ) : (
                            <>
                              <SelectItem value="item">Item</SelectItem>
                              <SelectItem value="account">Account</SelectItem>
                              <SelectItem value="person">Person</SelectItem>
                              <SelectItem value="thread">Thread</SelectItem>
                              <SelectItem value="message">Message</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ownership</Label>
                      <Select value={editData.ownership} onValueChange={(v) => setEditData({...editData, ownership: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="app">App</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="is_active"
                        checked={editData.is_active}
                        onCheckedChange={(checked) => setEditData({...editData, is_active: checked === true})}
                      />
                      <Label htmlFor="is_active">Is Active</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Metadata</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>ID</Label>
                      <div className="text-sm font-mono text-muted-foreground">{type?.id || 'Auto-generated'}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>App ID</Label>
                      <Select value={editData.app_id || ''} onValueChange={(v) => setEditData({...editData, app_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="None (System Types)" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableApps.map(app => (
                            <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Input
                        value={editData.icon || ''}
                        onChange={(e) => setEditData({...editData, icon: e.target.value})}
                        placeholder="Enter icon name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select value={editData.color || ''} onValueChange={(v) => setEditData({...editData, color: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="pink">Pink</SelectItem>
                          <SelectItem value="indigo">Indigo</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                          <SelectItem value="slate">Slate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Created</Label>
                      <div className="text-sm text-muted-foreground">{formatDateTime(type?.created_at) || 'Not yet created'}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Updated</Label>
                      <div className="text-sm text-muted-foreground">{formatDateTime(type?.updated_at) || 'Not yet updated'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Schema Definition</h3>
                <Label>Design Schema</Label>
                <Textarea
                  value={schemaText}
                  onChange={(e) => setSchemaText(e.target.value)}
                  className="font-mono text-sm"
                  rows={8}
                  placeholder='Enter JSON design schema with fields, views, and record_permissions'
                />
                <p className="text-xs text-muted-foreground">JSON schema defining the fields, list/detail views, and record permissions for this type. The validation_schema is generated from this on save.</p>
              </div>

              <div className="mt-8 space-y-2">
                <Label>View Config</Label>
                <Textarea
                  value={viewConfigText}
                  onChange={(e) => setViewConfigText(e.target.value)}
                  className="font-mono text-sm"
                  rows={4}
                  placeholder='Enter optional view_config JSON'
                />
                <p className="text-xs text-muted-foreground">Optional JSON view configuration stored alongside the design schema.</p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Type Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Type Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="text-sm">{type?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Slug:</span>
                      <span className="text-sm font-mono">{type?.slug}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Description:</span>
                      <span className="text-sm">{type?.description || 'No description'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Kind:</span>
                      <Badge>{type?.kind}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ownership:</span>
                      <Badge variant="outline">{type?.ownership}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={type?.is_active ? 'default' : 'secondary'}>
                        {type?.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Metadata</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">ID:</span>
                      <span className="text-sm font-mono">{type?.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">App ID:</span>
                      <span className="text-sm font-mono">{type?.app_id || 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Icon:</span>
                      <span className="text-sm">{type?.icon || 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Color:</span>
                      <div className="flex items-center gap-2">
                        {type?.color && (
                          <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: type?.color}}></span>
                        )}
                        <span className="text-sm">{type?.color || 'None'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm">{formatDateTime(type?.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Updated:</span>
                      <span className="text-sm">{formatDateTime(type?.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Schema Definition</h3>
                <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-48">
                  {JSON.stringify(type?.design_schema || { fields: {} }, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-primary font-semibold">{Object.keys(type?.design_schema?.fields || {}).length}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Fields</h3>
                    <p className="text-sm text-muted-foreground">Schema field definitions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <span className="text-green-600 font-semibold">{items?.length || 0}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Items</h3>
                    <p className="text-sm text-muted-foreground">Items using this type</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Items ({items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : items && items.length > 0 ? (
                <DataTable
                  data={items}
                  columns={itemColumns as any}
                  searchable={false}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No items found for this type
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Type"
        description="Are you sure you want to delete this type? This action cannot be undone."
        size="sm"
      >
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.loading}
          >
            {deleteMutation.loading ? 'Deleting...' : 'Delete Type'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Render and manage the admin type detail page with create, edit, view, and delete flows'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TypeDetailPage.tsx:TypeDetailPage:component"]