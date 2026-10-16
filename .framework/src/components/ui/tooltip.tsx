// CIL[BEGIN stable_id="~/.framework/src/components/ui/tooltip.tsx:use_client:directive" type="directive" identity="use_client" parent=""]
// CIL[DOC-MACRO purpose="Marks this module as client-side only for the Next.js app router"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the file as client-rendered code"]
// CIL[DOC-CONTEXT module="tooltip.tsx" layer="components/ui" related_files=".framework/src/components/ui/tooltip.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="client directive" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The 'use client' directive has no runtime logic; it instructs the bundler that this file is client-side." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Marks this module as client-side only for the Next.js app router'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tooltip.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tooltip.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provides tooltip UI primitives by re-exporting Radix UI Tooltip components with styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports dependencies and wires utility functions for the tooltip module"]
// CIL[DOC-CONTEXT module="tooltip.tsx" layer="components/ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="local bindings for React, Radix Tooltip, and cn" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, Radix Tooltip primitive, and the cn class-name utility." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="UI component consumers, React developers, design system maintainers"]
import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Provides tooltip UI primitives by re-exporting Radix UI Tooltip components with styling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tooltip.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tooltip.tsx:tooltipprovider:function" type="function" identity="TooltipProvider" parent="module_header"]
// CIL[DOC-MACRO purpose="Wraps Radix Tooltip.Provider to configure default delay and pass through props"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides tooltip context and delay configuration for descendant tooltip components"]
// CIL[DOC-CONTEXT module="tooltip.tsx" layer="components/ui" related_files=".framework/src/components/ui/tooltip.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="delayDuration=0, ...props" outputs="JSX.Element" errors="" side_effects="Renders provider context"]
// CIL[DOC-MICRO logic_summary="Spreads props onto TooltipPrimitive.Provider with a default delayDuration of 0 and data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Radix Tooltip.Provider to configure default delay and pass through props'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tooltip.tsx:tooltipprovider:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tooltip.tsx:tooltip:function" type="function" identity="Tooltip" parent="module_header"]
// CIL[DOC-MACRO purpose="Wraps Radix Tooltip.Root to expose a styled tooltip trigger container"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the root tooltip wrapper that manages open/closed state"]
// CIL[DOC-CONTEXT module="tooltip.tsx" layer="components/ui" related_files=".framework/src/components/ui/tooltip.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX.Element" errors="" side_effects="Renders tooltip root"]
// CIL[DOC-MICRO logic_summary="Passes all props and a data-slot attribute to TooltipPrimitive.Root." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Radix Tooltip.Root to expose a styled tooltip trigger container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tooltip.tsx:tooltip:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tooltip.tsx:tooltiptrigger:function" type="function" identity="TooltipTrigger" parent="module_header"]
// CIL[DOC-MACRO purpose="Wraps Radix Tooltip.Trigger to expose a styled tooltip trigger element"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the element that opens the tooltip when interacted with"]
// CIL[DOC-CONTEXT module="tooltip.tsx" layer="components/ui" related_files=".framework/src/components/ui/tooltip.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX.Element" errors="" side_effects="Renders tooltip trigger"]
// CIL[DOC-MICRO logic_summary="Passes all props and a data-slot attribute to TooltipPrimitive.Trigger." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Radix Tooltip.Trigger to expose a styled tooltip trigger element'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tooltip.tsx:tooltiptrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tooltip.tsx:tooltipcontent:function" type="function" identity="TooltipContent" parent="module_header"]
// CIL[DOC-MACRO purpose="Wraps Radix Tooltip.Content with default portal, arrow, and styled container classes"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the floating tooltip content and arrow with theme-aware styling"]
// CIL[DOC-CONTEXT module="tooltip.tsx" layer="components/ui" related_files=".framework/src/components/ui/tooltip.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, sideOffset=0, children, ...props" outputs="JSX.Element" errors="" side_effects="Portals tooltip content into document body and renders an arrow"]
// CIL[DOC-MICRO logic_summary="Uses a Portal, renders styled Content with the cn utility, an Arrow, and supports custom className and sideOffset." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Radix Tooltip.Content with default portal, arrow, and styled container classes'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tooltip.tsx:tooltipcontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tooltip.tsx:export:export" type="export" identity="export" parent="module_header"]
// CIL[DOC-MACRO purpose="Re-exports the four tooltip component primitives for external consumption"]
// CIL[DOC-RESPONSIBILITY responsibility="Makes Tooltip, TooltipContent, TooltipProvider, and TooltipTrigger available to importers"]
// CIL[DOC-CONTEXT module="tooltip.tsx" layer="components/ui" related_files=".framework/src/components/ui/tooltip.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Tooltip, TooltipContent, TooltipProvider, TooltipTrigger" errors="none" side_effects="Defines public module API"]
// CIL[DOC-MICRO logic_summary="Named export of the four local tooltip component functions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the four tooltip component primitives for external consumption'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tooltip.tsx:export:export"]
