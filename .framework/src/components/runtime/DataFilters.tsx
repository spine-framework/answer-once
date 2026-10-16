// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataFilters.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provides a filter UI component for entity data"]
// CIL[DOC-RESPONSIBILITY responsibility="Render filter controls for search, enum, and boolean fields"]
// CIL[DOC-CONTEXT module="runtime" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="filter configuration and current values" outputs="controlled filter values" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Header for DataFilters component module" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]



import { EntityFilter } from '../../types/types'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
// CIL[DOC-VECTOR type="context" content="purpose='Provides a filter UI component for entity data'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataFilters.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataFilters.tsx:datafiltersprops:interface" type="interface" identity="datafiltersprops" parent="~/.framework/src/components/runtime/DataFilters.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the props interface for DataFilters"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the expected props for filter rendering and state management"]
// CIL[DOC-CONTEXT module="runtime" layer="components" related_files=".framework/src/components/runtime/DataFilters.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="filters, values, onChange, onClear" outputs="TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Props interface for DataFilters component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface DataFiltersProps {
  filters: EntityFilter[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onClear: () => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the props interface for DataFilters'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataFilters.tsx:datafiltersprops:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataFilters.tsx:datafilters:function" type="function" identity="datafilters" parent="~/.framework/src/components/runtime/DataFilters.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders entity filter controls"]
// CIL[DOC-RESPONSIBILITY responsibility="Render search, enum, and boolean filters and propagate changes"]
// CIL[DOC-CONTEXT module="runtime" layer="components" related_files=".framework/src/components/runtime/DataFilters.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="filters, values, onChange, onClear" outputs="JSX filter UI" errors="none" side_effects="onChange callbacks"]
// CIL[DOC-MICRO logic_summary="Renders filter inputs and a clear button" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function DataFilters({ filters, values, onChange, onClear }: DataFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value })
  }
  
  const hasActiveFilters = Object.values(values).some(v => v !== undefined && v !== '' && v !== 'all')
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="sm:w-48">
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                {filter.label}
              </Label>
              
              {filter.type === 'search' && (
                <Input
                  type="text"
                  value={values[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={`Search ${filter.label.toLowerCase()}...`}
                />
              )}
              
              {filter.type === 'enum' && (
                <Select 
                  value={values[filter.key] || 'all'} 
                  onValueChange={(value) => handleFilterChange(filter.key, value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`All ${filter.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {filter.label}</SelectItem>
                    {filter.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {filter.type === 'boolean' && (
                <Select 
                  value={values[filter.key]?.toString() || 'all'}
                  onValueChange={(value) => {
                    handleFilterChange(filter.key, value === 'all' ? undefined : value === 'true')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
          
          {hasActiveFilters && (
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={onClear}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders entity filter controls'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataFilters.tsx:datafilters:function"]
