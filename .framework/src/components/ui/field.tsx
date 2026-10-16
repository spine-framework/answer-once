// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:use_client:constant" type="constant" identity="use_client" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Declare this module as a Next.js client component"]
// CIL[DOC-RESPONSIBILITY responsibility="Mark the file for client-side React execution"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="use client directive" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="String directive placed at the top of the file to enable client rendering" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Declare this module as a Next.js client component'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:use_client:constant"]
















// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Import dependencies for the field UI component module"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React, CVA, and local UI utilities to the field subcomponents"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported bindings available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports useMemo, cva, cn, Label, and Separator for use by the field components" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies for the field UI component module'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldSet:component" type="component" identity="FieldSet" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render a fieldset wrapper for grouped form controls"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a flex column layout for field sets with reduced gaps for checkbox and radio groups"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<fieldset>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto a fieldset with data-slot and a responsive flex gap using cn class merging" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a fieldset wrapper for grouped form controls'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldSet:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldLegend:component" type="component" identity="FieldLegend" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render a styled legend or label variant for field groups"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a field legend with optional label styling"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, variant: 'legend' | 'label', ...props: React.ComponentProps<legend>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a legend with data-variant and conditional text sizing classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-2 font-medium data-[variant=label]:text-xs/relaxed data-[variant=legend]:text-sm",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled legend or label variant for field groups'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldLegend:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldGroup:component" type="component" identity="FieldGroup" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render a full-width container for grouped fields"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a responsive, container-aware field group wrapper"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<div>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies data-slot and container query classes for vertical spacing between nested field groups" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-4 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a full-width container for grouped fields'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldGroup:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:fieldVariants:constant" type="constant" identity="fieldVariants" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Define CVA style variants for field layout orientation"]
// CIL[DOC-RESPONSIBILITY responsibility="Supply flex-orientation classes for vertical, horizontal, and responsive field layouts"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="orientation: 'vertical' | 'horizontal' | 'responsive'" outputs="merged className string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses class-variance-authority to combine base, orientation, and default variant classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Define CVA style variants for field layout orientation'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:fieldVariants:constant"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:Field:component" type="component" identity="Field" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render the root field container with orientation variants"]
// CIL[DOC-RESPONSIBILITY responsibility="Compose the field wrapper and apply the selected field variant"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, orientation: 'vertical' | 'horizontal' | 'responsive', ...props: React.ComponentProps<div>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a div with role group, data-slot, and applies fieldVariants output with className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the root field container with orientation variants'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:Field:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldContent:component" type="component" identity="FieldContent" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render the content area inside a field"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the control and description within a field"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<div>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a div with data-slot, flex-1, and a tight vertical gap for field content" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the content area inside a field'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldLabel:component" type="component" identity="FieldLabel" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render a label for a field using the shared Label component"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a styled, interactive-aware label wrapper"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<typeof Label>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps the imported Label with data-slot and peer/state-aware background and border classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border *:data-[slot=field]:p-2 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a label for a field using the shared Label component'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldLabel:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldTitle:component" type="component" identity="FieldTitle" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render a small field title inside a label"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a concise title for field labels"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<div>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a div with data-slot and small medium text styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-xs/relaxed font-medium group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a small field title inside a label'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldTitle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldDescription:component" type="component" identity="FieldDescription" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render descriptive helper text for a field"]
// CIL[DOC-RESPONSIBILITY responsibility="Show muted helper or hint text with link styling"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<p>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a p with data-slot, muted color, and underline styles for nested links" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-xs/relaxed leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render descriptive helper text for a field'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldDescription:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldSeparator:component" type="component" identity="FieldSeparator" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render a visual separator with optional centered content"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a horizontal separator with an optional label"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, children: React.ReactNode, ...props: React.ComponentProps<div>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a relative div with the Separator primitive and centered text when children are present" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-xs/relaxed group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a visual separator with optional centered content'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldSeparator:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:FieldError:component" type="component" identity="FieldError" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Render validation errors for a field"]
// CIL[DOC-RESPONSIBILITY responsibility="Format and display field-level errors or children"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, children: React.ReactNode, errors: Array<{message?: string} | undefined>, ...props: React.ComponentProps<div>" outputs="JSX.Element | null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Deduplicates error messages with useMemo and renders a single message or bullet list" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-xs/relaxed font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render validation errors for a field'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:FieldError:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/field.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/field.tsx"]
// CIL[DOC-MACRO purpose="Public exports of the field UI primitives"]
// CIL[DOC-RESPONSIBILITY responsibility="Re-export all field component symbols for module consumers"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/field.tsx" layer="ui" related_files=".framework/src/components/ui/field.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named field component exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export block exposing Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
// CIL[DOC-VECTOR type="context" content="purpose='Public exports of the field UI primitives'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/label.tsx,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/field.tsx:exports:variable"]
