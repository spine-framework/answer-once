// CIL[BEGIN stable_id="~/.framework/src/hooks/useSchemaRecord.ts:module_header:module_header"]
// CIL[DOC-MACRO purpose="Provides React hooks and TypeScript interfaces for managing schema records and type selection in the Spine framework UI."]
// CIL[DOC-RESPONSIBILITY responsibility="Define shared data shapes and reusable hooks for schema record editing and type selection."]
// CIL[DOC-CONTEXT module="framework hooks" layer="ui" related_files=".framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Module-level header; no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework-ui"]
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import { FieldDefinition, ItemType } from '../types/types'

// CIL[DOC-VECTOR type="context" content="purpose='Provides React hooks and TypeScript interfaces for managing schema records and type selection in the Spine framework UI.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useSchemaRecord.ts:module_header:module_header"]







// CIL[BEGIN stable_id="~/.framework/src/hooks/useSchemaRecord.ts:schematype:interface"]
// CIL[DOC-MACRO purpose="Describe the shape of a schema type definition."]
// CIL[DOC-RESPONSIBILITY responsibility="Strongly type schema type metadata including design schema fields."]
// CIL[DOC-CONTEXT module="framework hooks" layer="ui" related_files=".framework/src/hooks/useSchemaRecord.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="SchemaType interface" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Interface with optional and required fields for a type definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface SchemaType {
  id: string
  name: string
  slug: string
  kind?: string
  icon?: string
  color?: string
  app_id?: string
  design_schema: ItemType['design_schema']
}
// CIL[DOC-VECTOR type="context" content="purpose='Describe the shape of a schema type definition.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useSchemaRecord.ts:schematype:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useSchemaRecord.ts:schemarecord:interface"]
// CIL[DOC-MACRO purpose="Describe a runtime record of a schema type."]
// CIL[DOC-RESPONSIBILITY responsibility="Type the data container that holds record values and optional resolved type."]
// CIL[DOC-CONTEXT module="framework hooks" layer="ui" related_files=".framework/src/hooks/useSchemaRecord.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="SchemaRecord interface" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Interface includes dynamic key index for legacy field access." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface SchemaRecord {
  id: string
  type_id?: string
  type?: SchemaType
  data: Record<string, any>
  [key: string]: any
}
// CIL[DOC-VECTOR type="context" content="purpose='Describe a runtime record of a schema type.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useSchemaRecord.ts:schemarecord:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useSchemaRecord.ts:useschemarecordoptions:interface"]
// CIL[DOC-MACRO purpose="Configure the useSchemaRecord hook."]
// CIL[DOC-RESPONSIBILITY responsibility="Type the required kind argument for type resolution."]
// CIL[DOC-CONTEXT module="framework hooks" layer="ui" related_files=".framework/src/hooks/useSchemaRecord.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="UseSchemaRecordOptions interface" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Single-property options interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface UseSchemaRecordOptions {
  typeApiKind: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Configure the useSchemaRecord hook.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useSchemaRecord.ts:useschemarecordoptions:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useSchemaRecord.ts:useschemarecordresult:interface"]
// CIL[DOC-MACRO purpose="Return value shape of the useSchemaRecord hook."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose record data, field definitions, setters, and metadata to consumers."]
// CIL[DOC-CONTEXT module="framework hooks" layer="ui" related_files=".framework/src/hooks/useSchemaRecord.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="UseSchemaRecordResult interface" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Return object for useSchemaRecord." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface UseSchemaRecordResult {
  fields: FieldDefinition[]
  data: Record<string, any>
  setData: (data: Record<string, any>) => void
  setField: (name: string, value: any) => void
  schemaType: SchemaType | null
  loading: boolean
  error: string | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Return value shape of the useSchemaRecord hook.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useSchemaRecord.ts:useschemarecordresult:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useSchemaRecord.ts:useschemarecord:function"]
