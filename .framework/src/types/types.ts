







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






export interface ViewFieldConfig {
  display_type: 'input' | 'textarea' | 'rich_text' | 'select' | 'multiselect' | 
                 'radio' | 'checkbox' | 'switch' | 'date_picker' | 'datetime_picker' | 
                 'color_picker' | 'file_upload' | 'image_upload' | 'range_slider' | 
                 'rating' | 'autocomplete' | 'address_form' | 'reference_picker' |
                 'text' | 'badge' | 'timestamp' | 'currency' | 'number'
  sortable?: boolean
  searchable?: boolean
}




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




export interface DetailViewSection {
  title: string
  fields: Record<string, ViewFieldConfig>
  
}




export interface DetailView {
  type: 'detail'
  label: string
  sections: DetailViewSection[]
}




export type View = ListView | DetailView






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






export interface DesignSchema {
  record_permissions: {
    [role: string]: string[] 
  }
  fields: Record<string, FieldDefinition>
  views: Record<string, View>
  functionality?: FunctionalityBindings
}






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






export interface ValidationError {
  field: string
  message: string
}




export interface FormState {
  data: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}




export interface PaginationParams {
  limit?: number
  offset?: number
  page?: number
}




export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}




export interface FilterParams {
  [key: string]: any
}




export interface SearchParams extends PaginationParams {
  search?: string
  sort?: SortParams
  filters?: FilterParams
}






export interface EntityColumn {
  key: string
  label: string
  sortable?: boolean
  type?: string
  display_type?: string
  badgeColors?: Record<string, string>
  maxLength?: number
}




export interface EntityStat {
  title: string
  type: 'count' | 'filter_count'
  icon: string
  color: string
  filter?: Record<string, any>
}




export interface EntityFilter {
  key: string
  label: string
  type: 'search' | 'enum' | 'boolean'
  options?: string[]
}






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