// CIL[BEGIN stable_id="~/.framework/src/components/ui/textarea.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-MACRO purpose="Provides the Textarea UI component for the design system"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React and the className utility and expose the Textarea component for use across the app"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React and the cn class-merging utility for the Textarea component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
import * as React from "react"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Provides the Textarea UI component for the design system'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/textarea.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/textarea.tsx:textarea:function" type="function" identity="textarea" parent="~/.framework/src/components/ui/textarea.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled HTML textarea element for forms"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a multi-line text input with Tailwind styling and forwarded props"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'textarea'>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps an HTML textarea with data-slot and applies utility classes including sizing, border, focus ring, and disabled/invalid states" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-md border border-input bg-input/20 px-2 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled HTML textarea element for forms'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/textarea.tsx:textarea:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/textarea.tsx:export:export" type="export" identity="export" parent="~/.framework/src/components/ui/textarea.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Re-exports the Textarea component for module consumers"]
// CIL[DOC-RESPONSIBILITY responsibility="Make the Textarea component available to other modules"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Textarea named export" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export of the Textarea component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Textarea }
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the Textarea component for module consumers'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/textarea.tsx:export:export"]
