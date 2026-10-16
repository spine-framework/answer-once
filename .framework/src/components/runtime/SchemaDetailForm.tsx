// CIL[BEGIN stable_id="~/.framework/src/components/runtime/SchemaDetailForm.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="React component for rendering schema-driven detail forms"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines module imports for SchemaDetailForm and related types/components"]
// CIL[DOC-CONTEXT module="runtime" layer="frontend" related_files=".framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports DesignSchema, detail view types, and the shared SchemaFields component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import { DesignSchema, DetailView, DetailViewSection, FieldDefinition } from '../../types/types'
import { SchemaFields } from '../shared/SchemaFields'

// CIL[DOC-VECTOR type="context" content="purpose='React component for rendering schema-driven detail forms'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/SchemaFields.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/SchemaDetailForm.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/runtime/SchemaDetailForm.tsx:schemadetailformprops:interface" type="interface" identity="schemadetailformprops" parent="~/.framework/src/components/runtime/SchemaDetailForm.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Props interface for SchemaDetailForm"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the input contract for SchemaDetailForm"]
// CIL[DOC-CONTEXT module="runtime" layer="frontend" related_files=".framework/src/components/runtime/SchemaDetailForm.tsx,.framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SchemaDetailFormProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines props including schema, view, record, editing flags, permissions, form data, and onFieldChange callback." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface SchemaDetailFormProps {
  schema: DesignSchema
  view: DetailView
  record: any
  isEditing: boolean
  isCreating: boolean
  permissions: Record<string, { read: boolean; write: boolean }>
  formData: Record<string, any>
  onFieldChange: (key: string, value: any) => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Props interface for SchemaDetailForm'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/SchemaFields.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/SchemaDetailForm.tsx:schemadetailformprops:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/runtime/SchemaDetailForm.tsx:schemadetailform:function" type="function" identity="schemadetailform" parent="~/.framework/src/components/runtime/SchemaDetailForm.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a detail form from a design schema and view"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders schema-driven detail sections and field controls"]
// CIL[DOC-CONTEXT module="runtime" layer="frontend" related_files=".framework/src/components/runtime/SchemaDetailForm.tsx,.framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="schema, view, record, isEditing, isCreating, permissions, formData, onFieldChange" outputs="JSX.Element" errors="none" side_effects="renders UI"]
// CIL[DOC-MICRO logic_summary="Maps view sections to FieldDefinition arrays, builds display_type overrides, and delegates rendering to SchemaFields." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function SchemaDetailForm({
  schema,
  view,
  record,
  isEditing,
  isCreating,
  permissions,
  formData,
  onFieldChange
}: SchemaDetailFormProps) {
  const renderSection = (section: DetailViewSection, sectionIndex: number) => {
    const fieldNames = Array.isArray(section.fields) ? section.fields : Object.keys(section.fields || {})
    const sectionFields = fieldNames.map((fieldName: string) => {
      const fieldDef = schema.fields[fieldName]
      if (!fieldDef) return null

      return {
        name: fieldName,
        label: fieldDef.label,
        data_type: fieldDef.data_type,
        required: fieldDef.required,
        validation: fieldDef.validation,
        options: fieldDef.options,
        permissions: fieldDef.permissions,
        system: fieldDef.system
      } as FieldDefinition
    }).filter((field): field is NonNullable<typeof field> => field !== null)

    // Build display_type map from view config — keeps field definitions clean
    const displayTypes: Record<string, string> = {}
    if (!Array.isArray(section.fields)) {
      Object.entries(section.fields || {}).forEach(([fieldName, viewConfig]: [string, any]) => {
        if (viewConfig.display_type) {
          displayTypes[fieldName] = viewConfig.display_type
        }
      })
    }

    if (sectionFields.length === 0) return null

    return (
      <div key={sectionIndex} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          {section.title}
        </h3>
        
        <SchemaFields
          fields={sectionFields}
          data={isCreating || isEditing ? formData : (record || {})}
          readonly={!isEditing}
          twoColumn={false}
          onChange={onFieldChange}
          displayTypes={displayTypes}
        />
      </div>
    )
  }

  if (!view.sections || view.sections.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-slate-500">No fields configured for this view</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {view.sections.map((section, index) => renderSection(section, index))}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a detail form from a design schema and view'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/SchemaFields.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/SchemaDetailForm.tsx:schemadetailform:function"]
