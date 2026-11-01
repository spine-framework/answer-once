// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/app-shell/GenericDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Imports and module setup for the generic detail page"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide dependencies for GenericDetailPage rendering"]
// CIL[DOC-CONTEXT module="app-shell" layer="framework" related_files=".framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx,.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports hooks and UI subcomponents used by the detail page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { useEntityRecord } from '../../hooks/useEntityRecord'
import { DataDetailHeader } from '../runtime/DataDetailHeader'
import { SchemaDetailForm } from '../runtime/SchemaDetailForm'
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericDetailPage.tsx:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='Imports and module setup for the generic detail page'; No verified external callers; imports: .framework/src/hooks/useEntityRecord.ts,.framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Props interface for GenericDetailPage"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the expected props for the detail page"]
// CIL[DOC-CONTEXT module="app-shell" layer="framework" related_files=".framework/src/components/app-shell/GenericDetailPage.tsx,.framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx,.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface describing typeSlug, viewSlug, and isCreating" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericDetailPage.tsx:GenericDetailPageProps:interface" type="interface" identity="GenericDetailPageProps" parent="~/.framework/src/components/app-shell/GenericDetailPage.tsx"]
interface GenericDetailPageProps {
  typeSlug: string
  viewSlug?: string
  isCreating?: boolean
}
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericDetailPage.tsx:GenericDetailPageProps:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Props interface for GenericDetailPage'; No verified external callers; imports: .framework/src/hooks/useEntityRecord.ts,.framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="Render the generic detail page for an app type"]
// CIL[DOC-RESPONSIBILITY responsibility="Display, edit, create, and delete records driven by a design schema"]
// CIL[DOC-CONTEXT module="app-shell" layer="framework" related_files=".framework/src/components/app-shell/GenericDetailPage.tsx,.framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx,.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-CONTRACT inputs="typeSlug: string, viewSlug?: string, isCreating?: boolean" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Load record with useEntityRecord, resolve detail view, initialize form data, and render DataDetailHeader and SchemaDetailForm" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericDetailPage.tsx:GenericDetailPage:component" type="component" identity="GenericDetailPage" parent="~/.framework/src/components/app-shell/GenericDetailPage.tsx"]
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
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericDetailPage.tsx:GenericDetailPage:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Render the generic detail page for an app type'; No verified external callers; imports: .framework/src/hooks/useEntityRecord.ts,.framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/runtime/SchemaDetailForm.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]