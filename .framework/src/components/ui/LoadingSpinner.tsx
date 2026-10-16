// CIL[BEGIN stable_id="~/.framework/src/components/ui/LoadingSpinner.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Import React, the Loader2 icon, and the cn utility to support the LoadingSpinner UI component."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide module-level imports for the LoadingSpinner component and its props interface."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports the React, Loader2, and cn dependencies required by the LoadingSpinner component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
// CIL[DOC-VECTOR type="context" content="purpose='Import React, the Loader2 icon, and the cn utility to support the LoadingSpinner UI component.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/LoadingSpinner.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/LoadingSpinner.tsx:LoadingSpinnerProps:interface" type="interface" identity="LoadingSpinnerProps" parent="~/.framework/src/components/ui/LoadingSpinner.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Declare the typed props accepted by the LoadingSpinner component."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the className and size prop types for LoadingSpinner."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/LoadingSpinner.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="LoadingSpinnerProps interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares an interface with an optional className string and an optional size union of sm, md, or lg." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}
// CIL[DOC-VECTOR type="context" content="purpose='Declare the typed props accepted by the LoadingSpinner component.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/LoadingSpinner.tsx:LoadingSpinnerProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/LoadingSpinner.tsx:loadingspinner:function" type="function" identity="loadingspinner" parent="~/.framework/src/components/ui/LoadingSpinner.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an animated loading spinner using the Loader2 icon with configurable size and className."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a spinning Loader2 icon sized according to the size prop and combined with the className prop."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/LoadingSpinner.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="LoadingSpinnerProps { className?: string, size?: 'sm' | 'md' | 'lg' }" outputs="React element: animated Loader2 icon" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects Tailwind size classes based on the size prop, then renders a Loader2 icon with animate-spin and merged class names." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        className
      )}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an animated loading spinner using the Loader2 icon with configurable size and className.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/LoadingSpinner.tsx:loadingspinner:function"]