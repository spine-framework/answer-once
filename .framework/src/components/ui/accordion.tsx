// CIL[BEGIN stable_id="~/.framework/src/components/ui/accordion.tsx:module_header:module_header" type="module_header" identity="module_header" parent="module"]
// CIL[DOC-MACRO purpose="Imports and dependencies for the accordion UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the external libraries and utilities used by the component exports"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Imported symbols available to downstream chunks" errors="N/A" side_effects="Loads React, Radix UI Accordion primitive, utils, and icons into module scope"]
// CIL[DOC-MICRO logic_summary="Imports React, AccordionPrimitive, className utility, and chevron icons" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers and UI component consumers"]
import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Imports and dependencies for the accordion UI components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/accordion.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/accordion.tsx:accordion:function" type="function" identity="Accordion" parent="module"]
// CIL[DOC-MACRO purpose="Render a styled accordion container around Radix UI Accordion.Root"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap the external AccordionPrimitive.Root with project-specific styling and className"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/accordion.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="Rendered AccordionPrimitive.Root with merged styles" errors="N/A" side_effects="Renders DOM via React"]
// CIL[DOC-MICRO logic_summary="Merges className with default flex container styles and renders AccordionPrimitive.Root" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-md border",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled accordion container around Radix UI Accordion.Root'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/accordion.tsx:accordion:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/accordion.tsx:accordionitem:function" type="function" identity="AccordionItem" parent="module"]
// CIL[DOC-MACRO purpose="Render a styled accordion item wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap AccordionPrimitive.Item with border and open-state styling"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/accordion.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="Rendered AccordionPrimitive.Item with merged styles" errors="N/A" side_effects="Renders DOM"]
// CIL[DOC-MICRO logic_summary="Applies bottom border (except last item) and muted background when open" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b data-open:bg-muted/50", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled accordion item wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/accordion.tsx:accordionitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/accordion.tsx:accordiontrigger:function" type="function" identity="AccordionTrigger" parent="module"]
// CIL[DOC-MACRO purpose="Render an accordion trigger button with expand/collapse icons"]
// CIL[DOC-RESPONSIBILITY responsibility="Display the header button that toggles accordion content and shows chevron state"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/accordion.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, ...props" outputs="Rendered AccordionPrimitive.Trigger with chevron icons" errors="N/A" side_effects="Renders DOM and toggles content visibility via Radix state"]
// CIL[DOC-MICRO logic_summary="Renders a Header and Trigger with ChevronDown/ChevronUp icons swapped by expanded state" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between gap-6 border border-transparent p-2 text-left text-xs/relaxed font-medium transition-all outline-none hover:underline disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon data-slot="accordion-trigger-icon" className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
        <ChevronUpIcon data-slot="accordion-trigger-icon" className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an accordion trigger button with expand/collapse icons'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/accordion.tsx:accordiontrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/accordion.tsx:accordioncontent:function" type="function" identity="AccordionContent" parent="module"]
// CIL[DOC-MACRO purpose="Render a collapsible accordion content panel"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap AccordionPrimitive.Content with padding and typography styles"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/accordion.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, ...props" outputs="Rendered AccordionPrimitive.Content with animated inner div" errors="N/A" side_effects="Renders DOM and animates height on open/close"]
// CIL[DOC-MICRO logic_summary="Renders a Content panel with an inner div for typography and link styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden px-2 text-xs/relaxed data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--radix-accordion-content-height) pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a collapsible accordion content panel'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/accordion.tsx:accordioncontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/accordion.tsx:exports:exports" type="module_exports" identity="module_exports" parent="module"]
// CIL[DOC-MACRO purpose="Export the public API of the accordion UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Make Accordion, AccordionItem, AccordionTrigger, and AccordionContent available to other modules"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/accordion.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Named exports of all accordion components" errors="N/A" side_effects="Defines the module's external interface"]
// CIL[DOC-MICRO logic_summary="Named export list for Accordion, AccordionItem, AccordionTrigger, and AccordionContent" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
// CIL[DOC-VECTOR type="context" content="purpose='Export the public API of the accordion UI components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/accordion.tsx:exports:exports"]
