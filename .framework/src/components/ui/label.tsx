// CIL[BEGIN stable_id="~/.framework/src/components/ui/label.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/label.tsx"]




import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-MACRO purpose="Shadcn/UI form label wrapper around Radix UI"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose a styled, accessible Label component for the design system"]
// CIL[DOC-CONTEXT module="components/ui" layer="component" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module imports and named exports" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, the Radix UI Label primitive, and the cn utility" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-VECTOR type="context" content="purpose='Shadcn/UI form label wrapper around Radix UI'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/label.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/label.tsx:Label:component" type="component" identity="Label" parent="~/.framework/src/components/ui/label.tsx"]
// CIL[DOC-MACRO purpose="Render a styled form label with optional className"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a Radix UI Label primitive with merged Tailwind classes and forwarded props"]
// CIL[DOC-CONTEXT module="components/ui" layer="component" related_files=".framework/src/components/ui/label.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, props: ComponentProps<typeof LabelPrimitive.Root>" outputs="JSX label element" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Destructure className and remaining props, spread them onto LabelPrimitive.Root with a cn() class string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled form label with optional className'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/label.tsx:Label:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/label.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/label.tsx"]
// CIL[DOC-MACRO purpose="Named export for the Label component"]
// CIL[DOC-RESPONSIBILITY responsibility="Re-export Label for consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="component" related_files=".framework/src/components/ui/label.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named export { Label }" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports the local Label function for use in other modules" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
export { Label }
// CIL[DOC-VECTOR type="context" content="purpose='Named export for the Label component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/label.tsx:exports:variable"]
