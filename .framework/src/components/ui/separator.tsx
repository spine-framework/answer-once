// CIL[BEGIN stable_id="~/.framework/src/components/ui/separator.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/separator.tsx"]
// CIL[DOC-MACRO purpose="Shared separator UI component module header and imports"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports React, Radix UI Separator primitive, and the cn utility"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module-level dependency imports for the Separator component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Shared separator UI component module header and imports'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/separator.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/separator.tsx:separator:function" type="function" identity="separator" parent="~/.framework/src/components/ui/separator.tsx"]
// CIL[DOC-MACRO purpose="Render a visual separator line with configurable orientation and styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a styled Separator component that wraps Radix UI's primitive, applying default horizontal and decorative behavior and merging CSS classes"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, orientation: 'horizontal'|'vertical', decorative: boolean, props: React.ComponentProps<typeof SeparatorPrimitive.Root>" outputs="JSX element rendering a Radix UI separator" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies Tailwind classes to render a one-pixel border; orientation defaults to horizontal and decorative to true; merges the optional className via cn" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a visual separator line with configurable orientation and styling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/separator.tsx:separator:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/separator.tsx:separator_exports:exports" type="exports" identity="separator_exports" parent="~/.framework/src/components/ui/separator.tsx"]
// CIL[DOC-MACRO purpose="Export the local Separator component for consumers"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the Separator function as a named export"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named export Separator" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export of the Separator UI component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Separator }
// CIL[DOC-VECTOR type="context" content="purpose='Export the local Separator component for consumers'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/separator.tsx:separator_exports:exports"]
