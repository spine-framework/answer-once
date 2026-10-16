// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataHeader.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Provide the module-level imports and dependencies for the DataHeader runtime component."]
// CIL[DOC-RESPONSIBILITY responsibility="Import React, the Button component, and the lucide-react icon library used by DataHeader."]
// CIL[DOC-CONTEXT module="runtime-data-header" layer="ui" related_files=".framework/src/components/ui/button.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported modules available to the file" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, the local Button component, and the full lucide-react icon library." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-developers"]



import React from 'react'
import { Button } from '../ui/button'
import * as Icons from 'lucide-react'


// CIL[DOC-VECTOR type="context" content="purpose='Provide the module-level imports and dependencies for the DataHeader runtime component.'; No verified external callers; imports: .framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataHeader.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataHeader.tsx:dataheaderprops:interface" type="interface" identity="DataHeaderProps" parent="none"]
// CIL[DOC-MACRO purpose="Define the prop contract for the DataHeader component."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the expected properties for rendering a DataHeader: title, icon, description, and newButtonHref."]
// CIL[DOC-CONTEXT module="runtime-data-header" layer="ui" related_files=".framework/src/components/runtime/DataHeader.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="DataHeaderProps TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares a TypeScript interface with title, icon, description, and newButtonHref fields." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface DataHeaderProps {
  title: string
  icon: string
  description: string
  newButtonHref: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the prop contract for the DataHeader component.'; No verified external callers; imports: .framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataHeader.tsx:dataheaderprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataHeader.tsx:dataheader:function" type="function" identity="DataHeader" parent="none"]
// CIL[DOC-MACRO purpose="Render a page header with an icon, title, description, and a New action button."]
// CIL[DOC-RESPONSIBILITY responsibility="Display the header for a data list page and provide a primary CTA linking to the new resource form."]
// CIL[DOC-CONTEXT module="runtime-data-header" layer="ui" related_files=".framework/src/components/runtime/DataHeader.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-CONTRACT inputs="title: string, icon: string, description: string, newButtonHref: string" outputs="Rendered JSX header with icon and button" errors="none" side_effects="sets window.location.href on button click, looks up icon from lucide-react"]
// CIL[DOC-MICRO logic_summary="Resolves a dynamic lucide-react icon component, renders a title, description, and a button labeled with the singular title." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function DataHeader({ title, icon, description, newButtonHref }: DataHeaderProps) {
  // Dynamically get the icon component
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[icon] || Icons.Box

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground capitalize">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <Button
        onClick={() => window.location.href = newButtonHref}
        className="flex items-center gap-2"
      >
        <Icons.Plus className="h-4 w-4" />
        New {title.slice(0, -1)}
      </Button>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a page header with an icon, title, description, and a New action button.'; No verified external callers; imports: .framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataHeader.tsx:dataheader:function"]