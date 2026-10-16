// CIL[BEGIN stable_id="~/.framework/src/components/shared/SchemaFields.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provide the module-level imports for the SchemaFields shared component"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React, the FieldDefinition type, and the FieldRenderer helper"]
// CIL[DOC-CONTEXT module="components/shared" layer="presentation" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, the FieldDefinition type from types, and the FieldRenderer helper for rendering schema fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

import React from 'react'
import { FieldDefinition } from '../../types/types'
import { FieldRenderer } from './FieldRenderer'
// CIL[DOC-VECTOR type="context" content="purpose='Provide the module-level imports for the SchemaFields shared component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/SchemaFields.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafieldsprops:interface" type="interface" identity="SchemaFieldsProps" parent="module_header"]
// CIL[DOC-MACRO purpose="Define the props contract for the SchemaFields component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the typed shape of props accepted by the SchemaFields function"]
// CIL[DOC-CONTEXT module="components/shared" layer="presentation" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SchemaFieldsProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines an interface with fields, data, onChange, readonly, errors, twoColumn and displayTypes props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface SchemaFieldsProps {
  fields: FieldDefinition[]
  data: Record<string, any>
  onChange?: (name: string, value: any) => void
  readonly?: boolean
  errors?: Record<string, string>
  twoColumn?: boolean
  displayTypes?: Record<string, string>
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the props contract for the SchemaFields component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafieldsprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafields:function" type="function" identity="SchemaFields" parent="module_header"]
// CIL[DOC-MACRO purpose="Render a grid or list of schema fields for a record"]
// CIL[DOC-RESPONSIBILITY responsibility="Filter valid fields, resolve values, and render per-field SchemaField children"]
// CIL[DOC-CONTEXT module="components/shared" layer="presentation" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="fields FieldDefinition[], data Record<string, any>, onChange function, readonly boolean, errors Record<string, string>, twoColumn boolean, displayTypes Record<string, string>" outputs="JSX.Element | null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Guard for empty fields, render a two-column or single-column container, and map filtered fields to SchemaField with resolved values" notable_decisions="['System fields read from data[name], non-system fields fall back from data.data[name] to data[name]']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function SchemaFields({
  fields,
  data,
  onChange,
  readonly = false,
  errors = {},
  twoColumn = true,
  displayTypes = {}
}: SchemaFieldsProps) {
  if (!fields || fields.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">No schema fields defined for this type.</p>
    )
  }

  return (
    <div className={twoColumn ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
      {fields.filter(f => !!f.name).map((field) => {
        const name = field.name!
        return (
          <SchemaField
            key={name}
            field={field}
            value={field.system ? data[name] : (data.data?.[name] ?? data[name])}
            onChange={onChange}
            readonly={readonly || field.readonly}
            error={errors[name]}
            displayType={displayTypes[name]}
          />
        )
      })}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a grid or list of schema fields for a record'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafields:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafieldprops:interface" type="interface" identity="SchemaFieldProps" parent="module_header"]
// CIL[DOC-MACRO purpose="Define the props contract for the SchemaField helper"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the typed shape of props accepted by the SchemaField function"]
// CIL[DOC-CONTEXT module="components/shared" layer="presentation" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SchemaFieldProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines an interface with field, value, onChange, readonly, error and displayType props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface SchemaFieldProps {
  field: FieldDefinition
  value: any
  onChange?: (name: string, value: any) => void
  readonly?: boolean
  error?: string
  displayType?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the props contract for the SchemaField helper'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafieldprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafield:function" type="function" identity="SchemaField" parent="module_header"]
// CIL[DOC-MACRO purpose="Render a single schema field using FieldRenderer"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap FieldRenderer with the field definition, resolved value, and conditional change handler"]
// CIL[DOC-CONTEXT module="components/shared" layer="presentation" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="field FieldDefinition, value any, onChange function, readonly boolean, error string, displayType string" outputs="FieldRenderer JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compute an onChange callback for non-readonly fields and delegate rendering to FieldRenderer" notable_decisions="['Only invokes onChange when field.name is defined']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function SchemaField({ field, value, onChange, readonly, error, displayType }: SchemaFieldProps) {
  return (
    <FieldRenderer
      field={field}
      value={value}
      onChange={readonly ? undefined : (val) => field.name && onChange?.(field.name, val)}
      readonly={readonly}
      error={error}
      displayType={displayType}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a single schema field using FieldRenderer'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafield:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafielddisplay:function" type="function" identity="SchemaFieldDisplay" parent="module_header"]
// CIL[DOC-MACRO purpose="Display a read-only field label and formatted value pair"]
// CIL[DOC-RESPONSIBILITY responsibility="Format the field value and render a definition list item"]
// CIL[DOC-CONTEXT module="components/shared" layer="presentation" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="field FieldDefinition, value any" outputs="JSX definition list item" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compute a display value via formatFieldValue and render a flex row with label and value" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function SchemaFieldDisplay({
  field,
  value
}: {
  field: FieldDefinition
  value: any
}) {
  const displayValue = formatFieldValue(field, value)

  return (
    <div className="flex justify-between items-start py-2">
      <dt className="text-xs text-slate-500 font-medium flex-shrink-0 mr-4">
        {field.label || field.name}:
      </dt>
      <dd className="text-sm text-slate-900 text-right">
        {displayValue}
      </dd>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Display a read-only field label and formatted value pair'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/SchemaFields.tsx:schemafielddisplay:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/SchemaFields.tsx:formatfieldvalue:function" type="function" identity="formatFieldValue" parent="module_header"]
// CIL[DOC-MACRO purpose="Format a field value for read-only display based on its data_type"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert null, boolean, date, select, multiselect, json, url and other values into a display-friendly React node"]
// CIL[DOC-CONTEXT module="components/shared" layer="presentation" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/shared/SchemaFields.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="field FieldDefinition, value any" outputs="React.ReactNode" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Handle missing values then switch on data_type to format booleans, dates, select options, arrays, json, urls and defaults" notable_decisions="['Booleans render as Yes/No, null or empty values render as an em dash, and select options look up labels from field.options']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function formatFieldValue(field: FieldDefinition, value: any): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-400 italic">—</span>
  }

  switch (field.data_type) {
    case 'boolean':
    case 'checkbox':
      return value ? 'Yes' : 'No'

    case 'date':
      try {
        return new Date(value).toLocaleDateString()
      } catch {
        return String(value)
      }

    case 'datetime':
      try {
        return new Date(value).toLocaleString()
      } catch {
        return String(value)
      }

    case 'select': {
      const option = field.options?.find(o => typeof o === 'object' && o.value === value)
      return option && typeof option === 'object' ? option.label : String(value)
    }

    case 'multiselect': {
      if (!Array.isArray(value)) return String(value)
      return value.map(v => {
        const option = field.options?.find(o => typeof o === 'object' && o.value === v)
        return option && typeof option === 'object' ? option.label : v
      }).join(', ')
    }

    case 'json':
      return (
        <pre className="text-xs bg-slate-50 rounded p-2 max-w-xs overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      )

    case 'url':
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {value}
        </a>
      )

    default:
      return String(value)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Format a field value for read-only display based on its data_type'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/SchemaFields.tsx:formatfieldvalue:function"]
