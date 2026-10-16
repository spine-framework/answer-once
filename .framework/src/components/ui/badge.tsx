// CIL[BEGIN stable_id="~/.framework/src/components/ui/badge.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/badge.tsx"]
// CIL[DOC-MACRO purpose="Import the dependencies and utilities used by the badge component module"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React, cva, radix Slot, and the cn utility to the Badge and badgeVariants definitions"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/badge.tsx" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, cva, Slot, and cn bindings available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import third-party and local dependencies required by badge variants and the Badge component" notable_decisions="Uses the @/lib/utils alias to import the cn class-name utility"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]





import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Import the dependencies and utilities used by the badge component module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/badge.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/badge.tsx:badgeVariants:constant" type="constant" identity="badgeVariants" parent="~/.framework/src/components/ui/badge.tsx"]
// CIL[DOC-MACRO purpose="Define the class-variance-authority configuration for badge styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a cva-based styling contract with named variants for the Badge component"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/badge.tsx" layer="ui" related_files=".framework/src/components/ui/badge.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="variant name string (default, secondary, destructive, outline, ghost, link)" outputs="string of Tailwind CSS classes for the selected badge variant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a cva style function with base classes and variant-driven class mappings" notable_decisions="Keeps all Tailwind classes inline; supports aria-invalid and has-data icon selectors"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-2.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border bg-input/20 text-foreground dark:bg-input/30 [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Define the class-variance-authority configuration for badge styling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/badge.tsx:badgeVariants:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/badge.tsx:Badge:component" type="component" identity="Badge" parent="~/.framework/src/components/ui/badge.tsx"]
// CIL[DOC-MACRO purpose="Render a small status badge element with variant-based Tailwind styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a span or polymorphic child element styled by the badgeVariants contract"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/badge.tsx" layer="ui" related_files=".framework/src/components/ui/badge.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, variant: cva variant name, asChild: boolean, VariantProps type from cva, plus standard span props" outputs="JSX element styled with the computed badge classes" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Select Slot.Root or span based on asChild, then render with merged classes and data attributes" notable_decisions="Defaults variant to default; merges additional className with the variant classes"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a small status badge element with variant-based Tailwind styling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/badge.tsx:Badge:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/badge.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/badge.tsx"]
// CIL[DOC-MACRO purpose="Re-export the Badge component and badgeVariants style utility"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the public API of the badge module for consumers"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/badge.tsx" layer="ui" related_files=".framework/src/components/ui/badge.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Badge and badgeVariants named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export list for the Badge component and badgeVariants constant" notable_decisions="Exports both component and styling contract so consumers can compose or extend variants"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
export { Badge, badgeVariants }
// CIL[DOC-VECTOR type="context" content="purpose='Re-export the Badge component and badgeVariants style utility'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/badge.tsx:exports:variable"]
