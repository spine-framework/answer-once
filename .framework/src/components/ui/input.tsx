// CIL[BEGIN stable_id="~/.framework/src/components/ui/input.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/input.tsx"]




import * as React from "react"

import { cn } from "@/lib/utils"
// CIL[DOC-MACRO purpose="Shadcn/UI form input component"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose a styled, accessible Input component for the design system"]
// CIL[DOC-CONTEXT module="components/ui" layer="component" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-VECTOR type="context" content="purpose='Shadcn/UI form input component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input.tsx:Input:component" type="component" identity="Input" parent="~/.framework/src/components/ui/input.tsx"]
// CIL[DOC-MACRO purpose="Render a styled HTML input with forwarded props and optional className"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an accessible input element with merged Tailwind classes"]
// CIL[DOC-CONTEXT module="components/ui" layer="component" related_files=".framework/src/components/ui/input.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, type?: string, props: React.ComponentProps<'input'>" outputs="JSX input element" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Destructure className and type, spread remaining props onto a styled input with data-slot and cn()" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled HTML input with forwarded props and optional className'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input.tsx:Input:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/input.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/input.tsx"]
// CIL[DOC-MACRO purpose="Named export for the Input component"]
// CIL[DOC-RESPONSIBILITY responsibility="Re-export Input for consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="component" related_files=".framework/src/components/ui/input.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named export { Input }" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports the local Input function for use in other modules" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
export { Input }
// CIL[DOC-VECTOR type="context" content="purpose='Named export for the Input component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input.tsx:exports:variable"]
