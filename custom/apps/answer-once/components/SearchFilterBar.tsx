// CIL[BEGIN stable_id="~/custom/apps/answer-once/components/SearchFilterBar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Search input with icon for list filtering"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a controlled search input with a magnifier icon"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/components/SearchFilterBar.tsx" layer="custom_app" related_files=".framework/src/components/ui/input.tsx"]
// CIL[DOC-CONTRACT inputs="placeholder?, value, onChange, onKeyDown?, children?" outputs="JSX input wrapper" errors="none" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Wraps Input with Search icon and optional children" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@core/components/ui/input'
// CIL[END stable_id="~/custom/apps/answer-once/components/SearchFilterBar.tsx:module_header:module_header"]

interface SearchFilterBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  children?: React.ReactNode
}

export function SearchFilterBar({ placeholder = 'Search…', value, onChange, onKeyDown, children }: SearchFilterBarProps) {
  return (
    <div className="relative flex-1">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="pl-9 h-9"
      />
      {children}
    </div>
  )
}
