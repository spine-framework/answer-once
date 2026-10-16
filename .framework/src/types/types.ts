// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:FieldDefinition:interface" type="interface" identity="FieldDefinition" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines the shape and validation rules for a single design schema field."]
// CIL[DOC-RESPONSIBILITY responsibility="Describes data types, labels, constraints, options, and permissions for a field."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FieldDefinition interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports FieldDefinition with all possible field-level configuration properties." notable_decisions="Options may be strings or labeled objects; permissions are keyed by role."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]








export interface FieldDefinition {
  data_type: 'text' | 'textarea' | 'rich_text' | 'email' | 'phone' | 'url' | 
             'number' | 'currency' | 'range' | 'date' | 'datetime' | 'boolean' | 
             'checkbox' | 'select' | 'multiselect' | 'radio' | 'color' | 
             'file' | 'image' | 'json' | 'reference' | 'address'
  label: string
  required: boolean
  system?: boolean 
  
  name?: string
  
  placeholder?: string
  description?: string
  rows?: number
  min?: number
  max?: number
  step?: number
  readonly?: boolean
  disabled?: boolean
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    step?: number
    integer?: boolean
    precision?: number
    maxSize?: number
    allowedTypes?: string[]
    maxWidth?: number
    maxHeight?: number
    currency_code?: string
    reference_kind?: string
    reference_type?: string
  }
  
  options?: (string | { value: string; label: string })[] 
  permissions?: {
    [role: string]: string[] 
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape and validation rules for a single design schema field.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:FieldDefinition:interface"]






// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:ViewFieldConfig:interface" type="interface" identity="ViewFieldConfig" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines how a field is displayed and behaves in a list or detail view."]
// CIL[DOC-RESPONSIBILITY responsibility="Specifies display type, sortability, and searchability for view columns."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ViewFieldConfig interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports ViewFieldConfig used in list/detail view field maps." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ViewFieldConfig {
  display_type: 'input' | 'textarea' | 'rich_text' | 'select' | 'multiselect' | 
                 'radio' | 'checkbox' | 'switch' | 'date_picker' | 'datetime_picker' | 
                 'color_picker' | 'file_upload' | 'image_upload' | 'range_slider' | 
                 'rating' | 'autocomplete' | 'address_form' | 'reference_picker' |
                 'text' | 'badge' | 'timestamp' | 'currency' | 'number'
  sortable?: boolean
  searchable?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines how a field is displayed and behaves in a list or detail view.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:ViewFieldConfig:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:ListView:interface" type="interface" identity="ListView" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a list view configuration for a type."]
// CIL[DOC-RESPONSIBILITY responsibility="Describes table/card/board list fields, filters, stats, sorting, and grouping."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ListView interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports ListView with fields as a record of ViewFieldConfig." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ListView {
  type: 'list'
  display: 'table' | 'card' | 'board'
  label: string
  fields: Record<string, ViewFieldConfig>
  default_sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  filters?: string[]
  stats?: Array<{
    title: string
    type: 'count' | 'filter_count'
    icon?: string
    color?: string
    filter?: Record<string, any>
  }>
  group_by?: string 
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a list view configuration for a type.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:ListView:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:DetailViewSection:interface" type="interface" identity="DetailViewSection" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a section within a detail view."]
// CIL[DOC-RESPONSIBILITY responsibility="Groups fields into titled sections for detail UIs."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DetailViewSection interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports DetailViewSection as a title and field map." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface DetailViewSection {
  title: string
  fields: Record<string, ViewFieldConfig>
  
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a section within a detail view.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:DetailViewSection:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:DetailView:interface" type="interface" identity="DetailView" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a detail view configuration for a type."]
// CIL[DOC-RESPONSIBILITY responsibility="Aggregates DetailViewSection entries into a single detail page layout."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DetailView interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports DetailView with type 'detail' and an ordered sections array." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface DetailView {
  type: 'detail'
  label: string
  sections: DetailViewSection[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a detail view configuration for a type.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:DetailView:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:View:type" type="type" identity="View" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Union of supported view kinds for a design schema."]
// CIL[DOC-RESPONSIBILITY responsibility="Distinguishes list and detail views for type rendering."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="View type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports View as ListView | DetailView." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export type View = ListView | DetailView
// CIL[DOC-VECTOR type="context" content="purpose='Union of supported view kinds for a design schema.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:View:type"]






// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:FunctionalityBindings:interface" type="interface" identity="FunctionalityBindings" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines automation, AI, embedding, integration, and constraint bindings."]
// CIL[DOC-RESPONSIBILITY responsibility="Declares pipeline, agent, embedding, integration, and constraint arrays."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FunctionalityBindings interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports FunctionalityBindings for optional schema functionality." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface FunctionalityBindings {
  pipelines?: Array<{
    pipeline_id: string
    trigger: 'manual' | 'on_create' | 'on_update' | 'on_field_change' | 'on_delete' | 'scheduled'
    field?: string 
    condition?: string 
    roles: string[]
  }>
  ai_agents?: Array<{
    agent_id: string
    capabilities: ('read' | 'summarize' | 'suggest' | 'update')[]
    trigger: 'manual' | 'on_create' | 'on_update' | 'on_field_change'
    roles: string[]
  }>
  embeddings?: Array<{
    slug: string
    fields: string[]
    model: string
    vector_column: string
    trigger: 'on_create' | 'on_update' | 'on_create_or_update'
  }>
  integrations?: Array<{
    integration_id: string
    sync: 'bidirectional' | 'inbound' | 'outbound'
    field_map: Record<string, {
      external_field: string
      direction: 'both' | 'inbound' | 'outbound' | 'none'
      transform?: string
    }>
    trigger: 'on_create' | 'on_update' | 'on_create_or_update'
  }>
  constraints?: Array<{
    type: 'unique' | 'conditional_required' | 'immutable'
    fields?: string[] 
    field?: string 
    condition?: string 
    message: string
    after?: 'create' | 'update' 
  }>
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines automation, AI, embedding, integration, and constraint bindings.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:FunctionalityBindings:interface"]






// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:DesignSchema:interface" type="interface" identity="DesignSchema" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines the complete design schema for an item type."]
// CIL[DOC-RESPONSIBILITY responsibility="Holds record permissions, field definitions, views, and functionality bindings."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DesignSchema interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports DesignSchema used by item type definitions." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface DesignSchema {
  record_permissions: {
    [role: string]: string[] 
  }
  fields: Record<string, FieldDefinition>
  views: Record<string, View>
  functionality?: FunctionalityBindings
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the complete design schema for an item type.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:DesignSchema:interface"]






// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:ItemType:interface" type="interface" identity="ItemType" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines the runtime type record including schema and ownership metadata."]
// CIL[DOC-RESPONSIBILITY responsibility="Declares item type identity, schemas, ownership, and lifecycle fields."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ItemType interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports ItemType as the core public.types table shape." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ItemType {
  id: string
  name: string
  slug: string
  kind: string
  description?: string
  icon?: string
  color?: string
  design_schema: DesignSchema
  validation_schema: {
    fields: Record<string, {
      data_type: string
      required?: boolean
      [key: string]: any 
    }>
  }
  ownership: string
  is_active: boolean
  app_id?: string
  app?: any
  created_at: string
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the runtime type record including schema and ownership metadata.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:ItemType:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:Item:interface" type="interface" identity="Item" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a runtime item record belonging to an item type."]
// CIL[DOC-RESPONSIBILITY responsibility="Holds item data, status, ownership, and audit timestamps."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Item interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports Item used by admin-data and custom app runtimes." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface Item {
  id: string
  item_type_id: string
  item_type_slug?: string
  title: string
  description?: string
  status: string
  is_active: boolean
  data: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
  account_id: string
  app_id?: string
  design_schema?: Record<string, any> 
  validation_schema?: Record<string, any> 
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a runtime item record belonging to an item type.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:Item:interface"]






// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:ValidationError:interface" type="interface" identity="ValidationError" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a field validation error."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides field name and human-readable error message."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ValidationError interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports ValidationError for form and API validation." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ValidationError {
  field: string
  message: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a field validation error.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:ValidationError:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:FormState:interface" type="interface" identity="FormState" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines reactive form state for data entry."]
