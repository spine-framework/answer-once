// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Module-level imports and component entry point for the runtime data detail page."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React imports, route and UI component dependencies, and declare the DataDetailPage module."]
// CIL[DOC-CONTEXT module="runtime" layer="presentation" related_files=".framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="rendered DataDetailPage component and imported dependencies" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, router hooks, the useEntityRecord hook, and child UI components; contains no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers, maintainers"]



import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useEntityRecord } from '../../hooks/useEntityRecord'
import { DataDetailHeader } from './DataDetailHeader'
import { SchemaDetailForm } from './SchemaDetailForm'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

// CIL[DOC-VECTOR type="context" content="purpose='Module-level imports and component entry point for the runtime data detail page.'; No verified external callers; imports: .framework/src/hooks/useEntityRecord.ts,.framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataDetailPage.tsx:datadetailpage:function"]
// CIL[DOC-MACRO purpose="Render a detail/edit page for a runtime entity record using its design schema and the useEntityRecord hook."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and display a record, handle create/edit/delete flows, field changes, and cancel/save/delete actions, and render the detail form."]
// CIL[DOC-CONTEXT module="runtime" layer="presentation" related_files=".framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/DataDetailPage.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-CONTRACT inputs="URL params (entity, id, typeSlug), search params (edit)" outputs="JSX for loading, error, or detail form" errors="Failed to load record or schema; save/delete errors bubble via useEntityRecord" side_effects="Updates search params; navigates on create/cancel/delete; calls useEntityRecord save/delete; uses browser confirm dialog"]
// CIL[DOC-MICRO logic_summary="Uses useParams and useSearchParams, derives recordId and isCreating/isEditing, builds a config for useEntityRecord, initializes formData from schema sections, and handles field change, edit, save, delete, and cancel actions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function DataDetailPage() {
  const { entity, id, typeSlug } = useParams<{ entity: string; id: string; typeSlug?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const recordId = id === 'new' ? undefined : id
  const isCreating = !recordId
  const isEditing = searchParams.get('edit') === 'true' || isCreating
  
  const defaultTypeSlugs: Record<string, string> = {
    accounts: 'account',
    people: 'person',
    items: 'item',
    threads: 'thread',
    messages: 'message',
    links: 'link',
    attachments: 'attachment',
    watchers: 'watcher',
    item_progress: 'item_progress'
  }

  const config = {
    entity: entity || '',
    typeSlug: typeSlug || (entity ? defaultTypeSlugs[entity] : undefined),
    icon: 'database',
    displayField: 'display_name',
    api: {
      endpoint: 'admin-data',
      getAction: 'get',
      createAction: 'create',
      updateAction: 'update'
    }
  }
  
  const { 
    record, 
    fieldPermissions,
    loading, 
    error, 
    refetch,
    save,
    delete: deleteRecord,
    saving,
    deleting
  } = useEntityRecord(entity!, recordId, config)
  
  const schema = record?.design_schema || null
  const view = schema?.views?.default_detail || null

  const displayField = schema?.display_field || config.displayField
  const FALLBACK_FIELDS = ['full_name', 'display_name', 'name', 'title', 'slug', 'email']
  const recordTitle = record?.[displayField]
    ?? FALLBACK_FIELDS.map(f => record?.[f]).find(v => v != null)
    ?? 'Untitled'

  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (record && view) {
      const initialData: Record<string, any> = {}
      view.sections?.forEach((section: any) => {
        const fieldNames = Array.isArray(section.fields) ? section.fields : Object.keys(section.fields || {})
        fieldNames.forEach((fieldName: string) => {
          const fieldDef = schema?.fields?.[fieldName]
          if (fieldDef?.system) {
            initialData[fieldName] = record[fieldName]
          } else {
            initialData[fieldName] = record.data?.[fieldName]
          }
        })
      })
      setFormData(initialData)
    } else if (isCreating) {
      setFormData({})
    }
  }, [record, isCreating, view, schema])
  
  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }
  
  const handleEdit = () => {
    setSearchParams({ edit: 'true' })
  }
  
  const handleCancel = () => {
    if (isCreating) {
      window.location.href = `/spine-framework/admin/runtime/${entity}`
    } else {
      setSearchParams({})
      if (record && view) {
        const initialData: Record<string, any> = {}
        view.sections?.forEach((section: any) => {
          const fieldNames = Array.isArray(section.fields) ? section.fields : Object.keys(section.fields || {})
          fieldNames.forEach((fieldName: string) => {
            const fieldDef = schema?.fields?.[fieldName]
            if (fieldDef?.system) {
              initialData[fieldName] = record[fieldName]
            } else {
              initialData[fieldName] = record.data?.[fieldName]
            }
          })
        })
        setFormData(initialData)
      }
    }
  }
  
  const handleSave = async () => {
    await save(formData)
    if (!isCreating) {
      setSearchParams({})
    } else {
      window.location.href = `/spine-framework/admin/runtime/${entity}`
    }
  }
  
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete this ${config?.entity?.slice(0, -1) || 'record'}?`)) {
      await deleteRecord()
      window.location.href = `/spine-framework/admin/runtime/${entity}`
    }
  }
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }
  
  if (error || !schema || !view) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Error: {error || 'Failed to load record or schema'}</p>
          <Button onClick={refetch} variant="outline" className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <DataDetailHeader
        entity={config.entity}
        icon={config.icon}
        title={isCreating ? `New ${config.entity.slice(0, -1)}` : recordTitle}
        isEditing={isEditing}
        isCreating={isCreating}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={!isCreating ? handleDelete : undefined}
        saving={saving}
        deleting={deleting}
      />
      
      <SchemaDetailForm
        schema={schema}
        view={view}
        record={record}
        isEditing={isEditing}
        isCreating={isCreating}
        permissions={fieldPermissions}
        formData={formData}
        onFieldChange={handleFieldChange}
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a detail/edit page for a runtime entity record using its design schema and the useEntityRecord hook.'; No verified external callers; imports: .framework/src/hooks/useEntityRecord.ts,.framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataDetailPage.tsx:datadetailpage:function"]