
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { useEntityRecord } from '../../hooks/useEntityRecord'
import { DataDetailHeader } from '../runtime/DataDetailHeader'
import { SchemaDetailForm } from '../runtime/SchemaDetailForm'
interface GenericDetailPageProps {
  typeSlug: string
  viewSlug?: string
  isCreating?: boolean
}


export function GenericDetailPage({ typeSlug, viewSlug, isCreating: forceCreate }: GenericDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const isCreating = forceCreate || !id
  const isEditing = searchParams.get('edit') === 'true' || isCreating

  const config = {
    entity: 'items',
    typeSlug,
    icon: 'database',
    displayField: 'title',
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
  } = useEntityRecord('items', id, config)

  // In create mode there is no record to take a stamped design_schema from —
  // resolve it from the type instead (get_type_schema RPC via /api/types).
  const [typeSchema, setTypeSchema] = useState<any>(null)
  const [schemaLoading, setSchemaLoading] = useState(false)
  useEffect(() => {
    if (!isCreating) return
    let cancelled = false
    setSchemaLoading(true)
    apiFetch(`/api/types?action=schema&kind=item&slug=${encodeURIComponent(typeSlug)}`)
      .then(async (res) => {
        const result = await res.json()
        const ds = (result.data ?? result)?.design_schema
        if (!cancelled) setTypeSchema(ds && Object.keys(ds).length ? ds : null)
      })
      .catch(() => { if (!cancelled) setTypeSchema(null) })
      .finally(() => { if (!cancelled) setSchemaLoading(false) })
    return () => { cancelled = true }
  }, [isCreating, typeSlug])

  const schema = record?.design_schema || typeSchema || null
  // nav_item `view` is a single slug shared by list + detail pages; a
  // list-shaped view (fields, no sections) must not resolve here.
  const namedView = viewSlug ? schema?.views?.[viewSlug] : null
  const resolvedDetailView = namedView && (namedView.type === 'detail' || namedView.sections)
    ? namedView
    : schema?.views?.default_detail
  const view = resolvedDetailView || null

  
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
      navigate(-1)
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
    try {
      await save(formData)
      if (isCreating) {
        navigate(-1)
      } else {
        setSearchParams({})
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecord()
        navigate(-1)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  if (loading || schemaLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-slate-500">Loading record...</p>
      </div>
    )
  }

  if (error && !isCreating) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-medium text-red-600">Error</h2>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
      </div>
    )
  }

  if (!schema) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-medium text-slate-900">No schema available</h2>
        <p className="mt-2 text-sm text-slate-500">
          {isCreating ? `No design_schema found for type "${typeSlug}".` : 'This record does not have a design_schema.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataDetailHeader
        entity="items"
        title={isCreating ? `New ${typeSlug}` : recordTitle}
        icon="database"
        isEditing={isEditing}
        isCreating={isCreating}
        saving={saving}
        deleting={deleting}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onDelete={!isCreating ? handleDelete : undefined}
      />

      {schema && view && (
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
      )}
    </div>
  )
}