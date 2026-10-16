// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityRecord.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-MACRO purpose="React hook for fetching and managing a single entity record"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares module imports and exposes the useEntityRecord hook for record CRUD and permission handling"]
// CIL[DOC-CONTEXT module="useEntityRecord" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets up React and API imports used by the useEntityRecord hook." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import { useCallback } from 'react'
import { useApi, useMutation } from './useApi'
import { apiFetch } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
// CIL[DOC-VECTOR type="context" content="purpose='React hook for fetching and managing a single entity record'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityRecord.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityRecord.ts:fieldpermissions:interface" type="interface" identity="fieldpermissions" parent="~/.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-MACRO purpose="Field-level read and write permission map"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the shape of per-field permissions with read and write booleans"]
// CIL[DOC-CONTEXT module="useEntityRecord" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/hooks/useEntityRecord.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FieldPermissions object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps a field name to an object containing read and write flags." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FieldPermissions {
  [key: string]: { read: boolean; write: boolean }
}
// CIL[DOC-VECTOR type="context" content="purpose='Field-level read and write permission map'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityRecord.ts:fieldpermissions:interface"]


// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityRecord.ts:MinimalEntityConfig:interface" type="interface" identity="MinimalEntityConfig" parent="~/.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-MACRO purpose="Minimal configuration shape for an entity"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the configuration required to drive entity CRUD and API action overrides"]
// CIL[DOC-CONTEXT module="useEntityRecord" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/hooks/useEntityRecord.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="MinimalEntityConfig object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines entity metadata, icon, display field, and optional API action overrides." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface MinimalEntityConfig {
  entity: string
  typeSlug?: string
  icon: string
  displayField: string
  api: {
    endpoint: string
    getAction?: string
    createAction?: string
    updateAction?: string
    deleteAction?: string
  }
  softDelete?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Minimal configuration shape for an entity'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityRecord.ts:MinimalEntityConfig:interface"]


// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityRecord.ts:UseEntityRecordReturn:interface" type="interface" identity="UseEntityRecordReturn" parent="~/.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-MACRO purpose="Return shape for useEntityRecord"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the object returned by the useEntityRecord hook including state, schema, permissions, and callbacks"]
// CIL[DOC-CONTEXT module="useEntityRecord" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/hooks/useEntityRecord.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="UseEntityRecordReturn object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exposes record state, schema, field permissions, loading and error flags, and save/delete mutators." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UseEntityRecordReturn {
  record: any
  schema: any
  fieldPermissions: FieldPermissions
  loading: boolean
  error: string | null
  refetch: () => void
  save: (data: any) => Promise<void>
  delete: () => Promise<void>
  saving: boolean
  deleting: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Return shape for useEntityRecord'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityRecord.ts:UseEntityRecordReturn:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityRecord.ts:useEntityRecord:hook" type="function" identity="useEntityRecord" parent="~/.framework/src/hooks/useEntityRecord.ts"]
