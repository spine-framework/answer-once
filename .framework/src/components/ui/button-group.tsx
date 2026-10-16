// CIL[BEGIN stable_id="~/.framework/src/components/ui/button-group.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Import CVA, Radix Slot, and project utilities for the ButtonGroup UI component set"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide shared imports and dependencies for button group building blocks"]
// CIL[DOC-CONTEXT module="components/ui/button-group" layer="ui" related_files=".framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported utilities and dependencies" errors="none" side_effects="adds module dependencies"]
// CIL[DOC-MICRO logic_summary="Imports class-variance-authority, Radix Slot, cn utility, and the Separator component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui component consumers and maintainers"]
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
// CIL[DOC-VECTOR type="context" content="purpose='Import CVA, Radix Slot, and project utilities for the ButtonGroup UI component set'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button-group.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/button-group.tsx:buttongroupvariants:constant" type="constant" identity="buttonGroupVariants" parent="none"]
// CIL[DOC-MACRO purpose="Define the class-variance-authority variant map for ButtonGroup styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate CSS classes for horizontal and vertical button group orientations"]
// CIL[DOC-CONTEXT module="components/ui/button-group" layer="ui" related_files=".framework/src/components/ui/button-group.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: { orientation?: 'horizontal' | 'vertical' }" outputs="Tailwind class string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Combines a base flex layout with orientation-specific border rounding, gap, and focus rules" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const buttonGroupVariants = cva(
  "group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md!",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-md!",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Define the class-variance-authority variant map for ButtonGroup styling'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button-group.tsx:buttongroupvariants:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/button-group.tsx:buttongroup:function" type="function" identity="ButtonGroup" parent="none"]
// CIL[DOC-MACRO purpose="Render a container that groups child buttons with role, data-slot, and orientation styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply buttonGroupVariants classes and data attributes to a group div"]
// CIL[DOC-CONTEXT module="components/ui/button-group" layer="ui" related_files=".framework/src/components/ui/button-group.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string | undefined, orientation: 'horizontal' | 'vertical' | undefined, ...props: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>" outputs="JSX div" errors="prop type mismatch" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Applies cva-generated classes, role='group', and data-orientation; passes remaining props through" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a container that groups child buttons with role, data-slot, and orientation styling'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button-group.tsx:buttongroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/button-group.tsx:buttongrouptext:function" type="function" identity="ButtonGroupText" parent="none"]
// CIL[DOC-MACRO purpose="Render a compact text or metadata element inside a button group"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a muted, rounded label slot with optional Slot.Root composition"]
// CIL[DOC-CONTEXT module="components/ui/button-group" layer="ui" related_files=".framework/src/components/ui/button-group.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string | undefined, asChild: boolean, ...props: React.ComponentProps<'div'> & { asChild?: boolean }" outputs="JSX div or Slot.Root" errors="none" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Chooses Slot.Root when asChild is true; applies muted, rounded, small text styles" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      className={cn(
        "flex items-center gap-2 rounded-md border bg-muted px-2.5 text-xs/relaxed font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a compact text or metadata element inside a button group'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button-group.tsx:buttongrouptext:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/button-group.tsx:buttongroupseparator:function" type="function" identity="ButtonGroupSeparator" parent="none"]
// CIL[DOC-MACRO purpose="Render a visual separator between items in a button group"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a stretchable Separator with theme-aware input background"]
// CIL[DOC-CONTEXT module="components/ui/button-group" layer="ui" related_files=".framework/src/components/ui/button-group.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string | undefined, orientation: 'horizontal' | 'vertical' | undefined, ...props: React.ComponentProps<typeof Separator>" outputs="JSX Separator" errors="none" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Renders a Separator with data-slot and orientation-aware background utility classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a visual separator between items in a button group'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button-group.tsx:buttongroupseparator:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/button-group.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="none"]
// CIL[DOC-MACRO purpose="Expose the ButtonGroup, ButtonGroupText, ButtonGroupSeparator, and buttonGroupVariants API"]
// CIL[DOC-RESPONSIBILITY responsibility="Named export of the public button-group module members"]
// CIL[DOC-CONTEXT module="components/ui/button-group" layer="ui" related_files=".framework/src/components/ui/button-group.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Re-exports all component pieces from this module as named exports" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
// CIL[DOC-VECTOR type="context" content="purpose='Expose the ButtonGroup, ButtonGroupText, ButtonGroupSeparator, and buttonGroupVariants API'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button-group.tsx:module_exports:module_exports"]
