// CIL[BEGIN stable_id="~/.framework/src/components/ui/switch.tsx:use_client:directive" type="directive" identity="use_client" parent=""]
// CIL[DOC-MACRO purpose="Marks the module as a client-side component for the React/Next.js runtime boundary."]
// CIL[DOC-RESPONSIBILITY responsibility="Declares that this file must be rendered in the browser context."]
// CIL[DOC-CONTEXT module="switch" layer="ui" related_files=".framework/src/components/ui/switch.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Enforces the 'use client' directive for the switch component module." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Marks the module as a client-side component for the React/Next.js runtime boundary.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/switch.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/switch.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Sets up the module dependencies and imports for the switch component."]
// CIL[DOC-RESPONSIBILITY responsibility="Imports React, Radix UI Switch primitive, and the cn utility for class composition."]
// CIL[DOC-CONTEXT module="switch" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Switch component, utility imports" errors="none" side_effects="registers module-level imports"]
// CIL[DOC-MICRO logic_summary="Loads React, the Radix Switch primitive, and the cn className merger." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework/component-consumers"]
import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Sets up the module dependencies and imports for the switch component.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/switch.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/switch.tsx:switch:function" type="function" identity="switch" parent=""]
// CIL[DOC-MACRO purpose="Renders a themed toggle switch with size variants, focus, and disabled states."]
// CIL[DOC-RESPONSIBILITY responsibility="Constructs a SwitchPrimitive.Root and Thumb with composed Tailwind classes and optional size prop."]
// CIL[DOC-CONTEXT module="switch" layer="ui" related_files=".framework/src/components/ui/switch.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="React.ComponentProps of SwitchPrimitive.Root plus optional size ('sm' | 'default') and className" outputs="JSX for a styled toggle switch" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies size, className, and Radix props to render an accessible switch with animated thumb." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=default]:h-[16.6px] data-[size=default]:w-[28px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a themed toggle switch with size variants, focus, and disabled states.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/switch.tsx:switch:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/switch.tsx:export:export" type="export" identity="export" parent=""]
// CIL[DOC-MACRO purpose="Makes the Switch component available to other modules."]
// CIL[DOC-RESPONSIBILITY responsibility="Re-exports the local Switch function as the named export for this module."]
// CIL[DOC-CONTEXT module="switch" layer="ui" related_files=".framework/src/components/ui/switch.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named export { Switch }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports the Switch component so consumers can import it elsewhere." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Switch }
// CIL[DOC-VECTOR type="context" content="purpose='Makes the Switch component available to other modules.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/switch.tsx:export:export"]
