// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/toggle.tsx:file"]
// CIL[DOC-MACRO purpose="Define the Toggle UI primitive built on Radix UI with styled variants."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a reusable, theme-aware toggle component and its style variants."]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Toggle component, toggleVariants styles" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, class-variance-authority, Radix Toggle and a utility for class merging." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework UI consumers"]



import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Define the Toggle UI primitive built on Radix UI with styled variants.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle.tsx:togglevariants:constant" type="constant" identity="togglevariants" parent="~/.framework/src/components/ui/toggle.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Configure Tailwind style variants for the toggle component."]
// CIL[DOC-RESPONSIBILITY responsibility="Encapsulate the supported visual variants and sizes for Toggle."]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="variant, size" outputs="compiled className string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses cva to combine base styles with default and outline variants plus sm/default/lg sizes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-md text-xs font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted",
      },
      size: {
        default:
          "h-7 min-w-7 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        sm: "h-6 min-w-6 rounded-[min(var(--radius-md),8px)] px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Configure Tailwind style variants for the toggle component.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle.tsx:togglevariants:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle.tsx:toggle:function" type="function" identity="toggle" parent="~/.framework/src/components/ui/toggle.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a styled toggle button using Radix UI and cva variants."]
// CIL[DOC-RESPONSIBILITY responsibility="Render an accessible, theme-styled toggle and pass props to Radix Toggle."]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, variant, size, VariantProps, ...props" outputs="JSX TogglePrimitive.Root" errors="none" side_effects="none"]
// CIL[DOC-NOTE type="param" content="VariantProps is a type prop derived from toggleVariants for variant/size support."]
// CIL[DOC-MICRO logic_summary="Merges className into toggleVariants and spreads props to TogglePrimitive.Root." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled toggle button using Radix UI and cva variants.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle.tsx:toggle:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle.tsx:exports:statement" type="statement" identity="exports" parent="~/.framework/src/components/ui/toggle.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Export the Toggle component and its style variants."]
// CIL[DOC-RESPONSIBILITY responsibility="Make Toggle and toggleVariants available to consumers."]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Toggle, toggleVariants" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named exports for the toggle function and variants constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Toggle, toggleVariants }
// CIL[DOC-VECTOR type="context" content="purpose='Export the Toggle component and its style variants.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle.tsx:exports:statement"]