// CIL[DOC-MACRO purpose="Manage local record data state and default values from a schema type."]
// CIL[DOC-RESPONSIBILITY responsibility="Synchronize record data with schema defaults and expose field setters."]
// CIL[DOC-CONTEXT module="framework hooks" layer="ui" related_files=".framework/src/hooks/useSchemaRecord.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="record: SchemaRecord | null, schemaType: SchemaType | null" outputs="UseSchemaRecordResult" errors="Returns null schemaType and empty data on missing inputs" side_effects="Calls React setState during initial sync and field updates"]
// CIL[DOC-MICRO logic_summary="Initializes data from record and applies per-field defaults from schemaType.design_schema.fields; exposes setData and setField callbacks." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useSchemaRecord(
  record: SchemaRecord | null,
  schemaType: SchemaType | null
): UseSchemaRecordResult {
  const [data, setDataState] = useState<Record<string, any>>({})

  const recordId = record?.id ?? null
  const schemaTypeId = schemaType?.id ?? null

  useEffect(() => {
    if (!record) return

    const base = record.data ? { ...record.data } : {}

    if (schemaType?.design_schema?.fields) {
      for (const [name, field] of Object.entries(schemaType.design_schema.fields)) {
        if (base[name] === undefined && (field as any).defaultValue !== undefined) {
          base[name] = (field as any).defaultValue
        }
      }
    }

    setDataState(base)
  }, [recordId, schemaTypeId])

  const setData = useCallback((newData: Record<string, any>) => {
    setDataState(newData)
  }, [])

  const setField = useCallback((name: string, value: any) => {
    setDataState(prev => ({ ...prev, [name]: value }))
  }, [])

  const fields: FieldDefinition[] = schemaType?.design_schema?.fields
    ? Object.entries(schemaType.design_schema.fields).map(([name, field]) => ({ ...field, name }))
    : []

  return {
    fields,
    data,
    setData,
    setField,
    schemaType,
    loading: false,
    error: null
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Manage local record data state and default values from a schema type.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useSchemaRecord.ts:useschemarecord:function"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useSchemaRecord.ts:usetypeselectionresult:interface"]
// CIL[DOC-MACRO purpose="Return value shape of the useTypeSelection hook."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose loaded types, selected type, and selection controls."]
// CIL[DOC-CONTEXT module="framework hooks" layer="ui" related_files=".framework/src/hooks/useSchemaRecord.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="UseTypeSelectionResult interface" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Return object for useTypeSelection." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface UseTypeSelectionResult {
  types: SchemaType[]
  selectedType: SchemaType | null
  selectedTypeId: string
  setSelectedTypeId: (id: string) => void
  loading: boolean
  error: string | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Return value shape of the useTypeSelection hook.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useSchemaRecord.ts:usetypeselectionresult:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useSchemaRecord.ts:usetypeselection:function"]
// CIL[DOC-MACRO purpose="Load and select a schema type by kind for the current context."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch active types from the API and maintain selection state."]
// CIL[DOC-CONTEXT module="framework hooks" layer="ui" related_files=".framework/src/hooks/useSchemaRecord.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="kind: string" outputs="UseTypeSelectionResult" errors="Sets error state on API failures" side_effects="Fetches /api/types on mount and kind changes; uses React state"]
// CIL[DOC-MICRO logic_summary="Fetches active types for a kind, tracks selected type ID, and memoizes the selected type." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useTypeSelection(kind: string): UseTypeSelectionResult {
  const [types, setTypes] = useState<SchemaType[]>([])
  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiFetch(`/api/types?action=list&kind=${kind}&is_active=true`)
      .then(r => r.json())
      .then(result => {
        if (!cancelled) {
          setTypes(result.data || [])
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Failed to load types')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [kind])

  const selectedType = types.find(t => t.id === selectedTypeId) ?? null

  return { types, selectedType, selectedTypeId, setSelectedTypeId, loading, error }
}
// CIL[DOC-VECTOR type="context" content="purpose='Load and select a schema type by kind for the current context.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useSchemaRecord.ts:usetypeselection:function"]
