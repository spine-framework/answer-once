// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/alert.tsx"]
// CIL[DOC-MACRO purpose="Import React, class-variance-authority, and utility helpers for alert UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the base dependencies used by Alert and its variants"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/alert.tsx" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, cva, VariantProps, and cn available in module scope" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import React namespace, cva and VariantProps, and project cn utility" notable_decisions="Uses cva for type-safe Tailwind class variance"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]








import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Import React, class-variance-authority, and utility helpers for alert UI components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert.tsx:alertVariants:constant" type="constant" identity="alertVariants" parent="~/.framework/src/components/ui/alert.tsx"]
// CIL[DOC-MACRO purpose="Define the CVA class-variance config for alert styles"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate the class string used by the Alert component based on variant"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/alert.tsx" layer="ui" related_files=".framework/src/components/ui/alert.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="variant: 'default' | 'destructive'" outputs="string of Tailwind utility classes" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use cva to compose grid, border, padding, text, and SVG layout classes; supports default and destructive variants" notable_decisions="Includes data-slot and svg selectors for layout when icons are present"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2 py-1.5 text-left text-xs/relaxed has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-1.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Define the CVA class-variance config for alert styles'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert.tsx:alertVariants:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert.tsx:Alert:component" type="component" identity="Alert" parent="~/.framework/src/components/ui/alert.tsx"]
// CIL[DOC-MACRO purpose="Render an accessible alert container with a variant class"]
// CIL[DOC-RESPONSIBILITY responsibility="Combine the selected alert variant classes with an optional custom className"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/alert.tsx" layer="ui" related_files=".framework/src/components/ui/alert.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, variant?: 'default' | 'destructive', ...props: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>" outputs="JSX div with role='alert'" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Apply cva alertVariants to variant and merge with className using cn" notable_decisions="Spreads remaining props onto the div for full accessibility and event support"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an accessible alert container with a variant class'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert.tsx:Alert:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert.tsx:AlertTitle:component" type="component" identity="AlertTitle" parent="~/.framework/src/components/ui/alert.tsx"]
// CIL[DOC-MACRO purpose="Render the title element inside an Alert"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a bold, underlined-link title that aligns with optional alert icons"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/alert.tsx" layer="ui" related_files=".framework/src/components/ui/alert.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'div'>" outputs="JSX div with data-slot='alert-title'" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use cn to merge default font and group styles with className" notable_decisions="Styles inline links with underline and hover foreground color"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the title element inside an Alert'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert.tsx:AlertTitle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert.tsx:AlertDescription:component" type="component" identity="AlertDescription" parent="~/.framework/src/components/ui/alert.tsx"]
// CIL[DOC-MACRO purpose="Render the description body inside an Alert"]
// CIL[DOC-RESPONSIBILITY responsibility="Display muted, balanced text for additional alert details"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/alert.tsx" layer="ui" related_files=".framework/src/components/ui/alert.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'div'>" outputs="JSX div with data-slot='alert-description'" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use cn to merge muted text and link styles with className" notable_decisions="Paragraphs except the last receive a bottom margin"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-xs/relaxed text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the description body inside an Alert'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert.tsx:AlertDescription:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert.tsx:AlertAction:component" type="component" identity="AlertAction" parent="~/.framework/src/components/ui/alert.tsx"]
// CIL[DOC-MACRO purpose="Render an action element anchored to the top-right of an Alert"]
// CIL[DOC-RESPONSIBILITY responsibility="Position an action control within the alert layout"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/alert.tsx" layer="ui" related_files=".framework/src/components/ui/alert.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'div'>" outputs="JSX div with data-slot='alert-action'" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use cn to absolutely position the action at top-1.5 right-2" notable_decisions="Padding on the alert is adjusted via parent has-data-[slot=alert-action] selector"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-1.5 right-2", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an action element anchored to the top-right of an Alert'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert.tsx:AlertAction:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/alert.tsx"]
// CIL[DOC-MACRO purpose="Expose Alert subcomponents for external use"]
// CIL[DOC-RESPONSIBILITY responsibility="Export the public API of the alert UI kit"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/alert.tsx" layer="ui" related_files=".framework/src/components/ui/alert.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Alert, AlertTitle, AlertDescription, AlertAction named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export list for all alert components" notable_decisions="Keeps a flat export surface"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
export { Alert, AlertTitle, AlertDescription, AlertAction }
// CIL[DOC-VECTOR type="context" content="purpose='Expose Alert subcomponents for external use'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert.tsx:exports:variable"]
