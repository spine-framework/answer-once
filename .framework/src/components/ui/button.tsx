// CIL[BEGIN stable_id="~/.framework/src/components/ui/button.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/button.tsx"]
// CIL[DOC-MACRO purpose="Declare module-level imports and dependencies for the Button component"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React, class-variance-authority, radix Slot, and the cn utility for the Button component"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/button.tsx" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Imported React, cva, Slot and cn bindings available to the module" errors="Module load fails if a peer dependency is missing" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, cva/VariantProps, Slot, and the cn Tailwind class merge utility" notable_decisions="Uses cva for variant-driven styling and cn for conditional class merging"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="component developers"]

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Declare module-level imports and dependencies for the Button component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/button.tsx:buttonVariants:constant" type="constant" identity="buttonVariants" parent="~/.framework/src/components/ui/button.tsx"]
// CIL[DOC-MACRO purpose="Define the CVA-based style variants for the Button component"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a class-variance-authority configuration that defines size, variant, and default variants for Button"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/button.tsx" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="buttonVariants function that returns Tailwind classes for given variant and size" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Configures cva with a base class, variant and size maps, and default variants" notable_decisions="Uses Tailwind tokens such as bg-primary and border-border; includes icon and state modifier sizes"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="component developers"]
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-8 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Define the CVA-based style variants for the Button component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button.tsx:buttonVariants:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/button.tsx:Button:component" type="component" identity="Button" parent="~/.framework/src/components/ui/button.tsx"]
// CIL[DOC-MACRO purpose="Render a flexible Button component with CVA variants and optional child slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled button or polymorphic Slot wrapper using the configured size and variant"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/button.tsx" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, variant, size, asChild, ref, standard button props" outputs="React element with merged CVA classes and data attributes" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Chooses Slot.Root or 'button' based on asChild; merges className with buttonVariants output and spreads remaining props" notable_decisions="forwardRef is required — Radix primitives (DropdownMenuTrigger/PopoverTrigger/DialogTrigger/TooltipTrigger) attach their anchor ref through asChild; a plain function component silently drops it under React 18 and the floating content positions at 0,0 off-screen"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="component developers"]
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}, ref) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
// CIL[DOC-VECTOR type="context" content="purpose='Render a flexible Button component with CVA variants and optional child slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button.tsx:Button:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/button.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/button.tsx"]
// CIL[DOC-MACRO purpose="Export the Button component and buttonVariants helper for consumers"]
// CIL[DOC-RESPONSIBILITY responsibility="Make Button and buttonVariants available to other modules"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/button.tsx" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named exports Button and buttonVariants" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Re-exports the Button component and buttonVariants constant from this module" notable_decisions="Named exports allow tree-shaking and explicit imports"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="component developers"]
export { Button, buttonVariants }
// CIL[DOC-VECTOR type="context" content="purpose='Export the Button component and buttonVariants helper for consumers'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/button.tsx:exports:variable"]
