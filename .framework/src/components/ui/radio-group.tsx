// CIL[BEGIN stable_id="~/.framework/src/components/ui/radio-group.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Defines the RadioGroup UI component module, importing dependencies and exporting the group and item subcomponents."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide accessible radio group UI primitives (RadioGroup, RadioGroupItem) built on Radix UI for the design system."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import React, radix-ui RadioGroupPrimitive and cn utility; re-export RadioGroup and RadioGroupItem." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-developers"]






import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Defines the RadioGroup UI component module, importing dependencies and exporting the group and item subcomponents.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/radio-group.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/radio-group.tsx:RadioGroup:function" type="function" identity="RadioGroup" parent="~/.framework/src/components/ui/radio-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an accessible radio group container with themed styles."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap children in a Radix UI RadioGroupPrimitive.Root with data-slot and a default Tailwind grid layout."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/radio-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<typeof RadioGroupPrimitive.Root>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a RadioGroupPrimitive.Root with data-slot='radio-group' and merged Tailwind classes 'grid w-full gap-3'; spread remaining props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-3", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an accessible radio group container with themed styles.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/radio-group.tsx:RadioGroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/radio-group.tsx:RadioGroupItem:function" type="function" identity="RadioGroupItem" parent="~/.framework/src/components/ui/radio-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an individual radio button item with an indicator dot."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a Radix UI RadioGroupPrimitive.Item with data-slot, full Tailwind styling for states, and an indicator child."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/radio-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<typeof RadioGroupPrimitive.Item>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a RadioGroupPrimitive.Item with data-slot='radio-group-item', merged state and disabled Tailwind classes, and an indicator with a centered dot." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an individual radio button item with an indicator dot.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/radio-group.tsx:RadioGroupItem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/radio-group.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/radio-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Expose the RadioGroup subcomponents for consumers of the UI package."]
// CIL[DOC-RESPONSIBILITY responsibility="Re-export the component symbols from this module."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/radio-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports { RadioGroup, RadioGroupItem }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export list of the RadioGroup and RadioGroupItem components." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { RadioGroup, RadioGroupItem }
// CIL[DOC-VECTOR type="context" content="purpose='Expose the RadioGroup subcomponents for consumers of the UI package.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/radio-group.tsx:module_exports:module_exports"]