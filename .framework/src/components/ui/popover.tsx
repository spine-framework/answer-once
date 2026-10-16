// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/popover.tsx:file"]
// CIL[DOC-MACRO purpose="shadcn/ui Popover component module built on Radix UI"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide shadcn/ui Popover primitives and their dependencies"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, PopoverPrimitive, cn available to the module" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Imports React, Radix UI Popover primitive and utility dependencies" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend"]
import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui Popover component module built on Radix UI'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:Popover:component" type="component" identity="Popover" parent="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Radix Popover root wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the Popover root subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/popover.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof PopoverPrimitive.Root>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto PopoverPrimitive.Root with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Radix Popover root wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:Popover:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:PopoverTrigger:component" type="component" identity="PopoverTrigger" parent="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Popover trigger element"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the PopoverTrigger subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/popover.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof PopoverPrimitive.Trigger>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps PopoverPrimitive.Trigger with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Popover trigger element'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:PopoverTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:PopoverContent:component" type="component" identity="PopoverContent" parent="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the Popover content panel"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the PopoverContent subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/popover.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, align?: PopoverPrimitive.Content align, sideOffset?: number, ...props: React.ComponentProps<typeof PopoverPrimitive.Content>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Portals PopoverPrimitive.Content with Tailwind styling and animation data attributes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-4 rounded-lg bg-popover p-2.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the Popover content panel'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:PopoverContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:PopoverAnchor:component" type="component" identity="PopoverAnchor" parent="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Popover anchor element"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the PopoverAnchor subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/popover.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof PopoverPrimitive.Anchor>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps PopoverPrimitive.Anchor with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Popover anchor element'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:PopoverAnchor:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:PopoverHeader:component" type="component" identity="PopoverHeader" parent="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Popover header container"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the PopoverHeader subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/popover.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'div'>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps a div with flex column, gap and text styling, plus optional className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-xs", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Popover header container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:PopoverHeader:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:PopoverTitle:component" type="component" identity="PopoverTitle" parent="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Popover title element"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the PopoverTitle subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/popover.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'h2'>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Renders a div with font-medium and text-sm styling, plus optional className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Popover title element'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:PopoverTitle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:PopoverDescription:component" type="component" identity="PopoverDescription" parent="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Popover description element"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the PopoverDescription subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/popover.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'p'>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Renders a paragraph with muted-foreground styling, plus optional className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Popover description element'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:PopoverDescription:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/popover.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/popover.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Public exports of the Popover UI primitives"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose named Popover subcomponents for consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/popover.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports of Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Re-exports all named Popover subcomponents" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
// CIL[DOC-VECTOR type="context" content="purpose='Public exports of the Popover UI primitives'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/popover.tsx:module_exports:module_exports"]
