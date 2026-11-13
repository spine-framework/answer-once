/**
 * @module   DataDetailPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides the DataDetailPage component, which displays detailed information about a specific entity record. It integrates various UI components and hooks to fetch and manage the entity's data, allowing users to view and edit details seamlessly.
 * INVARIANT: The entity record must exist for the page to render correctly.
 *
 * @seeAlso useEntityRecord (fetches the entity data needed for display).
 * @seeAlso DataDetailHeader (renders the header for the detail page).
 * @seeAlso SchemaDetailForm (provides the form for editing entity details).
 *
 * @cil-generated
 */












import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEntityRecord } from '../../hooks/useEntityRecord'
import { DataDetailHeader } from './DataDetailHeader'
import { SchemaDetailForm } from './SchemaDetailForm'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

















/**
 * The DataDetailPage component manages the display and editing of detailed records for various entities in the application. It handles navigation, data fetching, and form state management based on the entity type and record ID.
 *
 * @macro       Component responsible for rendering and managing entity detail views.
 * @micro       Utilizes React hooks for state management and side effects, and dynamically configures based on entity parameters.
 * @outputSpec  JSX.Element
 * @sideEffects Fetches data from the API, updates URL search parameters, and navigates to different routes.
 * @stability   internal
 * @calls       useNavigate, useParams, useSearchParams, useEntityRecord
 * @cil-generated
 */
export function DataDetailPage() {
  const navigate = useNavigate()
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
      navigate(`/spine-framework/admin/runtime/${entity}`)
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
      navigate(`/spine-framework/admin/runtime/${entity}`)
    }
  }
  
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete this ${config?.entity?.slice(0, -1) || 'record'}?`)) {
      await deleteRecord()
      navigate(`/spine-framework/admin/runtime/${entity}`)
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