// CIL[DOC-MACRO purpose="Fetch, save, and delete a single runtime entity record"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a React hook that loads a record, derives schema and field permissions, and exposes save and delete mutations"]
// CIL[DOC-CONTEXT module="useEntityRecord" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/hooks/useEntityRecord.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="entity: string, id: string | undefined, config: MinimalEntityConfig | null" outputs="UseEntityRecordReturn" errors="Throws on failed API requests; returns error string from useApi" side_effects="Calls apiFetch for GET, PATCH, POST, and DELETE requests via useMutation"]
// CIL[DOC-MICRO logic_summary="Fetches record by ID when present, derives permissions from user roles and design schema, and performs create/update/delete via useMutation." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useEntityRecord(
  entity: string,
  id: string | undefined,
  config: MinimalEntityConfig | null
): UseEntityRecordReturn {
  const { user } = useAuth()
  
  const endpoint = config?.api?.endpoint || entity
  const getAction = config?.api?.getAction || 'get'
  const createAction = config?.api?.createAction || 'create'
  const updateAction = config?.api?.updateAction || 'update'
  const deleteAction = config?.api?.deleteAction || 'delete'
  
  const fetchRecord = useCallback(async () => {
    if (!id) return null
    
    const params = new URLSearchParams()
    params.append('action', getAction)
    params.append('entity', entity)
    params.append('id', id)
    
    const response = await apiFetch(`/api/${endpoint}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${entity}: ${response.statusText}`)
    }
    
    const result = await response.json()
    return result.data || result
  }, [entity, id, endpoint, getAction])
  
  const { data: record, loading, error, refetch } = useApi<any>(fetchRecord, {
    immediate: !!id
  })
  
  const schema = record?.design_schema || record?.type?.design_schema || {}
  
  const calculatePermissions = (): FieldPermissions => {
    const permissions: FieldPermissions = {}
    
    const isSystemAdmin = user?.roles?.includes('system_admin')
    
    const recordSchema = record?.design_schema?.fields
    if (!recordSchema) return permissions
    
    Object.entries(recordSchema).forEach(([fieldName, fieldSchema]: [string, any]) => {
      if (isSystemAdmin) {
        permissions[fieldName] = { read: true, write: true }
      } else {
        const fieldPerms = fieldSchema?.permissions || {}
        
        const canRead = fieldPerms.read?.some((role: string) => 
          user?.roles?.includes(role)
        ) ?? true
        
        const canWrite = fieldPerms.write?.some((role: string) => 
          user?.roles?.includes(role)
        ) ?? true
        
        permissions[fieldName] = { read: canRead, write: canWrite }
      }
    })
    
    return permissions
  }
  
  const fieldPermissions = calculatePermissions()
  
  const saveMutation = useMutation(
    async (data: any) => {
      const systemData: Record<string, any> = {}
      const customData: Record<string, any> = {}
      
      Object.entries(data).forEach(([key, value]) => {
        const fieldDef = record?.design_schema?.fields?.[key]
        if (fieldDef?.system) {
          systemData[key] = value
        } else {
          customData[key] = value
        }
      })
      
      const saveData = {
        ...systemData,
        data: Object.keys(customData).length > 0 ? customData : undefined
      }
      
      if (id) {
        const params = new URLSearchParams()
        params.append('action', updateAction)
        params.append('entity', entity)
        params.append('id', id)
        
        const response = await apiFetch(
          `/api/${endpoint}?${params.toString()}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saveData)
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to update ${entity}: ${response.statusText}`)
        }
        
        return response.json()
      } else {
        const createData = { entity, type_slug: config?.typeSlug, ...saveData }
        
        const params = new URLSearchParams()
        params.append('action', createAction)
        params.append('entity', entity)
        
        const response = await apiFetch(
          `/api/${endpoint}?${params.toString()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createData)
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to create ${entity}: ${response.statusText}`)
        }
        
        return response.json()
      }
    },
    {
      onSuccess: () => {
        if (id) {
          refetch()
        }
      }
    }
  )
  
  const deleteMutation = useMutation(
    async () => {
      if (!id) throw new Error('Cannot delete: no ID provided')
      
      const params = new URLSearchParams()
      params.append('action', deleteAction)
      params.append('entity', entity)
      params.append('id', id)
      
      const response = await apiFetch(
        `/api/${endpoint}?${params.toString()}`,
        {
          method: 'DELETE'
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${entity}: ${response.statusText}`)
      }
      
      return response.json()
    }
  )
  
  return {
    record,
    schema,
    fieldPermissions,
    loading,
    error,
    refetch,
    save: saveMutation.mutate,
    delete: deleteMutation.mutate,
    saving: saveMutation.loading,
    deleting: deleteMutation.loading
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch, save, and delete a single runtime entity record'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityRecord.ts:useEntityRecord:hook"]
