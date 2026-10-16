// CIL[BEGIN stable_id="~/.framework/src/components/ui/checkbox.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/checkbox.tsx:file"]
// CIL[DOC-MACRO purpose="shadcn/ui Checkbox component module built on Radix UI"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a styled Checkbox component and its dependencies"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, CheckboxPrimitive, cn, CheckIcon, and Checkbox component available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, Radix UI Checkbox primitive, cn utility, and CheckIcon for the Checkbox component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend"]

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui Checkbox component module built on Radix UI'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/checkbox.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/checkbox.tsx:Checkbox:component" type="component" identity="Checkbox" parent="~/.framework/src/components/ui/checkbox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Radix UI Checkbox input"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an accessible Checkbox with checked state and spread props"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/checkbox.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof CheckboxPrimitive.Root>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a CheckboxPrimitive.Root with Tailwind styling, a CheckboxPrimitive.Indicator, and a CheckIcon, spreading remaining props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Radix UI Checkbox input'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/checkbox.tsx:Checkbox:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/checkbox.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/checkbox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Public export of the Checkbox component"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the Checkbox component for external consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/checkbox.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named Checkbox export" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export for the Checkbox component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Checkbox }
// CIL[DOC-VECTOR type="context" content="purpose='Public export of the Checkbox component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/checkbox.tsx:module_exports:module_exports"]