// CIL[DOC-RESPONSIBILITY responsibility="Tracks data, errors, touched fields, and submission/valid state."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FormState interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports FormState for UI form components." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface FormState {
  data: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines reactive form state for data entry.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:FormState:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:PaginationParams:interface" type="interface" identity="PaginationParams" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines pagination parameters for list queries."]
// CIL[DOC-RESPONSIBILITY responsibility="Supports limit, offset, and page query options."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="PaginationParams interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports PaginationParams for list request input." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface PaginationParams {
  limit?: number
  offset?: number
  page?: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines pagination parameters for list queries.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:PaginationParams:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:SortParams:interface" type="interface" identity="SortParams" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a single sort criterion."]
// CIL[DOC-RESPONSIBILITY responsibility="Specifies field name and asc/desc direction."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SortParams interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports SortParams for list sorting." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a single sort criterion.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:SortParams:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:FilterParams:interface" type="interface" identity="FilterParams" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines an open-ended filter bag for list queries."]
// CIL[DOC-RESPONSIBILITY responsibility="Allows arbitrary key/value query filters."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FilterParams interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports FilterParams as Record<string, any>." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface FilterParams {
  [key: string]: any
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines an open-ended filter bag for list queries.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:FilterParams:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:SearchParams:interface" type="interface" identity="SearchParams" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines combined search, sort, filter, and pagination input."]
// CIL[DOC-RESPONSIBILITY responsibility="Extends PaginationParams with search, sort, and filters."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SearchParams interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports SearchParams for list/search endpoints." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface SearchParams extends PaginationParams {
  search?: string
  sort?: SortParams
  filters?: FilterParams
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines combined search, sort, filter, and pagination input.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:SearchParams:interface"]






// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:EntityColumn:interface" type="interface" identity="EntityColumn" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a column in a generic entity list table."]
// CIL[DOC-RESPONSIBILITY responsibility="Describes key, label, sortability, type, display type, and badge colors."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="EntityColumn interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports EntityColumn for GenericListPage." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface EntityColumn {
  key: string
  label: string
  sortable?: boolean
  type?: string
  display_type?: string
  badgeColors?: Record<string, string>
  maxLength?: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a column in a generic entity list table.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:EntityColumn:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:EntityStat:interface" type="interface" identity="EntityStat" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a stat card shown on a generic entity list."]
// CIL[DOC-RESPONSIBILITY responsibility="Declares count/filter_count stat metadata and optional filter."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="EntityStat interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports EntityStat for GenericListPage." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface EntityStat {
  title: string
  type: 'count' | 'filter_count'
  icon: string
  color: string
  filter?: Record<string, any>
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a stat card shown on a generic entity list.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:EntityStat:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:EntityFilter:interface" type="interface" identity="EntityFilter" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a filter control in a generic entity list."]
// CIL[DOC-RESPONSIBILITY responsibility="Specifies key, label, filter type, and enum options."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="EntityFilter interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports EntityFilter for GenericListPage." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface EntityFilter {
  key: string
  label: string
  type: 'search' | 'enum' | 'boolean'
  options?: string[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a filter control in a generic entity list.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:EntityFilter:interface"]






// CIL[BEGIN stable_id="~/.framework/src/types/types.ts:ItemProgress:interface" type="interface" identity="ItemProgress" parent="~/.framework/src/types/types.ts"]
// CIL[DOC-MACRO purpose="Defines a progress-tracking record for an item."]
// CIL[DOC-RESPONSIBILITY responsibility="Holds status, score, attempts, time spent, and related metadata."]
// CIL[DOC-CONTEXT module=".framework/src/types" layer="types" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ItemProgress interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports ItemProgress used by learning and task tracking features." notable_decisions="Fields marked optional with '?'; validation and permissions are nested sub-types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ItemProgress {
  id: string
  type_id: string
  account_id: string
  app_id: string | null
  person_id: string
  item_id: string
  title: string | null
  description: string | null
  status: 'not_started' | 'in_progress' | 'completed' | string
  score: number | null
  data: {
    attempts?: number
    time_spent?: number
    last_position?: number
    started_at?: string
    completed_at?: string
    [key: string]: any
  }
  is_active: boolean
  design_schema: Record<string, any>
  validation_schema: Record<string, any>
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a progress-tracking record for an item.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/types.ts:ItemProgress:interface"]